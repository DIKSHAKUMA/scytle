'use client'

/**
 * Stats Cards Family — Stat numbers in card boxes with editable values.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - showIcon: boolean
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
    const columns = Number(controls?.columns ?? 3)
    const showIcon = controls?.showIcon === true
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const stats = (content?.stats as Array<{ value: string; label: string }>) || []
    const itemCount = stats.length

    const gridCols = isMobile ? 2 : isTablet ? Math.min(columns, 3) : columns

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
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.heading as string) || 'By the numbers'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Key metrics that showcase our impact.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className={`text-gray-500 mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Cards */}
                <div
                    className="grid gap-4"
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
                                <div className="border border-gray-200 rounded-lg p-6 text-center">
                                    {showIcon && (
                                        <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center text-gray-400 text-xs">
                                            #
                                        </div>
                                    )}
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleStatChange(i, 'value', v)}
                                        as="div"
                                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={stat.label}
                                        onChange={(v) => handleStatChange(i, 'label', v)}
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

export const StatsCardsFamily: TemplateFamily = {
    id: 'stats-cards',
    category: 'stats',
    name: 'Stats Cards',
    description: 'Statistics displayed in card boxes',
    tags: ['stats', 'cards', 'numbers', 'metrics'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showIcon',
            label: 'Show Icon',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        columns: '3',
        showIcon: false,
    },
    defaultContent: {
        heading: 'By the numbers',
        subheading: 'Key metrics that showcase our impact.',
        stats: [
            { value: '10,000+', label: 'Active Users' },
            { value: '50+', label: 'Countries Served' },
            { value: '$2M+', label: 'Revenue Generated' },
        ],
    },
}
