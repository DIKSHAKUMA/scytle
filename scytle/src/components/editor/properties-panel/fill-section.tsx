'use client'

import { useRef, useState, useCallback } from 'react'
import { Plus, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'
import { normaliseHex, hexOpacityToRgba } from '@/lib/color-utils'
import { ColorPicker } from './color-picker'
import type { ScytleNode, Fill, SolidFill } from '@/types/canvas'
import { useEditorStore } from '@/store/editor-store'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Collect all unique solid fill hex colors from the entire node tree */
function collectDocumentColors(nodes: ScytleNode[]): string[] {
    const seen = new Set<string>()
    const collect = (nodeList: ScytleNode[]) => {
        for (const node of nodeList) {
            for (const fill of node.fills ?? []) {
                if (fill.type === 'solid') seen.add(normaliseHex(fill.color))
            }
            if (node.type === 'frame') collect(node.children)
        }
    }
    collect(nodes)
    return Array.from(seen)
}

/** Get a descriptive label for a fill row */
function fillLabel(fill: Fill): string {
    switch (fill.type) {
        case 'solid': return 'Solid'
        case 'gradient': return fill.gradientType
            ? fill.gradientType.charAt(0).toUpperCase() + fill.gradientType.slice(1)
            : 'Gradient'
        case 'image': return 'Image'
    }
}

/** Get the swatch background style for a fill */
function fillSwatchStyle(fill: Fill): React.CSSProperties {
    if (fill.type === 'solid') {
        const hex = normaliseHex(fill.color)
        const opacity = fill.opacity ?? 1
        return { backgroundColor: hexOpacityToRgba(hex, opacity) }
    }
    if (fill.type === 'gradient' && fill.stops && fill.stops.length >= 2) {
        const stops = fill.stops
            .map((s) => `${hexOpacityToRgba(normaliseHex(s.color), s.opacity ?? 1)} ${s.position * 100}%`)
            .join(', ')
        const angle = fill.angle ?? 90
        return { background: `linear-gradient(${angle}deg, ${stops})` }
    }
    if (fill.type === 'image' && fill.src) {
        return { backgroundImage: `url(${fill.src})`, backgroundSize: 'cover' }
    }
    return { backgroundColor: 'transparent' }
}

// ─────────────────────────────────────────────────────────────
// FillRow
// ─────────────────────────────────────────────────────────────

interface FillRowProps {
    fill: Fill
    onUpdate: (newFill: Fill) => void
    onRemove: () => void
    documentColors: string[]
}

function FillRow({ fill, onUpdate, onRemove, documentColors }: FillRowProps) {
    const swatchRef = useRef<HTMLButtonElement>(null)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [hovered, setHovered] = useState(false)

    const isVisible = fill.visible !== false
    const hex = fill.type === 'solid' ? normaliseHex(fill.color) : 'ffffff'
    const opacity = fill.opacity ?? 1

    const handleSwatchClick = useCallback(() => {
        if (fill.type === 'solid') setPickerOpen(true)
    }, [fill.type])

    return (
        <div
            className={cn(
                'group flex items-center gap-1.5 h-7 rounded-sm px-1 -mx-1',
                'transition-colors',
                pickerOpen ? 'bg-muted/40' : 'hover:bg-muted/20',
            )}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Color swatch */}
            <button
                ref={swatchRef}
                className={cn(
                    'w-5 h-5 rounded-sm border shrink-0 transition-all',
                    'border-border/40 hover:border-border/80',
                    pickerOpen && 'ring-1 ring-primary/40',
                    !isVisible && 'opacity-40',
                )}
                style={fillSwatchStyle(fill)}
                onClick={handleSwatchClick}
                title="Edit fill"
            >
                {/* Checkerboard for transparent fills */}
                {fill.type === 'solid' && opacity < 0.05 && (
                    <div className="absolute inset-0 rounded-sm"
                        style={{ background: 'repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%) 0 0 / 6px 6px' }} />
                )}
            </button>

            {/* Hex / type label */}
            {fill.type === 'solid' ? (
                <input
                    type="text"
                    value={hex.toUpperCase()}
                    className={cn(
                        'flex-1 h-6 px-1 text-[11px] font-mono rounded-sm',
                        'bg-transparent border border-transparent',
                        'hover:bg-muted/50 focus:bg-muted/60 focus:border-border focus:outline-none',
                        'transition-colors uppercase',
                        !isVisible && 'opacity-40',
                    )}
                    onChange={(e) => {
                        const raw = e.target.value.replace('#', '').toUpperCase()
                        // Only update when valid 6-digit hex
                        if (/^[0-9A-F]{6}$/.test(raw)) {
                            onUpdate({ ...fill, color: raw.toLowerCase() })
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                    }}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span className={cn('flex-1 text-[11px] text-muted-foreground', !isVisible && 'opacity-40')}>
                    {fillLabel(fill)}
                </span>
            )}

            {/* Opacity % — compact */}
            <input
                type="text"
                inputMode="numeric"
                value={Math.round(opacity * 100)}
                className={cn(
                    'w-9 h-6 px-1 text-[11px] text-center font-mono rounded-sm',
                    'bg-transparent border border-transparent',
                    'hover:bg-muted/50 focus:bg-muted/60 focus:border-border focus:outline-none',
                    'transition-colors tabular-nums',
                    !isVisible && 'opacity-40',
                )}
                onChange={(e) => {
                    const n = parseInt(e.target.value, 10)
                    if (!isNaN(n)) onUpdate({ ...fill, opacity: Math.max(0, Math.min(100, n)) / 100 })
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                }}
                onFocus={(e) => e.target.select()}
                onClick={(e) => e.stopPropagation()}
            />
            <span className="text-[10px] text-muted-foreground/40 w-2 shrink-0">%</span>

            {/* Visibility toggle */}
            <button
                className={cn(
                    'w-5 h-5 flex items-center justify-center rounded-sm transition-colors shrink-0',
                    'text-muted-foreground/40 hover:text-foreground hover:bg-muted/50',
                    !isVisible && 'text-muted-foreground/25',
                )}
                onClick={() => onUpdate({ ...fill, visible: !isVisible })}
                title={isVisible ? 'Hide fill' : 'Show fill'}
            >
                {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
            </button>

            {/* Remove button — only visible on hover */}
            <button
                className={cn(
                    'w-5 h-5 flex items-center justify-center rounded-sm transition-all shrink-0',
                    'text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10',
                    hovered || pickerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
                onClick={onRemove}
                title="Remove fill"
            >
                {/* Minus icon inline SVG for compact size */}
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* ColorPicker portal */}
            {fill.type === 'solid' && (
                <ColorPicker
                    fill={fill as SolidFill}
                    onChange={(updated) => onUpdate(updated)}
                    anchorEl={swatchRef.current}
                    open={pickerOpen}
                    onClose={() => setPickerOpen(false)}
                    documentColors={documentColors}
                />
            )}
        </div>
    )
}

// ─────────────────────────────────────────────────────────────
// FillSection
// ─────────────────────────────────────────────────────────────

interface FillSectionProps {
    node: ScytleNode
    onUpdate: (updates: Record<string, unknown>) => void
}

export function FillSection({ node, onUpdate }: FillSectionProps) {
    const allNodes = useEditorStore((s) => s.nodes)
    const fills = node.fills ?? []
    const documentColors = collectDocumentColors(allNodes)

    const updateFill = useCallback((index: number, newFill: Fill) => {
        const newFills = fills.map((f, i) => (i === index ? newFill : f))
        onUpdate({ fills: newFills })
    }, [fills, onUpdate])

    const removeFill = useCallback((index: number) => {
        onUpdate({ fills: fills.filter((_, i) => i !== index) })
    }, [fills, onUpdate])

    const addSolidFill = useCallback(() => {
        const newFill: SolidFill = {
            type: 'solid',
            id: generateId(),
            color: 'ffffff',
            opacity: 1,
            visible: true,
            blendMode: 'NORMAL',
        }
        onUpdate({ fills: [...fills, newFill] })
    }, [fills, onUpdate])

    return (
        <div className="border-b border-border/40">
            {/* Section header */}
            <div className="flex items-center gap-1.5 px-3 h-8">
                {/* Fill icon */}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground/60 shrink-0">
                    <rect x="1.5" y="1.5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
                    <rect x="3.5" y="3.5" width="5" height="5" rx="0.5" fill="currentColor" opacity="0.5" />
                </svg>
                <span className="flex-1 text-[11px] font-medium text-muted-foreground">Fill</span>
                <button
                    className="w-5 h-5 flex items-center justify-center rounded-sm transition-colors
                        text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
                    onClick={addSolidFill}
                    title="Add fill"
                >
                    <Plus size={12} />
                </button>
            </div>

            {/* Fill rows */}
            {fills.length > 0 && (
                <div className="px-3 pb-2 space-y-0.5">
                    {fills.map((fill, i) => (
                        <FillRow
                            key={fill.id ?? i}
                            fill={fill}
                            onUpdate={(newFill) => updateFill(i, newFill)}
                            onRemove={() => removeFill(i)}
                            documentColors={documentColors}
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {fills.length === 0 && (
                <div className="px-3 pb-2">
                    <button
                        className="w-full h-7 text-[11px] text-muted-foreground/40 hover:text-muted-foreground
                            border border-dashed border-border/30 hover:border-border/60
                            rounded-sm transition-colors flex items-center justify-center gap-1"
                        onClick={addSolidFill}
                    >
                        <Plus size={10} />
                        Add fill
                    </button>
                </div>
            )}
        </div>
    )
}
