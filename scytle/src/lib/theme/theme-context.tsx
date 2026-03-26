/**
 * Theme Resolver Context — provides variable table + mode to canvas renderers.
 *
 * Wraps the canvas area. Renderers call useThemeResolver() to get the table
 * and mode for resolving refs on nodes.
 */

'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { useStyleGuideStore } from '@/store'
import type { VariableTable, ThemeMode } from './variable-table'

export interface ThemeResolverCtx {
    table: VariableTable
    mode: ThemeMode
}

const ThemeResolverContext = createContext<ThemeResolverCtx | null>(null)

export function ThemeResolverProvider({ children }: { children: ReactNode }) {
    const table = useStyleGuideStore(s => s.variableTable)
    const mode = useStyleGuideStore(s => s.themeMode)

    const value = useMemo(() => ({ table, mode }), [table, mode])

    return (
        <ThemeResolverContext.Provider value={value}>
            {children}
        </ThemeResolverContext.Provider>
    )
}

/**
 * Hook to access the theme resolver context.
 * Returns null if outside of ThemeResolverProvider (backward compat — renderers
 * should gracefully fall back to raw node values when null).
 */
export function useThemeResolver(): ThemeResolverCtx | null {
    return useContext(ThemeResolverContext)
}
