/**
 * SectionWrapper — Wraps each section for selection state machine integration
 *
 * Handles:
 *   - Section-level click → selectSection (from idle or section-selected)
 *   - Section-level double-click → enterSection
 *   - Visual indicators: selected outline, entered tint
 *   - Canvas background click → clear (via event delegation)
 *
 * This wraps the existing section rendering inside the page-frame loop.
 * It reads from useSelectionStore to determine current state.
 */

'use client'

import { useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useSelectionStore } from '@/store/selection-store'
import { SectionIdContext } from './contexts'

// ============================================
// Props
// ============================================

interface SectionSelectionWrapperProps {
    sectionId: string
    children: React.ReactNode
    className?: string
}

// ============================================
// Component
// ============================================

export function SectionSelectionWrapper({
    sectionId,
    children,
    className,
}: SectionSelectionWrapperProps) {
    const ref = useRef<HTMLDivElement>(null)

    const mode = useSelectionStore((s) => s.mode)
    const selectedSectionId = useSelectionStore((s) => s.sectionId)
    const hoverId = useSelectionStore((s) =>
        s.hoverTarget?.type === 'section' ? s.hoverTarget.id : null,
    )
    const selectSection = useSelectionStore((s) => s.selectSection)
    const enterSection = useSelectionStore((s) => s.enterSection)
    const setHover = useSelectionStore((s) => s.setHover)

    const isSelected = selectedSectionId === sectionId
    const isEntered = isSelected && (mode === 'entered' || mode === 'block-selected')
    const isHovered = hoverId === sectionId && !isSelected

    // ── Click: select section (only in idle or section-selected mode) ──
    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            // If we're inside entered/block-selected mode, clicks propagate
            // to block LayerWrappers. Only section-level clicks when not entered.
            if (mode === 'entered' || mode === 'block-selected') {
                // If the user clicks the section background (not a block),
                // we stay in entered mode. This is a no-op.
                return
            }
            e.stopPropagation()
            selectSection(sectionId)
        },
        [mode, selectSection, sectionId],
    )

    // ── Double-click: enter section ──
    const handleDoubleClick = useCallback(
        (e: React.MouseEvent) => {
            if (mode === 'section-selected' && isSelected) {
                e.stopPropagation()
                enterSection()
            }
        },
        [mode, isSelected, enterSection],
    )

    // ── Hover ──
    const handleMouseEnter = useCallback(() => {
        if (mode === 'idle' || mode === 'section-selected') {
            const rect = ref.current?.getBoundingClientRect()
            setHover({ type: 'section', id: sectionId, rect: rect ?? undefined })
        }
    }, [mode, setHover, sectionId])

    const handleMouseLeave = useCallback(() => {
        setHover(null)
    }, [setHover])

    return (
        <SectionIdContext.Provider value={sectionId}>
            <div
                ref={ref}
                className={cn(
                    'relative transition-[outline,background-color] duration-100',
                    isEntered && 'bg-blue-50/30 dark:bg-blue-950/10',
                    className,
                )}
                style={getSectionOutlineStyle(isSelected, isEntered, isHovered)}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                data-section-id={sectionId}
                data-section-selected={isSelected || undefined}
                data-section-entered={isEntered || undefined}
            >
                {children}
            </div>
        </SectionIdContext.Provider>
    )
}

// ============================================
// Section outline style
// ============================================

function getSectionOutlineStyle(
    isSelected: boolean,
    isEntered: boolean,
    isHovered: boolean,
): React.CSSProperties {
    if (isEntered) {
        return {
            outline: '2px solid #3b82f6',
            outlineOffset: '-1px',
        }
    }

    if (isSelected) {
        return {
            outline: '2px solid #2563eb',
            outlineOffset: '-1px',
        }
    }

    if (isHovered) {
        return {
            outline: '1px dashed #93c5fd',
            outlineOffset: '-1px',
        }
    }

    return {}
}
