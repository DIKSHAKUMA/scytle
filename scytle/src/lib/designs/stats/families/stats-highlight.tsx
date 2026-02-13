'use client'

/**
 * Stats Highlight Family — One large hero stat with supporting smaller stats.
 *
 * Controls:
 * - heroAlignment: center | left
 * - showSupporting: boolean
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
    const heroAlignment = (controls?.heroAlignment as string) ?? 'center'
    const showSupporting = controls?.showSupporting !== false
    const heroValue = (content?.heroValue as string) || '99.9%'
    const heroLabel = (content?.heroLabel as string) || 'Uptime'
    const supporting = (content?.supporting as Array<{ value: string; label: string }>) || []
    const itemCount = supporting.length

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...supporting]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('supporting', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('supporting', insertListItem(supporting, i, { value: '0', label: 'New Stat' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(supporting, i, 2)
        if (result) onContentChange?.('supporting', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : 'py-20 px-16'}`}>
            <div className={`max-w-5xl mx-auto ${heroAlignment === 'center' ? 'text-center' : ''}`}>
                {/* Hero stat */}
                <div className="mb-12">
                    <EditableText
                        value={heroValue}
                        onChange={(v) => onContentChange?.('heroValue', v)}
                        as="span"
                        className={`block ${isMobile ? 'text-6xl' : 'text-8xl'} font-black text-gray-900 tracking-tighter`}
                        editable={editable}
                    />
                    <EditableText
                        value={heroLabel}
                        onChange={(v) => onContentChange?.('heroLabel', v)}
                        className={`${isMobile ? 'text-lg' : 'text-xl'} font-medium text-gray-500 mt-2`}
                        editable={editable}
                    />
                </div>

                {/* Divider */}
                <div className={`border-t border-gray-200 ${heroAlignment === 'center' ? 'mx-auto max-w-xs' : 'max-w-xs'} mb-10`} />

                {/* Supporting stats */}
                {showSupporting && (
                    <div className={`grid ${isMobile ? 'grid-cols-2' : `grid-cols-${Math.min(supporting.length, 4)}`} gap-8`}>
                        {supporting.map((stat, i) => (
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
                                    <div>
                                        <EditableText
                                            value={stat.value}
                                            onChange={(v) => handleChange(i, 'value', v)}
                                            as="span"
                                            className={`block ${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-gray-800`}
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={stat.label}
                                            onChange={(v) => handleChange(i, 'label', v)}
                                            className="text-sm text-gray-500 mt-1"
                                            editable={editable}
                                        />
                                    </div>
                                </DynamicListItem>
                                {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export const StatsHighlightFamily: TemplateFamily = {
    id: 'stats-highlight',
    category: 'stats',
    name: 'Stats Highlight',
    description: 'Hero stat with smaller supporting metrics',
    tags: ['stats', 'highlight', 'hero', 'featured'],
    Canvas,
    controlsDef: [
        { key: 'heroAlignment', label: 'Align', type: 'toggle-group', options: [{ value: 'center', label: 'Center' }, { value: 'left', label: 'Left' }], defaultValue: 'center' },
        { key: 'showSupporting', label: 'Supporting', type: 'switch', defaultValue: true },
    ],
    defaultControls: { heroAlignment: 'center', showSupporting: true },
    defaultContent: {
        heroValue: '99.9%',
        heroLabel: 'Platform Uptime',
        supporting: [
            { value: '50M+', label: 'Requests/day' },
            { value: '150ms', label: 'Avg. Response' },
            { value: '24/7', label: 'Monitoring' },
        ],
    },
}
