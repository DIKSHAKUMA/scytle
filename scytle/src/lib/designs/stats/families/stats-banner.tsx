'use client'

/**
 * Stats Banner Family — Full-width dark banner with inline stats.
 *
 * Controls:
 * - style: dark | light | gradient
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
    const style = (controls?.style as string) ?? 'dark'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const stats = (content?.stats as Array<{ value: string; label: string }>) || []
    const itemCount = stats.length

    const bgClass =
        style === 'gradient'
            ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white'
            : style === 'dark'
                ? 'bg-gray-900 text-white'
                : 'bg-gray-50 text-gray-900 border-y border-gray-200'
    const valueColor = style === 'light' ? 'text-gray-900' : 'text-white'
    const labelColor = style === 'light' ? 'text-gray-500' : 'text-gray-400'
    const dividerColor = style === 'light' ? 'border-gray-200' : 'border-gray-700'

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

    const gridCols = isMobile ? 2 : isTablet ? Math.min(itemCount, 4) : itemCount

    return (
        <section className={`${bgClass} ${isMobile ? 'py-10 px-4' : isTablet ? 'py-14 px-8' : 'py-16 px-16'}`}>
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
                                    className={`text-center py-2 ${i < itemCount - 1 && !isMobile ? `border-r ${dividerColor}` : ''}`}
                                >
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleStatChange(i, 'value', v)}
                                        as="div"
                                        className={`font-bold ${valueColor} ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={stat.label}
                                        onChange={(v) => handleStatChange(i, 'label', v)}
                                        className={`text-sm ${labelColor} mt-1`}
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

export const StatsBannerFamily: TemplateFamily = {
    id: 'stats-banner',
    category: 'stats',
    name: 'Stats Banner',
    description: 'Full-width banner with statistics',
    tags: ['stats', 'banner', 'dark', 'numbers'],
    Canvas,
    controlsDef: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
                { value: 'gradient', label: 'Gradient' },
            ],
            defaultValue: 'dark',
        },
    ],
    defaultControls: {
        style: 'dark',
    },
    defaultContent: {
        stats: [
            { value: '10,000+', label: 'Happy Customers' },
            { value: '50+', label: 'Countries' },
            { value: '$2M+', label: 'Revenue' },
            { value: '99.9%', label: 'Uptime' },
        ],
    },
}
