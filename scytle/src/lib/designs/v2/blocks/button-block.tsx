/**
 * ButtonBlock — Token-driven button element
 *
 * Reads from CSS custom properties:
 *   --sg-button-primary-bg, --sg-button-primary-text
 *   --sg-button-secondary-bg, --sg-button-secondary-text, --sg-button-secondary-border
 *   --sg-button-radius
 *   --sg-button-style (solid | outline | ghost | brick | gradient)
 *   --sg-font-body
 *   --sg-bg-accent (for gradient style)
 *
 * Supports inline contentEditable editing via the V2 selection store.
 */

'use client'

import { useCallback, useContext, useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useSelectionStore } from '@/store/selection-store'
import { useUnifiedStore } from '@/store'
import { SectionIdContext } from '../selection/contexts'
import type { Block, ButtonBlockProps, ButtonBlockContent, ButtonVariant } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Size presets
// ============================================

const SIZE_CLASSES: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
}

// ============================================
// Component
// ============================================

export function ButtonBlock({ block, className }: Props) {
    const elRef = useRef<HTMLSpanElement>(null)
    const props = block.props as unknown as ButtonBlockProps
    const content = block.content as unknown as ButtonBlockContent

    const variant = props.variant ?? 'primary'
    const size = props.size ?? 'md'
    const text = content.text ?? 'Button'

    const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

    const sectionId = useContext(SectionIdContext)

    // Selection / editing state
    const isEditing = useSelectionStore((s) => s.isEditing && s.blockId === block.id)
    const stopEditing = useSelectionStore((s) => s.stopEditing)
    const startEditingSel = useSelectionStore((s) => s.startEditing)
    const autoEnterAndSelectBlock = useSelectionStore((s) => s.autoEnterAndSelectBlock)
    const selSectionId = useSelectionStore((s) => s.sectionId)
    const updateBlockContent = useUnifiedStore((s) => s.updateBlockContent)
    const selectedPageId = useUnifiedStore((s) => s.selectedPageId)

    // Focus the element when entering edit mode
    useLayoutEffect(() => {
        if (!isEditing || !elRef.current) return
        const el = elRef.current
        el.focus()
        requestAnimationFrame(() => {
            if (document.activeElement !== el) el.focus()
            const sel = window.getSelection()
            if (sel) {
                sel.selectAllChildren(el)
                sel.collapseToEnd()
            }
        })
    }, [isEditing])

    // Direct double-click on this element — safety net
    const handleSelfDoubleClick = useCallback(
        (e: React.MouseEvent) => {
            if (isEditing) return
            e.stopPropagation()
            if (sectionId) autoEnterAndSelectBlock(block.id, sectionId)
            startEditingSel()
        },
        [isEditing, sectionId, autoEnterAndSelectBlock, block.id, startEditingSel],
    )

    // Commit text on blur
    const handleBlur = useCallback(() => {
        if (!elRef.current) return
        const newText = elRef.current.textContent ?? ''
        if (newText !== text && selectedPageId && selSectionId) {
            updateBlockContent(selectedPageId, selSectionId, block.id, { text: newText })
        }
        stopEditing()
    }, [block.id, text, selectedPageId, selSectionId, updateBlockContent, stopEditing])

    // Enter key commits (no newlines in buttons), Escape cancels
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                elRef.current?.blur()
            } else if (e.key === 'Escape') {
                e.preventDefault()
                if (elRef.current) {
                    elRef.current.textContent = text
                }
                stopEditing()
            }
            // Stop propagation of all keys when editing so keyboard handler doesn't intercept
            e.stopPropagation()
        },
        [text, stopEditing],
    )

    return (
        <span
            ref={elRef}
            role="button"
            className={cn(
                'inline-flex items-center justify-center font-medium transition-colors whitespace-nowrap',
                sizeClass,
                isEditing && 'outline-none cursor-text select-text',
                className,
            )}
            style={{
                ...getButtonStyle(variant),
                ...(isEditing ? { userSelect: 'text', WebkitUserSelect: 'text' } : {}),
            }}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onDoubleClick={!isEditing ? handleSelfDoubleClick : undefined}
            onBlur={isEditing ? handleBlur : undefined}
            onKeyDown={isEditing ? handleKeyDown : undefined}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label={`${variant} Button`}
        >
            {text}
        </span>
    )
}

// ============================================
// Style computation
// ============================================

function getButtonStyle(variant: ButtonVariant): React.CSSProperties {
    const base: React.CSSProperties = {
        fontFamily: 'var(--sg-font-body)',
        borderRadius: 'var(--sg-button-radius)',
    }

    switch (variant) {
        case 'primary':
            return {
                ...base,
                backgroundColor: 'var(--sg-button-primary-bg)',
                color: 'var(--sg-button-primary-text)',
                border: '2px solid transparent',
            }

        case 'secondary':
            return {
                ...base,
                backgroundColor: 'var(--sg-button-secondary-bg)',
                color: 'var(--sg-button-secondary-text)',
                border: '2px solid var(--sg-button-secondary-border)',
            }

        case 'link':
            return {
                ...base,
                backgroundColor: 'transparent',
                color: 'var(--sg-text-primary)',
                border: 'none',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                borderRadius: '0',
                padding: '0',
            }
    }
}
