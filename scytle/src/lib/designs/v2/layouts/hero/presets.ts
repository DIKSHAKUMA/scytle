/**
 * Hero Layout — Presets
 *
 * Five hero presets derived from Figma:
 *   hero-44 — Header 44: Left-aligned single column (minimal)
 *   hero-57 — Header 57: Split two-column (text both sides)
 *   hero-1  — Header 1:  Split, text left + image right
 *   hero-3  — Header 3:  Split, text left + video right
 *   hero-5  — Header 5:  Full background image with overlay
 *
 * Each preset defines a `defaultBlocks()` factory returning a nested
 * frame block tree. Every structural wrapper is a frame block so it's
 * hoverable, selectable, and draggable on the canvas.
 */

import type { Block } from '../../blocks/types'
import type { HeroPresetConfig } from './types'
import { DEFAULT_CONTENT } from './types'

// ============================================
// Helpers
// ============================================

let _uid = 0
function uid(): string {
    return `hero-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
}

/** Reset UID counter (call before each defaultBlocks factory) */
function resetUid() {
    _uid = 0
}

// ============================================
// Hero 44 — Left-aligned, single column
// ============================================
// Desktop: py-28 px-16, container max-w-[1280px], content max-w-3xl
//          gap-8 between title-group and button-group
//          gap-4 within title-group (tagline ↔ heading)
//          gap-6 between heading and body
// Mobile:  py-16 px-5, gap-6, gap-3, gap-5, H1 scales down

function buildHero44Blocks(): Block[] {
    resetUid()

    const tagline: Block = {
        id: uid(),
        type: 'badge',
        props: { variant: 'default' },
        content: { text: DEFAULT_CONTENT.tagline },
    }

    const heading: Block = {
        id: uid(),
        type: 'heading',
        props: { level: 1, align: 'left' },
        content: { text: DEFAULT_CONTENT.heading },
    }

    const body: Block = {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align: 'left' },
        content: { text: DEFAULT_CONTENT.body },
    }

    const primaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT.primaryButton },
    }

    const secondaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'secondary', size: 'lg' },
        content: { text: DEFAULT_CONTENT.secondaryButton },
    }

    // Button group frame
    const buttonGroup: Block = {
        id: uid(),
        type: 'button-group',
        props: { align: 'left', gap: 16 },
        content: {},
        children: [primaryBtn, secondaryBtn],
    }

    // Title group: tagline + heading + body
    const titleGroup: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            layoutClassName: 'max-w-3xl',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: { direction: 'vertical', gap: 16 },
                content: {},
                children: [tagline, heading],
            },
            body,
        ],
    }

    // Content column: title group + button group
    const contentColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            layoutClassName: 'max-w-3xl',
        },
        content: {},
        children: [titleGroup, buttonGroup],
    }

    return [contentColumn]
}

// ============================================
// Hero 57 — Split two-column
// ============================================
// Desktop: py-28 px-16, container max-w-[1280px], 2 equal columns
//          gap-20 between columns
//          Left: tagline + H1 (gap-4)
//          Right: body + buttons (gap-8)
// Mobile:  flex-col, py-16 px-5, gap-5, left gap-3, right gap-6

function buildHero57Blocks(): Block[] {
    resetUid()

    const tagline: Block = {
        id: uid(),
        type: 'badge',
        props: { variant: 'default' },
        content: { text: DEFAULT_CONTENT.tagline },
    }

    const heading: Block = {
        id: uid(),
        type: 'heading',
        props: { level: 1, align: 'left' },
        content: { text: DEFAULT_CONTENT.heading },
    }

    const body: Block = {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align: 'left' },
        content: { text: DEFAULT_CONTENT.body },
    }

    const primaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT.primaryButton },
    }

    const secondaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'secondary', size: 'lg' },
        content: { text: DEFAULT_CONTENT.secondaryButton },
    }

    const buttonGroup: Block = {
        id: uid(),
        type: 'button-group',
        props: { align: 'left', gap: 16 },
        content: {},
        children: [primaryBtn, secondaryBtn],
    }

    // Left column: tagline + heading
    // Desktop: gap-16 (4)  |  Mobile: gap-12 (3)
    const leftColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            layoutClassName: 'flex-1',
            className: '@max-sm:!gap-3',
        },
        content: {},
        children: [tagline, heading],
    }

    // Right column: body + buttons
    // Desktop: gap-32 (8)  |  Mobile: gap-24 (6)
    const rightColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            alignment: { main: 'start', cross: 'start' },
            layoutClassName: 'flex-1',
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [body, buttonGroup],
    }

    // Two-column container
    // Desktop: flex-row gap-80 (20)  |  Mobile: flex-col gap-20 (5)
    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            className: '@max-sm:!flex-col @max-sm:!gap-5',
        },
        content: {},
        children: [leftColumn, rightColumn],
    }

    return [columnsFrame]
}

// ============================================
// Hero 1 — Split, text left + image right
// ============================================
// Figma: Header / 1 / (node 4174:1808)
// Desktop: py-28 px-16, container max-w-[1280px], 2 columns gap-80, items-center
//          Left (flex-1): content(heading+body gap-24) + buttons (gap-32)
//          Right (flex-1): square image 1:1
// Mobile:  flex-col, gap-48 → gap-12, py-16 px-5

function buildHero1Blocks(): Block[] {
    resetUid()

    const heading: Block = {
        id: uid(),
        type: 'heading',
        props: { level: 1, align: 'left' },
        content: { text: DEFAULT_CONTENT.heading },
    }

    const body: Block = {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align: 'left' },
        content: { text: DEFAULT_CONTENT.body },
    }

    const primaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT.primaryButton },
    }

    const secondaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'outline', size: 'lg' },
        content: { text: DEFAULT_CONTENT.secondaryButton },
    }

    const buttonGroup: Block = {
        id: uid(),
        type: 'button-group',
        props: { align: 'left', gap: 16 },
        content: {},
        children: [primaryBtn, secondaryBtn],
    }

    // Text content: heading + body (gap-24)
    const textContent: Block = {
        id: uid(),
        type: 'frame',
        props: { direction: 'vertical', gap: 24 },
        content: {},
        children: [heading, body],
    }

    // Left column: text content + buttons (gap-32)
    const leftColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            layoutClassName: 'flex-1',
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [textContent, buttonGroup],
    }

    // Right column: square image placeholder
    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: { ratio: '1:1', fillMode: 'cover', layoutClassName: 'flex-1 @max-sm:!flex-auto' },
        content: { alt: 'Hero image' },
    }

    // Two-column container — items-center for vertical centering
    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            alignment: { main: 'start', cross: 'center' },
            className: '@max-sm:!flex-col @max-sm:!gap-12 @max-sm:!items-stretch',
        },
        content: {},
        children: [leftColumn, imageBlock],
    }

    return [columnsFrame]
}

// ============================================
// Hero 3 — Split, text left + video right
// ============================================
// Figma: Header / 3 / (node 4174:1852)
// Desktop: py-28 px-16, container max-w-[1280px], 2 columns gap-80, items-center
//          Left (flex-1): content(heading+body gap-24) + buttons (gap-32)
//          Right (flex-1): video placeholder 1:1 with play button overlay
// Mobile:  flex-col, gap-48 → gap-12, py-16 px-5

function buildHero3Blocks(): Block[] {
    resetUid()

    const heading: Block = {
        id: uid(),
        type: 'heading',
        props: { level: 1, align: 'left' },
        content: { text: DEFAULT_CONTENT.heading },
    }

    const body: Block = {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align: 'left' },
        content: { text: DEFAULT_CONTENT.body },
    }

    const primaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT.primaryButton },
    }

    const secondaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'outline', size: 'lg' },
        content: { text: DEFAULT_CONTENT.secondaryButton },
    }

    const buttonGroup: Block = {
        id: uid(),
        type: 'button-group',
        props: { align: 'left', gap: 16 },
        content: {},
        children: [primaryBtn, secondaryBtn],
    }

    // Text content: heading + body (gap-24)
    const textContent: Block = {
        id: uid(),
        type: 'frame',
        props: { direction: 'vertical', gap: 24 },
        content: {},
        children: [heading, body],
    }

    // Left column: text content + buttons (gap-32)
    const leftColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            layoutClassName: 'flex-1',
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [textContent, buttonGroup],
    }

    // Right column: video placeholder (1:1 aspect with play button)
    const videoBlock: Block = {
        id: uid(),
        type: 'video',
        props: { ratio: '1:1', layoutClassName: 'flex-1 @max-sm:!flex-auto' },
        content: { caption: '' },
    }

    // Two-column container — items-center for vertical centering
    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            alignment: { main: 'start', cross: 'center' },
            className: '@max-sm:!flex-col @max-sm:!gap-12 @max-sm:!items-stretch',
        },
        content: {},
        children: [leftColumn, videoBlock],
    }

    return [columnsFrame]
}

// ============================================
// Hero 5 — Full background image with overlay
// ============================================
// Figma: Header / 5 / (node 4174:1914)
// Desktop: min-h-[600px] (wireframe), px-16, flex items-center
//          Container max-w-[1280px]
//          Content max-w-[560px], left-aligned
//          heading + body (gap-24) + buttons (gap-32)
//          Background: image placeholder + rgba(0,0,0,0.4) overlay
//          Text: forced white on dark overlay
// Mobile:  px-5, py-16
//
// NOTE: Background image is rendered by the Hero5 section component,
// not as a block. It's a section-level visual property (like bg-color).
// The block tree contains only the text/button content.

function buildHero5Blocks(): Block[] {
    resetUid()

    const heading: Block = {
        id: uid(),
        type: 'heading',
        props: { level: 1, align: 'left' },
        content: { text: DEFAULT_CONTENT.heading },
    }

    const body: Block = {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align: 'left' },
        content: { text: DEFAULT_CONTENT.body },
    }

    const primaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT.primaryButton },
    }

    const secondaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'outline', size: 'lg' },
        content: { text: DEFAULT_CONTENT.secondaryButton },
    }

    const buttonGroup: Block = {
        id: uid(),
        type: 'button-group',
        props: { align: 'left', gap: 16 },
        content: {},
        children: [primaryBtn, secondaryBtn],
    }

    // Text content: heading + body (gap-24)
    const textContent: Block = {
        id: uid(),
        type: 'frame',
        props: { direction: 'vertical', gap: 24 },
        content: {},
        children: [heading, body],
    }

    // Content column: text + buttons, narrow max-width (gap-32)
    const contentColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 560,
        },
        content: {},
        children: [textContent, buttonGroup],
    }

    return [contentColumn]
}

// ============================================
// Preset Configs
// ============================================

export const HERO_44_CONFIG: HeroPresetConfig = {
    id: 'hero-44',
    name: 'Header 44',
    description: 'Left-aligned hero with tagline, heading, body, and two buttons',
    layout: 'minimal',
    tags: ['hero', 'left-aligned', 'single-column', 'buttons', 'minimal'],
    imageRole: 'none',
    supportsVideo: false,
}

export const HERO_57_CONFIG: HeroPresetConfig = {
    id: 'hero-57',
    name: 'Header 57',
    description: 'Split two-column hero — left: tagline + heading, right: body + buttons',
    layout: 'split-text',
    tags: ['hero', 'split', 'two-column', 'text', 'buttons'],
    imageRole: 'none',
    supportsVideo: false,
}

export const HERO_1_CONFIG: HeroPresetConfig = {
    id: 'hero-1',
    name: 'Header 1',
    description: 'Split hero — text left with heading and CTA, image placeholder right',
    layout: 'split-image',
    tags: ['hero', 'split', 'image', 'two-column', 'buttons'],
    imageRole: 'inline',
    supportsVideo: false,
}

export const HERO_3_CONFIG: HeroPresetConfig = {
    id: 'hero-3',
    name: 'Header 3',
    description: 'Split hero — text left with heading and CTA, video placeholder right',
    layout: 'split-video',
    tags: ['hero', 'split', 'video', 'two-column', 'buttons'],
    imageRole: 'none',
    supportsVideo: true,
}

export const HERO_5_CONFIG: HeroPresetConfig = {
    id: 'hero-5',
    name: 'Header 5',
    description: 'Full background image hero with dark overlay and left-aligned text',
    layout: 'bg-image',
    tags: ['hero', 'background', 'image', 'overlay', 'dark', 'full-width'],
    imageRole: 'background',
    supportsVideo: false,
}

// ============================================
// Exports
// ============================================

export const ALL_HERO_PRESETS = [
    HERO_44_CONFIG,
    HERO_57_CONFIG,
    HERO_1_CONFIG,
    HERO_3_CONFIG,
    HERO_5_CONFIG,
]

export const HERO_PRESETS_MAP: Record<string, HeroPresetConfig> = {
    'hero-44': HERO_44_CONFIG,
    'hero-57': HERO_57_CONFIG,
    'hero-1': HERO_1_CONFIG,
    'hero-3': HERO_3_CONFIG,
    'hero-5': HERO_5_CONFIG,
}

export const HERO_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'hero-44': buildHero44Blocks,
    'hero-57': buildHero57Blocks,
    'hero-1': buildHero1Blocks,
    'hero-3': buildHero3Blocks,
    'hero-5': buildHero5Blocks,
}
