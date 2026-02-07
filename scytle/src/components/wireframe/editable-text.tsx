'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { AITextMenu } from './ai-text-menu'

export interface EditableTextProps {
    value: string
    onChangeAction: (value: string) => void
    placeholder?: string
    variant?: 'heading' | 'subheading' | 'body' | 'button' | 'caption'
    className?: string
    disabled?: boolean
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
    placeholder = 'Click to edit...',
    variant = 'body',
    className,
    disabled = false,
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
            onChangeAction(newValue)
        }
    }, [value, onChangeAction])

    // Handle key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            inputRef.current?.blur()
        }
        if (e.key === 'Escape') {
            e.preventDefault()
            setLocalValue(value) // Revert
            setIsEditing(false)
            setIsSelected(false)
        }
    }, [value])

    // Handle input changes
    const handleInput = useCallback(() => {
        const newValue = inputRef.current?.textContent || ''
        setLocalValue(newValue)
    }, [])

    // Handle AI text generation result
    const handleAIResult = useCallback((newText: string) => {
        setLocalValue(newText)
        onChangeAction(newText)
        setIsAIMenuOpen(false)
        setIsLoading(false)
    }, [onChangeAction])

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

    return (
        <div
            ref={containerRef}
            className={cn(
                'relative group',
                disabled && 'pointer-events-none opacity-50',
                className
            )}
        >
            {/* Text Display / Input */}
            <div
                ref={inputRef}
                contentEditable={isEditing}
                suppressContentEditableWarning
                className={cn(
                    'outline-none rounded px-1 -mx-1 transition-all',
                    variantClasses[variant],
                    isEmpty && 'text-muted-foreground italic',
                    isSelected && !isEditing && 'ring-2 ring-primary/50 bg-primary/5',
                    isEditing && 'ring-2 ring-primary bg-white',
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
            </div>

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
