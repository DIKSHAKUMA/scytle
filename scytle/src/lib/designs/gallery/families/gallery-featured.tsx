'use client'

/**
 * Gallery Featured Family — One large hero image + row of smaller thumbnails.
 *
 * Controls:
 * - thumbnailCount: 3 | 4 | 5
 * - layout: below | side
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
    const layout = (controls?.layout as string) ?? 'below'
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const handleChange = (index: number, value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], caption: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { caption: 'New image' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(images, index, 2)
        if (result) onContentChange?.('images', result)
    }

    const heroImage = images[0]
    const thumbs = images.slice(1)

    const isSide = layout === 'side' && !isMobile

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <EditableText
                        value={(content?.heading as string) || 'Featured Work'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                <div className={`${isSide ? 'flex gap-4' : 'space-y-4'}`}>
                    {/* Hero image */}
                    {heroImage && (
                        <div className={isSide ? 'flex-[3]' : 'w-full'}>
                            {editable && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={0}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(0)}
                                deletable={itemCount > 2}
                                editable={editable}
                            >
                                <div className={`${isSide ? 'aspect-[4/3]' : 'aspect-[16/9]'} bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center relative`}>
                                    <ImageIcon className="w-12 h-12 text-gray-300" />
                                    <div className="absolute bottom-3 left-4">
                                        <EditableText
                                            value={heroImage.caption}
                                            onChange={(v) => handleChange(0, v)}
                                            className="text-sm font-medium text-gray-600"
                                            editable={editable}
                                        />
                                    </div>
                                </div>
                            </DynamicListItem>
                        </div>
                    )}

                    {/* Thumbnails */}
                    <div className={isSide ? 'flex-1 flex flex-col gap-2' : `grid gap-2 grid-cols-${isMobile ? 2 : Math.min(thumbs.length, 5)}`}
                        style={!isSide ? { gridTemplateColumns: `repeat(${isMobile ? 2 : Math.min(thumbs.length, 5)}, minmax(0, 1fr))` } : undefined}
                    >
                        {thumbs.map((img, idx) => {
                            const i = idx + 1
                            return (
                                <div key={i}>
                                    <DynamicListItem
                                        index={i}
                                        selectedIndex={selectedIndex}
                                        onSelect={setSelectedIndex}
                                        onDelete={() => removeItem(i)}
                                        deletable={itemCount > 2}
                                        editable={editable}
                                    >
                                        <div className="aspect-square bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                        </div>
                                    </DynamicListItem>
                                    {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}

export const GalleryFeaturedFamily: TemplateFamily = {
    id: 'gallery-featured',
    category: 'gallery',
    name: 'Gallery Featured',
    description: 'Hero image with thumbnail row',
    tags: ['gallery', 'featured', 'hero', 'thumbnails'],
    Canvas,
    controlsDef: [
        { key: 'layout', label: 'Layout', type: 'toggle-group', options: [{ value: 'below', label: 'Below' }, { value: 'side', label: 'Side' }], defaultValue: 'below' },
    ],
    defaultControls: { layout: 'below' },
    defaultContent: {
        heading: 'Featured Work',
        images: [
            { caption: 'Featured Project' },
            { caption: 'Project A' }, { caption: 'Project B' },
            { caption: 'Project C' }, { caption: 'Project D' },
        ],
    },
}
