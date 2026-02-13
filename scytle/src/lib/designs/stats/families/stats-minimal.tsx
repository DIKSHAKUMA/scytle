'use client'

/**
 * Stats Minimal Family — Ultra-clean numbers-only minimal stats.
 *
 * Controls:
 * - size: small | large
 * - showLabel: boolean
 */

import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import {
    DynamicListItem,
    InsertDot,
    insertListItem,
    removeListItem,
} from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const size = (controls?.size as string) ?? 'large'
    const showLabel = controls?.showLabel !== false
    const stats = (content?.stats as Array<{ value: string; label: string }>) || []
    const itemCount = stats.length

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...stats]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, { value: '0', label: 'Metric' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 2)
        if (result) onContentChange?.('stats', result)
    }

    const valueSize = size === 'large'
        ? (isMobile ? 'text-4xl' : 'text-6xl')
        : (isMobile ? 'text-2xl' : 'text-3xl')

    return (
        <section className={`${isMobile ? 'py-16 px-4' : 'py-24 px-16'}`}>
            <div className="max-w-5xl mx-auto">
                <div className={`flex ${isMobile ? 'flex-wrap gap-8 justify-center' : 'justify-around'}`}>
                    {stats.map((stat, i) => (
                        <div key={i} className={isMobile ? 'w-1/3 text-center' : 'text-center'}>
                            {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={itemCount > 2}
                                editable={editable}
                            >
                                <div>
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleChange(i, 'value', v)}
                                        as="span"
                                        className={`block ${valueSize} font-light text-gray-900 tracking-tight`}
                                        editable={editable}
                                    />
                                    {showLabel && (
                                        <EditableText
                                            value={stat.label}
                                            onChange={(v) => handleChange(i, 'label', v)}
                                            className="text-xs text-gray-400 uppercase tracking-widest mt-2"
                                            editable={editable}
                                        />
                                    )}
                                </div>
                            </DynamicListItem>
                            {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const StatsMinimalFamily: TemplateFamily = {
    id: 'stats-minimal',
    category: 'stats',
    name: 'Stats Minimal',
    description: 'Ultra-clean numbers with minimal styling',
    tags: ['stats', 'minimal', 'clean', 'simple'],
    Canvas,
    controlsDef: [
        { key: 'size', label: 'Size', type: 'toggle-group', options: [{ value: 'small', label: 'Small' }, { value: 'large', label: 'Large' }], defaultValue: 'large' },
        { key: 'showLabel', label: 'Labels', type: 'switch', defaultValue: true },
    ],
    defaultControls: { size: 'large', showLabel: true },
    defaultContent: {
        stats: [
            { value: '12', label: 'Years' },
            { value: '850', label: 'Projects' },
            { value: '40', label: 'Awards' },
        ],
    },
}
