/**
 * Variable Resolution Engine — Pure functions for resolving variables.
 *
 * This is the core of the variable system:
 *   1. resolveVariable() — follows alias chains to get a raw value
 *   2. resolveMode() — walks parent hierarchy for mode inheritance
 *   3. resolveBoundVariable() — resolves a node field's bound variable
 *
 * All functions are pure (no React, no stores) — they take data as arguments.
 * This makes them testable and usable in both render and non-render contexts.
 */

import type {
    Variable,
    VariableCollection,
    VariableValue,
    RawVariableValue,
    BoundVariables,
    ExplicitVariableModes,
    ColorValue,
} from './types'
import { isVariableAlias, MAX_ALIAS_DEPTH } from './types'

// ============================================================
// Core Resolution
// ============================================================

/**
 * Resolve a variable's value for a given mode, following alias chains.
 *
 * Algorithm:
 *   1. Look up variable by ID
 *   2. Get value for the requested modeId
 *   3. If value is a VariableAlias, follow to referenced variable
 *   4. Repeat until raw value found or maxDepth exceeded
 *
 * Returns undefined if:
 *   - Variable not found
 *   - Mode not found in valuesByMode
 *   - Alias chain breaks (dangling reference)
 *   - Circular alias detected (maxDepth exceeded)
 */
export function resolveVariable(
    variableId: string,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    maxDepth: number = MAX_ALIAS_DEPTH,
): RawVariableValue | undefined {
    let currentId = variableId
    let depth = 0

    while (depth < maxDepth) {
        const variable = variables.get(currentId)
        if (!variable) return undefined

        // Get the value for the requested mode
        let value: VariableValue | undefined = variable.valuesByMode[modeId]

        // If no value for this specific mode, try the collection's default mode
        if (value === undefined) {
            const collection = collections.get(variable.variableCollectionId)
            if (collection && modeId !== collection.defaultModeId) {
                value = variable.valuesByMode[collection.defaultModeId]
            }
        }

        if (value === undefined) return undefined

        // If it's a raw value, we're done
        if (!isVariableAlias(value)) {
            return value
        }

        // Follow the alias
        currentId = value.id
        depth++

        // When following an alias to a different collection, we need to resolve
        // using the target variable's collection's mode. For cross-collection
        // aliases, we use the target collection's default mode since the source
        // mode may not exist in the target collection.
        const targetVar = variables.get(currentId)
        if (targetVar && targetVar.variableCollectionId !== variable.variableCollectionId) {
            const targetCollection = collections.get(targetVar.variableCollectionId)
            if (targetCollection) {
                // Check if target collection has a mode matching the name
                const sourceCollection = collections.get(variable.variableCollectionId)
                const sourceModeName = sourceCollection?.modes.find(m => m.modeId === modeId)?.name
                const matchingMode = sourceModeName
                    ? targetCollection.modes.find(m => m.name === sourceModeName)
                    : undefined
                modeId = matchingMode?.modeId ?? targetCollection.defaultModeId
            }
        }
    }

    // Max depth exceeded — likely a circular reference
    return undefined
}

// ============================================================
// Mode Resolution (Inheritance)
// ============================================================

/**
 * Determine which mode to use for a collection when rendering a specific node.
 *
 * Resolution order:
 *   1. Check if this node has an explicit mode set for this collection
 *   2. Walk UP parent hierarchy looking for nearest ancestor with explicit mode
 *   3. Fall back to collection's defaultModeId
 *
 * This is how theming works in Figma: set mode on a frame/section/page,
 * all children inherit.
 */
export function resolveMode(
    collectionId: string,
    nodeId: string,
    getParent: (id: string) => string | undefined,
    getExplicitModes: (id: string) => ExplicitVariableModes | undefined,
    collection: VariableCollection,
): string {
    let currentId: string | undefined = nodeId

    while (currentId) {
        const modes = getExplicitModes(currentId)
        if (modes && modes[collectionId]) {
            return modes[collectionId]
        }
        currentId = getParent(currentId)
    }

    return collection.defaultModeId
}

// ============================================================
// Bound Variable Resolution
// ============================================================

/**
 * Resolve a bound variable for a specific field on a node.
 *
 * For simple fields (width, opacity, fontFamily, etc.):
 *   - boundVariables[field] is a single VariableAlias
 *
 * For array fields (fills, strokes, effects):
 *   - Use resolveBoundVariableAtIndex() instead
 *
 * Returns undefined if:
 *   - No boundVariables on the node
 *   - No binding for this field
 *   - Variable resolution fails
 */
export function resolveBoundVariable(
    field: string,
    boundVariables: BoundVariables | undefined,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): RawVariableValue | undefined {
    if (!boundVariables) return undefined

    const binding = boundVariables[field]
    if (!binding || Array.isArray(binding)) return undefined

    // Single binding (not array)
    if (isVariableAlias(binding)) {
        return resolveVariable(binding.id, modeId, variables, collections)
    }

    return undefined
}

/**
 * Resolve a bound variable for an array field at a specific index.
 * Used for fills[i], strokes[i], effects[i].
 */
export function resolveBoundVariableAtIndex(
    field: string,
    index: number,
    boundVariables: BoundVariables | undefined,
    modeId: string,
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
): RawVariableValue | undefined {
    if (!boundVariables) return undefined

    const binding = boundVariables[field]
    if (!binding || !Array.isArray(binding)) return undefined

    const alias = binding[index]
    if (!alias || !isVariableAlias(alias)) return undefined

    return resolveVariable(alias.id, modeId, variables, collections)
}

// ============================================================
// Color Conversion Helpers
// ============================================================

/**
 * Convert a Figma ColorValue (0-1 range) to a CSS hex string.
 * Alpha < 1 produces 8-digit hex (#rrggbbaa), otherwise 6-digit (#rrggbb).
 */
export function colorValueToHex(color: ColorValue): string {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)

    const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`

    if (color.a < 1) {
        const a = Math.round(color.a * 255)
        return hex + a.toString(16).padStart(2, '0')
    }

    return hex
}

/**
 * Convert a CSS hex string to a Figma ColorValue (0-1 range).
 * Supports 3, 6, and 8 digit hex (with or without #).
 */
export function hexToColorValue(hex: string): ColorValue {
    let h = hex.replace('#', '').trim()

    // Expand shorthand (3 digit)
    if (h.length === 3) {
        h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2]
    }

    const r = parseInt(h.slice(0, 2), 16) / 255
    const g = parseInt(h.slice(2, 4), 16) / 255
    const b = parseInt(h.slice(4, 6), 16) / 255
    const a = h.length >= 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1

    return { r, g, b, a }
}

/**
 * Convert a ColorValue to a CSS rgba() string.
 */
export function colorValueToRgba(color: ColorValue): string {
    const r = Math.round(color.r * 255)
    const g = Math.round(color.g * 255)
    const b = Math.round(color.b * 255)

    if (color.a < 1) {
        return `rgba(${r}, ${g}, ${b}, ${Number(color.a.toFixed(2))})`
    }

    return `rgb(${r}, ${g}, ${b})`
}

// ============================================================
// Validation Helpers
// ============================================================

/**
 * Check if creating an alias from sourceId -> targetId would create a cycle.
 * Walks the alias chain from targetId to see if it ever reaches sourceId.
 */
export function wouldCreateCycle(
    sourceVariableId: string,
    targetVariableId: string,
    modeId: string,
    variables: Map<string, Variable>,
): boolean {
    if (sourceVariableId === targetVariableId) return true

    let currentId = targetVariableId
    let depth = 0

    while (depth < MAX_ALIAS_DEPTH) {
        const variable = variables.get(currentId)
        if (!variable) return false

        const value = variable.valuesByMode[modeId]
        if (!value || !isVariableAlias(value)) return false

        if (value.id === sourceVariableId) return true

        currentId = value.id
        depth++
    }

    return true // Max depth = assume cycle
}

/**
 * Get the alias chain for a variable in a given mode.
 * Returns array of variable IDs from source to final raw value.
 * Useful for UI display (showing alias pills).
 */
export function getAliasChain(
    variableId: string,
    modeId: string,
    variables: Map<string, Variable>,
): string[] {
    const chain: string[] = [variableId]
    let currentId = variableId
    let depth = 0

    while (depth < MAX_ALIAS_DEPTH) {
        const variable = variables.get(currentId)
        if (!variable) break

        const value = variable.valuesByMode[modeId]
        if (!value || !isVariableAlias(value)) break

        chain.push(value.id)
        currentId = value.id
        depth++
    }

    return chain
}
