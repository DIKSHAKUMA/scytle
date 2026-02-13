'use client'

/**
 * Gallery Offset Family — Offset alternating grid with staggered rows.
 *
 * Controls:
 * - columns: 2 | 3
 * - offsetAmount: small | large
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
    const columns = Number(controls?.columns ?? 2)
    const offsetAmount = (controls?.offsetAmount as string) ?? 'small'
    const showCaptions = controls?.showCaptions !== false
    const images = (content?.images as Array<{ caption: string }>) || []
    const itemCount = images.length

    const gridCols = isMobile ? 2 : columns
    const offsetPx = offsetAmount === 'large' ? '60px' : '30px'

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

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10">
                    <EditableText
                        value={(content?.heading as string) || 'Gallery'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                <div
                    className="grid gap-4"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {images.map((img, i) => {
                        const colIndex = i % gridCols
                        const isOffset = colIndex % 2 !== 0

                        return (
                            <div
                                key={i}
                                style={!isMobile && isOffset ? { marginTop: offsetPx } : undefined}
                            >
                                {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                                <DynamicListItem
                                    index={i}
                                    selectedIndex={selectedIndex}
                                    onSelect={setSelectedIndex}
                                    onDelete={() => removeItem(i)}
                                    deletable={itemCount > 2}
                                    editable={editable}
                                >
                                    <div className="space-y-2">
                                        <div className="aspect-[3/4] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                            <ImageIcon className="w-8 h-8 text-gray-300" />
                                        </div>
                                        {showCaptions && (
                                            <EditableText
                                                value={img.caption}
                                                onChange={(v) => handleChange(i, v)}
                                                className="text-sm text-gray-500"
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

export const GalleryOffsetFamily: TemplateFamily = {
    id: 'gallery-offset',
    category: 'gallery',
    name: 'Gallery Offset',
    description: 'Staggered offset image grid',
    tags: ['gallery', 'offset', 'staggered', 'alternating'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }], defaultValue: '2' },
        { key: 'offsetAmount', label: 'Offset', type: 'toggle-group', options: [{ value: 'small', label: 'Small' }, { value: 'large', label: 'Large' }], defaultValue: 'small' },
        { key: 'showCaptions', label: 'Captions', type: 'switch', defaultValue: true },
    ],
    defaultControls: { columns: '2', offsetAmount: 'small', showCaptions: true },
    defaultContent: {
        heading: 'Gallery',
        images: [
            { caption: 'Image One' }, { caption: 'Image Two' },
            { caption: 'Image Three' }, { caption: 'Image Four' },
        ],
    },
}
