'use client'

/**
 * Testimonials Cards Family — Quote cards in a responsive grid.
 * Covers Relume T17-T32: section header + bordered card grid with stars, avatars.
 *
 * Controls:
 * - columns: 1 | 2 | 3
 * - showAvatar: boolean
 * - showRating: boolean
 * - titleAlign: left | center
 * - showCta: boolean
 */

import { Star } from 'lucide-react'
import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { DynamicListItem, InsertDot, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const columns = Number(controls?.columns ?? 3)
    const showAvatar = controls?.showAvatar !== false
    const showRating = controls?.showRating !== false
    const titleAlign = (controls?.titleAlign as string) ?? 'center'
    const showCta = controls?.showCta === true

    const gridCols = isMobile ? 1 : isTablet ? Math.min(columns, 2) : columns

    const quotes = (content?.quotes as string[]) ?? [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    ]
    const names = (content?.names as string[]) ?? ['Person 1', 'Person 2', 'Person 3']
    const roles = (content?.roles as string[]) ?? ['Job Title, Company', 'Job Title, Company', 'Job Title, Company']
    const itemCount = quotes.length

    const insertItem = (index: number) => {
        onContentChange?.('quotes', insertListItem(quotes, index, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'))
        onContentChange?.('names', insertListItem(names, index, `Person ${itemCount + 1}`))
        onContentChange?.('roles', insertListItem(roles, index, 'Job Title, Company'))
    }

    const removeItem = (index: number) => {
        const newQuotes = removeListItem(quotes, index, 1)
        const newNames = removeListItem(names, index, 1)
        const newRoles = removeListItem(roles, index, 1)
        if (newQuotes && newNames && newRoles) {
            onContentChange?.('quotes', newQuotes)
            onContentChange?.('names', newNames)
            onContentChange?.('roles', newRoles)
        }
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`mb-12 ${titleAlign === 'center' ? 'text-center max-w-2xl mx-auto' : ''}`}>
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
                    {quotes.map((quote, i) => (
                        <DynamicListItem
                            key={i}
                            index={i}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                            onDelete={() => removeItem(i)}
                            deletable={itemCount > 1}
                            editable={editable}
                            className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex flex-col"
                        >
                            {showRating && (
                                <div className="flex gap-0.5 mb-3">
                                    {Array.from({ length: 5 }).map((_, s) => (
                                        <Star key={s} className="w-4 h-4 text-gray-300 fill-gray-300" />
                                    ))}
                                </div>
                            )}
                            <div className="flex-1 mb-4">
                                <EditableText
                                    value={quote}
                                    onChange={(v) => {
                                        const updated = [...quotes]
                                        updated[i] = v
                                        onContentChange?.('quotes', updated)
                                    }}
                                    as="p"
                                    className="text-gray-600 text-sm leading-relaxed"
                                    editable={editable}
                                    multiline
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                {showAvatar && (
                                    <div className="w-10 h-10 bg-gray-200 border border-gray-200 rounded-full flex-shrink-0" />
                                )}
                                <div>
                                    <EditableText
                                        value={names[i] || `Person ${i + 1}`}
                                        onChange={(v) => {
                                            const updated = [...names]
                                            updated[i] = v
                                            onContentChange?.('names', updated)
                                        }}
                                        as="div"
                                        className="font-medium text-gray-900 text-sm"
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={roles[i] || 'Job Title, Company'}
                                        onChange={(v) => {
                                            const updated = [...roles]
                                            updated[i] = v
                                            onContentChange?.('roles', updated)
                                        }}
                                        as="div"
                                        className="text-gray-500 text-xs"
                                        editable={editable}
                                    />
                                </div>
                            </div>
                        </DynamicListItem>
                    ))}
                </div>

                {editable && (
                    <InsertDot onInsert={() => insertItem(itemCount)} />
                )}

                {/* CTA */}
                {showCta && (
                    <div className={`mt-10 ${titleAlign === 'center' ? 'text-center' : ''}`}>
                        <div className="inline-block border border-gray-300 text-gray-700 px-5 py-2.5 text-sm font-medium">
                            <EditableText
                                value={(content?.ctaText as string) || 'View all testimonials'}
                                onChange={(v) => onContentChange?.('ctaText', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const TestimonialsCardsFamily: TemplateFamily = {
    id: 'testimonials-cards',
    category: 'testimonials',
    name: 'Testimonial Cards',
    description: 'Quote cards in a responsive grid with section header',
    tags: ['cards', 'grid', 'quotes', 'social-proof', 'rating'],
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
            key: 'titleAlign',
            label: 'Title Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
            defaultValue: 'center',
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
        {
            key: 'showCta',
            label: 'Show CTA',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        columns: '3',
        titleAlign: 'center',
        showAvatar: true,
        showRating: true,
        showCta: false,
    },
    defaultContent: {
        tagline: 'Testimonials',
        heading: 'What our customers say',
        ctaText: 'View all testimonials',
        quotes: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        ],
        names: ['Person 1', 'Person 2', 'Person 3'],
        roles: ['Job Title, Company', 'Job Title, Company', 'Job Title, Company'],
    },
}
