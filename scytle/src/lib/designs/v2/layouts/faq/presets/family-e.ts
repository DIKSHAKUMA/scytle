/**
 * FAQ Family E — Block Factories & Preset Configs
 *
 * 1 preset: FAQ 9
 * Layout: Non-accordion horizontal Q/A rows (question w-500 + answer flex-1,
 *         with dividers) + bottom CTA. Full-width (1 column).
 *
 * Standalone: no axes.
 *
 * Figma structure (desktop):
 *   Section → Container(1280, gap-80)
 *     ├── Section Title (heading + body, gap-24, left-aligned)
 *     ├── List (gap-48): 5 × Horizontal Q/A rows (divider + question+answer row)
 *     └── Bottom CTA (heading H4 + body + button, gap-24, max-w-560, left)
 *   Mobile: gap-48, rows stack vertically
 */

import type { Block } from '../../../blocks/types'
import type { FaqPresetConfig } from '../types'
import {
    uid, resetUid,
    makeSectionTitle, makeHorizontalQaRow, makeBottomCta,
} from './shared-builders'

// ============================================
// Block tree builder
// ============================================

function buildFullWidthHorizontalQa(): Block[] {
    const list: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 48,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-10',
        },
        content: {},
        children: Array.from({ length: 5 }, () => makeHorizontalQaRow()),
    }

    return [
        makeSectionTitle('left'),
        list,
        makeBottomCta('left'),
    ]
}

// ============================================
// Block Factory
// ============================================

/** FAQ 9 — Full-width non-accordion horizontal Q/A + bottom CTA */
export function buildFaq9Blocks(): Block[] { resetUid(); return buildFullWidthHorizontalQa() }

// ============================================
// Preset Config
// ============================================

const FAQ_9_CONFIG: FaqPresetConfig = {
    id: 'faq-9', name: 'FAQ 9', family: 'e',
    description: 'Horizontal Q/A rows with bottom CTA',
    tags: ['faq', 'horizontal', 'grid', 'cta'],
    align: 'left',
    axes: {},
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_E_PRESETS: FaqPresetConfig[] = [FAQ_9_CONFIG]

export const FAMILY_E_PRESETS_MAP: Record<string, FaqPresetConfig> = Object.fromEntries(
    FAMILY_E_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_E_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'faq-9': buildFaq9Blocks,
}
