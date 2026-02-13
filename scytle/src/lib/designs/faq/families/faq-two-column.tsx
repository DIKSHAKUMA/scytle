'use client'

/**
 * FAQ Two-Column Family — Two parallel columns of Q&A.
 * Covers Relume FAQ 10-12: two-column accordion or flat Q&A grid.
 *
 * Controls:
 * - mode: accordion | flat
 * - showHeader: boolean
 * - showCta: boolean
 */

import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { DynamicListItem, InsertDot, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const mode = (controls?.mode as string) ?? 'accordion'
    const showHeader = controls?.showHeader !== false
    const showCta = controls?.showCta === true

    const questions = (content?.questions as string[]) ?? [
        'Question 1 goes here?',
        'Question 2 goes here?',
        'Question 3 goes here?',
        'Question 4 goes here?',
        'Question 5 goes here?',
        'Question 6 goes here?',
    ]
    const answers = (content?.answers as string[]) ?? [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    ]
    const itemCount = questions.length

    const insertItem = (index: number) => {
        onContentChange?.('questions', insertListItem(questions, index, `Question ${itemCount + 1} goes here?`))
        onContentChange?.('answers', insertListItem(answers, index, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'))
    }

    const removeItem = (index: number) => {
        const newQ = removeListItem(questions, index, 1)
        const newA = removeListItem(answers, index, 1)
        if (newQ && newA) {
            onContentChange?.('questions', newQ)
            onContentChange?.('answers', newA)
        }
    }

    const half = Math.ceil(itemCount / 2)
    const col1Indices = Array.from({ length: half }, (_, i) => i)
    const col2Indices = Array.from({ length: itemCount - half }, (_, i) => i + half)

    const renderItem = (index: number) => (
        <DynamicListItem
            key={index}
            index={index}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            onDelete={() => removeItem(index)}
            deletable={itemCount > 2}
            editable={editable}
            className={mode === 'accordion' ? 'border-b border-gray-200' : ''}
        >
            {mode === 'accordion' ? (
                <>
                    <div className="flex items-center justify-between py-4 cursor-pointer">
                        <EditableText
                            value={questions[index]}
                            onChange={(v) => {
                                const updated = [...questions]
                                updated[index] = v
                                onContentChange?.('questions', updated)
                            }}
                            as="span"
                            className="font-medium text-gray-900 text-sm pr-4"
                            editable={editable}
                        />
                        <div className="w-5 h-5 flex items-center justify-center text-gray-400 flex-shrink-0">
                            +
                        </div>
                    </div>
                    {index === 0 && (
                        <div className="pb-4">
                            <EditableText
                                value={answers[index] || 'Answer goes here.'}
                                onChange={(v) => {
                                    const updated = [...answers]
                                    updated[index] = v
                                    onContentChange?.('answers', updated)
                                }}
                                as="p"
                                className="text-sm text-gray-500 leading-relaxed"
                                editable={editable}
                                multiline
                            />
                        </div>
                    )}
                </>
            ) : (
                <>
                    <EditableText
                        value={questions[index]}
                        onChange={(v) => {
                            const updated = [...questions]
                            updated[index] = v
                            onContentChange?.('questions', updated)
                        }}
                        as="h3"
                        className="font-semibold text-gray-900 text-sm mb-1.5"
                        editable={editable}
                    />
                    <EditableText
                        value={answers[index] || 'Answer goes here.'}
                        onChange={(v) => {
                            const updated = [...answers]
                            updated[index] = v
                            onContentChange?.('answers', updated)
                        }}
                        as="p"
                        className="text-gray-500 text-sm leading-relaxed"
                        editable={editable}
                        multiline
                    />
                </>
            )}
        </DynamicListItem>
    )

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
                <div className={`grid gap-x-12 ${mode === 'accordion' ? 'gap-y-0' : 'gap-y-6'} ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div className={mode === 'accordion' ? 'space-y-0' : 'space-y-6'}>
                        {col1Indices.map(renderItem)}
                    </div>
                    <div className={mode === 'accordion' ? 'space-y-0' : 'space-y-6'}>
                        {col2Indices.map(renderItem)}
                    </div>
                </div>

                {editable && (
                    <InsertDot onInsert={() => insertItem(itemCount)} />
                )}

                {/* CTA */}
                {showCta && (
                    <div className="mt-10 p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                        <h3 className="font-semibold text-gray-900 text-sm mb-1">Still have questions?</h3>
                        <p className="text-gray-500 text-sm mb-3">Contact our support team for help.</p>
                        <div className="inline-block bg-gray-800 text-white px-4 py-2 text-sm font-medium">
                            Contact Us
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const FaqTwoColumnFamily: TemplateFamily = {
    id: 'faq-two-column',
    category: 'faq',
    name: 'FAQ Two-Column',
    description: 'Two-column Q&A with accordion or flat mode',
    tags: ['two-column', 'grid', 'questions', 'faq', 'parallel'],
    Canvas,
    controlsDef: [
        {
            key: 'mode',
            label: 'Mode',
            type: 'toggle-group',
            options: [
                { value: 'accordion', label: 'Accordion' },
                { value: 'flat', label: 'Flat' },
            ],
            defaultValue: 'accordion',
        },
        {
            key: 'showHeader',
            label: 'Show Header',
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
        mode: 'accordion',
        showHeader: true,
        showCta: false,
    },
    defaultContent: {
        tagline: 'FAQ',
        heading: 'Frequently asked questions',
        subheading: 'Find answers to common questions.',
        questions: [
            'Question 1 goes here?',
            'Question 2 goes here?',
            'Question 3 goes here?',
            'Question 4 goes here?',
            'Question 5 goes here?',
            'Question 6 goes here?',
        ],
        answers: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        ],
    },
}
