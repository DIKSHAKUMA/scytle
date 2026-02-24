/**
 * Footer Family D — Block Factories & Preset Configs
 *
 * 2 presets: Footer 9 (Normal), Footer 15 (Card)
 * Layout: CTA heading + buttons left + 2 headingless link lists right.
 *
 * Axis: Style (normal/card)
 *   normal → Footer 9: CTA(left) + links(right). Credits: logo+avatars → divider → copyright+social
 *   card   → Footer 15: card(logo+CTA left + links+social right). Credits: copyright+legal
 *
 * These share the CTA-focused pattern but differ in secondary element placement.
 * The Style axis toggles between two distinct block trees.
 */

import type { Block } from '../../../blocks/types'
import type { FooterPresetConfig } from '../types'
import {
    uid, resetUid,
    makeLogo,
    makeCtaSection,
    makeHeadinglessLinkColumn,
    makeSocialIcons,
    makeCreditsWithAvatars,
    makeCreditsCardOutside,
} from './shared-builders'

// ============================================
// Block tree builders
// ============================================

/**
 * Footer 9 — Normal CTA footer
 * Content: CTA heading+buttons (left, max-w-560) + 2 link lists (right, max-w-400)
 * Credits: logo+avatars → divider → copyright+social
 */
function buildNormal(): Block[] {
    const contentArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between @max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [
            makeCtaSection(560),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 32,
                    sizing: { width: 'fill' },
                    className: 'max-w-[400px] @max-sm:!max-w-full @max-sm:!flex-col @max-sm:!gap-10',
                },
                content: {},
                children: [
                    makeHeadinglessLinkColumn(0),
                    makeHeadinglessLinkColumn(5),
                ],
            },
        ],
    }

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
        children: [contentArea, makeCreditsWithAvatars()],
    }]
}

/**
 * Footer 15 — Card CTA footer
 * Card: logo+CTA (left) + links+social (right)
 * Credits (outside): copyright + legal
 */
function buildCard(): Block[] {
    const leftColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'max-w-[560px] @max-sm:!max-w-full @max-sm:!gap-6',
        },
        content: {},
        children: [
            makeLogo(),
            makeCtaSection(560),
        ],
    }

    const rightColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: 'max-w-[400px] items-end @max-sm:!max-w-full @max-sm:!items-start @max-sm:!gap-10',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 32,
                    sizing: { width: 'fill' },
                    className: '@max-sm:!flex-col @max-sm:!gap-10',
                },
                content: {},
                children: [
                    makeHeadinglessLinkColumn(0),
                    makeHeadinglessLinkColumn(5),
                ],
            },
            makeSocialIcons(),
        ],
    }

    const contentArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between @max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [leftColumn, rightColumn],
    }

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
        children: [contentArea, makeCreditsCardOutside()],
    }]
}

// ============================================
// Block Factories
// ============================================

export function buildFooter9Blocks(): Block[] { resetUid(); return buildNormal() }
export function buildFooter15Blocks(): Block[] { resetUid(); return buildCard() }

// ============================================
// Preset Configs
// ============================================

const FOOTER_9_CONFIG: FooterPresetConfig = {
    id: 'footer-9', name: 'Footer 9', family: 'd',
    description: 'CTA heading with buttons left + headingless link lists, avatars in credits',
    tags: ['footer', 'cta', 'buttons', 'avatars', 'normal'],
    shell: 'container',
    axes: { style: 'normal' },
}

const FOOTER_15_CONFIG: FooterPresetConfig = {
    id: 'footer-15', name: 'Footer 15', family: 'd',
    description: 'Card-wrapped CTA heading + buttons with link lists and social icons',
    tags: ['footer', 'cta', 'buttons', 'social', 'card'],
    shell: 'card',
    axes: { style: 'card' },
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_D_PRESETS: FooterPresetConfig[] = [FOOTER_9_CONFIG, FOOTER_15_CONFIG]

export const FAMILY_D_PRESETS_MAP: Record<string, FooterPresetConfig> = Object.fromEntries(
    FAMILY_D_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_D_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'footer-9': buildFooter9Blocks,
    'footer-15': buildFooter15Blocks,
}
