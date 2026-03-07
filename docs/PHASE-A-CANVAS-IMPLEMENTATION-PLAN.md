# Phase A — Canvas Engine Implementation Plan

> **Goal**: Build a Figma-like infinite canvas with real editing (frames, text, images, select/move/resize, layers panel, properties panel). This is the foundation everything else builds on.

---

## What Happens to the Existing Codebase

### Stays Untouched
| File/Dir | Why |
|----------|-----|
| `store/auth-store.ts` (188 LOC) | Auth is auth — login/logout/JWT |
| `store/project-store.ts` (240 LOC) | CRUD for projects in Appwrite |
| `store/chat-store.ts` (335 LOC) | AI chat — used in Phase B (right panel) |
| `lib/appwrite.ts` + `appwrite-server.ts` | Appwrite SDK |
| `lib/ai/` | Vertex AI client/prompts — used in Phase C |
| `lib/utils.ts` | `cn()`, `generateId()`, etc. |
| `components/ui/*` | shadcn primitives |
| `app/login/`, `signup/`, `forgot-password/` | Auth pages |
| `app/dashboard/` | Dashboard (modified in Phase B for chat-first entry) |
| `app/api/*` | All API routes |
| `types/index.ts` (406 LOC) | Extended with canvas type re-exports |

### Stays But Not Used by New Canvas
| File/Dir | Lines | Note |
|----------|-------|------|
| `store/unified-store.ts` | 2,633 | Old wireframe page/section model. Replaced by `editor-store.ts` |
| `store/sitemap-store.ts` | 1,042 | Kept for Phase B (sitemap on canvas) |
| `store/selection-store.ts` | 250 | Merged into `editor-store.ts` |
| `store/canvas-store.ts` | 303 | Used by old sitemap view. Kept until Phase B |
| `components/wireframe/*` | 11,840 | Old pre-built template system. Dead code from new editor's perspective |
| `lib/designs/*` | 20,170 | TemplateFamily/DesignPreset system. Dead code for new canvas |
| `components/canvas/*` | 2,097 | SitemapView — kept for Phase B integration |

### New Files (the canvas engine)
```
src/types/canvas.ts                          ← Node schemas + factories + tree utils
src/store/editor-store.ts                    ← Canvas state (Zustand + immer)
src/components/editor/
  index.ts                                   ← Barrel exports
  canvas.tsx                                 ← Infinite canvas (pan/zoom)
  node-renderer.tsx                          ← ScytleNode → HTML (A2)
  frame-renderer.tsx                         ← Frame <div> with flexbox (A2)
  text-renderer.tsx                          ← Text with inline editing (A2)
  image-renderer.tsx                         ← Image/placeholder (A2)
  selection-overlay.tsx                      ← Blue outline + resize handles (A3)
  layers-panel.tsx                           ← Left sidebar tree (A6)
  toolbar.tsx                                ← Top toolbar with tools (A8)
  properties-panel/
    index.tsx                                ← Context-sensitive container (A7)
    position-section.tsx                     ← X, Y inputs (A7)
    size-section.tsx                         ← W, H + sizing mode dropdown (A7)
    layout-section.tsx                       ← Flow, 3×3 grid, gap, padding (A7)
    fill-section.tsx                         ← Color picker + hex + opacity (A7)
    border-section.tsx                       ← Border + corner radius (A7)
    typography-section.tsx                   ← Font, size, weight, align (A7)
    effects-section.tsx                      ← Shadow config (A7)
    image-section.tsx                        ← Src, fit, alt (A7)
  hooks/
    use-canvas-pan-zoom.ts                   ← Wheel/pointer handlers (A1)
    use-node-drag.ts                         ← Drag to move (A4)
    use-node-resize.ts                       ← Drag handles (A5)
    use-keyboard-shortcuts.ts                ← Global shortcuts (A10)
```

### Rewritten
| File | Change |
|------|--------|
| `app/project/[id]/page.tsx` | 755 → ~100 lines. Strip 4-tab system, render `<EditorCanvas />` fullscreen |

---

## Inner Phases

### A1: Foundation (Schema + Store + Empty Canvas)

**Goal**: A blank infinite canvas you can pan and zoom. Nothing on it yet.

**Figma reference**: The grey canvas background. Scroll to pan, Cmd+scroll to zoom. The checkered/grey void when no frames are present.
> See: [FIGMA-UI-VISUAL-ANALYSIS.md §11 — Canvas Navigation](./FIGMA-UI-VISUAL-ANALYSIS.md#11-key-interaction-patterns)
> - Pan: Space + drag, scroll
> - Zoom: ⌘+scroll, pinch — zooms to cursor position
> - Zoom to fit: ⌘1

| Task | File | What |
|------|------|------|
| A1.1 | `types/canvas.ts` | Zod sub-schemas (Fill, Shadow, Border, Layout, Sizing, Padding). TypeScript interfaces (FrameNode, TextNode, ImageNode, ScytleNode). Factory functions (`createFrame`, `createText`, `createImage`). Tree utilities (`findNodeById`, `findParentOfNode`). |
| A1.2 | `store/editor-store.ts` | Zustand + immer store: `nodes[]`, `zoom`, `panX`, `panY`, `selectedIds`, `hoveredId`, `enteredFrameId`, `activeTool`. Actions: `setZoom`, `setPan`, `zoomTo` (focal point zoom), `zoomIn`, `zoomOut`, `resetZoom`, `setActiveTool`, `selectNode`, `deselectAll`, `addNode`, `updateNode`, `deleteNode`. |
| A1.3 | `components/editor/canvas.tsx` | Infinite canvas div. Wheel: scroll = pan, Cmd/Ctrl+scroll = zoom-to-cursor. Space+drag = hand tool pan. CSS `transform: translate(panX, panY) scale(zoom)` on content layer. Subtle dot grid background. |
| A1.4 | `app/project/[id]/page.tsx` | Rewrite: keep auth + project loading. Strip 4-tab system. Render `<EditorCanvas />` fullscreen with minimal top bar (back button, project name, zoom %). |

**Test checkpoint**:
- [x] Open `/project/[id]` → see grey canvas with dot grid
- [x] Scroll/trackpad → canvas pans smoothly
- [x] Cmd+scroll / pinch → zooms in/out (to cursor position)
- [x] Zoom % displays in top bar, clicks to reset to 100%
- [x] Space+drag → pans (cursor shows grab/grabbing)
- [x] `npm run build` passes clean

✅ **A1 COMPLETE** — All checkpoints verified.

---

### A2: Node Rendering (Frame + Text + Image on canvas)

**Goal**: Hardcode a sample node tree and see it rendered as real HTML on the canvas.

**Figma reference**: Frames appear as rectangles with blue outlines. Text renders with font styling. Children stack inside frames via auto-layout (flexbox).
> See: [FIGMA-ARCHITECTURE-DEEP-DIVE.md §4 — Deep Dive: Critical Node Types](./FIGMA-ARCHITECTURE-DEEP-DIVE.md#4-deep-dive-critical-node-types)
> - FrameNode = `<div>` with flexbox, padding, fills, border, overflow
> - TextNode = `<p>` leaf with font styles
> - Children sorted back-to-front

| Task | File | What |
|------|------|------|
| A2.1 | `components/editor/node-renderer.tsx` | Switch on `node.type` → `<FrameRenderer>` / `<TextRenderer>` / `<ImageRenderer>`. Recursive for children. |
| A2.2 | `components/editor/frame-renderer.tsx` | `<div>` with CSS from node: flex direction, gap, padding, bg color, border, radius, overflow. Renders children via `<NodeRenderer>`. |
| A2.3 | `components/editor/text-renderer.tsx` | `<p>`/`<span>` with font family, weight, size, line-height, color, align. Display only (no editing yet). |
| A2.4 | `components/editor/image-renderer.tsx` | `<img>` with object-fit. Placeholder shows grey box + label text. |
| A2.5 | Seed data in store | Sample "Hero Section" tree: frame with heading, subheading, CTA button frame, image. |

**Test checkpoint**:
- [x] Canvas shows a Hero Section frame with text and image
- [x] Auto-layout (flex) works — children stack with correct gap
- [x] Text renders with correct font/size/color
- [x] Image shows (or placeholder)
- [x] Pan/zoom still works with content

✅ **A2 COMPLETE** — Renderers created: `render-utils.ts`, `node-renderer.tsx`, `frame-renderer.tsx`, `text-renderer.tsx`, `image-renderer.tsx`, `seed-data.ts`. Build passes clean.

---

### A3: Selection System

**Goal**: Click a node → blue outline + 8 resize handles. Double-click to drill into frames.

**Figma reference**: Blue 1px outline + 8 white square handles around selected node. Double-click drills into frame. Escape exits.
> See: [FIGMA-UI-VISUAL-ANALYSIS.md §11 — Selection & Drilling](./FIGMA-UI-VISUAL-ANALYSIS.md#11-key-interaction-patterns)
> - Click = select topmost frame
> - Double-click = drill into frame (children become selectable)
> - Escape = go back up one level
> - Shift+click = add to multi-selection

| Task | File | What |
|------|------|------|
| A3.1 | `selection-overlay.tsx` | Blue outline + 8 handle divs at selected node's bounding box. Sits in overlay layer (screen coordinates, fixed handle size regardless of zoom). |
| A3.2 | Renderers + store | `onClick` → `selectNode(id)`. `stopPropagation` for nested frames. |
| A3.3 | Drill-in logic | Double-click frame → `enterFrame(id)`. Only children are click-selectable. |
| A3.4 | Escape to exit | Escape → `exitFrame()` or `deselectAll()`. |
| A3.5 | Hover highlight | `onMouseEnter` → `setHoveredId` → light blue dashed outline. |

**Test checkpoint**:
- [x] Click node → blue outline + handles
- [x] Click another → selection switches
- [x] Click empty canvas → deselect
- [x] Double-click frame → drill in, click children
- [x] Escape → exit frame
- [x] Hover → light outline

✅ **A3 COMPLETE** — Created `selection-overlay.tsx` (SelectionOverlay + HoverOverlay + useNodeInteraction). Event delegation in canvas.tsx handles click selection, double-click drill-in, and hover tracking via `data-node-id` DOM queries. Build passes clean.

---

### A4: Move (Drag Nodes)

**Goal**: Drag selected node to reposition.

**Figma reference**: Freeform children move by x/y. Auto-layout children show a blue insertion indicator when dragged to reorder.
> See: [FIGMA-UI-VISUAL-ANALYSIS.md §11 — Auto-Layout Behavior](./FIGMA-UI-VISUAL-ANALYSIS.md#11-key-interaction-patterns)
> - X/Y disabled for flex children
> - Drag reordering snaps to flex order positions

| Task | File | What |
|------|------|------|
| A4.1 | `hooks/use-node-drag.ts` | `pointerDown` → track start → `pointerMove` updates position → `pointerUp` commits. |
| A4.2 | Freeform drag | `layout.mode === 'none'` parent: update `node.x`, `node.y`. |
| A4.3 | Auto-layout reorder | Flex parent: calculate insertion index from cursor → show blue line → on drop, splice to new index. |

**Test checkpoint**:
- [x] Drag node in freeform → moves freely
- [x] Drag node in auto-layout → blue insertion line → reorders
- [x] Position updates in real-time

✅ **A4 COMPLETE** — Created `hooks/use-node-drag.ts` (~310 LOC) with freeform drag (screen→canvas delta conversion via zoom) and auto-layout reorder (gap calculation from cursor vs sibling midpoints + blue insertion indicator). Added `reorderNode` action to store, `DragInsertIndicator` component, pointer capture for smooth tracking, Escape cancellation. Build passes clean.

---

### A5: Resize (Drag Handles)

**Goal**: Drag any of 8 handles to resize.

**Figma reference**: Corner handles = width + height. Edge handles = single axis. Shift = maintain aspect ratio.
> See: [FIGMA-UI-VISUAL-ANALYSIS.md §3 — Layout Section](./FIGMA-UI-VISUAL-ANALYSIS.md#3-properties-panel--frame-node)
> - Width/Height with sizing mode dropdowns (Fixed/Hug/Fill)
> - Min/max width constraints

| Task | File | What |
|------|------|------|
| A5.1 | `hooks/use-node-resize.ts` | Detect handle direction (NW/N/NE/E/SE/S/SW/W). Calculate delta. Update width/height + position for NW/N/NE/W/SW handles. |
| A5.2 | Shift constraint | Shift key → lock aspect ratio. |
| A5.3 | Size mode awareness | `sizing.horizontal === 'fill'` → horizontal resize disabled or switches to fixed. |

**Test checkpoint**:
- [x] Drag SE corner → larger
- [x] Drag N edge → height only
- [x] Shift+drag → aspect ratio locked
- [x] Fill-mode frame: resize switches sizing mode

---

### A6: Layers Panel (Left Sidebar)

**Goal**: Tree view with expand/collapse, type icons, selection sync.

**Figma reference**: Hierarchical tree panel.
> See: [FIGMA-UI-VISUAL-ANALYSIS.md §2 — Layers Panel](./FIGMA-UI-VISUAL-ANALYSIS.md#2-layers-panel-left-sidebar)
> - Icons: Frame `#`, Auto-layout `≡`, Text `T`, Image `🖼`
> - Click = select (synced with canvas)
> - Double-click name = inline rename
> - Hover = visibility toggle
> - Drag = reorder within parent

| Task | File | What |
|------|------|------|
| A6.1 | `layers-panel.tsx` | Recursive tree. Row = expand arrow + type icon + name. |
| A6.2 | Selection sync | Click row → `selectNode(id)`. Canvas selection highlights layer. |
| A6.3 | Expand/collapse | `expandedIds` set. Arrow toggles. |
| A6.4 | Visibility toggle | Hover → 👁 button → `node.visible` toggle. |
| A6.5 | Drag to reorder | Drag row → insertion indicator → reorder `children[]`. |
| A6.6 | Inline rename | Double-click name → `contentEditable` → saves to `node.name`. |

**Test checkpoint**:
- [x] Full tree visible
- [x] Icons match types
- [x] Click layer ↔ canvas selection (bidirectional)
- [x] Expand/collapse works
- [x] Drag reorders in tree AND canvas
- [x] Rename works
- [x] Visibility toggle dims on canvas

---

### A7: Properties Panel (Right Sidebar)

**Goal**: Context-sensitive right panel with all editable properties.

**Figma reference**: Sections change based on selected node type.
> See: [FIGMA-UI-VISUAL-ANALYSIS.md §3-7](./FIGMA-UI-VISUAL-ANALYSIS.md#3-properties-panel--frame-node)
> - Frame: Position, Layout (flow radio, 3×3 alignment grid, gap, padding), Size (W/H + sizing dropdown), Appearance (opacity, radius), Fill, Border, Effects
> - Text: Position, Size, Typography (family, weight, size, line-height, align, transform, color)
> - Image: Position, Size, Image (src, fit, alt), Border

**Properties panel sections by node type:**

| Section | Frame (no layout) | Frame (auto-layout) | Text | Image |
|---------|-------------------|---------------------|------|-------|
| Position (X, Y) | ✅ | ✅ (disabled for flex children) | ✅ | ✅ |
| Size (W, H + mode) | ✅ Fixed/Fill | ✅ Fixed/Hug/Fill | ✅ | ✅ |
| Layout | Flow radio only | Flow + 3×3 grid + Gap + Padding + Clip | — | — |
| Appearance | Opacity, Radius | Opacity, Radius | Opacity | Opacity, Radius |
| Fill | Color + hex + opacity | Same | — | — |
| Border | Color + width + style | Same | — | Color + width |
| Typography | — | — | ✅ Full | — |
| Image | — | — | — | ✅ Src, fit, alt |
| Effects | Shadow | Shadow | Shadow | Shadow |

**Critical controls** (from Figma UI Analysis):
- **3×3 alignment grid** — visual justify-content + align-items picker (§4)
- **Sizing mode dropdown** — Fixed / Hug / Fill per axis (§3)
- **Flow radio group** — None / Column / Row icons (§3, §7)
- **Color picker with hex input** — color swatch + hex field + opacity (§3)
- **Text resizing radio** — Auto width / Auto height / Fixed (§5)

| Task | File | What |
|------|------|------|
| A7.1 | `properties-panel/index.tsx` | Container: reads selectedNode, renders sections by type. |
| A7.2 | `position-section.tsx` | X, Y inputs. Disabled when parent has auto-layout. |
| A7.3 | `size-section.tsx` | W + sizing dropdown, H + sizing dropdown. |
| A7.4 | `layout-section.tsx` | Flow radio. 3×3 alignment grid. Gap. Padding (2↔4 value toggle). Clip. |
| A7.5 | `fill-section.tsx` | Color swatch → popup picker. Hex input. Opacity. |
| A7.6 | `border-section.tsx` | Color + width + style. Corner radius (uniform + individual). |
| A7.7 | `typography-section.tsx` | Font family dropdown. Weight. Size. Line height. Letter spacing. Align buttons. Transform. Color. |
| A7.8 | `effects-section.tsx` | Add shadow → shadow row (x/y/blur/spread/color). |
| A7.9 | `image-section.tsx` | Source URL. Fit dropdown. Alt text. |

**Test checkpoint**:
- [x] Select frame → Position, Size, Layout, Fill, Border, Effects sections
- [x] Select text → Position, Size, Typography sections
- [x] Select image → Position, Size, Image, Border sections
- [x] Change value → canvas updates in real-time
- [x] 3×3 grid click → justify/align changes
- [x] Color picker works
- [x] X/Y disabled for flex children

---

### A8: Creation Tools (Frame/Text/Image)

**Goal**: Toolbar with Frame/Text/Image tools. Create nodes by clicking/dragging on canvas.

**Figma reference**: Toolbar tools.
> See: [FIGMA-UI-VISUAL-ANALYSIS.md §9 — Toolbar & Tools](./FIGMA-UI-VISUAL-ANALYSIS.md#9-toolbar--tools)
> - Frame (F): click + drag → new frame
> - Text (T): click → new text node, starts editing
> - Move (V): default select/move
> - Hand (H): pan without selecting

| Task | File | What |
|------|------|------|
| A8.1 | `toolbar.tsx` | Move (V), Frame (F), Text (T), Image, Hand (H). Active highlighted. |
| A8.2 | Frame creation | Frame tool active → drag on canvas → new FrameNode at position/size. Default: auto-layout column. |
| A8.3 | Text creation | Text tool → click → new TextNode at position → inline edit immediately. |
| A8.4 | Image creation | Click → URL prompt → ImageNode at viewport center. |
| A8.5 | Inline text editing | Double-click TextNode → `contentEditable` → type → blur saves. |

**Test checkpoint**:
- [x] F → draw frame on canvas
- [x] T → click → text node, type immediately
- [x] Image via click → placeholder appears
- [x] V → back to select
- [x] H → pan mode
- [x] Double-click text → inline edit → saves

✅ **A8 COMPLETE** — Created `toolbar.tsx` (floating toolbar with V/F/T/I/H tools + keyboard shortcuts), added frame creation (click-drag → draw rect → create FrameNode), text creation (click → TextNode + immediate inline editing via contentEditable), image creation (click → placeholder ImageNode), inline text editing (double-click → contentEditable → Escape/blur saves). Added `editingNodeId` + `setEditingNodeId` to editor store. Toolbar renders as floating overlay at top-center of canvas. Build passes clean.

---

### A9: Delete + Undo/Redo (History)

**Goal**: Delete selected nodes. Full undo/redo on all actions.

**Figma reference**: Delete/Backspace removes. Cmd+Z/Cmd+Shift+Z for undo/redo.
> History tracks: create, delete, move, resize, property changes.

| Task | File | What |
|------|------|------|
| A9.1 | Delete action | `deleteNode(id)`: find parent, splice from `children[]`, clear selection. |
| A9.2 | History middleware | `past[]` + `present` + `future[]`. Every mutation pushes to past. |
| A9.3 | Batch debounce | Drag/resize: push to history only on pointerUp, not every frame. |

**Test checkpoint**:
- [x] Delete → node removed
- [x] Cmd+Z → node returns
- [x] Cmd+Shift+Z → redo
- [x] 10+ chained actions → all undoable
- [x] Move + undo → back to original position

✅ **A9 COMPLETE** — History system with `_past`/`_future` snapshot stacks (max 50), `_snap()` helper auto-snapshots before every document mutation, `beginBatch()`/`endBatch()` for drag/resize debouncing, `undo()`/`redo()` restore full node tree, `deleteSelectedNodes()` bulk deletes with one history entry. Build passes clean.

---

### A10: Keyboard Shortcuts + Copy/Paste

**Goal**: Full keyboard shortcut system.

**Figma reference**: All shortcuts.
> See: [FIGMA-UI-VISUAL-ANALYSIS.md §13D — Keyboard Shortcuts](./FIGMA-UI-VISUAL-ANALYSIS.md#13d-keyboard-shortcuts-phase-1-minimum)

| Shortcut | Action |
|----------|--------|
| `V` | Select tool |
| `F` | Frame tool |
| `T` | Text tool |
| `H` | Hand tool |
| `Delete`/`Backspace` | Delete selected |
| `⌘Z` / `⇧⌘Z` | Undo / Redo |
| `⌘C` / `⌘V` | Copy / Paste |
| `⌘D` | Duplicate (copy + paste offset) |
| `]` / `[` | Bring forward / Send backward |
| `Escape` | Deselect or exit frame |
| `⌘G` | Group (wrap in frame) |
| `⌘+` / `⌘-` / `⌘0` | Zoom in / out / reset |

| Task | File | What |
|------|------|------|
| A10.1 | `hooks/use-keyboard-shortcuts.ts` | Global keydown. Skip when typing in inputs. |
| A10.2 | Copy/Paste | Cmd+C → serialize to clipboard JSON. Cmd+V → deserialize, new IDs, insert. |
| A10.3 | Duplicate | Cmd+D → copy + paste offset 20px. |
| A10.4 | Z-order | `]` forward, `[` backward in parent's children. |
| A10.5 | Group | Cmd+G → wrap selected in new Frame. |

**Test checkpoint**:
- [x] All shortcuts work
- [x] Copy → paste → offset copy appears
- [x] Duplicate → instant copy
- [x] Z-order visible in layers
- [x] Shortcuts don't fire in property inputs

✅ **A10 COMPLETE** — Created centralized `use-keyboard-shortcuts.ts` hook with full shortcut table (V/F/T/H tools, Del/Backspace delete, ⌘Z/⇧⌘Z undo/redo, ⌘C/⌘V copy/paste, ⌘D duplicate, ]/[ z-order, ⌘]/⌘[ front/back, ⌘G/⇧⌘G group/ungroup, ⌘+/⌘-/⌘0 zoom, Escape deselect). Consolidated from toolbar.tsx. Store actions: `copyNodes`, `pasteNodes` (stacked offset), `duplicateNodes`, `bringForward`/`sendBackward`/`bringToFront`/`sendToBack`, `groupNodes` (bounding-box wrap), `ungroupNodes` (position restore). Build passes clean.

---

## Build Order & Dependencies

```
A1  Foundation (schema + store + canvas)  ← No dependencies
 ↓
A2  Node Rendering (frame/text/image)     ← Needs A1 (canvas + schema)
 ↓
A3  Selection (click + drill-in)          ← Needs A2 (rendered nodes to click)
 ↓
A4  Move (drag nodes)                     ← Needs A3 (selection to know what to drag)
 ↓
A5  Resize (drag handles)                 ← Needs A3 (handles from selection overlay)
 ↓
A6  Layers Panel                          ← Needs A3 (selection sync)
 ↓
A7  Properties Panel                      ← Needs A3 (selection) + A2 (node rendering)
 ↓
A8  Creation Tools                        ← Needs A1 (canvas) + store.addNode
 ↓
A9  Undo/Redo                             ← Needs all mutation actions defined
 ↓
A10 Shortcuts + Copy/Paste                ← Needs A9 (history) + A4-A8 (actions)
```

---

## Estimated Effort

| Phase | Files | ~LOC | Est. |
|-------|-------|------|------|
| A1 Foundation | 5 files (+ 3 modified) | ~600 | 3h |
| A2 Rendering | 4 files | ~600 | 4h |
| A3 Selection | 2 files (+ renderer edits) | ~400 | 3h |
| A4 Move | 1 hook + store edits | ~300 | 3h |
| A5 Resize | 1 hook + overlay edits | ~350 | 3h |
| A6 Layers | 1 component | ~400 | 3h |
| A7 Properties | 9 files | ~1200 | 8h |
| A8 Creation | 1 toolbar + creation logic | ~300 | 3h |
| A9 History | Store middleware | ~200 | 2h |
| A10 Shortcuts | 1 hook + store actions | ~250 | 2h |
| **Total** | **~25 files** | **~4,600** | **~34h** |

---

*Created: 2026-03-06*
*Reference docs: [FIGMA-ARCHITECTURE-DEEP-DIVE.md](./FIGMA-ARCHITECTURE-DEEP-DIVE.md) · [FIGMA-UI-VISUAL-ANALYSIS.md](./FIGMA-UI-VISUAL-ANALYSIS.md)*
