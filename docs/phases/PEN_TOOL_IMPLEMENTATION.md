# Phase D3 — Pen Tool & Vector Edit System

> **Status:** Planned | **Branch:** `feat/canvas-node-system`
> **Figma Docs:** [Vector Networks](https://help.figma.com/hc/en-us/articles/360040450213) · [Vector Edit Mode](https://help.figma.com/hc/en-us/articles/360039957634) · [Plugin API: VectorNode](https://developers.figma.com/docs/plugins/api/VectorNode/) · [VectorNetwork](https://developers.figma.com/docs/plugins/api/VectorNetwork/) · [VectorPath](https://developers.figma.com/docs/plugins/api/VectorPath/) · [HandleMirroring](https://developers.figma.com/docs/plugins/api/HandleMirroring/)

---

## Overview

The Pen tool creates **VectorNode** shapes using Figma's Vector Network model — a graph of vertices, segments, and regions. Unlike traditional path tools, vector networks allow branching paths without forced closed loops, and each enclosed region can carry its own independent fill.

**Three modes:**
1. **Pen Drawing Mode** — click/drag to place anchor points, build a path
2. **Vector Edit Mode** — select/move/bend/cut individual anchor points
3. **Normal Selection** — VectorNode behaves like any other node (resize, fill, stroke, effects)

---

## Screenshots (Captured Live)

| State | Screenshot |
|-------|-----------|
| Pen tool activated in toolbar | `../../figma-pen-tool-active.png` |
| Triangle drawn, vector edit overlay visible | `../../figma-pen-triangle-drawn.png` |
| Anchor point selected → Position X/Y live | `../../anchor-point-selected.png` |
| Bend tool active (blue) | `../../tool-bend-active.png` |

### Overlay Tool Tooltips (all confirmed live)

| # | Tool | Shortcut | Screenshot |
|---|------|----------|-----------|
| 1 | Move | `V` | `../../tool-1-move.png` |
| 2 | Lasso | `Q` | `../../tool-2-lasso.png` |
| 3 | Shape builder | `M` | `../../tool-3-shape-builder.png` |
| 4 | Paint (fill bucket) | `⇧B` | `../../tool-4-paint.png` |
| 5 | Bend | `⌘` (hold) | `../../tool-5-bend.png` |
| 6 | Cut | `X` | `../../tool-6-cut.png` |
| 7 | Variable width | `⇧W` | `../../tool-7-variable-width.png` |
| 8 | Close | `Escape` | `../../tool-8-close.png` |

---

## Phase D3-1 — Data Model

> Extends `src/types/canvas.ts`

### New Types

```ts
// Maps to Figma Plugin API: HandleMirroring
// https://developers.figma.com/docs/plugins/api/HandleMirroring/
export type HandleMirroring = 'NONE' | 'ANGLE' | 'ANGLE_AND_LENGTH'
// NONE             = No mirroring (independent handles)
// ANGLE            = Handles stay collinear, lengths independent
// ANGLE_AND_LENGTH = Fully symmetric curve handles

// Maps to Figma Plugin API: VectorVertex
// https://developers.figma.com/docs/plugins/api/VectorNetwork/
export interface VectorVertex {
  x: number
  y: number
  strokeCap?: StrokeCap           // per-vertex cap override
  strokeJoin?: StrokeJoin         // per-vertex join override
  cornerRadius?: number           // per-vertex corner rounding
  handleMirroring?: HandleMirroring // default: 'NONE'
}

// Maps to Figma Plugin API: VectorSegment
export interface VectorSegment {
  start: number                   // index into vertices[]
  end: number                     // index into vertices[]
  tangentStart?: { x: number; y: number }  // bezier control point. Default {0,0} = straight
  tangentEnd?:   { x: number; y: number }  // bezier control point. Default {0,0} = straight
}

// Maps to Figma Plugin API: VectorRegion
export interface VectorRegion {
  windingRule: 'NONZERO' | 'EVENODD'
  loops: number[][]              // array of segment-index arrays forming closed loops
  fills?: Fill[]                 // per-region fill override (Paint[] in Figma API)
}

// Maps to Figma Plugin API: VectorNetwork
// https://developers.figma.com/docs/plugins/api/VectorNetwork/
export interface VectorNetwork {
  vertices: VectorVertex[]
  segments: VectorSegment[]
  regions:  VectorRegion[]       // if empty, all enclosed space is filled
}

// Maps to Figma Plugin API: VectorPath + VectorPaths
// https://developers.figma.com/docs/plugins/api/VectorPath/
export interface VectorPath {
  windingRule: 'NONZERO' | 'EVENODD' | 'NONE'
  data: string                   // SVG path string: "M 0 100 L 100 100 L 50 0 Z"
}
export type VectorPaths = VectorPath[]

export type StrokeCap =
  | 'NONE' | 'ROUND' | 'SQUARE'
  | 'LINE_ARROW' | 'TRIANGLE_ARROW' | 'REVERSED_TRIANGLE'
  | 'CIRCLE_ARROW' | 'DIAMOND_ARROW'

export type StrokeJoin = 'MITER' | 'BEVEL' | 'ROUND'

// The full VectorNode
// Maps to Figma Plugin API: VectorNode (type: 'VECTOR')
// https://developers.figma.com/docs/plugins/api/VectorNode/
export interface VectorNode extends BaseNodeProperties {
  type: 'vector'
  vectorNetwork: VectorNetwork   // canonical data (full graph)
  vectorPaths?: VectorPaths      // derived SVG path cache
  handleMirroring: HandleMirroring  // node-level default (per-vertex overrides this)
  strokeCap: StrokeCap
  strokeJoin: StrokeJoin
  strokeWeight: number
  strokeAlign: 'CENTER' | 'INSIDE' | 'OUTSIDE'
  strokeColor: string
  strokeOpacity: number
  variableWidthStroke?: VariableWidthPoint[]  // Phase D3-7 only
}

export interface VariableWidthPoint {
  t: number            // 0-1 position along segment
  width: number        // stroke width at this point
}
```

**Add `VectorNode` to the union:**
```ts
// canvas.ts
export type ScytleNode = FrameNode | TextNode | ImageNode | VectorNode
export type NodeType = ScytleNode['type']  // now includes 'vector'
```

**Extend `CanvasTool`:**
```ts
// canvas.ts
export type CanvasTool = 'select' | 'hand' | 'frame' | 'text' | 'pen'
// 'vector-edit' is NOT a CanvasTool — it's a modal state inside the store
```

**Factory function:**
```ts
export function createVector(overrides?: Partial<Omit<VectorNode, 'type'>>): VectorNode {
  return {
    ...DEFAULT_BASE,
    id: generateId(),
    name: 'Vector',
    type: 'vector',
    width: 0,
    height: 0,
    vectorNetwork: { vertices: [], segments: [], regions: [] },
    handleMirroring: 'NONE',
    strokeCap: 'ROUND',
    strokeJoin: 'MITER',
    strokeWeight: 1,
    strokeAlign: 'CENTER',
    strokeColor: '#000000',
    strokeOpacity: 1,
    fills: [],
    shadows: [],
    ...overrides,
  }
}
```

---

## Phase D3-2 — Store Changes

> Extends `src/store/editor-store.ts`

```ts
// New state fields
vectorEditNodeId: string | null          // which VectorNode is in edit mode (null = none)
vectorEditTool: VectorEditTool           // active sub-tool
selectedVertexIndices: number[]          // which anchor points are selected
penDrawingState: PenDrawingState | null  // in-progress path data

// New types
export type VectorEditTool =
  | 'move' | 'lasso' | 'shape-builder'
  | 'paint' | 'bend' | 'cut' | 'variable-width'

export interface PenDrawingState {
  nodeId: string                         // the in-progress VectorNode id
  vertices: VectorVertex[]               // committed points so far
  segments: VectorSegment[]
  isDrawing: boolean
  cursorX: number                        // current canvas-space cursor position
  cursorY: number
  nearStartPoint: boolean                // true when cursor hovers the first point → show close indicator
}

// New actions
enterVectorEditMode: (nodeId: string) => void
exitVectorEditMode: () => void
setVectorEditTool: (tool: VectorEditTool) => void
selectVertices: (indices: number[], additive?: boolean) => void
deselectVertices: () => void
updateVertex: (nodeId: string, index: number, patch: Partial<VectorVertex>) => void
addVertex: (nodeId: string, vertex: VectorVertex, afterIndex?: number) => void
deleteSelectedVertices: (nodeId: string) => void
updateVectorNetwork: (nodeId: string, network: VectorNetwork) => void
setPenDrawingState: (state: PenDrawingState | null) => void
commitPenPath: () => void                // converts penDrawingState → real VectorNode
```

---

## Phase D3-3 — Pen Drawing Mode

> New file: `src/components/editor/pen/pen-overlay.tsx`

**Entry:** Press `P` in keyboard shortcuts hook → `setActiveTool('pen')`

**Cursor:** CSS `cursor: crosshair` on viewport when `activeTool === 'pen'`

### Drawing FSM

```
IDLE
  │  click on canvas
  ▼
FIRST_POINT_PLACED
  │  each subsequent click
  ▼
DRAWING (rubber-band line follows cursor)
  │  hover over vertex[0]
  ├──► nearStartPoint = true  → cursor shows small circle indicator
  │
  │  click on vertex[0]
  ├──► CLOSE_PATH → commitPenPath() → enterVectorEditMode(newId)
  │
  │  press Escape
  └──► OPEN_PATH → commitPenPath() → select node, no edit mode
```

### Click + drag → Bezier curve
When `pointerdown → pointermove > 3px` before `pointerup`:
- Record drag delta as `tangentEnd` of current vertex
- Mirror it (×-1) as `tangentStart` of next vertex
- Set `handleMirroring: 'ANGLE_AND_LENGTH'` on that vertex

### Close path detection
```ts
const CLOSE_RADIUS_PX = 8  // screen pixels
// On every mousemove during DRAWING:
const dist = screenDistance(cursor, vertex[0])
nearStartPoint = dist < CLOSE_RADIUS_PX / zoom
```

### Rubber-band line
Render a live preview segment from last committed vertex to current cursor, styled as a dashed `<line>` SVG overlay.

### commitPenPath()
```ts
// 1. Compute bounding box of all vertices
// 2. Shift all vertex coordinates to be relative to bbox origin
// 3. Set VectorNode x/y/width/height from bbox
// 4. Add to store nodes
// 5. Clear penDrawingState
// 6. Select the new node
```

> **Figma ref:** "The path's position and size are automatically adjusted to fit its vertices"
> — [VectorNode docs](https://developers.figma.com/docs/plugins/api/VectorNode/)

---

## Phase D3-4 — Vector Edit Mode

> New file: `src/components/editor/pen/vector-edit-overlay.tsx`

**Entry:** `Enter` key when VectorNode selected, OR double-click VectorNode → `enterVectorEditMode(id)`

**Exit:** `Escape` key, or click `×` Close button → `exitVectorEditMode()`

**What changes on entry:**
- Bottom overlay toolbar appears floating above main toolbar
- Main toolbar Pen button stays highlighted
- Right panel → `"Vector"` heading with Alignment / Position / Mirroring / Corner radius
- Anchor points render as hollow blue circles on canvas

### Overlay Toolbar Component

```tsx
// src/components/editor/pen/vector-edit-toolbar.tsx
const TOOLS: { id: VectorEditTool; label: string; shortcut: string; icon: string }[] = [
  { id: 'move',          label: 'Move',           shortcut: 'V',  icon: 'move' },
  { id: 'lasso',         label: 'Lasso',          shortcut: 'Q',  icon: 'lasso' },
  { id: 'shape-builder', label: 'Shape builder',  shortcut: 'M',  icon: 'shape-builder' },
  { id: 'paint',         label: 'Paint',          shortcut: '⇧B', icon: 'paint' },
  { id: 'bend',          label: 'Bend',           shortcut: '⌘',  icon: 'bend' },
  { id: 'cut',           label: 'Cut',            shortcut: 'X',  icon: 'cut' },
  { id: 'variable-width',label: 'Variable width', shortcut: '⇧W', icon: 'variable-width' },
]
// + Close (×) button → exitVectorEditMode()
```

**Position:** `position: fixed`, centered bottom, sits above main toolbar (`z-index` above main toolbar)

**Active tool:** highlighted with blue background (`bg-blue-500 text-white`)

**Default active tool on entry:** `move`

---

## Phase D3-5 — The 8 Overlay Tools — Behavior Spec

### 1. Move `V`
- Default tool on entry
- **Hover anchor point:** cursor → `cursor-move`, point brightens
- **Click anchor point:** selects it → Right panel Position X/Y become live editable values
- **Drag anchor point:** repositions vertex, updates bounding box, re-renders path
- **Shift+click:** adds to `selectedVertexIndices` → bounding box appears around multi-selection
- **Right panel when point selected:**
  - Position X/Y: editable, shows vertex coords relative to node origin
  - Mirroring: radio group (No / Angle / Angle+Length)
  - Corner radius: single-corner icon, editable per vertex

### 2. Lasso `Q`
- Click + drag → freehand selection polygon
- All vertices inside polygon → added to `selectedVertexIndices`
- Release → bounding box around selected vertices

### 3. Shape Builder `M`
- Hover over enclosed region → diagonal stripe highlight overlay
- **Click:** merge highlighted regions into one VectorRegion
- **Alt+click:** subtract / delete region

### 4. Paint `⇧B`
- Hover over enclosed region → diagonal stripe highlight
- **Cursor shows `+`:** region has no fill → click to add default grey fill
- **Cursor shows `−`:** region has fill → click to remove
- Fill color controlled by `Fill` section in right panel
- Each `VectorRegion` can have its own `fills[]` array independent of node-level fills
- > API ref: `VectorRegion.fills: ReadonlyArray<Paint>` — [VectorNetwork docs](https://developers.figma.com/docs/plugins/api/VectorNetwork/)

### 5. Bend `⌘` (hold modifier)
- **Click straight segment:** inserts bezier handles → converts to curved segment
  - Sets `tangentStart` and `tangentEnd` on the segment
- **Click smooth point:** toggles to corner (removes handles)
- **Click corner point:** toggles to smooth (adds handles)
- *This is how point-type conversion works in Figma — there is no separate "convert" UI*
- On hover over segment: shows curved preview before clicking

### 6. Cut `X`
- **Click on anchor point:** splits path at vertex → point becomes two disconnected endpoints
- **Click+drag across segments:** severs the dragged portion into its own new VectorNode layer
- After cut on closed path → path becomes open (no automatic region fill)

### 7. Variable Width `⇧W`
- Hover over stroke → pink handle appears
- **Click:** places a `VariableWidthPoint { t, width }` on the stroke
- **Drag handle:** expands/contracts width at that point → tapered stroke
- **Snaps to:** vertex positions, segment midpoints, midpoint between width points
- **Hold Ctrl:** disable snapping
- **Shift+click:** multi-select width points
- **Delete:** remove selected width point
- **Not available when:** dashed strokes active, or network has branching paths
  - Right-click → Split vector (or Actions menu) required first

### 8. Close `×` (`Escape`)
- Exits vector edit mode → `exitVectorEditMode()`
- Bottom overlay disappears
- Right panel reverts to full "Vector path" panel (Position, Layout, Appearance, Fill, Stroke, Effects, Export)

---

## Phase D3-6 — Anchor Point & Handle Rendering

> New file: `src/components/editor/pen/anchor-points-overlay.tsx`

### Anchor Point Visuals
```
Unselected:  hollow circle, 7px diameter, blue stroke (#18A0FB), white fill
Selected:    solid filled circle, 7px diameter, blue (#18A0FB)
Hovered:     hollow circle + slightly enlarged (9px)
```

### Bezier Handle Visuals
```
Handle arm:  1px line, blue (#18A0FB), from vertex to control point
Handle nub:  3px solid circle at control point tip, blue (#18A0FB)
```

### Implementation
```tsx
// Render as a single <svg> overlay positioned absolute over canvas transform div
// All coordinates: vertex.x * zoom + panX, vertex.y * zoom + panY
// Subscribe to zoom/panX/panY (same pattern as GradientHandleOverlay)

function AnchorPointsOverlay({ nodeId }: { nodeId: string }) {
  const zoom = useEditorStore(s => s.zoom)
  const panX = useEditorStore(s => s.panX)
  const panY = useEditorStore(s => s.panY)
  const node = useEditorStore(s => findNodeById(s.nodes, nodeId)) as VectorNode
  const selected = useEditorStore(s => s.selectedVertexIndices)
  // ... render SVG circles and lines
}
```

---

## Phase D3-7 — Vector Rendering

> New file: `src/components/editor/pen/vector-renderer.tsx`

### VectorNetwork → SVG path string

```ts
// src/lib/vector-utils.ts
export function networkToSVGPath(network: VectorNetwork): string {
  // For each region's loop, walk segments and build M/L/C/Z commands
  // C command = cubic bezier: C tx1 ty1, tx2 ty2, ex ey
  // where tx = tangentStart/End relative to start/end vertex
  const paths: string[] = []
  for (const region of network.regions) {
    for (const loop of region.loops) {
      paths.push(buildLoop(network, loop))
    }
  }
  // Open paths (segments not in any region loop)
  const openSegments = findOpenSegments(network)
  for (const seg of openSegments) {
    paths.push(buildSegment(network, seg))
  }
  return paths.join(' ')
}

function buildSegment(n: VectorNetwork, segIdx: number): string {
  const seg = n.segments[segIdx]
  const v0 = n.vertices[seg.start]
  const v1 = n.vertices[seg.end]
  const ts = seg.tangentStart ?? { x: 0, y: 0 }
  const te = seg.tangentEnd   ?? { x: 0, y: 0 }
  const isStraight = ts.x === 0 && ts.y === 0 && te.x === 0 && te.y === 0
  if (isStraight) return `M ${v0.x} ${v0.y} L ${v1.x} ${v1.y}`
  // Cubic bezier: control points are ABSOLUTE (tangents are offsets from their vertex)
  return `M ${v0.x} ${v0.y} C ${v0.x+ts.x} ${v0.y+ts.y}, ${v1.x+te.x} ${v1.y+te.y}, ${v1.x} ${v1.y}`
}
```

**SVG triangle example** (matches the shape drawn in the Figma session):
```svg
<!-- VectorPath.data equivalent for a 300×200 triangle -->
<path d="M 150 0 L 300 200 L 0 200 Z" fill="none" stroke="#000" strokeWidth="1"/>
```

### VectorNode Renderer Component
```tsx
// Render as <svg> with computed path, fills as <defs><linearGradient> etc.
// Width/height = node.width, node.height
// Apply node.rotation, node.opacity via wrapper div (matches FrameNode pattern)
function VectorRenderer({ node }: { node: VectorNode }) {
  const d = useMemo(() => networkToSVGPath(node.vectorNetwork), [node.vectorNetwork])
  return (
    <svg width={node.width} height={node.height} overflow="visible">
      {node.fills.map((fill, i) => (
        <path key={i} d={d} fill={computeFillForSVG(fill)} stroke="none" />
      ))}
      <path
        d={d}
        fill="none"
        stroke={node.strokeColor}
        strokeWidth={node.strokeWeight}
        strokeLinecap={strokeCapToCSS(node.strokeCap)}
        strokeLinejoin={strokeJoinToCSS(node.strokeJoin)}
        opacity={node.strokeOpacity}
      />
    </svg>
  )
}
```

---

## Phase D3-8 — Right Panel — Vector Properties

> New file: `src/components/editor/properties-panel/vector-section.tsx`

### States

**No vertex selected (vector edit mode entered):**
```
Vector
──────────────────────────
Alignment    [←][↔][→]  [↑][↕][↓]
Position     X [  —  ]  Y [  —  ]   ← disabled
Mirroring    (•)No  ( )Angle  ( )Angle+Length
Corner radius  [⌐] 0
```

**Single vertex selected:**
```
Vector
──────────────────────────
Alignment    [←][↔][→]  [↑][↕][↓]
Position     X [-100]   Y [-143]     ← live, editable
Mirroring    ( )No  (•)Angle  ( )Angle+Length
Corner radius  [single-corner icon] 0
──────────────────────────
Fill         [+ Add]
Stroke       ██ 000000  100%  👁  −
  Position: Center   Weight: 1
```

**Multi-vertex selected:**
- Position shows `—` (mixed)
- Bounding box handles appear on canvas
- Shift+drag resizes proportionally
- Alt+drag resizes from center

### Mirroring Radio Group
```tsx
// Maps directly to VectorVertex.handleMirroring
// On change: updateVertex(nodeId, selectedVertexIndices[0], { handleMirroring: value })
const MIRRORING_OPTIONS = [
  { value: 'NONE',             label: 'No mirroring',        icon: MirrorNoneIcon },
  { value: 'ANGLE',            label: 'Mirror angle',        icon: MirrorAngleIcon },
  { value: 'ANGLE_AND_LENGTH', label: 'Mirror angle + length', icon: MirrorBothIcon },
]
```

---

## Phase D3-9 — Keyboard Shortcuts

> Extends `src/components/editor/hooks/use-keyboard-shortcuts.ts`

```ts
// In the main shortcuts hook:
if (activeTool === 'pen' || vectorEditNodeId) {
  // Sub-tool shortcuts (vector edit mode only)
  if (vectorEditNodeId) {
    switch (key) {
      case 'v':       setVectorEditTool('move');          break
      case 'q':       setVectorEditTool('lasso');         break
      case 'm':       setVectorEditTool('shape-builder'); break
      case 'b':       if (shift) setVectorEditTool('paint');          break
      case 'x':       setVectorEditTool('cut');           break
      case 'w':       if (shift) setVectorEditTool('variable-width'); break
      case 'Escape':  exitVectorEditMode();               break
      case 'Delete':  deleteSelectedVertices(vectorEditNodeId); break
      case 'Enter':   /* no-op, already in edit mode */   break
    }
    // ⌘/Ctrl held → temporarily switch to Bend, restore on keyup
    if (metaKey || ctrlKey) {
      setVectorEditTool('bend')
      // onKeyUp → restore previous tool
    }
  }
  // Enter edit mode from selection
  if (key === 'Enter' && selectedIds.length === 1) {
    const node = findNodeById(nodes, selectedIds[0])
    if (node?.type === 'vector') enterVectorEditMode(node.id)
  }
}
// Press P → activate pen tool (from any mode)
if (key === 'p' && !editingNodeId) setActiveTool('pen')
```

---

## Phase D3-10 — SVG Export

> Extends `src/lib/export/`

```ts
// VectorNode → HTML output
function vectorNodeToHTML(node: VectorNode): string {
  const d = networkToSVGPath(node.vectorNetwork)
  const fills = node.fills.map((f, i) => `<path d="${d}" fill="${fillToSVGAttr(f)}" />`)
  return `
<svg
  width="${node.width}"
  height="${node.height}"
  viewBox="0 0 ${node.width} ${node.height}"
  style="position:absolute;left:${node.x}px;top:${node.y}px;opacity:${node.opacity};overflow:visible;"
>
  ${fills.join('\n  ')}
  <path
    d="${d}"
    fill="none"
    stroke="${node.strokeColor}"
    stroke-width="${node.strokeWeight}"
    stroke-opacity="${node.strokeOpacity}"
    stroke-linecap="${strokeCapToCSS(node.strokeCap)}"
    stroke-linejoin="${strokeJoinToCSS(node.strokeJoin)}"
  />
</svg>`
}
```

---

## File Change Matrix

| File | Change |
|------|--------|
| `src/types/canvas.ts` | Add `VectorNode`, `VectorNetwork`, `VectorVertex`, `VectorSegment`, `VectorRegion`, `VectorPath`, `HandleMirroring`, `StrokeCap`, `StrokeJoin`; extend `ScytleNode` and `CanvasTool` |
| `src/store/editor-store.ts` | Add `vectorEditNodeId`, `vectorEditTool`, `selectedVertexIndices`, `penDrawingState`; add all vector edit actions |
| `src/components/editor/canvas.tsx` | Handle `activeTool === 'pen'` pointer events; render `<PenOverlay>` and `<VectorEditToolbar>` |
| `src/components/editor/hooks/use-keyboard-shortcuts.ts` | Add pen/vector-edit keyboard shortcuts |
| `src/components/editor/node-renderer.tsx` | Add `case 'vector': return <VectorRenderer node={node} />` |
| `src/components/editor/properties-panel/index.tsx` | Add VectorSection when VectorNode selected |
| **NEW** `src/components/editor/pen/pen-overlay.tsx` | Rubber-band line, in-progress point rendering |
| **NEW** `src/components/editor/pen/vector-edit-toolbar.tsx` | 7-tool + Close overlay toolbar |
| **NEW** `src/components/editor/pen/anchor-points-overlay.tsx` | Hollow/filled anchor point SVG overlay |
| **NEW** `src/components/editor/pen/bezier-handles-overlay.tsx` | Control arm + handle nib SVG |
| **NEW** `src/components/editor/pen/vector-renderer.tsx` | SVG rendering of VectorNode |
| **NEW** `src/components/editor/properties-panel/vector-section.tsx` | Vector panel: Alignment, Position, Mirroring, Corner radius |
| **NEW** `src/lib/vector-utils.ts` | `networkToSVGPath()`, `svgPathToNetwork()`, `buildSegment()`, geometry helpers |
| `src/lib/export/*.ts` | Add `vectorNodeToHTML()` |

---

## Implementation Order (Phases)

```
D3-1  Data model + types (canvas.ts)              ← no UI, just types
D3-2  Store state + actions (editor-store.ts)     ← no UI, just store
D3-7  VectorRenderer + vector-utils.ts            ← render static SVG
D3-3  Pen drawing mode (pen-overlay.tsx)          ← can draw shapes
D3-6  Anchor points + bezier handles overlays     ← can see points
D3-4  Vector edit mode + toolbar                  ← can enter edit mode
D3-5  All 8 sub-tools (Move, Lasso, Paint, etc.)  ← full editing
D3-8  Right panel vector section                  ← properties UI
D3-9  Keyboard shortcuts (full)                   ← shortcuts
D3-10 SVG export                                   ← export
```

---

## Key Invariants

1. **VectorNode position = bounding box of all vertices** — after any vertex move, recompute `x/y/width/height` from `Math.min/max` of all vertex coords
2. **Vertex coords are relative to node origin** — NOT canvas-absolute. To render on canvas: `vertex.x + node.x`, `vertex.y + node.y`
3. **Tangents are offsets from their vertex** — `controlPoint1 = { x: v0.x + tangentStart.x, y: v0.y + tangentStart.y }`
4. **Segments are non-directional** — `start`/`end` are just vertex indices; `tangentStart` belongs to `start`, `tangentEnd` belongs to `end` — but when walking in reverse, swap them
5. **`vectorPaths` is always a derived cache** — never the source of truth; always re-derive from `vectorNetwork`
6. **Empty `regions[]`** = Figma fills all enclosed space automatically (NONZERO rule)
7. **`handleMirroring: 'ANGLE_AND_LENGTH'`** on a vertex = smooth point (both handles move together). `'NONE'` = corner/sharp point

---

## API References

| Concept | Figma Plugin API | Figma Help Docs |
|---------|-----------------|-----------------|
| VectorNode | [VectorNode](https://developers.figma.com/docs/plugins/api/VectorNode/) | — |
| Vector network model | [VectorNetwork](https://developers.figma.com/docs/plugins/api/VectorNetwork/) | [Vector Networks](https://help.figma.com/hc/en-us/articles/360040450213) |
| SVG path strings | [VectorPath](https://developers.figma.com/docs/plugins/api/VectorPath/) | — |
| Handle mirroring | [HandleMirroring](https://developers.figma.com/docs/plugins/api/HandleMirroring/) | — |
| Vector edit tools | — | [Edit objects in vector edit mode](https://help.figma.com/hc/en-us/articles/360039957634) |
| Stroke cap styles | [StrokeCap](https://developers.figma.com/docs/plugins/api/StrokeCap/) | — |
| Creating vectors | `figma.createVector()` | — |
| Setting network async | `node.setVectorNetworkAsync(n)` | — |
