/**
 * PositionGrid — 3×3 clickable position selector
 *
 * Used by ImageControlsPanel for setting object-position on
 * background images and inline images. Maps to the 9-point
 * ImagePosition type from tokens.
 */

'use client'

import { cn } from '@/lib/utils'
import type { ImagePosition } from '@/lib/designs/v2/tokens'

// ============================================
// Position Layout
// ============================================

const POSITIONS: ImagePosition[][] = [
    ['top-left', 'top-center', 'top-right'],
    ['center-left', 'center', 'center-right'],
    ['bottom-left', 'bottom-center', 'bottom-right'],
]

// ============================================
// Component
// ============================================

interface PositionGridProps {
    value: ImagePosition
    onChange: (position: ImagePosition) => void
    disabled?: boolean
}

export function PositionGrid({ value, onChange, disabled }: PositionGridProps) {
    return (
        <div className="grid grid-cols-3 gap-1 w-[52px] h-[52px] p-1.5 border rounded-md bg-muted/30">
            {POSITIONS.flat().map(pos => (
                <button
                    key={pos}
                    type="button"
                    onClick={() => onChange(pos)}
                    disabled={disabled}
                    title={pos}
                    className={cn(
                        'w-3 h-3 rounded-full border transition-all',
                        value === pos
                            ? 'bg-violet-500 border-violet-500 scale-110'
                            : 'bg-gray-300 border-gray-400 hover:bg-gray-400',
                        disabled && 'opacity-30 cursor-not-allowed',
                    )}
                />
            ))}
        </div>
    )
}
