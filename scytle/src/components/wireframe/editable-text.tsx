'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AITextMenu } from './ai-text-menu'

export interface EditableTextProps {
    value: string
    /** Called when user commits an edit (Next.js action-compatible alias) */
    onChangeAction?: (value: string) => void
    /** Called when user commits an edit (standard alias, used by Canvas families) */
    onChange?: (value: string) => void
    placeholder?: string
    /** HTML element to render as (for semantic wireframe headings/paragraphs) */
    as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span' | 'div'
    variant?: 'heading' | 'subheading' | 'body' | 'button' | 'caption'
    className?: string
    /** Whether editing is enabled — when false, renders plain static text */
    editable?: boolean
    disabled?: boolean
    /** Allow multiline editing with Shift+Enter */
    multiline?: boolean
    sectionId?: string
    fieldKey?: string
}

/**
 * EditableText Component
 * 
 * Design inspiration:
 * - Notion: Click to select, double-click to edit inline
 * - Webflow: Clean inline editing with minimal UI
 * - v0.dev: AI-assisted text generation
 * 
 * States:
 * 1. Default: Show text, click to select
 * 2. Selected: Show text with selection ring, show AI button
 * 3. Editing: Contenteditable input, blur to save
 * 4. AI Loading: Show spinner while generating
 */
export function EditableText({
    value,
    onChangeAction,
    onChange,
    placeholder = 'Click to edit...',
    as: Tag = 'div',
    variant = 'body',
    className,
    editable = true,
    disabled = false,
    multiline = false,
    sectionId,
    fieldKey,
}: EditableTextProps) {
    const [isSelected, setIsSelected] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isAIMenuOpen, setIsAIMenuOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [localValue, setLocalValue] = useState(value)
    const inputRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    // Unified change handler — calls whichever callback is provided
    const emitChange = useCallback((newValue: string) => {
        onChangeAction?.(newValue)
        onChange?.(newValue)
    }, [onChangeAction, onChange])

    // Sync local value with prop
    useEffect(() => {
        if (!isEditing) {
            setLocalValue(value)
        }
    }, [value, isEditing])

    // Handle click to select
    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        if (disabled) return

        if (!isSelected) {
            setIsSelected(true)
        }
    }, [disabled, isSelected])

    // Handle double-click to edit
    const handleDoubleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        if (disabled) return

        setIsEditing(true)
        setIsSelected(true)

        // Focus the input after render
        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus()
                // Select all text
                const selection = window.getSelection()
                const range = document.createRange()
                range.selectNodeContents(inputRef.current)
                selection?.removeAllRanges()
                selection?.addRange(range)
            }
        }, 0)
    }, [disabled])

    // Handle blur to save
    const handleBlur = useCallback(() => {
        setIsEditing(false)
        setIsSelected(false)

        const newValue = inputRef.current?.textContent || ''
        if (newValue !== value) {
            emitChange(newValue)
        }
    }, [value, emitChange])

    // Handle key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            // Multiline: only save on Enter without Shift
            // Single-line: always save on Enter
            if (!multiline || !e.shiftKey) {
                e.preventDefault()
                inputRef.current?.blur()
            }
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            setLocalValue(value) // Revert
            setIsEditing(false)
            setIsSelected(false)
        }
    }, [value, multiline])

    // Handle input changes
    const handleInput = useCallback(() => {
        const newValue = inputRef.current?.textContent || ''
        setLocalValue(newValue)
    }, [])

    // Handle AI text generation result
    const handleAIResult = useCallback((newText: string) => {
        setLocalValue(newText)
        emitChange(newText)
        setIsAIMenuOpen(false)
        setIsLoading(false)
    }, [emitChange])

    // Handle AI loading state
    const handleAILoading = useCallback((loading: boolean) => {
        setIsLoading(loading)
    }, [])

    // Click outside to deselect
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                if (!isEditing) {
                    setIsSelected(false)
                    setIsAIMenuOpen(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isEditing])

    // Variant styles
    const variantClasses = {
        heading: 'text-2xl font-semibold leading-tight',
        subheading: 'text-lg font-medium leading-snug',
        body: 'text-sm leading-relaxed',
        button: 'text-sm font-medium',
        caption: 'text-xs text-muted-foreground',
    }

    const displayValue = localValue || placeholder
    const isEmpty = !localValue

    // Non-editable: render plain static text with the correct tag
    if (!editable) {
        return (
            <Tag className={className}>
                {value || placeholder}
            </Tag>
        )
    }

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative group',
                disabled && 'pointer-events-none opacity-50',
            )}
        >
            {/* Text Display / Input */}
            <Tag
                ref={inputRef as React.Ref<HTMLElement & HTMLDivElement>}
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={cn(
                    'outline-none rounded px-1 -mx-1 transition-all',
                    variant !== 'body' ? variantClasses[variant] : '',
                    className,
                    isEmpty && 'text-muted-foreground italic',
                    isSelected && !isEditing && 'ring-2 ring-violet-400/50 bg-violet-50/30',
                    isEditing && 'ring-2 ring-violet-500 bg-white',
                    !isEditing && 'cursor-pointer hover:bg-muted/50',
                    isLoading && 'opacity-50'
                )}
                onClick={handleClick}
                onDoubleClick={handleDoubleClick}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
            >
                {displayValue}
            </Tag>

            {/* AI Button - shows when selected */}
            {isSelected && !isEditing && !disabled && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full">
                    <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                            'h-7 px-2 gap-1.5 bg-white shadow-sm border-gray-200',
                            'hover:bg-primary hover:text-primary-foreground hover:border-primary',
                            isLoading && 'opacity-50 pointer-events-none'
                        )}
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsAIMenuOpen(!isAIMenuOpen)
                        }}
                    >
                        {isLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                        )}
                        <span className="text-xs">Ask AI</span>
                    </Button>
                </div>
            )}

            {/* AI Menu Dropdown */}
            {isAIMenuOpen && (
                <AITextMenu
                    currentText={localValue}
                    onResultAction={handleAIResult}
                    onLoadingAction={handleAILoading}
                    onCloseAction={() => setIsAIMenuOpen(false)}
                    sectionId={sectionId}
                    fieldKey={fieldKey}
                />
            )}
        </div>
    )
}
