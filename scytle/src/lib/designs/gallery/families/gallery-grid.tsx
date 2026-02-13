'use client'

/**
 * Gallery Grid Family — Uniform image grid with editable captions.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - gap: tight | normal | loose
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
    const gap = (controls?.gap as string) ?? 'normal'
    const showCaptions = controls?.showCaptions !== false
    const images = (content?.images as Array<{ caption: string }>) || []

    const gridCols = isMobile ? 2 : isTablet ? Math.min(columns, 3) : columns
    const gapClass = gap === 'tight' ? 'gap-1' : gap === 'loose' ? 'gap-6' : 'gap-3'
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
                        value={(content?.heading as string) || 'Image gallery'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Grid */}
                <div
                    className={`grid ${gapClass}`}
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {images.map((image, index) => (
                        <div key={index}>
                            {editable && index === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={index}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(index)}
                                deletable={itemCount > 1}
                                editable={editable}
                            >
                                <div className="aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center rounded">
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                </div>
                                {showCaptions && (
                                    <div className="mt-2">
                                        <EditableText
                                            value={image.caption}
                                            onChange={(value) => handleImageChange(index, value)}
                                            className="text-sm text-gray-500"
                                            editable={editable}
                                        />
                                    </div>
                                )}
                            </DynamicListItem>
                            {editable && <InsertDot onInsert={() => insertItem(index + 1)} />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const GalleryGridFamily: TemplateFamily = {
    id: 'gallery-grid',
    category: 'gallery',
    name: 'Gallery Grid',
    description: 'Uniform image grid with editable captions',
    tags: ['grid', 'images', 'photos', 'gallery'],
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
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'gap',
            label: 'Spacing',
            type: 'toggle-group',
            options: [
                { value: 'tight', label: 'Tight' },
                { value: 'normal', label: 'Normal' },
                { value: 'loose', label: 'Loose' },
            ],
            defaultValue: 'normal',
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
        gap: 'normal',
        showCaptions: true,
    },
    defaultContent: {
        tagline: 'Gallery',
        heading: 'Image gallery',
        images: [
            { caption: 'Professional photography' },
            { caption: 'Creative direction' },
            { caption: 'Brand storytelling' },
            { caption: 'Visual identity' },
            { caption: 'Product showcase' },
            { caption: 'Lifestyle imagery' },
            { caption: 'Editorial content' },
            { caption: 'Digital artworks' },
            { caption: 'Design portfolio' },
        ],
    },
}
