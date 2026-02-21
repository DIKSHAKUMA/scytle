'use client'

import { ArrowLeft, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStyleGuideStore } from '@/store'
import { RadiusPicker } from './radius-picker'
import type { ButtonStyle } from '@/lib/designs/v2/tokens'

const BUTTON_STYLES: { style: ButtonStyle; label: string }[] = [
    { style: 'solid', label: 'Solid' },
    { style: 'outline', label: 'Outline' },
    { style: 'ghost', label: 'Ghost' },
    { style: 'brick', label: 'Brick' },
    { style: 'gradient', label: 'Gradient' },
]

interface ButtonsFormsSubpanelProps {
    onBackAction: () => void
}

/**
 * ButtonsFormsSubpanel — Style guide sub-panel for Buttons & Forms.
 * Shows a radius picker + 5 button style preset cards.
 */
export function ButtonsFormsSubpanel({ onBackAction }: ButtonsFormsSubpanelProps) {
    const concept = useStyleGuideStore(s => s.getActiveConcept())
    const setButtonStyle = useStyleGuideStore(s => s.setButtonStyle)
    const setButtonRadius = useStyleGuideStore(s => s.setButtonRadius)
    const shuffleUI = useStyleGuideStore(s => s.shuffleUI)

    const { buttonStyle, buttonRadius } = concept.ui
    const accentHex = concept.colors.accents[0]?.hex ?? '#6366f1'

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
                <h3 className="text-xs font-semibold text-foreground truncate">Buttons &amp; Forms</h3>
            </div>

            {/* ── Radius Picker ── */}
            <RadiusPicker
                value={buttonRadius}
                onChange={setButtonRadius}
                label="Border Radius"
            />

            {/* ── Style Presets ── */}
            <div className="space-y-1.5">
                <span className="text-[10px] font-medium text-muted-foreground">Style</span>
                <div className="space-y-1.5">
                    {BUTTON_STYLES.map(({ style, label }) => {
                        const isActive = buttonStyle === style
                        return (
                            <button
                                key={style}
                                type="button"
                                onClick={() => setButtonStyle(style)}
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
                                {/* Mini button preview */}
                                <ButtonPreview style={style} radius={buttonRadius} accent={accentHex} />
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
                Shuffle Buttons &amp; Forms
            </Button>
        </div>
    )
}

/* ─── Mini Button Preview ─── */

function ButtonPreview({ style, radius, accent }: { style: ButtonStyle; radius: number; accent: string }) {
    const r = radius === 9999 ? '9999px' : `${radius}px`

    switch (style) {
        case 'solid':
            return (
                <div className="flex gap-2">
                    <div
                        className="h-6 flex-1 text-[9px] font-medium flex items-center justify-center text-white"
                        style={{ backgroundColor: accent, borderRadius: r }}
                    >
                        Button
                    </div>
                    <div
                        className="h-6 flex-1 text-[9px] font-medium flex items-center justify-center border"
                        style={{ borderColor: accent, color: accent, borderRadius: r }}
                    >
                        Button
                    </div>
                </div>
            )
        case 'outline':
            return (
                <div className="flex gap-2">
                    <div
                        className="h-6 flex-1 text-[9px] font-medium flex items-center justify-center border-2"
                        style={{ borderColor: accent, color: accent, borderRadius: r }}
                    >
                        Button
                    </div>
                    <div
                        className="h-6 flex-1 text-[9px] font-medium flex items-center justify-center border border-foreground/20 text-foreground/60"
                        style={{ borderRadius: r }}
                    >
                        Button
                    </div>
                </div>
            )
        case 'ghost':
            return (
                <div className="flex gap-2">
                    <div
                        className="h-6 flex-1 text-[9px] font-medium flex items-center justify-center"
                        style={{ color: accent, borderRadius: r }}
                    >
                        Button
                    </div>
                    <div
                        className="h-6 flex-1 text-[9px] font-medium flex items-center justify-center text-foreground/60 underline underline-offset-2"
                        style={{ borderRadius: r }}
                    >
                        Button
                    </div>
                </div>
            )
        case 'brick':
            return (
                <div className="flex gap-2">
                    <div
                        className="h-6 flex-1 text-[9px] font-bold flex items-center justify-center text-white uppercase tracking-wider"
                        style={{ backgroundColor: accent, borderRadius: '0px' }}
                    >
                        Button
                    </div>
                    <div
                        className="h-6 flex-1 text-[9px] font-bold flex items-center justify-center border-2 uppercase tracking-wider"
                        style={{ borderColor: accent, color: accent, borderRadius: '0px' }}
                    >
                        Button
                    </div>
                </div>
            )
        case 'gradient':
            return (
                <div className="flex gap-2">
                    <div
                        className="h-6 flex-1 text-[9px] font-medium flex items-center justify-center text-white"
                        style={{
                            background: `linear-gradient(135deg, ${accent}, ${accent}99)`,
                            borderRadius: r,
                        }}
                    >
                        Button
                    </div>
                    <div
                        className="h-6 flex-1 text-[9px] font-medium flex items-center justify-center border"
                        style={{ borderColor: accent, color: accent, borderRadius: r }}
                    >
                        Button
                    </div>
                </div>
            )
    }
}
