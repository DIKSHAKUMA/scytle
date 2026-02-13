'use client'

/**
 * Stats Circular Family — Circular progress ring indicators.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - ringSize: small | large
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

function CircleRing({ percentage, size }: { percentage: number; size: 'small' | 'large' }) {
    const dim = size === 'large' ? 100 : 64
    const stroke = size === 'large' ? 6 : 4
    const radius = (dim - stroke) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference

    return (
        <svg width={dim} height={dim} className="mx-auto">
            <circle cx={dim / 2} cy={dim / 2} r={radius} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
            <circle
                cx={dim / 2}
                cy={dim / 2}
                r={radius}
                fill="none"
                stroke="#374151"
                strokeWidth={stroke}
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                transform={`rotate(-90 ${dim / 2} ${dim / 2})`}
            />
        </svg>
    )
}

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const columns = isMobile ? 2 : Number(controls?.columns ?? 3)
    const ringSize = (controls?.ringSize as 'small' | 'large') ?? 'large'
    const stats = (content?.stats as Array<{ value: string; label: string; percentage: number }>) || []
    const itemCount = stats.length

    const colClass = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...stats]
        if (field === 'percentage') {
            const num = parseInt(v) || 0
            updated[i] = { ...updated[i], percentage: Math.min(100, Math.max(0, num)) }
        } else {
            updated[i] = { ...updated[i], [field]: v }
        }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, { value: '50%', label: 'New Metric', percentage: 50 }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 2)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-5xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Performance'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-12`}
                    editable={editable}
                />

                <div className={`grid ${colClass} gap-8`}>
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
                                <div className="text-center">
                                    <div className="relative inline-block">
                                        <CircleRing percentage={stat.percentage} size={ringSize} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <EditableText
                                                value={stat.value}
                                                onChange={(v) => handleChange(i, 'value', v)}
                                                as="span"
                                                className={`font-bold text-gray-900 ${ringSize === 'large' ? 'text-lg' : 'text-sm'}`}
                                                editable={editable}
                                            />
                                        </div>
                                    </div>
                                    <EditableText
                                        value={stat.label}
                                        onChange={(v) => handleChange(i, 'label', v)}
                                        className="text-sm text-gray-500 mt-3"
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

export const StatsCircularFamily: TemplateFamily = {
    id: 'stats-circular',
    category: 'stats',
    name: 'Stats Circular',
    description: 'Circular progress ring indicators',
    tags: ['stats', 'circular', 'progress', 'ring'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], defaultValue: '3' },
        { key: 'ringSize', label: 'Ring Size', type: 'toggle-group', options: [{ value: 'small', label: 'Small' }, { value: 'large', label: 'Large' }], defaultValue: 'large' },
    ],
    defaultControls: { columns: '3', ringSize: 'large' },
    defaultContent: {
        heading: 'Performance',
        stats: [
            { value: '95%', label: 'Customer Satisfaction', percentage: 95 },
            { value: '87%', label: 'Market Share Growth', percentage: 87 },
            { value: '99%', label: 'System Reliability', percentage: 99 },
        ],
    },
}
