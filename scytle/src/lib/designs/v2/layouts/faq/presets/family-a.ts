/**
 * FAQ Family A — Block Factories & Preset Configs
 *
 * 6 presets: FAQ 1, 2, 4, 5, 10, 11
 * Layout: Accordion FAQ items + bottom CTA.
 *
 * Axes: Text (center/left) × Style (normal/card) × Columns (1/2)
 *
 * DYNAMIC AXIS VISIBILITY:
 *   Text=center → Columns axis APPEARS (1 or 2)
 *   Text=left   → Columns axis HIDES (always 1 column)
 *   Columns=2   → Text axis HIDES (always center-ish)
 *   Style axis   → Always visible
 *
 * Combo table:
 *   center + normal + 1  → FAQ 1
 *   left   + normal + —  → FAQ 2
 *   center + card   + 1  → FAQ 4
 *   left   + card   + —  → FAQ 5
 *   —      + normal + 2  → FAQ 10
 *   —      + card   + 2  → FAQ 11
 *
 * Structural patterns (from Figma):
 *   Center/1col: SectionTitle(center, max-w-768) + AccordionList(max-w-768) + BottomCta(center, max-w-560)
 *   Left:        SectionTitle(left, max-w-768) + AccordionList(full-width) + BottomCta(left, max-w-560)
 *   2col:        SectionTitle(center, max-w-768) + Content(horizontal, 2 lists flex-1) + BottomCta(center, max-w-560)
 */

import type { Block } from '../../../blocks/types'
import type { FaqPresetConfig, ContentAlign } from '../types'
import {
    uid, resetUid,
    makeSectionTitle,
    makeNormalAccordionList, makeCardAccordionList,
    makeBottomCta,
} from './shared-builders'

// ============================================
// Block tree builders (parametrized)
// ============================================

/**
 * 1-column center layout: title + accordion list (max-w-768) + bottom CTA.
 */
function buildCenter1Col(style: 'normal' | 'card'): Block[] {
    const list = style === 'card'
        ? makeCardAccordionList(768)
        : makeNormalAccordionList(768)

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
 * 1-column left layout: title + accordion list (full-width) + bottom CTA.
 */
function buildLeft1Col(style: 'normal' | 'card'): Block[] {
    const list = style === 'card'
        ? makeCardAccordionList()
        : makeNormalAccordionList()

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
        children: [makeSectionTitle('left'), list, makeBottomCta('left')],
    }]
}

/**
 * 2-column layout: title + 2 side-by-side accordion lists + bottom CTA.
 * Used by FAQ 10 (normal) and FAQ 11 (card).
 */
function build2Col(style: 'normal' | 'card'): Block[] {
    const makeList = style === 'card' ? makeCardAccordionList : makeNormalAccordionList
    const gap = style === 'card' ? 16 : 64

    const columnsWrapper: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col',
        },
        content: {},
        children: [makeList(), makeList()],
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
        children: [makeSectionTitle('center'), columnsWrapper, makeBottomCta('center')],
    }]
}

// ============================================
// Block Factories (6 total)
// ============================================

/** FAQ 1 — Center + Normal + 1col */
export function buildFaq1Blocks(): Block[] { resetUid(); return buildCenter1Col('normal') }

/** FAQ 2 — Left + Normal */
export function buildFaq2Blocks(): Block[] { resetUid(); return buildLeft1Col('normal') }

/** FAQ 4 — Center + Card + 1col */
export function buildFaq4Blocks(): Block[] { resetUid(); return buildCenter1Col('card') }

/** FAQ 5 — Left + Card */
export function buildFaq5Blocks(): Block[] { resetUid(); return buildLeft1Col('card') }

/** FAQ 10 — Normal + 2col */
export function buildFaq10Blocks(): Block[] { resetUid(); return build2Col('normal') }

/** FAQ 11 — Card + 2col */
export function buildFaq11Blocks(): Block[] { resetUid(); return build2Col('card') }

// ============================================
// Preset Configs (6 total)
// ============================================

const FAQ_1_CONFIG: FaqPresetConfig = {
    id: 'faq-1', name: 'FAQ 1', family: 'a',
    description: 'Centered accordion with dividers, single column',
    tags: ['faq', 'accordion', 'center', 'normal', '1-col'],
    align: 'center',
    axes: { text: 'center', style: 'normal', columns: '1' },
}

const FAQ_2_CONFIG: FaqPresetConfig = {
    id: 'faq-2', name: 'FAQ 2', family: 'a',
    description: 'Left-aligned accordion with dividers',
    tags: ['faq', 'accordion', 'left', 'normal'],
    align: 'left',
    axes: { text: 'left', style: 'normal' },
}

const FAQ_4_CONFIG: FaqPresetConfig = {
    id: 'faq-4', name: 'FAQ 4', family: 'a',
    description: 'Centered card-style accordion, single column',
    tags: ['faq', 'accordion', 'center', 'card', '1-col'],
    align: 'center',
    axes: { text: 'center', style: 'card', columns: '1' },
}

const FAQ_5_CONFIG: FaqPresetConfig = {
    id: 'faq-5', name: 'FAQ 5', family: 'a',
    description: 'Left-aligned card-style accordion',
    tags: ['faq', 'accordion', 'left', 'card'],
    align: 'left',
    axes: { text: 'left', style: 'card' },
}

const FAQ_10_CONFIG: FaqPresetConfig = {
    id: 'faq-10', name: 'FAQ 10', family: 'a',
    description: 'Two-column accordion with dividers',
    tags: ['faq', 'accordion', 'center', 'normal', '2-col'],
    align: 'center',
    axes: { style: 'normal', columns: '2' },
}

const FAQ_11_CONFIG: FaqPresetConfig = {
    id: 'faq-11', name: 'FAQ 11', family: 'a',
    description: 'Two-column card-style accordion',
    tags: ['faq', 'accordion', 'center', 'card', '2-col'],
    align: 'center',
    axes: { style: 'card', columns: '2' },
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_A_PRESETS: FaqPresetConfig[] = [
    FAQ_1_CONFIG, FAQ_2_CONFIG, FAQ_4_CONFIG,
    FAQ_5_CONFIG, FAQ_10_CONFIG, FAQ_11_CONFIG,
]

export const FAMILY_A_PRESETS_MAP: Record<string, FaqPresetConfig> = Object.fromEntries(
    FAMILY_A_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_A_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'faq-1': buildFaq1Blocks,
    'faq-2': buildFaq2Blocks,
    'faq-4': buildFaq4Blocks,
    'faq-5': buildFaq5Blocks,
    'faq-10': buildFaq10Blocks,
    'faq-11': buildFaq11Blocks,
}
