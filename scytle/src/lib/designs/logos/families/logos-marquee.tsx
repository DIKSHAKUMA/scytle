'use client'

/**
 * Logos Marquee Family — Scrolling logo marquee with editable labels.
 *
 * Controls:
 * - rows: 1 | 2
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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const rows = Number(controls?.rows ?? 1)
    const logos = (content?.logos as Array<{ name: string }>) || []
    const itemCount = logos.length

    const visibleCount = isMobile ? 3 : isTablet ? 4 : Math.min(itemCount, 6)
    const visibleLogos = logos.slice(0, visibleCount)

    const handleLogoChange = (index: number, value: string) => {
        const updated = [...logos]
        updated[index] = { ...updated[index], name: value }
        onContentChange?.('logos', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('logos', insertListItem(logos, index, { name: `Brand ${itemCount + 1}` }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(logos, index, 1)
        if (result) onContentChange?.('logos', result)
    }

    return (
        <section className={`${isMobile ? 'py-10 px-4' : isTablet ? 'py-12 px-8' : 'py-14 px-16'} overflow-hidden`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <EditableText
                        value={(content?.heading as string) || 'Backed by the best'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="p"
                        className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
                        editable={editable}
                    />
                </div>

                {Array.from({ length: rows }).map((_, row) => (
                    <div key={row} className={`flex gap-8 items-center justify-center ${row > 0 ? 'mt-4' : ''}`}>
                        <div className="w-8 flex-shrink-0 text-gray-300 text-center text-xs">‹</div>

                        {visibleLogos.map((logo, i) => (
                            <div key={i} className="flex-shrink-0">
                                {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                                <DynamicListItem
                                    index={i}
                                    selectedIndex={selectedIndex}
                                    onSelect={setSelectedIndex}
                                    onDelete={() => removeItem(i)}
                                    deletable={itemCount > 1}
                                    editable={editable}
                                >
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="h-8 w-24 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                                            <EditableText
                                                value={logo.name}
                                                onChange={(v) => handleLogoChange(i, v)}
                                                className="text-[10px] text-gray-400"
                                                editable={editable}
                                            />
                                        </div>
                                    </div>
                                </DynamicListItem>
                                {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                            </div>
                        ))}

                        <div className="w-8 flex-shrink-0 text-gray-300 text-center text-xs">›</div>
                    </div>
                ))}

                <div className="text-center mt-4">
                    <span className="text-[10px] text-gray-300">← scrolling →</span>
                </div>
            </div>
        </section>
    )
}

export const LogosMarqueeFamily: TemplateFamily = {
    id: 'logos-marquee',
    category: 'logos',
    name: 'Logos Marquee',
    description: 'Scrolling logo marquee strip',
    tags: ['logos', 'marquee', 'scroll', 'ticker'],
    Canvas,
    controlsDef: [
        {
            key: 'rows',
            label: 'Rows',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '1',
        },
    ],
    defaultControls: {
        rows: '1',
    },
    defaultContent: {
        heading: 'Backed by the best',
        logos: [
            { name: 'Webflow' },
            { name: 'Relume' },
            { name: 'Figma' },
            { name: 'Framer' },
            { name: 'Notion' },
            { name: 'Linear' },
        ],
    },
}
