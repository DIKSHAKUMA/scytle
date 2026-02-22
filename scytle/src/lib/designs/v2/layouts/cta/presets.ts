/**
 * CTA Family A — Preset Configs & Block Factories
 *
 * 6 presets: CTA 1, 2, 39, 40, 59, 60
 *
 * Each buildCta*Blocks() factory returns a **single-element** Block[]
 * containing a root columnsFrame. The frame tree IS the layout —
 * section components only wrap with container / card / expand styling.
 *
 * Pattern follows hero presets exactly:
 *   columnsFrame (horizontal, root)
 *     contentColumn (vertical, flex-1)
 *       textContent (heading + body, gap-24)
 *       actions (button-group or form)
 *     imageBlock | imageWrapper
 *
 * Variants:
 *   Normal (CTA 1/2):   gap-80, items-center, image ratio 3:2
 *   Card   (CTA 39/40): no gap (content has internal padding), image auto-fill
 *   Expand (CTA 59/60): no gap, content self-padded, image min-h-[720px]
 */

import type { Block } from '../../blocks/types'
import { DEFAULT_CONTENT, type CtaPresetConfig } from './types'

// ============================================
// UID generator (reset per factory call)
// ============================================

let _uid = 0
function uid(): string {
    return `cta-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
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
        content: { text: DEFAULT_CONTENT.heading },
    }
}

function makeBody(): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align: 'left' },
        content: { text: DEFAULT_CONTENT.body },
    }
}

/** heading + body grouped with gap-24 */
function makeTextContent(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: { direction: 'vertical', gap: 24 },
        content: {},
        children: [makeHeading(), makeBody()],
    }
}

/** Two-button CTA group */
function makeButtonGroup(): Block {
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
        content: { placeholder: DEFAULT_CONTENT.inputPlaceholder },
    }

    const submitBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT.submitButton },
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
        content: { text: DEFAULT_CONTENT.termsText },
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
// CTA 1 — Normal + Button
// ============================================
// Figma: CTA 1 — Side-by-side text + image, two CTA buttons
// Desktop: py-28 px-16, max-w-1280, 2 columns gap-80, items-center
//          Left (flex-1): textContent(h2+body gap-24) + buttons (gap-32)
//          Right (flex-1): image 3:2
// Mobile:  flex-col, gap-12, py-16 px-5

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

// ============================================
// CTA 2 — Normal + Form
// ============================================
// Same layout as CTA 1 but with email form instead of buttons

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

// ============================================
// CTA 39 — Card + Button
// ============================================
// Figma: CTA 39 — Card wrapper with bg-secondary + border
// Desktop: Same max-w container; inner card: flex-row, no gap
//          Left (flex-1): p-12, textContent + buttons (gap-32)
//          Right (flex-1): image auto fills card height, self-stretch
// Mobile:  flex-col, p-8

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

// ============================================
// CTA 40 — Card + Form
// ============================================
// Same card layout as CTA 39 but with email form

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

// ============================================
// CTA 59 — Expand + Button
// ============================================
// Figma: CTA 59 — Full-width, no container padding
// Desktop: flex-row, no gap
//          Left (flex-1): self-padded (112 80 112 64), items-end justify-center,
//                         inner max-w-[560px]: h2+body+buttons
//          Right (flex-1): image auto stretch, min-h-[720px]
// Mobile:  flex-col, padding 64px 20px, image aspect-square

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

// ============================================
// CTA 60 — Expand + Form
// ============================================
// Same expand layout as CTA 59 but with email form

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
// Preset Configurations
// ============================================

export const CTA_1_CONFIG: CtaPresetConfig = {
    id: 'cta-1',
    name: 'CTA 1',
    description: 'Side-by-side text + image with buttons',
    layout: 'normal-button',
    tags: ['cta', 'normal', 'button', 'split'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'button',
    style: 'normal',
}

export const CTA_2_CONFIG: CtaPresetConfig = {
    id: 'cta-2',
    name: 'CTA 2',
    description: 'Side-by-side text + image with email form',
    layout: 'normal-form',
    tags: ['cta', 'normal', 'form', 'split', 'email'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'form',
    style: 'normal',
}

export const CTA_39_CONFIG: CtaPresetConfig = {
    id: 'cta-39',
    name: 'CTA 39',
    description: 'Card container with text + image and buttons',
    layout: 'card-button',
    tags: ['cta', 'card', 'button', 'split'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'button',
    style: 'card',
}

export const CTA_40_CONFIG: CtaPresetConfig = {
    id: 'cta-40',
    name: 'CTA 40',
    description: 'Card container with text + image and email form',
    layout: 'card-form',
    tags: ['cta', 'card', 'form', 'split', 'email'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'form',
    style: 'card',
}

export const CTA_59_CONFIG: CtaPresetConfig = {
    id: 'cta-59',
    name: 'CTA 59',
    description: 'Full-width expanded layout with buttons',
    layout: 'expand-button',
    tags: ['cta', 'expand', 'button', 'full-width'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'button',
    style: 'expand',
}

export const CTA_60_CONFIG: CtaPresetConfig = {
    id: 'cta-60',
    name: 'CTA 60',
    description: 'Full-width expanded layout with email form',
    layout: 'expand-form',
    tags: ['cta', 'expand', 'form', 'full-width', 'email'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'form',
    style: 'expand',
}

// ============================================
// Aggregated exports
// ============================================

export const ALL_CTA_PRESETS: CtaPresetConfig[] = [
    CTA_1_CONFIG,
    CTA_2_CONFIG,
    CTA_39_CONFIG,
    CTA_40_CONFIG,
    CTA_59_CONFIG,
    CTA_60_CONFIG,
]

export const CTA_PRESETS_MAP: Record<string, CtaPresetConfig> = Object.fromEntries(
    ALL_CTA_PRESETS.map(c => [c.id, c]),
)

export const CTA_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'cta-1': buildCta1Blocks,
    'cta-2': buildCta2Blocks,
    'cta-39': buildCta39Blocks,
    'cta-40': buildCta40Blocks,
    'cta-59': buildCta59Blocks,
    'cta-60': buildCta60Blocks,
}
