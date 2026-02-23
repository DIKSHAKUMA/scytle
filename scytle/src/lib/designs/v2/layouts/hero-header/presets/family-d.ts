/**
 * Hero Header Family D — Block Factories & Preset Configs
 *
 * 4 presets: Hero Header 15–18
 * Layout: Text column on left (tagline + heading + body + actions),
 *         image/video on right. Split layout with description.
 *
 * Axes: Asset (Image/Video) × Element (Form/Button)
 * Combo: 2 × 2 = 4 variants
 *
 * Shell: Always 'container' — media is inline, no background.
 * Differs from Family A: single split (no card/placement axes),
 * content column includes full tagline+heading+body+actions stacked.
 */

import type { Block } from '../../../blocks/types'
import type { HeroHeaderPresetConfig } from '../types'
import {
    uid, resetUid,
    makeSectionTitle, makeActions, makeMedia,
} from './shared-builders'

// ============================================
// Internal — split builder
// ============================================

/**
 * Split layout: tagline + heading + body + actions on left, media on right.
 * Image fills right column with auto ratio.
 */
function buildSplitBlocks(asset: 'image' | 'video', element: 'button' | 'form'): Block[] {
    const contentColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            layoutClassName: 'flex-1',
            alignment: { main: 'center', cross: 'start' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeSectionTitle(), makeActions(element)],
    }

    const mediaBlock = makeMedia(
        asset,
        'auto',
        'flex-1 self-stretch @max-sm:!self-auto @max-sm:!flex-auto @max-sm:!aspect-[3/2]',
    )

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            alignment: { main: 'start', cross: 'stretch' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [contentColumn, mediaBlock],
    }]
}

// ============================================
// Block Factories (4 total)
// ============================================

/** Hero Header 15 — Image, Button */
export function buildHH15Blocks(): Block[] { resetUid(); return buildSplitBlocks('image', 'button') }
/** Hero Header 16 — Image, Form */
export function buildHH16Blocks(): Block[] { resetUid(); return buildSplitBlocks('image', 'form') }
/** Hero Header 17 — Video, Button */
export function buildHH17Blocks(): Block[] { resetUid(); return buildSplitBlocks('video', 'button') }
/** Hero Header 18 — Video, Form */
export function buildHH18Blocks(): Block[] { resetUid(); return buildSplitBlocks('video', 'form') }

// ============================================
// Preset Configs (4 total)
// ============================================

function makeConfig(
    num: number,
    desc: string,
    tags: string[],
    asset: 'image' | 'video',
    element: 'button' | 'form',
): HeroHeaderPresetConfig {
    const isImage = asset === 'image'
    return {
        id: `hero-header-${num}`,
        name: `Hero Header ${num}`,
        description: desc,
        tags: ['hero-header', 'split', ...tags],
        family: 'd',
        imageRole: isImage ? 'inline' : 'none',
        supportsVideo: !isImage,
        shell: 'container',
        align: 'left',
        background: 'none',
        axes: { asset, element },
    }
}

export const FAMILY_D_PRESETS: HeroHeaderPresetConfig[] = [
    makeConfig(15, 'Split hero with image right, buttons',  ['button', 'image'], 'image', 'button'),
    makeConfig(16, 'Split hero with image right, form',     ['form', 'image'],   'image', 'form'),
    makeConfig(17, 'Split hero with video right, buttons',  ['button', 'video'], 'video', 'button'),
    makeConfig(18, 'Split hero with video right, form',     ['form', 'video'],   'video', 'form'),
]

export const FAMILY_D_PRESETS_MAP: Record<string, HeroHeaderPresetConfig> = Object.fromEntries(
    FAMILY_D_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_D_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'hero-header-15': buildHH15Blocks,
    'hero-header-16': buildHH16Blocks,
    'hero-header-17': buildHH17Blocks,
    'hero-header-18': buildHH18Blocks,
}
