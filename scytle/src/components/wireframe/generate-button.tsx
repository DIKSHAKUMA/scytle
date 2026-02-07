'use client'

import { useState, useCallback } from 'react'
import { Sparkles, Loader2, Square, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { useGeneration } from './use-generation'
import { ProgressSkeleton } from './skeleton'

interface GenerateButtonProps {
    mode: 'page' | 'section'
    pageId?: string
    pageName?: string
    pageDescription?: string
    sectionId?: string
    variant?: 'default' | 'icon' | 'ghost'
    size?: 'default' | 'sm' | 'lg'
    className?: string
}

/**
 * GenerateButton Component
 * 
 * AI generation trigger for pages and sections.
 * Shows dropdown with generation options.
 */
export function GenerateButton({
    mode,
    pageId,
    pageName,
    pageDescription,
    sectionId,
    variant = 'default',
    size = 'default',
    className,
}: GenerateButtonProps) {
    const [isOpen, setIsOpen] = useState(false)

    const {
        isGenerating,
        progress,
        message,
        generatePageSections,
        generateSectionCopy,
        generatePageCopy,
        shuffleComponent,
        stopGeneration,
    } = useGeneration()

    const handleGenerateSections = useCallback(() => {
        if (pageId && pageName) {
            generatePageSections(pageId, pageName, pageDescription)
        }
        setIsOpen(false)
    }, [pageId, pageName, pageDescription, generatePageSections])

    const handleGeneratePageCopy = useCallback(() => {
        if (pageId) {
            generatePageCopy(pageId)
        }
        setIsOpen(false)
    }, [pageId, generatePageCopy])

    const handleGenerateSectionCopy = useCallback(() => {
        if (sectionId) {
            generateSectionCopy(sectionId)
        }
        setIsOpen(false)
    }, [sectionId, generateSectionCopy])

    const handleShuffle = useCallback(() => {
        if (sectionId) {
            shuffleComponent(sectionId)
        }
        setIsOpen(false)
    }, [sectionId, shuffleComponent])

    // If generating, show progress indicator with stop button
    if (isGenerating) {
        return (
            <div className={cn('flex items-center gap-2', className)}>
                <div className="flex-1 min-w-[120px]">
                    <ProgressSkeleton
                        progress={progress}
                        message={message}
                    />
                </div>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={stopGeneration}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        >
                            <Square className="h-3 w-3 fill-current" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>Stop generation</TooltipContent>
                </Tooltip>
            </div>
        )
    }

    // Icon-only variant
    if (variant === 'icon') {
        return (
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className={cn('h-6 w-6', className)}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>AI Generate</TooltipContent>
                </Tooltip>
                <DropdownMenuContent align="end" className="w-48">
                    {mode === 'page' ? (
                        <>
                            <DropdownMenuItem onClick={handleGenerateSections}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate sections
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleGeneratePageCopy}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate all copy
                            </DropdownMenuItem>
                        </>
                    ) : (
                        <>
                            <DropdownMenuItem onClick={handleGenerateSectionCopy}>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate copy
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleShuffle}>
                                <Shuffle className="h-4 w-4 mr-2" />
                                Shuffle layout
                            </DropdownMenuItem>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    // Default button variant
    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant={variant === 'ghost' ? 'ghost' : 'default'}
                    size={size}
                    className={cn('gap-1.5', className)}
                >
                    <Sparkles className="h-4 w-4" />
                    Generate
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                {mode === 'page' ? (
                    <>
                        <DropdownMenuItem onClick={handleGenerateSections}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate sections
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleGeneratePageCopy}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate all copy
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <DropdownMenuItem onClick={handleGenerateSectionCopy}>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Generate copy
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleShuffle}>
                            <Shuffle className="h-4 w-4 mr-2" />
                            Shuffle layout
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

/**
 * Simple Generate Icon Button
 * 
 * Single-action generate button for inline use.
 */
interface GenerateIconButtonProps {
    onClickAction: () => void
    isLoading?: boolean
    tooltip?: string
    className?: string
}

export function GenerateIconButton({
    onClickAction,
    isLoading = false,
    tooltip = 'Generate with AI',
    className,
}: GenerateIconButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClickAction}
                    disabled={isLoading}
                    className={cn('h-6 w-6', className)}
                >
                    {isLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <Sparkles className="h-3.5 w-3.5" />
                    )}
                </Button>
            </TooltipTrigger>
            <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
    )
}
