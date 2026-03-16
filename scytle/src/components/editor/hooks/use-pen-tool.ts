import { useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { createVector } from '@/types/canvas'
import type { VectorVertex, VectorSegment } from '@/types/canvas'

/** Screen-space distance (px) within which cursor "snaps" to close the path */
const CLOSE_THRESHOLD_PX = 8

/**
 * Hook that encapsulates Pen tool pointer interactions.
 *
 * Usage in canvas.tsx:
 *   const { handlePenPointerDown, handlePenPointerMove } = usePenTool(screenToCanvas)
 *
 *   // in handlePointerDown: if (activeTool === 'pen') { handlePenPointerDown(e); return }
 *   // in handlePointerMove: if (activeTool === 'pen') handlePenPointerMove(e.clientX, e.clientY)
 */
export function usePenTool(
    screenToCanvas: (clientX: number, clientY: number) => { x: number; y: number },
) {
    /**
     * Left-click on canvas while pen tool is active.
     * First click: creates a VectorNode + initializes drawing state.
     * Subsequent clicks: appends a vertex + segment.
     * Click near start vertex (with >= 3 vertices): closes the path.
     */
    const handlePenPointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (e.button !== 0) return

            const store = useEditorStore.getState()
            const pos = screenToCanvas(e.clientX, e.clientY)
            const ps = store.penDrawingState

            if (!ps) {
                // ── First click — create a VectorNode and start drawing ──
                const vectorNode = createVector({ x: 0, y: 0 })
                store.addNode(vectorNode)
                store.selectNode(vectorNode.id)

                const vertex: VectorVertex = { x: pos.x, y: pos.y }
                store.setPenDrawingState({
                    nodeId: vectorNode.id,
                    vertices: [vertex],
                    segments: [],
                    isDrawing: true,
                    cursorX: pos.x,
                    cursorY: pos.y,
                    nearStartPoint: false,
                })
            } else {
                // ── Close path when near start vertex ──
                if (ps.nearStartPoint && ps.vertices.length >= 3) {
                    const lastIdx = ps.vertices.length - 1
                    const closingSegment: VectorSegment = { start: lastIdx, end: 0 }
                    store.setPenDrawingState({
                        ...ps,
                        segments: [...ps.segments, closingSegment],
                        nearStartPoint: true,
                    })
                    store.commitPenPath()
                    return
                }

                // ── Normal click — append vertex + connecting segment ──
                const newIdx = ps.vertices.length
                const newVertex: VectorVertex = { x: pos.x, y: pos.y }
                const newSegment: VectorSegment = {
                    start: newIdx - 1,
                    end: newIdx,
                }

                store.setPenDrawingState({
                    ...ps,
                    vertices: [...ps.vertices, newVertex],
                    segments: [...ps.segments, newSegment],
                    cursorX: pos.x,
                    cursorY: pos.y,
                    nearStartPoint: false,
                })
            }

            e.preventDefault()
        },
        [screenToCanvas],
    )

    /**
     * Pointer move while pen tool is active and drawing is in-progress.
     * Updates cursor position and nearStartPoint detection.
     */
    const handlePenPointerMove = useCallback(
        (clientX: number, clientY: number) => {
            const store = useEditorStore.getState()
            const ps = store.penDrawingState
            if (!ps) return

            const pos = screenToCanvas(clientX, clientY)

            // Proximity check: distance in screen pixels to start vertex
            const startV = ps.vertices[0]
            const dx = (pos.x - startV.x) * store.zoom
            const dy = (pos.y - startV.y) * store.zoom
            const distScreen = Math.sqrt(dx * dx + dy * dy)
            const nearStart = ps.vertices.length >= 3 && distScreen < CLOSE_THRESHOLD_PX

            store.setPenDrawingState({
                ...ps,
                cursorX: pos.x,
                cursorY: pos.y,
                nearStartPoint: nearStart,
            })
        },
        [screenToCanvas],
    )

    return { handlePenPointerDown, handlePenPointerMove }
}
