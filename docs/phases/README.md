# Scytle — Build Phases Master Index

> **Last updated**: March 2026
> **Status**: Phase A complete, Phase B pivoted, Phase C in planning

## Product Vision

**Scytle** is an AI Product Studio: **Idea → Sitemap → Design → Code**.

The user describes what they want to build → AI generates a sitemap (optional) → AI generates full page designs as HTML+Tailwind → a parser converts them into editable ScytleNode trees on an infinite canvas → user refines via chat + direct manipulation → exports clean production code.

**Key differentiator**: Unlike template-based tools, AI generates *unique* HTML for every prompt. The canvas is the single workspace — no tab switching between views.

## Architecture at a Glance

```
User Prompt
    ↓
[Sitemap Generator] → sitemap nodes on canvas (optional)
    ↓
[AI HTML Generator] → full HTML+Tailwind page per sitemap node
    ↓
[HTML → ScytleNode Parser] → FrameNode / TextNode / ImageNode tree
    ↓
[Infinite Canvas Editor] → select, drag, resize, edit text, reparent
    ↓
[Theme System] → modify colors/fonts/radius across all nodes
    ↓
[ScytleNode → HTML Exporter] → clean production HTML+Tailwind
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 · React 19 (compiler enabled) |
| Language | TypeScript strict, `@/` absolute imports |
| Styling | Tailwind CSS 4 (CSS-based config, oklch colors) |
| State | Zustand 5 + immer + devtools |
| Auth/DB | Appwrite (client-side auth, JWT for server routes) |
| AI | Google Vertex AI — Gemini 2.0-flash / 2.5-flash / 2.5-pro |
| Canvas | Custom infinite canvas (no library — built in Phase A) |
| Sitemap | ReactFlow (`@xyflow/react`) for node-graph editing |
| Validation | Zod 4 |
| UI | Radix / shadcn primitives |

## Phase Index

| # | Phase | Status | Doc |
|---|-------|--------|-----|
| A | Canvas Engine | ✅ Complete | [PHASE-A-CANVAS-ENGINE.md](./PHASE-A-CANVAS-ENGINE.md) |
| B | Architecture Pivot | ✅ Decided | [PHASE-B-ARCHITECTURE-PIVOT.md](./PHASE-B-ARCHITECTURE-PIVOT.md) |
| C1 | HTML → ScytleNode Parser | 🔲 Not started | [PHASE-C1-HTML-PARSER.md](./PHASE-C1-HTML-PARSER.md) |
| C2 | AI Page Generation | 🔲 Not started | [PHASE-C2-AI-GENERATION.md](./PHASE-C2-AI-GENERATION.md) |
| C3 | New Project Page | 🔲 Not started | [PHASE-C3-NEW-PROJECT.md](./PHASE-C3-NEW-PROJECT.md) |
| C4 | Workspace Layout | 🔲 Not started | [PHASE-C4-WORKSPACE-LAYOUT.md](./PHASE-C4-WORKSPACE-LAYOUT.md) |
| C5 | Chat + AI Iteration | 🔲 Not started | [PHASE-C5-CHAT-INTEGRATION.md](./PHASE-C5-CHAT-INTEGRATION.md) |
| C6 | Sitemap on Canvas | 🔲 Not started | [PHASE-C6-SITEMAP-CANVAS.md](./PHASE-C6-SITEMAP-CANVAS.md) |
| C7 | Theme System | 🔲 Not started | [PHASE-C7-THEME-SYSTEM.md](./PHASE-C7-THEME-SYSTEM.md) |
| C8 | HTML Export | 🔲 Not started | [PHASE-C8-EXPORT.md](./PHASE-C8-EXPORT.md) |

## Build Order & Dependencies

```
C1 (Parser) ──────────────────┐
                               ├──→ C5 (Chat + AI iteration)
C2 (AI Generation) ───────────┘         │
                                        ↓
C3 (New Project Page) ──→ C6 (Sitemap on Canvas) ──→ full flow
                                        
C4 (Workspace Layout) ──→ shell for everything

C7 (Theme System) ──→ standalone, needs C1 output on canvas

C8 (Export) ──→ reverse of C1, needs canvas nodes
```

**Recommended implementation order**: C4 → C1 → C2 → C3 → C6 → C5 → C7 → C8

## Demo Prototype

Visual mockups live at `/demo/flow/`:
- `/demo/flow/page.tsx` — Flow overview (step cards)
- `/demo/flow/new-project/page.tsx` — Enhanced project creation
- `/demo/flow/workspace/page.tsx` — Full workspace with all panels
- `/demo/layers/page.tsx` — Standalone Phase A layers demo

These are **visual-only** — no real AI, no real data. Use them as the design spec.

## Key Existing Files

| File | LOC | Purpose |
|------|-----|---------|
| `src/types/canvas.ts` | 436 | ScytleNode types, factories, tree utils |
| `src/store/editor-store.ts` | 1083 | Canvas state — nodes, viewport, selection, history, clipboard |
| `src/store/style-guide-store.ts` | 622 | Design tokens (being rewired for new system) |
| `src/store/unified-store.ts` | 2634 | Old wireframe store (deprecated) |
| `src/lib/ai/client.ts` | ~200 | Vertex AI with model fallback chain |
| `src/lib/ai/prompts/` | varies | Existing AI prompts (will be replaced) |
| `src/components/editor/` | ~3000 | Phase A canvas components |
