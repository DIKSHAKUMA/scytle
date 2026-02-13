'use client'

/**
 * Gallery Minimal Family — Clean minimal gallery with generous whitespace.
 *
 * Controls:
 * - columns: 1 | 2
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

    const handleChange = (i: number, value: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], caption: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { caption: 'New image' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 1)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-16 px-4' : 'py-24 px-16'}`}>
            <div className="max-w-5xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Selected Work'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-2xl'} font-light text-gray-800 mb-12 tracking-wide`}
                    editable={editable}
                />

                <div className={`grid ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'} gap-12`}>
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
                                    <div className="aspect-[3/2] bg-gray-50 border border-gray-100 rounded flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-200" />
                                    </div>
                                    {showCaption && (
                                        <EditableText
                                            value={img.caption}
                                            onChange={(v) => handleChange(i, v)}
                                            className="text-xs text-gray-400 mt-3 tracking-wide"
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

export const GalleryMinimalFamily: TemplateFamily = {
    id: 'gallery-minimal',
    category: 'gallery',
    name: 'Gallery Minimal',
    description: 'Clean minimal gallery with generous whitespace',
    tags: ['gallery', 'minimal', 'clean', 'whitespace'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '1', label: '1' }, { value: '2', label: '2' }], defaultValue: '2' },
        { key: 'showCaption', label: 'Caption', type: 'switch', defaultValue: true },
    ],
    defaultControls: { columns: '2', showCaption: true },
    defaultContent: {
        heading: 'Selected Work',
        images: [
            { caption: 'Untitled I — 2024' },
            { caption: 'Untitled II — 2024' },
            { caption: 'Untitled III — 2024' },
            { caption: 'Untitled IV — 2024' },
        ],
    },
    hasImage: true,
}
