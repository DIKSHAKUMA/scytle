'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ────────────────────────────────────────────────────────────
// Preset data
// ────────────────────────────────────────────────────────────

const PRESETS = [
    { name: 'Modern', colors: ['#18181b', '#f4f4f5', '#ef4444'] },
    { name: 'Warm', colors: ['#422006', '#fef3c7', '#f59e0b'] },
    { name: 'Ocean', colors: ['#0c4a6e', '#e0f2fe', '#0ea5e9'] },
    { name: 'Forest', colors: ['#14532d', '#dcfce7', '#22c55e'] },
    { name: 'Minimal', colors: ['#27272a', '#fafafa', '#a1a1aa'] },
    { name: 'Bold', colors: ['#1e1b4b', '#eef2ff', '#6366f1'] },
]

const COLORS = [
    { label: 'Primary', value: '#18181b' },
    { label: 'Background', value: '#ffffff' },
    { label: 'Accent', value: '#ef4444' },
    { label: 'Muted', value: '#f4f4f5' },
    { label: 'Text', value: '#09090b' },
]

// ────────────────────────────────────────────────────────────
// Section
// ────────────────────────────────────────────────────────────

function Section({
    title,
    children,
}: {
    title: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-2">
            <h3 className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {title}
            </h3>
            {children}
        </div>
    )
}

// ────────────────────────────────────────────────────────────
// Theme Tab
// ────────────────────────────────────────────────────────────

export function ThemeTab() {
    const [selectedPreset, setSelectedPreset] = useState('Modern')

    return (
        <div className="h-full overflow-y-auto px-3 py-3 space-y-5">
            {/* ── Presets ── */}
            <Section title="Presets">
                <div className="grid grid-cols-3 gap-1.5">
                    {PRESETS.map((preset) => (
                        <button
                            key={preset.name}
                            onClick={() => setSelectedPreset(preset.name)}
                            className={cn(
                                'rounded-lg p-1.5 text-center transition-all',
                                selectedPreset === preset.name
                                    ? 'ring-2 ring-foreground ring-offset-1 ring-offset-card'
                                    : 'hover:bg-muted/40'
                            )}
                        >
                            <div className="flex gap-0.5 justify-center mb-1">
                                {preset.colors.map((c, i) => (
                                    <div
                                        key={i}
                                        className="w-3.5 h-3.5 rounded-full border border-border/40"
                                        style={{ backgroundColor: c }}
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                                {preset.name}
                            </span>
                        </button>
                    ))}
                </div>
            </Section>

            {/* ── Colors ── */}
            <Section title="Colors">
                <div className="space-y-1">
                    {COLORS.map((color) => (
                        <div
                            key={color.label}
                            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted/40 transition-colors"
                        >
                            <div
                                className="w-5 h-5 rounded border border-border/60"
                                style={{ backgroundColor: color.value }}
                            />
                            <span className="text-xs text-muted-foreground flex-1">
                                {color.label}
                            </span>
                            <span className="text-[10px] text-muted-foreground/50 font-mono">
                                {color.value}
                            </span>
                        </div>
                    ))}
                </div>
            </Section>

            {/* ── Typography ── */}
            <Section title="Typography">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/30 border border-border/30">
                        <span className="text-xs text-muted-foreground">
                            Heading
                        </span>
                        <span className="text-xs font-display">
                            Bricolage Grotesque
                        </span>
                    </div>
                    <div className="flex items-center justify-between px-2 py-1.5 rounded-md bg-muted/30 border border-border/30">
                        <span className="text-xs text-muted-foreground">
                            Body
                        </span>
                        <span className="text-xs">Inter</span>
                    </div>
                </div>
            </Section>

            {/* ── Style ── */}
            <Section title="Border radius">
                <div className="flex gap-1">
                    {['none', 'sm', 'md', 'lg', 'full'].map((r) => (
                        <button
                            key={r}
                            className={cn(
                                'flex-1 h-7 rounded text-[10px] transition-colors',
                                r === 'md'
                                    ? 'bg-foreground text-background'
                                    : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                            )}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </Section>

            {/* ── Apply ── */}
            <button
                disabled
                className="w-full py-2 rounded-lg bg-foreground text-background text-xs font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
                <Check className="w-3.5 h-3.5" />
                Apply Theme
            </button>
        </div>
    )
}
