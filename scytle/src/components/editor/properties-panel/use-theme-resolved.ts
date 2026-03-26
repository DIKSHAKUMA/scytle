/**
 * Theme-aware resolution utilities for the Properties Panel.
 *
 * The Properties Panel lives outside the canvas ThemeResolverProvider,
 * so we read the variable table + mode directly from the style-guide store.
 *
 * These helpers let each Design Tab section:
 *   1. Display the RESOLVED theme value (not the stale raw value)
 *   2. Detect whether a property is theme-linked
 *   3. Build update payloads that auto-detach from theme on user edit
 */

import { useStyleGuideStore } from '@/store'
import { resolveColor, resolveFont, resolveNumber } from '@/lib/theme/theme-resolver'
import type { VariableTable, ThemeMode } from '@/lib/theme/variable-table'

// ════════════════════════════════════════════════════════════
// Hook: access variable table + mode from style guide store
// ════════════════════════════════════════════════════════════

export function useThemeTable(): { table: VariableTable; mode: ThemeMode } {
    const table = useStyleGuideStore(s => s.variableTable)
    const mode = useStyleGuideStore(s => s.themeMode)
    return { table, mode }
}

// ════════════════════════════════════════════════════════════
// Pure resolution functions (for display in Design Tab)
// ════════════════════════════════════════════════════════════

/**
 * Resolve a color for display. If the property is theme-linked (ref set, not detached),
 * returns the theme-resolved value. Otherwise returns the raw value.
 */
export function resolveDisplayColor(
    ref: string | undefined,
    rawColor: string,
    detached: boolean | undefined,
    table: VariableTable,
    mode: ThemeMode,
): string {
    if (ref && !detached) {
        return resolveColor(ref, rawColor, table, mode)
    }
    return rawColor
}

/**
 * Resolve a font family for display.
 */
export function resolveDisplayFont(
    ref: string | undefined,
    rawFont: string,
    detached: boolean | undefined,
    table: VariableTable,
    mode: ThemeMode,
): string {
    if (ref && !detached) {
        return resolveFont(ref, rawFont, table, mode)
    }
    return rawFont
}

/**
 * Resolve a numeric value (fontSize, fontWeight, radius, gap, etc.) for display.
 */
export function resolveDisplayNumber(
    ref: string | undefined,
    rawValue: number,
    detached: boolean | undefined,
    table: VariableTable,
    mode: ThemeMode,
): number {
    if (ref && !detached) {
        return resolveNumber(ref, rawValue, table, mode)
    }
    return rawValue
}

// ════════════════════════════════════════════════════════════
// Helpers
// ════════════════════════════════════════════════════════════

/**
 * Check if a property is currently linked to a theme variable.
 * Returns true when a ref is set AND the property is not detached.
 */
export function isThemeLinked(ref?: string, detached?: boolean): boolean {
    return !!ref && !detached
}
