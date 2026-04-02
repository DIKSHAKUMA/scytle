// Model Registry for Scytle
// Centralized definition of all AI models with metadata for UI

import { z } from 'zod'

// ─────────────────────────────────────────────
// Schema & Types
// ─────────────────────────────────────────────

export const ModelCapabilitySchema = z.enum([
    'thinking',      // Deep reasoning / chain-of-thought
    'fast',          // Low latency responses
    'coding',        // Optimized for code generation
    'vision',        // Can process images
    'long-context',  // Extended context window
])

export type ModelCapability = z.infer<typeof ModelCapabilitySchema>

export const ModelTierSchema = z.enum(['pro', 'standard', 'lite'])
export type ModelTier = z.infer<typeof ModelTierSchema>

export const ModelProviderSchema = z.enum(['google', 'anthropic', 'openai'])
export type ModelProvider = z.infer<typeof ModelProviderSchema>

export const ModelDefinitionSchema = z.object({
    // Unique key used in code (e.g., 'gemini-pro')
    key: z.string(),
    // Full model ID for API calls (e.g., 'gemini-3.1-pro-preview')
    modelId: z.string(),
    // Display name in UI
    displayName: z.string(),
    // Short description
    description: z.string(),
    // Provider
    provider: ModelProviderSchema,
    // Tier (affects pricing/speed)
    tier: ModelTierSchema,
    // Capabilities
    capabilities: z.array(ModelCapabilitySchema),
    // Max output tokens
    maxOutputTokens: z.number(),
    // Context window size
    contextWindow: z.number(),
    // Whether model requires global location (Vertex AI)
    requiresGlobalLocation: z.boolean().default(false),
    // Whether model is available/enabled
    enabled: z.boolean().default(true),
    // Optional: version tag for display
    version: z.string().optional(),
    // Optional: badge text (e.g., "Preview", "New")
    badge: z.string().optional(),
})

export type ModelDefinition = z.infer<typeof ModelDefinitionSchema>

// ─────────────────────────────────────────────
// Model Registry
// ─────────────────────────────────────────────

export const MODEL_REGISTRY: ModelDefinition[] = [
    {
        key: 'gemini-pro',
        modelId: 'gemini-3.1-pro-preview',
        displayName: 'Gemini 3.1 Pro',
        description: 'Best quality with deep thinking',
        provider: 'google',
        tier: 'pro',
        capabilities: ['thinking', 'coding', 'vision', 'long-context'],
        maxOutputTokens: 65535,
        contextWindow: 1000000,
        requiresGlobalLocation: true,
        enabled: true,
        version: '3.1',
        badge: 'Preview',
    },
    {
        key: 'gemini-flash',
        modelId: 'gemini-3.1-flash-lite-preview',
        displayName: 'Gemini 3.1 Flash Lite',
        description: 'Fast and cost-effective',
        provider: 'google',
        tier: 'lite',
        capabilities: ['fast', 'coding'],
        maxOutputTokens: 65535,
        contextWindow: 1000000,
        requiresGlobalLocation: true,
        enabled: true,
        version: '3.1',
        badge: 'Preview',
    },
    {
        key: 'claude-sonnet',
        modelId: 'claude-sonnet-4-6',
        displayName: 'Claude Sonnet 4.6',
        description: 'Balanced speed and quality',
        provider: 'anthropic',
        tier: 'standard',
        capabilities: ['coding', 'thinking', 'vision'],
        maxOutputTokens: 16384,
        contextWindow: 200000,
        requiresGlobalLocation: false,
        enabled: true,
        version: '4.6',
        badge: 'New',
    },
]

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Get all enabled models */
export function getEnabledModels(): ModelDefinition[] {
    return MODEL_REGISTRY.filter(m => m.enabled)
}

/** Get model by key */
export function getModelByKey(key: string): ModelDefinition | undefined {
    return MODEL_REGISTRY.find(m => m.key === key)
}

/** Get model by model ID */
export function getModelById(modelId: string): ModelDefinition | undefined {
    return MODEL_REGISTRY.find(m => m.modelId === modelId)
}

/** Get default model */
export function getDefaultModel(): ModelDefinition {
    return MODEL_REGISTRY.find(m => m.key === 'gemini-flash') ?? MODEL_REGISTRY[0]
}

/** Check if model requires global location */
export function requiresGlobalLocation(modelKeyOrId: string): boolean {
    const model = getModelByKey(modelKeyOrId) ?? getModelById(modelKeyOrId)
    return model?.requiresGlobalLocation ?? false
}

/** Get all model IDs that require global location */
export function getGlobalLocationModelIds(): string[] {
    return MODEL_REGISTRY
        .filter(m => m.requiresGlobalLocation)
        .map(m => m.modelId)
}

/** Map model key to model ID */
export function resolveModelId(key: string): string {
    const model = getModelByKey(key)
    return model?.modelId ?? key
}

/** Get models grouped by tier */
export function getModelsByTier(): Record<ModelTier, ModelDefinition[]> {
    const result: Record<ModelTier, ModelDefinition[]> = {
        pro: [],
        standard: [],
        lite: [],
    }
    for (const model of getEnabledModels()) {
        result[model.tier].push(model)
    }
    return result
}

// ─────────────────────────────────────────────
// Export type for AI config compatibility
// ─────────────────────────────────────────────

export type AIModelKey = (typeof MODEL_REGISTRY)[number]['key']
