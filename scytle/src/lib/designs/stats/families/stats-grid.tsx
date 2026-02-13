'use client'

/**
 * Stats Grid Family — Multi-row grid of stat items.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - showBorder: boolean
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
    const columns = isMobile ? 2 : Number(controls?.columns ?? 3)
    const showBorder = controls?.showBorder !== false
    const stats = (content?.stats as Array<{ value: string; label: string }>) || []
    const itemCount = stats.length

    const colClass = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...stats]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, { value: '0', label: 'New Stat' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 2)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-6xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Key Metrics'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-10`}
                    editable={editable}
                />

                <div className={`grid ${colClass} ${showBorder ? 'border border-gray-200 rounded-xl overflow-hidden' : 'gap-6'}`}>
                    {stats.map((stat, i) => (
                        <div key={i}>
                            {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={itemCount > 2}
                                editable={editable}
                            >
                                <div className={`${showBorder ? 'border-r border-b border-gray-200 p-6' : 'p-4'} text-center`}>
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleChange(i, 'value', v)}
                                        as="span"
                                        className={`block ${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-900`}
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={stat.label}
                                        onChange={(v) => handleChange(i, 'label', v)}
                                        className="text-sm text-gray-500 mt-1"
                                        editable={editable}
                                    />
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

export const StatsGridFamily: TemplateFamily = {
    id: 'stats-grid',
    category: 'stats',
    name: 'Stats Grid',
    description: 'Multi-row bordered grid of metrics',
    tags: ['stats', 'grid', 'table', 'metrics'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], defaultValue: '3' },
        { key: 'showBorder', label: 'Border', type: 'switch', defaultValue: true },
    ],
    defaultControls: { columns: '3', showBorder: true },
    defaultContent: {
        heading: 'Key Metrics',
        stats: [
            { value: '500+', label: 'Clients' },
            { value: '1,200', label: 'Projects' },
            { value: '98%', label: 'Satisfaction' },
            { value: '15+', label: 'Years' },
            { value: '50+', label: 'Countries' },
            { value: '24/7', label: 'Support' },
        ],
    },
}
