'use client'

/**
 * Gallery Masonry Family — Mixed-size image grid with editable captions.
 *
 * Controls:
 * - columns: 2 | 3
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
    const columns = Number(controls?.columns ?? 3)
    const showCaptions = controls?.showCaptions !== false
    const images = (content?.images as Array<{ caption: string }>) || []

    const gridCols = isMobile ? 2 : isTablet ? 2 : columns
    const itemCount = images.length

    const handleImageChange = (index: number, value: string) => {
        const updatedImages = [...images]
        updatedImages[index] = { ...updatedImages[index], caption: value }
        onContentChange?.('images', updatedImages)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { caption: 'New image caption' }))
    }

    const removeItem = (index: number) => {
        const newImages = removeListItem(images, index, 1)
        if (newImages) {
            onContentChange?.('images', newImages)
        }
    }

    // Split items into columns for masonry layout
    const colArrays: Array<Array<{ caption: string; index: number }>> = Array.from(
        { length: gridCols },
        () => []
    )
    images.forEach((img, i) => {
        colArrays[i % gridCols].push({ ...img, index: i })
    })

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Gallery'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Photo gallery'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Masonry Layout */}
                <div className="flex gap-3">
                    {colArrays.map((col, c) => (
                        <div key={c} className="flex-1 space-y-3">
                            {col.map((item) => {
                                const aspectClass =
                                    item.index % 3 === 0
                                        ? 'aspect-[3/4]'
                                        : item.index % 3 === 1
                                          ? 'aspect-square'
                                          : 'aspect-[4/3]'
                                return (
                                    <div key={item.index}>
                                        {editable && <InsertDot onInsert={() => insertItem(item.index)} />}
                                        <DynamicListItem
                                            index={item.index}
                                            selectedIndex={selectedIndex}
                                            onSelect={setSelectedIndex}
                                            onDelete={() => removeItem(item.index)}
                                            deletable={itemCount > 1}
                                            editable={editable}
                                        >
                                            <div
                                                className={`${aspectClass} bg-gray-100 border border-gray-200 flex items-center justify-center rounded`}
                                            >
                                                <ImageIcon className="w-8 h-8 text-gray-300" />
                                            </div>
                                            {showCaptions && (
                                                <div className="mt-2">
                                                    <EditableText
                                                        value={item.caption}
                                                        onChange={(value) =>
                                                            handleImageChange(item.index, value)
                                                        }
                                                        className="text-sm text-gray-500"
                                                        editable={editable}
                                                    />
                                                </div>
                                            )}
                                        </DynamicListItem>
                                    </div>
                                )
                            })}
                            {editable && <InsertDot onInsert={() => insertItem(images.length)} />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const GalleryMasonryFamily: TemplateFamily = {
    id: 'gallery-masonry',
    category: 'gallery',
    name: 'Gallery Masonry',
    description: 'Mixed-size masonry image grid with editable captions',
    tags: ['masonry', 'mixed', 'photos', 'gallery'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showCaptions',
            label: 'Show Captions',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        showCaptions: true,
    },
    defaultContent: {
        tagline: 'Gallery',
        heading: 'Photo gallery',
        images: [
            { caption: 'Modern architecture detail' },
            { caption: 'Urban landscape view' },
            { caption: 'Interior design showcase' },
            { caption: 'Minimalist composition' },
            { caption: 'Natural lighting study' },
            { caption: 'Contemporary art piece' },
            { caption: 'Geometric patterns' },
            { caption: 'Texture and material' },
            { caption: 'Color palette inspiration' },
        ],
    },
}
