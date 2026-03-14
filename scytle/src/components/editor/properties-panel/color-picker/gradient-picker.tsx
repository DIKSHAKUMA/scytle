'use client'

import { useState, useCallback, useRef } from 'react'
import { RotateCcw, FlipHorizontal, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { normaliseHex, hexOpacityToRgba } from '@/lib/color-utils'
import { hexToHsb, hsbToHex } from '@/lib/color-utils'
import type { ColorFormat } from '@/lib/color-utils'
import type { GradientFill, GradientStop } from '@/types/canvas'
import { generateId } from '@/lib/utils'
import { GradientStopBar } from './gradient-stop-bar'
import { GradientField } from './gradient-field'
import { HueSlider } from './hue-slider'
import { OpacitySlider } from './opacity-slider'
import { ColorInput } from './color-input'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type GradientType = 'linear' | 'radial' | 'angular' | 'diamond'

interface GradientPickerProps {
    fill: GradientFill
    onChange: (fill: GradientFill) => void
    colorFormat: ColorFormat
    onColorFormatChange: (format: ColorFormat) => void
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const GRADIENT_TYPE_OPTIONS: { id: GradientType; label: string }[] = [
    { id: 'linear', label: 'Linear' },
    { id: 'radial', label: 'Radial' },
    { id: 'angular', label: 'Angular' },
    { id: 'diamond', label: 'Diamond' },
]

/** Returns a lighter shade of the given hex for the second gradient stop */
function lightenHex(hex: string): string {
    const h = normaliseHex(hex)
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    // Blend 40% toward white
    const lr = Math.round(r + (255 - r) * 0.4)
    const lg = Math.round(g + (255 - g) * 0.4)
    const lb = Math.round(b + (255 - b) * 0.4)
    return [lr, lg, lb].map((v) => v.toString(16).padStart(2, '0')).join('')
}

export function defaultGradientStops(fromHex = '000000'): GradientStop[] {
    return [
        { id: generateId(), position: 0, color: normaliseHex(fromHex), opacity: 1 },
        { id: generateId(), position: 1, color: lightenHex(fromHex), opacity: 1 },
    ]
}

// ─────────────────────────────────────────────────────────────
// StopRow — a single gradient stop row (Figma-style)
// ─────────────────────────────────────────────────────────────

interface StopRowProps {
    stop: GradientStop
    isSelected: boolean
    canDelete: boolean
    onSelect: () => void
    onHexChange: (hex: string) => void
    onOpacityChange: (opacity: number) => void
    onPositionChange: (pos: number) => void
    onDelete: () => void
}

function StopRow({
    stop,
    isSelected,
    canDelete,
    onSelect,
    onHexChange,
    onOpacityChange,
    onPositionChange,
    onDelete,
}: StopRowProps) {
    const hex = normaliseHex(stop.color)
    const opacity = stop.opacity ?? 1

    return (
        <div
            className={cn(
                'group flex items-center gap-1.5 h-6 rounded-sm px-1 -mx-1 cursor-pointer',
                'transition-colors',
                isSelected ? 'bg-muted/60' : 'hover:bg-muted/30',
            )}
            onClick={onSelect}
        >
            {/* Position % */}
            <input
                type="text"
                inputMode="numeric"
                value={Math.round(stop.position * 100)}
                className={cn(
                    'w-8 h-5 text-[10px] text-center font-mono rounded-sm shrink-0',
                    'bg-transparent border border-transparent',
                    'hover:bg-muted focus:bg-muted/80 focus:border-border/50 focus:outline-none',
                    'transition-colors tabular-nums',
                )}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                    const n = parseInt(e.target.value, 10)
                    if (!isNaN(n)) onPositionChange(Math.max(0, Math.min(100, n)) / 100)
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    if (e.key === 'ArrowUp') { e.preventDefault(); onPositionChange(Math.min(1, stop.position + (e.shiftKey ? 0.1 : 0.01))) }
                    if (e.key === 'ArrowDown') { e.preventDefault(); onPositionChange(Math.max(0, stop.position - (e.shiftKey ? 0.1 : 0.01))) }
                }}
                onFocus={(e) => e.target.select()}
            />
            <span className="text-[9px] text-muted-foreground/40 shrink-0">%</span>

            {/* Color swatch */}
            <button
                className={cn(
                    'w-4 h-4 rounded-sm border shrink-0 transition-all',
                    'border-border/40 hover:border-border/80',
                    isSelected && 'ring-1 ring-primary/50',
                )}
                style={{
                    background: `repeating-conic-gradient(#bbb 0% 25%, #fff 0% 50%) 0 0 / 6px 6px`,
                }}
            >
                <div
                    className="w-full h-full rounded-sm"
                    style={{ backgroundColor: hexOpacityToRgba(hex, opacity) }}
                />
            </button>

            {/* Hex input */}
            <input
                type="text"
                value={hex.toUpperCase()}
                className={cn(
                    'flex-1 h-5 px-1 text-[10px] font-mono rounded-sm uppercase',
                    'bg-transparent border border-transparent',
                    'hover:bg-muted focus:bg-muted/80 focus:border-border/50 focus:outline-none',
                    'transition-colors',
                )}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                    const raw = e.target.value.replace('#', '').toUpperCase()
                    if (/^[0-9A-F]{6}$/.test(raw)) onHexChange(raw.toLowerCase())
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                }}
                onFocus={(e) => e.target.select()}
            />

            {/* Opacity % */}
            <input
                type="text"
                inputMode="numeric"
                value={Math.round(opacity * 100)}
                className={cn(
                    'w-7 h-5 text-[10px] text-center font-mono rounded-sm shrink-0',
                    'bg-transparent border border-transparent',
                    'hover:bg-muted focus:bg-muted/80 focus:border-border/50 focus:outline-none',
                    'transition-colors tabular-nums',
                )}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => {
                    const n = parseInt(e.target.value, 10)
                    if (!isNaN(n)) onOpacityChange(Math.max(0, Math.min(100, n)) / 100)
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                }}
                onFocus={(e) => e.target.select()}
            />
            <span className="text-[9px] text-muted-foreground/40 shrink-0">%</span>

            {/* Delete button */}
            <button
                className={cn(
                    'w-4 h-4 flex items-center justify-center rounded-sm shrink-0',
                    'text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10',
                    'transition-all',
                    canDelete
                        ? 'opacity-0 group-hover:opacity-100'
                        : 'opacity-0 pointer-events-none',
                )}
                onClick={(e) => { e.stopPropagation(); onDelete() }}
                title="Remove stop"
            >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// GradientPicker
// ─────────────────────────────────────────────────────────────

export function GradientPicker({
    fill,
    onChange,
    colorFormat,
    onColorFormatChange,
}: GradientPickerProps) {
    const stops = fill.stops ?? defaultGradientStops()
    const gradientType = fill.gradientType ?? 'linear'
    const angle = fill.angle ?? 90

    const [selectedStopId, setSelectedStopId] = useState<string | null>(
        stops[0]?.id ?? null
    )

    // ── Controls ────────────────────────────────────────────

    const handleTypeChange = useCallback((type: GradientType) => {
        onChange({ ...fill, gradientType: type, stops })
    }, [fill, onChange, stops])

    const handleAngleChange = useCallback((val: string) => {
        const n = parseInt(val)
        if (!isNaN(n)) onChange({ ...fill, angle: ((n % 360) + 360) % 360, stops })
    }, [fill, onChange, stops])

    const handleFlip = useCallback(() => {
        const flipped = stops.map((s) => ({ ...s, position: 1 - s.position }))
        onChange({ ...fill, stops: flipped })
    }, [fill, onChange, stops])

    const handleRotate = useCallback(() => {
        onChange({ ...fill, angle: ((angle + 45) % 360), stops })
    }, [fill, onChange, stops, angle])

    // ── Stop CRUD ──────────────────────────────────────────

    const handleAddStop = useCallback((position?: number) => {
        const pos = position ?? 0.5
        const sorted = [...stops].sort((a, b) => a.position - b.position)
        let color = lightenHex(stops[0]?.color ?? '000000')
        let stopOpacity = 1

        if (sorted.length >= 2) {
            let left = sorted[0], right = sorted[sorted.length - 1]
            for (let i = 0; i < sorted.length - 1; i++) {
                if (sorted[i].position <= pos && sorted[i + 1].position >= pos) {
                    left = sorted[i]; right = sorted[i + 1]; break
                }
            }
            const t = right.position === left.position
                ? 0 : (pos - left.position) / (right.position - left.position)
            const lHex = normaliseHex(left.color), rHex = normaliseHex(right.color)
            const [lr, lg, lb] = [0, 2, 4].map((o) => parseInt(lHex.slice(o, o + 2), 16))
            const [rr, rg, rb] = [0, 2, 4].map((o) => parseInt(rHex.slice(o, o + 2), 16))
            color = [lr + (rr - lr) * t, lg + (rg - lg) * t, lb + (rb - lb) * t]
                .map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')
            stopOpacity = (left.opacity ?? 1) + ((right.opacity ?? 1) - (left.opacity ?? 1)) * t
        }

        const newStop: GradientStop = { id: generateId(), position: pos, color, opacity: stopOpacity }
        const newStops = [...stops, newStop].sort((a, b) => a.position - b.position)
        setSelectedStopId(newStop.id ?? null)
        onChange({ ...fill, stops: newStops })
    }, [fill, onChange, stops])

    const handleMoveStop = useCallback((id: string, position: number) => {
        onChange({ ...fill, stops: stops.map((s) => s.id === id ? { ...s, position } : s) })
    }, [fill, onChange, stops])

    const handleDeleteStop = useCallback((id: string) => {
        if (stops.length <= 2) return
        const newStops = stops.filter((s) => s.id !== id)
        const idx = stops.findIndex((s) => s.id === id)
        setSelectedStopId(newStops[Math.min(idx, newStops.length - 1)]?.id ?? null)
        onChange({ ...fill, stops: newStops })
    }, [fill, onChange, stops])

    // ── Stop list editing ──────────────────────────────────

    const updateStop = useCallback((id: string, patch: Partial<GradientStop>) => {
        onChange({ ...fill, stops: stops.map((s) => s.id === id ? { ...s, ...patch } : s) })
    }, [fill, onChange, stops])

    // ── Selected stop color editor (in picker) ─────────────

    const selectedStop = stops.find((s) => s.id === selectedStopId) ?? stops[0]
    const selectedHex = selectedStop ? normaliseHex(selectedStop.color) : 'ffffff'
    const selectedOpacity = selectedStop?.opacity ?? 1
    const { h: hue, s: sat, b: bri } = hexToHsb(selectedHex)

    const handleFieldChange = useCallback((s: number, b: number) => {
        if (!selectedStop) return
        updateStop(selectedStop.id!, { color: hsbToHex(hue, s, b) })
    }, [selectedStop, hue, updateStop])

    const handleHueChange = useCallback((newHue: number) => {
        if (!selectedStop) return
        updateStop(selectedStop.id!, { color: hsbToHex(newHue, sat, bri) })
    }, [selectedStop, sat, bri, updateStop])

    return (
        <div className="flex flex-col gap-2">
            {/* ── Type + controls row ── */}
            <div className="flex items-center gap-1.5">
                <select
                    value={gradientType}
                    onChange={(e) => handleTypeChange(e.target.value as GradientType)}
                    className={cn(
                        'flex-1 h-6 rounded-sm px-1.5 text-[11px]',
                        'bg-muted border-0 text-foreground',
                        'cursor-pointer outline-none appearance-none',
                        'focus:ring-1 focus:ring-primary/50',
                    )}
                >
                    {GRADIENT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                    ))}
                </select>

                {gradientType === 'linear' && (
                    <>
                        <div className="flex items-center gap-0.5">
                            <input
                                type="number"
                                value={angle}
                                onChange={(e) => handleAngleChange(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'ArrowUp') { e.preventDefault(); handleAngleChange(String(angle + (e.shiftKey ? 10 : 1))) }
                                    if (e.key === 'ArrowDown') { e.preventDefault(); handleAngleChange(String(angle - (e.shiftKey ? 10 : 1))) }
                                }}
                                className={cn(
                                    'w-10 h-6 rounded-sm px-1 text-[11px] text-center',
                                    'bg-muted border-0 text-foreground',
                                    'outline-none focus:ring-1 focus:ring-primary/50',
                                    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
                                )}
                            />
                            <span className="text-[10px] text-muted-foreground">°</span>
                        </div>
                        <button title="Flip" onClick={handleFlip} className="w-6 h-6 flex items-center justify-center rounded-sm text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-colors">
                            <FlipHorizontal size={12} />
                        </button>
                        <button title="Rotate 45°" onClick={handleRotate} className="w-6 h-6 flex items-center justify-center rounded-sm text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-colors">
                            <RotateCcw size={12} />
                        </button>
                    </>
                )}
            </div>

            {/* ── Gradient preview bar with draggable stop handles ── */}
            <GradientStopBar
                stops={stops}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
                onMoveStop={handleMoveStop}
                onAddStop={handleAddStop}
                onDeleteStop={handleDeleteStop}
                angle={angle}
            />

            {/* ── Stops list (Figma-style) ── */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-muted-foreground/60 font-medium">Stops</span>
                    <button
                        className="w-5 h-5 flex items-center justify-center rounded-sm text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
                        onClick={() => handleAddStop(0.5)}
                        title="Add stop"
                    >
                        <Plus size={10} />
                    </button>
                </div>
                <div className="flex flex-col">
                    {[...stops].sort((a, b) => a.position - b.position).map((stop) => (
                        <StopRow
                            key={stop.id}
                            stop={stop}
                            isSelected={stop.id === selectedStopId}
                            canDelete={stops.length > 2}
                            onSelect={() => setSelectedStopId(stop.id ?? null)}
                            onHexChange={(hex) => updateStop(stop.id!, { color: hex })}
                            onOpacityChange={(opacity) => updateStop(stop.id!, { opacity })}
                            onPositionChange={(position) => updateStop(stop.id!, { position })}
                            onDelete={() => handleDeleteStop(stop.id!)}
                        />
                    ))}
                </div>
            </div>

            {/* ── Selected stop color editor ── */}
            {selectedStop && (
                <>
                    <div className="h-px bg-border/30 -mx-2.5" />

                    <GradientField
                        hue={hue}
                        saturation={sat}
                        brightness={bri}
                        onChange={handleFieldChange}
                    />
                    <HueSlider value={hue} onChange={handleHueChange} />
                    <OpacitySlider
                        value={selectedOpacity}
                        hex={selectedHex}
                        onChange={(opacity) => updateStop(selectedStop.id!, { opacity })}
                    />
                    <ColorInput
                        hex={selectedHex}
                        opacity={selectedOpacity}
                        onHexChange={(hex) => updateStop(selectedStop.id!, { color: normaliseHex(hex) })}
                        onOpacityChange={(opacity) => updateStop(selectedStop.id!, { opacity })}
                        format={colorFormat}
                        onFormatChange={onColorFormatChange}
                    />
                </>
            )}
        </div>
    )
}
