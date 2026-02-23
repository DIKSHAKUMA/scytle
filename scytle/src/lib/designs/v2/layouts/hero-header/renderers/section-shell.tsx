/**
 * Hero Header — Universal Parametric Section Renderer
 *
 * One component handles all 48 hero-header variants via config-driven rendering.
 * 4 shell types:
 *   container    — section(bg-primary) → container(1280) → blocks
 *   bg-container — section(relative) + bg layer(dark overlay) → container(1280, z-1) → blocks
 *   card         — section → container(1280) → bordered card(bg-secondary, min-h-640) → blocks
 *   card-bg      — section → container(1280) → card(relative) + bg layer inside card → blocks
 */

'use client'

import { useEffect } from 'react'
import type { LayoutProps } from '../../types'
import type { HeroHeaderPresetConfig } from '../types'
import { RenderBlock } from '../../../blocks'
import type { Block } from '../../../blocks/types'
import { SectionSelectionWrapper } from '../../../selection'
import { SectionIdContext } from '../../../selection/contexts'
import { useSelectionStore } from '@/store/selection-store'
import { BgImageLayer, BgVideoLayer } from './backgrounds'

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
// Background layer dispatcher
// ============================================

function BgLayer({ background, sectionId }: { background: 'image' | 'video'; sectionId: string }) {
    if (background === 'image') return <BgImageLayer sectionId={sectionId} />
    return <BgVideoLayer />
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

export interface HeroHeaderSectionShellProps extends LayoutProps {
    config: HeroHeaderPresetConfig
}

export function HeroHeaderSectionShell({ sectionId, blocks, className, config }: HeroHeaderSectionShellProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    const { shell, align, background } = config
    const alignCn = ALIGN_CLASSES[align] ?? ''
    const isCard = shell === 'card' || shell === 'card-bg'
    const hasSectionBg = shell === 'bg-container'
    const hasCardBg = shell === 'card-bg'

    // ── Render blocks ──
    const renderBlocks = (b?: Block[]) => b?.map(block => <RenderBlock key={block.id} block={block} />)

    // ── Card shell (card / card-bg) ──
    if (isCard) {
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
                            <div
                                className={[
                                    'flex items-center justify-center',
                                    'px-16 @max-sm:px-8',
                                    hasCardBg ? 'relative overflow-hidden' : '',
                                ].filter(Boolean).join(' ')}
                                style={{
                                    minHeight: '640px',
                                    borderRadius: 'var(--radius-lg, 16px)',
                                    ...(hasCardBg
                                        ? { color: 'white' }
                                        : {
                                            backgroundColor: 'var(--sg-bg-secondary, var(--sg-bg-primary))',
                                            border: '1px solid var(--sg-border, rgba(0,0,0,0.1))',
                                        }
                                    ),
                                    ...(hasCardBg && background === 'video'
                                        ? { backgroundColor: 'var(--sg-neutral-dark, #1a1a1a)' }
                                        : {}
                                    ),
                                }}
                            >
                                {hasCardBg && (
                                    <BgLayer
                                        background={background as 'image' | 'video'}
                                        sectionId={sectionId}
                                    />
                                )}
                                <div
                                    className={alignCn}
                                    style={{
                                        width: '100%',
                                        ...(hasCardBg ? { position: 'relative', zIndex: 1 } : {}),
                                    }}
                                >
                                    {renderBlocks(blocks)}
                                </div>
                            </div>
                        </div>
                    </section>
                </SectionIdContext>
            </SectionSelectionWrapper>
        )
    }

    // ── Container / bg-container shells ──
    const sectionStyle: React.CSSProperties = {
        containerType: 'inline-size',
        ...(hasSectionBg
            ? { position: 'relative', color: 'white' }
            : { backgroundColor: 'var(--sg-bg-primary)', color: 'var(--sg-text-primary)' }
        ),
    }

    const containerCn = [
        'mx-auto',
        hasSectionBg ? 'relative' : '',
        alignCn,
        'py-28 px-16 @max-sm:py-16 @max-sm:px-5',
    ].filter(Boolean).join(' ')

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section className={className} style={sectionStyle}>
                    {hasSectionBg && <BgLayer background={background as 'image' | 'video'} sectionId={sectionId} />}
                    <div
                        className={containerCn}
                        style={{ maxWidth: '1280px', ...(hasSectionBg ? { zIndex: 1 } : {}) }}
                    >
                        {renderBlocks(blocks)}
                    </div>
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
