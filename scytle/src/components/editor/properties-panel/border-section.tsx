'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import type { ScytleNode, Border, BorderRadius, Fill, SolidFill } from '@/types/canvas'
import { NumberInput, SelectInput } from './inputs'
import { Plus, Eye, EyeOff, CornerUpRight, Blend, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import { normaliseHex, hexOpacityToRgba } from '@/lib/color-utils'
import { ColorPicker } from './color-picker'
import { useThemeTable, resolveDisplayColor, resolveDisplayNumber, isThemeLinked } from './use-theme-resolved'
import { ThemeLinkBadge } from './theme-link-badge'
import { useEditorStore } from '@/store/editor-store'

interface SectionProps {
    node: ScytleNode
    onUpdate: (updates: Record<string, unknown>) => void
}

/* ── Rounded-corner icon for the radius label ─────────────── */

function RadiusCornerIcon({ size = 12 }: { size?: number }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 12 12"
            fill="none"
            className="text-muted-foreground shrink-0"
        >
            <path
                d="M10 10 L10 4.5 Q10 2 7.5 2 L2 2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    )
}

/* ── Appearance Section — opacity + corner radius ─────────── */

export function AppearanceSection({ node, onUpdate }: SectionProps) {
    const radius = node.borderRadius

    // Theme resolution for border radius
    const { table, mode } = useThemeTable()
    const isUniformRadius = typeof radius === 'number'
    const [perCorner, setPerCorner] = useState(!isUniformRadius)
    const rawUniformRadius = typeof radius === 'number' ? radius : radius.topLeft
    const uniformRadius = isUniformRadius
        ? resolveDisplayNumber(node.borderRadiusRef, rawUniformRadius, node.borderRadiusDetached, table, mode)
        : rawUniformRadius

    const updateRadius = (
        value: number | Partial<Record<'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft', number>>
    ) => {
        if (typeof value === 'number') {
            // Auto-detach border radius from theme on user edit
            if (isThemeLinked(node.borderRadiusRef, node.borderRadiusDetached)) {
                onUpdate({ borderRadius: value, borderRadiusRef: undefined, borderRadiusDetached: true })
            } else {
                onUpdate({ borderRadius: value })
            }
        } else {
            const current =
                typeof radius === 'number'
                    ? { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius }
                    : radius
            // Per-corner always detaches
            onUpdate({ borderRadius: { ...current, ...value }, borderRadiusRef: undefined, borderRadiusDetached: true })
        }
    }

    return (
        <div className="border-b border-border/40">
            {/* Section header */}
            <div className="flex items-center gap-1.5 px-3 h-8">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground/60 shrink-0">
                    <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
                    <path d="M6 3v6" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <path d="M3 6h6" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                </svg>
                <span className="flex-1 text-[11px] font-medium text-muted-foreground">Appearance</span>
            </div>

            <div className="px-3 pb-2">
                <div className="grid grid-cols-2 gap-x-2">
                    {/* Opacity */}
                    <div className="flex items-center gap-1">
                        <Blend
                            size={11}
                            className="text-muted-foreground/70 shrink-0"
                            style={{ minWidth: 18 }}
                        />
                        <NumberInput
                            value={Math.round(node.opacity * 100)}
                            onChange={(v) => onUpdate({ opacity: v / 100 })}
                            min={0}
                            max={100}
                            step={1}
                            suffix="%"
                        />
                    </div>

                    {/* Border radius */}
                    <div className="flex items-center gap-1">
                        <RadiusCornerIcon size={12} />
                        <NumberInput
                            value={uniformRadius}
                            onChange={(v) => {
                                if (perCorner) {
                                    updateRadius({
                                        topLeft: v,
                                        topRight: v,
                                        bottomLeft: v,
                                        bottomRight: v,
                                    })
                                } else {
                                    updateRadius(v)
                                }
                            }}
                            min={0}
                            step={1}
                            className="flex-1"
                        />
                        <button
                            className={cn(
                                'p-1 rounded-sm transition-colors shrink-0',
                                perCorner
                                    ? 'text-foreground bg-muted/60'
                                    : 'text-muted-foreground/40 hover:text-muted-foreground'
                            )}
                            onClick={() => {
                                if (perCorner) updateRadius(uniformRadius)
                                setPerCorner(!perCorner)
                            }}
                            title={perCorner ? 'Uniform corners' : 'Individual corners'}
                        >
                            <CornerUpRight size={12} />
                        </button>
                    </div>
                </div>

                {/* Overflow — only for frames */}
                {node.type === 'frame' && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <Scissors size={11} className="text-muted-foreground/60 shrink-0" style={{ minWidth: 18 }} />
                        <SelectInput
                            value={(node as import('@/types/canvas').FrameNode).overflow}
                            options={[
                                { value: 'visible', label: 'Visible' },
                                { value: 'hidden', label: 'Clip content' },
                            ]}
                            onChange={(v) => onUpdate({ overflow: v })}
                            className="flex-1"
                        />
                    </div>
                )}

                {perCorner && (
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 mt-1.5">
                        <NumberInput
                            label="TL"
                            value={typeof radius === 'number' ? radius : radius.topLeft}
                            onChange={(v) => updateRadius({ topLeft: v })}
                            min={0}
                            step={1}
                            labelWidth="w-5"
                        />
                        <NumberInput
                            label="TR"
                            value={typeof radius === 'number' ? radius : radius.topRight}
                            onChange={(v) => updateRadius({ topRight: v })}
                            min={0}
                            step={1}
                            labelWidth="w-5"
                        />
                        <NumberInput
                            label="BL"
                            value={typeof radius === 'number' ? radius : radius.bottomLeft}
                            onChange={(v) => updateRadius({ bottomLeft: v })}
                            min={0}
                            step={1}
                            labelWidth="w-5"
                        />
                        <NumberInput
                            label="BR"
                            value={typeof radius === 'number' ? radius : radius.bottomRight}
                            onChange={(v) => updateRadius({ bottomRight: v })}
                            min={0}
                            step={1}
                            labelWidth="w-5"
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

/* ── Helpers ───────────────────────────────────────────────── */

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

/** Convert Border to a SolidFill for the ColorPicker */
function borderToFill(border: Border): SolidFill {
    return {
        type: 'solid',
        color: normaliseHex(border.color).replace('#', ''),
        opacity: border.opacity ?? 1,
    }
}

/* ── StrokeRow — Figma-style fill row for stroke ──────────── */

interface StrokeRowProps {
    border: Border
    onUpdate: (partial: Partial<Border>) => void
    onRemove: () => void
    documentColors: string[]
}

function StrokeRow({ border, onUpdate, onRemove, documentColors }: StrokeRowProps) {
    const swatchRef = useRef<HTMLButtonElement>(null)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [hexFocused, setHexFocused] = useState(false)
    const [localHex, setLocalHex] = useState('')

    // Sync from props
    useEffect(() => {
        if (!hexFocused) {
            setLocalHex(normaliseHex(border.color).replace('#', '').toUpperCase())
        }
    }, [border.color, hexFocused])

    const commitHex = (val: string) => {
        let v = val.trim().replace(/^#/, '')
        if (/^[0-9A-Fa-f]{3}$/.test(v)) {
            v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
        }
        if (/^[0-9A-Fa-f]{6}$/.test(v)) {
            onUpdate({ color: '#' + v.toLowerCase() })
            setLocalHex(v.toUpperCase())
        } else {
            setLocalHex(normaliseHex(border.color).replace('#', '').toUpperCase())
        }
        setHexFocused(false)
    }

    // Theme resolution for border color
    const { table, mode } = useThemeTable()
    const resolvedColor = resolveDisplayColor(border.colorRef, border.color, border.detached, table, mode)

    const fill = borderToFill({ ...border, color: resolvedColor })
    const isVisible = border.visible !== false
    const opacity = border.opacity ?? 1
    const hex = normaliseHex(resolvedColor).replace('#', '').toUpperCase()

    const handlePickerChange = useCallback((updated: Fill) => {
        if (updated.type === 'solid') {
            const partial: Partial<Border> & { colorRef?: undefined; detached?: boolean } = {
                color: normaliseHex(updated.color),
                opacity: updated.opacity ?? 1,
            }
            // Auto-detach from theme on user edit
            if (isThemeLinked(border.colorRef, border.detached)) {
                partial.colorRef = undefined
                partial.detached = true
            }
            onUpdate(partial)
        }
    }, [onUpdate, border.colorRef, border.detached])

    return (
        <div
            className={cn(
                'group flex items-center gap-1 h-7 rounded-sm px-1 -mx-1',
                'transition-colors',
                pickerOpen ? 'bg-muted/40' : 'hover:bg-muted/20',
            )}
        >
            {/* Main encapsulate block (Swatch + Hex + Divider + Opacity) */}
            <div className={cn(
                "flex-1 flex items-center h-[26px] bg-muted/40 hover:bg-muted/60 transition-colors rounded-md px-1",
                !isVisible && 'opacity-40'
            )}>
                {/* Color swatch */}
                <button
                    ref={swatchRef}
                    className={cn(
                        'w-3.5 h-3.5 rounded-[2px] border shadow-sm shrink-0 transition-all flex items-center justify-center',
                        'border-border/60 hover:border-foreground/40',
                        pickerOpen && 'ring-1 ring-primary/40'
                    )}
                    style={{ backgroundColor: hexOpacityToRgba(normaliseHex(resolvedColor), opacity) }}
                    onClick={() => setPickerOpen(true)}
                    title="Edit stroke color"
                />

                {/* Hex code or Theme Link */}
                <div className="flex-1 flex items-center pl-1.5 overflow-hidden">
                    {isThemeLinked(border.colorRef, border.detached) ? (
                        <ThemeLinkBadge 
                            isLinked={true} 
                            variableName={border.colorRef} 
                        />
                    ) : (
                        <input
                            type="text"
                            value={hexFocused ? localHex : hex}
                            onChange={(e) => setLocalHex(e.target.value.toUpperCase())}
                            onFocus={(e) => {
                                setHexFocused(true)
                                setLocalHex(hex)
                                e.target.select()
                            }}
                            onBlur={() => commitHex(localHex)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    commitHex(localHex)
                                    ;(e.target as HTMLInputElement).blur()
                                }
                            }}
                            className="w-full bg-transparent text-[11px] font-mono text-foreground outline-none uppercase truncate"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}
                </div>

                {/* Vertical Divider */}
                <div className="w-[1px] h-3 bg-border/50 mx-1 shrink-0" />

                {/* Opacity % */}
                <div className="flex items-center shrink-0 pr-0.5">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={Math.round(opacity * 100)}
                        className={cn(
                            'w-7 h-5 px-0.5 text-[11px] text-right font-mono rounded-[2px] text-foreground',
                            'bg-transparent border border-transparent outline-none tabular-nums',
                            'hover:bg-muted/60 focus:bg-background focus:ring-1 focus:ring-primary/40 focus:border-border'
                        )}
                        onChange={(e) => {
                            const n = parseInt(e.target.value, 10)
                            if (!isNaN(n)) onUpdate({ opacity: Math.max(0, Math.min(100, n)) / 100 })
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur()
                            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                e.preventDefault()
                                const delta = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1)
                                const newVal = Math.max(0, Math.min(100, Math.round(opacity * 100) + delta))
                                onUpdate({ opacity: newVal / 100 })
                            }
                        }}
                        onFocus={(e) => e.target.select()}
                        onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-[10px] text-muted-foreground/50 shrink-0 select-none pointer-events-none">%</span>
                </div>
            </div>

            {/* Visibility toggle */}
            <button
                className={cn(
                    'w-5 h-5 flex items-center justify-center rounded-sm transition-colors shrink-0',
                    'text-muted-foreground/40 hover:text-foreground hover:bg-muted/50',
                    !isVisible && 'text-muted-foreground/25',
                )}
                onClick={() => onUpdate({ visible: !isVisible })}
                title={isVisible ? 'Hide stroke' : 'Show stroke'}
            >
                {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
            </button>

            {/* Remove button */}
            <button
                className={cn(
                    'w-5 h-5 flex items-center justify-center rounded-sm transition-all shrink-0',
                    'text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10',
                )}
                onClick={onRemove}
                title="Remove stroke"
            >
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
            </button>

            {/* ColorPicker portal */}
            <ColorPicker
                fill={fill}
                onChange={handlePickerChange}
                anchorEl={swatchRef.current}
                open={pickerOpen}
                onClose={() => setPickerOpen(false)}
                documentColors={documentColors}
                solidOnly
            />
        </div>
    )
}

/* ── Stroke position options ──────────────────────────────── */

const STROKE_POSITION_OPTIONS = [
    { value: 'inside', label: 'Inside' },
    { value: 'center', label: 'Center' },
    { value: 'outside', label: 'Outside' },
]

const STROKE_STYLE_OPTIONS = [
    { value: 'solid', label: 'Solid' },
    { value: 'dashed', label: 'Dashed' },
    { value: 'dotted', label: 'Dotted' },
]

/* ── StrokeSection — Figma-parity stroke panel ─────────────── */

export function StrokeSection({ node, onUpdate }: SectionProps) {
    const allNodes = useEditorStore((s) => s.nodes)
    const documentColors = collectDocumentColors(allNodes)

    const border = node.border

    const addStroke = useCallback(() => {
        onUpdate({
            border: {
                color: '#000000',
                width: 1,
                style: 'solid',
                position: 'inside',
                opacity: 1,
                visible: true,
            },
        })
    }, [onUpdate])

    const removeStroke = useCallback(() => {
        onUpdate({ border: undefined })
    }, [onUpdate])

    const updateBorder = useCallback(
        (partial: Partial<Border>) => {
            if (!border) return
            onUpdate({ border: { ...border, ...partial } })
        },
        [border, onUpdate]
    )

    return (
        <div className="border-b border-border/40">
            {/* Section header */}
            <div className="flex items-center gap-1.5 px-3 h-8">
                {/* Stroke icon — nested rectangles */}
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    className="text-muted-foreground/60 shrink-0"
                >
                    <rect
                        x="1.5"
                        y="1.5"
                        width="9"
                        height="9"
                        rx="1.5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        fill="none"
                    />
                </svg>
                <span className="flex-1 text-[11px] font-medium text-muted-foreground">
                    Stroke
                </span>
                <button
                    className="w-5 h-5 flex items-center justify-center rounded-sm transition-colors
                        text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
                    onClick={addStroke}
                    title="Add stroke"
                >
                    <Plus size={12} />
                </button>
            </div>

            {/* Stroke row + controls */}
            {border && (
                <div className="px-3 pb-2 space-y-1.5">
                    <StrokeRow
                        border={border}
                        onUpdate={updateBorder}
                        onRemove={removeStroke}
                        documentColors={documentColors}
                    />

                    {/* Position + Style + Weight row */}
                    <div className="flex items-center gap-2">
                        <SelectInput
                            value={border.position ?? 'inside'}
                            options={STROKE_POSITION_OPTIONS}
                            onChange={(v) =>
                                updateBorder({ position: v as Border['position'] })
                            }
                            className="flex-1"
                        />
                        <SelectInput
                            value={border.style}
                            options={STROKE_STYLE_OPTIONS}
                            onChange={(v) => updateBorder({ style: v as Border['style'] })}
                            className="flex-1"
                        />
                        <NumberInput
                            value={border.width}
                            onChange={(v) => updateBorder({ width: v })}
                            min={0}
                            step={1}
                            className="w-14"
                        />
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!border && (
                <div className="px-3 pb-2">
                    <button
                        className="w-full h-7 text-[11px] text-muted-foreground/40 hover:text-muted-foreground
                            border border-dashed border-border/30 hover:border-border/60
                            rounded-sm transition-colors flex items-center justify-center gap-1"
                        onClick={addStroke}
                    >
                        <Plus size={10} />
                        Add stroke
                    </button>
                </div>
            )}
        </div>
    )
}
