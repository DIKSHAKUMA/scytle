/**
 * GallerySection — Composable gallery layout component (Desktop-first)
 *
 * Single component that renders all 27 gallery variations.
 * Dispatches to sub-renderers based on variant number.
 *
 * Uses desktop-first approach (matching hero pattern):
 *   - Default = desktop layout
 *   - @max-sm: overrides for mobile viewport (375px)
 *
 * Reads --sg-* CSS custom properties for theming.
 */

'use client'

import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GalleryContent } from './types'
import { DEFAULT_GALLERY_CONTENT } from './types'

// ============================================
// Props
// ============================================

export interface GallerySectionProps {
    sectionId: string
    variant: number
    content?: Partial<GalleryContent>
    className?: string
}

// ============================================
// Shared Sub-components
// ============================================

/** Image placeholder — grey box with icon */
function Placeholder({ className = '', ratio }: { className?: string; ratio?: string }) {
    const style = ratio ? { aspectRatio: ratio } : undefined
    return (
        <div
            className={`bg-[var(--sg-bg-secondary,#e5e7eb)] flex items-center justify-center relative overflow-hidden ${className}`}
            style={style}
            data-layer-type="image"
        >
            <ImageIcon className="w-8 h-8 text-[var(--sg-text-muted,#9ca3af)] opacity-50" />
        </div>
    )
}

/** Section heading */
function SectionHeading({ text, className = '' }: { text: string; className?: string }) {
    return (
        <h2
            className={`font-[var(--sg-font-heading,Inter)] font-medium leading-[1.2] tracking-[-0.01em] text-[var(--sg-text,var(--sg-text-primary,#111827))] text-[clamp(2rem,4vw,3.25rem)] ${className}`}
            data-layer-type="heading"
        >
            {text}
        </h2>
    )
}

/** Section description */
function SectionDescription({ text, className = '' }: { text: string; className?: string }) {
    return (
        <p
            className={`font-[var(--sg-font-body,Inter)] font-normal leading-[1.5] text-[var(--sg-text,var(--sg-text-secondary,#6b7280))] text-[clamp(0.75rem,1.2vw,1.125rem)] opacity-90 ${className}`}
            data-layer-type="text"
        >
            {text}
        </p>
    )
}

/** Slider arrow button */
function SliderArrow({ direction }: { direction: 'left' | 'right' }) {
    const Icon = direction === 'left' ? ChevronLeft : ChevronRight
    return (
        <button
            type="button"
            className="flex items-center justify-center w-12 h-12 rounded-full border border-[var(--sg-border,rgba(255,255,255,0.2))] bg-transparent text-[var(--sg-text,white)] shrink-0"
            data-layer-type="button"
        >
            <Icon className="w-6 h-6" />
        </button>
    )
}

/** Slider dots indicator */
function SliderDots({ count = 3, activeIndex = 0 }: { count?: number; activeIndex?: number }) {
    return (
        <div className="flex items-center gap-[9px] py-2.5" data-layer-type="dots">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === activeIndex
                            ? 'bg-[var(--sg-text,white)]'
                            : 'bg-[var(--sg-text,white)] opacity-20'
                        }`}
                />
            ))}
        </div>
    )
}

/** Arrows LEFT + Dots RIGHT (for slider-below and split) */
function SliderControlsBelow() {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
                <SliderArrow direction="left" />
                <SliderArrow direction="right" />
            </div>
            <SliderDots count={7} />
        </div>
    )
}

/** Common centered section title block */
function SectionTitle({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="flex flex-col items-center text-center max-w-[768px] w-full mx-auto gap-6 @max-sm:gap-5">
            <SectionHeading text={heading} className="w-full text-center" />
            <SectionDescription text={description} className="w-full text-center" />
        </div>
    )
}

// ============================================
// Background Layer
// ============================================

function BackgroundLayer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return (
        <section
            className={`@container w-full ${className}`}
            style={{
                '--sg-bg': 'var(--sg-bg-primary, #0c0a05)',
                '--sg-text': 'var(--sg-text-primary, white)',
                '--sg-border': 'var(--sg-border, rgba(255,255,255,0.2))',
                '--sg-bg-secondary': 'var(--sg-bg-secondary, #2d2b26)',
                '--sg-text-muted': 'var(--sg-text-muted, rgba(255,255,255,0.3))',
            } as React.CSSProperties}
        >
            <div className="bg-[var(--sg-bg)] text-[var(--sg-text)] px-16 py-28 @max-sm:px-5 @max-sm:py-16">
                {children}
            </div>
        </section>
    )
}

// ============================================
// Layout Renderers — Static Grids (1-6)
// ============================================

/** Gallery 1: Single full-width landscape image */
function Gallery1Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <Placeholder className="w-full" ratio="16/9" />
        </div>
    )
}

/** Gallery 2: 2-col grid, 1 row */
function Gallery2Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-row gap-8 @max-sm:flex-col @max-sm:gap-6">
                <Placeholder className="flex-1" ratio="1/1" />
                <Placeholder className="flex-1" ratio="1/1" />
            </div>
        </div>
    )
}

/** Gallery 3: 3-col grid, 1 row */
function Gallery3Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-row gap-8 @max-sm:flex-col @max-sm:gap-6">
                <Placeholder className="flex-1" ratio="1/1" />
                <Placeholder className="flex-1" ratio="1/1" />
                <Placeholder className="flex-1" ratio="1/1" />
            </div>
        </div>
    )
}

/** Gallery 4: 4-col grid, 1 row (mobile: 2×2) */
function Gallery4Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full grid grid-cols-4 gap-8 @max-sm:grid-cols-2 @max-sm:gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Placeholder key={i} ratio="1/1" />
                ))}
            </div>
        </div>
    )
}

/** Gallery 5: 3×2 grid (6 images, mobile: 2-col) */
function Gallery5Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full grid grid-cols-3 gap-8 @max-sm:grid-cols-2 @max-sm:gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Placeholder key={i} ratio="1/1" />
                ))}
            </div>
        </div>
    )
}

/** Gallery 6: 4×2 grid (8 equal squares, mobile: 2-col) */
function Gallery6Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full grid grid-cols-4 gap-8 @max-sm:grid-cols-2 @max-sm:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Placeholder key={i} ratio="1/1" />
                ))}
            </div>
        </div>
    )
}

// ============================================
// Layout Renderers — Masonry (7-10)
// ============================================

/** Gallery 7: 1 tall portrait left + 2 stacked landscape right */
function Gallery7Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-row gap-8 @max-sm:flex-col @max-sm:gap-6">
                <Placeholder className="flex-1" ratio="624/752" />
                <div className="flex flex-col gap-8 flex-1 @max-sm:gap-6">
                    <Placeholder className="w-full" ratio="624/360" />
                    <Placeholder className="w-full" ratio="624/360" />
                </div>
            </div>
        </div>
    )
}

/** Gallery 8: Cross-staggered 2-col (tall+short, short+tall) */
function Gallery8Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-row gap-8 @max-sm:flex-col @max-sm:gap-6">
                <div className="flex flex-col gap-8 flex-1 @max-sm:gap-6">
                    <Placeholder className="w-full" ratio="624/640" />
                    <Placeholder className="w-full" ratio="640/426" />
                </div>
                <div className="flex flex-col gap-8 flex-1 @max-sm:gap-6">
                    <Placeholder className="w-full" ratio="640/426" />
                    <Placeholder className="w-full" ratio="624/640" />
                </div>
            </div>
        </div>
    )
}

/** Gallery 9: 1 large square left + 2×2 grid right */
function Gallery9Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-row gap-8 @max-sm:flex-col @max-sm:gap-6">
                <Placeholder className="flex-1" ratio="1/1" />
                <div className="flex flex-col gap-8 flex-1 @max-sm:gap-6">
                    <div className="flex gap-8 @max-sm:gap-6">
                        <Placeholder className="flex-1" ratio="1/1" />
                        <Placeholder className="flex-1" ratio="1/1" />
                    </div>
                    <div className="flex gap-8 @max-sm:gap-6">
                        <Placeholder className="flex-1" ratio="1/1" />
                        <Placeholder className="flex-1" ratio="1/1" />
                    </div>
                </div>
            </div>
        </div>
    )
}

/** Gallery 10: 3-col masonry — col1: 2sq, col2: 3 landscape, col3: 2sq */
function Gallery10Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-row gap-8 @max-sm:flex-col @max-sm:gap-6">
                <div className="flex flex-col gap-8 flex-1 @max-sm:gap-6">
                    <Placeholder className="w-full" ratio="1/1" />
                    <Placeholder className="w-full" ratio="1/1" />
                </div>
                <div className="flex flex-col gap-8 flex-1 @max-sm:gap-6">
                    <Placeholder className="w-full" ratio="416/234" />
                    <Placeholder className="w-full" ratio="416/234" />
                    <Placeholder className="w-full" ratio="1/1" />
                </div>
                <div className="flex flex-col gap-8 flex-1 @max-sm:gap-6">
                    <Placeholder className="w-full" ratio="1/1" />
                    <Placeholder className="w-full" ratio="1/1" />
                </div>
            </div>
        </div>
    )
}

// ============================================
// Layout Renderers — Full-bleed (11-12)
// ============================================

/** Gallery 11: 2-col no gap */
function Gallery11Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-row overflow-hidden @max-sm:flex-col">
                <Placeholder className="flex-1" ratio="1/1" />
                <Placeholder className="flex-1" ratio="1/1" />
            </div>
        </div>
    )
}

/** Gallery 12: 2×2 no gap */
function Gallery12Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full overflow-hidden">
                <div className="flex flex-row @max-sm:flex-col">
                    <Placeholder className="flex-1" ratio="1/1" />
                    <Placeholder className="flex-1" ratio="1/1" />
                </div>
                <div className="flex flex-row @max-sm:flex-col">
                    <Placeholder className="flex-1" ratio="1/1" />
                    <Placeholder className="flex-1" ratio="1/1" />
                </div>
            </div>
        </div>
    )
}

// ============================================
// Layout Renderers — Sliders with Overlaid Arrows (13-19)
// ============================================

/** Gallery 13: Full-bleed single image + overlaid arrows + dots */
function Gallery13Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-col items-center gap-8">
                <div className="w-full relative">
                    <Placeholder className="w-full" ratio="16/9" />
                    {/* Overlaid arrows — always visible */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <SliderArrow direction="left" />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <SliderArrow direction="right" />
                    </div>
                </div>
                <SliderDots />
            </div>
        </div>
    )
}

/** Gallery 14: Full-width contained slider + overlaid arrows + dots */
function Gallery14Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-col items-center gap-8">
                <div className="w-full relative">
                    <Placeholder className="w-full" ratio="16/9" />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                        <SliderArrow direction="left" />
                    </div>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <SliderArrow direction="right" />
                    </div>
                </div>
                <SliderDots />
            </div>
        </div>
    )
}

/** Gallery 15: Centered image (85% width) + arrows at container edges + dots */
function Gallery15Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-col items-center gap-8 relative">
                <div className="w-[85%] @max-sm:w-full">
                    <Placeholder className="w-full" ratio="1088/726" />
                </div>
                {/* Arrows at container edges to frame the centered image */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 z-10">
                    <SliderArrow direction="left" />
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10">
                    <SliderArrow direction="right" />
                </div>
                <SliderDots />
            </div>
        </div>
    )
}

/** Multi-col slider with overlaid arrows (Gallery 16-19) */
function SliderOverlaidLayout({ heading, description, cols }: { heading: string; description: string; cols: number }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-col items-center gap-8 relative">
                <div className="w-full overflow-hidden">
                    <div className="flex gap-8 @max-sm:gap-6">
                        {Array.from({ length: cols }).map((_, i) => (
                            <Placeholder key={i} className="flex-1 shrink-0" ratio="1/1" />
                        ))}
                        {/* Peek: partial next slide */}
                        <Placeholder className="w-[10%] shrink-0" ratio="1/1" />
                    </div>
                </div>
                {/* Overlaid arrows — always visible */}
                <div className="absolute left-0 top-[calc(50%-24px)] -translate-y-1/2 z-10">
                    <SliderArrow direction="left" />
                </div>
                <div className="absolute right-0 top-[calc(50%-24px)] -translate-y-1/2 z-10">
                    <SliderArrow direction="right" />
                </div>
                <SliderDots />
            </div>
        </div>
    )
}

// ============================================
// Layout Renderers — Sliders with Controls Below (20-23)
// ============================================

/** Multi-col slider with arrows+dots below (Gallery 20-23) */
function SliderBelowLayout({ heading, description, cols, landscape }: { heading: string; description: string; cols: number; landscape?: boolean }) {
    const ratio = landscape ? '16/9' : '1/1'
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full flex flex-col gap-8 @max-sm:gap-5">
                <div className="w-full overflow-hidden">
                    <div className="flex gap-8 @max-sm:gap-6">
                        {Array.from({ length: cols }).map((_, i) => (
                            <Placeholder key={i} className="flex-1 shrink-0" ratio={ratio} />
                        ))}
                        {/* Peek hint */}
                        <Placeholder className="w-[8%] shrink-0 opacity-50" ratio={ratio} />
                    </div>
                </div>
                <SliderControlsBelow />
            </div>
        </div>
    )
}

// ============================================
// Layout Renderer — Peek Carousel (24)
// ============================================

/** Gallery 24: Horizontal peek carousel — no arrows/dots */
function Gallery24Layout({ heading, description }: { heading: string; description: string }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-col items-center gap-20 @max-sm:gap-12">
            <SectionTitle heading={heading} description={description} />
            <div className="w-full overflow-hidden">
                <div className="flex gap-8 @max-sm:gap-6">
                    <Placeholder className="w-[87.5%] shrink-0" ratio="16/10" />
                    <Placeholder className="w-[87.5%] shrink-0" ratio="16/10" />
                </div>
            </div>
        </div>
    )
}

// ============================================
// Layout Renderers — Split (25-27)
// ============================================

/** Split layout: Title LEFT + image carousel RIGHT */
function SplitLayout({ heading, description, cols }: { heading: string; description: string; cols: number }) {
    return (
        <div className="max-w-[1280px] mx-auto flex flex-row gap-20 @max-sm:flex-col @max-sm:gap-12">
            {/* Left: Title area */}
            <div className="flex flex-col justify-center gap-6 w-[35%] shrink-0 @max-sm:w-full">
                <SectionHeading text={heading} />
                <SectionDescription text={description} />
            </div>
            {/* Right: Carousel */}
            <div className="flex-1 flex flex-col gap-8 min-w-0 @max-sm:gap-5">
                <div className="overflow-hidden">
                    <div className="flex gap-8 @max-sm:gap-6">
                        {Array.from({ length: cols }).map((_, i) => (
                            <Placeholder key={i} className="flex-1 shrink-0" ratio="1/1" />
                        ))}
                        {/* Peek: partial next slide hint */}
                        <Placeholder className="w-[10%] shrink-0 opacity-60" ratio="1/1" />
                    </div>
                </div>
                <SliderControlsBelow />
            </div>
        </div>
    )
}

// ============================================
// Main Component — Dispatcher
// ============================================

export function GallerySection({ sectionId, variant, content, className }: GallerySectionProps) {
    const c = { ...DEFAULT_GALLERY_CONTENT, ...content }

    const renderContent = () => {
        switch (variant) {
            // Static grids (1-6)
            case 1: return <Gallery1Layout heading={c.heading} description={c.description} />
            case 2: return <Gallery2Layout heading={c.heading} description={c.description} />
            case 3: return <Gallery3Layout heading={c.heading} description={c.description} />
            case 4: return <Gallery4Layout heading={c.heading} description={c.description} />
            case 5: return <Gallery5Layout heading={c.heading} description={c.description} />
            case 6: return <Gallery6Layout heading={c.heading} description={c.description} />
            // Masonry (7-10)
            case 7: return <Gallery7Layout heading={c.heading} description={c.description} />
            case 8: return <Gallery8Layout heading={c.heading} description={c.description} />
            case 9: return <Gallery9Layout heading={c.heading} description={c.description} />
            case 10: return <Gallery10Layout heading={c.heading} description={c.description} />
            // Full-bleed (11-12)
            case 11: return <Gallery11Layout heading={c.heading} description={c.description} />
            case 12: return <Gallery12Layout heading={c.heading} description={c.description} />
            // Slider — overlaid arrows (13-19)
            case 13: return <Gallery13Layout heading={c.heading} description={c.description} />
            case 14: return <Gallery14Layout heading={c.heading} description={c.description} />
            case 15: return <Gallery15Layout heading={c.heading} description={c.description} />
            case 16: return <SliderOverlaidLayout heading={c.heading} description={c.description} cols={2} />
            case 17: return <SliderOverlaidLayout heading={c.heading} description={c.description} cols={2} />
            case 18: return <SliderOverlaidLayout heading={c.heading} description={c.description} cols={3} />
            case 19: return <SliderOverlaidLayout heading={c.heading} description={c.description} cols={4} />
            // Slider — below (20-23)
            case 20: return <SliderBelowLayout heading={c.heading} description={c.description} cols={1} landscape />
            case 21: return <SliderBelowLayout heading={c.heading} description={c.description} cols={2} />
            case 22: return <SliderBelowLayout heading={c.heading} description={c.description} cols={3} />
            case 23: return <SliderBelowLayout heading={c.heading} description={c.description} cols={4} />
            // Peek slider (24)
            case 24: return <Gallery24Layout heading={c.heading} description={c.description} />
            // Split (25-27)
            case 25: return <SplitLayout heading={c.heading} description={c.description} cols={1} />
            case 26: return <SplitLayout heading={c.heading} description={c.description} cols={2} />
            case 27: return <SplitLayout heading={c.heading} description={c.description} cols={3} />
            // Fallback
            default: return <Gallery3Layout heading={c.heading} description={c.description} />
        }
    }

    return (
        <BackgroundLayer className={className}>
            {renderContent()}
        </BackgroundLayer>
    )
}
