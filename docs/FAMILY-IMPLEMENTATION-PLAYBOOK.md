# Family Implementation Playbook

> **Purpose**: Step-by-step action plan for implementing a new family within any V2 layout category using the **config-driven rendering** pattern. Based on the CTA refactoring (41 variants across 3 families — reduced from 18 files to 10).
>
> **Prerequisite**: A completed `{CATEGORY}-CONTROL-MAP.md` for the target category (produced by the [Relume Control Mapping Playbook](RELUME-CONTROL-MAPPING-PLAYBOOK.md)).

---

## Table of Contents

1. [Overview — Config-Driven Architecture](#1-overview)
2. [Pre-Flight — Read the Control Map](#2-pre-flight--read-the-control-map)
3. [Phase 1 — Fetch Figma Designs](#3-phase-1--fetch-figma-designs)
4. [Phase 2 — Create/Extend Unified Types](#4-phase-2--createextend-unified-types)
5. [Phase 3 — Create Shared Builders + Family Presets](#5-phase-3--create-shared-builders--family-presets)
6. [Phase 4 — Create Parametric Section Renderer](#6-phase-4--create-parametric-section-renderer)
7. [Phase 5 — Create Thumbnail Factory + Auto-Wired Index](#7-phase-5--create-thumbnail-factory--auto-wired-index)
8. [Phase 6 — Add Family-Scoped Control Def](#8-phase-6--add-family-scoped-control-def)
9. [Phase 7 — Register in Global Layout System](#9-phase-7--register-in-global-layout-system)
10. [Phase 8 — Build & Verify](#10-phase-8--build--verify)
11. [Reference — File Structure & Naming](#11-reference--file-structure--naming)
12. [Reference — CTA Implementation as Worked Example](#12-reference--cta-as-worked-example)
13. [Checklist — Copy & Paste per Family](#13-checklist)

---

## 1. Overview

A **family** is a group of layout variants within a category that share the same visual structure and are navigable through control axes. For example:

| Family | Category | Variants | Axes |
|--------|----------|----------|------|
| CTA-A | cta | 6 (CTA 1,2,39,40,59,60) | Style, Asset Style, Element |
| CTA-B | cta | 10 (CTA 13–18,21–22,61–62) | Asset, Background/Asset Style, Element |
| CTA-C | cta | 25 (CTA 3–6,19–20,25–32,41–44,51–56,65) | Text, Style, Background, Element, Asset, Asset Style |
| Hero | hero | 5 (hero-1,3,5,44,57) | Layout, Asset, Placement |

### Config-Driven Rendering (not Per-Family File Explosion)

**Old pattern (DON'T DO THIS)**: Each family produced ~6 files (types, presets, section renderers, layouts, thumbnails). Adding 3 families to CTA created 18 files with massive duplication — duplicated block builders, duplicated background layers, duplicated section wrappers.

**New pattern (DO THIS)**: One unified preset config drives a parametric renderer. Adding a new family to an existing category = **1 new file** (the family preset file). Everything else is shared.

### Architecture — Config-Driven

```
layouts/{category}/
  types.ts                  ← ONE unified type for ALL families
  presets/
    shared-builders.ts      ← Atomic block builders (single source of truth)
    family-a.ts             ← Family A: block factories + unified preset configs
    family-b.ts             ← Family B: block factories + unified preset configs
    index.ts                ← Aggregator: merges all families into one map
  renderers/
    section-shell.tsx       ← ONE parametric renderer for ALL variants
    backgrounds.tsx         ← Shared background layer components
  thumbnails.tsx            ← Factory function: createThumbnail(config)
  index.tsx                 ← Auto-wired barrel: createLayoutComponent(config) factory

layouts/controls.ts         ← Family-scoped LayoutControlDef (one per family)
  CONTROL_REGISTRY          ← Record<familyId, LayoutControlDef>
  CATEGORY_FAMILIES         ← Record<LayoutCategory, familyId[]>

layouts/index.ts            ← Global registry (import + register)
```

### Key Principle: Separation of Concerns

| Concern | Where it lives | Never duplicated |
|---|---|---|
| Block tree structure | `presets/family-{x}.ts` (per-family) | Block builders in `shared-builders.ts` |
| Visual composition (shell/card/bg) | `renderers/section-shell.tsx` (one component) | ✅ |
| Thumbnails | `thumbnails.tsx` (factory function) | ✅ |
| Layout ↔ Component wiring | `index.tsx` (auto-generated) | ✅ |
| Control axes | `controls.ts` (per-family def) | `extract()` is just `return { ...preset.axes }` |

---

## 2. Pre-Flight — Read the Control Map

Before writing any code, study the `{CATEGORY}-CONTROL-MAP.md` for the family you're about to implement.

### 2A. Identify the family boundaries

From the control map's **Summary of Families** table, extract:

| What to find | Where | Example (CTA-B) |
|---|---|---|
| Family letter | Summary table | B |
| Base component | Summary table | CTA 13 |
| All variant IDs | Combo tables | 13, 14, 15, 16, 17, 18, 21, 22, 61, 62 |
| Axis names + values | Axis table per family | Asset (None/Image), Background (None/Image/Video), Asset Style (Default/Expand), Element (Button/Form) |
| Dynamic behavior | "Dynamic Behavior" section | Asset=None → show Background, hide Asset Style. Asset=Image → show Asset Style, hide Background. |
| Variant count | Combo table rows | 10 |

### 2B. Identify the structural groups

Within one family, variants typically share 2-4 **distinct section layouts** (different HTML structures). Group variants by visual structure:

| Structure Group | Variants | What's Different |
|---|---|---|
| Text-Only | CTA 13-18 | Two text columns, background varies (none/image/video) |
| Stacked | CTA 21-22 | Two text columns + full-width image below |
| Expand | CTA 61-62 | Content in padded container + full-bleed image |

Each structural group gets **one section renderer component** (e.g., `CtaBTextOnly`, `CtaBStacked`, `CtaBExpand`).

### 2C. Map axes to implementation

For each axis, decide:

| Axis | Creates structural difference? | Implementation |
|---|---|---|
| Asset (None/Image) | YES — adds/removes image block | Different block factories |
| Background (None/Image/Video) | No (CSS only in design mode) | `background` field in preset config |
| Element (Button/Form) | Yes — different action blocks | Different block factories |
| Asset Style (Default/Expand) | YES — different section renderer | Different section component |

**Rule**: If an axis value changes the HTML structure → it needs a separate `buildCtaXBlocks()` factory. If it only changes styling → same factory, different config field. Either way, the shell type in the preset config drives the parametric renderer — NOT a separate section component.

---

## 3. Phase 1 — Fetch Figma Designs

### 3A. Find the Figma node IDs

Use Figma MCP's `get_metadata` on the file key to find child nodes matching the variant names. Look for "Desktop" breakpoint children.

```
Figma File Key: Ehft8P02yDqutz3LhXtJqZ
```

### 3B. Fetch design context for each variant

Call `get_design_context` for each unique structural variant (you don't need all — just one per structural group + one per element type). For CTA-B with 10 variants, we fetched all 10 but really needed ~6 (one per structure × element combo).

**What to extract from Figma**:
- Block hierarchy (heading, body, buttons/form, image placement)
- Container nesting (which wrappers exist, how content is grouped)
- Spacing patterns (gaps between blocks)
- Whether the image is inside or outside the container
- Background behavior (section-level vs container-level)

### 3C. Analyze and group

After fetching, confirm or adjust your structural groups from Step 2B. Look for:
- Shared content patterns (e.g., "heading left column, body+actions right column" → common `makeColumnsFrame()` helper)
- Image placement differences (inline vs stacked vs full-bleed)
- Container boundary differences

---

## 4. Phase 2 — Create/Extend Unified Types

**File**: `layouts/{category}/types.ts` — **ONE file for all families in the category**

> **Do NOT create per-family type files** (no `types-b.ts`, `types-c.ts`). All families share one unified `PresetConfig` interface.

### 4A. Define content interface (if new category)

```typescript
export interface CtaContent {
    heading: string
    body: string
    primaryButton: string
    secondaryButton: string
    inputPlaceholder: string  // for form variants
    submitButton: string      // for form variants
    termsText: string         // for form variants
}
```

Include ALL text content that appears in any variant across all families.

### 4B. Define default content

```typescript
export const DEFAULT_CONTENT: CtaContent = {
    heading: 'Medium length heading goes here',
    body: 'Lorem ipsum dolor sit amet...',
    // ...sensible placeholder text
}
```

### 4C. Define renderer primitives

Shell types abstract all structural differences. Adding a variant to an existing shell type requires zero renderer changes:

```typescript
/** Section shell type — drives the parametric renderer */
export type SectionShell =
    | 'container'      // section → container → blocks
    | 'bg-container'   // section + bg layer → container → blocks
    | 'card'           // section → container → card(solid bg) → blocks
    | 'card-bg'        // section → container → card + bg layer inside → blocks
    | 'bare'           // section → blocks (no container, no card)
    | 'expand'         // section → padded container + full-bleed last block

/** Content alignment inside the container / card */
export type ContentAlign = 'left' | 'center' | 'none'
```

### 4D. Define unified preset config

**One interface for ALL families** — no per-family types:

```typescript
export interface CtaPresetConfig {
    id: string              // 'cta-13'
    name: string            // 'CTA 13'
    description: string
    tags: string[]

    // ── Family grouping ──
    family: 'a' | 'b' | 'c'  // extend union when adding families

    // ── Image / video controls ──
    imageRole: ImageRole      // 'inline' | 'background' | 'none'
    supportsVideo: boolean

    // ── Renderer config (drives section-shell.tsx) ──
    shell: SectionShell       // which structural shell to use
    align: ContentAlign       // content alignment
    background: 'none' | 'image' | 'video'
    contentMaxWidth?: number  // optional max-width on inner content (px)

    // ── Control axes (opaque to renderer, used by controls.ts) ──
    axes: Record<string, string>
}
```

**Key rules**:
- The `shell`, `align`, `background` fields drive the **parametric renderer** — they determine the HTML structure.
- The `axes` record stores **opaque control-system values** per family. This makes `extract()` trivial: `return { ...preset.axes }`.
- Every axis value that affects `resolve()` or `extract()` in the control def MUST appear in `axes`.
- `imageRole`, `supportsVideo` are used by the design-mode image controls panel.

### 4E. Adding a new family to an existing category

If the category types already exist, you typically just:
1. Extend the `family` union type: `'a' | 'b' | 'c'` → `'a' | 'b' | 'c' | 'd'`
2. Potentially add new `SectionShell` values if the family introduces a genuinely new structural pattern (rare)
3. Add any new fields to `DEFAULT_CONTENT` if the family has new text slots

---

## 5. Phase 3 — Create Shared Builders + Family Presets

This is the **only file you create per family** when adding to an existing category.

### 5A. Shared block builders (one-time, per category)

**File**: `layouts/{category}/presets/shared-builders.ts`

Create this ONCE for the category. All families import from it — never duplicate builders.

```typescript
import type { Block } from '../../../blocks/types'
import { DEFAULT_CONTENT } from '../types'

let _uid = 0
export function uid(prefix = 'cta'): string {
    return `${prefix}-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
}
export function resetUid(): void { _uid = 0 }

export function makeHeading(align: 'left' | 'center' = 'left'): Block { ... }
export function makeBody(align: 'left' | 'center' = 'left'): Block { ... }
export function makeTextContent(align: 'left' | 'center' = 'left'): Block { ... }
export function makeButtonGroup(align: 'left' | 'center' = 'left'): Block { ... }
export function makeFormActions(align: 'left' | 'center' = 'left', maxWidth?: number): Block { ... }
export function makeImage(ratio = '16/9'): Block { ... }
```

When adding a new family, you may add new shared builders here if the family introduces new block patterns (e.g., `makeTestimonialCard`). Never duplicate existing builders.

### 5B. Family preset file

**File**: `layouts/{category}/presets/family-{x}.ts`

This is the **one file per family**. It contains:
1. Optional family-specific structural helpers (not shared, internal)
2. One block factory per variant
3. Unified preset configs using the shared `CtaPresetConfig` type
4. Exported arrays + maps

```typescript
import type { Block } from '../../../blocks/types'
import type { CtaPresetConfig } from '../types'
import { uid, resetUid, makeTextContent, makeButtonGroup, makeFormActions } from './shared-builders'

// ── Family-specific structural helper (internal) ──

function makeColumnsFrame(actions: Block): Block {
    return {
        id: uid(), type: 'frame',
        props: { direction: 'horizontal', gap: 80, className: '@max-sm:!flex-col @max-sm:!gap-6' },
        content: {},
        children: [
            { id: uid(), type: 'heading', props: { level: 2 }, content: { text: '...' } },
            {
                id: uid(), type: 'frame',
                props: { direction: 'vertical', gap: 32, layoutClassName: 'flex-1' },
                content: {},
                children: [
                    { id: uid(), type: 'text', props: { variant: 'body-large' }, content: { text: '...' } },
                    actions,
                ],
            },
        ],
    }
}

// ── Block factories (one per variant) ──

export function buildCta13Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeButtonGroup())]
}

export function buildCta14Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeFormActions())]
}
// ... one per variant
```

**CRITICAL — Nested Frame Block Trees**: Every structural wrapper `<div>` in the layout MUST be a `frame` block with `children: Block[]`. The parametric renderer walks the tree via `<RenderBlock>`. No hardcoded wrapper divs in JSX. See WIREFRAME-V2-ARCHITECTURE.md Section 3C.

### 5C. Unified preset configs

Each config uses the **shared** `CtaPresetConfig` type (not a per-family type). The `shell`, `align`, and `background` fields drive the parametric renderer:

```typescript
export const FAMILY_B_PRESETS: CtaPresetConfig[] = [
    {
        id: 'cta-13',
        name: 'CTA 13',
        description: 'Two-column CTA with buttons, no background',
        tags: ['cta', 'buttons', 'minimal'],
        family: 'b',
        imageRole: 'none',
        supportsVideo: false,
        // ── Renderer config ──
        shell: 'container',
        align: 'none',
        background: 'none',
        // ── Control axes (opaque, used by controls.ts extract) ──
        axes: { asset: 'none', background: 'none', element: 'button' },
    },
    // ... more presets
]
```

**Mapping structural groups to shell types**:

| Visual Structure | Shell Type | Example |
|---|---|---|
| Simple container with blocks | `container` | CTA 1, 13 |
| Section-level background image/video | `bg-container` | CTA 3, 15 |
| Card wrapper with solid background | `card` | CTA 39, 51 |
| Card wrapper with bg image/video inside | `card-bg` | CTA 41, 53 |
| No container (blocks fill section) | `bare` | CTA 59 |
| Padded content + full-bleed last block | `expand` | CTA 61, 65 |

### 5D. Export aggregated maps

```typescript
export const FAMILY_B_PRESETS_MAP: Record<string, CtaPresetConfig> = Object.fromEntries(
    FAMILY_B_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_B_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'cta-13': buildCta13Blocks,
    'cta-14': buildCta14Blocks,
    // ... all variants
}
```

### 5E. Presets aggregator

**File**: `layouts/{category}/presets/index.ts`

Merges all families into unified collections. Update this when adding a new family:

```typescript
import { FAMILY_A_PRESETS, FAMILY_A_PRESETS_MAP, FAMILY_A_BLOCK_FACTORIES } from './family-a'
import { FAMILY_B_PRESETS, FAMILY_B_PRESETS_MAP, FAMILY_B_BLOCK_FACTORIES } from './family-b'

export const ALL_CTA_PRESETS: CtaPresetConfig[] = [
    ...FAMILY_A_PRESETS,
    ...FAMILY_B_PRESETS,
]

export const CTA_PRESETS_MAP: Record<string, CtaPresetConfig> = {
    ...FAMILY_A_PRESETS_MAP,
    ...FAMILY_B_PRESETS_MAP,
}

export const CTA_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    ...FAMILY_A_BLOCK_FACTORIES,
    ...FAMILY_B_BLOCK_FACTORIES,
}

// Per-family re-exports (for controls.ts)
export { FAMILY_A_PRESETS, FAMILY_A_PRESETS_MAP, FAMILY_A_BLOCK_FACTORIES } from './family-a'
export { FAMILY_B_PRESETS, FAMILY_B_PRESETS_MAP, FAMILY_B_BLOCK_FACTORIES } from './family-b'
```

---

## 6. Phase 4 — Create Parametric Section Renderer

> **Create this ONCE per category.** When adding a new family to an existing category, you do NOT create a new section renderer — the existing parametric renderer handles all families via config.

**Files**:
- `layouts/{category}/renderers/section-shell.tsx` — Universal parametric renderer
- `layouts/{category}/renderers/backgrounds.tsx` — Shared background layer components

### 6A. Background layers (one-time)

```typescript
'use client'
import { useUnifiedStore } from '@/store'
import { positionToCSS } from '../../../utils/image-helpers'

export function BgImageLayer({ sectionId }: { sectionId: string }) {
    const designProps = useUnifiedStore(/* ... */)
    // Shows real image in design mode, or placeholder with ImageIcon
    return <div className="absolute inset-0 overflow-hidden">...</div>
}

export function BgVideoLayer() {
    // Placeholder with VideoIcon
    return <div className="absolute inset-0 overflow-hidden">...</div>
}
```

### 6B. Universal section renderer (one-time)

The parametric renderer reads `config.shell`, `config.align`, `config.background`, and `config.contentMaxWidth` to compose the correct structural layers. **This replaces all per-family section components.**

```typescript
export interface CtaSectionShellProps extends LayoutProps {
    config: CtaPresetConfig
}

export function CtaSectionShell({ sectionId, blocks, className, config }: CtaSectionShellProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    const { shell, align, background, contentMaxWidth } = config
    const alignCn = ALIGN_CLASSES[align] ?? ''

    // Shell-specific composition:
    // - 'bare'         → blocks directly in section
    // - 'card'         → container → card(solid bg) → blocks
    // - 'card-bg'      → container → card(relative) + BgLayer inside → blocks
    // - 'expand'       → padded container for content + full-bleed last block
    // - 'container'    → container → blocks
    // - 'bg-container' → section(relative) + BgLayer → container(z-1) → blocks

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section className={className} style={sectionStyle}>
                    {hasSectionBg && <BgLayer background={background} sectionId={sectionId} />}
                    {inner}
                    {isExpand && fullBleedBlock && <RenderBlock block={fullBleedBlock} />}
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
```

**Key patterns**:
- `@container` queries use `@max-sm:` prefix for mobile breakpoints
- Standard max-width: `1280px` (via inline style)
- Standard padding: `py-28 px-16 @max-sm:py-16 @max-sm:px-5`
- Blocks rendered via `blocks?.map(block => <RenderBlock key={block.id} block={block} />)`
- All structural wrappers are in the block tree — the renderer only adds shell/card/bg wrappers

### 6C. When adding a new family

**You do NOT modify the renderer** unless the family introduces a genuinely new shell type. If it does:
1. Add the new shell value to `SectionShell` in `types.ts`
2. Add a new `else if` branch in `section-shell.tsx`

This should be rare — the 6 existing shell types cover most patterns.

---

## 7. Phase 5 — Create Thumbnail Factory + Auto-Wired Index

> **Create these ONCE per category.** When adding a new family, no changes needed — the factory auto-generates thumbnails from config.

### 7A. Thumbnail factory

**File**: `layouts/{category}/thumbnails.tsx`

One factory function that creates thumbnail components from config metadata. No per-variant components.

```typescript
import { AlignLeft, AlignCenter, ImageIcon, CreditCard, Maximize2, Mail, VideoIcon, Layers } from 'lucide-react'
import type { CtaPresetConfig } from './types'

function getLabel(config: CtaPresetConfig): string {
    const parts: string[] = []
    if (config.shell === 'card' || config.shell === 'card-bg') parts.push('Card')
    if (config.background === 'image') parts.push('BG')
    if (config.background === 'video') parts.push('Video')
    parts.push(config.axes.element === 'form' ? 'Form' : 'CTA')
    if (config.imageRole === 'inline') parts.push('+ Image')
    return parts.join(' ')
}

function getIcons(config: CtaPresetConfig) {
    const icons = []
    if (config.align === 'left') icons.push(AlignLeft)
    if (config.align === 'center') icons.push(AlignCenter)
    if (config.shell === 'card' || config.shell === 'card-bg') icons.push(CreditCard)
    if (config.background === 'image') icons.push(Layers)
    if (config.imageRole === 'inline') icons.push(ImageIcon)
    if (config.axes.element === 'form') icons.push(Mail)
    return icons
}

export function createThumbnail(config: CtaPresetConfig): React.FC {
    const icons = getIcons(config)
    const label = getLabel(config)
    const Thumbnail = function CtaThumbnail() {
        return (
            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
                <div className="flex items-center gap-1.5">
                    {icons.map(({ Icon }, i) => <Icon key={i} className="w-4 h-4 text-gray-400" />)}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{label}</span>
            </div>
        )
    }
    Thumbnail.displayName = `${config.id}Thumbnail`
    return Thumbnail
}
```

### 7B. Auto-wired barrel index

**File**: `layouts/{category}/index.tsx`

Layout components are auto-created via factory — no manual mapping needed. **Adding a family requires zero changes to this file** (if presets/index.ts is updated properly).

```typescript
import type { LayoutTemplate, LayoutProps } from '../types'
import type { CtaPresetConfig } from './types'
import { ALL_CTA_PRESETS, CTA_BLOCK_FACTORIES } from './presets'
import { CtaSectionShell } from './renderers/section-shell'
import { createThumbnail } from './thumbnails'

/** Creates a layout component that injects the preset config into CtaSectionShell. */
function createLayoutComponent(config: CtaPresetConfig): React.FC<LayoutProps> {
    const Component = function CtaLayout(props: LayoutProps) {
        return <CtaSectionShell {...props} config={config} />
    }
    Component.displayName = `Cta${config.id.replace('cta-', '')}Layout`
    return Component
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_CTA_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'cta',
    description: preset.description,
    component: createLayoutComponent(preset),
    defaultBlocks: CTA_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: createThumbnail(preset),
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// Re-exports
export type { CtaContent, CtaPresetConfig, SectionShell, ContentAlign } from './types'
export { DEFAULT_CONTENT } from './types'
export { ALL_CTA_PRESETS, CTA_PRESETS_MAP, CTA_BLOCK_FACTORIES } from './presets'
```

> **Note**: The file must use `.tsx` extension (not `.ts`) because the factory returns JSX.

---

## 8. Phase 6 — Add Family-Scoped Control Def

**File**: `layouts/controls.ts`

This is the critical integration step that makes controls show only the correct family's axes.

### 8A. Import the family's preset map

Import the **per-family preset map** from the unified presets aggregator:

```typescript
import {
    FAMILY_A_PRESETS_MAP,
    FAMILY_B_PRESETS_MAP,   // ← add new import
} from './cta/presets'
```

> **Note**: All imports come from `'./cta/presets'` (the aggregator), NOT from individual family files.

### 8B. Create the family control def

```typescript
const CTA_B_CONTROL_DEF: LayoutControlDef = {
    category: 'cta',        // parent category
    familyId: 'cta-b',      // unique family ID
    axes: [ ... ],           // ONLY this family's axes
    resolve(values) { ... }, // ONLY resolves to this family's variant IDs
    extract(layoutId) { ... }, // ONLY checks this family's preset map
}
```

### 8C. Translate control map to axes

For each axis from the control map:

```typescript
{
    key: 'asset',                              // machine key
    label: 'Asset',                            // display label
    options: [
        { value: 'none', label: 'None' },      // from control map values
        { value: 'image', label: 'Image', icon: 'Image' },
    ],
    condition: (values) => ...,                // dynamic hiding rules from control map
    modeVisibility: 'design',                  // if design-mode only
}
```

**Mapping dynamic behavior to `condition`**:

| Control Map Says | `condition` Implementation |
|---|---|
| "Asset=None → show Background" | `condition: (v) => v.asset === 'none'` |
| "Card mode → Asset Style HIDES" | `condition: (v) => v.style !== 'card'` |
| "Expand → only Asset Style visible" | Put conditions on OTHER axes: `condition: (v) => v.assetStyle !== 'expand'` |
| "Always visible" | Omit `condition` |

### 8D. Implement `resolve(values)`

Translates current axis values → preset ID. Follow the combo table from the control map:

```typescript
resolve(values) {
    const asset = values.asset ?? 'none'
    const element = values.element ?? 'button'

    if (asset === 'none') {
        const bg = values.background ?? 'none'
        if (bg === 'video') return element === 'form' ? 'cta-18' : 'cta-17'
        if (bg === 'image') return element === 'form' ? 'cta-16' : 'cta-15'
        return element === 'form' ? 'cta-14' : 'cta-13'
    }
    // asset === 'image'
    const assetStyle = values.assetStyle ?? 'default'
    if (assetStyle === 'expand') return element === 'form' ? 'cta-62' : 'cta-61'
    return element === 'form' ? 'cta-22' : 'cta-21'
},
```

**Verification**: Count the `return` statements. Must equal the number of variants in the family.

### 8E. Implement `extract(layoutId)` — The `axes` Shortcut

Because every `CtaPresetConfig` stores its axis values in `axes: Record<string, string>`, the extract function is trivial:

```typescript
extract(layoutId) {
    const preset = FAMILY_B_PRESETS_MAP[layoutId]
    if (!preset) return {}   // ← CRITICAL: return empty for unknown IDs
    return { ...preset.axes }
},
```

That's it — **3 lines**. The `axes` field on each preset config is specifically designed for this reverse lookup. When you build the preset config in `family-{x}.ts`, you set the axes values, and `extract()` just spreads them back.

**Critical rule**: `extract()` MUST return `{}` (empty object) for any layout ID that doesn't belong to this family. The registry uses `Object.keys(extracted).length > 0` to determine ownership. Returning anything non-empty for a foreign ID will cause incorrect family matching.

### 8F. Register in CONTROL_REGISTRY and CATEGORY_FAMILIES

```typescript
const CONTROL_REGISTRY: Record<string, LayoutControlDef> = {
    'hero': HERO_CONTROL_DEF,
    'cta-a': CTA_A_CONTROL_DEF,
    'cta-b': CTA_B_CONTROL_DEF,         // ← add new entry
}

const CATEGORY_FAMILIES: Partial<Record<LayoutCategory, string[]>> = {
    hero: ['hero'],
    cta: ['cta-a', 'cta-b'],            // ← add family ID to category
}
```

### 8G. Verify no cross-family leakage

After implementation, manually test:
1. Select a Family A variant → only Family A axes should appear
2. Select a Family B variant → only Family B axes should appear
3. Toggle each axis → correct variant should resolve (check preset ID)
4. `extract()` on every variant ID should return valid values
5. `extract()` on a foreign family's ID should return `{}`

---

## 9. Phase 7 — Register in Global Layout System

### 9A. `layouts/index.ts` — Import + register

```typescript
import { LAYOUT_TEMPLATES as CTA_TEMPLATES } from './cta'

export const LAYOUT_REGISTRY: Partial<LayoutRegistry> = {
    hero: HERO_TEMPLATES,
    cta: CTA_TEMPLATES,   // ← already merged ALL families inside cta/index.tsx
}
```

> **Key point**: When adding a new family to an existing category, `layouts/index.ts` does NOT change. The new family's presets are merged inside `cta/presets/index.ts`, and the barrel `cta/index.tsx` auto-generates templates for all presets. The global registry just imports the category's templates array.

### 9B. `layouts/index.ts` — `getPresetConfig()` (unified lookup)

Because all families share one `CTA_PRESETS_MAP`, the lookup is a single line:

```typescript
import { CTA_PRESETS_MAP } from './cta/presets'

export function getPresetConfig(componentId: string): PresetImageConfig | undefined {
    // Hero lookup
    const heroConfig = HERO_PRESETS_MAP[componentId]
    if (heroConfig) return { imageRole: heroConfig.imageRole, supportsVideo: heroConfig.supportsVideo }

    // CTA lookup — single map covers ALL families (A, B, C, ...)
    const ctaConfig = CTA_PRESETS_MAP[componentId]
    if (ctaConfig) return { imageRole: ctaConfig.imageRole, supportsVideo: ctaConfig.supportsVideo }

    return undefined
}
```

> **Adding a new family requires NO changes here** — the aggregator in `presets/index.ts` already merges all families into `CTA_PRESETS_MAP`.

### 9C. No changes needed in consumers

The following files do NOT need changes when adding a new family to an existing category:

- **`section-picker.tsx`** — Already iterates all families via `getControlDefsForCategory()`
- **`add-section-sidebar.tsx`** — Already flatMaps across all family defs
- **`section-controls.tsx`** — Already uses `getControlDefForLayout(componentId)` which iterates all registry entries

If adding a **new category** (not just a new family), also add it to `V2_CATEGORY_META` in both `section-picker.tsx` and `add-section-sidebar.tsx`.

---

## 10. Phase 8 — Build & Verify

```bash
cd scytle && npm run build
```

Build MUST pass clean. Common errors at this stage:

| Error | Cause | Fix |
|---|---|---|
| `Module not found` | Missing import or wrong path | Check `presets/index.ts` re-exports |
| `Type 'X' is not assignable` | Preset config missing required field | Add field to config object in `family-{x}.ts` |
| `Property does not exist on type` | Wrong preset map type | Check which `FAMILY_X_PRESETS_MAP` you're indexing |
| `Expected '>', got '{'` | JSX in a `.ts` file | Rename barrel to `.tsx` (factories return JSX) |
| Duplicate identifier | Two families export same name | Use unique display names in factories |

> **`.tsx` vs `.ts` extension**: Any file that contains JSX (even indirectly via factory return types) must use `.tsx`. The barrel `index.tsx` and `thumbnails.tsx` always need `.tsx`. Type-only files (`types.ts`, `presets/*.ts`) use `.ts`.

---

## 11. Reference — File Structure & Naming

### Config-driven directory layout (DO THIS)

```
layouts/{category}/
  types.ts                          ← ONE file for ALL families
  presets/
    shared-builders.ts              ← Atomic block builders (shared)
    family-a.ts                     ← Family A: block factories + configs
    family-b.ts                     ← Family B: block factories + configs
    family-c.ts                     ← Family C: block factories + configs
    index.ts                        ← Aggregator: merges all families
  renderers/
    section-shell.tsx               ← ONE parametric renderer for ALL families
    backgrounds.tsx                 ← Shared BgImageLayer + BgVideoLayer
  thumbnails.tsx                    ← ONE factory for ALL families
  index.tsx                         ← Auto-wired barrel (factories, no manual maps)
```

### What each file does

| File | Created | Modified when adding family? | Purpose |
|---|---|---|---|
| `types.ts` | Once per category | Only if new shell types needed | All types, enums, DEFAULT_CONTENT |
| `presets/shared-builders.ts` | Once per category | Only if new block patterns needed | `uid()`, `makeHeading()`, `makeBody()`, etc. |
| `presets/family-{x}.ts` | **Once per family** | Never (except to add/fix variants) | Block factories + `CtaPresetConfig` per variant |
| `presets/index.ts` | Once per category | **Yes** — add import + spread | Aggregates `ALL_PRESETS`, `PRESETS_MAP`, `BLOCK_FACTORIES` |
| `renderers/section-shell.tsx` | Once per category | Only if genuinely new shell type | Parametric renderer driven by config |
| `renderers/backgrounds.tsx` | Once per category | Never | `BgImageLayer`, `BgVideoLayer` |
| `thumbnails.tsx` | Once per category | Never | `createThumbnail(config)` factory |
| `index.tsx` | Once per category | Never | `createLayoutComponent()`, `LAYOUT_TEMPLATES` |

### Adding a new family = minimal touch points

1. **Create**: `presets/family-{x}.ts` (new file)
2. **Update**: `presets/index.ts` (add import + spread into aggregated arrays/maps)
3. **Update**: `controls.ts` (add `FAMILY_X_CONTROL_DEF` + register)

That's it. **3 touches** — 1 new file + 2 updates. No new renderers, no new thumbnails, no new layout wrappers.

---

## 12. Reference — CTA as Worked Example

The CTA category has 3 families with 41 total variants — all rendered by 10 shared files.

### Directory structure (actual)

```
layouts/cta/
  types.ts                          ← Unified: CtaContent, SectionShell, ContentAlign, CtaPresetConfig
  presets/
    shared-builders.ts              ← uid, makeHeading, makeBody, makeTextContent, makeButtonGroup, makeFormActions, makeImage
    family-a.ts                     ← 6 block factories + 6 configs (CTA 1,2,39,40,59,60)
    family-b.ts                     ← 10 block factories + makeColumnsFrame + 10 configs (CTA 13-18,21-22,61-62)
    family-c.ts                     ← 25 block factories + makeContentFrame + 25 configs (CTA 3-6,19-20,25-32,41-44,51-56,65)
    index.ts                        ← Aggregator: ALL_CTA_PRESETS(41), CTA_PRESETS_MAP, CTA_BLOCK_FACTORIES
  renderers/
    section-shell.tsx               ← ONE renderer: handles container, bg-container, card, card-bg, bare, expand
    backgrounds.tsx                 ← BgImageLayer + BgVideoLayer
  thumbnails.tsx                    ← createThumbnail(config) factory
  index.tsx                         ← createLayoutComponent(config) factory, LAYOUT_TEMPLATES, TEMPLATES_MAP
```

### Shell type mapping across families

| Shell Type | Family A | Family B | Family C |
|---|---|---|---|
| `container` | cta-1, cta-2 | cta-13, cta-14, cta-21, cta-22 | — |
| `bg-container` | — | cta-15, cta-16 (image), cta-17, cta-18 (video) | cta-19, cta-20 (image) |
| `card` | cta-39, cta-40 | — | cta-25–32 |
| `card-bg` | — | — | cta-41–44 |
| `bare` | cta-59, cta-60 | — | cta-51–56, cta-65 |
| `expand` | — | cta-61, cta-62 | — |

### How `axes` maps to controls

**Family A** — 4 axes:
```typescript
axes: { style: 'default', assetStyle: 'default', element: 'button', assetPlacement: 'right' }
```

**Family B** — 4 axes:
```typescript
axes: { asset: 'none', background: 'none', assetStyle: 'default', element: 'button' }
```

**Family C** — 6 axes:
```typescript
axes: { text: 'short', style: 'default', background: 'none', element: 'button', asset: 'none', assetStyle: 'default' }
```

### controls.ts entries (actual)

```typescript
// Three separate control defs — each imports its own FAMILY_X_PRESETS_MAP:
CTA_A_CONTROL_DEF → familyId: 'cta-a', extract: return { ...preset.axes }
CTA_B_CONTROL_DEF → familyId: 'cta-b', extract: return { ...preset.axes }
CTA_C_CONTROL_DEF → familyId: 'cta-c', extract: return { ...preset.axes }

// Registry:
CONTROL_REGISTRY = { 'hero': ..., 'cta-a': ..., 'cta-b': ..., 'cta-c': ... }
CATEGORY_FAMILIES = { hero: ['hero'], cta: ['cta-a', 'cta-b', 'cta-c'] }
```

### layouts/index.ts (actual)

```typescript
import { CTA_PRESETS_MAP } from './cta/presets'   // single unified map

// getPresetConfig — ONE lookup for all 41 CTA variants:
const ctaConfig = CTA_PRESETS_MAP[componentId]
if (ctaConfig) return { imageRole: ctaConfig.imageRole, supportsVideo: ctaConfig.supportsVideo }
```

### Adding Family D to CTA — what you'd do

1. **Create** `presets/family-d.ts`: block factories + `CtaPresetConfig` objects with `axes` field
2. **Update** `presets/index.ts`: import + spread `FAMILY_D_*` into aggregated exports
3. **Update** `controls.ts`: add `CTA_D_CONTROL_DEF` + register + add to `CATEGORY_FAMILIES.cta`
4. **Done** — no changes to renderers, thumbnails, index.tsx, or layouts/index.ts

---

## 13. Checklist

Copy this for each new family implementation.

### Adding a family to an EXISTING category (e.g., CTA Family D)

```
## Family: {CATEGORY}-{LETTER} ({N} variants)

### Pre-Flight
- [ ] Read {CATEGORY}-CONTROL-MAP.md — identify family boundaries
- [ ] List all variant IDs: ___
- [ ] Map each variant to a shell type (container, bg-container, card, card-bg, bare, expand)
- [ ] Map each variant's axis values

### Phase 1 — Figma
- [ ] Fetch design context for representative variants (one per shell type)
- [ ] Confirm block hierarchy matches control map expectations

### Phase 2 — Family Presets (1 new file)
- [ ] Create `presets/family-{x}.ts`
- [ ] Import shared builders from `./shared-builders`
- [ ] Create one block factory per variant (`buildCta{N}Blocks()`)
- [ ] Create one `CtaPresetConfig` per variant (with correct shell, align, background, axes)
- [ ] Export: `FAMILY_{X}_PRESETS`, `FAMILY_{X}_PRESETS_MAP`, `FAMILY_{X}_BLOCK_FACTORIES`

### Phase 3 — Wire Aggregator (update 1 file)
- [ ] Update `presets/index.ts` — import + spread into ALL_PRESETS, PRESETS_MAP, BLOCK_FACTORIES
- [ ] Verify: ALL_PRESETS.length now includes new variants

### Phase 4 — Controls (update 1 file)
- [ ] Import `FAMILY_{X}_PRESETS_MAP` from `'./cta/presets'` in `controls.ts`
- [ ] Create `CTA_{X}_CONTROL_DEF` with familyId, axes, resolve, extract
- [ ] extract() = `return { ...preset.axes }` (3 lines)
- [ ] resolve() return count = variant count
- [ ] Add to CONTROL_REGISTRY
- [ ] Add familyId to CATEGORY_FAMILIES array

### Phase 5 — Build & Verify
- [ ] `npm run build` — MUST pass clean
- [ ] Manual test: select a variant → correct axes appear
- [ ] Manual test: toggle axes → correct variant resolves
- [ ] Verify extract() returns {} for foreign IDs
```

### Adding a NEW category (e.g., Features)

```
## Category: {CATEGORY} — Family {LETTER} ({N} variants)

### Pre-Flight
- [ ] Read {CATEGORY}-CONTROL-MAP.md
- [ ] List all variant IDs
- [ ] Map structural groups → shell types (may need new shell types)
- [ ] Map all axis values

### Phase 1 — Figma
- [ ] Fetch design context for each structural group

### Phase 2 — Types (1 new file)
- [ ] Create `{category}/types.ts`
- [ ] Define content interface, DEFAULT_CONTENT
- [ ] Define SectionShell type (reuse from cta or extend)
- [ ] Define `{Cat}PresetConfig` with axes field

### Phase 3 — Shared Builders (1 new file)
- [ ] Create `{category}/presets/shared-builders.ts`
- [ ] Define uid(), resetUid() if needed
- [ ] Define make* functions for the category's block patterns

### Phase 4 — Family Presets (1 new file)
- [ ] Create `{category}/presets/family-{x}.ts`
- [ ] Block factories + preset configs
- [ ] Export maps

### Phase 5 — Aggregator (1 new file)
- [ ] Create `{category}/presets/index.ts`
- [ ] Aggregate and re-export

### Phase 6 — Renderers (1-2 new files)
- [ ] Create `{category}/renderers/section-shell.tsx` — parametric renderer
- [ ] Create `{category}/renderers/backgrounds.tsx` if category uses bg images/video
- [ ] Ensure all structural wrappers are nested frame blocks

### Phase 7 — Thumbnails + Index (2 new files)
- [ ] Create `{category}/thumbnails.tsx` — factory function
- [ ] Create `{category}/index.tsx` — auto-wired barrel with createLayoutComponent factory

### Phase 8 — Controls (update 1 file)
- [ ] Add control def to `controls.ts`
- [ ] Register in CONTROL_REGISTRY + CATEGORY_FAMILIES

### Phase 9 — Global Registry (update 1 file)
- [ ] Import templates in `layouts/index.ts`
- [ ] Add to LAYOUT_REGISTRY
- [ ] Add to getPresetConfig() if needed
- [ ] Add to V2_CATEGORY_META in section-picker.tsx + add-section-sidebar.tsx

### Phase 10 — Build & Verify
- [ ] `npm run build` — MUST pass clean
- [ ] Manual test: all variants render correctly
- [ ] Manual test: controls switch between variants
```
