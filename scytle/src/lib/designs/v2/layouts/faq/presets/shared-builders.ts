/**
 * FAQ — Shared Block Builders
 *
 * Single source of truth for atomic block builders used by all FAQ families.
 * Each family file imports these instead of duplicating them.
 *
 * Block types used:
 *   heading  — H2 section title, H4 CTA title, H5 question
 *   text     — body text, answer text
 *   button   — CTA button
 *   frame    — layout containers, accordion items, grid rows
 *   divider  — separator between accordion items / Q/A rows
 *   icon     — accordion expand/collapse indicator, relume icon
 */

import type { Block } from '../../../blocks/types'
import { DEFAULT_CONTENT } from '../types'

// ============================================
// UID generator (reset per factory call)
// ============================================

let _uid = 0

/** Generate a unique block ID. Reset before each factory call. */
export function uid(prefix = 'faq'): string {
    return `${prefix}-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
}

/** Reset UID counter — call at start of each block factory. */
export function resetUid(): void {
    _uid = 0
}

// ============================================
// Atomic block builders
// ============================================

/** H2 heading block for section title */
export function makeHeading(align: 'left' | 'center' = 'left'): Block {
    return {
        id: uid(),
        type: 'heading',
        props: { level: 2, align },
        content: { text: DEFAULT_CONTENT.heading },
    }
}

/** Body text block for section subtitle */
export function makeBody(align: 'left' | 'center' = 'left'): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align },
        content: { text: DEFAULT_CONTENT.body },
    }
}

/**
 * Section title: H2 heading + body text — gap-24
 * Constrained to max-w-768 as per Figma.
 */
export function makeSectionTitle(align: 'left' | 'center' = 'left'): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            maxWidth: 768,
            sizing: { width: 'fill' },
            className: `@max-sm:!gap-5 ${align === 'center' ? 'items-center text-center' : 'items-start'}`,
        },
        content: {},
        children: [makeHeading(align), makeBody(align)],
    }
}

// ============================================
// Accordion item builders
// ============================================

/** Question text (bold) used inside accordion/grid items */
function makeQuestionText(): Block {
    return {
        id: uid(),
        type: 'text',
        props: {
            variant: 'body-large',
            align: 'left',
            bold: true,
            className: 'flex-1',
        },
        content: { text: DEFAULT_CONTENT.questionText },
    }
}

/** Answer text used inside accordion/grid items */
function makeAnswerText(maxWidth?: number): Block {
    return {
        id: uid(),
        type: 'text',
        props: {
            variant: 'body',
            align: 'left',
            ...(maxWidth ? { className: `max-w-[${maxWidth}px]` } : {}),
        },
        content: { text: DEFAULT_CONTENT.answerText },
    }
}

/**
 * Normal/divider-style accordion item (used by FAQ 1,2,3,10):
 *   border-top divider → question row (text + ▲ icon) → answer
 */
export function makeNormalAccordionItem(): Block {
    const questionRow: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 24,
            sizing: { width: 'fill' },
            className: 'items-center py-5 @max-sm:!py-4',
        },
        content: {},
        children: [
            makeQuestionText(),
            {
                id: uid(),
                type: 'icon',
                props: { name: 'chevron-up', size: 24 },
                content: {},
            },
        ],
    }

    const answerSection: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
            className: 'pb-6 @max-sm:!pb-5',
        },
        content: {},
        children: [makeAnswerText()],
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
            className: 'border-t',
        },
        content: {},
        children: [questionRow, answerSection],
    }
}

/**
 * Card-style accordion item (used by FAQ 4,5,6,11):
 *   bordered card with foreground bg → question row (text + × icon) → answer
 */
export function makeCardAccordionItem(): Block {
    const questionRow: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 24,
            sizing: { width: 'fill' },
            className: 'items-center px-6 py-5 @max-sm:!px-5 @max-sm:!py-4',
        },
        content: {},
        children: [
            makeQuestionText(),
            {
                id: uid(),
                type: 'icon',
                props: { name: 'x', size: 24 },
                content: {},
            },
        ],
    }

    const answerSection: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
            className: 'pb-6 px-6 @max-sm:!pb-5 @max-sm:!px-5',
        },
        content: {},
        children: [makeAnswerText()],
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
            className: 'border rounded-sm',
            style: {
                backgroundColor: 'var(--sg-bg-secondary, var(--sg-bg-primary))',
                borderColor: 'var(--sg-border)',
            },
        },
        content: {},
        children: [questionRow, answerSection],
    }
}

// ============================================
// Accordion list builders
// ============================================

/**
 * Normal accordion list: 5 items with border-top dividers + bottom border on container.
 * Used by Family A (normal) & B (normal).
 */
export function makeNormalAccordionList(maxWidth?: number): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
            ...(maxWidth ? { maxWidth } : {}),
            className: 'border-b',
        },
        content: {},
        children: Array.from({ length: 5 }, () => makeNormalAccordionItem()),
    }
}

/**
 * Card-style accordion list: 5 card items with gap-16.
 * Used by Family A (card) & B (card).
 */
export function makeCardAccordionList(maxWidth?: number): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            sizing: { width: 'fill' },
            ...(maxWidth ? { maxWidth } : {}),
        },
        content: {},
        children: Array.from({ length: 5 }, () => makeCardAccordionItem()),
    }
}

// ============================================
// Non-accordion Q/A item builders
// ============================================

/**
 * Simple stacked Q/A pair: question (bold) + answer, gap-16.
 * Used by Family C (1/2/3 column grids).
 */
export function makeGridItem(): Block {
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
        children: [
            {
                id: uid(),
                type: 'text',
                props: { variant: 'body-large', align: 'left', bold: true },
                content: { text: DEFAULT_CONTENT.questionText },
            },
            makeAnswerText(),
        ],
    }
}

/**
 * Horizontal Q/A row with divider: divider + (question w-500 | answer flex-1).
 * Used by Family D & E.
 */
export function makeHorizontalQaRow(): Block {
    const divider: Block = {
        id: uid(),
        type: 'divider',
        props: {},
        content: {},
    }

    const content: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 64,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-4',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'text',
                props: {
                    variant: 'body-large',
                    align: 'left',
                    bold: true,
                    className: 'w-[500px] shrink-0 @max-sm:!w-full',
                },
                content: { text: DEFAULT_CONTENT.questionText },
            },
            {
                id: uid(),
                type: 'text',
                props: { variant: 'body', align: 'left', className: 'flex-1' },
                content: { text: DEFAULT_CONTENT.answerText },
            },
        ],
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-5',
        },
        content: {},
        children: [divider, content],
    }
}

/**
 * Icon + Q/A pair (centered, with icon above): icon + question + answer.
 * Used by Family F.
 */
export function makeIconGridItem(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: 'items-center @max-sm:!gap-5',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'icon',
                props: { name: 'layout', size: 24 },
                content: {},
            },
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'vertical',
                    gap: 16,
                    sizing: { width: 'fill' },
                    className: 'items-center text-center @max-sm:!gap-3',
                },
                content: {},
                children: [
                    {
                        id: uid(),
                        type: 'text',
                        props: { variant: 'body-large', align: 'center', bold: true },
                        content: { text: DEFAULT_CONTENT.questionText },
                    },
                    {
                        id: uid(),
                        type: 'text',
                        props: { variant: 'body', align: 'center' },
                        content: {
                            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla',
                        },
                    },
                ],
            },
        ],
    }
}

// ============================================
// Bottom CTA builders
// ============================================

/**
 * Bottom CTA simple: H4 heading + body + button.
 * max-w-560, used by Families A, B (implicit), C, E.
 */
export function makeBottomCta(align: 'left' | 'center' = 'center'): Block {
    const ctaContent: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            sizing: { width: 'fill' },
            className: `@max-sm:!gap-3 ${align === 'center' ? 'items-center text-center' : 'items-start'}`,
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'heading',
                props: { level: 4, align },
                content: { text: DEFAULT_CONTENT.ctaHeading },
            },
            {
                id: uid(),
                type: 'text',
                props: { variant: 'body-large', align },
                content: { text: DEFAULT_CONTENT.ctaBody },
            },
        ],
    }

    const actions: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            className: 'items-center',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'button',
                props: { variant: 'secondary', size: 'md' },
                content: { text: DEFAULT_CONTENT.buttonText },
            },
        ],
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            maxWidth: 560,
            sizing: { width: 'fill' },
            className: align === 'center' ? 'items-center' : 'items-start',
        },
        content: {},
        children: [ctaContent, actions],
    }
}

// ============================================
// Split layout helper (for Families B, D)
// ============================================

/**
 * Split section title with CTA button: title content + button.
 * Used as the left column in split layouts (w-500 desktop).
 */
export function makeSplitTitleWithButton(): Block {
    const titleContent: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-5',
        },
        content: {},
        children: [makeHeading('left'), makeBody('left')],
    }

    const actions: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            className: 'items-center',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'button',
                props: { variant: 'secondary', size: 'md' },
                content: { text: DEFAULT_CONTENT.buttonText },
            },
        ],
    }

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'w-[500px] shrink-0 @max-sm:!w-full @max-sm:!gap-6',
        },
        content: {},
        children: [titleContent, actions],
    }
}
