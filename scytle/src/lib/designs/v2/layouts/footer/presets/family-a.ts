/**
 * Footer Family A — Block Factories & Preset Configs
 *
 * 2 presets: Footer 1 (Normal), Footer 11 (Card)
 * Layout: Newsletter left (logo + desc + email form) + 3 columns right (2 link cols + Follow Us social col).
 *
 * Axis: Style (normal/card)
 *   normal → Footer 1: section → container(gap-80) → content + credits(divider + copyright + legal)
 *   card   → Footer 11: section → container(gap-32) → card(border, p-48) + credits(copyright + legal)
 *
 * Structural patterns (from Figma):
 *   Content: Newsletter(w-500, logo+desc+form) | Links(flex-1, gap-40, 2cols+FollowUs)
 *   Normal credits: divider → copyright + legal
 *   Card credits: copyright + legal (outside card, no divider)
 */

import type { Block } from '../../../blocks/types'
import type { FooterPresetConfig } from '../types'
import {
    uid, resetUid,
    makeNewsletterWithLogo,
    makeLinkColumn,
    makeSocialColumn,
    makeCreditsStandard,
    makeCreditsCardOutside,
} from './shared-builders'

// ============================================
// Shared content area (identical for both variants)
// ============================================

function makeContentArea(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 128,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [
            makeNewsletterWithLogo(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 40,
                    sizing: { width: 'fill' },
                    className: 'flex-1 @max-sm:!flex-col @max-sm:!gap-10',
                },
                content: {},
                children: [
                    makeLinkColumn('Column One'),
                    makeLinkColumn('Column Two'),
                    makeSocialColumn(),
                ],
            },
        ],
    }
}

// ============================================
// Block tree builders
// ============================================

/** Footer 1 — Normal (no card wrapper) */
function buildNormal(): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [makeContentArea(), makeCreditsStandard()],
    }]
}

/** Footer 11 — Card wrapper */
function buildCard(): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-8',
        },
        content: {},
        children: [makeContentArea(), makeCreditsCardOutside()],
    }]
}

// ============================================
// Block Factories
// ============================================

/** Footer 1 — Normal: newsletter left + 3 columns + standard credits */
export function buildFooter1Blocks(): Block[] { resetUid(); return buildNormal() }

/** Footer 11 — Card: newsletter left + 3 columns inside card + card-outside credits */
export function buildFooter11Blocks(): Block[] { resetUid(); return buildCard() }

// ============================================
// Preset Configs
// ============================================

const FOOTER_1_CONFIG: FooterPresetConfig = {
    id: 'footer-1', name: 'Footer 1', family: 'a',
    description: 'Newsletter left with logo + 3 columns including Follow Us social links',
    tags: ['footer', 'newsletter', 'social', 'columns', 'normal'],
    shell: 'container',
    axes: { style: 'normal' },
}

const FOOTER_11_CONFIG: FooterPresetConfig = {
    id: 'footer-11', name: 'Footer 11', family: 'a',
    description: 'Card-wrapped newsletter left + 3 columns with social links',
    tags: ['footer', 'newsletter', 'social', 'columns', 'card'],
    shell: 'card',
    axes: { style: 'card' },
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_A_PRESETS: FooterPresetConfig[] = [FOOTER_1_CONFIG, FOOTER_11_CONFIG]

export const FAMILY_A_PRESETS_MAP: Record<string, FooterPresetConfig> = Object.fromEntries(
    FAMILY_A_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_A_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'footer-1': buildFooter1Blocks,
    'footer-11': buildFooter11Blocks,
}
