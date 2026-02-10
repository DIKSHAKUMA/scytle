'use client'

/**
 * Gallery Grid Family — Image grid with uniform cells.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - itemCount: 4 | 6 | 8 | 9
 * - gap: tight | normal | loose
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const itemCount = Number(controls?.itemCount ?? 6)
    const gap = (controls?.gap as string) ?? 'normal'

    const gridCols = isMobile ? 2 : isTablet ? Math.min(columns, 3) : columns
    const gapClass = gap === 'tight' ? 'gap-1' : gap === 'loose' ? 'gap-6' : 'gap-3'

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
                        value={(content?.heading as string) || 'Image gallery'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Grid */}
                <div
                    className={`grid ${gapClass}`}
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div
                            key={i}
                            className="aspect-square bg-gray-100 border border-gray-200 flex items-center justify-center rounded"
                        >
                            <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const GalleryGridFamily: TemplateFamily = {
    id: 'gallery-grid',
    category: 'gallery',
    name: 'Gallery Grid',
    description: 'Uniform image grid',
    tags: ['grid', 'images', 'photos', 'gallery'],
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
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'itemCount',
            label: 'Images',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
                { value: '9', label: '9' },
            ],
            defaultValue: '6',
        },
        {
            key: 'gap',
            label: 'Spacing',
            type: 'toggle-group',
            options: [
                { value: 'tight', label: 'Tight' },
                { value: 'normal', label: 'Normal' },
                { value: 'loose', label: 'Loose' },
            ],
            defaultValue: 'normal',
        },
    ],
    defaultControls: {
        columns: '3',
        itemCount: '6',
        gap: 'normal',
    },
    defaultContent: {
        tagline: 'Gallery',
        heading: 'Image gallery',
    },
}
