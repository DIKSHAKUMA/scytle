'use client'

/**
 * Content Split-Features Family — Image + stacked feature list side by side.
 *
 * Archetype (Relume Layout 223): Large image on one side with a vertical list
 * of icon + title + description items on the other. Buttons at the bottom.
 * Different from content-split (which has paragraph text, not feature items).
 *
 * Controls:
 * - imagePlacement: 'left' | 'right' — which side the image goes
 * - style: 'normal' | 'card' — card puts items in bordered cards
 * - imageStyle: 'default' | 'expand' — expand makes the image larger
 * - showButtons: boolean
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

    const imagePlacement = (controls?.imagePlacement as string) ?? 'left'
    const style = (controls?.style as string) ?? 'normal'
    const imageStyle = (controls?.imageStyle as string) ?? 'default'
    const showButtons = controls?.showButtons !== false

    const titles = (content?.featureTitles as string[]) ?? ['Delivery to your door', 'Pickup when ready', 'Dine in at partners']
    const descriptions = (content?.featureDescriptions as string[]) ?? [
        'Order from home and we bring it hot, every time without fail.',
        'Order ahead and grab it fast on your way through the neighborhood.',
        'Reserve a table and eat where the food is made, fresh and warm.',
    ]
    const icons = (content?.icons as string[]) ?? ['Home', 'ShoppingCart', 'UtensilsCrossed']
    const itemCount = titles.length

    const flexDir = imagePlacement === 'left' ? 'flex-row' : 'flex-row-reverse'
    const imageAspect = imageStyle === 'expand' ? 'aspect-[3/4]' : 'aspect-[4/5]'

    const addItem = () => {
        const newTitles = addListItem(titles, `Feature ${itemCount + 1}`)
        const newDescs = addListItem(descriptions, 'Description for this feature goes here.')
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
            <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : `flex ${flexDir} items-center gap-12`}`}>
                {/* Image Side */}
                <div className={`${isMobile ? 'w-full' : imageStyle === 'expand' ? 'flex-[1.2]' : 'flex-1'} ${imageAspect} bg-gray-100 border border-gray-200 flex items-center justify-center`}>
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>

                {/* Feature List Side */}
                <div className={`${isMobile ? 'w-full' : 'flex-1'} space-y-0`}>
                    {Array.from({ length: itemCount }).map((_, i) => {
                        const isCard = style === 'card'
                        return (
                            <div key={i}>
                                {editable && i === 0 && (
                                    <InsertDot onInsert={() => {
                                        onContentChange?.('featureTitles', insertListItem(titles, 0, `Feature ${itemCount + 1}`))
                                        onContentChange?.('featureDescriptions', insertListItem(descriptions, 0, 'Description for this feature goes here.'))
                                        onContentChange?.('icons', insertListItem(icons, 0, 'Star'))
                                    }} />
                                )}
                                <DynamicListItem
                                    index={i}
                                    selectedIndex={selectedIndex}
                                    onSelect={setSelectedIndex}
                                    onDelete={() => removeItem(i)}
                                    deletable={itemCount > 2}
                                    editable={editable}
                                    className={`flex items-start gap-4 ${isCard ? 'p-4 border border-gray-200 rounded-lg' : 'py-2'}`}
                                >
                                    <EditableIcon
                                        iconName={icons[i] || 'Star'}
                                        onChange={(name) => {
                                            const updated = [...icons]
                                            updated[i] = name
                                            onContentChange?.('icons', updated)
                                        }}
                                        editable={editable}
                                        size="md"
                                    />
                                    <div className="flex-1 space-y-1">
                                        <EditableText
                                            value={titles[i] || `Feature ${i + 1}`}
                                            onChange={(v) => {
                                                const updated = [...titles]
                                                updated[i] = v
                                                onContentChange?.('featureTitles', updated)
                                            }}
                                            as="h3"
                                            className="font-bold text-gray-900 text-sm"
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
                                    <InsertDot onInsert={() => {
                                        const idx = i + 1
                                        onContentChange?.('featureTitles', insertListItem(titles, idx, `Feature ${itemCount + 1}`))
                                        onContentChange?.('featureDescriptions', insertListItem(descriptions, idx, 'Description for this feature goes here.'))
                                        onContentChange?.('icons', insertListItem(icons, idx, 'Star'))
                                    }} />
                                )}
                            </div>
                        )
                    })}

                    {showButtons && (
                        <div className="flex items-center gap-4 pt-4">
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
            </div>
        </section>
    )
}

export const ContentSplitFeaturesFamily: TemplateFamily = {
    id: 'content-split-features',
    category: 'content',
    name: 'Split Features',
    description: 'Image + stacked feature list side by side',
    tags: ['split', 'features', 'image', 'icons', 'list', 'content', 'layout-223'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'imagePlacement',
            label: 'Image Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: '←', icon: 'ArrowLeft' },
                { value: 'right', label: '→', icon: 'ArrowRight' },
            ],
            defaultValue: 'left',
        },
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'card', label: 'Card' },
            ],
            defaultValue: 'normal',
        },
        {
            key: 'imageStyle',
            label: 'Image Size',
            type: 'toggle-group',
            options: [
                { value: 'default', label: 'Default' },
                { value: 'expand', label: 'Expand' },
            ],
            defaultValue: 'default',
        },
        {
            key: 'showButtons',
            label: 'Show Buttons',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        imagePlacement: 'left',
        style: 'normal',
        imageStyle: 'default',
        showButtons: true,
    },
    defaultContent: {
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
