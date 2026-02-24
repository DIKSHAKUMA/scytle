/**
 * Footer Family C — Block Factories & Preset Configs
 *
 * 2 presets: Footer 6 (Normal), Footer 12 (Card)
 * Layout: Contact info left (logo + address + phone + email + social) + 2 headingless link lists right.
 *
 * Axis: Style (normal/card)
 *   normal → Footer 6: section → container(gap-80) → content + credits(divider + copyright+legal)
 *   card   → Footer 12: section → container(gap-32) → card(border, p-48) + credits(copyright+legal)
 *
 * Structural patterns (from Figma):
 *   Content: Contact(logo+address+phone+email+social) | Links(2 headingless columns, gap-40)
 *   Normal credits: divider → copyright + legal (left-aligned together)
 *   Card credits: copyright + legal (outside card, no divider)
 */

import type { Block } from '../../../blocks/types'
import type { FooterPresetConfig } from '../types'
import {
    uid, resetUid,
    makeContactColumn,
    makeHeadinglessLinkColumn,
    makeCreditsLeftAligned,
    makeCreditsCardOutside,
} from './shared-builders'

// ============================================
// Shared content area
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
            makeContactColumn(),
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
                    makeHeadinglessLinkColumn(0),
                    makeHeadinglessLinkColumn(5),
                ],
            },
        ],
    }
}

// ============================================
// Block tree builders
// ============================================

/** Footer 6 — Normal */
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
        children: [makeContentArea(), makeCreditsLeftAligned()],
    }]
}

/** Footer 12 — Card */
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

export function buildFooter6Blocks(): Block[] { resetUid(); return buildNormal() }
export function buildFooter12Blocks(): Block[] { resetUid(); return buildCard() }

// ============================================
// Preset Configs
// ============================================

const FOOTER_6_CONFIG: FooterPresetConfig = {
    id: 'footer-6', name: 'Footer 6', family: 'c',
    description: 'Contact info left with logo, address, phone, email and social icons',
    tags: ['footer', 'contact', 'social', 'normal'],
    shell: 'container',
    axes: { style: 'normal' },
}

const FOOTER_12_CONFIG: FooterPresetConfig = {
    id: 'footer-12', name: 'Footer 12', family: 'c',
    description: 'Card-wrapped contact info + headingless link columns',
    tags: ['footer', 'contact', 'social', 'card'],
    shell: 'card',
    axes: { style: 'card' },
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_C_PRESETS: FooterPresetConfig[] = [FOOTER_6_CONFIG, FOOTER_12_CONFIG]

export const FAMILY_C_PRESETS_MAP: Record<string, FooterPresetConfig> = Object.fromEntries(
    FAMILY_C_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_C_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'footer-6': buildFooter6Blocks,
    'footer-12': buildFooter12Blocks,
}
