'use client'

/**
 * FAQ Flat Family — Static Q&A grid, no accordion behavior.
 * Covers Relume FAQ 13-14: multi-column questions with visible answers.
 *
 * Controls:
 * - columns: 2 | 3
 * - titleAlign: left | center
 * - showCta: boolean
 * - showIcons: boolean
 */

import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'
import { DynamicListItem, InsertDot, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const columns = Number(controls?.columns ?? 3)
    const titleAlign = (controls?.titleAlign as string) ?? 'center'
    const showCta = controls?.showCta === true
    const showIcons = controls?.showIcons === true

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns

    const questions = (content?.questions as string[]) ?? [
        'Question 1 goes here?',
        'Question 2 goes here?',
        'Question 3 goes here?',
        'Question 4 goes here?',
        'Question 5 goes here?',
        'Question 6 goes here?',
    ]
    const answers = (content?.answers as string[]) ?? [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
    ]
    const icons = (content?.icons as string[]) ?? ['HelpCircle', 'Settings', 'CreditCard', 'Shield', 'Users', 'Zap']
    const itemCount = questions.length

    const insertItem = (index: number) => {
        onContentChange?.('questions', insertListItem(questions, index, `Question ${itemCount + 1} goes here?`))
        onContentChange?.('answers', insertListItem(answers, index, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.'))
        onContentChange?.('icons', insertListItem(icons, index, 'Star'))
    }

    const removeItem = (index: number) => {
        const newQ = removeListItem(questions, index, 1)
        const newA = removeListItem(answers, index, 1)
        const newI = removeListItem(icons, index, 1)
        if (newQ && newA && newI) {
            onContentChange?.('questions', newQ)
            onContentChange?.('answers', newA)
            onContentChange?.('icons', newI)
        }
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`mb-12 ${titleAlign === 'center' ? 'text-center max-w-2xl mx-auto' : ''}`}>
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
                        value={(content?.subheading as string) || 'Find answers to common questions about our product.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Q&A Grid */}
                <div
                    className="grid gap-8"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {questions.map((question, i) => (
                        <DynamicListItem
                            key={i}
                            index={i}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                            onDelete={() => removeItem(i)}
                            deletable={itemCount > 1}
                            editable={editable}
                        >
                            {showIcons && (
                                <EditableIcon
                                    iconName={icons[i] || 'HelpCircle'}
                                    onChange={(name) => {
                                        const updated = [...icons]
                                        updated[i] = name
                                        onContentChange?.('icons', updated)
                                    }}
                                    editable={editable}
                                    size="md"
                                    className="mb-3"
                                />
                            )}
                            <EditableText
                                value={question}
                                onChange={(v) => {
                                    const updated = [...questions]
                                    updated[i] = v
                                    onContentChange?.('questions', updated)
                                }}
                                as="h3"
                                className="font-semibold text-gray-900 text-sm mb-2"
                                editable={editable}
                            />
                            <EditableText
                                value={answers[i] || 'Answer goes here.'}
                                onChange={(v) => {
                                    const updated = [...answers]
                                    updated[i] = v
                                    onContentChange?.('answers', updated)
                                }}
                                as="p"
                                className="text-gray-500 text-sm leading-relaxed"
                                editable={editable}
                                multiline
                            />
                        </DynamicListItem>
                    ))}
                </div>

                {editable && (
                    <InsertDot onInsert={() => insertItem(itemCount)} />
                )}

                {/* CTA */}
                {showCta && (
                    <div className={`mt-12 ${titleAlign === 'center' ? 'text-center' : ''}`}>
                        <div className="inline-block bg-gray-800 text-white px-5 py-2.5 text-sm font-medium">
                            Contact Us
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const FaqFlatFamily: TemplateFamily = {
    id: 'faq-flat',
    category: 'faq',
    name: 'FAQ Grid',
    description: 'Static Q&A grid with visible answers',
    tags: ['flat', 'grid', 'static', 'questions', 'cards'],
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
            key: 'showIcons',
            label: 'Show Icons',
            type: 'switch',
            defaultValue: false,
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
        showIcons: false,
        showCta: false,
    },
    defaultContent: {
        tagline: 'FAQ',
        heading: 'Frequently asked questions',
        subheading: 'Find answers to common questions about our product.',
        questions: [
            'Question 1 goes here?',
            'Question 2 goes here?',
            'Question 3 goes here?',
            'Question 4 goes here?',
            'Question 5 goes here?',
            'Question 6 goes here?',
        ],
        answers: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum.',
        ],
        icons: ['HelpCircle', 'Settings', 'CreditCard', 'Shield', 'Users', 'Zap'],
    },
}
