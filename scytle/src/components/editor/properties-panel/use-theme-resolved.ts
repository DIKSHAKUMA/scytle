/**
 * Variable-aware resolution utilities for the Properties Panel.
 *
 * These helpers let each Design Tab section:
 *   1. Detect whether a property is linked to a variable
 *   2. Check boundVariables on nodes
 *
 * Uses the new Figma-clone variable system (boundVariables).
 */

import type { BoundVariables } from '@/lib/variables/types'

// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════

/**
 * Check if a property is bound to a variable (NEW system).
 * Checks the node's boundVariables for the given field.
 */
export function isVariableLinked(
    field: string,
    boundVariables?: BoundVariables,
): boolean {
    if (!boundVariables) return false
    const binding = boundVariables[field]
    if (!binding) return false
    return true
}

/**
 * Check if a fill at a given index is bound to a variable (NEW system).
 */
export function isFillVariableLinked(
    index: number,
    boundVariables?: BoundVariables,
): boolean {
    if (!boundVariables) return false
    const fills = boundVariables.fills
    if (!fills || !Array.isArray(fills)) return false
    return !!fills[index]
}

/**
 * Legacy helper — always returns false now that old ref system is removed.
 * Kept for backward compat with any remaining callers.
 */
export function isThemeLinked(_ref?: string, _detached?: boolean): boolean {
    return false
}

/**
 * Check if a property is linked via the new variable system.
 */
export function isPropertyLinked(
    field: string,
    boundVariables?: BoundVariables,
): boolean {
    return isVariableLinked(field, boundVariables)
}
