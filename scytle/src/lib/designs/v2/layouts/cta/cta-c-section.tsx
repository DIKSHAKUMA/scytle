/**
 * CtaCSection — Core renderers for CTA Family C layout variants
 *
 * Architecture matches cta-b-section.tsx:
 *   - <section> owns container queries via containerType: 'inline-size'
 *   - Inner blocks rendered via RenderBlock (recursive frame tree)
 *   - All styling reads from --sg-* CSS tokens
 *   - SectionSelectionWrapper handles click/select/enter interactions
 *
 * Desktop-first with @max-sm: for mobile breakpoint.
 *
 * 6 structural groups, 13 exported components:
 *
 *   Left Normal:
 *     CtaCLeftNoBg       — CTA 19, 20 (no background)
 *     CtaCLeftBgImage    — CTA 3, 4   (background image placeholder)
 *     CtaCLeftBgVideo    — CTA 5, 6   (background video placeholder)
 *
 *   Left Card:
 *     CtaCLeftCardBgImage — CTA 41, 42 (card with bg image)
 *     CtaCLeftCardBgVideo — CTA 43, 44 (card with bg video)
 *
 *   Center Normal:
 *     CtaCCenterNoBg      — CTA 25, 26 (no background)
 *     CtaCCenterBgImage   — CTA 27, 28 (background image)
 *     CtaCCenterBgVideo   — CTA 29, 30 (background video)
 *
 *   Center Card:
 *     CtaCCenterCardNoBg      — CTA 51, 52 (card, no bg image)
 *     CtaCCenterCardBgImage   — CTA 53, 54 (card with bg image)
 *     CtaCCenterCardBgVideo   — CTA 55, 56 (card with bg video)
 *
 *   Center Stacked:
 *     CtaCCenterStacked   — CTA 31, 32 (text + image below, in container)
 *
 *   Center Expand:
 *     CtaCCenterExpand    — CTA 65     (text padded + full-bleed image)
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
// Shared background layers
// ============================================

/** Background image layer — wireframe placeholder or real bg in design mode */
function BgImageLayer({ sectionId }: { sectionId: string }) {
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
    )
}

/** Background video layer — wireframe placeholder */
function BgVideoLayer() {
    return (
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
    )
}

// ============================================
// LEFT NORMAL — No background (CTA 19, 20)
// ============================================
// Desktop: py-28 px-16, max-w-1280, items-start
// Mobile:  py-16 px-5

export function CtaCLeftNoBg({ sectionId, blocks, className }: LayoutProps) {
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
                        className="mx-auto flex flex-col items-start py-28 px-16 @max-sm:py-16 @max-sm:px-5"
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
// LEFT NORMAL — Background image (CTA 3, 4)
// ============================================

export function CtaCLeftBgImage({ sectionId, blocks, className }: LayoutProps) {
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
                    <BgImageLayer sectionId={sectionId} />
                    <div
                        className="relative mx-auto flex flex-col items-start py-28 px-16 @max-sm:py-16 @max-sm:px-5"
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
// LEFT NORMAL — Background video (CTA 5, 6)
// ============================================

export function CtaCLeftBgVideo({ sectionId, blocks, className }: LayoutProps) {
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
                    <BgVideoLayer />
                    <div
                        className="relative mx-auto flex flex-col items-start py-28 px-16 @max-sm:py-16 @max-sm:px-5"
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
// LEFT CARD — Background image (CTA 41, 42)
// ============================================
// Card: border, overflow-clip, p-16 desktop / p-8 mobile
// Background image is INSIDE the card

export function CtaCLeftCardBgImage({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'white',
                    }}
                >
                    <div
                        className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        <div
                            className="relative w-full overflow-clip p-16 @max-sm:p-8"
                            style={{
                                border: '1px solid var(--sg-border)',
                            }}
                        >
                            <BgImageLayer sectionId={sectionId} />
                            <div className="relative flex flex-col items-start" style={{ zIndex: 1, maxWidth: '768px' }}>
                                {blocks?.map((block) => (
                                    <RenderBlock key={block.id} block={block} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// LEFT CARD — Background video (CTA 43, 44)
// ============================================

export function CtaCLeftCardBgVideo({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'white',
                    }}
                >
                    <div
                        className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        <div
                            className="relative w-full overflow-clip p-16 @max-sm:p-8"
                            style={{
                                border: '1px solid var(--sg-border)',
                            }}
                        >
                            <BgVideoLayer />
                            <div className="relative flex flex-col items-start" style={{ zIndex: 1, maxWidth: '768px' }}>
                                {blocks?.map((block) => (
                                    <RenderBlock key={block.id} block={block} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// CENTER NORMAL — No background (CTA 25, 26)
// ============================================

export function CtaCCenterNoBg({ sectionId, blocks, className }: LayoutProps) {
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
                        className="mx-auto flex flex-col items-center py-28 px-16 @max-sm:py-16 @max-sm:px-5"
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
// CENTER NORMAL — Background image (CTA 27, 28)
// ============================================

export function CtaCCenterBgImage({ sectionId, blocks, className }: LayoutProps) {
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
                    <BgImageLayer sectionId={sectionId} />
                    <div
                        className="relative mx-auto flex flex-col items-center py-28 px-16 @max-sm:py-16 @max-sm:px-5"
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
// CENTER NORMAL — Background video (CTA 29, 30)
// ============================================

export function CtaCCenterBgVideo({ sectionId, blocks, className }: LayoutProps) {
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
                    <BgVideoLayer />
                    <div
                        className="relative mx-auto flex flex-col items-center py-28 px-16 @max-sm:py-16 @max-sm:px-5"
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
// CENTER CARD — No background (CTA 51, 52)
// ============================================
// Card: bg foreground, border, p-16, items-center, justify-center
// No background image/video

export function CtaCCenterCardNoBg({ sectionId, blocks, className }: LayoutProps) {
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
                        <div
                            className="w-full flex flex-col items-center justify-center p-16 @max-sm:p-8"
                            style={{
                                backgroundColor: 'var(--sg-bg-secondary)',
                                border: '1px solid var(--sg-border)',
                            }}
                        >
                            {blocks?.map((block) => (
                                <RenderBlock key={block.id} block={block} />
                            ))}
                        </div>
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// CENTER CARD — Background image (CTA 53, 54)
// ============================================

export function CtaCCenterCardBgImage({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'white',
                    }}
                >
                    <div
                        className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        <div
                            className="relative w-full overflow-clip flex flex-col items-center justify-center p-16 @max-sm:p-8"
                            style={{
                                border: '1px solid var(--sg-border)',
                            }}
                        >
                            <BgImageLayer sectionId={sectionId} />
                            <div className="relative w-full flex flex-col items-center" style={{ zIndex: 1 }}>
                                {blocks?.map((block) => (
                                    <RenderBlock key={block.id} block={block} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// CENTER CARD — Background video (CTA 55, 56)
// ============================================

export function CtaCCenterCardBgVideo({ sectionId, blocks, className }: LayoutProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'white',
                    }}
                >
                    <div
                        className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        <div
                            className="relative w-full overflow-clip flex flex-col items-center justify-center p-16 @max-sm:p-8"
                            style={{
                                border: '1px solid var(--sg-border)',
                            }}
                        >
                            <BgVideoLayer />
                            <div className="relative w-full flex flex-col items-center" style={{ zIndex: 1 }}>
                                {blocks?.map((block) => (
                                    <RenderBlock key={block.id} block={block} />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}

// ============================================
// CENTER STACKED — Text + image below (CTA 31, 32)
// ============================================
// Centered text content + full-width image below, both inside container
// Gap-80 between content and image (handled by block tree rootFrame)

export function CtaCCenterStacked({ sectionId, blocks, className }: LayoutProps) {
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
                        className="mx-auto flex flex-col items-center py-28 px-16 @max-sm:py-16 @max-sm:px-5"
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
// CENTER EXPAND — Text padded + full-bleed image (CTA 65)
// ============================================
// Content in padded container (max-w-1280), image full-bleed edge-to-edge
// Block tree: [contentFrame, imageBlock] — two root blocks

export function CtaCCenterExpand({ sectionId, blocks, className }: LayoutProps) {
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
                            className="w-full flex flex-col items-center"
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
