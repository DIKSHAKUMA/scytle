/**
 * HeadingBlock — Token-driven heading (h1–h6)
 *
 * Reads from CSS custom properties:
 *   --sg-h1-size … --sg-h6-size
 *   --sg-font-heading
 *   --sg-heading-weight
 *   --sg-heading-letter-spacing
 *   --sg-text-primary
 *
 * Supports inline contentEditable editing via the V2 selection store.
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import { useSelectionStore } from '@/store/selection-store'
import { useUnifiedStore } from '@/store'
import type { Block, HeadingBlockProps, HeadingBlockContent, TextAlign } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Alignment utility
// ============================================

const ALIGN_CLASS: Record<TextAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
}

// ============================================
// Size / line-height per level
// ============================================

const LEVEL_STYLES: Record<number, { sizeVar: string; lineHeight: string }> = {
    1: { sizeVar: 'var(--sg-h1-size)', lineHeight: '1.1' },
    2: { sizeVar: 'var(--sg-h2-size)', lineHeight: '1.15' },
    3: { sizeVar: 'var(--sg-h3-size)', lineHeight: '1.2' },
    4: { sizeVar: 'var(--sg-h4-size)', lineHeight: '1.25' },
    5: { sizeVar: 'var(--sg-h5-size)', lineHeight: '1.3' },
    6: { sizeVar: 'var(--sg-h6-size)', lineHeight: '1.35' },
}

// ============================================
// Component
// ============================================

export function HeadingBlock({ block, className }: Props) {
    const elRef = useRef<HTMLHeadingElement>(null)
    const props = block.props as unknown as HeadingBlockProps
    const content = block.content as unknown as HeadingBlockContent

    const level = props.level ?? 1
    const align = props.align ?? 'left'
    const text = content.text ?? ''

    // Selection / editing state
    const isEditing = useSelectionStore((s) => s.isEditing && s.blockId === block.id)
    const stopEditing = useSelectionStore((s) => s.stopEditing)
    const selSectionId = useSelectionStore((s) => s.sectionId)
    const updateBlockContent = useUnifiedStore((s) => s.updateBlockContent)
    const selectedPageId = useUnifiedStore((s) => s.selectedPageId)

    // Focus the element when entering edit mode
    // Use requestAnimationFrame to ensure DOM is fully painted after React commit
    useEffect(() => {
        if (isEditing && elRef.current) {
            const el = elRef.current
            requestAnimationFrame(() => {
                el.focus()
                // Place cursor at end
                const sel = window.getSelection()
                if (sel) {
                    sel.selectAllChildren(el)
                    sel.collapseToEnd()
                }
            })
        }
    }, [isEditing])

    // Commit text on blur
    const handleBlur = useCallback(() => {
        if (!elRef.current) return
        const newText = elRef.current.textContent ?? ''
        if (newText !== text && selectedPageId && selSectionId) {
            updateBlockContent(selectedPageId, selSectionId, block.id, { text: newText })
        }
        stopEditing()
    }, [block.id, text, selectedPageId, selSectionId, updateBlockContent, stopEditing])

    // Enter key commits (no newlines in headings), Escape cancels
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === 'Enter') {
                e.preventDefault()
                elRef.current?.blur()
            } else if (e.key === 'Escape') {
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

    const Tag = `h${level}` as const
    const levelStyle = LEVEL_STYLES[level] ?? LEVEL_STYLES[1]

    return (
        <Tag
            ref={elRef as React.Ref<HTMLHeadingElement>}
            className={cn(
                ALIGN_CLASS[align],
                isEditing && 'outline-none cursor-text select-text',
                className,
            )}
            style={{
                fontSize: levelStyle.sizeVar,
                lineHeight: levelStyle.lineHeight,
                fontFamily: 'var(--sg-font-heading)',
                fontWeight: 'var(--sg-heading-weight)',
                letterSpacing: 'var(--sg-heading-letter-spacing)',
                color: 'var(--sg-text-primary)',
            } as React.CSSProperties}
            contentEditable={isEditing}
            suppressContentEditableWarning
            onBlur={isEditing ? handleBlur : undefined}
            onKeyDown={isEditing ? handleKeyDown : undefined}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label={`H${level}`}
        >
            {text}
        </Tag>
    )
}
