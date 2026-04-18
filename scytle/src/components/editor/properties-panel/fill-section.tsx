'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { Plus, Eye, EyeOff, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { generateId } from '@/lib/utils'
import { normaliseHex, hexOpacityToRgba } from '@/lib/color-utils'
import { ColorPicker } from './color-picker'
import { useThemeTable, resolveDisplayColor, isThemeLinked } from './use-theme-resolved'
import { ThemeLinkBadge } from './theme-link-badge'
import { VariablePicker } from './variable-picker'
import type { ScytleNode, Fill, SolidFill } from '@/types/canvas'
import { useEditorStore } from '@/store/editor-store'
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

/** Get a short blend mode label */
function blendLabel(mode: string | undefined): string | null {
    if (!mode || mode === 'NORMAL') return null
    const found = BLEND_MODE_LABELS[mode]
    return found ?? mode.charAt(0) + mode.slice(1).toLowerCase().replace(/_/g, ' ')
}

const BLEND_MODE_LABELS: Record<string, string> = {
    DARKEN: 'Darken',
    MULTIPLY: 'Multiply',
    PLUS_DARKER: 'Plus Darker',
    COLOR_BURN: 'Color Burn',
    LIGHTEN: 'Lighten',
    SCREEN: 'Screen',
    PLUS_LIGHTER: 'Plus Lighter',
    COLOR_DODGE: 'Color Dodge',
    OVERLAY: 'Overlay',
    SOFT_LIGHT: 'Soft Light',
    HARD_LIGHT: 'Hard Light',
    DIFFERENCE: 'Difference',
    EXCLUSION: 'Exclusion',
    HUE: 'Hue',
    SATURATION: 'Saturation',
    COLOR: 'Color',
    LUMINOSITY: 'Luminosity',
}

/** Get the swatch background style for a fill, using an optional resolved color */
function fillSwatchStyle(fill: Fill, resolvedColor?: string): React.CSSProperties {
    if (fill.type === 'solid') {
        const hex = normaliseHex(resolvedColor ?? fill.color)
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
    fillId: string
    fillIndex: number
    onUpdate: (newFill: Fill) => void
    onRemove: () => void
    documentColors: string[]
    onPickerOpenChange: (open: boolean) => void
}

function FillRow({ fill, fillId, fillIndex: _fillIndex, onUpdate, onRemove, documentColors, onPickerOpenChange }: FillRowProps) {
    const swatchRef = useRef<HTMLButtonElement>(null)
    const badgeRef = useRef<HTMLButtonElement>(null)
    const [pickerOpen, setPickerOpen] = useState(false)
    const [varPickerOpen, setVarPickerOpen] = useState(false)
    const [hexFocused, setHexFocused] = useState(false)
    const [localHex, setLocalHex] = useState('')

    // Sync from props
    useEffect(() => {
        if (!hexFocused && fill.type === 'solid') {
            setLocalHex(normaliseHex(fill.color).toUpperCase())
        }
    }, [fill, hexFocused])

    const commitHex = (val: string) => {
        if (fill.type !== 'solid') return;
        let v = val.trim().replace(/^#/, '')
        // Expand 3-char to 6-char
        if (/^[0-9A-Fa-f]{3}$/.test(v)) {
            v = v[0] + v[0] + v[1] + v[1] + v[2] + v[2]
        }
        if (/^[0-9A-Fa-f]{6}$/.test(v)) {
            onUpdate({ ...fill, color: v.toLowerCase() })
            setLocalHex(v.toUpperCase())
        } else {
            setLocalHex(normaliseHex(fill.color).toUpperCase())
        }
        setHexFocused(false)
    }

    // Theme resolution for solid fills
    const { table, mode } = useThemeTable()
    const resolvedColor = fill.type === 'solid'
        ? resolveDisplayColor(fill.colorRef, fill.color, fill.detached, table, mode)
        : undefined

    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: fillId })
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    const isVisible = fill.visible !== false
    const opacity = fill.opacity ?? 1

    const handleSwatchClick = useCallback(() => {
        setPickerOpen(true)
        onPickerOpenChange(true)
    }, [onPickerOpenChange])

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'group flex items-center gap-1 h-7 rounded-sm px-1 -mx-1',
                'transition-colors',
                pickerOpen ? 'bg-muted/40' : 'hover:bg-muted/20',
            )}
        >
            {/* Drag handle */}
            <button
                className={cn(
                    'w-3 h-5 flex items-center justify-center rounded-sm shrink-0',
                    'text-muted-foreground/0 group-hover:text-muted-foreground/30',
                    'hover:!text-muted-foreground/60 cursor-grab active:cursor-grabbing transition-colors',
                )}
                {...attributes}
                {...listeners}
                tabIndex={-1}
            >
                <GripVertical size={10} />
            </button>
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
                    style={fillSwatchStyle(fill, resolvedColor)}
                    onClick={handleSwatchClick}
                    title="Edit fill"
                >
                    {/* Checkerboard for transparent fills */}
                    {fill.type === 'solid' && opacity < 0.05 && (
                        <div className="absolute inset-0 rounded-[2px]"
                            style={{ background: 'repeating-conic-gradient(#aaa 0% 25%, #fff 0% 50%) 0 0 / 4px 4px' }} />
                    )}
                </button>

                {/* Hex code or Variable Name */}
                <div className="flex-1 flex items-center pl-1.5 overflow-hidden">
                    {fill.type === 'solid' && isThemeLinked(fill.colorRef, fill.detached) ? (
                        <>
                            <span ref={badgeRef as React.RefObject<HTMLSpanElement>} className="flex-1 min-w-0">
                                <ThemeLinkBadge
                                    isLinked={true}
                                    variableName={fill.colorRef}
                                    showUnlinked
                                    onClick={() => setVarPickerOpen(v => !v)}
                                />
                            </span>
                            <VariablePicker
                                open={varPickerOpen}
                                anchorEl={badgeRef.current}
                                scope="fill.color"
                                currentRef={fill.colorRef}
                                onBind={(key) => onUpdate({ ...fill, colorRef: key, detached: false })}
                                onDetach={() => onUpdate({ ...fill, colorRef: undefined, detached: true })}
                                onClose={() => setVarPickerOpen(false)}
                            />
                        </>
                    ) : fill.type === 'solid' ? (
                        <input
                            type="text"
                            value={hexFocused ? localHex : normaliseHex(resolvedColor ?? fill.color).toUpperCase()}
                            onChange={(e) => setLocalHex(e.target.value.toUpperCase())}
                            onFocus={(e) => {
                                setHexFocused(true)
                                setLocalHex(normaliseHex(resolvedColor ?? fill.color).toUpperCase())
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
                    ) : (
                        <span className="w-full bg-transparent text-[11px] font-mono text-foreground outline-none cursor-default truncate" onClick={handleSwatchClick}>
                            {fillLabel(fill)}
                        </span>
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
                            if (!isNaN(n)) onUpdate({ ...fill, opacity: Math.max(0, Math.min(100, n)) / 100 })
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                (e.target as HTMLInputElement).blur()
                            } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                e.preventDefault()
                                const delta = (e.key === 'ArrowUp' ? 1 : -1) * (e.shiftKey ? 10 : 1)
                                const newVal = Math.max(0, Math.min(100, Math.round(opacity * 100) + delta))
                                onUpdate({ ...fill, opacity: newVal / 100 })
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
                onClick={() => onUpdate({ ...fill, visible: !isVisible })}
                title={isVisible ? 'Hide fill' : 'Show fill'}
            >
                {isVisible ? <Eye size={11} /> : <EyeOff size={11} />}
            </button>

            {/* Remove button — always visible */}
            <button
                className={cn(
                    'w-5 h-5 flex items-center justify-center rounded-sm transition-all shrink-0',
                    'text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10',
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
            <ColorPicker
                fill={fill.type === 'solid' && resolvedColor
                    ? { ...fill, color: resolvedColor }
                    : fill}
                onChange={(updated) => {
                    // Auto-detach from theme when user edits a theme-linked color
                    if (updated.type === 'solid' && fill.type === 'solid' && isThemeLinked(fill.colorRef, fill.detached)) {
                        onUpdate({ ...updated, colorRef: undefined, detached: true })
                    } else {
                        onUpdate(updated)
                    }
                }}
                anchorEl={swatchRef.current}
                open={pickerOpen}
                onClose={() => { setPickerOpen(false); onPickerOpenChange(false) }}
                documentColors={documentColors}
            />
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
    const setGradientEditingFillIdx = useEditorStore((s) => s.setGradientEditingFillIdx)
    const setImageCropEditingFillIdx = useEditorStore((s) => s.setImageCropEditingFillIdx)
    const imageCropEditingFillIdx = useEditorStore((s) => s.imageCropEditingFillIdx)
    const fills = node.fills ?? []
    const documentColors = collectDocumentColors(allNodes)

    // Ensure stable DnD IDs — use fill.id if set, fallback to index-based
    const fillIds = fills.map((f, i) => f.id ?? String(i))

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event
        if (over && active.id !== over.id) {
            const oldIdx = fillIds.indexOf(active.id as string)
            const newIdx = fillIds.indexOf(over.id as string)
            if (oldIdx !== -1 && newIdx !== -1) {
                onUpdate({ fills: arrayMove(fills, oldIdx, newIdx) })
            }
        }
    }, [fills, fillIds, onUpdate])

    const updateFill = useCallback((index: number, newFill: Fill) => {
        const newFills = fills.map((f, i) => (i === index ? newFill : f))
        onUpdate({ fills: newFills })
        // Auto-enter crop mode when a fill switches to crop
        if (newFill.type === 'image' && newFill.fit === 'crop') {
            setImageCropEditingFillIdx(index)
        }
    }, [fills, onUpdate, setImageCropEditingFillIdx])

    const removeFill = useCallback((index: number) => {
        onUpdate({ fills: fills.filter((_, i) => i !== index) })
        // Update crop editing index: clear if own fill removed, shift down if a fill above was removed
        if (index === imageCropEditingFillIdx) {
            setImageCropEditingFillIdx(null)
        } else if (imageCropEditingFillIdx !== null && index < imageCropEditingFillIdx) {
            setImageCropEditingFillIdx(imageCropEditingFillIdx - 1)
        }
    }, [fills, onUpdate, imageCropEditingFillIdx, setImageCropEditingFillIdx])

    const addSolidFill = useCallback(() => {
        const newFill: SolidFill = {
            type: 'solid',
            id: generateId(),
            color: '000000',
            opacity: 0.2,
            visible: true,
            blendMode: 'NORMAL',
        }
        onUpdate({ fills: [newFill, ...fills] })
        // New fill is prepended — shift the crop editing index so it still points to the same fill
        if (imageCropEditingFillIdx !== null) {
            setImageCropEditingFillIdx(imageCropEditingFillIdx + 1)
        }
    }, [fills, onUpdate, imageCropEditingFillIdx, setImageCropEditingFillIdx])

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
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext items={fillIds} strategy={verticalListSortingStrategy}>
                            {fills.map((fill, i) => (
                                <FillRow
                                    key={fillIds[i]}
                                    fill={fill}
                                    fillId={fillIds[i]}
                                    fillIndex={i}
                                    onUpdate={(newFill) => updateFill(i, newFill)}
                                    onRemove={() => removeFill(i)}
                                    documentColors={documentColors}
                                    onPickerOpenChange={(open) => {
                                        if (open && fill.type === 'gradient') setGradientEditingFillIdx(i)
                                        else if (!open) setGradientEditingFillIdx(null)
                                        if (open && fill.type === 'image' && fill.fit === 'crop') setImageCropEditingFillIdx(i)
                                        // Don't clear imageCropEditingFillIdx on close — crop overlay persists while fit=crop
                                    }}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
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
