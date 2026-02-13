'use client'

/**
 * Gallery Numbered Family — Grid with large numbered overlays on each item.
 *
 * Controls:
 * - columns: 2 | 3
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
    const columns = isMobile ? 1 : Number(controls?.columns ?? 2)
    const showCaption = controls?.showCaption !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const handleChange = (i: number, v: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], caption: v }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { caption: 'New image' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 2)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-10 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-6xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Our Portfolio'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-8`}
                    editable={editable}
                />

                <div className={`grid ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-6`}>
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
                                <div className="relative">
                                    <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    {/* Number overlay */}
                                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 border border-gray-200 flex items-center justify-center">
                                        <span className="text-xs font-bold text-gray-700">{String(i + 1).padStart(2, '0')}</span>
                                    </div>
                                    {showCaption && (
                                        <EditableText
                                            value={img.caption}
                                            onChange={(v) => handleChange(i, v)}
                                            className="text-sm text-gray-600 mt-2"
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

export const GalleryNumberedFamily: TemplateFamily = {
    id: 'gallery-numbered',
    category: 'gallery',
    name: 'Gallery Numbered',
    description: 'Grid with numbered overlay badges',
    tags: ['gallery', 'numbered', 'portfolio', 'ordered'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }], defaultValue: '2' },
        { key: 'showCaption', label: 'Caption', type: 'switch', defaultValue: true },
    ],
    defaultControls: { columns: '2', showCaption: true },
    defaultContent: {
        heading: 'Our Portfolio',
        images: [
            { caption: 'Brand Identity Design' },
            { caption: 'Web Application UI' },
            { caption: 'Mobile App Design' },
            { caption: 'Marketing Campaign' },
        ],
    },
    hasImage: true,
}
