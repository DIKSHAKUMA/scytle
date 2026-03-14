'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { normaliseHex, type ColorFormat } from '@/lib/color-utils'
import { SolidPicker } from './solid-picker'
import type { SolidFill } from '@/types/canvas'

// ─────────────────────────────────────────────────────────────
// Fill type tab icons (SVG inline)
// ─────────────────────────────────────────────────────────────

function SolidIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14">
            <rect x="2" y="2" width="10" height="10" rx="1.5" fill="currentColor" />
        </svg>
    )
}
function LinearIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14">
            <defs>
                <linearGradient id="li" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="currentColor" />
                </linearGradient>
            </defs>
            <rect x="2" y="2" width="10" height="10" rx="1.5" fill="url(#li)" />
        </svg>
    )
}
function RadialIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14">
            <defs>
                <radialGradient id="ri">
                    <stop offset="0%" stopColor="currentColor" />
                    <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
                </radialGradient>
            </defs>
            <rect x="2" y="2" width="10" height="10" rx="1.5" fill="url(#ri)" />
        </svg>
    )
}
function ImageIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 9.5L5 6.5L7.5 9L9.5 7L12 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="9" cy="5" r="1" fill="currentColor" />
        </svg>
    )
}

// ─────────────────────────────────────────────────────────────
// Document swatch palette
// ─────────────────────────────────────────────────────────────

function SwatchPalette({
    colors,
    onSelect,
}: {
    colors: string[]
    onSelect: (hex: string) => void
}) {
    if (colors.length === 0) return null
    return (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
            {colors.map((c) => (
                <button
                    key={c}
                    className="w-5 h-5 rounded-sm border border-border/40 shrink-0 hover:scale-110 transition-transform"
                    style={{ backgroundColor: `#${normaliseHex(c)}` }}
                    title={`#${normaliseHex(c).toUpperCase()}`}
                    onClick={() => onSelect(normaliseHex(c))}
                />
            ))}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface ColorPickerProps {
    /** The fill being edited */
    fill: SolidFill
    /** Called with the updated fill on every change */
    onChange: (fill: SolidFill) => void
    /** Anchor element — picker is positioned relative to this */
    anchorEl: HTMLElement | null
    /** Whether the picker is open */
    open: boolean
    onClose: () => void
    /** Document colors for the swatches panel */
    documentColors?: string[]
}

// ─────────────────────────────────────────────────────────────
// ColorPicker
// ─────────────────────────────────────────────────────────────

type FillTypeTab = 'solid' | 'gradient' | 'image'

const FILL_TYPE_TABS: { id: FillTypeTab; icon: React.ReactNode; label: string }[] = [
    { id: 'solid', icon: <SolidIcon />, label: 'Solid' },
    { id: 'gradient', icon: <LinearIcon />, label: 'Gradient' },
    { id: 'image', icon: <ImageIcon />, label: 'Image' },
]

export function ColorPicker({
    fill,
    onChange,
    anchorEl,
    open,
    onClose,
    documentColors = [],
}: ColorPickerProps) {
    const pickerRef = useRef<HTMLDivElement>(null)
    const [activeTab, setActiveTab] = useState<FillTypeTab>('solid')
    const [colorFormat, setColorFormat] = useState<ColorFormat>('HEX')

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handleMouseDown = (e: MouseEvent) => {
            if (
                pickerRef.current && !pickerRef.current.contains(e.target as Node) &&
                anchorEl && !anchorEl.contains(e.target as Node)
            ) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleMouseDown)
        return () => document.removeEventListener('mousedown', handleMouseDown)
    }, [open, onClose, anchorEl])

    // Escape key
    useEffect(() => {
        if (!open) return
        const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [open, onClose])

    if (!open || !anchorEl) return null

    // Position: below and slightly left of anchor, clamped to viewport
    const anchorRect = anchorEl.getBoundingClientRect()
    const PICKER_W = 240
    const PICKER_H = 360  // approximate
    let left = anchorRect.left
    let top = anchorRect.bottom + 6
    // Clamp to viewport
    if (left + PICKER_W > window.innerWidth - 8) left = window.innerWidth - PICKER_W - 8
    if (top + PICKER_H > window.innerHeight - 8) top = anchorRect.top - PICKER_H - 6
    if (left < 8) left = 8

    const hex = normaliseHex(fill.color)
    const opacity = fill.opacity ?? 1

    const picker = (
        <div
            ref={pickerRef}
            className={cn(
                'fixed z-[9999] w-[240px] rounded-lg shadow-2xl',
                'bg-popover border border-border/60',
                'flex flex-col overflow-hidden',
            )}
            style={{ left, top }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            {/* Header: title + fill type tabs + close */}
            <div className="flex items-center gap-1 px-2.5 pt-2.5 pb-2">
                <span className="text-[11px] font-medium text-muted-foreground mr-1">Fill</span>
                {/* Fill type tab icons */}
                <div className="flex items-center gap-0.5 flex-1">
                    {FILL_TYPE_TABS.map((tab) => (
                        <button
                            key={tab.id}
                            title={tab.label}
                            className={cn(
                                'w-6 h-6 flex items-center justify-center rounded-sm transition-colors',
                                activeTab === tab.id
                                    ? 'bg-muted text-foreground'
                                    : 'text-muted-foreground/50 hover:text-foreground hover:bg-muted/50'
                            )}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.icon}
                        </button>
                    ))}
                </div>
                <button
                    className="w-6 h-6 flex items-center justify-center rounded-sm
                        text-muted-foreground/50 hover:text-foreground hover:bg-muted/50 transition-colors"
                    onClick={onClose}
                >
                    <X size={12} />
                </button>
            </div>

            {/* Picker body */}
            <div className="px-2.5 pb-2.5">
                {activeTab === 'solid' && (
                    <SolidPicker
                        hex={hex}
                        opacity={opacity}
                        onHexChange={(newHex) => onChange({ ...fill, color: newHex })}
                        onOpacityChange={(newOpacity) => onChange({ ...fill, opacity: newOpacity })}
                        colorFormat={colorFormat}
                        onColorFormatChange={setColorFormat}
                    />
                )}
                {activeTab === 'gradient' && (
                    <div className="py-4 text-[11px] text-muted-foreground text-center">
                        Gradient fill — coming in Phase 2
                    </div>
                )}
                {activeTab === 'image' && (
                    <div className="py-4 text-[11px] text-muted-foreground text-center">
                        Image fill — coming in Phase 3
                    </div>
                )}
            </div>

            {/* Document swatches */}
            {documentColors.length > 0 && (
                <div className="px-2.5 pb-2.5 border-t border-border/40 pt-2">
                    <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-muted-foreground/60">Document</span>
                    </div>
                    <SwatchPalette
                        colors={documentColors}
                        onSelect={(newHex) => onChange({ ...fill, color: newHex })}
                    />
                </div>
            )}
        </div>
    )

    return createPortal(picker, document.body)
}
