import { VertexAI } from '@google-cloud/vertexai'
import { AI_CONFIG, SYSTEM_PROMPTS, SystemPromptKey, AIModel } from './config'

// Types
export interface ChatMessage {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
}

export interface GenerateOptions {
    model?: AIModel
    systemPrompt?: SystemPromptKey | string
    temperature?: number
    maxTokens?: number
}

export interface StreamChunk {
    text: string
    done: boolean
}

export class RateLimitError extends Error {
    status: number
    retryable: boolean

    constructor(message: string, retryable = true) {
        super(message)
        this.name = 'RateLimitError'
        this.status = 429
        this.retryable = retryable
    }
}

// Initialize the Vertex AI client (uses Application Default Credentials)
const getClient = () => {
    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

    if (!project) {
        throw new Error('GOOGLE_CLOUD_PROJECT is not configured. Set it in .env.local')
    }

    return new VertexAI({ project, location })
}

// Get the appropriate model
const getModel = (modelKey: AIModel = 'fast') => {
    const client = getClient()
    const modelName = AI_CONFIG.models[modelKey]
    return client.getGenerativeModel({
        model: modelName,
        generationConfig: {
            temperature: AI_CONFIG.generation.temperature,
            topP: AI_CONFIG.generation.topP,
            topK: AI_CONFIG.generation.topK,
            maxOutputTokens: AI_CONFIG.generation.maxOutputTokens,
        },
    })
}

// Resolve system prompt string
const resolveSystemPrompt = (systemPrompt?: SystemPromptKey | string): string => {
    if (!systemPrompt) return SYSTEM_PROMPTS.default
    if (typeof systemPrompt === 'string' && systemPrompt in SYSTEM_PROMPTS) {
        return SYSTEM_PROMPTS[systemPrompt as SystemPromptKey]
    }
    return typeof systemPrompt === 'string' ? systemPrompt : SYSTEM_PROMPTS.default
}

// Build the prompt with system context
const buildPrompt = (
    message: string,
    history: ChatMessage[] = [],
    systemPrompt?: SystemPromptKey | string
): string => {
    const systemContext = resolveSystemPrompt(systemPrompt)

    // Build conversation history
    const historyText = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n')

    // Combine into full prompt
    const prompt = [
        systemContext,
        historyText ? `\nPrevious conversation:\n${historyText}\n` : '',
        `\nUser: ${message}\n\nAssistant:`
    ].join('')

    return prompt
}

// Error helpers
const getErrorStatus = (error: unknown): number | undefined => {
    if (!error || typeof error !== 'object') return undefined
    const err = error as { status?: number; statusCode?: number; code?: number; response?: { status?: number }; error?: { status?: number } }
    return err.status ?? err.statusCode ?? err.code ?? err.response?.status ?? err.error?.status
}

const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) return error.message
    return String(error)
}

const isQuotaExceededError = (error: unknown): boolean => {
    const message = getErrorMessage(error).toLowerCase()
    return message.includes('exceeded your current quota')
        || message.includes('quota')
        || message.includes('billing')
        || message.includes('resource_exhausted')
}

const shouldRetry = (error: unknown, attempt: number, maxAttempts: number): boolean => {
    if (attempt >= maxAttempts - 1) return false
    const status = getErrorStatus(error)
    if (status === 429 && !isQuotaExceededError(error)) return true
    return status === 500 || status === 502 || status === 503 || status === 504
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Fallback chain: if a model hits quota, try the next cheaper one
const MODEL_FALLBACK_CHAIN: Record<string, string[]> = {
    [AI_CONFIG.models.powerful]: [AI_CONFIG.models.balanced, AI_CONFIG.models.fast],
    [AI_CONFIG.models.balanced]: [AI_CONFIG.models.fast],
    [AI_CONFIG.models.fast]: [],
}

const getFallbackModels = (modelKey: AIModel = 'fast'): string[] => {
    const modelName = AI_CONFIG.models[modelKey]
    return MODEL_FALLBACK_CHAIN[modelName] ?? []
}

/**
 * Generate a non-streaming response using Vertex AI
 */
export async function generate(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): Promise<string> {
    const prompt = buildPrompt(message, history, options.systemPrompt)
    const primaryModelName = AI_CONFIG.models[options.model ?? 'fast']
    const modelsToTry = [primaryModelName, ...getFallbackModels(options.model)]

    for (const modelName of modelsToTry) {
        const client = getClient()
        const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: options.temperature ?? AI_CONFIG.generation.temperature,
                topP: AI_CONFIG.generation.topP,
                topK: AI_CONFIG.generation.topK,
                maxOutputTokens: options.maxTokens ?? AI_CONFIG.generation.maxOutputTokens,
            },
        })

        const maxAttempts = 3
        let quotaExhausted = false

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            try {
                const result = await model.generateContent({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                })
                const response = result.response
                const text = response.candidates?.[0]?.content?.parts?.[0]?.text
                if (!text) throw new Error('Empty response from AI')
                return text
            } catch (error) {
                const status = getErrorStatus(error)
                const msg = getErrorMessage(error)

                // Quota exceeded -> try next cheaper model
                if ((status === 429 || status === 403) && isQuotaExceededError(error)) {
                    console.warn(`⚠️ Quota exceeded for ${modelName}, trying fallback...`)
                    quotaExhausted = true
                    break
                }

                // Transient error -> retry with backoff
                if (shouldRetry(error, attempt, maxAttempts)) {
                    const backoff = 400 * Math.pow(2, attempt) + Math.floor(Math.random() * 200)
                    console.warn(`⚠️ AI request failed (attempt ${attempt + 1}/${maxAttempts}): ${msg}. Retrying in ${backoff}ms...`)
                    await sleep(backoff)
                    continue
                }

                // Rate limit (not quota) -> surface to caller
                if (status === 429) {
                    console.error('🤖 AI rate limit hit:', error)
                    throw new RateLimitError('AI rate limit exceeded. Please try again in a minute.')
                }

                console.error('🤖 AI generation error:', error)
                throw new Error('Failed to generate response. Please try again.')
            }
        }

        if (!quotaExhausted) break
    }

    // All models exhausted
    throw new RateLimitError('AI quota exceeded on all available models. Please check your plan and billing details.', false)
}

/**
 * Generate a streaming response using Vertex AI - returns an async generator
 */
export async function* generateStream(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): AsyncGenerator<StreamChunk> {
    const prompt = buildPrompt(message, history, options.systemPrompt)
    const primaryModelName = AI_CONFIG.models[options.model ?? 'fast']
    const modelsToTry = [primaryModelName, ...getFallbackModels(options.model)]

    for (const modelName of modelsToTry) {
        const client = getClient()
        const model = client.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: options.temperature ?? AI_CONFIG.generation.temperature,
                topP: AI_CONFIG.generation.topP,
                topK: AI_CONFIG.generation.topK,
                maxOutputTokens: options.maxTokens ?? AI_CONFIG.generation.maxOutputTokens,
            },
        })

        const maxAttempts = 3
        let quotaExhausted = false

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            try {
                const result = await model.generateContentStream({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                })

                for await (const chunk of result.stream) {
                    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text
                    if (text) {
                        yield { text, done: false }
                    }
                }

                yield { text: '', done: true }
                return
            } catch (error) {
                const status = getErrorStatus(error)
                const msg = getErrorMessage(error)

                if ((status === 429 || status === 403) && isQuotaExceededError(error)) {
                    console.warn(`⚠️ Quota exceeded for ${modelName}, trying fallback...`)
                    quotaExhausted = true
                    break
                }

                if (shouldRetry(error, attempt, maxAttempts)) {
                    const backoff = 400 * Math.pow(2, attempt) + Math.floor(Math.random() * 200)
                    console.warn(`⚠️ AI stream failed (attempt ${attempt + 1}/${maxAttempts}): ${msg}. Retrying in ${backoff}ms...`)
                    await sleep(backoff)
                    continue
                }

                if (status === 429) {
                    console.error('🤖 AI rate limit hit:', error)
                    throw new RateLimitError('AI rate limit exceeded. Please try again in a minute.')
                }

                console.error('🤖 AI streaming error:', error)
                throw new Error('Failed to generate response. Please try again.')
            }
        }

        if (!quotaExhausted) break
    }

    throw new RateLimitError('AI quota exceeded on all available models. Please check your plan and billing details.', false)
}

/**
 * Create a ReadableStream for Server-Sent Events
 * Use this in API routes for streaming responses to the client
 */
export function createStreamResponse(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder()

    return new ReadableStream({
        async start(controller) {
            try {
                const generator = generateStream(message, history, options)

                for await (const chunk of generator) {
                    if (chunk.text) {
                        const data = JSON.stringify({ text: chunk.text, done: false })
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`))
                    }

                    if (chunk.done) {
                        const doneData = JSON.stringify({ text: '', done: true })
                        controller.enqueue(encoder.encode(`data: ${doneData}\n\n`))
                    }
                }

                controller.close()
            } catch (error) {
                const errorData = JSON.stringify({
                    error: error instanceof Error ? error.message : 'Unknown error',
                    done: true
                })
                controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
                controller.close()
            }
        },
    })
}

// Export types
export type { AIModel, SystemPromptKey }
