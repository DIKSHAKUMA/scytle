/**
 * FAQ — Universal Parametric Section Renderer
 *
 * One component handles all FAQ variants via config-driven rendering.
 * Single shell type: section(bg-primary) → container(1280) → blocks.
 *
 * FAQ sections have no background images, no videos, no card shells.
 * All layout differentiation comes from the block tree structure.
 */

'use client'

import { useEffect } from 'react'
import type { LayoutProps } from '../../types'
import type { FaqPresetConfig } from '../types'
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
// Alignment helpers
// ============================================

const ALIGN_CLASSES: Record<string, string> = {
    left: 'flex flex-col items-start',
    center: 'flex flex-col items-center text-center',
}

// ============================================
// Universal Section Renderer
// ============================================

export interface FaqSectionShellProps extends LayoutProps {
    config: FaqPresetConfig
}

export function FaqSectionShell({ sectionId, blocks, className, config }: FaqSectionShellProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    const alignCn = ALIGN_CLASSES[config.align] ?? ''

    const renderBlocks = (b?: Block[]) =>
        b?.map(block => <RenderBlock key={block.id} block={block} />)

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
                        className={[
                            'mx-auto',
                            alignCn,
                            'py-28 px-16 @max-sm:py-16 @max-sm:px-5',
                        ].filter(Boolean).join(' ')}
                        style={{ maxWidth: '1280px' }}
                    >
                        {renderBlocks(blocks)}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
