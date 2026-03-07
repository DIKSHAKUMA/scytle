import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { devtools, persist } from 'zustand/middleware'
import { current } from 'immer'
import type { ScytleNode, FrameNode, CanvasTool } from '@/types/canvas'
import { findNodeById, findParentOfNode, createFrame, deepCloneWithNewIds, getNodeCanvasPosition, MIN_ZOOM, MAX_ZOOM, ZOOM_STEP } from '@/types/canvas'

// ============================================================
// History constants
// ============================================================

const MAX_HISTORY = 50

/**
 * Save a snapshot of current nodes to past[], clear future[].
 * Called BEFORE mutations. Skipped during batch operations (drag/resize).
 * Works with immer drafts — call at TOP of set() before modifications.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _snap = (state: any) => {
    if (state._batchDepth > 0) return
    state._past.push(current(state.nodes))
    state._future = []
    if (state._past.length > MAX_HISTORY) {
        state._past.splice(0, state._past.length - MAX_HISTORY)
    }
}

// ============================================================
// State Interface
// ============================================================

interface EditorState {
    // Document -----------------------------------------------
    nodes: ScytleNode[]
    /** Canvas/page background color */
    canvasColor: string

    // Viewport -----------------------------------------------
    zoom: number
    panX: number
    panY: number
    /** Cached viewport size for zoomIn/zoomOut centering */
    viewportRect: { width: number; height: number } | null

    // Selection ----------------------------------------------
    selectedIds: string[]
    hoveredId: string | null
    /** ID of the frame we've drilled into (double-click) */
    enteredFrameId: string | null

    // Tool ---------------------------------------------------
    activeTool: CanvasTool

    // Inline editing ------------------------------------------
    /** ID of the text node currently being edited inline */
    editingNodeId: string | null

    // Viewport actions ----------------------------------------
    setZoom: (zoom: number) => void
    setPan: (x: number, y: number) => void
    /** Zoom to a specific level while keeping a focal screen point fixed */
    zoomTo: (zoom: number, focalScreenX: number, focalScreenY: number) => void
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void
    setViewportRect: (rect: { width: number; height: number }) => void

    // Tool actions --------------------------------------------
    setActiveTool: (tool: CanvasTool) => void

    // Inline editing actions -----------------------------------
    setEditingNodeId: (id: string | null) => void

    // Selection actions ---------------------------------------
    selectNode: (id: string, addToSelection?: boolean) => void
    deselectAll: () => void
    setHoveredId: (id: string | null) => void
    enterFrame: (id: string) => void
    exitFrame: () => void

    // Canvas settings ----------------------------------------
    setCanvasColor: (color: string) => void

    // Document mutations (expanded in later phases) -----------
    setNodes: (nodes: ScytleNode[]) => void
    addNode: (node: ScytleNode, parentId?: string, index?: number) => void
    updateNode: (id: string, updates: Record<string, unknown>) => void
    deleteNode: (id: string) => void
    deleteSelectedNodes: () => void
    /** Reorder a node within its parent's children array.
     *  gapIndex is 0..N where N = number of siblings. */
    reorderNode: (nodeId: string, gapIndex: number) => void

    // History (internal) --------------------------------------
    _past: ScytleNode[][]
    _future: ScytleNode[][]
    _batchDepth: number
    _clipboard: ScytleNode[]

    // History actions -----------------------------------------
    undo: () => void
    redo: () => void
    beginBatch: () => void
    endBatch: () => void

    // Z-order actions -----------------------------------------
    bringForward: (id: string) => void
    sendBackward: (id: string) => void
    bringToFront: (id: string) => void
    sendToBack: (id: string) => void

    // Clipboard actions ---------------------------------------
    copyNodes: (ids: string[]) => void
    cutNodes: (ids: string[]) => void
    pasteNodes: () => void
    duplicateNodes: (ids: string[]) => void

    // Reparent actions -----------------------------------------
    moveNodeToFrame: (nodeId: string, newParentId: string) => void
    moveNodeToTopLevel: (nodeId: string) => void

    // Grouping actions ----------------------------------------
    groupNodes: (ids: string[]) => void
    ungroupNodes: (id: string) => void
}

// ============================================================
// Store
// ============================================================

export const useEditorStore = create<EditorState>()(
    devtools(
        persist(
            immer((set, get) => ({
                // Initial state ----------------------------------------
                nodes: [],
                canvasColor: '#F5F5F5',
                zoom: 1,
                panX: 0,
                panY: 0,
                viewportRect: null,
                selectedIds: [],
                hoveredId: null,
                enteredFrameId: null,
                activeTool: 'select' as CanvasTool,
                editingNodeId: null,
                _past: [],
                _future: [],
                _batchDepth: 0,
                _clipboard: [],

                // Viewport ---------------------------------------------

                setZoom: (zoom) =>
                    set(
                        (state) => {
                            state.zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
                        },
                        false,
                        'setZoom'
                    ),

                setPan: (x, y) =>
                    set(
                        (state) => {
                            state.panX = x
                            state.panY = y
                        },
                        false,
                        'setPan'
                    ),

                zoomTo: (zoom, focalScreenX, focalScreenY) =>
                    set(
                        (state) => {
                            const oldZoom = state.zoom
                            const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))

                            // Canvas-space point under the focal screen point
                            const canvasX = (focalScreenX - state.panX) / oldZoom
                            const canvasY = (focalScreenY - state.panY) / oldZoom

                            // Adjust pan so the same canvas point stays under the focal point
                            state.panX = focalScreenX - canvasX * newZoom
                            state.panY = focalScreenY - canvasY * newZoom
                            state.zoom = newZoom
                        },
                        false,
                        'zoomTo'
                    ),

                zoomIn: () =>
                    set(
                        (state) => {
                            const { zoom, panX, panY, viewportRect } = state
                            const newZoom = Math.min(MAX_ZOOM, zoom * ZOOM_STEP)

                            if (viewportRect) {
                                // Zoom toward viewport center
                                const cx = viewportRect.width / 2
                                const cy = viewportRect.height / 2
                                const canvasX = (cx - panX) / zoom
                                const canvasY = (cy - panY) / zoom
                                state.panX = cx - canvasX * newZoom
                                state.panY = cy - canvasY * newZoom
                            }

                            state.zoom = newZoom
                        },
                        false,
                        'zoomIn'
                    ),

                zoomOut: () =>
                    set(
                        (state) => {
                            const { zoom, panX, panY, viewportRect } = state
                            const newZoom = Math.max(MIN_ZOOM, zoom / ZOOM_STEP)

                            if (viewportRect) {
                                const cx = viewportRect.width / 2
                                const cy = viewportRect.height / 2
                                const canvasX = (cx - panX) / zoom
                                const canvasY = (cy - panY) / zoom
                                state.panX = cx - canvasX * newZoom
                                state.panY = cy - canvasY * newZoom
                            }

                            state.zoom = newZoom
                        },
                        false,
                        'zoomOut'
                    ),

                resetZoom: () =>
                    set(
                        (state) => {
                            state.zoom = 1
                            state.panX = 0
                            state.panY = 0
                        },
                        false,
                        'resetZoom'
                    ),

                setViewportRect: (rect) =>
                    set(
                        (state) => {
                            state.viewportRect = rect
                        },
                        false,
                        'setViewportRect'
                    ),

                // Tool -------------------------------------------------

                setActiveTool: (tool) =>
                    set(
                        (state) => {
                            state.activeTool = tool
                            // Exit inline editing when switching tools
                            if (state.editingNodeId) state.editingNodeId = null
                        },
                        false,
                        'setActiveTool'
                    ),

                setEditingNodeId: (id) =>
                    set(
                        (state) => {
                            state.editingNodeId = id
                        },
                        false,
                        'setEditingNodeId'
                    ),

                // Canvas settings --------------------------------------

                setCanvasColor: (color) =>
                    set(
                        (state) => {
                            state.canvasColor = color
                        },
                        false,
                        'setCanvasColor'
                    ),

                // Selection --------------------------------------------

                selectNode: (id, addToSelection = false) =>
                    set(
                        (state) => {
                            if (addToSelection) {
                                // Shift-click: toggle in selection
                                const idx = state.selectedIds.indexOf(id)
                                if (idx !== -1) {
                                    state.selectedIds.splice(idx, 1)
                                } else {
                                    state.selectedIds.push(id)
                                }
                            } else {
                                state.selectedIds = [id]
                            }
                        },
                        false,
                        'selectNode'
                    ),

                deselectAll: () =>
                    set(
                        (state) => {
                            state.selectedIds = []
                        },
                        false,
                        'deselectAll'
                    ),

                setHoveredId: (id) =>
                    set(
                        (state) => {
                            state.hoveredId = id
                        },
                        false,
                        'setHoveredId'
                    ),

                enterFrame: (id) =>
                    set(
                        (state) => {
                            const node = findNodeById(state.nodes, id)
                            if (node && node.type === 'frame') {
                                state.enteredFrameId = id
                                state.selectedIds = []
                            }
                        },
                        false,
                        'enterFrame'
                    ),

                exitFrame: () =>
                    set(
                        (state) => {
                            if (state.enteredFrameId) {
                                // Select the frame we're exiting from
                                state.selectedIds = [state.enteredFrameId]
                                state.enteredFrameId = null
                            }
                        },
                        false,
                        'exitFrame'
                    ),

                // Document mutations -----------------------------------

                setNodes: (nodes) =>
                    set(
                        (state) => {
                            state.nodes = nodes
                        },
                        false,
                        'setNodes'
                    ),

                addNode: (node, parentId, index) =>
                    set(
                        (state) => {
                            _snap(state)
                            if (!parentId) {
                                if (index !== undefined) {
                                    state.nodes.splice(index, 0, node)
                                } else {
                                    state.nodes.push(node)
                                }
                            } else {
                                const parent = findNodeById(state.nodes, parentId) as FrameNode | null
                                if (parent && parent.type === 'frame') {
                                    if (index !== undefined) {
                                        parent.children.splice(index, 0, node)
                                    } else {
                                        parent.children.push(node)
                                    }
                                }
                            }
                        },
                        false,
                        'addNode'
                    ),

                updateNode: (id, updates) =>
                    set(
                        (state) => {
                            _snap(state)
                            const node = findNodeById(state.nodes, id)
                            if (node) {
                                Object.assign(node, updates)
                            }
                        },
                        false,
                        'updateNode'
                    ),

                deleteNode: (id) =>
                    set(
                        (state) => {
                            _snap(state)
                            // Check top level
                            const topIdx = state.nodes.findIndex((n) => n.id === id)
                            if (topIdx !== -1) {
                                state.nodes.splice(topIdx, 1)
                                state.selectedIds = state.selectedIds.filter((sid) => sid !== id)
                                return
                            }

                            // Search recursively
                            const result = findParentOfNode(state.nodes, id)
                            if (result?.parent) {
                                result.parent.children.splice(result.index, 1)
                                state.selectedIds = state.selectedIds.filter((sid) => sid !== id)
                            }
                        },
                        false,
                        'deleteNode'
                    ),

                reorderNode: (nodeId, gapIndex) =>
                    set(
                        (state) => {
                            _snap(state)
                            const result = findParentOfNode(state.nodes, nodeId)
                            if (!result) return

                            const { parent, index: oldIndex } = result
                            const list = parent ? parent.children : state.nodes

                            // Convert gap index to final index after removal
                            const finalIndex =
                                gapIndex > oldIndex ? gapIndex - 1 : gapIndex

                            // No-op if same position
                            if (finalIndex === oldIndex) return

                            // Splice: remove from old position, insert at new
                            const [node] = list.splice(oldIndex, 1)
                            list.splice(finalIndex, 0, node)
                        },
                        false,
                        'reorderNode'
                    ),

                // ── Bulk delete ──────────────────────────────────────

                deleteSelectedNodes: () =>
                    set(
                        (state) => {
                            if (state.selectedIds.length === 0) return
                            _snap(state)

                            for (const id of [...state.selectedIds]) {
                                const topIdx = state.nodes.findIndex((n) => n.id === id)
                                if (topIdx !== -1) {
                                    state.nodes.splice(topIdx, 1)
                                    continue
                                }
                                const result = findParentOfNode(state.nodes, id)
                                if (result?.parent) {
                                    result.parent.children.splice(result.index, 1)
                                }
                            }

                            state.selectedIds = []
                            if (
                                state.editingNodeId &&
                                !findNodeById(state.nodes, state.editingNodeId)
                            ) {
                                state.editingNodeId = null
                            }
                        },
                        false,
                        'deleteSelectedNodes'
                    ),

                // ── History actions ───────────────────────────────────

                undo: () =>
                    set(
                        (state) => {
                            if (state._past.length === 0) return
                            state._future.push(current(state.nodes) as ScytleNode[])
                            state.nodes = state._past.pop()!
                            state.selectedIds = state.selectedIds.filter(
                                (id) => findNodeById(state.nodes, id) !== null
                            )
                            if (
                                state.editingNodeId &&
                                !findNodeById(state.nodes, state.editingNodeId)
                            ) {
                                state.editingNodeId = null
                            }
                        },
                        false,
                        'undo'
                    ),

                redo: () =>
                    set(
                        (state) => {
                            if (state._future.length === 0) return
                            state._past.push(current(state.nodes) as ScytleNode[])
                            state.nodes = state._future.pop()!
                            state.selectedIds = state.selectedIds.filter(
                                (id) => findNodeById(state.nodes, id) !== null
                            )
                            if (
                                state.editingNodeId &&
                                !findNodeById(state.nodes, state.editingNodeId)
                            ) {
                                state.editingNodeId = null
                            }
                        },
                        false,
                        'redo'
                    ),

                beginBatch: () =>
                    set(
                        (state) => {
                            if (state._batchDepth === 0) {
                                state._past.push(current(state.nodes) as ScytleNode[])
                                state._future = []
                                if (state._past.length > MAX_HISTORY) {
                                    state._past.splice(
                                        0,
                                        state._past.length - MAX_HISTORY
                                    )
                                }
                            }
                            state._batchDepth++
                        },
                        false,
                        'beginBatch'
                    ),

                endBatch: () =>
                    set(
                        (state) => {
                            state._batchDepth = Math.max(0, state._batchDepth - 1)
                        },
                        false,
                        'endBatch'
                    ),

                // ── Z-order actions ───────────────────────────────────

                bringForward: (id) =>
                    set(
                        (state) => {
                            _snap(state)
                            const result = findParentOfNode(state.nodes, id)
                            if (!result) return
                            const list = result.parent
                                ? result.parent.children
                                : state.nodes
                            const idx = result.index
                            if (idx >= list.length - 1) return
                            const [node] = list.splice(idx, 1)
                            list.splice(idx + 1, 0, node)
                        },
                        false,
                        'bringForward'
                    ),

                sendBackward: (id) =>
                    set(
                        (state) => {
                            _snap(state)
                            const result = findParentOfNode(state.nodes, id)
                            if (!result) return
                            const list = result.parent
                                ? result.parent.children
                                : state.nodes
                            const idx = result.index
                            if (idx <= 0) return
                            const [node] = list.splice(idx, 1)
                            list.splice(idx - 1, 0, node)
                        },
                        false,
                        'sendBackward'
                    ),

                bringToFront: (id) =>
                    set(
                        (state) => {
                            _snap(state)
                            const result = findParentOfNode(state.nodes, id)
                            if (!result) return
                            const list = result.parent
                                ? result.parent.children
                                : state.nodes
                            const idx = result.index
                            if (idx >= list.length - 1) return
                            const [node] = list.splice(idx, 1)
                            list.push(node)
                        },
                        false,
                        'bringToFront'
                    ),

                sendToBack: (id) =>
                    set(
                        (state) => {
                            _snap(state)
                            const result = findParentOfNode(state.nodes, id)
                            if (!result) return
                            const list = result.parent
                                ? result.parent.children
                                : state.nodes
                            const idx = result.index
                            if (idx <= 0) return
                            const [node] = list.splice(idx, 1)
                            list.unshift(node)
                        },
                        false,
                        'sendToBack'
                    ),

                // ── Clipboard actions ─────────────────────────────────

                copyNodes: (ids) =>
                    set(
                        (state) => {
                            const nodes: ScytleNode[] = []
                            for (const id of ids) {
                                const node = findNodeById(state.nodes, id)
                                if (node) nodes.push(current(node) as ScytleNode)
                            }
                            state._clipboard = nodes
                        },
                        false,
                        'copyNodes'
                    ),

                cutNodes: (ids) =>
                    set(
                        (state) => {
                            // Save to clipboard first
                            const clipNodes: ScytleNode[] = []
                            for (const id of ids) {
                                const node = findNodeById(state.nodes, id)
                                if (node) clipNodes.push(current(node) as ScytleNode)
                            }
                            state._clipboard = clipNodes

                            // Snap before deletion (the actual mutation)
                            _snap(state)

                            for (const id of [...ids]) {
                                const topIdx = state.nodes.findIndex((n) => n.id === id)
                                if (topIdx !== -1) {
                                    state.nodes.splice(topIdx, 1)
                                    continue
                                }
                                const result = findParentOfNode(state.nodes, id)
                                if (result?.parent) {
                                    result.parent.children.splice(result.index, 1)
                                }
                            }

                            state.selectedIds = []
                            if (
                                state.editingNodeId &&
                                !findNodeById(state.nodes, state.editingNodeId)
                            ) {
                                state.editingNodeId = null
                            }
                        },
                        false,
                        'cutNodes'
                    ),

                pasteNodes: () =>
                    set(
                        (state) => {
                            const clipboard = current(
                                state._clipboard
                            ) as ScytleNode[]
                            if (clipboard.length === 0) return
                            _snap(state)

                            const PASTE_OFFSET = 20
                            const newIds: string[] = []

                            // Determine paste target:
                            // 1. If drilled into a frame (enteredFrameId), paste inside it
                            // 2. If a single frame is selected, paste inside it (Figma behavior)
                            // 3. Otherwise, paste at top level
                            let targetFrame: FrameNode | null = null
                            if (state.enteredFrameId) {
                                const f = findNodeById(
                                    state.nodes,
                                    state.enteredFrameId
                                ) as FrameNode | null
                                if (f && f.type === 'frame') targetFrame = f
                            } else if (state.selectedIds.length === 1) {
                                const sel = findNodeById(
                                    state.nodes,
                                    state.selectedIds[0]
                                )
                                if (sel && sel.type === 'frame') {
                                    targetFrame = sel as FrameNode
                                }
                            }

                            for (const original of clipboard) {
                                const clone = deepCloneWithNewIds(original)

                                if (targetFrame) {
                                    // Check if clipboard coords are reasonable within target frame
                                    const inFrameBounds =
                                        clone.x >= -clone.width && clone.x <= targetFrame.width &&
                                        clone.y >= -clone.height && clone.y <= targetFrame.height

                                    if (inFrameBounds) {
                                        // Same-context or stacked paste — offset from current position
                                        clone.x += PASTE_OFFSET
                                        clone.y += PASTE_OFFSET
                                    } else {
                                        // Cross-context paste (from outside) — center within frame
                                        clone.x = (targetFrame.width - clone.width) / 2
                                        clone.y = (targetFrame.height - clone.height) / 2
                                    }
                                    targetFrame.children.push(clone)
                                } else {
                                    clone.x += PASTE_OFFSET
                                    clone.y += PASTE_OFFSET
                                    state.nodes.push(clone)
                                }
                                newIds.push(clone.id)
                            }

                            state.selectedIds = newIds
                            // Update clipboard for stacked paste offset
                            state._clipboard = newIds.map(
                                (id) => {
                                    const node = findNodeById(state.nodes, id)!
                                    return JSON.parse(JSON.stringify(node)) as ScytleNode
                                }
                            )
                        },
                        false,
                        'pasteNodes'
                    ),

                duplicateNodes: (ids) =>
                    set(
                        (state) => {
                            if (ids.length === 0) return
                            _snap(state)

                            const OFFSET = 20
                            const newIds: string[] = []

                            for (const id of ids) {
                                const original = findNodeById(state.nodes, id)
                                if (!original) continue
                                const clone = deepCloneWithNewIds(
                                    current(original) as ScytleNode
                                )
                                clone.x += OFFSET
                                clone.y += OFFSET

                                // Insert clone right after original
                                const result = findParentOfNode(state.nodes, id)
                                if (result) {
                                    const list = result.parent
                                        ? result.parent.children
                                        : state.nodes
                                    list.splice(result.index + 1, 0, clone)
                                } else {
                                    state.nodes.push(clone)
                                }
                                newIds.push(clone.id)
                            }

                            state.selectedIds = newIds
                        },
                        false,
                        'duplicateNodes'
                    ),

                // ── Grouping actions ──────────────────────────────────

                groupNodes: (ids) =>
                    set(
                        (state) => {
                            if (ids.length < 2) return
                            _snap(state)

                            // All nodes must share the same parent
                            const firstResult = findParentOfNode(
                                state.nodes,
                                ids[0]
                            )
                            if (!firstResult) return

                            const parentList = firstResult.parent
                                ? firstResult.parent.children
                                : state.nodes

                            // Collect matching nodes in order
                            const nodesToGroup: ScytleNode[] = []
                            const indices: number[] = []
                            for (let i = 0; i < parentList.length; i++) {
                                if (ids.includes(parentList[i].id)) {
                                    nodesToGroup.push(
                                        current(parentList[i]) as ScytleNode
                                    )
                                    indices.push(i)
                                }
                            }

                            if (nodesToGroup.length < 2) return

                            // Calculate bounding box
                            let minX = Infinity,
                                minY = Infinity,
                                maxX = -Infinity,
                                maxY = -Infinity
                            for (const n of nodesToGroup) {
                                minX = Math.min(minX, n.x)
                                minY = Math.min(minY, n.y)
                                maxX = Math.max(maxX, n.x + n.width)
                                maxY = Math.max(maxY, n.y + n.height)
                            }

                            // Create group frame with repositioned children
                            const group = createFrame({
                                x: minX,
                                y: minY,
                                width: maxX - minX,
                                height: maxY - minY,
                                name: 'Group',
                                layout: { mode: 'none' },
                                children: nodesToGroup.map((n) => ({
                                    ...n,
                                    x: n.x - minX,
                                    y: n.y - minY,
                                })) as FrameNode['children'],
                            })

                            // Remove old nodes (reverse order)
                            for (let i = indices.length - 1; i >= 0; i--) {
                                parentList.splice(indices[i], 1)
                            }

                            // Insert group at first original position
                            parentList.splice(indices[0], 0, group)
                            state.selectedIds = [group.id]
                        },
                        false,
                        'groupNodes'
                    ),

                ungroupNodes: (id) =>
                    set(
                        (state) => {
                            const result = findParentOfNode(state.nodes, id)
                            if (!result) return
                            const node = findNodeById(state.nodes, id)
                            if (!node || node.type !== 'frame') return

                            _snap(state)

                            const parentList = result.parent
                                ? result.parent.children
                                : state.nodes

                            // Restore children with adjusted positions
                            const children = (node as FrameNode).children.map(
                                (child) => {
                                    const c = current(child) as ScytleNode
                                    return {
                                        ...c,
                                        x: c.x + node.x,
                                        y: c.y + node.y,
                                    }
                                }
                            )

                            // Replace group with its children
                            parentList.splice(
                                result.index,
                                1,
                                ...(children as ScytleNode[])
                            )

                            state.selectedIds = children.map((c) => c.id)
                        },
                        false,
                        'ungroupNodes'
                    ),

                // ── Reparent action ────────────────────────────────────

                moveNodeToFrame: (nodeId, newParentId) =>
                    set(
                        (state) => {
                            const node = findNodeById(state.nodes, nodeId)
                            if (!node) return
                            const targetFrame = findNodeById(
                                state.nodes,
                                newParentId
                            ) as FrameNode | null
                            if (!targetFrame || targetFrame.type !== 'frame') return

                            const currentParent = findParentOfNode(state.nodes, nodeId)
                            // Already in this frame
                            if (currentParent?.parent?.id === newParentId) return

                            // Get canvas-absolute positions before mutation
                            const nodeCanvasPos = getNodeCanvasPosition(state.nodes, nodeId)
                            const targetCanvasPos = getNodeCanvasPosition(state.nodes, newParentId)
                            if (!nodeCanvasPos || !targetCanvasPos) return

                            _snap(state)

                            // Deep-serialize before removal (safe with immer)
                            const nodeData = JSON.parse(JSON.stringify(node)) as ScytleNode

                            // Remove from current parent
                            if (currentParent) {
                                const list = currentParent.parent
                                    ? currentParent.parent.children
                                    : state.nodes
                                const idx = list.findIndex(
                                    (n: ScytleNode) => n.id === nodeId
                                )
                                if (idx !== -1) list.splice(idx, 1)
                            }

                            // Set new relative position
                            nodeData.x = nodeCanvasPos.x - targetCanvasPos.x
                            nodeData.y = nodeCanvasPos.y - targetCanvasPos.y

                            targetFrame.children.push(nodeData)
                        },
                        false,
                        'moveNodeToFrame'
                    ),

                moveNodeToTopLevel: (nodeId) =>
                    set(
                        (state) => {
                            const node = findNodeById(state.nodes, nodeId)
                            if (!node) return

                            const currentParent = findParentOfNode(state.nodes, nodeId)
                            if (!currentParent?.parent) return // Already top-level

                            // Get canvas-absolute position before mutation
                            const canvasPos = getNodeCanvasPosition(state.nodes, nodeId)
                            if (!canvasPos) return

                            _snap(state)

                            // Deep-serialize before removal (safe with immer)
                            const nodeData = JSON.parse(JSON.stringify(node)) as ScytleNode

                            // Remove from current parent
                            const list = currentParent.parent.children
                            const idx = list.findIndex(
                                (n: ScytleNode) => n.id === nodeId
                            )
                            if (idx !== -1) list.splice(idx, 1)

                            // Set absolute position
                            nodeData.x = canvasPos.x
                            nodeData.y = canvasPos.y

                            state.nodes.push(nodeData)
                        },
                        false,
                        'moveNodeToTopLevel'
                    ),
            })),
            {
                name: 'scytle-editor-state',
                partialize: (state) => ({
                    nodes: state.nodes,
                    canvasColor: state.canvasColor,
                    zoom: state.zoom,
                    panX: state.panX,
                    panY: state.panY,
                }),
            }
        ),
        { name: 'editor-store' }
    )
)
