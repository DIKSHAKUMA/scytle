'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface GradientFieldProps {
    hue: number          // 0-360
    saturation: number   // 0-100
    brightness: number   // 0-100 (value)
    onChange: (saturation: number, brightness: number) => void
    className?: string
}

/**
 * 2D color picker field — x-axis = saturation, y-axis = brightness.
 * Background: white→hue gradient on X, transparent→black gradient on Y.
 * Matches Figma's color picker exactly.
 */
export function GradientField({
    hue,
    saturation,
    brightness,
    onChange,
    className,
}: GradientFieldProps) {
    const fieldRef = useRef<HTMLDivElement>(null)

    const getValuesFromEvent = useCallback((clientX: number, clientY: number) => {
        const el = fieldRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height))
        onChange(Math.round(x * 100), Math.round((1 - y) * 100))
    }, [onChange])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        const el = fieldRef.current
        if (!el) return
        el.setPointerCapture(e.pointerId)
        getValuesFromEvent(e.clientX, e.clientY)
    }, [getValuesFromEvent])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (e.buttons === 0) return
        getValuesFromEvent(e.clientX, e.clientY)
    }, [getValuesFromEvent])

    // Reticle position in % of field size
    const reticleX = saturation   // 0-100 maps to 0-100%
    const reticleY = 100 - brightness  // 0-100 maps to 100-0% (invert Y)

    return (
        <div
            ref={fieldRef}
            className={cn('relative rounded-sm overflow-hidden cursor-crosshair select-none touch-none', className)}
            style={{
                background: [
                    `linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 100%)`,
                    `linear-gradient(to right, rgba(255,255,255,1) 0%, hsl(${hue}, 100%, 50%) 100%)`,
                ].join(', '),
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
        >
            {/* Reticle */}
            <div
                className="absolute w-3.5 h-3.5 rounded-full pointer-events-none"
                style={{
                    left: `${reticleX}%`,
                    top: `${reticleY}%`,
                    transform: 'translate(-50%, -50%)',
                    boxShadow: '0 0 0 2px white, 0 0 0 3px rgba(0,0,0,0.3)',
                    // Inner color hint
                    backgroundColor: `hsl(${hue}, ${saturation}%, ${brightness / 2 + (100 - saturation) * brightness / 200}%)`,
                }}
            />
        </div>
    )
}
