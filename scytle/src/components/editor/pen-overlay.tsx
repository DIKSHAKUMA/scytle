'use client'

import { memo } from 'react'
import { useEditorStore } from '@/store/editor-store'

/**
 * PenOverlay — renders the in-progress pen drawing on top of the canvas.
 *
 * Renders in screen space (sibling of the transform container):
 *  - Committed segments (solid lines between placed vertices)
 *  - Rubber-band line from last vertex to cursor
 *  - Anchor point circles at each placed vertex
 *  - Close-path indicator circle when hovering near start vertex
 */
export const PenOverlay = memo(function PenOverlay() {
    const ps = useEditorStore((s) => s.penDrawingState)
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)

    if (!ps || ps.vertices.length === 0) return null

    /** Convert canvas coord to viewport screen coord */
    const toScreen = (cx: number, cy: number) => ({
        x: cx * zoom + panX,
        y: cy * zoom + panY,
    })

    const verts = ps.vertices.map((v) => toScreen(v.x, v.y))
    const cursor = toScreen(ps.cursorX, ps.cursorY)
    const lastVert = verts[verts.length - 1]

    const ANCHOR_R = 4
    const CLOSE_R = 7

    return (
        <svg
            className="absolute inset-0 pointer-events-none"
            style={{ width: '100%', height: '100%', overflow: 'visible', zIndex: 30 }}
        >
            {/* Committed segments */}
            {ps.segments.map((seg, i) => {
                const a = verts[seg.start]
                const b = verts[seg.end]
                if (!a || !b) return null
                return (
                    <line
                        key={`seg-${i}`}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke="#3b82f6"
                        strokeWidth={1.5}
                    />
                )
            })}

            {/* Rubber-band from last vertex to cursor */}
            {verts.length > 0 && (
                <line
                    x1={lastVert.x}
                    y1={lastVert.y}
                    x2={cursor.x}
                    y2={cursor.y}
                    stroke="#3b82f6"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    opacity={0.7}
                />
            )}

            {/* Anchor points */}
            {verts.map((v, i) => (
                <circle
                    key={`anchor-${i}`}
                    cx={v.x}
                    cy={v.y}
                    r={ANCHOR_R}
                    fill="white"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                />
            ))}

            {/* Close-path indicator — larger ring around start vertex */}
            {ps.nearStartPoint && verts.length >= 3 && (
                <circle
                    cx={verts[0].x}
                    cy={verts[0].y}
                    r={CLOSE_R}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    opacity={0.8}
                />
            )}
        </svg>
    )
})
