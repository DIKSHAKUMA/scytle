/**
 * FAQ Family F — Block Factories & Preset Configs
 *
 * 1 preset: FAQ 14
 * Layout: Non-accordion icon grid (3 columns × 2 rows = 6 items) + bottom CTA.
 *         Each item: icon(24×24) → question (bold) → answer, vertically stacked.
 *         Everything centered.
 *
 * Standalone: no axes.
 *
 * Figma structure (desktop):
 *   Section → Container(1280, gap-80, items-center)
 *     ├── Section Title (heading + body, center, max-w-768)
 *     ├── Grid (gap-64 × gap-48): 2 rows of 3 icon+Q/A items
 *     └── Bottom CTA (heading H4 + body + button, center, max-w-560)
 *   Mobile: 1 column, gap-48
 */

import type { Block } from '../../../blocks/types'
import type { FaqPresetConfig } from '../types'
import {
    uid, resetUid,
    makeSectionTitle, makeIconGridItem, makeBottomCta,
} from './shared-builders'

// ============================================
// Block tree builder
// ============================================

function buildIconGrid(): Block[] {
    // 2 rows × 3 columns — each row is a horizontal frame with 3 items
    const row1: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 48,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-10',
        },
        content: {},
        children: Array.from({ length: 3 }, () => makeIconGridItem()),
    }

    const row2: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 48,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-10',
        },
        content: {},
        children: Array.from({ length: 3 }, () => makeIconGridItem()),
    }

    const grid: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 64,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [row1, row2],
    }

    return [
        makeSectionTitle('center'),
        grid,
        makeBottomCta('center'),
    ]
}

// ============================================
// Block Factory
// ============================================

/** FAQ 14 — 3×2 icon grid + centered bottom CTA */
export function buildFaq14Blocks(): Block[] { resetUid(); return buildIconGrid() }

// ============================================
// Preset Config
// ============================================

const FAQ_14_CONFIG: FaqPresetConfig = {
    id: 'faq-14', name: 'FAQ 14', family: 'f',
    description: 'Icon grid with centered bottom CTA',
    tags: ['faq', 'icon', 'grid', 'cta', 'centered'],
    align: 'center',
    axes: {},
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_F_PRESETS: FaqPresetConfig[] = [FAQ_14_CONFIG]

export const FAMILY_F_PRESETS_MAP: Record<string, FaqPresetConfig> = Object.fromEntries(
    FAMILY_F_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_F_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'faq-14': buildFaq14Blocks,
}
