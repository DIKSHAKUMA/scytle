/**
 * GallerySection — Composable gallery layout component (V2 Nested Frame Block Tree)
 *
 * Single component that renders all 27 gallery variations.
 * buildGalleryBlocks() returns a NESTED FRAME BLOCK TREE — every structural
 * wrapper div is a `frame` block with `children`. The layout component
 * simply walks the tree via RenderBlock.
 *
 * Structural chrome (slider arrows, dots) uses the FrameBlock `_chrome` system
 * rather than being hardcoded JSX.
 *
 * Uses desktop-first approach:
 *   - Default = desktop layout
 *   - @max-sm: overrides for mobile viewport (375px)
 *
 * Reads --sg-* CSS custom properties for theming via TokenProvider.
 */

'use client'

import { useMemo, useEffect } from 'react'
import type { GalleryContent } from './types'
import { DEFAULT_GALLERY_CONTENT } from './types'
import { RenderBlock } from '../../blocks'
import type { Block } from '../../blocks/types'
import { useSelectionStore } from '@/store/selection-store'

// ============================================
// Props
// ============================================

export interface GallerySectionProps {
    sectionId: string
    variant: number
    content?: Partial<GalleryContent>
    /** Externally-stored blocks (from unified store) — overrides derived blocks */
    blocks?: Block[]
    className?: string
}

// ============================================
// Block helpers
// ============================================

/** Build heading block */
function mkHeading(sid: string, content: GalleryContent): Block {
    return { id: `${sid}--heading`, type: 'heading', props: { level: 2, align: 'center' }, content: { text: content.heading } }
}

/** Build description block */
function mkDesc(sid: string, content: GalleryContent): Block {
    return { id: `${sid}--description`, type: 'text', props: { variant: 'body-large', align: 'center' }, content: { text: content.description } }
}

/** Build image block */
function mkImg(sid: string, i: number, ratio: string = '1:1'): Block {
    return { id: `${sid}--img-${i}`, type: 'image', props: { ratio, shape: 'rectangle', position: 'center', fillMode: 'cover' }, content: { alt: `Gallery image ${i + 1}` } }
}

/** Build image block with layoutClassName */
function mkImgL(sid: string, i: number, layoutCls: string, ratio: string = '1:1'): Block {
    return { id: `${sid}--img-${i}`, type: 'image', props: { ratio, shape: 'rectangle', position: 'center', fillMode: 'cover', layoutClassName: layoutCls }, content: { alt: `Gallery image ${i + 1}` } }
}

/** Build the section title frame (heading + description centered) */
function titleFrame(sid: string, content: GalleryContent): Block {
    return {
        id: `${sid}--title`, type: 'frame',
        props: { direction: 'vertical' as const, gap: 24, alignment: { cross: 'center' as const }, sizing: { width: 'fill' as const }, maxWidth: 768, className: 'mx-auto text-center @max-sm:gap-5' },
        content: { label: 'Section Title' },
        children: [mkHeading(sid, content), mkDesc(sid, content)],
    }
}

/** Convenience: wrap in the standard gallery outer frame (max 1280, centered, gap-20) */
function outerFrame(sid: string, content: GalleryContent, gridChildren: Block[]): Block[] {
    return [{
        id: `${sid}--root`, type: 'frame',
        props: { direction: 'vertical' as const, gap: 80, alignment: { cross: 'center' as const }, sizing: { width: 'fill' as const }, maxWidth: 1280, className: 'mx-auto @max-sm:gap-12' },
        content: { label: 'Gallery Container' },
        children: [titleFrame(sid, content), ...gridChildren],
    }]
}

/** A frame block that only exists to render chrome (dots, controls-below) */
function chromeFrame(sid: string, suffix: string, chrome: string, cls?: string): Block {
    return { id: `${sid}--${suffix}`, type: 'frame', props: cls ? { className: cls } : {}, content: { _chrome: chrome }, children: [] }
}

// ============================================
// Block Factory — Nested Frame Block Tree
// ============================================

/**
 * Build nested frame block tree for a gallery section.
 * Every structural container is a frame block with children.
 */
export function buildGalleryBlocks(
    sectionId: string,
    content: GalleryContent,
    variant: number,
): Block[] {
    const sid = sectionId

    switch (variant) {
        // ────────────────────────────── Static Grids (1-6) ──────────────────────────────

        case 1: // Single full-width landscape
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { sizing: { width: 'fill' as const } },
                content: { label: 'Image Grid' },
                children: [mkImg(sid, 0, '16:9')],
            }])

        case 2: // 2-col, 1 row
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: '@max-sm:flex-col @max-sm:gap-6' },
                content: { label: 'Image Grid' },
                children: Array.from({ length: 2 }, (_, i) => mkImgL(sid, i, 'flex-1')),
            }])

        case 3: // 3-col, 1 row
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: '@max-sm:flex-col @max-sm:gap-6' },
                content: { label: 'Image Grid' },
                children: Array.from({ length: 3 }, (_, i) => mkImgL(sid, i, 'flex-1')),
            }])

        case 4: // 4-col, 1 row (mobile: 2x2 grid)
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { gap: 32, sizing: { width: 'fill' as const }, className: 'grid grid-cols-4 @max-sm:grid-cols-2 @max-sm:gap-6' },
                content: { label: 'Image Grid' },
                children: Array.from({ length: 4 }, (_, i) => mkImg(sid, i)),
            }])

        case 5: // 3x2 grid (6 images)
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { gap: 32, sizing: { width: 'fill' as const }, className: 'grid grid-cols-3 @max-sm:grid-cols-2 @max-sm:gap-6' },
                content: { label: 'Image Grid' },
                children: Array.from({ length: 6 }, (_, i) => mkImg(sid, i)),
            }])

        case 6: // 4x2 grid (8 images)
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { gap: 32, sizing: { width: 'fill' as const }, className: 'grid grid-cols-4 @max-sm:grid-cols-2 @max-sm:gap-6' },
                content: { label: 'Image Grid' },
                children: Array.from({ length: 8 }, (_, i) => mkImg(sid, i)),
            }])

        // ────────────────────────────── Masonry (7-10) ──────────────────────────────

        case 7: // Tall portrait left + 2 stacked landscape right
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: '@max-sm:flex-col @max-sm:gap-6' },
                content: { label: 'Masonry Grid' },
                children: [
                    mkImgL(sid, 0, 'flex-1', '3:4'),
                    {
                        id: `${sid}--col-r`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 32, layoutClassName: 'flex-1', className: '@max-sm:gap-6' },
                        content: { label: 'Right Column' },
                        children: [mkImg(sid, 1, '16:9'), mkImg(sid, 2, '16:9')],
                    },
                ],
            }])

        case 8: // Cross-staggered 2-col (tall+short, short+tall)
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: '@max-sm:flex-col @max-sm:gap-6' },
                content: { label: 'Masonry Grid' },
                children: [
                    {
                        id: `${sid}--col-l`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 32, layoutClassName: 'flex-1', className: '@max-sm:gap-6' },
                        content: { label: 'Left Column' },
                        children: [mkImg(sid, 0, '3:4'), mkImg(sid, 1, '3:2')],
                    },
                    {
                        id: `${sid}--col-r`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 32, layoutClassName: 'flex-1', className: '@max-sm:gap-6' },
                        content: { label: 'Right Column' },
                        children: [mkImg(sid, 2, '3:2'), mkImg(sid, 3, '3:4')],
                    },
                ],
            }])

        case 9: // 1 large square left + 2×2 grid right
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: '@max-sm:flex-col @max-sm:gap-6' },
                content: { label: 'Masonry Grid' },
                children: [
                    mkImgL(sid, 0, 'flex-1'),
                    {
                        id: `${sid}--col-r`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 32, layoutClassName: 'flex-1', className: '@max-sm:gap-6' },
                        content: { label: 'Right Column' },
                        children: [
                            {
                                id: `${sid}--row-t`, type: 'frame',
                                props: { direction: 'horizontal' as const, gap: 32, className: '@max-sm:gap-6' },
                                content: { label: 'Top Row' },
                                children: [mkImgL(sid, 1, 'flex-1'), mkImgL(sid, 2, 'flex-1')],
                            },
                            {
                                id: `${sid}--row-b`, type: 'frame',
                                props: { direction: 'horizontal' as const, gap: 32, className: '@max-sm:gap-6' },
                                content: { label: 'Bottom Row' },
                                children: [mkImgL(sid, 3, 'flex-1'), mkImgL(sid, 4, 'flex-1')],
                            },
                        ],
                    },
                ],
            }])

        case 10: // 3-col masonry
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: '@max-sm:flex-col @max-sm:gap-6' },
                content: { label: 'Masonry Grid' },
                children: [
                    {
                        id: `${sid}--col-1`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 32, layoutClassName: 'flex-1', className: '@max-sm:gap-6' },
                        content: { label: 'Column 1' },
                        children: [mkImg(sid, 0), mkImg(sid, 1)],
                    },
                    {
                        id: `${sid}--col-2`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 32, layoutClassName: 'flex-1', className: '@max-sm:gap-6' },
                        content: { label: 'Column 2' },
                        children: [mkImg(sid, 2, '16:9'), mkImg(sid, 3, '16:9'), mkImg(sid, 4)],
                    },
                    {
                        id: `${sid}--col-3`, type: 'frame',
                        props: { direction: 'vertical' as const, gap: 32, layoutClassName: 'flex-1', className: '@max-sm:gap-6' },
                        content: { label: 'Column 3' },
                        children: [mkImg(sid, 5), mkImg(sid, 6)],
                    },
                ],
            }])

        // ────────────────────────────── Full-bleed (11-12) ──────────────────────────────

        case 11: // 2-col no gap
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 0, sizing: { width: 'fill' as const }, className: 'overflow-hidden @max-sm:flex-col' },
                content: { label: 'Image Grid' },
                children: Array.from({ length: 2 }, (_, i) => mkImgL(sid, i, 'flex-1')),
            }])

        case 12: // 2×2 no gap
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'vertical' as const, gap: 0, sizing: { width: 'fill' as const }, className: 'overflow-hidden' },
                content: { label: 'Image Grid' },
                children: [
                    {
                        id: `${sid}--row-t`, type: 'frame',
                        props: { direction: 'horizontal' as const, gap: 0, className: '@max-sm:flex-col' },
                        content: { label: 'Top Row' },
                        children: Array.from({ length: 2 }, (_, i) => mkImgL(sid, i, 'flex-1')),
                    },
                    {
                        id: `${sid}--row-b`, type: 'frame',
                        props: { direction: 'horizontal' as const, gap: 0, className: '@max-sm:flex-col' },
                        content: { label: 'Bottom Row' },
                        children: Array.from({ length: 2 }, (_, i) => mkImgL(sid, i + 2, 'flex-1')),
                    },
                ],
            }])

        // ────────────────────────────── Slider Overlaid (13-19) ──────────────────────────────

        case 13: // Full-bleed single + overlaid arrows + dots
        case 14: // Same as 13, contained
            return outerFrame(sid, content, [{
                id: `${sid}--slider`, type: 'frame',
                props: { direction: 'vertical' as const, gap: 32, alignment: { cross: 'center' as const }, sizing: { width: 'fill' as const } },
                content: { label: 'Slider' },
                children: [
                    {
                        id: `${sid}--slide-area`, type: 'frame',
                        props: { sizing: { width: 'fill' as const }, className: 'relative' },
                        content: { label: 'Slide Area', _chrome: 'arrows-inset' },
                        children: [mkImg(sid, 0, '16:9')],
                    },
                    chromeFrame(sid, 'dots', 'dots'),
                ],
            }])

        case 15: // Centered 85% image + edge arrows + dots
            return outerFrame(sid, content, [{
                id: `${sid}--slider`, type: 'frame',
                props: { direction: 'vertical' as const, gap: 32, alignment: { cross: 'center' as const }, sizing: { width: 'fill' as const }, className: 'relative' },
                content: { label: 'Slider' },
                children: [
                    {
                        id: `${sid}--slide-area`, type: 'frame',
                        props: { sizing: { width: 'hug' as const }, className: 'w-[85%] @max-sm:w-full' },
                        content: { label: 'Slide Area' },
                        children: [mkImg(sid, 0, '3:2')],
                    },
                    chromeFrame(sid, 'chrome', 'arrows-edge dots', 'w-full'),
                ],
            }])

        case 16: // 2-col slider + overlaid arrows + dots
        case 17: // 2-col slider + overlaid arrows + dots (variant)
            return buildSliderOverlaid(sid, content, 2)
        case 18: // 3-col slider + overlaid arrows + dots
            return buildSliderOverlaid(sid, content, 3)
        case 19: // 4-col slider + overlaid arrows + dots
            return buildSliderOverlaid(sid, content, 4)

        // ────────────────────────────── Slider Below (20-23) ──────────────────────────────

        case 20: // 1-col landscape slider + controls below
            return buildSliderBelow(sid, content, 1, '16:9')
        case 21: // 2-col slider + controls below
            return buildSliderBelow(sid, content, 2, '1:1')
        case 22: // 3-col slider + controls below
            return buildSliderBelow(sid, content, 3, '1:1')
        case 23: // 4-col slider + controls below
            return buildSliderBelow(sid, content, 4, '1:1')

        // ────────────────────────────── Peek Carousel (24) ──────────────────────────────

        case 24:
            return outerFrame(sid, content, [{
                id: `${sid}--slider`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: 'overflow-hidden @max-sm:gap-6' },
                content: { label: 'Peek Carousel' },
                children: Array.from({ length: 2 }, (_, i) => mkImgL(sid, i, 'w-[87.5%] shrink-0', '16:9')),
            }])

        // ────────────────────────────── Split (25-27) ──────────────────────────────

        case 25:
            return buildSplit(sid, content, 1)
        case 26:
            return buildSplit(sid, content, 2)
        case 27:
            return buildSplit(sid, content, 3)

        // ────────────────────────────── Fallback ──────────────────────────────

        default:
            return outerFrame(sid, content, [{
                id: `${sid}--grid`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: '@max-sm:flex-col @max-sm:gap-6' },
                content: { label: 'Image Grid' },
                children: Array.from({ length: 3 }, (_, i) => mkImgL(sid, i, 'flex-1')),
            }])
    }
}

// ── Parameterized builders ──────────────────────────────────────

function buildSliderOverlaid(sid: string, content: GalleryContent, cols: number): Block[] {
    const images: Block[] = [
        ...Array.from({ length: cols }, (_, i) => mkImgL(sid, i, 'flex-1 shrink-0')),
        mkImgL(sid, cols, 'w-[10%] shrink-0'),  // Peek: partial next slide
    ]

    return outerFrame(sid, content, [{
        id: `${sid}--slider`, type: 'frame',
        props: { direction: 'vertical' as const, gap: 32, alignment: { cross: 'center' as const }, sizing: { width: 'fill' as const }, className: 'relative' },
        content: { label: 'Slider' },
        children: [
            {
                id: `${sid}--slide-track`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: 'overflow-hidden @max-sm:gap-6' },
                content: { label: 'Slide Track', _chrome: 'arrows-offset' },
                children: images,
            },
            chromeFrame(sid, 'dots', 'dots'),
        ],
    }])
}

function buildSliderBelow(sid: string, content: GalleryContent, cols: number, ratio: string): Block[] {
    const images: Block[] = [
        ...Array.from({ length: cols }, (_, i) => mkImgL(sid, i, 'flex-1 shrink-0', ratio)),
        mkImgL(sid, cols, 'w-[8%] shrink-0 opacity-50', ratio),  // Peek hint
    ]

    return outerFrame(sid, content, [{
        id: `${sid}--slider`, type: 'frame',
        props: { direction: 'vertical' as const, gap: 32, sizing: { width: 'fill' as const }, className: '@max-sm:gap-5' },
        content: { label: 'Slider' },
        children: [
            {
                id: `${sid}--slide-track`, type: 'frame',
                props: { direction: 'horizontal' as const, gap: 32, sizing: { width: 'fill' as const }, className: 'overflow-hidden @max-sm:gap-6' },
                content: { label: 'Slide Track' },
                children: images,
            },
            chromeFrame(sid, 'controls', 'controls-below'),
        ],
    }])
}

function buildSplit(sid: string, content: GalleryContent, cols: number): Block[] {
    const images: Block[] = [
        ...Array.from({ length: cols }, (_, i) => mkImgL(sid, i, 'flex-1 shrink-0')),
        mkImgL(sid, cols, 'w-[10%] shrink-0 opacity-60'),  // Peek hint
    ]

    return [{
        id: `${sid}--root`, type: 'frame',
        props: { direction: 'horizontal' as const, gap: 80, sizing: { width: 'fill' as const }, maxWidth: 1280, className: 'mx-auto @max-sm:flex-col @max-sm:gap-12' },
        content: { label: 'Gallery Container' },
        children: [
            {
                id: `${sid}--title-col`, type: 'frame',
                props: { direction: 'vertical' as const, gap: 24, alignment: { main: 'center' as const, cross: 'start' as const }, layoutClassName: 'w-[35%] shrink-0 @max-sm:w-full' },
                content: { label: 'Title Column' },
                children: [
                    { ...mkHeading(sid, content), props: { ...mkHeading(sid, content).props, align: 'left' } },
                    { ...mkDesc(sid, content), props: { ...mkDesc(sid, content).props, align: 'left' } },
                ],
            },
            {
                id: `${sid}--carousel-col`, type: 'frame',
                props: { direction: 'vertical' as const, gap: 32, layoutClassName: 'flex-1 min-w-0', className: '@max-sm:gap-5' },
                content: { label: 'Carousel Column' },
                children: [
                    {
                        id: `${sid}--slide-track`, type: 'frame',
                        props: { direction: 'horizontal' as const, gap: 32, className: 'overflow-hidden @max-sm:gap-6' },
                        content: { label: 'Slide Track' },
                        children: images,
                    },
                    chromeFrame(sid, 'controls', 'controls-below'),
                ],
            },
        ],
    }]
}

// ============================================
// Image count per variant (kept for external consumers)
// ============================================

const VARIANT_IMAGE_COUNT: Record<number, number> = {
    1: 1, 2: 2, 3: 3, 4: 4, 5: 6, 6: 8,
    7: 3, 8: 4, 9: 5, 10: 7,
    11: 2, 12: 4,
    13: 3, 14: 3, 15: 3, 16: 5, 17: 5, 18: 7, 19: 9,
    20: 4, 21: 5, 22: 7, 23: 9,
    24: 3,
    25: 8, 26: 8, 27: 8,
}

// ============================================
// Background Layer
// ============================================

function BackgroundLayer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <section
            className={`@container w-full ${className}`}
            style={{
                '--sg-text-primary': '#ffffff',
                '--sg-text-secondary': 'rgba(255,255,255,0.9)',
                '--sg-text-muted': 'rgba(255,255,255,0.3)',
                '--sg-border': 'rgba(255,255,255,0.2)',
                '--sg-bg-secondary': 'var(--sg-bg-secondary, #2d2b26)',
            } as React.CSSProperties}
        >
            <div className="bg-(--sg-bg-primary,#0c0a05) text-(--sg-text-primary,white) px-16 py-28 @max-sm:px-5 @max-sm:py-16">
                {children}
            </div>
        </section>
    )
}

// ============================================
// Main Component — Just walks the block tree
// ============================================

export function GallerySection({ sectionId, variant, content, blocks: externalBlocks, className }: GallerySectionProps) {
    const c = { ...DEFAULT_GALLERY_CONTENT, ...content }
    const _imageCount = VARIANT_IMAGE_COUNT[variant] ?? 6

    // Build nested frame block tree — memoized for stable selection
    const derivedBlocks = useMemo(
        () => buildGalleryBlocks(sectionId, c, variant),
        [sectionId, c, variant],
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
        <BackgroundLayer className={className}>
            {blocks.map(block => (
                <RenderBlock key={block.id} block={block} />
            ))}
        </BackgroundLayer>
    )
}
