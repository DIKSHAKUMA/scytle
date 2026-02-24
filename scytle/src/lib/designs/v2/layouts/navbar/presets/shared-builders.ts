/**
 * Navbar — Shared Block Builders
 *
 * Single source of truth for atomic block builders used by all navbar variants.
 * Each variant's block factory imports these to compose its block tree.
 *
 * All text content uses DEFAULT_CONTENT from the unified types.
 */

import type { Block } from '../../../blocks/types'
import { DEFAULT_CONTENT } from '../types'

// ============================================
// UID generator (reset per factory call)
// ============================================

let _uid = 0

/** Generate a unique block ID. Reset before each factory call. */
export function uid(prefix = 'navbar'): string {
    return `${prefix}-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
}

/** Reset UID counter — call at start of each block factory. */
export function resetUid(): void {
    _uid = 0
}

// ============================================
// Atomic block builders
// ============================================

/** Logo block (default size md = 32px) */
export function makeLogo(): Block {
    return {
        id: uid(),
        type: 'logo',
        props: { size: 'md' },
        content: { alt: DEFAULT_CONTENT.logoText },
    }
}

/** Single nav link text block */
export function makeNavLink(text: string): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'body', align: 'left' as const },
        content: { text },
    }
}

/** Navigation links group — horizontal row of text links */
export function makeNavLinks(count = 4): Block {
    const links = DEFAULT_CONTENT.links.slice(0, count)
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            className: 'items-center',
        },
        content: {},
        children: links.map((text) => makeNavLink(text)),
    }
}

/** Primary button */
export function makePrimaryButton(): Block {
    return {
        id: uid(),
        type: 'button',
        props: { variant: 'primary', size: 'md' },
        content: { text: DEFAULT_CONTENT.primaryButton },
    }
}

/** Secondary button */
export function makeSecondaryButton(): Block {
    return {
        id: uid(),
        type: 'button',
        props: { variant: 'secondary', size: 'md' },
        content: { text: DEFAULT_CONTENT.secondaryButton },
    }
}

/** Button group: 1 or 2 buttons */
export function makeButtonGroup(count: 0 | 1 | 2 = 2): Block {
    const children: Block[] = []
    if (count >= 2) children.push(makeSecondaryButton())
    if (count >= 1) children.push(makePrimaryButton())
    return {
        id: uid(),
        type: 'button-group',
        props: { align: 'left', gap: 16 },
        content: {},
        children,
    }
}

/** Hamburger/menu icon block */
export function makeMenuIcon(): Block {
    return {
        id: uid(),
        type: 'icon',
        props: { name: 'menu', size: 'md' },
        content: {},
    }
}

/** Small text link for top row */
export function makeSmallLink(text: string): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'small', align: 'left' as const },
        content: { text },
    }
}

/** Top row links group for two-row navbars */
export function makeTopRowLinks(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 24,
            className: 'items-center',
        },
        content: {},
        children: DEFAULT_CONTENT.topRowLinks.map((text) => makeSmallLink(text)),
    }
}

// ============================================
// Composite bar builders
// ============================================

/**
 * Standard bar: Logo left, [links + buttons] right
 *
 * frame (row, justify-between, items-center, fill-width)
 * ├── logo
 * └── frame (row, gap-32, items-center)
 *     ├── navLinks
 *     └── buttonGroup
 */
export function buildStandardBar(linkCount = 4, buttonCount: 0 | 1 | 2 = 2): Block[] {
    resetUid()
    const rightChildren: Block[] = [makeNavLinks(linkCount)]
    if (buttonCount > 0) rightChildren.push(makeButtonGroup(buttonCount))

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'items-center justify-between',
        },
        content: {},
        children: [
            makeLogo(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 32,
                    className: 'items-center',
                },
                content: {},
                children: rightChildren,
            },
        ],
    }]
}

/**
 * Center-links bar: Logo left flex-1, links center shrink-0, buttons right flex-1
 *
 * frame (row, items-center, fill-width, gap-32)
 * ├── frame (flex-1, items-start) → logo
 * ├── navLinks (shrink-0)
 * └── frame (flex-1, justify-end) → buttonGroup
 */
export function buildCenterLinksBar(linkCount = 4, buttonCount: 0 | 1 | 2 = 1): Block[] {
    resetUid()
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'items-center',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    className: 'flex-1 items-center',
                },
                content: {},
                children: [makeLogo()],
            },
            makeNavLinks(linkCount),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 16,
                    className: 'flex-1 items-center justify-end',
                },
                content: {},
                children: buttonCount > 0 ? [makeButtonGroup(buttonCount)] : [],
            },
        ],
    }]
}

/**
 * Center-logo bar: Links left flex-1, logo center, buttons right flex-1
 *
 * frame (row, items-center, fill-width, gap-32)
 * ├── frame (flex-1) → navLinks
 * ├── logo (shrink-0)
 * └── frame (flex-1, justify-end) → buttonGroup
 */
export function buildCenterLogoBar(linkCount = 3, buttonCount: 0 | 1 | 2 = 1): Block[] {
    resetUid()
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'items-center',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    className: 'flex-1 items-center',
                },
                content: {},
                children: [makeNavLinks(linkCount)],
            },
            makeLogo(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 16,
                    className: 'flex-1 items-center justify-end',
                },
                content: {},
                children: buttonCount > 0 ? [makeButtonGroup(buttonCount)] : [],
            },
        ],
    }]
}

/**
 * Hamburger bar: Logo left, [button + hamburger icon] right
 *
 * frame (row, justify-between, items-center, fill-width)
 * ├── logo
 * └── frame (row, gap-16, items-center)
 *     ├── buttonGroup (optional)
 *     └── menuIcon
 */
export function buildHamburgerBar(buttonCount: 0 | 1 | 2 = 1): Block[] {
    resetUid()
    const rightChildren: Block[] = []
    if (buttonCount > 0) rightChildren.push(makeButtonGroup(buttonCount))
    rightChildren.push(makeMenuIcon())

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'items-center justify-between',
        },
        content: {},
        children: [
            makeLogo(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 16,
                    className: 'items-center',
                },
                content: {},
                children: rightChildren,
            },
        ],
    }]
}

/**
 * Hamburger with links bar: Logo left, [links + button + hamburger] right
 *
 * frame (row, justify-between, items-center, fill-width)
 * ├── logo
 * └── frame (row, gap-32, items-center)
 *     ├── navLinks
 *     ├── buttonGroup (optional)
 *     └── menuIcon
 */
export function buildHamburgerLinksBar(linkCount = 3, buttonCount: 0 | 1 | 2 = 1): Block[] {
    resetUid()
    const rightChildren: Block[] = [makeNavLinks(linkCount)]
    if (buttonCount > 0) rightChildren.push(makeButtonGroup(buttonCount))
    rightChildren.push(makeMenuIcon())

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'items-center justify-between',
        },
        content: {},
        children: [
            makeLogo(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 24,
                    className: 'items-center',
                },
                content: {},
                children: rightChildren,
            },
        ],
    }]
}

/**
 * Two-row bar: Top row with small links, bottom row with standard nav
 *
 * frame (column, fill-width)
 * ├── frame (row, justify-between, items-center, py-2, border-bottom) [top row]
 * │   ├── topRowLinks (left)
 * │   └── topRowLinks (right — reuse same small links)
 * └── standardBar [main nav]
 */
export function buildTwoRowBar(linkCount = 4, buttonCount: 0 | 1 | 2 = 2): Block[] {
    resetUid()

    // Top row
    const topRow: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 16,
            sizing: { width: 'fill' },
            className: 'items-center justify-between py-2',
        },
        content: {},
        children: [
            makeTopRowLinks(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 16,
                    className: 'items-center',
                },
                content: {},
                children: [
                    makeSmallLink('Link Eight'),
                    makeSmallLink('Link Nine'),
                ],
            },
        ],
    }

    // Main bar content (reuse standard layout logic)
    const rightChildren: Block[] = [makeNavLinks(linkCount)]
    if (buttonCount > 0) rightChildren.push(makeButtonGroup(buttonCount))

    const mainBar: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'items-center justify-between py-4',
        },
        content: {},
        children: [
            makeLogo(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 32,
                    className: 'items-center',
                },
                content: {},
                children: rightChildren,
            },
        ],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 0,
            sizing: { width: 'fill' },
        },
        content: {},
        children: [topRow, mainBar],
    }]
}
