import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai'
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

// Initialize the Gemini client
const getClient = () => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured')
    }
    return new GoogleGenerativeAI(apiKey)
}

// Get the appropriate model
const getModel = (modelKey: AIModel = 'fast'): GenerativeModel => {
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

// Build the prompt with system context
const buildPrompt = (
    message: string,
    history: ChatMessage[] = [],
    systemPrompt?: SystemPromptKey | string
): string => {
    // Get system prompt
    let systemContext: string = SYSTEM_PROMPTS.default
    if (systemPrompt) {
        if (typeof systemPrompt === 'string' && systemPrompt in SYSTEM_PROMPTS) {
            systemContext = SYSTEM_PROMPTS[systemPrompt as SystemPromptKey]
        } else if (typeof systemPrompt === 'string') {
            systemContext = systemPrompt
        }
    }

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

/**
 * Generate a non-streaming response
 */
export async function generate(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): Promise<string> {
    const model = getModel(options.model)
    const prompt = buildPrompt(message, history, options.systemPrompt)

    try {
        const result = await model.generateContent(prompt)
        const response = result.response
        return response.text()
    } catch (error) {
        console.error('🤖 AI generation error:', error)
        throw new Error('Failed to generate response. Please try again.')
    }
}

/**
 * Generate a streaming response - returns an async generator
 */
export async function* generateStream(
    message: string,
    history: ChatMessage[] = [],
    options: GenerateOptions = {}
): AsyncGenerator<StreamChunk> {
    const model = getModel(options.model)
    const prompt = buildPrompt(message, history, options.systemPrompt)

    try {
        const result = await model.generateContentStream(prompt)

        for await (const chunk of result.stream) {
            const text = chunk.text()
            if (text) {
                yield { text, done: false }
            }
        }

        yield { text: '', done: true }
    } catch (error) {
        console.error('🤖 AI streaming error:', error)
        throw new Error('Failed to generate response. Please try again.')
    }
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
