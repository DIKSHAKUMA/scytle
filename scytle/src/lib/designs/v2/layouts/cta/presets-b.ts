/**
 * CTA Family B — Preset Configs & Block Factories
 *
 * 10 presets: CTA 13, 14, 15, 16, 17, 18, 21, 22, 61, 62
 *
 * Layout structure differs from Family A:
 *   Family A = side-by-side text + inline image (horizontal split)
 *   Family B = two text columns (heading left, body+actions right),
 *              optional full-width image BELOW (vertical stack)
 *
 * Text-Only (CTA 13–18): columnsFrame only, no image block
 *   Section background (none/image/video) is a section-level concern
 *
 * Stacked (CTA 21–22): rootFrame(vertical) → columnsFrame + imageBlock
 *   Image inside container (max-w-1280), aspect ~16:9
 *
 * Expand (CTA 61–62): [columnsFrame, imageBlock] — two root blocks
 *   Section component renders content in padded container,
 *   image full-bleed outside container
 *
 * Pattern follows cta/presets.ts exactly:
 *   resetUid() + uid() for stable block IDs
 *   Shared helpers for heading, body, buttons, form
 */

import type { Block } from '../../blocks/types'
import { DEFAULT_CONTENT_B, type CtaBPresetConfig } from './types-b'

// ============================================
// UID generator (reset per factory call)
// ============================================

let _uid = 0
function uid(): string {
    return `cta-b-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
}
function resetUid() { _uid = 0 }

// ============================================
// Shared block builders
// ============================================

function makeHeading(): Block {
    return {
        id: uid(),
        type: 'heading',
        props: { level: 2, align: 'left' },
        content: { text: DEFAULT_CONTENT_B.heading },
    }
}

function makeBody(): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align: 'left' },
        content: { text: DEFAULT_CONTENT_B.body },
    }
}

/** Two-button CTA group */
function makeButtonGroup(): Block {
    const primaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT_B.primaryButton },
    }
    const secondaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'secondary', size: 'lg' },
        content: { text: DEFAULT_CONTENT_B.secondaryButton },
    }
    return {
        id: uid(),
        type: 'button-group',
        props: { align: 'left', gap: 16 },
        content: {},
        children: [primaryBtn, secondaryBtn],
    }
}

/** Email input + submit button row + terms text */
function makeFormActions(): Block {
    const inputBlock: Block = {
        id: uid(),
        type: 'input',
        props: {
            fieldType: 'email',
            layoutClassName: 'flex-1 @max-sm:!flex-auto',
        },
        content: { placeholder: DEFAULT_CONTENT_B.inputPlaceholder },
    }

    const submitBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT_B.submitButton },
    }

    const formRow: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 16,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col',
        },
        content: {},
        children: [inputBlock, submitBtn],
    }

    const termsText: Block = {
        id: uid(),
        type: 'text',
        props: { variant: 'body-small', align: 'left' },
        content: { text: DEFAULT_CONTENT_B.termsText },
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            maxWidth: 513,
            sizing: { width: 'fill' },
        },
        content: {},
        children: [formRow, termsText],
    }
}

// ============================================
// Shared two-column layout builder
// ============================================
// Heading in left column, body + actions in right column
// Both columns are flex-1, gap-80 desktop, stacked on mobile

function makeColumnsFrame(actions: Block): Block {
    const headingColumn: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            layoutClassName: 'flex-1',
        },
        content: {},
        children: [makeHeading()],
    }

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
        children: [makeBody(), actions],
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            alignment: { main: 'start', cross: 'start' },
            className: '@max-sm:!flex-col @max-sm:!gap-5',
        },
        content: {},
        children: [headingColumn, contentColumn],
    }
}

// ============================================
// CTA 13 — Text-Only, No BG, Button
// ============================================
// Figma: CTA 13 — Two-column split. Left: H2. Right: body + 2 buttons.
// Desktop: py-28 px-16, max-w-1280, 2 columns gap-80
// No image at all.

export function buildCta13Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeButtonGroup())]
}

// ============================================
// CTA 14 — Text-Only, No BG, Form
// ============================================
// Same layout as CTA 13 but with email form + terms

export function buildCta14Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeFormActions())]
}

// ============================================
// CTA 15 — Text-Only, BG Image, Button
// ============================================
// Same block tree as CTA 13.
// Background image + overlay is a section-level concern (imageRole: 'background')

export function buildCta15Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeButtonGroup())]
}

// ============================================
// CTA 16 — Text-Only, BG Image, Form
// ============================================
// Same block tree as CTA 14.
// Background image + overlay is section-level.

export function buildCta16Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeFormActions())]
}

// ============================================
// CTA 17 — Text-Only, BG Video, Button
// ============================================
// Same block tree as CTA 13.
// Background video is section-level (supportsVideo: true)

export function buildCta17Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeButtonGroup())]
}

// ============================================
// CTA 18 — Text-Only, BG Video, Form
// ============================================
// Same block tree as CTA 14.
// Background video is section-level.

export function buildCta18Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeFormActions())]
}

// ============================================
// CTA 21 — Stacked, Default, Button
// ============================================
// Figma: CTA 21 — Two-column text top + full-width image below
// Desktop: py-28 px-16, max-w-1280
//          Vertical stack: gap-80 between content & image
//          Content: 2 columns gap-80
//          Image: aspect ~16:9 (1280/738), cover, full-width inside container
// Mobile:  gap-12, columns → stacked

export function buildCta21Blocks(): Block[] {
    resetUid()

    const columnsFrame = makeColumnsFrame(makeButtonGroup())

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: {
            ratio: '16:9',
            fillMode: 'cover',
            layoutClassName: 'w-full',
        },
        content: { alt: 'CTA image' },
    }

    const rootFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [columnsFrame, imageBlock],
    }

    return [rootFrame]
}

// ============================================
// CTA 22 — Stacked, Default, Form
// ============================================
// Same stacked layout as CTA 21 but with email form

export function buildCta22Blocks(): Block[] {
    resetUid()

    const columnsFrame = makeColumnsFrame(makeFormActions())

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: {
            ratio: '16:9',
            fillMode: 'cover',
            layoutClassName: 'w-full',
        },
        content: { alt: 'CTA image' },
    }

    const rootFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [columnsFrame, imageBlock],
    }

    return [rootFrame]
}

// ============================================
// CTA 61 — Expand, Button
// ============================================
// Figma: CTA 61 — Padded content section + full-bleed image
// Desktop: Content in py-28 px-16 container (max-w-1280)
//          Image: full-width edge-to-edge, aspect ~16:9 (1440/810)
// The section component splits: content blocks in padded container,
// last block (image) rendered full-bleed outside container.
// Returns TWO root blocks: [columnsFrame, imageBlock]

export function buildCta61Blocks(): Block[] {
    resetUid()

    const columnsFrame = makeColumnsFrame(makeButtonGroup())

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: {
            ratio: '16:9',
            fillMode: 'cover',
            layoutClassName: 'w-full',
        },
        content: { alt: 'CTA image' },
    }

    return [columnsFrame, imageBlock]
}

// ============================================
// CTA 62 — Expand, Form
// ============================================
// Same expand layout as CTA 61 but with email form.
// Returns TWO root blocks: [columnsFrame, imageBlock]

export function buildCta62Blocks(): Block[] {
    resetUid()

    const columnsFrame = makeColumnsFrame(makeFormActions())

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: {
            ratio: '16:9',
            fillMode: 'cover',
            layoutClassName: 'w-full',
        },
        content: { alt: 'CTA image' },
    }

    return [columnsFrame, imageBlock]
}

// ============================================
// Preset Configurations
// ============================================

export const CTA_13_CONFIG: CtaBPresetConfig = {
    id: 'cta-13',
    name: 'CTA 13',
    description: 'Two-column text with buttons, no background',
    layout: 'text-none-button',
    tags: ['cta', 'text-only', 'button', 'split'],
    imageRole: 'none',
    supportsVideo: false,
    element: 'button',
    sectionStyle: 'text-only',
    background: 'none',
}

export const CTA_14_CONFIG: CtaBPresetConfig = {
    id: 'cta-14',
    name: 'CTA 14',
    description: 'Two-column text with email form, no background',
    layout: 'text-none-form',
    tags: ['cta', 'text-only', 'form', 'split', 'email'],
    imageRole: 'none',
    supportsVideo: false,
    element: 'form',
    sectionStyle: 'text-only',
    background: 'none',
}

export const CTA_15_CONFIG: CtaBPresetConfig = {
    id: 'cta-15',
    name: 'CTA 15',
    description: 'Two-column text with buttons, background image',
    layout: 'text-bgimage-button',
    tags: ['cta', 'text-only', 'button', 'background', 'image'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'button',
    sectionStyle: 'text-only',
    background: 'image',
}

export const CTA_16_CONFIG: CtaBPresetConfig = {
    id: 'cta-16',
    name: 'CTA 16',
    description: 'Two-column text with email form, background image',
    layout: 'text-bgimage-form',
    tags: ['cta', 'text-only', 'form', 'background', 'image', 'email'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'form',
    sectionStyle: 'text-only',
    background: 'image',
}

export const CTA_17_CONFIG: CtaBPresetConfig = {
    id: 'cta-17',
    name: 'CTA 17',
    description: 'Two-column text with buttons, background video',
    layout: 'text-bgvideo-button',
    tags: ['cta', 'text-only', 'button', 'background', 'video'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'button',
    sectionStyle: 'text-only',
    background: 'video',
}

export const CTA_18_CONFIG: CtaBPresetConfig = {
    id: 'cta-18',
    name: 'CTA 18',
    description: 'Two-column text with email form, background video',
    layout: 'text-bgvideo-form',
    tags: ['cta', 'text-only', 'form', 'background', 'video', 'email'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'form',
    sectionStyle: 'text-only',
    background: 'video',
}

export const CTA_21_CONFIG: CtaBPresetConfig = {
    id: 'cta-21',
    name: 'CTA 21',
    description: 'Two-column text + full-width image below',
    layout: 'stacked-default-button',
    tags: ['cta', 'stacked', 'button', 'image-below'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'button',
    sectionStyle: 'stacked',
    background: 'none',
}

export const CTA_22_CONFIG: CtaBPresetConfig = {
    id: 'cta-22',
    name: 'CTA 22',
    description: 'Two-column text + full-width image below with email form',
    layout: 'stacked-default-form',
    tags: ['cta', 'stacked', 'form', 'image-below', 'email'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'form',
    sectionStyle: 'stacked',
    background: 'none',
}

export const CTA_61_CONFIG: CtaBPresetConfig = {
    id: 'cta-61',
    name: 'CTA 61',
    description: 'Padded text section + full-bleed image with buttons',
    layout: 'stacked-expand-button',
    tags: ['cta', 'expand', 'button', 'full-bleed', 'image-below'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'button',
    sectionStyle: 'expand',
    background: 'none',
}

export const CTA_62_CONFIG: CtaBPresetConfig = {
    id: 'cta-62',
    name: 'CTA 62',
    description: 'Padded text section + full-bleed image with email form',
    layout: 'stacked-expand-form',
    tags: ['cta', 'expand', 'form', 'full-bleed', 'image-below', 'email'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'form',
    sectionStyle: 'expand',
    background: 'none',
}

// ============================================
// Aggregated exports
// ============================================

export const ALL_CTA_B_PRESETS: CtaBPresetConfig[] = [
    CTA_13_CONFIG,
    CTA_14_CONFIG,
    CTA_15_CONFIG,
    CTA_16_CONFIG,
    CTA_17_CONFIG,
    CTA_18_CONFIG,
    CTA_21_CONFIG,
    CTA_22_CONFIG,
    CTA_61_CONFIG,
    CTA_62_CONFIG,
]

export const CTA_B_PRESETS_MAP: Record<string, CtaBPresetConfig> = Object.fromEntries(
    ALL_CTA_B_PRESETS.map(c => [c.id, c]),
)

export const CTA_B_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'cta-13': buildCta13Blocks,
    'cta-14': buildCta14Blocks,
    'cta-15': buildCta15Blocks,
    'cta-16': buildCta16Blocks,
    'cta-17': buildCta17Blocks,
    'cta-18': buildCta18Blocks,
    'cta-21': buildCta21Blocks,
    'cta-22': buildCta22Blocks,
    'cta-61': buildCta61Blocks,
    'cta-62': buildCta62Blocks,
}
