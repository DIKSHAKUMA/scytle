/**
 * Footer — Shared Block Builders
 *
 * Atomic block builders used by all footer families. Each family file
 * imports and composes these to build its own block trees.
 *
 * Block types used:
 *   logo     — company logo placeholder
 *   heading  — H6 column heading, H1 CTA heading
 *   text     — body, small, caption text
 *   button   — primary/secondary CTA, subscribe button
 *   frame    — layout containers
 *   divider  — horizontal separator
 *   icon     — social, contact icons
 *   input    — email form field
 *   form     — form container
 *   social   — social icon row
 *   image    — big brand logo image
 *   avatar   — avatar stack circles
 */

import type { Block } from '../../../blocks/types'
import { DEFAULT_CONTENT } from '../types'

// ============================================
// UID generator
// ============================================

let _uid = 0

/** Generate a unique block ID. Reset before each factory call. */
export function uid(prefix = 'footer'): string {
    return `${prefix}-block-${++_uid}-${Math.random().toString(36).slice(2, 6)}`
}

/** Reset UID counter — call at start of each block factory. */
export function resetUid(): void {
    _uid = 0
}

// ============================================
// Logo
// ============================================

/** Company logo block (placeholder rectangle + text) */
export function makeLogo(): Block {
    return {
        id: uid(),
        type: 'logo',
        props: { height: 36, width: 84 },
        content: { text: 'Logo' },
    }
}

// ============================================
// Link columns
// ============================================

/** Single footer link text (small, regular weight) */
function makeLink(text: string): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'small', align: 'left' },
        content: { text },
    }
}

/** Single footer link text (semi-bold, no heading — for headingless columns) */
function makeBoldLink(text: string): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'small', align: 'left', bold: true },
        content: { text },
    }
}

/**
 * Titled link column: heading + 5 links.
 * Used by most multi-column footers.
 */
export function makeLinkColumn(title: string, linkCount = 5): Block {
    const links: Block[] = Array.from({ length: linkCount }, (_, i) => {
        const linkNames = ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five',
            'Link Six', 'Link Seven', 'Link Eight', 'Link Nine', 'Link Ten']
        return {
            id: uid(),
            type: 'frame' as const,
            props: {
                direction: 'horizontal',
                sizing: { width: 'fill' },
                className: 'py-2',
            },
            content: {},
            children: [makeLink(linkNames[i] || `Link ${i + 1}`)],
        }
    })

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            sizing: { width: 'fill' },
            className: 'flex-1 overflow-clip @max-sm:!gap-3',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'text',
                props: { variant: 'body', align: 'left', bold: true },
                content: { text: title },
            },
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'vertical',
                    sizing: { width: 'fill' },
                },
                content: {},
                children: links,
            },
        ],
    }
}

/**
 * Headingless link column: 5 semi-bold links (no title).
 * Used by Footer 6, 9, 12, 13, 15, 16.
 */
export function makeHeadinglessLinkColumn(startIndex = 0, linkCount = 5): Block {
    const linkNames = ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five',
        'Link Six', 'Link Seven', 'Link Eight', 'Link Nine', 'Link Ten']

    const links: Block[] = Array.from({ length: linkCount }, (_, i) => ({
        id: uid(),
        type: 'frame' as const,
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'py-2',
        },
        content: {},
        children: [makeBoldLink(linkNames[startIndex + i] || `Link ${startIndex + i + 1}`)],
    }))

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
            className: 'flex-1',
        },
        content: {},
        children: links,
    }
}

/**
 * Horizontal inline link row (5 links in a row, semi-bold).
 * Used by Footer 7, 8, 13.
 */
export function makeInlineLinkRow(linkCount = 5): Block {
    const linkNames = ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five']
    const links: Block[] = Array.from({ length: linkCount }, (_, i) =>
        makeBoldLink(linkNames[i] || `Link ${i + 1}`)
    )
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'flex-wrap items-center @max-sm:!flex-col @max-sm:!gap-4 @max-sm:!items-start',
        },
        content: {},
        children: links,
    }
}

// ============================================
// Social links
// ============================================

/**
 * Social icons row (icon-only).
 * Uses the social block type with 5 platform icons.
 */
export function makeSocialIcons(): Block {
    return {
        id: uid(),
        type: 'social',
        props: {
            platforms: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube'],
            size: 24,
        },
        content: {},
    }
}

/**
 * "Follow Us" column with labeled social links (icon + text label).
 * Used by Footer 1, 11, 17.
 */
export function makeSocialColumn(): Block {
    const socialLinks: Block[] = [
        { name: 'facebook', label: 'Facebook' },
        { name: 'instagram', label: 'Instagram' },
        { name: 'twitter', label: 'X' },
        { name: 'linkedin', label: 'LinkedIn' },
        { name: 'youtube', label: 'Youtube' },
    ].map(({ name, label }) => ({
        id: uid(),
        type: 'frame' as const,
        props: {
            direction: 'horizontal',
            gap: 12,
            sizing: { width: 'fill' },
            className: 'items-center py-2',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'icon' as const,
                props: { name, size: 24 },
                content: {},
            },
            {
                id: uid(),
                type: 'text' as const,
                props: { variant: 'small', align: 'left' },
                content: { text: label },
            },
        ],
    }))

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            sizing: { width: 'fill' },
            className: 'flex-1 @max-sm:!gap-3',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'text',
                props: { variant: 'body', align: 'left', bold: true },
                content: { text: 'Follow Us' },
            },
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'vertical',
                    sizing: { width: 'fill' },
                },
                content: {},
                children: socialLinks,
            },
        ],
    }
}

// ============================================
// Newsletter / Subscribe section
// ============================================

/**
 * Email form: input + button inline (horizontal).
 */
export function makeEmailForm(): Block {
    return {
        id: uid(),
        type: 'form',
        props: {
            direction: 'horizontal',
            gap: 16,
            className: '@max-sm:!flex-col',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'input',
                props: {
                    placeholder: DEFAULT_CONTENT.inputPlaceholder,
                    inputType: 'email',
                    className: 'flex-1',
                },
                content: { label: '', placeholder: DEFAULT_CONTENT.inputPlaceholder },
            },
            {
                id: uid(),
                type: 'button',
                props: { variant: 'secondary', size: 'md' },
                content: { text: DEFAULT_CONTENT.buttonText },
            },
        ],
    }
}

/**
 * Privacy/consent text (tiny/caption).
 */
export function makePrivacyText(): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'caption', align: 'left' },
        content: { text: DEFAULT_CONTENT.privacyText },
    }
}

/**
 * Newsletter actions: form + privacy text.
 */
export function makeNewsletterActions(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 12,
            sizing: { width: 'fill' },
        },
        content: {},
        children: [makeEmailForm(), makePrivacyText()],
    }
}

/**
 * Newsletter section with logo, description and form.
 * Used by Footer 1, 11 (left side with logo).
 */
export function makeNewsletterWithLogo(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: 'w-[500px] shrink-0 @max-sm:!w-full',
        },
        content: {},
        children: [
            makeLogo(),
            {
                id: uid(),
                type: 'text',
                props: { variant: 'body', align: 'left' },
                content: { text: DEFAULT_CONTENT.description },
            },
            makeNewsletterActions(),
        ],
    }
}

/**
 * Subscribe section: heading + optional description + form.
 * Used by Footer 3, 10 (right side, w-400).
 */
export function makeSubscribeSection(withDescription = true): Block {
    const children: Block[] = [
        {
            id: uid(),
            type: 'text',
            props: { variant: 'body', align: 'left', bold: true },
            content: { text: DEFAULT_CONTENT.subscribeHeading },
        },
    ]
    if (withDescription) {
        children.push({
            id: uid(),
            type: 'text',
            props: { variant: 'body', align: 'left' },
            content: { text: DEFAULT_CONTENT.subscribeBody },
        })
    }
    children.push(makeNewsletterActions())

    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: 'w-[400px] shrink-0 @max-sm:!w-full',
        },
        content: {},
        children,
    }
}

/**
 * Subscribe section heading-only + form (no desc, full-width).
 * Used by Footer 8 (right side).
 */
export function makeSubscribeSectionCompact(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: 'w-[400px] shrink-0 @max-sm:!w-full',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'text',
                props: { variant: 'body', align: 'left', bold: true },
                content: { text: DEFAULT_CONTENT.subscribeHeading },
            },
            makeNewsletterActions(),
        ],
    }
}

// ============================================
// Contact info
// ============================================

/**
 * Contact info block: address + phone + email.
 * Used by Footer 6, 12, 16.
 */
export function makeContactInfo(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 8,
            sizing: { width: 'fill' },
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'text',
                props: { variant: 'small', align: 'left' },
                content: { text: DEFAULT_CONTENT.addressText },
            },
            {
                id: uid(),
                type: 'text',
                props: { variant: 'small', align: 'left' },
                content: { text: DEFAULT_CONTENT.phoneText },
            },
            {
                id: uid(),
                type: 'text',
                props: { variant: 'small', align: 'left', className: 'underline' },
                content: { text: DEFAULT_CONTENT.emailText },
            },
        ],
    }
}

/**
 * Contact column: logo + contact info + social icons.
 * Used by Footer 6, 12, 16.
 */
export function makeContactColumn(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: 'max-w-[400px] @max-sm:!max-w-full',
        },
        content: {},
        children: [makeLogo(), makeContactInfo(), makeSocialIcons()],
    }
}

// ============================================
// CTA section (for Footer 9, 14, 15)
// ============================================

/** H1 CTA heading (Raleway, large) */
export function makeCtaHeading(): Block {
    return {
        id: uid(),
        type: 'heading',
        props: { level: 1, align: 'left' },
        content: { text: DEFAULT_CONTENT.ctaHeading },
    }
}

/** CTA body text */
export function makeCtaBody(): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'body-large', align: 'left' },
        content: { text: DEFAULT_CONTENT.ctaBody },
    }
}

/** Two CTA buttons (primary + secondary) */
export function makeCtaButtons(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 16,
            className: 'items-center @max-sm:!flex-col @max-sm:!w-full',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'button',
                props: { variant: 'primary', size: 'md' },
                content: { text: 'Get Started' },
            },
            {
                id: uid(),
                type: 'button',
                props: { variant: 'secondary', size: 'md' },
                content: { text: 'Learn More' },
            },
        ],
    }
}

/**
 * CTA section: heading + description + 2 buttons.
 * Used by Footer 9, 14, 15.
 */
export function makeCtaSection(maxWidth = 560): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: `max-w-[${maxWidth}px] @max-sm:!max-w-full @max-sm:!gap-6`,
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'vertical',
                    gap: 24,
                    sizing: { width: 'fill' },
                    className: '@max-sm:!gap-5',
                },
                content: {},
                children: [makeCtaHeading(), makeCtaBody()],
            },
            makeCtaButtons(),
        ],
    }
}

// ============================================
// Avatar stack
// ============================================

/**
 * Avatar stack: 5 overlapping circular images.
 * Used by Footer 9, 14 credits area.
 */
export function makeAvatarStack(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            className: 'items-center -space-x-3',
        },
        content: {},
        children: Array.from({ length: 5 }, () => ({
            id: uid(),
            type: 'avatar' as const,
            props: { size: 'md' },
            content: {},
        })),
    }
}

// ============================================
// Big brand logo image
// ============================================

/**
 * Full-width brand logo image in credits area.
 * Used by Footer 2, 16, 17.
 */
export function makeBigLogoImage(): Block {
    return {
        id: uid(),
        type: 'image',
        props: {
            aspectRatio: '1280/174',
            sizing: { width: 'fill' },
            className: 'w-full',
        },
        content: { alt: 'Company logo' },
    }
}

// ============================================
// Credits / bottom bar elements
// ============================================

/** Horizontal divider line */
export function makeDivider(): Block {
    return {
        id: uid(),
        type: 'divider',
        props: {},
        content: {},
    }
}

/** Copyright text */
export function makeCopyrightText(): Block {
    return {
        id: uid(),
        type: 'text',
        props: { variant: 'small', align: 'left' },
        content: { text: DEFAULT_CONTENT.copyrightText },
    }
}

/** Legal links row: Privacy Policy, Terms of Service, Cookies Settings */
export function makeLegalLinks(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 24,
            className: 'items-start @max-sm:!flex-col @max-sm:!gap-4',
        },
        content: {},
        children: ['Privacy Policy', 'Terms of Service', 'Cookies Settings'].map(
            (text) => ({
                id: uid(),
                type: 'text' as const,
                props: { variant: 'small' as const, align: 'left' as const, className: 'underline' },
                content: { text },
            })
        ),
    }
}

// ============================================
// Pre-composed credits bar variants
// ============================================

/**
 * Standard credits: divider → copyright (left) + legal links (right).
 * Used by Footer 1, 7, 8 (variations).
 */
export function makeCreditsStandard(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [
            makeDivider(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    sizing: { width: 'fill' },
                    className: 'justify-between items-start @max-sm:!flex-col @max-sm:!gap-8',
                },
                content: {},
                children: [makeCopyrightText(), makeLegalLinks()],
            },
        ],
    }
}

/**
 * Credits with social icons: divider → (copyright + legal) left + social right.
 * Used by Footer 3, 4, 10 (credit bars with social).
 */
export function makeCreditsWithSocial(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [
            makeDivider(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    sizing: { width: 'fill' },
                    className: 'justify-between items-center @max-sm:!flex-col @max-sm:!gap-8 @max-sm:!items-start',
                },
                content: {},
                children: [
                    {
                        id: uid(),
                        type: 'frame',
                        props: {
                            direction: 'horizontal',
                            gap: 24,
                            className: 'items-center @max-sm:!flex-col @max-sm:!gap-4 @max-sm:!items-start',
                        },
                        content: {},
                        children: [makeCopyrightText(), makeLegalLinks()],
                    },
                    makeSocialIcons(),
                ],
            },
        ],
    }
}

/**
 * Credits with avatar stack + social: logo+avatars → divider → copyright+social.
 * Used by Footer 9, 14.
 */
export function makeCreditsWithAvatars(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    sizing: { width: 'fill' },
                    className: 'justify-between items-center @max-sm:!flex-col @max-sm:!gap-6 @max-sm:!items-start',
                },
                content: {},
                children: [makeLogo(), makeAvatarStack()],
            },
            makeDivider(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    sizing: { width: 'fill' },
                    className: 'justify-between items-center @max-sm:!flex-col @max-sm:!gap-6 @max-sm:!items-start',
                },
                content: {},
                children: [makeCopyrightText(), makeSocialIcons()],
            },
        ],
    }
}

/**
 * Credits with big logo image: big logo → divider → copyright + legal links.
 * Used by Footer 2, 16, 17.
 */
export function makeCreditsWithBigLogo(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 48,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-8',
        },
        content: {},
        children: [
            makeBigLogoImage(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'vertical',
                    gap: 32,
                    sizing: { width: 'fill' },
                    className: '@max-sm:!gap-6',
                },
                content: {},
                children: [
                    makeDivider(),
                    {
                        id: uid(),
                        type: 'frame',
                        props: {
                            direction: 'horizontal',
                            sizing: { width: 'fill' },
                            className: 'justify-between items-start @max-sm:!flex-col @max-sm:!gap-8',
                        },
                        content: {},
                        children: [makeCopyrightText(), makeLegalLinks()],
                    },
                ],
            },
        ],
    }
}

/**
 * Card-outside credits: copyright (left) + legal links (right), no divider.
 * Used by Footer 10, 11, 12, 15 (after card wrapper).
 */
export function makeCreditsCardOutside(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between items-start @max-sm:!flex-col @max-sm:!gap-4',
        },
        content: {},
        children: [makeCopyrightText(), makeLegalLinks()],
    }
}

/**
 * Card-outside credits with social: (copyright + legal) left + social right.
 * Used by Footer 10 (after card).
 */
export function makeCreditsCardOutsideWithSocial(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between items-center @max-sm:!flex-col @max-sm:!gap-6 @max-sm:!items-start',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 24,
                    className: 'items-center @max-sm:!flex-col @max-sm:!gap-4 @max-sm:!items-start',
                },
                content: {},
                children: [makeCopyrightText(), makeLegalLinks()],
            },
            makeSocialIcons(),
        ],
    }
}

/**
 * Minimal credits: divider → logo (left) + copyright (right).
 * Used by Footer 5.
 */
export function makeCreditsMinimal(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [
            makeDivider(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    sizing: { width: 'fill' },
                    className: 'justify-between items-center @max-sm:!flex-col @max-sm:!gap-4 @max-sm:!items-start',
                },
                content: {},
                children: [makeLogo(), makeCopyrightText()],
            },
        ],
    }
}

/**
 * Credits reversed: divider → legal links (left) + copyright (right).
 * Used by Footer 7, 8.
 */
export function makeCreditsReversed(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [
            makeDivider(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    sizing: { width: 'fill' },
                    className: 'justify-between items-start @max-sm:!flex-col-reverse @max-sm:!gap-8',
                },
                content: {},
                children: [makeLegalLinks(), makeCopyrightText()],
            },
        ],
    }
}

/**
 * Credits: divider → copyright + legal (left-aligned together).
 * Used by Footer 6, 12 variant.
 */
export function makeCreditsLeftAligned(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [
            makeDivider(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 24,
                    sizing: { width: 'fill' },
                    className: 'items-center flex-wrap @max-sm:!flex-col @max-sm:!gap-4 @max-sm:!items-start',
                },
                content: {},
                children: [makeCopyrightText(), makeLegalLinks()],
            },
        ],
    }
}
