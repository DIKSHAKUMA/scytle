'use client'

/**
 * Stats Row Family — Horizontal row of stat counters with editable values.
 *
 * Controls:
 * - showLabel: boolean
 * - showDividers: boolean
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
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const showLabel = controls?.showLabel !== false
    const showDividers = controls?.showDividers !== false
    const stats = (content?.stats as Array<{ value: string; label: string }>) || []
    const itemCount = stats.length

    const gridCols = isMobile ? 2 : isTablet ? Math.min(itemCount, 4) : itemCount

    const handleStatChange = (index: number, field: 'value' | 'label', value: string) => {
        const updated = [...stats]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('stats', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('stats', insertListItem(stats, index, { value: '100+', label: 'Metric' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(stats, index, 1)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
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
                                <div
                                    className={`text-center py-4 ${showDividers && i < itemCount - 1 && !isMobile ? 'border-r border-gray-200' : ''}`}
                                >
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleStatChange(i, 'value', v)}
                                        as="div"
                                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                                        editable={editable}
                                    />
                                    {showLabel && (
                                        <EditableText
                                            value={stat.label}
                                            onChange={(v) => handleStatChange(i, 'label', v)}
                                            className="text-sm text-gray-500 mt-1"
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

export const StatsRowFamily: TemplateFamily = {
    id: 'stats-row',
    category: 'stats',
    name: 'Stats Row',
    description: 'Horizontal row of key statistics',
    tags: ['stats', 'numbers', 'counters', 'metrics'],
    Canvas,
    controlsDef: [
        {
            key: 'showLabel',
            label: 'Show Labels',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDividers',
            label: 'Dividers',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        showLabel: true,
        showDividers: true,
    },
    defaultContent: {
        stats: [
            { value: '10,000+', label: 'Users' },
            { value: '50+', label: 'Countries' },
            { value: '$2M+', label: 'Revenue' },
            { value: '99.9%', label: 'Uptime' },
        ],
    },
}
