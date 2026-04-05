/**
 * POST /api/chat — Unified AI Chat Endpoint
 *
 * Single endpoint for ALL AI interactions.
 * Uses Vercel AI SDK streamText with tool calling + agent loop.
 *
 * Key v6 API details:
 *   - convertToModelMessages() converts UIMessage[] → provider format
 *   - toUIMessageStreamResponse() streams back to useChat on client
 *   - stepCountIs(8) replaces maxSteps: 8
 *   - installProxyFixer() merges proxy multi-choice responses
 */

import { streamText, stepCountIs, convertToModelMessages, type UIMessage } from 'ai'
import { resolveModel, installProxyFixer, DEFAULT_MODEL } from '@/lib/ai/providers'
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

    // Determine if model supports reasoning (Claude via proxy)
    const isProxy = selectedModel.startsWith('claude')

    // Stream the response with tools + agent loop
    const result = streamText({
      model: resolvedModel,
      system: systemPrompt,
      messages: modelMessages,
      stopWhen: stepCountIs(8),
      tools: ALL_TOOLS,
      // Enable reasoning for Claude models via OpenAI-compatible provider
      ...(isProxy && {
        providerOptions: {
          openai: { reasoningEffort: 'high' },
        },
      }),
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

    // Handle specific error types
    if (error.message?.includes('rate limit') || error.status === 429) {
      return new Response(
        JSON.stringify({
          error: 'Rate limited. Try again in a moment or switch to a different model.',
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
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
