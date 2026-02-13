'use client'

/**
 * Gallery Fullwidth Family — Full-bleed stacked images.
 *
 * Controls:
 * - spacing: none | small | large
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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const spacing = (controls?.spacing as string) ?? 'small'
    const showCaptions = controls?.showCaptions !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const gapClass = spacing === 'none' ? 'gap-0' : spacing === 'large' ? 'gap-8' : 'gap-4'

    const handleChange = (index: number, value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], caption: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { caption: 'New image' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(images, index, 1)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section>
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
                            <div className={`w-full ${isMobile ? 'aspect-[4/3]' : 'aspect-[21/9]'} bg-gray-100 border-y border-gray-200 flex items-center justify-center relative`}>
                                <ImageIcon className={`${isMobile ? 'w-10 h-10' : 'w-16 h-16'} text-gray-300`} />
                                {showCaptions && (
                                    <div className="absolute bottom-4 left-6">
                                        <EditableText
                                            value={img.caption}
                                            onChange={(v) => handleChange(i, v)}
                                            className="text-sm text-gray-500 font-medium"
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
        </section>
    )
}

export const GalleryFullwidthFamily: TemplateFamily = {
    id: 'gallery-fullwidth',
    category: 'gallery',
    name: 'Gallery Fullwidth',
    description: 'Full-bleed stacked images',
    tags: ['gallery', 'fullwidth', 'bleed', 'stacked'],
    Canvas,
    controlsDef: [
        { key: 'spacing', label: 'Spacing', type: 'toggle-group', options: [{ value: 'none', label: 'None' }, { value: 'small', label: 'Small' }, { value: 'large', label: 'Large' }], defaultValue: 'small' },
        { key: 'showCaptions', label: 'Captions', type: 'switch', defaultValue: true },
    ],
    defaultControls: { spacing: 'small', showCaptions: true },
    defaultContent: {
        images: [
            { caption: 'Full-width image 1' },
            { caption: 'Full-width image 2' },
            { caption: 'Full-width image 3' },
        ],
    },
}
