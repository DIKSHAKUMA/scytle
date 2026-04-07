// ============================================================
// HTML Parser — Barrel Export
// ============================================================

import type { FrameNode } from '@/types/canvas'
import type { VariableTable, ThemeMode } from '@/lib/theme/variable-table'

// Legacy iframe parser (kept as fallback)
export { parseHtmlToNodesViaIframe } from './iframe-parser'

// New DOMParser-based parser
export { parseHtmlViaDOMParser } from './domparser'

// Shared utilities
export { resolveColor, buildReverseColorMap, TAILWIND_COLORS } from './color-map'
export { PAGE_WIDTH, estimateTextHeight, estimateContainerHeight, estimateNodeHeight } from './size-utils'

// ════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════

export interface ParseHtmlOptions {
    rootWidth?: number
    variableTable?: VariableTable
    themeMode?: ThemeMode
    fonts?: string[]
}

// ════════════════════════════════════════════════════
// Main Parse Function (DOMParser + iframe fallback)
// ════════════════════════════════════════════════════

/**
 * Parse HTML into a ScytleNode tree.
 *
 * Pipeline:
 *   1. Convert Tailwind classes → inline styles (server API)
 *   2. Parse with DOMParser (reads element.style, preserves CSS intent)
 *   3. Falls back to iframe parser if DOMParser fails
 *
 * ~100-200ms total vs 5-13s for the iframe approach.
 */
export async function parseHtml(
    html: string,
    pageName: string = 'Page',
    options?: ParseHtmlOptions,
): Promise<FrameNode> {
    try {
        // Step 1: Convert Tailwind classes to inline styles (server-side)
        const inlinedHtml = await convertTailwindClasses(html)

        // Step 2: Parse with DOMParser
        const { parseHtmlViaDOMParser } = await import('./domparser')
        return await parseHtmlViaDOMParser(inlinedHtml, pageName, options)
    } catch (error) {
        console.warn('[parseHtml] DOMParser failed, falling back to iframe:', error)
        // Fallback to iframe parser (handles Tailwind via CDN internally)
        const { parseHtmlToNodesViaIframe } = await import('./iframe-parser')
        return parseHtmlToNodesViaIframe(html, pageName, options)
    }
}

/**
 * Convert Tailwind classes to inline styles via server API.
 * If the API call fails, returns the original HTML (iframe fallback will handle it).
 */
async function convertTailwindClasses(html: string): Promise<string> {
    const res = await fetch('/api/tailwind-to-inline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
    })
    if (!res.ok) {
        throw new Error(`Tailwind conversion failed: ${res.status}`)
    }
    const { html: inlinedHtml } = await res.json()
    return inlinedHtml
}

// Legacy alias
export const parseHtmlAuto = parseHtml
