import { memo, type CSSProperties, createElement, useRef, useEffect, useCallback } from 'react'
import type { TextNode } from '@/types/canvas'
import { useEditorStore } from '@/store/editor-store'
import { computeBaseStyles } from './render-utils'

// ============================================================
// Props
// ============================================================

interface TextRendererProps {
    node: TextNode
    isTopLevel?: boolean
    parentDirection?: 'row' | 'column'
    parentLayoutMode?: 'flex' | 'grid' | 'none'
}

// ============================================================
// TextRenderer — renders text as the appropriate HTML tag
// ============================================================

export const TextRenderer = memo(function TextRenderer({
    node,
    isTopLevel = false,
    parentDirection,
    parentLayoutMode,
}: TextRendererProps) {
    // ── Inline editing state ──────────────────────────────────
    const editingNodeId = useEditorStore((s) => s.editingNodeId)
    const isEditing = editingNodeId === node.id
    const editRef = useRef<HTMLElement>(null)

    // Focus + select all when entering edit mode
    useEffect(() => {
        if (isEditing && editRef.current) {
            const el = editRef.current
            el.focus()
            const selection = window.getSelection()
            if (selection) {
                const range = document.createRange()
                range.selectNodeContents(el)
                selection.removeAllRanges()
                selection.addRange(range)
            }
        }
    }, [isEditing])

    const commitEdit = useCallback(() => {
        if (!editRef.current) return
        const newText = editRef.current.textContent || ''
        if (newText !== node.characters) {
            useEditorStore.getState().updateNode(node.id, {
                characters: newText,
                name: newText.slice(0, 32) || 'Text',
            })
        }
        useEditorStore.getState().setEditingNodeId(null)
    }, [node.id, node.characters])

    const handleEditKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.preventDefault()
            commitEdit()
        }
        // Stop bubbling to prevent canvas keyboard shortcuts while typing
        e.stopPropagation()
    }, [commitEdit])

    // ── Styles ────────────────────────────────────────────────
    const baseStyle = computeBaseStyles(node, isTopLevel, parentDirection, parentLayoutMode)

    const style: CSSProperties = {
        ...baseStyle,
        // Typography
        fontFamily: node.fontFamily,
        fontWeight: node.fontWeight,
        fontStyle: node.fontStyle === 'italic' ? 'italic' : undefined,
        fontSize: `calc(${node.fontSize}px * var(--z, 1))`,
        // lineHeight from parser is a unitless multiplier (e.g. 1.5);
        // from design system may be absolute pixels (e.g. 24).
        // Multipliers are always ≤ 4; pixel values are always > 4.
        lineHeight:
            node.lineHeight === 'auto'
                ? 'normal'
                : node.lineHeight <= 4
                    ? node.lineHeight
                    : `calc(${node.lineHeight}px * var(--z, 1))`,
        letterSpacing: node.letterSpacing !== 0 ? `calc(${node.letterSpacing}px * var(--z, 1))` : undefined,
        textAlign: node.textAlign,
        textTransform:
            node.textTransform !== 'none' ? node.textTransform : undefined,
        textDecoration:
            node.textDecoration !== 'none' ? node.textDecoration : undefined,
        color: node.color,
        // Auto-resize mode:
        // 'width-and-height' = no wrapping, grows in both dimensions (Figma "Auto width")
        // 'height' = fixed width, grows vertically (Figma "Auto height")
        // 'none' / 'truncate' = fixed width & height
        whiteSpace: node.autoResize === 'width-and-height' ? 'nowrap' : 'pre-wrap',
        wordBreak: node.autoResize === 'width-and-height' ? undefined : 'break-word',
        // In auto-width mode, width should be auto (not fixed)
        ...(node.autoResize === 'width-and-height' ? { width: 'auto', minWidth: 1 } : {}),
        // In auto-height mode, height should be auto
        ...(node.autoResize === 'height' ? { height: 'auto', minHeight: 1 } : {}),
        margin: 0,
        // Editing overrides
        ...(isEditing ? { outline: 'none', cursor: 'text', caretColor: 'currentColor' } : {}),
        // Truncation mode (disabled during editing)
        ...(node.autoResize === 'truncate' && !isEditing
            ? {
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap' as const,
                ...(node.maxLines && node.maxLines > 1
                    ? {
                        display: '-webkit-box',
                        WebkitLineClamp: node.maxLines,
                        WebkitBoxOrient: 'vertical' as const,
                        whiteSpace: 'normal' as const,
                    }
                    : {}),
            }
            : {}),
    }

    // Use the semantic HTML tag if specified, otherwise <p>
    const tag = node.htmlTag || 'p'

    return createElement(tag, {
        ref: editRef,
        'data-node-id': node.id,
        style,
        ...(isEditing
            ? {
                contentEditable: true,
                suppressContentEditableWarning: true,
                onBlur: commitEdit,
                onKeyDown: handleEditKeyDown,
                // Prevent canvas from intercepting pointer events during editing
                onPointerDown: (e: React.PointerEvent) => e.stopPropagation(),
            }
            : {}),
        children: node.characters,
    })
})
