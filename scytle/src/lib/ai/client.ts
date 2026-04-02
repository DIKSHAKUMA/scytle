import { GoogleGenAI } from '@google/genai'
import Anthropic from '@anthropic-ai/sdk'
import { AnthropicVertex } from '@anthropic-ai/vertex-sdk'
import { AI_CONFIG, SYSTEM_PROMPTS, type SystemPromptKey, type AIModel } from './config'
import { getModelByKey } from './models'

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
    /** Base64-encoded images to include as multimodal input */
    images?: Array<{ mimeType: string; data: string }>
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

// ── Gemini Client ──────────────────────────────────────────

function getGeminiClient(modelName?: string) {
    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
    const defaultLocation = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

    const requiresGlobal = modelName && AI_CONFIG.globalLocationModels.includes(modelName)
    const location = requiresGlobal ? 'global' : defaultLocation

    console.log(`🔧 getGeminiClient: model=${modelName}, location=${location}`)

    if (process.env.GOOGLE_CLOUD_API_KEY) {
        return new GoogleGenAI({ apiKey: process.env.GOOGLE_CLOUD_API_KEY })
    }

    if (!project) {
        throw new Error('Missing GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_API_KEY in .env.local')
    }

    return new GoogleGenAI({
        vertexai: true,
        project,
        location,
    })
}

// ── Anthropic Client ───────────────────────────────────────

function getAnthropicClient(): Anthropic | AnthropicVertex {
    // Prefer direct API key if available
    if (process.env.ANTHROPIC_API_KEY) {
        const baseURL = process.env.ANTHROPIC_BASE_URL || undefined
        const timeout = process.env.ANTHROPIC_TIMEOUT
            ? parseInt(process.env.ANTHROPIC_TIMEOUT, 10)
            : 60_000 // 60s default (SDK default is 600s = 10 min!)
        console.log(`🔧 getAnthropicClient: using direct API key${baseURL ? ` (baseURL: ${baseURL})` : ''}, timeout: ${timeout}ms`)
        return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, baseURL, timeout })
    }

    // Fall back to Vertex AI (uses GCP credentials)
    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
    const region = process.env.ANTHROPIC_VERTEX_REGION || 'us-east5'

    if (!project) {
        throw new Error('Missing ANTHROPIC_API_KEY or GOOGLE_CLOUD_PROJECT for Claude via Vertex AI')
    }

    console.log(`🔧 getAnthropicClient: using Vertex AI (project=${project}, region=${region})`)
    return new AnthropicVertex({ projectId: project, region })
}

// ── Anthropic Generation ───────────────────────────────────

async function generateWithAnthropic(
    message: string,
    history: ChatMessage[],
    systemInstruction: string,
    options: GenerateOptions,
    modelId: string,
    maxOutputTokens: number,
): Promise<string> {
    const client = getAnthropicClient()

    // Build messages (Anthropic format)
    const messages: Anthropic.MessageParam[] = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content,
        }))

    // Build user content (text + optional images)
    const userContent: Anthropic.ContentBlockParam[] = []
    if (options.images && options.images.length > 0) {
        for (const img of options.images) {
            userContent.push({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: img.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                    data: img.data,
                },
            })
        }
    }
    userContent.push({ type: 'text', text: message })
    messages.push({ role: 'user', content: userContent })

    const result = await client.messages.create({
        model: modelId,
        max_tokens: maxOutputTokens,
        temperature: options.temperature ?? 0.9,
        system: systemInstruction,
        messages,
    })

    const text = result.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map(block => block.text)
        .join('')

    if (!text) throw new Error('Empty response from Claude')
    return text
}

async function* streamWithAnthropic(
    message: string,
    history: ChatMessage[],
    systemInstruction: string,
    options: GenerateOptions,
    modelId: string,
    maxOutputTokens: number,
): AsyncGenerator<StreamChunk> {
    const client = getAnthropicClient()

    const messages: Anthropic.MessageParam[] = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => ({
            role: msg.role === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content,
        }))

    const userContent: Anthropic.ContentBlockParam[] = []
    if (options.images && options.images.length > 0) {
        for (const img of options.images) {
            userContent.push({
                type: 'image',
                source: {
                    type: 'base64',
                    media_type: img.mimeType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
                    data: img.data,
                },
            })
        }
    }
    userContent.push({ type: 'text', text: message })
    messages.push({ role: 'user', content: userContent })

    const stream = client.messages.stream({
        model: modelId,
        max_tokens: maxOutputTokens,
        temperature: options.temperature ?? 0.9,
        system: systemInstruction,
        messages,
    })

    let hasYielded = false
    for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            hasYielded = true
            yield { text: event.delta.text, done: false }
        }
    }

    if (hasYielded) {
        yield { text: '', done: true }
    } else {
        throw new Error('Empty stream response from Claude')
    }
}

// ── Gemini Generation ──────────────────────────────────────

async function generateWithGemini(
    message: string,
    history: ChatMessage[],
    systemInstruction: string,
    options: GenerateOptions,
    modelId: string,
    maxOutputTokens: number,
): Promise<string> {
    const ai = getGeminiClient(modelId)

    const contents = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }))

    const userParts: any[] = [{ text: message }]
    if (options.images && options.images.length > 0) {
        for (const img of options.images) {
            userParts.push({ inlineData: { mimeType: img.mimeType, data: img.data } })
        }
    }
    contents.push({ role: 'user', parts: userParts })

    const supportsExplicitThinking = modelId.includes('gemini-2.5-pro')
    const useThinking = options.thinking !== false && supportsExplicitThinking

    const result = await ai.models.generateContent({
        model: modelId,
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
    return result.text
}

async function* streamWithGemini(
    message: string,
    history: ChatMessage[],
    systemInstruction: string,
    options: GenerateOptions,
    modelId: string,
    maxOutputTokens: number,
): AsyncGenerator<StreamChunk> {
    const ai = getGeminiClient(modelId)

    const contents = history
        .slice(-AI_CONFIG.context.maxHistoryMessages)
        .map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }))

    const userParts: any[] = [{ text: message }]
    if (options.images && options.images.length > 0) {
        for (const img of options.images) {
            userParts.push({ inlineData: { mimeType: img.mimeType, data: img.data } })
        }
    }
    contents.push({ role: 'user', parts: userParts })

    const supportsExplicitThinking = modelId.includes('gemini-2.5-pro')
    const useThinking = options.thinking !== false && supportsExplicitThinking

    const responseStream = await ai.models.generateContentStream({
        model: modelId,
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
        yield { text: '', done: true }
    } else {
        throw new Error('Empty stream response')
    }
}

// ── Provider Dispatch ──────────────────────────────────────

function isAnthropicModel(modelKey: string): boolean {
    const model = getModelByKey(modelKey)
    return model?.provider === 'anthropic'
}

/** Fallback chain */
const MODEL_FALLBACK_CHAIN: Record<string, string[]> = {
    'gemini-pro': ['gemini-flash'],
    'gemini-flash': [],
    'claude-sonnet': ['gemini-pro'],
}

// ── Public API ──────────────────────────────────────────────

export async function generate(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): Promise<string> {
    const modelKey = options.model ?? ('gemini-flash' as AIModel)
    const modelsToTry: AIModel[] = [modelKey, ...(MODEL_FALLBACK_CHAIN[modelKey] ?? []) as AIModel[]]
    const systemInstruction = resolveSystemPrompt(options.systemPrompt)

    for (const currentModelKey of modelsToTry) {
        const actualModelName = AI_CONFIG.models[currentModelKey]
        if (!actualModelName) continue

        const maxOutputTokens = Math.min(
            options.maxTokens ?? AI_CONFIG.generation.maxOutputTokens,
            AI_CONFIG.modelMaxTokens[currentModelKey] ?? 8192
        )

        try {
            console.log(`🤖 Generating with model: ${actualModelName} (${currentModelKey})`)

            let text: string
            if (isAnthropicModel(currentModelKey)) {
                text = await generateWithAnthropic(
                    message, history, systemInstruction, options,
                    actualModelName, maxOutputTokens,
                )
            } else {
                text = await generateWithGemini(
                    message, history, systemInstruction, options,
                    actualModelName, maxOutputTokens,
                )
            }

            console.log(`✅ Success with ${actualModelName}`)
            return text

        } catch (error: any) {
            console.warn(`⚠️ Failed with ${actualModelName}: ${error.message}`)
            const status = error.status || error.code
            if (status === 429 && !error.message.includes('quota')) {
                throw new RateLimitError('AI rate limit exceeded. Please try again.')
            }
            // continue to fallback
        }
    }

    throw new Error('All AI models failed or were unavailable. Check API keys / GCP config.')
}

export async function* generateStream(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): AsyncGenerator<StreamChunk> {
    const modelKey = options.model ?? ('gemini-flash' as AIModel)
    const modelsToTry: AIModel[] = [modelKey, ...(MODEL_FALLBACK_CHAIN[modelKey] ?? []) as AIModel[]]
    const systemInstruction = resolveSystemPrompt(options.systemPrompt)

    for (const currentModelKey of modelsToTry) {
        const actualModelName = AI_CONFIG.models[currentModelKey]
        if (!actualModelName) continue

        const maxOutputTokens = Math.min(
            options.maxTokens ?? AI_CONFIG.generation.maxOutputTokens,
            AI_CONFIG.modelMaxTokens[currentModelKey] ?? 8192
        )

        try {
            console.log(`🔄 Streaming from model: ${actualModelName} (${currentModelKey})`)

            let stream: AsyncGenerator<StreamChunk>
            if (isAnthropicModel(currentModelKey)) {
                stream = streamWithAnthropic(
                    message, history, systemInstruction, options,
                    actualModelName, maxOutputTokens,
                )
            } else {
                stream = streamWithGemini(
                    message, history, systemInstruction, options,
                    actualModelName, maxOutputTokens,
                )
            }

            let hasYielded = false
            for await (const chunk of stream) {
                hasYielded = true
                yield chunk
            }

            if (hasYielded) {
                console.log(`✅ Stream complete: ${actualModelName}`)
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

    throw new Error('All AI models failed streaming. Check API keys / GCP config.')
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
