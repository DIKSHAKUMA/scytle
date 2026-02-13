'use client'

/**
 * Logos Split Family — Left heading + right logo grid.
 *
 * Controls:
 * - columns: 2 | 3
 * - headingSide: left | right
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
    const columns = Number(controls?.columns ?? 3)
    const headingSide = (controls?.headingSide as string) ?? 'left'
    const logos = (content?.logos as Array<{ name: string }>) || []
    const itemCount = logos.length

    const gridCols = isMobile ? 2 : Math.min(columns, 3)

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

    const headingBlock = (
        <div className="space-y-3">
            <EditableText
                value={(content?.tagline as string) || 'Trusted by'}
                onChange={(v) => onContentChange?.('tagline', v)}
                as="p"
                className="text-sm text-gray-400 uppercase tracking-wide"
                editable={editable}
            />
            <EditableText
                value={(content?.heading as string) || 'Join 250+ companies using our platform'}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h2"
                className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}
                editable={editable}
                multiline
            />
            <EditableText
                value={(content?.description as string) || 'From startups to enterprises, teams trust us to power their workflow.'}
                onChange={(v) => onContentChange?.('description', v)}
                as="p"
                className="text-gray-500 text-sm"
                editable={editable}
                multiline
            />
        </div>
    )

    const logosBlock = (
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
                        <div className="aspect-[3/2] bg-gray-50 border border-gray-200 rounded flex items-center justify-center">
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
    )

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`flex ${isMobile ? 'flex-col gap-8' : 'gap-12 items-center'}`}>
                    {headingSide === 'left' ? (
                        <>
                            <div className={isMobile ? 'w-full' : 'w-2/5'}>{headingBlock}</div>
                            <div className={isMobile ? 'w-full' : 'w-3/5'}>{logosBlock}</div>
                        </>
                    ) : (
                        <>
                            <div className={isMobile ? 'w-full' : 'w-3/5'}>{logosBlock}</div>
                            <div className={isMobile ? 'w-full' : 'w-2/5'}>{headingBlock}</div>
                        </>
                    )}
                </div>
            </div>
        </section>
    )
}

export const LogosSplitFamily: TemplateFamily = {
    id: 'logos-split',
    category: 'logos',
    name: 'Logos Split',
    description: 'Heading alongside logo grid',
    tags: ['logos', 'split', 'partners', 'layout'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '3',
        },
        {
            key: 'headingSide',
            label: 'Heading Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'right', label: 'Right' },
            ],
            defaultValue: 'left',
        },
    ],
    defaultControls: {
        columns: '3',
        headingSide: 'left',
    },
    defaultContent: {
        tagline: 'Trusted by',
        heading: 'Join 250+ companies using our platform',
        description: 'From startups to enterprises, teams trust us to power their workflow.',
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
