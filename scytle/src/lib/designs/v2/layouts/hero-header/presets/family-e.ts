/**
 * Hero Header Family E — Block Factories & Preset Configs
 *
 * 4 presets: Hero Header 26–29
 * Layout: Text + image side-by-side. Structurally similar to Family D
 *         but with a distinct layout treatment — content vertically centered,
 *         media aligned to top.
 *
 * Axes: Asset (Image/Video) × Element (Form/Button)
 * Combo: 2 × 2 = 4 variants
 *
 * Shell: Always 'container' — media is inline, no background.
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
 * Side-by-side layout: content left (vertically centered), media right.
 * Content uses section title (tagline + heading + body) + actions.
 * Image has 4:3 ratio for a slightly taller feel.
 */
function buildSideBySideBlocks(asset: 'image' | 'video', element: 'button' | 'form'): Block[] {
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

    const mediaBlock = makeMedia(asset, '4:3', 'flex-1 @max-sm:!flex-auto')

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
        children: [contentColumn, mediaBlock],
    }]
}

// ============================================
// Block Factories (4 total)
// ============================================

/** Hero Header 26 — Image, Button */
export function buildHH26Blocks(): Block[] { resetUid(); return buildSideBySideBlocks('image', 'button') }
/** Hero Header 27 — Image, Form */
export function buildHH27Blocks(): Block[] { resetUid(); return buildSideBySideBlocks('image', 'form') }
/** Hero Header 28 — Video, Button */
export function buildHH28Blocks(): Block[] { resetUid(); return buildSideBySideBlocks('video', 'button') }
/** Hero Header 29 — Video, Form */
export function buildHH29Blocks(): Block[] { resetUid(); return buildSideBySideBlocks('video', 'form') }

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
        family: 'e',
        imageRole: isImage ? 'inline' : 'none',
        supportsVideo: !isImage,
        shell: 'container',
        align: 'left',
        background: 'none',
        axes: { asset, element },
    }
}

export const FAMILY_E_PRESETS: HeroHeaderPresetConfig[] = [
    makeConfig(26, 'Side-by-side hero with image, buttons', ['button', 'image'], 'image', 'button'),
    makeConfig(27, 'Side-by-side hero with image, form',    ['form', 'image'],   'image', 'form'),
    makeConfig(28, 'Side-by-side hero with video, buttons', ['button', 'video'], 'video', 'button'),
    makeConfig(29, 'Side-by-side hero with video, form',    ['form', 'video'],   'video', 'form'),
]

export const FAMILY_E_PRESETS_MAP: Record<string, HeroHeaderPresetConfig> = Object.fromEntries(
    FAMILY_E_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_E_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'hero-header-26': buildHH26Blocks,
    'hero-header-27': buildHH27Blocks,
    'hero-header-28': buildHH28Blocks,
    'hero-header-29': buildHH29Blocks,
}
