# Phase C8 — HTML+Tailwind Export

> **Status**: 🔲 Not started
> **Priority**: Low — needed for final output but not blocking iteration
> **Dependencies**: C1 (parser — this is the reverse), Phase A (node types)
> **Estimated LOC**: ~300-500

## Purpose

Convert a ScytleNode tree back into clean, production-ready HTML+Tailwind code. This is the **reverse of C1** — where C1 converts `HTML → ScytleNode[]`, C8 converts `ScytleNode[] → HTML`.

Serves two purposes:
1. **Export**: User's final deliverable — downloadable HTML/Tailwind code
2. **AI Iteration**: Feed current page state back to AI for chat-based edits (C5)

## Output Format

### For Export (user download)
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FreelanceHub - Home</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Or: link to generated CSS file -->
</head>
<body>
    <nav class="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-100">
        <!-- ... -->
    </nav>
    <section class="flex flex-col items-center py-24 px-8">
        <h1 class="text-6xl font-bold text-gray-900">Manage your freelance business</h1>
        <!-- ... -->
    </section>
</body>
</html>
```

### For AI Iteration (internal)
Just the body HTML, no doctype/head:
```html
<div>
    <nav class="flex items-center justify-between px-8 py-4 bg-white">...</nav>
    <section class="flex flex-col items-center py-24 px-8">...</section>
</div>
```

## Node → HTML Mapping

### FrameNode → `<div>` (or semantic tag)

```typescript
function frameToHtml(node: FrameNode): string {
    const tag = inferSemanticTag(node)  // 'div' | 'section' | 'nav' | 'header' | 'footer' | 'main' | 'aside'
    const classes = buildFrameClasses(node)
    const children = node.children.map(nodeToHtml).join('\n')
    return `<${tag} class="${classes}">\n${children}\n</${tag}>`
}

function buildFrameClasses(node: FrameNode): string {
    const classes: string[] = []

    // Layout
    if (node.layout.mode === 'flex') {
        classes.push('flex')
        if (node.layout.direction === 'column') classes.push('flex-col')
        if (node.layout.justify) classes.push(`justify-${node.layout.justify}`)
        if (node.layout.align) classes.push(`items-${node.layout.align}`)
        if (node.layout.gap) classes.push(`gap-${pxToTailwind(node.layout.gap)}`)
        if (node.layout.wrap) classes.push('flex-wrap')
    } else if (node.layout.mode === 'grid') {
        classes.push('grid')
        if (node.layout.columns) classes.push(`grid-cols-${node.layout.columns}`)
        if (node.layout.gap) classes.push(`gap-${pxToTailwind(node.layout.gap)}`)
    }

    // Padding
    classes.push(...paddingToClasses(node.padding))

    // Background
    if (node.fills.length > 0) {
        classes.push(fillToClass(node.fills[0]))
    }

    // Border
    if (node.border) {
        classes.push(borderToClasses(node.border))
    }

    // Border radius
    classes.push(radiusToClass(node.borderRadius))

    // Overflow
    if (node.overflow === 'hidden') classes.push('overflow-hidden')

    // Opacity
    if (node.opacity < 1) classes.push(`opacity-${Math.round(node.opacity * 100)}`)

    // Shadows
    node.shadows.forEach(s => classes.push(shadowToClass(s)))

    return classes.filter(Boolean).join(' ')
}
```

### TextNode → `<h1>` / `<p>` / `<span>` / etc.

```typescript
function textToHtml(node: TextNode): string {
    const tag = node.htmlTag || inferTextTag(node)
    const classes = buildTextClasses(node)
    const content = escapeHtml(node.characters)
    return `<${tag} class="${classes}">${content}</${tag}>`
}

function buildTextClasses(node: TextNode): string {
    const classes: string[] = []

    classes.push(fontSizeToClass(node.fontSize))         // text-xl, text-4xl, etc.
    classes.push(fontWeightToClass(node.fontWeight))      // font-bold, font-medium, etc.
    if (node.fontFamily !== 'Inter') classes.push(`font-[${node.fontFamily}]`)
    if (node.textAlign !== 'left') classes.push(`text-${node.textAlign}`)
    if (node.textTransform !== 'none') classes.push(node.textTransform)
    if (node.textDecoration !== 'none') classes.push(node.textDecoration)
    if (node.letterSpacing) classes.push(letterSpacingToClass(node.letterSpacing))
    if (node.lineHeight !== 'auto') classes.push(lineHeightToClass(node.lineHeight))
    classes.push(colorToClass(node.color))               // text-gray-900, text-[#hex], etc.

    return classes.filter(Boolean).join(' ')
}
```

### ImageNode → `<img>`

```typescript
function imageToHtml(node: ImageNode): string {
    const classes = buildImageClasses(node)
    const src = node.isPlaceholder
        ? `/placeholder-${node.placeholderLabel || 'image'}.jpg`
        : node.src
    return `<img src="${src}" alt="${escapeHtml(node.alt)}" class="${classes}" />`
}
```

## Px → Tailwind Conversion

```typescript
// Spacing scale: px → Tailwind value
const SPACING_MAP: Record<number, string> = {
    0: '0', 4: '1', 8: '2', 12: '3', 16: '4', 20: '5', 24: '6',
    28: '7', 32: '8', 36: '9', 40: '10', 44: '11', 48: '12',
    56: '14', 64: '16', 80: '20', 96: '24', 112: '28', 128: '32',
}

function pxToTailwind(px: number): string {
    if (SPACING_MAP[px]) return SPACING_MAP[px]
    return `[${px}px]`  // Arbitrary value fallback
}

// Font size: px → Tailwind class
const FONT_SIZE_MAP: Record<number, string> = {
    12: 'text-xs', 14: 'text-sm', 16: 'text-base', 18: 'text-lg',
    20: 'text-xl', 24: 'text-2xl', 30: 'text-3xl', 36: 'text-4xl',
    48: 'text-5xl', 60: 'text-6xl', 72: 'text-7xl', 96: 'text-8xl',
}

// Color: hex → Tailwind class (reverse of C1 color map)
function colorToClass(hex: string): string {
    const tailwindName = REVERSE_COLOR_MAP[hex.toLowerCase()]
    if (tailwindName) return tailwindName  // e.g., "text-gray-900"
    return `text-[${hex}]`                 // Arbitrary value
}
```

## Export Modes

### 1. Single Page Export
```typescript
export function exportPageToHtml(pageFrame: FrameNode): string
```
Returns HTML for one page.

### 2. Full Project Export
```typescript
export function exportProjectToZip(
    pages: { name: string; frame: FrameNode }[]
): Blob
```
Returns a ZIP containing:
```
project/
  index.html          ← Home page
  about.html          ← About page
  pricing.html        ← Pricing page
  assets/             ← Downloaded images (future)
  styles.css          ← Custom styles if any
```

### 3. Internal Export (for AI iteration)
```typescript
export function exportNodesToHtml(nodes: ScytleNode[]): string
```
Returns raw HTML body content — no doctype, no head. Fed back to AI for edits.

## Export Button UX

The "Export" button in the top bar triggers a dialog:

```
┌──────────────────────────────────────────┐
│  Export Project                     [✕]  │
│                                          │
│  Format:                                 │
│  ● HTML + Tailwind (CDN)                │
│  ○ HTML + Custom CSS                    │
│  ○ React + Tailwind (coming soon)       │
│  ○ Next.js App (coming soon)            │
│                                          │
│  Pages: (checkboxes)                     │
│  ☑ Home                                 │
│  ☑ Dashboard                            │
│  ☑ About                                │
│  ☐ Pricing (not yet designed)           │
│                                          │
│  [ Preview ]  [ Download ZIP ]           │
└──────────────────────────────────────────┘
```

## File Structure

```
src/lib/export/
  index.ts                    ← barrel export
  nodes-to-html.ts            ← Main nodeToHtml() recursive converter
  class-builder.ts            ← ScytleNode properties → Tailwind classes
  reverse-color-map.ts        ← hex → Tailwind color name
  html-template.ts            ← Full HTML document wrapper
  zip-builder.ts              ← Multi-page ZIP generation (uses JSZip)

src/components/workspace/
  export-dialog.tsx           ← Export options dialog
```

## Quality Targets

1. **Round-trip fidelity**: `parse(export(parse(html)))` should produce functionally identical HTML
2. **Clean output**: No unnecessary wrapper divs, no redundant classes
3. **Standard Tailwind**: Prefer named Tailwind classes over arbitrary values where possible
4. **Readable HTML**: Proper indentation, semantic tags, descriptive image alts
5. **Copy-paste ready**: Output HTML should work immediately in any Tailwind project

## Future Enhancements

- **React component export**: Convert node tree to React JSX + component files
- **Next.js project export**: Generate a full Next.js app with pages routing
- **Figma export**: Convert ScytleNode tree to Figma REST API nodes (reverse of Figma MCP)
- **Image download**: Replace placeholder images with AI-generated images (Vertex AI Imagen)
- **Responsive export**: Generate responsive classes based on multiple viewport mockups
