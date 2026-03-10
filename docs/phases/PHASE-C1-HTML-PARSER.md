# Phase C1 — HTML+Tailwind → ScytleNode Parser

> **Status**: 🔲 Not started
> **Priority**: CRITICAL — this is the foundation for the entire new system
> **Dependencies**: Phase A (ScytleNode types must exist)
> **Estimated LOC**: ~400-600

## Purpose

Take raw HTML+Tailwind output from the AI and convert it into a `ScytleNode[]` tree that the Phase A canvas can render and edit. This is the **bridge** between AI generation and the editable canvas.

## Input → Output

```
INPUT:  HTML string with Tailwind classes
        ┌──────────────────────────────────────┐
        │ <section class="flex flex-col p-8     │
        │   bg-white rounded-xl">               │
        │   <h1 class="text-4xl font-bold       │
        │     text-gray-900">Welcome</h1>       │
        │   <p class="text-lg text-gray-600     │
        │     mt-4">Build something great</p>   │
        │   <img src="/hero.jpg" alt="Hero"     │
        │     class="mt-8 rounded-lg w-full     │
        │     object-cover" />                   │
        │ </section>                             │
        └──────────────────────────────────────┘
                        ↓ parse()
OUTPUT: ScytleNode tree
        FrameNode (section)
          ├── TextNode (h1) "Welcome"
          ├── TextNode (p) "Build something great"
          └── ImageNode (img) src="/hero.jpg"
```

## Parsing Strategy

### Element → Node Type Mapping

| HTML Element | ScytleNode Type | Notes |
|-------------|----------------|-------|
| `<div>`, `<section>`, `<header>`, `<footer>`, `<nav>`, `<main>`, `<article>`, `<aside>`, `<ul>`, `<ol>`, `<li>` (with children), `<form>`, `<table>` | `FrameNode` | Any container element becomes a frame |
| `<h1>`–`<h6>`, `<p>`, `<span>`, `<a>`, `<label>`, `<li>` (text-only) | `TextNode` | Text leaf elements. Preserve `htmlTag` |
| `<img>`, `<svg>` (complex), `<video>` | `ImageNode` | Media elements |
| `<button>`, `<input>` | `FrameNode` with child `TextNode` | Interactive elements decomposed |

### Tailwind Class → Property Mapping

```typescript
// Layout detection
'flex'           → layout.mode = 'flex'
'flex-col'       → layout.direction = 'column'
'flex-row'       → layout.direction = 'row'
'grid'           → layout.mode = 'grid'
'grid-cols-{n}'  → layout.columns = n
'items-center'   → layout.align = 'center'
'justify-between'→ layout.justify = 'between'
'gap-{n}'        → layout.gap = n * 4 (Tailwind spacing scale)

// Sizing
'w-{n}', 'w-full', 'w-screen'  → width
'h-{n}', 'h-full', 'h-screen'  → height
'max-w-{size}'                  → maxWidth (stored as metadata)
'min-h-screen'                  → height = viewport height

// Spacing (padding)
'p-{n}'     → padding = { top: n*4, right: n*4, bottom: n*4, left: n*4 }
'px-{n}'    → padding.left = padding.right = n*4
'py-{n}'    → padding.top = padding.bottom = n*4
'pt-{n}'    → padding.top = n*4
// ... etc for all sides

// Margin → converted to parent gap or absolute positioning offset
'mt-{n}'    → stored as margin metadata, may affect y positioning

// Typography
'text-{size}'     → fontSize mapping (xs:12, sm:14, base:16, lg:18, xl:20, 2xl:24, 3xl:30, 4xl:36, 5xl:48, 6xl:60)
'font-{weight}'   → fontWeight (light:300, normal:400, medium:500, semibold:600, bold:700, extrabold:800)
'text-center'     → textAlign = 'center'
'tracking-{val}'  → letterSpacing mapping
'leading-{val}'   → lineHeight mapping
'uppercase'       → textTransform = 'uppercase'
'underline'       → textDecoration = 'underline'
'line-through'    → textDecoration = 'line-through'
'truncate'        → autoResize = 'truncate'

// Colors (tailwind named → hex)
'text-gray-900'   → color = '#111827'
'bg-white'        → fills = [{ type: 'solid', color: '#ffffff' }]
'bg-blue-500'     → fills = [{ type: 'solid', color: '#3b82f6' }]
'bg-gradient-to-r from-blue-500 to-purple-500' → fills = [{ type: 'gradient', gradient: 'linear-gradient(to right, #3b82f6, #a855f7)' }]

// Border
'border'            → border = { width: 1, style: 'solid', color: '#e5e7eb' }
'border-{n}'        → border.width = n
'border-{color}'    → border.color
'border-dashed'     → border.style = 'dashed'
'rounded-{val}'     → borderRadius mapping (none:0, sm:2, default:4, md:6, lg:8, xl:12, 2xl:16, 3xl:24, full:9999)

// Effects
'shadow-{val}'     → shadows array
'opacity-{n}'      → opacity = n / 100

// Overflow
'overflow-hidden'  → overflow = 'hidden'
'overflow-visible' → overflow = 'visible'
```

### Size Estimation

Since HTML uses flow layout and ScytleNode uses absolute positioning (on canvas), we need to **estimate dimensions**:

```typescript
// Strategy: Assign reasonable defaults based on context
// Page-level frame: 1440 × auto (height calculated from content)
// Section: 1440 × content-based estimate
// Text: width based on parent, height based on fontSize * lineCount
// Image: explicit w/h from classes, or parent-based defaults

interface SizeEstimation {
    // Page root frame
    pageWidth: 1440  // standard desktop
    
    // Text height estimation
    estimateTextHeight(chars: string, fontSize: number, width: number): number
    
    // Container height: sum of children heights + gaps + padding
    estimateFrameHeight(frame: FrameNode): number
}
```

## File Structure

```
src/lib/parser/
  index.ts          ← barrel export
  html-to-nodes.ts  ← main parse(html: string): ScytleNode[] function
  class-parser.ts   ← Tailwind class → property extraction
  color-map.ts      ← Tailwind color name → hex mapping
  size-utils.ts     ← Dimension estimation logic
  types.ts          ← Parser-specific intermediate types
```

## Core API

```typescript
// Main entry point
export function parseHtmlToNodes(html: string): ScytleNode[]

// Example usage in AI generation flow:
const aiHtml = await generatePageHtml(prompt, styleGuide)
const nodes = parseHtmlToNodes(aiHtml)
useEditorStore.getState().setNodes(nodes)
```

## Implementation Steps

1. **Set up DOM parsing** — use `DOMParser` (browser) or a lightweight HTML parser
2. **Walk the DOM tree** recursively — convert each element to the appropriate ScytleNode type
3. **Parse Tailwind classes** — extract layout, spacing, colors, typography, borders, effects
4. **Build the color map** — full Tailwind color palette → hex values
5. **Estimate dimensions** — assign width/height based on content type and parent context
6. **Handle edge cases**:
   - Inline elements (`<span>`, `<a>`) inside block elements → merge into parent TextNode
   - SVG icons → convert to ImageNode with placeholder
   - `<button>` → FrameNode with TextNode child, styled with fills/border
   - Nested `<div>`s with only text → collapse to TextNode
   - Empty elements → skip or create minimal FrameNode

## Testing Strategy

```typescript
// Unit tests for each parser module
describe('parseHtmlToNodes', () => {
    it('converts a simple section to FrameNode with children')
    it('maps Tailwind flex classes to layout properties')
    it('extracts text content and typography properties')
    it('handles nested frames correctly')
    it('maps Tailwind colors to hex fills')
    it('handles gradient backgrounds')
    it('converts button to FrameNode + TextNode')
    it('handles images with src and alt')
    it('estimates dimensions reasonably')
})
```

## Known Challenges

1. **Tailwind spacing scale is relative** — `p-4` = 16px, but AI might use arbitrary values like `p-[40px]`
2. **Responsive classes** — AI may output `md:flex-row sm:flex-col` — parser should use desktop-first (largest breakpoint)
3. **CSS-in-JS / inline styles** — AI might mix Tailwind with `style=""` attributes — handle both
4. **Complex SVGs** — convert to ImageNode placeholder rather than parsing SVG paths
5. **Semantic HTML** — `<nav>`, `<header>`, `<footer>` all become FrameNode but should preserve the semantic tag as metadata
