'use client'

/**
 * Gallery Scattered Family — Creative scattered/random placement layout.
 *
 * Controls:
 * - density: sparse | normal
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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const showCaption = controls?.showCaption !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const scatterStyles = [
        { width: '45%', transform: 'rotate(-3deg)', marginLeft: '5%' },
        { width: '35%', transform: 'rotate(2deg)', marginLeft: '55%', marginTop: '-8%' },
        { width: '40%', transform: 'rotate(-1deg)', marginLeft: '15%' },
        { width: '38%', transform: 'rotate(3deg)', marginLeft: '50%', marginTop: '-5%' },
        { width: '42%', transform: 'rotate(-2deg)', marginLeft: '8%' },
        { width: '36%', transform: 'rotate(1deg)', marginLeft: '52%', marginTop: '-6%' },
    ]

    const handleChange = (i: number, v: string) => {
        const updated = [...images]
        updated[i] = { ...updated[i], caption: v }
        onContentChange?.('images', updated)
    }

    const insertItem = (i: number) => {
        onContentChange?.('images', insertListItem(images, i, { caption: 'New photo' }))
    }

    const removeItem = (i: number) => {
        const result = removeListItem(images, i, 2)
        if (result) onContentChange?.('images', result)
    }

    if (isMobile) {
        return (
            <section className="py-10 px-4">
                <EditableText
                    value={(content?.heading as string) || 'Scattered'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className="text-xl font-bold text-gray-900 mb-6 text-center"
                    editable={editable}
                />
                <div className="grid grid-cols-2 gap-3">
                    {images.map((img, i) => (
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
                                <div className="aspect-square bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
                            </DynamicListItem>
                            {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    return (
        <section className="py-20 px-16">
            <div className="max-w-6xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Scattered'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className="text-3xl font-bold text-gray-900 mb-12 text-center"
                    editable={editable}
                />
                <div className="relative">
                    {images.map((img, i) => {
                        const style = scatterStyles[i % scatterStyles.length]
                        return (
                            <div key={i} style={{ width: style.width, marginLeft: style.marginLeft, marginTop: style.marginTop }}>
                                {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                                <DynamicListItem
                                    index={i}
                                    selectedIndex={selectedIndex}
                                    onSelect={setSelectedIndex}
                                    onDelete={() => removeItem(i)}
                                    deletable={itemCount > 2}
                                    editable={editable}
                                >
                                    <div style={{ transform: style.transform }} className="shadow-lg">
                                        <div className="aspect-[4/3] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        {showCaption && (
                                            <EditableText
                                                value={img.caption}
                                                onChange={(v) => handleChange(i, v)}
                                                className="text-xs text-gray-500 mt-2"
                                                editable={editable}
                                            />
                                        )}
                                    </div>
                                </DynamicListItem>
                                {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export const GalleryScatteredFamily: TemplateFamily = {
    id: 'gallery-scattered',
    category: 'gallery',
    name: 'Gallery Scattered',
    description: 'Creative scattered placement with rotation',
    tags: ['gallery', 'scattered', 'creative', 'artistic'],
    Canvas,
    controlsDef: [
        { key: 'density', label: 'Density', type: 'toggle-group', options: [{ value: 'sparse', label: 'Sparse' }, { value: 'normal', label: 'Normal' }], defaultValue: 'normal' },
        { key: 'showCaption', label: 'Caption', type: 'switch', defaultValue: true },
    ],
    defaultControls: { density: 'normal', showCaption: true },
    defaultContent: {
        heading: 'Scattered',
        images: [
            { caption: 'Photo 1' },
            { caption: 'Photo 2' },
            { caption: 'Photo 3' },
            { caption: 'Photo 4' },
        ],
    },
    hasImage: true,
}
