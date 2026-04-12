/**
 * Resolve-for-Render — Pure functions for resolving bound variables at render time.
 *
 * Used by render-utils.ts (which computes CSS objects, not React components).
 * No React, no hooks, no store access — takes data as arguments.
 *
 * Pattern: check boundVariables first → resolve via variable system → fall back to raw value.
 */

import type {
    Variable,
    VariableCollection,
    BoundVariables,
    RawVariableValue,
    ColorValue,
} from '@/lib/variables/types'
import { isColorValue } from '@/lib/variables/types'
import {
    resolveVariable,
    resolveBoundVariable,
    resolveBoundVariableAtIndex,
    colorValueToHex,
} from '@/lib/variables/resolve'

// ============================================================
// Resolve all bound variables for a node
// ============================================================

/**
 * Resolve all bound variables on a node into their raw values.
 * Returns a flat map of field → resolved raw value.
 *
 * For array fields (fills, strokes, effects), keys are "fills:0", "fills:1", etc.
 */
export function resolveNodeBindings(
    boundVariables: BoundVariables | undefined,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): Record<string, RawVariableValue> {
    if (!boundVariables) return {}

    const result: Record<string, RawVariableValue> = {}

    for (const [field, binding] of Object.entries(boundVariables)) {
        if (!binding) continue

        if (Array.isArray(binding)) {
            // Array field (fills, strokes, effects)
            for (let i = 0; i < binding.length; i++) {
                const alias = binding[i]
                if (!alias) continue
                const resolved = resolveVariable(alias.id, modeId, variables, collections)
                if (resolved !== undefined) {
                    result[`${field}:${i}`] = resolved
                }
            }
        } else {
            // Simple field
            const resolved = resolveBoundVariable(field, boundVariables, modeId, variables, collections)
            if (resolved !== undefined) {
                result[field] = resolved
            }
        }
    }

    return result
}

// ============================================================
// Convenience resolvers (type-safe wrappers)
// ============================================================

/**
 * Resolve a bound color variable for a fill/stroke/effect at a given index.
 * Returns hex string or undefined.
 */
export function resolveBoundColor(
    field: string,
    index: number,
    boundVariables: BoundVariables | undefined,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): string | undefined {
    const raw = resolveBoundVariableAtIndex(field, index, boundVariables, modeId, variables, collections)
    if (raw === undefined) return undefined
    if (isColorValue(raw)) return colorValueToHex(raw)
    if (typeof raw === 'string') return raw
    return undefined
}

/**
 * Resolve a bound color variable for a simple field (text color, border color).
 * Returns hex string or undefined.
 */
export function resolveBoundSimpleColor(
    field: string,
    boundVariables: BoundVariables | undefined,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): string | undefined {
    const raw = resolveBoundVariable(field, boundVariables, modeId, variables, collections)
    if (raw === undefined) return undefined
    if (isColorValue(raw)) return colorValueToHex(raw)
    if (typeof raw === 'string') return raw
    return undefined
}

/**
 * Resolve a bound number variable (fontSize, gap, radius, etc.).
 * Returns number or undefined.
 */
export function resolveBoundNumber(
    field: string,
    boundVariables: BoundVariables | undefined,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): number | undefined {
    const raw = resolveBoundVariable(field, boundVariables, modeId, variables, collections)
    if (typeof raw === 'number') return raw
    return undefined
}

/**
 * Resolve a bound string variable (fontFamily, characters, etc.).
 * Returns string or undefined.
 */
export function resolveBoundString(
    field: string,
    boundVariables: BoundVariables | undefined,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): string | undefined {
    const raw = resolveBoundVariable(field, boundVariables, modeId, variables, collections)
    if (typeof raw === 'string') return raw
    return undefined
}

/**
 * Resolve a bound boolean variable (visible, etc.).
 * Returns boolean or undefined.
 */
export function resolveBoundBoolean(
    field: string,
    boundVariables: BoundVariables | undefined,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): boolean | undefined {
    const raw = resolveBoundVariable(field, boundVariables, modeId, variables, collections)
    if (typeof raw === 'boolean') return raw
    return undefined
}

// ============================================================
// Color value utilities for render pipeline
// ============================================================

/**
 * Convert a resolved raw value to a CSS-ready color string.
 * Handles both ColorValue objects and hex strings.
 */
export function rawValueToColor(value: RawVariableValue): string | undefined {
    if (isColorValue(value)) return colorValueToHex(value as ColorValue)
    if (typeof value === 'string') return value
    return undefined
}
