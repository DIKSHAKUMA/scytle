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

import { useEffect, useMemo } from 'react'
import { useStyleGuideStore } from '@/store/style-guide-store'
import { useUnifiedStore } from '@/store'
import { computeSchemeOverrideCSS, WIREFRAME_NEUTRAL_CSS } from './defaults'
import type { CSSTokenMap } from './index'

// ============================================
// Google Fonts loader for default fonts
// ============================================

const DEFAULT_FONTS_URL =
    'https://fonts.googleapis.com/css2?family=Raleway:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap'

let defaultFontsLoaded = false

function ensureDefaultFonts() {
    if (typeof document === 'undefined' || defaultFontsLoaded) return
    defaultFontsLoaded = true

    // Check if already present
    const existing = document.querySelector(`link[href="${DEFAULT_FONTS_URL}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = DEFAULT_FONTS_URL
    document.head.appendChild(link)
}

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
 *
 * Mode-aware: In wireframe mode, forces neutral grayscale tokens.
 * In design mode, uses the active concept's computed CSS from the style guide.
 */
export function TokenProvider({ children, className }: TokenProviderProps) {
    const computedCSS = useStyleGuideStore((s) => s.computedCSS)
    const canvasMode = useUnifiedStore((s) => s.canvasMode)

    // Load Raleway + Inter from Google Fonts on first mount
    useEffect(() => {
        ensureDefaultFonts()
    }, [])

    // In wireframe mode, force neutral grayscale; in design mode, use styled tokens
    const effectiveCSS = canvasMode === 'wireframe' ? WIREFRAME_NEUTRAL_CSS : computedCSS

    // Convert CSSTokenMap → React.CSSProperties
    const style = useMemo(() => {
        return effectiveCSS as React.CSSProperties
    }, [effectiveCSS])

    return (
        <div
            className={className}
            style={style}
            data-sg-root=""
            data-canvas-mode={canvasMode}
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
 * Mode-aware: In wireframe mode, scheme overrides are never applied
 * (all sections stay neutral grayscale). In design mode, scheme
 * overrides work as expected.
 *
 * If no override exists (or in wireframe mode), renders children
 * without a wrapper div (zero overhead for the common case).
 */
export function SectionTokenProvider({
    sectionId,
    children,
    className,
}: SectionTokenProviderProps) {
    const canvasMode = useUnifiedStore((s) => s.canvasMode)

    // Select raw state directly — never call store getters inside selectors
    // (calling get() inside a selector causes "getSnapshot should be cached" infinite loop)
    const scheme = useStyleGuideStore(
        (s) => s.data.sectionSchemeOverrides[sectionId] ?? null,
    )
    const concept = useStyleGuideStore((s) => {
        const d = s.data
        return d.concepts.find((c) => c.id === d.activeConceptId) ?? d.concepts[0]
    })

    const schemeCSS = useMemo(() => {
        // In wireframe mode, never compute scheme overrides
        if (canvasMode === 'wireframe' || !scheme) return null
        return computeSchemeOverrideCSS(scheme, concept)
    }, [canvasMode, scheme, concept])

    // No override (or wireframe mode) → render children directly (no extra div)
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
