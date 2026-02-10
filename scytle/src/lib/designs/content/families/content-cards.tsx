'use client'

/**
 * Content Cards Family — Content in card grid layout.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - showImage: boolean
 * - itemCount: 3 | 4 | 6
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const showImage = controls?.showImage !== false
    const itemCount = Number(controls?.itemCount ?? 3)

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns

    const cards = Array.from({ length: itemCount }, (_, i) => ({
        title: `Card title ${i + 1}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    }))

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Resources'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Explore our content'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Card Grid */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {cards.map((card, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                            {showImage && (
                                <div className="aspect-[16/9] bg-gray-100 border-b border-gray-200 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-gray-300" />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="font-semibold text-gray-900 text-sm mb-2">
                                    {card.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {card.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const ContentCardsFamily: TemplateFamily = {
    id: 'content-cards',
    category: 'content',
    name: 'Content Cards',
    description: 'Content in card grid layout',
    tags: ['cards', 'grid', 'content', 'resources'],
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
            label: 'Cards',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        itemCount: '3',
        showImage: true,
    },
    defaultContent: {
        tagline: 'Resources',
        heading: 'Explore our content',
    },
}
