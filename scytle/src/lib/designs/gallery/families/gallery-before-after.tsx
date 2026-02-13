'use client'

/**
 * Gallery Before After Family — Side-by-side comparison images.
 *
 * Controls:
 * - layout: side | stacked
 * - showLabels: boolean
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
    const layout = (controls?.layout as string) ?? 'side'
    const showLabels = controls?.showLabels !== false
    const pairs = (content?.pairs as Array<{ title: string; beforeLabel: string; afterLabel: string }>) || []
    const itemCount = pairs.length

    const handleChange = (index: number, field: 'title' | 'beforeLabel' | 'afterLabel', value: string) => {
        const updated = [...pairs]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('pairs', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('pairs', insertListItem(pairs, index, { title: 'Comparison', beforeLabel: 'Before', afterLabel: 'After' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(pairs, index, 1)
        if (result) onContentChange?.('pairs', result)
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <EditableText
                        value={(content?.heading as string) || 'Before & After'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'See the transformation in our work.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        className="text-gray-500 mt-2"
                        editable={editable}
                    />
                </div>

                <div className={`space-y-${isMobile ? '8' : '12'}`}>
                    {pairs.map((pair, i) => (
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
                                <div>
                                    <EditableText
                                        value={pair.title}
                                        onChange={(v) => handleChange(i, 'title', v)}
                                        as="h3"
                                        className={`font-semibold text-gray-900 mb-4 ${isMobile ? 'text-lg' : 'text-xl'}`}
                                        editable={editable}
                                    />
                                    <div className={`${layout === 'side' && !isMobile ? 'flex gap-4' : 'space-y-4'}`}>
                                        <div className={`${layout === 'side' && !isMobile ? 'flex-1' : 'w-full'}`}>
                                            {showLabels && (
                                                <EditableText
                                                    value={pair.beforeLabel}
                                                    onChange={(v) => handleChange(i, 'beforeLabel', v)}
                                                    className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2"
                                                    editable={editable}
                                                />
                                            )}
                                            <div className="aspect-[16/10] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-10 h-10 text-gray-300" />
                                            </div>
                                        </div>
                                        <div className={`${layout === 'side' && !isMobile ? 'flex-1' : 'w-full'}`}>
                                            {showLabels && (
                                                <EditableText
                                                    value={pair.afterLabel}
                                                    onChange={(v) => handleChange(i, 'afterLabel', v)}
                                                    className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2"
                                                    editable={editable}
                                                />
                                            )}
                                            <div className="aspect-[16/10] bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
                                                <ImageIcon className="w-10 h-10 text-gray-300" />
                                            </div>
                                        </div>
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

export const GalleryBeforeAfterFamily: TemplateFamily = {
    id: 'gallery-before-after',
    category: 'gallery',
    name: 'Gallery Before/After',
    description: 'Side-by-side comparison images',
    tags: ['gallery', 'before', 'after', 'comparison'],
    Canvas,
    controlsDef: [
        { key: 'layout', label: 'Layout', type: 'toggle-group', options: [{ value: 'side', label: 'Side' }, { value: 'stacked', label: 'Stacked' }], defaultValue: 'side' },
        { key: 'showLabels', label: 'Labels', type: 'switch', defaultValue: true },
    ],
    defaultControls: { layout: 'side', showLabels: true },
    defaultContent: {
        heading: 'Before & After',
        subheading: 'See the transformation in our work.',
        pairs: [
            { title: 'Website Redesign', beforeLabel: 'Before', afterLabel: 'After' },
            { title: 'Brand Identity', beforeLabel: 'Original', afterLabel: 'Updated' },
        ],
    },
}
