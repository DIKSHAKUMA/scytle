'use client'

/**
 * Stats Infographic Family — Visual stats with colored backgrounds.
 *
 * Controls:
 * - style: gradient | solid | outline
 * - columns: 2 | 3
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
    const style = (controls?.style as string) ?? 'gradient'
    const columns = isMobile ? 1 : Number(controls?.columns ?? 2)
    const stats = (content?.stats as Array<{ value: string; label: string; description: string }>) || []
    const itemCount = stats.length

    const bgStyles = [
        style === 'gradient' ? 'bg-gradient-to-br from-gray-100 to-gray-200' : style === 'solid' ? 'bg-gray-900 text-white' : 'border-2 border-gray-200',
        style === 'gradient' ? 'bg-gradient-to-br from-gray-200 to-gray-300' : style === 'solid' ? 'bg-gray-800 text-white' : 'border-2 border-gray-300',
        style === 'gradient' ? 'bg-gradient-to-br from-gray-50 to-gray-150' : style === 'solid' ? 'bg-gray-700 text-white' : 'border-2 border-gray-400',
    ]

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...stats]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, { value: '0', label: 'New Stat', description: 'Description here' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 2)
        if (result) onContentChange?.('stats', result)
    }

    const colClass = columns === 3 ? 'grid-cols-3' : 'grid-cols-2'

    return (
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-5xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Results That Speak'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-4`}
                    editable={editable}
                />
                <EditableText
                    value={(content?.subheading as string) || 'Measurable outcomes across every dimension'}
                    onChange={(v) => onContentChange?.('subheading', v)}
                    className="text-sm text-gray-500 text-center mb-10"
                    editable={editable}
                />

                <div className={`grid ${colClass} gap-6`}>
                    {stats.map((stat, i) => {
                        const isWhiteText = style === 'solid'
                        return (
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
                                    <div className={`${bgStyles[i % bgStyles.length]} rounded-xl p-8`}>
                                        <EditableText
                                            value={stat.value}
                                            onChange={(v) => handleChange(i, 'value', v)}
                                            as="span"
                                            className={`block ${isMobile ? 'text-3xl' : 'text-4xl'} font-black ${isWhiteText ? 'text-white' : 'text-gray-900'}`}
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={stat.label}
                                            onChange={(v) => handleChange(i, 'label', v)}
                                            className={`text-sm font-medium mt-2 ${isWhiteText ? 'text-white/80' : 'text-gray-700'}`}
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={stat.description}
                                            onChange={(v) => handleChange(i, 'description', v)}
                                            className={`text-xs mt-1 ${isWhiteText ? 'text-white/60' : 'text-gray-400'}`}
                                            editable={editable}
                                        />
                                    </div>
                                </DynamicListItem>
                                {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export const StatsInfographicFamily: TemplateFamily = {
    id: 'stats-infographic',
    category: 'stats',
    name: 'Stats Infographic',
    description: 'Visual stats with colored backgrounds',
    tags: ['stats', 'infographic', 'visual', 'colored'],
    Canvas,
    controlsDef: [
        { key: 'style', label: 'Style', type: 'toggle-group', options: [{ value: 'gradient', label: 'Gradient' }, { value: 'solid', label: 'Solid' }, { value: 'outline', label: 'Outline' }], defaultValue: 'gradient' },
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }], defaultValue: '2' },
    ],
    defaultControls: { style: 'gradient', columns: '2' },
    defaultContent: {
        heading: 'Results That Speak',
        subheading: 'Measurable outcomes across every dimension',
        stats: [
            { value: '10x', label: 'Faster Development', description: 'Compared to traditional methods' },
            { value: '60%', label: 'Cost Reduction', description: 'Average savings for clients' },
            { value: '3M+', label: 'Users Impacted', description: 'Across all platforms' },
            { value: '200+', label: 'Enterprise Clients', description: 'Fortune 500 companies' },
        ],
    },
}
