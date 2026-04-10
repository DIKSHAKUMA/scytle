'use client'

import { memo, useCallback, useRef, useState } from 'react'
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
    /** Original positions of all selected vertices at drag start (for multi-vertex drag) */
    origPositions?: Map<number, { x: number; y: number }>
}

/** Point in 2D space */
interface Pt { x: number; y: number }

/** Ray-casting point-in-polygon test */
function pointInPolygon(pt: Pt, poly: Pt[]): boolean {
    let inside = false
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const xi = poly[i].x, yi = poly[i].y
        const xj = poly[j].x, yj = poly[j].y
        const intersect = yi > pt.y !== yj > pt.y &&
            pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi
        if (intersect) inside = !inside
    }
    return inside
}

/**
 * Given a bezier segment, compute ~20 sample points along the curve
 * so we can find the closest point for bend-drag and cut-on-segment.
 */
function sampleBezier(p0: Pt, cp1: Pt, cp2: Pt, p1: Pt, steps = 20): Pt[] {
    const pts: Pt[] = []
    for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const mt = 1 - t
        pts.push({
            x: mt * mt * mt * p0.x + 3 * mt * mt * t * cp1.x + 3 * mt * t * t * cp2.x + t * t * t * p1.x,
            y: mt * mt * mt * p0.y + 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t * p1.y,
        })
    }
    return pts
}

/** Find t parameter on a bezier segment closest to a given screen point */
function closestTOnSegment(
    screenPt: Pt,
    p0: Pt, cp1: Pt, cp2: Pt, p1: Pt,
    steps = 50,
): number {
    let bestT = 0
    let bestDist = Infinity
    for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const mt = 1 - t
        const x = mt * mt * mt * p0.x + 3 * mt * mt * t * cp1.x + 3 * mt * t * t * cp2.x + t * t * t * p1.x
        const y = mt * mt * mt * p0.y + 3 * mt * mt * t * cp1.y + 3 * mt * t * t * cp2.y + t * t * t * p1.y
        const d = (x - screenPt.x) ** 2 + (y - screenPt.y) ** 2
        if (d < bestDist) { bestDist = d; bestT = t }
    }
    return bestT
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
    // Lasso tool state — screen-space polygon being drawn
    const [lassoPoints, setLassoPoints] = useState<Pt[]>([])

    // ── Helpers ──────────────────────────────────────────────

    const screenToCanvas = useCallback(
        (clientX: number, clientY: number) => ({
            x: (clientX - panX) / zoom,
            y: (clientY - panY) / zoom,
        }),
        [zoom, panX, panY],
    )

    // ── Lasso tool: freeform vertex selection ───────────────

    const handleLassoPointerDown = useCallback(
        (e: React.PointerEvent) => {
            e.stopPropagation()
            e.preventDefault()
            const additive = e.shiftKey
            const startPt = { x: e.clientX, y: e.clientY }
            setLassoPoints([startPt])

            const onMove = (me: PointerEvent) => {
                setLassoPoints((prev) => [...prev, { x: me.clientX, y: me.clientY }])
            }

            const onUp = () => {
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onUp)

                setLassoPoints((finalPoly) => {
                    if (finalPoly.length >= 3) {
                        const st = useEditorStore.getState()
                        const nodeId = st.vectorEditNodeId
                        if (nodeId) {
                            const node = findNodeById(st.nodes, nodeId) as VectorNode | null
                            if (node) {
                                const { x: nx, y: ny } = node
                                const z = st.zoom
                                const px = st.panX
                                const py = st.panY
                                // Find which vertex screen positions fall inside the lasso polygon
                                const inside: number[] = []
                                node.vectorNetwork.vertices.forEach((v, vi) => {
                                    const sx = (nx + v.x) * z + px
                                    const sy = (ny + v.y) * z + py
                                    if (pointInPolygon({ x: sx, y: sy }, finalPoly)) {
                                        inside.push(vi)
                                    }
                                })
                                if (inside.length > 0) {
                                    st.selectVertices(inside, additive)
                                } else if (!additive) {
                                    st.deselectVertices()
                                }
                            }
                        }
                    }
                    return []
                })
            }

            window.addEventListener('pointermove', onMove)
            window.addEventListener('pointerup', onUp)
        },
        [],
    )

    // ── Paint tool: click region to toggle fill ─────────────

    const handlePaintClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation()
            const store = useEditorStore.getState()
            const nodeId = store.vectorEditNodeId
            if (!nodeId) return
            const node = findNodeById(store.nodes, nodeId) as VectorNode | null
            if (!node) return

            const vn = node.vectorNetwork
            if (!vn.regions || vn.regions.length === 0) return

            // Convert click to canvas space (relative to node origin)
            const cx = (e.clientX - store.panX) / store.zoom - node.x
            const cy = (e.clientY - store.panY) / store.zoom - node.y

            // Find which region the click falls in by testing the boundary polygon
            let clickedRegionIdx = -1
            for (let ri = 0; ri < vn.regions.length; ri++) {
                const region = vn.regions[ri]
                const poly: Pt[] = []
                for (const segIdx of region.loops[0] ?? []) {
                    const seg = vn.segments[segIdx]
                    if (!seg) continue
                    const v = vn.vertices[seg.start]
                    if (v) poly.push({ x: v.x, y: v.y })
                }
                if (poly.length >= 3 && pointInPolygon({ x: cx, y: cy }, poly)) {
                    clickedRegionIdx = ri
                    break
                }
            }

            if (clickedRegionIdx === -1) return

            // Toggle: if region has its own fills array, remove it (revert to node fills);
            // if not, add the node's current fill as a region-level override
            const updatedRegions = vn.regions.map((r, ri) => {
                if (ri !== clickedRegionIdx) return r
                if (r.fills && r.fills.length > 0) {
                    // Has fill → remove it (empty array = no fill for this region)
                    return { ...r, fills: [] }
                } else {
                    // No fill → copy current node fills
                    return { ...r, fills: node.fills.length > 0 ? [...node.fills] : [{ type: 'solid' as const, color: '#000000', opacity: 1 }] }
                }
            })
            store.updateVectorNetwork(nodeId, { ...vn, regions: updatedRegions })
        },
        [],
    )

    // ── Bend tool: click+drag segment to shape curve ────────

    const handleBendSegmentPointerDown = useCallback(
        (e: React.PointerEvent, segIdx: number) => {
            e.stopPropagation()
            e.preventDefault()
            const store = useEditorStore.getState()
            if (store.vectorEditTool !== 'bend' || !store.vectorEditNodeId) return
            const node = findNodeById(store.nodes, store.vectorEditNodeId) as VectorNode | null
            if (!node) return
            const seg = node.vectorNetwork.segments[segIdx]
            if (!seg) return

            const startV = node.vectorNetwork.vertices[seg.start]
            const endV = node.vectorNetwork.vertices[seg.end]
            if (!startV || !endV) return

            // If segment is straight, add default curve handles first
            const ts = seg.tangentStart ?? { x: 0, y: 0 }
            const te = seg.tangentEnd ?? { x: 0, y: 0 }
            const wasStraight = ts.x === 0 && ts.y === 0 && te.x === 0 && te.y === 0
            if (wasStraight) {
                const dx = endV.x - startV.x
                const dy = endV.y - startV.y
                const updatedSegs = [...node.vectorNetwork.segments]
                updatedSegs[segIdx] = {
                    ...seg,
                    tangentStart: { x: dx / 3, y: dy / 3 },
                    tangentEnd: { x: -dx / 3, y: -dy / 3 },
                }
                store.updateVectorNetwork(store.vectorEditNodeId, {
                    ...node.vectorNetwork,
                    segments: updatedSegs,
                })
            }

            store.beginBatch()

            // Track drag: adjust the midpoint of the curve perpendicular to segment
            const startClient = { x: e.clientX, y: e.clientY }

            const onMove = (me: PointerEvent) => {
                const st = useEditorStore.getState()
                const nId = st.vectorEditNodeId
                if (!nId) return
                const n = findNodeById(st.nodes, nId) as VectorNode | null
                if (!n) return
                const s = n.vectorNetwork.segments[segIdx]
                if (!s) return
                const sv = n.vectorNetwork.vertices[s.start]
                const ev = n.vectorNetwork.vertices[s.end]
                if (!sv || !ev) return

                // Delta in canvas space
                const dx = (me.clientX - startClient.x) / st.zoom
                const dy = (me.clientY - startClient.y) / st.zoom

                // Segment direction vector (normalized)
                const segDx = ev.x - sv.x
                const segDy = ev.y - sv.y
                const len = Math.sqrt(segDx * segDx + segDy * segDy) || 1

                // Project drag onto perpendicular of segment to control curve bulge
                const perpX = -segDy / len
                const perpY = segDx / len
                const proj = dx * perpX + dy * perpY

                const updatedSegs = [...n.vectorNetwork.segments]
                updatedSegs[segIdx] = {
                    ...s,
                    tangentStart: { x: segDx / 3 + perpX * proj, y: segDy / 3 + perpY * proj },
                    tangentEnd: { x: -segDx / 3 + perpX * proj, y: -segDy / 3 + perpY * proj },
                }
                st.updateVectorNetwork(nId, { ...n.vectorNetwork, segments: updatedSegs })
            }

            const onUp = () => {
                useEditorStore.getState().endBatch()
                window.removeEventListener('pointermove', onMove)
                window.removeEventListener('pointerup', onUp)
            }

            window.addEventListener('pointermove', onMove)
            window.addEventListener('pointerup', onUp)
        },
        [],
    )

    // ── Cut tool: click segment to insert vertex + split ────

    const handleCutSegmentClick = useCallback(
        (e: React.MouseEvent, segIdx: number) => {
            e.stopPropagation()
            const store = useEditorStore.getState()
            if (store.vectorEditTool !== 'cut' || !store.vectorEditNodeId) return
            const node = findNodeById(store.nodes, store.vectorEditNodeId) as VectorNode | null
            if (!node) return
            const net = node.vectorNetwork
            const seg = net.segments[segIdx]
            if (!seg) return

            const startV = net.vertices[seg.start]
            const endV = net.vertices[seg.end]
            if (!startV || !endV) return

            // Find t closest to click point on this segment
            const z = store.zoom
            const px = store.panX
            const py = store.panY
            const nx = node.x
            const ny = node.y

            const toScreen = (vx: number, vy: number): Pt => ({
                x: (nx + vx) * z + px,
                y: (ny + vy) * z + py,
            })

            const a = toScreen(startV.x, startV.y)
            const b = toScreen(endV.x, endV.y)
            const ts = seg.tangentStart ?? { x: 0, y: 0 }
            const te = seg.tangentEnd ?? { x: 0, y: 0 }
            const cp1 = toScreen(startV.x + ts.x, startV.y + ts.y)
            const cp2 = toScreen(endV.x + te.x, endV.y + te.y)

            const clickPt = { x: e.clientX, y: e.clientY }
            const t = closestTOnSegment(clickPt, a, cp1, cp2, b)

            // Evaluate point on bezier at t (in canvas space)
            const mt = 1 - t
            const newX = mt * mt * mt * startV.x + 3 * mt * mt * t * (startV.x + ts.x) +
                3 * mt * t * t * (endV.x + te.x) + t * t * t * endV.x
            const newY = mt * mt * mt * startV.y + 3 * mt * mt * t * (startV.y + ts.y) +
                3 * mt * t * t * (endV.y + te.y) + t * t * t * endV.y

            // Insert new vertex at this position
            const newVertIdx = net.vertices.length
            const newVertex: VectorVertex = { x: newX, y: newY, handleMirroring: 'NONE' }

            // Split the segment: seg.start → newVert, newVert → seg.end
            // Subdivide bezier tangents using de Casteljau at t
            const p0 = { x: startV.x, y: startV.y }
            const p1 = { x: startV.x + ts.x, y: startV.y + ts.y }
            const p2 = { x: endV.x + te.x, y: endV.y + te.y }
            const p3 = { x: endV.x, y: endV.y }

            const q0 = p0
            const q1 = { x: p0.x + t * (p1.x - p0.x), y: p0.y + t * (p1.y - p0.y) }
            const q2 = {
                x: p0.x + t * (p1.x - p0.x) + t * (p1.x + t * (p2.x - p1.x) - p0.x - t * (p1.x - p0.x)),
                y: p0.y + t * (p1.y - p0.y) + t * (p1.y + t * (p2.y - p1.y) - p0.y - t * (p1.y - p0.y)),
            }
            const r1 = { x: p1.x + t * (p2.x - p1.x), y: p1.y + t * (p2.y - p1.y) }
            const r2 = {
                x: p1.x + t * (p2.x - p1.x) + t * (p2.x + t * (p3.x - p2.x) - p1.x - t * (p2.x - p1.x)),
                y: p1.y + t * (p2.y - p1.y) + t * (p2.y + t * (p3.y - p2.y) - p1.y - t * (p2.y - p1.y)),
            }
            const r3 = p3

            const firstHalf = {
                start: seg.start,
                end: newVertIdx,
                tangentStart: { x: q1.x - q0.x, y: q1.y - q0.y },
                tangentEnd: { x: q2.x - newX, y: q2.y - newY },
            }
            const secondHalf = {
                start: newVertIdx,
                end: seg.end,
                tangentStart: { x: r1.x - newX, y: r1.y - newY },
                tangentEnd: { x: r2.x - r3.x, y: r2.y - r3.y },
            }

            const newSegments = net.segments.map((s, si) => si === segIdx ? firstHalf : s)
            newSegments.splice(segIdx + 1, 0, secondHalf)

            store.updateVectorNetwork(store.vectorEditNodeId, {
                ...net,
                vertices: [...net.vertices, newVertex],
                segments: newSegments,
            })
        },
        [],
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

                // Capture original positions of ALL selected vertices at drag start
                const origPositions = new Map<number, { x: number; y: number }>()
                for (const vi of store.selectedVertexIndices) {
                    const vert = node.vectorNetwork.vertices[vi]
                    if (vert) origPositions.set(vi, { x: vert.x, y: vert.y })
                }
                // Ensure the clicked vertex is included
                if (!origPositions.has(idx)) {
                    origPositions.set(idx, { x: v.x, y: v.y })
                }

                dragRef.current = {
                    type: 'vertex',
                    index: idx,
                    startCanvasX: canvas.x,
                    startCanvasY: canvas.y,
                    origX: v.x,
                    origY: v.y,
                    origPositions,
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
                    for (const vi of st.selectedVertexIndices) {
                        const orig = drag.origPositions?.get(vi)
                        if (!orig) continue
                        st.updateVertex(nodeId, vi, { x: orig.x + dx, y: orig.y + dy })
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
                style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 32, pointerEvents: 'none' }}
            >
                {/* All clickable elements in a group with pointer-events: all */}
                <g style={{ pointerEvents: 'all' }}>
                    {/* Full-canvas transparent background hit target for lasso drag */}
                    {vectorEditTool === 'lasso' && (
                        <rect
                            x={-9999} y={-9999} width={99999} height={99999}
                            fill="transparent"
                            style={{ cursor: 'crosshair' }}
                            onPointerDown={handleLassoPointerDown}
                        />
                    )}

                    {/* Lasso polygon being drawn */}
                    {lassoPoints.length >= 2 && (
                        <polyline
                            points={lassoPoints.map((p) => `${p.x},${p.y}`).join(' ')}
                            fill="rgba(59,130,246,0.1)"
                            stroke={BLUE}
                            strokeWidth={1}
                            strokeDasharray="4 2"
                            style={{ pointerEvents: 'none' }}
                        />
                    )}

                    {/* Invisible fat segment hit targets */}
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

                        const cursor = (vectorEditTool === 'bend' || vectorEditTool === 'cut') ? 'crosshair' : 'default'

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
                                    onPointerDown={(e) => vectorEditTool === 'bend' ? handleBendSegmentPointerDown(e, si) : undefined}
                                    onClick={(e) => {
                                        if (vectorEditTool === 'cut') handleCutSegmentClick(e, si)
                                        else handleSegmentClick(e, si)
                                    }}
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
                                onPointerDown={(e) => vectorEditTool === 'bend' ? handleBendSegmentPointerDown(e, si) : undefined}
                                onClick={(e) => {
                                    if (vectorEditTool === 'cut') handleCutSegmentClick(e, si)
                                    else handleSegmentClick(e, si)
                                }}
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

            {/* Paint tool: full-canvas overlay to capture region clicks */}
            {vectorEditTool === 'paint' && (
                <div
                    className="absolute inset-0"
                    style={{ zIndex: 33, cursor: 'crosshair' }}
                    onClick={handlePaintClick}
                />
            )}
        </>
    )
})
