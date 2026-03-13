// ============================================================
// AI Provider Interface
// Provider-agnostic abstraction for Gemini (Vertex) and Claude (Anthropic)
// ============================================================

export interface ProviderGenerateParams {
    systemPrompt: string
    userMessage: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
    temperature?: number
    maxTokens?: number
}

export interface ProviderStreamChunk {
    text: string
    done: boolean
}

export interface AIProvider {
    readonly name: string
    generate(params: ProviderGenerateParams): Promise<string>
    generateStream(params: ProviderGenerateParams): AsyncGenerator<ProviderStreamChunk>
}
