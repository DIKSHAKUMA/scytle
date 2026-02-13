'use client'

/**
 * Gallery With Text Family — Large images paired with titles/descriptions.
 *
 * Controls:
 * - layout: side | below
 * - imagePosition: left | right (only for side layout)
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
    const layout = (controls?.layout as string) ?? 'side'
    const imagePosition = (controls?.imagePosition as string) ?? 'left'
    const images = (content?.images as Array<{ title: string; description: string }>) || []
    const itemCount = images.length

    const handleChange = (index: number, field: 'title' | 'description', value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { title: 'New Project', description: 'Project description goes here.' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(images, index, 1)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <EditableText
                        value={(content?.heading as string) || 'Portfolio'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                <div className="space-y-12">
                    {images.map((img, i) => {
                        const imgLeft = imagePosition === 'left' ? i % 2 === 0 : i % 2 !== 0

                        return (
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
                                    {layout === 'side' && !isMobile ? (
                                        <div className={`flex gap-8 items-center ${!imgLeft ? 'flex-row-reverse' : ''}`}>
                                            <div className="flex-1 aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-12 h-12 text-gray-300" />
                                            </div>
                                            <div className="flex-1 space-y-3">
                                                <EditableText
                                                    value={img.title}
                                                    onChange={(v) => handleChange(i, 'title', v)}
                                                    as="h3"
                                                    className="text-xl font-semibold text-gray-900"
                                                    editable={editable}
                                                />
                                                <EditableText
                                                    value={img.description}
                                                    onChange={(v) => handleChange(i, 'description', v)}
                                                    className="text-gray-500"
                                                    editable={editable}
                                                    multiline
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className={`w-full ${isMobile ? 'aspect-[4/3]' : 'aspect-[16/9]'} bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center`}>
                                                <ImageIcon className="w-12 h-12 text-gray-300" />
                                            </div>
                                            <div className="space-y-2">
                                                <EditableText
                                                    value={img.title}
                                                    onChange={(v) => handleChange(i, 'title', v)}
                                                    as="h3"
                                                    className={`font-semibold text-gray-900 ${isMobile ? 'text-lg' : 'text-xl'}`}
                                                    editable={editable}
                                                />
                                                <EditableText
                                                    value={img.description}
                                                    onChange={(v) => handleChange(i, 'description', v)}
                                                    className="text-gray-500"
                                                    editable={editable}
                                                    multiline
                                                />
                                            </div>
                                        </div>
                                    )}
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

export const GalleryWithTextFamily: TemplateFamily = {
    id: 'gallery-with-text',
    category: 'gallery',
    name: 'Gallery with Text',
    description: 'Images paired with titles and descriptions',
    tags: ['gallery', 'text', 'portfolio', 'descriptions'],
    Canvas,
    controlsDef: [
        { key: 'layout', label: 'Layout', type: 'toggle-group', options: [{ value: 'side', label: 'Side' }, { value: 'below', label: 'Below' }], defaultValue: 'side' },
        { key: 'imagePosition', label: 'Image', type: 'toggle-group', options: [{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }], defaultValue: 'left' },
    ],
    defaultControls: { layout: 'side', imagePosition: 'left' },
    defaultContent: {
        heading: 'Portfolio',
        images: [
            { title: 'Project Alpha', description: 'A comprehensive redesign of the entire platform experience.' },
            { title: 'Project Beta', description: 'Brand identity and visual design system for a fintech startup.' },
            { title: 'Project Gamma', description: 'E-commerce platform with integrated payment processing.' },
        ],
    },
}
