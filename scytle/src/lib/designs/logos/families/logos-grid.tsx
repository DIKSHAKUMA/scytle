'use client'

/**
 * Logos Grid Family — Logo cards in a grid layout with editable names.
 *
 * Controls:
 * - columns: 3 | 4 | 5
 * - showBorder: boolean
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
    const columns = Number(controls?.columns ?? 4)
    const showBorder = controls?.showBorder !== false
    const logos = (content?.logos as Array<{ name: string }>) || []
    const itemCount = logos.length

    const gridCols = isMobile ? 2 : isTablet ? 3 : columns

    const handleLogoChange = (index: number, value: string) => {
        const updated = [...logos]
        updated[index] = { ...updated[index], name: value }
        onContentChange?.('logos', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('logos', insertListItem(logos, index, { name: `Partner ${itemCount + 1}` }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(logos, index, 1)
        if (result) onContentChange?.('logos', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Partners'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Our partners'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                <div
                    className="grid gap-4"
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
                                <div
                                    className={`aspect-[3/2] flex flex-col items-center justify-center rounded gap-2 ${showBorder ? 'border border-gray-200' : ''} bg-gray-50`}
                                >
                                    <div className="h-8 w-20 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                                        <span className="text-[10px] text-gray-400">Logo</span>
                                    </div>
                                    <EditableText
                                        value={logo.name}
                                        onChange={(v) => handleLogoChange(i, v)}
                                        className="text-[10px] text-gray-400"
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

export const LogosGridFamily: TemplateFamily = {
    id: 'logos-grid',
    category: 'logos',
    name: 'Logos Grid',
    description: 'Logo cards in a grid layout',
    tags: ['logos', 'grid', 'partners', 'clients'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
            defaultValue: '4',
        },
        {
            key: 'showBorder',
            label: 'Card Border',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '4',
        showBorder: true,
    },
    defaultContent: {
        tagline: 'Partners',
        heading: 'Our partners',
        logos: [
            { name: 'Webflow' },
            { name: 'Relume' },
            { name: 'Figma' },
            { name: 'Framer' },
            { name: 'Notion' },
            { name: 'Linear' },
            { name: 'Vercel' },
            { name: 'Stripe' },
        ],
    },
}
