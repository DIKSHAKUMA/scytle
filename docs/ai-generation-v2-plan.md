# AI Generation v2 — Complete Plan

> **Status**: Planning
> **Date**: April 2026
> **Goal**: Transform AI design generation from basic/repetitive output to production-quality, diverse, theme-accurate designs with 5x faster generation.

---

## Table of Contents

1. [Current Problems](#current-problems)
2. [Competitor Research](#competitor-research)
3. [Architecture Overview](#architecture-overview)
4. [Phase 1: Architecture Consolidation](#phase-1-architecture-consolidation)
5. [Phase 2: Prompt System](#phase-2-prompt-system)
6. [Phase 3: Pipeline — Parallel Section Generation](#phase-3-pipeline--parallel-section-generation)
7. [Phase 4: Unsplash API Integration](#phase-4-unsplash-api-integration)
8. [Phase 5: CIELAB Theme Linker](#phase-5-cielab-theme-linker)
9. [Phase 6: Claude Model Support](#phase-6-claude-model-support)
10. [Phase 7: HTML Autofix Pass](#phase-7-html-autofix-pass)
11. [Performance Targets](#performance-targets)
12. [Implementation Order](#implementation-order)

---

## Current Problems

### 1. Same Design Every Time
- **10 hardcoded color palettes** in the generation prompt — AI picks from a tiny pool
- **~15 hardcoded Unsplash photo IDs** — same images on every project
- **Single 270-line monolithic prompt** with one personality — no layout variety
- **No layout archetypes** — AI defaults to the same hero → features → testimonials → CTA pattern
- **No few-shot examples** — AI has no reference for what "good" looks like

### 2. Theme Not Applied Correctly
- Two competing color-linking systems: exact hex match in parser + semantic matching in `relink-nodes.ts`
- AI generates slightly different hex values (e.g., `#6366f1` vs `#6365f0`) that fail exact-match
- No perceptual color distance — even 1 bit difference = miss
- Font linking is heuristic-based, can miss when AI uses different font names

### 3. Slow Generation (2-4 minutes for a project)
- **Sequential page generation** — pages generated one at a time
- **Iframe recreated per page** — Tailwind CDN + Google Fonts = ~5s overhead each time
- **Thinking mode always on** with 4096 token budget — adds latency even for simple sections
- **No parallelism** at any level

### 4. Scattered Architecture
- 28 files across 5 subsystems (`lib/ai/`, `lib/parser/`, `lib/theme/`, `store/`, `app/api/ai/`)
- Model config split across 4 files (`config.ts`, `models.ts`, `client.ts`, `generate-page.ts`)
- Dead routes still in codebase (`generate-page`, `generate-sitemap`, `suggest-section`, etc.)
- `generate-page.ts` (404 LOC client orchestrator) mixes concerns: prompt building, streaming, font extraction, theme context

---

## Competitor Research

### v0 by Vercel
- **Composite Model Family**: Base model + Quick Edit + AutoFix running in parallel during streaming
- **93.87% error-free rate** with autofix pass
- **Shadcn/ui component library** baked into prompts — AI generates component imports, not raw HTML
- **Iterative refinement**: each edit sees the full prior artifact + diff
- **Key insight**: Autofix as a separate fast pass catches 80% of rendering issues

### Claude Artifacts
- **XML-tagged system prompt** using `<antArtifact>` blocks with strict type/language metadata
- **`<antThinking>`** for chain-of-thought reasoning before generation
- **Constrained Tailwind**: no arbitrary values (`text-[#ff0000]` forbidden), standard classes only
- **Key insight**: Constraining the output space (no arbitrary values) dramatically reduces rendering bugs

### Google Stitch
- **`DESIGN.md`** file for design system rules — loaded into context automatically
- **`creativeRange`** parameter: `"REFINE"` / `"EXPLORE"` / `"REIMAGINE"` controls how much AI deviates
- **Variant system**: generates 2-4 variants per request with aspect ratio control
- **Key insight**: Giving the AI explicit creative latitude parameters prevents both "too boring" and "too wild"

### Bolt.new / Lovable
- **Full-app generation** with file system, not just HTML snippets
- **WebContainer runtime** for live preview during generation
- **Key insight**: Live preview during streaming catches layout breaks immediately

### Relume (old wireframe approach we abandoned)
- Section-template library with ~200 pre-built patterns
- AI selects and populates templates rather than generating from scratch
- **Key insight**: Template selection + content generation is faster/more reliable than freeform generation, but limits creativity

### Academic Research

#### LaTCoder (2024)
- **Layout-first decomposition** beats 1-shot generation significantly
- Generate layout skeleton first → fill sections → assemble
- **Key insight**: Decomposition is the single biggest quality lever

#### ComUICoder (2024)
- **Semantic-aware block segmentation** + graph-based merge for reusable components
- Identifies repeated patterns across pages and extracts shared components
- **Key insight**: Cross-page component reuse improves consistency

---

## Architecture Overview

### Current Pipeline (3 phases)
```
Plan Pages (JSON) → Generate HTML (SSE streaming) → Parse to ScytleNodes (iframe DOM walking)
```

### New Pipeline (7 stages)
```
Plan Pages → Select Layout Archetypes → Search Images → Generate Sections (parallel)
→ Assemble Full Page → Autofix HTML → Parse + CIELAB Theme Link
```

### New File Structure

```
src/lib/ai/
├── index.ts                    # Barrel export
├── client.ts                   # Multi-provider client (Gemini + Claude)
├── config.ts                   # Unified config (models, temperatures, token limits)
├── unsplash.ts                 # Unsplash API client
├── autofix.ts                  # HTML autofix pass (strip forbidden classes, fix Tailwind)
├── prompts/
│   ├── system.ts               # Shared rules (all prompts inherit)
│   ├── layouts.ts              # 12 layout archetypes with mini HTML examples
│   ├── section.ts              # Per-section-type prompt (hero, features, pricing, etc.)
│   ├── planner.ts              # Enhanced page planner (layout archetype selection)
│   ├── chat.ts                 # Chat/refinement prompt (replaces chat-design.ts)
│   └── examples/               # Few-shot HTML examples (2-3 per section type)
│       ├── hero.html
│       ├── features.html
│       ├── pricing.html
│       └── ...
└── pipeline/
    ├── generate-project.ts     # Orchestrator: plan → parallel pages
    ├── generate-page.ts        # Single page: parallel sections → assemble
    └── generate-section.ts     # Single section: prompt → stream → collect
```

### Files to Delete (Dead Code)
- `src/app/api/ai/generate-page/route.ts` — old section-based generator, never called
- `src/app/api/ai/generate-sitemap/route.ts` — not used in current flow
- `src/app/api/ai/suggest-section/route.ts` — wireframe-only
- `src/app/api/ai/generate-copy/route.ts` — wireframe-only
- `src/app/api/ai/rewrite-text/route.ts` — wireframe-only
- `src/app/api/test-generate/route.ts` — test page only
- `src/lib/ai/prompts/wireframe-generation.ts` — dead
- `src/lib/ai/section-templates.ts` — dead
- `src/lib/ai/preset-catalog.ts` — dead

---

## Phase 1: Architecture Consolidation

### 1.1 Delete Dead Code
Remove all files listed in "Files to Delete" above, plus the dead wireframe system files already identified in the cleanup plan.

### 1.2 Merge Model Config
Currently model config is split across:
- `src/lib/ai/models.ts` — model registry
- `src/lib/ai/config.ts` — generation settings, system prompts
- `src/lib/ai/client.ts` — provider initialization
- `src/lib/generate-page.ts` — `MODEL_KEY_MAP` mapping

**Consolidate into `src/lib/ai/config.ts`**:
```ts
export const AI_MODELS = {
  'gemini-pro': {
    provider: 'google',
    modelId: 'gemini-3.1-pro-preview',
    location: 'global',
    maxTokens: 65536,
    defaultTemp: 0.9,
    thinkingBudget: 4096,
  },
  'gemini-flash': {
    provider: 'google',
    modelId: 'gemini-3.1-flash-lite-preview',
    location: 'global',
    maxTokens: 8192,
    defaultTemp: 1.0,
    thinkingBudget: 0, // no thinking for flash
  },
  'claude-sonnet': {
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    maxTokens: 16384,
    defaultTemp: 0.8,
  },
} as const
```

### 1.3 Multi-Provider Client
Extend `client.ts` to support both Gemini and Claude:
```ts
export async function generate(prompt: string, opts: GenerateOpts): Promise<string>
export async function generateStream(prompt: string, opts: GenerateOpts): AsyncIterable<string>
```

The function reads `opts.model` → looks up provider in config → dispatches to the right SDK.

### 1.4 Move Client Orchestration to `pipeline/`
Extract the orchestration logic from `src/lib/generate-page.ts` into `src/lib/ai/pipeline/`:
- `generate-project.ts` — multi-page orchestrator
- `generate-page.ts` — single-page with parallel sections
- `generate-section.ts` — single-section generation

The old `src/lib/generate-page.ts` becomes a thin wrapper that calls the new pipeline.

---

## Phase 2: Prompt System

### 2.1 Shared System Rules (`prompts/system.ts`)

Every generation call prepends these rules:

```
OUTPUT RULES:
- Return ONLY raw HTML. No markdown fences, no explanations.
- Use Tailwind CSS utility classes exclusively. No <style> blocks, no inline styles.
- NO arbitrary Tailwind values (no text-[#hex], no w-[123px]). Standard classes only.
- All images: <img src="UNSPLASH_URL" alt="descriptive alt" class="...">
- No position:fixed/sticky. No margin on root. No max-w-* on root.
- All text must be realistic placeholder content, never "Lorem ipsum".
- Use semantic HTML: <section>, <header>, <nav>, <article>, <footer>.

TYPOGRAPHY HIERARCHY:
- h1: text-4xl to text-6xl, font-bold, tracking-tight
- h2: text-3xl to text-4xl, font-semibold
- h3: text-xl to text-2xl, font-semibold
- body: text-base to text-lg, text-gray-600 (light) or text-gray-300 (dark)
- small: text-sm, text-gray-500

ANTI-SLOP RULES:
- Never use "Unlock", "Elevate", "Supercharge", "Revolutionize" in headlines.
- Never use "Trusted by 10,000+ companies" — use specific, believable numbers.
- Never start with "Welcome to [Product Name]" — start with the value proposition.
- Vary button text: not every CTA should say "Get Started".
```

### 2.2 Layout Archetypes (`prompts/layouts.ts`)

12 named layout patterns the planner can choose from:

| Archetype | Description | Key CSS Pattern |
|-----------|-------------|-----------------|
| `split-hero` | Image left, text right (or reversed) | `grid grid-cols-2` |
| `centered-hero` | Full-width centered text + background image | `text-center bg-cover` |
| `bento-grid` | Mixed-size cards in a grid | `grid grid-cols-3 grid-rows-2` with col/row spans |
| `editorial` | Magazine-style with large hero image + text overlay | `relative` with text overlay |
| `card-mosaic` | Uniform cards in a responsive grid | `grid grid-cols-1 md:grid-cols-3 gap-6` |
| `zigzag` | Alternating image/text sections | Alternating `flex-row` / `flex-row-reverse` |
| `sidebar-feature` | Sticky sidebar with scrolling content | `grid grid-cols-[300px_1fr]` |
| `full-bleed` | Edge-to-edge sections with no container | No `container` class, `w-full` |
| `stacked-cards` | Vertically stacked wide cards | `space-y-8` with full-width cards |
| `dashboard` | App UI with sidebar, header, content area | `grid grid-cols-[250px_1fr] grid-rows-[64px_1fr]` |
| `asymmetric` | Unequal columns with visual weight | `grid grid-cols-[2fr_1fr]` |
| `magazine` | Multi-column text layout with pull quotes | `columns-2 md:columns-3` |

Each archetype includes a **mini HTML example** (30-50 lines) showing the skeleton with Tailwind classes. These are injected into the section prompt as few-shot context.

### 2.3 Per-Section Prompts (`prompts/section.ts`)

Instead of one monolithic prompt, each section type gets a focused prompt:

```ts
export function getSectionPrompt(type: SectionType, context: SectionContext): string
```

Where `SectionContext` includes:
- `layoutArchetype` — which layout pattern to follow
- `theme` — color variables, fonts, brand name
- `pageContext` — what page this section is on (home, pricing, about, etc.)
- `images` — pre-searched Unsplash URLs for this section
- `adjacentSections` — what comes before/after (for visual flow)
- `fewShotExample` — HTML example for this section type

Example section prompt for `hero`:
```
You are generating a HERO section for a {pageContext} page.

LAYOUT: {layoutArchetype} pattern
THEME: Primary={primary}, Accent={accent}, Font={headingFont}/{bodyFont}
BRAND: {brandName} — {brandDescription}

IMAGES (use these exact URLs):
- Hero background: {images[0].url} ({images[0].alt})
- Secondary: {images[1].url} ({images[1].alt})

ADJACENT CONTEXT:
- Next section: {nextSection.type} — ensure visual transition

{fewShotExample}

Generate the hero section HTML following the layout pattern above.
```

### 2.4 Enhanced Planner (`prompts/planner.ts`)

The planner now outputs richer JSON:

```json
{
  "projectName": "Acme SaaS",
  "theme": {
    "mood": "professional-modern",
    "colorIntent": "blue-dominant with warm accents"
  },
  "pages": [
    {
      "name": "Home",
      "slug": "/",
      "layoutArchetype": "split-hero",
      "sections": [
        {
          "type": "hero",
          "layout": "split-hero",
          "imageQuery": "modern office workspace aerial",
          "description": "Value proposition with product screenshot"
        },
        {
          "type": "features",
          "layout": "bento-grid",
          "imageQuery": null,
          "description": "4 key features in bento grid with icons"
        },
        {
          "type": "testimonials",
          "layout": "card-mosaic",
          "imageQuery": "professional headshot portrait",
          "description": "3 customer testimonials with photos"
        },
        {
          "type": "cta",
          "layout": "centered-hero",
          "imageQuery": null,
          "description": "Final conversion CTA with gradient background"
        }
      ]
    }
  ]
}
```

Key additions:
- `layoutArchetype` per page
- `layout` per section (can differ from page archetype for variety)
- `imageQuery` — what to search Unsplash for (null = no image needed)
- Richer `description` with specific visual intent

### 2.5 Few-Shot Examples (`prompts/examples/`)

2-3 curated HTML files per section type. These are hand-written, high-quality examples that demonstrate:
- Correct Tailwind usage
- Good typography hierarchy
- Realistic content
- Proper image placement
- Theme variable usage

**This is the single highest-impact quality change.** Research shows few-shot examples improve generation quality more than any prompt engineering.

---

## Phase 3: Pipeline — Parallel Section Generation

### 3.1 New Generation Flow

```
User clicks "Generate"
        │
        ▼
   ┌─────────┐
   │ Planner  │  → JSON plan with pages, sections, image queries
   └────┬─────┘
        │
        ▼
   ┌──────────────┐
   │ Image Search  │  → Batch Unsplash queries for all sections
   └──────┬───────┘
          │
          ▼
   ┌─────────────────────────────────────────┐
   │  For each page (parallel, max 3):       │
   │                                         │
   │    ┌─────────────────────────────────┐  │
   │    │ For each section (parallel, 5-8):│  │
   │    │   generate-section.ts            │  │
   │    │   → section HTML chunk           │  │
   │    └────────────┬────────────────────┘  │
   │                 │                       │
   │                 ▼                       │
   │    ┌─────────────────────────────────┐  │
   │    │ Assemble sections into full page │  │
   │    └────────────┬────────────────────┘  │
   │                 │                       │
   │                 ▼                       │
   │    ┌─────────────────────────────────┐  │
   │    │ Autofix pass (Phase 7)           │  │
   │    └────────────┬────────────────────┘  │
   │                 │                       │
   │                 ▼                       │
   │    ┌─────────────────────────────────┐  │
   │    │ Parse + Theme Link (iframe)      │  │
   │    └─────────────────────────────────┘  │
   └─────────────────────────────────────────┘
```

### 3.2 Parallel Section Generation (`pipeline/generate-section.ts`)

Each section is an independent AI call:
```ts
async function generateSection(
  section: PlannedSection,
  context: SectionContext
): Promise<string> {
  const prompt = getSectionPrompt(section.type, context)
  const html = await generate(prompt, {
    model: context.model,
    temperature: 0.9,
    maxTokens: 4096, // sections are small
    thinking: false,  // not needed for focused sections
  })
  return html
}
```

Benefits:
- **5-8 sections generated simultaneously** instead of one giant HTML blob
- **Smaller context window per call** = faster, cheaper, more focused
- **No thinking mode needed** for individual sections (prompt is specific enough)
- **Failure isolation** — one bad section doesn't kill the whole page

### 3.3 Page Assembly (`pipeline/generate-page.ts`)

```ts
async function generatePage(page: PlannedPage, images: ImageMap): Promise<string> {
  const sections = page.sections.map((section, i) => ({
    ...section,
    images: images[section.imageQuery],
    adjacentSections: {
      prev: page.sections[i - 1],
      next: page.sections[i + 1],
    },
  }))

  // Fire all section generations in parallel
  const sectionHtmls = await Promise.all(
    sections.map(s => generateSection(s, { ...context, ...s }))
  )

  // Assemble into full page
  const fullHtml = assemblePage(sectionHtmls, page)
  return fullHtml
}
```

### 3.4 Iframe Pooling

Instead of creating a new iframe per page (current: ~5s overhead each):
- Create **one iframe** on first parse, load Tailwind CDN + fonts once
- **Reuse** for all subsequent pages by replacing `innerHTML`
- Pool management: `getIframe()` → `releaseIframe()`

Expected savings: ~5s × (N-1) pages = **~20s for a 5-page project**

### 3.5 Streaming UX

Even though sections generate in parallel, we can still show progress:
- Show a progress indicator: "Generating Home page... (3/5 sections complete)"
- As each section finishes, show a checkmark
- Once all sections are done, show "Parsing..." then "Done!"

---

## Phase 4: Unsplash API Integration

### 4.1 API Route (`/api/ai/search-images`)

```ts
// POST /api/ai/search-images
{
  queries: [
    { key: "hero", query: "modern office workspace aerial", count: 2 },
    { key: "team", query: "professional headshot portrait", count: 3 },
  ],
  orientation: "landscape", // or "portrait", "squarish"
  color: "blue" // optional, derived from theme
}
```

Response:
```json
{
  "hero": [
    {
      "url": "https://images.unsplash.com/photo-xxx?w=1200&q=80",
      "alt": "Modern open office with natural lighting",
      "credit": "Photo by John Doe on Unsplash"
    }
  ],
  "team": [...]
}
```

### 4.2 Unsplash Client (`src/lib/ai/unsplash.ts`)

```ts
const UNSPLASH_API = 'https://api.unsplash.com'

export async function searchImages(
  query: string,
  opts: { count?: number; orientation?: string; color?: string }
): Promise<UnsplashImage[]> {
  const params = new URLSearchParams({
    query,
    per_page: String(opts.count || 3),
    orientation: opts.orientation || 'landscape',
    ...(opts.color && { color: opts.color }),
  })

  const res = await fetch(`${UNSPLASH_API}/search/photos?${params}`, {
    headers: { Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}` },
  })

  const data = await res.json()
  return data.results.map(photo => ({
    url: `${photo.urls.regular}&w=1200&q=80`,
    alt: photo.alt_description || photo.description || query,
    credit: `Photo by ${photo.user.name} on Unsplash`,
    blurHash: photo.blur_hash,
  }))
}
```

### 4.3 Batch Image Search

Before section generation starts, batch all image queries:
```ts
const imageQueries = plan.pages
  .flatMap(p => p.sections)
  .filter(s => s.imageQuery)
  .map(s => ({ key: s.imageQuery, query: s.imageQuery, count: 2 }))

// Deduplicate queries
const uniqueQueries = dedupeByKey(imageQueries)

// Fire all in parallel (Unsplash allows batching)
const imageMap = await batchSearchImages(uniqueQueries)
```

### 4.4 Rate Limits
- **Demo**: 50 requests/hour
- **Production**: 5,000 requests/hour
- A typical 5-page project needs ~10-15 unique image queries = well within limits
- Cache results for 1 hour to avoid redundant searches

---

## Phase 5: CIELAB Theme Linker

### 5.1 Problem

Current theme linking uses two competing systems:
1. **Parser** (`iframe-parser.ts`): Exact hex match — `getComputedStyle` → compare to theme colors
2. **Relinker** (`relink-nodes.ts`): Semantic heuristics — luminance-based classification + name matching

When AI generates `#6366f1` but theme has `#6365f0`, both systems miss.

### 5.2 Solution: CIELAB Color Distance

Replace exact-match with perceptual color distance:

```ts
import { Lab, diff } from 'culori' // or implement manually

function findClosestThemeColor(
  hex: string,
  themeColors: Record<string, string>
): { variable: string; distance: number } | null {
  const lab = toLab(hex)

  let best = { variable: '', distance: Infinity }
  for (const [varName, varHex] of Object.entries(themeColors)) {
    const d = deltaE(lab, toLab(varHex)) // CIE76 or CIEDE2000
    if (d < best.distance) {
      best = { variable: varName, distance: d }
    }
  }

  // Only match if perceptually similar (ΔE < 5 = barely distinguishable)
  return best.distance < 5 ? best : null
}
```

### 5.3 Single-Pass Theme Linking

Replace the two-system approach with one pass after HTML is assembled:

```ts
function themeLink(node: ScytleNode, themeColors: ThemeColors): ScytleNode {
  // For each color property (fill, stroke, text color, border, background):
  const hex = node.style.backgroundColor // or whatever
  if (!hex) return node

  const match = findClosestThemeColor(hex, themeColors)
  if (match) {
    node.style.backgroundColor = `var(--${match.variable})`
  }

  return node
}
```

### 5.4 Font Linking

Similar approach for fonts — fuzzy match font family names:
```ts
function findClosestFont(fontFamily: string, themeFonts: string[]): string | null {
  const normalized = fontFamily.toLowerCase().replace(/['"]/g, '')
  return themeFonts.find(f =>
    f.toLowerCase().includes(normalized) || normalized.includes(f.toLowerCase())
  ) || null
}
```

---

## Phase 6: Claude Model Support

### 6.1 Add to Model Registry

```ts
// In config.ts
'claude-sonnet': {
  provider: 'anthropic',
  modelId: 'claude-sonnet-4-6',
  maxTokens: 16384,
  defaultTemp: 0.8,
  label: 'Claude Sonnet 4.6',
  description: 'Balanced speed and quality',
}
```

### 6.2 Multi-Provider Client

```ts
// In client.ts
async function generate(prompt: string, opts: GenerateOpts): Promise<string> {
  const model = AI_MODELS[opts.model]

  switch (model.provider) {
    case 'google':
      return generateWithGemini(prompt, opts)
    case 'anthropic':
      return generateWithClaude(prompt, opts)
    default:
      throw new Error(`Unknown provider: ${model.provider}`)
  }
}
```

### 6.3 Claude-Specific Prompt Adaptations

Claude works better with:
- XML-structured prompts (wrap sections in tags)
- Explicit `<output>` tags to signal where HTML should go
- No need for thinking mode — Claude thinks inline

```ts
function adaptPromptForClaude(prompt: string): string {
  return `<instructions>
${prompt}
</instructions>

<output>
<!-- Generate HTML here -->
</output>`
}
```

### 6.4 Update Zod Schema

```ts
// In types/index.ts
export const AiModelSchema = z.enum(['gemini-pro', 'gemini-flash', 'claude-sonnet'])
```

### 6.5 Environment Variables

```
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Phase 7: HTML Autofix Pass

### 7.1 Purpose

A fast regex/AST pass over generated HTML to fix common AI mistakes before parsing. Runs after assembly, before iframe parsing.

### 7.2 Fixes

```ts
export function autofixHtml(html: string): string {
  let fixed = html

  // 1. Strip markdown fences (AI sometimes wraps in ```)
  fixed = stripMarkdownFences(fixed)

  // 2. Remove forbidden Tailwind patterns
  fixed = fixed.replace(/\b(fixed|sticky|absolute)\b(?=[^"]*")/g, (match, pos) => {
    // Only remove position classes on root-level elements
    // Keep them on inner elements (dropdowns, tooltips)
    return match // TODO: smarter detection
  })

  // 3. Remove arbitrary Tailwind values
  fixed = fixed.replace(/\b\w+-\[[\w#%.]+\]/g, '') // text-[#hex], w-[123px], etc.

  // 4. Fix common AI mistakes
  fixed = fixed.replace(/class="([^"]*)\bmax-w-\w+([^"]*)"/g, 'class="$1$2"') // Remove max-w on sections
  fixed = fixed.replace(/margin:\s*0\s*auto/g, '') // Remove centering margins

  // 5. Ensure all images have alt text
  fixed = fixed.replace(/<img(?![^>]*alt=)/g, '<img alt="image"')

  // 6. Wrap in section if not already
  if (!fixed.trim().startsWith('<section') && !fixed.trim().startsWith('<div')) {
    fixed = `<section class="w-full">${fixed}</section>`
  }

  return fixed.trim()
}
```

### 7.3 Integration Point

```
Section HTML → autofix() → assemble() → iframe parse → theme link
```

---

## Performance Targets

### Current Performance (5-page project)
| Step | Time |
|------|------|
| Plan pages | ~3s |
| Generate page 1 | ~15s |
| Parse page 1 | ~7s (iframe create + walk) |
| Generate page 2 | ~15s |
| Parse page 2 | ~7s |
| ... (×5 pages) | ... |
| **Total** | **~78s** |

### Target Performance (5-page project)
| Step | Time |
|------|------|
| Plan pages | ~3s |
| Search images (batch) | ~1s |
| Generate all sections (parallel, ~20 total) | ~6s |
| Assemble + autofix (5 pages) | <1s |
| Parse all pages (iframe pool) | ~4s |
| Theme link | <1s |
| **Total** | **~14s** |

### Key Speedups
- **Parallel sections**: 5-8 simultaneous calls instead of sequential → 5-8x faster
- **No thinking mode for sections**: saves ~3s per section call
- **Iframe pooling**: saves ~5s × 4 = 20s
- **Smaller per-call token count**: sections are ~500 tokens vs ~3000 for full page

---

## Implementation Order

### Sprint 1: Foundation (Phases 1 + 4)
1. Delete dead code (dead routes, dead AI files)
2. Consolidate model config into `config.ts`
3. Set up Unsplash client + API route
4. Set up `prompts/` directory structure

**Why first**: Cleans up the codebase and establishes the new structure. Unsplash is a dependency for Phase 3.

### Sprint 2: Prompts (Phase 2)
1. Write `system.ts` shared rules
2. Write `layouts.ts` with 12 archetypes + mini HTML examples
3. Write `section.ts` per-section prompts
4. Enhance `planner.ts` output format
5. Curate 2-3 few-shot examples per section type

**Why second**: The new prompts are the biggest quality lever. They can be tested with the existing sequential pipeline before parallelizing.

### Sprint 3: Pipeline (Phase 3)
1. Implement `generate-section.ts`
2. Implement `generate-page.ts` with parallel section generation
3. Implement `generate-project.ts` with parallel page generation
4. Implement iframe pooling in parser
5. Wire up progress UX

**Why third**: Depends on new prompts and Unsplash integration.

### Sprint 4: Theme + Autofix (Phases 5 + 7)
1. Implement CIELAB color distance matching
2. Replace dual theme-linking with single-pass CIELAB linker
3. Implement HTML autofix pass
4. Wire autofix into pipeline before parsing

**Why fourth**: Theme linking and autofix are post-processing steps that can be added to the pipeline after it's working.

### Sprint 5: Claude Support (Phase 6)
1. Add Claude to model registry
2. Implement multi-provider client dispatch
3. Add Claude-specific prompt adaptations
4. Update UI model selector

**Why last**: Nice-to-have. The quality improvements from Phases 2-5 apply regardless of model.

---

## Environment Variables Required

```env
# Existing
GOOGLE_AI_API_KEY=...

# New
UNSPLASH_ACCESS_KEY=...          # Unsplash API (free tier: 50 req/hr)
ANTHROPIC_API_KEY=sk-ant-...     # Claude API (optional, Phase 6)
```

---

## Success Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Generation time (5 pages) | ~78s | <15s |
| Unique layouts per 10 generations | ~2 | 8+ |
| Theme color accuracy | ~60% | >95% |
| Images (unique per project) | 0 (hardcoded) | 10-15 (dynamic) |
| Error-free HTML rate | ~70% | >93% |
| Models supported | 2 (Gemini) | 3+ (Gemini + Claude) |
