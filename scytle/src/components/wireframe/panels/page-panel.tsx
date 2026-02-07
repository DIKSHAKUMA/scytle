'use client'

import { useState, useCallback, useEffect } from 'react'
import { X, Bookmark, Shuffle, Wand2, Sparkles, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUnifiedStore } from '@/store'
import type { WireframePage } from '@/types'

interface PagePanelProps {
    page: WireframePage
    onCloseAction: () => void
    className?: string
}

/**
 * PagePanel Component
 * 
 * Design inspiration:
 * - Figma: Clean property panels with minimal chrome
 * - Relume: Action buttons with clear hierarchy
 * - Linear: Subtle backgrounds, consistent spacing
 * 
 * Shows when a page frame is selected (not a section).
 * Allows editing page properties and triggering AI generation.
 */
export function PagePanel({ page, onCloseAction, className }: PagePanelProps) {
    const [name, setName] = useState(page.name)
    const [description, setDescription] = useState(page.description || '')
    const [isGenerating, setIsGenerating] = useState(false)
    const [showPromptInput, setShowPromptInput] = useState(false)

    const { updatePage } = useUnifiedStore()

    // Sync local state when page changes
    useEffect(() => {
        setName(page.name)
        setDescription(page.description || '')
    }, [page.id, page.name, page.description])

    // Debounced save
    const handleNameChange = useCallback((value: string) => {
        setName(value)
        // Auto-save would go here with debounce
    }, [])

    const handleDescriptionChange = useCallback((value: string) => {
        setDescription(value)
    }, [])

    const handleSaveAsTemplate = useCallback(() => {
        // TODO: Implement save as template
        console.log('📦 Save as template:', page.id)
    }, [page.id])

    const handleShuffleComponents = useCallback(() => {
        // TODO: Implement shuffle
        console.log('🔀 Shuffle components:', page.id)
    }, [page.id])

    const handleGenerateCopy = useCallback(() => {
        // TODO: Implement AI copy generation
        console.log('✨ Generate copy for page:', page.id)
    }, [page.id])

    const handleGeneratePage = useCallback(async () => {
        setIsGenerating(true)
        try {
            // Call the generate page API
            const response = await fetch('/api/wireframe/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageId: page.id,
                    pageName: name,
                    pageDescription: description,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to generate page')
            }

            const data = await response.json()
            console.log('✅ Generated page:', data)
            // The store will be updated by the API response
        } catch (error) {
            console.error('❌ Generation failed:', error)
        } finally {
            setIsGenerating(false)
        }
    }, [page.id, name, description])

    return (
        <div className={cn(
            'flex flex-col h-full min-h-0 bg-background',
            className
        )}>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="text-sm font-semibold text-foreground">Page</h2>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onCloseAction}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Panel Content */}
            <ScrollArea className="flex-1 h-0">
                <div className="p-4 space-y-4">
                    {/* Name Field */}
                    <div className="space-y-1.5">
                        <Label htmlFor="page-name" className="text-xs font-medium">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="page-name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Enter page name"
                            className="h-9"
                        />
                    </div>

                    {/* Description Field */}
                    <div className="space-y-1.5">
                        <Label htmlFor="page-description" className="text-xs font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="page-description"
                            value={description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            placeholder="Add a unique description to regenerate the page with a new layout and copy..."
                            rows={3}
                            className="resize-none text-sm"
                        />

                        {/* Prompt Enhancement */}
                        {!showPromptInput && (
                            <button
                                onClick={() => setShowPromptInput(true)}
                                className="text-xs text-primary hover:underline"
                            >
                                + Prompt
                            </button>
                        )}

                        {showPromptInput && (
                            <Textarea
                                placeholder="Add specific instructions for AI generation..."
                                rows={2}
                                className="resize-none text-sm mt-2"
                            />
                        )}
                    </div>

                    <Separator />

                    {/* Action Buttons */}
                    <div className="space-y-1.5">
                        <Button
                            variant="ghost"
                            className="w-full justify-start h-9 px-3 text-sm font-normal"
                            onClick={handleSaveAsTemplate}
                        >
                            <Bookmark className="h-4 w-4 mr-2 text-muted-foreground" />
                            Save as Page Template
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start h-9 px-3 text-sm font-normal"
                            onClick={handleShuffleComponents}
                        >
                            <Shuffle className="h-4 w-4 mr-2 text-muted-foreground" />
                            Shuffle components
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full justify-start h-9 px-3 text-sm font-normal"
                            onClick={handleGenerateCopy}
                        >
                            <Wand2 className="h-4 w-4 mr-2 text-muted-foreground" />
                            Generate copy
                        </Button>
                    </div>

                    <Separator />

                    {/* Generate Page Button */}
                    <div className="space-y-2">
                        <Button
                            className="w-full"
                            onClick={handleGeneratePage}
                            disabled={isGenerating}
                        >
                            {isGenerating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Generate page
                                </>
                            )}
                        </Button>

                        <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                            <span>This will override all page sections and copy</span>
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    )
}
