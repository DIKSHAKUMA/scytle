'use client'

/**
 * Stats Progress Family — Stats with visual progress/percentage bars.
 *
 * Controls:
 * - columns: 1 | 2
 * - showPercentage: boolean
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
    const columns = Number(controls?.columns ?? 1)
    const showPercentage = controls?.showPercentage !== false
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const stats = (content?.stats as Array<{ label: string; value: string; percent: number }>) || []
    const itemCount = stats.length

    const gridCols = isMobile ? 1 : columns

    const handleStatChange = (index: number, field: 'label' | 'value', value: string) => {
        const updated = [...stats]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('stats', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('stats', insertListItem(stats, index, { label: 'Metric', value: '50%', percent: 50 }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(stats, index, 1)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-5xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.heading as string) || 'Our performance'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Key metrics visualized as progress indicators.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className={`text-gray-500 mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Progress Bars */}
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
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <EditableText
                                            value={stat.label}
                                            onChange={(v) => handleStatChange(i, 'label', v)}
                                            className="text-sm font-medium text-gray-700"
                                            editable={editable}
                                        />
                                        {showPercentage && (
                                            <EditableText
                                                value={stat.value}
                                                onChange={(v) => handleStatChange(i, 'value', v)}
                                                className="text-sm font-bold text-gray-900"
                                                editable={editable}
                                            />
                                        )}
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="bg-gray-800 h-2.5 rounded-full transition-all"
                                            style={{ width: `${Math.min(100, Math.max(0, stat.percent))}%` }}
                                        />
                                    </div>
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

export const StatsProgressFamily: TemplateFamily = {
    id: 'stats-progress',
    category: 'stats',
    name: 'Stats Progress',
    description: 'Statistics with progress bar visualizations',
    tags: ['stats', 'progress', 'bars', 'percentage'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '1',
        },
        {
            key: 'showPercentage',
            label: 'Show Value',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '1',
        showPercentage: true,
    },
    defaultContent: {
        heading: 'Our performance',
        subheading: 'Key metrics visualized as progress indicators.',
        stats: [
            { label: 'Customer Satisfaction', value: '95%', percent: 95 },
            { label: 'Uptime Reliability', value: '99.9%', percent: 99 },
            { label: 'Feature Adoption', value: '78%', percent: 78 },
            { label: 'Response Time SLA', value: '90%', percent: 90 },
        ],
    },
}
