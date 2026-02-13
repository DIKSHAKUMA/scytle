'use client'

/**
 * Gallery Slideshow Family — Single large image with thumbnail strip below.
 *
 * Controls:
 * - showArrows: boolean
 * - showThumbnails: boolean
 * - aspectRatio: 16/9 | 4/3 | 1/1
 */

import { useState } from 'react'
import { ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
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
    const [activeSlide, setActiveSlide] = useState(0)
    const showArrows = controls?.showArrows !== false
    const showThumbnails = controls?.showThumbnails !== false
    const aspectRatio = (controls?.aspectRatio as string) ?? '16/9'
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const aspectClass = aspectRatio === '1/1' ? 'aspect-square' : aspectRatio === '4/3' ? 'aspect-[4/3]' : 'aspect-[16/9]'

    const handleChange = (index: number, value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], caption: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { caption: 'New slide' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(images, index, 1)
        if (result) {
            onContentChange?.('images', result)
            if (activeSlide >= result.length) setActiveSlide(result.length - 1)
        }
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-5xl mx-auto">
                {/* Main slide */}
                <div className="relative">
                    <DynamicListItem
                        index={activeSlide}
                        selectedIndex={selectedIndex}
                        onSelect={setSelectedIndex}
                        onDelete={() => removeItem(activeSlide)}
                        deletable={itemCount > 1}
                        editable={editable}
                    >
                        <div className={`${aspectClass} bg-gray-100 border border-gray-200 rounded-lg flex flex-col items-center justify-center`}>
                            <ImageIcon className={`${isMobile ? 'w-10 h-10' : 'w-16 h-16'} text-gray-300`} />
                            {images[activeSlide] && (
                                <EditableText
                                    value={images[activeSlide].caption}
                                    onChange={(v) => handleChange(activeSlide, v)}
                                    className="mt-3 text-sm text-gray-500"
                                    editable={editable}
                                />
                            )}
                        </div>
                    </DynamicListItem>

                    {showArrows && itemCount > 1 && (
                        <>
                            <button
                                onClick={() => setActiveSlide((activeSlide - 1 + itemCount) % itemCount)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border border-gray-200"
                            >
                                <ChevronLeft className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                                onClick={() => setActiveSlide((activeSlide + 1) % itemCount)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center border border-gray-200"
                            >
                                <ChevronRight className="w-4 h-4 text-gray-600" />
                            </button>
                        </>
                    )}
                </div>

                {/* Thumbnail strip */}
                {showThumbnails && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                        {images.map((img, i) => (
                            <div key={i} className="flex-shrink-0">
                                {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                                <button
                                    onClick={() => setActiveSlide(i)}
                                    className={`w-16 h-16 bg-gray-100 border rounded flex items-center justify-center ${i === activeSlide ? 'border-gray-800 ring-1 ring-gray-800' : 'border-gray-200'}`}
                                >
                                    <ImageIcon className="w-4 h-4 text-gray-300" />
                                </button>
                                {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                            </div>
                        ))}
                    </div>
                )}

                {/* Slide counter */}
                <div className="text-center mt-3 text-xs text-gray-400">
                    {activeSlide + 1} / {itemCount}
                </div>
            </div>
        </section>
    )
}

export const GallerySlideshowFamily: TemplateFamily = {
    id: 'gallery-slideshow',
    category: 'gallery',
    name: 'Gallery Slideshow',
    description: 'Single image slideshow with thumbnails',
    tags: ['gallery', 'slideshow', 'single', 'thumbnails'],
    Canvas,
    controlsDef: [
        { key: 'aspectRatio', label: 'Aspect', type: 'toggle-group', options: [{ value: '16/9', label: '16:9' }, { value: '4/3', label: '4:3' }, { value: '1/1', label: '1:1' }], defaultValue: '16/9' },
        { key: 'showArrows', label: 'Arrows', type: 'switch', defaultValue: true },
        { key: 'showThumbnails', label: 'Thumbs', type: 'switch', defaultValue: true },
    ],
    defaultControls: { aspectRatio: '16/9', showArrows: true, showThumbnails: true },
    defaultContent: {
        images: [
            { caption: 'Slide 1' }, { caption: 'Slide 2' }, { caption: 'Slide 3' },
            { caption: 'Slide 4' }, { caption: 'Slide 5' },
        ],
    },
}
