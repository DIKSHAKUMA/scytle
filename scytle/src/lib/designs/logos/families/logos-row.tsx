'use client'

/**
 * Logos Row Family — Simple horizontal row of logos with editable labels.
 *
 * Controls:
 * - showLabel: boolean
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
    const showLabel = controls?.showLabel === true
    const logos = (content?.logos as Array<{ name: string }>) || []
    const itemCount = logos.length

    const gridCols = isMobile ? 3 : isTablet ? Math.min(itemCount, 5) : itemCount

    const handleLogoChange = (index: number, value: string) => {
        const updated = [...logos]
        updated[index] = { ...updated[index], name: value }
        onContentChange?.('logos', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('logos', insertListItem(logos, index, { name: `Company ${itemCount + 1}` }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(logos, index, 1)
        if (result) onContentChange?.('logos', result)
    }

    return (
        <section className={`${isMobile ? 'py-10 px-4' : isTablet ? 'py-12 px-8' : 'py-14 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-6">
                    <EditableText
                        value={(content?.heading as string) || 'Trusted by industry leaders'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="p"
                        className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}
                        editable={editable}
                    />
                </div>

                <div
                    className="grid items-center gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {logos.map((logo, i) => (
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
                                <div className="flex flex-col items-center gap-1">
                                    <div className="h-8 w-20 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                                        <span className="text-[10px] text-gray-400">Logo</span>
                                    </div>
                                    {showLabel && (
                                        <EditableText
                                            value={logo.name}
                                            onChange={(v) => handleLogoChange(i, v)}
                                            className="text-[9px] text-gray-400"
                                            editable={editable}
                                        />
                                    )}
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

export const LogosRowFamily: TemplateFamily = {
    id: 'logos-row',
    category: 'logos',
    name: 'Logos Row',
    description: 'Simple horizontal row of partner/client logos',
    tags: ['logos', 'partners', 'clients', 'trust'],
    Canvas,
    controlsDef: [
        {
            key: 'showLabel',
            label: 'Show Names',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        showLabel: false,
    },
    defaultContent: {
        heading: 'Trusted by industry leaders',
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
