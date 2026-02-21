'use client'

import { Trash2, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isLightColor } from '@/lib/designs/v2/tokens/shade-utils'
import type { AccentColor } from '@/lib/designs/v2/tokens'

interface AccentColorCardProps {
    accent: AccentColor
    onClickAction: () => void
    onDeleteAction?: () => void
    onCopyAction?: () => void
    onSetMainAction?: () => void
}

/**
 * AccentColorCard — A single accent color swatch card.
 *
 * Shows color fill, name, hex value, "Main" badge.
 * Hover reveals delete + copy action icons.
 * Click opens the color picker subpanel.
 */
export function AccentColorCard({
    accent,
    onClickAction,
    onDeleteAction,
    onCopyAction,
}: AccentColorCardProps) {
    const textColor = isLightColor(accent.hex) ? 'text-gray-900' : 'text-white'
    const iconColor = isLightColor(accent.hex) ? 'text-gray-700 hover:text-gray-900' : 'text-white/70 hover:text-white'

    return (
        <button
            type="button"
            onClick={onClickAction}
            className="group relative w-full aspect-[4/3] rounded-lg overflow-hidden transition-all hover:ring-2 hover:ring-ring/30 cursor-pointer text-left"
            style={{ backgroundColor: accent.hex }}
        >
            {/* Color name */}
            <span className={cn('absolute top-2 left-2.5 text-[11px] font-medium leading-tight', textColor)}>
                {accent.name}
            </span>

            {/* Hover action icons */}
            <div className="absolute top-1.5 right-1.5 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {onCopyAction && (
                    <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); onCopyAction() }}
                        className={cn('w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 transition-colors', iconColor)}
                    >
                        <Copy className="h-3 w-3" />
                    </span>
                )}
                {onDeleteAction && (
                    <span
                        role="button"
                        onClick={(e) => { e.stopPropagation(); onDeleteAction() }}
                        className={cn('w-6 h-6 flex items-center justify-center rounded-md hover:bg-black/10 transition-colors', iconColor)}
                    >
                        <Trash2 className="h-3 w-3" />
                    </span>
                )}
            </div>

            {/* Hex + Main badge row */}
            <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
                <span className={cn('text-[10px] font-mono uppercase opacity-80', textColor)}>
                    {accent.hex.replace('#', '')}
                </span>
                {accent.isMain && (
                    <span className={cn('text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-black/15', textColor)}>
                        Main
                    </span>
                )}
            </div>
        </button>
    )
}
