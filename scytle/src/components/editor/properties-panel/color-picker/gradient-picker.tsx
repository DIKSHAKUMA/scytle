'use client'

import { useState, useCallback } from 'react'
import { RotateCcw, FlipHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'
import { normaliseHex } from '@/lib/color-utils'
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
// Gradient type options
// ─────────────────────────────────────────────────────────────

const GRADIENT_TYPE_OPTIONS: { id: GradientType; label: string }[] = [
    { id: 'linear', label: 'Linear' },
    { id: 'radial', label: 'Radial' },
    { id: 'angular', label: 'Angular' },
    { id: 'diamond', label: 'Diamond' },
]

// ─────────────────────────────────────────────────────────────
// Default stops helper
// ─────────────────────────────────────────────────────────────

export function defaultGradientStops(): GradientStop[] {
    return [
        { id: generateId(), position: 0, color: 'ffffff', opacity: 1 },
        { id: generateId(), position: 1, color: '000000', opacity: 1 },
    ]
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

    // ── Gradient type / controls ────────────────────────────

    const handleTypeChange = useCallback((type: GradientType) => {
        onChange({ ...fill, gradientType: type, stops })
    }, [fill, onChange, stops])

    const handleAngleChange = useCallback((val: string) => {
        const n = parseInt(val)
        if (!isNaN(n)) onChange({ ...fill, angle: ((n % 360) + 360) % 360, stops })
    }, [fill, onChange, stops])

    const handleFlip = useCallback(() => {
        // Mirror stop positions around the center
        const flipped = stops.map((s) => ({ ...s, position: 1 - s.position }))
        onChange({ ...fill, stops: flipped })
    }, [fill, onChange, stops])

    const handleRotate = useCallback(() => {
        onChange({ ...fill, angle: ((angle + 45) % 360), stops })
    }, [fill, onChange, stops, angle])

    // ── Stop CRUD ──────────────────────────────────────────

    const handleAddStop = useCallback((position: number) => {
        // Interpolate color at the new stop position from existing stops
        const sorted = [...stops].sort((a, b) => a.position - b.position)
        let color = 'ffffff'
        let stopOpacity = 1
        if (sorted.length >= 2) {
            // Find surrounding stops
            let left = sorted[0]
            let right = sorted[sorted.length - 1]
            for (let i = 0; i < sorted.length - 1; i++) {
                if (sorted[i].position <= position && sorted[i + 1].position >= position) {
                    left = sorted[i]
                    right = sorted[i + 1]
                    break
                }
            }
            const t = right.position === left.position
                ? 0
                : (position - left.position) / (right.position - left.position)
            // Lerp RGB
            const lHex = normaliseHex(left.color)
            const rHex = normaliseHex(right.color)
            const lr = parseInt(lHex.slice(0, 2), 16)
            const lg = parseInt(lHex.slice(2, 4), 16)
            const lb = parseInt(lHex.slice(4, 6), 16)
            const rr = parseInt(rHex.slice(0, 2), 16)
            const rg = parseInt(rHex.slice(2, 4), 16)
            const rb = parseInt(rHex.slice(4, 6), 16)
            const nr = Math.round(lr + (rr - lr) * t)
            const ng = Math.round(lg + (rg - lg) * t)
            const nb = Math.round(lb + (rb - lb) * t)
            color = [nr, ng, nb]
                .map((v) => v.toString(16).padStart(2, '0'))
                .join('')
            stopOpacity = (left.opacity ?? 1) + ((right.opacity ?? 1) - (left.opacity ?? 1)) * t
        }
        const newStop: GradientStop = { id: generateId(), position, color, opacity: stopOpacity }
        const newStops = [...stops, newStop].sort((a, b) => a.position - b.position)
        setSelectedStopId(newStop.id ?? null)
        onChange({ ...fill, stops: newStops })
    }, [fill, onChange, stops])

    const handleMoveStop = useCallback((id: string, position: number) => {
        const newStops = stops.map((s) => s.id === id ? { ...s, position } : s)
        onChange({ ...fill, stops: newStops })
    }, [fill, onChange, stops])

    const handleDeleteStop = useCallback((id: string) => {
        if (stops.length <= 2) return // Minimum 2 stops
        const newStops = stops.filter((s) => s.id !== id)
        // Select adjacent stop
        const idx = stops.findIndex((s) => s.id === id)
        const nextSelected = newStops[Math.min(idx, newStops.length - 1)]
        setSelectedStopId(nextSelected?.id ?? null)
        onChange({ ...fill, stops: newStops })
    }, [fill, onChange, stops])

    // ── Selected stop color editing ────────────────────────

    const selectedStop = stops.find((s) => s.id === selectedStopId) ?? stops[0]
    const selectedHex = selectedStop ? normaliseHex(selectedStop.color) : 'ffffff'
    const selectedOpacity = selectedStop?.opacity ?? 1

    const { h: hue, s: sat, b: bri } = hexToHsb(selectedHex)

    const handleFieldChange = useCallback((s: number, b: number) => {
        if (!selectedStop) return
        const newHex = hsbToHex(hue, s, b)
        const newStops = stops.map((st) =>
            st.id === selectedStop.id ? { ...st, color: newHex } : st
        )
        onChange({ ...fill, stops: newStops })
    }, [selectedStop, hue, stops, fill, onChange])

    const handleHueChange = useCallback((newHue: number) => {
        if (!selectedStop) return
        const newHex = hsbToHex(newHue, sat, bri)
        const newStops = stops.map((st) =>
            st.id === selectedStop.id ? { ...st, color: newHex } : st
        )
        onChange({ ...fill, stops: newStops })
    }, [selectedStop, sat, bri, stops, fill, onChange])

    const handleStopOpacityChange = useCallback((newOpacity: number) => {
        if (!selectedStop) return
        const newStops = stops.map((st) =>
            st.id === selectedStop.id ? { ...st, opacity: newOpacity } : st
        )
        onChange({ ...fill, stops: newStops })
    }, [selectedStop, stops, fill, onChange])

    const handleStopHexChange = useCallback((newHex: string) => {
        if (!selectedStop) return
        const newStops = stops.map((st) =>
            st.id === selectedStop.id ? { ...st, color: normaliseHex(newHex) } : st
        )
        onChange({ ...fill, stops: newStops })
    }, [selectedStop, stops, fill, onChange])

    return (
        <div className="flex flex-col gap-2">
            {/* ── Gradient type + angle controls ── */}
            <div className="flex items-center gap-1.5">
                {/* Type dropdown */}
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

                {/* Angle input (linear only) */}
                {gradientType === 'linear' && (
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
                                'w-11 h-6 rounded-sm px-1 text-[11px] text-center',
                                'bg-muted border-0 text-foreground',
                                'outline-none focus:ring-1 focus:ring-primary/50',
                                '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none',
                            )}
                        />
                        <span className="text-[10px] text-muted-foreground">°</span>
                    </div>
                )}

                {/* Flip button (linear only) */}
                {gradientType === 'linear' && (
                    <button
                        title="Flip gradient"
                        onClick={handleFlip}
                        className="w-6 h-6 flex items-center justify-center rounded-sm text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                        <FlipHorizontal size={12} />
                    </button>
                )}

                {/* Rotate +45° button */}
                {gradientType === 'linear' && (
                    <button
                        title="Rotate 45°"
                        onClick={handleRotate}
                        className="w-6 h-6 flex items-center justify-center rounded-sm text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                        <RotateCcw size={12} />
                    </button>
                )}
            </div>

            {/* ── Stop bar ── */}
            <GradientStopBar
                stops={stops}
                selectedStopId={selectedStopId}
                onSelectStop={setSelectedStopId}
                onMoveStop={handleMoveStop}
                onAddStop={handleAddStop}
                onDeleteStop={handleDeleteStop}
                angle={angle}
            />

            {/* ── Selected stop color ── */}
            {selectedStop && (
                <>
                    {/* 2D gradient field */}
                    <GradientField
                        hue={hue}
                        saturation={sat}
                        brightness={bri}
                        onChange={handleFieldChange}
                    />

                    {/* Hue slider */}
                    <HueSlider value={hue} onChange={handleHueChange} />

                    {/* Opacity slider for this stop */}
                    <OpacitySlider
                        value={selectedOpacity}
                        hex={selectedHex}
                        onChange={handleStopOpacityChange}
                    />

                    {/* Color input (hex/rgb/hsl/hsb) */}
                    <ColorInput
                        hex={selectedHex}
                        opacity={selectedOpacity}
                        onHexChange={handleStopHexChange}
                        onOpacityChange={handleStopOpacityChange}
                        format={colorFormat}
                        onFormatChange={onColorFormatChange}
                    />
                </>
            )}
        </div>
    )
}
