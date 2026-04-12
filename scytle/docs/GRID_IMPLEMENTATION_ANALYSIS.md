# Canvas Rendering & CSS Grid Implementation Analysis

## Project Structure

**Main directories:**
- `scytle/src/components/editor/` - Canvas editor components and rendering
- `scytle/src/types/canvas.ts` - Type definitions for all canvas nodes
- `scytle/src/lib/parser/domparser.ts` - HTML/DOM parsing to canvas nodes
- `scytle/src/components/editor/properties-panel/` - UI for editing node properties

---

## 1. NODE RENDERING ARCHITECTURE

### Rendering Pipeline
1. **NodeRenderer** (`node-renderer.tsx`) - Dispatcher based on node type
   - Routes to type-specific renderers (Frame, Text, Image, Vector)
   - Passes props: `node`, `isTopLevel`, `parentDirection`, `parentLayoutMode`

2. **FrameRenderer** (`frame-renderer.tsx`) - Container div for frames
   - Computes base styles + layout styles
   - Sets `position: relative` if mode is 'none' or has absolute children
   - Recursively renders children via `NodeRenderer`

3. **TextRenderer** (`text-renderer.tsx`) - Text content rendering
   - Handles font loading (Google Fonts)
   - Supports inline editing
   - Computes text-specific CSS

4. **ImageRenderer** (`image-renderer.tsx`) - Image content

5. **VectorRenderer** (`vector-renderer.tsx`) - SVG vector paths

### Key Files:

**`scytle/src/components/editor/render-utils.ts` (716 lines)**
- **Core style computation functions:**
  - `computeBaseStyles()` - Base CSS for all nodes (position, sizing, opacity, fills, borders, shadows)
  - `computeFrameLayoutStyles()` - Layout-specific CSS (flex/grid/none)
  - Helper functions for individual CSS properties

- **Layout property mappings:**
  ```javascript
  const JUSTIFY_MAP = { start, end, center, between }
  const ALIGN_MAP = { start, end, center, stretch, baseline }
  ```

---

## 2. CSS GRID IMPLEMENTATION

### Data Type Definition
**In `scytle/src/types/canvas.ts`:**

```typescript
// Layout definition (applies to FrameNode)
export const LayoutSchema = z.object({
    mode: z.enum(['flex', 'grid', 'none']),
    direction: z.enum(['row', 'column']).optional(),
    justify: z.enum(['start', 'end', 'center', 'between']).optional(),
    align: z.enum(['start', 'end', 'center', 'stretch', 'baseline']).optional(),
    wrap: z.boolean().optional(),
    gap: z.number().optional(),
    gapRef: z.string().optional(),  // Theme variable reference
    gapDetached: z.boolean().optional(),
    columns: z.union([z.number(), z.string()]).optional(),  // Number or CSS template string
    rows: z.union([z.number(), z.string()]).optional(),     // Number or CSS template string
    columnGap: z.number().optional(),
    rowGap: z.number().optional(),
})

// Grid child positioning (on any node within grid parent)
export interface BaseNodeProperties {
    gridColumnSpan?: number   // col-span (number or -1 for full width)
    gridRowSpan?: number      // row-span (number or -1 for full width)
}
```

### CSS Generation
**In `computeFrameLayoutStyles()` (lines 641-675 of render-utils.ts):**

```typescript
else if (node.layout.mode === 'grid') {
    s.display = 'grid'
    
    // Grid template columns
    if (node.layout.columns != null) {
        s.gridTemplateColumns =
            typeof node.layout.columns === 'number'
                ? `repeat(${node.layout.columns}, 1fr)`  // "repeat(3, 1fr)" for 3 equal columns
                : node.layout.columns  // Raw CSS string, e.g., "200px 1fr 200px"
    }
    
    // Grid template rows
    if (node.layout.rows != null) {
        s.gridTemplateRows =
            typeof node.layout.rows === 'number'
                ? `repeat(${node.layout.rows}, 1fr)`
                : node.layout.rows
    }
    
    // Grid alignment (items-center, items-start, etc.)
    if (node.layout.align)
        s.alignItems = ALIGN_MAP[node.layout.align] ?? node.layout.align
    if (node.layout.justify)
        s.justifyContent = JUSTIFY_MAP[node.layout.justify] ?? node.layout.justify
    
    // Column gap
    const gridColGap = node.layout.columnGap ?? node.layout.gap
    if (gridColGap != null) {
        const boundColGap = resolveBoundNumber(...)  // Variable system
        const resolvedColGap = boundColGap ?? (theme-resolved) ?? gridColGap
        s.columnGap = `calc(${resolvedColGap}px * var(--z, 1))`  // Scaled by zoom
    }
    
    // Row gap
    const gridRowGap = node.layout.rowGap ?? node.layout.gap
    if (gridRowGap != null) {
        const boundRowGap = resolveBoundNumber(...)
        const resolvedRowGap = boundRowGap ?? (theme-resolved) ?? gridRowGap
        s.rowGap = `calc(${resolvedRowGap}px * var(--z, 1))`
    }
}
```

### Child Grid Positioning
**In `computeFrameLayoutStyles()` (lines 696-706):**

```typescript
// Grid child properties (applied to children within grid parent)
if (node.gridColumnSpan != null) {
    s.gridColumn = node.gridColumnSpan === -1
        ? '1 / -1'           // Full width span
        : `span ${node.gridColumnSpan}`  // e.g., "span 2"
}
if (node.gridRowSpan != null) {
    s.gridRow = node.gridRowSpan === -1
        ? '1 / -1'
        : `span ${node.gridRowSpan}`
}
```

---

## 3. GRID PARSING FROM HTML/DOM

**In `scytle/src/lib/parser/domparser.ts`:**

### Grid Detection (lines 1426-1434)
```typescript
if (display === 'grid' || display === 'inline-grid') {
    const layout: Layout = {
        mode: 'grid',
        align: parseAlign(cs),
        justify: parseJustify(cs),
        columns: parseGridTemplate(cs.gridTemplateColumns),  // Extract count or CSS
        rows: parseGridTemplate(cs.gridTemplateRows),
        columnGap: parseNumber(cs.columnGap),
        rowGap: parseNumber(cs.rowGap),
        gap: parseNumber(cs.gap),
    }
}
```

### Grid Template Parsing (lines 1475-1478)
```typescript
/**
 * Parse grid-template-columns/rows from inline style.
 * Returns:
 *   - number if it's "repeat(N, 1fr)" → N
 *   - string if it's raw CSS like "200px 1fr 200px" → keep as-is
 *   - undefined if missing
 */
function parseGridTemplate(template: string): number | string | undefined { ... }
```

### Grid Child Span Extraction (lines 1674-1703)
```typescript
/**
 * Extract grid column/row spans from inline CSS.
 * Tailwind: col-span-2 → grid-column: span 2
 *           row-span-full → grid-column: 1 / -1
 */
function extractGridSpan(cs: CSSStyleDeclaration): { 
    gridColumnSpan?: number
    gridRowSpan?: number 
} {
    const result: { gridColumnSpan?: number; gridRowSpan?: number } = {}

    const gc = cs.gridColumn
    if (gc) {
        if (gc === '1 / -1') {
            result.gridColumnSpan = -1  // Full width
        } else {
            const spanMatch = gc.match(/span\s+(\d+)/)  // "span 2" → 2
            if (spanMatch) result.gridColumnSpan = parseInt(spanMatch[1])
        }
    }

    const gr = cs.gridRow
    if (gr) {
        if (gr === '1 / -1') {
            result.gridRowSpan = -1
        } else {
            const spanMatch = gr.match(/span\s+(\d+)/)
            if (spanMatch) result.gridRowSpan = parseInt(spanMatch[1])
        }
    }

    return result
}
```

### Grid in Child Width Calculation (lines 558-562)
When calculating text layout width for children of grid containers:
```typescript
if (layout.mode === 'grid' && layout.columns && typeof layout.columns === 'number') {
    const gridGap = layout.gap || 0
    const totalGap = gridGap * (layout.columns - 1)
    childAvailWidth = (childAvailWidth - totalGap) / layout.columns
}
```

### Grid Layout Dimensions (lines 2873-2885)
For calculating frame height with grid layout:
```typescript
if (layout.mode === 'grid' && layout.columns && typeof layout.columns === 'number') {
    const cols = layout.columns
    const rowGap = layout.rowGap || layout.gap || 0
    let totalH = padding.top + padding.bottom
    for (let i = 0; i < flowChildren.length; i += cols) {
        const rowChildren = flowChildren.slice(i, i + cols)
        const rowH = Math.max(...rowChildren.map(childOuterHeight))
        totalH += rowH
        if (i > 0) totalH += rowGap
    }
    return totalH
}
```

### Grid Child Positioning (lines 2907-2920)
```typescript
if (frame.layout.mode === 'grid') {
    // Grid children have x/y = 0 (CSS Grid handles positioning)
    for (const child of frame.children) {
        child.x = 0
        child.y = 0
        if (child.type === 'frame') {
            assignChildPositions(child)
        }
    }
    return
}
```

---

## 4. USER INTERFACE FOR GRID EDITING

**File: `scytle/src/components/editor/properties-panel/layout-section.tsx`**

### Layout Mode Selection (lines 19-40)
```typescript
type LayoutMode = 'none' | 'flex-col' | 'flex-row' | 'grid'

function layoutToMode(l: Layout): LayoutMode {
    if (l.mode === 'none') return 'none'
    if (l.mode === 'grid') return 'grid'
    return l.direction === 'row' ? 'flex-row' : 'flex-col'
}

function modeToLayout(mode: LayoutMode, prev: Layout): Partial<Layout> {
    switch (mode) {
        case 'grid': return { 
            mode: 'grid', 
            columns: typeof prev.columns === 'number' ? prev.columns : 2 
        }
    }
}

const FLOW_OPTIONS = [
    { value: 'none', icon: <Move />, label: 'Free' },
    { value: 'flex-col', icon: <ArrowDown />, label: 'V' },
    { value: 'flex-row', icon: <ArrowRight />, label: 'H' },
    { value: 'grid', icon: <LayoutGrid />, label: 'Grid' },
]
```

### Grid-Specific Controls (lines 756-777)
```typescript
{isGrid && (
    <div className="flex gap-2 pt-0.5">
        <NumberInput
            label="Cols"
            value={typeof layout.columns === 'number' ? layout.columns : 2}
            onChange={(v) => updateLayout({ columns: v })}
            min={1}
            step={1}
            labelWidth="w-7"
            className="flex-1"
        />
        <NumberInput
            label="Rows"
            value={typeof layout.rows === 'number' ? layout.rows : 0}
            onChange={(v) => updateLayout({ rows: v > 0 ? v : undefined })}
            min={0}
            step={1}
            labelWidth="w-8"
            className="flex-1"
        />
    </div>
)}
```

### Alignment Grid Component
- 3×3 visual alignment selector for justify-content × align-items
- Figma-style interactive grid
- Supports space-between awareness

---

## 5. VISUAL GRID OVERLAY & INTERACTIONS

**File: `scytle/src/components/editor/selection-overlay.tsx`**

### Gap Zones Visualization (lines 1208-1350)
Interactive zones between children in flex/grid containers:

```typescript
export function CanvasGapZones({ viewportRef }) {
    // Only show on single selected flex frame with 2+ children
    const frameNode = selectedIds.length === 1 ? ... : null
    
    // For flex layout, render interactive gap zones
    // For grid: Not explicitly handled (CSS Grid handles internal spacing)
    
    // Gap visualization:
    // - Shows pink hatch pattern on gap hover
    // - Drag handle for resize
    // - Click-to-edit inline value
}
```

### Padding Zones Visualization (lines 538-561)
```typescript
export function CanvasPaddingZones({
    viewportRef,
}) {
    // Interactive transparent divs over padding areas
    // Shows blue hatch pattern on hover
    // Supports drag-to-resize and click-to-edit
}
```

---

## 6. LAYOUT POSITIONING LOGIC

### Grid vs Flex vs Freeform

| Mode | Positioning | Child x/y | CSS Display | Notes |
|------|-------------|----------|-------------|-------|
| **grid** | CSS Grid | (0, 0) | `grid` | Spans via `gridColumn`/`gridRow` |
| **flex** | Flexbox | Computed offset | `flex` | Direction-based offset, respects gaps |
| **none** | Absolute | Explicit x, y | Unset | Children absolutely positioned |

### Z-Axis Zoom Handling
**In `computeBaseStyles()` and throughout:**
- Pixel values wrapped in `calc(${value}px * var(--z, 1))`
- Percentage values pass through (already zoomed)
- Gaps, padding, sizing all zoom-scaled

Example:
```typescript
s.width = `calc(${node.width}px * var(--z, 1))`
s.gap = `calc(${resolvedGap}px * var(--z, 1))`
```

---

## 7. TRACK/GRID LINE RENDERING

**Current Status: NOT IMPLEMENTED**

Searches for "track" and "grid.*line" return no visual rendering code.

What EXISTS:
- ✅ Grid column/row count specification
- ✅ Grid gap (columnGap/rowGap) 
- ✅ Grid child spans (gridColumnSpan, gridRowSpan)
- ✅ CSS Grid display properties
- ✅ Gap zone visualization (flex only, via `CanvasGapZones`)
- ✅ Padding zone visualization

What's MISSING:
- ❌ Visual grid line overlays
- ❌ Visual grid track overlays
- ❌ Track resize handles
- ❌ Grid cell highlighting
- ❌ Grid debug visualization

---

## 8. KEY CODE SECTIONS

### CSS Grid Application Flow:
1. **Parser** (`domparser.ts:1426-1434`) → Detects `display: grid`
2. **Type** (`canvas.ts`) → Stores `layout.mode = 'grid'` + columns/rows
3. **Renderer** (`render-utils.ts:641-675`) → Generates CSS Grid properties
4. **Frame** (`frame-renderer.tsx`) → Applies styles to `<div>`
5. **Browser CSS** → Grid layout engine renders actual layout

### Grid Child Placement Flow:
1. **Parser** (`domparser.ts:1674-1703`) → Extracts `gridColumn: span 2`
2. **Type** (`canvas.ts`) → Stores `gridColumnSpan: 2` on node
3. **Renderer** (`render-utils.ts:697-706`) → Converts to `grid-column: span 2`
4. **React** → Applied to child div
5. **Browser CSS** → Grid auto-places or respects span

---

## 9. IMPORTANT IMPLEMENTATION DETAILS

### Grid Template Syntax Support
```typescript
// Numeric (easiest for UI)
columns: 3 → CSS: "repeat(3, 1fr)"

// String (for complex layouts)
columns: "200px 1fr 200px" → CSS: "200px 1fr 200px"
```

### Variable System Integration
- Grid gaps support theme variable binding
- Used via `resolveBoundNumber('itemSpacing', ...)`
- Falls back to theme table, then raw value

### Grid Children Don't Get Explicit x/y
```typescript
// Grid children in layout frame
if (frame.layout.mode === 'grid') {
    for (const child of frame.children) {
        child.x = 0  // CSS Grid handles positioning
        child.y = 0
    }
}
```

### Parser Width Calculation Accounts for Grid
When measuring text in grid children:
```typescript
if (isGrid) {
    // Divide available width by column count
    const gc = childEl.style.gridColumn
    if (gc?.includes('span')) {
        const span = parseInt(spanMatch[1])
        childParentWidth = childAvailWidth * span + gridGap * (span - 1)
    }
}
```

---

## 10. FILE REFERENCE SUMMARY

| File | Lines | Purpose |
|------|-------|---------|
| `canvas.ts` | 1-500+ | Type definitions (Layout, gridColumnSpan, gridRowSpan) |
| `render-utils.ts` | 641-675 | `computeFrameLayoutStyles()` - Grid CSS generation |
| `render-utils.ts` | 696-706 | Grid child span CSS generation |
| `domparser.ts` | 1426-1434 | Grid detection and property parsing |
| `domparser.ts` | 1475-1478 | Grid template parsing |
| `domparser.ts` | 1674-1703 | Grid span extraction |
| `domparser.ts` | 2873-2885 | Grid dimension calculation |
| `domparser.ts` | 2907-2920 | Grid child position assignment |
| `frame-renderer.tsx` | 1-70 | Frame rendering pipeline |
| `node-renderer.tsx` | 1-80 | Node type dispatch |
| `layout-section.tsx` | 19-40, 756-777 | Grid UI controls |
| `selection-overlay.tsx` | 1208-1350 | Gap/padding zone visualization |

