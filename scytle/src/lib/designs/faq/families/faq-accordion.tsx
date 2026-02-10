'use client'

/**
 * FAQ Accordion Family — Expandable Q&A list.
 *
 * Controls:
 * - textAlign: left | center
 * - itemCount: 4 | 5 | 6 | 8
 * - showCategories: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const textAlign = (controls?.textAlign as string) ?? 'center'
    const itemCount = Number(controls?.itemCount ?? 5)
    const showCategories = controls?.showCategories === true

    const faqs = Array.from({ length: itemCount }, (_, i) => ({
        question: `Frequently asked question ${i + 1}?`,
        answer: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    }))

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`max-w-3xl mx-auto ${textAlign === 'center' ? '' : ''}`}>
                {/* Section Header */}
                <div className={`mb-10 ${textAlign === 'center' ? 'text-center' : ''}`}>
                    <EditableText
                        value={(content?.heading as string) || 'Frequently asked questions'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Everything you need to know about our product.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Category Tabs */}
                {showCategories && (
                    <div className="flex gap-2 mb-8 flex-wrap">
                        {['General', 'Billing', 'Support'].map((cat, i) => (
                            <div
                                key={cat}
                                className={`px-3 py-1.5 text-xs font-medium rounded-full ${i === 0 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'
                                    }`}
                            >
                                {cat}
                            </div>
                        ))}
                    </div>
                )}

                {/* FAQ Items */}
                <div className="space-y-0">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-b border-gray-200">
                            <div className="flex items-center justify-between py-4 cursor-pointer">
                                <span className="font-medium text-gray-900 text-sm pr-4">
                                    {faq.question}
                                </span>
                                <div className="w-5 h-5 flex items-center justify-center text-gray-400 flex-shrink-0">
                                    +
                                </div>
                            </div>
                            {/* Show first item expanded */}
                            {i === 0 && (
                                <div className="pb-4 text-sm text-gray-500 leading-relaxed">
                                    {faq.answer}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* CTA below FAQ */}
                <div className={`mt-10 p-6 bg-gray-50 border border-gray-200 rounded-lg ${textAlign === 'center' ? 'text-center' : ''}`}>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        Still have questions?
                    </h3>
                    <p className="text-gray-500 text-sm mb-3">
                        Can&apos;t find the answer you&apos;re looking for? Contact our support team.
                    </p>
                    <div className={`inline-block bg-gray-800 text-white px-4 py-2 text-sm font-medium`}>
                        Contact Us
                    </div>
                </div>
            </div>
        </section>
    )
}

export const FaqAccordionFamily: TemplateFamily = {
    id: 'faq-accordion',
    category: 'faq',
    name: 'FAQ Accordion',
    description: 'Expandable Q&A list with optional categories',
    tags: ['accordion', 'expandable', 'questions', 'faq'],
    Canvas,
    controlsDef: [
        {
            key: 'textAlign',
            label: 'Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
            defaultValue: 'center',
        },
        {
            key: 'itemCount',
            label: 'Questions',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '5',
        },
        {
            key: 'showCategories',
            label: 'Show Categories',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        textAlign: 'center',
        itemCount: '5',
        showCategories: false,
    },
    defaultContent: {
        heading: 'Frequently asked questions',
        subheading: 'Everything you need to know about our product.',
    },
}
