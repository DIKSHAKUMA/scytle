'use client'

/**
 * Stats Comparison Family — Before/after comparison stats side by side.
 *
 * Controls:
 * - layout: side | stacked
 * - showLabels: boolean
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
    const layout = (controls?.layout as string) ?? 'side'
    const showLabels = controls?.showLabels !== false
    const stats = (content?.stats as Array<{ label: string; before: string; after: string }>) || []
    const itemCount = stats.length

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...stats]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, { label: 'New Metric', before: '0', after: '100' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 2)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-5xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Before & After'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-4`}
                    editable={editable}
                />
                <EditableText
                    value={(content?.subheading as string) || 'See the impact of our solution'}
                    onChange={(v) => onContentChange?.('subheading', v)}
                    className="text-sm text-gray-500 text-center mb-10"
                    editable={editable}
                />

                {showLabels && (
                    <div className={`${isMobile || layout === 'stacked' ? 'hidden' : 'grid grid-cols-3 gap-6 mb-4'}`}>
                        <div className="text-sm font-medium text-gray-400">Metric</div>
                        <div className="text-sm font-medium text-gray-400 text-center">Before</div>
                        <div className="text-sm font-medium text-gray-400 text-center">After</div>
                    </div>
                )}

                <div className="space-y-4">
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
                                <div className={`${isMobile || layout === 'stacked' ? 'space-y-2' : 'grid grid-cols-3 gap-6 items-center'} border border-gray-100 rounded-lg p-4`}>
                                    <EditableText
                                        value={stat.label}
                                        onChange={(v) => handleChange(i, 'label', v)}
                                        className="text-sm font-medium text-gray-700"
                                        editable={editable}
                                    />
                                    <div className={`${isMobile || layout === 'stacked' ? 'flex gap-4' : 'text-center'}`}>
                                        {(isMobile || layout === 'stacked') && <span className="text-xs text-gray-400">Before:</span>}
                                        <EditableText
                                            value={stat.before}
                                            onChange={(v) => handleChange(i, 'before', v)}
                                            className="text-lg font-semibold text-gray-400"
                                            editable={editable}
                                        />
                                    </div>
                                    <div className={`${isMobile || layout === 'stacked' ? 'flex gap-4' : 'text-center'}`}>
                                        {(isMobile || layout === 'stacked') && <span className="text-xs text-gray-400">After:</span>}
                                        <EditableText
                                            value={stat.after}
                                            onChange={(v) => handleChange(i, 'after', v)}
                                            className="text-lg font-bold text-green-600"
                                            editable={editable}
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

export const StatsComparisonFamily: TemplateFamily = {
    id: 'stats-comparison',
    category: 'stats',
    name: 'Stats Comparison',
    description: 'Before/after comparison metrics',
    tags: ['stats', 'comparison', 'before', 'after'],
    Canvas,
    controlsDef: [
        { key: 'layout', label: 'Layout', type: 'toggle-group', options: [{ value: 'side', label: 'Side' }, { value: 'stacked', label: 'Stacked' }], defaultValue: 'side' },
        { key: 'showLabels', label: 'Labels', type: 'switch', defaultValue: true },
    ],
    defaultControls: { layout: 'side', showLabels: true },
    defaultContent: {
        heading: 'Before & After',
        subheading: 'See the impact of our solution',
        stats: [
            { label: 'Page Load Time', before: '4.2s', after: '0.8s' },
            { label: 'Conversion Rate', before: '2.1%', after: '7.8%' },
            { label: 'Customer Retention', before: '65%', after: '94%' },
            { label: 'Revenue Growth', before: '$120K', after: '$890K' },
        ],
    },
}
