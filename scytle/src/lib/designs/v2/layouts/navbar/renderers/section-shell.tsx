/**
 * Navbar — Universal Parametric Section Renderer
 *
 * One component handles all navbar variants via config-driven rendering.
 * 3 shell types:
 *   bar        — section(bg-primary, h-auto) → container(1280px, py-4, px-16) → blocks
 *   floating   — section(bg-primary, pt-6) → container(1280px, px-8) → bordered-inner(py-4 px-8) → blocks
 *   two-row    — section(bg-primary) → container(1280px, px-16) → blocks (column with two rows)
 *
 * Navbars render as thin horizontal bars (~72px), NOT full-height sections.
 */

'use client'

import { useEffect } from 'react'
import type { LayoutProps } from '../../types'
import type { NavbarPresetConfig } from '../types'
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

export interface NavbarSectionShellProps extends LayoutProps {
    config: NavbarPresetConfig
}

export function NavbarSectionShell({ sectionId, blocks, className, config }: NavbarSectionShellProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    const { shell } = config

    // ── Render blocks ──
    const renderBlocks = (b?: Block[]) => b?.map(block => <RenderBlock key={block.id} block={block} />)

    // ── Floating shell (inset bar with border) ──
    if (shell === 'floating') {
        return (
            <SectionSelectionWrapper sectionId={sectionId}>
                <SectionIdContext value={sectionId}>
                    <nav
                        className={className}
                        style={{
                            containerType: 'inline-size',
                            backgroundColor: 'var(--sg-bg-primary)',
                            color: 'var(--sg-text-primary)',
                        }}
                    >
                        <div
                            className="mx-auto pt-6 px-8 @max-sm:pt-4 @max-sm:px-4"
                            style={{ maxWidth: '1280px' }}
                        >
                            <div
                                className="flex items-center py-4 px-8 @max-sm:px-4"
                                style={{
                                    border: '1px solid var(--sg-border, rgba(0,0,0,0.1))',
                                    borderRadius: 'var(--radius-md, 8px)',
                                }}
                            >
                                {renderBlocks(blocks)}
                            </div>
                        </div>
                    </nav>
                </SectionIdContext>
            </SectionSelectionWrapper>
        )
    }

    // ── Two-row shell (top info row + main nav) ──
    if (shell === 'two-row') {
        return (
            <SectionSelectionWrapper sectionId={sectionId}>
                <SectionIdContext value={sectionId}>
                    <nav
                        className={className}
                        style={{
                            containerType: 'inline-size',
                            backgroundColor: 'var(--sg-bg-primary)',
                            color: 'var(--sg-text-primary)',
                        }}
                    >
                        <div
                            className="mx-auto px-16 @max-sm:px-5"
                            style={{ maxWidth: '1280px' }}
                        >
                            {renderBlocks(blocks)}
                        </div>
                    </nav>
                </SectionIdContext>
            </SectionSelectionWrapper>
        )
    }

    // ── Default bar shell (standard full-width navbar) ──
    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <nav
                    className={className}
                    style={{
                        containerType: 'inline-size',
                        backgroundColor: 'var(--sg-bg-primary)',
                        color: 'var(--sg-text-primary)',
                    }}
                >
                    <div
                        className="mx-auto flex items-center py-4 px-16 @max-sm:py-3 @max-sm:px-5"
                        style={{ maxWidth: '1280px' }}
                    >
                        {renderBlocks(blocks)}
                    </div>
                </nav>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
