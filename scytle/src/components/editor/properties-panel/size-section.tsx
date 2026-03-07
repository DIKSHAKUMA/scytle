'use client'

import type { ScytleNode, Sizing, TextNode } from '@/types/canvas'
import { Section, NumberInput, SelectInput } from './inputs'
import { Lock, AlignHorizontalSpaceBetween, AlignVerticalSpaceBetween, Square } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

// Only Frame gets Fill/Hug, Text/Image only get Fixed/Fill
const FRAME_SIZE_OPTIONS = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'hug', label: 'Hug' },
    { value: 'fill', label: 'Fill' },
]

const LEAF_SIZE_OPTIONS = [
    { value: 'fixed', label: 'Fixed' },
    { value: 'fill', label: 'Fill' },
]

// Figma text resize modes
type TextResizeMode = 'auto-width' | 'auto-height' | 'fixed'

function getTextResizeMode(node: TextNode): TextResizeMode {
    if (node.autoResize === 'width-and-height') return 'auto-width'
    if (node.autoResize === 'height') return 'auto-height'
    return 'fixed'
}

interface SizeSectionProps {
    node: ScytleNode
    onUpdate: (updates: Record<string, unknown>) => void
}

export function SizeSection({ node, onUpdate }: SizeSectionProps) {
    const sizeOpts = node.type === 'frame' ? FRAME_SIZE_OPTIONS : LEAF_SIZE_OPTIONS
    const [lockRatio, setLockRatio] = useState(false)
    const ratio = node.width / (node.height || 1)

    const isText = node.type === 'text'
    const textResizeMode = isText ? getTextResizeMode(node as TextNode) : null

    const updateSizing = (axis: 'horizontal' | 'vertical', mode: string) => {
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
                            value={node.sizing.horizontal}
                            options={sizeOpts}
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
                            value={node.sizing.vertical}
                            options={sizeOpts}
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
            </div>
        </Section>
    )
}
