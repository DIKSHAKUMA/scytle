/**
 * AI Model Definitions — Client-safe
 *
 * This file contains ONLY the model registry data (no provider instances).
 * Safe to import from client components (model-selector, chat-panel, etc.)
 *
 * Provider instances (createOpenAI, createVertex) are in providers.ts (server-only).
 */

export interface ModelDef {
  key: string
  displayName: string
  provider: 'proxy' | 'vertex'
  proxyModelId: string
  tier: 'pro' | 'standard' | 'lite'
  capabilities: string[]
  badge?: string
}

export const MODELS: ModelDef[] = [
  // Claude via proxy — PRIMARY (tool calling works)
  {
    key: 'claude-sonnet',
    displayName: 'Claude Sonnet 4.6',
    provider: 'proxy',
    proxyModelId: 'claude-sonnet-4.6',
    tier: 'standard',
    capabilities: ['thinking', 'vision', 'coding', 'fast'],
    badge: 'Recommended',
  },
  {
    key: 'claude-haiku',
    displayName: 'Claude Haiku 4.5',
    provider: 'proxy',
    proxyModelId: 'claude-haiku-4.5',
    tier: 'lite',
    capabilities: ['fast', 'coding'],
    badge: 'Fast',
  },
  {
    key: 'claude-opus',
    displayName: 'Claude Opus 4.6',
    provider: 'proxy',
    proxyModelId: 'claude-opus-4.6',
    tier: 'pro',
    capabilities: ['thinking', 'vision', 'coding'],
    badge: 'Best',
  },
  // Gemini via Vertex — text-only fallback
  {
    key: 'gemini-pro',
    displayName: 'Gemini 3.1 Pro',
    provider: 'vertex',
    proxyModelId: 'gemini-3.1-pro-preview',
    tier: 'pro',
    capabilities: ['thinking', 'vision', 'coding', 'long-context'],
    badge: 'Free',
  },
]

export const DEFAULT_MODEL = 'claude-sonnet'
