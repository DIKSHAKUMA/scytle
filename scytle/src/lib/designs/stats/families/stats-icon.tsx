'use client'

/**
 * Stats Icon Family — Stats with icon placeholder above each number.
 *
 * Controls:
 * - columns: 2 | 3 | 4
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
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const showDescription = controls?.showDescription !== false
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const stats = (content?.stats as Array<{ value: string; label: string; description: string }>) || []
    const itemCount = stats.length

    const gridCols = isMobile ? 1 : isTablet ? Math.min(columns, 2) : columns

    const handleStatChange = (index: number, field: 'value' | 'label' | 'description', value: string) => {
        const updated = [...stats]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('stats', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('stats', insertListItem(stats, index, { value: '100+', label: 'Metric', description: 'Description of this metric and what it means.' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(stats, index, 1)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Our Impact'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Numbers that matter'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Stats Grid */}
                <div
                    className="grid gap-8"
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
                                <div className="text-center">
                                    {/* Icon placeholder */}
                                    <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                        <span className="text-gray-400 text-lg">#</span>
                                    </div>
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleStatChange(i, 'value', v)}
                                        as="div"
                                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={stat.label}
                                        onChange={(v) => handleStatChange(i, 'label', v)}
                                        className="text-sm font-medium text-gray-700 mt-1"
                                        editable={editable}
                                    />
                                    {showDescription && (
                                        <EditableText
                                            value={stat.description}
                                            onChange={(v) => handleStatChange(i, 'description', v)}
                                            className="text-xs text-gray-500 mt-2 max-w-[200px] mx-auto"
                                            editable={editable}
                                            multiline
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

export const StatsIconFamily: TemplateFamily = {
    id: 'stats-icon',
    category: 'stats',
    name: 'Stats with Icons',
    description: 'Statistics with icon placeholders',
    tags: ['stats', 'icons', 'numbers', 'metrics'],
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
            key: 'showDescription',
            label: 'Descriptions',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        showDescription: true,
    },
    defaultContent: {
        tagline: 'Our Impact',
        heading: 'Numbers that matter',
        stats: [
            { value: '10K+', label: 'Active Users', description: 'Growing user base across all platforms.' },
            { value: '50+', label: 'Countries', description: 'Serving customers worldwide.' },
            { value: '99.9%', label: 'Uptime', description: 'Industry-leading reliability.' },
        ],
    },
}
