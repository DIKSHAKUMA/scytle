/**
 * Footer Family B — Block Factories & Preset Configs
 *
 * 2 presets: Footer 3 (Normal), Footer 10 (Card)
 * Layout: Logo + 3 titled link columns (left) + Newsletter/Subscribe (right).
 *
 * Axis: Style (normal/card)
 *   normal → Footer 3: section → container(gap-80) → content + credits(divider + copyright+legal + social)
 *   card   → Footer 10: section → container(gap-32) → card(border, p-48) + credits(copyright+legal + social)
 *
 * Structural patterns (from Figma):
 *   Content: Links(logo-col + 3 titled cols, gap-40) | Subscribe(w-400, heading+desc+form)
 *   Normal credits: divider → (copyright+legal) left + social right
 *   Card credits: same but outside card, no divider
 */

import type { Block } from '../../../blocks/types'
import type { FooterPresetConfig } from '../types'
import {
    uid, resetUid,
    makeLogo,
    makeLinkColumn,
    makeSubscribeSection,
    makeCreditsWithSocial,
    makeCreditsCardOutsideWithSocial,
} from './shared-builders'

// ============================================
// Shared content area
// ============================================

function makeContentArea(): Block {
    // Logo column (standalone, just the logo vertically positioned)
    const logoCol: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
            className: 'flex-1 @max-sm:!w-full',
        },
        content: {},
        children: [makeLogo()],
    }

    // Links area: logo col + 3 titled columns
    const linksArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 40,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-10',
        },
        content: {},
        children: [
            logoCol,
            makeLinkColumn('Column One'),
            makeLinkColumn('Column Two'),
            makeLinkColumn('Column Three'),
        ],
    }

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
        children: [linksArea, makeSubscribeSection(true)],
    }
}

// ============================================
// Block tree builders
// ============================================

/** Footer 3 — Normal */
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
        children: [makeContentArea(), makeCreditsWithSocial()],
    }]
}

/** Footer 10 — Card */
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
        children: [makeContentArea(), makeCreditsCardOutsideWithSocial()],
    }]
}

// ============================================
// Block Factories
// ============================================

export function buildFooter3Blocks(): Block[] { resetUid(); return buildNormal() }
export function buildFooter10Blocks(): Block[] { resetUid(); return buildCard() }

// ============================================
// Preset Configs
// ============================================

const FOOTER_3_CONFIG: FooterPresetConfig = {
    id: 'footer-3', name: 'Footer 3', family: 'b',
    description: 'Logo + 3 titled columns with subscribe form on the right',
    tags: ['footer', 'newsletter', 'columns', 'social', 'normal'],
    shell: 'container',
    axes: { style: 'normal' },
}

const FOOTER_10_CONFIG: FooterPresetConfig = {
    id: 'footer-10', name: 'Footer 10', family: 'b',
    description: 'Card-wrapped logo + 3 titled columns with subscribe form',
    tags: ['footer', 'newsletter', 'columns', 'social', 'card'],
    shell: 'card',
    axes: { style: 'card' },
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_B_PRESETS: FooterPresetConfig[] = [FOOTER_3_CONFIG, FOOTER_10_CONFIG]

export const FAMILY_B_PRESETS_MAP: Record<string, FooterPresetConfig> = Object.fromEntries(
    FAMILY_B_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_B_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'footer-3': buildFooter3Blocks,
    'footer-10': buildFooter10Blocks,
}
