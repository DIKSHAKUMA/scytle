// ============================================================
// Provider Factory & Model Routing
// Maps model keys to their AI provider (Anthropic or Vertex)
// ============================================================

import type { AIProvider } from './types'
import { AnthropicProvider } from './anthropic'
import { VertexProvider } from './vertex'
import { AI_CONFIG, type AIModel } from '../config'

export type ProviderName = 'anthropic' | 'vertex'

/** Which provider handles which model key */
export const MODEL_PROVIDER_MAP: Record<string, ProviderName> = {
    'claude-sonnet': 'anthropic',
    'claude-opus': 'anthropic',
    fast: 'vertex',
    balanced: 'vertex',
    powerful: 'vertex',
}

/** Fallback chain: if primary model hits quota, try the next one */
export const MODEL_FALLBACK_CHAIN: Record<string, string[]> = {
    'claude-opus': ['claude-sonnet', 'balanced'],
    'claude-sonnet': ['balanced', 'fast'],
    powerful: ['balanced', 'fast'],
    balanced: ['fast'],
    fast: [],
}

/** Create a provider instance for a given model key */
export function getProvider(modelKey: AIModel): AIProvider {
    const providerName = MODEL_PROVIDER_MAP[modelKey] ?? 'vertex'
    const modelId = AI_CONFIG.models[modelKey]

    if (providerName === 'anthropic') {
        return new AnthropicProvider(modelId)
    }
    return new VertexProvider(modelId)
}

/** Get the fallback model keys for a given model */
export function getFallbackModelKeys(modelKey: AIModel): AIModel[] {
    return (MODEL_FALLBACK_CHAIN[modelKey] ?? []) as AIModel[]
}

// Re-exports
export type { AIProvider, ProviderGenerateParams, ProviderStreamChunk } from './types'
