'use client'

/**
 * Stats Timeline Family — Stats displayed on a vertical timeline.
 *
 * Controls:
 * - linePosition: left | center
 * - showDate: boolean
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
    const linePosition = (controls?.linePosition as string) ?? 'left'
    const showDate = controls?.showDate !== false
    const stats = (content?.stats as Array<{ value: string; label: string; date: string }>) || []
    const itemCount = stats.length

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...stats]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('stats', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('stats', insertListItem(stats, i, { value: '0', label: 'New Milestone', date: '2024' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(stats, i, 2)
        if (result) onContentChange?.('stats', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-16'}`}>
            <div className={`${linePosition === 'center' && !isMobile ? 'max-w-5xl' : 'max-w-3xl'} mx-auto`}>
                <EditableText
                    value={(content?.heading as string) || 'Milestones'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-12`}
                    editable={editable}
                />

                <div className="relative">
                    {/* Vertical line */}
                    <div className={`absolute top-0 bottom-0 w-px bg-gray-200 ${linePosition === 'center' && !isMobile ? 'left-1/2' : 'left-4'}`} />

                    <div className="space-y-10">
                        {stats.map((stat, i) => {
                            const isRight = linePosition === 'center' && !isMobile && i % 2 !== 0
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
                                        <div className={`relative ${linePosition === 'center' && !isMobile ? `flex ${isRight ? 'justify-end' : ''} w-full` : 'pl-12'}`}>
                                            {/* Dot */}
                                            <div className={`absolute w-3 h-3 bg-gray-800 rounded-full border-2 border-white ${linePosition === 'center' && !isMobile ? 'left-1/2 -translate-x-1/2 top-2' : 'left-2.5 top-2'}`} />

                                            <div className={`${linePosition === 'center' && !isMobile ? `w-[45%] ${isRight ? 'text-left pl-8' : 'text-right pr-8'}` : ''}`}>
                                                {showDate && (
                                                    <EditableText
                                                        value={stat.date}
                                                        onChange={(v) => handleChange(i, 'date', v)}
                                                        className="text-xs text-gray-400 uppercase tracking-wide mb-1"
                                                        editable={editable}
                                                    />
                                                )}
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
                                        </div>
                                    </DynamicListItem>
                                    {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export const StatsTimelineFamily: TemplateFamily = {
    id: 'stats-timeline',
    category: 'stats',
    name: 'Stats Timeline',
    description: 'Stats displayed on a vertical timeline',
    tags: ['stats', 'timeline', 'milestones', 'history'],
    Canvas,
    controlsDef: [
        { key: 'linePosition', label: 'Line', type: 'toggle-group', options: [{ value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }], defaultValue: 'left' },
        { key: 'showDate', label: 'Dates', type: 'switch', defaultValue: true },
    ],
    defaultControls: { linePosition: 'left', showDate: true },
    defaultContent: {
        heading: 'Milestones',
        stats: [
            { value: '$1M', label: 'First million in ARR', date: '2020' },
            { value: '100K', label: 'Users milestone reached', date: '2021' },
            { value: 'Series B', label: '$25M funding round closed', date: '2022' },
            { value: '1M+', label: 'Active users worldwide', date: '2023' },
            { value: '$100M', label: 'Annual revenue target hit', date: '2024' },
        ],
    },
}
