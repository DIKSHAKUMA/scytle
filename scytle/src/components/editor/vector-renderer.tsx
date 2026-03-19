import { memo, type CSSProperties } from 'react'
import type { VectorNode } from '@/types/canvas'
import { networkToSVGPath } from '@/lib/vector-utils'
import { hexOpacityToRgba, normaliseHex, hexToHashHex } from '@/lib/color-utils'

// ============================================================
// Props
// ============================================================

interface VectorRendererProps {
    node: VectorNode
    isTopLevel?: boolean
    parentDirection?: 'row' | 'column'
    parentLayoutMode?: 'flex' | 'grid' | 'none'
}

// ============================================================
// VectorRenderer — renders a VectorNode as an inline SVG
// ============================================================

/**
 * Renders a VectorNode as a positioned div wrapper containing an inline SVG.
 *
 * Layout:  The wrapper div holds positioning (position, left, top) and sizing
 *          (width, height) but NO visual styles like background/fill.
 *          Fills are applied ONLY to the SVG path element.
 *
 * Fill:    Solid fills from node.fills[0] are mapped to the SVG fill attribute.
 *          Gradient / multi-fill support is a future phase.
 *
 * Stroke:  strokeColor, strokeWeight, strokeOpacity, strokeCap, strokeJoin
 *          are mapped directly to SVG stroke attributes.
 */
export const VectorRenderer = memo(function VectorRenderer({
    node,
    isTopLevel = false,
    parentLayoutMode,
}: VectorRendererProps) {
    // ── Wrapper styles (position/size ONLY — no fills) ───────
    const wrapStyle: CSSProperties = {
        boxSizing: 'border-box',
        position: 'absolute',
        overflow: 'visible',
    }

    // Position: top-level includes pan offset, nested is relative to parent
    if (isTopLevel) {
        wrapStyle.left = `calc(${node.x}px * var(--z, 1) + var(--px, 0) * 1px)`
        wrapStyle.top = `calc(${node.y}px * var(--z, 1) + var(--py, 0) * 1px)`
    } else {
        wrapStyle.left = `calc(${node.x}px * var(--z, 1))`
        wrapStyle.top = `calc(${node.y}px * var(--z, 1))`
    }

    // Size
    wrapStyle.width = `calc(${node.width}px * var(--z, 1))`
    wrapStyle.height = `calc(${node.height}px * var(--z, 1))`

    // Opacity at node level
    if (node.opacity < 1) wrapStyle.opacity = node.opacity

    // Rotation
    if (node.rotation !== 0) wrapStyle.transform = `rotate(${node.rotation}deg)`

    // ── Path data ─────────────────────────────────────────────
    const net = node.vectorNetwork
    const hasGeometry = net.vertices.length > 0 && net.segments.length > 0
    const pathD = hasGeometry ? networkToSVGPath(net) : ''

    // ── Fill (SVG path only, NOT wrapper div) ─────────────────
    let svgFill = 'none'
    const visibleFills = node.fills.filter((f) => f.visible !== false)
    const firstFill = visibleFills[0]
    if (firstFill && firstFill.type === 'solid') {
        svgFill = hexOpacityToRgba(
            normaliseHex(firstFill.color),
            firstFill.opacity ?? 1,
        )
    }

    // ── Stroke ────────────────────────────────────────────────
    const svgStroke = node.strokeVisible ? hexToHashHex(node.strokeColor) : 'none'

    // StrokeCap: Figma NONE/LINE_ARROW/TRIANGLE_ARROW/etc. fall back to 'butt'
    const strokeLinecap: 'round' | 'square' | 'butt' =
        node.strokeCap === 'ROUND' ? 'round' :
            node.strokeCap === 'SQUARE' ? 'square' :
                'butt'

    // StrokeJoin: Figma ROUND/BEVEL/MITER map directly
    const strokeLinejoin: 'round' | 'bevel' | 'miter' =
        node.strokeJoin === 'ROUND' ? 'round' :
            node.strokeJoin === 'BEVEL' ? 'bevel' :
                'miter'

    // ── SVG viewBox ───────────────────────────────────────────
    // Guard against zero dimensions mid-draw (width/height set to 0 initially)
    const vbW = Math.max(node.width, 1)
    const vbH = Math.max(node.height, 1)

    return (
        <div
            data-node-id={node.id}
            style={wrapStyle}
        >
            <svg
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    overflow: 'visible',
                    pointerEvents: 'none', // let the wrapper div handle clicks
                }}
                viewBox={`0 0 ${vbW} ${vbH}`}
                xmlns="http://www.w3.org/2000/svg"
            >
                {pathD && (
                    <path
                        d={pathD}
                        fill={svgFill}
                        fillRule="nonzero"
                        stroke={svgStroke}
                        strokeOpacity={node.strokeOpacity}
                        strokeWidth={node.strokeWeight}
                        strokeLinecap={strokeLinecap}
                        strokeLinejoin={strokeLinejoin}
                    />
                )}
            </svg>
        </div>
    )
})
