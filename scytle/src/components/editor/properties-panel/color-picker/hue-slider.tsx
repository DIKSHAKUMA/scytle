'use client'

import { useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface HueSliderProps {
    value: number   // 0-360
    onChange: (hue: number) => void
    className?: string
}

/** Rainbow hue slider — matches Figma's hue bar exactly */
export function HueSlider({ value, onChange, className }: HueSliderProps) {
    const trackRef = useRef<HTMLDivElement>(null)
    const onChangeRef = useRef(onChange)
    onChangeRef.current = onChange

    const getHueFromEvent = useCallback((clientX: number) => {
        const el = trackRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
        onChangeRef.current(Math.round(x * 360))
    }, [])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        getHueFromEvent(e.clientX)

        const onMove = (ev: PointerEvent) => {
            ev.stopPropagation()
            getHueFromEvent(ev.clientX)
        }
        const onUp = () => {
            document.removeEventListener('pointermove', onMove, true)
            document.removeEventListener('pointerup', onUp, true)
            document.removeEventListener('pointercancel', onUp, true)
        }
        document.addEventListener('pointermove', onMove, true)
        document.addEventListener('pointerup', onUp, true)
        document.addEventListener('pointercancel', onUp, true)
    }, [getHueFromEvent])

    const thumbX = (value / 360) * 100  // 0-100%

    return (
        <div
            ref={trackRef}
            className={cn(
                'relative h-3 rounded-full cursor-pointer select-none touch-none',
                className
            )}
            style={{
                background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)',
            }}
            onPointerDown={handlePointerDown}
        >
            {/* Thumb */}
            <div
                className="absolute top-1/2 w-3 h-3 rounded-full pointer-events-none"
                style={{
                    left: `${thumbX}%`,
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: `hsl(${value}, 100%, 50%)`,
                    boxShadow: '0 0 0 2px white, 0 0 0 3px rgba(0,0,0,0.25)',
                }}
            />
        </div>
    )
}
