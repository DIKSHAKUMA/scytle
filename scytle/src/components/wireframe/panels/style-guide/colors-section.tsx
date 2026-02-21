'use client'

import { useState, useCallback } from 'react'
import { Sun, Moon, Sparkles, Plus, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useStyleGuideStore } from '@/store'
import { AccentColorCard } from './accent-color-card'
import { ColorPickerSubpanel } from './color-picker-subpanel'
import type { SubpanelId } from '../style-guide-panel'

interface ColorsSectionProps {
    activeSubpanel: SubpanelId | null
    onOpenSubpanel: (id: SubpanelId) => void
    onCloseSubpanel: () => void
}

/**
 * ColorsSection — Colors panel within the Style Guide.
 *
 * Header: "Colors" + Light/Dark toggle + Shuffle C button
 * Body: Accent color cards grid + Add accent + Neutrals card
 *
 * When an accent is clicked, opens the ColorPickerSubpanel inline.
 */
export function ColorsSection({ activeSubpanel, onOpenSubpanel, onCloseSubpanel }: ColorsSectionProps) {
    const concept = useStyleGuideStore(s => s.getActiveConcept())
    const toggleMode = useStyleGuideStore(s => s.toggleMode)
    const shuffleColors = useStyleGuideStore(s => s.shuffleColors)
    const addAccent = useStyleGuideStore(s => s.addAccent)
    const removeAccent = useStyleGuideStore(s => s.removeAccent)
    const updateAccent = useStyleGuideStore(s => s.updateAccent)

    const [copiedNeutral, setCopiedNeutral] = useState(false)

    const mode = concept.colors.mode
    const accents = concept.colors.accents

    const handleAddAccent = useCallback(() => {
        const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        addAccent('New Color', randomHex)
    }, [addAccent])

    const handleCopyAccent = useCallback((accent: typeof accents[0]) => {
        const randomSuffix = Math.floor(Math.random() * 100)
        addAccent(`${accent.name} Copy ${randomSuffix}`, accent.hex)
    }, [addAccent])

    const handleCopyNeutralBase = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(concept.colors.neutralBase)
            setCopiedNeutral(true)
            setTimeout(() => setCopiedNeutral(false), 1200)
        } catch {
            // Fallback
        }
    }, [concept.colors.neutralBase])

    // Check if the color picker subpanel is active
    const activePickerAccentId = activeSubpanel?.type === 'color-picker' ? activeSubpanel.accentId : null
    const activePickerAccent = activePickerAccentId
        ? accents.find(a => a.id === activePickerAccentId) ?? null
        : null

    // If a color picker is open, show it instead of the main content
    if (activePickerAccent) {
        return (
            <ColorPickerSubpanel
                accent={activePickerAccent}
                onBackAction={onCloseSubpanel}
            />
        )
    }

    return (
        <div className="space-y-3">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground">Colors</h3>
                <div className="flex items-center gap-1">
                    {/* Light/Dark Toggle */}
                    <div className="flex items-center bg-muted rounded-md p-0.5">
                        <button
                            type="button"
                            onClick={() => useStyleGuideStore.getState().setMode('light')}
                            className={cn(
                                'w-6 h-6 flex items-center justify-center rounded-[4px] transition-colors',
                                mode === 'light'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            title="Light theme"
                        >
                            <Sun className="h-3 w-3" />
                        </button>
                        <button
                            type="button"
                            onClick={() => useStyleGuideStore.getState().setMode('dark')}
                            className={cn(
                                'w-6 h-6 flex items-center justify-center rounded-[4px] transition-colors',
                                mode === 'dark'
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                            )}
                            title="Dark theme"
                        >
                            <Moon className="h-3 w-3" />
                        </button>
                    </div>

                    {/* Shuffle C */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 px-2"
                        onClick={shuffleColors}
                    >
                        <Sparkles className="h-3 w-3" />
                        Shuffle
                        <kbd className="text-[9px] bg-muted px-1 py-0.5 rounded font-mono ml-0.5">C</kbd>
                    </Button>
                </div>
            </div>

            {/* Neutrals Card */}
            <button
                type="button"
                onClick={handleCopyNeutralBase}
                className="w-full rounded-lg border border-border overflow-hidden hover:ring-2 hover:ring-ring/20 transition-all cursor-pointer text-left"
                title={`Click to copy neutral base: ${concept.colors.neutralBase}`}
            >
                <div
                    className="h-8 w-full"
                    style={{
                        background: `linear-gradient(to right, ${concept.colors.bgPrimary}, ${concept.colors.neutralBase}, ${concept.colors.textPrimary})`,
                    }}
                />
                <div className="px-2.5 py-1.5 bg-muted/50 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-muted-foreground">Neutrals</span>
                    {copiedNeutral ? (
                        <span className="text-[9px] text-green-600 flex items-center gap-0.5">
                            <Check className="h-2.5 w-2.5" />
                            Copied
                        </span>
                    ) : (
                        <span className="text-[9px] text-muted-foreground/50 font-mono">{concept.colors.neutralBase}</span>
                    )}
                </div>
            </button>

            {/* Accent Cards Grid */}
            <div className="grid grid-cols-2 gap-2">
                {accents.map((accent) => (
                    <AccentColorCard
                        key={accent.id}
                        accent={accent}
                        onClickAction={() => onOpenSubpanel({ type: 'color-picker', accentId: accent.id })}
                        onDeleteAction={accents.length > 1 ? () => removeAccent(accent.id) : undefined}
                        onCopyAction={accents.length < 3 ? () => handleCopyAccent(accent) : undefined}
                    />
                ))}

                {/* Add Accent (+) */}
                {accents.length < 3 && (
                    <button
                        type="button"
                        onClick={handleAddAccent}
                        className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center hover:border-muted-foreground/40 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                        <Plus className="h-5 w-5 text-muted-foreground/40" />
                    </button>
                )}
            </div>
        </div>
    )
}
