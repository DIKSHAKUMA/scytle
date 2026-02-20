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
    const setHover = useSelectionStore((s) => s.setHover)

    const isSelected = selectedSectionId === sectionId
    const isEntered = isSelected && (mode === 'entered' || mode === 'block-selected')
    const isHovered = hoverId === sectionId && !isSelected

    // ── Click / double-click are handled by SectionBlock (outer wrapper)
    // which bridges both unified store and selection store.
    // SectionSelectionWrapper only provides visual indicators + hover. ──

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
