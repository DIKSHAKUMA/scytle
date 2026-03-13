# AI Generation Pipeline — Research, Findings & Fix Plan

> **Date**: 2026-03-13
> **Branch**: `feat/canvas-node-system`
> **Status**: Research complete, ready to implement

---

## 1. Problems Identified

### Problem 1: Same sections every time (hardcoded landing page pattern)
The system prompt in `page-generation.ts` is hardcoded to:
```
"You are a world-class web designer creating a premium, polished landing page."
```
With only marketing section patterns: hero, features, testimonials, pricing, FAQ, CTA, footer.
No patterns for app screens — dashboards, list views, forms, settings.

### Problem 2: Mobile app toggle is completely disconnected
`productType` is collected in UI state but **never passed** through the pipeline:
- `dashboard/new/page.tsx` — collects but doesn't send to `createProject()`
- `GeneratePageOptions` — has no `productType` field
- `generate-html/route.ts` — has no `productType` in schema
- `page-generation.ts` — has no `productType` parameter
- The AI always receives a 1440px desktop landing page prompt

### Problem 3: Only generates ONE page
Pipeline makes a single API call → single FrameNode. No multi-screen concept.

### Problem 4: Same style, same colors
`style` parameter exists but is never sent. Defaults to blue-600/gray-900 every time.

---

## 2. Competitor Analysis

### FlutterFlow / DreamFlow

**Architecture**: Two-step plan-then-generate approach.

1. **Screen Planner**: AI proposes screens from user prompt. User reviews, adds, removes, reorders screens. Each screen can be refined before generation (features, navigation, structure).
2. **Generation**: Once plan is approved, builds all screens with consistent navigation and theme.

**Key findings:**
- Desktop "Invoice Generator" prompt → **8 screens**: Dashboard, Invoice List, Invoice Editor, Client Management, Client Details, Payment Settings, Business Profile, Reports
- Mobile same prompt → **7 phone-sized screens** with bottom tab bars, mobile list patterns
- Creates **reusable components** (`@stat_card` with typed props: title, value, icon, trend)
- Theme configured DURING planning phase (colors, fonts, spacing, radius) — not after
- The AI **decides** what screens to create based on the prompt — no hardcoded section menu
- Platform toggle (mobile/desktop) fundamentally changes the output layout and sizing

### Vercel v0

**Architecture**: Free-form prompt interpretation with AI-powered prompt enhancement.

- AI may expand a basic prompt into richer spec before generating
- Recommends **incremental complexity** — build one page at a time, not monolithic
- Fixed stack: Next.js + React + Tailwind + shadcn/ui
- Mobile handled via Tailwind responsive classes, not separate generation
- Supports phased workflow: Requirements Gathering → Core Implementation → Iteration
- Models: Auto-routed (undisclosed), likely multi-model
- Prompt queuing: up to 10 queued prompts for sequential execution

### Bolt.new

**Architecture**: Dual-agent system with dedicated Plan Mode.

- **Plan Mode** (Claude Agent): Produces structured build strategies before code
- **Discussion Mode** (v1 Agent): Chat without generating code — clarify requirements first
- 5 model tiers users can select: Haiku 4.5 → Sonnet 4.5 → Sonnet 4.6 → Opus 4.5 → Opus 4.6
- Multi-file/multi-page generation with coordinated front+backend
- Layered persistent instructions: `claude.md` files, project/account/team knowledge
- Mobile via Expo (native mobile apps), not just responsive CSS

### Lovable

**Architecture**: Formal Plan Mode with persistent planning document.

- Plan Mode generates structured plan → saved to `.lovable/plan.md` → persists as context for ALL future AI interactions
- Plans include: components, data models, APIs, step-by-step sequencing, architecture diagrams
- Primary model: Claude Opus 4.6
- Visual Edits: Figma-like visual editor for post-generation tweaks
- LLM load balancer across multiple providers with prompt caching

---

## 3. Key Insight: Let the AI Decide

**The critical lesson from ALL competitors**: None of them hardcode section types or screen lists. They give the AI a well-crafted system prompt and let it **interpret the user's intent** to decide what to generate.

The difference between Scytle and competitors:

| Aspect | Competitors | Scytle (current) |
|--------|------------|------------------|
| Section decision | AI interprets prompt freely | Hardcoded: hero, features, testimonials, pricing, FAQ, CTA, footer |
| Screen count | AI decides based on app complexity | Always 1 |
| Layout type | AI picks: dashboard, list, form, landing, etc. | Always marketing landing page |
| Mobile vs desktop | Fundamentally different output | Identical output (toggle ignored) |
| Style/colors | Varied per project, configurable theme | Same blue/gray every time |

**What we need to do**: Remove all hardcoded section/layout prescriptions from the prompt. Instead, give the AI:
1. The user's description
2. The product type (website vs mobile app)
3. A viewport size
4. The desired style/theme
5. Clear output format rules (HTML + Tailwind syntax requirements)
6. Quality guidelines (spacing, typography scale, visual refinement)

Let the AI decide what screens, sections, and layouts are appropriate for the user's description.

---

## 4. The Fix Plan

### Fix A: Wire `productType` through the pipeline

**Files to change:**
1. `dashboard/new/page.tsx` → pass `productType` and `selectedModel` to `createProject()`
2. `generate-page.ts` → add `productType` to `GeneratePageOptions`, pass to API
3. `generate-html/route.ts` → add `productType` to Zod schema
4. `page-generation.ts` → accept `productType`, use it in prompt

### Fix B: Rewrite the system prompt — let AI interpret freely

**Current prompt** (broken):
- Hardcodes "landing page"
- Lists specific sections to generate
- Hardcodes 1440px desktop
- Prescribes exact layout patterns

**New prompt architecture**:
- Tell the AI WHAT it is (a world-class designer)
- Tell it the OUTPUT FORMAT rules (HTML + Tailwind syntax, no JS, no markdown)
- Tell it the VIEWPORT (1440px for web, 390x844 for mobile app)
- Tell it the QUALITY standards (spacing, typography, visual polish)
- Give it the USER'S PROMPT and let it decide everything else
- NO hardcoded section lists, NO prescribed layouts

For **mobile app** mode:
- Switch viewport to 390x844 (iPhone)
- Instruct to use mobile UI patterns (app bar, bottom tabs, cards, lists)
- Root wrapper becomes phone-sized container
- NO marketing sections, NO full-width heroes

For **website** mode:
- Keep 1440px viewport
- But DON'T prescribe sections — if user says "dashboard", generate a dashboard
- If user says "landing page", generate a landing page
- The AI interprets the intent from the description

### Fix C: Style variety

Inject a random color palette from presets when no style is provided:
```ts
const PALETTES = [
  { primary: '#2563eb', secondary: '#1e40af', accent: '#10b981', bg: '#ffffff', text: '#111827' },
  { primary: '#7c3aed', secondary: '#5b21b6', accent: '#f59e0b', bg: '#faf5ff', text: '#1e1b4b' },
  { primary: '#059669', secondary: '#047857', accent: '#2563eb', bg: '#f0fdf4', text: '#064e3b' },
  { primary: '#dc2626', secondary: '#b91c1c', accent: '#f59e0b', bg: '#fef2f2', text: '#450a0a' },
  { primary: '#0891b2', secondary: '#0e7490', accent: '#8b5cf6', bg: '#ecfeff', text: '#164e63' },
  { primary: '#d97706', secondary: '#b45309', accent: '#059669', bg: '#fffbeb', text: '#451a03' },
  { primary: '#4f46e5', secondary: '#4338ca', accent: '#ec4899', bg: '#eef2ff', text: '#1e1b4b' },
  { primary: '#0f172a', secondary: '#1e293b', accent: '#38bdf8', bg: '#ffffff', text: '#0f172a' },
]
```

### Fix D: Multi-page generation (Phase 2 — not in this PR)

Two-step approach aligned with competitors:
1. **Page Planning**: AI outputs JSON list of screens to generate
2. **Per-Screen Generation**: Generate each screen's HTML individually with shared nav context

This aligns with Phase C6 (Sitemap on Canvas) — the sitemap IS the planning step.

---

## 5. Implementation Details

### New `page-generation.ts` prompt structure

```
SYSTEM PROMPT:
- Role: world-class UI/UX designer
- Output: raw HTML + Tailwind CSS (syntax rules)
- Product type context (web 1440px OR mobile 390x844)
- Quality standards (spacing, typography, visual polish)
- Color palette to use
- NO section prescriptions — AI decides based on user prompt

USER MESSAGE:
- Project description (the user's actual prompt)
- Page name
- Industry context (if any)
```

The AI should:
- Read the user's description
- Understand whether they want a dashboard, landing page, e-commerce, blog, admin panel, etc.
- Design the appropriate layout with appropriate sections
- For mobile: use app-specific patterns (tab bars, cards, lists, forms)
- For web: use web-appropriate patterns (sidebar nav for dashboards, hero+sections for landing pages)

### Viewport handling

```ts
const VIEWPORT = productType === 'app'
  ? { width: 390, height: 844, name: 'iPhone 15' }
  : { width: 1440, height: 900, name: 'Desktop' }
```

For mobile: root div gets `w-[390px] min-h-[844px]` instead of `w-full`

---

## 6. Screenshots Reference

| Screenshot | Description |
|-----------|-------------|
| `scytle-website-dashboard-result.png` | Scytle: dashboard prompt → marketing landing page |
| `scytle-mobile-app-result.png` | Scytle: mobile app prompt → same 1440px marketing page |
| `ff-desktop-invoice.png` | FlutterFlow: 8 proper desktop app screens |
| `ff-mobile-invoice.png` | FlutterFlow: 7 phone-sized mobile screens |
| `ff-taskflow-landing.png` | FlutterFlow: proper landing page with reusable components |
