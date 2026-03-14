'use client'

import { useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { ImageFill } from '@/types/canvas'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface ImagePickerProps {
    fill: ImageFill
    onChange: (fill: ImageFill) => void
}

// ─────────────────────────────────────────────────────────────
// Scale mode config
// ─────────────────────────────────────────────────────────────

const FIT_OPTIONS: { id: ImageFill['fit']; label: string }[] = [
    { id: 'cover', label: 'Fill' },
    { id: 'contain', label: 'Fit' },
    { id: 'fill', label: 'Stretch' },
    { id: 'tile', label: 'Tile' },
]

// ─────────────────────────────────────────────────────────────
// Adjustment slider config
// ─────────────────────────────────────────────────────────────

type AdjustmentKey = 'exposure' | 'contrast' | 'saturation' | 'temperature' | 'tint' | 'highlights' | 'shadows'

const ADJUSTMENTS: { key: AdjustmentKey; label: string }[] = [
    { key: 'exposure', label: 'Exposure' },
    { key: 'contrast', label: 'Contrast' },
    { key: 'saturation', label: 'Saturation' },
    { key: 'temperature', label: 'Temperature' },
    { key: 'tint', label: 'Tint' },
    { key: 'highlights', label: 'Highlights' },
    { key: 'shadows', label: 'Shadows' },
]

// ─────────────────────────────────────────────────────────────
// AdjustmentSlider — single labeled slider row
// ─────────────────────────────────────────────────────────────

function AdjustmentSlider({
    label,
    value,
    onChange,
}: {
    label: string
    value: number
    onChange: (v: number) => void
}) {
    return (
        <div className="flex items-center gap-2 h-6">
            <span className="w-20 text-[10px] text-muted-foreground/70 shrink-0">{label}</span>
            <div className="flex-1 relative flex items-center h-3">
                {/* Track */}
                <div className="absolute inset-0 rounded-full bg-muted/80" />
                {/* Center marker */}
                <div className="absolute left-1/2 top-1/2 -translate-y-1/2 w-px h-2 bg-border/60" />
                <input
                    type="range"
                    min={-100}
                    max={100}
                    step={1}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="relative w-full h-3 appearance-none bg-transparent cursor-pointer
                        [&::-webkit-slider-thumb]:appearance-none
                        [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                        [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                        [&::-webkit-slider-thumb]:shadow-[0_0_0_1.5px_rgba(0,0,0,0.25)]
                        [&::-webkit-slider-thumb]:cursor-grab
                        [&::-webkit-slider-thumb:active]:cursor-grabbing"
                />
            </div>
            {/* Numeric input */}
            <input
                type="number"
                value={value}
                min={-100}
                max={100}
                onChange={(e) => {
                    const n = parseInt(e.target.value)
                    if (!isNaN(n)) onChange(Math.max(-100, Math.min(100, n)))
                }}
                onKeyDown={(e) => {
                    if (e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(100, value + (e.shiftKey ? 10 : 1))) }
                    if (e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(-100, value - (e.shiftKey ? 10 : 1))) }
                }}
                onFocus={(e) => e.target.select()}
                className={cn(
                    'w-10 h-5 px-1 text-[10px] text-center font-mono rounded-sm',
                    'bg-muted/60 border border-transparent',
                    'hover:border-border/50 focus:border-border focus:outline-none',
                    'transition-colors tabular-nums',
                    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
                )}
            />
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// ImagePicker
// ─────────────────────────────────────────────────────────────

export function ImagePicker({ fill, onChange }: ImagePickerProps) {
    const handleAdjust = useCallback((key: AdjustmentKey, value: number) => {
        onChange({ ...fill, [key]: value })
    }, [fill, onChange])

    const hasAdjustments = ADJUSTMENTS.some(({ key }) => (fill[key] ?? 0) !== 0)

    return (
        <div className="flex flex-col gap-2.5">
            {/* ── Image source ── */}
            <div className="flex items-center gap-1.5">
                {/* Thumbnail preview */}
                <div
                    className={cn(
                        'w-8 h-8 rounded-sm border border-border/40 shrink-0 overflow-hidden',
                        !fill.src && 'bg-muted flex items-center justify-center',
                    )}
                >
                    {fill.src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={fill.src} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-muted-foreground/40">
                            <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                            <path d="M1.5 9.5L5 6L7.5 8.5L9.5 6.5L12.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="9" cy="5" r="1.2" fill="currentColor" />
                        </svg>
                    )}
                </div>
                <input
                    type="text"
                    value={fill.src}
                    placeholder="Image URL…"
                    onChange={(e) => onChange({ ...fill, src: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                    className={cn(
                        'flex-1 h-7 px-1.5 text-[11px] rounded-sm',
                        'bg-muted/60 border border-transparent',
                        'hover:border-border/50 focus:border-border focus:outline-none',
                        'placeholder:text-muted-foreground/30 transition-colors',
                    )}
                />
            </div>

            {/* ── Scale mode buttons ── */}
            <div className="grid grid-cols-4 gap-1">
                {FIT_OPTIONS.map((opt) => (
                    <button
                        key={opt.id}
                        onClick={() => onChange({ ...fill, fit: opt.id })}
                        className={cn(
                            'h-6 rounded-sm text-[10px] transition-colors',
                            fill.fit === opt.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground',
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>

            {/* ── Adjustments ── */}
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-muted-foreground/60 font-medium">Adjustments</span>
                    {hasAdjustments && (
                        <button
                            className="text-[10px] text-primary/70 hover:text-primary transition-colors"
                            onClick={() => {
                                const reset = { ...fill }
                                for (const { key } of ADJUSTMENTS) reset[key] = 0
                                onChange(reset)
                            }}
                        >
                            Reset
                        </button>
                    )}
                </div>
                {ADJUSTMENTS.map(({ key, label }) => (
                    <AdjustmentSlider
                        key={key}
                        label={label}
                        value={fill[key] ?? 0}
                        onChange={(v) => handleAdjust(key, v)}
                    />
                ))}
            </div>
        </div>
    )
}
