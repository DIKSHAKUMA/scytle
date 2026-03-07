'use client'

import type { FrameNode, Layout, Padding } from '@/types/canvas'
import { Section, NumberInput, Checkbox, IconButton } from './inputs'
import {
    ArrowDown,
    ArrowRight,
    LayoutGrid,
    Move,
    Lock,
    Unlock,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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

// ── 3×3 Alignment grid (Figma-style) ────────────────────────

type Align3x3 = `${'start' | 'center' | 'end'}-${'start' | 'center' | 'end'}`

function getAlign3x3(j: Layout['justify'], a: Layout['align']): Align3x3 {
    const jj = j === 'between' ? 'start' : (j || 'start')
    const aa = a === 'stretch' ? 'start' : (a || 'start')
    return `${jj}-${aa}` as Align3x3
}

function AlignmentGrid({
    value,
    onChange,
    direction,
}: {
    value: Align3x3
    onChange: (justify: 'start' | 'center' | 'end', align: 'start' | 'center' | 'end') => void
    direction: 'column' | 'row'
}) {
    const rows: ('start' | 'center' | 'end')[] = ['start', 'center', 'end']
    const cols: ('start' | 'center' | 'end')[] = ['start', 'center', 'end']

    return (
        <div className="grid grid-cols-3 gap-0.5 w-fit">
            {rows.map((r) =>
                cols.map((c) => {
                    // In column direction: row = justify (main axis), col = align (cross axis)
                    // In row direction: col = justify (main axis), row = align (cross axis)
                    const justify = direction === 'column' ? r : c
                    const align = direction === 'column' ? c : r
                    const key = `${justify}-${align}` as Align3x3
                    const active = value === key

                    return (
                        <button
                            key={key}
                            className={cn(
                                'w-4 h-4 rounded-[2px] transition-colors',
                                active
                                    ? 'bg-foreground'
                                    : 'bg-muted/60 hover:bg-muted'
                            )}
                            onClick={() => onChange(justify, align)}
                            title={`${justify} / ${align}`}
                        />
                    )
                })
            )}
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

    // Padding mode
    const [uniformPad, setUniformPad] = useState(
        padding.top === padding.right &&
        padding.right === padding.bottom &&
        padding.bottom === padding.left
    )

    const updateLayout = (partialLayout: Partial<Layout>) => {
        onUpdate({ layout: { ...layout, ...partialLayout } })
    }

    const updatePadding = (partialPad: Partial<Padding>) => {
        const newPad = { ...padding, ...partialPad }
        if (uniformPad) {
            const val = Object.values(partialPad)[0] as number
            onUpdate({ padding: { top: val, right: val, bottom: val, left: val } })
        } else {
            onUpdate({ padding: newPad })
        }
    }

    return (
        <Section title={hasLayout ? 'Auto layout' : 'Layout'}>
            {/* Flow radio group — Figma: Freeform / Vertical / Horizontal / Grid */}
            <div className="flex items-center gap-px bg-muted/50 rounded-sm p-0.5">
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

            {/* Flex controls */}
            {isFlex && (
                <>
                    {/* Alignment + Gap row */}
                    <div className="flex items-start gap-3 pt-1">
                        <div>
                            <span className="text-[10px] text-muted-foreground mb-1 block">Align</span>
                            <AlignmentGrid
                                value={getAlign3x3(layout.justify, layout.align)}
                                onChange={(j, a) => updateLayout({ justify: j, align: a })}
                                direction={layout.direction || 'column'}
                            />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <NumberInput
                                label="Gap"
                                value={layout.gap ?? 0}
                                onChange={(v) => updateLayout({ gap: v })}
                                min={0}
                                step={1}
                                labelWidth="w-7"
                            />
                        </div>
                    </div>

                    {/* Padding */}
                    <div className="pt-1">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-muted-foreground">Padding</span>
                            <button
                                className="text-[10px] text-muted-foreground/60 hover:text-foreground transition-colors"
                                onClick={() => setUniformPad(!uniformPad)}
                                title={uniformPad ? 'Individual padding' : 'Uniform padding'}
                            >
                                {uniformPad ? (
                                    <Lock size={11} />
                                ) : (
                                    <Unlock size={11} />
                                )}
                            </button>
                        </div>
                        {uniformPad ? (
                            <NumberInput
                                label="All"
                                value={padding.top}
                                onChange={(v) => updatePadding({ top: v })}
                                min={0}
                                step={1}
                                labelWidth="w-6"
                            />
                        ) : (
                            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                                <NumberInput label="T" value={padding.top} onChange={(v) => updatePadding({ top: v })} min={0} step={1} />
                                <NumberInput label="R" value={padding.right} onChange={(v) => updatePadding({ right: v })} min={0} step={1} />
                                <NumberInput label="B" value={padding.bottom} onChange={(v) => updatePadding({ bottom: v })} min={0} step={1} />
                                <NumberInput label="L" value={padding.left} onChange={(v) => updatePadding({ left: v })} min={0} step={1} />
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Grid controls */}
            {isGrid && (
                <div className="space-y-1.5 pt-1">
                    <NumberInput
                        label="Cols"
                        value={typeof layout.columns === 'number' ? layout.columns : 2}
                        onChange={(v) => updateLayout({ columns: v })}
                        min={1}
                        step={1}
                        labelWidth="w-8"
                    />
                    <div className="grid grid-cols-2 gap-x-2">
                        <NumberInput
                            label="Col gap"
                            value={layout.columnGap ?? layout.gap ?? 0}
                            onChange={(v) => updateLayout({ columnGap: v })}
                            min={0}
                            step={1}
                            labelWidth="w-12"
                        />
                        <NumberInput
                            label="Row gap"
                            value={layout.rowGap ?? layout.gap ?? 0}
                            onChange={(v) => updateLayout({ rowGap: v })}
                            min={0}
                            step={1}
                            labelWidth="w-14"
                        />
                    </div>
                </div>
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
