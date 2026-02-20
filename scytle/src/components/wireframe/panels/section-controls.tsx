'use client'

import { useMemo, useCallback } from 'react'
import { AlignLeft, AlignCenter, AlignRight, Image, Video, ArrowLeft, ArrowRight, Minus, Plus, Columns2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { getControlDefForLayout } from '@/lib/designs/v2/layouts'
import type { LayoutControlDef } from '@/lib/designs/v2/layouts'
import type { WireframeSectionControls } from '@/types'

interface SectionControlsProps {
    /** The section's componentId — used to look up design controls */
    componentId?: string
    /** Fallback: section type for legacy hardcoded controls */
    sectionType: string
    controls: WireframeSectionControls
    onControlChangeAction: (key: string, value: string | number | boolean) => void
    /** V2: Called when axis controls resolve a new layout (changes componentId) */
    onComponentChangeAction?: (newComponentId: string) => void
    className?: string
}

/**
 * Icon name → Lucide component mapping
 */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
    AlignLeft,
    AlignCenter,
    AlignRight,
    Image,
    Video,
    ArrowLeft,
    ArrowRight,
    Columns2,
}

/**
 * SectionControls Component
 * 
 * Schema-driven controls renderer.
 * Resolves controls from the design registry (componentId → family/preset controlsDef).
 * All 15 categories (45 families) are registered — no legacy fallback needed.
 */
export function SectionControls({
    componentId,
    sectionType,
    controls,
    onControlChangeAction,
    onComponentChangeAction,
    className,
}: SectionControlsProps) {
    // ── V2 Detection ──────────────────────────────────────
    // If componentId matches a V2 layout with axis controls, render those instead
    const v2ControlDef = useMemo(() => {
        if (!componentId) return undefined
        return getControlDefForLayout(componentId)
    }, [componentId])

    const v2AxisValues = useMemo(() => {
        if (!v2ControlDef || !componentId) return {}
        return v2ControlDef.extract(componentId)
    }, [v2ControlDef, componentId])

    const handleV2AxisChange = useCallback((axisKey: string, newValue: string) => {
        if (!v2ControlDef || !onComponentChangeAction) return
        const currentValues = { ...v2AxisValues, [axisKey]: newValue }
        const newLayoutId = v2ControlDef.resolve(currentValues)
        if (newLayoutId && newLayoutId !== componentId) {
            onComponentChangeAction(newLayoutId)
        }
    }, [v2ControlDef, v2AxisValues, componentId, onComponentChangeAction])

    // ── V2 Render: Axis Controls ──────────────────────────
    if (v2ControlDef) {
        return (
            <div className={cn('space-y-4', className)}>
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Controls
                </Label>
                {v2ControlDef.axes.map((axis) => {
                    const currentValue = v2AxisValues[axis.key] ?? axis.options[0]?.value
                    return (
                        <div key={axis.key} className="space-y-1.5">
                            <Label className="text-xs font-medium">{axis.label}</Label>
                            <ToggleGroup
                                type="single"
                                value={currentValue}
                                onValueChange={(v) => v && handleV2AxisChange(axis.key, v)}
                                className="justify-start flex-wrap w-auto gap-1.5"
                                spacing={1}
                            >
                                {axis.options.map((opt) => {
                                    const IconComp = opt.icon ? ICON_MAP[opt.icon] : undefined
                                    return (
                                        <ToggleGroupItem
                                            key={opt.value}
                                            value={opt.value}
                                            aria-label={opt.label}
                                            className="h-7 px-2.5 text-xs rounded-md border-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                                        >
                                            {IconComp ? (
                                                <>
                                                    <IconComp className="h-3.5 w-3.5 mr-1" />
                                                    {opt.label}
                                                </>
                                            ) : (
                                                opt.label
                                            )}
                                        </ToggleGroupItem>
                                    )
                                })}
                            </ToggleGroup>
                        </div>
                    )
                })}
            </div>
        )
    }

    // No V2 axis controls for this section — show "no controls" message
    return (
        <div className={cn('space-y-3', className)}>
            <p className="text-xs text-muted-foreground">
                No controls available for this section type.
            </p>
        </div>
    )
}

// ===== WIDGET COMPONENTS =====
// Kept for future use when V2 categories add custom control widgets

/** Generic control definition shape for widget components */
interface ControlDefinition {
    key: string
    label: string
    type: 'toggle-group' | 'switch' | 'slider' | 'select' | 'number' | 'color'
    defaultValue?: string | number | boolean
    options?: { value: string; label: string; icon?: string }[]
    min?: number
    max?: number
    step?: number
    showWhen?: { key: string; value: string | number | boolean }
}

/**
 * SliderWidget — Range input with value label
 */
interface SliderWidgetProps {
    def: ControlDefinition
    value: number
    onChange: (value: number) => void
}

function SliderWidget({ def, value, onChange }: SliderWidgetProps) {
    const min = def.min ?? 0
    const max = def.max ?? 100
    const step = def.step ?? 1

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">{def.label}</Label>
                <span className="text-xs text-muted-foreground tabular-nums">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
            />
        </div>
    )
}

/**
 * SelectWidget — Dropdown select
 */
interface SelectWidgetProps {
    def: ControlDefinition
    value: string
    onChange: (value: string) => void
}

function SelectWidget({ def, value, onChange }: SelectWidgetProps) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium">{def.label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {def.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}

/**
 * NumberWidget — Numeric stepper with +/- buttons
 */
interface NumberWidgetProps {
    def: ControlDefinition
    value: number
    onChange: (value: number) => void
}

function NumberWidget({ def, value, onChange }: NumberWidgetProps) {
    const min = def.min ?? 0
    const max = def.max ?? 99
    const step = def.step ?? 1

    const handleDecrement = () => {
        const newVal = Math.max(min, value - step)
        onChange(newVal)
    }

    const handleIncrement = () => {
        const newVal = Math.min(max, value + step)
        onChange(newVal)
    }

    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium">{def.label}</Label>
            <div className="flex items-center gap-2">
                <button
                    onClick={handleDecrement}
                    disabled={value <= min}
                    className="h-8 w-8 flex items-center justify-center border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Minus className="h-3 w-3" />
                </button>
                <Input
                    type="number"
                    value={value}
                    min={min}
                    max={max}
                    step={step}
                    onChange={(e) => {
                        const v = Number(e.target.value)
                        if (!isNaN(v) && v >= min && v <= max) onChange(v)
                    }}
                    className="h-8 w-16 text-center text-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button
                    onClick={handleIncrement}
                    disabled={value >= max}
                    className="h-8 w-8 flex items-center justify-center border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="h-3 w-3" />
                </button>
            </div>
        </div>
    )
}

/**
 * ColorWidget — Color swatch picker
 */
interface ColorWidgetProps {
    def: ControlDefinition
    value: string
    onChange: (value: string) => void
}

function ColorWidget({ def, value, onChange }: ColorWidgetProps) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium">{def.label}</Label>
            <div className="flex flex-wrap gap-1.5">
                {def.options?.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            'w-7 h-7 rounded-full border-2 transition-all',
                            value === opt.value
                                ? 'border-primary ring-2 ring-primary/20 scale-110'
                                : 'border-transparent hover:border-muted-foreground/30'
                        )}
                        style={{ backgroundColor: opt.value }}
                        aria-label={opt.label}
                        title={opt.label}
                    />
                ))}
            </div>
        </div>
    )
}
