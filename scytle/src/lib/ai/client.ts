// ============================================================
// AI Client — Public API
// Delegates to provider abstraction (Anthropic Claude / Vertex Gemini)
// ============================================================

import { AI_CONFIG, SYSTEM_PROMPTS, type SystemPromptKey, type AIModel } from './config'
import { getProvider, getFallbackModelKeys } from './providers'

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

// ── Helpers ──────────────────────────────────────────────────

const resolveSystemPrompt = (systemPrompt?: SystemPromptKey | string): string => {
    if (!systemPrompt) return SYSTEM_PROMPTS.default
    if (typeof systemPrompt === 'string' && systemPrompt in SYSTEM_PROMPTS) {
        return SYSTEM_PROMPTS[systemPrompt as SystemPromptKey]
    }
    return typeof systemPrompt === 'string' ? systemPrompt : SYSTEM_PROMPTS.default
}

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

/** Model not found / not enabled in this GCP project */
const isModelNotFoundError = (error: unknown): boolean => {
    const status = getErrorStatus(error)
    const message = getErrorMessage(error).toLowerCase()
    return status === 404
        || message.includes('was not found')
        || message.includes('does not have access')
}

/** Should this error trigger a fallback to the next model? */
const shouldFallback = (error: unknown): boolean => {
    const status = getErrorStatus(error)
    return isModelNotFoundError(error)
        || ((status === 429 || status === 403) && isQuotaExceededError(error))
}

const shouldRetry = (error: unknown, attempt: number, maxAttempts: number): boolean => {
    if (attempt >= maxAttempts - 1) return false
    const status = getErrorStatus(error)
    if (status === 429 && !isQuotaExceededError(error)) return true
    return status === 500 || status === 502 || status === 503 || status === 504
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ── Public API ──────────────────────────────────────────────

/**
 * Generate a non-streaming response using the configured AI provider
 */
export async function generate(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): Promise<string> {
    const modelKey = options.model ?? ('fast' as AIModel)
    const modelsToTry: AIModel[] = [modelKey, ...getFallbackModelKeys(modelKey)]
    const systemPrompt = resolveSystemPrompt(options.systemPrompt)

    const historyForProvider = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => ({ role: msg.role, content: msg.content }))

    for (const currentModel of modelsToTry) {
        const provider = getProvider(currentModel)
        const modelLimit = AI_CONFIG.modelMaxTokens[currentModel] ?? AI_CONFIG.generation.maxOutputTokens
        const requestedTokens = options.maxTokens ?? AI_CONFIG.generation.maxOutputTokens
        const maxTokens = Math.min(requestedTokens, modelLimit)

        const maxAttempts = 3
        let modelUnavailable = false

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            try {
                const result = await provider.generate({
                    systemPrompt,
                    userMessage: message,
                    history: historyForProvider,
                    temperature: options.temperature ?? AI_CONFIG.generation.temperature,
                    maxTokens,
                })
                console.log(`✅ AI generate success — provider: ${provider.name}, model: ${currentModel}`)
                return result
            } catch (error) {
                const status = getErrorStatus(error)

                // Model not found / quota exceeded -> try next model in fallback chain
                if (shouldFallback(error)) {
                    console.warn(`⚠️ Model ${currentModel} unavailable (${provider.name}): ${getErrorMessage(error).slice(0, 100)}. Trying fallback...`)
                    modelUnavailable = true
                    break
                }

                // Transient error -> retry with backoff
                if (shouldRetry(error, attempt, maxAttempts)) {
                    const backoff = 400 * Math.pow(2, attempt) + Math.floor(Math.random() * 200)
                    console.warn(`⚠️ AI request failed (attempt ${attempt + 1}/${maxAttempts}): ${getErrorMessage(error)}. Retrying in ${backoff}ms...`)
                    await sleep(backoff)
                    continue
                }

                // Rate limit (not quota) -> surface to caller
                if (status === 429) {
                    throw new RateLimitError('AI rate limit exceeded. Please try again in a minute.')
                }

                console.error(`🤖 AI generation error (${provider.name}):`, getErrorMessage(error))
                throw new Error(`AI generation failed (${provider.name}): ${getErrorMessage(error)}`)
            }
        }

        if (!modelUnavailable) break
    }

    throw new RateLimitError('All AI models unavailable. Enable Claude in GCP Model Garden or check your Vertex AI configuration.', false)
}

/**
 * Generate a streaming response — returns an async generator
 */
export async function* generateStream(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): AsyncGenerator<StreamChunk> {
    const modelKey = options.model ?? ('fast' as AIModel)
    const modelsToTry: AIModel[] = [modelKey, ...getFallbackModelKeys(modelKey)]
    const systemPrompt = resolveSystemPrompt(options.systemPrompt)

    const historyForProvider = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => ({ role: msg.role, content: msg.content }))

    for (const currentModel of modelsToTry) {
        const provider = getProvider(currentModel)
        const modelLimit = AI_CONFIG.modelMaxTokens[currentModel] ?? AI_CONFIG.generation.maxOutputTokens
        const requestedTokens = options.maxTokens ?? AI_CONFIG.generation.maxOutputTokens
        const maxTokens = Math.min(requestedTokens, modelLimit)

        const maxAttempts = 3
        let modelUnavailable = false

        for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
            try {
                const generator = provider.generateStream({
                    systemPrompt,
                    userMessage: message,
                    history: historyForProvider,
                    temperature: options.temperature ?? AI_CONFIG.generation.temperature,
                    maxTokens,
                })

                console.log(`🔄 AI stream started — provider: ${provider.name}, model: ${currentModel}`)
                for await (const chunk of generator) {
                    yield chunk as StreamChunk
                }
                console.log(`✅ AI stream complete — provider: ${provider.name}, model: ${currentModel}`)
                return
            } catch (error) {
                const status = getErrorStatus(error)

                // Model not found / quota exceeded -> try next model
                if (shouldFallback(error)) {
                    console.warn(`⚠️ Model ${currentModel} unavailable (${provider.name}): ${getErrorMessage(error).slice(0, 100)}. Trying fallback...`)
                    modelUnavailable = true
                    break
                }

                if (shouldRetry(error, attempt, maxAttempts)) {
                    const backoff = 400 * Math.pow(2, attempt) + Math.floor(Math.random() * 200)
                    console.warn(`⚠️ AI stream failed (attempt ${attempt + 1}/${maxAttempts}): ${getErrorMessage(error)}. Retrying in ${backoff}ms...`)
                    await sleep(backoff)
                    continue
                }

                if (status === 429) {
                    throw new RateLimitError('AI rate limit exceeded. Please try again in a minute.')
                }

                console.error(`🤖 AI streaming error (${provider.name}):`, getErrorMessage(error))
                throw new Error(`AI streaming failed (${provider.name}): ${getErrorMessage(error)}`)
            }
        }

        if (!modelUnavailable) break
    }

    throw new RateLimitError('All AI models unavailable. Enable Claude in GCP Model Garden or check your Vertex AI configuration.', false)
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
