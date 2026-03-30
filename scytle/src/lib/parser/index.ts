// ============================================================
// HTML Parser — Barrel Export
// ============================================================

import type { FrameNode } from '@/types/canvas'
import type { VariableTable, ThemeMode } from '@/lib/theme/variable-table'
import { relinkNodes } from '@/lib/theme/relink-nodes'

export { parseHtmlToNodes } from './html-to-nodes'                          // Sync (legacy)
export { parseHtmlToNodesViaIframe } from './iframe-parser'                 // Async (new — iframe-based)
export { parseClasses, parseInlineStyles, defaultStyles, type ParsedStyles } from './class-parser'
export { resolveColor, buildReverseColorMap, TAILWIND_COLORS } from './color-map'
export { PAGE_WIDTH, estimateTextHeight, estimateContainerHeight, estimateNodeHeight } from './size-utils'

// ════════════════════════════════════════════════════
// Feature Flag — instant rollback to legacy parser
// ════════════════════════════════════════════════════

/**
 * Set to `false` to disable the iframe parser globally
 * and revert to the legacy heuristic-based parser.
 *
 * The iframe parser also has an automatic fallback:
 * if it throws (e.g. CSP blocks iframe, Tailwind CDN down),
 * it falls back to the legacy parser internally.
 */
export const USE_IFRAME_PARSER = true

// ════════════════════════════════════════════════════
// Auto-Switcher
// ════════════════════════════════════════════════════

export interface ParseHtmlOptions {
    rootWidth?: number
    variableTable?: VariableTable
    themeMode?: ThemeMode
    fonts?: string[]
}

/**
 * Smart parser that uses the iframe parser when available,
 * or the legacy parser as fallback. Controlled by USE_IFRAME_PARSER flag.
 *
 * - Consumers should prefer this over calling either parser directly.
 * - Both code paths end with relinkNodes() for full theme coverage.
 */
export async function parseHtmlAuto(
    html: string,
    pageName: string = 'Page',
    options?: ParseHtmlOptions,
): Promise<FrameNode> {
    if (USE_IFRAME_PARSER && typeof document !== 'undefined') {
        // Iframe parser (has its own internal fallback too)
        const { parseHtmlToNodesViaIframe } = await import('./iframe-parser')
        return parseHtmlToNodesViaIframe(html, pageName, options)
    }

    // Legacy sync parser
    const { parseHtmlToNodes } = await import('./html-to-nodes')
    const frame = parseHtmlToNodes(html, pageName, {
        rootWidth: options?.rootWidth,
        variableTable: options?.variableTable,
        themeMode: options?.themeMode,
    })
    if (options?.variableTable && options?.themeMode) {
        relinkNodes(frame.children, options.variableTable, options.themeMode)
    }
    return frame
}
