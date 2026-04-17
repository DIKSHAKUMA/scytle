import { memo, type CSSProperties, createElement, useRef, useEffect, useCallback, useState } from 'react'
import type { TextNode } from '@/types/canvas'
import { useEditorStore } from '@/store/editor-store'
import { computeBaseStyles } from './render-utils'
import { loadFont, isFontLoaded } from '@/lib/fonts/google-fonts'
import { useThemeResolver } from '@/lib/theme/theme-context'
import { resolveColor, resolveFont, resolveNumber } from '@/lib/theme/theme-resolver'

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

    // ── Theme resolver ─────────────────────────────────────────
    const themeCtx = useThemeResolver()

    // ── Resolve theme refs (before font loading effect) ──────
    const resolvedFontFamily = node.fontFamilyRef && themeCtx
        ? resolveFont(node.fontFamilyRef, node.fontFamily, themeCtx.table, themeCtx.mode)
        : node.fontFamily
    const resolvedFontSize = node.fontSizeRef && themeCtx
        ? resolveNumber(node.fontSizeRef, node.fontSize, themeCtx.table, themeCtx.mode)
        : node.fontSize
    const resolvedColor = node.colorRef && themeCtx
        ? resolveColor(node.colorRef, node.color, themeCtx.table, themeCtx.mode)
        : node.color
    const resolvedFontWeight = node.fontWeightRef && themeCtx
        ? resolveNumber(node.fontWeightRef, node.fontWeight, themeCtx.table, themeCtx.mode)
        : node.fontWeight

    // ── Google Font loading ────────────────────────────────────
    // Load the font on mount and whenever fontFamily changes.
    // The tick counter forces a re-render once the font finishes loading,
    // so the browser repaints the text in the correct typeface.
    const [, setFontTick] = useState(0)
    useEffect(() => {
        const fontToLoad = resolvedFontFamily
        if (!isFontLoaded(fontToLoad)) {
            loadFont(fontToLoad).then(() => {
                setFontTick((t) => t + 1)
            })
        }
    }, [resolvedFontFamily])

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

        if (newText.trim() === '') {
            useEditorStore.getState().deleteNode(node.id)
            useEditorStore.getState().setEditingNodeId(null)
            return
        }

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
    const baseStyle = computeBaseStyles(node, isTopLevel, parentDirection, parentLayoutMode, themeCtx)

    // For text nodes, fills should color the text itself (CSS color or background-clip: text),
    // not the bounding box. We remove the background properties from computeBaseStyles.
    const {
        backgroundColor: _bgCol,
        backgroundImage: _bgImg,
        backgroundSize: _bgSize,
        backgroundPosition: _bgPos,
        backgroundRepeat: _bgRep,
        ...textIntrinsicStyles
    } = baseStyle

    // Resolve text color from node.fills (Figma parity)
    const visibleFills = node.fills.filter((f) => f.visible !== false)
    const firstFill = visibleFills[0]

    // ── Line height (unit-aware) ───────────────────────────────────────────────
    const lhUnit = node.lineHeightUnit ?? (node.lineHeight === 'auto' ? 'auto' : 'px')
    const lineHeightCSS: string | number = (() => {
        if (lhUnit === 'auto' || node.lineHeight === 'auto') return 'normal'
        const val = node.lineHeight as number
        if (lhUnit === '%') return `${val}%`
        return val <= 4 ? val : `calc(${val}px * var(--z, 1))`
    })()

    // ── Letter spacing (unit-aware) ───────────────────────────────────────────
    const letterSpacingCSS: string | undefined = (() => {
        if (node.letterSpacing === 0) return undefined
        const lsUnit = node.letterSpacingUnit ?? 'px'
        if (lsUnit === '%') return `${node.letterSpacing / 100}em`
        return `calc(${node.letterSpacing}px * var(--z, 1))`
    })()

    // ── Text transform ────────────────────────────────────────────────────────
    const isSmallCaps = node.textTransform === 'small-caps'
    const textTransformCSS = (!isSmallCaps && node.textTransform !== 'none')
        ? (node.textTransform as CSSProperties['textTransform'])
        : undefined

    // ── Vertical alignment ───────────────────────────────────────────────────
    const vAlign = node.textAlignVertical ?? 'top'
    const isFixedHeight = node.autoResize === 'none' || node.autoResize === 'truncate'
    const vAlignStyle: CSSProperties = (isFixedHeight && vAlign !== 'top')
        ? {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: vAlign === 'center' ? 'center' : 'flex-end',
        } : {}

    // ── List style ────────────────────────────────────────────────────────────
    const listStyle = node.listStyle ?? 'none'
    const listStyleCSS: CSSProperties = listStyle !== 'none' ? {
        display: 'list-item',
        listStyleType: listStyle === 'ordered' ? 'decimal' : 'disc',
        listStylePosition: node.hangingList ? 'outside' : 'inside',
        ...(node.hangingList ? { paddingLeft: `calc(1.2em * var(--z, 1))` } : {}),
    } : {}

    // ── OpenType feature settings ─────────────────────────────────────────────
    const opentypeCSS = node.opentypeFlags && Object.keys(node.opentypeFlags).length > 0
        ? Object.entries(node.opentypeFlags).map(([tag, val]) => `"${tag}" ${val}`).join(', ')
        : undefined

    const textFillStyles: CSSProperties = (() => {
        if (!firstFill) return { color: 'transparent' }

        if (firstFill.type === 'solid') {
            const color = firstFill.colorRef && themeCtx
                ? resolveColor(firstFill.colorRef, firstFill.color, themeCtx.table, themeCtx.mode)
                : firstFill.color
            const opacity = firstFill.opacity ?? 1
            const h = color.replace('#', '').slice(0, 6).padEnd(6, '0')
            const r = parseInt(h.slice(0, 2), 16) || 0
            const g = parseInt(h.slice(2, 4), 16) || 0
            const b = parseInt(h.slice(4, 6), 16) || 0
            return { color: `rgba(${r},${g},${b},${opacity})` }
        }

        if (firstFill.type === 'gradient') {
            const fillStyles = baseStyle as CSSProperties
            return {
                backgroundImage: fillStyles.backgroundImage,
                backgroundSize: fillStyles.backgroundSize,
                backgroundPosition: fillStyles.backgroundPosition,
                backgroundRepeat: fillStyles.backgroundRepeat,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
            }
        }

        return { color: 'transparent' }
    })()

    const style: CSSProperties = {
        ...textIntrinsicStyles,
        ...vAlignStyle,
        ...listStyleCSS,
        ...textFillStyles,
        // Typography core
        fontFamily: `"${resolvedFontFamily}", sans-serif`,
        fontWeight: resolvedFontWeight,
        fontStyle: node.fontStyle === 'italic' ? 'italic' : undefined,
        fontSize: `calc(${resolvedFontSize}px * var(--z, 1))`,
        lineHeight: lineHeightCSS,
        letterSpacing: letterSpacingCSS,
        textAlign: node.textAlign as CSSProperties['textAlign'],
        textTransform: textTransformCSS,
        fontVariantCaps: isSmallCaps ? 'small-caps' : undefined,
        textDecoration: node.textDecoration !== 'none' ? node.textDecoration : undefined,
        // Paragraph indent — CSS text-indent applies to first line of each paragraph
        textIndent: node.paragraphIndent ? `calc(${node.paragraphIndent}px * var(--z, 1))` : undefined,
        // Hanging punctuation (CSS, limited browser support but gracefully degrades)
        hangingPunctuation: (node.hangingPunctuation ? 'first last' : undefined) as CSSProperties['hangingPunctuation'],
        // OpenType features
        fontFeatureSettings: opentypeCSS,
        // Auto-resize modes:
        // 'width-and-height' = no wrapping, grows in both axes (Figma "Auto width")
        // 'height'           = fixed width, grows vertically (Figma "Auto height")
        // 'none'|'truncate'  = fully fixed dimensions
        whiteSpace: node.autoResize === 'width-and-height' ? 'nowrap' : 'pre-wrap',
        wordBreak: node.autoResize === 'width-and-height' ? undefined : 'break-word',
        ...(node.autoResize === 'width-and-height' ? { width: 'auto', minWidth: 1 } : {}),
        ...(node.autoResize === 'height' ? { height: 'auto', minHeight: 1 } : {}),
        // Reset browser default margins on headings/paragraphs, but preserve
        // auto margins and explicit margins already set by computeBaseStyles
        ...(!baseStyle.margin ? { margin: 0 } : {}),
        // Editing overrides
        ...(isEditing ? { outline: 'none', cursor: 'text', caretColor: 'currentColor' } : {}),
        // Truncation mode (disabled during editing to allow text selection)
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
