// ============================================================
// Claude Provider via Vertex AI Model Garden
// Uses @anthropic-ai/vertex-sdk — same GCP credentials, no separate API key
// ============================================================

import AnthropicVertex from '@anthropic-ai/vertex-sdk'
import type { AIProvider, ProviderGenerateParams, ProviderStreamChunk } from './types'

const getClient = () => {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT
    if (!projectId) {
        throw new Error('GOOGLE_CLOUD_PROJECT is not configured. Set it in .env.local')
    }

    // Claude on Vertex AI — try CLAUDE_VERTEX_REGION, then GOOGLE_CLOUD_LOCATION, then us-east5
    const region = process.env.CLAUDE_VERTEX_REGION
        || process.env.GOOGLE_CLOUD_LOCATION
        || 'us-east5'

    return new AnthropicVertex({ projectId, region })
}

function buildMessages(params: ProviderGenerateParams) {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = []

    // Add conversation history
    if (params.history?.length) {
        for (const msg of params.history) {
            messages.push({ role: msg.role, content: msg.content })
        }
    }

    // Add current user message
    messages.push({ role: 'user', content: params.userMessage })

    return messages
}

export class AnthropicProvider implements AIProvider {
    readonly name = 'anthropic'
    private modelId: string

    constructor(modelId: string = 'claude-sonnet-4-6') {
        this.modelId = modelId
    }

    async generate(params: ProviderGenerateParams): Promise<string> {
        const client = getClient()
        const response = await client.messages.create({
            model: this.modelId,
            max_tokens: params.maxTokens ?? 16384,
            temperature: params.temperature ?? 0.7,
            system: params.systemPrompt,
            messages: buildMessages(params),
        })

        const textBlock = response.content.find(b => b.type === 'text')
        if (!textBlock || textBlock.type !== 'text') {
            throw new Error('Empty response from Claude')
        }
        return textBlock.text
    }

    async *generateStream(params: ProviderGenerateParams): AsyncGenerator<ProviderStreamChunk> {
        const client = getClient()
        const stream = client.messages.stream({
            model: this.modelId,
            max_tokens: params.maxTokens ?? 16384,
            temperature: params.temperature ?? 0.7,
            system: params.systemPrompt,
            messages: buildMessages(params),
        })

        for await (const event of stream) {
            if (
                event.type === 'content_block_delta' &&
                event.delta.type === 'text_delta'
            ) {
                yield { text: event.delta.text, done: false }
            }
        }
        yield { text: '', done: true }
    }
}
