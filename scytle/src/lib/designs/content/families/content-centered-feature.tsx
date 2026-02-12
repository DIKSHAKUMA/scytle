'use client'

/**
 * Content Centered-Feature Family — Centered heading + feature grid below.
 *
 * Archetype (Relume Layout 241): Centered tagline + heading + description,
 * then a grid of icon + title + description items in columns.
 * "Normal" shows flat items, "Lined" separates them with horizontal rules.
 *
 * Controls:
 * - columns: '3' | '4' — number of feature columns
 * - style: 'normal' | 'lined' — lined adds dividers between items
 * - assetType: 'icon' | 'image' — icon placeholders vs image thumbnails
 * - showButtons: boolean
 * - textAlign: 'left' | 'center' — alignment of items
 */

import { ImageIcon } from 'lucide-react'
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
    const style = (controls?.style as string) ?? 'normal'
    const assetType = (controls?.assetType as string) ?? 'icon'
    const showButtons = controls?.showButtons !== false
    const textAlign = (controls?.textAlign as string) ?? 'left'

    const titles = (content?.featureTitles as string[]) ?? [
        'Delivery to your door', 'Pickup when ready', 'Dine in at partners',
    ]
    const descriptions = (content?.featureDescriptions as string[]) ?? [
        'Order from home and we bring it hot, every time without fail.',
        'Order ahead and grab it fast on your way through the neighborhood.',
        'Reserve a table and eat where the food is made, fresh and warm.',
    ]
    const icons = (content?.icons as string[]) ?? ['Home', 'ShoppingCart', 'UtensilsCrossed']
    const itemCount = titles.length

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns
    const alignClass = textAlign === 'center' ? 'text-center items-center' : 'text-left items-start'

    const addItem = () => {
        const newTitles = addListItem(titles, `Feature ${itemCount + 1}`)
        const newDescs = addListItem(descriptions, 'Description for this feature.')
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
        <section className={`${isMobile ? 'px-4 py-12' : isTablet ? 'px-8 py-16' : 'px-16 py-20'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Centered Header */}
                <div className="text-center max-w-2xl mx-auto mb-12">
                    <EditableText
                        value={(content?.tagline as string) || 'Options'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Three ways to satisfy your appetite'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.description as string) || 'Whether you\'re at home craving comfort or rushing between places, we meet you where you are.'}
                        onChange={(v) => onContentChange?.('description', v)}
                        as="p"
                        className="text-gray-500 leading-relaxed"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Feature Grid */}
                <div
                    className={`grid gap-8 ${style === 'lined' ? '' : ''}`}
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <DynamicListItem
                            key={i}
                            index={i}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                            onDelete={() => removeItem(i)}
                            deletable={itemCount > 2}
                            editable={editable}
                            className={`flex flex-col ${alignClass} space-y-2 ${style === 'lined' ? 'border-t border-gray-200 pt-6' : ''
                                }`}
                        >
                            {assetType === 'icon' ? (
                                <EditableIcon
                                    iconName={icons[i] || 'Star'}
                                    onChange={(name) => {
                                        const updated = [...icons]
                                        updated[i] = name
                                        onContentChange?.('icons', updated)
                                    }}
                                    editable={editable}
                                    size="lg"
                                    className="mb-2"
                                />
                            ) : (
                                <div className="w-full aspect-[3/2] bg-gray-100 border border-gray-200 rounded flex items-center justify-center mb-2">
                                    <ImageIcon className="w-6 h-6 text-gray-300" />
                                </div>
                            )}
                            <EditableText
                                value={titles[i] || `Feature ${i + 1}`}
                                onChange={(v) => {
                                    const updated = [...titles]
                                    updated[i] = v
                                    onContentChange?.('featureTitles', updated)
                                }}
                                as="h3"
                                className="font-bold text-gray-900"
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
                    ))}
                </div>

                {editable && (
                    <InsertDot onInsert={addItem} className="mt-2" />
                )}

                {showButtons && (
                    <div className="flex items-center justify-center gap-4 mt-10">
                        <div className="border border-gray-900 px-5 py-2.5 text-sm font-medium text-gray-900">
                            <EditableText
                                value={(content?.ctaPrimary as string) || 'Order'}
                                onChange={(v) => onContentChange?.('ctaPrimary', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                        <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                            <EditableText
                                value={(content?.ctaSecondary as string) || 'Explore'}
                                onChange={(v) => onContentChange?.('ctaSecondary', v)}
                                as="span"
                                editable={editable}
                            />
                            <span className="text-gray-400">›</span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const ContentCenteredFeatureFamily: TemplateFamily = {
    id: 'content-centered-feature',
    category: 'content',
    name: 'Centered Features',
    description: 'Centered heading with feature grid below — icons or images',
    tags: ['centered', 'features', 'grid', 'icons', 'content', 'layout-241'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'lined', label: 'Lined' },
            ],
            defaultValue: 'normal',
        },
        {
            key: 'assetType',
            label: 'Asset',
            type: 'toggle-group',
            options: [
                { value: 'icon', label: 'Icon' },
                { value: 'image', label: 'Image' },
            ],
            defaultValue: 'icon',
        },
        {
            key: 'textAlign',
            label: 'Text',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
            ],
            defaultValue: 'left',
        },
        {
            key: 'showButtons',
            label: 'Show Buttons',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        style: 'normal',
        assetType: 'icon',
        textAlign: 'left',
        showButtons: true,
    },
    defaultContent: {
        tagline: 'Options',
        heading: 'Three ways to satisfy your appetite',
        description: 'Whether you\'re at home craving comfort or rushing between places, we meet you where you are.',
        featureTitles: ['Delivery to your door', 'Pickup when ready', 'Dine in at partners'],
        featureDescriptions: [
            'Order from home and we bring it hot, every time without fail.',
            'Order ahead and grab it fast on your way through the neighborhood.',
            'Reserve a table and eat where the food is made, fresh and warm.',
        ],
        icons: ['Home', 'ShoppingCart', 'UtensilsCrossed'],
        ctaPrimary: 'Order',
        ctaSecondary: 'Explore',
    },
}
