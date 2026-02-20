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
 */

'use client'

import type { LayoutProps } from '../types'
import { RenderBlock } from '../../blocks'
import type { Block } from '../../blocks/types'
import { SectionSelectionWrapper } from '../../selection'
import { PageIdContext, SectionIdContext } from '../../selection/contexts'
import { useContext } from 'react'

// ============================================
// Hero 44 — Left-aligned, single column
// ============================================

export function Hero44({ sectionId, blocks, className }: LayoutProps) {
    const pageId = useContext(PageIdContext)

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
    const pageId = useContext(PageIdContext)

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
