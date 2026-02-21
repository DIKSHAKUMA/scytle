'use client'

import { useState, useCallback } from 'react'
import { X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { useStyleGuideStore, useUnifiedStore } from '@/store'
import { ColorsSection } from './style-guide/colors-section'
import { TypographySection } from './style-guide/typography-section'
import { UIStylingSection } from './style-guide/ui-styling-section'
import { ConceptDropdown } from './style-guide/concept-dropdown'

interface StyleGuidePanelProps {
    onCloseAction: () => void
    className?: string
}

/**
 * StyleGuidePanel — Top-level Style Guide editor panel.
 *
 * Hosts Colors, Typography, UI Styling sections in a scrollable column.
 * Matches the Relume Style Guide Editor left-panel structure.
 * 
 * Supports "subpanel" navigation: when a user clicks an accent card
 * or font card, we push a subpanel ID onto the stack, rendering
 * that subpanel over the main content.
 */
export type SubpanelId =
    | { type: 'color-picker'; accentId: string }
    | { type: 'font-browser'; target: 'heading' | 'body' }
    | { type: 'buttons-forms' }
    | { type: 'cards-images' }

export function StyleGuidePanel({ onCloseAction, className }: StyleGuidePanelProps) {
    const [activeSubpanel, setActiveSubpanel] = useState<SubpanelId | null>(null)

    const handleCloseSubpanel = useCallback(() => {
        setActiveSubpanel(null)
    }, [])

    const handleSchemeShuffleAll = useCallback(() => {
        // Shuffle schemes for all sections across all pages
        // (Relume's SPACE shuffle randomizes every section's scheme)
        const sgStore = useStyleGuideStore.getState()
        const pages = useUnifiedStore.getState().pages
        const allSectionIds = pages.flatMap(p => p.sections.map(s => s.id))

        if (allSectionIds.length === 0) {
            sgStore.clearAllSectionSchemes()
            return
        }

        for (const sectionId of allSectionIds) {
            sgStore.shuffleSectionScheme(sectionId)
        }
    }, [])

    return (
        <div className={cn('flex flex-col h-full min-h-0 bg-background', className)}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
                <h2 className="text-sm font-semibold text-foreground">Style Guide</h2>
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={onCloseAction}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Concept Dropdown */}
            <div className="px-4 py-2 border-b shrink-0">
                <ConceptDropdown />
            </div>

            {/* Content — Scrollable main area OR subpanel */}
            <ScrollArea className="flex-1 h-0">
                <div className="p-4 space-y-6 pb-20">
                    <ColorsSection
                        activeSubpanel={activeSubpanel}
                        onOpenSubpanel={setActiveSubpanel}
                        onCloseSubpanel={handleCloseSubpanel}
                    />

                    <Separator />

                    <TypographySection
                        activeSubpanel={activeSubpanel}
                        onOpenSubpanel={setActiveSubpanel}
                        onCloseSubpanel={handleCloseSubpanel}
                    />

                    <Separator />

                    <UIStylingSection
                        activeSubpanel={activeSubpanel}
                        onOpenSubpanel={setActiveSubpanel}
                        onCloseSubpanel={handleCloseSubpanel}
                    />
                </div>
            </ScrollArea>

            {/* Footer — Scheme Shuffle */}
            <button
                onClick={handleSchemeShuffleAll}
                className="w-full py-2.5 text-xs border-t flex items-center justify-center gap-2 hover:bg-muted transition-colors shrink-0 text-muted-foreground hover:text-foreground"
            >
                <Sparkles className="h-3.5 w-3.5" />
                Scheme shuffle
                <kbd className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono">SPACE</kbd>
            </button>
        </div>
    )
}
