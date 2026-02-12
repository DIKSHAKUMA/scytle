'use client'

/**
 * Content Steps Family — Numbered steps / process timeline.
 *
 * Archetype: Section heading at top, then a row or column of numbered steps.
 * Each step has a number/icon, title, and description.
 *
 * Covers Relume Layouts with sequential/process content.
 *
 * Controls:
 * - stepCount: '3' | '4' | '5'       — number of steps
 * - style: 'numbered' | 'icon' | 'line' — visual marker style
 * - layout: 'horizontal' | 'vertical' — step arrangement
 * - showConnectors: boolean            — lines between steps
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'
import { useState } from 'react'
import { DynamicListItem, InsertDot, addListItem, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const style = (controls?.style as string) ?? 'numbered'
    const layout = (controls?.layout as string) ?? 'horizontal'
    const showConnectors = controls?.showConnectors !== false

    const stepTitles = (content?.stepTitles as string[]) ?? ['Step one', 'Step two', 'Step three']
    const stepDescriptions = (content?.stepDescriptions as string[]) ?? Array(3).fill(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'
    )
    const icons = (content?.icons as string[]) ?? ['Settings', 'User', 'CheckCircle']
    const stepCount = stepTitles.length

    const isVertical = layout === 'vertical' || isMobile

    const insertStep = (index: number) => {
        onContentChange?.('stepTitles', insertListItem(stepTitles, index, `Step ${stepCount + 1}`))
        onContentChange?.('stepDescriptions', insertListItem(stepDescriptions, index, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'))
        onContentChange?.('icons', insertListItem(icons, index, 'Star'))
    }

    const removeStep = (index: number) => {
        const newTitles = removeListItem(stepTitles, index, 2)
        const newDescs = removeListItem(stepDescriptions, index, 2)
        const newIcons = removeListItem(icons, index, 2)
        if (newTitles && newDescs && newIcons) {
            onContentChange?.('stepTitles', newTitles)
            onContentChange?.('stepDescriptions', newDescs)
            onContentChange?.('icons', newIcons)
        }
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`${isMobile ? 'mb-8' : 'mb-12'} max-w-3xl ${isMobile ? '' : 'text-center mx-auto'}`}>
                    <EditableText
                        value={(content?.tagline as string) || 'Tagline'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-3"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'How it works'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 leading-tight ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('description', v)}
                        as="p"
                        className="text-gray-500 leading-relaxed mt-4"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Steps */}
                <div className={`${isVertical ? 'flex flex-col' : 'grid gap-8'}`}
                    style={!isVertical ? { gridTemplateColumns: `repeat(${stepCount}, 1fr)` } : undefined}
                >
                    {Array.from({ length: stepCount }).map((_, i) => (
                        <div key={i}>
                            {editable && isVertical && i === 0 && (
                                <InsertDot onInsert={() => insertStep(0)} />
                            )}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeStep(i)}
                                deletable={stepCount > 2}
                                editable={editable}
                                className={`${isVertical ? 'flex gap-4' : 'text-center'}`}
                            >
                                {/* Step Marker */}
                                <div className={`flex-shrink-0 ${isVertical ? '' : 'mx-auto mb-4'}`}>
                                    {style === 'numbered' && (
                                        <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-bold">
                                            {i + 1}
                                        </div>
                                    )}
                                    {style === 'icon' && (
                                        <EditableIcon
                                            iconName={icons[i] || 'Star'}
                                            onChange={(name) => {
                                                const updated = [...icons]
                                                updated[i] = name
                                                onContentChange?.('icons', updated)
                                            }}
                                            editable={editable}
                                            size="lg"
                                        />
                                    )}
                                    {style === 'line' && (
                                        <div className="w-3 h-3 bg-gray-900 rounded-full" />
                                    )}

                                    {/* Vertical connector line */}
                                    {showConnectors && isVertical && i < stepCount - 1 && (
                                        <div className={`absolute ${style === 'line' ? 'left-[5px]' : 'left-[19px]'} top-12 bottom-0 w-px bg-gray-200`} />
                                    )}
                                </div>

                                {/* Horizontal connector line */}
                                {showConnectors && !isVertical && i < stepCount - 1 && (
                                    <div className="hidden md:block absolute top-5 left-[calc(50%+24px)] right-[calc(-50%+24px)] h-px bg-gray-200" />
                                )}

                                {/* Step Content */}
                                <div className={isVertical ? 'pb-4' : ''}>
                                    <EditableText
                                        value={stepTitles[i] || `Step ${i + 1}`}
                                        onChange={(v) => {
                                            const items = stepTitles.slice()
                                            items[i] = v
                                            onContentChange?.('stepTitles', items)
                                        }}
                                        as="h3"
                                        className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'} mb-2`}
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={stepDescriptions[i] || 'Description goes here.'}
                                        onChange={(v) => {
                                            const items = stepDescriptions.slice()
                                            items[i] = v
                                            onContentChange?.('stepDescriptions', items)
                                        }}
                                        as="p"
                                        className="text-gray-500 text-sm leading-relaxed"
                                        editable={editable}
                                        multiline
                                    />
                                </div>
                            </DynamicListItem>
                            {editable && isVertical && (
                                <InsertDot onInsert={() => insertStep(i + 1)} />
                            )}
                        </div>
                    ))}
                </div>

                {editable && !isVertical && (
                    <InsertDot onInsert={() => insertStep(stepCount)} className="mt-2" />
                )}
            </div>
        </section>
    )
}

export const ContentStepsFamily: TemplateFamily = {
    id: 'content-steps',
    category: 'content',
    name: 'Steps / Process',
    description: 'Numbered steps or process timeline',
    tags: ['steps', 'process', 'timeline', 'how-it-works', 'numbered', 'content'],
    Canvas,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'horizontal', label: 'Horizontal' },
                { value: 'vertical', label: 'Vertical' },
            ],
            defaultValue: 'horizontal',
        },
        {
            key: 'style',
            label: 'Marker Style',
            type: 'toggle-group',
            options: [
                { value: 'numbered', label: 'Number' },
                { value: 'icon', label: 'Icon' },
                { value: 'line', label: 'Dot' },
            ],
            defaultValue: 'numbered',
        },
        {
            key: 'showConnectors',
            label: 'Show Connectors',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        layout: 'horizontal',
        style: 'numbered',
        showConnectors: true,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'How it works',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        stepTitles: ['Step one', 'Step two', 'Step three'],
        stepDescriptions: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        ],
        icons: ['Settings', 'User', 'CheckCircle'],
    },
}
