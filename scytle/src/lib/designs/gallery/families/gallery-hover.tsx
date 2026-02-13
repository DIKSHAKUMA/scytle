'use client'

/**
 * Gallery Hover Family — Grid with hover-reveal captions and overlay.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - overlayColor: dark | light | gradient
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
    const overlayColor = (controls?.overlayColor as string) ?? 'dark'
    const images = (content?.images as Array<{ title: string; subtitle: string }>) || []
    const itemCount = images.length
    const gridCols = isMobile ? 2 : isTablet ? Math.min(columns, 3) : columns

    const overlayClass = overlayColor === 'light' ? 'bg-white/80' : overlayColor === 'gradient' ? 'bg-gradient-to-t from-black/70 via-black/20 to-transparent' : 'bg-black/50'
    const textClass = overlayColor === 'light' ? 'text-gray-900' : 'text-white'
    const subtitleClass = overlayColor === 'light' ? 'text-gray-500' : 'text-gray-300'

    const handleChange = (index: number, field: 'title' | 'subtitle', value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { title: 'New Project', subtitle: 'Category' }))
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
                        value={(content?.heading as string) || 'Portfolio'}
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
                                <div className="group/hover relative aspect-square bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <ImageIcon className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <div className={`absolute inset-0 ${overlayClass} opacity-0 group-hover/hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-4`}>
                                        <EditableText
                                            value={img.title}
                                            onChange={(v) => handleChange(i, 'title', v)}
                                            as="h3"
                                            className={`font-semibold text-sm ${textClass} text-center`}
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={img.subtitle}
                                            onChange={(v) => handleChange(i, 'subtitle', v)}
                                            className={`text-xs mt-1 ${subtitleClass} text-center`}
                                            editable={editable}
                                        />
                                    </div>
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

export const GalleryHoverFamily: TemplateFamily = {
    id: 'gallery-hover',
    category: 'gallery',
    name: 'Gallery Hover',
    description: 'Grid with hover-reveal captions',
    tags: ['gallery', 'hover', 'overlay', 'interactive'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], defaultValue: '3' },
        { key: 'overlayColor', label: 'Overlay', type: 'toggle-group', options: [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'gradient', label: 'Gradient' }], defaultValue: 'dark' },
    ],
    defaultControls: { columns: '3', overlayColor: 'dark' },
    defaultContent: {
        heading: 'Portfolio',
        images: [
            { title: 'Brand Identity', subtitle: 'Branding' },
            { title: 'Web Application', subtitle: 'Development' },
            { title: 'Product Design', subtitle: 'UI/UX' },
            { title: 'Marketing Site', subtitle: 'Web Design' },
            { title: 'Mobile App', subtitle: 'Product' },
            { title: 'Dashboard', subtitle: 'SaaS' },
        ],
    },
}
