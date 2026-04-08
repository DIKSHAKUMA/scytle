import { useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { createVector } from '@/types/canvas'
import type { VectorVertex, VectorSegment } from '@/types/canvas'

/** Constrain a point to the nearest 45° angle relative to an origin */
function constrainTo45(origin: { x: number; y: number }, point: { x: number; y: number }): { x: number; y: number } {
    const dx = point.x - origin.x
    const dy = point.y - origin.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    if (dist === 0) return point
    const angle = Math.atan2(dy, dx)
    const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4)
    return {
        x: origin.x + dist * Math.cos(snapped),
        y: origin.y + dist * Math.sin(snapped),
    }
}

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
    /** Tracks the nodeId of the last committed (closed) path — so Enter/Esc can select it */
    const lastCommittedNodeIdRef = useRef<string | null>(null)

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

            // ── Alt+click: retract outgoing handle ──
            if (e.altKey && ps && ps._outgoingTangent) {
                store.setPenDrawingState({
                    ...ps,
                    _outgoingTangent: undefined,
                })
                e.preventDefault()
                return
            }

            // ── Shift: constrain to 45° relative to last vertex ──
            let constrainedPos = pos
            if (e.shiftKey && ps && ps.vertices.length > 0) {
                const lastV = ps.vertices[ps.vertices.length - 1]
                constrainedPos = constrainTo45(lastV, pos)
            }

            if (!ps) {
                // ── First click — create a VectorNode and start drawing ──
                const vectorNode = createVector({ x: 0, y: 0 })
                store.addNode(vectorNode)
                // Don't select the node while drawing — it has zero size and
                // selecting it would show a stray selection box on the canvas.
                // Selection happens after commitPenPath().

                const vertex: VectorVertex = { x: constrainedPos.x, y: constrainedPos.y }
                store.setPenDrawingState({
                    nodeId: vectorNode.id,
                    vertices: [vertex],
                    segments: [],
                    isDrawing: true,
                    cursorX: constrainedPos.x,
                    cursorY: constrainedPos.y,
                    nearStartPoint: false,
                })

                dragRef.current = {
                    anchorPos: constrainedPos,
                    isFirstVertex: true,
                    vertexIndex: 0,
                    isDragging: false,
                }
            } else {
                // ── Close path when near start vertex ──
                if (ps.nearStartPoint && ps.vertices.length >= 3) {
                    const nodeId = ps.nodeId // capture before commit nulls state
                    const lastIdx = ps.vertices.length - 1
                    const closingSegment: VectorSegment = {
                        start: lastIdx,
                        end: 0,
                        ...(ps._outgoingTangent ? { tangentStart: ps._outgoingTangent } : {}),
                        ...(ps._firstVertexIncomingTangent ? { tangentEnd: ps._firstVertexIncomingTangent } : {}),
                    }
                    store.setPenDrawingState({
                        ...ps,
                        segments: [...ps.segments, closingSegment],
                        nearStartPoint: true,
                    })
                    store.commitPenPath()
                    // Remember the committed node so Enter/Esc can show the selection frame
                    lastCommittedNodeIdRef.current = nodeId
                    dragRef.current = null
                    return
                }

                // ── Normal click — append vertex + connecting segment ──
                const newIdx = ps.vertices.length
                const newVertex: VectorVertex = { x: constrainedPos.x, y: constrainedPos.y }
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
                    cursorX: constrainedPos.x,
                    cursorY: constrainedPos.y,
                    nearStartPoint: false,
                    _outgoingTangent: undefined, // consumed
                })

                dragRef.current = {
                    anchorPos: constrainedPos,
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
        (clientX: number, clientY: number, shiftKey?: boolean, altKey?: boolean) => {
            const store = useEditorStore.getState()
            const ps = store.penDrawingState
            if (!ps) return

            const pos = screenToCanvas(clientX, clientY)
            const drag = dragRef.current

            if (drag) {
                // ── Dragging — compute tangent handles in real-time ──
                const dx = pos.x - drag.anchorPos.x
                const dy = pos.y - drag.anchorPos.y
                const dist = Math.sqrt(dx * dx + dy * dy)

                if (dist > DRAG_THRESHOLD_PX / store.zoom) {
                    drag.isDragging = true

                    // Tangent = offset from anchor vertex to cursor
                    const tangent = {
                        x: pos.x - drag.anchorPos.x,
                        y: pos.y - drag.anchorPos.y,
                    }

                    // Shift: constrain tangent angle to 45° increments
                    let constrainedTangent = tangent
                    if (shiftKey) {
                        const tDist = Math.sqrt(tangent.x * tangent.x + tangent.y * tangent.y)
                        const tAngle = Math.atan2(tangent.y, tangent.x)
                        const snapped = Math.round(tAngle / (Math.PI / 4)) * (Math.PI / 4)
                        constrainedTangent = {
                            x: tDist * Math.cos(snapped),
                            y: tDist * Math.sin(snapped),
                        }
                    }

                    // Update the vertex's mirroring
                    const updatedVertices = [...ps.vertices]

                    // Update the segment that ARRIVES at this vertex (tangentEnd)
                    // The tangent we set is the "outgoing" handle — the mirrored handle
                    // will be the "incoming" tangentEnd on the preceding segment.
                    const updatedSegments = [...ps.segments]

                    if (altKey) {
                        // Alt: break mirroring — only outgoing handle moves
                        updatedVertices[drag.vertexIndex] = {
                            ...updatedVertices[drag.vertexIndex],
                            handleMirroring: 'NONE',
                        }
                        // Don't update the incoming tangentEnd on preceding segment
                    } else {
                        updatedVertices[drag.vertexIndex] = {
                            ...updatedVertices[drag.vertexIndex],
                            handleMirroring: 'ANGLE_AND_LENGTH',
                        }
                        // Set mirrored tangentEnd on preceding segment (existing logic)
                        if (!drag.isFirstVertex && updatedSegments.length > 0) {
                            const prevSegIdx = updatedSegments.length - 1
                            updatedSegments[prevSegIdx] = {
                                ...updatedSegments[prevSegIdx],
                                tangentEnd: { x: -constrainedTangent.x, y: -constrainedTangent.y },
                            }
                        }
                    }

                    // For first vertex, store the mirrored handle for later use when closing
                    const firstVertexUpdate = drag.isFirstVertex
                        ? { _firstVertexIncomingTangent: { x: -constrainedTangent.x, y: -constrainedTangent.y } }
                        : {}

                    store.setPenDrawingState({
                        ...ps,
                        vertices: updatedVertices,
                        segments: updatedSegments,
                        cursorX: pos.x,
                        cursorY: pos.y,
                        // Store the outgoing tangent on the drawing state so the
                        // next segment can use it as tangentStart
                        _outgoingTangent: constrainedTangent,
                        ...firstVertexUpdate,
                    } as typeof ps)
                    return
                }
            }

            // ── Normal move (no drag) — update cursor + close detection ──
            const startV = ps.vertices[0]
            const sdx = pos.x - startV.x
            const sdy = pos.y - startV.y
            const distCanvas = Math.sqrt(sdx * sdx + sdy * sdy)
            const nearStart = ps.vertices.length >= 3 && distCanvas < CLOSE_THRESHOLD_PX / store.zoom

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

    /**
     * Keyboard handler for pen tool.
     * - Escape/Enter: end drawing and commit open path (or clean up if < 2 vertices)
     *   Also handles the case where path was already closed via click (ps is null but
     *   lastCommittedNodeIdRef holds the nodeId) — Enter/Esc should switch to select.
     * - Backspace/Delete: remove the last placed vertex
     */
    const handlePenKeyDown = useCallback((e: KeyboardEvent) => {
        const store = useEditorStore.getState()
        const ps = store.penDrawingState

        // ── Path already committed via click-to-close (ps is null) ──
        // Enter or Escape while pen is still active should show selection frame
        if (!ps) {
            const committedId = lastCommittedNodeIdRef.current
            if (committedId && (e.key === 'Enter' || e.key === 'Escape')) {
                e.preventDefault()
                e.stopPropagation()
                store.setActiveTool('select')
                useEditorStore.setState({ selectedIds: [committedId] })
                lastCommittedNodeIdRef.current = null
            }
            return
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            e.stopPropagation()
            let committedNodeId: string | null = null
            if (ps.vertices.length >= 2) {
                committedNodeId = ps.nodeId
                store.commitPenPath()
            } else {
                store.deleteNode(ps.nodeId)
                store.setPenDrawingState(null)
            }
            // Switch to select and show selection frame
            store.setActiveTool('select')
            if (committedNodeId) {
                useEditorStore.setState({ selectedIds: [committedNodeId] })
            }
            dragRef.current = null
        }

        if (e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            const nodeId = ps.nodeId
            if (ps.vertices.length >= 2) {
                store.commitPenPath()
            } else {
                store.deleteNode(nodeId)
                store.setPenDrawingState(null)
            }
            // Enter: switch to select tool and show selection frame
            store.setActiveTool('select')
            useEditorStore.setState({ selectedIds: [nodeId] })
            lastCommittedNodeIdRef.current = null
            dragRef.current = null
        }

        if (e.key === 'Backspace' || e.key === 'Delete') {
            e.preventDefault()
            e.stopPropagation()
            if (ps.vertices.length <= 1) {
                // Remove the whole path
                store.deleteNode(ps.nodeId)
                store.setPenDrawingState(null)
                dragRef.current = null
            } else {
                // Remove last vertex and its segment
                const newVertices = ps.vertices.slice(0, -1)
                const newSegments = ps.segments.slice(0, -1)
                store.setPenDrawingState({
                    ...ps,
                    vertices: newVertices,
                    segments: newSegments,
                    _outgoingTangent: undefined,
                })
            }
        }
    }, [])

    return { handlePenPointerDown, handlePenPointerMove, handlePenPointerUp, handlePenKeyDown }
}
