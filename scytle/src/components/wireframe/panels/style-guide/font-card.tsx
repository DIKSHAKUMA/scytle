'use client'

import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FontCardProps {
    label: 'Heading' | 'Body'
    fontFamily: string
    onClickAction: () => void
    onShuffleAction?: () => void
}

/**
 * FontCard — Shows a heading or body font preview.
 *
 * Renders the font family name in the font itself.
 * Click opens the Font Browser. Hover reveals shuffle icon.
 */
export function FontCard({ label, fontFamily, onClickAction, onShuffleAction }: FontCardProps) {
    // Extract clean font name from CSS font-family value
    const fontName = fontFamily.replace(/'/g, '').split(',')[0].trim()

    return (
        <button
            type="button"
            onClick={onClickAction}
            className="group relative w-full rounded-lg border border-border overflow-hidden hover:ring-2 hover:ring-ring/20 transition-all cursor-pointer text-left bg-background"
        >
            {/* Font specimen */}
            <div className="px-3 pt-3 pb-2">
                <span className="text-[10px] font-medium text-muted-foreground mb-1 block">{label}</span>
                <span
                    className="text-lg leading-tight text-foreground block truncate"
                    style={{ fontFamily }}
                >
                    {fontName}
                </span>
            </div>

            {/* Footer with badges */}
            <div className="px-3 py-1.5 bg-muted/30 border-t flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        Google
                    </span>
                    <span className="text-[9px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        Free
                    </span>
                </div>
            </div>

            {/* Hover shuffle icon */}
            {onShuffleAction && (
                <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); onShuffleAction() }}
                    className={cn(
                        'absolute top-2 right-2 w-6 h-6 flex items-center justify-center',
                        'rounded-md bg-background/90 border shadow-sm',
                        'opacity-0 group-hover:opacity-100 transition-opacity',
                        'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                >
                    <Sparkles className="h-3 w-3" />
                </span>
            )}
        </button>
    )
}
