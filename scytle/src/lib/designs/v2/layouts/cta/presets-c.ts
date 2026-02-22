/**
 * CTA Family C — Preset Configs & Block Factories
 *
 * 25 presets: CTA 3–6, 19–20, 25–32, 41–44, 51–56, 65
 *
 * Layout structure differs from Family A/B:
 *   Family A = side-by-side text + inline image (horizontal split)
 *   Family B = two text columns (heading left, body+actions right)
 *   Family C = single-column text (heading, body, actions stacked vertically)
 *              with optional background, card wrapper, or image below
 *
 * Content alignment:
 *   Text=Left:   heading/body/buttons left-aligned, max-w-768
 *   Text=Center: heading/body/buttons center-aligned, max-w-768
 *
 * Structural groups:
 *   Left Normal    (CTA 19, 20, 3, 4, 5, 6):   Section bg varies, single-column left
 *   Left Card      (CTA 41, 42, 43, 44):        Card with bg, single-column left
 *   Center Normal  (CTA 25, 26, 27, 28, 29, 30): Section bg varies, single-column center
 *   Center Card    (CTA 51, 52, 53, 54, 55, 56): Card with optional bg, center
 *   Center Stacked (CTA 31, 32):                  Center text + image below (in container)
 *   Center Expand  (CTA 65):                      Center text + full-bleed image
 */

import type { Block } from '../../blocks/types'
import { DEFAULT_CONTENT_C, type CtaCPresetConfig } from './types-c'

// ============================================
// UID generator (reset per factory call)
// ============================================

let _uid = 0
function uid(): string {
    return `cta-c-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
}
function resetUid() { _uid = 0 }

// ============================================
// Shared block builders
// ============================================

function makeHeading(align: 'left' | 'center'): Block {
    return {
        id: uid(),
        type: 'heading',
        props: { level: 2, align },
        content: { text: DEFAULT_CONTENT_C.heading },
    }
}

function makeBody(align: 'left' | 'center'): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align },
        content: { text: DEFAULT_CONTENT_C.body },
    }
}

/** Two-button CTA group */
function makeButtonGroup(align: 'left' | 'center'): Block {
    const primaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT_C.primaryButton },
    }
    const secondaryBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'secondary', size: 'lg' },
        content: { text: DEFAULT_CONTENT_C.secondaryButton },
    }
    return {
        id: uid(),
        type: 'button-group',
        props: { align, gap: 16 },
        content: {},
        children: [primaryBtn, secondaryBtn],
    }
}

/** Email input + submit button row + terms text */
function makeFormActions(align: 'left' | 'center'): Block {
    const inputBlock: Block = {
        id: uid(),
        type: 'input',
        props: {
            fieldType: 'email',
            layoutClassName: 'flex-1 @max-sm:!flex-auto',
        },
        content: { placeholder: DEFAULT_CONTENT_C.inputPlaceholder },
    }

    const submitBtn: Block = {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'lg' },
        content: { text: DEFAULT_CONTENT_C.submitButton },
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
        props: { variant: 'body-small', align },
        content: { text: DEFAULT_CONTENT_C.termsText },
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            sizing: { width: 'fill' },
        },
        content: {},
        children: [formRow, termsText],
    }
}

/** Full-width image placeholder */
function makeImage(): Block {
    return {
        id: uid(),
        type: 'image',
        props: {
            aspectRatio: '16/9',
            sizing: { width: 'fill' },
            layoutClassName: 'w-full',
        },
        content: { alt: 'Placeholder image' },
    }
}

// ============================================
// Content frame builder
// ============================================
// Single-column layout: heading + body + actions, all stacked vertically
// Max-width 768px, alignment varies (left or center)

function makeContentFrame(align: 'left' | 'center', actions: Block): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 768,
            sizing: { width: 'fill' },
            alignment: { main: 'start', cross: align === 'center' ? 'center' : 'start' },
            className: align === 'center' ? 'text-center' : '',
        },
        content: {},
        children: [makeHeading(align), makeBody(align), actions],
    }
}

// ============================================
// Block factories — Text=Left, Normal
// ============================================

/** CTA 19 — Left, Normal, No BG, Button */
export function buildCta19Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeButtonGroup('left'))]
}

/** CTA 20 — Left, Normal, No BG, Form */
export function buildCta20Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeFormActions('left'))]
}

/** CTA 3 — Left, Normal, BG Image, Button */
export function buildCta3Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeButtonGroup('left'))]
}

/** CTA 4 — Left, Normal, BG Image, Form */
export function buildCta4Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeFormActions('left'))]
}

/** CTA 5 — Left, Normal, BG Video, Button */
export function buildCta5Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeButtonGroup('left'))]
}

/** CTA 6 — Left, Normal, BG Video, Form */
export function buildCta6Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeFormActions('left'))]
}

// ============================================
// Block factories — Text=Left, Card
// ============================================

/** CTA 41 — Left, Card, BG Image, Button */
export function buildCta41Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeButtonGroup('left'))]
}

/** CTA 42 — Left, Card, BG Image, Form */
export function buildCta42Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeFormActions('left'))]
}

/** CTA 43 — Left, Card, BG Video, Button */
export function buildCta43Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeButtonGroup('left'))]
}

/** CTA 44 — Left, Card, BG Video, Form */
export function buildCta44Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('left', makeFormActions('left'))]
}

// ============================================
// Block factories — Text=Center, Normal
// ============================================

/** CTA 25 — Center, Normal, No BG, Button */
export function buildCta25Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeButtonGroup('center'))]
}

/** CTA 26 — Center, Normal, No BG, Form */
export function buildCta26Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeFormActions('center'))]
}

/** CTA 27 — Center, Normal, BG Image, Button */
export function buildCta27Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeButtonGroup('center'))]
}

/** CTA 28 — Center, Normal, BG Image, Form */
export function buildCta28Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeFormActions('center'))]
}

/** CTA 29 — Center, Normal, BG Video, Button */
export function buildCta29Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeButtonGroup('center'))]
}

/** CTA 30 — Center, Normal, BG Video, Form */
export function buildCta30Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeFormActions('center'))]
}

// ============================================
// Block factories — Text=Center, Card
// ============================================

/** CTA 51 — Center, Card, No BG, Button */
export function buildCta51Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeButtonGroup('center'))]
}

/** CTA 52 — Center, Card, No BG, Form */
export function buildCta52Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeFormActions('center'))]
}

/** CTA 53 — Center, Card, BG Image, Button */
export function buildCta53Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeButtonGroup('center'))]
}

/** CTA 54 — Center, Card, BG Image, Form */
export function buildCta54Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeFormActions('center'))]
}

/** CTA 55 — Center, Card, BG Video, Button */
export function buildCta55Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeButtonGroup('center'))]
}

/** CTA 56 — Center, Card, BG Video, Form */
export function buildCta56Blocks(): Block[] {
    resetUid()
    return [makeContentFrame('center', makeFormActions('center'))]
}

// ============================================
// Block factories — Text=Center, Asset=Image
// ============================================

/** CTA 31 — Center, Asset=Image, Default, Button */
export function buildCta31Blocks(): Block[] {
    resetUid()
    const contentFrame = makeContentFrame('center', makeButtonGroup('center'))
    const image = makeImage()
    // Root frame: content + image stacked vertically with gap-80
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            alignment: { main: 'start', cross: 'center' },
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [contentFrame, image],
    }]
}

/** CTA 32 — Center, Asset=Image, Default, Form */
export function buildCta32Blocks(): Block[] {
    resetUid()
    const contentFrame = makeContentFrame('center', makeFormActions('center'))
    const image = makeImage()
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            alignment: { main: 'start', cross: 'center' },
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [contentFrame, image],
    }]
}

/** CTA 65 — Center, Expand, Button */
export function buildCta65Blocks(): Block[] {
    resetUid()
    const contentFrame = makeContentFrame('center', makeButtonGroup('center'))
    const image = makeImage()
    // Two root blocks: content in padded container, image full-bleed
    return [contentFrame, image]
}

// ============================================
// Block factory map
// ============================================

export const CTA_C_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'cta-19': buildCta19Blocks,
    'cta-20': buildCta20Blocks,
    'cta-3': buildCta3Blocks,
    'cta-4': buildCta4Blocks,
    'cta-5': buildCta5Blocks,
    'cta-6': buildCta6Blocks,
    'cta-41': buildCta41Blocks,
    'cta-42': buildCta42Blocks,
    'cta-43': buildCta43Blocks,
    'cta-44': buildCta44Blocks,
    'cta-25': buildCta25Blocks,
    'cta-26': buildCta26Blocks,
    'cta-27': buildCta27Blocks,
    'cta-28': buildCta28Blocks,
    'cta-29': buildCta29Blocks,
    'cta-30': buildCta30Blocks,
    'cta-51': buildCta51Blocks,
    'cta-52': buildCta52Blocks,
    'cta-53': buildCta53Blocks,
    'cta-54': buildCta54Blocks,
    'cta-55': buildCta55Blocks,
    'cta-56': buildCta56Blocks,
    'cta-31': buildCta31Blocks,
    'cta-32': buildCta32Blocks,
    'cta-65': buildCta65Blocks,
}

// ============================================
// Preset Configs
// ============================================

// --- Text=Left, Normal ---

export const CTA_19_CONFIG: CtaCPresetConfig = {
    id: 'cta-19',
    name: 'CTA 19',
    description: 'Left-aligned text with buttons, no background',
    layout: 'left-normal-none-button',
    tags: ['cta', 'left', 'text-only', 'button'],
    imageRole: 'none',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'left',
    style: 'normal',
    background: 'none',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-normal',
}

export const CTA_20_CONFIG: CtaCPresetConfig = {
    id: 'cta-20',
    name: 'CTA 20',
    description: 'Left-aligned text with form, no background',
    layout: 'left-normal-none-form',
    tags: ['cta', 'left', 'text-only', 'form', 'email'],
    imageRole: 'none',
    supportsVideo: false,
    element: 'form',
    textAlignment: 'left',
    style: 'normal',
    background: 'none',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-normal',
}

export const CTA_3_CONFIG: CtaCPresetConfig = {
    id: 'cta-3',
    name: 'CTA 3',
    description: 'Left-aligned text with buttons, background image',
    layout: 'left-normal-image-button',
    tags: ['cta', 'left', 'background', 'image', 'button'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'left',
    style: 'normal',
    background: 'image',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-normal',
}

export const CTA_4_CONFIG: CtaCPresetConfig = {
    id: 'cta-4',
    name: 'CTA 4',
    description: 'Left-aligned text with form, background image',
    layout: 'left-normal-image-form',
    tags: ['cta', 'left', 'background', 'image', 'form', 'email'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'form',
    textAlignment: 'left',
    style: 'normal',
    background: 'image',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-normal',
}

export const CTA_5_CONFIG: CtaCPresetConfig = {
    id: 'cta-5',
    name: 'CTA 5',
    description: 'Left-aligned text with buttons, background video',
    layout: 'left-normal-video-button',
    tags: ['cta', 'left', 'background', 'video', 'button'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'button',
    textAlignment: 'left',
    style: 'normal',
    background: 'video',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-normal',
}

export const CTA_6_CONFIG: CtaCPresetConfig = {
    id: 'cta-6',
    name: 'CTA 6',
    description: 'Left-aligned text with form, background video',
    layout: 'left-normal-video-form',
    tags: ['cta', 'left', 'background', 'video', 'form', 'email'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'form',
    textAlignment: 'left',
    style: 'normal',
    background: 'video',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-normal',
}

// --- Text=Left, Card ---

export const CTA_41_CONFIG: CtaCPresetConfig = {
    id: 'cta-41',
    name: 'CTA 41',
    description: 'Left-aligned text with buttons, card with background image',
    layout: 'left-card-image-button',
    tags: ['cta', 'left', 'card', 'background', 'image', 'button'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'left',
    style: 'card',
    background: 'image',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-card',
}

export const CTA_42_CONFIG: CtaCPresetConfig = {
    id: 'cta-42',
    name: 'CTA 42',
    description: 'Left-aligned text with form, card with background image',
    layout: 'left-card-image-form',
    tags: ['cta', 'left', 'card', 'background', 'image', 'form', 'email'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'form',
    textAlignment: 'left',
    style: 'card',
    background: 'image',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-card',
}

export const CTA_43_CONFIG: CtaCPresetConfig = {
    id: 'cta-43',
    name: 'CTA 43',
    description: 'Left-aligned text with buttons, card with background video',
    layout: 'left-card-video-button',
    tags: ['cta', 'left', 'card', 'background', 'video', 'button'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'button',
    textAlignment: 'left',
    style: 'card',
    background: 'video',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-card',
}

export const CTA_44_CONFIG: CtaCPresetConfig = {
    id: 'cta-44',
    name: 'CTA 44',
    description: 'Left-aligned text with form, card with background video',
    layout: 'left-card-video-form',
    tags: ['cta', 'left', 'card', 'background', 'video', 'form', 'email'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'form',
    textAlignment: 'left',
    style: 'card',
    background: 'video',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'left-card',
}

// --- Text=Center, Normal ---

export const CTA_25_CONFIG: CtaCPresetConfig = {
    id: 'cta-25',
    name: 'CTA 25',
    description: 'Center-aligned text with buttons, no background',
    layout: 'center-normal-none-button',
    tags: ['cta', 'center', 'text-only', 'button'],
    imageRole: 'none',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'center',
    style: 'normal',
    background: 'none',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-normal',
}

export const CTA_26_CONFIG: CtaCPresetConfig = {
    id: 'cta-26',
    name: 'CTA 26',
    description: 'Center-aligned text with form, no background',
    layout: 'center-normal-none-form',
    tags: ['cta', 'center', 'text-only', 'form', 'email'],
    imageRole: 'none',
    supportsVideo: false,
    element: 'form',
    textAlignment: 'center',
    style: 'normal',
    background: 'none',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-normal',
}

export const CTA_27_CONFIG: CtaCPresetConfig = {
    id: 'cta-27',
    name: 'CTA 27',
    description: 'Center-aligned text with buttons, background image',
    layout: 'center-normal-image-button',
    tags: ['cta', 'center', 'background', 'image', 'button'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'center',
    style: 'normal',
    background: 'image',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-normal',
}

export const CTA_28_CONFIG: CtaCPresetConfig = {
    id: 'cta-28',
    name: 'CTA 28',
    description: 'Center-aligned text with form, background image',
    layout: 'center-normal-image-form',
    tags: ['cta', 'center', 'background', 'image', 'form', 'email'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'form',
    textAlignment: 'center',
    style: 'normal',
    background: 'image',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-normal',
}

export const CTA_29_CONFIG: CtaCPresetConfig = {
    id: 'cta-29',
    name: 'CTA 29',
    description: 'Center-aligned text with buttons, background video',
    layout: 'center-normal-video-button',
    tags: ['cta', 'center', 'background', 'video', 'button'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'button',
    textAlignment: 'center',
    style: 'normal',
    background: 'video',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-normal',
}

export const CTA_30_CONFIG: CtaCPresetConfig = {
    id: 'cta-30',
    name: 'CTA 30',
    description: 'Center-aligned text with form, background video',
    layout: 'center-normal-video-form',
    tags: ['cta', 'center', 'background', 'video', 'form', 'email'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'form',
    textAlignment: 'center',
    style: 'normal',
    background: 'video',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-normal',
}

// --- Text=Center, Card ---

export const CTA_51_CONFIG: CtaCPresetConfig = {
    id: 'cta-51',
    name: 'CTA 51',
    description: 'Center-aligned text with buttons, card, no background',
    layout: 'center-card-none-button',
    tags: ['cta', 'center', 'card', 'button'],
    imageRole: 'none',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'center',
    style: 'card',
    background: 'none',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-card',
}

export const CTA_52_CONFIG: CtaCPresetConfig = {
    id: 'cta-52',
    name: 'CTA 52',
    description: 'Center-aligned text with form, card, no background',
    layout: 'center-card-none-form',
    tags: ['cta', 'center', 'card', 'form', 'email'],
    imageRole: 'none',
    supportsVideo: false,
    element: 'form',
    textAlignment: 'center',
    style: 'card',
    background: 'none',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-card',
}

export const CTA_53_CONFIG: CtaCPresetConfig = {
    id: 'cta-53',
    name: 'CTA 53',
    description: 'Center-aligned text with buttons, card with background image',
    layout: 'center-card-image-button',
    tags: ['cta', 'center', 'card', 'background', 'image', 'button'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'center',
    style: 'card',
    background: 'image',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-card',
}

export const CTA_54_CONFIG: CtaCPresetConfig = {
    id: 'cta-54',
    name: 'CTA 54',
    description: 'Center-aligned text with form, card with background image',
    layout: 'center-card-image-form',
    tags: ['cta', 'center', 'card', 'background', 'image', 'form', 'email'],
    imageRole: 'background',
    supportsVideo: false,
    element: 'form',
    textAlignment: 'center',
    style: 'card',
    background: 'image',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-card',
}

export const CTA_55_CONFIG: CtaCPresetConfig = {
    id: 'cta-55',
    name: 'CTA 55',
    description: 'Center-aligned text with buttons, card with background video',
    layout: 'center-card-video-button',
    tags: ['cta', 'center', 'card', 'background', 'video', 'button'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'button',
    textAlignment: 'center',
    style: 'card',
    background: 'video',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-card',
}

export const CTA_56_CONFIG: CtaCPresetConfig = {
    id: 'cta-56',
    name: 'CTA 56',
    description: 'Center-aligned text with form, card with background video',
    layout: 'center-card-video-form',
    tags: ['cta', 'center', 'card', 'background', 'video', 'form', 'email'],
    imageRole: 'none',
    supportsVideo: true,
    element: 'form',
    textAlignment: 'center',
    style: 'card',
    background: 'video',
    asset: 'none',
    assetStyle: 'default',
    sectionGroup: 'center-card',
}

// --- Text=Center, Asset=Image ---

export const CTA_31_CONFIG: CtaCPresetConfig = {
    id: 'cta-31',
    name: 'CTA 31',
    description: 'Center-aligned text with buttons + image below',
    layout: 'center-stacked-default-button',
    tags: ['cta', 'center', 'stacked', 'image', 'button'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'center',
    style: 'normal',
    background: 'none',
    asset: 'image',
    assetStyle: 'default',
    sectionGroup: 'center-stacked',
}

export const CTA_32_CONFIG: CtaCPresetConfig = {
    id: 'cta-32',
    name: 'CTA 32',
    description: 'Center-aligned text with form + image below',
    layout: 'center-stacked-default-form',
    tags: ['cta', 'center', 'stacked', 'image', 'form', 'email'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'form',
    textAlignment: 'center',
    style: 'normal',
    background: 'none',
    asset: 'image',
    assetStyle: 'default',
    sectionGroup: 'center-stacked',
}

export const CTA_65_CONFIG: CtaCPresetConfig = {
    id: 'cta-65',
    name: 'CTA 65',
    description: 'Center-aligned text with buttons + full-bleed image',
    layout: 'center-expand-button',
    tags: ['cta', 'center', 'expand', 'image', 'button'],
    imageRole: 'inline',
    supportsVideo: false,
    element: 'button',
    textAlignment: 'center',
    style: 'normal',
    background: 'none',
    asset: 'image',
    assetStyle: 'expand',
    sectionGroup: 'center-expand',
}

// ============================================
// Aggregated exports
// ============================================

export const ALL_CTA_C_PRESETS: CtaCPresetConfig[] = [
    CTA_19_CONFIG, CTA_20_CONFIG,
    CTA_3_CONFIG, CTA_4_CONFIG,
    CTA_5_CONFIG, CTA_6_CONFIG,
    CTA_41_CONFIG, CTA_42_CONFIG,
    CTA_43_CONFIG, CTA_44_CONFIG,
    CTA_25_CONFIG, CTA_26_CONFIG,
    CTA_27_CONFIG, CTA_28_CONFIG,
    CTA_29_CONFIG, CTA_30_CONFIG,
    CTA_51_CONFIG, CTA_52_CONFIG,
    CTA_53_CONFIG, CTA_54_CONFIG,
    CTA_55_CONFIG, CTA_56_CONFIG,
    CTA_31_CONFIG, CTA_32_CONFIG,
    CTA_65_CONFIG,
]

export const CTA_C_PRESETS_MAP: Record<string, CtaCPresetConfig> = Object.fromEntries(
    ALL_CTA_C_PRESETS.map(p => [p.id, p]),
)
