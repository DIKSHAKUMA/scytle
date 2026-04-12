/**
 * Build Link Maps — Reverse lookup tables from variable store for the parser.
 *
 * The parser uses these to do exact-match binding during node creation:
 *   "#3B82F6" → look up in colorMap → "var:42" → bind to boundVariables
 *
 * Same concept as old buildLinkMaps() in variable-table.ts, but reads from
 * the new Variable objects instead of a flat VariableTable.
 */

import type { Variable, VariableCollection, ColorValue } from '@/lib/variables/types'
import { isVariableAlias, isColorValue } from '@/lib/variables/types'
import { resolveVariable, colorValueToHex } from '@/lib/variables/resolve'

// ============================================================
// Types
// ============================================================

export interface VariableLinkMaps {
    /** hex (normalized, lowercase) → variableId */
    colorMap: Map<string, string>
    /** font family (lowercase) → variableId */
    fontMap: Map<string, string>
    /** radius string → variableId */
    radiusMap: Map<string, string>
    /** spacing string → variableId */
    spacingMap: Map<string, string>
    /** shadow CSS string → variableId */
    shadowMap: Map<string, string>
    /** font size string → variableId */
    fontSizeMap: Map<string, string>
    /** font weight string → variableId */
    fontWeightMap: Map<string, string>
}

// ============================================================
// Helpers
// ============================================================

function normalizeHex(hex: string): string {
    let h = hex.trim().toLowerCase()
    if (!h.startsWith('#')) h = '#' + h
    if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
    return h
}

export { normalizeHex }

// ============================================================
// Build Link Maps
// ============================================================

/**
 * Build reverse-lookup maps from the variable store for a given mode.
 *
 * Resolves all variables (following aliases) and builds value→variableId maps.
 * The parser uses these for exact-match binding during node creation.
 *
 * Variables are bucketed by their resolvedType and name prefix:
 *   COLOR variables → colorMap
 *   STRING variables with "font" in name → fontMap
 *   FLOAT variables bucketed by name prefix (radius/, spacing/, fontSize/, etc.)
 */
export function buildVariableLinkMaps(
    variables: Map<string, Variable>,
    collections: Map<string, VariableCollection>,
    modeId: string,
): VariableLinkMaps {
    const maps: VariableLinkMaps = {
        colorMap: new Map(),
        fontMap: new Map(),
        radiusMap: new Map(),
        spacingMap: new Map(),
        shadowMap: new Map(),
        fontSizeMap: new Map(),
        fontWeightMap: new Map(),
    }

    for (const [varId, variable] of variables) {
        // Resolve the variable's value for this mode (follows alias chains)
        const resolved = resolveVariable(varId, modeId, variables, collections)
        if (resolved === undefined) continue

        switch (variable.resolvedType) {
            case 'COLOR': {
                if (isColorValue(resolved)) {
                    const hex = normalizeHex(colorValueToHex(resolved))
                    maps.colorMap.set(hex, varId)
                } else if (typeof resolved === 'string') {
                    maps.colorMap.set(normalizeHex(resolved), varId)
                }
                break
            }

            case 'STRING': {
                if (typeof resolved === 'string') {
                    const name = variable.name.toLowerCase()
                    if (name.includes('font')) {
                        maps.fontMap.set(resolved.toLowerCase(), varId)
                    }
                }
                break
            }

            case 'FLOAT': {
                if (typeof resolved === 'number') {
                    const name = variable.name.toLowerCase()
                    const strVal = String(Math.round(resolved))

                    if (name.includes('radius')) {
                        maps.radiusMap.set(strVal, varId)
                    } else if (name.includes('spacing') || name.includes('gap') || name.includes('padding')) {
                        maps.spacingMap.set(strVal, varId)
                    } else if (name.includes('fontsize') || name.includes('font-size') || name.includes('font/size')) {
                        maps.fontSizeMap.set(strVal, varId)
                    } else if (name.includes('fontweight') || name.includes('font-weight') || name.includes('font/weight')) {
                        maps.fontWeightMap.set(strVal, varId)
                    } else {
                        // Generic number — add to spacing as fallback
                        maps.spacingMap.set(strVal, varId)
                    }
                }
                break
            }

            // BOOLEAN: not used in link maps
        }
    }

    return maps
}
