/**
 * HeroSection — Core renderer for all hero layout variants
 *
 * Architecture:
 *   - The <section> owns responsive breakpoints via container queries
 *   - Inner blocks are rendered via RenderBlock (recursive)
 *   - All styling reads from --sg-* CSS tokens (light theme)
 *   - SectionSelectionWrapper handles click/select/enter interactions
 *
 * Desktop-first with @max-sm: for mobile breakpoint.
 * Container query is set on the section element itself.
 *
 * Variants:
 *   Hero44 — Left-aligned, single column (minimal)
 *   Hero57 — Split two-column (text both sides)
 *   Hero1  — Split, text left + image right
 *   Hero3  — Split, text left + video right
 *   Hero5  — Full background image with dark overlay
 */

'use client'

import { useEffect } from 'react'
import { ImageIcon } from 'lucide-react'
import type { LayoutProps } from '../types'
import { RenderBlock } from '../../blocks'
import type { Block } from '../../blocks/types'
import { SectionSelectionWrapper } from '../../selection'
import { SectionIdContext } from '../../selection/contexts'
import { useSelectionStore } from '@/store/selection-store'
import { useUnifiedStore } from '@/store'
import { positionToCSS } from '../../utils/image-helpers'

// ============================================
// Register blocks with selection store so keyboard
// handler can navigate them (Tab, Enter, Shift+Enter)
// ============================================

function useRegisterSectionBlocks(sectionId: string, blocks?: Block[]) {
    const selSectionId = useSelectionStore((s) => s.sectionId)
    const setCurrentBlocks = useSelectionStore((s) => s.setCurrentBlocks)

    useEffect(() => {
        if (selSectionId === sectionId && blocks && blocks.length > 0) {
            setCurrentBlocks(blocks)
        }
    }, [selSectionId, sectionId, blocks, setCurrentBlocks])
}

// ============================================
// Hero 44 — Left-aligned, single column
// ============================================

export function Hero44({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'var(--sg-text-primary)',
                    }}
                >
                    {/* 
                      Desktop: py-28 px-16 → 112px / 64px
                      Mobile:  py-16 px-5  → 64px / 20px
                    */}
                    <div
                        className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        {blocks?.map((block) => (
                            <RenderBlock key={block.id} block={block} />
                        ))}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// Hero 57 — Split two-column
// ============================================

export function Hero57({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'var(--sg-text-primary)',
                    }}
                >
                    {/* 
                      Desktop: py-28 px-16 → 112px / 64px
                      Mobile:  py-16 px-5  → 64px / 20px
                    */}
                    <div
                        className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        {blocks?.map((block) => (
                            <RenderBlock key={block.id} block={block} />
                        ))}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// Hero 1 — Split, text left + image right
// ============================================
// Figma: Header / 1 / — Dark bg, two columns, gap-80
// Left column: heading + body + CTA buttons
// Right column: square image placeholder

export function Hero1({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'var(--sg-text-primary)',
                    }}
                >
                    <div
                        className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        {blocks?.map((block) => (
                            <RenderBlock key={block.id} block={block} />
                        ))}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// Hero 3 — Split, text left + video right
// ============================================
// Figma: Header / 3 / — Dark bg, two columns, gap-80
// Left column: heading + body + CTA buttons
// Right column: video placeholder with play button

export function Hero3({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'var(--sg-text-primary)',
                    }}
                >
                    <div
                        className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        {blocks?.map((block) => (
                            <RenderBlock key={block.id} block={block} />
                        ))}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// Hero 5 — Full background image with dark overlay
// ============================================
// Figma: Header / 5 / — Full-width bg image + rgba(0,0,0,0.4) overlay
// Content: left-aligned, max-w-[560px], white text over dark overlay
// Background image is a section-level visual, not a block.

export function Hero5({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    const canvasMode = useUnifiedStore(s => s.canvasMode)

    // Read design props from the section in unified store
    const designProps = useUnifiedStore(s => {
        for (const page of s.pages) {
            const section = page.sections.find(sec => sec.id === sectionId)
            if (section) return section.designProps
        }
        return undefined
    })

    const bgImage = designProps?.backgroundImage
    const showRealBg = canvasMode === 'design' && bgImage?.url

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        position: 'relative',
                        minHeight: '600px',
                        color: 'white',
                    }}
                >
                    {/* Background layer */}
                    <div
                        className="absolute inset-0"
                        style={{ zIndex: 0 }}
                    >
                        {showRealBg ? (
                            /* Real background image */
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                src={bgImage.url}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{
                                    objectPosition: positionToCSS(bgImage.position),
                                }}
                            />
                        ) : (
                            /* Placeholder fill */
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ backgroundColor: 'var(--sg-bg-secondary)' }}
                            >
                                <ImageIcon
                                    className="opacity-20"
                                    style={{ color: 'var(--sg-text-muted)' }}
                                    size={64}
                                />
                            </div>
                        )}
                        {/* Dark overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                backgroundColor: `rgba(0, 0, 0, ${bgImage?.overlayOpacity ?? 0.4})`,
                                display: bgImage?.overlay === false ? 'none' : undefined,
                            }}
                        />
                    </div>

                    {/* Content — positioned above the background */}
                    <div
                        className="relative mx-auto flex items-center py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px', zIndex: 1, minHeight: '600px' }}
                    >
                        {blocks?.map((block) => (
                            <RenderBlock key={block.id} block={block} />
                        ))}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
