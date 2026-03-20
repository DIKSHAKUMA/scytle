import type { CSSProperties } from 'react'
import type {
    ScytleNode,
    FrameNode,
    Fill,
    ImageFill,
    Shadow,
    Border,
    BorderRadius,
    Padding,
} from '@/types/canvas'
import { blendModeToCSS, hexOpacityToRgba, normaliseHex } from '@/lib/color-utils'

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

    // Single solid fill fast path — no layering needed
    if (visible.length === 1 && visible[0].type === 'solid') {
        return { backgroundColor: hexToRgba(visible[0].color, visible[0].opacity ?? 1) }
    }

    const images: string[] = []
    const sizes: string[] = []
    const positions: string[] = []
    const repeats: string[] = []

    for (const fill of visible) {
        const opacity = fill.opacity ?? 1
        switch (fill.type) {
            case 'solid': {
                // Express as degenerate gradient so it works in backgroundImage
                // (plain colors are not valid backgroundImage values in multi-layer context)
                const color = hexToRgba(fill.color, opacity)
                images.push(`linear-gradient(${color}, ${color})`)
                sizes.push('100% 100%')
                positions.push('0 0')
                repeats.push('no-repeat')
                break
            }
            case 'gradient': {
                if (fill.gradient) {
                    // Legacy CSS gradient string
                    images.push(fill.gradient)
                } else if (fill.stops && fill.stops.length >= 2) {
                    const type = fill.gradientType ?? 'linear'
                    const angle = fill.angle ?? 90
                    const stops = fill.stops
                        .map((s) => `${hexToRgba(s.color, s.opacity ?? 1)} ${s.position * 100}%`)
                        .join(', ')
                    if (type === 'linear') images.push(`linear-gradient(${angle}deg, ${stops})`)
                    else if (type === 'radial') images.push(`radial-gradient(circle, ${stops})`)
                    else if (type === 'angular') images.push(`conic-gradient(${stops})`)
                    else images.push(`radial-gradient(circle, ${stops})`) // diamond fallback
                } else {
                    images.push('none')
                }
                sizes.push('100% 100%')
                positions.push('0 0')
                repeats.push('no-repeat')
                break
            }
            case 'image': {
                if (fill.src) {
                    // Per-layer opacity: overlay a translucent white layer on top
                    // (CSS background-image doesn't support native per-layer alpha)
                    if (opacity < 1) {
                        const fadeColor = `rgba(255,255,255,${1 - opacity})`
                        images.push(`linear-gradient(${fadeColor}, ${fadeColor})`)
                        sizes.push('100% 100%')
                        positions.push('0 0')
                        repeats.push('no-repeat')
                    }
                    images.push(`url(${fill.src})`)
                    const fit = fill.fit ?? 'cover'
                    if (fit === 'tile') {
                        sizes.push('auto')
                        positions.push('0 0')
                        repeats.push('repeat')
                    } else if (fit === 'fill') {
                        sizes.push('100% 100%')
                        positions.push('center')
                        repeats.push('no-repeat')
                    } else if (fit === 'crop') {
                        const cropZoom = fill.cropZoom ?? 1
                        // cover × zoom: at zoom=1 it's just cover; zoom>1 scales up
                        sizes.push(cropZoom <= 1 ? 'cover' : `${cropZoom * 100}%`)
                        positions.push(`${fill.cropX ?? 50}% ${fill.cropY ?? 50}%`)
                        repeats.push('no-repeat')
                    } else {
                        // 'cover' | 'contain'
                        sizes.push(fit)
                        positions.push('center')
                        repeats.push('no-repeat')
                    }
                } else {
                    images.push('none')
                    sizes.push('auto')
                    positions.push('0 0')
                    repeats.push('no-repeat')
                }
                break
            }
        }
    }

    if (images.length === 0) return {}

    // Use only longhand properties — never mix `background` shorthand with longhands
    // (React warns about conflicting shorthand/longhand background properties)
    return {
        backgroundImage: images.join(', '),
        backgroundSize: sizes.join(', '),
        backgroundPosition: positions.join(', '),
        backgroundRepeat: repeats.join(', '),
    }
}

/** Build CSS filter from image fill adjustments.
 *  Adjustments are -100 to +100 where 0 = no change.
 *  Returns a filter string, or undefined if no adjustments. */
function computeImageFillFilter(fill: ImageFill): string | undefined {
    const parts: string[] = []
    const { exposure = 0, contrast = 0, saturation = 0, temperature = 0 } = fill
    if (exposure !== 0) parts.push(`brightness(${1 + exposure / 100})`)
    if (contrast !== 0) parts.push(`contrast(${1 + contrast / 100})`)
    if (saturation !== 0) parts.push(`saturate(${1 + saturation / 100})`)
    // Temperature: warm (+) shifts hue toward orange/yellow (−30deg), cool (−) toward blue (+30deg)
    if (temperature !== 0) parts.push(`hue-rotate(${-(temperature * 0.3)}deg)`)
    return parts.length > 0 ? parts.join(' ') : undefined
}

/** Build CSS box-shadow from shadows array, scaled via CSS custom property */
function computeBoxShadow(shadows: Shadow[]): string | undefined {
    const visible = shadows.filter((s) => s.visible !== false)
    if (visible.length === 0) return undefined
    return visible
        .map((s) => {
            const inset = s.type === 'inner' ? 'inset ' : ''
            return `${inset}calc(${s.x}px * var(--z, 1)) calc(${s.y}px * var(--z, 1)) calc(${s.blur}px * var(--z, 1)) calc(${s.spread}px * var(--z, 1)) ${s.color}`
        })
        .join(', ')
}

/** Build box-shadow string from a solid border with inside/center/outside position support.
 *  Uses box-shadow exclusively so it never affects layout (unlike CSS border).
 *  Only applicable for solid borders — dashed/dotted fall back to CSS border. */
function computeBorderAsShadow(border: Border): string | undefined {
    if (border.visible === false) return undefined
    if (border.style !== 'solid' || border.width === 0) return undefined
    const { width, position = 'inside' } = border
    // Always use rgba — avoids rendering quirks with raw hex in box-shadow at opacity=1
    const color = hexOpacityToRgba(normaliseHex(border.color), border.opacity ?? 1)
    const w = `calc(${width}px * var(--z, 1))`
    if (position === 'inside') {
        return `inset 0 0 0 ${w} ${color}`
    } else if (position === 'outside') {
        return `0 0 0 ${w} ${color}`
    } else {
        // center: half inset + half outset
        const half = width / 2
        const hw = `calc(${half}px * var(--z, 1))`
        return `inset 0 0 0 ${hw} ${color}, 0 0 0 ${hw} ${color}`
    }
}

/** Build border/outline CSS for non-solid styles (dashed/dotted).
 *  CSS `outline` is used for center/outside positions since `border` only supports inside
 *  (box-sizing: border-box shrinks content area). Outline is drawn outside the layout box. */
function computeBorder(border?: Border): CSSProperties {
    if (!border || border.visible === false || border.style === 'solid') return {}
    // Always use rgba for consistency
    const color = hexOpacityToRgba(normaliseHex(border.color), border.opacity ?? 1)
    const w = `calc(${border.width}px * var(--z, 1))`
    const position = border.position ?? 'inside'

    if (position === 'inside') {
        return {
            borderWidth: w,
            borderStyle: border.style,
            borderColor: color,
        }
    }

    // center / outside → CSS outline (doesn't affect layout, follows border-radius in modern browsers)
    // outline-offset=0: outer edge of outline starts at element boundary → "outside"
    // outline-offset=-(width/2): outline straddles element boundary → "center"
    const outlineOffset = position === 'outside'
        ? '0px'
        : `calc(${-(border.width / 2)}px * var(--z, 1))`

    return {
        outlineWidth: w,
        outlineStyle: border.style as CSSProperties['outlineStyle'],
        outlineColor: color,
        outlineOffset,
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

    // ── Min/Max Constraints (Phase 4) ─────────────────────────
    // These override the flex-based minWidth/minHeight set above
    if (node.minWidth != null && node.minWidth > 0) {
        s.minWidth = `calc(${node.minWidth}px * var(--z, 1))`
    }
    if (node.maxWidth != null) {
        s.maxWidth = `calc(${node.maxWidth}px * var(--z, 1))`
    }
    if (node.minHeight != null && node.minHeight > 0) {
        s.minHeight = `calc(${node.minHeight}px * var(--z, 1))`
    }
    if (node.maxHeight != null) {
        s.maxHeight = `calc(${node.maxHeight}px * var(--z, 1))`
    }

    // ── Opacity ───────────────────────────────────────────────
    if (node.opacity < 1) s.opacity = node.opacity

    // ── Rotation + Flip ───────────────────────────────────────
    // Scale is applied first so flip stays relative to original axes when combined with rotation.
    // Both are encoded in one CSS transform string; separate assignments would overwrite each other.
    const transforms: string[] = []
    if (node.flipX) transforms.push('scaleX(-1)')
    if (node.flipY) transforms.push('scaleY(-1)')
    if (node.rotation !== 0) transforms.push(`rotate(${node.rotation}deg)`)
    if (transforms.length > 0) s.transform = transforms.join(' ')

    // ── Visual properties ─────────────────────────────────────
    Object.assign(s, computeBackground(node.fills))
    Object.assign(s, computeBorder(node.border))      // handles dashed/dotted only
    Object.assign(s, computeBorderRadius(node.borderRadius))

    // ── Box shadow — merge stroke + drop/inner shadows ────────
    // Must be ONE declaration: a second s.boxShadow assignment would silently overwrite.
    // Solid border stroke uses box-shadow for layout-safe inside/center/outside positioning.
    const shadowParts: string[] = []
    const borderShadow = node.border ? computeBorderAsShadow(node.border) : undefined
    if (borderShadow) shadowParts.push(borderShadow)
    const nodeShadow = computeBoxShadow(node.shadows)
    if (nodeShadow) shadowParts.push(nodeShadow)
    if (shadowParts.length > 0) s.boxShadow = shadowParts.join(', ')

    // Apply CSS filter from image fill adjustments (single image fill only)
    const visibleFills = node.fills.filter((f) => f.visible !== false)
    if (visibleFills.length === 1 && visibleFills[0].type === 'image') {
        const imgFilter = computeImageFillFilter(visibleFills[0])
        if (imgFilter) s.filter = imgFilter
    }

    // Apply blend mode from first visible fill (CSS mix-blend-mode on the element)
    const firstFill = visibleFills[0]
    if (firstFill?.blendMode && firstFill.blendMode !== 'NORMAL') {
        s.mixBlendMode = blendModeToCSS(firstFill.blendMode)
    }

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

    // ── Flex child properties (Phase 4) ───────────────────────
    // These apply when this frame is a child of a flex parent
    if (node.flexShrink != null) {
        s.flexShrink = node.flexShrink
    }
    if (node.flexBasis != null) {
        s.flexBasis = `calc(${node.flexBasis}px * var(--z, 1))`
    }
    if (node.order != null) {
        s.order = node.order
    }
    if (node.alignSelf && node.alignSelf !== 'auto') {
        s.alignSelf = ALIGN_MAP[node.alignSelf] ?? node.alignSelf
    }
    if (node.layoutGrow != null && node.layoutGrow > 0) {
        s.flexGrow = node.layoutGrow
    }

    // Padding
    Object.assign(s, computePadding(node.padding))

    // Overflow
    if (node.overflow === 'hidden') s.overflow = 'hidden'

    return s
}
