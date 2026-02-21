'use client'

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStyleGuideStore } from '@/store'
import { ButtonsFormsSubpanel } from './buttons-forms-subpanel'
import { CardsImagesSubpanel } from './cards-images-subpanel'
import type { SubpanelId } from '../style-guide-panel'

interface UIStylingProps {
    activeSubpanel: SubpanelId | null
    onOpenSubpanel: (id: SubpanelId) => void
    onCloseSubpanel: () => void
}

/**
 * UIStylingSection — UI Styling panel within the Style Guide.
 *
 * Shows Buttons & Forms and Cards & Images preview cards.
 * Clicking a card opens the respective subpanel with radius picker + style presets.
 */
export function UIStylingSection({ activeSubpanel, onOpenSubpanel, onCloseSubpanel }: UIStylingProps) {
    const concept = useStyleGuideStore(s => s.getActiveConcept())
    const shuffleUI = useStyleGuideStore(s => s.shuffleUI)

    const { buttonStyle, buttonRadius, cardStyle, cardRadius } = concept.ui
    const accentHex = concept.colors.accents[0]?.hex ?? '#6366f1'

    /* ── Subpanel routing ── */
    if (activeSubpanel?.type === 'buttons-forms') {
        return <ButtonsFormsSubpanel onBackAction={onCloseSubpanel} />
    }
    if (activeSubpanel?.type === 'cards-images') {
        return <CardsImagesSubpanel onBackAction={onCloseSubpanel} />
    }

    return (
        <div className="space-y-3">
            {/* Header Row */}
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-foreground">UI Styling</h3>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1 px-2"
                    onClick={shuffleUI}
                >
                    <Sparkles className="h-3 w-3" />
                    Shuffle
                    <kbd className="text-[9px] bg-muted px-1 py-0.5 rounded font-mono ml-0.5">U</kbd>
                </Button>
            </div>

            {/* Preview Cards — stacked full-width for clarity */}
            <div className="space-y-2">
                {/* Buttons & Forms Card */}
                <button
                    type="button"
                    onClick={() => onOpenSubpanel({ type: 'buttons-forms' })}
                    className="w-full group rounded-lg bg-muted/40 hover:bg-muted/70 p-3 text-left transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-medium text-foreground">Buttons &amp; Forms</span>
                        <span className="text-[9px] text-muted-foreground/60 capitalize">
                            {buttonStyle} · {buttonRadius === 9999 ? 'pill' : `${buttonRadius}px`}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <div
                            className="h-7 flex-1 text-[9px] flex items-center justify-center font-medium text-white transition-shadow group-hover:shadow-sm"
                            style={{
                                backgroundColor: accentHex,
                                borderRadius: `${Math.min(buttonRadius, 12)}px`,
                            }}
                        >
                            Primary
                        </div>
                        <div
                            className="h-7 flex-1 border text-[9px] flex items-center justify-center font-medium transition-shadow group-hover:shadow-sm"
                            style={{
                                borderColor: accentHex,
                                color: accentHex,
                                borderRadius: `${Math.min(buttonRadius, 12)}px`,
                            }}
                        >
                            Secondary
                        </div>
                    </div>
                </button>

                {/* Cards & Images Card */}
                <button
                    type="button"
                    onClick={() => onOpenSubpanel({ type: 'cards-images' })}
                    className="w-full group rounded-lg bg-muted/40 hover:bg-muted/70 p-3 text-left transition-all cursor-pointer"
                >
                    <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[11px] font-medium text-foreground">Cards &amp; Images</span>
                        <span className="text-[9px] text-muted-foreground/60 capitalize">
                            {cardStyle} · {cardRadius === 9999 ? 'pill' : `${cardRadius}px`}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <div
                            className="flex-1 bg-background border border-border/50 overflow-hidden transition-shadow group-hover:shadow-sm"
                            style={{ borderRadius: `${Math.min(cardRadius, 12)}px` }}
                        >
                            <div
                                className="h-8 w-full bg-foreground/5"
                            />
                            <div className="p-1.5 space-y-1">
                                <div className="h-1 w-3/4 bg-foreground/15 rounded-full" />
                                <div className="h-1 w-1/2 bg-foreground/8 rounded-full" />
                            </div>
                        </div>
                        <div
                            className="flex-1 bg-background border border-border/50 overflow-hidden transition-shadow group-hover:shadow-sm"
                            style={{ borderRadius: `${Math.min(cardRadius, 12)}px` }}
                        >
                            <div
                                className="h-8 w-full bg-foreground/5"
                            />
                            <div className="p-1.5 space-y-1">
                                <div className="h-1 w-2/3 bg-foreground/15 rounded-full" />
                                <div className="h-1 w-1/3 bg-foreground/8 rounded-full" />
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    )
}
