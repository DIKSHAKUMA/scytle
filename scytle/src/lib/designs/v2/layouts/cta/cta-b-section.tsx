/**
 * CtaBSection — Core renderers for CTA Family B layout variants
 *
 * Architecture matches cta-section.tsx (Family A) exactly:
 *   - <section> owns container queries via containerType: 'inline-size'
 *   - Inner blocks rendered via RenderBlock (recursive frame tree)
 *   - All styling reads from --sg-* CSS tokens
 *   - SectionSelectionWrapper handles click/select/enter interactions
 *
 * Desktop-first with @max-sm: for mobile breakpoint.
 *
 * Variants:
 *   CtaBTextOnly    — Standard container, text blocks only, no bg (CTA 13–14)
 *   CtaBTextBgImage — Text-only with bg image placeholder + overlay (CTA 15–16)
 *   CtaBTextBgVideo — Text-only with bg video placeholder + overlay (CTA 17–18)
 *   CtaBStacked     — Standard container, text + full-width image below (CTA 21–22)
 *   CtaBExpand      — Padded content in container + full-bleed image outside (CTA 61–62)
 */

'use client'

import { useEffect } from 'react'
import { ImageIcon, VideoIcon } from 'lucide-react'
import type { LayoutProps } from '../types'
import { RenderBlock } from '../../blocks'
import type { Block } from '../../blocks/types'
import { SectionSelectionWrapper } from '../../selection'
import { SectionIdContext } from '../../selection/contexts'
import { useSelectionStore } from '@/store/selection-store'
import { useUnifiedStore } from '@/store'
import { positionToCSS } from '../../utils/image-helpers'

// ============================================
// Register blocks with selection store
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
// CTA-B Text-Only — No background (CTA 13–14)
// ============================================
// Desktop: py-28 px-16, container max-w-1280
// Mobile:  py-16 px-5
// Block tree is just the two-column text frame (no image).

export function CtaBTextOnly({ sectionId, blocks, className }: LayoutProps) {
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
// CTA-B Text + Background Image (CTA 15–16)
// ============================================
// Same block tree as CTA 13/14, but with a full-section background image.
// In wireframe mode: shows a placeholder fill with ImageIcon.
// In design mode: renders the actual uploaded background image.
// Dark overlay ensures text remains readable.

export function CtaBTextBgImage({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    const canvasMode = useUnifiedStore(s => s.canvasMode)
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
                        color: 'white',
                    }}
                >
                    {/* Background layer */}
                    <div className="absolute inset-0" style={{ zIndex: 0 }}>
                        {showRealBg ? (
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
                    </div>

                    {/* Content — above background */}
                    <div
                        className="relative mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px', zIndex: 1 }}
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
// CTA-B Text + Background Video (CTA 17–18)
// ============================================
// Same block tree as CTA 13/14, but with a full-section background video.
// Wireframe: placeholder fill with VideoIcon.
// Design mode: renders actual video (future).
// Dark overlay ensures text remains readable.

export function CtaBTextBgVideo({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        position: 'relative',
                        color: 'white',
                    }}
                >
                    {/* Video placeholder background */}
                    <div className="absolute inset-0" style={{ zIndex: 0 }}>
                        <div
                            className="absolute inset-0 flex items-center justify-center"
                            style={{ backgroundColor: 'var(--sg-bg-secondary)' }}
                        >
                            <VideoIcon
                                className="opacity-20"
                                style={{ color: 'var(--sg-text-muted)' }}
                                size={64}
                            />
                        </div>
                    </div>

                    {/* Content — above background */}
                    <div
                        className="relative mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px', zIndex: 1 }}
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
// CTA-B Stacked — Text + full-width image, inside container (CTA 21–22)
// ============================================
// Desktop: py-28 px-16, container max-w-1280
// Mobile:  py-16 px-5
// Block tree: rootFrame(vertical, gap-80) → columnsFrame + imageBlock
// All blocks rendered inside the container.

export function CtaBStacked({ sectionId, blocks, className }: LayoutProps) {
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
// CTA-B Expand — Padded content + full-bleed image (CTA 61–62)
// ============================================
// Block tree: TWO root blocks — [columnsFrame, imageBlock]
// Content (first block) rendered inside padded container (max-w-1280)
// Image (last block) rendered full-bleed outside container, edge-to-edge
//
// Desktop: Content py-28 px-16, image full-width
// Mobile:  Content py-16 px-5

export function CtaBExpand({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    // Split: all blocks except last go in padded container, last block is full-bleed image
    const contentBlocks = blocks?.slice(0, -1)
    const imageBlock = blocks && blocks.length > 1 ? blocks[blocks.length - 1] : undefined

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
                    {/* Padded content container */}
                    <div className="flex flex-col items-center py-28 px-16 @max-sm:py-16 @max-sm:px-5">
                        <div
                            className="w-full"
                            style={{ maxWidth: '1280px' }}
                        >
                            {contentBlocks?.map((block) => (
                                <RenderBlock key={block.id} block={block} />
                            ))}
                        </div>
                    </div>

                    {/* Full-bleed image — edge-to-edge, no padding */}
                    {imageBlock && (
                        <RenderBlock block={imageBlock} />
                    )}
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
