# Scytle — Phase C Implementation Plan

> **Created**: March 2026
> **Status**: Approved build order, Phase 1 starting
> **Prerequisite**: Phase A (Canvas Engine) ✅ Complete, Phase B (Architecture Pivot) ✅ Decided

---

## ⚠️ Important Note on Reference Documents

Each phase has a detailed spec document (listed below). These are **reference material** — they contain UI specs, data models, API contracts, and file structures written during the planning stage.

**Before building each phase, we will:**
1. Re-read the reference doc
2. Evaluate what still applies vs. what needs adjustment based on learnings from prior phases
3. Plan the actual implementation (subtasks, file changes, edge cases)
4. Build and test incrementally

The reference docs are a starting point, not a rigid contract. Real decisions happen at build time.

### Reference Documents

| Phase | Reference Doc | LOC Est. |
|-------|--------------|----------|
| C4 — Workspace Layout | [`PHASE-C4-WORKSPACE-LAYOUT.md`](./PHASE-C4-WORKSPACE-LAYOUT.md) | ~800 |
| C3 — New Project Page | [`PHASE-C3-NEW-PROJECT.md`](./PHASE-C3-NEW-PROJECT.md) | ~300 |
| C1 — HTML Parser | [`PHASE-C1-HTML-PARSER.md`](./PHASE-C1-HTML-PARSER.md) | ~500 |
| C2 — AI Generation | [`PHASE-C2-AI-GENERATION.md`](./PHASE-C2-AI-GENERATION.md) | ~600 |
| C8 — Export | [`PHASE-C8-EXPORT.md`](./PHASE-C8-EXPORT.md) | ~400 |
| C5 — Chat Integration | [`PHASE-C5-CHAT-INTEGRATION.md`](./PHASE-C5-CHAT-INTEGRATION.md) | ~500 |
| C6 — Sitemap on Canvas | [`PHASE-C6-SITEMAP-CANVAS.md`](./PHASE-C6-SITEMAP-CANVAS.md) | ~400 |
| C7 — Theme System | [`PHASE-C7-THEME-SYSTEM.md`](./PHASE-C7-THEME-SYSTEM.md) | ~400 |

Background context: [`PHASE-A-CANVAS-ENGINE.md`](./PHASE-A-CANVAS-ENGINE.md) (completed), [`PHASE-B-ARCHITECTURE-PIVOT.md`](./PHASE-B-ARCHITECTURE-PIVOT.md) (decision record), [`README.md`](./README.md) (master index)

---

## Build Order Overview

```
PHASE 1 — Shell & Entry (UI only, zero risk)
│
├── Step 1.  C4  Workspace Layout
├── Step 2.  C3  New Project Page
│
PHASE 2 — Core Pipeline (prove the product works)
│
├── Step 3.  C1  HTML → ScytleNode Parser
├── Step 4.  C2  AI Page Generation
├── Step 5.  C8  ScytleNode → HTML Export
│
PHASE 3 — Iteration Loop (make it interactive)
│
├── Step 6.  C5  Chat + AI Iteration
│
PHASE 4 — Planning & Polish (enhance the experience)
│
├── Step 7.  C6  Sitemap on Canvas
├── Step 8.  C7  Theme System
```

### Why This Order

**Phase 1 first (shell):** Pure UI with no unknowns. Building the workspace and project page gives us the real product shell to test everything inside. No throwaway test harnesses — every subsequent feature plugs directly into the real workspace.

**Phase 2 second (core pipeline):** This is where the biggest risk lives — "does AI → Parser → Canvas actually produce something that looks like a real design?" We prove this inside the real workspace. If it doesn't work, we've only built ~1,500 LOC of pipeline code on top of a shell we need anyway.

**Phase 3 third (chat iteration):** Once generation works, wire up the conversational refinement loop. This is what makes the product magical — and it relies on all three pipeline pieces (C1 + C2 + C8) already working.

**Phase 4 last (sitemap + theme):** These enhance the product but aren't required for the core loop to function. Sitemap is a planning feature. Theme is a polish feature. Both can wait.

---

## Phase 1 — Shell & Entry Point

> Goal: A polished, navigable product shell. Canvas works (Phase A). Panels exist with smart placeholders. Users can create projects and land in the workspace.

---

### Step 1: C4 — Workspace Layout

> **Reference**: [`PHASE-C4-WORKSPACE-LAYOUT.md`](./PHASE-C4-WORKSPACE-LAYOUT.md)
> **Demo spec**: `src/app/demo/flow/workspace/page.tsx` (950 LOC)
> **Target**: Rewrite `src/app/project/[id]/page.tsx`

#### What We're Building

Replace the old 4-tab project page with a Figma-style workspace:

```
┌──────────────────────────────────────────────────────────────┐
│ ← │ ProjectName 🏷Web │  [V][H][F][T] │ [↶][↷] │    Export │
├────────┬───────────────────────────────────────────┬─────────┤
│        │                                           │         │
│  Left  │              CANVAS                       │  Right  │
│  Panel │         (Phase A engine)                  │  Panel  │
│  w-72  │                                           │  w-64   │
│        │                                           │         │
│ Files  │                                           │ Design  │
│  Chat  │                                           │  Theme  │
│        │                                           │         │
│        │                     🔍 100% 🔍             │         │
├────────┴───────────────────────────────────────────┴─────────┘
```

#### Key Deliverables

- **Top bar**: Back button, project name + product type badge, tool buttons (V/H/F/T), undo/redo, Export button
- **Left panel** (w-72): Tab switcher (Files | Chat)
  - **Files tab**: Pages list (hardcoded placeholder), Layers tree (reuse Phase A `LayersPanel`)
  - **Chat tab**: Message list UI + disabled input (placeholder — wired in Phase 3)
- **Center canvas**: `EditorCanvas` from Phase A — already fully functional
- **Right panel** (w-64): Tab switcher (Design | Theme)
  - **Design tab**: Wrap Phase A `PropertiesPanel` — already functional
  - **Theme tab**: Visual preset swatches + color/font/style controls (non-functional placeholder — wired in Phase 4)
- **Zoom controls**: Floating bottom-center overlay (zoom in/out/percentage)
- **Panel collapse**: Both panels collapsible

#### New Files (planned — finalize at build time)

```
src/app/project/[id]/page.tsx         ← REWRITE
src/components/workspace/
  index.ts
  top-bar.tsx
  left-panel.tsx
  right-panel.tsx
  files-tab.tsx
  chat-tab.tsx              ← placeholder UI
  design-tab.tsx            ← wraps Phase A PropertiesPanel
  theme-tab.tsx             ← placeholder UI
  zoom-controls.tsx
  page-list.tsx             ← placeholder page entries
```

#### What Gets Reused from Phase A

| Phase A Component | Reused In |
|-------------------|-----------|
| `EditorCanvas` | Center canvas |
| `LayersPanel` | Files tab → Layers section |
| `PropertiesPanel` | Design tab |
| `Toolbar` logic | Top bar tool buttons |
| `useEditorStore` | Everything |
| All editor hooks | Canvas interaction |

#### Placeholder Strategy

Panels that aren't functional yet should still look complete:

| Panel | Placeholder Behavior |
|-------|---------------------|
| **Files → Pages** | Show hardcoded list: "Home ✨", "About 📝", "Pricing 📝". Non-interactive. |
| **Chat** | Show a system message: "AI chat will be available once generation is set up." Disabled input. |
| **Theme** | Show preset swatches, color rows, font dropdowns, style toggles — all rendered but "Apply" does nothing. |
| **Export button** | Visible but disabled with tooltip "Export available after page generation." |

---

### Step 2: C3 — New Project Page

> **Reference**: [`PHASE-C3-NEW-PROJECT.md`](./PHASE-C3-NEW-PROJECT.md)
> **Demo spec**: `src/app/demo/flow/new-project/page.tsx` (250 LOC)
> **Target**: Rewrite `src/app/dashboard/new/page.tsx`

#### What We're Building

An enhanced "What do you want to build?" page replacing the current simple form.

#### Key Deliverables

- **Product type toggle**: Website (Globe) | App (Smartphone) — pill-style switcher
- **Main textarea**: Large, auto-resizing, dynamic placeholder per product type
- **Bottom toolbar** (inside textarea): Attach button, Sitemap toggle, Generate button
- **Suggestion chips**: 3 per product type (SaaS Landing, Portfolio, E-commerce / Dashboard App, Social App, CRM)
- **Active options indicator**: "Type: Website · Sitemap: On"
- **On Generate**: Create project in Appwrite → redirect to `/project/[id]`

#### What's Real vs. Placeholder

| Feature | Phase 1 Behavior |
|---------|-----------------|
| Project creation | Real — calls Appwrite, creates project with productType field |
| Redirect to workspace | Real — `router.push(/project/[id])` |
| Sitemap toggle | Stores the preference but doesn't generate sitemap yet (Phase 4) |
| Attachments | UI present, file upload functional, but files aren't sent to AI yet |
| AI generation | Does NOT trigger AI on submit — workspace loads empty. Generation wires up in Phase 2 |

#### Schema Change

Add `productType` field to Project:

```typescript
// src/types/index.ts — update ProjectSchema
productType: z.enum(['web', 'app']).default('web')
```

---

### Phase 1 Milestone Checkpoint

After Phase 1, the product should feel like this:

- ✅ Dashboard shows projects, "New Project" button works
- ✅ New project page looks polished, creates real projects in Appwrite
- ✅ Workspace loads with the Figma-style layout (panels, canvas, toolbar)
- ✅ Canvas works fully (draw frames, add text, drag, resize, undo/redo, layers)
- ✅ Properties panel shows props of selected node
- ✅ Chat, Theme, Export, Pages — all visually present but not functional yet
- ❌ No AI generation, no parsing, no export, no chat, no sitemap, no theme application

---

## Phase 2 — Core Pipeline

> Goal: Type a prompt → AI generates HTML → parser converts → nodes appear on canvas. Prove the product works.

---

### Step 3: C1 — HTML → ScytleNode Parser

> **Reference**: [`PHASE-C1-HTML-PARSER.md`](./PHASE-C1-HTML-PARSER.md)
> **Dependencies**: Phase A types (`src/types/canvas.ts`)

#### What We're Building

A pure function: `parseHtmlToNodes(html: string): ScytleNode[]`

Takes raw HTML+Tailwind (from AI or hand-written) and produces a tree of FrameNode / TextNode / ImageNode that the canvas can render.

#### Key Challenges (from reference doc)

1. **Element → Node mapping**: `<div>`, `<section>`, `<nav>` → FrameNode. `<h1>`–`<p>` → TextNode. `<img>` → ImageNode. `<button>` → FrameNode + TextNode child.
2. **Tailwind class parsing**: `flex flex-col gap-4` → layout properties. `text-4xl font-bold text-gray-900` → typography. `bg-blue-500 rounded-xl p-8` → fills, radius, padding.
3. **Color mapping**: Full Tailwind palette (~220 colors) → hex values.
4. **Size estimation**: HTML flows, canvas uses absolute positioning. Pages get 1440px width. Heights estimated from content.
5. **Edge cases**: Inline `<span>` inside `<p>`, SVGs, empty divs, `<button>` decomposition, arbitrary Tailwind values (`p-[40px]`).

#### Planned Files

```
src/lib/parser/
  index.ts              ← barrel: export { parseHtmlToNodes }
  html-to-nodes.ts      ← main recursive DOM walker
  class-parser.ts       ← Tailwind class → property extraction
  color-map.ts          ← Tailwind color name → hex lookup
  size-utils.ts         ← dimension estimation
```

#### Testing Strategy

Test with **hand-crafted HTML first** (not AI output). Write 5–10 representative HTML snippets:
- Simple hero section (flex column, heading, paragraph, button)
- Nav bar (flex row, logo, links, CTA)
- Card grid (grid-cols-3, cards with image + text)
- Dashboard layout (sidebar + main content)
- Nested layouts (flex inside flex inside grid)

Render each on the Phase A canvas inside the workspace. Visually inspect. Iterate until they look right.

---

### Step 4: C2 — AI Page Generation

> **Reference**: [`PHASE-C2-AI-GENERATION.md`](./PHASE-C2-AI-GENERATION.md)
> **Dependencies**: C1 (parser), existing AI client (`src/lib/ai/client.ts`)

#### What We're Building

`POST /api/ai/generate-page` — an API route that takes a prompt + context and streams back HTML+Tailwind via SSE.

#### Key Deliverables

- **API route**: JWT-authenticated, Zod-validated, SSE streaming response
- **System prompt builder**: Instructs Gemini to output pure HTML+Tailwind, desktop-first (1440px), semantic elements, realistic copy, Tailwind arbitrary values for custom colors
- **Edit prompt builder**: Takes existing HTML + edit instruction, returns modified HTML (used by C5 later)
- **Client integration**: Collect SSE stream → pass to `parseHtmlToNodes()` → create page FrameNode on canvas
- **Model selection**: 2.5-flash for initial generation, 2.0-flash for edits (via existing fallback chain)

#### Planned Files

```
src/app/api/ai/generate-page/
  route.ts                   ← POST handler (rewrite existing)

src/lib/ai/prompts/
  page-generation.ts         ← system prompt builder
  page-edit.ts               ← edit/iteration prompt builder
```

#### The Quality Test

After C2 is built, run this experiment:
1. Generate 10 different pages (landing pages, dashboards, pricing, blog, app screens)
2. Feed each through the C1 parser
3. Render on canvas
4. **Visually evaluate**: Does it look like a real design at 70%+ quality?

If yes → proceed. If no → iterate on system prompts and parser before moving forward.

---

### Step 5: C8 — ScytleNode → HTML Export

> **Reference**: [`PHASE-C8-EXPORT.md`](./PHASE-C8-EXPORT.md)
> **Dependencies**: Phase A types, C1 (this is the reverse)

#### What We're Building

The reverse of C1: `exportNodesToHtml(nodes: ScytleNode[]): string`

Converts canvas nodes back into clean HTML+Tailwind. Serves two purposes:
1. **User export**: Download production-ready HTML
2. **AI iteration**: Feed current page state back to AI for chat edits (C5 dependency)

#### Key Deliverables

- **Node → HTML conversion**: FrameNode → `<div>`/`<section>`/`<nav>` with Tailwind classes. TextNode → `<h1>`/`<p>`/`<span>`. ImageNode → `<img>`.
- **Property → Tailwind mapping**: Reverse of C1's class parser. px values → Tailwind spacing scale, hex colors → Tailwind names (where possible) or arbitrary values.
- **Internal export mode**: Raw body HTML for AI (no doctype/head wrapping)
- **Full export mode**: Complete HTML document with Tailwind CDN script

#### Planned Files

```
src/lib/export/
  index.ts                ← barrel export
  nodes-to-html.ts        ← recursive node → HTML converter
  class-builder.ts        ← ScytleNode properties → Tailwind classes
  reverse-color-map.ts    ← hex → Tailwind color name
  html-template.ts        ← full document wrapper
```

#### Round-Trip Validation

Test: `parse(export(parse(handwrittenHtml)))` — the output should be functionally equivalent to the input. Same visual result, maybe slightly different class ordering.

---

### Phase 2 Milestone Checkpoint

After Phase 2, the product should feel like this:

- ✅ Everything from Phase 1
- ✅ AI generates full page HTML from a prompt
- ✅ Parser converts HTML into ScytleNodes on the canvas
- ✅ Generated pages look like real website/app designs
- ✅ Export converts canvas nodes back to clean HTML
- ✅ Round-trip works: AI → parse → canvas → export → HTML
- ❌ No chat iteration yet (can't say "make it darker")
- ❌ No sitemap integration, no theme switching, no multi-page

---

## Phase 3 — Iteration Loop

> Goal: Users can refine AI-generated designs conversationally. "Make the hero bigger" → canvas updates.

---

### Step 6: C5 — Chat + AI Iteration

> **Reference**: [`PHASE-C5-CHAT-INTEGRATION.md`](./PHASE-C5-CHAT-INTEGRATION.md)
> **Demo spec**: `src/app/demo/flow/workspace/page.tsx` → Chat tab
> **Dependencies**: C1 (parser), C2 (AI generation), C4 (workspace — chat tab placeholder), C8 (export)
> **Existing code**: `src/store/chat-store.ts` (335 LOC), `src/app/api/chat/route.ts` (190 LOC)

#### What We're Building

Wire up the chat panel placeholder (from Phase 1) into a functional AI conversation that modifies designs.

#### The Flow

```
User types "make the hero bigger and add a gradient"
    ↓
Export current page nodes → HTML (C8)
    ↓
Send to AI: existing HTML + edit instruction (C2, edit mode)
    ↓
AI streams modified HTML back (SSE)
    ↓
Parse new HTML → ScytleNodes (C1)
    ↓
Replace page frame children on canvas
    ↓
AI summary message appears in chat
```

#### Key Deliverables

- **Chat messages UI**: User messages (right-aligned dark), AI messages (left with avatar), system messages (centered)
- **Context indicator**: Pill showing which page the AI targets ("Context: Dashboard ▼")
- **Input area**: Auto-resize textarea + attach button + send button
- **Quick actions**: Preset buttons (Redesign, Edit copy, Add section, Simplify)
- **Chat store updates**: Add `contextPage` field, rewire `sendMessage` for new edit flow
- **Streaming UX**: Typing indicator in chat + shimmer overlay on canvas during generation

#### Planned Files

```
src/components/workspace/
  chat-tab.tsx             ← UPDATE: wire to real AI
  chat-message.tsx         ← message bubble component
  chat-input.tsx           ← input with send/attach
  context-indicator.tsx    ← page context pill
  quick-actions.tsx        ← preset action chips

src/store/
  chat-store.ts            ← UPDATE: add contextPage, new edit flow
```

---

### Phase 3 Milestone Checkpoint

After Phase 3, the core product loop is complete:

- ✅ Create project → describe idea → AI generates design on canvas
- ✅ Chat: "change the colors", "add a testimonials section" → canvas updates
- ✅ Full conversational design iteration working
- ✅ Each edit creates an undo snapshot (can Cmd+Z to revert)
- ❌ No visual sitemap (pages created manually or from prompt)
- ❌ No theme presets (style changes done through chat or properties panel)

**This is a demoable, testable product at this point.**

---

## Phase 4 — Planning & Polish

> Goal: Sitemap for multi-page project planning. Theme system for one-click style changes.

---

### Step 7: C6 — Sitemap on Canvas

> **Reference**: [`PHASE-C6-SITEMAP-CANVAS.md`](./PHASE-C6-SITEMAP-CANVAS.md)
> **Dependencies**: C2 (AI generation), C4 (workspace)
> **Existing code**: `src/store/sitemap-store.ts` (1042 LOC), `src/app/api/ai/generate-sitemap/route.ts` (406 LOC)

#### What We're Building

Show AI-generated sitemap as card nodes on the canvas. Double-click → generate page. "Generate All Pages" for batch generation.

#### Key Deliverables

- **Sitemap cards**: Small positioned cards (120px wide) with icon + name + status badge
- **Status styles**: Planned (dashed border), Generating (pulse), Designed (solid accent)
- **Connection lines**: SVG dashed lines between parent-child nodes
- **Interactions**: Click → select, Double-click → generate, Drag → reposition
- **Auto-layout**: Tree layout algorithm for initial card positioning
- **"Generate All Pages"** button in Files tab → sequential batch generation
- **Design frame placement**: Generated pages placed to the right of sitemap cluster

#### Wire to New Project Flow

Update C3's Generate button: if sitemap toggle is ON → call `/api/ai/generate-sitemap` → render cards on canvas when workspace loads.

---

### Step 8: C7 — Theme System

> **Reference**: [`PHASE-C7-THEME-SYSTEM.md`](./PHASE-C7-THEME-SYSTEM.md)
> **Dependencies**: C1 (nodes on canvas), C4 (right panel theme tab)
> **Existing code**: `src/store/style-guide-store.ts` (622 LOC — will be replaced)

#### What We're Building

Wire up the theme tab placeholder (from Phase 1) into a functional theme system that directly mutates ScytleNode properties.

#### Key Deliverables

- **6 preset themes**: Default, Ocean, Forest, Sunset, Rose, Dark
- **Editable tokens**: Primary, Background, Text, Accent, Muted, Border colors
- **Typography**: Heading font, Body font, Scale multiplier
- **Style controls**: Border radius, Button style, Card style
- **Apply algorithm**: Walk all ScytleNodes, classify colors by luminance, swap with theme tokens, update fonts/radius
- **Heuristics**: `isButtonNode()`, `isCardNode()`, `classifyColor()` for smart property mapping

#### Planned Files

```
src/store/
  theme-store.ts           ← NEW: replaces style-guide-store

src/lib/theme/
  apply-theme.ts           ← tree-walking mutation algorithm
  color-utils.ts           ← luminance, saturation, classification
  presets.ts               ← default theme configs
```

---

### Phase 4 Milestone Checkpoint

After Phase 4, the product is feature-complete for v1:

- ✅ Create project → describe idea → optional sitemap generation
- ✅ Sitemap cards on canvas → double-click to generate any page
- ✅ AI generates unique designs → edit on canvas → chat to refine
- ✅ One-click theme switching across all pages
- ✅ Export to HTML+Tailwind
- ✅ Full undo/redo, clipboard, keyboard shortcuts

---

## Dependency Graph

```
Phase A (Canvas Engine) ✅
    │
    ├──→ C4 (Workspace Layout) ──→ C3 (New Project) ─┐
    │                                                  │
    ├──→ C1 (Parser) ──→ C2 (AI Generation) ──────────┤
    │         │                    │                    │
    │         └──→ C8 (Export) ────┘                    │
    │                   │                               │
    │                   └──→ C5 (Chat Iteration) ───────┤
    │                                                   │
    │         C6 (Sitemap) ← needs C2 ─────────────────┤
    │         C7 (Theme) ← needs C1, C4 ──────────────┘
```

---

## Key Risks & Mitigations

| Risk | When It Hits | Mitigation |
|------|-------------|------------|
| AI HTML quality is poor | Phase 2, Step 4 | Test with 10+ prompts. Iterate system prompt. Try multiple Gemini models. |
| Parser can't handle AI output edge cases | Phase 2, Step 3–4 | Build parser with hand-crafted HTML first. Add edge case handling as real AI output reveals them. |
| Size estimation produces bad layouts | Phase 2, Step 3 | Start with fixed 1440px width, flex for rows. Iterate height estimation. |
| Round-trip loses fidelity | Phase 2, Step 5 | Accept minor differences (class ordering, arbitrary values). Focus on visual equivalence, not string equality. |
| Chat edits produce inconsistent results | Phase 3, Step 6 | Feed AI the FULL page HTML, not diffs. Always output complete modified page. |
| Theme application makes designs look worse | Phase 4, Step 8 | Color classification heuristics need tuning. Apply as single undo snapshot so users can revert. |

---

## Estimated Timeline Shape

Not calendar estimates — relative sizing:

| Phase | Size | Character |
|-------|------|-----------|
| Phase 1 (Shell) | Small | Straightforward UI, demo spec exists, low unknowns |
| Phase 2 (Pipeline) | Medium | Parser is algorithmic work, AI needs prompt iteration, some unknowns |
| Phase 3 (Chat) | Small-Medium | Mostly wiring existing pieces together |
| Phase 4 (Polish) | Medium | Sitemap is modestly complex, theme heuristics need tuning |

**Total new code**: ~4,000 LOC across all 8 steps.

---

## What Gets Deprecated After

Once the new system is stable and validated, the following old code can be removed (~40K LOC):

| Code | LOC | Replaced By |
|------|-----|-------------|
| `src/lib/designs/` (all V2 templates) | ~16,000 | AI generation |
| `src/components/wireframe/` (all) | ~12,000 | Workspace + canvas |
| `src/store/unified-store.ts` | 2,634 | Editor store + sitemap |
| `src/store/canvas-store.ts` | 303 | Editor store |
| `src/store/selection-store.ts` | 250 | Editor store selection |
| `src/lib/designs/v2/selection/` | 1,168 | Editor selection overlay |
| Old project page (4-tab system) | ~231 | New workspace (C4) |

**Do not delete until the new system is verified working in production.**
