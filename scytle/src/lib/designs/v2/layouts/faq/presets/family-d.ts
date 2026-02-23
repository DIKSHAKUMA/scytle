/**
 * FAQ Family D — Block Factories & Preset Configs
 *
 * 1 preset: FAQ 8
 * Layout: Split layout — left column (title + CTA button, w-500),
 *         right column (non-accordion horizontal Q/A rows with dividers, flex-1).
 *
 * Standalone: no axes.
 *
 * Figma structure (desktop):
 *   Section → Container(1280) → Component(horizontal, gap-80)
 *     ├── Left Column (w-500, gap-32): Content(heading+body, gap-24) + Button
 *     └── Right Column (flex-1): List of Row(divider + horizontal Q/A, gap-48)
 *   Mobile: stacks vertical, gap-48
 */

import type { Block } from '../../../blocks/types'
import type { FaqPresetConfig } from '../types'
import {
    uid, resetUid,
    makeSplitTitleWithButton, makeHorizontalQaRow,
} from './shared-builders'

// ============================================
// Block tree builder
// ============================================

function buildSplitHorizontalQa(): Block[] {
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

    const rightColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
            className: 'flex-1 min-w-0',
        },
        content: {},
        children: [list],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [makeSplitTitleWithButton(), rightColumn],
    }]
}

// ============================================
// Block Factory
// ============================================

/** FAQ 8 — Split + Non-accordion horizontal Q/A */
export function buildFaq8Blocks(): Block[] { resetUid(); return buildSplitHorizontalQa() }

// ============================================
// Preset Config
// ============================================

const FAQ_8_CONFIG: FaqPresetConfig = {
    id: 'faq-8', name: 'FAQ 8', family: 'd',
    description: 'Split layout with horizontal Q/A rows',
    tags: ['faq', 'split', 'grid', 'horizontal', 'two-column'],
    align: 'left',
    axes: {},
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_D_PRESETS: FaqPresetConfig[] = [FAQ_8_CONFIG]

export const FAMILY_D_PRESETS_MAP: Record<string, FaqPresetConfig> = Object.fromEntries(
    FAMILY_D_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_D_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'faq-8': buildFaq8Blocks,
}
