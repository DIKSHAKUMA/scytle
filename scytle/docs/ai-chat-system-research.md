# AI Chat System Research — Embedded Model Architecture

> Researched: 2026-04-04
> Method: Analysis of Lovable, Cursor, Replit, Bolt, v0 architectures + library research
> Status: COMPLETE
> Goal: Determine how to embed AI chat with multi-model support, agent loops, and screenshot feedback — matching Lovable/Cursor quality

---

## 1. Why MCP vs Embedded — The Real Answer

### Pencil/Paper chose MCP for business reasons, NOT quality reasons:
1. **They don't have a chat UI** — they're canvas editors, users bring their own IDE (Cursor, Claude Code)
2. **Zero AI compute cost** — user pays via their IDE subscription
3. **No infrastructure** — MCP server just reads/writes files, no API keys to manage

### Lovable/Cursor/Replit prove embedded AI works:

| Product | Embedded Model | Screenshot Loop | Agent Loop | Thinking | Quality |
|---------|---------------|-----------------|------------|----------|---------|
| **Lovable** | Claude Opus/Sonnet | YES | YES | YES | Production apps |
| **Replit** | Claude + custom | YES | YES | YES | Full working apps |
| **Bolt.new** | Claude/GPT | YES | YES | YES | Working apps |
| **v0 (Vercel)** | Claude | YES | YES | YES | Production components |
| **Cursor** | Claude/GPT | YES | YES | YES | Code at Claude Code level |

**None use MCP for core generation.** They all embed the model directly + build their own agent loop.

### The quality gap is NOT about MCP vs embedded. It's about:
1. **Can AI see its output?** (screenshot feedback loop)
2. **Can AI take multiple steps?** (agent loop with tool calling)
3. **Can AI load context on demand?** (tool-based context gathering)

All achievable with embedded API calls.

---

## 2. Scytle's Current AI System

### Architecture
```
User types → POST /api/chat → Google Gemini API → HTML back → parse to canvas → done
```

### What We Have
- **Models**: Only Gemini 3.1 (Pro + Flash Lite)
- **No user model switching** (auto-upgrades to Pro for images)
- **No agent loop** — one shot, AI never sees output
- **No tool calling** — AI just returns HTML text
- **Custom SSE streaming** — hand-built in API routes
- **Provider**: Google Vertex AI only

### Current Files
```
src/lib/ai/client.ts           → Custom Google GenAI streaming
src/lib/ai/config.ts           → AI config, 2 Gemini models, 6 system prompts
src/lib/ai/models.ts           → Model registry (ModelDefinition schema)
src/lib/ai/prompts/planner.ts  → Page planning prompt
src/lib/ai/prompts/page-generation.ts → HTML generation prompt
src/lib/ai/prompts/chat-design.ts    → Design chat prompt
src/app/api/chat/route.ts      → Chat API (SSE streaming)
src/app/api/ai/generate-html/route.ts → Page generation API
src/app/api/ai/plan-pages/route.ts    → Page planner API
src/app/api/ai/refine-node/route.ts   → Node refinement API
src/store/chat-store.ts        → Custom message state management
src/components/chat/*           → Custom streaming UI
```

### 3-Phase Pipeline
1. **Page Planning** (`/api/ai/plan-pages`) — JSON with pages, sections, theme
2. **HTML Generation** (`/api/ai/generate-html`) — SSE streaming of HTML+Tailwind
3. **Canvas Chat** (`/api/chat`) — Streaming chat with JSON action blocks (replaceNode, addNode, deleteNode)

---

## 3. Libraries & SDKs — Complete Research

### Vercel AI SDK (`ai`) — THE RECOMMENDED CHOICE

The industry standard for building AI chat into Next.js/React apps.

```
npm install ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google
```

| Capability | Details |
|---|---|
| **npm package** | `ai` (v6.x) + provider packages |
| **Multi-model** | One unified API for 20+ providers. Switch models by changing one line. |
| **Streaming** | `streamText()` and `streamObject()` — first-class, works with Next.js + Edge |
| **Tool calling** | Define tools with Zod schemas. AI calls → you execute → result fed back automatically |
| **Vision** | Pass images/screenshots as message content (Claude, GPT-4o, Gemini all support) |
| **Agent loops** | `maxSteps` parameter: model → tool call → execute → feed result → repeat until done |
| **React UI** | `useChat()` — full chat state, streaming, input handling. Also: `useCompletion()`, `useObject()` |
| **Framework support** | React, Next.js, Vue, Svelte, Angular, SolidJS |

**Why #1 choice**: Built for Next.js. Handles entire chat pipeline. Multi-model is trivial. Agent loops built-in.

---

### Anthropic SDK (`@anthropic-ai/sdk`)

Direct access to Claude models.

| Capability | Details |
|---|---|
| **npm package** | `@anthropic-ai/sdk` |
| **Multi-model** | Claude only (Opus 4.6, Sonnet 4.6, Haiku 4.5) |
| **Streaming** | SSE streaming |
| **Tool calling** | JSON Schema tools. Client tools (you execute) + Server tools (Anthropic executes: web_search, code_execution) |
| **Vision** | Base64 or URL images. Claude analyzes screenshots, UI designs. |
| **Agent loops** | Manual: send message → `stop_reason: "tool_use"` → execute → send result → repeat |
| **React UI** | None — raw API only |

**Use case**: Direct Claude access. But Vercel AI SDK wraps it via `@ai-sdk/anthropic` with streaming + UI + multi-model for free.

---

### OpenAI SDK (`openai`) + Agents SDK (`@openai/agents`)

| Capability | Details |
|---|---|
| **npm packages** | `openai` + `@openai/agents` |
| **Multi-model** | OpenAI only (GPT-4o, GPT-4.1, o3, o4-mini) |
| **Streaming** | SSE streaming |
| **Tool calling** | `function_calling` with JSON Schema. Parallel tool calls. |
| **Vision** | GPT-4o supports image inputs |
| **Agent loops** | Agents SDK: `Agent` class + `Runner` for multi-turn loops. Built-in tools (code interpreter, file search, image generation) |
| **React UI** | None |

**Use case**: If going OpenAI-only. Otherwise use via `@ai-sdk/openai`.

---

### Google Gemini SDK (`@google/genai`)

| Capability | Details |
|---|---|
| **npm package** | `@google/genai` (new, replaces `@google/generative-ai`) |
| **Multi-model** | Gemini only |
| **Streaming** | Supported |
| **Tool calling** | Function Calling — connect to external APIs |
| **Vision** | Images, video, audio, PDFs |
| **Agent loops** | Basic — build loop yourself |
| **React UI** | None |

**Use case**: Already what Scytle uses. Access via `@ai-sdk/google` through Vercel AI SDK is cleaner.

---

### LangChain.js + LangGraph.js

| Capability | Details |
|---|---|
| **npm packages** | `langchain`, `@langchain/core`, `@langchain/anthropic`, `@langchain/openai`, `@langchain/langgraph` |
| **Multi-model** | Standard interface across all providers |
| **Streaming** | Supported across all providers |
| **Tool calling** | Standardized tool interface with schemas |
| **Agent loops** | LangChain: prebuilt agent architectures. LangGraph: graph-based orchestration with state machines, human-in-the-loop |
| **React UI** | None (separate `@langchain/langgraph-sdk` for deployed agents) |

**Use case**: Complex multi-agent workflows, human-in-the-loop. Overkill for simple chat + tools. Vercel AI SDK is lighter.

---

### OpenRouter — Multi-Model Proxy

| Capability | Details |
|---|---|
| **npm package** | `@openrouter/ai-sdk-provider` (for Vercel AI SDK integration) |
| **Multi-model** | **200+ models** via one API key — Claude, GPT, Gemini, Llama, Mistral, DeepSeek, etc. |
| **Streaming** | OpenAI-compatible API |
| **Tool calling** | Passes through provider capabilities |
| **Pricing** | Pay-per-token, no monthly fee. Slightly higher than direct. |

**Use case**: One API key for all models. User picks any model from a dropdown. Compatible with Vercel AI SDK.

---

### LiteLLM — Self-Hosted Proxy

| Capability | Details |
|---|---|
| **Package** | `litellm` (Python only) |
| **Multi-model** | 100+ models via OpenAI-compatible interface |
| **Features** | Virtual API keys, cost tracking, rate limiting, admin dashboard |

**Use case**: Self-hosted alternative to OpenRouter. Python-based, less ideal for Next.js stack.

---

## 4. How Model Switching Would Work

### Option A: Direct API Keys (like Cursor)
```
User picks "Claude Opus" → call Anthropic API with YOUR key
User picks "GPT-4o"      → call OpenAI API with YOUR key
User picks "Gemini Pro"   → call Google API with YOUR key
```
- Need 3 API keys
- You pay for all usage
- Full control, lowest latency

### Option B: OpenRouter (simplest)
```
User picks any model → call OpenRouter with ONE key → routes to correct provider
```
- One API key, one bill
- 200+ models available
- Slightly higher cost (OpenRouter takes small cut)

### Option C: User Brings Own Key (like Cursor's BYOK)
```
User enters their API key in settings → stored encrypted → used for their calls
```
- You pay nothing
- User pays directly
- More friction for user

---

## 5. The Architecture Pattern (What Lovable/Cursor/Bolt All Do)

```
┌────────────────────────────────────────────────┐
│  USER: "Design a dark landing page"            │
└────────────────────┬───────────────────────────┘
                     ↓
┌────────────────────────────────────────────────┐
│  streamText({                                  │
│    model: anthropic('claude-opus-4-6'),         │
│    messages,                                   │
│    tools: { takeScreenshot, editNode, ... },   │
│    maxSteps: 5                                 │
│  })                                            │
└────────────────────┬───────────────────────────┘
                     ↓
│  Step 1: AI generates nav HTML                  │
│  → calls tool: editNode("root", "<nav>...")     │
│  → SDK executes, returns "OK"                   │
                     ↓
│  Step 2: AI generates hero HTML                  │
│  → calls tool: editNode("root", "<section>...")  │
│  → SDK executes, returns "OK"                    │
                     ↓
│  Step 3: AI calls takeScreenshot()               │
│  → SDK executes, returns base64 image            │
│  → AI SEES canvas: "spacing tight, fixing..."    │
                     ↓
│  Step 4: AI fixes spacing                        │
│  → calls tool: editNode("hero", fixed HTML)      │
                     ↓
│  Step 5: AI says "Done!"                         │
│  → No more tool calls → loop ends                │
└────────────────────────────────────────────────┘
```

---

## 6. Code Examples — How Simple It Is

### Frontend (replaces all custom chat code)
```typescript
import { useChat } from 'ai/react';

function ChatPanel() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { model: selectedModel }  // user picks from dropdown
  });

  return (
    <div>
      {messages.map(m => <div key={m.id}>{m.content}</div>)}
      <input value={input} onChange={handleInputChange} />
      <button onClick={handleSubmit}>Send</button>
    </div>
  );
}
```

### Backend (replaces custom SSE + Gemini client)
```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';

const providers = {
  'claude-opus': anthropic('claude-opus-4-6'),
  'claude-sonnet': anthropic('claude-sonnet-4-6'),
  'gpt-4o': openai('gpt-4o'),
  'gemini-pro': google('gemini-2.5-pro'),
};

export async function POST(req) {
  const { messages, model } = await req.json();

  const result = streamText({
    model: providers[model],
    system: designSystemPrompt,
    messages,
    maxSteps: 5,
    tools: {
      takeScreenshot: {
        description: "Take screenshot of canvas to verify design",
        parameters: z.object({}),
        execute: async () => { /* return canvas screenshot */ }
      },
      editNode: {
        description: "Add or replace HTML on canvas",
        parameters: z.object({
          nodeId: z.string(),
          html: z.string(),
        }),
        execute: async ({ nodeId, html }) => { /* apply to canvas, return OK */ }
      },
      getCanvasState: {
        description: "Get current canvas node tree",
        parameters: z.object({}),
        execute: async () => { /* return simplified node tree */ }
      }
    }
  });

  return result.toDataStreamResponse();
}
```

---

## 7. What Changes for Scytle

### Before (Current)
| Component | Implementation |
|---|---|
| AI Client | Custom `src/lib/ai/client.ts` — Google GenAI only |
| Streaming | Hand-built SSE in each API route |
| Chat State | Custom `chat-store.ts` with manual message management |
| Chat UI | Custom components parsing SSE manually |
| Models | 2 Gemini models only |
| Agent Loop | None — one shot |
| Screenshot | None — AI is blind |
| Tool Calling | None — AI returns text only |

### After (With Vercel AI SDK)
| Component | Implementation |
|---|---|
| AI Client | `streamText()` from `ai` — any provider |
| Streaming | Built into SDK — `result.toDataStreamResponse()` |
| Chat State | `useChat()` hook — handles everything |
| Chat UI | Same components but simpler (useChat handles state) |
| Models | Claude + GPT + Gemini (user picks from dropdown) |
| Agent Loop | `maxSteps: 5` — AI generates → tool call → verify → repeat |
| Screenshot | `takeScreenshot` tool — AI sees canvas, self-corrects |
| Tool Calling | Zod-defined tools — AI calls editNode, takeScreenshot, etc. |

---

## 8. Recommended Stack

| Layer | Library | Purpose |
|---|---|---|
| **Chat UI + State** | `ai` (`useChat` hook) | Replaces manual SSE parsing + chat-store |
| **Backend Streaming** | `ai` (`streamText`) | Replaces manual ReadableStream + SSE |
| **Claude** | `@ai-sdk/anthropic` | Claude Opus 4.6, Sonnet 4.6, Haiku 4.5 |
| **GPT** | `@ai-sdk/openai` | GPT-4o, GPT-4.1, o3, o4-mini |
| **Gemini** | `@ai-sdk/google` | Gemini 2.5 Pro, Flash (current provider) |
| **Tool Calling** | Built into `ai` | Zod schemas → AI calls tools automatically |
| **Agent Loop** | Built into `ai` (`maxSteps`) | Self-correcting multi-step generation |
| **Multi-model proxy** | OpenRouter (optional) | One API key → all models |

### npm install
```bash
npm install ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google zod
```

---

## 9. Key Insight: Paper's Approach Maps Directly

Paper's MCP workflow maps 1:1 to Vercel AI SDK tools:

| Paper (MCP) | Scytle (Vercel AI SDK) |
|---|---|
| `get_basic_info()` | `getCanvasState` tool |
| `get_font_family_info()` | `getAvailableFonts` tool |
| `create_artboard()` | `createArtboard` tool |
| `write_html()` | `editNode` tool |
| `get_screenshot()` | `takeScreenshot` tool |
| `update_styles()` | `updateStyles` tool |
| `finish_working_on_nodes()` | (not needed — no working indicator) |

Same agent loop, same tools, same quality. Just embedded instead of MCP.

---

## 10. Comparison: Scytle Now vs Scytle After

| Aspect | Now | After |
|---|---|---|
| Models available | 2 (Gemini only) | 10+ (Claude, GPT, Gemini, user picks) |
| AI sees output | No (blind) | Yes (screenshot tool) |
| Generation steps | 1 (one-shot) | 5-10 (agent loop) |
| Tool calling | None | editNode, takeScreenshot, getCanvasState |
| Design planning | None | Design brief tool (palette, fonts, spacing) |
| Self-correction | None | AI verifies via screenshot, fixes issues |
| Streaming code | ~200 lines custom SSE | ~20 lines with SDK |
| Chat state code | ~150 lines custom store | ~10 lines with useChat() |
| Cost per generation | 1 API call | 3-8 API calls (but much better quality) |
