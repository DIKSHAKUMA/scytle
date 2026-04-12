# Figma-Quality Grid Layout System — Implementation Plan

## Goal

Transform the current basic CSS Grid (uniform `repeat(N, 1fr)`) into a Figma-quality grid system with track-level control, visual overlay, interactive resize handles, keyboard navigation, and advanced track management in the properties panel.

---

## Current State

| Feature | Status |
|---------|--------|
| CSS Grid rendering (`repeat(N, 1fr)` or custom string) | ✅ Exists |
| Column/row count inputs in properties panel | ✅ Exists |
| Grid child span (`gridColumnSpan`, `gridRowSpan`) | ✅ Exists |
| Column/row gap (separate + theme-variable-bound) | ✅ Exists |
| Alignment (justify/align 3×3 grid) | ✅ Exists |
| Visual grid overlay on canvas | ❌ Missing |
| Track-based sizing (per-track fr/px/auto) | ❌ Missing |
| Interactive track resize handles on canvas | ❌ Missing |
| Properties panel track list (add/remove/edit/reorder) | ❌ Missing |
| Grid cell snapping (drag items into cells) | ❌ Missing |
| Keyboard navigation between cells | ❌ Missing |
| Track deletion from canvas | ❌ Missing |

---

## Architecture Overview

```
Types (canvas.ts)
  └─ GridTrack { value: number, unit: 'fr' | 'px' | 'auto' }
  └─ layout.columnTracks / rowTracks: GridTrack[]

Rendering (render-utils.ts)
  └─ Converts tracks → gridTemplateColumns/Rows CSS strings

Visual Overlay (grid-overlay.tsx) — NEW
  └─ SVG overlay in screen space (like existing overlays)
  └─ Shows grid lines, track labels, resize handles
  └─ RAF-driven position tracking

Properties Panel (layout-section.tsx)
  └─ Track list UI: per-track value+unit inputs
  └─ Add/remove/reorder tracks

Drag System (use-node-drag.ts)
  └─ Grid cell snapping during drag
  └─ Grid placement on drop (gridColumnStart/gridRowStart)
```

---

## Phase 1: Type System & Data Model

**Files:** `scytle/src/types/canvas.ts`, `scytle/src/components/editor/render-utils.ts`

### 1a. Add GridTrack type

```typescript
// In canvas.ts — new type
export interface GridTrack {
  value: number    // e.g. 1, 200, 0 (for auto)
  unit: 'fr' | 'px' | 'auto'  // fractional, fixed, or auto
}
```

### 1b. Extend layout schema

Add to the layout Zod schema (alongside existing `columns`/`rows`):

```typescript
columnTracks: z.array(z.object({
  value: z.number(),
  unit: z.enum(['fr', 'px', 'auto']),
})).optional(),
rowTracks: z.array(z.object({
  value: z.number(),
  unit: z.enum(['fr', 'px', 'auto']),
})).optional(),
```

**Backward compatibility:** Keep existing `columns: number | string` and `rows: number | string`. Priority: `columnTracks` > `columns` (if tracks exist, they generate the CSS template; legacy `columns` is fallback for old data).

### 1c. Add grid child placement

Extend node types:

```typescript
gridColumnStart?: number   // 1-based column start position
gridRowStart?: number      // 1-based row start position
```

These work alongside existing `gridColumnSpan` and `gridRowSpan`.

### 1d. Update render-utils.ts

In `computeFrameLayoutStyles()`, grid section (~line 641):

```typescript
// New: track-based template generation
if (node.layout.columnTracks?.length) {
  s.gridTemplateColumns = tracksToCSS(node.layout.columnTracks)
} else if (node.layout.columns != null) {
  // existing fallback
}

// Same for rows
if (node.layout.rowTracks?.length) {
  s.gridTemplateRows = tracksToCSS(node.layout.rowTracks)
} else if (node.layout.rows != null) {
  // existing fallback
}
```

Helper:
```typescript
function tracksToCSS(tracks: GridTrack[]): string {
  return tracks.map(t => {
    if (t.unit === 'auto') return 'auto'
    if (t.unit === 'fr') return `${t.value}fr`
    return `calc(${t.value}px * var(--z, 1))`  // zoom-aware px
  }).join(' ')
}
```

Add grid child placement CSS:
```typescript
if (node.gridColumnStart != null) {
  s.gridColumnStart = node.gridColumnStart
}
if (node.gridRowStart != null) {
  s.gridRowStart = node.gridRowStart
}
```

---

## Phase 2: Visual Grid Overlay

**File:** `scytle/src/components/editor/grid-overlay.tsx` (NEW)

This is the most visually impactful feature. Shows grid lines over selected grid containers.

### Architecture

- Renders as an SVG overlay in **screen space** (same pattern as `SnapGuideOverlay`, `MeasurementOverlay`)
- Takes `viewportRef` prop to compute screen positions
- Uses RAF loop for smooth tracking (same as `SelectionOverlay`)
- Only shows when a grid container is selected (or hovered)

### What it renders

1. **Track lines** — dashed lines at each column/row boundary
2. **Track labels** — small badges showing track size ("1fr", "200px", "auto") along top/left edges
3. **Cell shading** — subtle semi-transparent fill on cells (like Figma's pink/blue grid tint)
4. **Resize handles** — small circles/dots at track boundaries (Phase 3)

### Visual style

```
Color: rgba(156, 39, 176, 0.15) — purple tint for cells (Figma uses pink)
Lines: 1px dashed rgba(156, 39, 176, 0.4) — track boundaries
Labels: 11px monospace, white text on purple pill background
```

### Implementation

```typescript
'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'

export function GridOverlay({ viewportRef }: { viewportRef: React.RefObject<HTMLDivElement> }) {
  const selectedIds = useEditorStore(s => s.selectedNodeIds)
  const nodes = useEditorStore(s => s.nodes)
  const zoom = useEditorStore(s => s.zoom)
  const pan = useEditorStore(s => s.pan)
  const svgRef = useRef<SVGSVGElement>(null)

  // Find selected node if it's a grid container
  const gridNode = /* find node with layout.mode === 'grid' from selection */

  // RAF loop: measure the DOM element's position, draw grid lines
  useEffect(() => {
    if (!gridNode) return
    let raf: number
    const update = () => {
      // 1. Find the DOM element for gridNode
      // 2. Read its computed grid template (getComputedStyle)
      // 3. Compute track positions in screen space
      // 4. Update SVG elements (lines + labels)
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [gridNode, zoom, pan])

  if (!gridNode) return null
  return <svg ref={svgRef} className="absolute inset-0 pointer-events-none z-[60]" />
}
```

### Computing track positions

Key insight: use the browser's computed grid. After the CSS Grid renders:

```typescript
// Get the DOM element
const el = document.querySelector(`[data-node-id="${nodeId}"]`)
// Get computed column/row sizes
const colSizes = window.getComputedStyle(el).gridTemplateColumns // "200px 400px 200px"
const rowSizes = window.getComputedStyle(el).gridTemplateRows    // "100px 300px"
// Parse into pixel arrays, convert to screen coords
```

This avoids re-implementing CSS Grid's layout algorithm — we let the browser do the math and just read the results.

### Integration

**File:** `scytle/src/components/editor/canvas.tsx`

Add `<GridOverlay viewportRef={viewportRef} />` in the overlay render section (after `<PaddingOverlay />`, before `<SelectionOverlay />`):

```typescript
<GridOverlay viewportRef={viewportRef} />
```

---

## Phase 3: Interactive Track Resize Handles

**File:** `scytle/src/components/editor/grid-overlay.tsx` (extend)

### Behavior

- Small circles (6px diameter) at each column/row boundary
- Visible on hover over the grid overlay area
- Cursor changes to `col-resize` / `row-resize` on hover
- Drag to resize adjacent tracks
- **Resize logic:**
  - Dragging a column boundary adjusts the left track's size (the right track absorbs/releases space if fr-based)
  - For `fr` tracks: convert drag distance to fr delta proportionally
  - For `px` tracks: directly add/subtract pixels
  - Shift+drag: resize only the left track (don't adjust neighbor)

### Implementation approach

The resize handles need `pointer-events: auto` on the circles (while the rest of the overlay is `pointer-events: none`). On `pointerdown`:

```typescript
const onPointerDown = (e, trackIndex, axis: 'col' | 'row') => {
  e.stopPropagation()
  const startX = e.clientX
  const startValue = tracks[trackIndex].value
  
  const onMove = (e) => {
    const delta = (e.clientX - startX) / zoom  // convert screen px to canvas px
    if (tracks[trackIndex].unit === 'px') {
      updateTrack(trackIndex, { value: Math.max(0, startValue + delta) })
    } else if (tracks[trackIndex].unit === 'fr') {
      // Convert px delta to fr delta proportionally
      const totalFr = tracks.reduce((s, t) => s + (t.unit === 'fr' ? t.value : 0), 0)
      const containerSize = /* computed container width */
      const frDelta = delta / (containerSize / totalFr)
      updateTrack(trackIndex, { value: Math.max(0.1, startValue + frDelta) })
    }
  }
  // ... pointerup cleanup
}
```

---

## Phase 4: Properties Panel Track Management

**File:** `scytle/src/components/editor/properties-panel/layout-section.tsx`

Replace the simple "Cols" / "Rows" number inputs with a track list UI when the grid has `columnTracks` / `rowTracks`.

### UI Design

```
┌─────────────────────────────────┐
│ Columns                    [+]  │
│  ┌─────────────────────────┐    │
│  │  1fr        ▼  ─ │ ×   │    │
│  │  200px      ▼  ─ │ ×   │    │
│  │  1fr        ▼  ─ │ ×   │    │
│  └─────────────────────────┘    │
│                                 │
│ Rows                       [+]  │
│  ┌─────────────────────────┐    │
│  │  auto       ▼  ─ │ ×   │    │
│  │  1fr        ▼  ─ │ ×   │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

Each track row:
- **Value input** (number, disabled when `auto`)
- **Unit dropdown** (`fr`, `px`, `auto`)
- **Remove button** (×)
- **[+] button** at section header to add a track (defaults to `1fr`)

### Migration from legacy columns/rows

When user switches to grid mode or first opens track editor:
- If `columnTracks` exists → use it
- Else if `columns` is a number → generate N tracks of `{ value: 1, unit: 'fr' }`
- Else if `columns` is a string → try to parse it, fallback to 2 × 1fr

### Conversion logic

```typescript
function columnsToTracks(columns: number | string | undefined): GridTrack[] {
  if (!columns) return [{ value: 1, unit: 'fr' }, { value: 1, unit: 'fr' }]
  if (typeof columns === 'number') {
    return Array.from({ length: columns }, () => ({ value: 1, unit: 'fr' }))
  }
  // Parse string like "1fr 200px auto 2fr"
  return columns.split(/\s+/).map(parseTrackValue)
}

function parseTrackValue(s: string): GridTrack {
  if (s === 'auto') return { value: 0, unit: 'auto' }
  if (s.endsWith('fr')) return { value: parseFloat(s), unit: 'fr' }
  if (s.endsWith('px')) return { value: parseFloat(s), unit: 'px' }
  return { value: parseFloat(s) || 1, unit: 'fr' }
}
```

---

## Phase 5: Grid Cell Snapping & Item Placement

**File:** `scytle/src/components/editor/hooks/use-node-drag.ts`

### Grid-aware drag behavior

When dragging a node over a grid container:

1. **Detect grid parent:** During drag, check if the pointer is over a grid container
2. **Compute cell under pointer:** Use the same computed track positions from Phase 2
3. **Show cell highlight:** Dispatch to grid overlay to highlight the target cell
4. **On drop:** Set `gridColumnStart` and `gridRowStart` on the dropped node

### Cell detection

```typescript
function getGridCellAtPoint(gridEl: HTMLElement, canvasX: number, canvasY: number): { col: number, row: number } | null {
  const rect = gridEl.getBoundingClientRect()
  const colSizes = parseTrackSizes(getComputedStyle(gridEl).gridTemplateColumns)
  const rowSizes = parseTrackSizes(getComputedStyle(gridEl).gridTemplateRows)
  
  // Walk columns to find which one the point is in
  let col = 1, accum = 0
  for (const size of colSizes) {
    if (canvasX < accum + size) break
    accum += size
    col++
  }
  // Same for rows
  // ...
  return { col, row }
}
```

### Snap behavior

During reorder drag in grid parent:
- Show a colored cell highlight (purple tint) on the target cell
- Existing sibling edges snap still work within cells
- On drop: update `gridColumnStart` / `gridRowStart` instead of just reorder position

---

## Phase 6: Keyboard Navigation

**File:** `scytle/src/components/editor/canvas.tsx` (keyboard handler)

When a grid child is selected and the parent is a grid:

| Key | Action |
|-----|--------|
| Arrow Right | Move to next column (gridColumnStart + 1) |
| Arrow Left | Move to previous column (gridColumnStart - 1) |
| Arrow Down | Move to next row (gridRowStart + 1) |
| Arrow Up | Move to previous row (gridRowStart - 1) |

Bounds checking: clamp to 1..numColumns (accounting for span). If at edge, no-op.

---

## Phase 7: Track Management (Add/Delete from Canvas)

### Add track

- **From properties panel:** [+] button adds a `1fr` track at the end
- **From canvas:** Right-click on grid → context menu → "Add column after" / "Add row after"

### Delete track

- **From properties panel:** × button removes the track
- **From canvas:** Right-click on track label → "Delete column" / "Delete row"
- **Span adjustment:** When a track is deleted, adjust `gridColumnSpan` / `gridRowSpan` of children that spanned across the deleted track (reduce span by 1, minimum 1)
- **Position adjustment:** Children with `gridColumnStart > deletedIndex` get decremented by 1

---

## Files to Create / Modify

| File | Action | Estimated Lines |
|------|--------|-----------------|
| `scytle/src/types/canvas.ts` | Modify — add `GridTrack`, `columnTracks`, `rowTracks`, `gridColumnStart`, `gridRowStart` | ~20 |
| `scytle/src/components/editor/render-utils.ts` | Modify — track-based CSS generation, grid child placement | ~30 |
| `scytle/src/components/editor/grid-overlay.tsx` | **Create** — visual overlay + resize handles | ~350 |
| `scytle/src/components/editor/canvas.tsx` | Modify — add `<GridOverlay />`, keyboard navigation | ~25 |
| `scytle/src/components/editor/properties-panel/layout-section.tsx` | Modify — track list UI, migration from legacy | ~150 |
| `scytle/src/components/editor/hooks/use-node-drag.ts` | Modify — grid cell snapping + placement | ~80 |
| `scytle/src/store/editor-store.ts` | Modify — grid overlay state (highlighted cell, active resize) | ~15 |

**Total: ~670 lines of new/modified code across 7 files**

---

## Implementation Order

```
Phase 1: Types + render-utils (foundation — nothing visual breaks)
    ↓
Phase 2: Grid overlay (visual feedback — the "wow" moment)
    ↓
Phase 3: Resize handles (interactive track resizing on canvas)
    ↓
Phase 4: Properties panel track list (full track management UI)
    ↓
Phase 5: Cell snapping + placement (drag items into grid cells)
    ↓
Phase 6: Keyboard navigation (polish)
    ↓
Phase 7: Track add/delete from canvas (advanced management)
```

Each phase is independently deployable and testable. Phase 1-2 together give a strong visual demo. Phase 3-4 complete the core editing experience. Phase 5-7 are polish.

---

## Verification Plan

1. **Phase 1:** Create a grid with `columnTracks: [{value:1,unit:'fr'},{value:200,unit:'px'},{value:2,unit:'fr'}]` → CSS renders correctly as `1fr calc(200px * var(--z,1)) 2fr`
2. **Phase 2:** Select grid frame → purple grid lines appear over cells, labels show track sizes
3. **Phase 3:** Hover track boundary → resize dot appears → drag to resize → track value updates live
4. **Phase 4:** Properties panel shows track list → add/remove/change units → grid updates
5. **Phase 5:** Drag item over grid → cell highlights → drop → item placed in correct cell
6. **Phase 6:** Select grid child → arrow keys move between cells
7. **Backward compat:** Old grids with `columns: 3` still render as `repeat(3, 1fr)` — no regression
