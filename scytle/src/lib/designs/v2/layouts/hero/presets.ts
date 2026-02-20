/**
 * Hero Layout — Presets
 *
 * Two hero presets derived from Figma:
 *   hero-44 — Header 44: Left-aligned single column
 *   hero-57 — Header 57: Split two-column
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
// Preset Configs
// ============================================

export const HERO_44_CONFIG: HeroPresetConfig = {
    id: 'hero-44',
    name: 'Header 44',
    description: 'Left-aligned hero with tagline, heading, body, and two buttons',
    alignment: 'left',
    tags: ['hero', 'left-aligned', 'single-column', 'buttons'],
}

export const HERO_57_CONFIG: HeroPresetConfig = {
    id: 'hero-57',
    name: 'Header 57',
    description: 'Split two-column hero — left: tagline + heading, right: body + buttons',
    alignment: 'split',
    tags: ['hero', 'split', 'two-column', 'buttons'],
}

// ============================================
// Exports
// ============================================

export const ALL_HERO_PRESETS = [HERO_44_CONFIG, HERO_57_CONFIG]

export const HERO_PRESETS_MAP: Record<string, HeroPresetConfig> = {
    'hero-44': HERO_44_CONFIG,
    'hero-57': HERO_57_CONFIG,
}

export const HERO_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'hero-44': buildHero44Blocks,
    'hero-57': buildHero57Blocks,
}
