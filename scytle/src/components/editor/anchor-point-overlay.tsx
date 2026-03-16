'use client'

import { memo, useCallback } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { findNodeById } from '@/types/canvas'
import type { VectorNode, VectorVertex, VectorSegment } from '@/types/canvas'

const ANCHOR_SIZE = 7 // half-width of anchor square
const HANDLE_R = 4 // bezier control point circle radius
const BLUE = '#3b82f6'
const WHITE = '#ffffff'

/**
 * AnchorPointOverlay — renders interactive anchor points and bezier handles
 * on top of the canvas when in vector edit mode.
 *
 * - White squares = unselected vertices
 * - Blue filled squares = selected vertices
 * - Thin blue lines + circles = bezier tangent handles
 */
export const AnchorPointOverlay = memo(function AnchorPointOverlay() {
    const vectorEditNodeId = useEditorStore((s) => s.vectorEditNodeId)
    const selectedVertexIndices = useEditorStore((s) => s.selectedVertexIndices)
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)
    const nodes = useEditorStore((s) => s.nodes)
    const selectVertices = useEditorStore((s) => s.selectVertices)

    const handleVertexClick = useCallback(
        (e: React.MouseEvent, idx: number) => {
            e.stopPropagation()
            const replace = !e.shiftKey
            selectVertices([idx], replace)
        },
        [selectVertices],
    )

    if (!vectorEditNodeId) return null

    const node = findNodeById(nodes, vectorEditNodeId)
    if (!node || node.type !== 'vector') return null

    const vn = (node as VectorNode).vectorNetwork
    const nodeX = node.x
    const nodeY = node.y

    /** Convert node-local vertex coord to viewport screen coord */
    const toScreen = (vx: number, vy: number) => ({
        x: (nodeX + vx) * zoom + panX,
        y: (nodeY + vy) * zoom + panY,
    })

    const selectedSet = new Set(selectedVertexIndices)

    return (
        <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 31 }}
        >
            {/* Bezier tangent handles — render behind anchor points */}
            {vn.segments.map((seg: VectorSegment, si: number) => {
                const startV = vn.vertices[seg.start]
                const endV = vn.vertices[seg.end]
                if (!startV || !endV) return null

                const elements: React.ReactNode[] = []

                // tangentStart handle (from start vertex)
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
                        <circle
                            key={`ts-cp-${si}`}
                            cx={cp.x} cy={cp.y} r={HANDLE_R}
                            fill={WHITE} stroke={BLUE} strokeWidth={1}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        />,
                    )
                }

                // tangentEnd handle (from end vertex)
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
                        <circle
                            key={`te-cp-${si}`}
                            cx={cp.x} cy={cp.y} r={HANDLE_R}
                            fill={WHITE} stroke={BLUE} strokeWidth={1}
                            style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        />,
                    )
                }

                return elements.length > 0 ? <g key={`seg-handles-${si}`}>{elements}</g> : null
            })}

            {/* Segment lines (thin blue on top of shape for visibility in edit mode) */}
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
                    const cp1 = ts
                        ? toScreen(startV.x + ts.x, startV.y + ts.y)
                        : a
                    const cp2 = te
                        ? toScreen(endV.x + te.x, endV.y + te.y)
                        : b
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

            {/* Anchor points (vertices) — on top of everything */}
            {vn.vertices.map((v: VectorVertex, vi: number) => {
                const pos = toScreen(v.x, v.y)
                const isSelected = selectedSet.has(vi)
                const half = ANCHOR_SIZE / 2

                return (
                    <rect
                        key={`anchor-${vi}`}
                        x={pos.x - half}
                        y={pos.y - half}
                        width={ANCHOR_SIZE}
                        height={ANCHOR_SIZE}
                        fill={isSelected ? BLUE : WHITE}
                        stroke={BLUE}
                        strokeWidth={1.5}
                        style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                        onClick={(e) => handleVertexClick(e, vi)}
                    />
                )
            })}
        </svg>
    )
})
