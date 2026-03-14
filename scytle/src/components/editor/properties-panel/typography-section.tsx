'use client'

import { useState, useEffect, useRef } from 'react'
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
import { cn } from '@/lib/utils'

// ── Font options ──────────────────────────────────────────────

/**
 * Curated list of popular fonts covering sans-serif, serif, mono, and display.
 * Users can also type any custom font name — this list drives the datalist suggestions.
 */
const SUGGESTED_FONTS = [
    // Popular sans-serif
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 'Nunito',
    'Raleway', 'DM Sans', 'Manrope', 'Outfit', 'Plus Jakarta Sans', 'Figtree',
    'Source Sans 3', 'Geist', 'Work Sans',
    // Serif
    'Georgia', 'Merriweather', 'Playfair Display', 'Lora', 'EB Garamond',
    'Cormorant Garamond', 'DM Serif Display', 'Fraunces',
    // Monospace
    'JetBrains Mono', 'Fira Code', 'Source Code Pro', 'IBM Plex Mono', 'Roboto Mono',
    // Display / Creative
    'Bricolage Grotesque', 'Space Grotesk', 'Cabinet Grotesk',
    // System fallbacks
    'system-ui', 'sans-serif', 'serif', 'monospace',
]

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

// ── Font family input — searchable text field with datalist ──

const DATALIST_ID = 'scytle-font-family-list'

const INPUT_BASE = [
    'w-full h-7 px-2 text-[11px] rounded-sm',
    'bg-transparent border border-transparent',
    'hover:bg-muted/50',
    'focus:bg-muted/60 focus:border-border focus:outline-none',
    'transition-colors',
].join(' ')

interface FontInputProps {
    value: string
    onChange: (v: string) => void
}

function FontInput({ value, onChange }: FontInputProps) {
    const [local, setLocal] = useState(value)
    const ref = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (document.activeElement !== ref.current) {
            setLocal(value)
        }
    }, [value])

    const commit = () => {
        const trimmed = local.trim()
        if (trimmed && trimmed !== value) onChange(trimmed)
        else setLocal(value)
    }

    return (
        <>
            <input
                ref={ref}
                type="text"
                list={DATALIST_ID}
                value={local}
                className={cn(INPUT_BASE)}
                placeholder="Font family..."
                onChange={(e) => setLocal(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') { commit(); ref.current?.blur() }
                    if (e.key === 'Escape') { setLocal(value); ref.current?.blur() }
                }}
                onFocus={(e) => e.target.select()}
            />
            <datalist id={DATALIST_ID}>
                {SUGGESTED_FONTS.map((f) => (
                    <option key={f} value={f} />
                ))}
            </datalist>
        </>
    )
}

// ── Main section ──────────────────────────────────────────────

interface TypographySectionProps {
    node: TextNode
    onUpdate: (updates: Record<string, unknown>) => void
}

export function TypographySection({ node, onUpdate }: TypographySectionProps) {
    return (
        <Section title="Typography">
            {/* Font family — free-text input with common font suggestions */}
            <FontInput
                value={node.fontFamily}
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

            {/* Transform + Tag — resize mode lives in SizeSection (no duplicate here) */}
            <div className="grid grid-cols-2 gap-x-2">
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
            </div>
        </Section>
    )
}
