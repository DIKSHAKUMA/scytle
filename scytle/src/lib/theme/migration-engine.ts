/**
 * Migration Engine — assigns refs to existing nodes that were created before the theme system.
 *
 * Uses heuristic matching (color distance, exact number/string match) to find
 * the closest variable table entry for each linkable property on a node.
 *
 * Returns an array of NodeUpdate objects — does NOT mutate nodes directly.
 * The caller applies updates via the canvas store's batch update mechanism.
 */

import type { ScytleNode, FrameNode, TextNode } from '@/types/canvas'
import { buildLinkMaps, normalizeHex, normalizeShadow, type VariableTable, type ThemeMode, type LinkMaps } from './variable-table'

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface NodeUpdate {
    nodeId: string
    updates: Record<string, unknown>
}

// ═══════════════════════════════════════════════════
// Color Distance Matching
// ═══════════════════════════════════════════════════

function hexToRgb(hex: string): [number, number, number] {
    let h = hex.replace('#', '').trim()
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    return [
        parseInt(h.slice(0, 2), 16) || 0,
        parseInt(h.slice(2, 4), 16) || 0,
        parseInt(h.slice(4, 6), 16) || 0,
    ]
}

function colorDistance(a: string, b: string): number {
    const [r1, g1, b1] = hexToRgb(a)
    const [r2, g2, b2] = hexToRgb(b)
    return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2)
}

const COLOR_DISTANCE_THRESHOLD = 40

/**
 * Find the closest color variable by RGB distance.
 * Returns the variable key if within threshold, undefined otherwise.
 */
function matchColorFuzzy(hex: string, lm: LinkMaps): string | undefined {
    const normalized = normalizeHex(hex)
    // Try exact match first
    const exact = lm.colorMap.get(normalized)
    if (exact) return exact

    // Fuzzy match by RGB distance
    let bestRef: string | undefined
    let bestDist = COLOR_DISTANCE_THRESHOLD + 1
    for (const [varHex, varKey] of lm.colorMap) {
        const dist = colorDistance(normalized, varHex)
        if (dist < bestDist) {
            bestDist = dist
            bestRef = varKey
        }
    }
    return bestRef
}

// ═══════════════════════════════════════════════════
// Main Migration
// ═══════════════════════════════════════════════════

/**
 * Compute migration updates for an entire node tree.
 * Walks all nodes recursively, matching values to the variable table.
 * Returns a flat array of updates that can be applied via batch update.
 */
export function computeMigrationUpdates(
    rootNode: ScytleNode,
    table: VariableTable,
    mode: ThemeMode,
): NodeUpdate[] {
    if (Object.keys(table).length === 0) return []

    const lm = buildLinkMaps(table, mode)
    const updates: NodeUpdate[] = []

    walkNode(rootNode, lm, updates)

    return updates
}

function walkNode(node: ScytleNode, lm: LinkMaps, updates: NodeUpdate[]): void {
    if (node.type === 'frame') {
        migrateFrame(node as FrameNode, lm, updates)
        for (const child of (node as FrameNode).children) {
            walkNode(child, lm, updates)
        }
    } else if (node.type === 'text') {
        migrateText(node as TextNode, lm, updates)
    }
    // ImageNode and VectorNode don't have theme-linkable properties
}

function migrateFrame(node: FrameNode, lm: LinkMaps, updates: NodeUpdate[]): void {
    const u: Record<string, unknown> = {}
    let hasUpdates = false

    // Fill colors
    if (node.fills.length > 0) {
        const newFills = node.fills.map(fill => {
            if (fill.type === 'solid' && !fill.colorRef) {
                const ref = matchColorFuzzy(fill.color, lm)
                if (ref) {
                    hasUpdates = true
                    return { ...fill, colorRef: ref }
                }
            }
            return fill
        })
        if (hasUpdates) u.fills = newFills
    }

    // Border color
    if (node.border && !node.border.colorRef) {
        const ref = matchColorFuzzy(node.border.color, lm)
        if (ref) {
            u.border = { ...node.border, colorRef: ref }
            hasUpdates = true
        }
    }

    // Border radius
    if (!node.borderRadiusRef && typeof node.borderRadius === 'number' && node.borderRadius > 0) {
        const ref = lm.radiusMap.get(String(node.borderRadius))
        if (ref) {
            u.borderRadiusRef = ref
            hasUpdates = true
        }
    }

    // Padding
    if (!node.paddingRef) {
        const maxPad = Math.max(node.padding.top, node.padding.right, node.padding.bottom, node.padding.left)
        if (maxPad > 0) {
            const ref = lm.spacingMap.get(String(maxPad))
            if (ref) {
                u.paddingRef = ref
                hasUpdates = true
            }
        }
    }

    // Gap
    if (node.layout.gap && !node.layout.gapRef) {
        const ref = lm.spacingMap.get(String(node.layout.gap))
        if (ref) {
            u.layout = { ...node.layout, gapRef: ref }
            hasUpdates = true
        }
    }

    // Shadows
    if (node.shadows.length > 0 && !node.shadowRef) {
        const s = node.shadows[0]
        const shadowStr = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
        const ref = lm.shadowMap.get(normalizeShadow(shadowStr))
        if (ref) {
            u.shadowRef = ref
            hasUpdates = true
        }
    }

    if (hasUpdates) {
        updates.push({ nodeId: node.id, updates: u })
    }
}

function migrateText(node: TextNode, lm: LinkMaps, updates: NodeUpdate[]): void {
    const u: Record<string, unknown> = {}
    let hasUpdates = false

    // Color
    if (!node.colorRef) {
        const ref = matchColorFuzzy(node.color, lm)
        if (ref) {
            u.colorRef = ref
            hasUpdates = true
        }
    }

    // Font family
    if (!node.fontFamilyRef) {
        const clean = node.fontFamily.replace(/['"]/g, '').split(',')[0].trim().toLowerCase()
        const ref = lm.fontMap.get(clean)
        if (ref) {
            u.fontFamilyRef = ref
            hasUpdates = true
        }
    }

    // Font size
    if (!node.fontSizeRef) {
        const ref = lm.fontSizeMap.get(String(node.fontSize))
        if (ref) {
            u.fontSizeRef = ref
            hasUpdates = true
        }
    }

    // Fill colors (text nodes can have fills too)
    if (node.fills.length > 0) {
        let fillsChanged = false
        const newFills = node.fills.map(fill => {
            if (fill.type === 'solid' && !fill.colorRef) {
                const ref = matchColorFuzzy(fill.color, lm)
                if (ref) {
                    fillsChanged = true
                    return { ...fill, colorRef: ref }
                }
            }
            return fill
        })
        if (fillsChanged) {
            u.fills = newFills
            hasUpdates = true
        }
    }

    if (hasUpdates) {
        updates.push({ nodeId: node.id, updates: u })
    }
}

/**
 * Count the number of nodes that could benefit from migration
 * (i.e., have linkable properties without refs).
 */
export function countUnmigratedNodes(rootNode: ScytleNode): number {
    let count = 0

    function walk(node: ScytleNode): void {
        if (node.type === 'frame') {
            const frame = node as FrameNode
            const hasMissing =
                frame.fills.some(f => f.type === 'solid' && !f.colorRef) ||
                (frame.border && !frame.border.colorRef) ||
                (typeof frame.borderRadius === 'number' && frame.borderRadius > 0 && !frame.borderRadiusRef) ||
                (Math.max(frame.padding.top, frame.padding.right, frame.padding.bottom, frame.padding.left) > 0 && !frame.paddingRef) ||
                (frame.layout.gap && !frame.layout.gapRef)
            if (hasMissing) count++
            for (const child of frame.children) walk(child)
        } else if (node.type === 'text') {
            const text = node as TextNode
            if (!text.colorRef || !text.fontFamilyRef || !text.fontSizeRef) count++
        }
    }

    walk(rootNode)
    return count
}
