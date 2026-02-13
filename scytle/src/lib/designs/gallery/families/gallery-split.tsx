'use client'

/**
 * Gallery Split Family — Two-column split: image on one side, content on the other.
 *
 * Controls:
 * - imagePosition: left | right
 * - showDescription: boolean
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
    const imagePosition = (controls?.imagePosition as string) ?? 'left'
    const showDescription = controls?.showDescription !== false
    const images = (content?.images as Array<{ title: string; description: string }>) || []
    const itemCount = images.length

    const handleChange = (i: number, field: string, value: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], [field]: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { title: 'New Image', description: 'Image description goes here' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 2)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-10 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto space-y-12">
                <EditableText
                    value={(content?.heading as string) || 'Gallery'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center`}
                    editable={editable}
                />
                {images.map((img, i) => {
                    const isReversed = imagePosition === 'right' ? i % 2 === 0 : i % 2 !== 0
                    return (
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
                                <div className={`${isMobile ? 'flex flex-col gap-4' : `grid grid-cols-2 gap-8 ${isReversed ? '' : ''}`}`}>
                                    <div className={`aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center ${!isMobile && isReversed ? 'order-2' : 'order-1'}`}>
                                        <ImageIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <div className={`flex flex-col justify-center ${!isMobile && isReversed ? 'order-1' : 'order-2'}`}>
                                        <EditableText
                                            value={img.title}
                                            onChange={(v) => handleChange(i, 'title', v)}
                                            as="h3"
                                            className="text-xl font-semibold text-gray-900 mb-2"
                                            editable={editable}
                                        />
                                        {showDescription && (
                                            <EditableText
                                                value={img.description}
                                                onChange={(v) => handleChange(i, 'description', v)}
                                                className="text-sm text-gray-500 leading-relaxed"
                                                editable={editable}
                                                multiline
                                            />
                                        )}
                                    </div>
                                </div>
                            </DynamicListItem>
                            {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export const GallerySplitFamily: TemplateFamily = {
    id: 'gallery-split',
    category: 'gallery',
    name: 'Gallery Split',
    description: 'Alternating image-text split layout',
    tags: ['gallery', 'split', 'alternating'],
    Canvas,
    controlsDef: [
        { key: 'imagePosition', label: 'Image Side', type: 'toggle-group', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], defaultValue: 'left' },
        { key: 'showDescription', label: 'Description', type: 'switch', defaultValue: true },
    ],
    defaultControls: { imagePosition: 'left', showDescription: true },
    defaultContent: {
        heading: 'Gallery',
        images: [
            { title: 'Project Alpha', description: 'A stunning visual design project showcasing modern aesthetics and bold color choices.' },
            { title: 'Project Beta', description: 'Clean minimalist approach with focus on typography and whitespace.' },
            { title: 'Project Gamma', description: 'Innovative design combining photography with geometric elements.' },
        ],
    },
    hasImage: true,
}
