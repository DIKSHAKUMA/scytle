/**
 * Hero Header Family A — Block Factories & Preset Configs
 *
 * 16 presets: Hero Header 1–4, 19–22, 84–87, 92–95
 * Layout: Standard split hero — heading + paragraph + buttons/form on one side,
 *         image/video on the other.
 *
 * Axes: Style (Normal/Card) × Asset (Image/Video) × Placement (Left/Right) × Element (Form/Button)
 * Combo: 2 × 2 × 2 × 2 = 16 variants
 *
 * Shell mapping:
 *   Normal → 'container'  (standard split with gap-80)
 *   Card   → 'card'       (content padded in card, media flush)
 */

import type { Block } from '../../../blocks/types'
import type { HeroHeaderPresetConfig } from '../types'
import {
    uid, resetUid,
    makeSectionTitle, makeActions, makeMedia,
} from './shared-builders'

// ============================================
// Internal — parametric split builder
// ============================================

/**
 * Normal-style split: columns frame with gap-80, items-center.
 * Content column has section title + action block.
 * Media block sits on the other side.
 */
function buildNormalSplit(
    placement: 'left' | 'right',
    element: 'button' | 'form',
    asset: 'image' | 'video',
): Block[] {
    const contentColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            layoutClassName: 'flex-1',
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeSectionTitle(), makeActions(element)],
    }

    const mediaBlock = makeMedia(asset, '3:2', 'flex-1 @max-sm:!flex-auto')

    const children = placement === 'left'
        ? [mediaBlock, contentColumn]
        : [contentColumn, mediaBlock]

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            alignment: { main: 'start', cross: 'center' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children,
    }]
}

/**
 * Card-style split: content padded inside card, media flush edge.
 * Content column has internal padding, media fills card height.
 */
function buildCardSplit(
    placement: 'left' | 'right',
    element: 'button' | 'form',
    asset: 'image' | 'video',
): Block[] {
    const contentColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            padding: { top: 48, right: 48, bottom: 48, left: 48 },
            alignment: { main: 'center', cross: 'start' },
            layoutClassName: 'flex-1',
            className: '@max-sm:!p-8 @max-sm:!gap-6',
        },
        content: {},
        children: [makeSectionTitle(), makeActions(element)],
    }

    const mediaBlock = makeMedia(
        asset,
        'auto',
        'flex-1 self-stretch @max-sm:!self-auto @max-sm:!flex-auto @max-sm:!aspect-[3/2]',
    )

    const children = placement === 'left'
        ? [mediaBlock, contentColumn]
        : [contentColumn, mediaBlock]

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            className: '@max-sm:!flex-col',
        },
        content: {},
        children,
    }]
}

// ============================================
// Block Factories (16 total)
// ============================================

// ── Normal + Image + Right ──────────────────────────────────

/** Hero Header 1 — Normal, Image, Right, Button */
export function buildHH1Blocks(): Block[] { resetUid(); return buildNormalSplit('right', 'button', 'image') }
/** Hero Header 2 — Normal, Image, Right, Form */
export function buildHH2Blocks(): Block[] { resetUid(); return buildNormalSplit('right', 'form', 'image') }
/** Hero Header 3 — Normal, Video, Right, Button */
export function buildHH3Blocks(): Block[] { resetUid(); return buildNormalSplit('right', 'button', 'video') }
/** Hero Header 4 — Normal, Video, Right, Form */
export function buildHH4Blocks(): Block[] { resetUid(); return buildNormalSplit('right', 'form', 'video') }

// ── Normal + Image/Video + Left ─────────────────────────────

/** Hero Header 19 — Normal, Image, Left, Button */
export function buildHH19Blocks(): Block[] { resetUid(); return buildNormalSplit('left', 'button', 'image') }
/** Hero Header 20 — Normal, Image, Left, Form */
export function buildHH20Blocks(): Block[] { resetUid(); return buildNormalSplit('left', 'form', 'image') }
/** Hero Header 21 — Normal, Video, Left, Button */
export function buildHH21Blocks(): Block[] { resetUid(); return buildNormalSplit('left', 'button', 'video') }
/** Hero Header 22 — Normal, Video, Left, Form */
export function buildHH22Blocks(): Block[] { resetUid(); return buildNormalSplit('left', 'form', 'video') }

// ── Card + Image/Video + Right ──────────────────────────────

/** Hero Header 84 — Card, Image, Right, Button */
export function buildHH84Blocks(): Block[] { resetUid(); return buildCardSplit('right', 'button', 'image') }
/** Hero Header 85 — Card, Image, Right, Form */
export function buildHH85Blocks(): Block[] { resetUid(); return buildCardSplit('right', 'form', 'image') }
/** Hero Header 86 — Card, Video, Right, Button */
export function buildHH86Blocks(): Block[] { resetUid(); return buildCardSplit('right', 'button', 'video') }
/** Hero Header 87 — Card, Video, Right, Form */
export function buildHH87Blocks(): Block[] { resetUid(); return buildCardSplit('right', 'form', 'video') }

// ── Card + Image/Video + Left ───────────────────────────────

/** Hero Header 92 — Card, Image, Left, Button */
export function buildHH92Blocks(): Block[] { resetUid(); return buildCardSplit('left', 'button', 'image') }
/** Hero Header 93 — Card, Image, Left, Form */
export function buildHH93Blocks(): Block[] { resetUid(); return buildCardSplit('left', 'form', 'image') }
/** Hero Header 94 — Card, Video, Left, Button */
export function buildHH94Blocks(): Block[] { resetUid(); return buildCardSplit('left', 'button', 'video') }
/** Hero Header 95 — Card, Video, Left, Form */
export function buildHH95Blocks(): Block[] { resetUid(); return buildCardSplit('left', 'form', 'video') }

// ============================================
// Preset Configs (16 total)
// ============================================

function makeConfig(
    num: number,
    desc: string,
    tags: string[],
    style: 'normal' | 'card',
    asset: 'image' | 'video',
    placement: 'left' | 'right',
    element: 'button' | 'form',
): HeroHeaderPresetConfig {
    const isCard = style === 'card'
    const isImage = asset === 'image'
    return {
        id: `hero-header-${num}`,
        name: `Hero Header ${num}`,
        description: desc,
        tags: ['hero-header', ...tags],
        family: 'a',
        imageRole: isImage ? 'inline' : 'none',
        supportsVideo: !isImage,
        shell: isCard ? 'card' : 'container',
        align: 'left',
        background: 'none',
        axes: { style, asset, assetPlacement: placement, element },
    }
}

export const FAMILY_A_PRESETS: HeroHeaderPresetConfig[] = [
    // Normal + Right
    makeConfig(1,  'Split hero with image right, buttons',        ['split', 'button', 'image'],         'normal', 'image', 'right', 'button'),
    makeConfig(2,  'Split hero with image right, form',           ['split', 'form', 'image'],           'normal', 'image', 'right', 'form'),
    makeConfig(3,  'Split hero with video right, buttons',        ['split', 'button', 'video'],         'normal', 'video', 'right', 'button'),
    makeConfig(4,  'Split hero with video right, form',           ['split', 'form', 'video'],           'normal', 'video', 'right', 'form'),
    // Normal + Left
    makeConfig(19, 'Split hero with image left, buttons',         ['split', 'button', 'image', 'left'], 'normal', 'image', 'left',  'button'),
    makeConfig(20, 'Split hero with image left, form',            ['split', 'form', 'image', 'left'],   'normal', 'image', 'left',  'form'),
    makeConfig(21, 'Split hero with video left, buttons',         ['split', 'button', 'video', 'left'], 'normal', 'video', 'left',  'button'),
    makeConfig(22, 'Split hero with video left, form',            ['split', 'form', 'video', 'left'],   'normal', 'video', 'left',  'form'),
    // Card + Right
    makeConfig(84, 'Card split hero with image right, buttons',   ['card', 'split', 'button', 'image'], 'card', 'image', 'right', 'button'),
    makeConfig(85, 'Card split hero with image right, form',      ['card', 'split', 'form', 'image'],   'card', 'image', 'right', 'form'),
    makeConfig(86, 'Card split hero with video right, buttons',   ['card', 'split', 'button', 'video'], 'card', 'video', 'right', 'button'),
    makeConfig(87, 'Card split hero with video right, form',      ['card', 'split', 'form', 'video'],   'card', 'video', 'right', 'form'),
    // Card + Left
    makeConfig(92, 'Card split hero with image left, buttons',    ['card', 'split', 'button', 'image', 'left'], 'card', 'image', 'left', 'button'),
    makeConfig(93, 'Card split hero with image left, form',       ['card', 'split', 'form', 'image', 'left'],   'card', 'image', 'left', 'form'),
    makeConfig(94, 'Card split hero with video left, buttons',    ['card', 'split', 'button', 'video', 'left'], 'card', 'video', 'left', 'button'),
    makeConfig(95, 'Card split hero with video left, form',       ['card', 'split', 'form', 'video', 'left'],   'card', 'video', 'left', 'form'),
]

export const FAMILY_A_PRESETS_MAP: Record<string, HeroHeaderPresetConfig> = Object.fromEntries(
    FAMILY_A_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_A_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'hero-header-1': buildHH1Blocks,
    'hero-header-2': buildHH2Blocks,
    'hero-header-3': buildHH3Blocks,
    'hero-header-4': buildHH4Blocks,
    'hero-header-19': buildHH19Blocks,
    'hero-header-20': buildHH20Blocks,
    'hero-header-21': buildHH21Blocks,
    'hero-header-22': buildHH22Blocks,
    'hero-header-84': buildHH84Blocks,
    'hero-header-85': buildHH85Blocks,
    'hero-header-86': buildHH86Blocks,
    'hero-header-87': buildHH87Blocks,
    'hero-header-92': buildHH92Blocks,
    'hero-header-93': buildHH93Blocks,
    'hero-header-94': buildHH94Blocks,
    'hero-header-95': buildHH95Blocks,
}
