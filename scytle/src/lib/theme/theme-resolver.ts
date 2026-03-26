/**
 * Theme Resolver — functions for resolving variable refs at render time.
 *
 * The canvas renderer calls these to resolve optional ref fields on nodes.
 * If a ref exists and matches a variable table entry → resolved value.
 * If no ref or no match → fallback to the raw node value.
 *
 * Pattern: `resolveColor(fill.colorRef, fill.color, table, mode)`
 */

import type { VariableTable, ThemeMode } from './variable-table'

/** Resolve a color ref → hex string */
export function resolveColor(
    ref: string | undefined,
    fallback: string,
    table: VariableTable,
    mode: ThemeMode,
): string {
    if (!ref) return fallback
    const v = table[ref]
    return v ? v[mode] : fallback
}

/** Resolve a font ref → font family name string */
export function resolveFont(
    ref: string | undefined,
    fallback: string,
    table: VariableTable,
    mode: ThemeMode,
): string {
    if (!ref) return fallback
    const v = table[ref]
    return v ? v[mode] : fallback
}

/** Resolve a numeric ref (radius, fontSize, gap, spacing) → number */
export function resolveNumber(
    ref: string | undefined,
    fallback: number,
    table: VariableTable,
    mode: ThemeMode,
): number {
    if (!ref) return fallback
    const v = table[ref]
    if (!v) return fallback
    const num = parseFloat(v[mode])
    return isNaN(num) ? fallback : num
}

/** Resolve a shadow ref → CSS box-shadow string */
export function resolveShadow(
    ref: string | undefined,
    fallback: string,
    table: VariableTable,
    mode: ThemeMode,
): string {
    if (!ref) return fallback
    const v = table[ref]
    return v ? v[mode] : fallback
}

/**
 * Resolve a padding ref → scaled Padding object.
 *
 * When a paddingRef is present, the base value from the variable table
 * is used to proportionally scale all 4 padding sides.
 * E.g., if node has padding {20, 40, 20, 40} and paddingRef resolves to 32,
 * ratio = 32/20 = 1.6, result = {32, 64, 32, 64}.
 */
export function resolvePadding(
    ref: string | undefined,
    original: { top: number; right: number; bottom: number; left: number },
    table: VariableTable,
    mode: ThemeMode,
): { top: number; right: number; bottom: number; left: number } {
    if (!ref) return original
    const v = table[ref]
    if (!v) return original

    const newBase = parseFloat(v[mode])
    if (isNaN(newBase)) return original

    // Find the largest original value to use as the ratio basis
    const maxOrig = Math.max(original.top, original.right, original.bottom, original.left)
    if (maxOrig === 0) return original

    const ratio = newBase / maxOrig
    return {
        top: Math.round(original.top * ratio),
        right: Math.round(original.right * ratio),
        bottom: Math.round(original.bottom * ratio),
        left: Math.round(original.left * ratio),
    }
}
