'use client'

/**
 * FloatingToolbar — Appears above selected/editing text in the wireframe canvas.
 * 
 * Features:
 * - Bold, italic formatting (stored as markers in content)
 * - Text alignment quick-toggle (updates section controls)
 * - "✨ AI Rewrite" button (connects to AI rewrite endpoint)
 * - Auto-positions above selection, stays within viewport
 * 
 * Design: Minimal floating bar matching Notion/Webflow style.
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FloatingToolbarProps {
    /** Current text alignment value */
    textAlign?: string
    /** Called when alignment changes */
    onAlignChange?: (align: string) => void
    /** Called when AI rewrite is requested */
    onAIRewrite?: () => void
    /** Called when toolbar is dismissed */
    onDismiss?: () => void
    /** Anchor element to position above */
    anchorRect?: DOMRect | null
    /** Whether the toolbar is visible */
    visible: boolean
}

export function FloatingToolbar({
    textAlign = 'left',
    onAlignChange,
    onAIRewrite,
    onDismiss,
    anchorRect,
    visible,
}: FloatingToolbarProps) {
    const toolbarRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ top: 0, left: 0 })

    // Position toolbar above the anchor element
    useEffect(() => {
        if (!visible || !anchorRect || !toolbarRef.current) return

        const toolbarRect = toolbarRef.current.getBoundingClientRect()
        const padding = 8

        // Center horizontally above the anchor
        let left = anchorRect.left + (anchorRect.width / 2) - (toolbarRect.width / 2)
        let top = anchorRect.top - toolbarRect.height - padding

        // Keep within viewport bounds
        const viewportWidth = window.innerWidth
        const viewportPadding = 8

        if (left < viewportPadding) left = viewportPadding
        if (left + toolbarRect.width > viewportWidth - viewportPadding) {
            left = viewportWidth - toolbarRect.width - viewportPadding
        }

        // If not enough space above, show below
        if (top < viewportPadding) {
            top = anchorRect.bottom + padding
        }

        setPosition({ top, left })
    }, [visible, anchorRect])

    // Apply bold formatting
    const handleBold = useCallback(() => {
        document.execCommand('bold', false)
    }, [])

    // Apply italic formatting
    const handleItalic = useCallback(() => {
        document.execCommand('italic', false)
    }, [])

    if (!visible) return null

    return (
        <div
            ref={toolbarRef}
            className={cn(
                'fixed z-[100] flex items-center gap-0.5 px-1 py-1',
                'bg-white border border-gray-200 rounded-lg shadow-lg',
                'animate-in fade-in-0 zoom-in-95 duration-150',
            )}
            style={{
                top: position.top,
                left: position.left,
            }}
            // Prevent toolbar clicks from bubbling to canvas
            onMouseDown={(e) => e.preventDefault()}
        >
            {/* Formatting Group */}
            <ToolbarButton
                icon={<Bold className="h-3.5 w-3.5" />}
                label="Bold"
                onClick={handleBold}
                shortcut="⌘B"
            />
            <ToolbarButton
                icon={<Italic className="h-3.5 w-3.5" />}
                label="Italic"
                onClick={handleItalic}
                shortcut="⌘I"
            />

            <Divider />

            {/* Alignment Group */}
            <ToolbarButton
                icon={<AlignLeft className="h-3.5 w-3.5" />}
                label="Align Left"
                onClick={() => onAlignChange?.('left')}
                active={textAlign === 'left'}
            />
            <ToolbarButton
                icon={<AlignCenter className="h-3.5 w-3.5" />}
                label="Align Center"
                onClick={() => onAlignChange?.('center')}
                active={textAlign === 'center'}
            />
            <ToolbarButton
                icon={<AlignRight className="h-3.5 w-3.5" />}
                label="Align Right"
                onClick={() => onAlignChange?.('right')}
                active={textAlign === 'right'}
            />

            <Divider />

            {/* AI Rewrite */}
            <button
                onClick={onAIRewrite}
                className={cn(
                    'flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium',
                    'text-violet-600 hover:bg-violet-50 transition-colors',
                )}
                title="AI Rewrite"
            >
                <Sparkles className="h-3.5 w-3.5" />
                <span>AI</span>
            </button>

            {/* Dismiss */}
            {onDismiss && (
                <>
                    <Divider />
                    <ToolbarButton
                        icon={<X className="h-3.5 w-3.5" />}
                        label="Dismiss"
                        onClick={onDismiss}
                    />
                </>
            )}
        </div>
    )
}

// ===== Sub-components =====

function ToolbarButton({
    icon,
    label,
    onClick,
    active = false,
    shortcut,
}: {
    icon: React.ReactNode
    label: string
    onClick: () => void
    active?: boolean
    shortcut?: string
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'flex items-center justify-center w-7 h-7 rounded-md transition-colors',
                active
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            )}
            title={shortcut ? `${label} (${shortcut})` : label}
        >
            {icon}
        </button>
    )
}

function Divider() {
    return <div className="w-px h-5 bg-gray-200 mx-0.5" />
}
