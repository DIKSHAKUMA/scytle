# Family Implementation Playbook

> **Purpose**: Step-by-step action plan for implementing a new family within any V2 layout category. Based on how CTA Families A and B were built end-to-end — from control map to build-passing code.
>
> **Prerequisite**: A completed `{CATEGORY}-CONTROL-MAP.md` for the target category (produced by the [Relume Control Mapping Playbook](RELUME-CONTROL-MAPPING-PLAYBOOK.md)).

---

## Table of Contents

1. [Overview — What "Implementing a Family" Means](#1-overview)
2. [Pre-Flight — Read the Control Map](#2-pre-flight--read-the-control-map)
3. [Phase 1 — Fetch Figma Designs](#3-phase-1--fetch-figma-designs)
4. [Phase 2 — Create Type Definitions](#4-phase-2--create-type-definitions)
5. [Phase 3 — Create Preset Configs + Block Factories](#5-phase-3--create-preset-configs--block-factories)
6. [Phase 4 — Create Section Renderers](#6-phase-4--create-section-renderers)
7. [Phase 5 — Create Layout & Thumbnail Wrappers](#7-phase-5--create-layout--thumbnail-wrappers)
8. [Phase 6 — Wire the Category Index](#8-phase-6--wire-the-category-index)
9. [Phase 7 — Add Family-Scoped Control Def](#9-phase-7--add-family-scoped-control-def)
10. [Phase 8 — Register in Global Layout System](#10-phase-8--register-in-global-layout-system)
11. [Phase 9 — Build & Verify](#11-phase-9--build--verify)
12. [Reference — File Naming Conventions](#12-reference--file-naming-conventions)
13. [Reference — CTA Implementation as Worked Example](#13-reference--cta-as-worked-example)
14. [Checklist — Copy & Paste per Family](#14-checklist)

---

## 1. Overview

A **family** is a group of layout variants within a category that share the same visual structure and are navigable through control axes. For example:

| Family | Category | Variants | Axes |
|--------|----------|----------|------|
| CTA-A | cta | 6 (CTA 1,2,39,40,59,60) | Style, Asset Style, Element |
| CTA-B | cta | 10 (CTA 13–18,21–22,61–62) | Asset, Background/Asset Style, Element |
| Hero | hero | 5 (hero-1,3,5,44,57) | Layout, Asset, Placement |

Each family produces **7-11 files** across the codebase. The control system ensures that when a user selects a section from Family A, only Family A's axes appear in the controls panel — never Family B's.

### Architecture Recap

```
controls.ts          ← Family-scoped LayoutControlDef (one per family)
  CONTROL_REGISTRY   ← Record<familyId, LayoutControlDef>
  CATEGORY_FAMILIES  ← Record<LayoutCategory, familyId[]>

layouts/{category}/  ← All family files live here
  types.ts           ← First family's types (or types-{suffix}.ts for subsequent)
  presets.ts         ← Preset configs + block factory functions
  {cat}-section.tsx  ← Section renderer components
  {cat}-layouts.tsx  ← Named layout re-exports (one per variant)
  {cat}-thumbnails.tsx ← Thumbnail components
  index.ts           ← Barrel: merges all families, builds LAYOUT_TEMPLATES[]

layouts/index.ts     ← Global registry (import + register)
layouts/controls.ts  ← Control defs (add family def + registry entries)
```

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

**Rule**: If an axis value changes the HTML structure → it needs a separate `buildCtaXBlocks()` factory. If it only changes styling → same factory, different config field.

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

## 4. Phase 2 — Create Type Definitions

**File**: `layouts/{category}/types-{suffix}.ts` (or `types.ts` if first family)

### 4A. Define content interface

```typescript
export interface Cta{X}Content {
    heading: string
    body: string
    primaryButton: string
    secondaryButton: string
    inputPlaceholder: string  // for form variants
    submitButton: string      // for form variants
    termsText: string         // for form variants
}
```

Include ALL text content that appears in any variant. This is the content contract.

### 4B. Define default content

```typescript
export const DEFAULT_CONTENT_{X}: Cta{X}Content = {
    heading: 'Medium length heading goes here',
    body: 'Lorem ipsum dolor sit amet...',
    // ...sensible placeholder text
}
```

### 4C. Define layout variants enum

One value per preset (variant ID):

```typescript
export type Cta{X}Layout =
    | 'textonly-none-button'     // CTA 13
    | 'textonly-none-form'       // CTA 14
    | 'textonly-image-button'    // CTA 15
    // ... one per variant
```

### 4D. Define preset config interface

```typescript
export interface Cta{X}PresetConfig {
    id: string           // e.g. 'cta-13'
    name: string         // e.g. 'CTA 13'
    description: string
    layout: Cta{X}Layout
    tags: string[]
    imageRole: ImageRole  // from '../../tokens'
    supportsVideo: boolean

    // Family-specific discriminators (derived from control map axes):
    sectionStyle: 'text-only' | 'stacked' | 'expand'  // structural group
    background: 'none' | 'image' | 'video'             // CSS-only distinction
    element: 'button' | 'form'                           // action block type
}
```

**Key rule**: Every axis value that affects `resolve()` or `extract()` in the control def MUST have a corresponding field in the preset config. This is how `extract(layoutId)` reads back axis values from a preset.

---

## 5. Phase 3 — Create Preset Configs + Block Factories

**File**: `layouts/{category}/presets-{suffix}.ts` (or `presets.ts` if first family)

### 5A. Block helper functions

Create local helpers for reusable blocks. These are NOT exported — they're internal to the preset file.

```typescript
let _uid = 0
function uid(): string { return `blk-${++_uid}` }
function resetUid() { _uid = 0 }

function makeHeading(): Block { ... }
function makeBody(): Block { ... }
function makeButtonGroup(): Block { ... }
function makeFormActions(): Block { ... }
function makeImage(): Block { ... }
```

**Shared structural patterns** get their own helper. For CTA-B, `makeColumnsFrame(actions)` created the two-column (heading | body+actions) layout used by all 10 variants:

```typescript
function makeColumnsFrame(actions: Block): Block {
    return {
        id: uid(), type: 'frame',
        children: [
            { id: uid(), type: 'heading', ... },  // left column
            {
                id: uid(), type: 'frame',          // right column
                children: [
                    { id: uid(), type: 'text', ... },
                    actions,
                ],
            },
        ],
    }
}
```

### 5B. Block factory functions

One exported function per variant. Each returns `Block[]` (the root-level blocks for that section).

```typescript
export function buildCta13Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeButtonGroup())]
}

export function buildCta14Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeFormActions())]
}
```

**CRITICAL — Nested Frame Block Trees**: Every structural wrapper `<div>` in the layout MUST be a `frame` block with `children: Block[]`. The section renderer walks the tree via `<RenderBlock>`. No hardcoded wrapper divs in JSX. See WIREFRAME-V2-ARCHITECTURE.md Section 3C.

### 5C. Preset config objects

One exported const per variant:

```typescript
export const CTA_13_CONFIG: CtaBPresetConfig = {
    id: 'cta-13',
    name: 'CTA 13',
    description: 'Two-column CTA with buttons, no background',
    layout: 'textonly-none-button',
    tags: ['cta', 'buttons', 'minimal'],
    imageRole: 'none',
    supportsVideo: false,
    sectionStyle: 'text-only',
    background: 'none',
    element: 'button',
}
```

### 5D. Export aggregated maps

```typescript
export const ALL_CTA_B_PRESETS = [CTA_13_CONFIG, CTA_14_CONFIG, ...]

export const CTA_B_PRESETS_MAP: Record<string, CtaBPresetConfig> = Object.fromEntries(
    ALL_CTA_B_PRESETS.map(p => [p.id, p])
)

export const CTA_B_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'cta-13': buildCta13Blocks,
    'cta-14': buildCta14Blocks,
    // ...all variants
}
```

---

## 6. Phase 4 — Create Section Renderers

**File**: `layouts/{category}/{cat}-{suffix}-section.tsx` (or `{cat}-section.tsx` if first family)

One component per **structural group** (NOT per variant). All variants within a structural group share the same JSX — they differ only in their blocks.

### 6A. Required imports

```typescript
import { useEffect } from 'react'
import type { LayoutProps } from '../types'
import { RenderBlock } from '../../blocks'
import type { Block } from '../../blocks/types'
import { SectionSelectionWrapper } from '../../selection'
import { SectionIdContext } from '../../selection/contexts'
import { useSelectionStore } from '@/store/selection-store'
```

### 6B. Register section blocks hook

Every section component MUST register its blocks for the selection system:

```typescript
function useRegisterSectionBlocks(sectionId: string, blocks?: Block[]) {
    const registerSectionBlocks = useSelectionStore(s => s.registerSectionBlocks)
    useEffect(() => {
        if (blocks?.length) registerSectionBlocks(sectionId, blocks)
    }, [sectionId, blocks, registerSectionBlocks])
}
```

### 6C. Section component pattern

```typescript
export function CtaBTextOnly({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)
    return (
        <SectionIdContext value={sectionId}>
            <section className={cn('py-28 @max-sm:!py-16', className)}>
                <SectionSelectionWrapper sectionId={sectionId}>
                    <div className="mx-auto w-full max-w-[1312px] px-20 @max-sm:!px-6">
                        {blocks?.map(block => (
                            <RenderBlock key={block.id} block={block} />
                        ))}
                    </div>
                </SectionSelectionWrapper>
            </section>
        </SectionIdContext>
    )
}
```

**Key patterns**:
- `@container` queries use `@max-sm:!` prefix for mobile breakpoints
- Standard max-width: `max-w-[1312px]`
- Standard padding: `px-20 @max-sm:!px-6`
- Standard vertical padding: `py-28 @max-sm:!py-16`
- Blocks are rendered via `blocks?.map(block => <RenderBlock key={block.id} block={block} />)`
- The section renderer does NOT add structural wrapper divs — all structure is in the block tree

### 6D. Structural variations

Different structural groups have different JSX:

- **Text-Only**: Single container with blocks
- **Stacked**: Container with blocks, full-width image below
- **Expand**: Content blocks in padded container, last block (image) rendered full-bleed outside container

For Expand-style layouts, the section component splits the blocks array:

```typescript
export function CtaBExpand({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)
    const contentBlocks = blocks?.slice(0, -1) ?? []
    const imageBlock = blocks?.[blocks.length - 1]
    return (
        <SectionIdContext value={sectionId}>
            <section className={cn('py-28 @max-sm:!py-16', className)}>
                <SectionSelectionWrapper sectionId={sectionId}>
                    {/* Padded content */}
                    <div className="mx-auto max-w-[1312px] px-20 @max-sm:!px-6">
                        {contentBlocks.map(block => (
                            <RenderBlock key={block.id} block={block} />
                        ))}
                    </div>
                    {/* Full-bleed image */}
                    {imageBlock && <RenderBlock block={imageBlock} />}
                </SectionSelectionWrapper>
            </section>
        </SectionIdContext>
    )
}
```

---

## 7. Phase 5 — Create Layout & Thumbnail Wrappers

### 7A. Layout re-exports

**File**: `layouts/{category}/{cat}-{suffix}-layouts.tsx`

One named component per variant. These map preset IDs to their structural renderer:

```typescript
import { CtaBTextOnly, CtaBStacked, CtaBExpand } from './cta-b-section'
import type { LayoutProps } from '../types'

export function Cta13Layout(props: LayoutProps) { return <CtaBTextOnly {...props} /> }
export function Cta14Layout(props: LayoutProps) { return <CtaBTextOnly {...props} /> }
// ...
export function Cta21Layout(props: LayoutProps) { return <CtaBStacked {...props} /> }
export function CtaB61Layout(props: LayoutProps) { return <CtaBExpand {...props} /> }
```

### 7B. Thumbnail components

**File**: `layouts/{category}/{cat}-{suffix}-thumbnails.tsx`

Icon-based thumbnails (until real Figma PNGs are downloaded):

```typescript
import { Columns2, Image, Maximize2, ... } from 'lucide-react'

function IconThumb({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-1 p-2 text-neutral-500">
            <Icon size={24} strokeWidth={1.5} />
            <span className="text-[10px] leading-tight">{label}</span>
        </div>
    )
}

export function Cta13Thumbnail() { return <IconThumb icon={Columns2} label="CTA 13" /> }
// ... one per variant
```

---

## 8. Phase 6 — Wire the Category Index

**File**: `layouts/{category}/index.ts`

If this is the **first family** in a new category, create it from scratch. If adding to an existing category, **merge** into the existing index.

### New category index

```typescript
import type { LayoutTemplate } from '../types'
import { XLayout, YLayout } from './{cat}-layouts'
import { XThumbnail, YThumbnail } from './{cat}-thumbnails'
import { ALL_PRESETS, BLOCK_FACTORIES } from './presets'

const COMPONENT_MAP: Record<string, React.FC<import('../types').LayoutProps>> = {
    '{cat}-1': XLayout,
    '{cat}-2': YLayout,
}

const THUMBNAIL_MAP: Record<string, React.FC> = {
    '{cat}-1': XThumbnail,
    '{cat}-2': YThumbnail,
}

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_PRESETS.map(preset => ({
    id: preset.id,
    name: preset.name,
    category: '{cat}',
    description: preset.description,
    component: COMPONENT_MAP[preset.id] ?? XLayout,
    defaultBlocks: BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: THUMBNAIL_MAP[preset.id] ?? XThumbnail,
}))
```

### Adding a second family to existing category

Merge the new family's imports into existing maps:

```typescript
// Add to existing COMPONENT_MAP:
'cta-13': Cta13Layout,
'cta-14': Cta14Layout,

// Merge ALL_PRESETS:
const ALL_PRESETS = [...ALL_CTA_PRESETS, ...ALL_CTA_B_PRESETS]

// Merge BLOCK_FACTORIES:
const ALL_BLOCK_FACTORIES = { ...CTA_BLOCK_FACTORIES, ...CTA_B_BLOCK_FACTORIES }
```

---

## 9. Phase 7 — Add Family-Scoped Control Def

**File**: `layouts/controls.ts`

This is the critical integration step that makes controls show only the correct family's axes.

### 9A. Import the family's preset map

```typescript
import { CTA_B_PRESETS_MAP } from './cta/presets-b'
```

### 9B. Create the family control def

```typescript
const CTA_B_CONTROL_DEF: LayoutControlDef = {
    category: 'cta',        // parent category
    familyId: 'cta-b',      // unique family ID
    axes: [ ... ],           // ONLY this family's axes
    resolve(values) { ... }, // ONLY resolves to this family's variant IDs
    extract(layoutId) { ... }, // ONLY checks this family's preset map
}
```

### 9C. Translate control map to axes

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

### 9D. Implement `resolve(values)`

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

### 9E. Implement `extract(layoutId)`

Reverse of resolve — reads a preset config and returns axis values:

```typescript
extract(layoutId) {
    const preset = CTA_B_PRESETS_MAP[layoutId]
    if (!preset) return {}   // ← CRITICAL: return empty for unknown IDs
    return {
        element: preset.element,
        asset: preset.sectionStyle === 'text-only' ? 'none' : 'image',
        background: preset.background,
        assetStyle: preset.sectionStyle === 'expand' ? 'expand' : 'default',
    }
},
```

**Critical rule**: `extract()` MUST return `{}` (empty object) for any layout ID that doesn't belong to this family. The registry uses `Object.keys(extracted).length > 0` to determine ownership. Returning anything non-empty for a foreign ID will cause incorrect family matching.

### 9F. Register in CONTROL_REGISTRY and CATEGORY_FAMILIES

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

### 9G. Verify no cross-family leakage

After implementation, manually test:
1. Select a Family A variant → only Family A axes should appear
2. Select a Family B variant → only Family B axes should appear
3. Toggle each axis → correct variant should resolve (check preset ID)
4. `extract()` on every variant ID should return valid values
5. `extract()` on a foreign family's ID should return `{}`

---

## 10. Phase 8 — Register in Global Layout System

### 10A. `layouts/index.ts` — Import + register

```typescript
import { LAYOUT_TEMPLATES as CTA_TEMPLATES } from './cta'

export const LAYOUT_REGISTRY: Partial<LayoutRegistry> = {
    hero: HERO_TEMPLATES,
    cta: CTA_TEMPLATES,   // ← already merged both families inside cta/index.ts
}
```

### 10B. `layouts/index.ts` — Add to `getPresetConfig()` if needed

If the new family has image/video config, add a lookup:

```typescript
export function getPresetConfig(componentId: string): PresetImageConfig | undefined {
    // ...existing lookups...
    const ctaBConfig = CTA_B_PRESETS_MAP[componentId]
    if (ctaBConfig) return { imageRole: ctaBConfig.imageRole, supportsVideo: ctaBConfig.supportsVideo }
    return undefined
}
```

### 10C. No changes needed in consumers

The following files do NOT need changes when adding a new family to an existing category:

- **`section-picker.tsx`** — Already iterates all families via `getControlDefsForCategory()`
- **`add-section-sidebar.tsx`** — Already flatMaps across all family defs
- **`section-controls.tsx`** — Already uses `getControlDefForLayout(componentId)` which iterates all registry entries

If adding a **new category** (not just a new family), also add it to `V2_CATEGORY_META` in both `section-picker.tsx` and `add-section-sidebar.tsx`.

---

## 11. Phase 9 — Build & Verify

```bash
cd scytle && npm run build
```

Build MUST pass clean. Common errors at this stage:

| Error | Cause | Fix |
|---|---|---|
| `Module not found` | Missing import in index.ts | Add import |
| `Type 'X' is not assignable` | Preset config missing required field | Add field to config object |
| `Property does not exist on type` | Wrong preset map type | Check which map you're indexing |
| Duplicate identifier | Two families export same name | Use suffixed names (e.g., `CtaB61Layout` not `Cta61Layout`) |

---

## 12. Reference — File Naming Conventions

### First family in a category

```
layouts/{category}/
  types.ts              ← CtaContent, CtaPresetConfig, DEFAULT_CONTENT
  presets.ts            ← block factories + preset configs + maps
  {cat}-section.tsx     ← section renderer components
  {cat}-layouts.tsx     ← named layout re-exports
  {cat}-thumbnails.tsx  ← thumbnail components
  index.ts             ← barrel exports + LAYOUT_TEMPLATES
```

### Second+ family in same category

```
layouts/{category}/
  types-{suffix}.ts     ← CtaBContent, CtaBPresetConfig, DEFAULT_CONTENT_B
  presets-{suffix}.ts   ← separate block factories + preset configs
  {cat}-{suffix}-section.tsx    ← separate section renderers
  {cat}-{suffix}-layouts.tsx    ← separate named re-exports
  {cat}-{suffix}-thumbnails.tsx ← separate thumbnails
  index.ts              ← UPDATED — merge both families
```

**Suffix convention**: Use lowercase family letter. CTA Family B → suffix is `b`. So: `types-b.ts`, `presets-b.ts`, `cta-b-section.tsx`, etc.

---

## 13. Reference — CTA as Worked Example

### Family A (6 variants) — Files created

| File | Purpose | Key exports |
|---|---|---|
| `cta/types.ts` | Content interface, layout enum, preset config type | `CtaContent`, `CtaPresetConfig`, `DEFAULT_CONTENT` |
| `cta/presets.ts` | 6 block factories + 6 config objects + maps | `buildCta1Blocks()`, ..., `CTA_PRESETS_MAP`, `CTA_BLOCK_FACTORIES` |
| `cta/cta-section.tsx` | 3 renderers: `CtaNormal`, `CtaCard`, `CtaExpand` | Split-image layout with 3 structural styles |
| `cta/cta-layouts.tsx` | 6 named wrappers | `Cta1Layout`, `Cta39Layout`, `Cta59Layout`, etc. |
| `cta/cta-thumbnails.tsx` | 6 icon thumbs | `Cta1Thumbnail`, etc. |

### Family B (10 variants) — Files created

| File | Purpose | Key exports |
|---|---|---|
| `cta/types-b.ts` | Content interface + preset config with `sectionStyle`, `background` fields | `CtaBContent`, `CtaBPresetConfig`, `DEFAULT_CONTENT_B` |
| `cta/presets-b.ts` | 10 factories + shared `makeColumnsFrame()` + 10 configs + maps | `buildCta13Blocks()`, ..., `CTA_B_PRESETS_MAP`, `CTA_B_BLOCK_FACTORIES` |
| `cta/cta-b-section.tsx` | 3 renderers: `CtaBTextOnly`, `CtaBStacked`, `CtaBExpand` | Two-column text layout with 3 structural styles |
| `cta/cta-b-layouts.tsx` | 10 named wrappers | `Cta13Layout`, `Cta21Layout`, `CtaB61Layout`, etc. |
| `cta/cta-b-thumbnails.tsx` | 10 icon thumbs | `Cta13Thumbnail`, etc. |

### Merged index.ts

`cta/index.ts` imports both families and merges:
- `COMPONENT_MAP` = { ...A layouts, ...B layouts }
- `THUMBNAIL_MAP` = { ...A thumbnails, ...B thumbnails }
- `ALL_PRESETS` = [...ALL_CTA_PRESETS, ...ALL_CTA_B_PRESETS]
- `ALL_BLOCK_FACTORIES` = { ...CTA_BLOCK_FACTORIES, ...CTA_B_BLOCK_FACTORIES }
- `LAYOUT_TEMPLATES` built from merged ALL_PRESETS

### controls.ts entries

```typescript
// Two separate control defs:
CTA_A_CONTROL_DEF → familyId: 'cta-a', axes: [style, assetStyle, element, assetPlacement]
CTA_B_CONTROL_DEF → familyId: 'cta-b', axes: [asset, background, assetStyle, element]

// Registry:
CONTROL_REGISTRY = { 'hero': ..., 'cta-a': CTA_A_CONTROL_DEF, 'cta-b': CTA_B_CONTROL_DEF }
CATEGORY_FAMILIES = { hero: ['hero'], cta: ['cta-a', 'cta-b'] }
```

---

## 14. Checklist

Copy this for each new family implementation:

```
## Family: {CATEGORY}-{LETTER} ({N} variants)

### Pre-Flight
- [ ] Read {CATEGORY}-CONTROL-MAP.md — identify family boundaries
- [ ] List all variant IDs: ___
- [ ] Identify structural groups (2-4 distinct section layouts)
- [ ] Map each axis to implementation (structural vs CSS-only)

### Phase 1 — Figma
- [ ] Fetch design context for each structural group
- [ ] Confirm block hierarchy matches control map expectations

### Phase 2 — Types
- [ ] Create types-{suffix}.ts with content interface, layout enum, preset config
- [ ] Verify preset config has fields for every axis used in resolve/extract

### Phase 3 — Presets
- [ ] Create presets-{suffix}.ts with block helpers
- [ ] Create one block factory per variant
- [ ] Create one preset config per variant
- [ ] Export ALL_PRESETS, PRESETS_MAP, BLOCK_FACTORIES

### Phase 4 — Section Renderers
- [ ] Create {cat}-{suffix}-section.tsx with one component per structural group
- [ ] Verify each component: SectionIdContext, SectionSelectionWrapper, useRegisterSectionBlocks
- [ ] Verify nested frame block tree pattern (no hardcoded wrapper divs)

### Phase 5 — Layouts & Thumbnails
- [ ] Create {cat}-{suffix}-layouts.tsx — one named wrapper per variant
- [ ] Create {cat}-{suffix}-thumbnails.tsx — one thumbnail per variant

### Phase 6 — Category Index
- [ ] Update/create {category}/index.ts — merge maps, LAYOUT_TEMPLATES
- [ ] Verify all variant IDs appear in COMPONENT_MAP, THUMBNAIL_MAP, BLOCK_FACTORIES

### Phase 7 — Controls
- [ ] Add import of new PRESETS_MAP to controls.ts
- [ ] Create {FAMILY}_CONTROL_DEF with familyId, axes, resolve, extract
- [ ] Add to CONTROL_REGISTRY keyed by familyId
- [ ] Add familyId to CATEGORY_FAMILIES array
- [ ] Verify extract() returns {} for foreign IDs
- [ ] Verify resolve() return count = variant count

### Phase 8 — Global Registry
- [ ] Add/update import in layouts/index.ts
- [ ] Add to LAYOUT_REGISTRY (if new category)
- [ ] Add to getPresetConfig() if family has image/video

### Phase 9 — Build
- [ ] npm run build — MUST pass clean
- [ ] Manual test: select a variant, verify correct axes appear
- [ ] Manual test: toggle axes, verify correct variant resolves
```
