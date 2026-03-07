'use client'

import { useState } from 'react'
import type { ScytleNode, Shadow } from '@/types/canvas'
import { Section, NumberInput, ColorInput, SelectInput, IconButton } from './inputs'
import { Plus, Minus, Eye, EyeOff, Settings2, Square, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EffectsSectionProps {
    node: ScytleNode
    onUpdate: (updates: Record<string, unknown>) => void
}

export function EffectsSection({ node, onUpdate }: EffectsSectionProps) {
    const shadows = node.shadows
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null)

    const updateShadow = (index: number, partial: Partial<Shadow>) => {
        const newShadows = shadows.map((s, i) =>
            i === index ? { ...s, ...partial } : s
        )
        onUpdate({ shadows: newShadows })
    }

    const addShadow = () => {
        const newShadows = [
            ...shadows,
            { type: 'drop' as const, color: 'rgba(0,0,0,0.15)', x: 0, y: 4, blur: 12, spread: 0 },
        ]
        onUpdate({ shadows: newShadows })
        // Auto-expand the new shadow's settings
        setExpandedIndex(newShadows.length - 1)
    }

    const removeShadow = (index: number) => {
        onUpdate({ shadows: shadows.filter((_, i) => i !== index) })
        if (expandedIndex === index) setExpandedIndex(null)
        else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1)
    }

    return (
        <Section
            title="Effects"
            defaultOpen={shadows.length > 0}
            action={
                <button
                    className="p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                    onClick={() => addShadow()}
                    title="Add effect"
                >
                    <Plus size={12} />
                </button>
            }
        >
            {shadows.map((shadow, i) => (
                <div key={i} className="space-y-0">
                    {/* Collapsed row: type dropdown + settings + eye + remove */}
                    <div className="flex items-center gap-1">
                        {/* Expand/settings toggle — Figma-style colored square */}
                        <button
                            className={cn(
                                'p-0.5 rounded-sm transition-colors',
                                expandedIndex === i
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/50 hover:text-muted-foreground'
                            )}
                            onClick={() => setExpandedIndex(expandedIndex === i ? null : i)}
                            title="Effect settings"
                        >
                            {expandedIndex === i
                                ? <CheckSquare size={12} />
                                : <Square size={12} />
                            }
                        </button>
                        <SelectInput
                            value={shadow.type}
                            options={[
                                { value: 'drop', label: 'Drop shadow' },
                                { value: 'inner', label: 'Inner shadow' },
                            ]}
                            onChange={(v) => updateShadow(i, { type: v as Shadow['type'] })}
                            className="flex-1"
                        />
                        <button
                            className={cn(
                                'p-0.5 rounded-sm transition-colors',
                                shadow.visible !== false
                                    ? 'text-muted-foreground/60 hover:text-foreground'
                                    : 'text-muted-foreground/30 hover:text-muted-foreground'
                            )}
                            onClick={() => updateShadow(i, { visible: shadow.visible === false })}
                            title="Toggle visibility"
                        >
                            {shadow.visible !== false ? <Eye size={12} /> : <EyeOff size={12} />}
                        </button>
                        <button
                            className="p-0.5 text-muted-foreground/40 hover:text-destructive transition-colors"
                            onClick={() => removeShadow(i)}
                            title="Remove"
                        >
                            <Minus size={12} />
                        </button>
                    </div>

                    {/* Expanded settings (revealed on click) */}
                    {expandedIndex === i && (
                        <div className="pl-5 pt-1.5 pb-1 space-y-1.5">
                            {/* Color */}
                            <ColorInput
                                value={shadow.color}
                                onChange={(c) => updateShadow(i, { color: c })}
                            />
                            {/* X / Y */}
                            <div className="grid grid-cols-2 gap-x-2">
                                <NumberInput label="X" value={shadow.x} onChange={(v) => updateShadow(i, { x: v })} step={1} labelWidth="w-4" />
                                <NumberInput label="Y" value={shadow.y} onChange={(v) => updateShadow(i, { y: v })} step={1} labelWidth="w-4" />
                            </div>
                            {/* Blur / Spread */}
                            <div className="grid grid-cols-2 gap-x-2">
                                <NumberInput label="Bl" value={shadow.blur} onChange={(v) => updateShadow(i, { blur: v })} min={0} step={1} labelWidth="w-4" />
                                <NumberInput label="Sp" value={shadow.spread} onChange={(v) => updateShadow(i, { spread: v })} step={1} labelWidth="w-4" />
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </Section>
    )
}
