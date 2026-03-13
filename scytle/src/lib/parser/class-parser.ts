// ============================================================
// Tailwind CSS Class → Property Parser
// Converts a list of Tailwind utility classes into structured
// style properties that map to ScytleNode fields.
// ============================================================

import { resolveColor } from './color-map'

// ---- Lookup Maps ----

const FONT_SIZES: Record<string, number> = {
    xs: 12, sm: 14, base: 16, lg: 18, xl: 20,
    '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48, '6xl': 60,
    '7xl': 72, '8xl': 96, '9xl': 128,
}

const FONT_WEIGHTS: Record<string, number> = {
    thin: 100, extralight: 200, light: 300, normal: 400,
    medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900,
}

const BORDER_RADIUS_MAP: Record<string, number> = {
    none: 0, sm: 2, DEFAULT: 4, md: 6, lg: 8,
    xl: 12, '2xl': 16, '3xl': 24, full: 9999,
}

const LINE_HEIGHTS: Record<string, number> = {
    none: 1, tight: 1.25, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2,
}

const LETTER_SPACINGS: Record<string, number> = {
    tighter: -0.05, tight: -0.025, normal: 0, wide: 0.025, wider: 0.05, widest: 0.1,
}

const MAX_WIDTHS: Record<string, number> = {
    xs: 320, sm: 384, md: 448, lg: 512, xl: 576,
    '2xl': 672, '3xl': 768, '4xl': 896, '5xl': 1024, '6xl': 1152, '7xl': 1280,
    'screen-sm': 640, 'screen-md': 768, 'screen-lg': 1024, 'screen-xl': 1280, 'screen-2xl': 1536,
    prose: 672, full: 9999,
}

type ShadowDef = Array<{ type: 'drop' | 'inner'; x: number; y: number; blur: number; spread: number; color: string }>

const SHADOWS: Record<string, ShadowDef> = {
    sm: [{ type: 'drop', x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,0.05)' }],
    DEFAULT: [
        { type: 'drop', x: 0, y: 1, blur: 3, spread: 0, color: 'rgba(0,0,0,0.1)' },
        { type: 'drop', x: 0, y: 1, blur: 2, spread: -1, color: 'rgba(0,0,0,0.1)' },
    ],
    md: [
        { type: 'drop', x: 0, y: 4, blur: 6, spread: -1, color: 'rgba(0,0,0,0.1)' },
        { type: 'drop', x: 0, y: 2, blur: 4, spread: -2, color: 'rgba(0,0,0,0.1)' },
    ],
    lg: [
        { type: 'drop', x: 0, y: 10, blur: 15, spread: -3, color: 'rgba(0,0,0,0.1)' },
        { type: 'drop', x: 0, y: 4, blur: 6, spread: -4, color: 'rgba(0,0,0,0.1)' },
    ],
    xl: [
        { type: 'drop', x: 0, y: 20, blur: 25, spread: -5, color: 'rgba(0,0,0,0.1)' },
        { type: 'drop', x: 0, y: 8, blur: 10, spread: -6, color: 'rgba(0,0,0,0.1)' },
    ],
    '2xl': [{ type: 'drop', x: 0, y: 25, blur: 50, spread: -12, color: 'rgba(0,0,0,0.25)' }],
    inner: [{ type: 'inner', x: 0, y: 2, blur: 4, spread: 0, color: 'rgba(0,0,0,0.05)' }],
    none: [],
}

const GRADIENT_DIRS: Record<string, string> = {
    t: 'to top', tr: 'to top right', r: 'to right', br: 'to bottom right',
    b: 'to bottom', bl: 'to bottom left', l: 'to left', tl: 'to top left',
}

const TEXT_ALIGNS = new Set(['left', 'center', 'right', 'justify'] as const)
const BORDER_WIDTHS = new Set(['0', '2', '4', '8'])

// ---- Public Types ----

export interface ParsedStyles {
    // Layout
    display: 'flex' | 'grid' | 'block' | 'inline-flex' | 'inline' | 'none'
    flexDirection: 'row' | 'column'
    justifyContent: 'start' | 'end' | 'center' | 'between'
    alignItems: 'start' | 'end' | 'center' | 'stretch' | 'baseline'
    flexWrap: boolean
    gap: number
    gridColumns: number

    // Spacing
    padding: { top: number; right: number; bottom: number; left: number }
    margin: { top: number; right: number; bottom: number; left: number }

    // Typography
    fontSize: number
    fontWeight: number
    fontFamily: 'Inter' | 'serif' | 'mono'
    fontStyle: 'normal' | 'italic'
    textAlign: 'left' | 'center' | 'right' | 'justify'
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
    textDecoration: 'none' | 'underline' | 'line-through'
    letterSpacing: number
    lineHeight: number
    textColor: string | null

    // Background
    bgColor: string | null
    gradient: string | null

    // Border
    borderWidth: number
    borderColor: string
    borderStyle: 'solid' | 'dashed' | 'dotted' | 'none'
    borderRadius: number
    borderRadiusPerCorner: { topLeft: number; topRight: number; bottomRight: number; bottomLeft: number } | null

    // Effects
    shadows: ShadowDef
    opacity: number
    overflow: 'visible' | 'hidden' | 'auto'

    // Sizing
    width: number | null
    height: number | null
    maxWidth: number | null
    minHeight: number | null
    widthRatio: number | null

    // Misc
    hidden: boolean
    position: 'static' | 'relative' | 'absolute' | 'fixed'
    flexGrow: boolean
    aspectRatio: string | null
}

// ---- Helpers ----

/** Resolve Tailwind spacing value to pixels. Standard scale: n×4, 'px'→1, arbitrary [Npx] */
function resolveSpacing(value: string): number {
    if (value === '0') return 0
    if (value === 'px') return 1
    const arb = value.match(/^\[(.+?)\]$/)
    if (arb) {
        const inner = arb[1]
        if (inner.endsWith('px')) return parseFloat(inner)
        if (inner.endsWith('rem')) return parseFloat(inner) * 16
        return parseFloat(inner) || 0
    }
    const num = parseFloat(value)
    return !isNaN(num) ? num * 4 : 0
}

/** Extract numeric px value from an arbitrary bracket expression */
function resolveArbitrary(value: string): number | null {
    const m = value.match(/^\[(.+?)\]$/)
    if (!m) return null
    const inner = m[1]
    if (inner.endsWith('px')) return parseFloat(inner)
    if (inner.endsWith('rem')) return parseFloat(inner) * 16
    if (inner.endsWith('%')) return null // Can't convert % to px
    const n = parseFloat(inner)
    return isNaN(n) ? null : n
}

// Width fraction patterns → ratio
const WIDTH_FRACTIONS: Record<string, number> = {
    '1/2': 0.5, '1/3': 1 / 3, '2/3': 2 / 3,
    '1/4': 0.25, '2/4': 0.5, '3/4': 0.75,
    '1/5': 0.2, '2/5': 0.4, '3/5': 0.6, '4/5': 0.8,
    '1/6': 1 / 6, '2/6': 1 / 3, '3/6': 0.5, '4/6': 2 / 3, '5/6': 5 / 6,
    '1/12': 1 / 12, '2/12': 1 / 6, '3/12': 0.25, '4/12': 1 / 3,
    '5/12': 5 / 12, '6/12': 0.5, '7/12': 7 / 12, '8/12': 2 / 3,
    '9/12': 0.75, '10/12': 5 / 6, '11/12': 11 / 12,
}

// ---- Main Parser ----

export function defaultStyles(): ParsedStyles {
    return {
        display: 'block',
        flexDirection: 'row',
        justifyContent: 'start',
        alignItems: 'stretch',
        flexWrap: false,
        gap: 0,
        gridColumns: 1,
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        fontSize: 16,
        fontWeight: 400,
        fontFamily: 'Inter',
        fontStyle: 'normal',
        textAlign: 'left',
        textTransform: 'none',
        textDecoration: 'none',
        letterSpacing: 0,
        lineHeight: 1.5,
        textColor: null,
        bgColor: null,
        gradient: null,
        borderWidth: 0,
        borderColor: '#e5e7eb',
        borderStyle: 'none',
        borderRadius: 0,
        borderRadiusPerCorner: null,
        shadows: [],
        opacity: 1,
        overflow: 'visible',
        width: null,
        height: null,
        maxWidth: null,
        minHeight: null,
        widthRatio: null,
        hidden: false,
        position: 'static',
        flexGrow: false,
        aspectRatio: null,
    }
}

export function parseClasses(classList: string[]): ParsedStyles {
    const s = defaultStyles()

    // Gradient parts (collected, then built into CSS gradient)
    let gradientDir: string | undefined
    let gradientFrom: string | undefined
    let gradientVia: string | undefined
    let gradientTo: string | undefined

    for (const raw of classList) {
        // Skip responsive, dark, hover, focus, and other state prefixes
        if (raw.includes(':')) continue

        // ---- Layout ----
        if (raw === 'flex') { s.display = 'flex'; continue }
        if (raw === 'inline-flex') { s.display = 'inline-flex'; continue }
        if (raw === 'grid') { s.display = 'grid'; continue }
        if (raw === 'block') { s.display = 'block'; continue }
        if (raw === 'inline') { s.display = 'inline'; continue }
        if (raw === 'hidden') { s.hidden = true; s.display = 'none'; continue }
        if (raw === 'flex-col' || raw === 'flex-column') { s.flexDirection = 'column'; continue }
        if (raw === 'flex-row') { s.flexDirection = 'row'; continue }
        if (raw === 'flex-wrap') { s.flexWrap = true; continue }
        if (raw === 'flex-nowrap') { s.flexWrap = false; continue }
        if (raw === 'flex-1' || raw === 'flex-grow' || raw === 'grow') { s.flexGrow = true; continue }
        if (raw === 'flex-none') { s.flexGrow = false; continue }
        if (raw === 'items-start') { s.alignItems = 'start'; continue }
        if (raw === 'items-end') { s.alignItems = 'end'; continue }
        if (raw === 'items-center') { s.alignItems = 'center'; continue }
        if (raw === 'items-stretch') { s.alignItems = 'stretch'; continue }
        if (raw === 'items-baseline') { s.alignItems = 'baseline'; continue }
        if (raw === 'justify-start') { s.justifyContent = 'start'; continue }
        if (raw === 'justify-end') { s.justifyContent = 'end'; continue }
        if (raw === 'justify-center') { s.justifyContent = 'center'; continue }
        if (raw === 'justify-between') { s.justifyContent = 'between'; continue }
        if (raw === 'self-center' || raw === 'self-auto') { continue } // skip self align for now

        // ---- Overflow ----
        if (raw === 'overflow-hidden') { s.overflow = 'hidden'; continue }
        if (raw === 'overflow-visible') { s.overflow = 'visible'; continue }
        if (raw === 'overflow-auto' || raw === 'overflow-scroll') { s.overflow = 'auto'; continue }

        // ---- Position ----
        if (raw === 'relative') { s.position = 'relative'; continue }
        if (raw === 'absolute') { s.position = 'absolute'; continue }
        if (raw === 'fixed') { s.position = 'fixed'; continue }
        if (raw === 'sticky') { s.position = 'relative'; continue } // approximate

        // ---- Text transform / decoration ----
        if (raw === 'uppercase') { s.textTransform = 'uppercase'; continue }
        if (raw === 'lowercase') { s.textTransform = 'lowercase'; continue }
        if (raw === 'capitalize') { s.textTransform = 'capitalize'; continue }
        if (raw === 'normal-case') { s.textTransform = 'none'; continue }
        if (raw === 'underline') { s.textDecoration = 'underline'; continue }
        if (raw === 'line-through') { s.textDecoration = 'line-through'; continue }
        if (raw === 'no-underline') { s.textDecoration = 'none'; continue }
        if (raw === 'italic') { s.fontStyle = 'italic'; continue }
        if (raw === 'not-italic') { s.fontStyle = 'normal'; continue }

        // ---- Aspect ratio ----
        if (raw === 'aspect-square') { s.aspectRatio = '1/1'; continue }
        if (raw === 'aspect-video') { s.aspectRatio = '16/9'; continue }
        if (raw === 'aspect-auto') { s.aspectRatio = null; continue }

        // ---- Gap ----
        if (raw.startsWith('gap-')) {
            const val = raw.slice(4)
            if (raw.startsWith('gap-x-') || raw.startsWith('gap-y-')) {
                // We simplify to uniform gap
                s.gap = resolveSpacing(val.slice(2))
            } else {
                s.gap = resolveSpacing(val)
            }
            continue
        }

        // ---- Space-x / Space-y → treat as gap ----
        if (raw.startsWith('space-x-') || raw.startsWith('space-y-')) {
            const val = raw.startsWith('space-x-') ? raw.slice(8) : raw.slice(8)
            s.gap = resolveSpacing(val)
            // Also imply flex so the gap is applied
            if (s.display === 'block') {
                s.display = 'flex'
                s.flexDirection = raw.startsWith('space-x-') ? 'row' : 'column'
            }
            continue
        }

        // ---- Grid columns ----
        if (raw.startsWith('grid-cols-')) {
            const val = raw.slice(10)
            const n = parseInt(val)
            if (!isNaN(n)) s.gridColumns = n
            continue
        }

        // ---- Padding ----
        if (raw.startsWith('p-') && !raw.startsWith('pl-') && !raw.startsWith('pr-') && !raw.startsWith('pt-') && !raw.startsWith('pb-') && !raw.startsWith('px-') && !raw.startsWith('py-')) {
            const v = resolveSpacing(raw.slice(2))
            s.padding = { top: v, right: v, bottom: v, left: v }
            continue
        }
        if (raw.startsWith('px-')) { const v = resolveSpacing(raw.slice(3)); s.padding.left = v; s.padding.right = v; continue }
        if (raw.startsWith('py-')) { const v = resolveSpacing(raw.slice(3)); s.padding.top = v; s.padding.bottom = v; continue }
        if (raw.startsWith('pt-')) { s.padding.top = resolveSpacing(raw.slice(3)); continue }
        if (raw.startsWith('pr-')) { s.padding.right = resolveSpacing(raw.slice(3)); continue }
        if (raw.startsWith('pb-')) { s.padding.bottom = resolveSpacing(raw.slice(3)); continue }
        if (raw.startsWith('pl-')) { s.padding.left = resolveSpacing(raw.slice(3)); continue }

        // ---- Margin ----
        if (raw.startsWith('m-') && !raw.startsWith('ml-') && !raw.startsWith('mr-') && !raw.startsWith('mt-') && !raw.startsWith('mb-') && !raw.startsWith('mx-') && !raw.startsWith('my-') && !raw.startsWith('max-') && !raw.startsWith('min-')) {
            const v = resolveSpacing(raw.slice(2))
            s.margin = { top: v, right: v, bottom: v, left: v }
            continue
        }
        if (raw.startsWith('mx-')) { const v = resolveSpacing(raw.slice(3)); s.margin.left = v; s.margin.right = v; continue }
        if (raw.startsWith('my-')) { const v = resolveSpacing(raw.slice(3)); s.margin.top = v; s.margin.bottom = v; continue }
        if (raw.startsWith('mt-')) { s.margin.top = resolveSpacing(raw.slice(3)); continue }
        if (raw.startsWith('mr-')) { s.margin.right = resolveSpacing(raw.slice(3)); continue }
        if (raw.startsWith('mb-')) { s.margin.bottom = resolveSpacing(raw.slice(3)); continue }
        if (raw.startsWith('ml-')) { s.margin.left = resolveSpacing(raw.slice(3)); continue }

        // ---- Width ----
        if (raw.startsWith('w-')) {
            const val = raw.slice(2)
            if (val === 'full') { s.widthRatio = 1; continue }
            if (val === 'screen') { s.width = 1440; continue }
            if (val === 'auto') { continue }
            if (val === 'fit' || val === 'min' || val === 'max') { continue }
            if (WIDTH_FRACTIONS[val] !== undefined) { s.widthRatio = WIDTH_FRACTIONS[val]; continue }
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.width = arb; continue }
            const px = resolveSpacing(val)
            if (px > 0) { s.width = px; continue }
            continue
        }

        // ---- Height ----
        if (raw.startsWith('h-')) {
            const val = raw.slice(2)
            if (val === 'full' || val === 'screen') { s.height = 900; continue } // approximate viewport
            if (val === 'auto' || val === 'fit' || val === 'min' || val === 'max') { continue }
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.height = arb; continue }
            const px = resolveSpacing(val)
            if (px > 0) { s.height = px; continue }
            continue
        }

        // ---- Max-width ----
        if (raw.startsWith('max-w-')) {
            const val = raw.slice(6)
            if (MAX_WIDTHS[val] !== undefined) { s.maxWidth = MAX_WIDTHS[val]; continue }
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.maxWidth = arb; continue }
            continue
        }

        // ---- Min-height ----
        if (raw.startsWith('min-h-')) {
            const val = raw.slice(6)
            if (val === 'screen') { s.minHeight = 900; continue }
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.minHeight = arb; continue }
            const px = resolveSpacing(val)
            if (px > 0) { s.minHeight = px; continue }
            continue
        }

        // ---- Font weight / family ----
        if (raw.startsWith('font-')) {
            const val = raw.slice(5)
            if (FONT_WEIGHTS[val] !== undefined) { s.fontWeight = FONT_WEIGHTS[val]; continue }
            if (val === 'sans') { s.fontFamily = 'Inter'; continue }
            if (val === 'serif') { s.fontFamily = 'serif'; continue }
            if (val === 'mono') { s.fontFamily = 'mono'; continue }
            continue
        }

        // ---- Text (align / size / color — disambiguate) ----
        if (raw.startsWith('text-')) {
            const val = raw.slice(5)
            // 1. Text align
            if (TEXT_ALIGNS.has(val as 'left' | 'center' | 'right' | 'justify')) {
                s.textAlign = val as 'left' | 'center' | 'right' | 'justify'
                continue
            }
            // 2. Text size
            if (FONT_SIZES[val] !== undefined) {
                s.fontSize = FONT_SIZES[val]
                continue
            }
            // 3. Arbitrary value
            if (val.startsWith('[')) {
                // Could be color or size
                if (val.match(/^\[#[0-9a-fA-F]/)) {
                    s.textColor = resolveColor(val)
                } else if (val.match(/^\[\d/)) {
                    const arb = resolveArbitrary(val)
                    if (arb !== null) s.fontSize = arb
                } else {
                    // Could be rgb(), oklch(), etc.
                    s.textColor = resolveColor(val)
                }
                continue
            }
            // 4. Tailwind text-wrap/nowrap/balance/pretty — skip
            if (val === 'wrap' || val === 'nowrap' || val === 'balance' || val === 'pretty') continue
            // 5. Color name
            const hex = resolveColor(val)
            if (hex) { s.textColor = hex; continue }
            continue
        }

        // ---- Background (color / gradient) ----
        if (raw.startsWith('bg-')) {
            const val = raw.slice(3)
            // Gradient direction
            if (val.startsWith('gradient-to-')) {
                const dir = val.slice(12)
                gradientDir = GRADIENT_DIRS[dir] || 'to bottom'
                continue
            }
            // Transparent / current / inherit
            if (val === 'transparent') { s.bgColor = 'transparent'; continue }
            if (val === 'current') { continue }
            if (val === 'inherit') { continue }
            // Arbitrary
            if (val.startsWith('[')) {
                s.bgColor = resolveColor(val)
                continue
            }
            // Named color
            const hex = resolveColor(val)
            if (hex) { s.bgColor = hex; continue }
            continue
        }

        // ---- Gradient stops ----
        if (raw.startsWith('from-')) {
            const val = raw.slice(5)
            gradientFrom = resolveColor(val) || undefined
            continue
        }
        if (raw.startsWith('via-')) {
            const val = raw.slice(4)
            gradientVia = resolveColor(val) || undefined
            continue
        }
        if (raw.startsWith('to-')) {
            const val = raw.slice(3)
            gradientTo = resolveColor(val) || undefined
            continue
        }

        // ---- Border width / style / color ----
        if (raw === 'border') { s.borderWidth = 1; s.borderStyle = 'solid'; continue }
        if (raw === 'border-solid') { s.borderStyle = 'solid'; continue }
        if (raw === 'border-dashed') { s.borderStyle = 'dashed'; continue }
        if (raw === 'border-dotted') { s.borderStyle = 'dotted'; continue }
        if (raw === 'border-none') { s.borderStyle = 'none'; s.borderWidth = 0; continue }
        if (raw.startsWith('border-')) {
            const val = raw.slice(7)
            // border-t, border-r, border-b, border-l (simplify to uniform 1px)
            if (val === 't' || val === 'r' || val === 'b' || val === 'l') {
                s.borderWidth = Math.max(s.borderWidth, 1)
                s.borderStyle = 'solid'
                continue
            }
            // border-0, border-2, border-4, border-8
            if (BORDER_WIDTHS.has(val)) {
                s.borderWidth = parseInt(val)
                if (s.borderWidth > 0) s.borderStyle = 'solid'
                continue
            }
            // Arbitrary width: border-[3px]
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.borderWidth = arb; s.borderStyle = 'solid'; continue }
            // Color
            const hex = resolveColor(val)
            if (hex) { s.borderColor = hex; continue }
            continue
        }

        // ---- Border radius ----
        if (raw === 'rounded') { s.borderRadius = BORDER_RADIUS_MAP.DEFAULT; continue }
        if (raw.startsWith('rounded-')) {
            const val = raw.slice(8)
            // Per-corner: rounded-t-*, rounded-b-*, rounded-l-*, rounded-r-*
            // Per-corner individual: rounded-tl-*, rounded-tr-*, rounded-bl-*, rounded-br-*
            if (val.startsWith('t-') || val.startsWith('b-') || val.startsWith('l-') || val.startsWith('r-') ||
                val.startsWith('tl-') || val.startsWith('tr-') || val.startsWith('bl-') || val.startsWith('br-')) {
                // Parse the radius value
                const parts = val.split('-')
                const side = parts[0]
                const sizeKey = parts.slice(1).join('-')
                const radius = BORDER_RADIUS_MAP[sizeKey] ?? resolveArbitrary(sizeKey) ?? BORDER_RADIUS_MAP.DEFAULT
                const pc = s.borderRadiusPerCorner || { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 }
                if (side === 't') { pc.topLeft = radius; pc.topRight = radius }
                else if (side === 'b') { pc.bottomLeft = radius; pc.bottomRight = radius }
                else if (side === 'l') { pc.topLeft = radius; pc.bottomLeft = radius }
                else if (side === 'r') { pc.topRight = radius; pc.bottomRight = radius }
                else if (side === 'tl') { pc.topLeft = radius }
                else if (side === 'tr') { pc.topRight = radius }
                else if (side === 'bl') { pc.bottomLeft = radius }
                else if (side === 'br') { pc.bottomRight = radius }
                s.borderRadiusPerCorner = pc
                continue
            }
            // Uniform
            if (BORDER_RADIUS_MAP[val] !== undefined) { s.borderRadius = BORDER_RADIUS_MAP[val]; continue }
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.borderRadius = arb; continue }
            continue
        }

        // ---- Shadows ----
        if (raw === 'shadow') { s.shadows = SHADOWS.DEFAULT; continue }
        if (raw.startsWith('shadow-')) {
            const val = raw.slice(7)
            if (SHADOWS[val]) { s.shadows = SHADOWS[val]; continue }
            continue
        }

        // ---- Opacity ----
        if (raw.startsWith('opacity-')) {
            const val = raw.slice(8)
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.opacity = arb / 100; continue }
            const num = parseInt(val)
            if (!isNaN(num)) { s.opacity = num / 100; continue }
            continue
        }

        // ---- Line height ----
        if (raw.startsWith('leading-')) {
            const val = raw.slice(8)
            if (LINE_HEIGHTS[val] !== undefined) { s.lineHeight = LINE_HEIGHTS[val]; continue }
            // Numeric leading (leading-3 through leading-10): convert to multiplier
            const num = parseFloat(val)
            if (!isNaN(num)) {
                const px = num * 4
                s.lineHeight = px / (s.fontSize || 16)
                continue
            }
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.lineHeight = arb / (s.fontSize || 16); continue }
            continue
        }

        // ---- Letter spacing ----
        if (raw.startsWith('tracking-')) {
            const val = raw.slice(9)
            if (LETTER_SPACINGS[val] !== undefined) { s.letterSpacing = LETTER_SPACINGS[val]; continue }
            const arb = resolveArbitrary(val)
            if (arb !== null) { s.letterSpacing = arb; continue }
            continue
        }

        // Unrecognized class — skip
    }

    // ---- Post-processing: build gradient ----
    if (gradientDir && gradientFrom) {
        const stops = [gradientFrom]
        if (gradientVia) stops.push(gradientVia)
        stops.push(gradientTo || 'transparent')
        s.gradient = `linear-gradient(${gradientDir}, ${stops.join(', ')})`
    }

    return s
}

/** Parse inline style="" attribute into partial styles (fallback for non-Tailwind output) */
export function parseInlineStyles(style: string): Partial<ParsedStyles> {
    const result: Partial<ParsedStyles> = {}
    const props = style.split(';').map(s => s.trim()).filter(Boolean)
    for (const prop of props) {
        const colonIdx = prop.indexOf(':')
        if (colonIdx === -1) continue
        const key = prop.slice(0, colonIdx).trim()
        const value = prop.slice(colonIdx + 1).trim()

        switch (key) {
            case 'color': result.textColor = value; break
            case 'background-color': result.bgColor = value; break
            case 'background': {
                if (value.includes('gradient')) result.gradient = value
                else result.bgColor = value
                break
            }
            case 'font-size': result.fontSize = parseFloat(value); break
            case 'font-weight': result.fontWeight = parseInt(value); break
            case 'text-align': result.textAlign = value as ParsedStyles['textAlign']; break
            case 'border-radius': result.borderRadius = parseFloat(value); break
            case 'opacity': result.opacity = parseFloat(value); break
            case 'padding': {
                const parts = value.split(/\s+/).map(v => parseFloat(v))
                if (parts.length === 1) result.padding = { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] }
                else if (parts.length === 2) result.padding = { top: parts[0], right: parts[1], bottom: parts[0], left: parts[1] }
                else if (parts.length === 4) result.padding = { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] }
                break
            }
        }
    }
    return result
}
