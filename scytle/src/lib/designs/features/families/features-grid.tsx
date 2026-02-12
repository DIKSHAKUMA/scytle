'use client'

/**
 * Features Grid Family — Icon + title + description cards in a grid.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - showIcon: boolean
 * - textAlign: left | center
 * - itemCount: 3 | 4 | 6 | 8
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
    const columns = Number(controls?.columns ?? 3)
    const showIcon = controls?.showIcon !== false
    const textAlign = (controls?.textAlign as string) ?? 'center'
    const cardStyle = (controls?.cardStyle as string) ?? 'flat'

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns
    const alignClass = textAlign === 'center' ? 'text-center items-center' : 'text-left items-start'

    const titles = (content?.featureTitles as string[]) ?? Array.from({ length: 6 }, (_, i) => `Feature ${i + 1}`)
    const descriptions = (content?.featureDescriptions as string[]) ?? Array(6).fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
    const icons = (content?.icons as string[]) ?? ['Layers', 'Zap', 'Shield', 'Target', 'Star', 'Heart']
    const itemCount = titles.length

    const addItem = () => {
        const newTitles = addListItem(titles, `Feature ${itemCount + 1}`)
        const newDescs = addListItem(descriptions, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
        const newIcons = addListItem(icons, 'Star')
        onContentChange?.('featureTitles', newTitles)
        onContentChange?.('featureDescriptions', newDescs)
        onContentChange?.('icons', newIcons)
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
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`mb-12 ${textAlign === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}`}>
                    <EditableText
                        value={(content?.tagline as string) || 'Features'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Product features that stand out'}
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

                {/* Feature Grid */}
                <div
                    className="grid gap-8"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => {
                        const styleClass = cardStyle === 'bordered' ? 'p-5 border border-gray-200 rounded-lg' : cardStyle === 'filled' ? 'p-5 bg-gray-50 rounded-lg' : ''
                        return (
                            <DynamicListItem
                                key={i}
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={itemCount > 2}
                                editable={editable}
                                className={`flex flex-col ${alignClass} space-y-2 ${styleClass}`}
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
                                        className="mb-1"
                                    />
                                )}
                                <EditableText
                                    value={titles[i] || `Feature ${i + 1}`}
                                    onChange={(v) => {
                                        const updated = [...titles]
                                        updated[i] = v
                                        onContentChange?.('featureTitles', updated)
                                    }}
                                    as="h3"
                                    className="font-semibold text-gray-900 text-sm"
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
                            </DynamicListItem>
                        )
                    })}
                </div>

                {editable && (
                    <InsertDot onInsert={addItem} className="mt-2" />
                )}
            </div>
        </section>
    )
}

export const FeaturesGridFamily: TemplateFamily = {
    id: 'features-grid',
    category: 'features',
    name: 'Features Grid',
    description: 'Icon cards in a responsive grid layout',
    tags: ['grid', 'icons', 'cards', 'features'],
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
            key: 'showIcon',
            label: 'Show Icons',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'cardStyle',
            label: 'Card Style',
            type: 'toggle-group',
            options: [
                { value: 'flat', label: 'Flat' },
                { value: 'bordered', label: 'Border' },
                { value: 'filled', label: 'Filled' },
            ],
            defaultValue: 'flat',
        },
        {
            key: 'textAlign',
            label: 'Text Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
            defaultValue: 'center',
        },
    ],
    defaultControls: {
        columns: '3',
        showIcon: true,
        textAlign: 'center',
    },
    defaultContent: {
        tagline: 'Features',
        heading: 'Product features that stand out',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        featureTitles: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4', 'Feature 5', 'Feature 6'],
        featureDescriptions: Array(6).fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
        icons: ['Layers', 'Zap', 'Shield', 'Target', 'Star', 'Heart'],
    },
}
