'use client'

/**
 * Gallery Stacked Family — Overlapping stacked card layout.
 *
 * Controls:
 * - showCaption: boolean
 * - style: cards | fanned
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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const showCaption = controls?.showCaption !== false
    const style = (controls?.style as string) ?? 'cards'
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const handleChange = (i: number, v: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], caption: v }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { caption: 'New photo' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 2)
        if (result) onContentChange?.('images', result)
    }

    if (isMobile) {
        return (
            <section className="py-10 px-4">
                <EditableText
                    value={(content?.heading as string) || 'Featured'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className="text-xl font-bold text-gray-900 mb-6 text-center"
                    editable={editable}
                />
                <div className="space-y-4">
                    {images.map((img, i) => (
                        <div key={i}>
                            {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem index={i} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onDelete={() => removeItem(i)} deletable={itemCount > 2} editable={editable}>
                                <div className="bg-white shadow-md rounded-lg p-2">
                                    <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                    {showCaption && <EditableText value={img.caption} onChange={(v) => handleChange(i, v)} className="text-xs text-gray-500 mt-2 text-center" editable={editable} />}
                                </div>
                            </DynamicListItem>
                            {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    const getStackTransform = (i: number, total: number) => {
        if (style === 'fanned') {
            const angle = (i - Math.floor(total / 2)) * 8
            return { transform: `rotate(${angle}deg)`, zIndex: total - Math.abs(i - Math.floor(total / 2)) }
        }
        return { transform: `translateY(${i * 12}px) translateX(${i * 12}px)`, zIndex: total - i }
    }

    return (
        <section className="py-20 px-16">
            <div className="max-w-5xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Featured'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className="text-3xl font-bold text-gray-900 mb-12 text-center"
                    editable={editable}
                />

                <div className={`relative ${style === 'fanned' ? 'flex justify-center items-end h-80' : 'h-96'}`}>
                    {images.map((img, i) => {
                        const stackStyle = getStackTransform(i, itemCount)
                        return (
                            <div
                                key={i}
                                className={`${style === 'fanned' ? 'w-48' : 'absolute left-1/2 -translate-x-1/2 w-80'}`}
                                style={stackStyle}
                            >
                                {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                                <DynamicListItem index={i} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onDelete={() => removeItem(i)} deletable={itemCount > 2} editable={editable}>
                                    <div className="bg-white shadow-lg rounded-lg p-3">
                                        <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        {showCaption && <EditableText value={img.caption} onChange={(v) => handleChange(i, v)} className="text-sm text-gray-500 mt-2 text-center" editable={editable} />}
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

export const GalleryStackedFamily: TemplateFamily = {
    id: 'gallery-stacked',
    category: 'gallery',
    name: 'Gallery Stacked',
    description: 'Overlapping stacked card layout',
    tags: ['gallery', 'stacked', 'cards', 'overlay'],
    Canvas,
    controlsDef: [
        { key: 'style', label: 'Style', type: 'toggle-group', options: [{ value: 'cards', label: 'Cards' }, { value: 'fanned', label: 'Fanned' }], defaultValue: 'cards' },
        { key: 'showCaption', label: 'Caption', type: 'switch', defaultValue: true },
    ],
    defaultControls: { style: 'cards', showCaption: true },
    defaultContent: {
        heading: 'Featured',
        images: [
            { caption: 'Award Winner' },
            { caption: 'Staff Pick' },
            { caption: 'Featured Work' },
            { caption: 'New Release' },
        ],
    },
    hasImage: true,
}
