/**
 * Hero Header Family F — Block Factories & Preset Configs
 *
 * 12 presets: Hero Header 23, 24, 30, 31, 33, 34, 96–101
 * Layout: Centered full-width hero — heading + paragraph + buttons/form
 *         centered, with optional background (none, image, video).
 *
 * Axes: Style (Normal/Card) × Background (None/Image/Video) × Element (Form/Button)
 * Combo: 2 × 3 × 2 = 12 variants
 *
 * Shell mapping:
 *   Normal + None  → 'container'
 *   Normal + Image → 'bg-container'
 *   Normal + Video → 'bg-container'
 *   Card   + None  → 'card'
 *   Card   + Image → 'card-bg'
 *   Card   + Video → 'card-bg'
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
 * Centered content: section title + action block.
 * Max-width 768px, center-aligned.
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
// Block Factories (12 total)
// ============================================

// ── Normal + None BG ────────────────────────────────────────

/** Hero Header 23 — Normal, None, Button */
export function buildHH23Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 24 — Normal, None, Form */
export function buildHH24Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }

// ── Normal + Image/Video BG ────────────────────────────────

/** Hero Header 30 — Normal, Image, Button */
export function buildHH30Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 31 — Normal, Image, Form */
export function buildHH31Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }
/** Hero Header 33 — Normal, Video, Button */
export function buildHH33Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 34 — Normal, Video, Form */
export function buildHH34Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }

// ── Card + None BG ──────────────────────────────────────────

/** Hero Header 96 — Card, None, Button */
export function buildHH96Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 97 — Card, None, Form */
export function buildHH97Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }

// ── Card + Image/Video BG ──────────────────────────────────

/** Hero Header 98 — Card, Image, Button */
export function buildHH98Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 99 — Card, Image, Form */
export function buildHH99Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }
/** Hero Header 100 — Card, Video, Button */
export function buildHH100Blocks(): Block[] { resetUid(); return buildCenteredBlocks('button') }
/** Hero Header 101 — Card, Video, Form */
export function buildHH101Blocks(): Block[] { resetUid(); return buildCenteredBlocks('form') }

// ============================================
// Preset Configs (12 total)
// ============================================

function resolveShell(style: 'normal' | 'card', background: 'none' | 'image' | 'video') {
    if (style === 'card') return background === 'none' ? 'card' as const : 'card-bg' as const
    return background === 'none' ? 'container' as const : 'bg-container' as const
}

function makeConfig(
    num: number,
    desc: string,
    tags: string[],
    style: 'normal' | 'card',
    background: 'none' | 'image' | 'video',
    element: 'button' | 'form',
): HeroHeaderPresetConfig {
    const shell = resolveShell(style, background)
    const isBgImage = background === 'image'
    const isBgVideo = background === 'video'
    return {
        id: `hero-header-${num}`,
        name: `Hero Header ${num}`,
        description: desc,
        tags: ['hero-header', 'centered', ...tags],
        family: 'f',
        imageRole: isBgImage ? 'background' : 'none',
        supportsVideo: isBgVideo,
        shell,
        align: 'center',
        background,
        axes: { style, background, element },
    }
}

export const FAMILY_F_PRESETS: HeroHeaderPresetConfig[] = [
    // Normal
    makeConfig(23,  'Centered hero, no background, buttons',         ['button', 'minimal'],         'normal', 'none',  'button'),
    makeConfig(24,  'Centered hero, no background, form',            ['form', 'minimal'],           'normal', 'none',  'form'),
    makeConfig(30,  'Centered hero, background image, buttons',      ['button', 'image'],           'normal', 'image', 'button'),
    makeConfig(31,  'Centered hero, background image, form',         ['form', 'image'],             'normal', 'image', 'form'),
    makeConfig(33,  'Centered hero, background video, buttons',      ['button', 'video'],           'normal', 'video', 'button'),
    makeConfig(34,  'Centered hero, background video, form',         ['form', 'video'],             'normal', 'video', 'form'),
    // Card
    makeConfig(96,  'Card centered hero, no background, buttons',    ['card', 'button', 'minimal'], 'card',   'none',  'button'),
    makeConfig(97,  'Card centered hero, no background, form',       ['card', 'form', 'minimal'],   'card',   'none',  'form'),
    makeConfig(98,  'Card centered hero, background image, buttons', ['card', 'button', 'image'],   'card',   'image', 'button'),
    makeConfig(99,  'Card centered hero, background image, form',    ['card', 'form', 'image'],     'card',   'image', 'form'),
    makeConfig(100, 'Card centered hero, background video, buttons', ['card', 'button', 'video'],   'card',   'video', 'button'),
    makeConfig(101, 'Card centered hero, background video, form',    ['card', 'form', 'video'],     'card',   'video', 'form'),
]

export const FAMILY_F_PRESETS_MAP: Record<string, HeroHeaderPresetConfig> = Object.fromEntries(
    FAMILY_F_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_F_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'hero-header-23': buildHH23Blocks,
    'hero-header-24': buildHH24Blocks,
    'hero-header-30': buildHH30Blocks,
    'hero-header-31': buildHH31Blocks,
    'hero-header-33': buildHH33Blocks,
    'hero-header-34': buildHH34Blocks,
    'hero-header-96': buildHH96Blocks,
    'hero-header-97': buildHH97Blocks,
    'hero-header-98': buildHH98Blocks,
    'hero-header-99': buildHH99Blocks,
    'hero-header-100': buildHH100Blocks,
    'hero-header-101': buildHH101Blocks,
}
