'use client'

import type { ScytleNode, Border, BorderRadius } from '@/types/canvas'
import { Section, NumberInput, ColorInput, SelectInput, IconButton } from './inputs'
import { useState } from 'react'
import { Plus, Trash2, Minus, CornerUpRight, Eye, EyeOff, Settings2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SectionProps {
    node: ScytleNode
    onUpdate: (updates: Record<string, unknown>) => void
}

/* ── Appearance Section — opacity + corner radius ─────────── */

export function AppearanceSection({ node, onUpdate }: SectionProps) {
    const radius = node.borderRadius

    const isUniformRadius = typeof radius === 'number'
    const [perCorner, setPerCorner] = useState(!isUniformRadius)
    const uniformRadius = typeof radius === 'number' ? radius : radius.topLeft

    const updateRadius = (value: number | Partial<Record<'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft', number>>) => {
        if (typeof value === 'number') {
            onUpdate({ borderRadius: value })
        } else {
            const current = typeof radius === 'number'
                ? { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius }
                : radius
            onUpdate({ borderRadius: { ...current, ...value } })
        }
    }

    return (
        <Section title="Appearance">
            <div className="grid grid-cols-2 gap-x-2">
                <NumberInput
                    label="◻"
                    value={Math.round(node.opacity * 100)}
                    onChange={(v) => onUpdate({ opacity: v / 100 })}
                    min={0}
                    max={100}
                    step={1}
                    suffix="%"
                    labelWidth="w-5"
                />
                <div className="flex items-center gap-1">
                    <NumberInput
                        label="↗"
                        value={uniformRadius}
                        onChange={(v) => {
                            if (perCorner) {
                                updateRadius({ topLeft: v, topRight: v, bottomLeft: v, bottomRight: v })
                            } else {
                                updateRadius(v)
                            }
                        }}
                        min={0}
                        step={1}
                        className="flex-1"
                        labelWidth="w-5"
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

            {perCorner && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
                    <NumberInput
                        label="TL"
                        value={typeof radius === 'number' ? radius : radius.topLeft}
                        onChange={(v) => updateRadius({ topLeft: v })}
                        min={0} step={1} labelWidth="w-5"
                    />
                    <NumberInput
                        label="TR"
                        value={typeof radius === 'number' ? radius : radius.topRight}
                        onChange={(v) => updateRadius({ topRight: v })}
                        min={0} step={1} labelWidth="w-5"
                    />
                    <NumberInput
                        label="BL"
                        value={typeof radius === 'number' ? radius : radius.bottomLeft}
                        onChange={(v) => updateRadius({ bottomLeft: v })}
                        min={0} step={1} labelWidth="w-5"
                    />
                    <NumberInput
                        label="BR"
                        value={typeof radius === 'number' ? radius : radius.bottomRight}
                        onChange={(v) => updateRadius({ bottomRight: v })}
                        min={0} step={1} labelWidth="w-5"
                    />
                </div>
            )}
        </Section>
    )
}

/* ── Stroke Section — color + advanced settings ───────────── */

export function StrokeSection({ node, onUpdate }: SectionProps) {
    const border = node.border

    const [strokePosition, setStrokePosition] = useState<'inside' | 'center' | 'outside'>('inside')
    const [strokeEndpoints, setStrokeEndpoints] = useState<'all' | 'top' | 'bottom' | 'left' | 'right'>('all')
    const [strokeSettingsOpen, setStrokeSettingsOpen] = useState(false)

    const toggleBorder = () => {
        if (border) {
            onUpdate({ border: undefined })
        } else {
            onUpdate({ border: { color: '#000000', width: 1, style: 'solid' } })
        }
    }

    const updateBorder = (partial: Partial<Border>) => {
        if (!border) return
        onUpdate({ border: { ...border, ...partial } })
    }

    return (
        <Section
            title="Stroke"
            defaultOpen={!!border}
            action={
                <div className="flex items-center gap-0.5">
                    {border && (
                        <button
                            className="p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                            onClick={() => setStrokeSettingsOpen(!strokeSettingsOpen)}
                            title="Stroke settings"
                        >
                            <Settings2 size={12} />
                        </button>
                    )}
                    <button
                        className="p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                        onClick={() => toggleBorder()}
                        title={border ? 'Remove stroke' : 'Add stroke'}
                    >
                        {border ? <Minus size={12} /> : <Plus size={12} />}
                    </button>
                </div>
            }
        >
            {border && (
                <div className="space-y-2">
                    <ColorInput
                        value={border.color}
                        onChange={(c) => updateBorder({ color: c })}
                    />

                    {strokeSettingsOpen && (
                        <div className="space-y-2 pt-1">
                            <div className="grid grid-cols-2 gap-x-2">
                                <div>
                                    <span className="text-[10px] text-muted-foreground/60 block mb-0.5">Position</span>
                                    <SelectInput
                                        value={strokePosition}
                                        options={[
                                            { value: 'inside', label: 'Inside' },
                                            { value: 'center', label: 'Center' },
                                            { value: 'outside', label: 'Outside' },
                                        ]}
                                        onChange={(v) => setStrokePosition(v as typeof strokePosition)}
                                    />
                                </div>
                                <div>
                                    <span className="text-[10px] text-muted-foreground/60 block mb-0.5">Weight</span>
                                    <NumberInput
                                        value={border.width}
                                        onChange={(v) => updateBorder({ width: v })}
                                        min={0}
                                        step={1}
                                    />
                                </div>
                            </div>

                            <SelectInput
                                value={border.style}
                                options={[
                                    { value: 'solid', label: 'Solid' },
                                    { value: 'dashed', label: 'Dashed' },
                                    { value: 'dotted', label: 'Dotted' },
                                ]}
                                onChange={(v) => updateBorder({ style: v as Border['style'] })}
                            />

                            <div>
                                <span className="text-[10px] text-muted-foreground/60 block mb-0.5">End points</span>
                                <SelectInput
                                    value={strokeEndpoints}
                                    options={[
                                        { value: 'all', label: 'All' },
                                        { value: 'top', label: 'Top' },
                                        { value: 'bottom', label: 'Bottom' },
                                        { value: 'left', label: 'Left' },
                                        { value: 'right', label: 'Right' },
                                    ]}
                                    onChange={(v) => setStrokeEndpoints(v as typeof strokeEndpoints)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Section>
    )
}
