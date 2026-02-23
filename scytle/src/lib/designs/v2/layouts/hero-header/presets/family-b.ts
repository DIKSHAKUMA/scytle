/**
 * Hero Header Family B — Block Factories & Preset Configs
 *
 * 8 presets: Hero Header 5–8, 88–91
 * Layout: Full-width background hero — text + buttons/form centered
 *         over a background image or video.
 *
 * Axes: Style (Normal/Card) × Background (Image/Video) × Element (Form/Button)
 * Combo: 2 × 2 × 2 = 8 variants
 *
 * Shell mapping:
 *   Normal → 'bg-container' (section-level bg with dark overlay)
 *   Card   → 'card-bg'      (card with bg layer inside)
 */

import type { Block } from '../../../blocks/types'
import type { HeroHeaderPresetConfig } from '../types'
import {
    uid, resetUid,
    makeSectionTitle, makeActions,
} from './shared-builders'

// ============================================
// Internal — centered content builder
// ============================================

/**
 * Centered content block: section title + action block.
 * Max-width 768px, centered alignment, text-center.
 */
function buildCenteredBlocks(element: 'button' | 'form'): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 768,
            sizing: { width: 'fill' },
            alignment: { main: 'start', cross: 'center' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeSectionTitle('center'), makeActions(element, 'center')],
    }]
}

// ============================================
// Block Factories (8 total)
// ============================================

/** Hero Header 5 — Normal, Image BG, Button */
export function buildHH5Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 6 — Normal, Image BG, Form */
export function buildHH6Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }
/** Hero Header 7 — Normal, Video BG, Button */
export function buildHH7Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 8 — Normal, Video BG, Form */
export function buildHH8Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }

/** Hero Header 88 — Card, Image BG, Button */
export function buildHH88Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 89 — Card, Image BG, Form */
export function buildHH89Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }
/** Hero Header 90 — Card, Video BG, Button */
export function buildHH90Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 91 — Card, Video BG, Form */
export function buildHH91Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }

// ============================================
// Preset Configs (8 total)
// ============================================

function makeConfig(
    num: number,
    desc: string,
    tags: string[],
    style: 'normal' | 'card',
    background: 'image' | 'video',
    element: 'button' | 'form',
): HeroHeaderPresetConfig {
    const isCard = style === 'card'
    const isBgImage = background === 'image'
    return {
        id: `hero-header-${num}`,
        name: `Hero Header ${num}`,
        description: desc,
        tags: ['hero-header', 'background', ...tags],
        family: 'b',
        imageRole: isBgImage ? 'background' : 'none',
        supportsVideo: !isBgImage,
        shell: isCard ? 'card-bg' : 'bg-container',
        align: 'center',
        background,
        axes: { style, background, element },
    }
}

export const FAMILY_B_PRESETS: HeroHeaderPresetConfig[] = [
    // Normal
    makeConfig(5,  'Background image hero with buttons',      ['button', 'image'],         'normal', 'image', 'button'),
    makeConfig(6,  'Background image hero with form',         ['form', 'image'],           'normal', 'image', 'form'),
    makeConfig(7,  'Background video hero with buttons',      ['button', 'video'],         'normal', 'video', 'button'),
    makeConfig(8,  'Background video hero with form',         ['form', 'video'],           'normal', 'video', 'form'),
    // Card
    makeConfig(88, 'Card background image hero with buttons', ['card', 'button', 'image'], 'card', 'image', 'button'),
    makeConfig(89, 'Card background image hero with form',    ['card', 'form', 'image'],   'card', 'image', 'form'),
    makeConfig(90, 'Card background video hero with buttons', ['card', 'button', 'video'], 'card', 'video', 'button'),
    makeConfig(91, 'Card background video hero with form',    ['card', 'form', 'video'],   'card', 'video', 'form'),
]

export const FAMILY_B_PRESETS_MAP: Record<string, HeroHeaderPresetConfig> = Object.fromEntries(
    FAMILY_B_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_B_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'hero-header-5': buildHH5Blocks,
    'hero-header-6': buildHH6Blocks,
    'hero-header-7': buildHH7Blocks,
    'hero-header-8': buildHH8Blocks,
    'hero-header-88': buildHH88Blocks,
    'hero-header-89': buildHH89Blocks,
    'hero-header-90': buildHH90Blocks,
    'hero-header-91': buildHH91Blocks,
}
