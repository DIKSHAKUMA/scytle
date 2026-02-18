/**
 * LayerWrapper — Wraps every block to provide selection, hover, and interaction
 *
 * Responsibilities:
 * - Renders `data-layer-*` attributes for DOM queries
 * - Handles click → selectBlock, stopPropagation when entered
 * - Handles hover → setHover with element rect
 * - Visual states: hover outline (dashed), selected outline (solid)
 * - Provides the anchor for future context menu positioning
 *
 * This component only renders interactivity when the parent section
 * is in "entered" or "block-selected" mode. In other modes it's
 * transparent (pass-through).
 */

'use client'

import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useSelectionStore } from '@/store/selection-store'
import type { Block } from '@/lib/designs/v2/blocks/types'
import { BLOCK_TYPE_LABELS } from '@/lib/designs/v2/blocks/types'

// ============================================
// Props
// ============================================

interface LayerWrapperProps {
    block: Block
    children: React.ReactNode
    className?: string
}

// ============================================
// Component
// ============================================

export function LayerWrapper({ block, children, className }: LayerWrapperProps) {
    const ref = useRef<HTMLDivElement>(null)

    const mode = useSelectionStore((s) => s.mode)
    const selectedBlockId = useSelectionStore((s) => s.blockId)
    const hoverId = useSelectionStore((s) =>
        s.hoverTarget?.type === 'block' ? s.hoverTarget.id : null,
    )
    const selectBlock = useSelectionStore((s) => s.selectBlock)
    const setHover = useSelectionStore((s) => s.setHover)

    const isInteractive = mode === 'entered' || mode === 'block-selected'
    const isSelected = selectedBlockId === block.id
    const isHovered = hoverId === block.id && !isSelected

    // ── Click handler ──
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!isInteractive) return
            e.stopPropagation()
            selectBlock(block.id)
        },
        [isInteractive, selectBlock, block.id],
    )

    // ── Hover handlers ──
    const handleMouseEnter = useCallback(() => {
        if (!isInteractive) return
        const rect = ref.current?.getBoundingClientRect()
        setHover({ type: 'block', id: block.id, rect: rect ?? undefined })
    }, [isInteractive, setHover, block.id])

    const handleMouseLeave = useCallback(() => {
        if (!isInteractive) return
        setHover(null)
    }, [isInteractive, setHover])

    const label = BLOCK_TYPE_LABELS[block.type] ?? block.type

    return (
        <div
            ref={ref}
            className={cn(
                'relative transition-[outline,box-shadow] duration-100',
                isInteractive && 'cursor-pointer',
                className,
            )}
            style={getOutlineStyle(isSelected, isHovered, isInteractive)}
            onClick={handleClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label={label}
        >
            {/* Selection label badge — shown when selected */}
            {isSelected && (
                <div
                    className="absolute -top-5 left-0 z-50 pointer-events-none"
                    style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        lineHeight: '1',
                        padding: '2px 6px',
                        borderRadius: '3px 3px 0 0',
                        backgroundColor: 'var(--sel-color, #2563eb)',
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        fontFamily: 'system-ui, sans-serif',
                    }}
                >
                    {label}
                </div>
            )}

            {children}
        </div>
    )
}

// ============================================
// Outline style computation
// ============================================

function getOutlineStyle(
    isSelected: boolean,
    isHovered: boolean,
    isInteractive: boolean,
): React.CSSProperties {
    if (isSelected) {
        return {
            outline: '2px solid var(--sel-color, #2563eb)',
            outlineOffset: '1px',
            // @ts-expect-error CSS custom property for child use
            '--sel-color': '#2563eb',
        }
    }

    if (isHovered && isInteractive) {
        return {
            outline: '1px dashed var(--sel-hover, #93c5fd)',
            outlineOffset: '1px',
        }
    }

    return {}
}
