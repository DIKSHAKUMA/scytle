'use client'

import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStyleGuideStore } from '@/store'
import { RadiusPicker } from './radius-picker'
import type { CardStyle } from '@/lib/designs/v2/tokens'

const CARD_STYLES: { style: CardStyle; label: string }[] = [
    { style: 'default', label: 'Default' },
    { style: 'outlined', label: 'Outlined' },
    { style: 'flat', label: 'Flat' },
]

interface CardsImagesSubpanelProps {
    onBackAction: () => void
}

/**
 * CardsImagesSubpanel — Style guide sub-panel for Cards & Images.
 * Shows radius pickers for cards and images + 3 card style preset cards.
 */
export function CardsImagesSubpanel({ onBackAction }: CardsImagesSubpanelProps) {
    const concept = useStyleGuideStore(s => s.getActiveConcept())
    const setCardStyle = useStyleGuideStore(s => s.setCardStyle)
    const setCardRadius = useStyleGuideStore(s => s.setCardRadius)
    const setImageRadius = useStyleGuideStore(s => s.setImageRadius)
    const shuffleUI = useStyleGuideStore(s => s.shuffleUI)

    const { cardStyle, cardRadius, imageRadius } = concept.ui

    return (
        <div className="space-y-4">
            {/* ── Header ── */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={onBackAction}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <h3 className="text-xs font-semibold text-foreground truncate">Cards &amp; Images</h3>
            </div>

            {/* ── Card Radius Picker ── */}
            <RadiusPicker
                value={cardRadius}
                onChange={setCardRadius}
                label="Card Radius"
            />

            {/* ── Image Radius Picker ── */}
            <RadiusPicker
                value={imageRadius}
                onChange={setImageRadius}
                label="Image Radius"
            />

            {/* ── Style Presets ── */}
            <div className="space-y-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">Card Style</span>
                <div className="space-y-1.5">
                    {CARD_STYLES.map(({ style, label }) => {
                        const isActive = cardStyle === style
                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => setCardStyle(style)}
                                className={`
                                    w-full rounded-lg p-3 text-left transition-all cursor-pointer
                                    ${isActive
                                        ? 'bg-foreground/5 ring-1 ring-foreground/20'
                                        : 'bg-muted/30 hover:bg-muted/60'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between mb-2.5">
                                    <span className={`text-[11px] font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{label}</span>
                                    {isActive && (
                                        <Check className="h-3 w-3 text-foreground" />
                                    )}
                                </div>
                                {/* Mini card preview */}
                                <CardPreview style={style} cardR={cardRadius} imageR={imageRadius} />
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── Shuffle ── */}
            <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs gap-1.5"
                onClick={shuffleUI}
            >
                <Sparkles className="h-3 w-3" />
                Shuffle Cards &amp; Images
            </Button>
        </div>
    )
}

/* ─── Mini Card Preview ─── */

function CardPreview({ style, cardR, imageR }: { style: CardStyle; cardR: number; imageR: number }) {
    const cr = cardR === 9999 ? '9999px' : `${cardR}px`
    const ir = imageR === 9999 ? '9999px' : `${imageR}px`

    const cardClass = (() => {
        switch (style) {
            case 'default':
                return 'bg-background shadow-sm border border-border/50'
            case 'outlined':
                return 'bg-background border-2 border-border'
            case 'flat':
                return 'bg-muted/60'
        }
    })()

    return (
        <div
            className={`overflow-hidden p-2 ${cardClass}`}
            style={{ borderRadius: cr }}
        >
            {/* Image placeholder */}
            <div
                className="h-10 w-full bg-foreground/8 mb-2"
                style={{ borderRadius: ir }}
            />
            {/* Content lines */}
            <div className="space-y-1 px-0.5">
                <div className="h-1.5 w-3/4 bg-foreground/15 rounded-full" />
                <div className="h-1 w-full bg-foreground/8 rounded-full" />
                <div className="h-1 w-2/3 bg-foreground/8 rounded-full" />
            </div>
        </div>
    )
}
