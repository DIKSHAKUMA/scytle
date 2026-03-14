'use client'

import type { FrameNode, Layout, Padding } from '@/types/canvas'
import { Section, NumberInput, Checkbox } from './inputs'
import {
    ArrowDown,
    ArrowRight,
    LayoutGrid,
    Move,
    WrapText,
} from 'lucide-react'
import { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/store/editor-store'

// ── Figma-style flow radio group ─────────────────────────────

type LayoutMode = 'none' | 'flex-col' | 'flex-row' | 'grid'

function layoutToMode(l: Layout): LayoutMode {
    if (l.mode === 'none') return 'none'
    if (l.mode === 'grid') return 'grid'
    return l.direction === 'row' ? 'flex-row' : 'flex-col'
}

function modeToLayout(mode: LayoutMode, prev: Layout): Partial<Layout> {
    switch (mode) {
        case 'none': return { mode: 'none' }
        case 'flex-col': return { mode: 'flex', direction: 'column' }
        case 'flex-row': return { mode: 'flex', direction: 'row' }
        case 'grid': return { mode: 'grid', columns: typeof prev.columns === 'number' ? prev.columns : 2 }
    }
}

const FLOW_OPTIONS: { value: LayoutMode; icon: React.ReactNode; label: string }[] = [
    { value: 'none', icon: <Move size={14} />, label: 'Free' },
    { value: 'flex-col', icon: <ArrowDown size={14} />, label: 'V' },
    { value: 'flex-row', icon: <ArrowRight size={14} />, label: 'H' },
    { value: 'grid', icon: <LayoutGrid size={14} />, label: 'Grid' },
]

// ── Padding icons (Figma-style inline SVGs) ─────────────────

function HorizontalPaddingIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="text-muted-foreground shrink-0">
            <line x1="1" y1="2" x2="1" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="11" y1="2" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 1.5" />
        </svg>
    )
}

function VerticalPaddingIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="text-muted-foreground shrink-0">
            <line x1="2" y1="1" x2="10" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="2" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="3.5" x2="6" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 1.5" />
        </svg>
    )
}

function LeftPaddingIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="text-muted-foreground shrink-0">
            <line x1="1" y1="2" x2="1" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 1.5" />
        </svg>
    )
}

function RightPaddingIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="text-muted-foreground shrink-0">
            <line x1="11" y1="2" x2="11" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3.5" y1="6" x2="8.5" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 1.5" />
        </svg>
    )
}

function TopPaddingIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="text-muted-foreground shrink-0">
            <line x1="2" y1="1" x2="10" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="3.5" x2="6" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 1.5" />
        </svg>
    )
}

function BottomPaddingIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="text-muted-foreground shrink-0">
            <line x1="2" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="3.5" x2="6" y2="8.5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="1.5 1.5" />
        </svg>
    )
}

function IndividualPaddingIcon({ expanded }: { expanded: boolean }) {
    return (
        <svg width={14} height={14} viewBox="0 0 14 14" fill="none" className="text-muted-foreground shrink-0">
            {expanded ? (
                <>
                    <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
                    <circle cx="4.5" cy="4.5" r="1" fill="currentColor" />
                    <circle cx="9.5" cy="4.5" r="1" fill="currentColor" />
                    <circle cx="4.5" cy="9.5" r="1" fill="currentColor" />
                    <circle cx="9.5" cy="9.5" r="1" fill="currentColor" />
                </>
            ) : (
                <>
                    <rect x="2" y="2" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1" />
                    <line x1="7" y1="3" x2="7" y2="11" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" />
                    <line x1="3" y1="7" x2="11" y2="7" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1.5 1" />
                </>
            )}
        </svg>
    )
}

// ── Gap direction icons ──────────────────────────────────────

function VerticalGapIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="text-muted-foreground shrink-0">
            <line x1="3" y1="1" x2="9" y2="1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="3" y1="6" x2="9" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="3" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}

function HorizontalGapIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="text-muted-foreground shrink-0">
            <line x1="1" y1="3" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="3" x2="6" y2="9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="11" y1="3" x2="11" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    )
}

// ── Space between icon ──────────────────────────────────────

function SpaceBetweenIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="shrink-0">
            <line x1="1" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="11" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="4.5" y1="4" x2="4.5" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="7.5" y1="4" x2="7.5" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
    )
}

function PackedIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className="shrink-0">
            <line x1="1" y1="1" x2="1" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="11" y1="1" x2="11" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="5" y1="4" x2="5" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="7" y1="4" x2="7" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
    )
}

// ── Scrub-on-label hook ──────────────────────────────────────

function useScrub(value: number, onChange: (v: number) => void, step = 1, min = 0) {
    const scrubRef = useRef<{ startX: number; startVal: number } | null>(null)

    const onPointerDown = useCallback((e: React.PointerEvent) => {
        e.preventDefault()
        scrubRef.current = { startX: e.clientX, startVal: value }
        const target = e.currentTarget as HTMLElement
        target.setPointerCapture(e.pointerId)
        target.style.cursor = 'ew-resize'

        const onMove = (me: PointerEvent) => {
            if (!scrubRef.current) return
            const dx = me.clientX - scrubRef.current.startX
            const delta = Math.round(dx / 2) * step
            const newVal = Math.max(min, scrubRef.current.startVal + delta)
            onChange(newVal)
        }

        const onUp = () => {
            scrubRef.current = null
            target.style.cursor = ''
            target.removeEventListener('pointermove', onMove)
            target.removeEventListener('pointerup', onUp)
        }

        target.addEventListener('pointermove', onMove)
        target.addEventListener('pointerup', onUp)
    }, [value, onChange, step, min])

    return { onPointerDown }
}

// ── 3×3 Alignment grid (Figma-style, space-between aware) ────

type Align3x3 = `${'start' | 'center' | 'end'}-${'start' | 'center' | 'end'}`

function getAlign3x3(j: Layout['justify'], a: Layout['align']): Align3x3 {
    const jj = j === 'between' ? 'start' : (j || 'start')
    const aa = a === 'stretch' ? 'start' : (a || 'start')
    return `${jj}-${aa}` as Align3x3
}

/** SVG cell for the alignment grid. Shows 3 lines packed or spread. */
function AlignmentDot({
    justify,
    align,
    isSpaceBetween,
    isRow,
}: {
    justify: 'start' | 'center' | 'end'
    align: 'start' | 'center' | 'end'
    isSpaceBetween: boolean
    isRow: boolean
}) {
    // Positions for 3 lines representing items
    // mainPos: position along main axis, crossPos: position along cross axis
    const getMainPositions = (): number[] => {
        if (isSpaceBetween) return [2, 8, 14] // spread to edges
        switch (justify) {
            case 'start': return [2, 5, 8]
            case 'center': return [5, 8, 11]
            case 'end': return [8, 11, 14]
        }
    }

    const getCrossOffset = (): number => {
        switch (align) {
            case 'start': return 3
            case 'center': return 8
            case 'end': return 13
        }
    }

    const mainPositions = getMainPositions()
    const crossOffset = getCrossOffset()

    return (
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
            {mainPositions.map((pos, i) => {
                const x = isRow ? pos : crossOffset
                const y = isRow ? crossOffset : pos
                const w = isRow ? 1.5 : 4
                const h = isRow ? 4 : 1.5
                return (
                    <rect
                        key={i}
                        x={x - w / 2}
                        y={y - h / 2}
                        width={w}
                        height={h}
                        rx={0.5}
                        fill="currentColor"
                    />
                )
            })}
        </svg>
    )
}

function AlignmentGrid({
    value,
    onChange,
    direction,
    isSpaceBetween,
}: {
    value: Align3x3
    onChange: (justify: 'start' | 'center' | 'end', align: 'start' | 'center' | 'end') => void
    direction: 'column' | 'row'
    isSpaceBetween: boolean
}) {
    const rows: ('start' | 'center' | 'end')[] = ['start', 'center', 'end']
    const cols: ('start' | 'center' | 'end')[] = ['start', 'center', 'end']
    const isRow = direction === 'row'

    return (
        <div className="grid grid-cols-3 gap-0 w-fit border border-border/40 rounded-sm overflow-hidden">
            {rows.map((r) =>
                cols.map((c) => {
                    const justify = isRow ? c : r
                    const align = isRow ? r : c
                    const key = `${justify}-${align}` as Align3x3
                    const active = isSpaceBetween
                        ? align === value.split('-')[1] // only cross-axis matters
                        : value === key

                    return (
                        <button
                            key={key}
                            className={cn(
                                'w-5 h-5 flex items-center justify-center transition-colors',
                                active
                                    ? 'bg-foreground text-background'
                                    : 'bg-muted/30 text-muted-foreground/40 hover:bg-muted/60 hover:text-muted-foreground'
                            )}
                            onClick={() => onChange(justify, align)}
                            title={`${justify} / ${align}`}
                        >
                            <AlignmentDot
                                justify={justify}
                                align={align}
                                isSpaceBetween={isSpaceBetween}
                                isRow={isRow}
                            />
                        </button>
                    )
                })
            )}
        </div>
    )
}

// ── Padding controls (Figma-exact, with directional hover) ──

function PaddingControls({
    padding,
    onChange,
    nodeId,
}: {
    padding: Padding
    onChange: (p: Partial<Padding>) => void
    nodeId: string
}) {
    const hMixed = padding.left !== padding.right
    const vMixed = padding.top !== padding.bottom
    const [individualMode, setIndividualMode] = useState(false)
    const setPaddingOverlay = useEditorStore((s) => s.setPaddingOverlay)

    // Comma-separated shorthand handler: "10" = all, "10,20" = V,H, "10,20,30,40" = T,R,B,L
    const handleShorthand = useCallback((values: number[]) => {
        const clamped = values.map((v) => Math.max(0, v))
        if (clamped.length === 1) {
            onChange({ top: clamped[0], right: clamped[0], bottom: clamped[0], left: clamped[0] })
        } else if (clamped.length === 2) {
            onChange({ top: clamped[0], bottom: clamped[0], left: clamped[1], right: clamped[1] })
        } else if (clamped.length === 3) {
            onChange({ top: clamped[0], right: clamped[1], bottom: clamped[2], left: clamped[1] })
        } else if (clamped.length >= 4) {
            onChange({ top: clamped[0], right: clamped[1], bottom: clamped[2], left: clamped[3] })
        }
    }, [onChange])

    const hScrub = useScrub(padding.left, (v) => onChange({ left: v, right: v }))
    const vScrub = useScrub(padding.top, (v) => onChange({ top: v, bottom: v }))
    const lScrub = useScrub(padding.left, (v) => onChange({ left: v }))
    const rScrub = useScrub(padding.right, (v) => onChange({ right: v }))
    const tScrub = useScrub(padding.top, (v) => onChange({ top: v }))
    const bScrub = useScrub(padding.bottom, (v) => onChange({ bottom: v }))

    // Show expanded mode when explicitly toggled OR when values are mixed
    const showExpanded = individualMode || hMixed || vMixed

    return (
        <div
            className="pt-0.5"
            onMouseLeave={() => setPaddingOverlay(null)}
        >
            <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground flex-1">Padding</span>
            </div>
            <div className="flex items-start gap-1 mt-1">
                <div className="flex-1 space-y-1">
                    {showExpanded ? (
                        /* Individual mode: 2x2 grid — Left, Top / Right, Bottom */
                        <>
                            <div className="flex gap-1">
                                <div
                                    className="flex items-center gap-0.5 flex-1"
                                    onMouseEnter={() => setPaddingOverlay(nodeId, 'left')}
                                >
                                    <span className="cursor-ew-resize select-none flex items-center" title="Left padding" {...lScrub}>
                                        <LeftPaddingIcon />
                                    </span>
                                    <NumberInput
                                        value={padding.left}
                                        onChange={(v) => onChange({ left: v })}
                                        onShorthand={handleShorthand}
                                        min={0} step={1} className="flex-1"
                                    />
                                </div>
                                <div
                                    className="flex items-center gap-0.5 flex-1"
                                    onMouseEnter={() => setPaddingOverlay(nodeId, 'top')}
                                >
                                    <span className="cursor-ew-resize select-none flex items-center" title="Top padding" {...tScrub}>
                                        <TopPaddingIcon />
                                    </span>
                                    <NumberInput
                                        value={padding.top}
                                        onChange={(v) => onChange({ top: v })}
                                        onShorthand={handleShorthand}
                                        min={0} step={1} className="flex-1"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <div
                                    className="flex items-center gap-0.5 flex-1"
                                    onMouseEnter={() => setPaddingOverlay(nodeId, 'right')}
                                >
                                    <span className="cursor-ew-resize select-none flex items-center" title="Right padding" {...rScrub}>
                                        <RightPaddingIcon />
                                    </span>
                                    <NumberInput
                                        value={padding.right}
                                        onChange={(v) => onChange({ right: v })}
                                        onShorthand={handleShorthand}
                                        min={0} step={1} className="flex-1"
                                    />
                                </div>
                                <div
                                    className="flex items-center gap-0.5 flex-1"
                                    onMouseEnter={() => setPaddingOverlay(nodeId, 'bottom')}
                                >
                                    <span className="cursor-ew-resize select-none flex items-center" title="Bottom padding" {...bScrub}>
                                        <BottomPaddingIcon />
                                    </span>
                                    <NumberInput
                                        value={padding.bottom}
                                        onChange={(v) => onChange({ bottom: v })}
                                        onShorthand={handleShorthand}
                                        min={0} step={1} className="flex-1"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Compact mode: H + V (only when both pairs are equal) */
                        <div className="flex gap-1">
                            <div
                                className="flex items-center gap-0.5 flex-1"
                                onMouseEnter={() => setPaddingOverlay(nodeId, 'horizontal')}
                            >
                                <span className="cursor-ew-resize select-none flex items-center" title="Horizontal padding" {...hScrub}>
                                    <HorizontalPaddingIcon />
                                </span>
                                <NumberInput
                                    value={padding.left}
                                    onChange={(v) => onChange({ left: v, right: v })}
                                    onShorthand={handleShorthand}
                                    min={0} step={1} className="flex-1"
                                />
                            </div>
                            <div
                                className="flex items-center gap-0.5 flex-1"
                                onMouseEnter={() => setPaddingOverlay(nodeId, 'vertical')}
                            >
                                <span className="cursor-ew-resize select-none flex items-center" title="Vertical padding" {...vScrub}>
                                    <VerticalPaddingIcon />
                                </span>
                                <NumberInput
                                    value={padding.top}
                                    onChange={(v) => onChange({ top: v, bottom: v })}
                                    onShorthand={handleShorthand}
                                    min={0} step={1} className="flex-1"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Individual toggle button — highlighted when values differ */}
                <button
                    className={cn(
                        'w-7 h-7 flex items-center justify-center rounded-sm transition-colors shrink-0',
                        showExpanded
                            ? 'bg-muted text-foreground'
                            : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/40'
                    )}
                    onClick={() => {
                        if (showExpanded) {
                            // Switching to uniform: equalize padding (left→right, top→bottom)
                            if (hMixed || vMixed) {
                                onChange({
                                    left: padding.left,
                                    right: padding.left,
                                    top: padding.top,
                                    bottom: padding.top,
                                })
                            }
                            setIndividualMode(false)
                        } else {
                            setIndividualMode(true)
                        }
                    }}
                    title={showExpanded ? 'Uniform padding' : 'Individual padding'}
                >
                    <IndividualPaddingIcon expanded={showExpanded} />
                </button>
            </div>
        </div>
    )
}

// ── Button dropdown for Packed/Space between ─────────────────

function DistributionDropdown({
    isSpaceBetween,
    onChange,
}: {
    isSpaceBetween: boolean
    onChange: (spaceBetween: boolean) => void
}) {
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close on outside click
    useEffect(() => {
        if (!open) return
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [open])

    return (
        <div className="relative shrink-0" ref={dropdownRef}>
            <button
                className={cn(
                    'h-7 px-1.5 rounded-sm flex items-center gap-1 transition-colors',
                    'text-muted-foreground hover:bg-muted/50',
                    open && 'bg-muted/60'
                )}
                onClick={() => setOpen(!open)}
                title={isSpaceBetween ? 'Space between' : 'Packed'}
            >
                {isSpaceBetween ? <SpaceBetweenIcon size={12} /> : <PackedIcon size={12} />}
                <svg width={6} height={6} viewBox="0 0 6 6" fill="none" className="text-muted-foreground/50">
                    <path d="M1 2L3 4L5 2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg z-50 py-1 min-w-[140px]">
                    <button
                        className={cn(
                            'w-full px-3 py-1.5 text-[11px] text-left flex items-center gap-2 transition-colors',
                            !isSpaceBetween ? 'bg-muted/50 text-foreground' : 'text-muted-foreground hover:bg-muted/30'
                        )}
                        onClick={() => { onChange(false); setOpen(false) }}
                    >
                        <PackedIcon size={12} />
                        Packed
                    </button>
                    <button
                        className={cn(
                            'w-full px-3 py-1.5 text-[11px] text-left flex items-center gap-2 transition-colors',
                            isSpaceBetween ? 'bg-muted/50 text-foreground' : 'text-muted-foreground hover:bg-muted/30'
                        )}
                        onClick={() => { onChange(true); setOpen(false) }}
                    >
                        <SpaceBetweenIcon size={12} />
                        Space between
                    </button>
                </div>
            )}
        </div>
    )
}

// ── Gap input (Figma-style with direction icon + button dropdown) ───

function GapInput({
    layout,
    onChange,
}: {
    layout: Layout
    onChange: (partial: Partial<Layout>) => void
}) {
    const isColumn = layout.direction === 'column' || layout.direction === undefined
    const isSpaceBetween = layout.justify === 'between'
    const isGrid = layout.mode === 'grid'

    // All hooks called unconditionally (React rules of hooks)
    const gapScrub = useScrub(layout.gap ?? 0, (v) => onChange({ gap: v }))
    const colGapScrub = useScrub(layout.columnGap ?? layout.gap ?? 0, (v) => onChange({ columnGap: v }))
    const rowGapScrub = useScrub(layout.rowGap ?? layout.gap ?? 0, (v) => onChange({ rowGap: v }))

    if (isGrid) {
        return (
            <div className="flex gap-1">
                <div className="flex items-center gap-0.5 flex-1">
                    <span className="cursor-ew-resize select-none flex items-center" title="Column gap" {...colGapScrub}>
                        <HorizontalGapIcon />
                    </span>
                    <NumberInput
                        value={layout.columnGap ?? layout.gap ?? 0}
                        onChange={(v) => onChange({ columnGap: v })}
                        min={0}
                        step={1}
                        className="flex-1"
                    />
                </div>
                <div className="flex items-center gap-0.5 flex-1">
                    <span className="cursor-ew-resize select-none flex items-center" title="Row gap" {...rowGapScrub}>
                        <VerticalGapIcon />
                    </span>
                    <NumberInput
                        value={layout.rowGap ?? layout.gap ?? 0}
                        onChange={(v) => onChange({ rowGap: v })}
                        min={0}
                        step={1}
                        className="flex-1"
                    />
                </div>
            </div>
        )
    }

    // Flex mode: direction icon + gap value/auto + distribution button dropdown
    return (
        <div className="flex items-center gap-0.5">
            <span className="cursor-ew-resize select-none flex items-center" title="Gap between items" {...gapScrub}>
                {isColumn ? <VerticalGapIcon /> : <HorizontalGapIcon />}
            </span>
            {isSpaceBetween ? (
                <span className="flex-1 h-7 px-2 text-[11px] flex items-center text-muted-foreground">
                    Auto
                </span>
            ) : (
                <NumberInput
                    value={layout.gap ?? 0}
                    onChange={(v) => onChange({ gap: v })}
                    min={0}
                    step={1}
                    className="flex-1"
                />
            )}
            <DistributionDropdown
                isSpaceBetween={isSpaceBetween}
                onChange={(spaceBetween) => {
                    if (spaceBetween) {
                        onChange({ justify: 'between' })
                    } else {
                        onChange({ justify: 'start' })
                    }
                }}
            />
        </div>
    )
}

// ── Main component ───────────────────────────────────────────

interface LayoutSectionProps {
    node: FrameNode
    onUpdate: (updates: Record<string, unknown>) => void
}

export function LayoutSection({ node, onUpdate }: LayoutSectionProps) {
    const { layout, padding } = node
    const mode = layoutToMode(layout)
    const isFlex = layout.mode === 'flex'
    const isGrid = layout.mode === 'grid'
    const hasLayout = isFlex || isGrid
    const isSpaceBetween = layout.justify === 'between'

    const updateLayout = (partialLayout: Partial<Layout>) => {
        onUpdate({ layout: { ...layout, ...partialLayout } })
    }

    const updatePadding = (partialPad: Partial<Padding>) => {
        onUpdate({ padding: { ...padding, ...partialPad } })
    }

    return (
        <Section title={hasLayout ? 'Auto layout' : 'Layout'}>
            {/* Flow radio group — Figma: Freeform / Vertical / Horizontal / Grid */}
            <div className="flex items-center gap-1">
                <div className="flex items-center gap-px bg-muted/50 rounded-sm p-0.5 flex-1">
                    {FLOW_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            className={cn(
                                'flex items-center gap-1 px-2 h-7 rounded-sm text-[11px] transition-all flex-1 justify-center',
                                mode === opt.value
                                    ? 'bg-background text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                            )}
                            onClick={() => {
                                const partial = modeToLayout(opt.value, layout)
                                updateLayout(partial)
                            }}
                            title={opt.label}
                        >
                            {opt.icon}
                            <span className="text-[10px]">{opt.label}</span>
                        </button>
                    ))}
                </div>

                {/* Wrap toggle — only for horizontal flex */}
                {mode === 'flex-row' && (
                    <button
                        className={cn(
                            'w-7 h-7 flex items-center justify-center rounded-sm transition-colors shrink-0',
                            layout.wrap
                                ? 'bg-muted text-foreground'
                                : 'text-muted-foreground/40 hover:text-foreground hover:bg-muted/40'
                        )}
                        onClick={() => updateLayout({ wrap: !layout.wrap })}
                        title={layout.wrap ? 'Disable wrap' : 'Enable wrap'}
                    >
                        <WrapText size={14} />
                    </button>
                )}
            </div>

            {/* Alignment + Gap row (flex & grid) */}
            {hasLayout && (
                <>
                    <div className="flex items-start gap-3 pt-1">
                        {/* Alignment grid */}
                        <div>
                            <span className="text-[10px] text-muted-foreground mb-1 block">Alignment</span>
                            <AlignmentGrid
                                value={getAlign3x3(layout.justify, layout.align)}
                                onChange={(j, a) => updateLayout({ justify: j, align: a })}
                                direction={layout.direction || 'column'}
                                isSpaceBetween={isFlex && isSpaceBetween}
                            />
                        </div>

                        {/* Gap controls */}
                        <div className="flex-1">
                            <span className="text-[10px] text-muted-foreground mb-1 block">Gap</span>
                            <GapInput layout={layout} onChange={updateLayout} />
                        </div>
                    </div>

                    {/* Grid-specific: Cols + Rows */}
                    {isGrid && (
                        <div className="flex gap-2 pt-0.5">
                            <NumberInput
                                label="Cols"
                                value={typeof layout.columns === 'number' ? layout.columns : 2}
                                onChange={(v) => updateLayout({ columns: v })}
                                min={1}
                                step={1}
                                labelWidth="w-7"
                                className="flex-1"
                            />
                            <NumberInput
                                label="Rows"
                                value={typeof layout.rows === 'number' ? layout.rows : 0}
                                onChange={(v) => updateLayout({ rows: v > 0 ? v : undefined })}
                                min={0}
                                step={1}
                                labelWidth="w-8"
                                className="flex-1"
                            />
                        </div>
                    )}

                    {/* Padding controls (Figma-style compact H/V with individual toggle) */}
                    <PaddingControls padding={padding} onChange={updatePadding} nodeId={node.id} />
                </>
            )}

            {/* Clip content — Figma-style checkbox */}
            <Checkbox
                checked={node.overflow === 'hidden'}
                onChange={(checked) => onUpdate({ overflow: checked ? 'hidden' : 'visible' })}
                label="Clip content"
            />
        </Section>
    )
}
