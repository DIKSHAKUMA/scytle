'use client'

import type { FrameNode, ScytleNode, Sizing, TextNode } from '@/types/canvas'
import { Section, NumberInput, SelectInput } from './inputs'
import { Lock, AlignHorizontalSpaceBetween, AlignVerticalSpaceBetween, Square, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useMemo, useState } from 'react'
import { getAllowedSizingModes, normalizeSizingMode } from './layout-capabilities'

const SIZE_LABELS: Record<Sizing['horizontal'], string> = {
    fixed: 'Fixed',
    hug: 'Hug',
    fill: 'Fill',
}

function toSizeOptions(modes: Sizing['horizontal'][]) {
    return modes.map((mode) => ({
        value: mode,
        label: SIZE_LABELS[mode],
    }))
}

// Figma text resize modes
type TextResizeMode = 'auto-width' | 'auto-height' | 'fixed'

function getTextResizeMode(node: TextNode): TextResizeMode {
    if (node.autoResize === 'width-and-height') return 'auto-width'
    if (node.autoResize === 'height') return 'auto-height'
    return 'fixed'
}

interface SizeSectionProps {
    node: ScytleNode
    parentNode: FrameNode | null
    onUpdate: (updates: Record<string, unknown>) => void
}

export function SizeSection({ node, parentNode, onUpdate }: SizeSectionProps) {
    const [lockRatio, setLockRatio] = useState(false)
    const ratio = node.width / (node.height || 1)

    const isText = node.type === 'text'
    const textResizeMode = isText ? getTextResizeMode(node as TextNode) : null

    const allowedSizingModes = useMemo(
        () => getAllowedSizingModes(node, parentNode),
        [node, parentNode]
    )

    const horizontalOptions = useMemo(
        () => toSizeOptions(allowedSizingModes.horizontal),
        [allowedSizingModes.horizontal]
    )

    const verticalOptions = useMemo(
        () => toSizeOptions(allowedSizingModes.vertical),
        [allowedSizingModes.vertical]
    )

    const normalizedHorizontal = normalizeSizingMode(
        node.sizing.horizontal,
        allowedSizingModes.horizontal
    )
    const normalizedVertical = normalizeSizingMode(
        node.sizing.vertical,
        allowedSizingModes.vertical
    )

    // Show size limits when any min/max is set, or user toggles open.
    const hasConstraints = useMemo(() => (
        node.minWidth != null || node.maxWidth != null ||
        node.minHeight != null || node.maxHeight != null
    ), [node.minWidth, node.maxWidth, node.minHeight, node.maxHeight])
    const [constraintsOpen, setConstraintsOpen] = useState(hasConstraints)

    useEffect(() => {
        if (isText) return

        if (
            node.sizing.horizontal !== normalizedHorizontal ||
            node.sizing.vertical !== normalizedVertical
        ) {
            onUpdate({
                sizing: {
                    ...node.sizing,
                    horizontal: normalizedHorizontal,
                    vertical: normalizedVertical,
                },
            })
        }
    }, [
        isText,
        node.sizing,
        normalizedHorizontal,
        normalizedVertical,
        onUpdate,
    ])

    const updateSizing = (axis: 'horizontal' | 'vertical', mode: string) => {
        const allowed = axis === 'horizontal'
            ? allowedSizingModes.horizontal
            : allowedSizingModes.vertical
        if (!allowed.includes(mode as Sizing['horizontal'])) return

        onUpdate({
            sizing: {
                ...node.sizing,
                [axis]: mode as Sizing['horizontal'],
            },
        })
    }

    const handleWidthChange = (w: number) => {
        if (lockRatio) {
            onUpdate({ width: w, height: Math.round(w / ratio) })
        } else {
            onUpdate({ width: w })
        }
    }

    const handleHeightChange = (h: number) => {
        if (lockRatio) {
            onUpdate({ width: Math.round(h * ratio), height: h })
        } else {
            onUpdate({ height: h })
        }
    }

    const handleTextResizeMode = (mode: TextResizeMode) => {
        switch (mode) {
            case 'auto-width':
                onUpdate({
                    autoResize: 'width-and-height',
                    sizing: { horizontal: 'hug', vertical: 'hug' },
                })
                break
            case 'auto-height':
                onUpdate({
                    autoResize: 'height',
                    sizing: { horizontal: 'fixed', vertical: 'hug' },
                })
                break
            case 'fixed':
                onUpdate({
                    autoResize: 'none',
                    sizing: { horizontal: 'fixed', vertical: 'fixed' },
                })
                break
        }
    }

    return (
        <Section title="Size">
            {/* Text auto-resize mode (Figma: 3 options) */}
            {isText && (
                <div className="flex items-center gap-0.5 mb-1.5">
                    <button
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors',
                            textResizeMode === 'auto-width'
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/40'
                        )}
                        onClick={() => handleTextResizeMode('auto-width')}
                        title="Auto width — text grows horizontally, no wrapping"
                    >
                        <AlignHorizontalSpaceBetween size={12} />
                        <span>Auto W</span>
                    </button>
                    <button
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors',
                            textResizeMode === 'auto-height'
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/40'
                        )}
                        onClick={() => handleTextResizeMode('auto-height')}
                        title="Auto height — fixed width, grows vertically"
                    >
                        <AlignVerticalSpaceBetween size={12} />
                        <span>Auto H</span>
                    </button>
                    <button
                        className={cn(
                            'flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors',
                            textResizeMode === 'fixed'
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground/60 hover:text-foreground hover:bg-muted/40'
                        )}
                        onClick={() => handleTextResizeMode('fixed')}
                        title="Fixed size — fixed width and height"
                    >
                        <Square size={12} />
                        <span>Fixed</span>
                    </button>
                </div>
            )}

            {/* W / H + sizing mode */}
            <div className="space-y-1.5">
                {/* Width row */}
                <div className="flex items-center gap-1.5">
                    <NumberInput
                        label="W"
                        value={Math.round(node.width)}
                        onChange={handleWidthChange}
                        min={1}
                        step={1}
                        className="flex-1"
                        disabled={isText && textResizeMode === 'auto-width'}
                    />
                    {!isText && (
                        <SelectInput
                            value={normalizedHorizontal}
                            options={horizontalOptions}
                            onChange={(v) => updateSizing('horizontal', v)}
                            className="w-16"
                        />
                    )}
                </div>

                {/* Height row */}
                <div className="flex items-center gap-1.5">
                    <NumberInput
                        label="H"
                        value={Math.round(node.height)}
                        onChange={handleHeightChange}
                        min={1}
                        step={1}
                        className="flex-1"
                        disabled={isText && (textResizeMode === 'auto-width' || textResizeMode === 'auto-height')}
                    />
                    {!isText && (
                        <SelectInput
                            value={normalizedVertical}
                            options={verticalOptions}
                            onChange={(v) => updateSizing('vertical', v)}
                            className="w-16"
                        />
                    )}
                </div>

                {/* Lock aspect ratio */}
                <button
                    className={cn(
                        'flex items-center gap-1.5 text-[10px] transition-colors',
                        lockRatio
                            ? 'text-foreground'
                            : 'text-muted-foreground/50 hover:text-muted-foreground'
                    )}
                    onClick={() => setLockRatio(!lockRatio)}
                    title={lockRatio ? 'Unlock aspect ratio' : 'Lock aspect ratio'}
                >
                    <Lock size={10} />
                    <span>{lockRatio ? 'Constrain proportions' : 'Lock ratio'}</span>
                </button>

                {/* Min/Max size limits */}
                <div className="pt-1">
                    <button
                        className={cn(
                            'flex items-center gap-1 text-[10px] transition-colors',
                            constraintsOpen || hasConstraints
                                ? 'text-foreground'
                                : 'text-muted-foreground/50 hover:text-muted-foreground'
                        )}
                        onClick={() => setConstraintsOpen(!constraintsOpen)}
                        title={constraintsOpen ? 'Hide size limits' : 'Show size limits'}
                    >
                        <ChevronsUpDown size={10} />
                        <span>Size limits</span>
                    </button>

                    {constraintsOpen && (
                        <div className="space-y-1.5 mt-1.5">
                            {/* Width min/max */}
                            <div className="flex items-center gap-1.5">
                                <NumberInput
                                    label="Min W"
                                    value={node.minWidth ?? 0}
                                    onChange={(v) => onUpdate({ minWidth: v === 0 ? undefined : v })}
                                    min={0}
                                    step={1}
                                    className="flex-1"
                                    labelWidth="w-8"
                                />
                                <NumberInput
                                    label="Max"
                                    value={node.maxWidth ?? 0}
                                    onChange={(v) => onUpdate({ maxWidth: v === 0 ? undefined : v })}
                                    min={0}
                                    step={1}
                                    className="flex-1"
                                />
                            </div>
                            {/* Height min/max */}
                            <div className="flex items-center gap-1.5">
                                <NumberInput
                                    label="Min H"
                                    value={node.minHeight ?? 0}
                                    onChange={(v) => onUpdate({ minHeight: v === 0 ? undefined : v })}
                                    min={0}
                                    step={1}
                                    className="flex-1"
                                    labelWidth="w-8"
                                />
                                <NumberInput
                                    label="Max"
                                    value={node.maxHeight ?? 0}
                                    onChange={(v) => onUpdate({ maxHeight: v === 0 ? undefined : v })}
                                    min={0}
                                    step={1}
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Section>
    )
}
