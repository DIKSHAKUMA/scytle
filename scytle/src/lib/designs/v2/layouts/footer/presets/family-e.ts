/**
 * Footer Family E — Block Factories & Preset Configs
 *
 * 9 standalone presets with no control axes:
 *   Footer 2  — Logo + 5 inline links + Newsletter + Big logo image credits
 *   Footer 4  — Newsletter top row → Logo + 4 titled columns
 *   Footer 5  — Newsletter top → Divider → 4 titled columns, minimal credits
 *   Footer 7  — Centered: Logo → horizontal links → credits (most minimal)
 *   Footer 8  — Logo + flat links (left) + Newsletter (right), compact
 *   Footer 13 — Single row: Logo | flat links | Social icons
 *   Footer 14 — CTA heading + 6 titled columns, avatar stack (largest)
 *   Footer 16 — Contact left + 2 links + Big logo image credits
 *   Footer 17 — Newsletter left + 3 columns (incl Follow Us) + Big logo image credits
 */

import type { Block } from '../../../blocks/types'
import type { FooterPresetConfig } from '../types'
import {
    uid, resetUid,
    makeLogo,
    makeLinkColumn,
    makeHeadinglessLinkColumn,
    makeInlineLinkRow,
    makeSocialIcons,
    makeSocialColumn,
    makeNewsletterWithLogo,
    makeSubscribeSection,
    makeSubscribeSectionCompact,
    makeContactColumn,
    makeCtaSection,
    makeDivider,
    makeCreditsWithBigLogo,
    makeCreditsMinimal,
    makeCreditsReversed,
    makeCreditsWithSocial,
    makeCreditsWithAvatars,
    makeCreditsStandard,
} from './shared-builders'

// ============================================
// Footer 2 — Logo + 5 inline links + Newsletter + Big logo credits
// Layout: Content(logo+inline-links left | subscribe right) → Credits(big-logo+divider+legal+copyright)
// ============================================

function buildFooter2(): Block[] {
    // Left: logo + 5 inline links
    const leftCol: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'flex-1 @max-sm:!gap-6',
        },
        content: {},
        children: [makeLogo(), makeInlineLinkRow()],
    }

    const contentArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between @max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [leftCol, makeSubscribeSection(false)],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 48,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-10',
        },
        content: {},
        children: [contentArea, makeCreditsWithBigLogo()],
    }]
}

// ============================================
// Footer 4 — Newsletter top row → Logo + 4 titled columns
// Layout: Newsletter-row(full-width) → Content(logo+4cols) → Credits(divider+copyright+legal+social)
// ============================================

function buildFooter4(): Block[] {
    // Newsletter row (full-width, same as subscribe section but wider)
    const newsletterRow: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between @max-sm:!flex-col @max-sm:!gap-8',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'vertical',
                    gap: 16,
                    sizing: { width: 'fill' },
                    className: 'flex-1',
                },
                content: {},
                children: [
                    {
                        id: uid(),
                        type: 'text',
                        props: { variant: 'body', align: 'left', bold: true },
                        content: { text: 'Subscribe' },
                    },
                    {
                        id: uid(),
                        type: 'text',
                        props: { variant: 'body', align: 'left' },
                        content: { text: 'Join our newsletter to stay up to date on features and releases.' },
                    },
                ],
            },
            makeSubscribeSectionCompact(),
        ],
    }

    // Links area: logo + 4 titled columns
    const linksArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 40,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-10',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'vertical',
                    sizing: { width: 'fill' },
                    className: 'flex-1',
                },
                content: {},
                children: [makeLogo()],
            },
            makeLinkColumn('Column One'),
            makeLinkColumn('Column Two'),
            makeLinkColumn('Column Three'),
            makeLinkColumn('Column Four'),
        ],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [newsletterRow, linksArea, makeCreditsWithSocial()],
    }]
}

// ============================================
// Footer 5 — Newsletter top → Divider → 4 titled columns, minimal credits
// Layout: Newsletter-row → Divider → 4-cols → Credits(divider+logo+copyright)
// ============================================

function buildFooter5(): Block[] {
    const newsletterRow: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between @max-sm:!flex-col @max-sm:!gap-8',
        },
        content: {},
        children: [
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'vertical',
                    gap: 16,
                    sizing: { width: 'fill' },
                    className: 'flex-1',
                },
                content: {},
                children: [
                    {
                        id: uid(),
                        type: 'text',
                        props: { variant: 'body', align: 'left', bold: true },
                        content: { text: 'Subscribe' },
                    },
                    {
                        id: uid(),
                        type: 'text',
                        props: { variant: 'body', align: 'left' },
                        content: { text: 'Join our newsletter to stay up to date on features and releases.' },
                    },
                ],
            },
            makeSubscribeSectionCompact(),
        ],
    }

    const linksArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 40,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-10',
        },
        content: {},
        children: [
            makeLinkColumn('Column One'),
            makeLinkColumn('Column Two'),
            makeLinkColumn('Column Three'),
            makeLinkColumn('Column Four'),
        ],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [newsletterRow, makeDivider(), linksArea, makeCreditsMinimal()],
    }]
}

// ============================================
// Footer 7 — Centered: Logo → horizontal links → credits (most minimal)
// ============================================

function buildFooter7(): Block[] {
    const contentArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            maxWidth: 480,
            className: 'items-center mx-auto @max-sm:!gap-6',
        },
        content: {},
        children: [makeLogo(), makeInlineLinkRow()],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: 'items-center @max-sm:!gap-12',
        },
        content: {},
        children: [contentArea, makeCreditsReversed()],
    }]
}

// ============================================
// Footer 8 — Logo + flat links (left) + Newsletter (right), compact
// ============================================

function buildFooter8(): Block[] {
    const leftCol: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'flex-1 @max-sm:!gap-6',
        },
        content: {},
        children: [makeLogo(), makeInlineLinkRow()],
    }

    const contentArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between @max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [leftCol, makeSubscribeSectionCompact()],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [contentArea, makeCreditsReversed()],
    }]
}

// ============================================
// Footer 13 — Single row: Logo | flat links | Social icons
// ============================================

function buildFooter13(): Block[] {
    const contentArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between items-center @max-sm:!flex-col @max-sm:!gap-8 @max-sm:!items-start',
        },
        content: {},
        children: [
            makeLogo(),
            makeInlineLinkRow(),
            makeSocialIcons(),
        ],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [contentArea, makeCreditsStandard()],
    }]
}

// ============================================
// Footer 14 — CTA heading + 6 titled columns, avatar stack (largest)
// Layout: CTA(heading+buttons) → Divider → 6-columns → Credits(logo+avatars+divider+copyright+social)
// ============================================

function buildFooter14(): Block[] {
    // CTA area (left-aligned, full-width)
    const ctaArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            sizing: { width: 'fill' },
            className: 'justify-between @max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [makeCtaSection(768)],
    }

    // 6 titled link columns
    const columnsArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 32,
            sizing: { width: 'fill' },
            className: 'flex-wrap @max-sm:!flex-col @max-sm:!gap-10',
        },
        content: {},
        children: [
            makeLinkColumn('Column One'),
            makeLinkColumn('Column Two'),
            makeLinkColumn('Column Three'),
            makeLinkColumn('Column Four'),
            makeLinkColumn('Column Five'),
            makeLinkColumn('Column Six'),
        ],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 80,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-12',
        },
        content: {},
        children: [ctaArea, makeDivider(), columnsArea, makeCreditsWithAvatars()],
    }]
}

// ============================================
// Footer 16 — Contact left + 2 links + Big logo image credits
// Layout: Contact(logo+address+phone+email+social, left) + Links(2 headingless, right) → Credits(big-logo+divider+copyright+legal)
// ============================================

function buildFooter16(): Block[] {
    const contentArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 64,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [
            makeContactColumn(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 32,
                    sizing: { width: 'fill' },
                    className: 'max-w-[400px] @max-sm:!max-w-full @max-sm:!flex-col @max-sm:!gap-10',
                },
                content: {},
                children: [
                    makeHeadinglessLinkColumn(0),
                    makeHeadinglessLinkColumn(5),
                ],
            },
        ],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 64,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-10',
        },
        content: {},
        children: [contentArea, makeCreditsWithBigLogo()],
    }]
}

// ============================================
// Footer 17 — Newsletter left + 3 columns (incl Follow Us) + Big logo image credits
// Layout: Newsletter(logo+desc+form, left) + Links(2cols+FollowUs, right) → Credits(big-logo+divider+copyright+legal)
// ============================================

function buildFooter17(): Block[] {
    const contentArea: Block = {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 128,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-12',
        },
        content: {},
        children: [
            makeNewsletterWithLogo(),
            {
                id: uid(),
                type: 'frame',
                props: {
                    direction: 'horizontal',
                    gap: 40,
                    sizing: { width: 'fill' },
                    className: 'flex-1 @max-sm:!flex-col @max-sm:!gap-10',
                },
                content: {},
                children: [
                    makeLinkColumn('Column One'),
                    makeLinkColumn('Column Two'),
                    makeSocialColumn(),
                ],
            },
        ],
    }

    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 48,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-10',
        },
        content: {},
        children: [contentArea, makeCreditsWithBigLogo()],
    }]
}

// ============================================
// Block Factories
// ============================================

export function buildFooter2Blocks(): Block[] { resetUid(); return buildFooter2() }
export function buildFooter4Blocks(): Block[] { resetUid(); return buildFooter4() }
export function buildFooter5Blocks(): Block[] { resetUid(); return buildFooter5() }
export function buildFooter7Blocks(): Block[] { resetUid(); return buildFooter7() }
export function buildFooter8Blocks(): Block[] { resetUid(); return buildFooter8() }
export function buildFooter13Blocks(): Block[] { resetUid(); return buildFooter13() }
export function buildFooter14Blocks(): Block[] { resetUid(); return buildFooter14() }
export function buildFooter16Blocks(): Block[] { resetUid(); return buildFooter16() }
export function buildFooter17Blocks(): Block[] { resetUid(); return buildFooter17() }

// ============================================
// Preset Configs
// ============================================

const FOOTER_2_CONFIG: FooterPresetConfig = {
    id: 'footer-2', name: 'Footer 2', family: 'e',
    description: 'Logo + inline links with newsletter, large brand logo image in credits',
    tags: ['footer', 'newsletter', 'inline-links', 'brand-logo'],
    shell: 'container',
    axes: {},
}

const FOOTER_4_CONFIG: FooterPresetConfig = {
    id: 'footer-4', name: 'Footer 4', family: 'e',
    description: 'Newsletter top row with 4 titled columns and social in credits',
    tags: ['footer', 'newsletter', 'columns', 'social'],
    shell: 'container',
    axes: {},
}

const FOOTER_5_CONFIG: FooterPresetConfig = {
    id: 'footer-5', name: 'Footer 5', family: 'e',
    description: 'Newsletter top with divider, 4 columns, minimal credits with logo',
    tags: ['footer', 'newsletter', 'columns', 'minimal'],
    shell: 'container',
    axes: {},
}

const FOOTER_7_CONFIG: FooterPresetConfig = {
    id: 'footer-7', name: 'Footer 7', family: 'e',
    description: 'Most minimal — centered logo with horizontal link row',
    tags: ['footer', 'minimal', 'centered', 'compact'],
    shell: 'container',
    axes: {},
}

const FOOTER_8_CONFIG: FooterPresetConfig = {
    id: 'footer-8', name: 'Footer 8', family: 'e',
    description: 'Compact 2-pane: logo + flat links left, subscribe form right',
    tags: ['footer', 'newsletter', 'compact', 'inline-links'],
    shell: 'container',
    axes: {},
}

const FOOTER_13_CONFIG: FooterPresetConfig = {
    id: 'footer-13', name: 'Footer 13', family: 'e',
    description: 'Single-row layout: logo, inline links, social icons',
    tags: ['footer', 'compact', 'social', 'inline-links'],
    shell: 'container',
    axes: {},
}

const FOOTER_14_CONFIG: FooterPresetConfig = {
    id: 'footer-14', name: 'Footer 14', family: 'e',
    description: 'Largest footer: CTA heading + 6 titled columns with avatar stack',
    tags: ['footer', 'cta', 'columns', 'avatars', 'large'],
    shell: 'container',
    axes: {},
}

const FOOTER_16_CONFIG: FooterPresetConfig = {
    id: 'footer-16', name: 'Footer 16', family: 'e',
    description: 'Contact info left + headingless links, large brand logo in credits',
    tags: ['footer', 'contact', 'brand-logo'],
    shell: 'container',
    axes: {},
}

const FOOTER_17_CONFIG: FooterPresetConfig = {
    id: 'footer-17', name: 'Footer 17', family: 'e',
    description: 'Newsletter left + 3 columns with Follow Us, large brand logo in credits',
    tags: ['footer', 'newsletter', 'social', 'columns', 'brand-logo'],
    shell: 'container',
    axes: {},
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_E_PRESETS: FooterPresetConfig[] = [
    FOOTER_2_CONFIG, FOOTER_4_CONFIG, FOOTER_5_CONFIG,
    FOOTER_7_CONFIG, FOOTER_8_CONFIG, FOOTER_13_CONFIG,
    FOOTER_14_CONFIG, FOOTER_16_CONFIG, FOOTER_17_CONFIG,
]

export const FAMILY_E_PRESETS_MAP: Record<string, FooterPresetConfig> = Object.fromEntries(
    FAMILY_E_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_E_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'footer-2': buildFooter2Blocks,
    'footer-4': buildFooter4Blocks,
    'footer-5': buildFooter5Blocks,
    'footer-7': buildFooter7Blocks,
    'footer-8': buildFooter8Blocks,
    'footer-13': buildFooter13Blocks,
    'footer-14': buildFooter14Blocks,
    'footer-16': buildFooter16Blocks,
    'footer-17': buildFooter17Blocks,
}
