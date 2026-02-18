# Scytle Wireframe V2 — Architecture & Implementation Plan

> **Status**: Planning  
> **Created**: Feb 18 2026  
> **Goal**: Rebuild the wireframe editor with composable blocks, a design token system, Figma-like layer selection, and a full style guide editor — so we build once and never rework.

---

## Table of Contents

1. [Why V2](#1-why-v2--problems-with-v1)
2. [Core Architecture: 3-Layer Separation](#2-core-architecture-3-layer-separation)
3. [Phase 1: Design Token System + Block Primitives](#3-phase-1-design-token-system--block-primitives)
4. [Phase 2: Selection + Layer Interaction](#4-phase-2-selection--layer-interaction)
5. [Phase 3: Style Guide Editor](#5-phase-3-style-guide-editor)
6. [Phase 4: Advanced Features](#6-phase-4-advanced-features)
7. [Data Model](#7-data-model)
8. [Build Order](#8-build-order)
9. [Legacy Family Migration Strategy](#9-legacy-family-migration-strategy)
10. [File Structure](#10-file-structure)

---

## 1. Why V2 — Problems With V1

### Current Architecture (V1)

Every "family" is a **monolithic Canvas component** with hardcoded styles:

```tsx
// V1: style baked into structure — impossible to theme
<h1 className="text-4xl font-bold text-gray-900">...</h1>
<div className="bg-gray-800 text-white px-5 py-2.5 rounded">Button</div>
<div className="bg-gray-100 border border-gray-200 flex items-center justify-center">
    <ImageIcon className="w-12 h-12 text-gray-300" />
</div>
```

### User Feedback That V1 Cannot Address

| # | Feedback | Why V1 Can't Do It |
|---|----------|--------------------|
| 1 | **UI misalignment / visual quality** across 90+ families | Each family was hand-coded rapidly; inconsistent spacing, sizing, proportions. Fixing requires touching every file individually. |
| 2 | **Shuffle / mix components** — take heading from Section A, layout from Section B | Families are monolithic; you can't extract a heading from one and plug it into another. |
| 3 | **Delete any layer** in a component | Only possible via toggle controls (`showTagline`, `showImage`). No true layer deletion. |
| 4 | **Cmd+C → Cmd+V into Figma** should drop exact design | No serialization to Figma-compatible format exists. |
| 5 | **Figma-like layer selection** — single click selects section, double-click enters to select inner layer | No selection model exists; `EditableText` is the only interactive element. |

### Future Requirements (Style Guide Phase) That V1 Can't Support

| # | Requirement | Problem |
|---|-------------|---------|
| 6 | **Color themes** — dark/light toggle, shuffle palettes, per-section color scheme | Colors are hardcoded (`text-gray-900`, `bg-gray-800`) in every family. |
| 7 | **Typography** — change heading/body fonts, weight, size, shuffle pairs | Font classes are inline in every family. |
| 8 | **Button & Card styling** — rounded/sharp/brick/gradient, shuffle | Button/card styles are inline per-family. |
| 9 | **Concepts** — multiple style variations of same wireframe | No separation between structure and style. |
| 10 | **Image controls** — ratio, position, fill, shape, overlay, foreground | Image placeholders are simple divs with no property system. |

### Root Cause

**Structure, content, and style are tangled into one component.** V2 separates all three.

---

## 2. Core Architecture: 3-Layer Separation

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: STRUCTURE (Layout Templates)                   │
│  "Where things go"                                       │
│  Split, centered, grid, stacked, mosaic...               │
│  Pure spatial arrangement — no colors, no fonts           │
├─────────────────────────────────────────────────────────┤
│  LAYER 2: CONTENT (Composable Blocks)                    │
│  "What things are"                                       │
│  HeadingBlock, TextBlock, ButtonBlock, ImageBlock...     │
│  Each block is independently selectable, moveable,       │
│  deletable, copy/paste-able                              │
├─────────────────────────────────────────────────────────┤
│  LAYER 3: STYLE (Design Tokens via CSS Variables)        │
│  "How things look"                                       │
│  Colors, fonts, radius, card styles, button styles       │
│  One change here repaints every section instantly         │
└─────────────────────────────────────────────────────────┘
```

### How It Solves Each Problem

- **Feedback 1 (UI quality)**: Blocks are built once with pixel-perfect quality, reused everywhere.
- **Feedback 2 (Shuffle/mix)**: Blocks are independent units — copy heading from one section, paste into another.
- **Feedback 3 (Delete layer)**: Each block has an ID; deleting removes it from the composition.
- **Feedback 4 (Figma export)**: Blocks serialize to a structured JSON that a Figma plugin can reconstruct.
- **Feedback 5 (Layer selection)**: Blocks have `data-layer-id` attributes; selection state machine handles click depth.
- **Future 6-9 (Style guide)**: All visual decisions flow through CSS custom properties; changing one token repaints everything.
- **Future 10 (Image controls)**: `ImageBlock` has a full property schema (ratio, shape, overlay, etc.).

---

## 3. Phase 1: Design Token System + Block Primitives

### 3A. Design Token System

All visual decisions become **CSS custom properties** applied to the wireframe canvas root element. Components reference tokens, never hardcoded colors/fonts.

#### Token Schema

```css
/* ===== COLORS ===== */

/* Backgrounds */
--sg-bg-primary: #ffffff;        /* Main page background */
--sg-bg-secondary: #f9fafb;     /* Alternate section bg */
--sg-bg-accent: #1e88e5;        /* Accent/brand bg */
--sg-bg-dark: #0c0a05;          /* Dark scheme bg */

/* Text */
--sg-text-primary: #111827;     /* Headings, main text */
--sg-text-secondary: #6b7280;   /* Body, descriptions */
--sg-text-muted: #9ca3af;       /* Captions, meta */
--sg-text-on-accent: #ffffff;   /* Text on accent bg */
--sg-text-on-dark: #ffffff;     /* Text on dark bg */

/* Borders */
--sg-border: #e5e7eb;           /* Default border */
--sg-border-muted: #f3f4f6;     /* Subtle dividers */

/* Buttons */
--sg-button-primary-bg: #111827;
--sg-button-primary-text: #ffffff;
--sg-button-secondary-bg: transparent;
--sg-button-secondary-text: #374151;
--sg-button-secondary-border: #d1d5db;

/* Cards */
--sg-card-bg: #ffffff;
--sg-card-border: #e5e7eb;

/* ===== TYPOGRAPHY ===== */

--sg-font-heading: 'Inter', sans-serif;
--sg-font-body: 'Inter', sans-serif;
--sg-heading-weight: 700;       /* 400 | 500 | 600 | 700 */
--sg-body-weight: 400;
--sg-heading-letter-spacing: -0.02em;

/* Size scale multiplier: 0.875 (small) | 1 (regular) | 1.125 (large) */
--sg-size-scale: 1;

/* Computed heading sizes (base × scale) */
--sg-h1-size: calc(3.75rem * var(--sg-size-scale));  /* 60px base */
--sg-h2-size: calc(3rem * var(--sg-size-scale));      /* 48px base */
--sg-h3-size: calc(2.25rem * var(--sg-size-scale));   /* 36px base */
--sg-h4-size: calc(1.875rem * var(--sg-size-scale));  /* 30px base */
--sg-h5-size: calc(1.5rem * var(--sg-size-scale));    /* 24px base */
--sg-h6-size: calc(1.25rem * var(--sg-size-scale));   /* 20px base */

--sg-body-size: 1rem;
--sg-body-large-size: 1.125rem;
--sg-caption-size: 0.875rem;

/* ===== UI STYLING ===== */

--sg-radius: 0px;               /* 0 | 4px | 8px | 12px | 9999px */
--sg-card-radius: 0px;
--sg-button-radius: 0px;
--sg-image-radius: 0px;

/* Button style keyword used by ButtonBlock */
--sg-button-style: 'solid';    /* solid | outline | ghost | brick | gradient */

/* Card style keyword used by CardBlock */
--sg-card-style: 'default';    /* default | outlined | flat */

/* Image defaults */
--sg-image-ratio: auto;
--sg-image-shape: rectangle;   /* rectangle | circle */
--sg-image-overlay: none;

/* ===== COLOR SCHEME (per-section override) ===== */

/* Sections can opt into a "scheme" that overrides bg + text */
--sg-scheme: 'light';          /* light | dark | accent */
```

#### Token Provider Architecture

```
useStyleGuideStore (Zustand + immer)
    │
    ├── colors: { primary, secondary, accent, neutrals }
    ├── typography: { headingFont, bodyFont, headingWeight, bodyWeight, sizeScale, style }
    ├── ui: { buttonStyle, buttonRadius, cardStyle, cardRadius, imageRadius }
    ├── scheme: 'light' | 'dark'
    ├── sectionSchemeOverrides: Record<sectionId, scheme>
    │
    └── computed → CSS custom property object
            │
            └── Applied to <div style={computedTokens}> wrapping the canvas
```

**How a family references tokens (V2 vs V1)**:

```tsx
// V1 (hardcoded) — NEVER DO THIS AGAIN
<h1 className="text-4xl font-bold text-gray-900">...</h1>

// V2 (token-driven)
<h1 className="text-[length:var(--sg-h1-size)] font-[var(--sg-heading-weight)] text-[color:var(--sg-text-primary)] font-[family-name:var(--sg-font-heading)]">...</h1>

// Or via a HeadingBlock that encapsulates this:
<HeadingBlock level={1} text="..." />
```

---

### 3B. Block Primitives

Blocks are the atomic building units. Each block:
- Has a unique `layerId` (UUID)
- Has a `type` discriminator
- Accepts `props` controlling its behavior
- Reads all visual styling from CSS custom properties (tokens)
- Renders a `data-layer-id`, `data-layer-type`, `data-layer-label` for selection
- Is wrapped in a `<LayerWrapper>` that provides hover outline, click handling, context menu

#### Block Catalog

| Block | Type Key | Props | What It Renders |
|-------|----------|-------|-----------------|
| **HeadingBlock** | `heading` | `level: 1-6`, `text`, `align` | `<h1>`-`<h6>` with token fonts/colors/sizes |
| **TextBlock** | `text` | `text`, `variant: body｜small｜caption`, `align` | `<p>` with token fonts/colors |
| **ButtonBlock** | `button` | `text`, `variant: primary｜secondary｜link`, `href?` | Button with token radius/style/colors |
| **ButtonGroupBlock** | `button-group` | `children: ButtonBlock[]`, `align` | Flex row of buttons |
| **ImageBlock** | `image` | `src?`, `alt?`, `ratio`, `shape`, `position`, `fillMode`, `overlay`, `foreground`, `width?` | Image placeholder or uploaded image with all controls |
| **CardBlock** | `card` | `children: Block[]`, `variant` | Card wrapper with token border/radius/bg |
| **BadgeBlock** | `badge` | `text`, `variant?` | Small tag/category label |
| **ListBlock** | `list` | `items: string[]`, `icon: check｜bullet｜number｜custom` | Styled list with check/bullet icons |
| **DividerBlock** | `divider` | `variant: line｜space｜dots` | Horizontal separator |
| **SpacerBlock** | `spacer` | `size: sm｜md｜lg｜xl` | Vertical spacing |
| **IconBlock** | `icon` | `name` (Lucide name), `size`, `color?` | Icon with token colors |
| **LogoBlock** | `logo` | `text?`, `src?` | Site logo text or image |
| **VideoBlock** | `video` | `src?`, `ratio`, `overlay?` | Video placeholder |
| **FormBlock** | `form` | `fields: FormField[]`, `style: inline｜stacked`, `submitText` | Form with token-styled inputs |
| **InputBlock** | `input` | `placeholder`, `type: text｜email｜password`, `label?` | Input field with token styles |
| **AvatarBlock** | `avatar` | `src?`, `name?`, `size`, `shape: circle｜square` | User avatar placeholder |
| **SocialBlock** | `social` | `links: string[]` | Social media icon row |

#### Block Interface

```typescript
interface Block {
    id: string                    // UUID — unique per instance
    type: BlockType               // 'heading' | 'text' | 'button' | ...
    props: Record<string, any>    // Type-specific props
    content: Record<string, any>  // Editable text/data
    children?: Block[]            // For container blocks (card, button-group)
    locked?: boolean              // Prevent deletion/modification
}

type BlockType =
    | 'heading' | 'text' | 'button' | 'button-group'
    | 'image' | 'card' | 'badge' | 'list'
    | 'divider' | 'spacer' | 'icon' | 'logo'
    | 'video' | 'form' | 'input'
    | 'avatar' | 'social'
```

#### LayerWrapper Component

Every block is wrapped in `<LayerWrapper>`:

```tsx
interface LayerWrapperProps {
    block: Block
    children: React.ReactNode
}

function LayerWrapper({ block, children }: LayerWrapperProps) {
    // Provides:
    // - data-layer-id={block.id}
    // - data-layer-type={block.type}
    // - data-layer-label={humanLabel}
    // - onClick → select this layer
    // - onDoubleClick → enter this layer (for containers)
    // - Hover outline (dashed blue)
    // - Selected outline (solid blue)
    // - Context menu (delete, duplicate, copy, move up/down)
    // - Drag handle (when section is entered)
}
```

---

### 3C. Layout Templates (Replaces Families)

A layout template defines **spatial arrangement** of blocks. It does NOT define colors, fonts, or any styling — those come from tokens.

```typescript
interface LayoutTemplate {
    id: string                          // 'hero-split', 'hero-centered', ...
    category: SectionCategory           // 'hero', 'features', 'pricing', ...
    name: string                        // Human-readable name
    description: string
    tags: string[]
    
    // The default blocks this template starts with
    defaultBlocks: Block[]
    
    // Layout renderer — positions blocks in the arrangement
    Layout: React.FC<LayoutProps>
    
    // Thumbnail for the preset browser sidebar
    Thumbnail: React.FC
}

interface LayoutProps {
    blocks: Block[]                     // The actual blocks (may differ from defaults)
    viewport: 'desktop' | 'tablet' | 'mobile'
    sectionId: string
    editable: boolean
    onBlockChange: (blockId: string, updates: Partial<Block>) => void
    onBlockDelete: (blockId: string) => void
    onBlockAdd: (afterBlockId: string | null, block: Block) => void
    onBlockReorder: (blockId: string, newIndex: number) => void
}
```

**Example: Hero Split Layout**

```tsx
function HeroSplitLayout({ blocks, viewport, sectionId, editable, ...handlers }: LayoutProps) {
    const isMobile = viewport === 'mobile'
    
    // Layout knows: "I have a left column and a right column"
    // It looks for blocks by type to place them
    const heading = blocks.find(b => b.type === 'heading')
    const description = blocks.find(b => b.type === 'text')
    const buttons = blocks.filter(b => b.type === 'button')
    const badge = blocks.find(b => b.type === 'badge')
    const image = blocks.find(b => b.type === 'image')
    
    return (
        <section className="py-16 md:py-28 px-5 md:px-16">
            <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : 'flex items-center gap-12'}`}>
                <div className="flex-1 space-y-4">
                    {badge && <RenderBlock block={badge} {...handlers} />}
                    {heading && <RenderBlock block={heading} {...handlers} />}
                    {description && <RenderBlock block={description} {...handlers} />}
                    {buttons.length > 0 && (
                        <div className="flex gap-3 pt-2">
                            {buttons.map(b => <RenderBlock key={b.id} block={b} {...handlers} />)}
                        </div>
                    )}
                </div>
                <div className={isMobile ? 'w-full' : 'flex-1'}>
                    {image && <RenderBlock block={image} {...handlers} />}
                </div>
            </div>
        </section>
    )
}
```

The layout template is pure structure. `RenderBlock` dispatches to the correct block primitive, which reads tokens for all styling. **Swapping the layout preserves all blocks and their content.**

---

## 4. Phase 2: Selection + Layer Interaction

### 4A. Selection State Machine

```
States:
  IDLE              — nothing selected
  SECTION_SELECTED  — a section has outline, shows section toolbar
  ENTERED           — inside a section, individual blocks are clickable
  BLOCK_SELECTED    — a specific block is selected, shows block property panel

Transitions:
  IDLE + click(section)           → SECTION_SELECTED
  SECTION_SELECTED + click(other) → SECTION_SELECTED (switch section)
  SECTION_SELECTED + dblclick     → ENTERED
  SECTION_SELECTED + Enter key    → ENTERED
  SECTION_SELECTED + Escape       → IDLE
  ENTERED + click(block)          → BLOCK_SELECTED
  ENTERED + Escape                → SECTION_SELECTED
  BLOCK_SELECTED + click(block)   → BLOCK_SELECTED (switch block)
  BLOCK_SELECTED + Escape         → ENTERED
  BLOCK_SELECTED + Delete/Bksp    → delete block, → ENTERED
  Any + click(canvas bg)          → IDLE
```

#### Selection Store

```typescript
interface SelectionState {
    mode: 'idle' | 'section-selected' | 'entered' | 'block-selected'
    sectionId: string | null
    blockId: string | null
    
    // Actions
    selectSection: (sectionId: string) => void
    enterSection: () => void
    selectBlock: (blockId: string) => void
    escape: () => void
    clear: () => void
}
```

### 4B. Visual Indicators

| State | Visual |
|-------|--------|
| Hover (any mode) | Dashed light-blue outline on hovered element |
| `SECTION_SELECTED` | Solid blue 2px outline on section, section toolbar (move up/down, duplicate, delete, scheme selector) visible |
| `ENTERED` | Section has faint blue background tint, all blocks show dashed outlines on hover |
| `BLOCK_SELECTED` | Solid blue 2px outline on block, 4 resize handles on corners (if applicable), right sidebar shows block properties |

### 4C. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Go up one selection level |
| `Enter` | Enter selected section |
| `Delete` / `Backspace` | Delete selected block |
| `Cmd+C` | Copy selected block(s) to clipboard as JSON |
| `Cmd+V` | Paste block(s) from clipboard into current section |
| `Cmd+D` | Duplicate selected block in place |
| `Cmd+X` | Cut (copy + delete) |
| `Cmd+Z` | Undo (section-level, via existing undo/redo in unified store) |
| `Cmd+Shift+Z` | Redo |
| `Tab` | Select next block in section |
| `Shift+Tab` | Select previous block |
| `↑` / `↓` | Move block up/down in order |

### 4D. Block Clipboard Format

When copying a block (or section), we serialize to JSON on the system clipboard:

```json
{
    "scytle": true,
    "version": 2,
    "type": "block",
    "data": {
        "id": "new-uuid-on-paste",
        "type": "heading",
        "props": { "level": 1, "align": "left" },
        "content": { "text": "My headline" }
    }
}
```

For pasting into Figma (Phase 4), we additionally write an SVG representation to the clipboard alongside the JSON.

### 4E. Context Menu (Right-Click)

When right-clicking a block:

```
┌──────────────────────┐
│ ✂️  Cut          ⌘X  │
│ 📋 Copy         ⌘C  │
│ 📎 Paste Below  ⌘V  │
│ ═══════════════════  │
│ 🔁 Duplicate    ⌘D  │
│ ↑  Move Up           │
│ ↓  Move Down         │
│ ═══════════════════  │
│ 🗑  Delete     ⌫    │
│ 🔒 Lock/Unlock      │
└──────────────────────┘
```

---

## 5. Phase 3: Style Guide Editor

The Style Guide is a dedicated panel (left sidebar, like Relume screenshots) that controls the global design tokens. It has subsections for Colors, Typography, UI Styling, and Concepts.

### 5A. Colors Panel

#### Structure

```
Colors
├── Mode toggle: ☀️ Light / 🌙 Dark
├── [Shuffle C] button — random palette from curated library
│
├── Neutrals (auto-generated from base + dark mode flip)
│   └── Swatch strip showing the gray scale
│
├── Accent Color 1 (Main)
│   ├── Color name: "Curious Blue"
│   ├── Hex: #1E88E5
│   ├── Shade slider (lightness within hue)
│   └── [Main] badge — this is the primary accent
│
├── Accent Color 2
│   ├── Color name: "Elf Green"
│   ├── Hex: #0D9471
│   └── Shade slider
│
├── Accent Color 3 (optional)
│   └── ...
│
└── [+] Add Color
```

#### Light / Dark Mode

Toggling mode swaps token values:

| Token | Light | Dark |
|-------|-------|------|
| `--sg-bg-primary` | `#ffffff` | `#0c0a05` |
| `--sg-bg-secondary` | `#f9fafb` | `#1a1917` |
| `--sg-text-primary` | `#111827` | `#ffffff` |
| `--sg-text-secondary` | `#6b7280` | `#a1a1aa` |
| `--sg-border` | `#e5e7eb` | `#2d2b26` |

**All sections instantly repaint** — no per-family changes needed.

#### Per-Section Color Scheme Override

Each section can override the global scheme (light/dark/accent). This maps to a `--sg-scheme` CSS variable on that section's wrapper. Shown as the "Scheme shuffle SPACE" bar at the bottom of the canvas in Relume.

```typescript
// In section data:
interface SectionData {
    layoutId: string
    blocks: Block[]
    schemeOverride?: 'light' | 'dark' | 'accent' | null  // null = use global
}
```

#### Shuffle Logic

Curated palette library (~50-100 palettes) stored as:

```typescript
interface ColorPalette {
    id: string
    name: string
    neutralBase: string      // Base gray
    accents: Array<{
        name: string
        hex: string
    }>
}
```

"Shuffle" picks a random palette and applies all its values to the style guide store. "Scheme shuffle SPACE" shuffles just the scheme of the selected/hovered section.

---

### 5B. Typography Panel

#### Structure

```
Typography
├── Size & Weight: [Regular - medium ▼]
│   ├── Size: Small / Regular (default) / Large
│   ├── Weight: Normal / Medium / Bold
│   └── Style: Default / Serif / Spacing
│
├── [Shuffle T] — random font pair from curated library
│
├── Heading
│   ├── Font: "Raleway" [Google] [Free]
│   ├── Preview: "The quick brown fox"
│   └── [🔀 Shuffle] / [❤️ Like] / [🔗 View font family]
│
├── Body
│   ├── Font: "Inter" [Google] [Free]
│   ├── Preview: "The quick brown fox"
│   └── [🔀 Shuffle] / [❤️ Like]
│
└── Font Browser Overlay
    ├── Search input
    ├── Tabs: [Liked Fonts] [Browse]
    ├── [Google 🔘 Only Free] toggle
    ├── My Recommendations (AI-based on likes)
    └── Font list with previews
```

#### Token Mapping

| Setting | Tokens Affected |
|---------|----------------|
| Size = Large | `--sg-size-scale: 1.125` (all headings scale up) |
| Weight = Bold | `--sg-heading-weight: 700` |
| Weight = Normal | `--sg-heading-weight: 400` |
| Style = Spacing | `--sg-heading-letter-spacing: 0.05em` |
| Heading Font = Raleway | `--sg-font-heading: 'Raleway', sans-serif` |
| Body Font = Inter | `--sg-font-body: 'Inter', sans-serif` |

#### Font Pair Library

~80 curated heading+body pairs:

```typescript
interface FontPair {
    id: string
    heading: { family: string; source: 'google' | 'system'; free: boolean }
    body: { family: string; source: 'google' | 'system'; free: boolean }
}
```

Google Fonts loaded dynamically via `<link>` injection when a new pair is selected.

---

### 5C. UI Styling Panel — Buttons & Forms

#### Structure

```
Buttons & Forms
├── Corner Radius Presets: [⊏] [⊐] [◯] [◗] [◎]
│   (sharp → slight → medium → large → pill)
│
├── Default Style (active/previewed)
│   ├── Primary:   [■ Button] [□ Button]
│   └── Secondary: [□ Button] [□ Button]
│   └── [👁 show/hide toggle] [✓ select]
│
├── Brick Style
│   ├── Primary:   [■ Button] [□ Button]
│   └── Secondary: ...
│
├── Gradient Style
│   └── ...
│
├── Label Input Style
│   └── Placeholder preview
│
└── [🔀 Shuffle] — random button style + radius combo
```

#### Token Mapping

| Setting | Token |
|---------|-------|
| Radius preset 1 (sharp) | `--sg-button-radius: 0px` |
| Radius preset 3 (medium) | `--sg-button-radius: 8px` |
| Radius preset 5 (pill) | `--sg-button-radius: 9999px` |
| Style = Brick | `--sg-button-style: 'brick'` — ButtonBlock reads this and applies thick border + square |
| Style = Gradient | `--sg-button-style: 'gradient'` — ButtonBlock applies gradient bg using accent colors |

---

### 5D. UI Styling Panel — Cards & Images

#### Structure

```
Cards & Images
├── Corner Radius Presets: [⊏] [⊐] [◯] [◗] [◎]
│
├── Default (selected) — card preview with images
├── Outlined — thinner border, no fill
├── Flat — no border, subtle shadow
│
└── [🔀 Shuffle]
```

#### Token Mapping

| Setting | Token |
|---------|-------|
| Card = Default | `--sg-card-style: 'default'` (white bg, 1px border) |
| Card = Outlined | `--sg-card-style: 'outlined'` (transparent bg, 1px border) |
| Card = Flat | `--sg-card-style: 'flat'` (white bg, shadow, no border) |
| Card radius preset 3 | `--sg-card-radius: 8px` |

---

### 5E. Concepts

A **Concept** is a complete snapshot of the style guide — colors + typography + UI styling.

```typescript
interface Concept {
    id: string
    name: string               // "Concept 1", "Concept 2", ...
    styleGuide: StyleGuideData // Full token configuration
    createdAt: string
}

interface ProjectStyleGuides {
    activeConcept: string      // ID of the currently shown concept
    concepts: Concept[]        // Usually 1-3 concepts
}
```

Users can:
- **Create** new concept (copies current)
- **Duplicate** existing concept
- **Delete** concept
- **Switch** between concepts (dropdown at top of style guide panel)
- Same wireframe structure, completely different visual treatment
- When exporting to Figma, **all concepts** are exported as separate pages

---

## 6. Phase 4: Advanced Features

### 6A. Figma Export (Clipboard Bridge)

#### Approach: Companion Figma Plugin

1. User selects a section (or entire page) in Scytle
2. Clicks "Copy for Figma" (or Cmd+Shift+C)
3. Scytle serializes the section to a **Figma-compatible JSON payload**
4. Payload is:
   - Written to system clipboard as a data URL, OR
   - Pushed to a temporary API endpoint (short-lived, authenticated)
5. User opens Figma plugin → "Paste from Scytle"
6. Plugin reads the payload and reconstructs as native Figma nodes:
   - Frames with auto-layout
   - Text layers with correct fonts
   - Rectangle placeholders for images (or actual images if uploaded)
   - Correct colors from the active concept's style guide

#### Payload Schema

```typescript
interface FigmaExportPayload {
    scytle: true
    version: 2
    type: 'section' | 'page'
    styleGuide: StyleGuideData
    sections: Array<{
        layoutId: string
        blocks: Block[]
        schemeOverride?: string
    }>
}
```

#### Alternative: SVG Clipboard

For a simpler (lower quality) path:
- Render the section to an SVG string using a headless renderer
- Write SVG to clipboard
- Pasting in Figma creates vector paths (not editable frames, but visually correct)

### 6B. Image Management

When a user clicks on an `ImageBlock`, the right sidebar shows:

```
Image
├── [Upload] button (or drag & drop zone)
├── Uploaded image preview
│
├── Ratio: [1:1 ▼] (1:1, 4:3, 16:9, 3:2, 2:3, 3:4, Auto)
├── Position: [Center ▼] (Center, Top, Bottom, Left, Right, Custom)
├── Fill Mode: [Cover ▼] (Cover, Contain, Fill, None)
├── Width: [Select ▼] (Full, 3/4, 2/3, 1/2, 1/3, Custom px)
├── Shape: [□ Rectangle] [○ Circle]
├── Overlay: [Yes] [No] → if Yes, color picker + opacity
├── Foreground: [Color] [None] → colored tint on image
```

All image uploads go to **Appwrite Storage** under the project. The `ImageBlock.props` stores:

```typescript
interface ImageBlockProps {
    src?: string            // Appwrite storage URL or null (placeholder)
    alt?: string
    ratio: string           // '1:1' | '4:3' | '16:9' | '3:2' | '2:3' | '3:4' | 'auto'
    position: string        // CSS object-position value
    fillMode: string        // 'cover' | 'contain' | 'fill' | 'none'
    width?: string          // 'full' | '3/4' | '2/3' | '1/2' | '1/3' | custom
    shape: string           // 'rectangle' | 'circle'
    overlay: {
        enabled: boolean
        color?: string
        opacity?: number
    }
    foreground: {
        type: 'none' | 'color'
        color?: string
    }
}
```

### 6C. Responsive Controls

Each section's layout already handles `viewport` prop. Additional controls:
- **Hide on mobile/tablet/desktop** toggle per block
- **Responsive reordering**: blocks can have different order on mobile
- Viewport toggle buttons already exist in the canvas toolbar — no change needed there

---

## 7. Data Model

### Current V1 Model (Appwrite Collections)

```
SECTIONS collection:
  - id
  - pageId
  - projectId
  - userId
  - sectionCategory        // 'hero', 'features', ...
  - familyId               // 'hero-split'
  - presetId               // 'hero-split'
  - controls               // { textAlign: 'left', buttonCount: '2', ... }
  - content                // { heading: '...', subheading: '...', ... }
  - orderIndex
```

### New V2 Model

```
SECTIONS collection:
  - id
  - pageId
  - projectId
  - userId
  - sectionCategory        // 'hero', 'features', ...
  - layoutId               // 'hero-split' (references LayoutTemplate)
  - presetId               // Original preset used (for reference)
  - blocks                 // Block[] — the full block tree as JSON
  - schemeOverride         // 'light' | 'dark' | 'accent' | null
  - orderIndex

STYLE_GUIDES collection (already exists, repurpose):
  - id
  - projectId
  - userId
  - activeConcept          // concept ID
  - concepts               // Concept[] as JSON

New Concept shape within concepts array:
  {
      id: string,
      name: string,
      colors: {
          mode: 'light' | 'dark',
          neutralBase: string,
          accents: Array<{ name: string, hex: string, isMain: boolean }>
      },
      typography: {
          headingFont: string,
          bodyFont: string,
          headingWeight: number,
          bodyWeight: number,
          sizeScale: number,
          letterSpacingStyle: 'default' | 'tight' | 'wide'
      },
      ui: {
          buttonStyle: string,
          buttonRadius: number,
          cardStyle: string,
          cardRadius: number,
          imageRadius: number
      }
  }
```

### Migration

V1 sections need a migration function:

```typescript
function migrateV1SectionToV2(section: V1Section): V2Section {
    // 1. Look up the V1 family's defaultContent and controls
    // 2. Convert content fields to Block[] using the family's structure
    // 3. Map familyId → layoutId
    // 4. Return V2 section with blocks array
}
```

This can run lazily (on first project load) or as a batch migration.

---

## 8. Build Order

| Step | What | Deliverable | Sessions |
|------|------|-------------|----------|
| **~~1~~** | ~~Design tokens + CSS custom properties + `useStyleGuideStore`~~ | ~~Token system that paints an entire page from one store~~ | ✅ Done |
| **~~2~~** | ~~Block primitives (HeadingBlock, TextBlock, ButtonBlock, ImageBlock, CardBlock, BadgeBlock, ListBlock, DividerBlock)~~ | ~~17 block components + RenderBlock dispatcher~~ | ✅ Done |
| **~~3~~** | ~~`LayerWrapper` + selection state machine (click/dblclick/escape)~~ | ~~Figma-like selection model~~ | ✅ Done |
| **4** | V2 layout templates — rebuild ALL major marketing categories from Figma designs | Pixel-perfect, token-driven, block-composed layouts for every category | 🚧 GATE |
| **5** | Block operations: delete, copy/paste (Cmd+C/V), duplicate, reorder | Full block interaction | 1-2 |
| **6** | Style Guide store + Colors panel (light/dark, accents, shuffle, per-section schemes) | First visible "wow" feature — toggle dark mode, entire page repaints | 2-3 |
| **7** | Typography panel + font pair library + Google Fonts loading | Heading/body font switching | 1-2 |
| **8** | UI Styling panels (buttons, cards, radius presets) | Complete style guide | 1-2 |
| **9** | Concepts (create/duplicate/switch/delete style variations) | Multi-concept support | 1 |
| **10** | ~~Rebuild top 5 layouts per category~~ (merged into Step 4) | — | — |
| **11** | Image management (upload to Appwrite, image property panel) | Full image controls | 2-3 |
| **12** | Right-click context menu + keyboard shortcuts polish | UX polish | 1 |
| **13** | Figma plugin bridge (export section/page to Figma) | Copy to Figma workflow | 3-5 |
| **14** | Block property panel (per-block settings in right sidebar) | Complete editing experience | 2-3 |

**Total estimated: 22-35 focused sessions**

### 🚧 Step 4 Gate Rules — READ BEFORE PROCEEDING

> **Step 4 is a HARD GATE.** Do NOT move to Step 5 or any later step until the user explicitly says "let's move to the next step."

#### Required Categories (Marketing)

All of the following marketing section categories must be rebuilt as V2 layout templates before exiting Step 4:

| # | Category | Status | Figma Provided |
|---|----------|--------|----------------|
| 1 | **Hero** | ✅ Done (27 layouts) | ✅ |
| 2 | **Navbar** | ❌ Not started | ❌ |
| 3 | **Footer** | ❌ Not started | ❌ |
| 4 | **Features** | ❌ Not started | ❌ |
| 5 | **CTA** | ❌ Not started | ❌ |
| 6 | **Pricing** | ❌ Not started | ❌ |
| 7 | **Testimonials** | ❌ Not started | ❌ |
| 8 | **FAQ** | ❌ Not started | ❌ |
| 9 | **Contact** | ❌ Not started | ❌ |
| 10 | **Content** | ❌ Not started | ❌ |
| 11 | **Team** | ❌ Not started | ❌ |
| 12 | **Blog** | ❌ Not started | ❌ |
| 13 | **Stats / Logos** | ❌ Not started | ❌ |
| 14 | **Gallery** | ❌ Not started | ❌ |

#### Workflow Per Category

```
1. ASK the user for the Figma link (desktop + mobile frames)
   → Do NOT proceed without a Figma URL.

2. EXTRACT design specs using Figma MCP:
   → get_design_context / get_screenshot for exact layout, spacing, sizing

3. BUILD layout template(s) matching the Figma design exactly:
   → Pixel-perfect padding, gap, max-width, responsive breakpoints
   → Use V2 blocks (HeadingBlock, TextBlock, etc.) — never hardcoded styles
   → All styling via --sg-* CSS custom properties

4. BUILD default blocks (the content each layout starts with)

5. TEST build passes cleanly

6. MARK category as ✅ Done in the table above

7. ASK user: "Which category next?" + "Please share the Figma link."

8. REPEAT until all categories are ✅ Done

9. ONLY when user says "let's move to the next step" → proceed to Step 5
```

#### V1 Family Handling

- **Do NOT move or delete V1 families** during Step 4
- V2 layouts live in `v2/layouts/{category}/` — completely separate
- V1 families continue to power the current rendering pipeline
- Registry swap happens later (after Step 4 gate is passed)

#### V2 Rendering Pipeline (Already Wired)

Both the **Add Section** sidebar, **Section Picker** popup, and **Replace Component** panel are wired to show V2 layouts exclusively for categories listed in `V2_READY_CATEGORIES`. The `PlaceholderRenderer` resolves V2 `componentId` values (e.g. `hero-1`) via `getTemplateById()` and renders the V2 component directly, bypassing the V1 three-layer merge pipeline.

Files modified for V2 rendering:
- `src/components/wireframe/panels/component-library-panel.tsx` — Replace Component picker
- `src/components/wireframe/add-section-sidebar.tsx` — Add Section sidebar
- `src/components/wireframe/section-picker.tsx` — Inline section picker popup
- `src/components/wireframe/placeholder-renderer.tsx` — Canvas renderer (Strategy 0: V2 path)

#### V2 Naming Convention

- Layout IDs use sequential numbers starting from 1: `hero-1`, `hero-2`, ..., `hero-27`
- Display names match: `Hero 1`, `Hero 2`, ..., `Hero 27`
- Old Relume header numbers (44-70) are preserved as `relumeId` for reference only
- Each category starts fresh from 1 when built

#### V2 Layout Control System (Matrix Navigation)

Instead of 27 separate cards in the picker, layouts are navigated via **categorical controls** in the section panel. Each category defines **control axes** that form a matrix. Changing any control resolves the new combination and updates the `componentId`.

```typescript
// Generic control axis type — used by ALL categories
interface LayoutControlAxis {
    key: string                    // 'alignment' | 'background' | 'element'
    label: string                  // 'Text' | 'Background' | 'Element'
    options: LayoutControlOption[]
}

interface LayoutControlOption {
    value: string                  // 'left' | 'split' | 'center'
    label: string                  // 'Left' | 'Split' | 'Center'
    icon?: string                  // Lucide icon name (optional)
}

// Per-category control definition
interface LayoutControlDef {
    category: LayoutCategory
    axes: LayoutControlAxis[]
    /** Given axis values, resolve to a layout ID */
    resolve: (values: Record<string, string>) => string | undefined
    /** Given a layout ID, extract its axis values */
    extract: (layoutId: string) => Record<string, string>
}
```

**Hero Control Axes** (3×3×3 = 27 layouts):

| Control | Label | Options |
|---------|-------|---------|
| `alignment` | Text | Left \| Split \| Center |
| `background` | Background | None \| Image \| Video |
| `element` | Element | None \| Form \| Button |

**Example for future categories**: //this is just example before fianlizing scan the all design from figma then suggest controls. 

- **Features**: `layout` (Grid \| List \| Alternating), `columns` (2 \| 3 \| 4), `media` (Icon \| Image \| None)
- **Pricing**: `columns` (2 \| 3 \| 4), `highlight` (Yes \| No), `toggle` (Monthly/Annual)
- **CTA**: `alignment` (Left \| Center \| Split), `background`, `element`

The control panel renders axes dynamically from each category's `LayoutControlDef`. The section panel shows these controls when a V2 section is selected.

**Control flow**:
1. User selects a hero section
2. Section panel shows axes: Text=Left, Background=None, Element=Button
3. User changes Text to "Center"
4. `resolve({ alignment: 'center', background: 'neutral', element: 'buttons' })` → `'hero-19'`
5. Store updates `section.componentId = 'hero-19'`
6. Canvas re-renders with the center-aligned, neutral, buttons variant

Files implementing the control system:
- `src/lib/designs/v2/layouts/controls.ts` — Generic types + hero control def
- `src/components/wireframe/panels/section-controls.tsx` — Renders V2 controls when V2 section detected
- `src/components/wireframe/panels/section-panel.tsx` — Shows V2 layout name + controls

### Critical Path

Steps 1→2→3→4 form the foundation. Nothing else can start until these are done. Steps 5 and 6 can partially overlap. Steps 7-9 are sequential but fast. Steps 11-14 are independent features that can be built in any order.

---

## 9. Legacy Family Migration Strategy

### What To Do With Current Files

```
src/lib/designs/
├── _legacy/                    ← MOVE all current families here
│   ├── hero/                   ← 9 families, 17 presets
│   ├── navbar/                 ← 6 families
│   ├── footer/                 ← 6 families
│   ├── features/               ← existing families
│   ├── pricing/                ← 4 families
│   ├── faq/                    ← existing families
│   ├── cta/                    ← existing families
│   ├── testimonials/           ← existing families
│   ├── team/                   ← 6 families, 22 presets
│   ├── blog/                   ← 11 families, 69 presets
│   └── ...
│
├── v2/                         ← NEW architecture
│   ├── tokens/                 ← Design token system
│   ├── blocks/                 ← Block primitives
│   ├── layouts/                ← Layout templates
│   ├── selection/              ← Selection state machine
│   └── style-guide/            ← Style guide panels
│
├── types.ts                    ← Updated with V2 interfaces
└── registry.ts                 ← Updated to use V2 layouts
```

### Why Keep Legacy

- **Reference**: Layout patterns (spacing, proportions, responsive breakpoints)
- **Content defaults**: Default text, item counts
- **Control ideas**: Many control concepts translate to block props
- **Presets**: Thumbnail designs can be reused
- **Fallback**: If a V2 layout isn't ready yet, a V1 family can fill in temporarily

### Migration Per Category

When rebuilding a category:
1. Read the legacy family to understand the layout pattern
2. Break it down into blocks
3. Build the V2 `LayoutTemplate` that composes those blocks
4. Create presets that define `defaultBlocks` arrays (different block configurations)
5. Remove from `_legacy/` once V2 layout fully replaces it

---

## 10. File Structure

```
src/
├── lib/
│   └── designs/
│       ├── _legacy/            ← All V1 families (untouched, for reference)
│       │
│       ├── v2/
│       │   ├── tokens/
│       │   │   ├── index.ts            ← Token type definitions
│       │   │   ├── defaults.ts         ← Default token values (light + dark)
│       │   │   ├── palettes.ts         ← Curated color palette library
│       │   │   ├── font-pairs.ts       ← Curated font pair library
│       │   │   └── provider.tsx        ← TokenProvider component (applies CSS vars)
│       │   │
│       │   ├── blocks/
│       │   │   ├── index.ts            ← Barrel export + RenderBlock dispatcher
│       │   │   ├── types.ts            ← Block, BlockType, BlockProps interfaces
│       │   │   ├── layer-wrapper.tsx    ← LayerWrapper (selection, hover, context menu)
│       │   │   ├── heading-block.tsx
│       │   │   ├── text-block.tsx
│       │   │   ├── button-block.tsx
│       │   │   ├── button-group-block.tsx
│       │   │   ├── image-block.tsx
│       │   │   ├── card-block.tsx
│       │   │   ├── badge-block.tsx
│       │   │   ├── list-block.tsx
│       │   │   ├── divider-block.tsx
│       │   │   ├── spacer-block.tsx
│       │   │   ├── icon-block.tsx
│       │   │   ├── logo-block.tsx
│       │   │   ├── video-block.tsx
│       │   │   ├── form-block.tsx
│       │   │   ├── avatar-block.tsx
│       │   │   └── social-block.tsx
│       │   │
│       │   ├── layouts/
│       │   │   ├── index.ts            ← Layout registry
│       │   │   ├── types.ts            ← LayoutTemplate, LayoutProps interfaces
│       │   │   ├── hero/
│       │   │   │   ├── hero-split.tsx
│       │   │   │   ├── hero-centered.tsx
│       │   │   │   ├── hero-mosaic.tsx
│       │   │   │   ├── hero-gallery.tsx
│       │   │   │   ├── hero-image-bg.tsx
│       │   │   │   └── presets.tsx      ← Layout presets (default block configs)
│       │   │   ├── features/
│       │   │   ├── pricing/
│       │   │   ├── navbar/
│       │   │   ├── footer/
│       │   │   └── ...
│       │   │
│       │   ├── selection/
│       │   │   ├── index.ts
│       │   │   ├── selection-store.ts   ← useSelectionStore
│       │   │   ├── selection-overlay.tsx ← Blue outlines, handles
│       │   │   ├── context-menu.tsx     ← Right-click menu
│       │   │   └── keyboard-handler.tsx ← Global keyboard shortcuts
│       │   │
│       │   └── style-guide/
│       │       ├── index.ts
│       │       ├── style-guide-store.ts ← useStyleGuideStore (tokens + concepts)
│       │       ├── colors-panel.tsx     ← Colors section of style guide
│       │       ├── typography-panel.tsx  ← Typography section
│       │       ├── ui-styling-panel.tsx  ← Buttons, cards, radius
│       │       ├── concepts-panel.tsx    ← Concept switcher
│       │       ├── image-panel.tsx       ← Image properties (when ImageBlock selected)
│       │       └── font-browser.tsx      ← Overlay font picker
│       │
│       ├── types.ts                     ← Updated: V2 interfaces alongside V1
│       └── registry.ts                  ← Updated: imports from v2/layouts
│
├── store/
│   ├── ...existing stores...
│   ├── style-guide-store.ts     ← New: design tokens + concepts
│   └── selection-store.ts       ← New: layer selection state
│
└── components/
    └── wireframe/
        ├── ...existing...
        ├── block-renderer.tsx    ← RenderBlock component
        ├── section-wrapper.tsx   ← Updated: applies scheme, handles section selection
        └── property-panel.tsx    ← Updated: shows block-specific properties
```

---

## Summary: What Changes and What Stays

| Component | Status |
|-----------|--------|
| Zustand stores (auth, project, chat, canvas, sitemap, unified) | **STAYS** — no changes |
| AI generation (sitemap, wireframe) | **STAYS** — output format changes to V2 blocks later |
| Appwrite (auth, DB, storage) | **STAYS** — collections updated for V2 fields |
| ReactFlow for sitemap | **STAYS** — untouched |
| Chat sidebar | **STAYS** — untouched |
| Canvas viewport/toolbar | **MINOR UPDATE** — add scheme toggle |
| Section list / drag-reorder | **MINOR UPDATE** — use V2 section data |
| All V1 families | **MOVED** to `_legacy/` |
| Design token system | **NEW** |
| Block primitives | **NEW** |
| Layout templates | **NEW** (replaces families) |
| Selection state machine | **NEW** |
| Style guide editor | **NEW** |
| Property panel (block props) | **NEW** |
| Figma plugin | **NEW** (Phase 4) |
