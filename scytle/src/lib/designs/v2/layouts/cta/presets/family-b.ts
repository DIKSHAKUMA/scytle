/**
 * CTA Family B — Block Factories & Preset Configs
 *
 * 10 presets: CTA 13, 14, 15, 16, 17, 18, 21, 22, 61, 62
 * Layout: Two text columns (heading left, body+actions right),
 *         optional full-width image below.
 *
 * Variants:
 *   Text-Only (CTA 13–18): columnsFrame only, section bg varies
 *   Stacked   (CTA 21–22): rootFrame → columnsFrame + image (inside container)
 *   Expand    (CTA 61–62): columnsFrame + image (image full-bleed)
 */

import type { Block } from '../../../blocks/types'
import type { CtaPresetConfig } from '../types'
import {
    uid, resetUid,
    makeHeading, makeBody, makeButtonGroup, makeFormActions,
} from './shared-builders'

// ============================================
// Family-specific: Two-column split layout
// ============================================

/** Heading in left column, body + actions in right column */
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
// Block Factories
// ============================================

/** CTA 13 — Text-Only, No BG, Button */
export function buildCta13Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeButtonGroup())]
}

/** CTA 14 — Text-Only, No BG, Form */
export function buildCta14Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeFormActions('left', 513))]
}

/** CTA 15 — Text-Only, BG Image, Button */
export function buildCta15Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeButtonGroup())]
}

/** CTA 16 — Text-Only, BG Image, Form */
export function buildCta16Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeFormActions('left', 513))]
}

/** CTA 17 — Text-Only, BG Video, Button */
export function buildCta17Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeButtonGroup())]
}

/** CTA 18 — Text-Only, BG Video, Form */
export function buildCta18Blocks(): Block[] {
    resetUid()
    return [makeColumnsFrame(makeFormActions('left', 513))]
}

/** CTA 21 — Stacked, Default, Button */
export function buildCta21Blocks(): Block[] {
    resetUid()

    const columnsFrame = makeColumnsFrame(makeButtonGroup())
    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: { ratio: '16:9', fillMode: 'cover', layoutClassName: 'w-full' },
        content: { alt: 'CTA image' },
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [columnsFrame, imageBlock],
    }]
}

/** CTA 22 — Stacked, Default, Form */
export function buildCta22Blocks(): Block[] {
    resetUid()

    const columnsFrame = makeColumnsFrame(makeFormActions('left', 513))
    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: { ratio: '16:9', fillMode: 'cover', layoutClassName: 'w-full' },
        content: { alt: 'CTA image' },
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [columnsFrame, imageBlock],
    }]
}

/** CTA 61 — Expand, Button */
export function buildCta61Blocks(): Block[] {
    resetUid()

    const columnsFrame = makeColumnsFrame(makeButtonGroup())
    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: { ratio: '16:9', fillMode: 'cover', layoutClassName: 'w-full' },
        content: { alt: 'CTA image' },
    }

    return [columnsFrame, imageBlock]
}

/** CTA 62 — Expand, Form */
export function buildCta62Blocks(): Block[] {
    resetUid()

    const columnsFrame = makeColumnsFrame(makeFormActions('left', 513))
    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: { ratio: '16:9', fillMode: 'cover', layoutClassName: 'w-full' },
        content: { alt: 'CTA image' },
    }

    return [columnsFrame, imageBlock]
}

// ============================================
// Preset Configs (unified format)
// ============================================

export const FAMILY_B_PRESETS: CtaPresetConfig[] = [
    {
        id: 'cta-13',
        name: 'CTA 13',
        description: 'Two-column text with buttons, no background',
        tags: ['cta', 'text-only', 'button', 'split'],
        family: 'b',
        imageRole: 'none',
        supportsVideo: false,
        shell: 'container',
        align: 'none',
        background: 'none',
        axes: { asset: 'none', background: 'none', element: 'button' },
    },
    {
        id: 'cta-14',
        name: 'CTA 14',
        description: 'Two-column text with email form, no background',
        tags: ['cta', 'text-only', 'form', 'split', 'email'],
        family: 'b',
        imageRole: 'none',
        supportsVideo: false,
        shell: 'container',
        align: 'none',
        background: 'none',
        axes: { asset: 'none', background: 'none', element: 'form' },
    },
    {
        id: 'cta-15',
        name: 'CTA 15',
        description: 'Two-column text with buttons, background image',
        tags: ['cta', 'text-only', 'button', 'background', 'image'],
        family: 'b',
        imageRole: 'background',
        supportsVideo: false,
        shell: 'bg-container',
        align: 'none',
        background: 'image',
        axes: { asset: 'none', background: 'image', element: 'button' },
    },
    {
        id: 'cta-16',
        name: 'CTA 16',
        description: 'Two-column text with email form, background image',
        tags: ['cta', 'text-only', 'form', 'background', 'image', 'email'],
        family: 'b',
        imageRole: 'background',
        supportsVideo: false,
        shell: 'bg-container',
        align: 'none',
        background: 'image',
        axes: { asset: 'none', background: 'image', element: 'form' },
    },
    {
        id: 'cta-17',
        name: 'CTA 17',
        description: 'Two-column text with buttons, background video',
        tags: ['cta', 'text-only', 'button', 'background', 'video'],
        family: 'b',
        imageRole: 'none',
        supportsVideo: true,
        shell: 'bg-container',
        align: 'none',
        background: 'video',
        axes: { asset: 'none', background: 'video', element: 'button' },
    },
    {
        id: 'cta-18',
        name: 'CTA 18',
        description: 'Two-column text with email form, background video',
        tags: ['cta', 'text-only', 'form', 'background', 'video', 'email'],
        family: 'b',
        imageRole: 'none',
        supportsVideo: true,
        shell: 'bg-container',
        align: 'none',
        background: 'video',
        axes: { asset: 'none', background: 'video', element: 'form' },
    },
    {
        id: 'cta-21',
        name: 'CTA 21',
        description: 'Two-column text + full-width image below',
        tags: ['cta', 'stacked', 'button', 'image-below'],
        family: 'b',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'container',
        align: 'none',
        background: 'none',
        axes: { asset: 'image', assetStyle: 'default', element: 'button' },
    },
    {
        id: 'cta-22',
        name: 'CTA 22',
        description: 'Two-column text + full-width image below with email form',
        tags: ['cta', 'stacked', 'form', 'image-below', 'email'],
        family: 'b',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'container',
        align: 'none',
        background: 'none',
        axes: { asset: 'image', assetStyle: 'default', element: 'form' },
    },
    {
        id: 'cta-61',
        name: 'CTA 61',
        description: 'Padded text section + full-bleed image with buttons',
        tags: ['cta', 'expand', 'button', 'full-bleed', 'image-below'],
        family: 'b',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'expand',
        align: 'center',
        background: 'none',
        axes: { asset: 'image', assetStyle: 'expand', element: 'button' },
    },
    {
        id: 'cta-62',
        name: 'CTA 62',
        description: 'Padded text section + full-bleed image with email form',
        tags: ['cta', 'expand', 'form', 'full-bleed', 'image-below', 'email'],
        family: 'b',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'expand',
        align: 'center',
        background: 'none',
        axes: { asset: 'image', assetStyle: 'expand', element: 'form' },
    },
]

export const FAMILY_B_PRESETS_MAP: Record<string, CtaPresetConfig> = Object.fromEntries(
    FAMILY_B_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_B_BLOCK_FACTORIES: Record<string, () => Block[]> = {
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
