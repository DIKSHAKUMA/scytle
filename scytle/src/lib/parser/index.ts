// ============================================================
// HTML Parser — Barrel Export
// ============================================================

import type { FrameNode } from '@/types/canvas'
import type { VariableTable, ThemeMode } from '@/lib/theme/variable-table'

// Iframe parser (current default — proven accuracy)
export { parseHtmlToNodesViaIframe } from './iframe-parser'

// DOMParser-based parser (WIP — faster but needs more debugging)
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
// Main Parse Function
// ════════════════════════════════════════════════════

/**
 * Parse HTML into a ScytleNode tree.
 *
 * Currently uses the iframe parser (renders in a real browser for accurate layout).
 * The DOMParser pipeline is available via parseHtmlViaDOMParser() for testing
 * but needs further debugging before becoming the default.
 */
export async function parseHtml(
    html: string,
    pageName: string = 'Page',
    options?: ParseHtmlOptions,
): Promise<FrameNode> {
    const { parseHtmlToNodesViaIframe } = await import('./iframe-parser')
    return parseHtmlToNodesViaIframe(html, pageName, options)
}

/**
 * Parse HTML using the DOMParser pipeline (fast, ~200ms).
 * Requires Tailwind classes to be converted to inline styles first.
 * Use this for testing; not yet the default.
 */
export async function parseHtmlFast(
    html: string,
    pageName: string = 'Page',
    options?: ParseHtmlOptions,
): Promise<FrameNode> {
    try {
        const inlinedHtml = await convertTailwindClasses(html)
        const { parseHtmlViaDOMParser } = await import('./domparser')
        return await parseHtmlViaDOMParser(inlinedHtml, pageName, options)
    } catch (error) {
        console.warn('[parseHtmlFast] DOMParser failed, falling back to iframe:', error)
        const { parseHtmlToNodesViaIframe } = await import('./iframe-parser')
        return parseHtmlToNodesViaIframe(html, pageName, options)
    }
}

/**
 * Convert Tailwind classes to inline styles via server API.
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
