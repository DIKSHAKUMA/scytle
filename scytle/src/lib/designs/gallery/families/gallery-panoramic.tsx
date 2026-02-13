'use client'

/**
 * Gallery Panoramic Family — Wide landscape-format images stacked.
 *
 * Controls:
 * - spacing: none | normal | loose
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
    const spacing = (controls?.spacing as string) ?? 'normal'
    const showCaption = controls?.showCaption !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const gapClass = spacing === 'none' ? 'gap-0' : spacing === 'loose' ? 'gap-10' : 'gap-6'

    const handleChange = (i: number, v: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], caption: v }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { caption: 'Panoramic view' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 1)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-10 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Panoramic Views'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 mb-8`}
                    editable={editable}
                />

                <div className={`flex flex-col ${gapClass}`}>
                    {images.map((img, i) => (
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
                                <div>
                                    <div className={`${isMobile ? 'aspect-[2/1]' : 'aspect-[21/9]'} bg-gray-100 border border-gray-200 ${spacing === 'none' ? '' : 'rounded-lg'} flex items-center justify-center`}>
                                        <ImageIcon className="w-10 h-10 text-gray-300" />
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

export const GalleryPanoramicFamily: TemplateFamily = {
    id: 'gallery-panoramic',
    category: 'gallery',
    name: 'Gallery Panoramic',
    description: 'Ultra-wide landscape format images',
    tags: ['gallery', 'panoramic', 'landscape', 'wide'],
    Canvas,
    controlsDef: [
        { key: 'spacing', label: 'Spacing', type: 'toggle-group', options: [{ value: 'none', label: 'None' }, { value: 'normal', label: 'Normal' }, { value: 'loose', label: 'Loose' }], defaultValue: 'normal' },
        { key: 'showCaption', label: 'Caption', type: 'switch', defaultValue: true },
    ],
    defaultControls: { spacing: 'normal', showCaption: true },
    defaultContent: {
        heading: 'Panoramic Views',
        images: [
            { caption: 'Mountain range at sunrise' },
            { caption: 'Coastal highway from above' },
            { caption: 'City skyline at dusk' },
        ],
    },
    hasImage: true,
}
