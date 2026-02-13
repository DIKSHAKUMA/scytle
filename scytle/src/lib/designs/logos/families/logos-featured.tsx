'use client'

/**
 * Logos Featured Family — Featured partner with additional row of logos.
 *
 * Controls:
 * - showDescription: boolean
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
    const showDescription = controls?.showDescription !== false
    const logos = (content?.logos as Array<{ name: string }>) || []
    const itemCount = logos.length

    const gridCols = isMobile ? 3 : isTablet ? 4 : Math.min(itemCount, 6)

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
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Partners'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Featured partners'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    {showDescription && (
                        <EditableText
                            value={(content?.description as string) || 'We work with the best companies to deliver exceptional results.'}
                            onChange={(v) => onContentChange?.('description', v)}
                            as="p"
                            className="text-gray-500 mt-3"
                            editable={editable}
                            multiline
                        />
                    )}
                </div>

                {/* Featured Logo */}
                <div className="flex justify-center mb-10">
                    <div className={`${isMobile ? 'h-12 w-32' : 'h-16 w-48'} bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center`}>
                        <EditableText
                            value={(content?.featuredName as string) || 'Featured Partner'}
                            onChange={(v) => onContentChange?.('featuredName', v)}
                            className="text-sm text-gray-400 font-medium"
                            editable={editable}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mb-8" />

                {/* Secondary logos row */}
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
                </div>
            </div>
        </section>
    )
}

export const LogosFeaturedFamily: TemplateFamily = {
    id: 'logos-featured',
    category: 'logos',
    name: 'Logos Featured',
    description: 'Featured partner logo with secondary logo row',
    tags: ['logos', 'featured', 'partners', 'highlight'],
    Canvas,
    controlsDef: [
        {
            key: 'showDescription',
            label: 'Show Description',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        showDescription: true,
    },
    defaultContent: {
        tagline: 'Partners',
        heading: 'Featured partners',
        description: 'We work with the best companies to deliver exceptional results.',
        featuredName: 'Featured Partner',
        logos: [
            { name: 'Webflow' },
            { name: 'Relume' },
            { name: 'Figma' },
            { name: 'Framer' },
            { name: 'Notion' },
        ],
    },
}
