// AI Library exports
export { generate, generateStream, createStreamResponse, RateLimitError } from './client'
export type { ChatMessage, GenerateOptions, StreamChunk, AIModel, SystemPromptKey } from './client'
export { AI_CONFIG, SYSTEM_PROMPTS } from './config'

// Autofix
export { autofixHtml, assemblePage } from './autofix'

// Unsplash
export { searchImages, batchSearchImages } from './unsplash'
export type { UnsplashImage, ImageQuery, ImageMap } from './unsplash'

// Pipeline
export { generateSection } from './pipeline/generate-section'
export { generatePageParallel } from './pipeline/generate-page'
export { generateProjectPipeline } from './pipeline/generate-project'
export type { GenerateProjectPipelineOptions, GenerateProjectResult as PipelineProjectResult } from './pipeline/generate-project'

// Prompts (types)
export type { PagePlan, PlannedPage, PlannedSection } from './prompts/planner'
