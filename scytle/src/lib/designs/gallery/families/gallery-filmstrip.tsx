'use client'

/**
 * Gallery Filmstrip Family — Horizontal scrolling image strip.
 *
 * Controls:
 * - height: short | medium | tall
 * - showCaptions: boolean
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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const height = (controls?.height as string) ?? 'medium'
    const showCaptions = controls?.showCaptions !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const heightClass = height === 'short' ? 'h-40' : height === 'tall' ? 'h-80' : 'h-60'
    const mobileHeight = height === 'short' ? 'h-32' : height === 'tall' ? 'h-56' : 'h-44'

    const handleChange = (index: number, value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], caption: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { caption: 'New image' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(images, index, 2)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-6">
                    <EditableText
                        value={(content?.heading as string) || 'Gallery'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <span className="text-xs text-gray-400">← scroll →</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
                    {images.map((img, i) => (
                        <div key={i} className="flex-shrink-0">
                            {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={itemCount > 2}
                                editable={editable}
                            >
                                <div className={`${isMobile ? mobileHeight : heightClass} aspect-[3/4] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center relative`}>
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                    {showCaptions && (
                                        <div className="absolute bottom-2 left-2 right-2">
                                            <EditableText
                                                value={img.caption}
                                                onChange={(v) => handleChange(i, v)}
                                                className="text-xs text-gray-500 truncate"
                                                editable={editable}
                                            />
                                        </div>
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

export const GalleryFilmstripFamily: TemplateFamily = {
    id: 'gallery-filmstrip',
    category: 'gallery',
    name: 'Gallery Filmstrip',
    description: 'Horizontal scrolling image strip',
    tags: ['gallery', 'filmstrip', 'scroll', 'horizontal'],
    Canvas,
    controlsDef: [
        { key: 'height', label: 'Height', type: 'toggle-group', options: [{ value: 'short', label: 'Short' }, { value: 'medium', label: 'Medium' }, { value: 'tall', label: 'Tall' }], defaultValue: 'medium' },
        { key: 'showCaptions', label: 'Captions', type: 'switch', defaultValue: true },
    ],
    defaultControls: { height: 'medium', showCaptions: true },
    defaultContent: {
        heading: 'Gallery',
        images: [
            { caption: 'Photo 1' }, { caption: 'Photo 2' }, { caption: 'Photo 3' },
            { caption: 'Photo 4' }, { caption: 'Photo 5' }, { caption: 'Photo 6' },
        ],
    },
}
