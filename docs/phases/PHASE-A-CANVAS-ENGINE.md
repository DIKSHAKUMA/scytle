# Phase A — Canvas Engine (COMPLETE)

> **Status**: ✅ Fully implemented with 6 rounds of bug fixes (26+ bugs resolved)

## What This Phase Built

A **Figma-style infinite canvas editor** from scratch — no external canvas library. Users can create frames, text, and images, then select/drag/resize/edit them with full undo/redo, clipboard, z-ordering, grouping, and per-project persistence.

## Inner Phases (A1–A10)

### A1: Foundation — Schema + Store + Empty Canvas
- Defined `ScytleNode` type system in `src/types/canvas.ts` (436 LOC)
  - `FrameNode` — container div with flex/grid layout, padding, children
  - `TextNode` — text with font properties, inline editing
  - `ImageNode` — image or placeholder
  - `BaseNodeProperties` — shared: id, name, x, y, width, height, fills, border, shadows, opacity, rotation, overflow, borderRadius, sizing, positioning
- Created `useEditorStore` in `src/store/editor-store.ts` (1083 LOC) — Zustand + immer + devtools
- Infinite canvas with pan (scroll/drag) and zoom (Cmd+scroll, pinch)

### A2: Node Rendering
- `NodeRenderer` dispatches to FrameRenderer / TextRenderer / ImageRenderer
- Frames render children recursively with flexbox/grid layout
- Text renders with correct font properties, supports `htmlTag` (h1-h6, p, span)
- Images render `<img>` or placeholder with label

### A3: Selection + Hover
- Click to select, Shift+click for multi-select
- Blue outline on selected nodes, dashed outline on hover
- 8 resize handles on selected nodes
- Marquee (rubber-band) selection for area-selecting multiple nodes

### A4: Drag to Move
- Pointer-based drag with canvas ↔ screen coordinate conversion
- Batch mode: `beginBatch()` / `endBatch()` to avoid spamming history during drag
- Multi-node drag (moves all selected nodes together)

### A5: Resize Handles
- 8 handles (4 corners + 4 edges)
- Maintains aspect ratio with Shift held
- Respects min dimensions
- Batch mode for smooth resize

### A6: Layers Panel
- Recursive tree view mirroring the ScytleNode hierarchy
- Expand/collapse frames, show node type icons (frame=blue, text=purple, image=green)
- Visibility toggle (eye icon), lock toggle
- Click to select, drag to reorder within parent
- Depth-based indentation

### A7: Properties Panel
- Context-sensitive: shows properties of currently selected node
- Sections: Position (X, Y), Size (W, H), Fill (color picker + hex), Border (color, width, style), Border Radius, Layout (mode, direction, gap, justify, align), Typography (font, size, weight, align, color), Opacity slider, Shadow config
- Editing any field calls `updateNode()` and creates an undo snapshot

### A8: Toolbar
- Top-center toolbar with tool buttons: Select (V), Hand (H), Frame (F), Text (T)
- Active tool highlighted
- Undo/Redo buttons with disabled state

### A9: Text Inline Editing
- Double-click a TextNode to enter edit mode
- Renders a `contentEditable` div matching the text style
- Escape or click-away to commit
- Supports multi-line text

### A10: Keyboard Shortcuts
- `V` Select, `H` Hand, `F` Frame, `T` Text
- `Cmd+Z` Undo, `Cmd+Shift+Z` Redo
- `Delete/Backspace` Delete selected
- `Cmd+C/X/V` Copy/Cut/Paste
- `Cmd+D` Duplicate
- `Cmd+G` Group, `Cmd+Shift+G` Ungroup
- `]` Bring forward, `[` Send backward, `Cmd+]` Bring to front, `Cmd+[` Send to back
- `Cmd+A` Select all

## Bug Fix Rounds (6 rounds, 26+ bugs)

Key fixes included:
- Z-order operations working correctly with nested frames
- Clipboard paste positioning relative to viewport center
- History snapshots not created during batch operations (drag/resize)
- Marquee selection correctly converting screen → canvas coordinates
- Resize handles staying visible during resize
- Frame drill-in/drill-out (double-click to enter, Escape to exit)
- Layer panel drag-reorder with correct gap index calculation
- Per-project persistence via localStorage keyed by project ID

## File Inventory

| File | LOC | Purpose |
|------|-----|---------|
| `src/types/canvas.ts` | 436 | Node types, Zod schemas, factories, tree traversal |
| `src/store/editor-store.ts` | 1083 | Full canvas state management |
| `src/components/editor/canvas.tsx` | ~400 | Infinite canvas with pan/zoom |
| `src/components/editor/node-renderer.tsx` | ~150 | ScytleNode → component dispatch |
| `src/components/editor/frame-renderer.tsx` | ~200 | Frame container rendering |
| `src/components/editor/text-renderer.tsx` | ~200 | Text + inline editing |
| `src/components/editor/image-renderer.tsx` | ~100 | Image + placeholder |
| `src/components/editor/selection-overlay.tsx` | ~250 | Selection outlines + resize handles |
| `src/components/editor/layers-panel.tsx` | ~300 | Layer tree sidebar |
| `src/components/editor/toolbar.tsx` | ~100 | Top toolbar |
| `src/components/editor/properties-panel/` | ~600 | Properties sections |
| `src/components/editor/hooks/` | ~400 | Canvas interaction hooks |

## Node Type Reference

```typescript
interface FrameNode extends BaseNodeProperties {
    type: 'frame'
    children: ScytleNode[]
    layout: Layout           // { mode: 'flex'|'grid'|'none', direction, justify, align, gap, ... }
    padding: Padding         // { top, right, bottom, left }
}

interface TextNode extends BaseNodeProperties {
    type: 'text'
    characters: string
    fontFamily: string
    fontWeight: number
    fontSize: number
    lineHeight: number | 'auto'
    letterSpacing: number
    textAlign: 'left' | 'center' | 'right' | 'justify'
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
    textDecoration: 'none' | 'underline' | 'line-through'
    autoResize: 'none' | 'width-and-height' | 'height' | 'truncate'
    color: string
    htmlTag?: 'h1' | ... | 'span' | 'a' | 'li'
}

interface ImageNode extends BaseNodeProperties {
    type: 'image'
    src: string
    alt: string
    fit: 'cover' | 'contain' | 'fill'
    isPlaceholder: boolean
    placeholderLabel?: string
}
```

## What Phase A Does NOT Do

- ❌ No AI generation — canvas is manually populated or seeded
- ❌ No sitemap integration — standalone canvas
- ❌ No chat panel — just the canvas + layers + properties
- ❌ No theme system — individual node styling only
- ❌ No export — nodes stay in memory/localStorage
- ❌ No server persistence — localStorage only (Appwrite integration planned)
