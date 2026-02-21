'use client'

import type { RadiusPreset } from '@/lib/designs/v2/tokens'

const RADIUS_OPTIONS: { value: RadiusPreset; label: string }[] = [
    { value: 0, label: 'Sharp' },
    { value: 4, label: 'Slight' },
    { value: 8, label: 'Medium' },
    { value: 9999, label: 'Pill' },
]

interface RadiusPickerProps {
    value: RadiusPreset
    onChange: (radius: RadiusPreset) => void
    label?: string
}

/**
 * RadiusPicker — 4 visual icon-buttons for selecting radius preset.
 * Sharp (0) | Slight (4) | Medium (8) | Pill (9999)
 */
export function RadiusPicker({ value, onChange, label }: RadiusPickerProps) {
    return (
        <div className="space-y-1.5">
            {label && (
                <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
            )}
            <div className="flex gap-1.5">
                {RADIUS_OPTIONS.map(opt => {
                    const isActive = value === opt.value
                    return (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => onChange(opt.value)}
                            className={`
                                flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-md
                                transition-all cursor-pointer
                                ${isActive
                                    ? 'bg-foreground/5 ring-1 ring-foreground/20'
                                    : 'bg-muted/30 hover:bg-muted/60'
                                }
                            `}
                        >
                            {/* Visual radius preview */}
                            <div
                                className={`
                                    h-5 w-8 border-2
                                    ${isActive ? 'border-foreground' : 'border-foreground/40'}
                                `}
                                style={{
                                    borderRadius: opt.value === 9999
                                        ? '9999px'
                                        : `${opt.value}px`,
                                }}
                            />
                            <span className={`
                                text-[9px] font-medium
                                ${isActive ? 'text-foreground' : 'text-muted-foreground'}
                            `}>
                                {opt.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
