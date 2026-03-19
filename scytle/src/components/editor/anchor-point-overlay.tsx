'use client'

import { memo, useCallback, useRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import type { VectorEditTool } from '@/store/editor-store'
import { findNodeById } from '@/types/canvas'
import type { VectorNode, VectorVertex, VectorSegment } from '@/types/canvas'

const ANCHOR_SIZE = 7
const HANDLE_R = 4
const BLUE = '#3b82f6'
const WHITE = '#ffffff'
const SEGMENT_HIT_WIDTH = 12 // px — invisible fat stroke for click target

/** State tracked during a vertex/handle drag */
interface DragInfo {
    type: 'vertex' | 'tangent-start' | 'tangent-end'
    /** Index of the vertex or segment being dragged */
    index: number
    /** Canvas-space position at drag start */
    startCanvasX: number
    startCanvasY: number
    /** Original position of the item being dragged */
    origX: number
    origY: number
}

/**
 * AnchorPointOverlay — renders interactive anchor points, bezier handles,
 * and segment hit targets for vector edit mode.
 *
 * Supports:
 *  - **Move tool**: drag vertices to reposition, drag handles to reshape curves
 *  - **Bend tool**: click straight segment → add bezier handles; click smooth→corner toggle
 *  - **Cut tool**: click vertex → split path at that point
 *  - All tools: click vertex to select (Shift to add)
 */
export const AnchorPointOverlay = memo(function AnchorPointOverlay() {
    const vectorEditNodeId = useEditorStore((s) => s.vectorEditNodeId)
    const vectorEditTool = useEditorStore((s) => s.vectorEditTool)
    const selectedVertexIndices = useEditorStore((s) => s.selectedVertexIndices)
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)
    const nodes = useEditorStore((s) => s.nodes)

    const dragRef = useRef<DragInfo | null>(null)

    // ── Helpers ──────────────────────────────────────────────

    const screenToCanvas = useCallback(
        (clientX: number, clientY: number) => ({
            x: (clientX - panX) / zoom,
            y: (clientY - panY) / zoom,
        }),
        [zoom, panX, panY],
    )

    // ── Move tool: vertex drag ──────────────────────────────

    const handleVertexPointerDown = useCallback(
        (e: React.PointerEvent, idx: number) => {
            e.stopPropagation()
            e.preventDefault()
            const store = useEditorStore.getState()
            const tool = store.vectorEditTool

            // Cut tool: split path at vertex
            if (tool === 'cut' && store.vectorEditNodeId) {
                handleCutVertex(store.vectorEditNodeId, idx)
                return
            }

            // Ctrl+click (or Cmd+click on Mac): toggle corner/smooth point
            // This converts the vertex between sharp corner (NONE) and smooth (ANGLE_AND_LENGTH)
            if ((e.ctrlKey || e.metaKey) && store.vectorEditNodeId) {
                const node = findNodeById(store.nodes, store.vectorEditNodeId) as VectorNode | null
                if (!node) return
                const vertex = node.vectorNetwork.vertices[idx]
                if (!vertex) return

                // Toggle between NONE (corner) and ANGLE_AND_LENGTH (smooth)
                const currentMirroring = vertex.handleMirroring ?? 'NONE'
                const newMirroring = currentMirroring === 'NONE' ? 'ANGLE_AND_LENGTH' : 'NONE'

                // If converting to corner (NONE), also clear tangent handles on connected segments
                if (newMirroring === 'NONE') {
                    const net = node.vectorNetwork
                    const updatedSegments = net.segments.map((seg, si) => {
                        if (seg.start === idx) {
                            return { ...seg, tangentStart: { x: 0, y: 0 } }
                        }
                        if (seg.end === idx) {
                            return { ...seg, tangentEnd: { x: 0, y: 0 } }
                        }
                        return seg
                    })
                    store.updateVectorNetwork(store.vectorEditNodeId, {
                        ...net,
                        vertices: net.vertices.map((v, vi) =>
                            vi === idx ? { ...v, handleMirroring: newMirroring } : v
                        ),
                        segments: updatedSegments,
                    })
                } else {
                    store.updateVertex(store.vectorEditNodeId, idx, { handleMirroring: newMirroring })
                }
                return
            }

            // Select the vertex
            // Figma spec: normal click = replace selection, Shift+click = additive
            const additive = e.shiftKey
            store.selectVertices([idx], additive)

            // Move tool: begin drag
            if (tool === 'move' && store.vectorEditNodeId) {
                const node = findNodeById(store.nodes, store.vectorEditNodeId) as VectorNode | null
                if (!node) return
                const v = node.vectorNetwork.vertices[idx]
                if (!v) return

                const canvas = screenToCanvas(e.clientX, e.clientY)
                dragRef.current = {
                    type: 'vertex',
                    index: idx,
                    startCanvasX: canvas.x,
                    startCanvasY: canvas.y,
                    origX: v.x,
                    origY: v.y,
                }

                store.beginBatch()

                const onMove = (me: PointerEvent) => {
                    const drag = dragRef.current
                    if (!drag || drag.type !== 'vertex') return
                    const pos = screenToCanvas(me.clientX, me.clientY)
                    const dx = pos.x - drag.startCanvasX
                    const dy = pos.y - drag.startCanvasY
                    // Move all selected vertices by the same delta
                    const st = useEditorStore.getState()
                    const nodeId = st.vectorEditNodeId
                    if (!nodeId) return
                    const n = findNodeById(st.nodes, nodeId) as VectorNode | null
                    if (!n) return
                    for (const vi of st.selectedVertexIndices) {
                        const orig = n.vectorNetwork.vertices[vi]
                        if (!orig) continue
                        // For the dragged vertex we use the stored original;
                        // for others we compute relative delta each frame
                        if (vi === drag.index) {
                            st.updateVertex(nodeId, vi, { x: drag.origX + dx, y: drag.origY + dy })
                        } else {
                            st.updateVertex(nodeId, vi, { x: orig.x + dx, y: orig.y + dy })
                        }
                    }
                }

                const onUp = () => {
                    dragRef.current = null
                    useEditorStore.getState().endBatch()
                    window.removeEventListener('pointermove', onMove)
                    window.removeEventListener('pointerup', onUp)
                }

                window.addEventListener('pointermove', onMove)
                window.addEventListener('pointerup', onUp)
            }
        },
        [screenToCanvas],
    )

    // ── Move tool: bezier handle drag ───────────────────────

    const handleHandlePointerDown = useCallback(
        (e: React.PointerEvent, segIdx: number, which: 'tangent-start' | 'tangent-end') => {
            e.stopPropagation()
            e.preventDefault()
            const store = useEditorStore.getState()
            if (store.vectorEditTool !== 'move' || !store.vectorEditNodeId) return

            const node = findNodeById(store.nodes, store.vectorEditNodeId) as VectorNode | null
            if (!node) return
            const seg = node.vectorNetwork.segments[segIdx]
            if (!seg) return

            const tangent = which === 'tangent-start' ? seg.tangentStart : seg.tangentEnd
            if (!tangent) return

            const vertIdx = which === 'tangent-start' ? seg.start : seg.end
            const vert = node.vectorNetwork.vertices[vertIdx]
            if (!vert) return

            const canvas = screenToCanvas(e.clientX, e.clientY)
            dragRef.current = {
                type: which,
                index: segIdx,
                startCanvasX: canvas.x,
                startCanvasY: canvas.y,
                origX: tangent.x,
                origY: tangent.y,
            }

            store.beginBatch()

            const onMove = (me: PointerEvent) => {
                const drag = dragRef.current
                if (!drag) return
                const pos = screenToCanvas(me.clientX, me.clientY)
                const st = useEditorStore.getState()
                const nodeId = st.vectorEditNodeId
                if (!nodeId) return

                const n = findNodeById(st.nodes, nodeId) as VectorNode | null
                if (!n) return
                const s = n.vectorNetwork.segments[segIdx]
                if (!s) return

                const vIdx = which === 'tangent-start' ? s.start : s.end
                const v = n.vectorNetwork.vertices[vIdx]
                if (!v) return

                // New tangent = cursor position minus vertex position (tangents are offsets)
                const newTangent = { x: pos.x - (n.x + v.x), y: pos.y - (n.y + v.y) }

                const updatedSegs = [...n.vectorNetwork.segments]
                updatedSegs[segIdx] = {
                    ...updatedSegs[segIdx],
                    [which === 'tangent-start' ? 'tangentStart' : 'tangentEnd']: newTangent,
                }
                st.updateVectorNetwork(nodeId, {
                    ...n.vectorNetwork,
                    segments: updatedSegs,
                })
            }

            const onUp = () => {
                dragRef.current = null
                useEditorStore.getState().endBatch()
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onUp)
            }

            window.addEventListener('pointermove', onMove)
            window.addEventListener('pointerup', onUp)
        },
        [screenToCanvas],
    )

    // ── Bend segment: click or double-click → toggle curve ───
    // Works in bend tool mode OR with double-click from any tool

    const handleSegmentClick = useCallback(
        (e: React.MouseEvent, segIdx: number) => {
            e.stopPropagation()
            const store = useEditorStore.getState()

            // Only bend tool can single-click toggle
            if (store.vectorEditTool !== 'bend' || !store.vectorEditNodeId) return

            toggleSegmentCurve(store.vectorEditNodeId, segIdx)
        },
        [],
    )

    const handleSegmentDoubleClick = useCallback(
        (e: React.MouseEvent, segIdx: number) => {
            e.stopPropagation()
            const store = useEditorStore.getState()
            if (!store.vectorEditNodeId) return

            // Double-click toggles curve from any tool
            toggleSegmentCurve(store.vectorEditNodeId, segIdx)
        },
        [],
    )

    /** Shared logic to toggle a segment between straight and curved */
    const toggleSegmentCurve = useCallback(
        (nodeId: string, segIdx: number) => {
            const store = useEditorStore.getState()
            const node = findNodeById(store.nodes, nodeId) as VectorNode | null
            if (!node) return
            const net = node.vectorNetwork
            const seg = net.segments[segIdx]
            if (!seg) return

            const ts = seg.tangentStart ?? { x: 0, y: 0 }
            const te = seg.tangentEnd ?? { x: 0, y: 0 }
            const isCurved = ts.x !== 0 || ts.y !== 0 || te.x !== 0 || te.y !== 0

            const updatedSegs = [...net.segments]

            if (isCurved) {
                // Remove curve → make straight
                updatedSegs[segIdx] = { ...seg, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }
            } else {
                // Add default curve handles (1/3 of segment length perpendicular)
                const v0 = net.vertices[seg.start]
                const v1 = net.vertices[seg.end]
                const dx = v1.x - v0.x
                const dy = v1.y - v0.y
                const len = Math.sqrt(dx * dx + dy * dy) || 1
                // Perpendicular offset scaled to 1/4 segment length
                const off = len * 0.25
                const nx = -dy / len * off
                const ny = dx / len * off
                updatedSegs[segIdx] = {
                    ...seg,
                    tangentStart: { x: dx / 3 + nx, y: dy / 3 + ny },
                    tangentEnd: { x: -dx / 3 + nx, y: -dy / 3 + ny },
                }
            }

            store.updateVectorNetwork(nodeId, { ...net, segments: updatedSegs })
        },
        [],
    )

    // ── Cut tool: click vertex → split path ─────────────────

    const handleCutVertex = useCallback(
        (nodeId: string, vertIdx: number) => {
            const store = useEditorStore.getState()
            const node = findNodeById(store.nodes, nodeId) as VectorNode | null
            if (!node) return
            const net = node.vectorNetwork

            // Find segments connected to this vertex
            const connectedSegs = net.segments.filter(
                (s) => s.start === vertIdx || s.end === vertIdx
            )
            if (connectedSegs.length < 2) return // Can't split endpoint

            // Remove one segment connected to this vertex (splits the path)
            const segToRemove = connectedSegs[connectedSegs.length - 1]
            const newSegments = net.segments.filter((s) => s !== segToRemove)

            // Remove regions that referenced the removed segment
            const removedIdx = net.segments.indexOf(segToRemove)
            const newRegions = net.regions.filter(
                (r) => !r.loops.some((loop) => loop.includes(removedIdx))
            )

            store.updateVectorNetwork(nodeId, {
                ...net,
                segments: newSegments,
                regions: newRegions,
            })
        },
        [],
    )

    // ── Render ───────────────────────────────────────────────

    if (!vectorEditNodeId) return null

    const node = findNodeById(nodes, vectorEditNodeId)
    if (!node || node.type !== 'vector') return null

    const vn = (node as VectorNode).vectorNetwork
    const nodeX = node.x
    const nodeY = node.y

    const toScreen = (vx: number, vy: number) => ({
        x: (nodeX + vx) * zoom + panX,
        y: (nodeY + vy) * zoom + panY,
    })

    const selectedSet = new Set(selectedVertexIndices)

    // Cursor based on active tool
    const toolCursors: Record<VectorEditTool, string> = {
        'move': 'default',
        'lasso': 'crosshair',
        'shape-builder': 'crosshair',
        'paint': 'crosshair',
        'bend': 'pointer',
        'cut': 'crosshair',
        'variable-width': 'crosshair',
    }
    const toolCursor = toolCursors[vectorEditTool] || 'default'

    return (
        <>
            {/* Decorative SVG layer — non-interactive */}
            <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 31 }}
            >
                {/* Segment lines (thin blue for visibility) */}
                {vn.segments.map((seg: VectorSegment, si: number) => {
                    const startV = vn.vertices[seg.start]
                    const endV = vn.vertices[seg.end]
                    if (!startV || !endV) return null

                    const a = toScreen(startV.x, startV.y)
                    const b = toScreen(endV.x, endV.y)

                    const ts = seg.tangentStart
                    const te = seg.tangentEnd
                    const hasCurve =
                        (ts && (ts.x !== 0 || ts.y !== 0)) ||
                        (te && (te.x !== 0 || te.y !== 0))

                    if (hasCurve) {
                        const cp1 = ts ? toScreen(startV.x + ts.x, startV.y + ts.y) : a
                        const cp2 = te ? toScreen(endV.x + te.x, endV.y + te.y) : b
                        return (
                            <path
                                key={`seg-curve-${si}`}
                                d={`M ${a.x} ${a.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${b.x} ${b.y}`}
                                fill="none"
                                stroke={BLUE}
                                strokeWidth={1}
                                opacity={0.4}
                            />
                        )
                    }

                    return (
                        <line
                            key={`seg-line-${si}`}
                            x1={a.x} y1={a.y}
                            x2={b.x} y2={b.y}
                            stroke={BLUE}
                            strokeWidth={1}
                            opacity={0.4}
                        />
                    )
                })}

                {/* Bezier tangent handle lines */}
                {vn.segments.map((seg: VectorSegment, si: number) => {
                    const startV = vn.vertices[seg.start]
                    const endV = vn.vertices[seg.end]
                    if (!startV || !endV) return null

                    const elements: React.ReactNode[] = []

                    const ts = seg.tangentStart
                    if (ts && (ts.x !== 0 || ts.y !== 0)) {
                        const anchor = toScreen(startV.x, startV.y)
                        const cp = toScreen(startV.x + ts.x, startV.y + ts.y)
                        elements.push(
                            <line
                                key={`ts-line-${si}`}
                                x1={anchor.x} y1={anchor.y}
                                x2={cp.x} y2={cp.y}
                                stroke={BLUE} strokeWidth={1} opacity={0.6}
                            />,
                        )
                    }

                    const te = seg.tangentEnd
                    if (te && (te.x !== 0 || te.y !== 0)) {
                        const anchor = toScreen(endV.x, endV.y)
                        const cp = toScreen(endV.x + te.x, endV.y + te.y)
                        elements.push(
                            <line
                                key={`te-line-${si}`}
                                x1={anchor.x} y1={anchor.y}
                                x2={cp.x} y2={cp.y}
                                stroke={BLUE} strokeWidth={1} opacity={0.6}
                            />,
                        )
                    }

                    return elements.length > 0 ? <g key={`seg-handle-lines-${si}`}>{elements}</g> : null
                })}
            </svg>

            {/* Interactive SVG layer — handles clicks */}
            <svg
                className="absolute inset-0"
                style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 32 }}
            >
                {/* All clickable elements in a group with pointer-events: all */}
                <g style={{ pointerEvents: 'all' }}>
                    {/* Invisible fat segment hit targets — for bend tool clicks AND double-click from any tool */}
                    {vn.segments.map((seg: VectorSegment, si: number) => {
                        const startV = vn.vertices[seg.start]
                        const endV = vn.vertices[seg.end]
                        if (!startV || !endV) return null

                        const a = toScreen(startV.x, startV.y)
                        const b = toScreen(endV.x, endV.y)

                        const ts = seg.tangentStart
                        const te = seg.tangentEnd
                        const hasCurve =
                            (ts && (ts.x !== 0 || ts.y !== 0)) ||
                            (te && (te.x !== 0 || te.y !== 0))

                        // Show pointer cursor in bend mode, default otherwise
                        const cursor = vectorEditTool === 'bend' ? 'pointer' : 'default'

                        if (hasCurve) {
                            const cp1 = ts ? toScreen(startV.x + ts.x, startV.y + ts.y) : a
                            const cp2 = te ? toScreen(endV.x + te.x, endV.y + te.y) : b
                            return (
                                <path
                                    key={`seg-hit-${si}`}
                                    d={`M ${a.x} ${a.y} C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${b.x} ${b.y}`}
                                    fill="none"
                                    stroke="transparent"
                                    strokeWidth={SEGMENT_HIT_WIDTH}
                                    style={{ cursor }}
                                    onClick={(e) => handleSegmentClick(e, si)}
                                    onDoubleClick={(e) => handleSegmentDoubleClick(e, si)}
                                />
                            )
                        }

                        return (
                            <line
                                key={`seg-hit-${si}`}
                                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                                stroke="transparent"
                                strokeWidth={SEGMENT_HIT_WIDTH}
                                style={{ cursor }}
                                onClick={(e) => handleSegmentClick(e, si)}
                                onDoubleClick={(e) => handleSegmentDoubleClick(e, si)}
                            />
                        )
                    })}

                    {/* Bezier tangent handle circles */}
                    {vn.segments.map((seg: VectorSegment, si: number) => {
                        const startV = vn.vertices[seg.start]
                        const endV = vn.vertices[seg.end]
                        if (!startV || !endV) return null

                        const elements: React.ReactNode[] = []

                        const ts = seg.tangentStart
                        if (ts && (ts.x !== 0 || ts.y !== 0)) {
                            const cp = toScreen(startV.x + ts.x, startV.y + ts.y)
                            elements.push(
                                <circle
                                    key={`ts-cp-${si}`}
                                    cx={cp.x} cy={cp.y} r={HANDLE_R}
                                    fill={WHITE} stroke={BLUE} strokeWidth={1}
                                    style={{ cursor: toolCursor }}
                                    onPointerDown={(e) => handleHandlePointerDown(e, si, 'tangent-start')}
                                />,
                            )
                        }

                        const te = seg.tangentEnd
                        if (te && (te.x !== 0 || te.y !== 0)) {
                            const cp = toScreen(endV.x + te.x, endV.y + te.y)
                            elements.push(
                                <circle
                                    key={`te-cp-${si}`}
                                    cx={cp.x} cy={cp.y} r={HANDLE_R}
                                    fill={WHITE} stroke={BLUE} strokeWidth={1}
                                    style={{ cursor: toolCursor }}
                                    onPointerDown={(e) => handleHandlePointerDown(e, si, 'tangent-end')}
                                />,
                            )
                        }

                        return elements.length > 0 ? <g key={`seg-handles-${si}`}>{elements}</g> : null
                    })}

                    {/* Anchor points (vertices) — circles like Figma */}
                    {vn.vertices.map((v: VectorVertex, vi: number) => {
                        const pos = toScreen(v.x, v.y)
                        const isSelected = selectedSet.has(vi)

                        return (
                            <circle
                                key={`anchor-${vi}`}
                                cx={pos.x}
                                cy={pos.y}
                                r={ANCHOR_SIZE / 2}
                                fill={isSelected ? BLUE : WHITE}
                                stroke={BLUE}
                                strokeWidth={1.5}
                                style={{ cursor: vectorEditTool === 'cut' ? 'crosshair' : 'move' }}
                                onPointerDown={(e) => handleVertexPointerDown(e, vi)}
                            />
                        )
                    })}
                </g>
            </svg>
        </>
    )
})
