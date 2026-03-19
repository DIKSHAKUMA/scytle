import { GoogleGenAI } from '@google/genai'
import { AI_CONFIG, SYSTEM_PROMPTS, type SystemPromptKey, type AIModel } from './config'

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
    /** Enable thinking mode for deeper reasoning (Gemini 2.5 Pro) */
    thinking?: boolean
    /** Thinking budget in tokens (default: 2048) */
    thinkingBudget?: number
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

const resolveSystemPrompt = (systemPrompt?: SystemPromptKey | string): string => {
    if (!systemPrompt) return SYSTEM_PROMPTS.default
    if (typeof systemPrompt === 'string' && systemPrompt in SYSTEM_PROMPTS) {
        return SYSTEM_PROMPTS[systemPrompt as SystemPromptKey]
    }
    return typeof systemPrompt === 'string' ? systemPrompt : SYSTEM_PROMPTS.default
}

function getClient(modelName?: string) {
    // If the user provided GOOGLE_CLOUD_API_KEY it will automatically be picked up
    // by new GoogleGenAI(). If using Vertex AI, we initialize with vertexai config.
    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
    const defaultLocation = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

    // Gemini 3.1 Pro Preview requires global location
    const requiresGlobal = modelName && AI_CONFIG.globalLocationModels.includes(modelName)
    const location = requiresGlobal ? 'global' : defaultLocation

    if (process.env.GOOGLE_CLOUD_API_KEY) {
        return new GoogleGenAI({ apiKey: process.env.GOOGLE_CLOUD_API_KEY })
    }

    if (!project) {
        throw new Error('Missing GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_API_KEY in .env.local')
    }

    return new GoogleGenAI({
        vertexai: { project, location } as any
    })
}

/** Fallback chain */
const MODEL_FALLBACK_CHAIN: Record<string, string[]> = {
    'gemini-pro': ['claude-sonnet'],
    'claude-opus': ['claude-sonnet', 'gemini-pro'],
    'claude-sonnet': ['gemini-pro'],
}

// ── Public API ──────────────────────────────────────────────

export async function generate(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): Promise<string> {
    const modelKey = options.model ?? ('gemini-pro' as AIModel)
    const modelsToTry: AIModel[] = [modelKey, ...(MODEL_FALLBACK_CHAIN[modelKey] ?? []) as AIModel[]]
    const systemInstruction = resolveSystemPrompt(options.systemPrompt)

    const contents = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }))

    contents.push({ role: 'user', parts: [{ text: message }] })

    for (const currentModelKey of modelsToTry) {
        const ai = getClient()
        const actualModelName = AI_CONFIG.models[currentModelKey]
        const maxOutputTokens = Math.min(
            options.maxTokens ?? AI_CONFIG.generation.maxOutputTokens,
            AI_CONFIG.modelMaxTokens[currentModelKey] ?? 8192
        )

        try {
            console.log(`🤖 Generating with model: ${actualModelName}`)

            // Adjust location for Claude models on Vertex
            const isClaude = actualModelName.includes('claude')
            if (isClaude && ai.vertexai && (ai.vertexai as any).location !== 'us-east5') {
                // Create a specific client for Claude in us-east5
                const claudeClient = new GoogleGenAI({
                    vertexai: { project: (ai.vertexai as any).project, location: 'us-east5' } as any
                })
                const result = await claudeClient.models.generateContent({
                    model: actualModelName,
                    contents,
                    config: {
                        systemInstruction: { parts: [{ text: systemInstruction }] },
                        temperature: options.temperature ?? AI_CONFIG.generation.temperature,
                        maxOutputTokens,
                    }
                })
                if (!result.text) throw new Error('Empty response')
                return result.text
            }

            // Normal GEMINI / generic generation
            // Enable thinking mode for Gemini 2.5 Pro when requested
            const supportsThinking = actualModelName.includes('gemini-2.5-pro')
            const useThinking = options.thinking !== false && supportsThinking

            const result = await ai.models.generateContent({
                model: actualModelName,
                contents,
                config: {
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    temperature: options.temperature ?? AI_CONFIG.generation.temperature,
                    topP: AI_CONFIG.generation.topP,
                    maxOutputTokens,
                    thinkingConfig: useThinking ? { thinkingBudget: options.thinkingBudget ?? 2048 } as any : undefined,
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HATE_SPEECH' as any, threshold: 'OFF' as any },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any, threshold: 'OFF' as any },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any, threshold: 'OFF' as any },
                        { category: 'HARM_CATEGORY_HARASSMENT' as any, threshold: 'OFF' as any }
                    ]
                }
            })

            if (!result.text) throw new Error('Empty response from AI')
            console.log(`✅ Success with ${actualModelName}`)
            return result.text

        } catch (error: any) {
            console.warn(`⚠️ Failed with ${actualModelName}: ${error.message}`)
            const status = error.status || error.code
            if (status === 429 && !error.message.includes('quota')) {
                throw new RateLimitError('AI rate limit exceeded. Please try again.')
            }
            // continue to fallback
        }
    }

    throw new Error('All AI models failed or were unavailable. Check GCP Model Garden / API keys.')
}

export async function* generateStream(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): AsyncGenerator<StreamChunk> {
    const modelKey = options.model ?? ('gemini-pro' as AIModel)
    const modelsToTry: AIModel[] = [modelKey, ...(MODEL_FALLBACK_CHAIN[modelKey] ?? []) as AIModel[]]
    const systemInstruction = resolveSystemPrompt(options.systemPrompt)

    const contents = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }))

    contents.push({ role: 'user', parts: [{ text: message }] })

    for (const currentModelKey of modelsToTry) {
        const ai = getClient()
        const actualModelName = AI_CONFIG.models[currentModelKey]
        const maxOutputTokens = Math.min(
            options.maxTokens ?? AI_CONFIG.generation.maxOutputTokens,
            AI_CONFIG.modelMaxTokens[currentModelKey] ?? 8192
        )

        try {
            console.log(`🔄 Streaming from model: ${actualModelName}`)

            const isClaude = actualModelName.includes('claude')
            const clientToUse = (isClaude && ai.vertexai)
                ? new GoogleGenAI({ vertexai: { project: (ai.vertexai as any).project, location: 'us-east5' } as any })
                : ai;

            // Enable thinking mode for Gemini 2.5 Pro when requested
            const supportsThinking = actualModelName.includes('gemini-2.5-pro')
            const useThinking = options.thinking !== false && supportsThinking

            const responseStream = await clientToUse.models.generateContentStream({
                model: actualModelName,
                contents,
                config: {
                    systemInstruction: { parts: [{ text: systemInstruction }] },
                    temperature: options.temperature ?? AI_CONFIG.generation.temperature,
                    topP: AI_CONFIG.generation.topP,
                    maxOutputTokens,
                    thinkingConfig: useThinking ? { thinkingBudget: options.thinkingBudget ?? 2048 } as any : undefined,
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HATE_SPEECH' as any, threshold: 'OFF' as any },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT' as any, threshold: 'OFF' as any },
                        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT' as any, threshold: 'OFF' as any },
                        { category: 'HARM_CATEGORY_HARASSMENT' as any, threshold: 'OFF' as any }
                    ]
                }
            })

            let hasYielded = false
            for await (const chunk of responseStream) {
                if (chunk.text) {
                    hasYielded = true
                    yield { text: chunk.text, done: false }
                }
            }

            if (hasYielded) {
                console.log(`✅ Stream complete: ${actualModelName}`)
                yield { text: '', done: true }
                return
            }
            throw new Error('Empty stream response')

        } catch (error: any) {
            console.warn(`⚠️ Stream failed with ${actualModelName}: ${error.message}`)
            const status = error.status || error.code
            if (status === 429 && !error.message.includes('quota')) {
                throw new RateLimitError('AI rate limit exceeded. Please try again.')
            }
            // continue to fallback
        }
    }

    throw new Error('All AI models failed streaming. Check GCP Model Garden / API keys.')
}

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
            } catch (error: any) {
                const errorData = JSON.stringify({ error: error.message, done: true })
                controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
                controller.close()
            }
        },
    })
}

export type { AIModel, SystemPromptKey }
