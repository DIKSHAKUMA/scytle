'use client'

/**
 * Stats Counter Family — Large centered counter stats with supporting text.
 *
 * Controls:
 * - alignment: center | left
 * - showDescription: boolean
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
    const alignment = (controls?.alignment as string) ?? 'center'
    const showDescription = controls?.showDescription !== false
    const stats = (content?.stats as Array<{ value: string; label: string; description: string }>) || []
    const itemCount = stats.length

    const alignClass = alignment === 'center' ? 'text-center' : 'text-left'

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...stats]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, { value: '0', label: 'New Metric', description: 'Metric description' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 1)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : 'py-24 px-16'}`}>
            <div className="max-w-4xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'By the Numbers'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 ${alignClass} mb-12`}
                    editable={editable}
                />

                <div className={`${isMobile ? 'space-y-10' : 'space-y-16'}`}>
                    {stats.map((stat, i) => (
                        <div key={i}>
                            {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={itemCount > 1}
                                editable={editable}
                            >
                                <div className={alignClass}>
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleChange(i, 'value', v)}
                                        as="span"
                                        className={`block ${isMobile ? 'text-5xl' : 'text-7xl'} font-bold text-gray-900 tracking-tight`}
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={stat.label}
                                        onChange={(v) => handleChange(i, 'label', v)}
                                        className={`${isMobile ? 'text-base' : 'text-lg'} font-medium text-gray-600 mt-2`}
                                        editable={editable}
                                    />
                                    {showDescription && (
                                        <EditableText
                                            value={stat.description}
                                            onChange={(v) => handleChange(i, 'description', v)}
                                            className="text-sm text-gray-400 mt-1 max-w-md mx-auto"
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

export const StatsCounterFamily: TemplateFamily = {
    id: 'stats-counter',
    category: 'stats',
    name: 'Stats Counter',
    description: 'Large centered counter numbers with descriptions',
    tags: ['stats', 'counter', 'large', 'centered'],
    Canvas,
    controlsDef: [
        { key: 'alignment', label: 'Align', type: 'toggle-group', options: [{ value: 'center', label: 'Center' }, { value: 'left', label: 'Left' }], defaultValue: 'center' },
        { key: 'showDescription', label: 'Description', type: 'switch', defaultValue: true },
    ],
    defaultControls: { alignment: 'center', showDescription: true },
    defaultContent: {
        heading: 'By the Numbers',
        stats: [
            { value: '10M+', label: 'Active Users', description: 'Across 120 countries worldwide' },
            { value: '99.9%', label: 'Uptime', description: 'Enterprise-grade reliability' },
            { value: '4.9★', label: 'Rating', description: 'Average customer satisfaction score' },
        ],
    },
}
