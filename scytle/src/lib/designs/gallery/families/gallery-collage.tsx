'use client'

/**
 * Gallery Collage Family — Creative overlapping / rotated image layout.
 *
 * Controls:
 * - style: overlap | scattered | stacked
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
    const style = (controls?.style as string) ?? 'overlap'
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

    const rotations = ['-3deg', '2deg', '-1deg', '3deg', '-2deg', '1deg']
    const offsets = ['translate-y-0', 'translate-y-4', '-translate-y-2', 'translate-y-6', '-translate-y-4', 'translate-y-2']

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <EditableText
                        value={(content?.heading as string) || 'Photo Collage'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'A collection of our favorite moments.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        className="text-gray-500 mt-2"
                        editable={editable}
                    />
                </div>

                {isMobile ? (
                    <div className="grid grid-cols-2 gap-3">
                        {images.map((img, i) => (
                            <div key={i}>
                                {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                                <DynamicListItem index={i} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onDelete={() => removeItem(i)} deletable={itemCount > 2} editable={editable}>
                                    <div className="aspect-square bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                </DynamicListItem>
                                {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className={`flex items-center justify-center gap-4 min-h-[400px] ${style === 'overlap' ? '-space-x-8' : ''}`}>
                        {images.map((img, i) => {
                            const rotation = rotations[i % rotations.length]
                            const offset = style === 'scattered' ? offsets[i % offsets.length] : ''
                            const zIndex = i === Math.floor(itemCount / 2) ? 'z-10' : `z-${i}`
                            const scale = style === 'stacked' && i === Math.floor(itemCount / 2) ? 'scale-110' : ''

                            return (
                                <div key={i} className={`${offset} ${zIndex} ${scale} transition-transform`}>
                                    {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                                    <DynamicListItem index={i} selectedIndex={selectedIndex} onSelect={setSelectedIndex} onDelete={() => removeItem(i)} deletable={itemCount > 2} editable={editable}>
                                        <div
                                            className="w-48 aspect-[3/4] bg-gray-100 border border-gray-200 rounded-lg shadow-lg flex flex-col items-center justify-center p-3"
                                            style={{ transform: style !== 'stacked' ? `rotate(${rotation})` : undefined }}
                                        >
                                            <ImageIcon className="w-8 h-8 text-gray-300 mb-2" />
                                            <EditableText
                                                value={img.caption}
                                                onChange={(v) => handleChange(i, v)}
                                                className="text-xs text-gray-500 text-center"
                                                editable={editable}
                                            />
                                        </div>
                                    </DynamicListItem>
                                    {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </section>
    )
}

export const GalleryCollageFamily: TemplateFamily = {
    id: 'gallery-collage',
    category: 'gallery',
    name: 'Gallery Collage',
    description: 'Creative overlapping image layout',
    tags: ['gallery', 'collage', 'creative', 'overlap'],
    Canvas,
    controlsDef: [
        { key: 'style', label: 'Style', type: 'toggle-group', options: [{ value: 'overlap', label: 'Overlap' }, { value: 'scattered', label: 'Scatter' }, { value: 'stacked', label: 'Stack' }], defaultValue: 'overlap' },
    ],
    defaultControls: { style: 'overlap' },
    defaultContent: {
        heading: 'Photo Collage',
        subheading: 'A collection of our favorite moments.',
        images: [
            { caption: 'Moment 1' }, { caption: 'Moment 2' }, { caption: 'Moment 3' },
            { caption: 'Moment 4' }, { caption: 'Moment 5' },
        ],
    },
}
