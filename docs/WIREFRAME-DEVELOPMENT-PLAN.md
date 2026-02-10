# Wireframe Development Plan

> Complete roadmap for building the Scytle wireframe editor with template families, inline editing, and AI content generation.

---

## Architecture Overview

### Core Concept: Template Families + Presets

Instead of building hundreds of individual design components, Scytle uses a **two-tier architecture**:

```
┌─────────────────────────────────────────────────────────────────────┐
│  TIER 1: Template Families (~50 parametric React components)        │
│                                                                     │
│  Each family = 1 Canvas component with rich controls                │
│  e.g. PricingCards, PricingSpotlight, PricingComparison             │
│                                                                     │
│  The Canvas reads controls and renders differently:                 │
│    plans=2, tabs=false → 2 side-by-side cards, no toggle            │
│    plans=3, tabs=true  → 3 cards + monthly/yearly toggle            │
│    plans=1, tabs=true  → single spotlight card + toggle             │
└─────────────────────────────────────────────────────────────────────┘
                              │
                    Presets are just JSON
                              │
┌─────────────────────────────────────────────────────────────────────┐
│  TIER 2: Design Presets (~400+ browsable "designs")                 │
│                                                                     │
│  Each preset = pointer to a family + frozen control values          │
│  e.g. "Pricing 6"  → family: pricing-spotlight, {tabs:true, plans:1}│
│       "Pricing 10" → family: pricing-cards,     {tabs:false,plans:2}│
│       "Pricing 20" → family: pricing-cards,     {tabs:false,plans:3}│
│                                                                     │
│  Adding a new "design" = 3 lines of JSON, zero new code             │
└─────────────────────────────────────────────────────────────────────┘
```

**Why this works**: Relume has 60+ pricing "designs" — but they're really ~5-6 layout families × 10-12 presets each. Same controls (Tabs, Plans, Text), different starting values. We match their library with 1/10th the code.

### Projection Across All Categories

| Category | Families to Build | Presets Each | Total "Designs" |
|---|---|---|---|
| Hero | 4-5 | 10-15 | ~60 |
| Features | 4-5 | 10-12 | ~50 |
| Pricing | 5-6 | 10-12 | ~60 |
| Testimonials | 3-4 | 8-10 | ~35 |
| CTA | 3-4 | 8-10 | ~35 |
| FAQ | 2-3 | 5-8 | ~20 |
| Blog | 3-4 | 8-10 | ~35 |
| Gallery | 3-4 | 6-8 | ~25 |
| Stats | 2-3 | 5-8 | ~20 |
| Team | 2-3 | 5-8 | ~20 |
| Contact | 2-3 | 5-8 | ~20 |
| Footer | 3-4 | 8-10 | ~35 |
| Navbar | 2-3 | 5-8 | ~20 |
| Content | 2-3 | 5-8 | ~20 |
| Logos | 2-3 | 4-6 | ~15 |
| **Total** | **~50** | — | **~470** |

---

## Current State (What Exists Today)

### Completed

| Item | Status | Location |
|---|---|---|
| Unified store (Zustand + immer) | ✅ Done | `store/unified-store.ts` |
| Bidirectional sitemap↔wireframe sync | ✅ Done | Subscription-based sync |
| Design registry + type system | ✅ Done | `lib/designs/types.ts`, `registry.ts` |
| 3 hero designs with controls | ✅ Done | `lib/designs/hero/header-{1,2,3}.tsx` |
| Schema-driven SectionControls sidebar | ✅ Done | `components/wireframe/panels/section-controls.tsx` |
| PlaceholderRenderer (design-first + legacy fallback) | ✅ Done | `components/wireframe/placeholder-renderer.tsx` |
| Controls persist + reset on variant swap | ✅ Done | `store/unified-store.ts` → `setComponent` |

### What Needs Replacing

| Item | Problem | Location |
|---|---|---|
| 18 legacy layout components | Static, don't read controls, hardcoded content | `components/wireframe/wireframe-layouts.tsx` |
| `LEGACY_SECTION_CONTROLS` map | Sidebar renders controls that legacy layouts ignore | `panels/section-controls.tsx` |
| Legacy type-matching in PlaceholderRenderer | Fuzzy string matching, fragile | `placeholder-renderer.tsx` |
| Flat `DesignDefinition` type | No concept of family or preset grouping | `lib/designs/types.ts` |

### Key Files Reference

```
src/
├── lib/designs/
│   ├── types.ts                    # DesignDefinition, CanvasProps, ControlDefinition
│   ├── registry.ts                 # DESIGN_REGISTRY[], helper functions
│   ├── index.ts                    # Re-exports
│   └── hero/
│       ├── index.ts
│       ├── header-1.tsx            # Split layout (4 controls)
│       ├── header-2.tsx            # Centered layout (3 controls)
│       └── header-3.tsx            # With-image layout (3 controls)
├── components/wireframe/
│   ├── wireframe-view.tsx          # Main wireframe view
│   ├── wireframe-layouts.tsx       # 18 LEGACY layout components (to replace)
│   ├── placeholder-renderer.tsx    # Renders sections (design-first + legacy)
│   ├── section-block.tsx           # Section wrapper in canvas
│   ├── panels/
│   │   ├── section-controls.tsx    # Schema-driven + legacy controls
│   │   └── section-panel.tsx       # Sidebar panel with variant picker
│   ├── add-section-sidebar.tsx     # Add section panel
│   └── section-picker.tsx          # Section type picker
├── store/
│   └── unified-store.ts            # Central state (pages, sections, controls)
└── types/
    └── index.ts                    # WireframeSection, WireframeSectionContent, etc.
```

---

## Phase Summary

| Phase | Focus | Depends On | Duration | Status |
|---|---|---|---|---|
| 1 | Foundation & Sync | — | 1-2 weeks | ✅ Complete |
| 2 | Section Controls System | Phase 1 | 1-2 weeks | ✅ Complete |
| 3 | Template Families Architecture | Phase 2 | 1 week | ✅ Complete |
| 4 | Responsive Canvas | Phase 1 | 3-5 days | ✅ Complete |
| 5 | Core Template Families | Phase 3, 4 | 3-4 weeks | ✅ Complete |
| 6 | Inline Editing & Interactions | Phase 5 | 2 weeks | ✅ Complete |
| 7 | AI Content Generation | Phase 6 | 1-2 weeks | ⏳ Not Started |

**Critical path**: 3 → 4 → 5 → 6 → 7

---

## Phase 1: Foundation & Sync ✅ COMPLETE

### What Was Done
- Created unified store (`store/unified-store.ts`) with Zustand + immer + subscribeWithSelector
- Bidirectional sync between sitemap and wireframe views via store subscriptions
- Sections share data model: `WireframeSection` with `componentId`, `controls`, `content`
- Page CRUD operations in single store (add, delete, rename, reorder)
- Section CRUD operations (add, delete, reorder, update controls, set component)

---

## Phase 2: Section Controls System ✅ COMPLETE

### What Was Done
- Added `ControlDefinition` type with `toggle-group` and `switch` widget types
- Added `controlsDef` and `defaultControls` fields to `DesignDefinition`
- All 3 hero Canvas components consume `controls` prop (textAlign, buttonCount, showTagline, assetPlacement)
- `SectionControls` refactored to schema-driven: reads `design.controlsDef`, renders dynamically
- Legacy fallback preserved for unregistered section types
- `setComponent` resets controls to `design.defaultControls` on variant swap
- `PlaceholderRenderer` merges `defaultControls` with `section.controls` before passing to Canvas

---

## Phase 3: Template Families Architecture ✅ COMPLETE

### Goal
Refactor the type system, registry, and rendering pipeline to support the Template Families + Presets model. After this phase, the system is ready to accept 50 parametric family components across all categories — without revisiting architecture.

### Why This Phase Exists
Currently each `DesignDefinition` is a flat standalone entry. There's no way to:
- Group multiple presets under one family
- Browse presets in the sidebar with accurate thumbnails
- Resolve `preset → family → Canvas` in the renderer
- Extend `CanvasProps` for future editing (Phase 6) without breaking all families later

This phase defines ALL interfaces upfront so Phases 5-7 can build on a stable foundation.

### 3.1 Type System Upgrade

**File: `src/lib/designs/types.ts`**

Replace flat `DesignDefinition` with a two-tier model:

```typescript
// ===== TIER 1: TEMPLATE FAMILY =====

/**
 * TemplateFamily — A parametric React component with rich controls.
 * One family generates many visual variations through controls.
 *
 * Example: "pricing-cards" family renders 1-4 pricing cards in a row,
 * with optional tabs toggle, text alignment, etc.
 */
export interface TemplateFamily {
    /** Unique family ID: 'hero-split', 'pricing-cards' */
    id: string

    /** Category: 'hero', 'pricing', 'features', etc. */
    category: DesignCategoryId

    /** Display name: 'Split Hero', 'Pricing Cards' */
    name: string

    /** Short description of the layout pattern */
    description: string

    /** Searchable tags */
    tags?: string[]

    /** The parametric Canvas component */
    Canvas: React.FC<CanvasProps>

    /** Controls this family supports (rendered in sidebar) */
    controlsDef: ControlDefinition[]

    /** Default control values (applied when no preset specifies otherwise) */
    defaultControls: Record<string, string | number | boolean>

    /** Default content structure (field names + placeholder values) */
    defaultContent: Record<string, unknown>

    /** Layout metadata */
    hasImage?: boolean
    hasVideo?: boolean
    hasForm?: boolean
}

// ===== TIER 2: DESIGN PRESET =====

/**
 * DesignPreset — A named snapshot of control values for a family.
 * This is what users browse in the sidebar.
 *
 * Example: "Pricing 10" = family:pricing-cards + {tabs:false, plans:2}
 *          "Pricing 20" = family:pricing-cards + {tabs:false, plans:3, textAlign:'left'}
 */
export interface DesignPreset {
    /** Unique preset ID: 'pricing-10', 'hero-startup-1' */
    id: string

    /** Which family this belongs to */
    familyId: string

    /** Display name shown in sidebar: 'Pricing 10', 'Header 1' */
    name: string

    /** Short description of this specific variation */
    description: string

    /** Frozen control values that define this preset */
    controls: Record<string, string | number | boolean>

    /** Optional content overrides (if different from family defaults) */
    content?: Record<string, unknown>

    /** Thumbnail component for sidebar (renders at preset's control values) */
    Thumbnail: React.FC
}
```

**Extend `CanvasProps` for future phases** (define now so families built in Phase 5 already accept them):

```typescript
export interface CanvasProps {
    /** Editable content (heading, subheading, etc.) */
    content: Record<string, unknown>
    /** Control values (alignment, columns, etc.) */
    controls: Record<string, unknown>
    /** Current viewport */
    viewport: 'desktop' | 'tablet' | 'mobile'
    /** Content change handler (Phase 6 — define now, wire later) */
    onContentChange?: (key: string, value: unknown) => void
    /** Whether inline editing is enabled (Phase 6) */
    editable?: boolean
}
```

**Extend `ControlType` with additional widget types**:

```typescript
export type ControlType =
    | 'toggle-group'    // Existing: segmented button group
    | 'switch'          // Existing: on/off toggle
    | 'slider'          // New: numeric range (e.g., columns: 1-6)
    | 'select'          // New: dropdown (e.g., card style variants)
    | 'color'           // New: color picker (e.g., background theme)
    | 'number'          // New: numeric input (e.g., item count)

export interface ControlDefinition {
    key: string
    label: string
    type: ControlType
    options?: ControlOption[]      // For toggle-group, select
    defaultValue: string | number | boolean
    min?: number                   // For slider, number
    max?: number                   // For slider, number
    step?: number                  // For slider, number
    /** Only show this control when another control has a specific value */
    showWhen?: { key: string; value: string | number | boolean }
}
```

The `showWhen` field is critical — it's how Relume does conditional controls (Relume screenshots show "Show Tab" control only appears when "Tabs" = Yes).

**Tasks:**
- [ ] Define `TemplateFamily` interface in `types.ts`
- [ ] Define `DesignPreset` interface in `types.ts`
- [ ] Add `'tablet'` to viewport type in `CanvasProps`
- [ ] Add `onContentChange` and `editable` to `CanvasProps`
- [ ] Add `slider`, `select`, `color`, `number` to `ControlType`
- [ ] Add `min`, `max`, `step`, `showWhen` to `ControlDefinition`
- [ ] Add `defaultContent` to `TemplateFamily`
- [ ] Keep `DesignDefinition` as deprecated alias for migration period

### 3.2 Registry Refactor

**File: `src/lib/designs/registry.ts`**

Replace flat `DESIGN_REGISTRY` array with family + preset registries:

```typescript
// ===== FAMILY REGISTRY =====
export const FAMILY_REGISTRY: TemplateFamily[] = [
    // Registered by each category's index.ts
]

// ===== PRESET REGISTRY =====
export const PRESET_REGISTRY: DesignPreset[] = [
    // Registered by each category's presets.ts
]

// ===== HELPER FUNCTIONS =====

/** Get a family by ID */
export function getFamilyById(id: string): TemplateFamily | undefined

/** Get all families for a category */
export function getFamiliesForCategory(category: DesignCategoryId): TemplateFamily[]

/** Get a preset by ID */
export function getPresetById(id: string): DesignPreset | undefined

/** Get all presets for a category */
export function getPresetsForCategory(category: DesignCategoryId): DesignPreset[]

/** Get all presets for a specific family */
export function getPresetsForFamily(familyId: string): DesignPreset[]

/** Resolve a preset to its family + merged controls */
export function resolvePreset(presetId: string): {
    family: TemplateFamily
    controls: Record<string, string | number | boolean>
    content: Record<string, unknown>
} | undefined

/** Search presets by name, description, or tags */
export function searchPresets(query: string): DesignPreset[]

/**
 * BACKWARD COMPATIBILITY: getDesignById
 * During migration, still supports old componentId strings.
 * Returns the family directly if the ID matches a family,
 * or resolves preset → family if it matches a preset.
 */
export function getDesignById(id: string): TemplateFamily | undefined
```

**File organization per category**:

```
src/lib/designs/
├── types.ts              # All interfaces
├── registry.ts           # FAMILY_REGISTRY, PRESET_REGISTRY, helpers
├── index.ts              # Re-exports
├── hero/
│   ├── index.ts          # Exports all hero families + presets
│   ├── families/
│   │   ├── hero-split.tsx        # TemplateFamily: split layout
│   │   ├── hero-centered.tsx     # TemplateFamily: centered layout
│   │   ├── hero-image-bg.tsx     # TemplateFamily: full-bleed image
│   │   └── hero-video.tsx        # TemplateFamily: video background
│   └── presets.ts        # All hero DesignPreset[] definitions
├── pricing/
│   ├── index.ts
│   ├── families/
│   │   ├── pricing-cards.tsx
│   │   ├── pricing-spotlight.tsx
│   │   ├── pricing-detailed.tsx
│   │   ├── pricing-comparison.tsx
│   │   └── pricing-minimal.tsx
│   └── presets.ts
├── features/
│   └── ... (same pattern)
└── ... (all categories follow same structure)
```

**Tasks:**
- [ ] Create `FAMILY_REGISTRY` and `PRESET_REGISTRY` arrays
- [ ] Implement all helper functions listed above
- [ ] Implement `resolvePreset()` for preset → family → Canvas resolution
- [ ] Keep `getDesignById()` as backward-compatible wrapper
- [ ] Migrate 3 existing hero designs into new family + preset model
- [ ] Create file structure template for new categories

### 3.3 Migrate Hero Designs to Family Model

Convert the 3 existing hero `DesignDefinition`s into the new model as proof-of-concept.

**Before** (3 separate components):
```
header-1.tsx → standalone DesignDefinition with its own Canvas
header-2.tsx → standalone DesignDefinition with its own Canvas
header-3.tsx → standalone DesignDefinition with its own Canvas
```

**After** (2 families + 3 presets):
```
families/hero-split.tsx    → TemplateFamily with Canvas that handles split layouts
families/hero-centered.tsx → TemplateFamily with Canvas that handles centered + image-below
presets.ts → [
    { id: 'header-1', familyId: 'hero-split', controls: {assetPlacement:'right', ...} },
    { id: 'header-2', familyId: 'hero-centered', controls: {showImage:false, ...} },
    { id: 'header-3', familyId: 'hero-centered', controls: {showImage:true, ...} },
]
```

Header 2 (centered, no image) and Header 3 (centered, with image below) become **presets of the same `hero-centered` family**. The family's Canvas conditionally renders the image based on a `showImage` control.

**Tasks:**
- [ ] Create `hero/families/hero-split.tsx` — merge Header 1's Canvas + extend controls
- [ ] Create `hero/families/hero-centered.tsx` — merge Header 2+3 into one parametric Canvas
- [ ] Create `hero/presets.ts` — define Header 1, 2, 3 as presets with Thumbnails
- [ ] Update `hero/index.ts` — export families + presets
- [ ] Register in `registry.ts`
- [ ] Verify existing sections still render (backward compat via `getDesignById`)
- [ ] Delete old `header-1.tsx`, `header-2.tsx`, `header-3.tsx` after migration

### 3.4 PlaceholderRenderer Upgrade

**File: `src/components/wireframe/placeholder-renderer.tsx`**

Update rendering pipeline to resolve: `section.componentId → preset → family → Canvas`

```typescript
function PlaceholderRenderer({ section, viewport, className }: Props) {
    // Strategy 1: Resolve via preset → family pipeline
    const resolved = useMemo(() => {
        // Try as preset first
        const preset = getPresetById(section.componentId)
        if (preset) {
            const family = getFamilyById(preset.familyId)
            if (family) return { family, presetControls: preset.controls, presetContent: preset.content }
        }
        // Try as family directly (backward compat)
        const family = getFamilyById(section.componentId)
        if (family) return { family, presetControls: {}, presetContent: undefined }
        return null
    }, [section.componentId])

    if (resolved) {
        const { family, presetControls, presetContent } = resolved
        // THREE-LAYER MERGE (lowest → highest priority):
        const effectiveControls = {
            ...family.defaultControls,   // 1. Family defaults
            ...presetControls,           // 2. Preset overrides
            ...(section.controls ?? {}), // 3. User overrides
        }
        const effectiveContent = {
            ...family.defaultContent,
            ...(presetContent ?? {}),
            ...(section.content ?? {}),
        }
        return (
            <family.Canvas
                content={effectiveContent}
                controls={effectiveControls}
                viewport={viewport}
            />
        )
    }

    // Strategy 2: Legacy fallback (removed after Phase 5 Batch 4)
    return <LegacyRenderer section={section} viewport={viewport} />
}
```

**Three-layer merging** is the critical pattern:
1. **Family defaults** — base values the parametric component needs to render
2. **Preset overrides** — curated values that make "Pricing 6" different from "Pricing 10"
3. **User overrides** — what the user changed via sidebar controls after selecting a preset

**Tasks:**
- [ ] Update PlaceholderRenderer with preset → family resolution
- [ ] Implement three-layer control merging
- [ ] Implement three-layer content merging
- [ ] Extract legacy rendering to separate `LegacyRenderer` component
- [ ] Add console warning for unresolved `section.componentId` (helps debug migration)

### 3.5 Store Updates

**File: `src/store/unified-store.ts`**

Update `setComponent` to work with presets:

```typescript
setComponent: (pageId, sectionId, presetId) => {
    set(state => {
        const page = state.wireframe.pages.find(p => p.id === pageId)
        const section = page?.sections.find(s => s.id === sectionId)
        if (!section) return

        section.componentId = presetId

        // Resolve preset → family to get defaults
        const preset = getPresetById(presetId)
        if (preset) {
            const family = getFamilyById(preset.familyId)
            // Reset controls to preset's curated values (user starts fresh)
            section.controls = { ...(preset.controls ?? {}) }
            // Reset content to family defaults + preset overrides
            section.content = {
                ...(family?.defaultContent ?? {}),
                ...(preset.content ?? {}),
            } as WireframeSectionContent
            // Store family reference for sidebar grouping
            section.layoutVariant = preset.familyId
        } else {
            // Try as family directly (backward compat during migration)
            const family = getFamilyById(presetId)
            if (family) {
                section.controls = { ...family.defaultControls }
                section.content = { ...family.defaultContent } as WireframeSectionContent
                section.layoutVariant = family.id
            }
        }
    })
}
```

Also update `addSection` to initialize from preset:

```typescript
addSection: (pageId, presetId, insertIndex) => {
    const preset = getPresetById(presetId)
    const family = preset ? getFamilyById(preset.familyId) : getFamilyById(presetId)

    const newSection: WireframeSection = {
        id: generateId(),
        type: family?.category ?? 'content',
        name: preset?.name ?? family?.name ?? 'New Section',
        componentId: presetId,
        layoutVariant: preset?.familyId ?? presetId,
        isGlobal: false,
        order: insertIndex,
        content: {
            ...(family?.defaultContent ?? {}),
            ...(preset?.content ?? {}),
        } as WireframeSectionContent,
        controls: {
            ...(preset?.controls ?? family?.defaultControls ?? {}),
        },
    }
    // ... insert at position
}
```

**Tasks:**
- [ ] Update `setComponent` to resolve presets via registry
- [ ] Update `addSection` to initialize controls + content from preset
- [ ] Verify `updateSectionControls` still works (shallow merge — no changes needed)

### 3.6 Sidebar: Preset Browser

**File: `src/components/wireframe/panels/section-panel.tsx`**

The variant picker (where user selects "Header 1", "Header 2", etc.) needs to show **presets grouped by family**.

```
┌─────────────────────────────────────────────┐
│  Component                                   │
│  ┌─────────────────────────────────────┐     │
│  │  ◇ Header 1                    >   │     │  ← current preset
│  └─────────────────────────────────────┘     │
│                                              │
│  ┌─ Split Hero ────────────────────────┐     │  ← family group
│  │ [thumb1] [thumb2] [thumb3] [thumb4] │     │
│  │ Header 1  Header 4  Header 7  ...   │     │  ← presets
│  └─────────────────────────────────────┘     │
│  ┌─ Centered Hero ─────────────────────┐     │  ← family group
│  │ [thumb5] [thumb6] [thumb7]          │     │
│  │ Header 2  Header 3  Header 8  ...   │     │  ← presets
│  └─────────────────────────────────────┘     │
│  ┌─ Image Background ─────────────────┐     │  ← family group
│  │ [thumb9] [thumb10]                  │     │
│  │ Header 5  Header 6                  │     │  ← presets
│  └─────────────────────────────────────┘     │
└─────────────────────────────────────────────┘
```

**Tasks:**
- [ ] Refactor variant picker to show presets grouped by family
- [ ] Show preset thumbnails in a horizontal scroll row per family
- [ ] Clicking a preset calls `setComponent(pageId, sectionId, preset.id)`
- [ ] Highlight the currently active preset
- [ ] Show family name as group header

### 3.7 SectionControls: Conditional Controls + New Widgets

**File: `src/components/wireframe/panels/section-controls.tsx`**

Add support for the new `showWhen` field and new control widget types.

```typescript
// Filter controls by showWhen condition
const visibleControls = controlsDef.filter(def => {
    if (!def.showWhen) return true
    const currentValue = effectiveValue(def.showWhen.key)
    return currentValue === def.showWhen.value
})
```

New widget components to build:

| Widget | Type | Renders As |
|---|---|---|
| `SliderWidget` | `slider` | Range input with value label |
| `SelectWidget` | `select` | Dropdown or segmented group |
| `NumberWidget` | `number` | Numeric stepper (+/- buttons) |
| `ColorWidget` | `color` | Color swatches or picker |

**Tasks:**
- [ ] Add `showWhen` filtering logic to visible controls
- [ ] Build `SliderWidget` component (range input, min/max/step)
- [ ] Build `SelectWidget` component (dropdown)
- [ ] Build `NumberWidget` component (stepper)
- [ ] Build `ColorWidget` component (swatch picker)
- [ ] Update control renderer switch to handle new types
- [ ] Keep `LEGACY_SECTION_CONTROLS` for now (removed in Phase 5 Batch 4)

### 3.8 Add Section Sidebar Update

**File: `src/components/wireframe/add-section-sidebar.tsx`**

When adding a new section, the sidebar shows categories → presets (not families).

Flow:
1. User clicks "+ Section"
2. Sidebar shows categories: Hero, Features, Pricing, ...
3. User clicks a category → shows all presets for that category with thumbnails
4. User clicks a preset → section is added with that preset's controls + content

**Tasks:**
- [ ] Update to use `getPresetsForCategory()` instead of `getDesignsForCategory()`
- [ ] Show preset thumbnails in the browsing grid
- [ ] Pass preset ID as `componentId` when adding section
- [ ] Preserve category search/filter functionality

### Phase 3 Deliverables Checklist
- [ ] `TemplateFamily` and `DesignPreset` types fully defined
- [ ] `CanvasProps` extended with `onContentChange`, `editable`, `tablet` viewport
- [ ] `ControlType` extended with `slider`, `select`, `color`, `number`
- [ ] `ControlDefinition` extended with `min`, `max`, `step`, `showWhen`
- [ ] Registry supports families + presets with all helper functions
- [ ] 3 existing hero designs migrated to 2 families + 3 presets
- [ ] PlaceholderRenderer uses preset → family → Canvas pipeline with 3-layer merge
- [ ] Store resolves presets on `setComponent` and `addSection`
- [ ] Sidebar shows presets grouped by family
- [ ] SectionControls supports conditional controls + new widget types
- [ ] All existing functionality preserved (zero regressions)
- [ ] Build passes with zero TypeScript errors

### Files to Create
- `lib/designs/hero/families/hero-split.tsx`
- `lib/designs/hero/families/hero-centered.tsx`
- `lib/designs/hero/presets.ts`

### Files to Modify
- `lib/designs/types.ts`
- `lib/designs/registry.ts`
- `lib/designs/hero/index.ts`
- `components/wireframe/placeholder-renderer.tsx`
- `components/wireframe/panels/section-controls.tsx`
- `components/wireframe/panels/section-panel.tsx`
- `components/wireframe/add-section-sidebar.tsx`
- `store/unified-store.ts`

### Files to Delete (after migration verified)
- `lib/designs/hero/header-1.tsx`
- `lib/designs/hero/header-2.tsx`
- `lib/designs/hero/header-3.tsx`

---

## Phase 4: Responsive Canvas ✅ COMPLETE

### What Was Done
- Built `ViewportFrame` component (Figma Sites style) with clean breakpoint labels and per-page device frame management
- Built `PageViewportRow` for side-by-side viewport frames with add/remove controls per page
- Implemented infinite canvas with CSS-transform zoom (25%-200%) + pan
- Ctrl/Cmd+scroll zoom, space-drag pan, pinch-to-zoom on touch devices
- Zoom indicator in bottom-left corner
- Viewport state (`activeViewports`) stored in unified-store and shared with all Canvas components
- All 45 template families accept `viewport` prop and render responsive layouts for desktop/tablet/mobile
- **Note**: Uses per-page viewport management (Figma Sites model) instead of a global toolbar toggle — more flexible

### Original Goal
The wireframe canvas scales properly across viewport sizes. Desktop frame adapts to browser width. Mobile and tablet previews render at fixed widths with CSS scaling. Zoom and pan controls work smoothly.

### 4.1 Responsive Frame Container

**File: `src/components/wireframe/viewport-frame.tsx`** (create or refactor existing)

```typescript
const VIEWPORT_WIDTHS = {
    desktop: 1440,
    tablet: 768,
    mobile: 375,
} as const

function ViewportFrame({ viewport, children }: ViewportFrameProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const observer = new ResizeObserver(entries => {
            const { width } = entries[0].contentRect
            const targetWidth = VIEWPORT_WIDTHS[viewport]
            const padding = 80
            setScale(Math.min(1, (width - padding) / targetWidth))
        })
        observer.observe(container)
        return () => observer.disconnect()
    }, [viewport])

    return (
        <div ref={containerRef} className="w-full h-full overflow-auto">
            <div
                className="mx-auto origin-top"
                style={{
                    width: VIEWPORT_WIDTHS[viewport],
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                }}
            >
                {children}
            </div>
        </div>
    )
}
```

**Tasks:**
- [ ] Implement `ViewportFrame` with ResizeObserver-based scaling
- [ ] Define viewport width constants (desktop: 1440, tablet: 768, mobile: 375)
- [ ] Frame auto-scales to fit available width without horizontal scroll
- [ ] Frame centers horizontally in the canvas area

### 4.2 Viewport Switcher

**In toolbar area of `wireframe-view.tsx`:**

```
┌────────────────────────────────┐
│  [🖥 Desktop] [📱 Tablet] [📱 Mobile]  │
└────────────────────────────────┘
```

**Tasks:**
- [ ] Desktop / Tablet / Mobile toggle buttons in toolbar
- [ ] Store current viewport in unified-store (shared with PlaceholderRenderer)
- [ ] Smooth width transition when switching (CSS transition)
- [ ] Keyboard shortcuts: `Ctrl+1` Desktop, `Ctrl+2` Tablet, `Ctrl+3` Mobile

### 4.3 Zoom & Pan Controls

```
┌──────────────────────────────────────────┐
│  [-] ────●──── [+]   [Fit]   [100%]     │
│         65%                               │
└──────────────────────────────────────────┘
```

**Tasks:**
- [ ] Zoom slider (25% - 200%)
- [ ] "Fit to screen" button (calculates optimal zoom)
- [ ] "100%" reset button
- [ ] Mouse wheel zoom (Cmd/Ctrl + scroll)
- [ ] Pan with scroll (no modifier) or drag (spacebar + drag)
- [ ] Zoom level persists per session

### Phase 4 Deliverables
- [x] Desktop frame scales to browser width
- [x] Tablet preview at 768px with CSS scaling
- [x] Mobile preview at 375px with CSS scaling
- [x] Smooth viewport transitions
- [x] Mouse wheel zoom (Ctrl/Cmd+scroll) + space-drag pan + pinch zoom
- [x] Zoom indicator with current percentage
- [x] 60fps performance at all zoom levels

### Files to Create/Modify
- `components/wireframe/viewport-frame.tsx` (create or refactor)
- `components/wireframe/wireframe-view.tsx` (add viewport switcher + zoom)
- `components/wireframe/use-keyboard-shortcuts.ts` (add viewport shortcuts)

---

## Phase 5: Core Template Families ✅ COMPLETE

### What Was Done
Built all 15 categories with 45 template families and 71 design presets:

| Category | Families | Presets |
|----------|----------|---------|
| Hero | 4 (split, centered, image-bg, video) | 5 |
| CTA | 3 (banner, split, minimal) | 5 |
| Navbar | 3 (standard, centered, mega) | 5 |
| Footer | 4 (columns, simple, cta, big) | 6 |
| Features | 3 (grid, list, alternating) | 5 |
| Testimonials | 3 (cards, slider, simple) | 5 |
| Pricing | 2 (cards, comparison) | 5 |
| FAQ | 2 (accordion, two-column) | 4 |
| Contact | 3 (split, simple, map) | 5 |
| Content | 3 (text, split, cards) | 5 |
| Gallery | 3 (grid, masonry, carousel) | 4 |
| Team | 3 (grid, cards, simple) | 4 |
| Blog | 3 (grid, list, featured) | 5 |
| Stats | 3 (row, cards, split) | 4 |
| Logos | 3 (row, grid, marquee) | 4 |
| **Total** | **45** | **71** |

**Note**: All families are minimal/neutral wireframes (no dark backgrounds, no accent colors). The style guide feature will auto-apply brand colors later. Additional presets can be added incrementally as JSON — zero new code needed.

**Legacy cleanup remaining**: `wireframe-layouts.tsx` (18 legacy layouts) and `LEGACY_SECTION_CONTROLS` still exist for backward compatibility but can be removed when ready.

### Original Goal
Build all ~50 template families and ~400+ presets across 15 categories. This is the biggest phase — it replaces all 18 legacy layout components and populates the full design library.

### Why Phase 5 After Architecture + Responsive
- Phase 3 gives us the types, registry, and rendering pipeline
- Phase 4 gives us responsive viewport testing
- Now we build the actual components knowing the full interface is stable
- Every family is tested at all 3 viewports as we build it

### Build Order Strategy

Build in this order based on user impact and dependency:

| Batch | Categories | Families | Why This Order |
|---|---|---|---|
| 1 | Hero, CTA, Navbar, Footer | ~14 | Every page needs these — unblocks all user flows |
| 2 | Features, Content, Stats, Logos | ~13 | Core marketing sections — most commonly used |
| 3 | Pricing, Testimonials, FAQ | ~12 | Conversion sections — high business value |
| 4 | Team, Contact, Blog, Gallery | ~12 | Supporting sections — complete the library |

### Template Family File Pattern

Every family follows this exact structure:

```typescript
// lib/designs/{category}/families/{family-id}.tsx
'use client'

import type { TemplateFamily, CanvasProps } from '../../types'
import { cn } from '@/lib/utils'

// ===== CANVAS COMPONENT =====
function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    // Read controls with type-safe defaults
    const textAlign = (controls.textAlign as string) ?? 'center'
    const columns = Number(controls.columns ?? 3)
    const showIcon = controls.showIcon !== false

    // Read content with fallbacks
    const heading = (content.heading as string) ?? 'Section Heading'
    const subheading = (content.subheading as string) ?? 'Supporting text goes here'

    // Responsive breakpoints
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'

    return (
        <section className={cn('py-16 md:py-24 px-6', `text-${textAlign}`)}>
            {/* Content rendered based on controls */}
        </section>
    )
}

// ===== FAMILY DEFINITION =====
export const FamilyName: TemplateFamily = {
    id: '{category}-{variant}',
    category: '{category}',
    name: 'Family Display Name',
    description: 'Layout pattern description',
    tags: ['tag1', 'tag2'],
    Canvas,
    controlsDef: [
        {
            key: 'textAlign',
            label: 'Text',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
            defaultValue: 'center',
        },
        // ... more controls
    ],
    defaultControls: {
        textAlign: 'center',
        // Must match controlsDef keys
    },
    defaultContent: {
        heading: 'Section Heading',
        subheading: 'Supporting text goes here',
        // ALL content fields this family's Canvas reads
    },
    hasImage: true,
}
```

### Preset Definition Pattern

```typescript
// lib/designs/{category}/presets.ts
import type { DesignPreset } from '../types'

// Thumbnails — lightweight scaled-down previews
function Pricing6Thumb() {
    return (
        <div className="w-full aspect-[4/3] bg-white p-1.5 flex flex-col items-center gap-0.5">
            <div className="w-8 h-0.5 bg-gray-300" />
            <div className="w-12 h-1 bg-gray-800" />
            <div className="w-20 h-16 border border-gray-200 rounded mt-1" />
        </div>
    )
}

export const PRICING_PRESETS: DesignPreset[] = [
    {
        id: 'pricing-6',
        familyId: 'pricing-spotlight',
        name: 'Pricing 6',
        description: 'Single card spotlight with tabs',
        controls: { tabs: true, plans: 1, showTab: '1' },
        Thumbnail: Pricing6Thumb,
    },
    {
        id: 'pricing-10',
        familyId: 'pricing-cards',
        name: 'Pricing 10',
        description: '2 side-by-side cards without tabs',
        controls: { tabs: false, plans: 2 },
        Thumbnail: Pricing10Thumb,
    },
    // ... 10+ more presets per category
]
```

---

### Batch 1: Essential Sections (14 families)

> Every page needs a navbar, hero, CTA, and footer. Build these first.

#### Hero (4 families, ~12 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Split Hero | `hero-split` | Text left/right, asset opposite | textAlign, assetPlacement (left/right), buttonCount (0/1/2), showTagline |
| Centered Hero | `hero-centered` | Centered text, optional image below | textAlign, buttonCount, showTagline, showImage |
| Image Background | `hero-image-bg` | Full-bleed image with text overlay | textAlign, buttonCount, overlayDarkness (slider 0-100) |
| Video Hero | `hero-video` | Video background with text overlay | textAlign, buttonCount, autoplay (switch) |

#### CTA (3 families, ~10 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Banner CTA | `cta-banner` | Full-width banner with CTA | textAlign, showSecondaryButton, background (light/dark/accent) |
| Split CTA | `cta-split` | Text + image/asset side by side | assetPlacement (left/right), buttonCount |
| Minimal CTA | `cta-minimal` | Text-only centered | textAlign, buttonCount |

#### Navbar (3 families, ~8 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Standard Nav | `navbar-standard` | Logo left, links center, CTA right | logoPosition (left/center), showCta, showSearch |
| Centered Nav | `navbar-centered` | Logo centered above link row | showCta, showSearch |
| Mega Menu | `navbar-mega` | With dropdown mega menus | logoPosition, showCta, megaColumns (2/3/4) |

#### Footer (4 families, ~10 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Multi-Column | `footer-columns` | 3-5 link columns + bottom bar | columns (3/4/5), showNewsletter, showSocial |
| Simple Footer | `footer-simple` | Single row, minimal links | showSocial, showLegal |
| CTA Footer | `footer-cta` | Newsletter CTA above link columns | columns (3/4), showNewsletter |
| Big Footer | `footer-big` | Logo + desc + columns + bottom bar | columns (3/4/5), showNewsletter, showSocial |

#### Batch 1 Legacy Removals
After batch 1 is complete, delete from `wireframe-layouts.tsx`:
- `NavbarPlaceholder`
- `HeroSplitLayout`, `HeroCenteredLayout`, `HeroWithImageLayout`
- `CTAPlaceholder`
- `FooterPlaceholder`

---

### Batch 2: Core Marketing Sections (13 families)

#### Features (5 families, ~15 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Feature Grid | `features-grid` | Icon/image cards in grid | columns (2/3/4), showIcons, textAlign |
| Feature List | `features-list` | Alternating image + text rows | imagePosition (alternate/left/right), showNumbers |
| Feature Tabs | `features-tabs` | Tab nav switching content panels | tabStyle (underline/pill), imagePosition |
| Feature Cards | `features-cards` | Large cards with descriptions | columns (1/2/3), cardStyle (flat/raised/bordered) |
| Feature Icons | `features-icons` | Icon-focused minimal grid | columns (3/4/6), iconStyle (circle/square/none) |

#### Content (3 families, ~8 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Text Block | `content-text` | Rich text + optional image | textAlign, showImage, imagePosition (left/right/above) |
| Two Column | `content-two-col` | Side-by-side content blocks | reverseOnMobile (switch) |
| Quote Block | `content-quote` | Large pull quote / highlight | textAlign, showAttribution |

#### Stats (3 families, ~8 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Stats Row | `stats-row` | Horizontal stat counters | columns (3/4/5), showLabels, dividers (switch) |
| Stats Cards | `stats-cards` | Stats in card containers | columns (2/3/4), cardStyle (flat/raised) |
| Stats Section | `stats-section` | Stats + supporting text block | textAlign, statsPosition (left/right/below) |

#### Logos (2 families, ~6 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Logo Grid | `logos-grid` | Static logo grid | columns (4/5/6), grayscale (switch) |
| Logo Marquee | `logos-marquee` | Auto-scrolling logo ticker | speed (slow/medium/fast), grayscale, rows (1/2) |

#### Batch 2 Legacy Removals
- `FeaturesGridLayout`, `FeaturesWithImageLayout`
- `ContentPlaceholder`
- `StatsPlaceholder`
- `LogosPlaceholder`

---

### Batch 3: Conversion Sections (12 families)

#### Pricing (5 families, ~15 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Pricing Cards | `pricing-cards` | Equal cards in a row | plans (1/2/3/4), tabs (switch), textAlign, showFeatureList |
| Pricing Spotlight | `pricing-spotlight` | One plan highlighted/centered | plans (1/2/3), tabs, highlightPlan (number), showTab (toggle) |
| Pricing Detailed | `pricing-detailed` | Card with icon + 2-col features | plans (1/2), tabs, showIcon, featureColumns (1/2) |
| Pricing Comparison | `pricing-comparison` | Feature comparison table | plans (2/3/4), tabs, showCheckmarks |
| Pricing Minimal | `pricing-minimal` | Text-only, no card borders | plans (1/2/3), tabs, textAlign |

**Conditional control example for pricing:**
```typescript
controlsDef: [
    { key: 'tabs', label: 'Tabs', type: 'switch', defaultValue: false },
    {
        key: 'showTab',
        label: 'Show Tab',
        type: 'toggle-group',
        options: [{ value: '1', label: '1' }, { value: '2', label: '2' }],
        defaultValue: '1',
        showWhen: { key: 'tabs', value: true },  // Only visible when tabs=true
    },
    { key: 'plans', label: 'Plans', type: 'toggle-group',
      options: [
          { value: '1', label: '1' }, { value: '2', label: '2' },
          { value: '3', label: '3' }, { value: '4', label: '4' },
      ],
      defaultValue: '2',
    },
]
```

#### Testimonials (4 families, ~12 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Testimonial Grid | `testimonials-grid` | Card grid layout | columns (2/3), showRating, showAvatar |
| Testimonial Carousel | `testimonials-carousel` | Sliding carousel | showRating, showAvatar, autoplay |
| Testimonial Single | `testimonials-single` | One large quote | showAvatar, showRating, textAlign |
| Testimonial Wall | `testimonials-wall` | Masonry-style wall | columns (2/3/4), showAvatar |

#### FAQ (3 families, ~8 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| FAQ Accordion | `faq-accordion` | Expandable accordion | columns (1/2), showCategories |
| FAQ Grid | `faq-grid` | Cards, always visible answers | columns (2/3), showIcons |
| FAQ Split | `faq-split` | Heading left, questions right | showCategories |

#### Batch 3 Legacy Removals
- `PricingPlaceholder`
- `TestimonialsPlaceholder`
- `FAQPlaceholder`

---

### Batch 4: Supporting Sections (12 families)

#### Team (3 families, ~8 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Team Grid | `team-grid` | Photo + name card grid | columns (3/4), showBio, showSocial |
| Team Carousel | `team-carousel` | Sliding team cards | showBio, showSocial |
| Team Detailed | `team-detailed` | Large cards with full bio | columns (1/2), showSocial |

#### Contact (3 families, ~8 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Contact Form | `contact-form` | Form + info side by side | formPosition (left/right), showMap |
| Contact Split | `contact-split` | Image + form | assetPlacement (left/right), showPhone, showEmail |
| Contact Simple | `contact-simple` | Centered form only | showAddress, showPhone, showEmail |

#### Blog (3 families, ~10 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Blog Grid | `blog-grid` | Article card grid | columns (2/3), showExcerpt, showAuthor |
| Blog List | `blog-list` | Vertical list + thumbnails | showExcerpt, showDate |
| Blog Featured | `blog-featured` | Large featured + smaller grid | showExcerpt, featuredPosition (top/left) |

#### Gallery (3 families, ~8 presets)

| Family | ID | Layout Pattern | Key Controls |
|---|---|---|---|
| Gallery Grid | `gallery-grid` | Regular image grid | columns (2/3/4), gap (tight/normal/wide), showCaption |
| Gallery Masonry | `gallery-masonry` | Pinterest-style masonry | columns (2/3/4), showCaption |
| Gallery Carousel | `gallery-carousel` | Full-width image carousel | showCaption, showThumbnails |

#### Batch 4 Legacy Removals
- `TeamPlaceholder`
- `ContactPlaceholder`
- `BlogPlaceholder`
- `GalleryPlaceholder`

**After Batch 4**: Delete `wireframe-layouts.tsx` entirely. Remove `LEGACY_SECTION_CONTROLS` from `section-controls.tsx`. Remove all legacy code from `placeholder-renderer.tsx`.

---

### Phase 5 Deliverables
- [x] 45 template families (parametric Canvas components) across 15 categories
- [x] 71 design presets (JSON config entries with Thumbnails)
- [x] Every family supports `viewport` prop (desktop/tablet/mobile)
- [x] Every family declares `controlsDef`, `defaultControls`, `defaultContent`
- [x] Preset thumbnails for sidebar browsing
- [x] `wireframe-layouts.tsx` deleted (zero legacy layouts remaining) — ✅ Done
- [x] `LEGACY_SECTION_CONTROLS` removed from `section-controls.tsx` — ✅ Done
- [x] All legacy type-matching code removed from `placeholder-renderer.tsx` — ✅ Done
- [x] Build passes with zero TypeScript errors

---

## Phase 6: Inline Editing & Interactions ✅ COMPLETE

### Goal
Users can edit content directly in the wireframe canvas — click text to edit, drag to reorder, add/remove items in lists.

### Why Phase 6 After Families
All families accept `onContentChange` and `editable` in their `CanvasProps` (defined in Phase 3). Now we wire it up and update all ~50 family Canvas components to use `EditableText`.

### 6.1 EditableText Component

**File: `src/components/wireframe/editable-text.tsx`** (already exists as stub — enhance)

```typescript
interface EditableTextProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    as?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div'
    className?: string
    editable?: boolean
    multiline?: boolean
}
```

Behavior:
- **Single click**: select element (blue outline)
- **Double click**: enter edit mode (cursor in text)
- **Blur or Enter**: save changes
- **Escape**: cancel changes
- **Empty text**: shows placeholder in gray

**Tasks:**
- [x] Implement `EditableText` with contentEditable
- [x] Handle single-click select vs double-click edit
- [x] Save on blur / Enter, cancel on Escape
- [x] Support multiline (shift+enter for newline)
- [x] Visual states: hover outline, selected outline, editing cursor

### 6.2 Wire EditableText Into All Families

Update each family's Canvas to use `EditableText` when `editable` is true:

```typescript
function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const heading = (content.heading as string) ?? 'Default Heading'

    return editable ? (
        <EditableText
            value={heading}
            onChange={(v) => onContentChange?.('heading', v)}
            as="h1"
            className="text-5xl font-bold"
            editable={editable}
        />
    ) : (
        <h1 className="text-5xl font-bold">{heading}</h1>
    )
}
```

**Tasks:**
- [x] Update all ~50 family Canvas components to use EditableText
- [x] Wire `onContentChange` through PlaceholderRenderer → SectionBlock → store
- [x] Add `updateSectionContent(pageId, sectionId, key, value)` to unified-store
- [x] Content changes persist to store immediately (debounced save to backend)

### 6.3 Drag-to-Reorder Sections

**Dependency**: `@dnd-kit/core`, `@dnd-kit/sortable`

**Tasks:**
- [x] Install @dnd-kit dependencies
- [x] Add drag handles to SectionBlock (visible on hover)
- [x] Drop indicators between sections (blue line)
- [x] Animate reorder smoothly
- [x] Update store order on drop

### 6.4 List Item Management

For families with repeating items (features cards, pricing plans, team members):

**Tasks:**
- [x] "Add item" button within section (e.g., "+ Add feature")
- [x] "Remove item" X button on each item (hover to reveal)
- [x] Drag to reorder items within a section
- [x] `onContentChange` supports array operations: `items[2].heading = '...'`

### 6.5 Image Placeholder Interaction

**Tasks:**
- [x] Click image placeholder → visual feedback (border highlight)
- [x] Future: media picker / AI generation (out of scope here)
- [x] Remove / reset image placeholder
- [x] Alt text editing on double-click

### 6.6 Floating Toolbar

When text is selected in edit mode, show formatting options:

```
┌─────────────────────────────────────────┐
│  [B] [I]  │  [≡] [≡] [≡]  │  [✨ AI]   │
│ Bold Italic  L   C   R    Rewrite       │
└─────────────────────────────────────────┘
```

**Tasks:**
- [x] Floating toolbar appears above selected text
- [x] Bold, italic formatting (stored as markdown in content)
- [x] Text alignment quick-toggle (updates controls)
- [x] "✨ AI Rewrite" button (connects to Phase 7)
- [x] Toolbar auto-positions to stay in viewport bounds

### Phase 6 Deliverables
- [x] EditableText component with click-to-edit behavior
- [x] All ~50 family Canvas components support inline editing
- [x] Content changes persist to store
- [x] Drag-to-reorder sections
- [x] Add/remove items in list-type sections
- [x] Floating formatting toolbar
- [x] Image placeholder management

---

## Phase 7: AI Content Generation

### Goal
AI automatically generates contextual content when sections are added, and users can trigger AI rewrites on any text. The AI uses project context (industry, audience, tone) for coherent copy across the entire wireframe.

### Why Phase 7 Last
AI content depends on:
- Template families existing (to know what `defaultContent` fields to fill)
- Inline editing working (so generated content is immediately editable)
- Store wiring (so AI output persists correctly)

### 7.1 Project Context System

```typescript
interface ProjectContext {
    projectName: string
    industry: string              // "food delivery", "SaaS", "e-commerce"
    targetAudience: string        // "consumers", "businesses", "developers"
    tone: 'professional' | 'casual' | 'playful' | 'technical'
    keywords: string[]            // Extracted from sitemap generation
    existingPages: { name: string; sections: string[] }[]
}
```

**Tasks:**
- [ ] Extract project context from sitemap data + project settings
- [ ] Store context in unified-store (or project-store)
- [ ] Pass context to all AI generation calls

### 7.2 Auto-Generate Content on Section Add

Flow:
1. User drops a "Pricing Cards" preset onto the canvas
2. Section appears immediately with `defaultContent` (instant, no loading)
3. In background: AI generates contextual content for this section's fields
4. Content fields update smoothly (fade transition, no flash)

```typescript
// In addSection action (simplified)
addSection: async (pageId, presetId, insertIndex) => {
    // 1. Add section instantly with defaults
    // ... (section created with family.defaultContent + preset.content)

    // 2. Generate AI content in background
    const aiContent = await generateSectionContent({
        sectionType: family.category,
        familyId: family.id,
        contentFields: Object.keys(family.defaultContent),
        projectContext: get().projectContext,
        pageName: page.name,
        sectionPosition: insertIndex,
        surroundingSections: getSurroundingSections(page, insertIndex),
    })

    // 3. Merge AI content (don't replace user edits)
    set(state => {
        const section = findSection(state, pageId, sectionId)
        if (section) Object.assign(section.content, aiContent)
    })
}
```

**Tasks:**
- [ ] Create `/api/ai/generate-section-content` endpoint
- [ ] Build prompt templates per category (hero, features, pricing, etc.)
- [ ] Include surrounding section context in prompts for coherence
- [ ] Show subtle loading shimmer while generating (content area only)
- [ ] Handle errors gracefully (keep placeholder content, show retry)

### 7.3 AI Rewrite Dialog

Triggered from the floating toolbar's "✨ AI" button or Alt+double-click:

```
┌─────────────────────────────────────────────────────┐
│  ✨ AI Rewrite                                  [×] │
├─────────────────────────────────────────────────────┤
│  Current: "Get started today"                       │
│                                                     │
│  Suggestions:                                       │
│    ○ "Start your free trial now"                    │
│    ○ "Begin your journey today"                     │
│    ○ "Join thousands of happy users"                │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │ Or describe what you want...                  │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│                            [Cancel]  [Apply]        │
└─────────────────────────────────────────────────────┘
```

**Tasks:**
- [ ] Create `/api/ai/rewrite-text` endpoint
- [ ] Build AI rewrite dialog component (popover near selected text)
- [ ] Generate 3 suggestions per request
- [ ] Support custom instruction input
- [ ] Apply selected rewrite via `onContentChange`
- [ ] Keyboard shortcut: Alt+Enter to trigger

### 7.4 Section-Level "Generate Copy" Button

Like Relume's "Generate copy" button at the bottom of section controls:

**Tasks:**
- [ ] Add "✨ Generate Copy" button to section-panel.tsx (below controls)
- [ ] Regenerates ALL content fields for the section at once
- [ ] Shows loading state during generation
- [ ] Preserves user's control settings (only regenerates content, not controls)

### 7.5 Content Generation Prompts

```typescript
const SECTION_CONTENT_PROMPTS: Record<string, string> = {
    hero: `Generate hero section content for a {industry} product.
        Audience: {audience}. Tone: {tone}.
        Fields: heading (6-10 words), subheading (15-25 words),
        tagline (2-4 words), primaryCta (2-4 words), secondaryCta (2-4 words)`,

    pricing: `Generate pricing section content for a {industry} product.
        Plans: {plans} tiers. Audience: {audience}.
        Fields per plan: name, price, period, description,
        features[] (3-5 items), cta text`,

    features: `Generate feature section content for a {industry} product.
        Items: {columns} features. Audience: {audience}.
        Fields: heading, subheading,
        items[].heading (3-5 words), items[].body (10-15 words),
        items[].icon (suggest Lucide icon name)`,

    testimonials: `Generate realistic testimonials for a {industry} company.
        Count: {columns} testimonials.
        Fields: quote (20-40 words), name, title, company, rating (1-5)`,

    // ... prompts for all 15 categories
}
```

**Tasks:**
- [ ] Write prompt templates for all 15 categories
- [ ] Include `contentFields` from family's `defaultContent` in prompts dynamically
- [ ] Parse AI JSON response into correct content field structure
- [ ] Handle AI returning extra/missing fields gracefully (merge, don't crash)
- [ ] Rate limit protection (max 1 generation per section per 5 seconds)

### Phase 7 Deliverables
- [ ] Project context system feeding all AI calls
- [ ] Auto-generate content on section drop (background, non-blocking)
- [ ] AI rewrite dialog with 3 suggestions + custom input
- [ ] "Generate Copy" button per section in sidebar
- [ ] Prompt templates for all 15 categories
- [ ] < 3 second generation time
- [ ] Errors handled gracefully (placeholder content always preserved)

---

## Implementation Timeline

```
Week 1:       Phase 3 — Template Families Architecture
              ├── Day 1-2: Types (TemplateFamily, DesignPreset, CanvasProps, ControlType)
              ├── Day 3:   Registry refactor (FAMILY_REGISTRY, PRESET_REGISTRY, helpers)
              ├── Day 4:   Migrate 3 hero designs to 2 families + 3 presets
              ├── Day 5:   PlaceholderRenderer upgrade (3-layer merge pipeline)
              ├── Day 6:   Store updates (setComponent, addSection)
              └── Day 7:   Sidebar updates (preset browser, conditional controls, new widgets)

Week 2:       Phase 4 — Responsive Canvas
              ├── Day 1-2: ViewportFrame with CSS scaling + ResizeObserver
              ├── Day 3:   Viewport switcher (Desktop/Tablet/Mobile)
              └── Day 4-5: Zoom & pan controls

Week 3-6:    Phase 5 — Core Template Families
              ├── Week 3: Batch 1 — Hero (4), CTA (3), Navbar (3), Footer (4) = 14 families
              ├── Week 4: Batch 2 — Features (5), Content (3), Stats (3), Logos (2) = 13 families
              ├── Week 5: Batch 3 — Pricing (5), Testimonials (4), FAQ (3) = 12 families
              └── Week 6: Batch 4 — Team (3), Contact (3), Blog (3), Gallery (3) = 12 families

Week 7-8:    Phase 6 — Inline Editing & Interactions
              ├── Day 1-2:  EditableText component
              ├── Day 3-5:  Wire EditableText into all ~50 families
              ├── Day 6-7:  Drag-to-reorder sections (@dnd-kit)
              ├── Day 8-9:  List item management (add/remove/reorder items)
              └── Day 10:   Floating toolbar + image placeholders

Week 9-10:   Phase 7 — AI Content Generation
              ├── Day 1-2:  Project context system
              ├── Day 3-5:  Auto-generate on section drop + API endpoint
              ├── Day 6-7:  AI rewrite dialog
              ├── Day 8:    "Generate Copy" per-section button
              └── Day 9-10: Prompt templates for all categories + testing
```

**Total: ~10 weeks from Phase 3 start to full completion.**

---

## Technical Dependencies

### NPM Packages

```bash
# Phase 6: Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Everything else uses existing packages:
- **Tailwind CSS** — all styling
- **Zustand + immer** — state management
- **Radix UI** — UI primitives (shadcn)
- **Lucide React** — icons
- **Google Gemini** — AI content generation

### API Endpoints

| Endpoint | Purpose | Phase |
|---|---|---|
| `/api/ai/generate-section-content` | Auto-generate on section drop | 7 |
| `/api/ai/rewrite-text` | AI rewrite dialog | 7 |
| `/api/ai/suggest-section` | Existing | — |
| `/api/wireframe/generate` | Existing | — |

---

## Success Metrics

| Phase | Metric | Target |
|---|---|---|
| 3 | Architecture migration | 0 regressions, build passes |
| 3 | Preset resolution time | < 1ms |
| 4 | Frame responsiveness | 60fps at all zoom levels |
| 4 | Viewport switch time | < 200ms transition |
| 5 | Library size | 50+ families, 400+ presets |
| 5 | Average build time per family | ~2 hours |
| 5 | Legacy code removed | `wireframe-layouts.tsx` deleted |
| 6 | Edit latency | < 50ms from keystroke to render |
| 6 | Reorder smoothness | 60fps drag animation |
| 7 | AI generation time | < 3 seconds per section |
| 7 | Content quality | Contextual, industry-specific copy |

---

## Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|---|---|
| Create a new Canvas per preset | One parametric Canvas per family; presets are JSON |
| Hardcode content in Canvas | Read ALL text from `content` prop; use `defaultContent` for fallbacks |
| Add controls Canvas doesn't read | Every `controlsDef` entry MUST be consumed by the Canvas |
| Forget `defaultControls` | Every family MUST declare defaults for ALL its controls |
| Forget `defaultContent` | Every family MUST declare ALL content fields its Canvas renders |
| Use string matching for types | Use preset ID → family resolution via registry |
| Build families without 3-viewport testing | Test desktop + tablet + mobile for EVERY family |
| Put preset-specific logic in Canvas | Canvas is generic; presets differ only in control values |
| Skip `showWhen` for conditional controls | Use it to hide irrelevant controls (cleaner sidebar) |
| Import from legacy layouts in new families | New families are self-contained; no legacy dependencies |

---

## Quick Reference: Adding a New Category

### Step 1: Create family files

```
lib/designs/{category}/families/{family-id}.tsx
```

Each file exports a `TemplateFamily` with: Canvas, controlsDef, defaultControls, defaultContent.

### Step 2: Create presets

```
lib/designs/{category}/presets.ts
```

Export `DesignPreset[]` — each preset has: id, familyId, name, controls, Thumbnail.

### Step 3: Create category index

```
lib/designs/{category}/index.ts
```

Export all families and presets from one place.

### Step 4: Register

In `lib/designs/registry.ts`:
- Add families to `FAMILY_REGISTRY`
- Add presets to `PRESET_REGISTRY`

### Step 5: Test

- [ ] Add section via sidebar → presets appear in category grid
- [ ] Select a preset → section renders with correct Canvas + controls
- [ ] Controls render in sidebar from family's `controlsDef`
- [ ] Canvas responds to ALL control changes
- [ ] Three-layer merge works: family defaults < preset overrides < user overrides
- [ ] Works at desktop, tablet, mobile viewports
- [ ] Switching between presets of same family resets controls correctly
- [ ] Switching between presets of different families resets controls correctly

### Step 6: Cleanup

Remove corresponding legacy layout from `wireframe-layouts.tsx` (if it was the last type handled by that layout, delete the function).
