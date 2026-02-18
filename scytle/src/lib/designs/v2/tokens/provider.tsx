/**
 * TokenProvider — Applies design tokens as CSS custom properties
 *
 * Wraps the wireframe canvas (or individual section) in a <div>
 * whose `style` carries all `--sg-*` CSS variables computed from
 * the active concept in useStyleGuideStore.
 *
 * Usage:
 *   <TokenProvider>
 *       <PageFrame ... />
 *   </TokenProvider>
 *
 * For per-section scheme overrides:
 *   <SectionTokenProvider sectionId="abc">
 *       <PlaceholderRenderer ... />
 *   </SectionTokenProvider>
 */

'use client'

import { useMemo } from 'react'
import { useStyleGuideStore } from '@/store/style-guide-store'
import type { CSSTokenMap } from './index'

// ============================================
// TokenProvider — Global (wraps entire canvas)
// ============================================

interface TokenProviderProps {
    children: React.ReactNode
    className?: string
}

/**
 * Wraps children in a div carrying all global design token CSS variables.
 * Place this around the wireframe canvas so all descendant blocks
 * can read tokens via `var(--sg-*)`.
 */
export function TokenProvider({ children, className }: TokenProviderProps) {
    const computedCSS = useStyleGuideStore((s) => s.computedCSS)

    // Convert CSSTokenMap → React.CSSProperties
    const style = useMemo(() => {
        return computedCSS as React.CSSProperties
    }, [computedCSS])

    return (
        <div
            className={className}
            style={style}
            data-sg-root=""
        >
            {children}
        </div>
    )
}

// ============================================
// SectionTokenProvider — Per-Section Overrides
// ============================================

interface SectionTokenProviderProps {
    sectionId: string
    children: React.ReactNode
    className?: string
}

/**
 * Wraps a single section and applies scheme override CSS variables
 * if the section has a color scheme override (dark/accent/light).
 *
 * If no override exists, renders children without a wrapper div
 * (zero overhead for the common case).
 */
export function SectionTokenProvider({
    sectionId,
    children,
    className,
}: SectionTokenProviderProps) {
    const schemeCSS = useStyleGuideStore((s) => s.getSectionSchemeCSS(sectionId))

    // No override → render children directly (no extra div)
    if (!schemeCSS) {
        return className ? (
            <div className={className}>{children}</div>
        ) : (
            <>{children}</>
        )
    }

    const style = schemeCSS as React.CSSProperties

    return (
        <div
            className={className}
            style={style}
            data-sg-scheme-override={sectionId}
        >
            {children}
        </div>
    )
}

// ============================================
// useTokenVar — Hook to read a single token value
// ============================================

/**
 * Read a single token CSS variable value from the store.
 * Useful for programmatic access (e.g., generating export data).
 *
 * @example
 * const bgPrimary = useTokenVar('--sg-bg-primary') // '#ffffff'
 */
export function useTokenVar(varName: string): string {
    return useStyleGuideStore((s) => s.computedCSS[varName] ?? '')
}

/**
 * Read multiple token CSS variable values from the store.
 *
 * @example
 * const tokens = useTokenVars(['--sg-bg-primary', '--sg-text-primary'])
 */
export function useTokenVars(varNames: string[]): Record<string, string> {
    const computedCSS = useStyleGuideStore((s) => s.computedCSS)
    return useMemo(() => {
        const result: Record<string, string> = {}
        for (const name of varNames) {
            result[name] = computedCSS[name] ?? ''
        }
        return result
    }, [computedCSS, varNames])
}
