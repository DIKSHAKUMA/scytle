/**
 * CTA Family A — Block Factories & Preset Configs
 *
 * 6 presets: CTA 1, 2, 39, 40, 59, 60
 * Layout: Side-by-side text + inline image (horizontal split)
 *
 * Variants:
 *   Normal (CTA 1/2):  gap-80, items-center, image ratio 3:2
 *   Card   (CTA 39/40): no gap, content padded, image auto-fill
 *   Expand (CTA 59/60): no gap, content self-padded, image min-h-400
 */

import type { Block } from '../../../blocks/types'
import type { CtaPresetConfig } from '../types'
import {
    uid, resetUid,
    makeTextContent, makeButtonGroup, makeFormActions,
} from './shared-builders'

// ============================================
// Block Factories
// ============================================

/** CTA 1 — Normal + Button */
export function buildCta1Blocks(): Block[] {
    resetUid()

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
        children: [makeTextContent(), makeButtonGroup()],
    }

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: { ratio: '3:2', fillMode: 'cover', layoutClassName: 'flex-1 @max-sm:!flex-auto' },
        content: { alt: 'CTA image' },
    }

    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            alignment: { main: 'start', cross: 'center' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [contentColumn, imageBlock],
    }

    return [columnsFrame]
}

/** CTA 2 — Normal + Form */
export function buildCta2Blocks(): Block[] {
    resetUid()

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
        children: [makeTextContent(), makeFormActions()],
    }

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: { ratio: '3:2', fillMode: 'cover', layoutClassName: 'flex-1 @max-sm:!flex-auto' },
        content: { alt: 'CTA image' },
    }

    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            alignment: { main: 'start', cross: 'center' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [contentColumn, imageBlock],
    }

    return [columnsFrame]
}

/** CTA 39 — Card + Button */
export function buildCta39Blocks(): Block[] {
    resetUid()

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
        children: [makeTextContent(), makeButtonGroup()],
    }

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: {
            ratio: 'auto',
            fillMode: 'cover',
            layoutClassName: 'flex-1 self-stretch @max-sm:!self-auto @max-sm:!flex-auto @max-sm:!aspect-[3/2]',
        },
        content: { alt: 'CTA image' },
    }

    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            className: '@max-sm:!flex-col',
        },
        content: {},
        children: [contentColumn, imageBlock],
    }

    return [columnsFrame]
}

/** CTA 40 — Card + Form */
export function buildCta40Blocks(): Block[] {
    resetUid()

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
        children: [makeTextContent(), makeFormActions()],
    }

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: {
            ratio: 'auto',
            fillMode: 'cover',
            layoutClassName: 'flex-1 self-stretch @max-sm:!self-auto @max-sm:!flex-auto @max-sm:!aspect-[3/2]',
        },
        content: { alt: 'CTA image' },
    }

    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            className: '@max-sm:!flex-col',
        },
        content: {},
        children: [contentColumn, imageBlock],
    }

    return [columnsFrame]
}

/** CTA 59 — Expand + Button */
export function buildCta59Blocks(): Block[] {
    resetUid()

    const contentInner: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 560,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeTextContent(), makeButtonGroup()],
    }

    const contentLeft: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            alignment: { main: 'center', cross: 'end' },
            padding: { top: 80, right: 64, bottom: 80, left: 64 },
            layoutClassName: 'flex-1 self-stretch',
            className: '@max-sm:!items-start @max-sm:!px-5 @max-sm:!py-16',
        },
        content: {},
        children: [contentInner],
    }

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: {
            ratio: 'auto',
            fillMode: 'cover',
            layoutClassName: 'flex-1 self-stretch min-h-[400px] @max-sm:!min-h-0 @max-sm:!aspect-square',
        },
        content: { alt: 'CTA image' },
    }

    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            className: '@max-sm:!flex-col',
        },
        content: {},
        children: [contentLeft, imageBlock],
    }

    return [columnsFrame]
}

/** CTA 60 — Expand + Form */
export function buildCta60Blocks(): Block[] {
    resetUid()

    const contentInner: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 560,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeTextContent(), makeFormActions()],
    }

    const contentLeft: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            alignment: { main: 'center', cross: 'end' },
            padding: { top: 80, right: 64, bottom: 80, left: 64 },
            layoutClassName: 'flex-1 self-stretch',
            className: '@max-sm:!items-start @max-sm:!px-5 @max-sm:!py-16',
        },
        content: {},
        children: [contentInner],
    }

    const imageBlock: Block = {
        id: uid(),
        type: 'image',
        props: {
            ratio: 'auto',
            fillMode: 'cover',
            layoutClassName: 'flex-1 self-stretch min-h-[400px] @max-sm:!min-h-0 @max-sm:!aspect-square',
        },
        content: { alt: 'CTA image' },
    }

    const columnsFrame: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            className: '@max-sm:!flex-col',
        },
        content: {},
        children: [contentLeft, imageBlock],
    }

    return [columnsFrame]
}

// ============================================
// Preset Configs (unified format)
// ============================================

export const FAMILY_A_PRESETS: CtaPresetConfig[] = [
    {
        id: 'cta-1',
        name: 'CTA 1',
        description: 'Side-by-side text + image with buttons',
        tags: ['cta', 'normal', 'button', 'split'],
        family: 'a',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'container',
        align: 'none',
        background: 'none',
        axes: { style: 'normal', assetStyle: 'default', element: 'button', assetPlacement: 'right' },
    },
    {
        id: 'cta-2',
        name: 'CTA 2',
        description: 'Side-by-side text + image with email form',
        tags: ['cta', 'normal', 'form', 'split', 'email'],
        family: 'a',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'container',
        align: 'none',
        background: 'none',
        axes: { style: 'normal', assetStyle: 'default', element: 'form', assetPlacement: 'right' },
    },
    {
        id: 'cta-39',
        name: 'CTA 39',
        description: 'Card container with text + image and buttons',
        tags: ['cta', 'card', 'button', 'split'],
        family: 'a',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'card',
        align: 'none',
        background: 'none',
        axes: { style: 'card', assetStyle: 'default', element: 'button', assetPlacement: 'right' },
    },
    {
        id: 'cta-40',
        name: 'CTA 40',
        description: 'Card container with text + image and email form',
        tags: ['cta', 'card', 'form', 'split', 'email'],
        family: 'a',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'card',
        align: 'none',
        background: 'none',
        axes: { style: 'card', assetStyle: 'default', element: 'form', assetPlacement: 'right' },
    },
    {
        id: 'cta-59',
        name: 'CTA 59',
        description: 'Full-width expanded layout with buttons',
        tags: ['cta', 'expand', 'button', 'full-width'],
        family: 'a',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'bare',
        align: 'none',
        background: 'none',
        axes: { style: 'normal', assetStyle: 'expand', element: 'button', assetPlacement: 'right' },
    },
    {
        id: 'cta-60',
        name: 'CTA 60',
        description: 'Full-width expanded layout with email form',
        tags: ['cta', 'expand', 'form', 'full-width', 'email'],
        family: 'a',
        imageRole: 'inline',
        supportsVideo: false,
        shell: 'bare',
        align: 'none',
        background: 'none',
        axes: { style: 'normal', assetStyle: 'expand', element: 'form', assetPlacement: 'right' },
    },
]

export const FAMILY_A_PRESETS_MAP: Record<string, CtaPresetConfig> = Object.fromEntries(
    FAMILY_A_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_A_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'cta-1': buildCta1Blocks,
    'cta-2': buildCta2Blocks,
    'cta-39': buildCta39Blocks,
    'cta-40': buildCta40Blocks,
    'cta-59': buildCta59Blocks,
    'cta-60': buildCta60Blocks,
}
