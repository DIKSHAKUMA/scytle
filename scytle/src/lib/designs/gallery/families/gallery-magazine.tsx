'use client'

/**
 * Gallery Magazine Family — Editorial magazine-style layout with mixed sizes.
 *
 * Controls:
 * - showMeta: boolean
 * - style: clean | editorial
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
    const showMeta = controls?.showMeta !== false
    const style = (controls?.style as string) ?? 'clean'
    const images = (content?.images as Array<{ title: string; meta: string }>) || []
    const itemCount = images.length

    const handleChange = (index: number, field: 'title' | 'meta', value: string) => {
        const updated = [...images]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('images', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('images', insertListItem(images, index, { title: 'New Article', meta: 'Category · 5 min read' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(images, index, 2)
        if (result) onContentChange?.('images', result)
    }

    const renderItem = (img: { title: string; meta: string }, i: number, size: 'large' | 'small') => (
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
                <div className={style === 'editorial' ? 'border-b border-gray-200 pb-4' : ''}>
                    <div className={`${size === 'large' ? 'aspect-[16/10]' : 'aspect-[4/3]'} bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-3`}>
                        <ImageIcon className={`${size === 'large' ? 'w-12 h-12' : 'w-6 h-6'} text-gray-300`} />
                    </div>
                    {showMeta && (
                        <EditableText
                            value={img.meta}
                            onChange={(v) => handleChange(i, 'meta', v)}
                            className="text-xs text-gray-400 uppercase tracking-wide mb-1"
                            editable={editable}
                        />
                    )}
                    <EditableText
                        value={img.title}
                        onChange={(v) => handleChange(i, 'title', v)}
                        as="h3"
                        className={`font-semibold text-gray-900 ${size === 'large' ? (isMobile ? 'text-lg' : 'text-xl') : 'text-sm'}`}
                        editable={editable}
                    />
                </div>
            </DynamicListItem>
            {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
        </div>
    )

    if (isMobile) {
        return (
            <section className="py-12 px-4">
                <div className="space-y-6">
                    <EditableText
                        value={(content?.heading as string) || 'Magazine'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className="text-xl font-bold text-gray-900 mb-6"
                        editable={editable}
                    />
                    {images.map((img, i) => renderItem(img, i, i === 0 ? 'large' : 'small'))}
                </div>
            </section>
        )
    }

    return (
        <section className={`${isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Magazine'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className="text-3xl font-bold text-gray-900 mb-8"
                    editable={editable}
                />

                {/* Magazine grid: large left + 2 small right */}
                <div className="grid grid-cols-3 gap-6">
                    {images[0] && (
                        <div className="col-span-2 row-span-2">
                            {renderItem(images[0], 0, 'large')}
                        </div>
                    )}
                    {images.slice(1, 3).map((img, idx) => renderItem(img, idx + 1, 'small'))}
                </div>

                {/* Additional row */}
                {images.length > 3 && (
                    <div className="grid grid-cols-3 gap-6 mt-6">
                        {images.slice(3).map((img, idx) => renderItem(img, idx + 3, 'small'))}
                    </div>
                )}
            </div>
        </section>
    )
}

export const GalleryMagazineFamily: TemplateFamily = {
    id: 'gallery-magazine',
    category: 'gallery',
    name: 'Gallery Magazine',
    description: 'Editorial magazine-style mixed layout',
    tags: ['gallery', 'magazine', 'editorial', 'mixed'],
    Canvas,
    controlsDef: [
        { key: 'style', label: 'Style', type: 'toggle-group', options: [{ value: 'clean', label: 'Clean' }, { value: 'editorial', label: 'Editorial' }], defaultValue: 'clean' },
        { key: 'showMeta', label: 'Meta', type: 'switch', defaultValue: true },
    ],
    defaultControls: { style: 'clean', showMeta: true },
    defaultContent: {
        heading: 'Magazine',
        images: [
            { title: 'The Future of Design Systems', meta: 'Design · 8 min read' },
            { title: 'Building at Scale', meta: 'Engineering · 5 min read' },
            { title: 'User Research Insights', meta: 'Research · 4 min read' },
            { title: 'Color Theory in Practice', meta: 'Design · 6 min read' },
            { title: 'Accessibility Best Practices', meta: 'Development · 7 min read' },
            { title: 'Motion Design Principles', meta: 'Animation · 3 min read' },
        ],
    },
}
