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

/** Convert a hex color + opacity to rgba() string */
function hexToRgba(hex: string, opacity: number): string {
    const h = hex.replace('#', '').slice(0, 6).padEnd(6, '0')
    const r = parseInt(h.slice(0, 2), 16) || 0
    const g = parseInt(h.slice(2, 4), 16) || 0
    const b = parseInt(h.slice(4, 6), 16) || 0
    return `rgba(${r},${g},${b},${opacity})`
}

/** Build background CSS from a fills array.
 *  Supports multiple fills, per-fill opacity, and visibility.
 *  First fill in array = topmost visual layer (CSS background shorthand
 *  renders first background on top). */
function computeBackground(fills: Fill[]): CSSProperties {
    const visible = fills.filter((f) => f.visible !== false)
    if (visible.length === 0) return {}

    const backgrounds: string[] = []
    const sizes: string[] = []
    const positions: string[] = []
    const repeats: string[] = []

    for (const fill of visible) {
        const opacity = fill.opacity ?? 1
        switch (fill.type) {
            case 'solid': {
                backgrounds.push(hexToRgba(fill.color, opacity))
                sizes.push('auto')
                positions.push('0 0')
                repeats.push('no-repeat')
                break
            }
            case 'gradient': {
                if (fill.gradient) {
                    // Legacy CSS gradient string
                    backgrounds.push(fill.gradient)
                } else if (fill.stops && fill.stops.length >= 2) {
                    const type = fill.gradientType ?? 'linear'
                    const angle = fill.angle ?? 90
                    const stops = fill.stops
                        .map((s) => `${hexToRgba(s.color, s.opacity ?? 1)} ${s.position * 100}%`)
                        .join(', ')
                    if (type === 'linear') backgrounds.push(`linear-gradient(${angle}deg, ${stops})`)
                    else if (type === 'radial') backgrounds.push(`radial-gradient(circle, ${stops})`)
                    else if (type === 'angular') backgrounds.push(`conic-gradient(${stops})`)
                    else backgrounds.push(`radial-gradient(circle, ${stops})`) // diamond fallback
                } else {
                    backgrounds.push('transparent')
                }
                sizes.push('100% 100%')
                positions.push('0 0')
                repeats.push('no-repeat')
                break
            }
            case 'image': {
                if (fill.src) {
                    backgrounds.push(`url(${fill.src})`)
                    const fit = fill.fit ?? 'cover'
                    sizes.push(fit === 'tile' ? 'auto' : fit === 'fill' ? '100% 100%' : fit)
                    positions.push('center')
                    repeats.push(fit === 'tile' ? 'repeat' : 'no-repeat')
                } else {
                    backgrounds.push('transparent')
                    sizes.push('auto')
                    positions.push('0 0')
                    repeats.push('no-repeat')
                }
                break
            }
        }
    }

    if (backgrounds.length === 0) return {}

    // Single fill optimization — use backgroundColor for solid
    if (visible.length === 1 && visible[0].type === 'solid') {
        return { backgroundColor: hexToRgba(visible[0].color, visible[0].opacity ?? 1) }
    }

    return {
        background: backgrounds.join(', '),
        backgroundSize: sizes.join(', '),
        backgroundPosition: positions.join(', '),
        backgroundRepeat: repeats.join(', '),
    }
}

/** Build CSS box-shadow from shadows array, scaled via CSS custom property */
function computeBoxShadow(shadows: Shadow[]): string | undefined {
    if (shadows.length === 0) return undefined
    return shadows
        .map((s) => {
            const inset = s.type === 'inner' ? 'inset ' : ''
            return `${inset}calc(${s.x}px * var(--z, 1)) calc(${s.y}px * var(--z, 1)) calc(${s.blur}px * var(--z, 1)) calc(${s.spread}px * var(--z, 1)) ${s.color}`
        })
        .join(', ')
}

/** Build border CSS, with width scaled via CSS custom property */
function computeBorder(border?: Border): CSSProperties {
    if (!border) return {}
    return {
        borderWidth: `calc(${border.width}px * var(--z, 1))`,
        borderStyle: border.style,
        borderColor: border.color,
    }
}

/** Build border-radius CSS, scaled via CSS custom property */
function computeBorderRadius(br: BorderRadius): CSSProperties {
    if (typeof br === 'number') {
        return br > 0 ? { borderRadius: `calc(${br}px * var(--z, 1))` } : {}
    }
    return {
        borderTopLeftRadius: `calc(${br.topLeft}px * var(--z, 1))`,
        borderTopRightRadius: `calc(${br.topRight}px * var(--z, 1))`,
        borderBottomRightRadius: `calc(${br.bottomRight}px * var(--z, 1))`,
        borderBottomLeftRadius: `calc(${br.bottomLeft}px * var(--z, 1))`,
    }
}

/** Build padding CSS from Padding object, scaled via CSS custom property */
function computePadding(p: Padding): CSSProperties {
    if (p.top === 0 && p.right === 0 && p.bottom === 0 && p.left === 0) return {}
    return {
        padding: `calc(${p.top}px * var(--z, 1)) calc(${p.right}px * var(--z, 1)) calc(${p.bottom}px * var(--z, 1)) calc(${p.left}px * var(--z, 1))`,
    }
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
    // Absolute positioning when: top-level, explicit absolute, or child of freeform frame.
    // Top-level nodes include pan offset (--px/--py); nested absolute children position
    // relative to their parent’s content box so only zoom scaling is applied.
    const isFreeformChild = parentLayoutMode === 'none'
    if (isTopLevel || node.positioning === 'absolute' || isFreeformChild) {
        s.position = 'absolute'
        if (isTopLevel) {
            s.left = `calc(${node.x}px * var(--z, 1) + var(--px, 0) * 1px)`
            s.top = `calc(${node.y}px * var(--z, 1) + var(--py, 0) * 1px)`
        } else {
            s.left = `calc(${node.x}px * var(--z, 1))`
            s.top = `calc(${node.y}px * var(--z, 1))`
        }
    }

    // ── Sizing ────────────────────────────────────────────────
    // Horizontal
    if (node.sizing.horizontal === 'fixed') {
        s.width = `calc(${node.width}px * var(--z, 1))`
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
        s.height = `calc(${node.height}px * var(--z, 1))`
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
        if (node.layout.gap != null) s.gap = `calc(${node.layout.gap}px * var(--z, 1))`
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
        // Grid gap: use specific columnGap/rowGap if set, otherwise fall back to generic gap
        const gridColGap = node.layout.columnGap ?? node.layout.gap
        const gridRowGap = node.layout.rowGap ?? node.layout.gap
        if (gridColGap != null) s.columnGap = `calc(${gridColGap}px * var(--z, 1))`
        if (gridRowGap != null) s.rowGap = `calc(${gridRowGap}px * var(--z, 1))`
    }
    // mode: 'none' → no display override; position context handled by renderer

    // Padding
    Object.assign(s, computePadding(node.padding))

    // Overflow
    if (node.overflow === 'hidden') s.overflow = 'hidden'

    return s
}
