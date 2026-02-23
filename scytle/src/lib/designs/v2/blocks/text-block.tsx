/**
 * TextBlock — Token-driven paragraph / body text
 *
 * Reads from CSS custom properties:
 *   --sg-body-size, --sg-body-large-size, --sg-caption-size
 *   --sg-font-body
 *   --sg-body-weight
 *   --sg-text-secondary (body), --sg-text-muted (caption)
 *
 * Supports inline contentEditable editing via the V2 selection store.
 */

'use client'

import { useCallback, useContext, useLayoutEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useSelectionStore } from '@/store/selection-store'
import { useUnifiedStore } from '@/store'
import { SectionIdContext } from '../selection/contexts'
import type { Block, TextBlockProps, TextBlockContent, TextVariant, TextAlign } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Alignment
// ============================================

const ALIGN_CLASS: Record<TextAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
}

// ============================================
// Variant → CSS token mapping
// ============================================

const VARIANT_STYLES: Record<TextVariant, { sizeVar: string; colorVar: string; lineHeight: string }> = {
    body: {
        sizeVar: 'var(--sg-body-size)',
        colorVar: 'var(--sg-text-secondary)',
        lineHeight: '1.6',
    },
    'body-large': {
        sizeVar: 'var(--sg-body-large-size)',
        colorVar: 'var(--sg-text-secondary)',
        lineHeight: '1.6',
    },
    small: {
        sizeVar: '0.875rem',
        colorVar: 'var(--sg-text-secondary)',
        lineHeight: '1.5',
    },
    caption: {
        sizeVar: 'var(--sg-caption-size)',
        colorVar: 'var(--sg-text-muted)',
        lineHeight: '1.5',
    },
}

// ============================================
// Component
// ============================================

export function TextBlock({ block, className }: Props) {
    const elRef = useRef<HTMLParagraphElement>(null)
    const props = block.props as unknown as TextBlockProps
    const content = block.content as unknown as TextBlockContent

    const variant = props.variant ?? 'body'
    const align = props.align ?? 'left'
    const bold = props.bold ?? false
    const text = content.text ?? ''

    const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.body

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

        // If another viewport instance of this block already has focus, skip
        const activeEl = document.activeElement as HTMLElement | null
        if (activeEl && activeEl !== el && activeEl.getAttribute('data-layer-id') === block.id) {
            return
        }

        el.focus()
        requestAnimationFrame(() => {
            if (document.activeElement !== el) el.focus()
            const sel = window.getSelection()
            if (sel) {
                sel.selectAllChildren(el)
                sel.collapseToEnd()
            }
        })
    }, [isEditing, block.id])

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
    const handleBlur = useCallback((e: React.FocusEvent) => {
        const related = e.relatedTarget as HTMLElement | null
        if (related?.closest(`[data-layer-id="${block.id}"]`)) {
            return
        }

        if (!elRef.current) return
        const newText = elRef.current.textContent ?? ''
        if (newText !== text && selectedPageId && selSectionId) {
            updateBlockContent(selectedPageId, selSectionId, block.id, { text: newText })
        }
        stopEditing()
    }, [block.id, text, selectedPageId, selSectionId, updateBlockContent, stopEditing])

    // Escape cancels edit (paragraphs allow Enter for newlines within reason)
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault()
                // Restore original text and blur
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
        <p
            ref={elRef}
            className={cn(
                ALIGN_CLASS[align],
                isEditing && 'outline-none cursor-text select-text',
                className,
            )}
            style={{
                fontSize: variantStyle.sizeVar,
                lineHeight: variantStyle.lineHeight,
                fontFamily: 'var(--sg-font-body)',
                fontWeight: bold ? 700 : 'var(--sg-body-weight)',
                color: variantStyle.colorVar,
                ...(isEditing ? { userSelect: 'text', WebkitUserSelect: 'text' } : {}),
            } as React.CSSProperties}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onDoubleClick={!isEditing ? handleSelfDoubleClick : undefined}
            onBlur={isEditing ? handleBlur : undefined}
            onKeyDown={isEditing ? handleKeyDown : undefined}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Text"
        >
            {text}
        </p>
    )
}
