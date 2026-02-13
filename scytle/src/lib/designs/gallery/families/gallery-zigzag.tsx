'use client'

/**
 * Gallery Zigzag Family — Alternating left-right zigzag layout.
 *
 * Controls:
 * - imageSize: small | medium | large
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
    const imageSize = (controls?.imageSize as string) ?? 'medium'
    const showCaption = controls?.showCaption !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const sizeClass = imageSize === 'large' ? 'col-span-8' : imageSize === 'small' ? 'col-span-4' : 'col-span-6'
    const offsetClass = imageSize === 'large' ? 'col-span-8' : imageSize === 'small' ? 'col-span-4 col-start-9' : 'col-span-6 col-start-7'

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
                    value={(content?.heading as string) || 'Portfolio'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-10`}
                    editable={editable}
                />

                <div className={`${isMobile ? 'space-y-6' : 'grid grid-cols-12 gap-y-8'}`}>
                    {images.map((img, i) => (
                        <div key={i} className={isMobile ? '' : (i % 2 === 0 ? sizeClass : offsetClass)}>
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
                                    <div className="aspect-[16/10] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    {showCaption && (
                                        <EditableText
                                            value={img.caption}
                                            onChange={(v) => handleChange(i, v)}
                                            className="text-sm text-gray-500 mt-2"
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

export const GalleryZigzagFamily: TemplateFamily = {
    id: 'gallery-zigzag',
    category: 'gallery',
    name: 'Gallery Zigzag',
    description: 'Alternating left-right zigzag layout',
    tags: ['gallery', 'zigzag', 'alternating'],
    Canvas,
    controlsDef: [
        { key: 'imageSize', label: 'Image Size', type: 'toggle-group', options: [{ value: 'small', label: 'S' }, { value: 'medium', label: 'M' }, { value: 'large', label: 'L' }], defaultValue: 'medium' },
        { key: 'showCaption', label: 'Caption', type: 'switch', defaultValue: true },
    ],
    defaultControls: { imageSize: 'medium', showCaption: true },
    defaultContent: {
        heading: 'Portfolio',
        images: [
            { caption: 'Web Design Project' },
            { caption: 'Mobile App Interface' },
            { caption: 'Brand Identity System' },
            { caption: 'Marketing Campaign' },
        ],
    },
    hasImage: true,
}
