'use client'

/**
 * Gallery Card Family — Card-style gallery items with metadata.
 *
 * Controls:
 * - columns: 2 | 3
 * - showCategory: boolean
 * - cardStyle: flat | bordered | shadow
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
    const showCategory = controls?.showCategory !== false
    const cardStyle = (controls?.cardStyle as string) ?? 'bordered'
    const images = (content?.images as Array<{ title: string; category: string; description: string }>) || []
    const itemCount = images.length

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns
    const cardClass = cardStyle === 'shadow' ? 'shadow-md rounded-lg' : cardStyle === 'bordered' ? 'border border-gray-200 rounded-lg' : 'rounded-lg'

    const handleChange = (index: number, field: 'title' | 'category' | 'description', value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { title: 'New Project', category: 'Design', description: 'Project description.' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(images, index, 1)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <EditableText
                        value={(content?.heading as string) || 'Our Projects'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Explore our latest work and case studies.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        className="text-gray-500 mt-2"
                        editable={editable}
                    />
                </div>

                <div
                    className="grid gap-6"
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
                                <div className={`${cardClass} overflow-hidden`}>
                                    <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                                        <ImageIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                    <div className="p-4 space-y-1.5">
                                        {showCategory && (
                                            <EditableText
                                                value={img.category}
                                                onChange={(v) => handleChange(i, 'category', v)}
                                                className="text-xs font-medium text-gray-400 uppercase tracking-wide"
                                                editable={editable}
                                            />
                                        )}
                                        <EditableText
                                            value={img.title}
                                            onChange={(v) => handleChange(i, 'title', v)}
                                            as="h3"
                                            className="font-semibold text-gray-900"
                                            editable={editable}
                                        />
                                        <EditableText
                                            value={img.description}
                                            onChange={(v) => handleChange(i, 'description', v)}
                                            className="text-sm text-gray-500"
                                            editable={editable}
                                            multiline
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

export const GalleryCardFamily: TemplateFamily = {
    id: 'gallery-card',
    category: 'gallery',
    name: 'Gallery Cards',
    description: 'Card-style gallery with metadata',
    tags: ['gallery', 'cards', 'portfolio', 'projects'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }], defaultValue: '3' },
        { key: 'cardStyle', label: 'Style', type: 'toggle-group', options: [{ value: 'flat', label: 'Flat' }, { value: 'bordered', label: 'Border' }, { value: 'shadow', label: 'Shadow' }], defaultValue: 'bordered' },
        { key: 'showCategory', label: 'Category', type: 'switch', defaultValue: true },
    ],
    defaultControls: { columns: '3', cardStyle: 'bordered', showCategory: true },
    defaultContent: {
        heading: 'Our Projects',
        subheading: 'Explore our latest work and case studies.',
        images: [
            { title: 'Brand Redesign', category: 'Branding', description: 'Complete visual identity overhaul for a tech startup.' },
            { title: 'E-Commerce Platform', category: 'Web Design', description: 'Modern shopping experience with seamless checkout.' },
            { title: 'Mobile App', category: 'Product', description: 'Cross-platform mobile application for fitness tracking.' },
        ],
    },
}
