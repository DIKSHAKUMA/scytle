'use client'

/**
 * Gallery Lightbox Family — Grid with lightbox overlay indicators.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - overlayStyle: icon | text | gradient
 */

import { useState } from 'react'
import { ImageIcon, Maximize2 } from 'lucide-react'
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
    const overlayStyle = (controls?.overlayStyle as string) ?? 'icon'
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length
    const gridCols = isMobile ? 2 : isTablet ? Math.min(columns, 3) : columns

    const handleChange = (index: number, value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], caption: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { caption: 'New image' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(images, index, 1)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-8">
                    <EditableText
                        value={(content?.heading as string) || 'Gallery'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>
                <div
                    className="grid gap-3"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
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
                                <div className="group/lb relative aspect-square bg-gray-100 border border-gray-200 rounded-lg overflow-hidden cursor-pointer">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    {/* Lightbox overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover/lb:bg-black/40 transition-all flex items-center justify-center">
                                        {overlayStyle === 'icon' && (
                                            <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover/lb:opacity-100 transition-opacity" />
                                        )}
                                        {overlayStyle === 'text' && (
                                            <span className="text-white text-sm font-medium opacity-0 group-hover/lb:opacity-100 transition-opacity">
                                                View
                                            </span>
                                        )}
                                        {overlayStyle === 'gradient' && (
                                            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover/lb:opacity-100 transition-opacity" />
                                        )}
                                    </div>
                                    {overlayStyle === 'gradient' && (
                                        <div className="absolute bottom-2 left-3 right-3 opacity-0 group-hover/lb:opacity-100 transition-opacity">
                                            <EditableText
                                                value={img.caption}
                                                onChange={(v) => handleChange(i, v)}
                                                className="text-xs text-white font-medium"
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
            </div>
        </section>
    )
}

export const GalleryLightboxFamily: TemplateFamily = {
    id: 'gallery-lightbox',
    category: 'gallery',
    name: 'Gallery Lightbox',
    description: 'Image grid with lightbox overlay indicators',
    tags: ['gallery', 'lightbox', 'grid', 'overlay'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], defaultValue: '3' },
        { key: 'overlayStyle', label: 'Overlay', type: 'toggle-group', options: [{ value: 'icon', label: 'Icon' }, { value: 'text', label: 'Text' }, { value: 'gradient', label: 'Gradient' }], defaultValue: 'icon' },
    ],
    defaultControls: { columns: '3', overlayStyle: 'icon' },
    defaultContent: {
        heading: 'Gallery',
        images: [
            { caption: 'Project Alpha' }, { caption: 'Project Beta' }, { caption: 'Project Gamma' },
            { caption: 'Project Delta' }, { caption: 'Project Epsilon' }, { caption: 'Project Zeta' },
        ],
    },
}
