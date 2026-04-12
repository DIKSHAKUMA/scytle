/**
 * Semantic Node Relinker (New Variable System)
 *
 * Same semantic heuristics as the old relinker (luminance, CIE76 ΔE,
 * tag classification) but outputs boundVariables instead of individual *Ref fields.
 *
 * Called:
 *   1. After parseHtmlToNodes() — to fill in any bindings that exact-matching missed
 *   2. When the user switches modes — to update all existing nodes
 *
 * Key difference from old relinker: works with variable IDs (not ref key strings),
 * resolves values from the variable store, and writes to node.boundVariables.
 */

import type { ScytleNode, FrameNode, TextNode, Fill, BorderRadius } from '@/types/canvas'
import type { Variable, VariableCollection, VariableAlias, BoundVariables } from '@/lib/variables/types'
import { isColorValue } from '@/lib/variables/types'
import { resolveVariable, colorValueToHex } from '@/lib/variables/resolve'

// Import color distance from old theme system (reuse existing utility)
import { deltaE } from '@/lib/theme/color-distance'

// ═══════════════════════════════════════════════════
// Color Classification (same as old relinker)
// ═══════════════════════════════════════════════════

function hexToRgb(hex: string): [number, number, number] {
    let h = hex.replace('#', '').trim()
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    const r = parseInt(h.slice(0, 2), 16) || 0
    const g = parseInt(h.slice(2, 4), 16) || 0
    const b = parseInt(h.slice(4, 6), 16) || 0
    return [r, g, b]
}

function luminance(hex: string): number {
    const [r, g, b] = hexToRgb(hex)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

function isLightColor(hex: string): boolean {
    return luminance(hex) > 0.85
}

function isDarkColor(hex: string): boolean {
    return luminance(hex) < 0.25
}

function isMidColor(hex: string): boolean {
    const l = luminance(hex)
    return l >= 0.25 && l <= 0.85
}

function colorDist(a: string, b: string): number {
    return deltaE(a.toLowerCase(), b.toLowerCase())
}

// ═══════════════════════════════════════════════════
// Variable Lookup Helpers
// ═══════════════════════════════════════════════════

/** Resolve a variable's value as a hex color string for comparison */
function resolveVarAsHex(
    varId: string,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): string | undefined {
    const raw = resolveVariable(varId, modeId, variables, collections)
    if (raw === undefined) return undefined
    if (isColorValue(raw)) return colorValueToHex(raw)
    if (typeof raw === 'string') return raw
    return undefined
}

/** Resolve a variable's value as a number */
function resolveVarAsNumber(
    varId: string,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): number | undefined {
    const raw = resolveVariable(varId, modeId, variables, collections)
    if (typeof raw === 'number') return raw
    return undefined
}

/** Create a VariableAlias binding */
function alias(variableId: string): VariableAlias {
    return { type: 'VARIABLE_ALIAS', id: variableId }
}

/** Find a variable by name pattern (case-insensitive partial match) */
function findVarByNamePattern(
    pattern: string,
    variables: Map<string, Variable>,
): Variable | undefined {
    const lower = pattern.toLowerCase()
    for (const [, v] of variables) {
        if (v.name.toLowerCase().includes(lower)) return v
    }
    return undefined
}

/** Find the closest color variable to a given hex */
function findClosestColorVar(
    targetHex: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
    maxDistance: number = 25,
): string | undefined {
    let closest: string | undefined
    let minDist = maxDistance

    for (const [varId, v] of variables) {
        if (v.resolvedType !== 'COLOR') continue
        const varHex = resolveVarAsHex(varId, modeId, variables, collections)
        if (!varHex) continue

        const dist = colorDist(targetHex, varHex)
        if (dist < minDist) {
            minDist = dist
            closest = varId
        }
    }

    return closest
}

/** Find the closest numeric variable to a given value */
function findClosestNumberVar(
    targetValue: number,
    namePattern: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
): string | undefined {
    let closest: string | undefined
    let minDist = Infinity
    const lowerPattern = namePattern.toLowerCase()

    for (const [varId, v] of variables) {
        if (v.resolvedType !== 'FLOAT') continue
        if (!v.name.toLowerCase().includes(lowerPattern)) continue

        const val = resolveVarAsNumber(varId, modeId, variables, collections)
        if (val === undefined) continue

        const dist = Math.abs(targetValue - val)
        if (dist < minDist) {
            minDist = dist
            closest = varId
        }
    }

    return closest
}

// ═══════════════════════════════════════════════════
// Semantic Role Classification
// ═══════════════════════════════════════════════════

const HEADING_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

function isButtonLikeName(name: string): boolean {
    const lower = name.toLowerCase()
    return lower.includes('button') || lower.includes('btn') ||
        lower.includes('cta') || lower.includes('submit') ||
        lower.includes('order') || lower.includes('sign up') ||
        lower.includes('get started') || lower.includes('learn more')
}

function isCardLikeName(name: string): boolean {
    const lower = name.toLowerCase()
    return lower.includes('card') || lower.includes('item') ||
        lower.includes('feature') || lower.includes('testimonial')
}

// ═══════════════════════════════════════════════════
// Main Relink Logic
// ═══════════════════════════════════════════════════

/**
 * Walk a node tree and assign boundVariables to all nodes.
 * Mutates nodes in-place and returns the same tree.
 *
 * This is the NEW relinker — outputs boundVariables instead of *Ref fields.
 */
export function relinkNodesWithVariables(
    nodes: ScytleNode[],
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
): ScytleNode[] {
    if (variables.size === 0) return nodes

    for (const node of nodes) {
        relinkNode(node, variables, collections, modeId, undefined)
    }
    return nodes
}

function relinkNode(
    node: ScytleNode,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
    parentFillVarId: string | undefined,
): void {
    // Initialize boundVariables if not present
    if (!node.boundVariables) {
        node.boundVariables = {}
    }

    switch (node.type) {
        case 'frame':
            relinkFrame(node, variables, collections, modeId, parentFillVarId)
            break
        case 'text':
            relinkText(node, variables, collections, modeId, parentFillVarId)
            break
        case 'image':
            relinkImage(node, variables, collections, modeId)
            break
        case 'vector':
            relinkVector(node, variables, collections, modeId)
            break
    }
}

function relinkFrame(
    node: FrameNode,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
    parentFillVarId: string | undefined,
): void {
    const name = node.name || ''
    const isButton = isButtonLikeName(name)
    const isCard = isCardLikeName(name)
    const bv = node.boundVariables!

    // ── Fills ──
    let thisFillVarId: string | undefined
    for (let i = 0; i < node.fills.length; i++) {
        const fill = node.fills[i]
        if (fill.type !== 'solid' || !fill.color) continue
        // Skip if already bound
        if (bv.fills && Array.isArray(bv.fills) && bv.fills[i]) {
            thisFillVarId = bv.fills[i]?.id
            continue
        }

        const varId = findClosestColorVar(fill.color, variables, collections, modeId)
        if (varId) {
            if (!bv.fills || !Array.isArray(bv.fills)) bv.fills = []
            ;(bv.fills as VariableAlias[])[i] = alias(varId)
            if (!thisFillVarId) thisFillVarId = varId
        }
    }

    // ── Border ──
    if (node.border && node.border.color && !bv.strokeColor) {
        const borderVarId = findClosestColorVar(node.border.color, variables, collections, modeId, 30)
        if (borderVarId) {
            bv.strokeColor = alias(borderVarId)
        }
    }

    // ── Border radius ──
    if (typeof node.borderRadius === 'number' && node.borderRadius > 0 && !bv.topLeftRadius) {
        const radiusVarId = findClosestNumberVar(node.borderRadius, 'radius', variables, collections, modeId)
        if (radiusVarId) {
            bv.topLeftRadius = alias(radiusVarId)
            bv.topRightRadius = alias(radiusVarId)
            bv.bottomLeftRadius = alias(radiusVarId)
            bv.bottomRightRadius = alias(radiusVarId)
        }
    }

    // ── Padding ──
    if (node.padding && !bv.paddingTop) {
        const maxPad = Math.max(node.padding.top, node.padding.right, node.padding.bottom, node.padding.left)
        if (maxPad > 0) {
            const spacingVarId = findClosestNumberVar(maxPad, 'spacing', variables, collections, modeId)
            if (spacingVarId) {
                bv.paddingTop = alias(spacingVarId)
                bv.paddingRight = alias(spacingVarId)
                bv.paddingBottom = alias(spacingVarId)
                bv.paddingLeft = alias(spacingVarId)
            }
        }
    }

    // ── Gap ──
    if (node.layout.gap != null && node.layout.gap > 0 && !bv.itemSpacing) {
        const gapVarId = findClosestNumberVar(node.layout.gap, 'spacing', variables, collections, modeId)
            ?? findClosestNumberVar(node.layout.gap, 'gap', variables, collections, modeId)
        if (gapVarId) {
            bv.itemSpacing = alias(gapVarId)
        }
    }

    // ── Recurse children ──
    if (node.children) {
        for (const child of node.children) {
            relinkNode(child, variables, collections, modeId, thisFillVarId)
        }
    }
}

function relinkText(
    node: TextNode,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
    parentFillVarId: string | undefined,
): void {
    const tag = node.htmlTag
    const bv = node.boundVariables!

    // ── Font family ──
    if (!bv.fontFamily) {
        const isHeading = tag && HEADING_TAGS.has(tag)
        // Try to find a font variable matching this font name
        const fontPattern = isHeading ? 'heading' : 'body'
        const fontVarId = findVarByNamePattern(`font/${fontPattern}`, variables)
            ?? findVarByNamePattern(`font`, variables)
        if (fontVarId) {
            bv.fontFamily = alias(fontVarId.id)
        }
    }

    // ── Font size ──
    if (!bv.fontSize) {
        const fontSizeVarId = findClosestNumberVar(node.fontSize, 'fontSize', variables, collections, modeId)
            ?? findClosestNumberVar(node.fontSize, 'font-size', variables, collections, modeId)
            ?? findClosestNumberVar(node.fontSize, 'size', variables, collections, modeId)
        if (fontSizeVarId) {
            bv.fontSize = alias(fontSizeVarId)
        }
    }

    // ── Font weight ──
    if (!bv.fontWeight) {
        const fwVarId = findClosestNumberVar(node.fontWeight, 'fontWeight', variables, collections, modeId)
            ?? findClosestNumberVar(node.fontWeight, 'font-weight', variables, collections, modeId)
            ?? findClosestNumberVar(node.fontWeight, 'weight', variables, collections, modeId)
        if (fwVarId) {
            bv.fontWeight = alias(fwVarId)
        }
    }

    // ── Color ──
    if (!bv.color) {
        const colorVarId = findClosestColorVar(node.color, variables, collections, modeId)
        if (colorVarId) {
            bv.color = alias(colorVarId)
        }
    }
}

function relinkImage(
    node: ScytleNode,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
): void {
    const bv = node.boundVariables!

    // Border radius
    if (typeof node.borderRadius === 'number' && node.borderRadius > 0 && !bv.topLeftRadius) {
        const radiusVarId = findClosestNumberVar(node.borderRadius, 'radius', variables, collections, modeId)
        if (radiusVarId) {
            bv.topLeftRadius = alias(radiusVarId)
            bv.topRightRadius = alias(radiusVarId)
            bv.bottomLeftRadius = alias(radiusVarId)
            bv.bottomRightRadius = alias(radiusVarId)
        }
    }
}

function relinkVector(
    node: ScytleNode,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
): void {
    const bv = node.boundVariables!

    // Fill colors
    for (let i = 0; i < node.fills.length; i++) {
        const fill = node.fills[i]
        if (fill.type !== 'solid' || !fill.color) continue
        if (bv.fills && Array.isArray(bv.fills) && bv.fills[i]) continue

        const varId = findClosestColorVar(fill.color, variables, collections, modeId)
        if (varId) {
            if (!bv.fills || !Array.isArray(bv.fills)) bv.fills = []
            ;(bv.fills as VariableAlias[])[i] = alias(varId)
        }
    }
}
