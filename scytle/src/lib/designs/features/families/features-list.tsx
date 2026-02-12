'use client'

/**
 * Features List Family — Vertical list of features with icons.
 *
 * Controls:
 * - showIcon: boolean
 * - showDividers: boolean
 * - itemCount: 3 | 4 | 5 | 6
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
    const showIcon = controls?.showIcon !== false
    const showDividers = controls?.showDividers !== false
    const iconPosition = (controls?.iconPosition as string) ?? 'left'

    const titles = (content?.featureTitles as string[]) ?? ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4']
    const descriptions = (content?.featureDescriptions as string[]) ?? Array(4).fill(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'
    )
    const icons = (content?.icons as string[]) ?? ['Layers', 'Zap', 'Shield', 'Target']
    const itemCount = titles.length

    const insertItem = (index: number) => {
        onContentChange?.('featureTitles', insertListItem(titles, index, `Feature ${itemCount + 1}`))
        onContentChange?.('featureDescriptions', insertListItem(descriptions, index, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'))
        onContentChange?.('icons', insertListItem(icons, index, 'Star'))
    }

    const removeItem = (index: number) => {
        const newTitles = removeListItem(titles, index, 2)
        const newDescs = removeListItem(descriptions, index, 2)
        const newIcons = removeListItem(icons, index, 2)
        if (newTitles && newDescs && newIcons) {
            onContentChange?.('featureTitles', newTitles)
            onContentChange?.('featureDescriptions', newDescs)
            onContentChange?.('icons', newIcons)
        }
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-3xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <EditableText
                        value={(content?.tagline as string) || 'Features'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Why choose our product'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Feature List */}
                <div className="space-y-0">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i}>
                            {editable && i === 0 && (
                                <InsertDot onInsert={() => insertItem(0)} />
                            )}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={itemCount > 2}
                                editable={editable}
                                className={`${iconPosition === 'top' ? 'flex flex-col items-start gap-3' : 'flex items-start gap-4'} py-5 ${showDividers && i < itemCount - 1 ? 'border-b border-gray-100' : ''
                                    }`}
                            >
                                {showIcon && (
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
                                <div className="flex-1">
                                    <EditableText
                                        value={titles[i] || `Feature ${i + 1}`}
                                        onChange={(v) => {
                                            const updated = [...titles]
                                            updated[i] = v
                                            onContentChange?.('featureTitles', updated)
                                        }}
                                        as="h3"
                                        className="font-semibold text-gray-900 text-sm mb-1"
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={descriptions[i] || 'Description goes here.'}
                                        onChange={(v) => {
                                            const updated = [...descriptions]
                                            updated[i] = v
                                            onContentChange?.('featureDescriptions', updated)
                                        }}
                                        as="p"
                                        className="text-gray-500 text-sm leading-relaxed"
                                        editable={editable}
                                        multiline
                                    />
                                </div>
                            </DynamicListItem>
                            {editable && (
                                <InsertDot onInsert={() => insertItem(i + 1)} />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const FeaturesListFamily: TemplateFamily = {
    id: 'features-list',
    category: 'features',
    name: 'Features List',
    description: 'Vertical list of features with icons',
    tags: ['list', 'icons', 'vertical', 'features'],
    Canvas,
    controlsDef: [
        {
            key: 'showIcon',
            label: 'Show Icons',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDividers',
            label: 'Show Dividers',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'iconPosition',
            label: 'Icon Position',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'top', label: 'Top' },
            ],
            defaultValue: 'left',
        },
    ],
    defaultControls: {
        showIcon: true,
        showDividers: true,
        iconPosition: 'left',
    },
    defaultContent: {
        tagline: 'Features',
        heading: 'Why choose our product',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        featureTitles: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
        featureDescriptions: Array(4).fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'),
        icons: ['Layers', 'Zap', 'Shield', 'Target'],
    },
}
