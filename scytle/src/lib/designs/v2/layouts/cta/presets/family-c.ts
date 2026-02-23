/**
 * CTA Family C — Block Factories & Preset Configs
 *
 * 25 presets: CTA 3–6, 19–20, 25–32, 41–44, 51–56, 65
 * Layout: Single-column text (heading, body, actions stacked vertically).
 *         Optional background, card wrap, or image below.
 *
 * Groups:
 *   Left Normal   (CTA 19/20, 3–6)       — items-start, optional bg
 *   Left Card     (CTA 41–44)             — card with bg image/video inside
 *   Center Normal (CTA 25–30)             — items-center, optional bg
 *   Center Card   (CTA 51–56)             — card, optional bg
 *   Center Stacked (CTA 31/32)            — text + image below
 *   Center Expand  (CTA 65)               — text padded + full-bleed image
 */

import type { Block } from '../../../blocks/types'
import type { CtaPresetConfig } from '../types'
import {
    uid, resetUid,
    makeHeading, makeBody, makeButtonGroup, makeFormActions, makeImage,
} from './shared-builders'

// ============================================
// Family-specific: Single-column content frame
// ============================================

/** Single-column layout: heading + body + actions, max-w 768, stacked */
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
// Block Factories — Text=Left, Normal
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
// Block Factories — Text=Left, Card
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
// Block Factories — Text=Center, Normal
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
// Block Factories — Text=Center, Card
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
// Block Factories — Text=Center, Asset=Image
// ============================================

/** CTA 31 — Center, Asset=Image, Default, Button */
export function buildCta31Blocks(): Block[] {
    resetUid()
    const contentFrame = makeContentFrame('center', makeButtonGroup('center'))
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
    return [contentFrame, image]
}

// ============================================
// Preset Configs (unified format)
// ============================================

export const FAMILY_C_PRESETS: CtaPresetConfig[] = [
    // ── Left Normal ──
    {
        id: 'cta-19', name: 'CTA 19',
        description: 'Left-aligned text with buttons, no background',
        tags: ['cta', 'left', 'text-only', 'button'],
        family: 'c', imageRole: 'none', supportsVideo: false,
        shell: 'container', align: 'left', background: 'none',
        axes: { text: 'left', style: 'normal', background: 'none', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-20', name: 'CTA 20',
        description: 'Left-aligned text with form, no background',
        tags: ['cta', 'left', 'text-only', 'form', 'email'],
        family: 'c', imageRole: 'none', supportsVideo: false,
        shell: 'container', align: 'left', background: 'none',
        axes: { text: 'left', style: 'normal', background: 'none', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-3', name: 'CTA 3',
        description: 'Left-aligned text with buttons, background image',
        tags: ['cta', 'left', 'background', 'image', 'button'],
        family: 'c', imageRole: 'background', supportsVideo: false,
        shell: 'bg-container', align: 'left', background: 'image',
        axes: { text: 'left', style: 'normal', background: 'image', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-4', name: 'CTA 4',
        description: 'Left-aligned text with form, background image',
        tags: ['cta', 'left', 'background', 'image', 'form', 'email'],
        family: 'c', imageRole: 'background', supportsVideo: false,
        shell: 'bg-container', align: 'left', background: 'image',
        axes: { text: 'left', style: 'normal', background: 'image', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-5', name: 'CTA 5',
        description: 'Left-aligned text with buttons, background video',
        tags: ['cta', 'left', 'background', 'video', 'button'],
        family: 'c', imageRole: 'none', supportsVideo: true,
        shell: 'bg-container', align: 'left', background: 'video',
        axes: { text: 'left', style: 'normal', background: 'video', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-6', name: 'CTA 6',
        description: 'Left-aligned text with form, background video',
        tags: ['cta', 'left', 'background', 'video', 'form', 'email'],
        family: 'c', imageRole: 'none', supportsVideo: true,
        shell: 'bg-container', align: 'left', background: 'video',
        axes: { text: 'left', style: 'normal', background: 'video', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    // ── Left Card ──
    {
        id: 'cta-41', name: 'CTA 41',
        description: 'Left-aligned text with buttons, card with background image',
        tags: ['cta', 'left', 'card', 'background', 'image', 'button'],
        family: 'c', imageRole: 'background', supportsVideo: false,
        shell: 'card-bg', align: 'left', background: 'image', contentMaxWidth: 768,
        axes: { text: 'left', style: 'card', background: 'image', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-42', name: 'CTA 42',
        description: 'Left-aligned text with form, card with background image',
        tags: ['cta', 'left', 'card', 'background', 'image', 'form', 'email'],
        family: 'c', imageRole: 'background', supportsVideo: false,
        shell: 'card-bg', align: 'left', background: 'image', contentMaxWidth: 768,
        axes: { text: 'left', style: 'card', background: 'image', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-43', name: 'CTA 43',
        description: 'Left-aligned text with buttons, card with background video',
        tags: ['cta', 'left', 'card', 'background', 'video', 'button'],
        family: 'c', imageRole: 'none', supportsVideo: true,
        shell: 'card-bg', align: 'left', background: 'video', contentMaxWidth: 768,
        axes: { text: 'left', style: 'card', background: 'video', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-44', name: 'CTA 44',
        description: 'Left-aligned text with form, card with background video',
        tags: ['cta', 'left', 'card', 'background', 'video', 'form', 'email'],
        family: 'c', imageRole: 'none', supportsVideo: true,
        shell: 'card-bg', align: 'left', background: 'video', contentMaxWidth: 768,
        axes: { text: 'left', style: 'card', background: 'video', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    // ── Center Normal ──
    {
        id: 'cta-25', name: 'CTA 25',
        description: 'Center-aligned text with buttons, no background',
        tags: ['cta', 'center', 'text-only', 'button'],
        family: 'c', imageRole: 'none', supportsVideo: false,
        shell: 'container', align: 'center', background: 'none',
        axes: { text: 'center', style: 'normal', background: 'none', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-26', name: 'CTA 26',
        description: 'Center-aligned text with form, no background',
        tags: ['cta', 'center', 'text-only', 'form', 'email'],
        family: 'c', imageRole: 'none', supportsVideo: false,
        shell: 'container', align: 'center', background: 'none',
        axes: { text: 'center', style: 'normal', background: 'none', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-27', name: 'CTA 27',
        description: 'Center-aligned text with buttons, background image',
        tags: ['cta', 'center', 'background', 'image', 'button'],
        family: 'c', imageRole: 'background', supportsVideo: false,
        shell: 'bg-container', align: 'center', background: 'image',
        axes: { text: 'center', style: 'normal', background: 'image', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-28', name: 'CTA 28',
        description: 'Center-aligned text with form, background image',
        tags: ['cta', 'center', 'background', 'image', 'form', 'email'],
        family: 'c', imageRole: 'background', supportsVideo: false,
        shell: 'bg-container', align: 'center', background: 'image',
        axes: { text: 'center', style: 'normal', background: 'image', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-29', name: 'CTA 29',
        description: 'Center-aligned text with buttons, background video',
        tags: ['cta', 'center', 'background', 'video', 'button'],
        family: 'c', imageRole: 'none', supportsVideo: true,
        shell: 'bg-container', align: 'center', background: 'video',
        axes: { text: 'center', style: 'normal', background: 'video', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-30', name: 'CTA 30',
        description: 'Center-aligned text with form, background video',
        tags: ['cta', 'center', 'background', 'video', 'form', 'email'],
        family: 'c', imageRole: 'none', supportsVideo: true,
        shell: 'bg-container', align: 'center', background: 'video',
        axes: { text: 'center', style: 'normal', background: 'video', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    // ── Center Card ──
    {
        id: 'cta-51', name: 'CTA 51',
        description: 'Center-aligned text with buttons, card, no background',
        tags: ['cta', 'center', 'card', 'button'],
        family: 'c', imageRole: 'none', supportsVideo: false,
        shell: 'card', align: 'center', background: 'none',
        axes: { text: 'center', style: 'card', background: 'none', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-52', name: 'CTA 52',
        description: 'Center-aligned text with form, card, no background',
        tags: ['cta', 'center', 'card', 'form', 'email'],
        family: 'c', imageRole: 'none', supportsVideo: false,
        shell: 'card', align: 'center', background: 'none',
        axes: { text: 'center', style: 'card', background: 'none', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-53', name: 'CTA 53',
        description: 'Center-aligned text with buttons, card with background image',
        tags: ['cta', 'center', 'card', 'background', 'image', 'button'],
        family: 'c', imageRole: 'background', supportsVideo: false,
        shell: 'card-bg', align: 'center', background: 'image',
        axes: { text: 'center', style: 'card', background: 'image', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-54', name: 'CTA 54',
        description: 'Center-aligned text with form, card with background image',
        tags: ['cta', 'center', 'card', 'background', 'image', 'form', 'email'],
        family: 'c', imageRole: 'background', supportsVideo: false,
        shell: 'card-bg', align: 'center', background: 'image',
        axes: { text: 'center', style: 'card', background: 'image', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-55', name: 'CTA 55',
        description: 'Center-aligned text with buttons, card with background video',
        tags: ['cta', 'center', 'card', 'background', 'video', 'button'],
        family: 'c', imageRole: 'none', supportsVideo: true,
        shell: 'card-bg', align: 'center', background: 'video',
        axes: { text: 'center', style: 'card', background: 'video', element: 'button', asset: 'none', assetStyle: 'default' },
    },
    {
        id: 'cta-56', name: 'CTA 56',
        description: 'Center-aligned text with form, card with background video',
        tags: ['cta', 'center', 'card', 'background', 'video', 'form', 'email'],
        family: 'c', imageRole: 'none', supportsVideo: true,
        shell: 'card-bg', align: 'center', background: 'video',
        axes: { text: 'center', style: 'card', background: 'video', element: 'form', asset: 'none', assetStyle: 'default' },
    },
    // ── Center Stacked ──
    {
        id: 'cta-31', name: 'CTA 31',
        description: 'Center-aligned text with buttons + image below',
        tags: ['cta', 'center', 'stacked', 'image', 'button'],
        family: 'c', imageRole: 'inline', supportsVideo: false,
        shell: 'container', align: 'center', background: 'none',
        axes: { text: 'center', style: 'normal', background: 'none', element: 'button', asset: 'image', assetStyle: 'default' },
    },
    {
        id: 'cta-32', name: 'CTA 32',
        description: 'Center-aligned text with form + image below',
        tags: ['cta', 'center', 'stacked', 'image', 'form', 'email'],
        family: 'c', imageRole: 'inline', supportsVideo: false,
        shell: 'container', align: 'center', background: 'none',
        axes: { text: 'center', style: 'normal', background: 'none', element: 'form', asset: 'image', assetStyle: 'default' },
    },
    // ── Center Expand ──
    {
        id: 'cta-65', name: 'CTA 65',
        description: 'Center-aligned text with buttons + full-bleed image',
        tags: ['cta', 'center', 'expand', 'image', 'button'],
        family: 'c', imageRole: 'inline', supportsVideo: false,
        shell: 'expand', align: 'center', background: 'none',
        axes: { text: 'center', style: 'normal', background: 'none', element: 'button', asset: 'image', assetStyle: 'expand' },
    },
]

export const FAMILY_C_PRESETS_MAP: Record<string, CtaPresetConfig> = Object.fromEntries(
    FAMILY_C_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_C_BLOCK_FACTORIES: Record<string, () => Block[]> = {
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
