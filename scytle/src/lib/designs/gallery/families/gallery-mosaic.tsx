'use client'

/**
 * Gallery Mosaic Family — Mixed large/small tile layout.
 *
 * Controls:
 * - pattern: hero-grid | alternating | featured-row
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
    const pattern = (controls?.pattern as string) ?? 'hero-grid'
    const showCaptions = controls?.showCaptions !== false
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

    const renderTile = (img: { caption: string }, i: number, className: string) => (
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
                <div className={`${className} bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center relative`}>
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                    {showCaptions && (
                        <div className="absolute bottom-2 left-2 right-2">
                            <EditableText
                                value={img.caption}
                                onChange={(v) => handleChange(i, v)}
                                className="text-xs text-gray-500"
                                editable={editable}
                            />
                        </div>
                    )}
                </div>
            </DynamicListItem>
            {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
        </div>
    )

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <EditableText
                        value={(content?.heading as string) || 'Our Work'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {isMobile ? (
                    <div className="grid grid-cols-2 gap-2">
                        {images.map((img, i) => renderTile(img, i, 'aspect-square'))}
                    </div>
                ) : pattern === 'hero-grid' ? (
                    <div className="grid grid-cols-3 gap-3 auto-rows-[200px]">
                        {images.map((img, i) =>
                            renderTile(img, i, i === 0 ? 'col-span-2 row-span-2 h-full' : 'h-full')
                        )}
                    </div>
                ) : pattern === 'alternating' ? (
                    <div className="grid grid-cols-4 gap-3 auto-rows-[180px]">
                        {images.map((img, i) =>
                            renderTile(img, i, i % 3 === 0 ? 'col-span-2 h-full' : 'h-full')
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {images.length > 0 && (
                            <div className="grid grid-cols-2 gap-3">
                                {renderTile(images[0], 0, 'aspect-[16/9]')}
                                {images[1] && renderTile(images[1], 1, 'aspect-[16/9]')}
                            </div>
                        )}
                        {images.length > 2 && (
                            <div className="grid grid-cols-3 gap-3">
                                {images.slice(2).map((img, idx) => renderTile(img, idx + 2, 'aspect-square'))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

export const GalleryMosaicFamily: TemplateFamily = {
    id: 'gallery-mosaic',
    category: 'gallery',
    name: 'Gallery Mosaic',
    description: 'Mixed large/small tile layout',
    tags: ['gallery', 'mosaic', 'tiles', 'mixed'],
    Canvas,
    controlsDef: [
        { key: 'pattern', label: 'Pattern', type: 'toggle-group', options: [{ value: 'hero-grid', label: 'Hero' }, { value: 'alternating', label: 'Alt' }, { value: 'featured-row', label: 'Row' }], defaultValue: 'hero-grid' },
        { key: 'showCaptions', label: 'Captions', type: 'switch', defaultValue: true },
    ],
    defaultControls: { pattern: 'hero-grid', showCaptions: true },
    defaultContent: {
        heading: 'Our Work',
        images: [
            { caption: 'Featured' }, { caption: 'Project A' }, { caption: 'Project B' },
            { caption: 'Project C' }, { caption: 'Project D' },
        ],
    },
}
