# CSS Grid Rendering Architecture Diagram

## Data Flow: HTML → Canvas Grid

```
┌─────────────────────────────────────────────────────────────────┐
│                    HTML/DOM Input                               │
│  <div style="display: grid; grid-template-columns: repeat(3, 1fr)">
│    <div style="grid-column: span 2">Cell</div>
│  </div>
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │   domparser.ts (Parser)          │
        │  Lines: 1426-1703                │
        └──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
   ┌────────────────┐            ┌──────────────────┐
   │ Grid Detection │            │ Grid Child Span  │
   │ (line 1426)    │            │ Extraction       │
   │                │            │ (line 1674)      │
   │ display:grid   │            │                  │
   │ → mode:'grid'  │            │ gridColumn: span │
   │ columns/rows   │            │ → gridColumnSpan │
   └────────────────┘            └──────────────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  Canvas Type System               │
        │  canvas.ts                        │
        └──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
   ┌────────────────┐            ┌──────────────────┐
   │  FrameNode     │            │  ScytleNode      │
   │                │            │                  │
   │ layout: {      │            │ gridColumnSpan?  │
   │   mode:'grid'  │            │ gridRowSpan?     │
   │   columns: 3   │            │                  │
   │   rows?: num   │            │                  │
   │   columnGap    │            │                  │
   │   rowGap       │            │                  │
   │ }              │            │                  │
   └────────────────┘            └──────────────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  Rendering Pipeline              │
        │  render-utils.ts                 │
        └──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
   ┌────────────────┐            ┌──────────────────┐
   │ computeFrame   │            │ computeBase      │
   │ LayoutStyles() │            │ Styles()         │
   │ (line 641)     │            │ (line 429)       │
   │                │            │                  │
   │ display:grid   │            │ [For children]   │
   │ grid-template  │            │                  │
   │ -columns/rows  │            │ grid-column/row  │
   │ gap settings   │            │ span CSS         │
   └────────────────┘            └──────────────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │   CSSProperties Object           │
        │  {                               │
        │    display: 'grid',              │
        │    gridTemplateColumns: '...',   │
        │    gridTemplateRows: '...',      │
        │    columnGap: 'calc(...)',       │
        │    rowGap: 'calc(...)'           │
        │    [+ gridColumn/Row on children]
        │  }                               │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │  React Components                │
        │  (frame-renderer.tsx)            │
        └──────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ▼                                     ▼
   ┌────────────────┐            ┌──────────────────┐
   │ <div style={   │            │ <NodeRenderer>   │
   │   ...cssProps  │            │   (children)     │
   │ }>             │            │ </NodeRenderer>  │
   │   {children}   │            │                  │
   │ </div>         │            │ [Recursively     │
   │                │            │  renders each    │
   │ (Grid parent)  │            │  child with      │
   │                │            │  gridColumn/Row) │
   └────────────────┘            └──────────────────┘
        │                                     │
        └──────────────────┬──────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │   Browser CSS Grid Engine        │
        │   (Layout Computation)           │
        └──────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────┐
        │     Visual Grid Layout           │
        │   on Canvas                      │
        └──────────────────────────────────┘
```

---

## Component Rendering Hierarchy

```
EditorCanvas (canvas.tsx)
  │
  └─ ThemeResolverProvider
       │
       └─ NodeRenderer (node-renderer.tsx) [TOP LEVEL NODES]
            │
            ├─ FrameRenderer (frame-renderer.tsx)
            │   │
            │   ├─ computeBaseStyles() → CSSProperties
            │   ├─ computeFrameLayoutStyles() → CSSProperties
            │   │   ├─ [If mode === 'grid']
            │   │   │   ├─ display: 'grid'
            │   │   │   ├─ gridTemplateColumns
            │   │   │   ├─ gridTemplateRows
            │   │   │   ├─ columnGap / rowGap
            │   │   │   └─ alignItems / justifyContent
            │   │   │
            │   │   └─ [Children receive:]
            │   │       └─ parentLayoutMode: 'grid'
            │   │
            │   └─ NodeRenderer [CHILD NODES]
            │       │
            │       ├─ FrameRenderer [nested grids possible]
            │       ├─ TextRenderer
            │       ├─ ImageRenderer
            │       └─ VectorRenderer
            │           │
            │           └─ computeBaseStyles()
            │               ├─ [If parentLayoutMode === 'grid']
            │               └─ gridColumn / gridRow
            │
            ├─ TextRenderer (text-renderer.tsx)
            │   └─ computeBaseStyles()
            │
            ├─ ImageRenderer (image-renderer.tsx)
            │   └─ computeBaseStyles()
            │
            └─ VectorRenderer (vector-renderer.tsx)
                └─ computeBaseStyles()
```

---

## CSS Generation Flow for Grid

### Parent Frame (Grid Container)

```
FrameNode {
  layout: {
    mode: 'grid',
    columns: 3,        // or "200px 1fr 200px"
    rows: 2,           // or undefined (auto-flow)
    columnGap: 16,
    rowGap: 8,
    align: 'center',   // align-items
    justify: 'start',  // justify-content
  }
}
    ↓
computeFrameLayoutStyles()
    ↓
const s: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gridTemplateRows: 'repeat(2, 1fr)',
  columnGap: 'calc(16px * var(--z, 1))',  // Zoom-scaled
  rowGap: 'calc(8px * var(--z, 1))',
  alignItems: 'center',      // ALIGN_MAP[center]
  justifyContent: 'flex-start',  // JUSTIFY_MAP[start]
}
    ↓
<div style={s}>
  {/* Children positioned by CSS Grid */}
</div>
```

### Child in Grid

```
ScytleNode {
  gridColumnSpan: 2,  // span 2 columns
  gridRowSpan: undefined,  // span 1 row (default)
}
    ↓
computeFrameLayoutStyles()
    ↓
const s: CSSProperties = {
  gridColumn: 'span 2',  // Spans 2 columns
  gridRow: 'span 1',     // (implicit, 1 column)
  // OR if gridColumnSpan === -1:
  gridColumn: '1 / -1',  // Full width
}
    ↓
<div style={s}>
  {/* Positioned by CSS Grid */}
</div>
```

---

## Grid Parsing from HTML

```
HTML Input:
<div style="display: grid; grid-template-columns: repeat(3, 1fr); 
             column-gap: 16px; row-gap: 8px;">
  <div style="grid-column: span 2;">Item 1</div>
  <div>Item 2</div>
</div>

     ↓ domparser.ts

Step 1: Detect Grid (line 1426)
  display = 'grid' or 'inline-grid'
     ↓
  layout.mode = 'grid'

Step 2: Parse Grid Template (line 1433)
  parseGridTemplate('repeat(3, 1fr)')
     ↓
  Result: 3 (numeric)
     ↓
  layout.columns = 3

Step 3: Parse Gaps (line 1434)
  parseNumber(cs.columnGap) = 16
  parseNumber(cs.rowGap) = 8
     ↓
  layout.columnGap = 16
  layout.rowGap = 8

Step 4: Extract Child Spans (line 741)
  extractGridSpan(childElement.style)
     ↓
  gc = 'span 2'
  spanMatch = /span\s+(\d+)/.match(gc) = ['span 2', '2']
     ↓
  gridColumnSpan = 2

Result FrameNode:
{
  type: 'frame',
  layout: {
    mode: 'grid',
    columns: 3,
    columnGap: 16,
    rowGap: 8,
  },
  children: [
    { gridColumnSpan: 2, ... },
    { gridColumnSpan: undefined, ... }
  ]
}
```

---

## Grid Child Width Calculation (domparser.ts lines 558-562)

```
When parsing text content in grid children:

If parent.layout.mode === 'grid':
  columns = 3
  columnGap = 16
  totalGap = 16 * (3 - 1) = 32
  availableWidth = 300  // parent width
  
  childAvailWidth = (300 - 32) / 3 = 89.33px per column
  
  If child.gridColumnSpan = 2:
    childParentWidth = 89.33 * 2 + 16 * (2 - 1)
                     = 178.66 + 16
                     = 194.66px  ← Text wraps to this width
```

---

## Grid Layout Height Calculation (domparser.ts lines 2873-2885)

```
When calculating auto-height of grid container:

frame.layout.mode = 'grid'
columns = 3
rowGap = 8
children = [item1(h:100), item2(h:120), item3(h:80), 
           item4(h:100), item5(h:90), item6(h:110)]

Row 1: items 1-3
  rowHeight = max(100, 120, 80) = 120

Row 2: items 4-6
  rowHeight = max(100, 90, 110) = 110

Total height = padding.top + 120 + 8 + 110 + padding.bottom
             = 0 + 120 + 8 + 110 + 0
             = 238px
```

---

## Grid Child Positioning (domparser.ts lines 2907-2920)

```
When assigning positions to grid children:

if (frame.layout.mode === 'grid') {
  for (const child of frame.children) {
    child.x = 0   ← CSS Grid handles horizontal placement
    child.y = 0   ← CSS Grid handles vertical placement
    // Note: Actual positions computed by browser CSS Grid engine
  }
}

Rationale:
  - CSS Grid uses automatic placement algorithm
  - Child positions are determined by grid-column/grid-row spans
  - Setting x/y = 0 prevents absolute positioning
  - Parent's padding/gap handled by CSS Grid, not by x/y offset
```

---

## Variable/Theme Integration

```
Grid gap with theme variable:

Node {
  layout: {
    gap: 16,
    gapRef: 'spacing/default',  // Theme reference
  }
}

In computeFrameLayoutStyles():
  const boundGap = resolveBoundNumber(
    'itemSpacing',
    varCtx.boundVariables,
    varCtx.modeId,
    varCtx.variables,
    varCtx.collections
  )
  
  const resolvedGap = boundGap 
    ?? (gapRef && themeCtx ? resolveNumber(gapRef, gap, ...) : gap)
  
  s.gap = `calc(${resolvedGap}px * var(--z, 1))`

Priority:
  1. Variable binding (boundGap)
  2. Theme table (gapRef)
  3. Raw value (gap)
```

---

## NOT YET IMPLEMENTED: Grid Line Visualization

```
Missing Features:
  ✅ Grid column/row count
  ✅ Grid gaps (columnGap, rowGap)
  ✅ Grid child spans
  ✅ CSS Grid properties generation
  ✅ Parser support
  
  ❌ Grid line overlays (visual guides)
  ❌ Track visualization (track cell highlights)
  ❌ Track resize handles
  ❌ Grid cell highlighting
  ❌ Grid debug mode
  
Comparison with Flex:
  - Flex has CanvasGapZones (gaps between items)
  - Grid uses CSS Grid for internal layout
  - No equivalent visual overlay for grid tracks
```

---

## Zoom Handling in Grid CSS

```
All pixel values are zoom-scaled:

gridTemplateColumns: 'repeat(3, 1fr)'
  → NOT scaled (relative unit)

columnGap: 16px
  → calc(16px * var(--z, 1))
  → At 0.5x zoom: 8px actual
  → At 2x zoom: 32px actual

padding: 16px
  → calc(16px * var(--z, 1))
  
margin: 8px
  → calc(8px * var(--z, 1))

Percentage values:
  width: '75%'
  → NOT scaled (already relative to parent)
  → Parent is already zoomed, so 75% of zoomed = correct
```

---

## Key Implementation Notes

1. **Grid children ALWAYS have x: 0, y: 0**
   - CSS Grid handles positioning via auto-placement
   - Explicit x/y would interfere with grid layout
   - Absolute positioning breaks grid layout

2. **Spans are resolved at parse time**
   - HTML: `grid-column: span 2` → Parsed as `gridColumnSpan: 2`
   - Rendered as: `gridColumn: 'span 2'`
   - Browser CSS Grid auto-places based on span

3. **Grid supports two column syntaxes**
   - Numeric: `columns: 3` → `repeat(3, 1fr)` (equal-sized)
   - String: `columns: "200px 1fr 200px"` → Custom tracks

4. **Grid is inherited but template changes dynamically**
   - Flex gap changes → All children re-layout
   - Grid columns change → All children re-layout
   - CSS Grid recalculates automatically

5. **Parser accounts for grid in width calculations**
   - Text measurement divides by column count
   - Considers column spans and gaps
   - Ensures text breaks appropriately
