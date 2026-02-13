'use client'

/**
 * Gallery Portrait Family — Tall portrait-oriented gallery items.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - showCaption: boolean
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
    const columns = isMobile ? 2 : Number(controls?.columns ?? 3)
    const showCaption = controls?.showCaption !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const handleChange = (i: number, v: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], caption: v }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { caption: 'Portrait image' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 2)
        if (result) onContentChange?.('images', result)
    }

    const colClass = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'

    return (
        <section className={`${isMobile ? 'py-10 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-6xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Portraits'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-8`}
                    editable={editable}
                />

                <div className={`grid ${colClass} gap-4`}>
                    {images.map((img, i) => (
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
                                    <div className="aspect-[2/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    {showCaption && (
                                        <EditableText
                                            value={img.caption}
                                            onChange={(v) => handleChange(i, v)}
                                            className="text-xs text-gray-500 mt-2 text-center"
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

export const GalleryPortraitFamily: TemplateFamily = {
    id: 'gallery-portrait',
    category: 'gallery',
    name: 'Gallery Portrait',
    description: 'Tall portrait-oriented gallery items',
    tags: ['gallery', 'portrait', 'vertical', 'tall'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], defaultValue: '3' },
        { key: 'showCaption', label: 'Caption', type: 'switch', defaultValue: true },
    ],
    defaultControls: { columns: '3', showCaption: true },
    defaultContent: {
        heading: 'Portraits',
        images: [
            { caption: 'Model A' },
            { caption: 'Model B' },
            { caption: 'Model C' },
            { caption: 'Model D' },
            { caption: 'Model E' },
            { caption: 'Model F' },
        ],
    },
    hasImage: true,
}
