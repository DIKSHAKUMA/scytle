'use client'

/**
 * Content Feature-List Family — Split heading + sub-item grid.
 *
 * Archetype: Heading & tagline on the left, description + feature sub-items
 * (icon + title + text) on the right, with optional buttons.
 *
 * Covers Relume Layouts: 47-50, 59-64 and similar structural variants.
 *
 * Controls:
 * - subItemColumns: '1' | '2'   — sub-items stacked or side-by-side
 * - subItemCount: '2' | '3' | '4' — number of feature sub-items
 * - showIcons: boolean           — show icon placeholders on sub-items
 * - showButtons: boolean         — show action buttons below
 * - headingPosition: 'left' | 'top' — heading in left column or stacked above
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

    const subItemColumns = (controls?.subItemColumns as string) ?? '2'
    const showIcons = controls?.showIcons !== false
    const showButtons = controls?.showButtons !== false
    const headingPosition = (controls?.headingPosition as string) ?? 'left'

    const subItems = (content?.subItems as string[]) ?? ['Subheading one', 'Subheading two']
    const subDescriptions = (content?.subDescriptions as string[]) ?? [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    ]
    const icons = (content?.icons as string[]) ?? ['Layers', 'Zap', 'Shield', 'Target']
    const subItemCount = subItems.length

    const gridCols = subItemColumns === '2' && !isMobile ? 'grid-cols-2' : 'grid-cols-1'
    const isStacked = headingPosition === 'top' || isMobile

    const insertItem = (index: number) => {
        onContentChange?.('subItems', insertListItem(subItems, index, `Subheading ${subItemCount + 1}`))
        onContentChange?.('subDescriptions', insertListItem(subDescriptions, index, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'))
        onContentChange?.('icons', insertListItem(icons, index, 'Star'))
    }

    const removeItem = (index: number) => {
        const newItems = removeListItem(subItems, index, 1)
        const newDescs = removeListItem(subDescriptions, index, 1)
        const newIcons = removeListItem(icons, index, 1)
        if (newItems && newDescs && newIcons) {
            onContentChange?.('subItems', newItems)
            onContentChange?.('subDescriptions', newDescs)
            onContentChange?.('icons', newIcons)
        }
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`max-w-7xl mx-auto ${isStacked ? 'space-y-8' : `flex gap-12 ${isMobile ? 'flex-col' : ''}`}`}>

                {/* Heading Column / Row */}
                <div className={isStacked ? '' : 'flex-1'}>
                    <EditableText
                        value={(content?.tagline as string) || 'Tagline'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-3"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Medium length section heading goes here'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 leading-tight ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                        editable={editable}
                    />
                    {isStacked && (
                        <EditableText
                            value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                            onChange={(v) => onContentChange?.('description', v)}
                            as="p"
                            className="text-gray-500 leading-relaxed mt-4"
                            editable={editable}
                            multiline
                        />
                    )}
                </div>

                {/* Content Column */}
                <div className={`${isStacked ? '' : 'flex-1'} space-y-6`}>
                    {!isStacked && (
                        <EditableText
                            value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                            onChange={(v) => onContentChange?.('description', v)}
                            as="p"
                            className="text-gray-500 leading-relaxed"
                            editable={editable}
                            multiline
                        />
                    )}

                    {/* Sub-item Grid */}
                    <div className={`grid ${gridCols} gap-6 py-2`}>
                        {Array.from({ length: subItemCount }).map((_, i) => (
                            <DynamicListItem
                                key={i}
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={subItemCount > 1}
                                editable={editable}
                                className="space-y-2"
                            >
                                {showIcons && (
                                    <EditableIcon
                                        iconName={icons[i] || 'Star'}
                                        onChange={(name) => {
                                            const updated = [...icons]
                                            updated[i] = name
                                            onContentChange?.('icons', updated)
                                        }}
                                        editable={editable}
                                        size="md"
                                        className="mb-1"
                                    />
                                )}
                                <EditableText
                                    value={subItems[i] || `Subheading ${i + 1}`}
                                    onChange={(v) => {
                                        const items = subItems.slice()
                                        items[i] = v
                                        onContentChange?.('subItems', items)
                                    }}
                                    as="h3"
                                    className={`font-bold text-gray-900 ${isMobile ? 'text-base' : 'text-lg'}`}
                                    editable={editable}
                                />
                                <EditableText
                                    value={subDescriptions[i] || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'}
                                    onChange={(v) => {
                                        const items = subDescriptions.slice()
                                        items[i] = v
                                        onContentChange?.('subDescriptions', items)
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
                        <InsertDot onInsert={() => insertItem(subItemCount)} />
                    )}

                    {/* Actions */}
                    {showButtons && (
                        <div className="flex items-center gap-4 pt-2">
                            <div className="border border-gray-900 px-5 py-2.5 text-sm font-medium text-gray-900">
                                <EditableText
                                    value={(content?.ctaPrimary as string) || 'Button'}
                                    onChange={(v) => onContentChange?.('ctaPrimary', v)}
                                    as="span"
                                    editable={editable}
                                />
                            </div>
                            <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                                <EditableText
                                    value={(content?.ctaSecondary as string) || 'Button'}
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

export const ContentFeatureListFamily: TemplateFamily = {
    id: 'content-feature-list',
    category: 'content',
    name: 'Feature List',
    description: 'Split heading with feature sub-items grid',
    tags: ['features', 'list', 'split', 'icons', 'sub-items', 'content', 'layout'],
    Canvas,
    controlsDef: [
        {
            key: 'headingPosition',
            label: 'Heading Position',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left' },
                { value: 'top', label: 'Top' },
            ],
            defaultValue: 'left',
        },
        {
            key: 'subItemColumns',
            label: 'Sub-item Columns',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1 Col' },
                { value: '2', label: '2 Col' },
            ],
            defaultValue: '2',
        },
        {
            key: 'showIcons',
            label: 'Show Icons',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showButtons',
            label: 'Show Buttons',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        headingPosition: 'left',
        subItemColumns: '2',
        showIcons: true,
        showButtons: true,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length section heading goes here',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        subItems: ['Subheading one', 'Subheading two'],
        subDescriptions: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
        ],
        icons: ['Layers', 'Zap'],
        ctaPrimary: 'Button',
        ctaSecondary: 'Button',
    },
}
