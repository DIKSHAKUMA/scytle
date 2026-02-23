/**
 * CTA — Universal Parametric Section Renderer
 *
 * One component replaces 21 individual section components (1067 → ~150 lines).
 * Reads `CtaPresetConfig.shell`, `.align`, `.background`, and `.contentMaxWidth`
 * to compose the correct structural layers.
 *
 * 6 shell types:
 *   container    — section → container(1280) → blocks
 *   bg-container — section(relative) + bg layer → container(1280, z-1) → blocks
 *   card         — section → container(1280) → card(bg-secondary) → blocks
 *   card-bg      — section → container(1280) → card(relative) + bg inside → blocks
 *   bare         — section → blocks (no container, no card)
 *   expand       — section → padded container(1280) → contentBlocks + full-bleed lastBlock
 */

'use client'

import { useEffect } from 'react'
import type { LayoutProps } from '../../types'
import type { CtaPresetConfig } from '../types'
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
    center: 'flex flex-col items-center',
    none: '',
}

// ============================================
// Universal Section Renderer
// ============================================

export interface CtaSectionShellProps extends LayoutProps {
    config: CtaPresetConfig
}

export function CtaSectionShell({ sectionId, blocks, className, config }: CtaSectionShellProps) {
    useRegisterSectionBlocks(sectionId, blocks)

    const { shell, align, background, contentMaxWidth } = config
    const alignCn = ALIGN_CLASSES[align] ?? ''

    // ── Section-level styles ──
    const hasSectionBg = shell === 'bg-container'
    const hasCardBg = shell === 'card-bg'
    const isCard = shell === 'card' || hasCardBg
    const isBare = shell === 'bare'
    const isExpand = shell === 'expand'

    const sectionStyle: React.CSSProperties = {
        containerType: 'inline-size',
        ...(hasSectionBg
            ? { position: 'relative', color: 'white' }
            : hasCardBg
                ? { backgroundColor: 'var(--sg-bg-primary)', color: 'white' }
                : { backgroundColor: 'var(--sg-bg-primary)', color: 'var(--sg-text-primary)' }
        ),
    }

    // ── Expand: split blocks into content + full-bleed image ──
    const contentBlocks = isExpand ? blocks?.slice(0, -1) : blocks
    const fullBleedBlock = isExpand && blocks && blocks.length > 1 ? blocks[blocks.length - 1] : undefined

    // ── Render blocks helper ──
    const renderBlocks = (b?: Block[]) => b?.map(block => <RenderBlock key={block.id} block={block} />)

    // ── Build inner content ──
    let inner: React.ReactNode

    if (isBare) {
        // Shell: bare — no container, blocks directly in section
        inner = renderBlocks(contentBlocks)

    } else if (isCard) {
        // Shell: card or card-bg
        inner = (
            <div className="mx-auto py-28 px-16 @max-sm:py-16 @max-sm:px-5" style={{ maxWidth: '1280px' }}>
                {hasCardBg ? (
                    // Card with background layer inside
                    <div
                        className={`relative w-full overflow-clip ${align !== 'none' ? `${alignCn} justify-center` : ''} p-16 @max-sm:p-8`}
                        style={{ border: '1px solid var(--sg-border)' }}
                    >
                        <BgLayer background={background as 'image' | 'video'} sectionId={sectionId} />
                        <div
                            className={`relative ${align !== 'none' ? `w-full ${alignCn}` : 'flex flex-col items-start'}`}
                            style={{ zIndex: 1, ...(contentMaxWidth ? { maxWidth: `${contentMaxWidth}px` } : {}) }}
                        >
                            {renderBlocks(contentBlocks)}
                        </div>
                    </div>
                ) : (
                    // Card with solid background (no bg layer)
                    <div
                        className={`${align !== 'none' ? `w-full ${alignCn} justify-center p-16 @max-sm:p-8` : 'overflow-clip'}`}
                        style={{
                            backgroundColor: 'var(--sg-bg-secondary)',
                            border: '1px solid var(--sg-border)',
                            ...(align === 'none' ? { borderRadius: 'var(--sg-card-radius)' } : {}),
                        }}
                    >
                        {renderBlocks(contentBlocks)}
                    </div>
                )}
            </div>
        )

    } else if (isExpand) {
        // Shell: expand — padded container for content, full-bleed image separate
        inner = (
            <div className={`flex flex-col items-center py-28 px-16 @max-sm:py-16 @max-sm:px-5`}>
                <div className={`w-full ${alignCn}`} style={{ maxWidth: '1280px' }}>
                    {renderBlocks(contentBlocks)}
                </div>
            </div>
        )

    } else {
        // Shell: container or bg-container
        const containerCn = [
            'mx-auto',
            hasSectionBg ? 'relative' : '',
            alignCn,
            'py-28 px-16 @max-sm:py-16 @max-sm:px-5',
        ].filter(Boolean).join(' ')

        inner = (
            <div
                className={containerCn}
                style={{ maxWidth: '1280px', ...(hasSectionBg ? { zIndex: 1 } : {}) }}
            >
                {renderBlocks(contentBlocks)}
            </div>
        )
    }

    return (
        <SectionSelectionWrapper sectionId={sectionId}>
            <SectionIdContext value={sectionId}>
                <section className={className} style={sectionStyle}>
                    {hasSectionBg && <BgLayer background={background as 'image' | 'video'} sectionId={sectionId} />}
                    {inner}
                    {isExpand && fullBleedBlock && <RenderBlock block={fullBleedBlock} />}
                </section>
            </SectionIdContext>
        </SectionSelectionWrapper>
    )
}
