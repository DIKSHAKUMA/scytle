'use client'

import type { TextNode } from '@/types/canvas'
import { Section, NumberInput, SelectInput, ColorInput, ToggleGroup } from './inputs'
import {
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    Underline,
    Strikethrough,
    Minus,
} from 'lucide-react'

const FONT_WEIGHT_OPTIONS = [
    { value: '100', label: 'Thin' },
    { value: '200', label: 'Extra Light' },
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semibold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' },
    { value: '900', label: 'Black' },
]

const TEXT_TRANSFORM_OPTIONS = [
    { value: 'none', label: 'None' },
    { value: 'uppercase', label: 'UPPER' },
    { value: 'lowercase', label: 'lower' },
    { value: 'capitalize', label: 'Title' },
]

const TEXT_ALIGN_OPTIONS: { value: TextNode['textAlign']; icon: React.ReactNode; title: string }[] = [
    { value: 'left', icon: <AlignLeft size={13} />, title: 'Left' },
    { value: 'center', icon: <AlignCenter size={13} />, title: 'Center' },
    { value: 'right', icon: <AlignRight size={13} />, title: 'Right' },
    { value: 'justify', icon: <AlignJustify size={13} />, title: 'Justify' },
]

const DECORATION_OPTIONS: { value: TextNode['textDecoration']; icon: React.ReactNode; title: string }[] = [
    { value: 'none', icon: <Minus size={13} />, title: 'None' },
    { value: 'underline', icon: <Underline size={13} />, title: 'Underline' },
    { value: 'line-through', icon: <Strikethrough size={13} />, title: 'Strikethrough' },
]

const AUTO_RESIZE_OPTIONS = [
    { value: 'none', label: 'Fixed' },
    { value: 'width-and-height', label: 'Auto W+H' },
    { value: 'height', label: 'Auto H' },
    { value: 'truncate', label: 'Truncate' },
]

const HTML_TAG_OPTIONS = [
    { value: '', label: 'Auto' },
    { value: 'h1', label: 'H1' },
    { value: 'h2', label: 'H2' },
    { value: 'h3', label: 'H3' },
    { value: 'h4', label: 'H4' },
    { value: 'h5', label: 'H5' },
    { value: 'h6', label: 'H6' },
    { value: 'p', label: 'P' },
    { value: 'span', label: 'Span' },
]

interface TypographySectionProps {
    node: TextNode
    onUpdate: (updates: Record<string, unknown>) => void
}

export function TypographySection({ node, onUpdate }: TypographySectionProps) {
    return (
        <Section title="Typography">
            {/* Font family */}
            <SelectInput
                value={node.fontFamily}
                options={[
                    { value: 'Inter', label: 'Inter' },
                    { value: 'JetBrains Mono', label: 'JetBrains Mono' },
                    { value: 'Bricolage Grotesque', label: 'Bricolage' },
                    { value: 'serif', label: 'Serif' },
                    { value: 'monospace', label: 'Mono' },
                ]}
                onChange={(v) => onUpdate({ fontFamily: v })}
            />

            {/* Weight + Size row */}
            <div className="grid grid-cols-2 gap-x-2">
                <SelectInput
                    value={String(node.fontWeight)}
                    options={FONT_WEIGHT_OPTIONS}
                    onChange={(v) => onUpdate({ fontWeight: parseInt(v, 10) })}
                />
                <NumberInput
                    label="Sz"
                    value={node.fontSize}
                    onChange={(v) => onUpdate({ fontSize: v })}
                    min={1}
                    step={1}
                    labelWidth="w-5"
                />
            </div>

            {/* Line height + Letter spacing */}
            <div className="grid grid-cols-2 gap-x-2">
                <NumberInput
                    label="LH"
                    value={node.lineHeight === 'auto' ? 0 : node.lineHeight}
                    onChange={(v) => onUpdate({ lineHeight: v === 0 ? 'auto' : v })}
                    min={0}
                    step={0.1}
                    labelWidth="w-5"
                />
                <NumberInput
                    label="LS"
                    value={node.letterSpacing}
                    onChange={(v) => onUpdate({ letterSpacing: v })}
                    step={0.1}
                    labelWidth="w-5"
                />
            </div>

            {/* Color */}
            <ColorInput
                value={node.color}
                onChange={(c) => onUpdate({ color: c })}
            />

            {/* Text alignment + Decoration */}
            <div className="flex items-center gap-2">
                <ToggleGroup
                    value={node.textAlign}
                    options={TEXT_ALIGN_OPTIONS}
                    onChange={(v) => onUpdate({ textAlign: v })}
                    className="flex-1"
                />
                <ToggleGroup
                    value={node.textDecoration}
                    options={DECORATION_OPTIONS}
                    onChange={(v) => onUpdate({ textDecoration: v })}
                />
            </div>

            {/* Transform + Tag + Resize */}
            <div className="grid grid-cols-3 gap-x-2">
                <SelectInput
                    value={node.textTransform}
                    options={TEXT_TRANSFORM_OPTIONS}
                    onChange={(v) => onUpdate({ textTransform: v })}
                />
                <SelectInput
                    value={node.htmlTag || ''}
                    options={HTML_TAG_OPTIONS}
                    onChange={(v) => onUpdate({ htmlTag: v || undefined })}
                />
                <SelectInput
                    value={node.autoResize}
                    options={AUTO_RESIZE_OPTIONS}
                    onChange={(v) => onUpdate({ autoResize: v })}
                />
            </div>
        </Section>
    )
}
