import type { CSSProperties } from 'react'
import type {
    ScytleNode,
    FrameNode,
    Fill,
    Shadow,
    Border,
    BorderRadius,
    Padding,
} from '@/types/canvas'

// ============================================================
// CSS Value Mappings
// ============================================================

const JUSTIFY_MAP: Record<string, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    between: 'space-between',
}

const ALIGN_MAP: Record<string, string> = {
    start: 'flex-start',
    end: 'flex-end',
    center: 'center',
    stretch: 'stretch',
    baseline: 'baseline',
}

// ============================================================
// Individual Property Computations
// ============================================================

/** Build background CSS from a fills array (last fill is visually on top) */
function computeBackground(fills: Fill[]): CSSProperties {
    if (fills.length === 0) return {}

    const fill = fills[fills.length - 1]
    switch (fill.type) {
        case 'solid':
            return { backgroundColor: fill.color }
        case 'gradient':
            return { backgroundImage: fill.gradient }
        case 'image':
            return {
                backgroundImage: `url(${fill.src})`,
                backgroundSize: fill.fit,
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }
    }
}

/** Build CSS box-shadow from shadows array */
function computeBoxShadow(shadows: Shadow[]): string | undefined {
    if (shadows.length === 0) return undefined
    return shadows
        .map((s) => {
            const inset = s.type === 'inner' ? 'inset ' : ''
            return `${inset}${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
        })
        .join(', ')
}

/** Build border CSS */
function computeBorder(border?: Border): CSSProperties {
    if (!border) return {}
    return {
        borderWidth: border.width,
        borderStyle: border.style,
        borderColor: border.color,
    }
}

/** Build border-radius CSS */
function computeBorderRadius(br: BorderRadius): CSSProperties {
    if (typeof br === 'number') {
        return br > 0 ? { borderRadius: br } : {}
    }
    return {
        borderTopLeftRadius: br.topLeft,
        borderTopRightRadius: br.topRight,
        borderBottomRightRadius: br.bottomRight,
        borderBottomLeftRadius: br.bottomLeft,
    }
}

/** Build padding CSS from Padding object */
function computePadding(p: Padding): CSSProperties {
    if (p.top === 0 && p.right === 0 && p.bottom === 0 && p.left === 0) return {}
    return { padding: `${p.top}px ${p.right}px ${p.bottom}px ${p.left}px` }
}

// ============================================================
// Composite Style Builders
// ============================================================

/**
 * Compute base CSS styles shared by all node types:
 * position, sizing, opacity, rotation, fills, border, radius, shadows.
 *
 * @param node             The node to style
 * @param isTopLevel       True for root-level canvas nodes (absolute at x,y)
 * @param parentDir        Parent flex direction — needed for fill sizing
 * @param parentLayoutMode Parent layout mode — children of 'none' frames are absolute
 */
export function computeBaseStyles(
    node: ScytleNode,
    isTopLevel: boolean,
    parentDir?: 'row' | 'column',
    parentLayoutMode?: 'flex' | 'grid' | 'none'
): CSSProperties {
    const s: CSSProperties = { boxSizing: 'border-box' }

    // ── Position ──────────────────────────────────────────────
    // Absolute positioning when: top-level, explicit absolute, or child of freeform frame
    const isFreeformChild = parentLayoutMode === 'none'
    if (isTopLevel || node.positioning === 'absolute' || isFreeformChild) {
        s.position = 'absolute'
        s.left = node.x
        s.top = node.y
    }

    // ── Sizing ────────────────────────────────────────────────
    // Horizontal
    if (node.sizing.horizontal === 'fixed') {
        s.width = node.width
    } else if (node.sizing.horizontal === 'fill') {
        if (parentDir === 'row') {
            // Main axis in row → flex grow
            s.flex = '1 1 0%'
            s.minWidth = 0
        } else if (parentDir === 'column') {
            // Cross axis in column → stretch (default, but explicit)
            s.alignSelf = 'stretch'
        } else {
            s.width = '100%'
        }
    }
    // hug → width unset (auto)

    // Vertical
    if (node.sizing.vertical === 'fixed') {
        s.height = node.height
    } else if (node.sizing.vertical === 'fill') {
        if (parentDir === 'column') {
            // Main axis in column → flex grow
            // (may override flex set by horizontal fill — intentional: vertical takes precedence in column)
            s.flex = '1 1 0%'
            s.minHeight = 0
        } else if (parentDir === 'row') {
            // Cross axis in row → stretch
            s.alignSelf = 'stretch'
        } else {
            s.height = '100%'
        }
    }
    // hug → height unset (auto)

    // ── Opacity ───────────────────────────────────────────────
    if (node.opacity < 1) s.opacity = node.opacity

    // ── Rotation ──────────────────────────────────────────────
    if (node.rotation !== 0) s.transform = `rotate(${node.rotation}deg)`

    // ── Visual properties ─────────────────────────────────────
    Object.assign(s, computeBackground(node.fills))
    Object.assign(s, computeBorder(node.border))
    Object.assign(s, computeBorderRadius(node.borderRadius))

    const shadow = computeBoxShadow(node.shadows)
    if (shadow) s.boxShadow = shadow

    return s
}

/**
 * Compute frame-specific layout styles (display, flex/grid, padding, overflow).
 * Applied **on top of** computeBaseStyles for FrameNode.
 *
 * Note: Does NOT set position — that's handled by computeBaseStyles
 * and the frame renderer for mode:'none' positioning context.
 */
export function computeFrameLayoutStyles(node: FrameNode): CSSProperties {
    const s: CSSProperties = {}

    if (node.layout.mode === 'flex') {
        s.display = 'flex'
        s.flexDirection = node.layout.direction ?? 'column'
        if (node.layout.gap != null) s.gap = node.layout.gap
        if (node.layout.justify)
            s.justifyContent = JUSTIFY_MAP[node.layout.justify] ?? node.layout.justify
        if (node.layout.align)
            s.alignItems = ALIGN_MAP[node.layout.align] ?? node.layout.align
        if (node.layout.wrap) s.flexWrap = 'wrap'
    } else if (node.layout.mode === 'grid') {
        s.display = 'grid'
        if (node.layout.columns != null) {
            s.gridTemplateColumns =
                typeof node.layout.columns === 'number'
                    ? `repeat(${node.layout.columns}, 1fr)`
                    : node.layout.columns
        }
        if (node.layout.rows != null) {
            s.gridTemplateRows =
                typeof node.layout.rows === 'number'
                    ? `repeat(${node.layout.rows}, 1fr)`
                    : node.layout.rows
        }
        if (node.layout.columnGap != null) s.columnGap = node.layout.columnGap
        if (node.layout.rowGap != null) s.rowGap = node.layout.rowGap
    }
    // mode: 'none' → no display override; position context handled by renderer

    // Padding
    Object.assign(s, computePadding(node.padding))

    // Overflow
    if (node.overflow === 'hidden') s.overflow = 'hidden'

    return s
}
