import { memo, type CSSProperties } from 'react'
import type { VectorNode } from '@/types/canvas'
import { networkToSVGPath } from '@/lib/vector-utils'
import { hexOpacityToRgba, normaliseHex } from '@/lib/color-utils'
import { computeBaseStyles } from './render-utils'

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
 * Layout:  The wrapper div holds all CSS-level properties (position, size,
 *          opacity, transform, box-shadow) computed by computeBaseStyles.
 *          The SVG fills the wrapper with overflow:visible so stroke can
 *          render outside the bounding box (needed for CENTER stroke align).
 *
 * Fill:    Solid fills from node.fills[0] are mapped to the SVG fill attribute.
 *          Gradient / multi-fill support is a future phase.
 *
 * Stroke:  strokeColor, strokeWeight, strokeOpacity, strokeCap, strokeJoin
 *          are mapped directly to SVG stroke attributes.
 *
 * Phase:   D3-7 — Static rendering only.  Anchor handles, selection overlays,
 *          and vector edit mode are implemented in D3-3 / D3-4 / D3-5 / D3-6.
 */
export const VectorRenderer = memo(function VectorRenderer({
    node,
    isTopLevel = false,
    parentDirection,
    parentLayoutMode,
}: VectorRendererProps) {
    // ── Base wrapper styles (position/size/opacity/transform) ──
    const baseStyle = computeBaseStyles(node, isTopLevel, parentDirection, parentLayoutMode)

    // Ensure stroke can paint outside the node bounding box
    const wrapStyle: CSSProperties = {
        ...baseStyle,
        overflow: 'visible',
    }

    // ── Path data ─────────────────────────────────────────────
    const net = node.vectorNetwork
    const hasGeometry = net.vertices.length > 0 && net.segments.length > 0
    const pathD = hasGeometry ? networkToSVGPath(net) : ''

    // ── Fill ─────────────────────────────────────────────────
    // Map the first visible solid fill to an SVG fill color.
    // Gradient / image fills are rendered as 'none' in this phase.
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
    const svgStroke = node.strokeVisible ? normaliseHex(node.strokeColor) : 'none'

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
                        // Regions control winding rule; default to nonzero
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
