'use client'

import { useState, useCallback } from 'react'
import { ArrowLeft, Copy, Sparkles, Check } from 'lucide-react'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStyleGuideStore } from '@/store'
import { generateShades } from '@/lib/designs/v2/tokens/shade-utils'
import type { AccentColor } from '@/lib/designs/v2/tokens'

interface ColorPickerSubpanelProps {
    accent: AccentColor
    onBackAction: () => void
}

/**
 * ColorPickerSubpanel — Full color picker for an accent color.
 *
 * Shows: 2D saturation/brightness picker + hue slider (via react-colorful),
 * hex input, name input, per-color shuffle, and auto-generated shade strip.
 */
export function ColorPickerSubpanel({ accent, onBackAction }: ColorPickerSubpanelProps) {
    const { updateAccent } = useStyleGuideStore()
    const [localName, setLocalName] = useState(accent.name)
    const [copied, setCopied] = useState(false)
    const [copiedShade, setCopiedShade] = useState<string | null>(null)

    const handleColorChange = useCallback((hex: string) => {
        updateAccent(accent.id, { hex })
    }, [accent.id, updateAccent])

    const handleNameChange = useCallback((name: string) => {
        setLocalName(name)
        updateAccent(accent.id, { name })
    }, [accent.id, updateAccent])

    const handleCopyHex = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(accent.hex)
            setCopied(true)
            setTimeout(() => setCopied(false), 1500)
        } catch {
            // Fallback: do nothing
        }
    }, [accent.hex])

    const handleShuffleColor = useCallback(() => {
        const randomHex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        updateAccent(accent.id, { hex: randomHex })
    }, [accent.id, updateAccent])

    const handleCopyShade = useCallback(async (hex: string) => {
        try {
            await navigator.clipboard.writeText(hex)
            setCopiedShade(hex)
            setTimeout(() => setCopiedShade(null), 1200)
        } catch {
            // Fallback: do nothing
        }
    }, [])

    const shades = generateShades(accent.hex)

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={onBackAction}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0"
                >
                    <ArrowLeft className="h-3.5 w-3.5" />
                </Button>
                <h3 className="text-xs font-semibold text-foreground truncate">{accent.name}</h3>
            </div>

            {/* Color Picker */}
            <div className="space-y-3">
                <div className="[&_.react-colorful]:w-full [&_.react-colorful]:h-40 [&_.react-colorful]:rounded-lg">
                    <HexColorPicker color={accent.hex} onChange={handleColorChange} />
                </div>

                {/* Hex row */}
                <div className="flex items-center gap-2">
                    <Label className="text-[10px] text-muted-foreground shrink-0">#</Label>
                    <div className="flex-1 relative">
                        <HexColorInput
                            color={accent.hex}
                            onChange={handleColorChange}
                            prefixed={false}
                            className={cn(
                                'w-full h-7 px-2 text-xs font-mono uppercase rounded-md border bg-background',
                                'focus:outline-none focus:ring-1 focus:ring-ring'
                            )}
                        />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleCopyHex}
                        className="h-7 w-7 shrink-0"
                        title="Copy hex"
                    >
                        <Copy className={cn('h-3 w-3', copied && 'text-green-500')} />
                    </Button>
                </div>

                {/* Name input */}
                <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Name</Label>
                    <Input
                        value={localName}
                        onChange={(e) => handleNameChange(e.target.value)}
                        className="h-7 text-xs"
                        placeholder="Color name"
                    />
                </div>

                {/* Shuffle this color */}
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-7 text-xs gap-1.5"
                    onClick={handleShuffleColor}
                >
                    <Sparkles className="h-3 w-3" />
                    Shuffle this color
                </Button>
            </div>

            {/* Shades */}
            <div className="space-y-2">
                <h4 className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Shades</h4>
                <div className="space-y-1">
                    {(['pastel', 'mid-tone', 'deep'] as const).map((group) => (
                        <div key={group} className="space-y-0.5">
                            <span className="text-[9px] text-muted-foreground/60 uppercase tracking-wider font-medium">
                                {group === 'mid-tone' ? 'Mid-Tone' : group.charAt(0).toUpperCase() + group.slice(1)}
                            </span>
                            <div className="flex gap-1">
                                {shades
                                    .filter(s => s.group === group)
                                    .map((shade) => (
                                        <button
                                            key={shade.label}
                                            type="button"
                                            onClick={() => handleCopyShade(shade.hex)}
                                            className="flex-1 group/shade relative cursor-pointer"
                                            title={`Click to copy ${shade.hex}`}
                                        >
                                            <div
                                                className="w-full aspect-square rounded-[3px] border border-black/5 transition-transform group-hover/shade:scale-110 group-hover/shade:shadow-md"
                                                style={{ backgroundColor: shade.hex }}
                                            >
                                                {copiedShade === shade.hex && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <Check className="h-2.5 w-2.5 text-white drop-shadow-md" />
                                                    </div>
                                                )}
                                            </div>
                                            <span className={cn(
                                                'text-[8px] text-center block mt-0.5 truncate',
                                                'text-muted-foreground/60'
                                            )}>
                                                {shade.label}
                                            </span>
                                        </button>
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
