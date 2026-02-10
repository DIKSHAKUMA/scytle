'use client'

/**
 * FAQ Two-Column Family — Two-column Q&A grid.
 *
 * Controls:
 * - itemCount: 4 | 6 | 8
 * - showHeader: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 6)
    const showHeader = controls?.showHeader !== false

    const faqs = Array.from({ length: itemCount }, (_, i) => ({
        question: `Question ${i + 1} goes here?`,
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    }))

    const half = Math.ceil(itemCount / 2)
    const col1 = faqs.slice(0, half)
    const col2 = faqs.slice(half)

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                {showHeader && (
                    <div className="text-center mb-12 max-w-2xl mx-auto">
                        <EditableText
                            value={(content?.tagline as string) || 'FAQ'}
                            onChange={(v) => onContentChange?.('tagline', v)}
                            as="p"
                            className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.heading as string) || 'Frequently asked questions'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h2"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subheading as string) || 'Find answers to common questions.'}
                            onChange={(v) => onContentChange?.('subheading', v)}
                            as="p"
                            className="text-gray-500"
                            editable={editable}
                            multiline
                        />
                    </div>
                )}

                {/* Two-Column Grid */}
                <div className={`grid gap-x-12 gap-y-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {[col1, col2].map((col, c) => (
                        <div key={c} className="space-y-6">
                            {col.map((faq, i) => (
                                <div key={i}>
                                    <h3 className="font-semibold text-gray-900 text-sm mb-1.5">
                                        {faq.question}
                                    </h3>
                                    <p className="text-gray-500 text-sm leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const FaqTwoColumnFamily: TemplateFamily = {
    id: 'faq-two-column',
    category: 'faq',
    name: 'FAQ Two-Column',
    description: 'Two-column Q&A grid layout',
    tags: ['two-column', 'grid', 'questions', 'faq'],
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Questions',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '6',
        },
        {
            key: 'showHeader',
            label: 'Show Header',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        itemCount: '6',
        showHeader: true,
    },
    defaultContent: {
        tagline: 'FAQ',
        heading: 'Frequently asked questions',
        subheading: 'Find answers to common questions.',
    },
}
