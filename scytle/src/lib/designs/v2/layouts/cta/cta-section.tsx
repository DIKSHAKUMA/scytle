/**
 * CtaSection — Core renderers for CTA Family A layout variants
 *
 * Architecture matches hero-section.tsx exactly:
 *   - <section> owns container queries via containerType: 'inline-size'
 *   - Inner blocks rendered via RenderBlock (recursive frame tree)
 *   - All styling reads from --sg-* CSS tokens
 *   - SectionSelectionWrapper handles click/select/enter interactions
 *
 * Desktop-first with @max-sm: for mobile breakpoint.
 *
 * Variants:
 *   CtaNormal  — Standard container (CTA 1, 2)
 *   CtaCard    — Card wrapper with bg-secondary + border (CTA 39, 40)
 *   CtaExpand  — Full-width, no container padding (CTA 59, 60)
 */

'use client'

import { useEffect } from 'react'
import type { LayoutProps } from '../types'
import { RenderBlock } from '../../blocks'
import type { Block } from '../../blocks/types'
import { SectionSelectionWrapper } from '../../selection'
import { SectionIdContext } from '../../selection/contexts'
import { useSelectionStore } from '@/store/selection-store'

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
// CTA Normal — Standard container (CTA 1, 2)
// ============================================
// Desktop: py-28 px-16, container max-w-1280
// Mobile:  py-16 px-5
// Layout comes from the block tree (horizontal columnsFrame)

export function CtaNormal({ sectionId, blocks, className }: LayoutProps) {
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
// CTA Card — Card wrapper (CTA 39, 40)
// ============================================
// Desktop: Same container + card inside (bg-secondary, border, rounded, overflow-clip)
// Mobile:  Same responsive padding
// Card styling is section-level decoration, block tree handles internal layout

export function CtaCard({ sectionId, blocks, className }: LayoutProps) {
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
                            className="overflow-clip"
                            style={{
                                backgroundColor: 'var(--sg-bg-secondary)',
                                border: '1px solid var(--sg-border)',
                                borderRadius: 'var(--sg-card-radius)',
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
// CTA Expand — Full-width, no container padding (CTA 59, 60)
// ============================================
// Content padding is handled by the block tree (contentLeft frame)
// Image stretches to section edge
// No max-width container

export function CtaExpand({ sectionId, blocks, className }: LayoutProps) {
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
                    {blocks?.map((block) => (
                        <RenderBlock key={block.id} block={block} />
                    ))}
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
