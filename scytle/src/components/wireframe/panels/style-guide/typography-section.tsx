'use client'

import { useCallback } from 'react'
import { Sparkles, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useStyleGuideStore } from '@/store'
import { FontCard } from './font-card'
import { FontBrowserSubpanel } from './font-browser-subpanel'
import type { SubpanelId } from '../style-guide-panel'
import type { SizeScale, HeadingWeight, LetterSpacingStyle } from '@/lib/designs/v2/tokens'

interface TypographySectionProps {
    activeSubpanel: SubpanelId | null
    onOpenSubpanel: (id: SubpanelId) => void
    onCloseSubpanel: () => void
}

// --- Dropdown option definitions ---
const SIZE_OPTIONS: { value: SizeScale; label: string }[] = [
    { value: 0.875, label: 'Small' },
    { value: 1, label: 'Regular' },
    { value: 1.125, label: 'Large' },
]

const WEIGHT_OPTIONS: { value: HeadingWeight; label: string }[] = [
    { value: 400, label: 'Normal' },
    { value: 500, label: 'Medium' },
    { value: 600, label: 'Semibold' },
    { value: 700, label: 'Bold' },
    { value: 800, label: 'Extra Bold' },
]

const SPACING_OPTIONS: { value: LetterSpacingStyle; label: string }[] = [
    { value: 'default', label: 'Default' },
    { value: 'tight', label: 'Tight' },
    { value: 'wide', label: 'Wide' },
]

function getSizeLabel(scale: SizeScale): string {
    return SIZE_OPTIONS.find(o => o.value === scale)?.label ?? 'Regular'
}

function getWeightLabel(weight: HeadingWeight): string {
    return WEIGHT_OPTIONS.find(o => o.value === weight)?.label ?? 'Medium'
}

/**
 * TypographySection — Typography panel within the Style Guide.
 *
 * Header: "Typography" + Style dropdown + Shuffle T button
 * Body: Heading font card + Body font card
 *
 * When a font card is clicked, opens FontBrowserSubpanel inline.
 */
export function TypographySection({ activeSubpanel, onOpenSubpanel, onCloseSubpanel }: TypographySectionProps) {
    const concept = useStyleGuideStore(s => s.getActiveConcept())
    const shuffleTypography = useStyleGuideStore(s => s.shuffleTypography)
    const setSizeScale = useStyleGuideStore(s => s.setSizeScale)
    const setHeadingWeight = useStyleGuideStore(s => s.setHeadingWeight)
    const setLetterSpacingStyle = useStyleGuideStore(s => s.setLetterSpacingStyle)

    const { headingFont, bodyFont, sizeScale, headingWeight, letterSpacingStyle } = concept.typography

    // Shuffle just the heading or body font individually (using the full pair shuffle as fallback)
    const handleShuffleFont = useCallback(() => {
        shuffleTypography()
    }, [shuffleTypography])

    // Check if font browser subpanel is active
    const activeFontTarget = activeSubpanel?.type === 'font-browser' ? activeSubpanel.target : null

    // If font browser is open, show it instead of main content
    if (activeFontTarget) {
        return (
            <FontBrowserSubpanel
                target={activeFontTarget}
                onBackAction={onCloseSubpanel}
            />
        )
    }

    const dropdownLabel = `${getSizeLabel(sizeScale)} · ${getWeightLabel(headingWeight).toLowerCase()}`

    return (
        <div className="space-y-3">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground">Typography</h3>
                <div className="flex items-center gap-1">
                    {/* Style Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-[10px] px-2 font-normal text-muted-foreground max-w-[110px] truncate"
                            >
                                <span className="truncate">{dropdownLabel}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            {/* Size group */}
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground font-medium">
                                Size
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                                {SIZE_OPTIONS.map(opt => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => setSizeScale(opt.value)}
                                        className="text-xs flex items-center justify-between"
                                    >
                                        {opt.label}
                                        {sizeScale === opt.value && <Check className="h-3 w-3 text-foreground" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            {/* Weight group */}
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground font-medium">
                                Weight
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                                {WEIGHT_OPTIONS.map(opt => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => setHeadingWeight(opt.value)}
                                        className="text-xs flex items-center justify-between"
                                    >
                                        {opt.label}
                                        {headingWeight === opt.value && <Check className="h-3 w-3 text-foreground" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>

                            <DropdownMenuSeparator />

                            {/* Letter Spacing group */}
                            <DropdownMenuLabel className="text-[10px] text-muted-foreground font-medium">
                                Letter Spacing
                            </DropdownMenuLabel>
                            <DropdownMenuGroup>
                                {SPACING_OPTIONS.map(opt => (
                                    <DropdownMenuItem
                                        key={opt.value}
                                        onClick={() => setLetterSpacingStyle(opt.value)}
                                        className="text-xs flex items-center justify-between"
                                    >
                                        {opt.label}
                                        {letterSpacingStyle === opt.value && <Check className="h-3 w-3 text-foreground" />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Shuffle T */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs gap-1 px-2"
                        onClick={shuffleTypography}
                    >
                        <Sparkles className="h-3 w-3" />
                        Shuffle
                        <kbd className="text-[9px] bg-muted px-1 py-0.5 rounded font-mono ml-0.5">T</kbd>
                    </Button>
                </div>
            </div>

            {/* Font Cards */}
            <div className="grid grid-cols-2 gap-2">
                <FontCard
                    label="Heading"
                    fontFamily={headingFont}
                    onClickAction={() => onOpenSubpanel({ type: 'font-browser', target: 'heading' })}
                    onShuffleAction={handleShuffleFont}
                />
                <FontCard
                    label="Body"
                    fontFamily={bodyFont}
                    onClickAction={() => onOpenSubpanel({ type: 'font-browser', target: 'body' })}
                    onShuffleAction={handleShuffleFont}
                />
            </div>
        </div>
    )
}
