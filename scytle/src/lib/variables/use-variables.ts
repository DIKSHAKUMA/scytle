/**
 * React Hooks for Variable Resolution — used by canvas components.
 *
 * These hooks read from the variable store and resolve bound variables
 * for display on the canvas. They provide a migration-friendly API:
 * components check new system first, fall back to old *Ref fields.
 *
 * Usage:
 *   const resolved = useResolvedVariables(node.boundVariables)
 *   const color = resolved.fills?.[0] ?? node.fills[0]?.color
 */

'use client'

import { useMemo } from 'react'
import { useVariableStore } from '@/store/variable-store'
import type {
    BoundVariables,
    RawVariableValue,
    Variable,
    VariableResolvedDataType,
} from '@/lib/variables/types'
import { isColorValue } from '@/lib/variables/types'
import { resolveVariable, colorValueToHex, resolveBoundVariable } from '@/lib/variables/resolve'
import {
    resolveBoundColor,
    resolveBoundSimpleColor,
    resolveBoundNumber,
    resolveBoundString,
} from '@/lib/variables/resolve-for-render'

// ============================================================
// Types
// ============================================================

/** Resolved bindings in render-friendly format */
export interface ResolvedBindings {
    /** Resolved fill colors by index (hex strings) */
    fills: Record<number, string>
    /** Resolved stroke colors by index */
    strokes: Record<number, string>
    /** Resolved effect colors by index */
    effects: Record<number, string>
    /** Resolved simple field values */
    [field: string]: RawVariableValue | Record<number, string> | undefined
}

// ============================================================
// Main Hook
// ============================================================

/**
 * Resolve all bound variables for a node.
 * Returns a ResolvedBindings object with resolved values.
 *
 * Reads from the variable store (reactive — rerenders on store changes).
 */
export function useResolvedVariables(
    boundVariables: BoundVariables | undefined,
): ResolvedBindings {
    const variables = useVariableStore(s => s.variables)
    const collections = useVariableStore(s => s.collections)
    const activeModeId = useVariableStore(s => s.activeModeId)

    return useMemo(() => {
        const result: ResolvedBindings = {
            fills: {},
            strokes: {},
            effects: {},
        }

        if (!boundVariables || !activeModeId) return result

        for (const [field, binding] of Object.entries(boundVariables)) {
            if (!binding) continue

            if (Array.isArray(binding)) {
                // Array field (fills, strokes, effects)
                const colorMap: Record<number, string> = {}
                for (let i = 0; i < binding.length; i++) {
                    const alias = binding[i]
                    if (!alias) continue
                    const resolved = resolveVariable(alias.id, activeModeId, variables, collections)
                    if (resolved !== undefined) {
                        if (isColorValue(resolved)) {
                            colorMap[i] = colorValueToHex(resolved)
                        } else if (typeof resolved === 'string') {
                            colorMap[i] = resolved
                        }
                    }
                }
                if (field === 'fills' || field === 'strokes' || field === 'effects') {
                    result[field] = colorMap
                }
            } else {
                // Simple field
                const resolved = resolveBoundVariable(field, boundVariables, activeModeId, variables, collections)
                if (resolved !== undefined) {
                    result[field] = resolved
                }
            }
        }

        return result
    }, [boundVariables, activeModeId, variables, collections])
}

// ============================================================
// Convenience Hooks
// ============================================================

/**
 * Resolve a fill color from bound variables.
 * Returns hex string or undefined.
 */
export function useResolvedFillColor(
    boundVariables: BoundVariables | undefined,
    fillIndex: number,
): string | undefined {
    const variables = useVariableStore(s => s.variables)
    const collections = useVariableStore(s => s.collections)
    const activeModeId = useVariableStore(s => s.activeModeId)

    return useMemo(() => {
        if (!activeModeId) return undefined
        return resolveBoundColor('fills', fillIndex, boundVariables, activeModeId, variables, collections)
    }, [boundVariables, fillIndex, activeModeId, variables, collections])
}

/**
 * Resolve a number field from bound variables (fontSize, gap, radius, etc.).
 * Returns number or undefined.
 */
export function useResolvedNumber(
    boundVariables: BoundVariables | undefined,
    field: string,
): number | undefined {
    const variables = useVariableStore(s => s.variables)
    const collections = useVariableStore(s => s.collections)
    const activeModeId = useVariableStore(s => s.activeModeId)

    return useMemo(() => {
        if (!activeModeId) return undefined
        return resolveBoundNumber(field, boundVariables, activeModeId, variables, collections)
    }, [boundVariables, field, activeModeId, variables, collections])
}

/**
 * Resolve a string field from bound variables (fontFamily, characters, etc.).
 * Returns string or undefined.
 */
export function useResolvedString(
    boundVariables: BoundVariables | undefined,
    field: string,
): string | undefined {
    const variables = useVariableStore(s => s.variables)
    const collections = useVariableStore(s => s.collections)
    const activeModeId = useVariableStore(s => s.activeModeId)

    return useMemo(() => {
        if (!activeModeId) return undefined
        return resolveBoundString(field, boundVariables, activeModeId, variables, collections)
    }, [boundVariables, field, activeModeId, variables, collections])
}

/**
 * Get display info for a variable (for properties panel).
 * Returns the resolved value as a string + its type.
 */
export function useVariableDisplayValue(
    variableId: string | undefined,
): { value: string; type: VariableResolvedDataType } | undefined {
    const variables = useVariableStore(s => s.variables)
    const collections = useVariableStore(s => s.collections)
    const activeModeId = useVariableStore(s => s.activeModeId)

    return useMemo(() => {
        if (!variableId || !activeModeId) return undefined

        const variable = variables.get(variableId)
        if (!variable) return undefined

        const resolved = resolveVariable(variableId, activeModeId, variables, collections)
        if (resolved === undefined) return undefined

        let value: string
        if (isColorValue(resolved)) {
            value = colorValueToHex(resolved)
        } else {
            value = String(resolved)
        }

        return { value, type: variable.resolvedType }
    }, [variableId, activeModeId, variables, collections])
}
