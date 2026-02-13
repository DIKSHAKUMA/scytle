'use client'

/**
 * Gallery Carousel Family — Horizontal image carousel with editable captions.
 *
 * Controls:
 * - showArrows: boolean
 * - showDots: boolean
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
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const showArrows = controls?.showArrows !== false
    const showDots = controls?.showDots !== false
    const showCaption = controls?.showCaption === true
    const images = (content?.images as Array<{ title: string; caption: string }>) || []

    const visibleCount = isMobile ? 1 : isTablet ? 2 : 3
    const visibleImages = images.slice(0, visibleCount)
    const itemCount = images.length

    const handleImageChange = (index: number, field: 'title' | 'caption', value: string) => {
        const updatedImages = [...images]
        updatedImages[index] = { ...updatedImages[index], [field]: value }
        onContentChange?.('images', updatedImages)
    }

    const insertItem = (index: number) => {
        onContentChange?.(
            'images',
            insertListItem(images, index, {
                title: `Image ${itemCount + 1}`,
                caption: 'Caption text goes here',
            })
        )
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
                <div className="flex items-end justify-between mb-8">
                    <div>
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
                    {showArrows && !isMobile && (
                        <div className="flex gap-2">
                            <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                                ←
                            </div>
                            <div className="w-10 h-10 border border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                                →
                            </div>
                        </div>
                    )}
                </div>

                {/* Carousel */}
                <div className="flex gap-4">
                    {visibleImages.map((image, index) => (
                        <div key={index} className="flex-1">
                            {editable && index === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={index}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(index)}
                                deletable={itemCount > 1}
                                editable={editable}
                            >
                                <div className="aspect-[4/3] bg-gray-100 border border-gray-200 flex items-center justify-center rounded">
                                    <ImageIcon className="w-10 h-10 text-gray-300" />
                                </div>
                                {showCaption && (
                                    <div className="mt-2">
                                        <EditableText
                                            value={image.title}
                                            onChange={(value) => handleImageChange(index, 'title', value)}
                                            className="text-sm font-medium text-gray-900"
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={image.caption}
                                            onChange={(value) =>
                                                handleImageChange(index, 'caption', value)
                                            }
                                            className="text-xs text-gray-500 mt-1"
                                            editable={editable}
                                        />
                                    </div>
                                )}
                            </DynamicListItem>
                            {editable && <InsertDot onInsert={() => insertItem(index + 1)} />}
                        </div>
                    ))}

                    {/* Peek next item */}
                    {!isMobile && images.length > visibleCount && (
                        <div className="w-16 flex-shrink-0 opacity-40">
                            <div className="aspect-[4/3] bg-gray-100 border border-gray-200 flex items-center justify-center rounded">
                                <ImageIcon className="w-6 h-6 text-gray-300" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Dots */}
                {showDots && (
                    <div className="flex gap-1.5 justify-center mt-6">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-gray-800' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export const GalleryCarouselFamily: TemplateFamily = {
    id: 'gallery-carousel',
    category: 'gallery',
    name: 'Gallery Carousel',
    description: 'Horizontal scrolling image carousel with editable captions',
    tags: ['carousel', 'slider', 'horizontal', 'gallery'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'showArrows',
            label: 'Show Arrows',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDots',
            label: 'Show Dots',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showCaption',
            label: 'Show Captions',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        showArrows: true,
        showDots: true,
        showCaption: false,
    },
    defaultContent: {
        tagline: 'Gallery',
        heading: 'Image gallery',
        images: [
            { title: 'Image 1', caption: 'Beautiful scenery and landscapes' },
            { title: 'Image 2', caption: 'Architecture and urban design' },
            { title: 'Image 3', caption: 'Nature and wildlife photography' },
            { title: 'Image 4', caption: 'Abstract and artistic compositions' },
            { title: 'Image 5', caption: 'Portrait and lifestyle imagery' },
        ],
    },
}
