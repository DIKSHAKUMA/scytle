/**
 * Semantic Node Relinker — assigns theme variable refs to nodes based on
 * their semantic role (HTML tag, visual characteristics, tree position).
 *
 * This solves the problem where the AI generates colors that don't exactly
 * match the variable table, leaving nodes with no refs. Instead of exact-match,
 * we classify each node by its role and assign the appropriate ref.
 *
 * Called:
 *   1. After parseHtmlToNodes() — to fill in any refs that exact-matching missed
 *   2. When the theme changes — to update all existing nodes with new refs
 */

import type { ScytleNode, FrameNode, TextNode, Fill } from '@/types/canvas'
import type { VariableTable, ThemeMode } from './variable-table'

// ═══════════════════════════════════════════════════
// Color Classification
// ═══════════════════════════════════════════════════

/** Parse hex to [r, g, b] */
function hexToRgb(hex: string): [number, number, number] {
    let h = hex.replace('#', '').trim()
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    const r = parseInt(h.slice(0, 2), 16) || 0
    const g = parseInt(h.slice(2, 4), 16) || 0
    const b = parseInt(h.slice(4, 6), 16) || 0
    return [r, g, b]
}

/** Perceived luminance (0 = black, 1 = white) */
function luminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

/** Is the color "light" (suitable for backgrounds in light mode)? */
function isLightColor(hex: string): boolean {
    return luminance(hex) > 0.85
}

/** Is the color "dark" (suitable for text in light mode / bg in dark mode)? */
function isDarkColor(hex: string): boolean {
    return luminance(hex) < 0.25
}

/** Is the color "mid-range" (potential accent or secondary text)? */
function isMidColor(hex: string): boolean {
    const l = luminance(hex)
    return l >= 0.25 && l <= 0.85
}

/** Euclidean distance between two hex colors */
function colorDistance(a: string, b: string): number {
    const [r1, g1, b1] = hexToRgb(a)
    const [r2, g2, b2] = hexToRgb(b)
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

// ═══════════════════════════════════════════════════
// Semantic Role Classification
// ═══════════════════════════════════════════════════

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
const BODY_TAGS = new Set(['p', 'span', 'a', 'li'])

/** Map heading tag to fontSize ref */
function headingTagToFontSizeRef(tag: string): string | undefined {
    switch (tag) {
        case 'h1': return 'fontSize/h1'
        case 'h2': return 'fontSize/h2'
        case 'h3': return 'fontSize/h3'
        // h4-h6: use h3 ref as closest match
        case 'h4': case 'h5': case 'h6': return 'fontSize/h3'
        default: return undefined
    }
}

// ═══════════════════════════════════════════════════
// Classify fill color → variable ref
// ═══════════════════════════════════════════════════

function classifyFillColor(
    color: string,
    mode: ThemeMode,
    table: VariableTable,
    isButtonLike: boolean,
): string | undefined {
    // First: try exact match with known table colors
    const accent = table['accent']?.[mode]
    const bgPrimary = table['bg/primary']?.[mode]
    const bgSecondary = table['bg/secondary']?.[mode]
    const border = table['border']?.[mode]

    if (!accent) return undefined

    const dist = (a: string, b: string) => colorDistance(a.toLowerCase(), b.toLowerCase())

    // Very close to accent → accent
    if (dist(color, accent) < 60) return 'accent'

    // Very close to bg/primary → bg/primary
    if (bgPrimary && dist(color, bgPrimary) < 30) return 'bg/primary'

    // Very close to bg/secondary → bg/secondary
    if (bgSecondary && dist(color, bgSecondary) < 40) return 'bg/secondary'

    // For buttons: saturated mid-tones are likely accent
    if (isButtonLike && isMidColor(color)) return 'accent'

    // Light colors → bg/primary or bg/secondary
    if (isLightColor(color)) {
        // Near-white → bg/primary
        if (luminance(color) > 0.95) return 'bg/primary'
        return 'bg/secondary'
    }

    // Dark colors — only classify if we're in dark mode (where dark fills are expected
    // as bg/primary). In light mode, dark fills are intentionally dark sections
    // (e.g. dark hero, dark footer) and should NOT be relinked to bg/primary (white).
    if (isDarkColor(color) && mode === 'dark') {
        if (bgPrimary && dist(color, bgPrimary) < 40) return 'bg/primary'
    }

    // Saturated mid-tones → accent
    if (isMidColor(color)) {
        const [r, g, b] = hexToRgb(color)
        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        const saturation = max === 0 ? 0 : (max - min) / max
        if (saturation > 0.3) return 'accent'
    }

    // Unmatched colors — don't force-assign a ref, leave as literal
    return undefined
}

// ═══════════════════════════════════════════════════
// Classify text color → variable ref
// ═══════════════════════════════════════════════════

function classifyTextColor(
    color: string,
    mode: ThemeMode,
    table: VariableTable,
    parentFillRef?: string,
    tag?: string,
): string {
    const accent = table['accent']?.[mode]
    const textPrimary = table['text/primary']?.[mode]
    const textSecondary = table['text/secondary']?.[mode]
    const textOnAccent = table['text/on-accent']?.[mode]

    const dist = (a: string, b: string) => colorDistance(a.toLowerCase(), b.toLowerCase())

    // Text on accent-colored parents
    if (parentFillRef === 'accent') return 'text/on-accent'

    // Exact-ish matches first — check accent BEFORE text/primary
    // since accent text (links, CTAs) must not be misclassified as body text
    if (accent && dist(color, accent) < 50) return 'accent'
    if (textPrimary && dist(color, textPrimary) < 40) return 'text/primary'
    if (textSecondary && dist(color, textSecondary) < 40) return 'text/secondary'
    if (textOnAccent && dist(color, textOnAccent) < 30) return 'text/on-accent'

    // Headings → primary text
    if (tag && HEADING_TAGS.has(tag)) return 'text/primary'

    // Light text on dark backgrounds → text/on-accent or text/primary (dark mode behavior)
    if (isLightColor(color)) {
        if (parentFillRef === 'bg/primary' && mode === 'dark') return 'text/primary'
        return 'text/on-accent'
    }

    // Dark text → primary or secondary based on darkness
    if (isDarkColor(color)) return 'text/primary'

    // Mid-tone text (muted/secondary)
    return 'text/secondary'
}

// ═══════════════════════════════════════════════════
// Node Name Heuristics
// ═══════════════════════════════════════════════════

function isButtonLikeName(name: string): boolean {
    const lower = name.toLowerCase()
    return lower.includes('button') || lower.includes('btn') ||
           lower.includes('cta') || lower.includes('submit') ||
           lower.includes('order') || lower.includes('sign up') ||
           lower.includes('get started') || lower.includes('learn more') ||
           lower.includes('shop now') || lower.includes('buy')
}

function isNavLikeName(name: string): boolean {
    const lower = name.toLowerCase()
    return lower === 'nav' || lower === 'navbar' || lower === 'navigation' ||
           lower.startsWith('nav ')
}

function isCardLikeName(name: string): boolean {
    const lower = name.toLowerCase()
    return lower.includes('card') || lower.includes('item') ||
           lower.includes('feature') || lower.includes('testimonial')
}

function isFooterLikeName(name: string): boolean {
    const lower = name.toLowerCase()
    return lower === 'footer' || lower.startsWith('footer ')
}

// ═══════════════════════════════════════════════════
// Main Relink Logic
// ═══════════════════════════════════════════════════

/**
 * Walk a node tree and assign semantic variable refs to all nodes.
 * Mutates nodes in-place and returns the same tree.
 */
export function relinkNodes(
    nodes: ScytleNode[],
    table: VariableTable,
    mode: ThemeMode,
): ScytleNode[] {
    if (Object.keys(table).length === 0) return nodes

    for (const node of nodes) {
        relinkNode(node, table, mode, undefined)
    }
    return nodes
}

function relinkNode(
    node: ScytleNode,
    table: VariableTable,
    mode: ThemeMode,
    parentFillRef: string | undefined,
): void {
    switch (node.type) {
        case 'frame':
            relinkFrame(node, table, mode, parentFillRef)
            break
        case 'text':
            relinkText(node, table, mode, parentFillRef)
            break
        case 'image':
            // Images: assign border radius ref
            if (typeof node.borderRadius === 'number' && node.borderRadius > 0 && !node.borderRadiusDetached) {
                node.borderRadiusRef = closestRadiusRef(node.borderRadius, table, mode)
            }
            break
        case 'vector':
            // Vectors: assign fill color ref
            for (const fill of node.fills) {
                if (fill.type === 'solid' && fill.color && !fill.detached) {
                    fill.colorRef = classifyFillColor(fill.color, mode, table, false)
                }
            }
            break
    }
}

function relinkFrame(
    node: FrameNode,
    table: VariableTable,
    mode: ThemeMode,
    parentFillRef: string | undefined,
): void {
    const name = node.name || ''
    const isButton = isButtonLikeName(name)
    const isCard = isCardLikeName(name)
    const isNav = isNavLikeName(name)
    const isFooter = isFooterLikeName(name)

    // ── Fills ──
    let thisFillRef: string | undefined
    for (const fill of node.fills) {
        if (fill.type === 'solid' && fill.color && !fill.detached) {
            const ref = classifyFillColor(fill.color, mode, table, isButton)
            fill.colorRef = ref
            if (!thisFillRef) thisFillRef = ref
        } else if (fill.type === 'solid' && fill.colorRef) {
            // Even if detached, track the existing ref for child context
            if (!thisFillRef) thisFillRef = fill.colorRef
        }
    }

    // ── Border ──
    if (node.border && node.border.color && !node.border.detached) {
        node.border.colorRef = 'border'
    }

    // ── Border radius ──
    if (typeof node.borderRadius === 'number' && node.borderRadius > 0 && !node.borderRadiusDetached) {
        if (isButton) {
            node.borderRadiusRef = 'radius/sm'
        } else if (isCard) {
            node.borderRadiusRef = 'radius/md'
        } else {
            node.borderRadiusRef = closestRadiusRef(node.borderRadius, table, mode)
        }
    }

    // ── Padding ──
    if (node.padding && !node.paddingDetached) {
        const maxPad = Math.max(node.padding.top, node.padding.right, node.padding.bottom, node.padding.left)
        if (maxPad > 0) {
            node.paddingRef = closestSpacingRef(maxPad, table, mode)
        }
    }

    // ── Gap ──
    if (node.layout.gap != null && node.layout.gap > 0 && !node.layout.gapDetached) {
        node.layout.gapRef = closestSpacingRef(node.layout.gap, table, mode)
    }

    // ── Shadows ──
    if (node.shadows.length > 0 && !node.shadowDetached) {
        node.shadowRef = 'shadow/sm'
    }

    // ── Recurse children ──
    if (node.children) {
        for (const child of node.children) {
            relinkNode(child, table, mode, thisFillRef)
        }
    }
}

function relinkText(
    node: TextNode,
    table: VariableTable,
    mode: ThemeMode,
    parentFillRef: string | undefined,
): void {
    const tag = node.htmlTag

    // ── Font family ref ──
    if (!node.fontFamilyDetached) {
        if (tag && HEADING_TAGS.has(tag)) {
            node.fontFamilyRef = 'font/heading'
        } else {
            node.fontFamilyRef = 'font/body'
        }
    }

    // ── Font weight ref ──
    if (!node.fontWeightDetached) {
        if (tag && HEADING_TAGS.has(tag)) {
            node.fontWeightRef = 'fontWeight/heading'
        } else {
            node.fontWeightRef = 'fontWeight/body'
        }
    }

    // ── Font size ref ──
    if (!node.fontSizeDetached) {
        if (tag && HEADING_TAGS.has(tag)) {
            node.fontSizeRef = headingTagToFontSizeRef(tag)
        } else if (node.fontSize <= 18) {
            node.fontSizeRef = 'fontSize/body'
        } else {
            // Mid-range text (18-32px) — assign closest fontSize ref
            node.fontSizeRef = closestFontSizeRef(node.fontSize, table, mode)
        }
    }

    // ── Color ref ──
    if (!node.colorDetached) {
        node.colorRef = classifyTextColor(
            node.color, mode, table, parentFillRef, tag ?? undefined,
        )
    }
}

// ═══════════════════════════════════════════════════
// Helpers — Closest Ref Matching
// ═══════════════════════════════════════════════════

function closestRadiusRef(value: number, table: VariableTable, mode: ThemeMode): string {
    const refs = ['radius/sm', 'radius/md', 'radius/lg']
    let closest = refs[0]
    let minDist = Infinity
    for (const ref of refs) {
        const tv = table[ref]?.[mode]
        if (!tv) continue
        const d = Math.abs(value - parseFloat(tv))
        if (d < minDist) { minDist = d; closest = ref }
    }
    return closest
}

function closestSpacingRef(value: number, table: VariableTable, mode: ThemeMode): string {
    const refs = ['spacing/sm', 'spacing/md', 'spacing/lg', 'spacing/gap']
    let closest = refs[0]
    let minDist = Infinity
    for (const ref of refs) {
        const tv = table[ref]?.[mode]
        if (!tv) continue
        const d = Math.abs(value - parseFloat(tv))
        if (d < minDist) { minDist = d; closest = ref }
    }
    return closest
}

function closestFontSizeRef(value: number, table: VariableTable, mode: ThemeMode): string {
    const refs = ['fontSize/h1', 'fontSize/h2', 'fontSize/h3', 'fontSize/body']
    let closest = 'fontSize/body'
    let minDist = Infinity
    for (const ref of refs) {
        const tv = table[ref]?.[mode]
        if (!tv) continue
        const d = Math.abs(value - parseFloat(tv))
        if (d < minDist) { minDist = d; closest = ref }
    }
    return closest
}
