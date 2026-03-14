'use client'

import type { ScytleNode, Border, BorderRadius } from '@/types/canvas'
import { Section, NumberInput, ColorInput, SelectInput } from './inputs'
import { useState } from 'react'
import { Plus, Minus, CornerUpRight, Blend } from 'lucide-react'
import { cn } from '@/lib/utils'

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

    const isUniformRadius = typeof radius === 'number'
    const [perCorner, setPerCorner] = useState(!isUniformRadius)
    const uniformRadius = typeof radius === 'number' ? radius : radius.topLeft

    const updateRadius = (
        value: number | Partial<Record<'topLeft' | 'topRight' | 'bottomRight' | 'bottomLeft', number>>
    ) => {
        if (typeof value === 'number') {
            onUpdate({ borderRadius: value })
        } else {
            const current =
                typeof radius === 'number'
                    ? { topLeft: radius, topRight: radius, bottomRight: radius, bottomLeft: radius }
                    : radius
            onUpdate({ borderRadius: { ...current, ...value } })
        }
    }

    return (
        <Section title="Appearance">
            <div className="grid grid-cols-2 gap-x-2">
                {/* Opacity — Blend icon instead of unicode "◻" */}
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

                {/* Border radius — proper rounded-corner icon instead of unicode "↗" */}
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

            {perCorner && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1.5">
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
        </Section>
    )
}

/* ── Stroke position / style options ──────────────────────── */

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

/* ── Stroke Section ───────────────────────────────────────── */

export function StrokeSection({ node, onUpdate }: SectionProps) {
    const border = node.border

    const toggleBorder = () => {
        if (border) {
            onUpdate({ border: undefined })
        } else {
            onUpdate({ border: { color: '#000000', width: 1, style: 'solid', position: 'inside' } })
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
                <button
                    className="p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                    onClick={() => toggleBorder()}
                    title={border ? 'Remove stroke' : 'Add stroke'}
                >
                    {border ? <Minus size={12} /> : <Plus size={12} />}
                </button>
            }
        >
            {border && (
                <div className="space-y-2">
                    {/* Row 1: Color + Weight — both always visible (Figma-style) */}
                    <div className="flex items-center gap-2">
                        <ColorInput
                            value={border.color}
                            onChange={(c) => updateBorder({ color: c })}
                            className="flex-1"
                        />
                        <NumberInput
                            value={border.width}
                            onChange={(v) => updateBorder({ width: v })}
                            min={0}
                            step={1}
                            className="w-14"
                            label="W"
                            labelWidth="w-4"
                        />
                    </div>

                    {/* Row 2: Position + Style — always visible */}
                    <div className="grid grid-cols-2 gap-x-2">
                        <SelectInput
                            value={border.position ?? 'inside'}
                            options={STROKE_POSITION_OPTIONS}
                            onChange={(v) =>
                                updateBorder({ position: v as Border['position'] })
                            }
                        />
                        <SelectInput
                            value={border.style}
                            options={STROKE_STYLE_OPTIONS}
                            onChange={(v) => updateBorder({ style: v as Border['style'] })}
                        />
                    </div>
                </div>
            )}
        </Section>
    )
}
