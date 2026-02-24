/**
 * Footer — Universal Parametric Section Renderer
 *
 * One component handles all footer variants via config-driven rendering.
 * Two shell modes:
 *   'container' — section(bg-primary) → container(1280, padding) → blocks
 *   'card'      — section(bg-primary) → container(1280, padding) →
 *                 card(border, bg-secondary, p-48) wraps main content + outside credits
 *
 * The block tree structure already encodes the layout. The shell just wraps
 * the content blocks with appropriate container styling and optional card.
 */

'use client'

import { useEffect } from 'react'
import type { LayoutProps } from '../../types'
import type { FooterPresetConfig } from '../types'
import { RenderBlock } from '../../../blocks'
import type { Block } from '../../../blocks/types'
import { SectionSelectionWrapper } from '../../../selection'
import { SectionIdContext } from '../../../selection/contexts'
import { useSelectionStore } from '@/store/selection-store'

// ============================================
// Block registration hook
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
// Universal Section Renderer
// ============================================

export interface FooterSectionShellProps extends LayoutProps {
    config: FooterPresetConfig
}

export function FooterSectionShell({ sectionId, blocks, className, config }: FooterSectionShellProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    const isCard = config.shell === 'card'

    const renderBlocks = (b?: Block[]) =>
        b?.map(block => <RenderBlock key={block.id} block={block} />)

    // For card mode, split block tree:
    // First child of root frame = main content → wrap in card
    // Remaining children = credits → render outside card
    const renderCardContent = () => {
        if (!blocks || blocks.length === 0) return null
        const rootFrame = blocks[0]
        const children = rootFrame.children ?? []

        // All but last child go inside the card
        const cardChildren = children.slice(0, -1)
        // Last child is credits (outside card)
        const creditsChild = children[children.length - 1]

        return (
            <div
                className="flex flex-col @max-sm:!gap-8"
                style={{ gap: `${rootFrame.props?.gap ?? 32}px` }}
            >
                {/* Card wrapper */}
                <div
                    className="rounded-2xl border p-12 @max-sm:!p-6"
                    style={{
                        backgroundColor: 'var(--sg-bg-secondary, var(--sg-bg-primary))',
                        borderColor: 'var(--sg-border, rgba(0,0,0,0.1))',
                    }}
                >
                    {cardChildren.map(block => (
                        <RenderBlock key={block.id} block={block} />
                    ))}
                </div>
                {/* Credits outside card */}
                {creditsChild && <RenderBlock block={creditsChild} />}
            </div>
        )
    }

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
                        className="mx-auto py-20 px-16 @max-sm:py-12 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        {isCard ? renderCardContent() : renderBlocks(blocks)}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
