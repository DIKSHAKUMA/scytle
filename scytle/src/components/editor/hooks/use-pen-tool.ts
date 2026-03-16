import { useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { createVector } from '@/types/canvas'
import type { VectorVertex, VectorSegment } from '@/types/canvas'

/** Screen-space distance (px) within which cursor "snaps" to close the path */
const CLOSE_THRESHOLD_PX = 8

/** Minimum drag distance (px) to trigger bezier handle creation */
const DRAG_THRESHOLD_PX = 3

/** State tracked between pointerdown and pointerup during a single click-drag */
interface DragState {
    /** Canvas position where the pointerdown occurred */
    anchorPos: { x: number; y: number }
    /** Whether this pointerdown started a brand-new drawing (first vertex) */
    isFirstVertex: boolean
    /** Index of the vertex placed at pointerdown */
    vertexIndex: number
    /** Whether drag threshold has been exceeded (bezier mode) */
    isDragging: boolean
}

/**
 * Hook that encapsulates Pen tool pointer interactions.
 *
 * Supports:
 *  - Click to place straight-line anchor points
 *  - Click+drag to create bezier curve handles (tangentStart/tangentEnd)
 *  - Click near start vertex (≥3 vertices) to close the path
 *
 * Usage in canvas.tsx:
 *   const { handlePenPointerDown, handlePenPointerMove, handlePenPointerUp } = usePenTool(screenToCanvas)
 *
 *   // in handlePointerDown: if (activeTool === 'pen') { handlePenPointerDown(e); return }
 *   // in handlePointerMove: if (activeTool === 'pen') handlePenPointerMove(e.clientX, e.clientY)
 *   // in handlePointerUp:   if (activeTool === 'pen') handlePenPointerUp()
 */
export function usePenTool(
    screenToCanvas: (clientX: number, clientY: number) => { x: number; y: number },
) {
    const dragRef = useRef<DragState | null>(null)

    /**
     * Left-click on canvas while pen tool is active.
     * First click: creates a VectorNode + initializes drawing state.
     * Subsequent clicks: appends a vertex + segment.
     * Click near start vertex (with >= 3 vertices): closes the path.
     *
     * The actual tangent handle computation happens in pointerup (after drag).
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

                dragRef.current = {
                    anchorPos: pos,
                    isFirstVertex: true,
                    vertexIndex: 0,
                    isDragging: false,
                }
            } else {
                // ── Close path when near start vertex ──
                if (ps.nearStartPoint && ps.vertices.length >= 3) {
                    const lastIdx = ps.vertices.length - 1
                    const closingSegment: VectorSegment = {
                        start: lastIdx,
                        end: 0,
                        ...(ps._outgoingTangent ? { tangentStart: ps._outgoingTangent } : {}),
                    }
                    store.setPenDrawingState({
                        ...ps,
                        segments: [...ps.segments, closingSegment],
                        nearStartPoint: true,
                    })
                    store.commitPenPath()
                    dragRef.current = null
                    return
                }

                // ── Normal click — append vertex + connecting segment ──
                const newIdx = ps.vertices.length
                const newVertex: VectorVertex = { x: pos.x, y: pos.y }
                const newSegment: VectorSegment = {
                    start: newIdx - 1,
                    end: newIdx,
                    // Carry forward outgoing tangent from previous vertex's drag
                    ...(ps._outgoingTangent ? { tangentStart: ps._outgoingTangent } : {}),
                }

                store.setPenDrawingState({
                    ...ps,
                    vertices: [...ps.vertices, newVertex],
                    segments: [...ps.segments, newSegment],
                    cursorX: pos.x,
                    cursorY: pos.y,
                    nearStartPoint: false,
                    _outgoingTangent: undefined, // consumed
                })

                dragRef.current = {
                    anchorPos: pos,
                    isFirstVertex: false,
                    vertexIndex: newIdx,
                    isDragging: false,
                }
            }

            e.preventDefault()
        },
        [screenToCanvas],
    )

    /**
     * Pointer move while pen tool is active.
     *
     * When dragging (pointerdown held): computes bezier tangent handles.
     * When not dragging: updates cursor position and nearStartPoint.
     */
    const handlePenPointerMove = useCallback(
        (clientX: number, clientY: number) => {
            const store = useEditorStore.getState()
            const ps = store.penDrawingState
            if (!ps) return

            const pos = screenToCanvas(clientX, clientY)
            const drag = dragRef.current

            if (drag) {
                // ── Dragging — compute tangent handles in real-time ──
                const dx = (pos.x - drag.anchorPos.x) * store.zoom
                const dy = (pos.y - drag.anchorPos.y) * store.zoom
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist > DRAG_THRESHOLD_PX) {
                    drag.isDragging = true

                    // Tangent = offset from anchor vertex to cursor
                    const tangent = {
                        x: pos.x - drag.anchorPos.x,
                        y: pos.y - drag.anchorPos.y,
                    }

                    // Update the vertex's mirroring to symmetric
                    const updatedVertices = [...ps.vertices]
                    updatedVertices[drag.vertexIndex] = {
                        ...updatedVertices[drag.vertexIndex],
                        handleMirroring: 'ANGLE_AND_LENGTH',
                    }

                    // Update the segment that ARRIVES at this vertex (tangentEnd)
                    // The tangent we set is the "outgoing" handle — the mirrored handle
                    // will be the "incoming" tangentEnd on the preceding segment.
                    const updatedSegments = [...ps.segments]

                    // If this vertex has a preceding segment (not the first vertex),
                    // set tangentEnd on that segment to the mirrored tangent
                    if (!drag.isFirstVertex && updatedSegments.length > 0) {
                        const prevSegIdx = updatedSegments.length - 1
                        updatedSegments[prevSegIdx] = {
                            ...updatedSegments[prevSegIdx],
                            tangentEnd: { x: -tangent.x, y: -tangent.y },
                        }
                    }

                    store.setPenDrawingState({
                        ...ps,
                        vertices: updatedVertices,
                        segments: updatedSegments,
                        cursorX: pos.x,
                        cursorY: pos.y,
                        // Store the outgoing tangent on the drawing state so the
                        // next segment can use it as tangentStart
                        _outgoingTangent: tangent,
                    } as typeof ps)
                    return
                }
            }

            // ── Normal move (no drag) — update cursor + close detection ──
            const startV = ps.vertices[0]
            const sdx = (pos.x - startV.x) * store.zoom
            const sdy = (pos.y - startV.y) * store.zoom
            const distScreen = Math.sqrt(sdx * sdx + sdy * sdy)
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

    /**
     * Pointer up — finalizes the drag gesture.
     *
     * If the user dragged past the threshold, the tangent handles are already
     * set via handlePenPointerMove. We record the outgoing tangent so the
     * NEXT segment placed will use it as its tangentStart.
     */
    const handlePenPointerUp = useCallback(() => {
        const drag = dragRef.current
        if (!drag) return

        if (drag.isDragging) {
            // The outgoing tangent was stored during pointermove.
            // It will be picked up when the next segment is created.
            // Nothing else to do — state is already up-to-date.
        }

        dragRef.current = null
    }, [])

    return { handlePenPointerDown, handlePenPointerMove, handlePenPointerUp }
}
