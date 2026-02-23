/**
 * FAQ Family B — Block Factories & Preset Configs
 *
 * 2 presets: FAQ 3, 6
 * Layout: Split layout — left column (title + CTA button, w-500),
 *         right column (accordion list, flex-1).
 *
 * Axes: Style (normal/card)
 *   normal → FAQ 3 (divider-based accordion)
 *   card   → FAQ 6 (card-style accordion)
 *
 * Figma structure (desktop):
 *   Section → Container(1280) → Component(horizontal, gap-80)
 *     ├── Left Column (w-500, gap-32): Content(heading+body, gap-24) + Button
 *     └── Right Column (flex-1): Accordion List
 *   Mobile: stacks vertical, gap-48
 */

import type { Block } from '../../../blocks/types'
import type { FaqPresetConfig } from '../types'
import {
    uid, resetUid,
    makeSplitTitleWithButton,
    makeNormalAccordionList, makeCardAccordionList,
} from './shared-builders'

// ============================================
// Block tree builders
// ============================================

function buildSplitLayout(style: 'normal' | 'card'): Block[] {
    const list = style === 'card'
        ? makeCardAccordionList()
        : makeNormalAccordionList()

    // Right column wraps the list in a flex-1 container
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
// Block Factories (2 total)
// ============================================

/** FAQ 3 — Split + Normal accordion */
export function buildFaq3Blocks(): Block[] { resetUid(); return buildSplitLayout('normal') }

/** FAQ 6 — Split + Card accordion */
export function buildFaq6Blocks(): Block[] { resetUid(); return buildSplitLayout('card') }

// ============================================
// Preset Configs (2 total)
// ============================================

const FAQ_3_CONFIG: FaqPresetConfig = {
    id: 'faq-3', name: 'FAQ 3', family: 'b',
    description: 'Split layout with accordion dividers',
    tags: ['faq', 'accordion', 'split', 'normal', 'two-column'],
    align: 'left',
    axes: { style: 'normal' },
}

const FAQ_6_CONFIG: FaqPresetConfig = {
    id: 'faq-6', name: 'FAQ 6', family: 'b',
    description: 'Split layout with card-style accordion',
    tags: ['faq', 'accordion', 'split', 'card', 'two-column'],
    align: 'left',
    axes: { style: 'card' },
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_B_PRESETS: FaqPresetConfig[] = [FAQ_3_CONFIG, FAQ_6_CONFIG]

export const FAMILY_B_PRESETS_MAP: Record<string, FaqPresetConfig> = Object.fromEntries(
    FAMILY_B_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_B_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'faq-3': buildFaq3Blocks,
    'faq-6': buildFaq6Blocks,
}
