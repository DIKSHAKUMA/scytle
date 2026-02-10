'use client'

/**
 * Gallery Masonry Family — Mixed-size image grid.
 *
 * Controls:
 * - columns: 2 | 3
 * - itemCount: 5 | 7 | 9
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const itemCount = Number(controls?.itemCount ?? 7)

    const gridCols = isMobile ? 2 : isTablet ? 2 : columns

    // Generate alternating aspect ratios for masonry feel
    const items = Array.from({ length: itemCount }, (_, i) => ({
        aspect: i % 3 === 0 ? 'aspect-[3/4]' : i % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]',
    }))

    // Split items into columns for masonry layout
    const colArrays: typeof items[] = Array.from({ length: gridCols }, () => [])
    items.forEach((item, i) => {
        colArrays[i % gridCols].push(item)
    })

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Gallery'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Photo gallery'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Masonry Layout */}
                <div className="flex gap-3">
                    {colArrays.map((col, c) => (
                        <div key={c} className="flex-1 space-y-3">
                            {col.map((item, i) => (
                                <div
                                    key={i}
                                    className={`${item.aspect} bg-gray-100 border border-gray-200 flex items-center justify-center rounded`}
                                >
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const GalleryMasonryFamily: TemplateFamily = {
    id: 'gallery-masonry',
    category: 'gallery',
    name: 'Gallery Masonry',
    description: 'Mixed-size masonry image grid',
    tags: ['masonry', 'mixed', 'photos', 'gallery'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '3',
        },
        {
            key: 'itemCount',
            label: 'Images',
            type: 'toggle-group',
            options: [
                { value: '5', label: '5' },
                { value: '7', label: '7' },
                { value: '9', label: '9' },
            ],
            defaultValue: '7',
        },
    ],
    defaultControls: {
        columns: '3',
        itemCount: '7',
    },
    defaultContent: {
        tagline: 'Gallery',
        heading: 'Photo gallery',
    },
}
