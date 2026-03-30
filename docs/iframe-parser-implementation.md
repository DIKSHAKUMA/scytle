# Iframe-Based Parser Implementation Plan

> **Date**: 2026-03-29
> **Status**: ✅ Fully Implemented — all 6 phases complete, 143 tests passing
> **Goal**: Replace heuristic-based HTML→ScytleNode parser with browser-rendered iframe approach while preserving full editing, theme system, and chat tab functionality.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Phase 0 — Foundation: Iframe Render Engine](#2-phase-0--foundation-iframe-render-engine)
3. [Phase 1 — DOM Walker: Computed Styles → ScytleNode](#3-phase-1--dom-walker-computed-styles--scytlenode)
4. [Phase 2 — Theme Integration: LinkMaps + Relink](#4-phase-2--theme-integration-linkmaps--relink)
5. [Phase 3 — SVG Handling](#5-phase-3--svg-handling)
6. [Phase 4 — Consumer Integration: generate-page + chat-tab](#6-phase-4--consumer-integration-generate-page--chat-tab)
7. [Phase 5 — Edge Cases + Polish](#7-phase-5--edge-cases--polish)
8. [Phase 6 — Testing + Validation](#8-phase-6--testing--validation)
9. [Rollback Strategy](#9-rollback-strategy)
10. [File Inventory](#10-file-inventory)

---

## 1. Architecture Overview

### Current Pipeline (Broken)

```
AI HTML (Tailwind)
    ↓  DOMParser (no layout engine)
parseClasses(className)          ← regex-parses Tailwind classes, misses edge cases
    ↓
buildTextNode / buildContainerNode / buildImageNode / buildSvgNode
    ↓  estimateTextHeight() ← CHAR_WIDTH_RATIO = 0.55 guessing
    ↓  estimateContainerHeight() ← recursive height summing
    ↓  resolveColor() from class names ← fails on opacity modifiers, inheritance
ScytleNode tree (with wrong dimensions, missing colors, broken SVGs)
```

**Every `↓` is a data-loss point.** The parser manually re-implements CSS layout, color resolution, text measurement, and SVG geometry — all of which the browser does perfectly for free.

### New Pipeline (Iframe)

```
AI HTML (Tailwind)
    ↓  inject into hidden <iframe> with Tailwind CDN + Google Fonts
Browser renders HTML (real CSS engine)
    ↓  getComputedStyle() on every element
    ↓  getBoundingClientRect() on every element
Walk rendered DOM → build ScytleNode tree with REAL values
    ↓
relinkNodes(nodes, variableTable, themeMode)   ← semantic theme linking
    ↓
ScytleNode tree (accurate dimensions, correct colors, working SVGs, theme refs)
```

**One data-loss point** (DOM → ScytleNode), and it's a straightforward property copy from computed values. The browser handles all the hard parts.

### What Stays the Same

| Component | Changes? | Why |
|-----------|----------|-----|
| **ScytleNode types** (`types/canvas.ts`) | No | Same output structure — FrameNode, TextNode, ImageNode, VectorNode |
| **Canvas renderer** (`node-renderer.tsx`, `render-utils.ts`) | No | Renders ScytleNodes regardless of how they were created |
| **Property panels** (`properties-panel/`) | No | Reads/writes node properties — doesn't care about parser |
| **Editor store** (`editor-store.ts`) | No | addNode, replaceNode, updateNode, undo/redo — same API |
| **Theme tab** (`theme-tab.tsx`) | No | Modifies StyleGuideStore → triggers relinkNodes |
| **Theme resolver** (`theme-resolver.ts`, `theme-context.tsx`) | No | Resolves refs at render time — same mechanism |
| **relink-nodes.ts** | No | Semantic classifier works on any ScytleNode tree |
| **variable-table.ts** | No | buildLinkMaps produces same maps |
| **class-parser.ts** | Kept as fallback | Still useful for non-iframe contexts (SSR, tests) |
| **size-utils.ts** | Kept as fallback | Still useful for non-iframe contexts |
| **Drag/resize hooks** | No | Operate on node x/y/width/height |
| **Selection system** | No | Operates on node IDs |

### What Changes

| Component | Change | Impact |
|-----------|--------|--------|
| **html-to-nodes.ts** | New `parseHtmlToNodesViaIframe()` function added alongside existing `parseHtmlToNodes()` | Core change — new async parser |
| **generate-page.ts** | Calls new async parser instead of sync parser | Minor integration |
| **chat-tab.tsx** | Calls new async parser instead of sync parser | Minor integration |
| **New file: `iframe-renderer.ts`** | Iframe lifecycle management | New utility |
| **parser/index.ts** | Export new function | Barrel update |

### Key Constraint: The New Parser Must Be Async

`getComputedStyle()` and `getBoundingClientRect()` require the iframe to be in the DOM and rendered. This means:

- `parseHtmlToNodes()` is **sync** (current) → `parseHtmlToNodesViaIframe()` is **async** (returns `Promise<FrameNode>`)
- Both `generatePage()` (already async) and chat-tab's apply logic (already in async `useEffect`) can handle this
- The sync `parseHtmlToNodes()` is **kept as fallback** for SSR/test contexts

---

## 2. Phase 0 — Foundation: Iframe Render Engine

### Goal
Create a reusable hidden iframe that can render HTML with Tailwind CSS and Google Fonts, then expose the rendered DOM for measurement.

### New File: `src/lib/parser/iframe-renderer.ts`

```typescript
/**
 * IframeRenderer — manages a hidden iframe for browser-based HTML measurement.
 *
 * Lifecycle:
 *   1. create() — injects iframe into document.body (hidden, off-screen)
 *   2. render(html, fonts?) — writes HTML + Tailwind CDN + font imports into iframe
 *   3. measure() — waits for layout, returns iframe's contentDocument
 *   4. destroy() — removes iframe from DOM
 *
 * The iframe is reusable: call render() multiple times without recreating.
 */

export interface IframeRendererOptions {
    /** Width of the iframe viewport (default: 1440px) */
    width?: number
    /** Additional CSS to inject (e.g., custom font @imports) */
    customCSS?: string
    /** Google Font families to load before measuring */
    fonts?: string[]
}

export class IframeRenderer {
    private iframe: HTMLIFrameElement | null = null
    private ready: boolean = false

    /**
     * Create and append the hidden iframe to document.body.
     * The iframe is positioned off-screen with visibility:hidden
     * so it participates in layout but is invisible.
     */
    create(options?: IframeRendererOptions): void

    /**
     * Write HTML content into the iframe with Tailwind CDN and font imports.
     * Returns a promise that resolves when fonts are loaded and layout is stable.
     *
     * @param html — raw HTML string (the AI-generated HTML)
     * @param options — fonts to load, custom CSS, viewport width
     * @returns Promise<Document> — the iframe's contentDocument after layout
     */
    async render(html: string, options?: IframeRendererOptions): Promise<Document>

    /**
     * Remove the iframe from DOM and clean up.
     */
    destroy(): void
}
```

### Implementation Details

#### Iframe Setup
```typescript
create(options?: IframeRendererOptions): void {
    if (this.iframe) return // Already created

    const iframe = document.createElement('iframe')
    iframe.style.cssText = `
        position: fixed;
        top: -10000px;
        left: -10000px;
        width: ${options?.width ?? 1440}px;
        height: 0;
        border: none;
        visibility: hidden;
        pointer-events: none;
    `
    // sandbox — allow scripts (for Tailwind JIT) but block navigation
    iframe.sandbox.add('allow-scripts', 'allow-same-origin')
    document.body.appendChild(iframe)
    this.iframe = iframe
}
```

**Why `visibility: hidden` not `display: none`?**
`display: none` removes the element from layout — `getComputedStyle()` and `getBoundingClientRect()` return zeros. `visibility: hidden` keeps layout intact but hides the element visually.

**Why `position: fixed; top: -10000px`?**
Prevents any visual flash. The iframe renders off-screen.

#### HTML Injection with Tailwind
```typescript
async render(html: string, options?: IframeRendererOptions): Promise<Document> {
    if (!this.iframe) throw new Error('IframeRenderer not created')

    const doc = this.iframe.contentDocument!
    const width = options?.width ?? 1440

    // Update iframe width for layout
    this.iframe.style.width = `${width}px`

    // Build font import tags
    const fontImports = (options?.fonts ?? [])
        .map(f => {
            const family = f.replace(/\s+/g, '+')
            return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${family}:wght@100;200;300;400;500;600;700;800;900&display=swap">`
        })
        .join('\n')

    // Write the full document
    doc.open()
    doc.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=${width}">
    <script src="https://cdn.tailwindcss.com"></script>
    ${fontImports}
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; padding: 0; width: ${width}px; overflow: hidden; }
        img { display: block; max-width: 100%; }
        ${options?.customCSS ?? ''}
    </style>
</head>
<body>
    ${html}
</body>
</html>`)
    doc.close()

    // Wait for Tailwind to process + fonts to load + layout to stabilize
    await this.waitForReady(doc)

    // Auto-size iframe height to content
    this.iframe.style.height = `${doc.body.scrollHeight}px`

    return doc
}
```

#### Layout Stability Wait
```typescript
private async waitForReady(doc: Document): Promise<void> {
    // 1. Wait for Tailwind script to execute
    await new Promise<void>((resolve) => {
        const check = () => {
            // Tailwind CDN adds a <style> tag — check for it
            const tailwindStyles = doc.querySelectorAll('style')
            if (tailwindStyles.length > 0) {
                resolve()
            } else {
                requestAnimationFrame(check)
            }
        }
        // Give initial script time to load
        setTimeout(check, 50)
    })

    // 2. Wait for fonts
    try {
        await doc.fonts.ready
    } catch {
        // fonts.ready not available in some iframe contexts — wait fallback
        await new Promise(r => setTimeout(r, 200))
    }

    // 3. One more frame for layout stabilization
    await new Promise<void>(resolve => {
        this.iframe!.contentWindow!.requestAnimationFrame(() => {
            this.iframe!.contentWindow!.requestAnimationFrame(() => {
                resolve()
            })
        })
    })
}
```

### Phase 0 Testing Checklist

| # | Test | How to Verify | Pass Criteria |
|---|------|---------------|---------------|
| 0.1 | Iframe is created off-screen | `document.querySelectorAll('iframe')` returns the iframe, its `getBoundingClientRect().top < 0` | Iframe exists in DOM but not visible |
| 0.2 | Tailwind CSS loads | Inject `<div class="bg-blue-500 p-4">test</div>`, read `getComputedStyle().backgroundColor` | Returns `rgb(59, 130, 246)` (blue-500) |
| 0.3 | Google Fonts load | Inject text with `font-family: 'Playfair Display'`, check `doc.fonts.check('16px Playfair Display')` | Returns `true` |
| 0.4 | Layout is computed | Inject a flex container with children, read `getBoundingClientRect()` on children | Children have non-zero widths summing to container width |
| 0.5 | Dimensions are accurate | Inject known layout (1440px wide, 3 equal flex children), measure children | Each child ~480px wide |
| 0.6 | Iframe reuse works | Call `render()` twice with different HTML, measure second render | Second render shows correct new content |
| 0.7 | Destroy cleans up | Call `destroy()`, check `document.querySelectorAll('iframe').length` | Returns 0 |
| 0.8 | Multiple iframes safe | Create two IframeRenderer instances simultaneously | Both render independently |

### Manual MCP Test (Phase 0)

After implementation, open `/test/parser` page and add a "Test Iframe" button:
1. Click button → creates IframeRenderer
2. Injects the landing page HTML preset
3. Reads computed styles of root element
4. Displays: `{ width, height, backgroundColor, display, flexDirection }` in the debug panel
5. Verify values match what you'd see in Chrome DevTools

---

## 3. Phase 1 — DOM Walker: Computed Styles → ScytleNode

### Goal
Walk the rendered iframe DOM and build ScytleNode trees using `getComputedStyle()` and `getBoundingClientRect()` instead of heuristic parsing.

### New Function: `parseHtmlToNodesViaIframe()`

```typescript
// In src/lib/parser/html-to-nodes.ts (or new file: iframe-parser.ts)

export async function parseHtmlToNodesViaIframe(
    html: string,
    pageName: string = 'Page',
    options?: {
        rootWidth?: number
        variableTable?: VariableTable
        themeMode?: ThemeMode
        fonts?: string[]
    }
): Promise<FrameNode> {
    const renderer = new IframeRenderer()
    renderer.create({ width: options?.rootWidth ?? 1440 })

    try {
        const doc = await renderer.render(html, {
            width: options?.rootWidth ?? 1440,
            fonts: options?.fonts,
        })

        const rootEl = doc.body.firstElementChild as HTMLElement
        if (!rootEl) {
            // Empty HTML — return empty frame
            return createEmptyFrame(pageName, options?.rootWidth ?? 1440)
        }

        // Build the node tree from real DOM
        const rootNode = walkRenderedElement(
            rootEl,
            doc.defaultView!,    // window for getComputedStyle
            null,                // no parent
        )

        // Wrap in page frame
        const pageFrame = wrapInPageFrame(
            rootNode,
            pageName,
            options?.rootWidth ?? 1440,
            rootEl,
            doc.defaultView!,
        )

        return pageFrame
    } finally {
        renderer.destroy()
    }
}
```

### Core Walker: `walkRenderedElement()`

This is the heart of the new parser. It replaces `walkElement()` + `parseClasses()` + all `buildXxxNode()` functions.

```typescript
function walkRenderedElement(
    el: HTMLElement,
    win: Window,
    parentEl: HTMLElement | null,
): ScytleNode | null {
    const tag = el.tagName.toLowerCase()

    // Skip non-visual elements
    if (SKIP_TAGS.has(tag)) return null

    const cs = win.getComputedStyle(el)
    const rect = el.getBoundingClientRect()

    // Skip invisible elements (display: none, zero size with no children)
    if (cs.display === 'none') return null
    if (rect.width === 0 && rect.height === 0 && el.children.length === 0 && !el.textContent?.trim()) {
        return null
    }

    // Dispatch by element type
    if (tag === 'img') return buildImageNodeFromComputed(el as HTMLImageElement, cs, rect)
    if (tag === 'svg') return buildSvgNodeFromComputed(el as SVGSVGElement, cs, rect, win)
    if (tag === 'video' || tag === 'iframe') return buildMediaPlaceholderFromComputed(el, cs, rect)

    // Text-only elements (no element children, only text content)
    if (isTextOnlyElement(el, tag)) {
        return buildTextNodeFromComputed(el, cs, rect, tag)
    }

    // Container elements (has element children or is a layout container)
    return buildContainerNodeFromComputed(el, cs, rect, tag, win)
}
```

### Node Builders from Computed Styles

#### `buildTextNodeFromComputed()`

```typescript
function buildTextNodeFromComputed(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    tag: string,
): TextNode {
    const text = extractTextContent(el)

    return {
        type: 'text',
        id: generateId(),
        name: text.slice(0, 40) || tag,
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width: rect.width,       // REAL measured width
        height: rect.height,     // REAL measured height
        characters: text,
        htmlTag: inferHtmlTag(tag),

        // Typography — all from getComputedStyle, no guessing
        fontSize: parseFloat(cs.fontSize),           // always px
        fontWeight: parseInt(cs.fontWeight),          // always numeric
        fontFamily: extractPrimaryFont(cs.fontFamily),
        fontStyle: cs.fontStyle === 'italic' ? 'italic' : undefined,
        lineHeight: cs.lineHeight === 'normal'
            ? parseFloat(cs.fontSize) * 1.2
            : parseFloat(cs.lineHeight),
        letterSpacing: cs.letterSpacing === 'normal'
            ? 0
            : parseFloat(cs.letterSpacing),
        textAlign: cs.textAlign as TextNode['textAlign'],
        textTransform: cs.textTransform === 'none'
            ? undefined
            : cs.textTransform as TextNode['textTransform'],
        textDecoration: parseTextDecoration(cs.textDecorationLine),
        color: rgbToHex(cs.color),                   // convert rgb(r,g,b) → #rrggbb

        // Sizing — determined by context
        sizing: inferTextSizing(el, cs, tag),
        autoResize: inferAutoResize(tag, cs),

        // Base properties
        opacity: parseFloat(cs.opacity),
        rotation: 0,
        overflow: 'visible',
        borderRadius: 0,
        fills: [],
        shadows: [],
        positioning: cs.position === 'absolute' ? 'absolute' : 'auto',
        margin: extractMargin(cs),
    }
}
```

**Key differences from current `buildTextNode()`:**
- `width` and `height` come from `getBoundingClientRect()` — no `CHAR_WIDTH_RATIO` guessing
- `fontSize`, `fontWeight`, `lineHeight` come from `getComputedStyle()` — no Tailwind class lookup
- `color` comes from `cs.color` (computed, includes inheritance) — no `resolveColor()` heuristic

#### `buildContainerNodeFromComputed()`

```typescript
function buildContainerNodeFromComputed(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    tag: string,
    win: Window,
): FrameNode {
    // Recursively walk children
    const children: ScytleNode[] = []
    for (const child of el.children) {
        if (child instanceof HTMLElement || child instanceof SVGSVGElement) {
            const node = walkRenderedElement(child as HTMLElement, win, el)
            if (node) children.push(node)
        }
    }

    // Handle inline-only containers (no element children, but has text)
    // that weren't caught by isTextOnlyElement
    if (children.length === 0 && el.textContent?.trim()) {
        const textNode = buildTextNodeFromComputed(el, cs, rect, tag)
        // Wrap the text in a frame if container has visual properties
        if (hasVisualProperties(cs)) {
            children.push(textNode)
        } else {
            return textNode as unknown as FrameNode // Promote to text
        }
    }

    // Layout detection — from COMPUTED display, not class parsing
    const layout = extractLayout(cs)

    return {
        type: 'frame',
        id: generateId(),
        name: inferNodeName(el, tag, children),
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width: rect.width,      // REAL
        height: rect.height,    // REAL
        children,

        // Layout — from computed styles, no inference needed
        layout,

        // Spacing — from computed styles
        padding: extractPadding(cs),

        // Visual — from computed styles
        fills: extractFills(cs),
        border: extractBorder(cs),
        borderRadius: extractBorderRadius(cs),
        shadows: extractShadows(cs.boxShadow),
        opacity: parseFloat(cs.opacity),
        overflow: cs.overflow === 'hidden' ? 'hidden' : 'visible',
        rotation: 0,

        // Sizing
        sizing: inferContainerSizing(el, cs, layout),
        positioning: cs.position === 'absolute' ? 'absolute' : 'auto',

        // Flex child properties
        ...(cs.flexGrow !== '0' ? { layoutGrow: parseFloat(cs.flexGrow) } : {}),
        ...(cs.flexShrink !== '1' ? { flexShrink: parseFloat(cs.flexShrink) } : {}),
        ...(cs.flexBasis !== 'auto' && cs.flexBasis !== '0%'
            ? { flexBasis: parseFloat(cs.flexBasis) }
            : {}),

        // Margins
        margin: extractMargin(cs),
    }
}
```

### Utility Functions

#### Color Conversion (Critical!)

```typescript
/**
 * Convert CSS computed color string to hex.
 * getComputedStyle ALWAYS returns rgb() or rgba() format.
 *
 * Examples:
 *   'rgb(59, 130, 246)'      → '#3b82f6'
 *   'rgba(59, 130, 246, 0.5)' → '#3b82f6' (opacity handled separately)
 *   'transparent'             → '#000000' (with opacity 0)
 */
function rgbToHex(rgb: string): string {
    if (rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent'

    const match = rgb.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (!match) return '#000000'

    const r = parseInt(match[1])
    const g = parseInt(match[2])
    const b = parseInt(match[3])

    return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
}

/**
 * Extract opacity from rgba() string.
 * Returns 1 if no alpha channel.
 */
function rgbToOpacity(rgb: string): number {
    const match = rgb.match(/rgba\(\d+,\s*\d+,\s*\d+,\s*([\d.]+)\)/)
    return match ? parseFloat(match[1]) : 1
}
```

#### Layout Extraction

```typescript
function extractLayout(cs: CSSStyleDeclaration): Layout {
    const display = cs.display

    if (display === 'grid' || display === 'inline-grid') {
        return {
            mode: 'grid' as const,
            direction: 'row' as const,
            gap: parseFloat(cs.gap) || 0,
            columns: parseGridTemplateCount(cs.gridTemplateColumns),
            rows: parseGridTemplateCount(cs.gridTemplateRows),
            columnGap: parseFloat(cs.columnGap) || undefined,
            rowGap: parseFloat(cs.rowGap) || undefined,
        }
    }

    if (display === 'flex' || display === 'inline-flex') {
        return {
            mode: 'flex' as const,
            direction: (cs.flexDirection === 'column' ? 'column' : 'row') as 'row' | 'column',
            justify: mapJustifyContent(cs.justifyContent),
            align: mapAlignItems(cs.alignItems),
            wrap: cs.flexWrap !== 'nowrap' ? cs.flexWrap : undefined,
            gap: parseFloat(cs.gap) || 0,
        }
    }

    // Not flex or grid — 'none' layout (absolute positioning / block flow)
    return { mode: 'none' as const }
}

function parseGridTemplateCount(template: string): number {
    if (!template || template === 'none') return 1
    // grid-template-columns: "200px 200px 200px" or "repeat(3, 1fr)"
    // getComputedStyle resolves repeat() → space-separated values
    return template.split(/\s+/).filter(v => v && v !== 'none').length
}
```

#### Padding/Margin Extraction

```typescript
function extractPadding(cs: CSSStyleDeclaration): Padding {
    return {
        top: parseFloat(cs.paddingTop) || 0,
        right: parseFloat(cs.paddingRight) || 0,
        bottom: parseFloat(cs.paddingBottom) || 0,
        left: parseFloat(cs.paddingLeft) || 0,
    }
}

function extractMargin(cs: CSSStyleDeclaration): Margin {
    return {
        top: parseFloat(cs.marginTop) || 0,
        right: parseFloat(cs.marginRight) || 0,
        bottom: parseFloat(cs.marginBottom) || 0,
        left: parseFloat(cs.marginLeft) || 0,
    }
}
```

#### Border Extraction

```typescript
function extractBorder(cs: CSSStyleDeclaration): Border | undefined {
    const width = parseFloat(cs.borderTopWidth) || 0
    if (width === 0) return undefined

    return {
        color: rgbToHex(cs.borderTopColor),
        width,
        style: cs.borderTopStyle as 'solid' | 'dashed' | 'dotted',
        position: 'inside' as const,
        opacity: rgbToOpacity(cs.borderTopColor),
        visible: true,
    }
}
```

#### Border Radius Extraction

```typescript
function extractBorderRadius(cs: CSSStyleDeclaration): BorderRadius {
    const tl = parseFloat(cs.borderTopLeftRadius) || 0
    const tr = parseFloat(cs.borderTopRightRadius) || 0
    const br = parseFloat(cs.borderBottomRightRadius) || 0
    const bl = parseFloat(cs.borderBottomLeftRadius) || 0

    // If all corners are equal, return single number (Scytle convention)
    if (tl === tr && tr === br && br === bl) return tl

    return { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl }
}
```

#### Fill Extraction

```typescript
function extractFills(cs: CSSStyleDeclaration): Fill[] {
    const fills: Fill[] = []

    // Background color
    const bgColor = cs.backgroundColor
    if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
        fills.push({
            type: 'solid',
            id: generateId(),
            color: rgbToHex(bgColor),
            opacity: rgbToOpacity(bgColor),
            visible: true,
        })
    }

    // Background image (gradients)
    const bgImage = cs.backgroundImage
    if (bgImage && bgImage !== 'none') {
        const gradientFill = parseGradientFromComputed(bgImage)
        if (gradientFill) fills.push(gradientFill)
    }

    return fills
}
```

#### Shadow Extraction

```typescript
function extractShadows(boxShadow: string): Shadow[] {
    if (!boxShadow || boxShadow === 'none') return []

    const shadows: Shadow[] = []
    // box-shadow can have multiple shadows separated by commas
    // But commas also appear inside rgba() — split carefully
    const parts = splitBoxShadowParts(boxShadow)

    for (const part of parts) {
        const shadow = parseSingleShadow(part.trim())
        if (shadow) shadows.push(shadow)
    }

    return shadows
}

function parseSingleShadow(shadow: string): Shadow | null {
    // Format: [inset] x y blur spread color
    const isInner = shadow.startsWith('inset')
    const cleaned = shadow.replace('inset', '').trim()

    // Extract color (rgb/rgba at the end)
    const colorMatch = cleaned.match(/(rgba?\([^)]+\))/)
    const color = colorMatch ? rgbToHex(colorMatch[1]) : '#000000'
    const colorOpacity = colorMatch ? rgbToOpacity(colorMatch[1]) : 1

    // Extract numeric values (before the color)
    const nums = cleaned.replace(/(rgba?\([^)]+\))/, '').trim()
        .split(/\s+/)
        .map(n => parseFloat(n) || 0)

    if (nums.length < 2) return null

    return {
        type: isInner ? 'inner' : 'drop',
        x: nums[0],
        y: nums[1],
        blur: nums[2] || 0,
        spread: nums[3] || 0,
        color,
        visible: true,
    }
}
```

#### Sizing Inference

```typescript
function inferContainerSizing(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    layout: Layout,
): Sizing {
    const parentCs = el.parentElement ? getComputedStyle(el.parentElement) : null
    const parentIsFlexRow = parentCs?.display === 'flex' && parentCs?.flexDirection === 'row'
    const parentIsFlexCol = parentCs?.display === 'flex' && parentCs?.flexDirection !== 'row'

    let horizontal: 'fixed' | 'hug' | 'fill' = 'hug'
    let vertical: 'fixed' | 'hug' | 'fill' = 'hug'

    // Horizontal sizing
    if (cs.width !== 'auto' && cs.width.endsWith('px')) {
        horizontal = 'fixed'
    }
    // If flex-grow > 0 in a row parent, it fills
    if (parentIsFlexRow && parseFloat(cs.flexGrow) > 0) {
        horizontal = 'fill'
    }
    // If width is 100% in a column parent, it fills
    if (parentIsFlexCol && cs.width === '100%') {
        horizontal = 'fill'
    }

    // Vertical sizing
    if (cs.height !== 'auto' && cs.height.endsWith('px')) {
        vertical = 'fixed'
    }
    if (parentIsFlexCol && parseFloat(cs.flexGrow) > 0) {
        vertical = 'fill'
    }

    return { horizontal, vertical }
}

function inferTextSizing(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    tag: string,
): Sizing {
    const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
    const isBlock = cs.display === 'block'
    const isInline = cs.display === 'inline' || cs.display === 'inline-block'

    if (isInline) return { horizontal: 'hug', vertical: 'hug' }
    if (isBlock || isHeading) return { horizontal: 'fill', vertical: 'hug' }
    return { horizontal: 'hug', vertical: 'hug' }
}
```

#### Text Content Extraction

```typescript
/**
 * Extract text content from an element, preserving line breaks
 * but excluding text from child elements.
 */
function extractTextContent(el: HTMLElement): string {
    let text = ''
    for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent || ''
        } else if (child instanceof HTMLBRElement) {
            text += '\n'
        } else if (child instanceof HTMLElement) {
            // For inline elements (strong, em, a, span), include their text
            const display = getComputedStyle(child).display
            if (display === 'inline' || display === 'inline-block') {
                text += child.textContent || ''
            }
        }
    }
    return text.trim()
}

/**
 * Check if an element should be treated as a text node
 * (contains only inline text content, no block-level children).
 */
function isTextOnlyElement(el: HTMLElement, tag: string): boolean {
    // Always treat these as text
    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'label'].includes(tag)) return true

    // Check if all children are inline (text, span, strong, em, a, etc.)
    if (el.children.length === 0) return !!el.textContent?.trim()

    for (const child of el.children) {
        const childDisplay = getComputedStyle(child).display
        if (childDisplay !== 'inline' && childDisplay !== 'inline-block') {
            return false
        }
    }

    return true
}
```

#### Node Naming

```typescript
function inferNodeName(el: HTMLElement, tag: string, children: ScytleNode[]): string {
    // 1. aria-label
    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel

    // 2. data-name attribute (our convention)
    const dataName = el.getAttribute('data-name')
    if (dataName) return dataName

    // 3. Semantic tag names
    const semanticNames: Record<string, string> = {
        nav: 'Nav', header: 'Header', footer: 'Footer',
        main: 'Main', aside: 'Sidebar', section: 'Section',
        article: 'Article', form: 'Form', button: 'Button',
    }
    if (semanticNames[tag]) return semanticNames[tag]

    // 4. Class-based heuristics
    const cls = el.className
    if (typeof cls === 'string') {
        if (cls.includes('hero')) return 'Hero'
        if (cls.includes('card')) return 'Card'
        if (cls.includes('feature')) return 'Features'
        if (cls.includes('testimonial')) return 'Testimonials'
        if (cls.includes('cta')) return 'CTA'
        if (cls.includes('pricing')) return 'Pricing'
    }

    // 5. First heading text
    const heading = el.querySelector('h1, h2, h3')
    if (heading?.textContent) return heading.textContent.trim().slice(0, 40)

    // 6. Fallback
    return 'Frame'
}
```

### Phase 1 Testing Checklist

| # | Test | Input | Pass Criteria |
|---|------|-------|---------------|
| 1.1 | Basic text node | `<h1 class="text-4xl font-bold">Hello</h1>` | TextNode with `fontSize: 36`, `fontWeight: 700`, `characters: 'Hello'` |
| 1.2 | Text dimensions accurate | `<p class="text-base max-w-md">Long paragraph text...</p>` | `width ≈ 448px (max-w-md)`, `height > 0` (real wrapped height) |
| 1.3 | Flex row layout | `<div class="flex gap-4"><div>A</div><div>B</div></div>` | FrameNode with `layout.mode: 'flex'`, `layout.direction: 'row'`, `layout.gap: 16` |
| 1.4 | Flex column layout | `<div class="flex flex-col gap-2"><div>A</div><div>B</div></div>` | `layout.direction: 'column'`, `layout.gap: 8` |
| 1.5 | Grid layout | `<div class="grid grid-cols-3 gap-4">...3 items...</div>` | `layout.mode: 'grid'`, `layout.columns: 3`, children widths ≈ equal |
| 1.6 | Background color | `<div class="bg-blue-500">test</div>` | `fills[0].color === '#3b82f6'` |
| 1.7 | Gradient | `<div class="bg-gradient-to-r from-blue-500 to-purple-500">test</div>` | `fills` contains gradient fill |
| 1.8 | Border | `<div class="border border-gray-300 rounded-lg">test</div>` | `border.width: 1`, `border.color`, `borderRadius: 8` |
| 1.9 | Shadow | `<div class="shadow-lg">test</div>` | `shadows.length > 0`, shadow has `blur > 0` |
| 1.10 | Padding | `<div class="px-8 py-4">test</div>` | `padding: { top: 16, right: 32, bottom: 16, left: 32 }` |
| 1.11 | Opacity | `<div class="opacity-50">test</div>` | `opacity: 0.5` |
| 1.12 | Image node | `<img src="test.jpg" class="w-full aspect-video">` | FrameNode with ImageFill, `width: 1440`, `height: 810` (16:9) |
| 1.13 | Nested layout | Flex row inside flex column | Correct nested layout modes, correct child widths |
| 1.14 | Absolute positioning | `<div class="relative"><div class="absolute top-4 left-8">A</div></div>` | Child has `positioning: 'absolute'`, `x: 32`, `y: 16` |
| 1.15 | Text color inheritance | `<div class="text-white bg-gray-900"><p>White text</p></div>` | TextNode `color: '#ffffff'` (inherited from parent) |
| 1.16 | Button detection | `<button class="bg-blue-500 px-4 py-2 text-white">Click</button>` | FrameNode with TextNode child, correct padding and fill |
| 1.17 | Empty container dropped | `<div></div>` (no content, no styles) | Returns `null` |
| 1.18 | Per-corner radius | `<div class="rounded-tl-lg rounded-br-lg">test</div>` | `borderRadius: { topLeft: 8, topRight: 0, bottomRight: 8, bottomLeft: 0 }` |
| 1.19 | Full landing page | Complete Hero + Features + CTA HTML | Complete node tree, all sections present, correct hierarchy |
| 1.20 | Width of flex children | `<div class="flex"><div class="w-1/3">A</div><div class="flex-1">B</div></div>` | Child 1: ~480px, Child 2: ~960px |

### Manual MCP Test (Phase 1)

On the `/test/parser` page, add a toggle: **"Iframe Parser"** vs **"Legacy Parser"**.

1. Select the "Landing Page" preset HTML
2. Parse with Legacy → note widths, heights, colors in the debug tree
3. Parse with Iframe → compare widths, heights, colors
4. **Expected**: Iframe version has more accurate dimensions, correct text wrapping heights, correct inherited colors

---

## 4. Phase 2 — Theme Integration: LinkMaps + Relink

### Goal
Ensure that nodes built from iframe computed styles get proper theme variable refs (`colorRef`, `fontFamilyRef`, `paddingRef`, etc.) so the Theme Tab, color changes, and light/dark mode all work.

### The Two-Phase Linking Strategy

**Phase A (Single-Pass Exact Match):** During node building, attempt exact-match linking using `buildLinkMaps()`. This works for values that exactly match the variable table.

**Phase B (Semantic Classification):** After the full tree is built, run `relinkNodes()` to semantically classify all remaining unlinked properties.

### Implementation

#### Step 1: Pass LinkMaps into the walker

```typescript
export async function parseHtmlToNodesViaIframe(
    html: string,
    pageName: string = 'Page',
    options?: {
        rootWidth?: number
        variableTable?: VariableTable
        themeMode?: ThemeMode
        fonts?: string[]
    }
): Promise<FrameNode> {
    // Build link maps for single-pass matching
    const lm = options?.variableTable && options?.themeMode
        ? buildLinkMaps(options.variableTable, options.themeMode)
        : undefined

    // ... iframe render ...

    const rootNode = walkRenderedElement(rootEl, win, null, lm)

    // ... wrap in page frame ...

    // CRITICAL: Run semantic relinker AFTER building tree
    if (options?.variableTable && options?.themeMode) {
        relinkNodes(
            pageFrame.children,
            options.variableTable,
            options.themeMode,
        )
    }

    return pageFrame
}
```

#### Step 2: Exact-Match Linking in Node Builders

Add link-map matching to every node builder:

```typescript
function buildTextNodeFromComputed(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    tag: string,
    lm?: LinkMaps,    // <-- ADD THIS
): TextNode {
    const color = rgbToHex(cs.color)
    const fontFamily = extractPrimaryFont(cs.fontFamily)
    const fontSize = parseFloat(cs.fontSize)

    return {
        // ... all existing properties ...
        color,
        colorRef: lm ? matchColor(color, lm) : undefined,
        fontFamily,
        fontFamilyRef: lm ? matchFont(fontFamily, lm) : undefined,
        fontSize,
        fontSizeRef: lm ? matchFontSize(fontSize, lm) : undefined,
    }
}

function buildContainerNodeFromComputed(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    tag: string,
    win: Window,
    lm?: LinkMaps,    // <-- ADD THIS
): FrameNode {
    const fills = extractFills(cs)
    const padding = extractPadding(cs)
    const layout = extractLayout(cs)
    const borderRadius = extractBorderRadius(cs)
    const shadows = extractShadows(cs.boxShadow)

    // Link fills
    if (lm) {
        for (const fill of fills) {
            if (fill.type === 'solid' && fill.color) {
                fill.colorRef = matchColor(fill.color, lm)
            }
        }
    }

    return {
        // ... all existing properties ...
        fills,
        padding,
        paddingRef: lm ? matchSpacing(Math.max(padding.top, padding.right, padding.bottom, padding.left), lm) : undefined,
        layout: {
            ...layout,
            gapRef: lm && layout.gap ? matchSpacing(layout.gap, lm) : undefined,
        },
        borderRadius,
        borderRadiusRef: lm ? matchRadius(borderRadius, lm) : undefined,
        shadows,
        shadowRef: lm ? matchShadow(shadows, lm) : undefined,
    }
}
```

#### Step 3: relinkNodes() as Fallback

The `relinkNodes()` function in `relink-nodes.ts` runs after the tree is built. It uses semantic classification (not exact matching) to assign refs:

- **Fill colors**: Classified by luminance + color distance to accent, bg/primary, bg/secondary
- **Text colors**: Classified by contrast with parent fill + semantic role (heading vs body)
- **Fonts**: Classified by HTML tag (heading tags → `font/heading`, body → `font/body`)
- **Font sizes**: Classified by HTML tag (`h1` → `fontSize/h1`, etc.)
- **Border radius**: Closest match to `radius/sm|md|lg`
- **Padding/gap**: Closest match to `spacing/sm|md|lg|gap`
- **Shadows**: Assigned `shadow/sm` if present

**This two-phase approach ensures 100% ref coverage:**
1. Exact match catches values that directly match the variable table (e.g., when AI uses the exact hex from the theme context)
2. Semantic classification catches everything else (e.g., when AI uses a slightly different shade)

### Phase 2 Testing Checklist

| # | Test | Setup | Pass Criteria |
|---|------|-------|---------------|
| 2.1 | Exact color linking | Variable table has `accent: '#3b82f6'`, HTML has `bg-blue-500` | Fill has `colorRef: 'accent'` |
| 2.2 | Fuzzy color linking (relink) | Variable table has `accent: '#2563eb'`, HTML has `bg-blue-600` (different shade) | After relink, fill has `colorRef: 'accent'` (color distance < 60) |
| 2.3 | Text color linking | Text on dark background | TextNode has `colorRef: 'text/on-accent'` or `'text/primary'` |
| 2.4 | Font family linking | Variable table has `font/heading: 'Inter'`, heading uses Inter | TextNode has `fontFamilyRef: 'font/heading'` |
| 2.5 | Font size linking | H1 heading with 48px font | TextNode has `fontSizeRef: 'fontSize/h1'` |
| 2.6 | Padding linking | Container with `p-6` (24px) matching `spacing/md` | FrameNode has `paddingRef: 'spacing/md'` |
| 2.7 | Gap linking | Flex container with `gap-4` (16px) matching `spacing/gap` | Layout has `gapRef: 'spacing/gap'` |
| 2.8 | Border radius linking | Card with `rounded-lg` (8px) matching `radius/md` | FrameNode has `borderRadiusRef: 'radius/md'` |
| 2.9 | Shadow linking | Card with `shadow-sm` | FrameNode has `shadowRef: 'shadow/sm'` |
| 2.10 | Theme change propagation | Parse → change accent color in Theme Tab | All accent-linked fills update to new color |
| 2.11 | Light/dark mode toggle | Parse in light mode → toggle to dark mode | All refs resolve to dark mode values |
| 2.12 | Detachment works | After parse, manually edit a fill color in property panel | `detached: true` set, relink skips it |
| 2.13 | Border linking | Container with border | Border has `colorRef: 'border'` |
| 2.14 | Button accent linking | Button with saturated color fill | Fill has `colorRef: 'accent'` |

### Manual MCP Test (Phase 2)

1. Set up a theme in the Theme Tab (accent color: blue, heading font: Playfair Display)
2. Generate a page via the chat or generate-page
3. **Verify in Properties Panel**: Select a heading → check `fontFamilyRef` shows "font/heading"
4. **Change accent color** in Theme Tab from blue to green
5. **Verify**: All accent-colored fills change to green
6. **Toggle dark mode** in Theme Tab
7. **Verify**: Background, text colors invert appropriately
8. **Edit a fill color manually** in the property panel
9. **Change accent again** → the manually edited fill should NOT change (detached)

---

## 5. Phase 3 — SVG Handling

### Goal
Fix the #1 parser bug: SVG icons not showing. The iframe approach naturally solves this because the browser renders SVGs natively.

### Strategy: Three-Tier SVG Handling

```
SVG in iframe
    ↓ Check complexity
Simple icon (< 5 paths, no masks/clips/gradients)?
    → YES: Convert to VectorNode (pen tool editable)
    → NO: Render as data URI ImageFill (preserves visual fidelity)
```

### Implementation

```typescript
function buildSvgNodeFromComputed(
    el: SVGSVGElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    win: Window,
): ScytleNode {
    const width = rect.width || parseFloat(el.getAttribute('width') || '24')
    const height = rect.height || parseFloat(el.getAttribute('height') || '24')

    // Determine SVG complexity
    const paths = el.querySelectorAll('path, circle, rect, ellipse, line, polygon, polyline')
    const hasComplexFeatures = el.querySelector('mask, clipPath, linearGradient, radialGradient, use, defs, filter, pattern, image')

    // Simple icons → try VectorNode conversion
    if (paths.length > 0 && paths.length <= 8 && !hasComplexFeatures) {
        try {
            // Use existing parseSvgToNetwork for simple cases
            const network = parseSvgToNetwork(el)
            if (network && network.vertices.length > 0) {
                return buildVectorNodeFromNetwork(el, network, width, height, cs)
            }
        } catch {
            // Fall through to image fallback
        }
    }

    // Complex SVGs or failed conversion → data URI image
    return buildSvgAsDataUri(el, width, height, cs)
}

function buildSvgAsDataUri(
    el: SVGSVGElement,
    width: number,
    height: number,
    cs: CSSStyleDeclaration,
): FrameNode {
    // Clone and serialize the SVG
    const clone = el.cloneNode(true) as SVGSVGElement

    // Ensure viewBox is set for proper scaling
    if (!clone.getAttribute('viewBox')) {
        clone.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }

    // Set explicit dimensions
    clone.setAttribute('width', String(width))
    clone.setAttribute('height', String(height))

    const svgString = new XMLSerializer().serializeToString(clone)
    const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`

    return {
        type: 'frame',
        id: generateId(),
        name: inferSvgName(el),
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width,
        height,
        sizing: { horizontal: 'fixed', vertical: 'fixed' },
        positioning: 'auto',
        layout: { mode: 'none' },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        fills: [{
            type: 'image',
            id: generateId(),
            src: dataUri,
            fit: 'contain',
            visible: true,
            opacity: 1,
        }],
        border: undefined,
        borderRadius: 0,
        shadows: [],
        opacity: parseFloat(cs.opacity),
        overflow: 'hidden',
        rotation: 0,
        children: [],
    }
}
```

### Phase 3 Testing Checklist

| # | Test | Input SVG | Pass Criteria |
|---|------|-----------|---------------|
| 3.1 | Simple path icon | `<svg><path d="M6 9l6 6 6-6"/></svg>` (chevron) | VectorNode with correct vertices |
| 3.2 | Circle icon | `<svg><circle cx="12" cy="12" r="10"/></svg>` | VectorNode or clean ImageFill |
| 3.3 | Multi-path icon | Arrow with 2 paths | VectorNode with all paths |
| 3.4 | Complex icon (gradient) | Icon with `<linearGradient>` | ImageFill (data URI), visually correct |
| 3.5 | Icon with mask | SVG using `<mask>` | ImageFill (data URI), visually correct |
| 3.6 | Icon with currentColor | `<svg><path fill="currentColor"/></svg>` inside `<div class="text-blue-500">` | Color resolved to `#3b82f6` |
| 3.7 | Icon dimensions | SVG with viewBox but no width/height | Correct dimensions from viewBox |
| 3.8 | Icon inside button | `<button><svg>...</svg> Click</button>` | SVG node + TextNode as siblings in button frame |
| 3.9 | Hero illustration | Large SVG illustration (50+ paths) | ImageFill (data URI), loads correctly |
| 3.10 | SVG name inference | Icon with `aria-label="Search"` | `name: 'Search'` |

---

## 6. Phase 4 — Consumer Integration: generate-page + chat-tab

### Goal
Wire the new `parseHtmlToNodesViaIframe()` into the two consumers: `generatePage()` and the chat tab.

### 6.1 `generate-page.ts` Changes

```typescript
// Before (sync):
const frame = parseHtmlToNodes(html, options.pageName, {
    variableTable: sgState.variableTable,
    themeMode: sgState.themeMode,
})
relinkNodes(frame.children, sgState.variableTable, sgState.themeMode)

// After (async — generatePage is already async):
const frame = await parseHtmlToNodesViaIframe(html, options.pageName, {
    rootWidth: 1440,
    variableTable: sgState.variableTable,
    themeMode: sgState.themeMode,
    fonts: extractFontFamilies(html),
})
// relinkNodes is now called INSIDE parseHtmlToNodesViaIframe — no separate call needed
```

**Font Extraction Helper:**
```typescript
function extractFontFamilies(html: string): string[] {
    // Extract Google Font families from HTML
    // Look for font-family references in classes and inline styles
    const families = new Set<string>()

    // From Tailwind font-* classes
    const fontClasses = html.match(/font-\[(.*?)\]/g)
    if (fontClasses) {
        for (const fc of fontClasses) {
            const family = fc.slice(6, -1).replace(/_/g, ' ')
            families.add(family)
        }
    }

    // From inline style font-family
    const inlineFont = html.match(/font-family:\s*['"]?([^;'"]+)/gi)
    if (inlineFont) {
        for (const match of inlineFont) {
            const family = match.replace(/font-family:\s*/i, '').split(',')[0].trim().replace(/['"]/g, '')
            families.add(family)
        }
    }

    // From the style guide (always load these)
    const sgState = useStyleGuideStore.getState()
    const table = sgState.variableTable
    const mode = sgState.themeMode
    if (table['font/heading']?.[mode]) families.add(table['font/heading'][mode])
    if (table['font/body']?.[mode]) families.add(table['font/body'][mode])

    return Array.from(families).filter(f => f !== 'Inter' && f !== 'sans-serif' && f !== 'serif' && f !== 'mono')
}
```

### 6.2 `chat-tab.tsx` Changes

#### Refine Mode (selection active)

```typescript
// Before (sync):
const parsed = parseHtmlToNodes(result.html, selectedNode.name)
const newNode = parsed.children.length === 1 ? parsed.children[0] : parsed

// After (async):
const parsed = await parseHtmlToNodesViaIframe(result.html, selectedNode.name, {
    rootWidth: selectedNode.width,
    variableTable: sgState.variableTable,
    themeMode: sgState.themeMode,
    fonts: extractFontFamilies(result.html),
})
const newNode = parsed.children.length === 1 ? parsed.children[0] : parsed
```

**Critical: Preserve node identity** (same as before):
```typescript
newNode.x = selectedNode.x
newNode.y = selectedNode.y
newNode.width = selectedNode.width  // Keep original width for layout stability
newNode.height = selectedNode.height
newNode.id = selectedNode.id
```

#### Chat Mode (JSON actions)

```typescript
// Before (sync):
const parsed = parseHtmlToNodes(actionData.html, 'AI Section')

// After (async):
const parsed = await parseHtmlToNodesViaIframe(actionData.html, 'AI Section', {
    rootWidth: 1440,
    variableTable: sgState.variableTable,
    themeMode: sgState.themeMode,
    fonts: extractFontFamilies(actionData.html),
})
```

### 6.3 Fallback Strategy

Keep the sync parser available for edge cases:

```typescript
// In parser/index.ts
export { parseHtmlToNodes } from './html-to-nodes'          // Sync (legacy)
export { parseHtmlToNodesViaIframe } from './iframe-parser'  // Async (new)
```

If the iframe parser fails (e.g., Tailwind CDN offline, CSP blocks iframe):

```typescript
async function parseWithFallback(
    html: string,
    pageName: string,
    options: ParseOptions,
): Promise<FrameNode> {
    try {
        return await parseHtmlToNodesViaIframe(html, pageName, options)
    } catch (error) {
        console.warn('[Parser] Iframe parser failed, falling back to legacy:', error)
        const frame = parseHtmlToNodes(html, pageName, {
            rootWidth: options.rootWidth,
            variableTable: options.variableTable,
            themeMode: options.themeMode,
        })
        if (options.variableTable && options.themeMode) {
            relinkNodes(frame.children, options.variableTable, options.themeMode)
        }
        return frame
    }
}
```

### Phase 4 Testing Checklist

| # | Test | Action | Pass Criteria |
|---|------|--------|---------------|
| 4.1 | Generate page works | Click "Generate" in workspace | Page appears on canvas with correct layout |
| 4.2 | Generated page has theme refs | Generate page → select heading → check Properties Panel | Shows font/heading ref, text/primary color ref |
| 4.3 | Theme change after generation | Generate → change accent color in Theme Tab | All accent fills update |
| 4.4 | Dark mode after generation | Generate → toggle dark mode | Backgrounds/text colors invert |
| 4.5 | Chat refine works | Select a section → type "make the background dark" in chat | Section background changes, other properties preserved |
| 4.6 | Chat refine preserves position | Select node → refine → check x, y, id | Same position, same ID |
| 4.7 | Chat add node works | In chat: "add a testimonials section" | New section added to canvas |
| 4.8 | Chat replace node works | In chat: "replace the hero with a minimal version" | Hero replaced, correct position |
| 4.9 | Undo works after parse | Generate or refine → Ctrl+Z | Reverts to previous state |
| 4.10 | Streaming progress works | Generate page → observe progress | Progressive HTML shown during streaming |
| 4.11 | Fallback works | Block Tailwind CDN in DevTools → generate | Falls back to legacy parser, still produces output |
| 4.12 | Multiple generates | Generate page A → generate page B → switch between | Both pages render correctly |
| 4.13 | Refine then theme change | Refine a section → change theme → verify section updates | Refined section follows new theme |
| 4.14 | Font loading | Generate with custom font (e.g., Playfair Display) | Font renders correctly on canvas |

### Manual MCP Test (Phase 4)

**Full integration test:**

1. Open Scytle workspace
2. Set up a theme: accent blue, heading font "Playfair Display", body font "Inter"
3. Generate a landing page
4. **Verify**: Headings use Playfair Display, body uses Inter
5. **Verify**: Properties panel shows correct theme refs on selected nodes
6. Select the hero section
7. Type in chat: "make the heading larger and add a gradient background"
8. **Verify**: Chat refine applies changes, node keeps its position
9. Change accent color to green in Theme Tab
10. **Verify**: All accent fills update to green, headings still Playfair
11. Toggle dark mode
12. **Verify**: Appropriate color inversions
13. Manually edit a fill color in property panel
14. Change accent again
15. **Verify**: Manually edited fill stays unchanged (detached)
16. Ctrl+Z multiple times
17. **Verify**: All changes undo correctly

---

## 7. Phase 5 — Edge Cases + Polish

### 7.1 Handle `<input>`, `<textarea>`, `<select>`

Form elements have special rendering in the browser. The iframe renders them as native form controls, but we want placeholder frames:

```typescript
if (tag === 'input' || tag === 'textarea' || tag === 'select') {
    return buildInputNodeFromComputed(el as HTMLInputElement, cs, rect, tag, lm)
}
```

### 7.2 Handle `<hr>` (Divider)

```typescript
if (tag === 'hr') {
    return {
        type: 'frame',
        id: generateId(),
        name: 'Divider',
        width: rect.width,
        height: Math.max(rect.height, 1),
        fills: [{ type: 'solid', color: rgbToHex(cs.borderTopColor || cs.backgroundColor), opacity: 1, visible: true }],
        // ... minimal frame properties
    }
}
```

### 7.3 Handle `<a>` Tags

Links can be inline text or block-level containers (button-like):

```typescript
if (tag === 'a') {
    const display = cs.display
    if (display === 'inline' || display === 'inline-block') {
        // Inline link — treat as text
        if (isTextOnlyElement(el, tag)) {
            return buildTextNodeFromComputed(el, cs, rect, tag, lm)
        }
    }
    // Block/flex link — treat as container (likely a button)
    return buildContainerNodeFromComputed(el, cs, rect, tag, win, lm)
}
```

### 7.4 Handle Background Images (Not Gradients)

```typescript
function extractFills(cs: CSSStyleDeclaration): Fill[] {
    const fills: Fill[] = []

    // ... existing bgColor logic ...

    const bgImage = cs.backgroundImage
    if (bgImage && bgImage !== 'none') {
        if (bgImage.includes('gradient')) {
            const gradientFill = parseGradientFromComputed(bgImage)
            if (gradientFill) fills.push(gradientFill)
        } else if (bgImage.includes('url(')) {
            // Extract URL from url("...")
            const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/)
            if (urlMatch) {
                fills.push({
                    type: 'image',
                    id: generateId(),
                    src: urlMatch[1],
                    fit: mapObjectFit(cs.backgroundSize, cs.backgroundPosition),
                    visible: true,
                    opacity: 1,
                })
            }
        }
    }

    return fills
}
```

### 7.5 Handle `overflow: auto/scroll`

```typescript
overflow: (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden')
    ? 'hidden'
    : 'visible',
```

### 7.6 Handle `text-overflow: ellipsis`

```typescript
if (cs.textOverflow === 'ellipsis' || cs.overflow === 'hidden') {
    textNode.autoResize = 'none'    // Fixed size, no auto-grow
    textNode.textTruncation = 'ending'
    textNode.maxLines = 1
}
```

### 7.7 Handle `aspect-ratio` CSS Property

```typescript
// In buildImageNodeFromComputed
if (cs.aspectRatio && cs.aspectRatio !== 'auto') {
    const parts = cs.aspectRatio.split('/')
    if (parts.length === 2) {
        const ratio = parseFloat(parts[0]) / parseFloat(parts[1])
        if (rect.height === 0 && rect.width > 0) {
            // Height wasn't computed — calculate from ratio
            node.height = node.width / ratio
        }
    }
}
```

### 7.8 Handle `white-space: pre` / `pre-wrap`

```typescript
function extractTextContent(el: HTMLElement): string {
    const cs = getComputedStyle(el)
    const preserveWhitespace = cs.whiteSpace === 'pre' || cs.whiteSpace === 'pre-wrap'

    if (preserveWhitespace) {
        return el.textContent || ''  // Preserve all whitespace including newlines
    }

    // Normal mode: collapse whitespace
    return (el.textContent || '').replace(/\s+/g, ' ').trim()
}
```

### 7.9 Iframe Cleanup on Error

```typescript
// Ensure iframe is always cleaned up, even on error
const renderer = new IframeRenderer()
try {
    renderer.create(...)
    const doc = await renderer.render(...)
    // ... walk DOM ...
    return pageFrame
} catch (error) {
    console.error('[IframeParser] Error:', error)
    throw error
} finally {
    // ALWAYS clean up
    renderer.destroy()
}
```

### 7.10 Performance: Reuse Iframe for Streaming

For `generatePage()` which streams HTML incrementally:

```typescript
// Option: Create iframe once, re-render as HTML accumulates
// But only build nodes from the FINAL HTML
// The iframe is only used for the final parse, not during streaming
```

### Phase 5 Testing Checklist

| # | Test | Input | Pass Criteria |
|---|------|-------|---------------|
| 5.1 | Input element | `<input type="text" placeholder="Email">` | FrameNode with placeholder text, correct padding |
| 5.2 | Select element | `<select><option>A</option></select>` | FrameNode with placeholder |
| 5.3 | HR divider | `<hr class="border-gray-200">` | Thin frame with correct color |
| 5.4 | Link as button | `<a href="#" class="bg-blue-500 px-4 py-2">CTA</a>` | FrameNode (not TextNode) |
| 5.5 | Inline link | `<p>Click <a href="#">here</a></p>` | Single TextNode with full text |
| 5.6 | Background image | `<div style="background-image: url(hero.jpg)">` | ImageFill with src |
| 5.7 | Text ellipsis | `<p class="truncate">Long text...</p>` | `autoResize: 'none'`, `textTruncation: 'ending'` |
| 5.8 | Aspect ratio | `<div class="aspect-video">content</div>` | Correct 16:9 dimensions |
| 5.9 | Pre-formatted text | `<pre>line1\nline2</pre>` | Characters include `\n`, whitespace preserved |
| 5.10 | Error recovery | Malformed HTML `<div><p>unclosed` | No crash, best-effort output |
| 5.11 | Iframe cleanup on error | Force error during parse | No orphaned iframes in DOM |
| 5.12 | Very long page | 3000+ line HTML | Completes within 5 seconds |

---

## 8. Phase 6 — Testing + Validation

### 8.1 Unit Tests (Vitest)

Add new test file: `src/lib/parser/iframe-parser.test.ts`

**Note**: These tests require a DOM environment (jsdom or happy-dom). Vitest supports this via `@vitest/browser` or the `jsdom` environment.

**Important Caveat**: `jsdom` does NOT compute layout (no `getBoundingClientRect()`, no `getComputedStyle()` for layout). These tests must either:
- Run in a real browser via `@vitest/browser` (Playwright)
- Or mock the computed values for unit testing

**Recommended**: Use `@vitest/browser` with Playwright for accurate testing.

```typescript
// iframe-parser.test.ts
import { describe, it, expect } from 'vitest'
import { parseHtmlToNodesViaIframe } from './iframe-parser'

describe('iframe parser — text nodes', () => {
    it('creates TextNode from h1', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<h1 class="text-4xl font-bold text-gray-900">Hello World</h1>',
            'Test',
        )
        const text = frame.children[0]
        expect(text.type).toBe('text')
        if (text.type === 'text') {
            expect(text.characters).toBe('Hello World')
            expect(text.fontSize).toBe(36)
            expect(text.fontWeight).toBe(700)
            expect(text.color).toBe('#111827') // gray-900
        }
    })

    it('preserves text color inheritance', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="text-white"><p>Inherited white</p></div>',
            'Test',
        )
        const container = frame.children[0]
        if (container.type === 'frame') {
            const text = container.children[0]
            if (text.type === 'text') {
                expect(text.color).toBe('#ffffff')
            }
        }
    })
})

describe('iframe parser — layout', () => {
    it('detects flex layout with gap', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex gap-4"><div>A</div><div>B</div></div>',
            'Test',
        )
        const container = frame.children[0]
        if (container.type === 'frame') {
            expect(container.layout.mode).toBe('flex')
            expect(container.layout.direction).toBe('row')
            expect(container.layout.gap).toBe(16)
        }
    })

    it('detects grid with columns', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="grid grid-cols-3"><div>1</div><div>2</div><div>3</div></div>',
            'Test',
        )
        const container = frame.children[0]
        if (container.type === 'frame') {
            expect(container.layout.mode).toBe('grid')
            expect(container.layout.columns).toBe(3)
        }
    })
})

describe('iframe parser — theme linking', () => {
    const variableTable = {
        'accent': { light: '#3b82f6', dark: '#60a5fa' },
        'bg/primary': { light: '#ffffff', dark: '#111827' },
        'text/primary': { light: '#111827', dark: '#f9fafb' },
        'font/heading': { light: 'Inter', dark: 'Inter' },
        'spacing/md': { light: '24', dark: '24' },
        'radius/md': { light: '8', dark: '8' },
    }

    it('links fill color to accent', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="bg-blue-500 p-6 rounded-lg">test</div>',
            'Test',
            { variableTable, themeMode: 'light' },
        )
        const container = frame.children[0]
        if (container.type === 'frame') {
            expect(container.fills[0]?.colorRef).toBeDefined()
            // Either exact match or semantic relink should assign a ref
        }
    })
})
```

### 8.2 A/B Comparison Test

Create a test page that renders both parsers side-by-side:

```
/test/parser-compare
├── Left: Legacy parser output (current parseHtmlToNodes)
├── Right: Iframe parser output (new parseHtmlToNodesViaIframe)
└── Below: Property diff table (width, height, colors, layout per node)
```

This allows visual verification that the iframe parser produces better results.

### 8.3 Regression Test: All Existing Presets

Run every existing parser test preset through both parsers and compare:

| Preset | Legacy | Iframe | Improvement |
|--------|--------|--------|-------------|
| Landing Page | Widths ±50px | Widths exact | Dimension accuracy |
| Grid Layout | Gap sometimes wrong | Gap always correct | Layout fidelity |
| Typography | Heights ±20px | Heights exact | Text measurement |
| Nested Flex | Some children wrong width | All children correct | Flex resolution |
| SVG Icons | 60% render correctly | 95%+ render correctly | SVG fidelity |

### 8.4 End-to-End Test Scenarios

| # | Scenario | Steps | Expected Result |
|---|----------|-------|-----------------|
| E2E-1 | Full page generation + edit | Generate → select text → change font size → verify | Font size changes, layout adjusts |
| E2E-2 | Generate + theme switch | Generate → switch to Concept 2 → verify all refs | All linked properties update |
| E2E-3 | Chat refine + undo | Select section → chat "make it darker" → undo → redo | Undo restores original, redo re-applies |
| E2E-4 | Multiple chat refinements | Refine section A → refine section B → both correct | Both sections updated independently |
| E2E-5 | Generate + export | Generate → export to HTML | Valid HTML with correct styles |
| E2E-6 | Generate + drag/resize | Generate → drag section → resize → undo | Smooth drag, resize, undo works |
| E2E-7 | Dark mode generation | Set dark theme → generate → verify | Dark backgrounds, light text, correct refs |

---

## 9. Rollback Strategy

### Feature Flag

```typescript
// In src/lib/parser/index.ts
export const USE_IFRAME_PARSER = true  // Toggle to false to revert

export async function parseHtmlAuto(
    html: string,
    pageName: string,
    options: ParseOptions,
): Promise<FrameNode> {
    if (USE_IFRAME_PARSER && typeof window !== 'undefined') {
        return parseHtmlToNodesViaIframe(html, pageName, options)
    }
    // Legacy sync path
    const frame = parseHtmlToNodes(html, pageName, {
        rootWidth: options.rootWidth,
        variableTable: options.variableTable,
        themeMode: options.themeMode,
    })
    if (options.variableTable && options.themeMode) {
        relinkNodes(frame.children, options.variableTable, options.themeMode)
    }
    return frame
}
```

### Files to NOT Delete

Keep all existing parser files as-is:
- `html-to-nodes.ts` — legacy sync parser (kept for SSR/tests/fallback)
- `class-parser.ts` — Tailwind class parser (still useful for other features)
- `color-map.ts` — color resolution (still useful)
- `size-utils.ts` — dimension estimation (kept for fallback)
- `svg-path-parser.ts` — SVG to VectorNetwork (used in Phase 3 for simple icons)

### Revert Procedure

1. Set `USE_IFRAME_PARSER = false` in `parser/index.ts`
2. All consumers automatically use legacy parser
3. No code deletion needed

---

## 10. File Inventory

### New Files

| File | Purpose | Lines (est.) |
|------|---------|-------------|
| `src/lib/parser/iframe-renderer.ts` | Iframe lifecycle management | ~120 |
| `src/lib/parser/iframe-parser.ts` | Main async parser function + DOM walker | ~600 |
| `src/lib/parser/computed-utils.ts` | Utility functions for computed style extraction (rgbToHex, extractLayout, extractFills, extractBorder, extractShadows, etc.) | ~350 |
| `src/lib/parser/iframe-parser.test.ts` | Tests for new parser | ~300 |

### Modified Files

| File | Change | Risk |
|------|--------|------|
| `src/lib/parser/index.ts` | Add exports for new functions + `parseHtmlAuto` wrapper | Low — additive |
| `src/lib/generate-page.ts` | Change `parseHtmlToNodes` → `parseHtmlAuto` (1 line) + add `extractFontFamilies` | Low — same output type |
| `src/components/workspace/chat-tab.tsx` | Change `parseHtmlToNodes` → `parseHtmlAuto` (2-3 call sites), add `await` | Low — already async context |

### Unchanged Files (Verification)

| File | Why Unchanged |
|------|---------------|
| `types/canvas.ts` | Same ScytleNode types — iframe parser produces identical structure |
| `store/editor-store.ts` | Same addNode/replaceNode/updateNode API |
| `lib/theme/relink-nodes.ts` | Called as-is from new parser |
| `lib/theme/variable-table.ts` | buildLinkMaps called as-is |
| `lib/theme/theme-resolver.ts` | Resolves refs at render time — doesn't care about parser |
| `lib/theme/theme-context.tsx` | Provides context — unaffected |
| `components/editor/render-utils.ts` | Computes CSS from node props — unaffected |
| `components/editor/canvas.tsx` | Renders node tree — unaffected |
| `components/editor/node-renderer.tsx` | Dispatches by type — unaffected |
| `components/editor/*-renderer.tsx` | Type-specific rendering — unaffected |
| `components/editor/properties-panel/` | Reads/writes node props — unaffected |
| `components/editor/hooks/` | Drag/resize/selection — unaffected |
| `components/workspace/theme-tab.tsx` | Manages StyleGuideStore — unaffected |
| `store/style-guide-store.ts` | Manages concepts/variables — unaffected |

---

## Implementation Order Summary

```
Phase 0: Iframe Render Engine               (iframe-renderer.ts)
    ↓ Tests pass: iframe creates, renders, Tailwind loads, fonts load
Phase 1: DOM Walker → ScytleNode            (iframe-parser.ts + computed-utils.ts)
    ↓ Tests pass: text, container, image, layout all produce correct nodes
Phase 2: Theme Integration                  (link-maps + relink wired into walker)
    ↓ Tests pass: colorRef, fontFamilyRef, paddingRef etc. all assigned
Phase 3: SVG Handling                       (three-tier SVG strategy)
    ↓ Tests pass: simple icons → VectorNode, complex → ImageFill
Phase 4: Consumer Integration               (generate-page.ts + chat-tab.tsx)
    ↓ Tests pass: generate, refine, add, replace, undo, theme change
Phase 5: Edge Cases                         (inputs, hr, links, gradients, errors)
    ↓ Tests pass: all edge cases handled
Phase 6: Full Validation                    (A/B comparison, E2E scenarios)
    ↓ Ship with feature flag ON
```

**Total estimated new code**: ~1,370 lines across 4 new files
**Total modified code**: ~20 lines across 3 existing files
**Risk**: Very low — additive changes, feature-flagged, with automatic fallback

---

## Appendix: Why This Approach Preserves Everything

### Why Editing Still Works
The new parser produces the **exact same ScytleNode types** with the **exact same properties**. A FrameNode is still `{ type: 'frame', id, width, height, fills, children, layout, padding, ... }`. The canvas renderer, property panels, drag/resize hooks, and selection system all operate on these properties — they don't care how the node was created.

### Why Theme Tab Still Works
The two-phase linking strategy (exact-match + semantic relink) assigns the same refs (`colorRef`, `fontFamilyRef`, `paddingRef`, etc.) that the current parser assigns. The `relinkNodes()` function is called identically. The `ThemeResolverContext` resolves refs at render time — same mechanism, same results.

### Why Chat Tab Still Works
The chat tab calls `parseHtmlToNodes()` → replaced with `parseHtmlAuto()` which returns the same `FrameNode`. The node identity preservation logic (`newNode.id = selectedNode.id`, `newNode.x = selectedNode.x`) is unchanged. The JSON action extraction and execution (`addNode`, `replaceNode`, `deleteNode`) is unchanged.

### Why Undo/Redo Still Works
The editor store's `_snap()` function takes a snapshot of `state.nodes` before each mutation. The new parser doesn't change when mutations happen or how snapshots are taken. `replaceNode(oldId, newNode)` triggers `_snap()` the same way whether `newNode` came from the old or new parser.

### Why Dark Mode Still Works
Variable refs are mode-independent (`'accent'`, not `'#3b82f6'`). The `ThemeResolverContext` resolves `table[ref][mode]` at render time. When mode toggles from `'light'` to `'dark'`, all refs automatically resolve to their dark-mode values. The `_relinkTheme()` subscription re-classifies nodes semantically — same mechanism regardless of parser.
