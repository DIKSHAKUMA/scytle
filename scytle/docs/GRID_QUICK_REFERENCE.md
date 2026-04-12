# CSS Grid Implementation - Quick Reference

## Grid CSS Generation

**File:** `scytle/src/components/editor/render-utils.ts`
**Lines:** 641-675

```typescript
else if (node.layout.mode === 'grid') {
    s.display = 'grid'
    
    // Template columns: convert number to CSS
    if (node.layout.columns != null) {
        s.gridTemplateColumns =
            typeof node.layout.columns === 'number'
                ? `repeat(${node.layout.columns}, 1fr)`
                : node.layout.columns
    }
    
    // Template rows
    if (node.layout.rows != null) {
        s.gridTemplateRows =
            typeof node.layout.rows === 'number'
                ? `repeat(${node.layout.rows}, 1fr)`
                : node.layout.rows
    }
    
    // Alignment
    if (node.layout.align)
        s.alignItems = ALIGN_MAP[node.layout.align] ?? node.layout.align
    if (node.layout.justify)
        s.justifyContent = JUSTIFY_MAP[node.layout.justify] ?? node.layout.justify
    
    // Gaps (with zoom scaling)
    const gridColGap = node.layout.columnGap ?? node.layout.gap
    if (gridColGap != null) {
        const boundColGap = nodeVarCtx ? resolveBoundNumber('itemSpacing', ...) : undefined
        const resolvedColGap = boundColGap ?? (theme-resolved) ?? gridColGap
        s.columnGap = `calc(${resolvedColGap}px * var(--z, 1))`
    }
    
    const gridRowGap = node.layout.rowGap ?? node.layout.gap
    if (gridRowGap != null) {
        const boundRowGap = nodeVarCtx ? resolveBoundNumber('counterAxisSpacing', ...) : undefined
        const resolvedRowGap = boundRowGap ?? (theme-resolved) ?? gridRowGap
        s.rowGap = `calc(${resolvedRowGap}px * var(--z, 1))`
    }
}
```

## Grid Child Spans

**File:** `scytle/src/components/editor/render-utils.ts`
**Lines:** 696-706

```typescript
// Grid child properties
if (node.gridColumnSpan != null) {
    s.gridColumn = node.gridColumnSpan === -1
        ? '1 / -1'           // Full width
        : `span ${node.gridColumnSpan}`
}
if (node.gridRowSpan != null) {
    s.gridRow = node.gridRowSpan === -1
        ? '1 / -1'
        : `span ${node.gridRowSpan}`
}
```

## Grid Parsing

**File:** `scytle/src/lib/parser/domparser.ts`

### Grid Detection (Line 1426)
```typescript
if (display === 'grid' || display === 'inline-grid') {
    const layout: Layout = {
        mode: 'grid',
        align: parseAlign(cs),
        justify: parseJustify(cs),
        columns: parseGridTemplate(cs.gridTemplateColumns),
        rows: parseGridTemplate(cs.gridTemplateRows),
        columnGap: parseNumber(cs.columnGap),
        rowGap: parseNumber(cs.rowGap),
        gap: parseNumber(cs.gap),
    }
}
```

### Grid Template Parser (Line 1478)
```typescript
function parseGridTemplate(template: string): number | string | undefined {
    // Input: "repeat(3, 1fr)" → Output: 3
    // Input: "200px 1fr 200px" → Output: "200px 1fr 200px"
    // ...parsing logic...
}
```

### Grid Span Extraction (Line 1678)
```typescript
function extractGridSpan(cs: CSSStyleDeclaration): { 
    gridColumnSpan?: number
    gridRowSpan?: number 
} {
    const result: { gridColumnSpan?: number; gridRowSpan?: number } = {}

    const gc = cs.gridColumn
    if (gc) {
        if (gc === '1 / -1') {
            result.gridColumnSpan = -1
        } else {
            const spanMatch = gc.match(/span\s+(\d+)/)
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

## Data Types

**File:** `scytle/src/types/canvas.ts`

### Layout Schema
```typescript
export const LayoutSchema = z.object({
    mode: z.enum(['flex', 'grid', 'none']),
    direction: z.enum(['row', 'column']).optional(),
    justify: z.enum(['start', 'end', 'center', 'between']).optional(),
    align: z.enum(['start', 'end', 'center', 'stretch', 'baseline']).optional(),
    wrap: z.boolean().optional(),
    gap: z.number().optional(),
    gapRef: z.string().optional(),
    gapDetached: z.boolean().optional(),
    columns: z.union([z.number(), z.string()]).optional(),
    rows: z.union([z.number(), z.string()]).optional(),
    columnGap: z.number().optional(),
    rowGap: z.number().optional(),
})
```

### Grid Child Properties
```typescript
export interface BaseNodeProperties {
    // ...other properties...
    gridColumnSpan?: number   // number or -1
    gridRowSpan?: number      // number or -1
}
```

## UI Controls

**File:** `scytle/src/components/editor/properties-panel/layout-section.tsx`

### Grid Mode Toggle (Lines 19-40)
```typescript
type LayoutMode = 'none' | 'flex-col' | 'flex-row' | 'grid'

const FLOW_OPTIONS = [
    { value: 'grid', icon: <LayoutGrid size={14} />, label: 'Grid' },
]
```

### Columns/Rows Inputs (Lines 756-777)
```typescript
{isGrid && (
    <div className="flex gap-2 pt-0.5">
        <NumberInput
            label="Cols"
            value={typeof layout.columns === 'number' ? layout.columns : 2}
            onChange={(v) => updateLayout({ columns: v })}
            min={1}
        />
        <NumberInput
            label="Rows"
            value={typeof layout.rows === 'number' ? layout.rows : 0}
            onChange={(v) => updateLayout({ rows: v > 0 ? v : undefined })}
            min={0}
        />
    </div>
)}
```

## Rendering Pipeline

**Frame Component:** `scytle/src/components/editor/frame-renderer.tsx`

```typescript
export const FrameRenderer = memo(function FrameRenderer({
    node,
    isTopLevel = false,
    parentDirection,
    parentLayoutMode,
}) {
    const themeCtx = useThemeResolver()

    const style: CSSProperties = {
        ...computeBaseStyles(node, isTopLevel, parentDirection, parentLayoutMode, themeCtx),
        ...computeFrameLayoutStyles(node, themeCtx),
    }

    if (style.position !== 'absolute') {
        const hasAbsoluteChild = node.children.some(c => c.positioning === 'absolute')
        if (node.layout.mode === 'none' || hasAbsoluteChild) {
            style.position = 'relative'
        }
    }

    const childDirection =
        node.layout.mode === 'flex'
            ? (node.layout.direction ?? 'column')
            : undefined

    return (
        <div data-node-id={node.id} style={style}>
            {node.children.map((child) => (
                <NodeRenderer
                    key={child.id}
                    node={child}
                    parentDirection={childDirection}
                    parentLayoutMode={node.layout.mode}
                />
            ))}
        </div>
    )
})
```

## Key Implementation Characteristics

1. **Two-level CSS property handling:**
   - `computeBaseStyles()` → Common styles (position, sizing, visual)
   - `computeFrameLayoutStyles()` → Layout-specific (flex/grid)

2. **Grid children always positioned at (0, 0):**
   - CSS Grid auto-placement handles actual positioning
   - Explicit x/y coordinates not used for grid children

3. **Zoom-aware sizing:**
   - Pixel values: `calc(${px} * var(--z, 1))`
   - Percentage values: Pass through unchanged
   - Grid fractions: No scaling needed

4. **Variable system support:**
   - Grid gaps can bind to theme variables
   - Resolution chain: Bound value → Theme value → Raw value

5. **Parser accounts for grid:**
   - Divides text parent width by column count
   - Multiplies by child span when measuring text
   - Calculates frame height based on rows

## Command Reference

### Search for grid code:
```bash
grep -r "gridColumn\|gridRow\|gridTemplate" scytle/src/
```

### Search for layout handling:
```bash
grep -r "layout.mode.*grid" scytle/src/
```

### Test grid parsing:
```bash
# Check domparser.ts grid detection
grep -A 10 "display.*grid" scytle/src/lib/parser/domparser.ts
```

### Find grid property definitions:
```bash
grep -B 2 -A 2 "gridColumnSpan\|gridRowSpan" scytle/src/types/canvas.ts
```
