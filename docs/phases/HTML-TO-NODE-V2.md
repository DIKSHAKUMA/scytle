# HTML-to-Node Parser V2: Complete Implementation Plan

> **Goal:** Rebuild the HTML → ScytleNode parser to achieve 1:1 conversion quality matching Figma's layout engine.

---

## Table of Contents
1. [Figma Research & Reference](#figma-research--reference)
2. [Current Architecture Analysis](#current-architecture-analysis)
3. [Problem Statement](#problem-statement)
4. [Phase 1: Core Layout Engine Rewrite](#phase-1-core-layout-engine-rewrite)
5. [Phase 2: Tailwind Parser Enhancements](#phase-2-tailwind-parser-enhancements)
6. [Phase 3: SVG & Icon Handling](#phase-3-svg--icon-handling)
7. [Phase 4: Type System Updates](#phase-4-type-system-updates)
8. [Phase 5: Renderer Updates](#phase-5-renderer-updates)
9. [Phase 6: Testing & Validation](#phase-6-testing--validation)
10. [Migration Strategy](#migration-strategy)
11. [Success Criteria](#success-criteria)

---

## Figma Research & Reference

### Official Documentation URLs

| Resource | URL | Key Learnings |
|----------|-----|---------------|
| **Plugin API Reference** | https://www.figma.com/plugin-docs/api/api-reference/ | Entry point for all node types and properties |
| **Node Types** | https://www.figma.com/plugin-docs/api/nodes/ | Lists all 30+ node types (Frame, Text, Vector, etc.) |
| **FrameNode** | https://www.figma.com/plugin-docs/api/FrameNode/ | Auto-layout, sizing, padding, gaps |
| **TextNode** | https://www.figma.com/plugin-docs/api/TextNode/ | Text auto-resize modes, typography |
| **layoutMode** | https://www.figma.com/plugin-docs/api/properties/nodes-layoutmode/ | `NONE` \| `HORIZONTAL` \| `VERTICAL` \| `GRID` |
| **layoutSizingVertical** | https://www.figma.com/plugin-docs/api/properties/nodes-layoutsizingvertical/ | `FIXED` \| `HUG` \| `FILL` |
| **REST API** | https://www.figma.com/developers/api | File inspection, JSON representation |
| **OpenAPI Spec** | https://github.com/figma/rest-api-spec | TypeScript types for Figma data |

### Figma's Node Hierarchy

```
DocumentNode
└── PageNode
    └── SceneNode (any of 30+ types)
        ├── FrameNode (container with layout)
        ├── GroupNode (folder for layers)
        ├── TextNode (text content)
        ├── RectangleNode (shapes)
        ├── VectorNode (paths/icons)
        ├── ImageNode (raster images)
        └── ... (ComponentNode, InstanceNode, etc.)
```

### Key Figma Properties We Need to Match

#### FrameNode (Container)
```typescript
interface FigmaFrameNode {
  // Layout Mode - CRITICAL: defaults to NONE, not flex!
  layoutMode: 'NONE' | 'HORIZONTAL' | 'VERTICAL' | 'GRID'
  
  // Sizing - how the frame itself sizes
  primaryAxisSizingMode: 'FIXED' | 'AUTO'   // AUTO = hug contents
  counterAxisSizingMode: 'FIXED' | 'AUTO'
  
  // Child sizing - how children size within auto-layout
  // (set on children, not parent)
  layoutSizingHorizontal: 'FIXED' | 'HUG' | 'FILL'
  layoutSizingVertical: 'FIXED' | 'HUG' | 'FILL'
  
  // Spacing
  itemSpacing: number              // gap between children
  counterAxisSpacing: number | null // gap for wrapped items
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  
  // Alignment (only when layoutMode !== 'NONE')
  primaryAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN'
  counterAxisAlignItems: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE'
  
  // Wrapping
  layoutWrap: 'NO_WRAP' | 'WRAP'
  
  // Dimensions (explicit when FIXED)
  width: number
  height: number
  minWidth: number | null
  maxWidth: number | null
  minHeight: number | null
  maxHeight: number | null
  
  // Visual
  fills: Paint[]
  strokes: Paint[]
  cornerRadius: number
  effects: Effect[]
  clipsContent: boolean
}
```

#### TextNode
```typescript
interface FigmaTextNode {
  characters: string
  
  // Text sizing - CRITICAL for layout
  textAutoResize: 'NONE' | 'WIDTH_AND_HEIGHT' | 'HEIGHT' | 'TRUNCATE'
  // NONE = fixed size box
  // WIDTH_AND_HEIGHT = shrinks to fit text (auto width)
  // HEIGHT = fixed width, expands vertically (default for paragraphs)
  // TRUNCATE = fixed size with ellipsis
  
  // Truncation
  textTruncation: 'DISABLED' | 'ENDING'
  maxLines: number | null
  
  // Alignment
  textAlignHorizontal: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED'
  textAlignVertical: 'TOP' | 'CENTER' | 'BOTTOM'
  
  // Typography
  fontSize: number
  fontName: { family: string; style: string }
  fontWeight: number
  letterSpacing: { value: number; unit: 'PIXELS' | 'PERCENT' }
  lineHeight: { value: number; unit: 'PIXELS' | 'PERCENT' | 'AUTO' }
  
  // Visual
  fills: Paint[]  // text color
}
```

#### VectorNode (Icons/Paths)
```typescript
interface FigmaVectorNode {
  // Vector data
  vectorNetwork: VectorNetwork
  vectorPaths: VectorPath[]
  
  // Visual
  fills: Paint[]
  strokes: Paint[]
  strokeWeight: number
  strokeCap: 'NONE' | 'ROUND' | 'SQUARE'
  strokeJoin: 'MITER' | 'BEVEL' | 'ROUND'
  
  // Constraints
  constraints: { horizontal: string; vertical: string }
}
```

### Figma's Default Behaviors (CRITICAL)

| Property | Figma Default | Implication |
|----------|---------------|-------------|
| `layoutMode` | `'NONE'` | Frames do NOT auto-layout by default |
| `layoutSizingHorizontal` | `'HUG'` | Children shrink-wrap content |
| `layoutSizingVertical` | `'HUG'` | Children shrink-wrap content |
| `itemSpacing` | `0` | No gap unless explicit |
| `textAutoResize` | `'HEIGHT'` | Text fills width, hugs height |
| `clipsContent` | `true` | Overflow hidden |

---

## Current Architecture Analysis

### File Structure
```
src/lib/parser/
├── html-to-nodes.ts    # Main parser (DOM → ScytleNode)
├── class-parser.ts     # Tailwind → ParsedStyles
├── color-map.ts        # Tailwind color name → hex
└── size-utils.ts       # Height estimation utilities

src/types/
└── canvas.ts           # ScytleNode type definitions

src/components/editor/
├── frame-renderer.tsx  # Renders FrameNode
├── text-renderer.tsx   # Renders TextNode
├── image-renderer.tsx  # Renders ImageNode
└── vector-renderer.tsx # Renders VectorNode

src/lib/export/
├── nodes-to-html.ts    # Reverse: ScytleNode → HTML
└── class-builder.ts    # ScytleNode props → Tailwind classes
```

### Current Flow
```
AI HTML Output
    ↓
parseHtmlToNodes(html, pageName)     // html-to-nodes.ts
    ↓
DOM Parser (jsdom/DOMParser)
    ↓
walkElement(el, parentWidth)          // Recursive traversal
    ↓
parseClasses(classList)               // class-parser.ts
    ↓
buildContainerNode() / buildTextNode() / buildImageNode()
    ↓
ScytleNode Tree
    ↓
Renderer Components (React)
    ↓
Canvas Display
```

### Current Type Definitions (src/types/canvas.ts)

```typescript
// Current FrameNode
interface FrameNode {
  type: 'frame'
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  
  // Layout
  layoutMode: 'flex' | 'grid'  // ❌ Missing 'none'!
  layoutDirection: 'row' | 'column'
  layoutWrap: 'nowrap' | 'wrap'
  layoutGap: number
  layoutAlign: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  layoutJustify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  
  // Sizing
  sizing: {
    horizontal: 'fixed' | 'hug' | 'fill'
    vertical: 'fixed' | 'hug' | 'fill'
  }
  
  // Spacing
  padding: { top: number; right: number; bottom: number; left: number }
  
  // Visual
  fills: Fill[]
  strokes: Stroke[]
  cornerRadius: number | { tl: number; tr: number; br: number; bl: number }
  effects: Effect[]
  opacity: number
  clipsContent: boolean
  
  // Children
  children: ScytleNode[]
}

// Current TextNode
interface TextNode {
  type: 'text'
  id: string
  name: string
  characters: string
  
  // Sizing
  sizing: { horizontal: 'fixed' | 'hug' | 'fill'; vertical: 'fixed' | 'hug' | 'fill' }
  autoResize: 'none' | 'height' | 'width-and-height'
  
  // Typography
  fontSize: number
  fontFamily: string
  fontWeight: number
  lineHeight: number | 'auto'
  letterSpacing: number
  textAlign: 'left' | 'center' | 'right' | 'justify'
  textAlignVertical: 'top' | 'center' | 'bottom'
  
  // Visual
  fills: Fill[]
  
  // Semantic
  htmlTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'a' | 'button' | 'label'
}
```

---

## Problem Statement

### Issue 1: Layout Mode Detection is Broken

**Location:** `html-to-nodes.ts` lines 479-480

```typescript
// CURRENT (BROKEN):
const isExplicitFlex = styles.display === 'flex' || styles.display === 'inline-flex'
const direction = isExplicitFlex ? styles.flexDirection : 'column'  // ❌ ALWAYS flex!
```

**Problem:** 
- Parser forces ALL block elements into `flex column`
- Elements with `items-center justify-between` but no `flex` class become vertical
- No support for `layoutMode: 'none'` (absolute positioning)

**Expected Behavior:**
- Only apply flex when `display: flex` or utility classes present
- Default to `layoutMode: 'none'` (Figma's default)
- Infer flex from `items-*`, `justify-*`, `gap-*` classes

### Issue 2: Sizing Defaults are Wrong

**Location:** `html-to-nodes.ts` lines 500-510

```typescript
// CURRENT (BROKEN):
sizing: {
  horizontal: styles.flexGrow || styles.widthRatio === 1
    ? 'fill'
    : (styles.width ? 'fixed' : 'fill'),  // ❌ Defaults to FILL!
  vertical: styles.height ? 'fixed' : 'hug',
}
```

**Problem:**
- Elements without explicit width default to `fill` (stretch)
- Should default to `hug` (shrink-wrap)
- Causes unexpected stretching of buttons, icons, text

**Expected Behavior:**
- `w-full`, `flex-1`, `grow` → `'fill'`
- `w-64`, `w-[200px]` → `'fixed'`
- No width class → `'hug'`

### Issue 3: Forced Gap Injection

**Location:** `html-to-nodes.ts` lines 484-490

```typescript
// CURRENT (BROKEN):
const effectiveGap = styles.gap > 0
  ? styles.gap
  : direction === 'column' && children.length > 1
    ? (isSectionLevel ? 32 : 16)  // ❌ FORCED 32px/16px!
    : ...
```

**Problem:**
- Adds 32px gap to sections, 16px to containers
- Even when AI specified no gap or tight layout
- Breaks navigation bars, button groups, icon rows

**Expected Behavior:**
- Only use gap when `gap-*` class is explicit
- Default to `0` (Figma's default)

### Issue 4: SVG Icons Lose Color Context

**Location:** `html-to-nodes.ts` lines 209-241

```typescript
// CURRENT:
function buildSvgNode(el: Element): ScytleNode {
  // Attempts to resolve currentColor but often fails
  const resolvedColor = resolveCurrentColor(el) || '#6b7280'  // ❌ Gray fallback
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`
  return createImage({ src: dataUri, ... })
}
```

**Problem:**
- `currentColor` resolves to gray fallback
- SVG becomes rasterized image, loses scalability
- Color inheritance broken after serialization

**Expected Behavior:**
- Walk DOM tree to find nearest `text-*` color class
- Resolve Tailwind color → hex BEFORE serialization
- Eventually convert to VectorNode for true vector rendering

### Issue 5: Text Sizing Always Fills

**Location:** `html-to-nodes.ts` line 328

```typescript
// CURRENT (BROKEN):
sizing: { horizontal: 'fill', vertical: 'hug' },
autoResize: 'height',  // ❌ Always height mode!
```

**Problem:**
- Headlines stretch to full width when they should wrap content
- Buttons with text fill container instead of hugging
- No context-awareness for text sizing

**Expected Behavior:**
- Headings (`h1-h6`) → `autoResize: 'width-and-height'` (hug both)
- Paragraphs → `autoResize: 'height'` (fill width, hug height)
- Inline text (spans, buttons) → `autoResize: 'width-and-height'`
- Check parent: if flex-row, text should hug width

---

## Phase 1: Core Layout Engine Rewrite

### 1.1 Layout Mode Detection

**File:** `src/lib/parser/html-to-nodes.ts`

**Current Code (lines ~479-510):**
```typescript
function buildContainerNode(/* ... */) {
  const isExplicitFlex = styles.display === 'flex' || styles.display === 'inline-flex'
  const direction = isExplicitFlex ? styles.flexDirection : 'column'
  // ...
}
```

**New Implementation:**
```typescript
function determineLayoutMode(styles: ParsedStyles, classList: string[]): {
  layoutMode: 'none' | 'flex' | 'grid'
  layoutDirection: 'row' | 'column'
} {
  // Explicit display classes
  if (styles.display === 'grid' || styles.display === 'inline-grid') {
    return { layoutMode: 'grid', layoutDirection: 'row' }
  }
  
  if (styles.display === 'flex' || styles.display === 'inline-flex') {
    return { 
      layoutMode: 'flex', 
      layoutDirection: styles.flexDirection || 'row' 
    }
  }
  
  // Infer flex from utility classes (items-*, justify-*, gap-*)
  const flexIndicators = [
    'items-start', 'items-center', 'items-end', 'items-baseline', 'items-stretch',
    'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly',
    'gap-', 'space-x-', 'space-y-',
    'flex-row', 'flex-col', 'flex-wrap', 'flex-nowrap'
  ]
  
  const hasFlexIndicator = classList.some(cls => 
    flexIndicators.some(indicator => cls.startsWith(indicator) || cls === indicator)
  )
  
  if (hasFlexIndicator) {
    // Infer direction from classes
    const isRow = classList.some(cls => cls === 'flex-row' || cls === 'flex-row-reverse')
    const isCol = classList.some(cls => cls === 'flex-col' || cls === 'flex-col-reverse')
    const direction = isCol ? 'column' : (isRow ? 'row' : 'row')  // Default row for inferred flex
    
    return { layoutMode: 'flex', layoutDirection: direction }
  }
  
  // Default: no auto-layout (absolute positioning)
  return { layoutMode: 'none', layoutDirection: 'row' }
}
```

**Integration:**
```typescript
function buildContainerNode(
  el: Element,
  styles: ParsedStyles,
  children: ScytleNode[],
  parentWidth: number,
  depth: number
): FrameNode {
  const classList = Array.from(el.classList)
  const { layoutMode, layoutDirection } = determineLayoutMode(styles, classList)
  
  // Only apply auto-layout properties when layoutMode !== 'none'
  const isAutoLayout = layoutMode !== 'none'
  
  return {
    type: 'frame',
    id: generateId(),
    name: inferFrameName(el, depth),
    layoutMode,
    layoutDirection,
    layoutWrap: styles.flexWrap || 'nowrap',
    layoutGap: isAutoLayout ? (styles.gap || 0) : 0,  // No forced defaults!
    layoutAlign: mapAlignItems(styles.alignItems),
    layoutJustify: mapJustifyContent(styles.justifyContent),
    // ... rest of properties
  }
}
```

### 1.2 Sizing Logic Overhaul

**New Implementation:**
```typescript
function determineSizing(
  styles: ParsedStyles, 
  classList: string[],
  parentLayoutMode: 'none' | 'flex' | 'grid',
  parentDirection: 'row' | 'column'
): { horizontal: 'fixed' | 'hug' | 'fill'; vertical: 'fixed' | 'hug' | 'fill' } {
  
  // === HORIZONTAL SIZING ===
  let horizontal: 'fixed' | 'hug' | 'fill' = 'hug'  // Default: hug
  
  // Check for fill indicators
  const fillHorizontal = classList.some(cls => 
    cls === 'w-full' || 
    cls === 'flex-1' || 
    cls === 'grow' || 
    cls === 'flex-grow' ||
    cls.startsWith('basis-full')
  )
  
  if (fillHorizontal) {
    horizontal = 'fill'
  } else if (styles.width && styles.width > 0) {
    horizontal = 'fixed'
  } else if (styles.widthRatio === 1) {
    horizontal = 'fill'
  }
  // else: stays 'hug'
  
  // === VERTICAL SIZING ===
  let vertical: 'fixed' | 'hug' | 'fill' = 'hug'  // Default: hug
  
  const fillVertical = classList.some(cls => 
    cls === 'h-full' || 
    cls === 'h-screen' ||
    cls === 'min-h-full' ||
    cls === 'min-h-screen'
  )
  
  if (fillVertical) {
    vertical = 'fill'
  } else if (styles.height && styles.height > 0) {
    vertical = 'fixed'
  }
  // else: stays 'hug'
  
  // === CONTEXT ADJUSTMENTS ===
  // In flex-row parent without explicit width, child fills if it's the main content
  // In flex-col parent, children typically fill width
  if (parentLayoutMode === 'flex' && parentDirection === 'column') {
    if (horizontal === 'hug' && !styles.width) {
      // In vertical flex, blocks typically fill width unless explicitly sized
      // BUT only for block-level elements, not inline
      // Keep hug for now, let explicit classes override
    }
  }
  
  return { horizontal, vertical }
}
```

**Usage in buildContainerNode:**
```typescript
const parentInfo = { layoutMode: parentLayoutMode, direction: parentDirection }
const sizing = determineSizing(styles, classList, parentInfo.layoutMode, parentInfo.direction)

return {
  // ...
  sizing,
  width: sizing.horizontal === 'fixed' ? (styles.width || estimatedWidth) : undefined,
  height: sizing.vertical === 'fixed' ? (styles.height || undefined) : undefined,
}
```

### 1.3 Gap/Spacing Fix

**Current Code (remove):**
```typescript
// DELETE THIS LOGIC:
const effectiveGap = styles.gap > 0
  ? styles.gap
  : direction === 'column' && children.length > 1
    ? (isSectionLevel ? 32 : 16)  // ❌ Remove forced defaults
    : ...
```

**New Implementation:**
```typescript
function determineGap(styles: ParsedStyles, classList: string[]): number {
  // Only use gap when explicitly specified
  if (styles.gap && styles.gap > 0) {
    return styles.gap
  }
  
  // Check for space-x-* or space-y-* (these create gaps via margins)
  // Note: These should be converted to gap in the renderer
  const spaceClass = classList.find(cls => cls.startsWith('space-x-') || cls.startsWith('space-y-'))
  if (spaceClass) {
    const value = parseSpacingClass(spaceClass)
    return value || 0
  }
  
  // Default: NO gap (Figma behavior)
  return 0
}

function parseSpacingClass(cls: string): number {
  const match = cls.match(/space-[xy]-(\d+)/)
  if (match) {
    const scale = parseInt(match[1], 10)
    return scale * 4  // Tailwind spacing scale (1 = 4px)
  }
  // Handle space-x-px, space-x-0.5, etc.
  if (cls.endsWith('-px')) return 1
  if (cls.includes('-0.5')) return 2
  if (cls.includes('-1.5')) return 6
  if (cls.includes('-2.5')) return 10
  if (cls.includes('-3.5')) return 14
  return 0
}
```

### 1.4 Text Node Improvements

**Current Code:**
```typescript
function buildTextNode(/* ... */) {
  return {
    sizing: { horizontal: 'fill', vertical: 'hug' },  // ❌ Always fill
    autoResize: 'height',  // ❌ Always height
  }
}
```

**New Implementation:**
```typescript
function determineTextSizing(
  el: Element,
  styles: ParsedStyles,
  parentLayoutMode: 'none' | 'flex' | 'grid',
  parentDirection: 'row' | 'column'
): {
  sizing: { horizontal: 'fixed' | 'hug' | 'fill'; vertical: 'fixed' | 'hug' | 'fill' }
  autoResize: 'none' | 'height' | 'width-and-height'
} {
  const tagName = el.tagName.toLowerCase()
  const classList = Array.from(el.classList)
  
  // Headings: hug content by default
  const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)
  
  // Inline elements: hug content
  const isInline = ['span', 'a', 'button', 'label', 'strong', 'em', 'code'].includes(tagName)
  
  // Check for explicit width classes
  const hasExplicitWidth = classList.some(cls => 
    cls.startsWith('w-') && cls !== 'w-full' && cls !== 'w-auto'
  )
  const hasFillWidth = classList.some(cls => cls === 'w-full')
  
  // Check for truncation
  const hasTruncate = classList.includes('truncate') || 
                       classList.some(cls => cls.startsWith('line-clamp-'))
  
  // Determine sizing based on context
  if (isHeading || isInline) {
    // Headings and inline elements hug content
    if (hasFillWidth) {
      return {
        sizing: { horizontal: 'fill', vertical: 'hug' },
        autoResize: 'height'
      }
    }
    return {
      sizing: { horizontal: 'hug', vertical: 'hug' },
      autoResize: 'width-and-height'
    }
  }
  
  // Paragraphs and block text
  if (tagName === 'p' || tagName === 'div') {
    if (hasExplicitWidth) {
      return {
        sizing: { horizontal: 'fixed', vertical: 'hug' },
        autoResize: 'height'
      }
    }
    // Block text fills width by default (like Figma's HEIGHT mode)
    return {
      sizing: { horizontal: 'fill', vertical: 'hug' },
      autoResize: 'height'
    }
  }
  
  // In flex-row parent, text should hug width
  if (parentLayoutMode === 'flex' && parentDirection === 'row') {
    return {
      sizing: { horizontal: 'hug', vertical: 'hug' },
      autoResize: 'width-and-height'
    }
  }
  
  // Default: fill width, hug height (paragraph behavior)
  return {
    sizing: { horizontal: 'fill', vertical: 'hug' },
    autoResize: 'height'
  }
}
```

### 1.5 Updated buildContainerNode Function

**Complete Rewrite:**
```typescript
function buildContainerNode(
  el: Element,
  styles: ParsedStyles,
  children: ScytleNode[],
  parentWidth: number,
  depth: number,
  parentLayoutMode: 'none' | 'flex' | 'grid' = 'none',
  parentDirection: 'row' | 'column' = 'column'
): FrameNode {
  const classList = Array.from(el.classList)
  
  // 1. Determine layout mode (no more forced flex!)
  const { layoutMode, layoutDirection } = determineLayoutMode(styles, classList)
  
  // 2. Determine sizing (defaults to hug, not fill!)
  const sizing = determineSizing(styles, classList, parentLayoutMode, parentDirection)
  
  // 3. Determine gap (no forced defaults!)
  const gap = layoutMode !== 'none' ? determineGap(styles, classList) : 0
  
  // 4. Calculate dimensions
  const width = sizing.horizontal === 'fixed' 
    ? (styles.width || parentWidth) 
    : (sizing.horizontal === 'fill' ? parentWidth : undefined)
  
  const height = sizing.vertical === 'fixed'
    ? styles.height
    : undefined
  
  // 5. Build the node
  return {
    type: 'frame',
    id: generateId(),
    name: inferFrameName(el, depth),
    x: 0,
    y: 0,
    width: width || 0,
    height: height || 0,
    
    // Layout
    layoutMode,
    layoutDirection,
    layoutWrap: styles.flexWrap || 'nowrap',
    layoutGap: gap,
    layoutAlign: layoutMode !== 'none' ? mapAlignItems(styles.alignItems) : 'start',
    layoutJustify: layoutMode !== 'none' ? mapJustifyContent(styles.justifyContent) : 'start',
    
    // Sizing
    sizing,
    
    // Spacing
    padding: {
      top: styles.paddingTop || 0,
      right: styles.paddingRight || 0,
      bottom: styles.paddingBottom || 0,
      left: styles.paddingLeft || 0,
    },
    
    // Visual
    fills: buildFills(styles),
    strokes: buildStrokes(styles),
    cornerRadius: styles.borderRadius || 0,
    effects: buildEffects(styles),
    opacity: styles.opacity ?? 1,
    clipsContent: styles.overflow === 'hidden',
    
    // Children
    children,
  }
}
```

---

## Phase 2: Tailwind Parser Enhancements

### 2.1 Flex/Grid Classes

**File:** `src/lib/parser/class-parser.ts`

**Add to ParsedStyles interface:**
```typescript
interface ParsedStyles {
  // ... existing properties
  
  // Flex child properties
  flexShrink?: number      // shrink-0, shrink
  flexBasis?: number       // basis-*
  order?: number           // order-*
  alignSelf?: string       // self-*
  
  // Grid properties
  gridColumns?: number     // grid-cols-*
  gridRows?: number        // grid-rows-*
  gridColumnSpan?: number  // col-span-*
  gridRowSpan?: number     // row-span-*
  columnGap?: number       // gap-x-*
  rowGap?: number          // gap-y-*
}
```

**Add parsing logic:**
```typescript
// In parseClasses() function:

// Flex shrink
if (raw === 'shrink-0') {
  s.flexShrink = 0
} else if (raw === 'shrink' || raw === 'flex-shrink') {
  s.flexShrink = 1
}

// Flex basis
if (raw.startsWith('basis-')) {
  const value = raw.replace('basis-', '')
  if (value === 'full') {
    s.flexBasis = 100  // percent
    s.widthRatio = 1
  } else if (value === 'auto') {
    s.flexBasis = undefined  // auto
  } else {
    const px = parseTailwindSpacing(value)
    if (px !== null) s.flexBasis = px
  }
}

// Order
if (raw.startsWith('order-')) {
  const value = raw.replace('order-', '')
  if (value === 'first') s.order = -9999
  else if (value === 'last') s.order = 9999
  else if (value === 'none') s.order = 0
  else s.order = parseInt(value, 10) || 0
}

// Self alignment
if (raw.startsWith('self-')) {
  const value = raw.replace('self-', '')
  s.alignSelf = value  // auto, start, end, center, stretch, baseline
}

// Grid columns
if (raw.startsWith('grid-cols-')) {
  const value = raw.replace('grid-cols-', '')
  if (value === 'none') s.gridColumns = 0
  else s.gridColumns = parseInt(value, 10) || 1
}

// Grid rows
if (raw.startsWith('grid-rows-')) {
  const value = raw.replace('grid-rows-', '')
  if (value === 'none') s.gridRows = 0
  else s.gridRows = parseInt(value, 10) || 1
}

// Column span
if (raw.startsWith('col-span-')) {
  const value = raw.replace('col-span-', '')
  if (value === 'full') s.gridColumnSpan = -1  // full width
  else s.gridColumnSpan = parseInt(value, 10) || 1
}

// Row span
if (raw.startsWith('row-span-')) {
  const value = raw.replace('row-span-', '')
  if (value === 'full') s.gridRowSpan = -1
  else s.gridRowSpan = parseInt(value, 10) || 1
}

// Gap X/Y
if (raw.startsWith('gap-x-')) {
  const value = raw.replace('gap-x-', '')
  s.columnGap = parseTailwindSpacing(value) || 0
}
if (raw.startsWith('gap-y-')) {
  const value = raw.replace('gap-y-', '')
  s.rowGap = parseTailwindSpacing(value) || 0
}
```

### 2.2 Width/Height Parsing Improvements

**Add max-width, min-width support:**
```typescript
// Max width
if (raw.startsWith('max-w-')) {
  const value = raw.replace('max-w-', '')
  if (value === 'none') s.maxWidth = undefined
  else if (value === 'full') s.maxWidth = 100  // percent
  else if (value === 'screen') s.maxWidth = 1920  // viewport width approximation
  else if (value === 'prose') s.maxWidth = 65 * 16  // 65ch ≈ 1040px
  else {
    const presets: Record<string, number> = {
      'xs': 320, 'sm': 384, 'md': 448, 'lg': 512, 'xl': 576,
      '2xl': 672, '3xl': 768, '4xl': 896, '5xl': 1024, '6xl': 1152, '7xl': 1280
    }
    s.maxWidth = presets[value] || parseTailwindSpacing(value) || undefined
  }
}

// Min width
if (raw.startsWith('min-w-')) {
  const value = raw.replace('min-w-', '')
  if (value === 'full') s.minWidth = 100  // percent
  else if (value === 'min') s.minWidth = 0  // min-content
  else if (value === 'max') s.minWidth = undefined  // max-content
  else s.minWidth = parseTailwindSpacing(value) || undefined
}

// Same for min-h-*, max-h-*
```

### 2.3 Aspect Ratio Support

```typescript
if (raw.startsWith('aspect-')) {
  const value = raw.replace('aspect-', '')
  if (value === 'square') s.aspectRatio = 1
  else if (value === 'video') s.aspectRatio = 16 / 9
  else if (value === 'auto') s.aspectRatio = undefined
  else {
    // aspect-[16/9] or aspect-[1.5]
    const match = value.match(/\[([^\]]+)\]/)
    if (match) {
      const ratio = match[1]
      if (ratio.includes('/')) {
        const [w, h] = ratio.split('/').map(Number)
        s.aspectRatio = w / h
      } else {
        s.aspectRatio = parseFloat(ratio)
      }
    }
  }
}
```

---

## Phase 3: SVG & Icon Handling

### 3.1 Improved currentColor Resolution

**Current Problem:**
```typescript
// Current: walks DOM but color context is often lost
function resolveCurrentColor(el: Element): string | null {
  let current = el.parentElement
  while (current) {
    const colorClass = Array.from(current.classList).find(c => c.startsWith('text-'))
    if (colorClass) {
      return tailwindColorToHex(colorClass)  // Often returns null
    }
    current = current.parentElement
  }
  return null  // Falls back to gray
}
```

**New Implementation:**
```typescript
function resolveCurrentColor(el: Element): string {
  // 1. Check element's own text color
  const ownColorClass = Array.from(el.classList).find(c => c.startsWith('text-'))
  if (ownColorClass) {
    const color = tailwindColorToHex(ownColorClass)
    if (color) return color
  }
  
  // 2. Walk up the DOM tree
  let current = el.parentElement
  while (current) {
    const classList = Array.from(current.classList)
    
    // Check for text color
    const textColorClass = classList.find(c => c.startsWith('text-') && !c.startsWith('text-center') && !c.startsWith('text-left') && !c.startsWith('text-right'))
    if (textColorClass) {
      const color = tailwindColorToHex(textColorClass)
      if (color) return color
    }
    
    current = current.parentElement
  }
  
  // 3. Check for dark mode / theme context
  // If in dark section, default to white; light section, default to black
  const rootBg = el.closest('[class*="bg-"]')
  if (rootBg) {
    const bgClasses = Array.from(rootBg.classList).filter(c => c.startsWith('bg-'))
    const isDark = bgClasses.some(c => 
      c.includes('gray-900') || c.includes('gray-800') || c.includes('slate-900') ||
      c.includes('black') || c.includes('zinc-900') || c.includes('neutral-900')
    )
    if (isDark) return '#ffffff'
  }
  
  // 4. Default: inherit from typical body color
  return '#1f2937'  // gray-800, common body text color
}
```

**Improved tailwindColorToHex:**
```typescript
function tailwindColorToHex(className: string): string | null {
  // Remove 'text-' prefix
  const colorName = className.replace(/^text-/, '')
  
  // Handle special cases
  if (colorName === 'white') return '#ffffff'
  if (colorName === 'black') return '#000000'
  if (colorName === 'transparent') return 'transparent'
  if (colorName === 'current') return null  // needs further resolution
  if (colorName === 'inherit') return null
  
  // Handle opacity modifiers: text-gray-500/50
  const [baseColor, opacity] = colorName.split('/')
  
  // Look up in color map
  const hex = TAILWIND_COLOR_MAP[baseColor]
  if (!hex) return null
  
  // Apply opacity if present
  if (opacity) {
    const alpha = Math.round((parseInt(opacity, 10) / 100) * 255)
    return hex + alpha.toString(16).padStart(2, '0')
  }
  
  return hex
}
```

### 3.2 SVG Processing Improvements

**Before Serialization:**
```typescript
function buildSvgNode(el: Element): ScytleNode {
  const svgEl = el as SVGSVGElement
  
  // 1. Resolve currentColor BEFORE serialization
  const resolvedColor = resolveCurrentColor(el)
  
  // 2. Clone SVG and replace currentColor
  const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement
  
  // Replace in attributes
  const replaceCurrentColor = (element: Element) => {
    const attrs = ['fill', 'stroke', 'color', 'stop-color']
    attrs.forEach(attr => {
      const value = element.getAttribute(attr)
      if (value === 'currentColor') {
        element.setAttribute(attr, resolvedColor)
      }
    })
    
    // Replace in style attribute
    const style = element.getAttribute('style')
    if (style && style.includes('currentColor')) {
      element.setAttribute('style', style.replace(/currentColor/g, resolvedColor))
    }
    
    // Process children
    Array.from(element.children).forEach(child => replaceCurrentColor(child))
  }
  
  replaceCurrentColor(clonedSvg)
  
  // 3. Get dimensions
  const width = parseFloat(svgEl.getAttribute('width') || '24')
  const height = parseFloat(svgEl.getAttribute('height') || '24')
  
  // 4. Serialize with resolved colors
  const svgMarkup = new XMLSerializer().serializeToString(clonedSvg)
  const dataUri = `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`
  
  return createImage({
    name: 'Icon',
    src: dataUri,
    width,
    height,
    sizing: { horizontal: 'fixed', vertical: 'fixed' },
    fit: 'contain',
    isPlaceholder: false,
  })
}
```

### 3.3 VectorNode Conversion (Future Enhancement)

**For Simple Icons:**
```typescript
function buildVectorNode(svgEl: SVGSVGElement): VectorNode | ImageNode {
  // Check if SVG is simple enough for vector conversion
  const paths = svgEl.querySelectorAll('path')
  const circles = svgEl.querySelectorAll('circle')
  const rects = svgEl.querySelectorAll('rect')
  const lines = svgEl.querySelectorAll('line')
  
  const hasGradients = svgEl.querySelector('linearGradient, radialGradient')
  const hasFilters = svgEl.querySelector('filter')
  const hasMasks = svgEl.querySelector('mask, clipPath')
  const hasText = svgEl.querySelector('text')
  
  // Complex SVG → keep as image
  if (hasGradients || hasFilters || hasMasks || hasText) {
    return buildSvgNode(svgEl)
  }
  
  // Simple SVG → convert to vector
  const vectorPaths: VectorPath[] = []
  
  paths.forEach(path => {
    const d = path.getAttribute('d')
    if (d) {
      vectorPaths.push({
        data: d,
        windingRule: path.getAttribute('fill-rule') === 'evenodd' ? 'EVENODD' : 'NONZERO'
      })
    }
  })
  
  // Get colors
  const strokeColor = resolveCurrentColor(svgEl)
  const strokeWidth = parseFloat(svgEl.getAttribute('stroke-width') || '2')
  const fillAttr = svgEl.getAttribute('fill')
  const hasFill = fillAttr && fillAttr !== 'none'
  
  return {
    type: 'vector',
    id: generateId(),
    name: 'Icon',
    x: 0,
    y: 0,
    width: parseFloat(svgEl.getAttribute('width') || '24'),
    height: parseFloat(svgEl.getAttribute('height') || '24'),
    vectorPaths,
    fills: hasFill ? [{ type: 'solid', color: strokeColor }] : [],
    strokes: [{ type: 'solid', color: strokeColor }],
    strokeWeight: strokeWidth,
    strokeCap: 'round',
    strokeJoin: 'round',
  }
}
```

---

## Phase 4: Type System Updates

### 4.1 Update FrameNode Type

**File:** `src/types/canvas.ts`

```typescript
export interface FrameNode {
  type: 'frame'
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  
  // === LAYOUT (Updated) ===
  layoutMode: 'none' | 'flex' | 'grid'  // Added 'none'!
  layoutDirection: 'row' | 'column'
  layoutWrap: 'nowrap' | 'wrap'
  layoutGap: number
  layoutAlign: 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  layoutJustify: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'
  
  // === GRID LAYOUT (New) ===
  gridColumns?: number
  gridRows?: number
  gridColumnGap?: number
  gridRowGap?: number
  
  // === SIZING (Updated) ===
  sizing: {
    horizontal: 'fixed' | 'hug' | 'fill'
    vertical: 'fixed' | 'hug' | 'fill'
  }
  
  // === CONSTRAINTS (New - for layoutMode: 'none') ===
  constraints?: {
    horizontal: 'left' | 'right' | 'center' | 'scale' | 'left-right'
    vertical: 'top' | 'bottom' | 'center' | 'scale' | 'top-bottom'
  }
  
  // === FLEX CHILD PROPERTIES (New) ===
  flexShrink?: number
  flexBasis?: number
  order?: number
  alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline'
  
  // === MIN/MAX (New) ===
  minWidth?: number
  maxWidth?: number
  minHeight?: number
  maxHeight?: number
  
  // === SPACING ===
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  
  // === VISUAL ===
  fills: Fill[]
  strokes: Stroke[]
  cornerRadius: number | {
    topLeft: number
    topRight: number
    bottomRight: number
    bottomLeft: number
  }
  effects: Effect[]
  opacity: number
  clipsContent: boolean
  
  // === CHILDREN ===
  children: ScytleNode[]
}
```

### 4.2 Update TextNode Type

```typescript
export interface TextNode {
  type: 'text'
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  
  // === CONTENT ===
  characters: string
  
  // === SIZING (Updated) ===
  sizing: {
    horizontal: 'fixed' | 'hug' | 'fill'
    vertical: 'fixed' | 'hug' | 'fill'
  }
  autoResize: 'none' | 'height' | 'width-and-height'  // Matches Figma
  
  // === TRUNCATION (New) ===
  textTruncation: 'disabled' | 'ending'
  maxLines?: number
  
  // === TYPOGRAPHY ===
  fontSize: number
  fontFamily: string
  fontWeight: number
  lineHeight: number | 'auto'
  letterSpacing: number
  textAlign: 'left' | 'center' | 'right' | 'justify'
  textAlignVertical: 'top' | 'center' | 'bottom'
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  textDecoration?: 'none' | 'underline' | 'line-through'
  
  // === VISUAL ===
  fills: Fill[]
  opacity?: number
  
  // === SEMANTIC ===
  htmlTag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'a' | 'button' | 'label' | 'li'
  href?: string  // For links
  
  // === FLEX CHILD (New) ===
  flexShrink?: number
  order?: number
  alignSelf?: 'auto' | 'start' | 'center' | 'end' | 'stretch' | 'baseline'
}
```

### 4.3 Update VectorNode Type

```typescript
export interface VectorNode {
  type: 'vector'
  id: string
  name: string
  x: number
  y: number
  width: number
  height: number
  
  // === VECTOR DATA ===
  vectorPaths: VectorPath[]
  
  // === VISUAL ===
  fills: Fill[]
  strokes: Stroke[]
  strokeWeight: number
  strokeCap: 'none' | 'round' | 'square'
  strokeJoin: 'miter' | 'bevel' | 'round'
  
  // === SIZING ===
  sizing: {
    horizontal: 'fixed' | 'hug' | 'fill'
    vertical: 'fixed' | 'hug' | 'fill'
  }
  
  // === CONSTRAINTS ===
  constraints?: {
    horizontal: 'left' | 'right' | 'center' | 'scale'
    vertical: 'top' | 'bottom' | 'center' | 'scale'
  }
}

export interface VectorPath {
  data: string  // SVG path d attribute
  windingRule: 'NONZERO' | 'EVENODD'
}
```

---

## Phase 5: Renderer Updates

### 5.1 Frame Renderer Updates

**File:** `src/components/editor/frame-renderer.tsx`

```typescript
export function FrameRenderer({ node, zoom, isSelected, onSelect }: FrameRendererProps) {
  // Build CSS based on layoutMode
  const containerStyle: React.CSSProperties = {
    position: node.layoutMode === 'none' ? 'relative' : undefined,
    display: node.layoutMode === 'flex' 
      ? 'flex' 
      : node.layoutMode === 'grid' 
        ? 'grid' 
        : 'block',  // 'none' = block with positioned children
    
    // Flex properties (only when flex)
    ...(node.layoutMode === 'flex' && {
      flexDirection: node.layoutDirection,
      flexWrap: node.layoutWrap,
      gap: `${node.layoutGap}px`,
      alignItems: mapAlignToCSS(node.layoutAlign),
      justifyContent: mapJustifyToCSS(node.layoutJustify),
    }),
    
    // Grid properties (only when grid)
    ...(node.layoutMode === 'grid' && {
      gridTemplateColumns: node.gridColumns 
        ? `repeat(${node.gridColumns}, 1fr)` 
        : undefined,
      gridTemplateRows: node.gridRows 
        ? `repeat(${node.gridRows}, auto)` 
        : undefined,
      gap: node.gridColumnGap || node.gridRowGap
        ? `${node.gridRowGap || node.layoutGap}px ${node.gridColumnGap || node.layoutGap}px`
        : `${node.layoutGap}px`,
    }),
    
    // Sizing
    width: getSizeValue(node.sizing.horizontal, node.width),
    height: getSizeValue(node.sizing.vertical, node.height),
    minWidth: node.minWidth,
    maxWidth: node.maxWidth,
    minHeight: node.minHeight,
    maxHeight: node.maxHeight,
    
    // Padding
    paddingTop: node.padding.top,
    paddingRight: node.padding.right,
    paddingBottom: node.padding.bottom,
    paddingLeft: node.padding.left,
    
    // Visual
    backgroundColor: getFillColor(node.fills),
    borderRadius: getBorderRadius(node.cornerRadius),
    opacity: node.opacity,
    overflow: node.clipsContent ? 'hidden' : 'visible',
    
    // Flex child properties
    flexShrink: node.flexShrink,
    flexBasis: node.flexBasis ? `${node.flexBasis}px` : undefined,
    order: node.order,
    alignSelf: node.alignSelf,
  }
  
  return (
    <div 
      style={containerStyle}
      className={cn(
        'frame-node',
        isSelected && 'ring-2 ring-blue-500'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(node.id)
      }}
    >
      {node.children.map(child => (
        <NodeRenderer 
          key={child.id} 
          node={child} 
          zoom={zoom}
          parentLayoutMode={node.layoutMode}
          parentDirection={node.layoutDirection}
        />
      ))}
    </div>
  )
}

function getSizeValue(
  sizing: 'fixed' | 'hug' | 'fill', 
  value: number
): string | undefined {
  switch (sizing) {
    case 'fixed': return `${value}px`
    case 'fill': return '100%'
    case 'hug': return 'fit-content'
  }
}

function mapAlignToCSS(align: string): string {
  const map: Record<string, string> = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'stretch': 'stretch',
    'baseline': 'baseline',
  }
  return map[align] || 'flex-start'
}

function mapJustifyToCSS(justify: string): string {
  const map: Record<string, string> = {
    'start': 'flex-start',
    'center': 'center',
    'end': 'flex-end',
    'between': 'space-between',
    'around': 'space-around',
    'evenly': 'space-evenly',
  }
  return map[justify] || 'flex-start'
}
```

### 5.2 Text Renderer Updates

**File:** `src/components/editor/text-renderer.tsx`

```typescript
export function TextRenderer({ 
  node, 
  zoom, 
  isSelected, 
  onSelect,
  parentLayoutMode,
  parentDirection 
}: TextRendererProps) {
  
  const textStyle: React.CSSProperties = {
    // Sizing based on autoResize mode
    width: getTextWidth(node),
    height: getTextHeight(node),
    
    // Typography
    fontSize: node.fontSize,
    fontFamily: node.fontFamily,
    fontWeight: node.fontWeight,
    lineHeight: node.lineHeight === 'auto' ? 'normal' : node.lineHeight,
    letterSpacing: node.letterSpacing,
    textAlign: node.textAlign,
    
    // Text transforms
    textTransform: node.textTransform,
    textDecoration: node.textDecoration,
    
    // Truncation
    ...(node.textTruncation === 'ending' && {
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: node.maxLines === 1 ? 'nowrap' : undefined,
      display: node.maxLines && node.maxLines > 1 ? '-webkit-box' : undefined,
      WebkitLineClamp: node.maxLines && node.maxLines > 1 ? node.maxLines : undefined,
      WebkitBoxOrient: node.maxLines && node.maxLines > 1 ? 'vertical' : undefined,
    }),
    
    // Color
    color: getFillColor(node.fills),
    opacity: node.opacity,
    
    // Flex child
    flexShrink: node.flexShrink ?? (node.autoResize === 'width-and-height' ? 0 : 1),
    alignSelf: node.alignSelf,
  }
  
  const Tag = node.htmlTag || 'p'
  
  return (
    <Tag
      style={textStyle}
      className={cn(
        'text-node',
        isSelected && 'ring-2 ring-blue-500'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(node.id)
      }}
    >
      {node.characters}
    </Tag>
  )
}

function getTextWidth(node: TextNode): string | undefined {
  switch (node.autoResize) {
    case 'none':
      return `${node.width}px`  // Fixed
    case 'height':
      return node.sizing.horizontal === 'fill' ? '100%' : `${node.width}px`
    case 'width-and-height':
      return 'fit-content'  // Hug
  }
}

function getTextHeight(node: TextNode): string | undefined {
  switch (node.autoResize) {
    case 'none':
      return `${node.height}px`  // Fixed
    case 'height':
    case 'width-and-height':
      return 'auto'  // Hug
  }
}
```

### 5.3 Vector Renderer (New)

**File:** `src/components/editor/vector-renderer.tsx`

```typescript
export function VectorRenderer({ 
  node, 
  zoom, 
  isSelected, 
  onSelect 
}: VectorRendererProps) {
  
  const containerStyle: React.CSSProperties = {
    width: node.sizing.horizontal === 'fixed' ? node.width : 'fit-content',
    height: node.sizing.vertical === 'fixed' ? node.height : 'fit-content',
  }
  
  // Build SVG from vector paths
  const svgContent = node.vectorPaths.map((path, i) => (
    <path
      key={i}
      d={path.data}
      fillRule={path.windingRule === 'EVENODD' ? 'evenodd' : 'nonzero'}
      fill={node.fills.length > 0 ? getFillColor(node.fills) : 'none'}
      stroke={node.strokes.length > 0 ? getStrokeColor(node.strokes) : 'none'}
      strokeWidth={node.strokeWeight}
      strokeLinecap={node.strokeCap}
      strokeLinejoin={node.strokeJoin}
    />
  ))
  
  return (
    <div
      style={containerStyle}
      className={cn(
        'vector-node',
        isSelected && 'ring-2 ring-blue-500'
      )}
      onClick={(e) => {
        e.stopPropagation()
        onSelect?.(node.id)
      }}
    >
      <svg
        width={node.width}
        height={node.height}
        viewBox={`0 0 ${node.width} ${node.height}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {svgContent}
      </svg>
    </div>
  )
}
```

---

## Phase 6: Testing & Validation

### 6.1 Unit Tests

**File:** `src/lib/parser/__tests__/html-to-nodes.test.ts`

```typescript
import { parseHtmlToNodes } from '../html-to-nodes'

describe('parseHtmlToNodes', () => {
  
  describe('Layout Mode Detection', () => {
    it('should default to layoutMode: none without flex class', () => {
      const html = '<div class="p-4"><p>Text</p></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.layoutMode).toBe('none')
    })
    
    it('should detect flex from explicit class', () => {
      const html = '<div class="flex items-center"><p>Text</p></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.layoutMode).toBe('flex')
      expect(frame.layoutDirection).toBe('row')
    })
    
    it('should infer flex from utility classes', () => {
      const html = '<div class="items-center justify-between gap-4"><p>Text</p></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.layoutMode).toBe('flex')
    })
    
    it('should detect flex-col direction', () => {
      const html = '<div class="flex flex-col"><p>Text</p></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.layoutDirection).toBe('column')
    })
    
    it('should detect grid layout', () => {
      const html = '<div class="grid grid-cols-3"><p>Text</p></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.layoutMode).toBe('grid')
      expect(frame.gridColumns).toBe(3)
    })
  })
  
  describe('Sizing Logic', () => {
    it('should default to hug for elements without width', () => {
      const html = '<div class="flex"><div class="p-2">Content</div></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const child = (result.children[0] as FrameNode).children[0] as FrameNode
      expect(child.sizing.horizontal).toBe('hug')
    })
    
    it('should detect fill from w-full', () => {
      const html = '<div class="w-full"><p>Text</p></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.sizing.horizontal).toBe('fill')
    })
    
    it('should detect fixed from explicit width', () => {
      const html = '<div class="w-64"><p>Text</p></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.sizing.horizontal).toBe('fixed')
      expect(frame.width).toBe(256)
    })
  })
  
  describe('Gap Handling', () => {
    it('should not inject default gaps', () => {
      const html = '<div class="flex"><div>A</div><div>B</div></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.layoutGap).toBe(0)
    })
    
    it('should use explicit gap', () => {
      const html = '<div class="flex gap-4"><div>A</div><div>B</div></div>'
      const result = parseHtmlToNodes(html, 'Test')
      const frame = result.children[0] as FrameNode
      expect(frame.layoutGap).toBe(16)
    })
  })
  
  describe('Text Nodes', () => {
    it('should hug headings by default', () => {
      const html = '<h1>Title</h1>'
      const result = parseHtmlToNodes(html, 'Test')
      const text = result.children[0] as TextNode
      expect(text.autoResize).toBe('width-and-height')
      expect(text.sizing.horizontal).toBe('hug')
    })
    
    it('should fill paragraphs by default', () => {
      const html = '<p>Long paragraph text</p>'
      const result = parseHtmlToNodes(html, 'Test')
      const text = result.children[0] as TextNode
      expect(text.autoResize).toBe('height')
      expect(text.sizing.horizontal).toBe('fill')
    })
  })
})
```

### 6.2 Visual Regression Tests

Create test HTML files and compare rendered output:

```typescript
// tests/visual/test-cases.ts

export const TEST_CASES = [
  {
    name: 'Horizontal Nav Bar',
    html: `
      <nav class="flex items-center justify-between p-4 bg-white">
        <div class="font-bold text-xl">Logo</div>
        <div class="flex gap-6">
          <a href="#" class="text-gray-600">Home</a>
          <a href="#" class="text-gray-600">About</a>
          <a href="#" class="text-gray-600">Contact</a>
        </div>
        <button class="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
      </nav>
    `,
    expectedLayout: 'flex-row',
    expectedGap: { nav: 0, links: 24 },
  },
  
  {
    name: 'Hero Section',
    html: `
      <section class="flex flex-col items-center text-center py-20 px-4">
        <h1 class="text-5xl font-bold">Welcome</h1>
        <p class="text-xl text-gray-600 mt-4 max-w-2xl">
          This is a description paragraph that should fill available width.
        </p>
        <div class="flex gap-4 mt-8">
          <button class="bg-blue-500 text-white px-6 py-3 rounded">Primary</button>
          <button class="border border-gray-300 px-6 py-3 rounded">Secondary</button>
        </div>
      </section>
    `,
    expectedLayout: 'flex-column',
    expectedTextSizing: { h1: 'hug', p: 'fill' },
  },
  
  {
    name: 'Icon Button Row',
    html: `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        <span>Menu</span>
      </div>
    `,
    expectedLayout: 'flex-row',
    expectedIconColor: 'inherit from text',
  },
]
```

### 6.3 Integration Tests

Test with real AI-generated HTML:

```typescript
// tests/integration/ai-output.test.ts

import { parseHtmlToNodes } from '@/lib/parser/html-to-nodes'
import { renderToStaticMarkup } from 'react-dom/server'
import { CanvasRenderer } from '@/components/editor/canvas-renderer'

describe('AI Output Integration', () => {
  it('should render AI-generated hero section correctly', async () => {
    // Fetch real AI output
    const response = await fetch('/api/ai/generate-html', {
      method: 'POST',
      body: JSON.stringify({
        prompt: 'Hero section for a SaaS landing page',
        type: 'section'
      })
    })
    const { html } = await response.json()
    
    // Parse to nodes
    const nodes = parseHtmlToNodes(html, 'Hero')
    
    // Render to markup
    const markup = renderToStaticMarkup(
      <CanvasRenderer nodes={nodes} />
    )
    
    // Validate structure
    expect(markup).toContain('flex')
    expect(markup).not.toContain('gap: 32px')  // No forced gaps
  })
})
```

---

## Migration Strategy

### Backward Compatibility

1. **Add `layoutMode: 'none'` support** without breaking existing saved designs
2. **Default new designs** to Figma-aligned behavior
3. **Migrate existing designs** on load with version flag

```typescript
function migrateNode(node: ScytleNode, version: number): ScytleNode {
  if (version < 2 && node.type === 'frame') {
    // V1 → V2: Add layoutMode if missing
    return {
      ...node,
      layoutMode: node.layoutMode || 'flex',  // Keep flex for old designs
    }
  }
  return node
}
```

### Feature Flags

```typescript
// src/lib/parser/config.ts

export const PARSER_CONFIG = {
  // Enable new Figma-aligned layout behavior
  useFigmaLayoutMode: true,
  
  // Default sizing mode
  defaultSizing: 'hug' as const,  // was 'fill'
  
  // Inject default gaps (for backward compat)
  injectDefaultGaps: false,  // was true
  
  // Convert SVGs to VectorNode
  useVectorNodes: false,  // Phase 3
}
```

---

## Success Criteria

### Must Have (Phase 1)

- [ ] Horizontal flex rows render correctly (not as columns)
- [ ] Elements don't stretch unexpectedly (hug by default)
- [ ] No phantom gaps between tightly-packed elements
- [ ] Build passes with no TypeScript errors
- [ ] Existing designs don't break

### Should Have (Phase 2-3)

- [ ] Icons have correct colors (not gray fallbacks)
- [ ] Text wraps naturally without forced width
- [ ] Grid layouts work correctly
- [ ] Flex shrink/grow/basis work

### Nice to Have (Phase 4+)

- [ ] VectorNode rendering for icons
- [ ] Constraints system for absolute positioning
- [ ] Full Tailwind v4 support

---

## Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1 | 2-3 days | None |
| Phase 2 | 1-2 days | Phase 1 |
| Phase 3 | 1-2 days | Phase 1 |
| Phase 4 | 0.5 days | Phase 1 |
| Phase 5 | 1-2 days | Phase 4 |
| Phase 6 | 1-2 days | All |
| **Total** | **7-12 days** | |

---

## Appendix: Tailwind → Figma Property Mapping

| Tailwind Class | Figma Property | Value |
|----------------|---------------|-------|
| `flex` | `layoutMode` | `'HORIZONTAL'` |
| `flex-col` | `layoutMode` + direction | `'VERTICAL'` |
| `grid` | `layoutMode` | `'GRID'` |
| `items-center` | `counterAxisAlignItems` | `'CENTER'` |
| `justify-between` | `primaryAxisAlignItems` | `'SPACE_BETWEEN'` |
| `gap-4` | `itemSpacing` | `16` |
| `w-full` | `layoutSizingHorizontal` | `'FILL'` |
| `w-64` | `layoutSizingHorizontal` + width | `'FIXED'`, `256` |
| `h-auto` | `layoutSizingVertical` | `'HUG'` |
| `p-4` | `paddingTop/Right/Bottom/Left` | `16` |
| `shrink-0` | `flexShrink` (on child) | `0` |
| `grow` | `flexGrow` (on child) | `1` |
| `truncate` | `textTruncation` | `'ENDING'` |
| `line-clamp-2` | `maxLines` | `2` |
