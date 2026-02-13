'use client'

/**
 * Stats Split Family — Stats on one side, text/image on the other.
 *
 * Controls:
 * - statsPlacement: left | right
 * - showImage: boolean
 */

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
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
    const statsPlacement = (controls?.statsPlacement as string) ?? 'left'
    const showImage = controls?.showImage !== false
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const stats = (content?.stats as Array<{ value: string; label: string }>) || []
    const itemCount = stats.length

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

    const statsBlock = (
        <div className="space-y-6">
            <div>
                <EditableText
                    value={(content?.heading as string) || 'Trusted by thousands'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                    editable={editable}
                />
                <EditableText
                    value={(content?.subheading as string) || 'Our numbers speak for themselves.'}
                    onChange={(v) => onContentChange?.('subheading', v)}
                    as="p"
                    className={`text-gray-500 mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}
                    editable={editable}
                    multiline
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                            <div className="py-2">
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
                                    className="text-sm text-gray-500 mt-0.5"
                                    editable={editable}
                                />
                            </div>
                        </DynamicListItem>
                        {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                    </div>
                ))}
            </div>
        </div>
    )

    const mediaBlock = showImage ? (
        <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <ImageIcon className="w-12 h-12 text-gray-300" />
        </div>
    ) : (
        <div className="aspect-[4/3] bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
            <EditableText
                value={(content?.mediaText as string) || 'Additional context or description about the company and its achievements.'}
                onChange={(v) => onContentChange?.('mediaText', v)}
                className="text-sm text-gray-400 text-center px-6"
                editable={editable}
                multiline
            />
        </div>
    )

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`flex ${isMobile ? 'flex-col gap-8' : 'gap-12 items-center'}`}>
                    {statsPlacement === 'left' ? (
                        <>
                            <div className={isMobile ? 'w-full' : 'flex-1'}>{statsBlock}</div>
                            <div className={isMobile ? 'w-full' : 'flex-1'}>{mediaBlock}</div>
                        </>
                    ) : (
                        <>
                            <div className={isMobile ? 'w-full' : 'flex-1'}>{mediaBlock}</div>
                            <div className={isMobile ? 'w-full' : 'flex-1'}>{statsBlock}</div>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export const StatsSplitFamily: TemplateFamily = {
    id: 'stats-split',
    category: 'stats',
    name: 'Stats Split',
    description: 'Stats alongside image or text',
    tags: ['stats', 'split', 'numbers', 'image'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'statsPlacement',
            label: 'Stats Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
            ],
            defaultValue: 'left',
        },
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        statsPlacement: 'left',
        showImage: true,
    },
    defaultContent: {
        heading: 'Trusted by thousands',
        subheading: 'Our numbers speak for themselves.',
        mediaText: 'Additional context or description about the company and its achievements.',
        stats: [
            { value: '10K+', label: 'Customers' },
            { value: '50+', label: 'Countries' },
            { value: '99.9%', label: 'Uptime' },
        ],
    },
}
