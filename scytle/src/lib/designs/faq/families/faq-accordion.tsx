'use client'

/**
 * FAQ Accordion Family — Expandable Q&A list.
 * Covers Relume FAQ 1-9: centered/split layout, divider/card style, icon variants.
 *
 * Controls:
 * - layout: centered | split
 * - textAlign: left | center
 * - accordionStyle: dividers | cards
 * - icon: plus | chevron
 * - showCta: boolean
 * - showCategories: boolean
 */

import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { DynamicListItem, InsertDot, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const layout = (controls?.layout as string) ?? 'centered'
    const textAlign = (controls?.textAlign as string) ?? 'center'
    const accordionStyle = (controls?.accordionStyle as string) ?? 'dividers'
    const icon = (controls?.icon as string) ?? 'plus'
    const showCta = controls?.showCta !== false
    const showCategories = controls?.showCategories === true

    const questions = (content?.questions as string[]) ?? [
        'Frequently asked question 1?',
        'Frequently asked question 2?',
        'Frequently asked question 3?',
        'Frequently asked question 4?',
        'Frequently asked question 5?',
    ]
    const answers = (content?.answers as string[]) ?? [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    ]
    const itemCount = questions.length

    const insertItem = (index: number) => {
        onContentChange?.('questions', insertListItem(questions, index, `Frequently asked question ${itemCount + 1}?`))
        onContentChange?.('answers', insertListItem(answers, index, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'))
    }

    const removeItem = (index: number) => {
        const newQ = removeListItem(questions, index, 1)
        const newA = removeListItem(answers, index, 1)
        if (newQ && newA) {
            onContentChange?.('questions', newQ)
            onContentChange?.('answers', newA)
        }
    }

    const iconChar = icon === 'chevron' ? '›' : '+'

    const headerBlock = (
        <div className={`${layout === 'split' ? '' : textAlign === 'center' ? 'text-center' : ''} ${layout === 'split' ? '' : 'mb-10'}`}>
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
    )

    const categoriesBlock = showCategories && (
        <div className={`flex gap-2 mb-8 flex-wrap ${layout === 'centered' && textAlign === 'center' ? 'justify-center' : ''}`}>
            {['General', 'Billing', 'Support'].map((cat, i) => (
                <div
                    key={cat}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full ${i === 0 ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                    {cat}
                </div>
            ))}
        </div>
    )

    const faqItems = (
        <div className={accordionStyle === 'cards' ? 'space-y-3' : 'space-y-0'}>
            {questions.map((question, i) => (
                <DynamicListItem
                    key={i}
                    index={i}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                    onDelete={() => removeItem(i)}
                    deletable={itemCount > 1}
                    editable={editable}
                    className={accordionStyle === 'cards'
                        ? 'border border-gray-200 rounded-lg px-5'
                        : 'border-b border-gray-200'
                    }
                >
                    <div className="flex items-center justify-between py-4 cursor-pointer">
                        <EditableText
                            value={question}
                            onChange={(v) => {
                                const updated = [...questions]
                                updated[i] = v
                                onContentChange?.('questions', updated)
                            }}
                            as="span"
                            className="font-medium text-gray-900 text-sm pr-4"
                            editable={editable}
                        />
                        <div className={`w-5 h-5 flex items-center justify-center text-gray-400 flex-shrink-0 ${icon === 'chevron' ? 'text-lg' : ''}`}>
                            {iconChar}
                        </div>
                    </div>
                    {i === 0 && (
                        <div className="pb-4">
                            <EditableText
                                value={answers[i] || 'Answer goes here.'}
                                onChange={(v) => {
                                    const updated = [...answers]
                                    updated[i] = v
                                    onContentChange?.('answers', updated)
                                }}
                                as="p"
                                className="text-sm text-gray-500 leading-relaxed"
                                editable={editable}
                                multiline
                            />
                        </div>
                    )}
                </DynamicListItem>
            ))}
            {editable && (
                <InsertDot onInsert={() => insertItem(itemCount)} />
            )}
        </div>
    )

    const ctaBlock = showCta && (
        <div className={`mt-10 p-6 bg-gray-50 border border-gray-200 rounded-lg ${textAlign === 'center' ? 'text-center' : ''}`}>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Still have questions?</h3>
            <p className="text-gray-500 text-sm mb-3">Can&apos;t find the answer you&apos;re looking for? Contact our support team.</p>
            <div className="inline-block bg-gray-800 text-white px-4 py-2 text-sm font-medium">
                Contact Us
            </div>
        </div>
    )

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            {layout === 'split' ? (
                <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : 'flex gap-16'}`}>
                    <div className={`${isMobile ? '' : 'w-1/3'} flex-shrink-0`}>
                        {headerBlock}
                    </div>
                    <div className="flex-1">
                        {categoriesBlock}
                        {faqItems}
                        {ctaBlock}
                    </div>
                </div>
            ) : (
                <div className="max-w-3xl mx-auto">
                    {headerBlock}
                    {categoriesBlock}
                    {faqItems}
                    {ctaBlock}
                </div>
            )}
        </section>
    )
}

export const FaqAccordionFamily: TemplateFamily = {
    id: 'faq-accordion',
    category: 'faq',
    name: 'FAQ Accordion',
    description: 'Expandable Q&A list with centered or split layout',
    tags: ['accordion', 'expandable', 'questions', 'faq', 'collapse'],
    Canvas,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'centered', label: 'Centered' },
                { value: 'split', label: 'Split' },
            ],
            defaultValue: 'centered',
        },
        {
            key: 'textAlign',
            label: 'Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
            defaultValue: 'center',
            showWhen: { key: 'layout', value: 'centered' },
        },
        {
            key: 'accordionStyle',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'dividers', label: 'Dividers' },
                { value: 'cards', label: 'Cards' },
            ],
            defaultValue: 'dividers',
        },
        {
            key: 'icon',
            label: 'Icon',
            type: 'toggle-group',
            options: [
                { value: 'plus', label: '+' },
                { value: 'chevron', label: '›' },
            ],
            defaultValue: 'plus',
        },
        {
            key: 'showCta',
            label: 'Show CTA',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showCategories',
            label: 'Show Categories',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        layout: 'centered',
        textAlign: 'center',
        accordionStyle: 'dividers',
        icon: 'plus',
        showCta: true,
        showCategories: false,
    },
    defaultContent: {
        heading: 'Frequently asked questions',
        subheading: 'Everything you need to know about our product.',
        questions: [
            'Frequently asked question 1?',
            'Frequently asked question 2?',
            'Frequently asked question 3?',
            'Frequently asked question 4?',
            'Frequently asked question 5?',
        ],
        answers: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        ],
    },
}
