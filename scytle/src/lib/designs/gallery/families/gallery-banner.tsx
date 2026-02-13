'use client'

/**
 * Gallery Banner Family — Full-width hero banner gallery with overlay text.
 *
 * Controls:
 * - showOverlay: boolean
 * - height: short | medium | tall
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
    const showOverlay = controls?.showOverlay !== false
    const height = (controls?.height as string) ?? 'medium'
    const images = (content?.images as Array<{ title: string; subtitle: string }>) || []
    const itemCount = images.length

    const heightClass = height === 'tall' ? (isMobile ? 'h-64' : 'h-96') : height === 'short' ? (isMobile ? 'h-32' : 'h-48') : (isMobile ? 'h-48' : 'h-64')

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { title: 'New Banner', subtitle: 'Subtitle text' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 1)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-6' : 'py-12'}`}>
            <div className="space-y-4">
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
                            <div className={`relative ${heightClass} bg-gray-100 border border-gray-200 ${isMobile ? '' : 'rounded-lg'} flex items-center justify-center overflow-hidden`}>
                                <ImageIcon className="w-12 h-12 text-gray-300" />
                                {showOverlay && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex flex-col justify-end p-6">
                                        <EditableText
                                            value={img.title}
                                            onChange={(v) => handleChange(i, 'title', v)}
                                            as="h3"
                                            className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-2xl'}`}
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={img.subtitle}
                                            onChange={(v) => handleChange(i, 'subtitle', v)}
                                            className="text-sm text-white/80 mt-1"
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

export const GalleryBannerFamily: TemplateFamily = {
    id: 'gallery-banner',
    category: 'gallery',
    name: 'Gallery Banner',
    description: 'Full-width hero banners with text overlay',
    tags: ['gallery', 'banner', 'hero', 'fullwidth'],
    Canvas,
    controlsDef: [
        { key: 'height', label: 'Height', type: 'toggle-group', options: [{ value: 'short', label: 'S' }, { value: 'medium', label: 'M' }, { value: 'tall', label: 'L' }], defaultValue: 'medium' },
        { key: 'showOverlay', label: 'Overlay', type: 'switch', defaultValue: true },
    ],
    defaultControls: { height: 'medium', showOverlay: true },
    defaultContent: {
        images: [
            { title: 'Featured Collection', subtitle: 'Spring 2024 lookbook' },
            { title: 'Behind the Scenes', subtitle: 'Our creative process' },
            { title: 'Latest Release', subtitle: 'Explore what\u2019s new' },
        ],
    },
    hasImage: true,
}
