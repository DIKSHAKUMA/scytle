/**
 * Hero Header — Shared Block Builders
 *
 * Single source of truth for atomic block builders used by all hero-header families.
 * Each family file imports these instead of duplicating them.
 *
 * Hero headers use H1 headings (not H2 like CTA) and include tagline.
 * Includes inline media builders (image/video) for split/stacked families.
 */

import type { Block } from '../../../blocks/types'
import { DEFAULT_CONTENT } from '../types'

// ============================================
// UID generator (reset per factory call)
// ============================================

let _uid = 0

/** Generate a unique block ID. Reset before each factory call. */
export function uid(prefix = 'hh'): string {
    return `${prefix}-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
}

/** Reset UID counter — call at start of each block factory. */
export function resetUid(): void {
    _uid = 0
}

// ============================================
// Atomic block builders
// ============================================

/** Tagline text block (small variant) */
export function makeTagline(align: 'left' | 'center' = 'left'): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'small', align },
        content: { text: DEFAULT_CONTENT.tagline },
    }
}

/** H1 heading block */
export function makeHeading(align: 'left' | 'center' = 'left'): Block {
    return {
        id: uid(),
        type: 'heading',
        props: { level: 1, align },
        content: { text: DEFAULT_CONTENT.heading },
    }
}

/** Body text block */
export function makeBody(align: 'left' | 'center' = 'left'): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align },
        content: { text: DEFAULT_CONTENT.body },
    }
}

/** Heading + body grouped with gap-24 */
export function makeTextContent(align: 'left' | 'center' = 'left'): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            className: '@max-sm:!gap-5',
        },
        content: {},
        children: [makeHeading(align), makeBody(align)],
    }
}

/** Section title: tagline + text content (heading + body) — gap-16 */
export function makeSectionTitle(align: 'left' | 'center' = 'left'): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-3',
        },
        content: {},
        children: [makeTagline(align), makeTextContent(align)],
    }
}

/** Two-button CTA group */
export function makeButtonGroup(align: 'left' | 'center' = 'left'): Block {
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
        props: { align, gap: 16 },
        content: {},
        children: [primaryBtn, secondaryBtn],
    }
}

/** Email input + submit button row + terms text */
export function makeFormActions(align: 'left' | 'center' = 'left', maxWidth = 513): Block {
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
        props: { variant: 'small', align },
        content: { text: DEFAULT_CONTENT.termsText },
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            maxWidth,
            sizing: { width: 'fill' },
        },
        content: {},
        children: [formRow, termsText],
    }
}

/** Inline image block (for split/stacked layouts) */
export function makeImage(ratio: string = '3:2', layoutClassName = 'flex-1 @max-sm:!flex-auto'): Block {
    return {
        id: uid(),
        type: 'image',
        props: {
            ratio,
            fillMode: 'cover',
            layoutClassName,
        },
        content: { alt: 'Hero image' },
    }
}

/** Inline video placeholder block (for split/stacked layouts) */
export function makeVideo(ratio: string = '16:9', layoutClassName = 'flex-1 @max-sm:!flex-auto'): Block {
    return {
        id: uid(),
        type: 'video',
        props: {
            ratio,
            showPlayButton: true,
            layoutClassName,
        },
        content: { alt: 'Hero video' },
    }
}

/** Creates the action block: either button group or form actions */
export function makeActions(element: 'button' | 'form', align: 'left' | 'center' = 'left'): Block {
    return element === 'form' ? makeFormActions(align) : makeButtonGroup(align)
}

/** Creates the media block: either image or video */
export function makeMedia(
    asset: 'image' | 'video',
    ratio: string = '3:2',
    layoutClassName = 'flex-1 @max-sm:!flex-auto',
): Block {
    return asset === 'video'
        ? makeVideo(ratio, layoutClassName)
        : makeImage(ratio, layoutClassName)
}
