# Scytle AI Chat System — Complete Rewrite Plan

> Date: 2026-04-04 (Updated: 2026-04-04)
> Status: IN PROGRESS — Phase 0 ✅, Phase 1 ✅, Phase 2 next
> Scope: Delete all existing AI/chat code, rebuild from scratch with Vercel AI SDK
> Providers: Claude via proxy (api.gameron.me, PRIMARY) + Vertex Gemini (text-only fallback)

---

## 1. Why Rebuild (Not Patch)

The current system has fundamental architectural issues that can't be fixed incrementally:

1. **Two disconnected chat systems** — Dashboard `/new` page generates pages (plan→HTML pipeline), canvas chat tab refines nodes. They share nothing — no common history, no common AI backend, no common UI.
2. **Gemini-only** — Hardcoded to Google GenAI SDK. No Claude, no model switching.
3. **No agent loop** — One-shot generation. AI never sees output, never self-corrects.
4. **No tool calling** — AI returns text/HTML. Can't call functions (screenshot, edit node, read canvas).
5. **Custom SSE plumbing** — ~500 lines of hand-rolled streaming (client.ts + chat-store.ts + route.ts) that Vercel AI SDK gives for free.
6. **No thinking/reasoning display** — No chain-of-thought UI even though models support it.
7. **No screenshot verification** — The #1 improvement from Paper/Pencil research.
8. **Theme tab disconnected** — 60 palettes only change accent colors. Backgrounds, text, borders are hardcoded to same values every time. AI generation doesn't read from theme store.

---

## 2. Files to DELETE (Complete Removal)

### AI Core (~570 LOC)
```
src/lib/ai/client.ts              → 274 LOC  — Custom Google GenAI streaming (replaced by AI SDK)
src/lib/ai/config.ts              → 142 LOC  — System prompts + config (rewritten)
src/lib/ai/models.ts              → 154 LOC  — Model registry (rewritten for multi-provider)
```

### AI Prompts (~1050 LOC)
```
src/lib/ai/prompts/planner.ts     → 110 LOC  — Page planner prompt (rewritten)
src/lib/ai/prompts/page-planner.ts→ exists    — Alt planner (check if used, delete)
src/lib/ai/prompts/page-generation.ts → 301 LOC — HTML generation prompt (rewritten)
src/lib/ai/prompts/chat-design.ts → 139 LOC  — Design chat prompt (rewritten)
src/lib/ai/prompts/section.ts     → 219 LOC  — Section guidance (rewritten)
src/lib/ai/prompts/layouts.ts     → 382 LOC  — Layout archetypes (remove rigid archetypes)
src/lib/ai/prompts/system.ts      → exists    — System prompts (merged into new config)
```

### API Routes (~800+ LOC)
```
src/app/api/chat/route.ts         → 214 LOC  — Chat SSE endpoint (replaced by AI SDK route)
src/app/api/ai/generate-html/route.ts     — HTML generation (merged into unified chat)
src/app/api/ai/plan-pages/route.ts        — Page planner (merged into unified chat)
src/app/api/ai/generate-sections/route.ts — Section generator (merged into unified chat)
src/app/api/ai/refine-node/route.ts       — Node refinement (becomes a tool)
src/app/api/ai/analyze-image/route.ts     — Image analysis (becomes a tool)
src/app/api/ai/search-images/route.ts     — Unsplash search (becomes a tool)
```

### Chat Store (~400 LOC)
```
src/store/chat-store.ts           → 400 LOC  — Custom Zustand chat state (replaced by useChat)
```

### Chat UI Components (~450 LOC)
```
src/components/chat/chat-sidebar.tsx  → 90 LOC
src/components/chat/chat-input.tsx    → 126 LOC
src/components/chat/message.tsx       → 170 LOC
src/components/chat/typing-indicator.tsx → ~30 LOC
src/components/chat/quick-actions.tsx → ~30 LOC
src/components/chat/index.ts         → barrel
```

### Workspace Chat Integration (~815 LOC)
```
src/components/workspace/chat-tab.tsx → 815 LOC — The massive monolith (rebuilt)
```

### Total deleted: ~4,000+ LOC

---

## 3. New Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND                               │
│                                                              │
│  ┌─────────────┐   ┌──────────────────────────────────────┐  │
│  │ Model       │   │ assistant-ui chat panel               │  │
│  │ Selector    │   │ ┌──────────────────────────────────┐ │  │
│  │ (dropdown)  │   │ │ Thread (messages + streaming)     │ │  │
│  └──────┬──────┘   │ │ - User messages                   │ │  │
│         │          │ │ - AI messages (markdown rendered)  │ │  │
│         │          │ │ - Tool call cards (expandable)     │ │  │
│         │          │ │ - Thinking/reasoning blocks        │ │  │
│         │          │ │ - Image attachments                │ │  │
│         │          │ └──────────────────────────────────┘ │  │
│         │          │ ┌──────────────────────────────────┐ │  │
│         │          │ │ Composer (input + file upload)     │ │  │
│         │          │ └──────────────────────────────────┘ │  │
│         │          └──────────────────────────────────────┘  │
│         │                         │                          │
│         │     useChat({ api: '/api/chat', body: { model } }) │
│         │                         │                          │
└─────────┼─────────────────────────┼──────────────────────────┘
          │                         │
          ▼                         ▼
┌──────────────────────────────────────────────────────────────┐
│                     BACKEND (Next.js API)                      │
│                                                              │
│  POST /api/chat                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ streamText({                                           │  │
│  │   model: providers[selectedModel],                     │  │
│  │   system: buildSystemPrompt(context),                  │  │
│  │   messages,                                            │  │
│  │   stopWhen: stepCountIs(8),                              │  │
│  │   tools: {                                             │  │
│  │     generateDesignBrief,   // AI plans before coding   │  │
│  │     generateSection,       // Write HTML for one section│  │
│  │     editNode,              // Replace/add node HTML    │  │
│  │     takeScreenshot,        // See canvas output        │  │
│  │     getCanvasState,        // Read current nodes       │  │
│  │     searchImages,          // Find Unsplash photos     │  │
│  │     planPages,             // Multi-page planning      │  │
│  │   }                                                    │  │
│  │ })                                                     │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                    │
│              ┌──────────┼──────────┐                         │
│              ▼                     ▼                         │
│         Claude                 Gemini                       │
│    (@ai-sdk/              (@ai-sdk/                         │
│     openai                 google-vertex)                    │
│     via proxy)             text-only fallback               │
│    api.gameron.me     Vertex free credits                   │
└──────────────────────────────────────────────────────────────┘
```

---

## 4. New File Structure

```
src/
├── lib/
│   └── ai/
│       ├── providers.ts          → Model registry + provider instances (NEW)
│       ├── tools.ts              → All AI tool definitions with Zod schemas (NEW)
│       ├── prompts/
│       │   ├── system.ts         → Unified system prompt (REWRITTEN)
│       │   └── design-brief.ts   → Design brief generation prompt (NEW)
│       └── index.ts              → Re-exports
│
├── app/
│   └── api/
│       └── chat/
│           └── route.ts          → Single unified chat endpoint (REWRITTEN)
│
├── components/
│   └── chat/
│       ├── chat-panel.tsx        → Main chat panel using assistant-ui (NEW)
│       ├── tool-renderers.tsx    → Custom UI for tool call results (NEW)
│       ├── model-selector.tsx    → Model picker dropdown (REWRITTEN)
│       └── index.ts              → Barrel exports
│
└── store/
    └── (no chat store needed — useChat manages state)
```

**Total new files: ~8 files, ~1200-1500 LOC (vs ~4000 LOC deleted)**

---

## 5. Dependencies

### Installed ✅
```bash
npm install ai @ai-sdk/openai @ai-sdk/google-vertex @ai-sdk/anthropic @ai-sdk/google zod
```

> **Architecture discovery**: The proxy at api.gameron.me uses **OpenAI-compatible format** (`/v1/chat/completions`), NOT Anthropic format. So we use `@ai-sdk/openai` with custom `baseURL` for Claude models. `@ai-sdk/google-vertex` for direct Vertex (text only). `@ai-sdk/anthropic` and `@ai-sdk/google` installed but not actively used (kept for future direct API access).

### Already have (keep)
- `zustand` — still used for editor-store, project-store (NOT for chat)
- `zod` — already installed for validation (v4)
- `next` — already the framework
- `tailwindcss` — already styling
- `shadcn/ui` — chat UI built alongside it

### Remove (Phase 4)
```bash
npm uninstall @google/genai  # (only if no other code uses it)
```

### Environment Variables (existing in .env.local)
```env
# Claude via Proxy — PRIMARY (OpenAI-compatible format)
ANTHROPIC_API_KEY=sk-user-...
# Note: baseURL is hardcoded to https://api.gameron.me/v1 in providers.ts
# The proxy key is named ANTHROPIC_API_KEY but it's actually an OpenAI-format Bearer token

# Google Vertex AI — text-only fallback (uses ADC, not API key)
GOOGLE_CLOUD_PROJECT=composed-cogency-glb3w
GOOGLE_CLOUD_LOCATION=us-central1
# Note: Tool calling broken due to @ai-sdk/google-vertex + Zod v4 bug
```

---

## 6. Detailed File Specifications

### 6.1 `src/lib/ai/providers.ts` — Model Registry + Providers ✅ BUILT

```typescript
// KEY ARCHITECTURE DECISIONS (from Phase 0 testing):
//
// 1. Proxy uses OpenAI-compatible API, NOT Anthropic format
//    → Use @ai-sdk/openai with createOpenAI({ baseURL: 'https://api.gameron.me/v1' })
//    → Use proxy.chat('claude-sonnet-4.6') — .chat() forces Chat Completions API
//
// 2. Proxy returns multi-choice responses (tool call in choice[1], text in choice[0])
//    → installProxyFixer() patches globalThis.fetch to merge choices
//    → Must be called once at app startup (route.ts module load)
//
// 3. Vertex Gemini: text + streaming work, but tool calling is broken
//    → @ai-sdk/google-vertex + Zod v4 = empty tool parameters sent to API
//    → Root cause: SDK sends { properties: {} } instead of full schema
//    → Gemini used as text-only fallback, Claude is primary for agent loop

import { createOpenAI } from '@ai-sdk/openai'
import { createVertex } from '@ai-sdk/google-vertex'

const proxy = createOpenAI({
  apiKey: process.env.ANTHROPIC_API_KEY!,
  baseURL: 'https://api.gameron.me/v1',
  name: 'gameron-proxy',
})

const vertex = createVertex({
  project: process.env.GOOGLE_CLOUD_PROJECT || 'composed-cogency-glb3w',
  location: 'global',
})

export const MODELS: ModelDef[] = [
  // Claude via proxy — PRIMARY (tool calling works)
  { key: 'claude-sonnet', displayName: 'Claude Sonnet 4.6', provider: 'proxy', proxyModelId: 'claude-sonnet-4.6', tier: 'standard', badge: 'Recommended' },
  { key: 'claude-haiku', displayName: 'Claude Haiku 4.5', provider: 'proxy', proxyModelId: 'claude-haiku-4.5', tier: 'lite', badge: 'Fast' },
  { key: 'claude-opus', displayName: 'Claude Opus 4.6', provider: 'proxy', proxyModelId: 'claude-opus-4.6', tier: 'pro', badge: 'Best' },
  // Gemini — text-only fallback
  { key: 'gemini-pro', displayName: 'Gemini 3.1 Pro', provider: 'vertex', proxyModelId: 'gemini-3.1-pro-preview', tier: 'pro', badge: 'Free' },
]

export const DEFAULT_MODEL = 'claude-sonnet'

// installProxyFixer() — patches fetch to merge multi-choice proxy responses
// resolveModel(key) — returns AI SDK model instance
// getEnabledModels() — filters by available API keys
```

### 6.2 `src/lib/ai/tools.ts` — AI Tool Definitions ✅ BUILT

```typescript
// CRITICAL AI SDK v6 CHANGE: tool() uses `inputSchema` not `parameters`!
// Using `parameters` silently accepts but sends empty schema to the provider.
// This was discovered during Phase 0 testing — args were always {}.
//
// 8 tools defined with Zod schemas:
//   updateTheme, getThemeContext, generateSection, editNode,
//   takeScreenshot, getCanvasState, searchImages, planPages
//
// All execute functions are stubs — wired in Phase 3.

import { tool } from 'ai'
import { z } from 'zod'

// ═══════════════════════════════════════════════════════════
// Tool: UPDATE THEME — AI decides the full visual identity
// ═══════════════════════════════════════════════════════════
//
// This is the KEY tool that connects AI → theme tab → canvas.
//
// Flow:
//   AI calls updateTheme() → writes to useStyleGuideStore
//   → theme tab updates live (user sees palette appear)
//   → variableTable recalculates (linkMaps ready for parser)
//   → AI generates HTML using those exact values
//   → parser matches hex values → stores as variable refs
//   → user changes color in theme tab → all nodes update
//
export const updateTheme = tool({
  description: `Set the full visual identity for the design. Call this FIRST before generating any HTML.
This writes directly to the theme panel — the user will see colors, fonts, and styles update live.
All generated HTML must use the exact values you set here. The parser will link them to theme variables,
so if the user later changes a color in the theme panel, all nodes update automatically.

IMPORTANT: Choose colors contextually — a fitness studio should feel energetic (warm oranges/reds),
a law firm should feel trustworthy (navy/gold), a kids app should feel playful (bright candy colors).
Never use generic defaults. Every project deserves a unique, thoughtful palette.`,
  inputSchema: z.object({
    // Mode
    mode: z.enum(['light', 'dark']).describe('Light or dark mode'),

    // Colors — FULL palette, not just accents
    bgPrimary: z.string().describe('Main background. Light: warm whites like #FAFAF8, not pure #fff. Dark: deep darks like #0A0A0F, not pure #000'),
    bgSecondary: z.string().describe('Alternate section background. Slightly different from bgPrimary for visual rhythm'),
    textPrimary: z.string().describe('Main text color. Light: warm dark like #1A1A1A, not #000. Dark: soft white like #F5F5F5, not #fff'),
    textSecondary: z.string().describe('Secondary text (descriptions, captions). Less contrast than primary'),
    textMuted: z.string().describe('Muted text (timestamps, meta). Even less contrast'),
    accent: z.string().describe('Primary accent color. The ONE bold color that defines the brand.'),
    accentName: z.string().describe('Human name for the accent: "Coral", "Electric Blue", "Forest Green"'),
    textOnAccent: z.string().describe('Text color on accent backgrounds. Usually #ffffff or #000000'),
    border: z.string().describe('Border/divider color. Subtle, not distracting'),

    // Typography
    headingFont: z.string().describe('Heading font family from Google Fonts: "Raleway", "Playfair Display", "Space Grotesk", etc.'),
    bodyFont: z.string().describe('Body font family from Google Fonts: "Inter", "DM Sans", "Source Sans Pro", etc.'),
    headingWeight: z.enum(['400', '500', '600', '700', '800']).describe('Heading weight. 700-800 for bold editorial, 400-500 for elegant minimal'),
    bodyWeight: z.enum(['300', '400', '500']).describe('Body weight. 400 is standard, 300 for light elegant'),
    sizeScale: z.enum(['0.875', '1', '1.125']).describe('Font size multiplier. 0.875=compact, 1=default, 1.125=large'),

    // UI Styling
    buttonStyle: z.enum(['solid', 'outline', 'ghost', 'brick', 'gradient']).describe('Button visual style'),
    buttonRadius: z.enum(['0', '4', '8', '12', '9999']).describe('Button corner radius in px. 0=sharp, 9999=pill'),
    cardStyle: z.enum(['default', 'outlined', 'flat']).describe('Card visual style'),
    cardRadius: z.enum(['0', '4', '8', '12', '9999']).describe('Card corner radius in px'),
    imageRadius: z.enum(['0', '4', '8', '12', '9999']).describe('Image corner radius in px'),

    // Optional: secondary accent
    accent2: z.string().optional().describe('Optional secondary accent color'),
    accent2Name: z.string().optional().describe('Name for secondary accent'),

    // Visual direction (for chat UI display only)
    direction: z.string().describe('One sentence visual direction: "Dark editorial with warm orange energy" or "Clean minimal with sage green accents"'),
  }),
  execute: async (params) => {
    // This will be wired to:
    // 1. useStyleGuideStore.getState() → update active concept with ALL these values
    // 2. loadGoogleFonts() to load the chosen fonts
    // 3. Return the full variable table so AI knows exact values to use in HTML
    //
    // The execute function runs on the CLIENT side (via tool result streaming)
    // because it needs access to the Zustand store.
    return {
      success: true,
      message: `Theme set: ${params.mode} mode, accent ${params.accent} (${params.accentName}), ${params.headingFont}/${params.bodyFont}`,
      // Return the values back so AI uses them in subsequent generateSection calls
      theme: params,
    }
  }
})

// ═══════════════════════════════════════════════════════════
// Tool: READ CURRENT THEME — For when user already set theme manually
// ═══════════════════════════════════════════════════════════
//
// If user already picked a palette/fonts in theme tab before chatting,
// AI should READ the existing theme instead of overwriting it.
//
export const getThemeContext = tool({
  description: `Read the current theme settings from the theme panel. Call this ONLY when the user says
"use my current theme" or "keep the current colors" or when editing an existing design.
Do NOT call this for new designs — use updateTheme instead to set a fresh theme.`,
  inputSchema: z.object({}),
  execute: async () => {
    // Wired to useStyleGuideStore.getState().getActiveConcept()
    // + conceptToVariableTable() for the full variable table
    return { theme: {} } // placeholder — wired in Phase 3
  }
})

// Tool: Write HTML for one section to the canvas
export const generateSection = tool({
  description: `Generate HTML+Tailwind for ONE visual section and add it to the canvas.
Call this once per section (nav, hero, features, etc).
CRITICAL: Use the EXACT color/font values from the updateTheme call.
The parser links these values to theme variables, enabling live theme editing later.`,
  inputSchema: z.object({
    sectionType: z.string().describe('e.g. "nav", "hero", "features", "stats", "cta", "footer"'),
    html: z.string().describe('Complete HTML+Tailwind for this section. Use exact hex colors from updateTheme. Inline font-family styles.'),
    parentNodeId: z.string().default('root').describe('Canvas node ID to append to'),
  }),
  execute: async ({ sectionType, html, parentNodeId }) => {
    // This will be wired to parseHtmlToNodesViaIframe + editor-store.addNode
    // Parser uses buildLinkMaps() to match hex values → variable refs
    return { success: true, sectionType, nodeId: `generated-${Date.now()}` }
  }
})

// Tool: Edit/replace an existing node
export const editNode = tool({
  description: 'Replace the HTML of an existing canvas node. Use for refinements and edits. Use the same theme colors.',
  inputSchema: z.object({
    nodeId: z.string().describe('ID of the node to replace'),
    html: z.string().describe('New HTML+Tailwind for this node'),
    reason: z.string().describe('Brief explanation of what changed'),
  }),
  execute: async ({ nodeId, html, reason }) => {
    return { success: true, nodeId, reason }
  }
})

// Tool: Take a screenshot of the canvas (AI SEES the result)
export const takeScreenshot = tool({
  description: 'Take a screenshot of the current canvas to verify the design. Call this every 2-3 sections to check spacing, typography, contrast, alignment. IMPORTANT: Use this regularly.',
  inputSchema: z.object({
    nodeId: z.string().optional().describe('Specific node to screenshot, or omit for full canvas'),
  }),
  execute: async ({ nodeId }) => {
    return { screenshot: 'base64-image-data-here', nodeId }
  }
})

// Tool: Read the current canvas state
export const getCanvasState = tool({
  description: 'Read the current canvas node tree. Use this to understand what exists before making changes.',
  inputSchema: z.object({}),
  execute: async () => {
    return { nodes: [] }
  }
})

// Tool: Search for images on Unsplash
export const searchImages = tool({
  description: 'Search Unsplash for a relevant photo. Returns a URL to use in img tags.',
  inputSchema: z.object({
    query: z.string().describe('Search query: "aerial office", "woman using laptop", "sushi platter"'),
    width: z.number().default(800),
    height: z.number().default(600),
  }),
  execute: async ({ query, width, height }) => {
    return { url: `https://images.unsplash.com/photo-xxx?w=${width}&h=${height}&fit=crop`, query }
  }
})

// Tool: Plan multiple pages for a project
export const planPages = tool({
  description: 'Plan the structure of a multi-page website or app. Returns page names, descriptions, and section breakdown.',
  inputSchema: z.object({
    productDescription: z.string(),
    productType: z.enum(['web', 'app']).default('web'),
    pageCount: z.number().min(1).max(8).default(3),
  }),
  execute: async ({ productDescription, productType, pageCount }) => {
    return { pages: [] }
  }
})
```

### 6.2.1 How `updateTheme` Wires to the Store (Phase 3 Detail)

When the AI calls `updateTheme`, the frontend intercepts the tool result and:

```typescript
// In chat-panel.tsx — tool result handler
function handleToolResult(toolName: string, result: any) {
  if (toolName === 'updateTheme') {
    const { theme } = result
    const store = useStyleGuideStore.getState()
    const concept = store.getActiveConcept()

    // 1. Set mode
    store.setMode(theme.mode)

    // 2. Update ALL color values (not just accents!)
    // This is where we FIX the hardcoded palette problem.
    // Instead of applyPalette() which hardcodes bg/text/border,
    // we write EVERY value the AI chose:
    set(state => {
      const c = state.data.concepts.find(c => c.id === state.data.activeConceptId)
      if (!c) return

      c.colors.mode = theme.mode
      c.colors.bgPrimary = theme.bgPrimary
      c.colors.bgSecondary = theme.bgSecondary
      c.colors.textPrimary = theme.textPrimary
      c.colors.textSecondary = theme.textSecondary
      c.colors.textMuted = theme.textMuted
      c.colors.textOnAccent = theme.textOnAccent
      c.colors.border = theme.border

      // Set accent(s)
      c.colors.accents = [
        { id: 'accent-1', name: theme.accentName, hex: theme.accent, isMain: true },
      ]
      if (theme.accent2) {
        c.colors.accents.push(
          { id: 'accent-2', name: theme.accent2Name || 'Secondary', hex: theme.accent2, isMain: false }
        )
      }

      // Typography
      c.typography.headingFont = `'${theme.headingFont}', sans-serif`
      c.typography.bodyFont = `'${theme.bodyFont}', sans-serif`
      c.typography.headingWeight = Number(theme.headingWeight)
      c.typography.bodyWeight = Number(theme.bodyWeight)
      c.typography.sizeScale = Number(theme.sizeScale)

      // UI
      c.ui.buttonStyle = theme.buttonStyle
      c.ui.buttonRadius = Number(theme.buttonRadius)
      c.ui.cardStyle = theme.cardStyle
      c.ui.cardRadius = Number(theme.cardRadius)
      c.ui.imageRadius = Number(theme.imageRadius)

      // Recompute CSS + variable table
      state.computedCSS = recompute(state.data)
      state.variableTable = recomputeVariableTable(state.data)
      state.themeMode = getThemeModeFromData(state.data)
    })

    // 3. Load Google Fonts
    loadGoogleFonts(/* heading + body font pair */)

    // 4. Variable table now has:
    //    'bg/primary' → { light: theme.bgPrimary, dark: ... }
    //    'accent' → { light: theme.accent, dark: theme.accent }
    //    etc.
    //
    // 5. buildLinkMaps() now has:
    //    '#0A0A0F' → 'bg/primary'
    //    '#FF6B35' → 'accent'
    //    '#F5F5F5' → 'text/primary'
    //
    // So when AI generates <div class="bg-[#0A0A0F]">,
    // parser sees #0A0A0F → matches bg/primary → stores colorRef: 'bg/primary'
    // User changes bg/primary to #1A1A2E → node automatically updates!
  }
}
```

### 6.2.2 The Variable Linking Flow (Why This Works)

```
AI calls updateTheme({ bgPrimary: "#0A0A0F", accent: "#FF6B35", ... })
       ↓
useStyleGuideStore updates concept.colors.bgPrimary = "#0A0A0F"
       ↓
conceptToVariableTable() recalculates:
  variableTable['bg/primary'] = { light: ..., dark: '#0A0A0F' }
  variableTable['accent'] = { light: '#FF6B35', dark: '#FF6B35' }
       ↓
buildLinkMaps() creates reverse lookup:
  colorMap: '#0a0a0f' → 'bg/primary'
  colorMap: '#ff6b35' → 'accent'
       ↓
AI calls generateSection({ html: '<div class="bg-[#0A0A0F] text-[#F5F5F5]">...' })
       ↓
Parser processes HTML → finds bg color #0A0A0F
  → looks up in colorMap → finds 'bg/primary'
  → stores node.fillRef = 'bg/primary' (NOT hardcoded #0A0A0F)
       ↓
User opens theme tab → changes bg/primary from #0A0A0F to #1A1A2E
       ↓
All nodes with fillRef='bg/primary' auto-update to #1A1A2E ✅
```

### 6.3 `src/lib/ai/prompts/system.ts` — Unified System Prompt ✅ BUILT

Rewritten from scratch. 8 sections, ~4800 chars. Dynamically assembled based on context.
- Paper's design philosophy (Swiss editorial, minimalist, opinionated)
- Paper's mandatory screenshot checkpoints
- **AI-driven theme system** (replaces hardcoded palettes)
- Pencil's design principles (16 laws)
- Scytle's parser constraints (what CSS features work)
- Scytle's content quality rules (no lorem ipsum, realistic data)

Key sections:
1. **Role** — You are Scytle, an elite design agent
2. **Design Philosophy** — Swiss editorial, "one intense color > five weak", timeless palettes, typography hierarchy (from Paper)
3. **Workflow** — ALWAYS: updateTheme FIRST → sections one at a time → screenshot every 2-3 sections → fix issues
4. **Theme-First Rule** — You MUST call updateTheme() before any generateSection(). This sets the theme tab live. Then use EXACT values from updateTheme in all generated HTML. The parser links hex values → theme variables → nodes auto-update when user tweaks theme tab.
5. **Parser Constraints** — Exactly what CSS works (flexbox only, no grid, no margins, no position absolute — from existing Scytle rules)
6. **Output Format** — HTML+Tailwind with inline font-family styles, semantic HTML, Unsplash images
7. **Content Quality** — Realistic names, specific numbers, no "Lorem ipsum", no "AI slop" (from existing Scytle)
8. **Anti-patterns** — No generic "SaaS purple-navy", no grid-like sameness, no tiny text (from Paper)
9. **Theme Intelligence** — Match colors to context. Fitness=warm energy, Law=navy trust, Kids=playful candy. Never generic.

### 6.4 `src/app/api/chat/route.ts` — Unified Chat Endpoint ✅ BUILT

Single endpoint for ALL AI interactions:

```typescript
import { streamText, stepCountIs } from 'ai'
import { resolveModel, installProxyFixer, DEFAULT_MODEL } from '@/lib/ai/providers'
import { buildSystemPrompt } from '@/lib/ai/prompts/system'
import { ALL_TOOLS } from '@/lib/ai/tools'

// Install proxy response fixer on module load
installProxyFixer()

export async function POST(req: Request) {
  const { messages, model, context } = await req.json()

  const result = streamText({
    model: resolveModel(model || DEFAULT_MODEL),
    system: buildSystemPrompt(context || {}),
    messages,
    stopWhen: stepCountIs(8),  // v6 API: replaces maxSteps
    tools: ALL_TOOLS,
    onStepFinish({ toolCalls }) {
      if (toolCalls.length > 0) console.log(`[chat] Tool calls:`, toolCalls.map(tc => tc.toolName))
    },
  })

  return result.toTextStreamResponse()  // v6 API: replaces toDataStreamResponse
}

// GET — list available models
export async function GET() { ... }
```

### 6.5 `src/components/chat/chat-panel.tsx` — Main Chat UI

Uses `@assistant-ui/react` + `@assistant-ui/react-ai-sdk` for:

- **Thread** — Message list with auto-scroll
- **Composer** — Input with file upload, model selector
- **AssistantMessage** — AI responses with markdown rendering
- **ToolFallback** — Custom rendering for tool calls (shows "Generating nav section...", "Taking screenshot...", etc.)
- **BranchPicker** — Regenerate alternative responses
- **ThinkingIndicator** — Expandable chain-of-thought display

The key integration point: tool calls from the AI (generateSection, editNode) are intercepted on the frontend to actually apply changes to the canvas via editor-store.

### 6.6 `src/components/chat/tool-renderers.tsx` — Tool Call UI

Custom components that render tool calls visually:

```
┌─ 🎨 Theme Set ────────────────────────┐
│ Mode: Dark                             │
│ Palette: ■ #0A0A0F ■ #FF6B35 ■ #F5F5F5│
│ Fonts: Space Grotesk 700 / Inter 400   │
│ Buttons: solid, 12px radius            │
│ Direction: "Dark editorial, warm energy"│
│ ✅ Theme tab updated live              │
└────────────────────────────────────────┘

┌─ 🔧 Added: Hero Section ─────────────┐
│ 72px headline, pill badge, 2 CTAs     │
│ [Preview thumbnail]                    │
└───────────────────────────────────────┘

┌─ 📸 Screenshot Review ───────────────┐
│ ✅ Spacing: good rhythm               │
│ ✅ Typography: strong hierarchy        │
│ ⚠️ Contrast: muted text too light     │
│ → Fixing...                            │
└───────────────────────────────────────┘
```

---

## 7. The Agent Loop (How It Works End-to-End)

### Scenario A: User says "Design a dark SaaS landing page"

```
Step 1: AI calls updateTheme({
          mode: "dark",
          bgPrimary: "#0B0B10", bgSecondary: "#14141B",
          textPrimary: "#F0F0F5", textSecondary: "#9494A8",
          accent: "#7C3AED", accentName: "Electric Violet",
          headingFont: "Space Grotesk", bodyFont: "Inter",
          headingWeight: "700", buttonStyle: "solid", buttonRadius: "12",
          direction: "Dark editorial with electric violet energy"
        })
        → Theme tab updates LIVE — user sees purple palette, fonts, dark mode
        → User sees: 🎨 "Theme Set" card in chat

Step 2: AI calls generateSection({ sectionType: "nav", html: "<nav class='bg-[#0B0B10]...'>" })
        → HTML uses exact colors from step 1
        → Parser: #0B0B10 → matches bg/primary → stores fillRef: 'bg/primary'
        → Canvas updates — user sees the nav appear

Step 3: AI calls generateSection({ sectionType: "hero", html: "<section class='bg-[#0B0B10]...'>" })
        → Same theme colors → all linked to variables
        → Canvas updates

Step 4: AI calls takeScreenshot()
        → Captures canvas → AI SEES the result
        → Checks: spacing ✅, typography ✅, contrast ⚠️ muted text too light
        → User sees: 📸 Screenshot review card

Step 5: AI calls editNode() to fix contrast
        → Canvas updates

Step 6-7: AI generates features + CTA sections

Step 8: AI responds: "Done! Dark landing page with Electric Violet accents."
```

**The magic**: User goes to theme tab → changes accent from violet to coral →
ALL sections update automatically because every node stores `fillRef: 'accent'`, not `#7C3AED`.

### Scenario B: User already set theme manually, then says "Make this heading bigger"

```
Step 1: AI calls getThemeContext() — reads existing theme from store
        → Sees: user already has Terracotta palette, Raleway headings
Step 2: AI calls editNode({ nodeId: "node-123", html: "...", reason: "Increased to text-7xl" })
        → Uses the EXISTING theme colors, doesn't change them
Step 3: AI responds: "Made the heading larger (text-7xl)."
```

**No theme change** — AI respected the user's manual settings.

### Scenario C: User says "Build me a 5-page website for a fitness studio"

```
Step 1: AI calls planPages({ description: "fitness studio website", pageCount: 5 })
        → Returns: Home, Classes, Trainers, Pricing, Contact
        → User sees: 📋 Page plan card

Step 2: AI calls updateTheme({
          mode: "light",
          bgPrimary: "#FAFAF8", bgSecondary: "#F0EDE8",
          accent: "#E85D2C", accentName: "Energetic Orange",
          headingFont: "Bebas Neue", bodyFont: "DM Sans",
          direction: "Bold energetic, warm earthy with orange fire"
        })
        → Theme tab shows warm orange palette — feels like fitness
        → NOT the same generic white+indigo as everything else

Steps 3-8: AI generates Home page sections with screenshot checks

(User says "Now do Pricing" → AI continues with same theme, no updateTheme needed)
```

---

## 8. Edge Cases & Handling

| Edge Case | Handling |
|---|---|
| **User has no API keys configured** | `/api/chat` returns 400 with message listing which keys to add. Frontend shows setup guide. |
| **Model doesn't support vision** | If user attaches image but selected model lacks vision, auto-upgrade to a vision model (Gemini Pro or Claude Sonnet). Show notice. |
| **Proxy returns different error format** | Wrap Claude calls in try/catch. If proxy returns non-standard error, normalize to `{ error: string, code: number }`. Log raw error for debugging. |
| **Proxy buffers SSE (no real streaming)** | Detect in Phase 0 testing. If confirmed, add a "streaming may be delayed" indicator for Claude models. Gemini still streams normally. |
| **Proxy rate limits differently** | Catch 429s. Show "Rate limited — try Gemini (free)" suggestion. Add exponential backoff with max 3 retries. |
| **Tool execution fails** | AI SDK's `onStepFinish` catches errors. Tool returns `{ error: "..." }`. AI sees error and tries alternative approach. |
| **Generation aborted mid-stream** | `useChat` has `stop()` function. Frontend calls it. Backend stream closes cleanly. Partial work stays on canvas (user can undo). |
| **Parser can't handle AI's HTML** | System prompt's parser constraints section prevents this. But if it happens, tool returns `{ error: "Parse failed", html }` and AI adjusts. |
| **Screenshot too large** | Compress/resize to max 1MB before sending as tool result. Use JPEG quality 70. |
| **Conversation too long (token limit)** | Vercel AI SDK handles context window management. For very long conversations, trim older messages automatically. |
| **Offline / API down** | Retry with exponential backoff. Show error state in chat with "Retry" button. |
| **User switches model mid-conversation** | Works seamlessly — messages stay, only the provider changes on next request. |
| **Image reference mode** | When user attaches images, system prompt adds IMAGE REPLICATION section (kept from current system). |
| **Empty canvas vs existing content** | `getCanvasState` tool result tells AI whether canvas is empty. AI adapts: full page generation vs targeted edits. |
| **User already set theme manually** | AI calls `getThemeContext` to read existing values, uses them in generated HTML. Does NOT overwrite with `updateTheme`. |
| **AI picks colors that don't match context** | System prompt has "Theme Intelligence" section: fitness=warm, law=navy, kids=playful. AI is strongly guided. If user doesn't like it, they tweak in theme tab → nodes auto-update via variable refs. |
| **Parser can't match hex to variable** | If AI uses a color not in the theme (e.g. a gradient stop), parser stores as raw hex. Only theme-matched colors get variable refs. This is fine — decorative colors don't need to be theme-linked. |
| **User changes theme AFTER generation** | All nodes with variable refs update automatically. This is the whole point of the updateTheme approach. |
| **Multiple concepts** | AI writes to the ACTIVE concept only. User can duplicate concept first, then ask AI to generate a different theme for A/B testing. |

---

## 9. System Prompt Structure (Merged from Paper + Pencil + Scytle)

```
SECTION 1: ROLE & PERSONALITY
- You are Scytle, an elite design agent
- Friendly but opinionated about design quality
- You generate HTML+Tailwind that gets parsed to a design canvas

SECTION 2: THEME-FIRST WORKFLOW (CRITICAL)
- For NEW designs: call updateTheme() FIRST — this sets the full palette, fonts, UI styles
  in the theme panel. The user sees colors/fonts populate live.
- For EDITING existing designs: call getThemeContext() to read what's already set.
  Do NOT overwrite the user's manual theme choices.
- After theme is set: build ONE section at a time (nav → hero → features → ...)
- Call takeScreenshot every 2-3 sections
- Review: spacing, typography, contrast, alignment, clipping, repetition
- Fix issues before continuing

SECTION 3: THEME INTELLIGENCE (NEW)
- Match colors to the product's personality:
  → Fitness/sport: warm oranges, reds, energetic yellows
  → Legal/finance: navy, gold, trustworthy greens
  → Kids/education: bright candy colors, playful pinks/blues
  → Luxury/fashion: muted blacks, gold accents, elegant serifs
  → Tech/SaaS: clean blues, teals, modern sans-serif
  → Food/restaurant: warm earth tones, appetizing reds/oranges
  → Healthcare: calming blues, clean whites, gentle greens
- Never use generic defaults. Every project deserves unique colors.
- Backgrounds should NOT be pure #ffffff or pure #000000.
  Use warm whites (#FAFAF8, #F5F4F0) or deep darks (#0A0A0F, #0C0A05).
- The AI's updateTheme values write directly to the theme panel.
  They MUST be the same hex values used in generated HTML.
  This is how variable linking works.

SECTION 4: DESIGN PHILOSOPHY (from Paper — adapted)
- Minimalist: fewer elements, restraint, clarity
- White space is a feature
- Swiss editorial typography: heavy display + light labels
- One intense color > five weak ones
- Timeless palettes, not "SaaS purple-navy"
- Body text: never pure black or pure gray
- When prompt is vague → aim to impress
- No "AI slop": no generic gradients, no centered-everything

SECTION 5: PARSER CONSTRAINTS (from Scytle — KEEP)
- Tailwind CSS only. No <style> tags.
- NO margins (m-*, mx-auto). Use padding + gap.
- NO position: absolute/fixed/sticky
- NO max-w-*. Use w-full or fixed w-[Npx]
- NO responsive prefixes (sm:, md:, lg:, hover:)
- NO display: grid. Use flex only.
- NO HTML tables. Use flex layout.
- Partial borders render as full borders → use <hr> dividers
- overflow:auto renders as hidden
- Every text element MUST have explicit text color

SECTION 6: CONTENT QUALITY (from Scytle — KEEP)
- Realistic names: "Sarah Chen", "Marcus Rivera"
- Specific numbers: "$12,450", "2,847 users"
- Real Unsplash photos (use searchImages tool)
- No "Lorem ipsum", no generic copy

SECTION 7: TOOL USAGE GUIDE
- updateTheme: FIRST for any new design. Sets full palette + fonts + UI.
  Theme tab updates live. Use EXACT same values in HTML.
- getThemeContext: ONLY when editing existing designs or user says "keep my theme"
- generateSection: ONE section per call, sequential
- editNode: for refinements on existing nodes
- takeScreenshot: MANDATORY every 2-3 sections
- getCanvasState: before editing existing designs
- searchImages: when you need a photo URL
- planPages: for multi-page projects

SECTION 8: CANVAS CONTEXT (injected dynamically)
- Current nodes (if any)
- Selected node (if any)
- Project description
- Whether theme has been modified from defaults (if yes → use getThemeContext)
```

---

## 10. UI Library Choice: `@assistant-ui/react`

### Why assistant-ui over building from scratch:

| Feature | Build Yourself | assistant-ui |
|---|---|---|
| Message streaming | 2-3 days | Built-in |
| Auto-scroll | 1 day | Built-in |
| Tool call rendering | 2-3 days | Built-in (customizable) |
| Thinking/reasoning display | 1-2 days | Built-in |
| File/image upload | 1-2 days | Built-in |
| Stop generation | 0.5 days | Built-in |
| Message branching (regenerate) | 2 days | Built-in |
| Markdown rendering | 1 day | Built-in |
| Code block syntax highlighting | 0.5 days | Built-in |
| Copy message button | 0.5 days | Built-in |
| Vercel AI SDK integration | — | First-class |
| shadcn/ui compatible | — | Designed for it |

**Estimated time saved: 2-3 weeks of UI work.**

### Setup:
```bash
npx assistant-ui@latest create  # scaffolds components into your project
```

assistant-ui uses **composable primitives** (like shadcn): you get the unstyled building blocks and style them with Tailwind. Full control over every pixel.

---

## 11. Migration Path

### Phase 0: Provider Integration Testing (1 day) ✅ COMPLETE

9/9 tests pass. Key discoveries documented below.

#### Test Results (`scripts/test-providers.ts`)
```
✅ Vertex Basic       7385ms  — Gemini 3.1 Pro text works via ADC
✅ Vertex Streaming   6359ms  — 1 chunk, first at 6068ms
✅ Claude Basic       2434ms  — Claude Sonnet via proxy works
✅ Claude Streaming   3069ms  — 1 chunk, first at 3067ms
✅ Claude Tools       3486ms  — getWeather("Tokyo") ← args received correctly
✅ Haiku Tools        1885ms  — getWeather("London")
✅ Agent Loop        24330ms  — generateSection(5771 chars) → takeScreenshot() → done
✅ Claude Vision      7601ms  — Image analysis works (base64, not URL)
✅ Opus Basic         2634ms  — Claude Opus works
```

#### Critical Discoveries (from Phase 0)

| # | Discovery | Impact |
|---|-----------|--------|
| 1 | **Proxy uses OpenAI-compatible API** (`/v1/chat/completions` + Bearer auth), NOT Anthropic format (`/messages` + x-api-key) | Use `@ai-sdk/openai` with `baseURL`, NOT `@ai-sdk/anthropic` |
| 2 | **Proxy model IDs** are `claude-sonnet-4.6`, `claude-haiku-4.5`, `claude-opus-4.6` — different from official Anthropic IDs | Must use proxy's exact model strings |
| 3 | **AI SDK v6 uses `inputSchema` not `parameters`** in `tool()` — old name silently accepts but sends empty `{}` to provider | ALL tools must use `inputSchema` |
| 4 | **Proxy returns multi-choice responses** — text in choice[0], tool calls in choice[1] — instead of combining them | Need `installProxyFixer()` fetch middleware to merge |
| 5 | **Vertex Gemini tool calling broken** — `@ai-sdk/google-vertex` + Zod v4 sends `{ properties: {} }` instead of full schema | Gemini is text-only fallback, Claude is primary for agent loop |
| 6 | **Proxy vision needs base64** — URL images rejected with "external image URLs are not supported" | Must fetch + convert to Buffer before sending |
| 7 | **Available proxy models**: `claude-sonnet-4.6`, `claude-haiku-4.5`, `claude-opus-4.6`, `gemini-3.1-pro-preview`, `gpt-5.4`, `gpt-5.3-codex` | More models available than originally planned |

#### Architecture Decision (from Phase 0)
```
PROXY (api.gameron.me) → PRIMARY for all models
  - Claude Sonnet/Haiku/Opus via proxy.chat()
  - @ai-sdk/openai with name:'gameron-proxy'
  - inputSchema (not parameters) in tool()
  - installProxyFixer() to merge multi-choice responses

VERTEX (Google Cloud ADC) → FALLBACK text-only
  - Gemini 3.1 Pro for basic text generation
  - Tool calling blocked by SDK + Zod v4 compatibility bug
  - No API key needed, uses Application Default Credentials
```

### Phase 1: Backend (1-2 days) ✅ COMPLETE

Files created:
1. ✅ `src/lib/ai/providers.ts` — Model registry (4 models), proxy/vertex setup, `installProxyFixer()`
2. ✅ `src/lib/ai/tools.ts` — 8 tool definitions with Zod `inputSchema` (stubs, wired in Phase 3)
3. ✅ `src/lib/ai/prompts/system.ts` — Unified system prompt (8 sections, ~4800 chars)
4. ✅ `src/app/api/chat/route.ts` — Single endpoint: `streamText` + `stepCountIs(8)` + `ALL_TOOLS`
5. ✅ TypeScript: zero errors, build passes

Packages installed: `ai@6`, `@ai-sdk/openai@3`, `@ai-sdk/google-vertex@4`, `@ai-sdk/anthropic@3`, `@ai-sdk/google@3`

### Phase 2: Frontend Chat UI (1-2 days)
1. `npm install @assistant-ui/react @assistant-ui/react-ai-sdk`
2. Create `src/components/chat/chat-panel.tsx` — using assistant-ui + useChat
3. Create `src/components/chat/tool-renderers.tsx` — custom tool call cards
4. Create `src/components/chat/model-selector.tsx` — model dropdown (shows "Free" badge on Gemini)
5. Wire into workspace layout (replace chat-tab.tsx)
6. Test: Messages stream, tool calls render, model switching works

### Phase 3: Tool Wiring (2-3 days)
1. Wire `generateSection` tool → parseHtmlToNodesViaIframe → editor-store
2. Wire `editNode` tool → replace node in editor-store
3. Wire `takeScreenshot` → html2canvas or canvas export → return base64
4. Wire `getCanvasState` → read from editor-store
5. Wire `searchImages` → Unsplash API
6. Wire `planPages` → structured JSON generation
7. Test: Full agent loop works (design brief → sections → screenshots → done)

### Phase 4: Delete Old Code (1 day)
1. Delete all files listed in Section 2
2. Remove `@google/genai` dependency (if unused elsewhere)
3. Update any imports referencing deleted files
4. Run full build to verify no broken imports
5. Test entire flow end-to-end

### Phase 5: Polish (1-2 days)
1. Empty state UI (welcome message, suggested prompts)
2. Error states (API key missing, rate limited, model unavailable)
3. Conversation persistence to Appwrite (adapt existing logic)
4. Image attachment flow (drag-drop + paste)
5. Dark mode compatibility
6. Keyboard shortcuts (Cmd+Enter, Escape to stop)

**Total estimated: 8-11 days** (including Phase 0 testing)

---

## 12. What Gets BETTER After Rewrite

| Aspect | Before | After |
|---|---|---|
| **Models** | 2 Gemini only | 4 (Gemini Pro/Flash free + Claude Sonnet/Haiku via proxy). OpenAI can be added later. |
| **AI sees output** | Never | Every 2-3 sections (screenshot tool) |
| **Theme system** | 60 palettes that only change accent color. BG/text/border hardcoded. AI ignores theme tab. | AI decides FULL palette via updateTheme → writes to theme store → theme tab updates live → all nodes linked via variable refs → user can tweak ANY value later |
| **Design planning** | None | AI sets theme first, then builds section by section |
| **Generation quality** | One-shot, blind | Agent loop: theme → generate → verify → fix |
| **Variable linking** | Exists but AI doesn't use it | AI's exact hex values match variable table → parser auto-links → nodes are theme-aware |
| **Chat systems** | 2 disconnected (dashboard + canvas) | 1 unified chat everywhere |
| **Code complexity** | ~4000 LOC custom plumbing | ~1500 LOC with SDK handling the rest |
| **Streaming** | Hand-rolled SSE | SDK-managed with auto-scroll |
| **Tool calls in UI** | Not visible | Cards showing "Theme Set", "Adding hero section...", "Screenshot review..." |
| **Thinking display** | None | Expandable reasoning blocks |
| **File upload** | Custom image handling | Built into assistant-ui |
| **Model switching** | Auto-upgrade only | User dropdown (Gemini default, Claude available) |
| **Cost** | Vertex API costs | Gemini FREE (1L credits) + Claude via proxy |
