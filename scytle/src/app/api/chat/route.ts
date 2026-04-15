/**
 * POST /api/chat — Unified AI Chat Endpoint
 *
 * Single endpoint for ALL AI interactions.
 * Uses Vercel AI SDK streamText with tool calling + agent loop.
 *
 * Key v6 API details:
 *   - convertToModelMessages() converts UIMessage[] → provider format
 *   - toUIMessageStreamResponse() streams back to useChat on client
 *   - stepCountIs(20) — generous headroom for full page generation
 *   - installProxyFixer() merges proxy multi-choice responses
 */

import { streamText, stepCountIs, convertToModelMessages, type UIMessage } from 'ai'
import { resolveModel, installProxyFixer, DEFAULT_MODEL, MODELS } from '@/lib/ai/providers'
import { buildSystemPrompt, type SystemPromptContext } from '@/lib/ai/prompts/system'
import { ALL_TOOLS } from '@/lib/ai/tools'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 120

// Install proxy response fixer on module load
installProxyFixer()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const {
      messages,
      model: modelKey,
      config,
      context,
    } = body as {
      messages: UIMessage[]
      model?: string
      config?: { modelName?: string }
      context?: SystemPromptContext
    }

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: 'messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Resolve model — assistant-ui sends config.modelName, fallback to model key
    const selectedModel = config?.modelName || modelKey || DEFAULT_MODEL
    const modelDef = MODELS.find(m => m.key === selectedModel)
    let resolvedModel
    try {
      resolvedModel = resolveModel(selectedModel)
    } catch {
      return new Response(
        JSON.stringify({ error: `Unknown model: ${selectedModel}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Build system prompt with canvas context
    const systemPrompt = buildSystemPrompt(context || {})

    // Convert UIMessages (from useChat) → model messages (for the provider)
    const modelMessages = await convertToModelMessages(messages)

    // Determine provider from model definition for provider-specific options
    const provider = modelDef?.provider || 'proxy'

    // Provider-specific options: enable thinking/reasoning for each provider
    let providerOptions: Record<string, any>
    if (provider === 'proxy') {
      providerOptions = { openai: { reasoningEffort: 'high' } }
    } else if (provider === 'vertex-global') {
      // Gemini 3.x: 'high' thinking for creative design quality
      // With fewer tools (no updateTheme), the model handles this well
      providerOptions = { vertex: { thinkingConfig: { thinkingLevel: 'high' } } }
    } else {
      // Gemini 2.5 supports thinkingBudget
      providerOptions = { vertex: { thinkingConfig: { thinkingBudget: 8192 } } }
    }

    // Stream the response with tools + agent loop
    const result = streamText({
      model: resolvedModel,
      system: systemPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(20),
      tools: ALL_TOOLS,
      toolChoice: 'auto',
      providerOptions,
      onStepFinish({ toolCalls }) {
        if (toolCalls.length > 0) {
          console.log(
            `[chat] Step: ${toolCalls.length} tool call(s):`,
            toolCalls.map(tc => tc.toolName).join(', ')
          )
        }
      },
    })

    // Stream back as UIMessage format for useChat on the client
    // sendReasoning: true streams thinking tokens to frontend
    return result.toUIMessageStreamResponse({ sendReasoning: true })
  } catch (error: any) {
    console.error('[chat] Error:', error.message)

    const msg = error.message || ''

    // Proxy credentials exhausted (gameron proxy overloaded)
    if (msg.includes('credentials exhausted') || msg.includes('proxy_all_credentials_exhausted')) {
      return new Response(
        JSON.stringify({
          error: 'AI service is temporarily busy. Please try again in a moment or switch to Gemini Pro.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Rate limit (proxy or Vertex)
    if (msg.includes('rate limit') || error.status === 429 || msg.includes('RESOURCE_EXHAUSTED')) {
      return new Response(
        JSON.stringify({
          error: 'Rate limited. Try again in a moment or switch to a different model.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Vertex AI auth errors
    if (msg.includes('PERMISSION_DENIED') || msg.includes('UNAUTHENTICATED')) {
      return new Response(
        JSON.stringify({
          error: 'Google Cloud authentication error. Please check your Vertex AI credentials.',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: msg || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// GET endpoint to list available models
export async function GET() {
  const { getEnabledModels } = await import('@/lib/ai/providers')
  const models = getEnabledModels()
  return new Response(JSON.stringify({ models, default: DEFAULT_MODEL }), {
    headers: { 'Content-Type': 'application/json' },
  })
}
