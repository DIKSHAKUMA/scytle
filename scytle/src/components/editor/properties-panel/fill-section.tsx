'use client'

import type { ScytleNode, Fill } from '@/types/canvas'
import { Section, ColorInput, SelectInput } from './inputs'
import { Plus, Trash2, ImageIcon } from 'lucide-react'
import { useRef } from 'react'

const IMAGE_FIT_OPTIONS = [
    { value: 'cover', label: 'Fill' },
    { value: 'contain', label: 'Fit' },
    { value: 'fill', label: 'Stretch' },
]

interface FillSectionProps {
    node: ScytleNode
    onUpdate: (updates: Record<string, unknown>) => void
}

export function FillSection({ node, onUpdate }: FillSectionProps) {
    const fills = node.fills
    const fileInputRef = useRef<HTMLInputElement>(null)

    const updateFill = (index: number, partial: Partial<Fill>) => {
        const newFills = fills.map((f, i) =>
            i === index ? { ...f, ...partial } : f
        )
        onUpdate({ fills: newFills })
    }

    const addSolidFill = () => {
        onUpdate({
            fills: [...fills, { type: 'solid' as const, color: '#ffffff' }],
        })
    }

    const addImageFill = (file: File) => {
        const url = URL.createObjectURL(file)
        onUpdate({
            fills: [...fills, { type: 'image' as const, src: url, fit: 'cover' as const }],
        })
    }

    const removeFill = (index: number) => {
        onUpdate({ fills: fills.filter((_, i) => i !== index) })

    }

    const replaceFillWithImage = (index: number, file: File) => {
        const url = URL.createObjectURL(file)
        const newFills = fills.map((f, i) =>
            i === index
                ? { type: 'image' as const, src: url, fit: 'cover' as const }
                : f
        )
        onUpdate({ fills: newFills })
    }

    return (
        <Section
            title="Fill"
            action={
                <div className="flex items-center gap-0.5">
                    <button
                        className="p-0.5 text-muted-foreground/60 hover:text-foreground transition-colors"
                        onClick={() => addSolidFill()}
                        title="Add solid fill"
                    >
                        <Plus size={12} />
                    </button>
                </div>
            }
        >
            {fills.map((fill, i) => (
                <div key={i} className="space-y-1.5">
                    <div className="flex items-center gap-1">
                        <div className="flex-1">
                            {fill.type === 'solid' && (
                                <ColorInput
                                    value={fill.color}
                                    onChange={(c) => updateFill(i, { color: c })}
                                />
                            )}
                            {fill.type === 'gradient' && (
                                <div className="flex items-center gap-1.5">
                                    <div
                                        className="w-6 h-6 rounded-sm border border-border/60"
                                        style={{
                                            background: fill.gradient || 'linear-gradient(135deg, #000, #fff)',
                                        }}
                                    />
                                    <span className="text-[11px] text-muted-foreground">Gradient</span>
                                </div>
                            )}
                            {fill.type === 'image' && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-1.5">
                                        <div
                                            className="w-6 h-6 rounded-sm border border-border/60 bg-muted/50 flex items-center justify-center overflow-hidden cursor-pointer"
                                            onClick={() => {
                                                const input = document.createElement('input')
                                                input.type = 'file'
                                                input.accept = 'image/*'
                                                input.onchange = (e) => {
                                                    const file = (e.target as HTMLInputElement).files?.[0]
                                                    if (file) replaceFillWithImage(i, file)
                                                }
                                                input.click()
                                            }}
                                            title="Change image"
                                        >
                                            {fill.src ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={fill.src}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <ImageIcon size={10} className="text-muted-foreground/40" />
                                            )}
                                        </div>
                                        <span className="text-[11px] text-muted-foreground">Image</span>
                                        <div className="ml-auto">
                                            <SelectInput
                                                value={fill.fit}
                                                options={IMAGE_FIT_OPTIONS}
                                                onChange={(v) => updateFill(i, { fit: v as 'cover' | 'contain' | 'fill' })}
                                                className="w-16"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <button
                            className="p-1 text-muted-foreground/40 hover:text-destructive transition-colors"
                            onClick={() => removeFill(i)}
                            title="Remove fill"
                        >
                            <Trash2 size={11} />
                        </button>
                    </div>
                </div>
            ))}

            {/* Quick add image fill */}
            <button
                className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 hover:text-foreground transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <ImageIcon size={11} />
                Image fill
            </button>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) addImageFill(file)
                    e.target.value = ''
                }}
            />
        </Section>
    )
}
