// ============================================================
// HTML Parser — Barrel Export
// ============================================================

import type { FrameNode } from '@/types/canvas'
import type { VariableTable, ThemeMode } from '@/lib/theme/variable-table'

export { parseHtmlToNodesViaIframe } from './iframe-parser'
export { resolveColor, buildReverseColorMap, TAILWIND_COLORS } from './color-map'
export { PAGE_WIDTH, estimateTextHeight, estimateContainerHeight, estimateNodeHeight } from './size-utils'

// ════════════════════════════════════════════════════
// Convenience Wrapper
// ════════════════════════════════════════════════════

export interface ParseHtmlOptions {
    rootWidth?: number
    variableTable?: VariableTable
    themeMode?: ThemeMode
    fonts?: string[]
}

/**
 * Parse HTML into a ScytleNode tree using the iframe-based renderer.
 * Tailwind CDN is loaded inside a hidden iframe for pixel-perfect computed styles.
 */
export async function parseHtmlAuto(
    html: string,
    pageName: string = 'Page',
    options?: ParseHtmlOptions,
): Promise<FrameNode> {
    const { parseHtmlToNodesViaIframe } = await import('./iframe-parser')
    return parseHtmlToNodesViaIframe(html, pageName, options)
}
