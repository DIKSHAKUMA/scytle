/**
 * HeroSection — Composable hero layout component (V2 Nested Frame Block Tree)
 *
 * Single component that renders all 27 hero variations.
 * Axes: alignment (left|split|center) × background (dark|neutral|image) × actions (buttons|form|none)
 *
 * buildHeroBlocks() returns a NESTED FRAME BLOCK TREE — every structural
 * wrapper div is a `frame` block with `children`. The layout component
 * simply walks the tree via RenderBlock. Every container is hoverable,
 * selectable, and draggable on the canvas.
 *
 * Reads --sg-* CSS custom properties for theming via TokenProvider.
 * BackgroundLayer overrides surface-specific tokens (text/button colors)
 * for dark and image backgrounds so blocks render correctly on any surface.
 */

'use client'

import { useMemo, useEffect } from 'react'
import type { HeroAlignment, HeroBackground, HeroActions, HeroContent } from './types'
import { DEFAULT_HERO_CONTENT } from './types'
import { RenderBlock } from '../../blocks'
import type { Block } from '../../blocks/types'
import { useSelectionStore } from '@/store/selection-store'

// ============================================
// Props
// ============================================

export interface HeroSectionProps {
    sectionId: string
    alignment: HeroAlignment
    background: HeroBackground
    actions: HeroActions
    content?: Partial<HeroContent>
    /** Externally-stored blocks (from unified store) — overrides derived blocks */
    blocks?: Block[]
    className?: string
}

// ============================================
// Block Factory — Nested Frame Block Tree
// ============================================

/**
 * Build a nested frame block tree for a hero section.
 * Every structural container is a `frame` block with `children`.
 * Block IDs are deterministic (sectionId + role) for stable selection.
 */
export function buildHeroBlocks(
    sectionId: string,
    content: HeroContent,
    alignment: HeroAlignment,
    actions: HeroActions,
): Block[] {
    const align = alignment === 'center' ? 'center' as const : 'left' as const
    const cross = alignment === 'center' ? 'center' as const : 'start' as const

    // ── Leaf content blocks ──
    const taglineBlock: Block | null = (actions !== 'none' && content.tagline) ? {
        id: `${sectionId}--tagline`, type: 'text',
        props: { variant: 'small', align }, content: { text: content.tagline },
    } : null

    const headingBlock: Block = {
        id: `${sectionId}--heading`, type: 'heading',
        props: { level: 1, align }, content: { text: content.heading },
    }

    const descriptionBlock: Block = {
        id: `${sectionId}--description`, type: 'text',
        props: { variant: 'body-large', align }, content: { text: content.description },
    }

    // ── Build action blocks ──
    const actionChildren: Block[] = []

    if (actions === 'buttons') {
        actionChildren.push({
            id: `${sectionId}--buttons`, type: 'button-group',
            props: { align, gap: 16 }, content: {},
            children: [
                { id: `${sectionId}--btn-primary`, type: 'button', props: { variant: 'primary', size: 'lg' }, content: { text: content.primaryButtonText ?? 'Button' } },
                { id: `${sectionId}--btn-secondary`, type: 'button', props: { variant: 'secondary', size: 'lg' }, content: { text: content.secondaryButtonText ?? 'Button' } },
            ],
        })
    } else if (actions === 'form') {
        actionChildren.push({
            id: `${sectionId}--form-row`, type: 'frame',
            props: { direction: 'vertical' as const, gap: 16, sizing: { width: 'fill' as const }, maxWidth: 513, className: '' },
            content: { label: 'Form' },
            children: [
                {
                    id: `${sectionId}--form-inputs`, type: 'frame',
                    props: { direction: 'horizontal' as const, gap: 16, sizing: { width: 'fill' as const }, className: '@max-sm:flex-col' },
                    content: { label: 'Input Row' },
                    children: [
                        { id: `${sectionId}--input`, type: 'input', props: { fieldType: 'email', required: false, showLabel: false, layoutClassName: 'flex-1 min-w-0' }, content: { placeholder: content.inputPlaceholder ?? 'Enter your email' } },
                        { id: `${sectionId}--submit`, type: 'button', props: { variant: 'primary', size: 'lg', layoutClassName: 'shrink-0 @max-sm:w-full' }, content: { text: content.submitButtonText ?? 'Sign up' } },
                    ],
                },
                { id: `${sectionId}--terms`, type: 'text', props: { variant: 'caption', align }, content: { text: content.termsText ?? '' } },
            ],
        })
    }

    // ── Compose per alignment ──

    if (alignment === 'left') {
        // Single column, left-aligned, max 768px inner content
        const titleChildren: Block[] = [
            ...(taglineBlock ? [taglineBlock] : []),
            {
                id: `${sectionId}--title-text`, type: 'frame',
                props: { direction: 'vertical' as const, gap: 20, sizing: { width: 'fill' as const }, alignment: { cross: 'start' as const } },
                content: { label: 'Title' },
                children: [headingBlock, descriptionBlock],
            },
        ]

        return [{
            id: `${sectionId}--root`, type: 'frame',
            props: { direction: 'vertical' as const, sizing: { width: 'fill' as const }, maxWidth: 1280, className: 'relative z-10' },
            content: { label: 'Hero Container' },
            children: [{
                id: `${sectionId}--content`, type: 'frame',
                props: { direction: 'vertical' as const, gap: 24, sizing: { width: 'fill' as const }, maxWidth: 768, alignment: { cross: 'start' as const }, className: '@max-sm:gap-5' },
                content: { label: 'Content' },
                children: [
                    {
                        id: `${sectionId}--title-group`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 16, sizing: { width: 'fill' as const }, alignment: { cross: 'start' as const } },
                        content: { label: 'Title Group' },
                        children: titleChildren,
                    },
                    ...actionChildren,
                ],
            }],
        }]
    }

    if (alignment === 'split') {
        // Two columns: left = tagline+heading, right = description+actions
        const leftChildren: Block[] = [
            ...(taglineBlock ? [taglineBlock] : []),
            headingBlock,
        ]

        const rightChildren: Block[] = [
            descriptionBlock,
            ...actionChildren,
        ]

        return [{
            id: `${sectionId}--root`, type: 'frame',
            props: { direction: 'vertical' as const, sizing: { width: 'fill' as const }, maxWidth: 1280, className: 'relative z-10' },
            content: { label: 'Hero Container' },
            children: [{
                id: `${sectionId}--columns`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 80, sizing: { width: 'fill' as const }, alignment: { cross: 'start' as const }, className: '@max-lg:gap-12 @max-md:flex-col @max-md:gap-6' },
                content: { label: 'Columns' },
                children: [
                    {
                        id: `${sectionId}--col-left`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 16, alignment: { cross: 'start' as const }, layoutClassName: 'flex-1 min-w-0' },
                        content: { label: 'Left Column' },
                        children: leftChildren,
                    },
                    {
                        id: `${sectionId}--col-right`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 24, alignment: { cross: 'start' as const }, layoutClassName: 'flex-1 min-w-0' },
                        content: { label: 'Right Column' },
                        children: rightChildren,
                    },
                ],
            }],
        }]
    }

    // alignment === 'center'
    const titleChildren: Block[] = [
        ...(taglineBlock ? [taglineBlock] : []),
        {
            id: `${sectionId}--title-text`, type: 'frame',
            props: { direction: 'vertical' as const, gap: 20, sizing: { width: 'fill' as const }, alignment: { cross: 'center' as const } },
            content: { label: 'Title' },
            children: [headingBlock, descriptionBlock],
        },
    ]

    return [{
        id: `${sectionId}--root`, type: 'frame',
        props: { direction: 'vertical' as const, sizing: { width: 'fill' as const }, maxWidth: 1280, alignment: { cross: 'center' as const }, className: 'relative z-10' },
        content: { label: 'Hero Container' },
        children: [{
            id: `${sectionId}--content`, type: 'frame',
            props: { direction: 'vertical' as const, gap: 24, sizing: { width: 'fill' as const }, maxWidth: 768, alignment: { cross: 'center' as const }, className: '@max-sm:gap-5' },
            content: { label: 'Content' },
            children: [
                {
                    id: `${sectionId}--title-group`, type: 'frame',
                    props: { direction: 'vertical' as const, gap: 16, sizing: { width: 'fill' as const }, alignment: { cross: 'center' as const } },
                    content: { label: 'Title Group' },
                    children: titleChildren,
                },
                ...actionChildren,
            ],
        }],
    }]
}

// ============================================
// Surface-aware CSS variable overrides
// ============================================

/**
 * Returns CSS custom property overrides for the section's background.
 * Dark/image surfaces override text and button tokens so blocks
 * render light-on-dark. Neutral surfaces keep inherited token values.
 */
function getSurfaceVars(background: HeroBackground): Record<string, string> {
    if (background === 'dark' || background === 'image') {
        return {
            '--sg-text-primary': '#ffffff',
            '--sg-text-secondary': 'rgba(255,255,255,0.9)',
            '--sg-text-muted': 'rgba(255,255,255,0.7)',
            '--sg-button-primary-bg': '#ffffff',
            '--sg-button-primary-text': 'var(--sg-bg-primary, #1a1a1a)',
            '--sg-button-secondary-bg': 'transparent',
            '--sg-button-secondary-text': '#ffffff',
            '--sg-button-secondary-border': 'rgba(255,255,255,0.2)',
            '--sg-card-border': 'rgba(255,255,255,0.6)',
            '--sg-card-bg': 'transparent',
        }
    }
    return {}
}

// ============================================
// Background wrapper
// ============================================

function BackgroundLayer({ background, children, className }: {
    background: HeroBackground
    children: React.ReactNode
    className?: string
}) {
    const bgClass =
        background === 'dark'
            ? 'bg-[var(--sg-bg-primary,#1a1a1a)]'
            : background === 'neutral'
                ? 'bg-[var(--sg-bg-secondary,#f5f5f5)]'
                : ''

    return (
        <section
            className={`@container relative flex flex-col items-center w-full overflow-hidden px-[clamp(1rem,5vw,4rem)] py-[clamp(3rem,8vw,7rem)] ${bgClass} ${className ?? ''}`}
            style={getSurfaceVars(background) as React.CSSProperties}
            data-layout-type="hero"
        >
            {background === 'image' && (
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-(--sg-bg-secondary,#f5f5f5)" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}
            {children}
        </section>
    )
}

// ============================================
// Main Component — Just walks the block tree
// ============================================

export function HeroSection({
    sectionId,
    alignment,
    background,
    actions,
    content: contentOverrides,
    blocks: externalBlocks,
    className,
}: HeroSectionProps) {
    const content: HeroContent = {
        ...DEFAULT_HERO_CONTENT,
        ...contentOverrides,
    }

    // Build nested frame block tree — memoized for stable selection
    const derivedBlocks = useMemo(
        () => buildHeroBlocks(sectionId, content, alignment, actions),
        [sectionId, content, alignment, actions],
    )

    // Use stored blocks if available, fallback to derived
    const blocks = externalBlocks ?? derivedBlocks

    // Register blocks with selection store when this section is entered
    const selSectionId = useSelectionStore((s) => s.sectionId)
    const selMode = useSelectionStore((s) => s.mode)
    const setCurrentBlocks = useSelectionStore((s) => s.setCurrentBlocks)

    useEffect(() => {
        if (selSectionId === sectionId && (selMode === 'entered' || selMode === 'block-selected')) {
            setCurrentBlocks(blocks)
        }
    }, [selSectionId, sectionId, selMode, blocks, setCurrentBlocks])

    return (
        <BackgroundLayer background={background} className={className}>
            {blocks.map(block => (
                <RenderBlock key={block.id} block={block} />
            ))}
        </BackgroundLayer>
    )
}
