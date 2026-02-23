/**
 * FAQ Family C — Block Factories & Preset Configs
 *
 * 3 presets: FAQ 7, 12, 13
 * Layout: Non-accordion Q/A grid + bottom CTA.
 *
 * Axes: Columns (1/2/3)
 *   1 → FAQ 7  (centered, single column, max-w-768 list, gap-48)
 *   2 → FAQ 12 (left-aligned, 2-column rows, gap-64)
 *   3 → FAQ 13 (left-aligned, 3-column rows, gap-48)
 *
 * Structural patterns (from Figma):
 *   1-col: Container(items-center) → SectionTitle(center, max-w-768) → List(max-w-768, gap-48) → BottomCta(center)
 *   2-col: Container(items-start) → SectionTitle(left) → List(rows of 2, gap-64) → BottomCta(left)
 *   3-col: Container(items-start) → SectionTitle(left) → List(rows of 3, gap-48) → BottomCta(left)
 */

import type { Block } from '../../../blocks/types'
import type { FaqPresetConfig, ContentAlign } from '../types'
import {
    uid, resetUid,
    makeSectionTitle, makeGridItem, makeBottomCta,
} from './shared-builders'

// ============================================
// Block tree builders
// ============================================

/**
 * 1-column grid: stacked Q/A items, centered, max-w-768.
 * 5 items separated by gap-48.
 */
function build1ColGrid(): Block[] {
    const list: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 48,
            maxWidth: 768,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-10',
        },
        content: {},
        children: Array.from({ length: 5 }, () => makeGridItem()),
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: 'items-center @max-sm:!gap-12',
        },
        content: {},
        children: [makeSectionTitle('center'), list, makeBottomCta('center')],
    }]
}

/**
 * Multi-column grid: Q/A items in rows of `cols`, left-aligned.
 * Each item fills equally (flex-1). Rows separated by gap-64.
 */
function buildMultiColGrid(cols: 2 | 3): Block[] {
    const align: ContentAlign = 'left'
    const rowGap = cols === 2 ? 64 : 48
    const rowCount = cols === 2 ? 4 : 2 // 4 rows × 2 = 8 items, 2 rows × 3 = 6 items

    const rows: Block[] = Array.from({ length: rowCount }, () => ({
        id: uid(),
        type: 'frame' as const,
        props: {
            direction: 'horizontal' as const,
            gap: rowGap,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: Array.from({ length: cols }, () => {
            const item = makeGridItem()
            // Make items fill equally
            item.props = { ...item.props, className: 'flex-1 @max-sm:!gap-3' }
            return item
        }),
    }))

    const list: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 64,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: rows,
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: 'items-start @max-sm:!gap-12',
        },
        content: {},
        children: [makeSectionTitle(align), list, makeBottomCta(align)],
    }]
}

// ============================================
// Block Factories (3 total)
// ============================================

/** FAQ 7 — 1-column non-accordion grid */
export function buildFaq7Blocks(): Block[] { resetUid(); return build1ColGrid() }

/** FAQ 12 — 2-column non-accordion grid */
export function buildFaq12Blocks(): Block[] { resetUid(); return buildMultiColGrid(2) }

/** FAQ 13 — 3-column non-accordion grid */
export function buildFaq13Blocks(): Block[] { resetUid(); return buildMultiColGrid(3) }

// ============================================
// Preset Configs (3 total)
// ============================================

const FAQ_7_CONFIG: FaqPresetConfig = {
    id: 'faq-7', name: 'FAQ 7', family: 'c',
    description: 'Single-column Q/A grid, centered',
    tags: ['faq', 'grid', 'center', '1-col'],
    align: 'center',
    axes: { columns: '1' },
}

const FAQ_12_CONFIG: FaqPresetConfig = {
    id: 'faq-12', name: 'FAQ 12', family: 'c',
    description: 'Two-column Q/A grid',
    tags: ['faq', 'grid', 'left', '2-col'],
    align: 'left',
    axes: { columns: '2' },
}

const FAQ_13_CONFIG: FaqPresetConfig = {
    id: 'faq-13', name: 'FAQ 13', family: 'c',
    description: 'Three-column Q/A grid',
    tags: ['faq', 'grid', 'left', '3-col'],
    align: 'left',
    axes: { columns: '3' },
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_C_PRESETS: FaqPresetConfig[] = [FAQ_7_CONFIG, FAQ_12_CONFIG, FAQ_13_CONFIG]

export const FAMILY_C_PRESETS_MAP: Record<string, FaqPresetConfig> = Object.fromEntries(
    FAMILY_C_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_C_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'faq-7': buildFaq7Blocks,
    'faq-12': buildFaq12Blocks,
    'faq-13': buildFaq13Blocks,
}
