/**
 * Section Chrome — Non-block decorative UI elements
 *
 * These are layout "chrome" (slider arrows, dots, controls) that
 * are NOT editable blocks — they're structural visual indicators
 * rendered by FrameBlock when its content._chrome flag is set.
 *
 * Chrome types (space-separated in _chrome string):
 *   'arrows-inset'    — overlaid L/R arrows inside the frame (absolute)
 *   'arrows-edge'     — arrows at the exact left/right edge of the frame
 *   'arrows-offset'   — arrows offset from center (for centered-image sliders)
 *   'dots'            — dot indicator row (rendered after children)
 *   'controls-below'  — arrows LEFT + dots RIGHT row (rendered after children)
 */

'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

// ── Slider arrow button ──────────────────────────────────────────

export function SliderArrow({ direction }: { direction: 'left' | 'right' }) {
    const Icon = direction === 'left' ? ChevronLeft : ChevronRight
    return (
        <button
            type="button"
            className="flex items-center justify-center w-12 h-12 rounded-full border border-(--sg-border,rgba(255,255,255,0.2)) bg-transparent text-(--sg-text-primary,white) shrink-0"
            tabIndex={-1}
        >
            <Icon className="w-6 h-6" />
        </button>
    )
}

// ── Slider dots ──────────────────────────────────────────────────

export function SliderDots({ count = 3, activeIndex = 0 }: { count?: number; activeIndex?: number }) {
    return (
        <div className="flex items-center gap-2.25 py-2.5">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === activeIndex
                            ? 'bg-(--sg-text-primary,white)'
                            : 'bg-(--sg-text-primary,white) opacity-20'
                        }`}
                />
            ))}
        </div>
    )
}

// ── Combined controls: Arrows LEFT + Dots RIGHT ─────────────────

export function SliderControlsBelow() {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex gap-2">
                <SliderArrow direction="left" />
                <SliderArrow direction="right" />
            </div>
            <SliderDots count={7} />
        </div>
    )
}

// ── Chrome renderer — maps _chrome string to JSX ────────────────

/**
 * Renders chrome elements for a frame block.
 * Called by FrameBlock when content._chrome is set.
 *
 * Absolute-positioned chrome (arrows-inset, arrows-edge, arrows-offset)
 * is returned separately for overlay rendering.
 */
export function renderChrome(chromeStr: string): {
    /** Elements positioned absolutely over the frame */
    overlay: React.ReactNode
    /** Elements rendered after children (dots, controls-below) */
    after: React.ReactNode
} {
    const parts = new Set(chromeStr.split(/\s+/).filter(Boolean))
    const overlayNodes: React.ReactNode[] = []
    const afterNodes: React.ReactNode[] = []

    if (parts.has('arrows-inset')) {
        overlayNodes.push(
            <div key="arrows-inset" className="pointer-events-none absolute inset-0 z-10 flex items-center justify-between px-4">
                <div className="pointer-events-auto"><SliderArrow direction="left" /></div>
                <div className="pointer-events-auto"><SliderArrow direction="right" /></div>
            </div>,
        )
    }

    if (parts.has('arrows-edge')) {
        overlayNodes.push(
            <div key="al" className="pointer-events-auto absolute left-0 top-1/2 -translate-y-1/2 z-10"><SliderArrow direction="left" /></div>,
            <div key="ar" className="pointer-events-auto absolute right-0 top-1/2 -translate-y-1/2 z-10"><SliderArrow direction="right" /></div>,
        )
    }

    if (parts.has('arrows-offset')) {
        overlayNodes.push(
            <div key="al-off" className="pointer-events-auto absolute left-0 top-[calc(50%-24px)] -translate-y-1/2 z-10"><SliderArrow direction="left" /></div>,
            <div key="ar-off" className="pointer-events-auto absolute right-0 top-[calc(50%-24px)] -translate-y-1/2 z-10"><SliderArrow direction="right" /></div>,
        )
    }

    if (parts.has('dots')) {
        afterNodes.push(<SliderDots key="dots" />)
    }

    if (parts.has('controls-below')) {
        afterNodes.push(<SliderControlsBelow key="controls-below" />)
    }

    return {
        overlay: overlayNodes.length > 0 ? <>{overlayNodes}</> : null,
        after: afterNodes.length > 0 ? <>{afterNodes}</> : null,
    }
}
