'use client'

/**
 * Stats List Family — Vertical list format stats.
 *
 * Controls:
 * - showDividers: boolean
 * - valuePosition: left | right
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
    const showDividers = controls?.showDividers !== false
    const valuePosition = (controls?.valuePosition as string) ?? 'right'
    const stats = (content?.stats as Array<{ value: string; label: string; description: string }>) || []
    const itemCount = stats.length

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...stats]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, { value: '0', label: 'New Stat', description: 'Description' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 2)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-3xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Our Impact'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-8`}
                    editable={editable}
                />

                <div className={showDividers ? 'divide-y divide-gray-200' : 'space-y-6'}>
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
                                <div className={`flex items-center justify-between ${showDividers ? 'py-5' : 'py-2'} ${valuePosition === 'left' ? 'flex-row-reverse' : ''}`}>
                                    <div className={valuePosition === 'left' ? 'text-right' : ''}>
                                        <EditableText
                                            value={stat.label}
                                            onChange={(v) => handleChange(i, 'label', v)}
                                            className="text-sm font-medium text-gray-800"
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={stat.description}
                                            onChange={(v) => handleChange(i, 'description', v)}
                                            className="text-xs text-gray-400 mt-0.5"
                                            editable={editable}
                                        />
                                    </div>
                                    <EditableText
                                        value={stat.value}
                                        onChange={(v) => handleChange(i, 'value', v)}
                                        as="span"
                                        className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-900`}
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

export const StatsListFamily: TemplateFamily = {
    id: 'stats-list',
    category: 'stats',
    name: 'Stats List',
    description: 'Vertical list format with labels and values',
    tags: ['stats', 'list', 'vertical'],
    Canvas,
    controlsDef: [
        { key: 'valuePosition', label: 'Value Side', type: 'toggle-group', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], defaultValue: 'right' },
        { key: 'showDividers', label: 'Dividers', type: 'switch', defaultValue: true },
    ],
    defaultControls: { valuePosition: 'right', showDividers: true },
    defaultContent: {
        heading: 'Our Impact',
        stats: [
            { value: '2.5M', label: 'Users Served', description: 'Monthly active users' },
            { value: '$4.2B', label: 'Revenue Generated', description: 'For our clients' },
            { value: '150+', label: 'Team Members', description: 'Across 20 countries' },
            { value: '99.9%', label: 'Uptime', description: 'Service reliability' },
        ],
    },
}
