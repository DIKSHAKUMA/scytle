'use client'

/**
 * Testimonials Cards Family — Quote cards in a responsive grid.
 *
 * Controls:
 * - columns: 1 | 2 | 3
 * - showAvatar: boolean
 * - showRating: boolean
 * - itemCount: 2 | 3 | 4 | 6
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const showAvatar = controls?.showAvatar !== false
    const showRating = controls?.showRating !== false
    const itemCount = Number(controls?.itemCount ?? 3)

    const gridCols = isMobile ? 1 : isTablet ? Math.min(columns, 2) : columns

    const testimonials = Array.from({ length: itemCount }, (_, i) => ({
        quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        name: `Person ${i + 1}`,
        role: 'Job Title, Company',
    }))

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Testimonials'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'What our customers say'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Cards Grid */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {testimonials.map((t, i) => (
                        <div
                            key={i}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col"
                        >
                            {showRating && (
                                <div className="flex gap-0.5 mb-3">
                                    {Array.from({ length: 5 }).map((_, s) => (
                                        <div key={s} className="w-4 h-4 bg-gray-300 rounded-sm" />
                                    ))}
                                </div>
                            )}
                            <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-4">
                                &ldquo;{t.quote}&rdquo;
                            </p>
                            <div className="flex items-center gap-3">
                                {showAvatar && (
                                    <div className="w-10 h-10 bg-gray-200 border border-gray-200 rounded-full flex-shrink-0" />
                                )}
                                <div>
                                    <div className="font-medium text-gray-900 text-sm">{t.name}</div>
                                    <div className="text-gray-500 text-xs">{t.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const TestimonialsCardsFamily: TemplateFamily = {
    id: 'testimonials-cards',
    category: 'testimonials',
    name: 'Testimonial Cards',
    description: 'Quote cards in a responsive grid',
    tags: ['cards', 'grid', 'quotes', 'social-proof'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '3',
        },
        {
            key: 'itemCount',
            label: 'Items',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showAvatar',
            label: 'Show Avatar',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showRating',
            label: 'Show Rating',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        itemCount: '3',
        showAvatar: true,
        showRating: true,
    },
    defaultContent: {
        tagline: 'Testimonials',
        heading: 'What our customers say',
    },
}
