/**
 * Hero Header Family C — Block Factories & Preset Configs
 *
 * 4 presets: Hero Header 9, 10, 13, 14
 * Layout: Image/video on top (full-width), heading below left-aligned,
 *         paragraph + buttons/form alongside in a right column.
 *
 * Axes: Asset (Image/Video) × Element (Form/Button)
 * Combo: 2 × 2 = 4 variants
 *
 * Shell: Always 'container' — media is an inline block, not a background.
 */

import type { Block } from '../../../blocks/types'
import type { HeroHeaderPresetConfig } from '../types'
import {
    uid, resetUid,
    makeHeading, makeBody, makeActions, makeMedia,
} from './shared-builders'

// ============================================
// Internal — stacked builder
// ============================================

/**
 * Stacked layout: full-width media on top, then two-column text area below.
 * Left column = heading, right column = body + actions.
 */
function buildStackedBlocks(asset: 'image' | 'video', element: 'button' | 'form'): Block[] {
    const mediaBlock = makeMedia(asset, '16:9', 'w-full')

    const leftCol: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            layoutClassName: 'flex-1',
        },
        content: {},
        children: [makeHeading()],
    }

    const rightCol: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            layoutClassName: 'flex-1',
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeBody(), makeActions(element)],
    }

    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            className: '@max-sm:!flex-col @max-sm:!gap-8',
        },
        content: {},
        children: [leftCol, rightCol],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 48,
            className: '@max-sm:!gap-10',
        },
        content: {},
        children: [mediaBlock, columnsFrame],
    }]
}

// ============================================
// Block Factories (4 total)
// ============================================

/** Hero Header 9 — Image, Button */
export function buildHH9Blocks(): Block[] { resetUid(); return buildStackedBlocks('image', 'button') }
/** Hero Header 10 — Image, Form */
export function buildHH10Blocks(): Block[] { resetUid(); return buildStackedBlocks('image', 'form') }
/** Hero Header 13 — Video, Button */
export function buildHH13Blocks(): Block[] { resetUid(); return buildStackedBlocks('video', 'button') }
/** Hero Header 14 — Video, Form */
export function buildHH14Blocks(): Block[] { resetUid(); return buildStackedBlocks('video', 'form') }

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
        tags: ['hero-header', 'stacked', ...tags],
        family: 'c',
        imageRole: isImage ? 'inline' : 'none',
        supportsVideo: !isImage,
        shell: 'container',
        align: 'left',
        background: 'none',
        axes: { asset, element },
    }
}

export const FAMILY_C_PRESETS: HeroHeaderPresetConfig[] = [
    makeConfig(9,  'Stacked hero: image top, two-column text, buttons', ['button', 'image'], 'image', 'button'),
    makeConfig(10, 'Stacked hero: image top, two-column text, form',    ['form', 'image'],   'image', 'form'),
    makeConfig(13, 'Stacked hero: video top, two-column text, buttons', ['button', 'video'], 'video', 'button'),
    makeConfig(14, 'Stacked hero: video top, two-column text, form',    ['form', 'video'],   'video', 'form'),
]

export const FAMILY_C_PRESETS_MAP: Record<string, HeroHeaderPresetConfig> = Object.fromEntries(
    FAMILY_C_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_C_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'hero-header-9': buildHH9Blocks,
    'hero-header-10': buildHH10Blocks,
    'hero-header-13': buildHH13Blocks,
    'hero-header-14': buildHH14Blocks,
}
