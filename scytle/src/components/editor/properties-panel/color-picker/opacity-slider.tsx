'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { hexToRgb } from '@/lib/color-utils'

interface OpacitySliderProps {
    value: number    // 0-1
    hex: string      // current color hex (no '#') — for the gradient end color
    onChange: (opacity: number) => void
    className?: string
}

/** Opacity slider with checkerboard background — matches Figma's opacity bar */
export function OpacitySlider({ value, hex, onChange, className }: OpacitySliderProps) {
    const trackRef = useRef<HTMLDivElement>(null)

    const getOpacityFromEvent = useCallback((clientX: number) => {
        const el = trackRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        onChange(Math.round(x * 100) / 100)
    }, [onChange])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        trackRef.current?.setPointerCapture(e.pointerId)
        getOpacityFromEvent(e.clientX)
    }, [getOpacityFromEvent])

    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        if (e.buttons === 0) return
        getOpacityFromEvent(e.clientX)
    }, [getOpacityFromEvent])

    const { r, g, b } = hexToRgb(hex)
    const thumbX = value * 100  // 0-100%

    return (
        <div
            ref={trackRef}
            className={cn('relative h-3 rounded-full cursor-pointer select-none touch-none', className)}
            style={{
                // Checkerboard via CSS patterns, then color gradient on top
                background: [
                    `linear-gradient(to right, rgba(${r},${g},${b},0) 0%, rgba(${r},${g},${b},1) 100%)`,
                    // Checkerboard pattern
                    `repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%) 0 0 / 8px 8px`,
                ].join(', '),
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
        >
            {/* Thumb */}
            <div
                className="absolute top-1/2 w-3 h-3 rounded-full pointer-events-none"
                style={{
                    left: `${thumbX}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: `rgba(${r},${g},${b},${value})`,
                    boxShadow: '0 0 0 2px white, 0 0 0 3px rgba(0,0,0,0.25)',
                }}
            />
        </div>
    )
}
