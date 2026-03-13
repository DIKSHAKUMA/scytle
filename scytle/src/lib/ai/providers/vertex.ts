// ============================================================
// Gemini Provider via Google Vertex AI
// Extracted from the original client.ts
// ============================================================

import { VertexAI } from '@google-cloud/vertexai'
import type { AIProvider, ProviderGenerateParams, ProviderStreamChunk } from './types'
import { AI_CONFIG } from '../config'

const getClient = () => {
    const project = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'

    if (!project) {
        throw new Error('GOOGLE_CLOUD_PROJECT is not configured. Set it in .env.local')
    }

    return new VertexAI({ project, location })
}

/** Gemini needs system prompt concatenated into the user prompt */
function buildGeminiPrompt(params: ProviderGenerateParams): string {
    const parts: string[] = [params.systemPrompt]

    if (params.history?.length) {
        const historyText = params.history
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n\n')
        parts.push(`\nPrevious conversation:\n${historyText}\n`)
    }

    parts.push(`\nUser: ${params.userMessage}\n\nAssistant:`)
    return parts.join('')
}

export class VertexProvider implements AIProvider {
    readonly name = 'vertex'
    private modelName: string

    constructor(modelName: string = 'gemini-2.0-flash') {
        this.modelName = modelName
    }

    async generate(params: ProviderGenerateParams): Promise<string> {
        const client = getClient()
        const model = client.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                temperature: params.temperature ?? AI_CONFIG.generation.temperature,
                topP: AI_CONFIG.generation.topP,
                topK: AI_CONFIG.generation.topK,
                maxOutputTokens: params.maxTokens ?? AI_CONFIG.generation.maxOutputTokens,
            },
        })

        const prompt = buildGeminiPrompt(params)
        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
        })

        const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) throw new Error('Empty response from Gemini')
        return text
    }

    async *generateStream(params: ProviderGenerateParams): AsyncGenerator<ProviderStreamChunk> {
        const client = getClient()
        const model = client.getGenerativeModel({
            model: this.modelName,
            generationConfig: {
                temperature: params.temperature ?? AI_CONFIG.generation.temperature,
                topP: AI_CONFIG.generation.topP,
                topK: AI_CONFIG.generation.topK,
                maxOutputTokens: params.maxTokens ?? AI_CONFIG.generation.maxOutputTokens,
            },
        })

        const prompt = buildGeminiPrompt(params)
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
    }
}
