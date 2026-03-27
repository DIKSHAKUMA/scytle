'use client'

import { useRef, useState, useCallback } from 'react'
import type { ScytleNode, Shadow, Fill, SolidFill } from '@/types/canvas'
import { NumberInput, SelectInput } from './inputs'
import { Plus, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { normaliseHex, hexOpacityToRgba } from '@/lib/color-utils'
import { ColorPicker } from './color-picker'
import { useThemeTable, resolveDisplayColor, isThemeLinked } from './use-theme-resolved'
import { ThemeLinkBadge } from './theme-link-badge'
import { VariablePicker } from './variable-picker'
import { useEditorStore } from '@/store/editor-store'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

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

function shadowColorToFill(color: string): SolidFill {
    const m = color.match(/rgba?\(\s*(\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\s*\)/)
    if (m) {
        const r = parseInt(m[1]), g = parseInt(m[2]), b = parseInt(m[3])
        const hex = `${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
        return { type: 'solid', color: hex, opacity: m[4] ? parseFloat(m[4]) : 1 }
    }
    return { type: 'solid', color: normaliseHex(color).replace('#', ''), opacity: 1 }
}

function fillToShadowColor(fill: Fill): string {
    if (fill.type === 'solid') {
        const hex = normaliseHex(fill.color)
        const opacity = fill.opacity ?? 1
        if (opacity >= 1) return hex
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r},${g},${b},${opacity})`
    }
    return '#000000'
}

// ─────────────────────────────────────────────────────────────
// ShadowRow — identical React tree depth to StrokeRow
// Returns a fragment: main row + optional expanded row
// ─────────────────────────────────────────────────────────────

const SHADOW_TYPE_OPTIONS = [
    { value: 'drop', label: 'Drop shadow' },
    { value: 'inner', label: 'Inner shadow' },
]

interface ShadowRowProps {
    shadow: Shadow
    onUpdate: (partial: Partial<Shadow>) => void
    onRemove: () => void
    documentColors: string[]
}

function ShadowRow({ shadow, onUpdate, onRemove, documentColors }: ShadowRowProps) {
    const swatchRef = useRef<HTMLButtonElement>(null)
    const badgeRef = useRef<HTMLSpanElement>(null)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [varPickerOpen, setVarPickerOpen] = useState(false)
    const [expanded, setExpanded] = useState(false)

    // Theme resolution for shadow color
    // shadow.color is rgba string, but shadow.colorRef resolves to hex from variable table
    // We resolve the ref to get the theme hex, then use shadow's existing rgba for display when not linked
    const { table, mode } = useThemeTable()
    const fill = shadowColorToFill(shadow.color)
    const isVisible = shadow.visible !== false
    const opacity = fill.opacity ?? 1
    const hex = fill.color.toUpperCase()

    const handlePickerChange = useCallback((updated: Fill) => {
        if (updated.type === 'solid') {
            const partial: Partial<Shadow> & { colorRef?: undefined; detached?: boolean } = {
                color: fillToShadowColor(updated),
            }
            // Auto-detach from theme on user edit
            if (isThemeLinked(shadow.colorRef, shadow.detached)) {
                partial.colorRef = undefined
                partial.detached = true
            }
            onUpdate(partial)
        }
    }, [onUpdate, shadow.colorRef, shadow.detached])

    return (
        <>
            {/* Main row — exact same structure as StrokeRow */}
            <div
                className={cn(
                    'group flex items-center gap-1 h-7 rounded-sm px-1 -mx-1',
                    'transition-colors',
                    pickerOpen ? 'bg-muted/40' : 'hover:bg-muted/20',
                )}
            >
                {/* Expand toggle */}
                <button
                    className={cn(
                        'w-4 h-5 flex items-center justify-center rounded-sm transition-colors shrink-0',
                        expanded ? 'text-foreground' : 'text-muted-foreground/40 hover:text-muted-foreground',
                    )}
                    onClick={() => setExpanded(v => !v)}
                    title="Effect settings"
                >
                    {expanded ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                </button>

                {/* Color swatch */}
                <button
                    ref={swatchRef}
                    className={cn(
                        'w-5 h-5 rounded-sm border shrink-0 transition-all',
                        'border-border/40 hover:border-border/80',
                        pickerOpen && 'ring-1 ring-primary/40',
                        !isVisible && 'opacity-40',
                    )}
                    style={{ backgroundColor: hexOpacityToRgba(normaliseHex(fill.color), opacity) }}
                    onClick={() => setPickerOpen(true)}
                    title="Edit shadow color"
                />

                {/* Theme link indicator + Variable picker */}
                <span ref={badgeRef}>
                    <ThemeLinkBadge
                        isLinked={isThemeLinked(shadow.colorRef, shadow.detached)}
                        variableName={shadow.colorRef}
                        showUnlinked
                        onClick={() => setVarPickerOpen(v => !v)}
                    />
                </span>
                <VariablePicker
                    open={varPickerOpen}
                    anchorEl={badgeRef.current}
                    scope="shadow.color"
                    currentRef={shadow.colorRef}
                    onBind={(key) => {
                        onUpdate({ colorRef: key, detached: false })
                    }}
                    onDetach={() => {
                        onUpdate({ colorRef: undefined, detached: true })
                    }}
                    onClose={() => setVarPickerOpen(false)}
                />

                {/* Hex */}
                <span
                    className={cn(
                        'flex-1 text-[11px] text-muted-foreground font-mono uppercase cursor-default truncate',
                        !isVisible && 'opacity-40',
                    )}
                    onClick={() => setPickerOpen(true)}
                >
                    {hex}
                </span>

                {/* Type label */}
                <span className="text-[10px] text-muted-foreground/50 shrink-0">
                    {shadow.type === 'drop' ? 'Drop' : 'Inner'}
                </span>

                {/* Opacity % */}
                <input
                    type="text"
                    inputMode="numeric"
                    value={Math.round(opacity * 100)}
                    className={cn(
                        'w-10 h-6 px-1 text-[11px] text-center font-mono rounded-sm text-foreground',
                        'bg-transparent border border-transparent',
                        'hover:bg-muted/50 focus:bg-muted/60 focus:border-border focus:outline-none',
                        'transition-colors tabular-nums',
                        !isVisible && 'opacity-40',
                    )}
                    onChange={(e) => {
                        const n = parseInt(e.target.value, 10)
                        if (!isNaN(n)) onUpdate({ color: fillToShadowColor({ ...fill, opacity: Math.max(0, Math.min(100, n)) / 100 }) })
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur()
                        } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault()
                            const delta = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1)
                            const newVal = Math.max(0, Math.min(100, Math.round(opacity * 100) + delta))
                            onUpdate({ color: fillToShadowColor({ ...fill, opacity: newVal / 100 }) })
                        }
                    }}
                    onFocus={(e) => e.target.select()}
                    onClick={(e) => e.stopPropagation()}
                />
                <span className="text-[10px] text-muted-foreground/40 w-2 shrink-0">%</span>

                {/* Visibility */}
                <button
                    className={cn(
                        'w-5 h-5 flex items-center justify-center rounded-sm transition-colors shrink-0',
                        isVisible
                            ? 'text-muted-foreground/40 hover:text-foreground hover:bg-muted/50'
                            : 'text-muted-foreground/25 hover:text-muted-foreground',
                    )}
                    onClick={() => onUpdate({ visible: !isVisible })}
                    title={isVisible ? 'Hide effect' : 'Show effect'}
                >
                    {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
                </button>

                {/* Remove */}
                <button
                    className={cn(
                        'w-5 h-5 flex items-center justify-center rounded-sm transition-all shrink-0',
                        'text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10',
                    )}
                    onClick={onRemove}
                    title="Remove effect"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                </button>

                {/* ColorPicker — last child, identical position to StrokeRow */}
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

            {/* Expanded controls — sibling div, not a wrapper */}
            {expanded && (
                <div className="pl-6 pr-1 pt-1 pb-1.5 space-y-1.5">
                    <SelectInput
                        value={shadow.type}
                        options={SHADOW_TYPE_OPTIONS}
                        onChange={(v) => onUpdate({ type: v as Shadow['type'] })}
                    />
                    <div className="grid grid-cols-2 gap-x-2">
                        <NumberInput label="X" value={shadow.x} onChange={(v) => onUpdate({ x: v })} step={1} labelWidth="w-4" />
                        <NumberInput label="Y" value={shadow.y} onChange={(v) => onUpdate({ y: v })} step={1} labelWidth="w-4" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-2">
                        <NumberInput label="Bl" value={shadow.blur} onChange={(v) => onUpdate({ blur: v })} min={0} step={1} labelWidth="w-4" />
                        <NumberInput label="Sp" value={shadow.spread} onChange={(v) => onUpdate({ spread: v })} step={1} labelWidth="w-4" />
                    </div>
                </div>
            )}
        </>
    )
}

// ─────────────────────────────────────────────────────────────
// EffectsSection
// ─────────────────────────────────────────────────────────────

interface EffectsSectionProps {
    node: ScytleNode
    onUpdate: (updates: Record<string, unknown>) => void
}

export function EffectsSection({ node, onUpdate }: EffectsSectionProps) {
    const allNodes = useEditorStore((s) => s.nodes)
    const documentColors = collectDocumentColors(allNodes)
    const shadows = node.shadows

    const updateShadow = useCallback(
        (index: number, partial: Partial<Shadow>) => {
            onUpdate({ shadows: shadows.map((s, i) => i === index ? { ...s, ...partial } : s) })
        },
        [shadows, onUpdate]
    )

    const addShadow = useCallback(() => {
        onUpdate({
            shadows: [
                { type: 'drop', color: 'rgba(0,0,0,0.25)', x: 0, y: 4, blur: 4, spread: 0, visible: true },
                ...shadows,
            ],
        })
    }, [shadows, onUpdate])

    const removeShadow = useCallback(
        (index: number) => onUpdate({ shadows: shadows.filter((_, i) => i !== index) }),
        [shadows, onUpdate]
    )

    return (
        <div className="border-b border-border/40">
            {/* Header */}
            <div className="flex items-center gap-1.5 px-3 h-8">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-muted-foreground/60 shrink-0">
                    <path d="M6 1L7.5 4.5L11 6L7.5 7.5L6 11L4.5 7.5L1 6L4.5 4.5L6 1Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" fill="none" />
                </svg>
                <span className="flex-1 text-[11px] font-medium text-muted-foreground">Effects</span>
                <button
                    className="w-5 h-5 flex items-center justify-center rounded-sm transition-colors text-muted-foreground/40 hover:text-foreground hover:bg-muted/50"
                    onClick={addShadow}
                    title="Add effect"
                >
                    <Plus size={12} />
                </button>
            </div>

            {/* Rows */}
            {shadows.length > 0 && (
                <div className="px-3 pb-2 space-y-0.5">
                    {shadows.map((shadow, i) => (
                        <ShadowRow
                            key={i}
                            shadow={shadow}
                            onUpdate={(partial) => updateShadow(i, partial)}
                            onRemove={() => removeShadow(i)}
                            documentColors={documentColors}
                        />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {shadows.length === 0 && (
                <div className="px-3 pb-2">
                    <button
                        className="w-full h-7 text-[11px] text-muted-foreground/40 hover:text-muted-foreground
                            border border-dashed border-border/30 hover:border-border/60
                            rounded-sm transition-colors flex items-center justify-center gap-1"
                        onClick={addShadow}
                    >
                        <Plus size={10} />
                        Add effect
                    </button>
                </div>
            )}
        </div>
    )
}
