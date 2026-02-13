'use client'

/**
 * Gallery Showcase Family — Large hero showcase with info panel.
 *
 * Controls:
 * - infoPosition: below | side
 * - showDetails: boolean
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
    const infoPosition = (controls?.infoPosition as string) ?? 'below'
    const showDetails = controls?.showDetails !== false
    const images = (content?.images as Array<{ title: string; description: string; meta: string }>) || []
    const itemCount = images.length

    const handleChange = (i: number, field: string, v: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], [field]: v }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { title: 'New Project', description: 'Project description here.', meta: 'Category · 2024' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 1)
        if (result) onContentChange?.('images', result)
    }

    return (
        <section className={`${isMobile ? 'py-10 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-6xl mx-auto space-y-16">
                <EditableText
                    value={(content?.heading as string) || 'Showcase'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center`}
                    editable={editable}
                />

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
                            <div className={`${!isMobile && infoPosition === 'side' ? 'grid grid-cols-5 gap-8' : ''}`}>
                                <div className={`${!isMobile && infoPosition === 'side' ? 'col-span-3' : ''}`}>
                                    <div className="aspect-[16/10] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-300" />
                                    </div>
                                </div>
                                <div className={`${!isMobile && infoPosition === 'side' ? 'col-span-2 flex flex-col justify-center' : 'mt-4'}`}>
                                    <EditableText
                                        value={img.meta}
                                        onChange={(v) => handleChange(i, 'meta', v)}
                                        className="text-xs text-gray-400 uppercase tracking-wider mb-1"
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={img.title}
                                        onChange={(v) => handleChange(i, 'title', v)}
                                        as="h3"
                                        className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold text-gray-900 mb-2`}
                                        editable={editable}
                                    />
                                    {showDetails && (
                                        <EditableText
                                            value={img.description}
                                            onChange={(v) => handleChange(i, 'description', v)}
                                            className="text-sm text-gray-500 leading-relaxed"
                                            editable={editable}
                                            multiline
                                        />
                                    )}
                                </div>
                            </div>
                        </DynamicListItem>
                        {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                    </div>
                ))}
            </div>
        </section>
    )
}

export const GalleryShowcaseFamily: TemplateFamily = {
    id: 'gallery-showcase',
    category: 'gallery',
    name: 'Gallery Showcase',
    description: 'Large hero showcase with detail panel',
    tags: ['gallery', 'showcase', 'hero', 'project'],
    Canvas,
    controlsDef: [
        { key: 'infoPosition', label: 'Info', type: 'toggle-group', options: [{ value: 'below', label: 'Below' }, { value: 'side', label: 'Side' }], defaultValue: 'below' },
        { key: 'showDetails', label: 'Details', type: 'switch', defaultValue: true },
    ],
    defaultControls: { infoPosition: 'below', showDetails: true },
    defaultContent: {
        heading: 'Showcase',
        images: [
            { title: 'Project Apollo', description: 'A comprehensive brand identity redesign for a tech startup, including logo, color system, and typography.', meta: 'Branding · 2024' },
            { title: 'Project Nova', description: 'Full-stack web application with real-time collaboration features and responsive design.', meta: 'Web Design · 2024' },
        ],
    },
    hasImage: true,
}
