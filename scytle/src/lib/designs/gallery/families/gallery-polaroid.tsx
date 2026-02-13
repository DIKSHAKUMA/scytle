'use client'

/**
 * Gallery Polaroid Family — Polaroid-style cards with white borders and captions.
 *
 * Controls:
 * - columns: 2 | 3
 * - tilt: boolean
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
    const tilt = controls?.tilt !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const tilts = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', '-rotate-1', 'rotate-1']

    const handleChange = (i: number, v: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], caption: v }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { caption: 'Memory' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 2)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-10 px-4' : 'py-20 px-16'} bg-gray-50`}>
            <div className="max-w-6xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Memories'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-10`}
                    editable={editable}
                />

                <div className={`grid ${columns === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-8`}>
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
                                <div className={`bg-white p-3 pb-8 shadow-md rounded-sm ${tilt ? tilts[i % tilts.length] : ''} transition-transform hover:rotate-0`}>
                                    <div className="aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center mb-3">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <EditableText
                                        value={img.caption}
                                        onChange={(v) => handleChange(i, v)}
                                        className="text-sm text-gray-600 text-center italic"
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

export const GalleryPolaroidFamily: TemplateFamily = {
    id: 'gallery-polaroid',
    category: 'gallery',
    name: 'Gallery Polaroid',
    description: 'Polaroid-style image cards with tilted rotation',
    tags: ['gallery', 'polaroid', 'photo', 'vintage'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }], defaultValue: '3' },
        { key: 'tilt', label: 'Tilt', type: 'switch', defaultValue: true },
    ],
    defaultControls: { columns: '3', tilt: true },
    defaultContent: {
        heading: 'Memories',
        images: [
            { caption: 'Summer vibes' },
            { caption: 'City lights' },
            { caption: 'Mountain top' },
            { caption: 'Ocean waves' },
            { caption: 'Golden hour' },
            { caption: 'Night sky' },
        ],
    },
    hasImage: true,
}
