'use client'

/**
 * Features Numbered Family — Numbered feature items with large number markers.
 *
 * Archetype: Sequential feature/process steps with large numbers (01, 02, 03…)
 * highlighting order/sequence. Different from content-steps which is a timeline;
 * this is a features presentation with number accents.
 *
 * Controls:
 * - layout: 'grid' | 'list' — grid cards vs stacked list
 * - itemCount: '3' | '4' | '5' | '6' — number of items
 * - showDividers: boolean — show divider lines between items (list mode)
 * - showDescription: boolean — show description text per item
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { useState } from 'react'
import { DynamicListItem, InsertDot, addListItem, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const layout = (controls?.layout as string) ?? 'grid'
    const showDividers = controls?.showDividers !== false
    const showDescription = controls?.showDescription !== false

    const titles = (content?.titles as string[]) || [
        'Feature one', 'Feature two', 'Feature three', 'Feature four',
    ]
    const descriptions = (content?.descriptions as string[]) || Array(4).fill(
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'
    )
    const itemCount = titles.length

    const items = Array.from({ length: itemCount }, (_, i) => ({
        number: String(i + 1).padStart(2, '0'),
        title: titles[i] || `Feature ${i + 1}`,
        description: descriptions[i] || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    }))

    const gridCols = isMobile ? 1 : isTablet ? 2 : layout === 'grid' ? (itemCount <= 3 ? itemCount : 3) : 1

    const addItem = () => {
        const newTitles = addListItem(titles, `Feature ${itemCount + 1}`)
        const newDescs = addListItem(descriptions, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.')
        onContentChange?.('titles', newTitles)
        onContentChange?.('descriptions', newDescs)
    }

    const removeItem = (index: number) => {
        const newTitles = removeListItem(titles, index, 2)
        const newDescs = removeListItem(descriptions, index, 2)
        if (newTitles && newDescs) {
            onContentChange?.('titles', newTitles)
            onContentChange?.('descriptions', newDescs)
        }
    }

    return (
        <section className={`${isMobile ? 'px-4 py-12' : isTablet ? 'px-8 py-16' : 'px-16 py-20'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section heading */}
                <div className={`mb-12 ${layout === 'grid' ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}`}>
                    <EditableText
                        value={(content?.tagline as string) || 'Features'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Why choose us'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'} mb-3`}
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

                {/* Items */}
                {layout === 'grid' ? (
                    <div
                        className="grid gap-8"
                        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                    >
                        {items.map((item, i) => (
                            <DynamicListItem
                                key={i}
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={itemCount > 2}
                                editable={editable}
                                className="flex flex-col items-start space-y-3 p-6 border border-gray-100"
                            >
                                <span className="text-3xl font-bold text-gray-200">{item.number}</span>
                                <EditableText
                                    value={item.title}
                                    onChange={(v) => {
                                        const updated = [...titles]
                                        updated[i] = v
                                        onContentChange?.('titles', updated)
                                    }}
                                    as="h3"
                                    className="font-semibold text-gray-900"
                                    editable={editable}
                                />
                                {showDescription && (
                                    <EditableText
                                        value={item.description}
                                        onChange={(v) => {
                                            const updated = [...descriptions]
                                            updated[i] = v
                                            onContentChange?.('descriptions', updated)
                                        }}
                                        as="p"
                                        className="text-sm text-gray-500 leading-relaxed"
                                        editable={editable}
                                        multiline
                                    />
                                )}
                            </DynamicListItem>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-0">
                        {items.map((item, i) => (
                            <div key={i}>
                                {editable && i === 0 && (
                                    <InsertDot onInsert={() => {
                                        onContentChange?.('titles', insertListItem(titles, 0, `Feature ${itemCount + 1}`))
                                        onContentChange?.('descriptions', insertListItem(descriptions, 0, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'))
                                    }} />
                                )}
                                <DynamicListItem
                                    index={i}
                                    selectedIndex={selectedIndex}
                                    onSelect={setSelectedIndex}
                                    onDelete={() => removeItem(i)}
                                    deletable={itemCount > 2}
                                    editable={editable}
                                    className={`flex gap-6 py-6 ${showDividers && i > 0 ? 'border-t border-gray-200' : ''}`}
                                >
                                    <span className="text-4xl font-bold text-gray-200 flex-shrink-0 w-16">
                                        {item.number}
                                    </span>
                                    <div className="flex-1">
                                        <EditableText
                                            value={item.title}
                                            onChange={(v) => {
                                                const updated = [...titles]
                                                updated[i] = v
                                                onContentChange?.('titles', updated)
                                            }}
                                            as="h3"
                                            className="font-semibold text-gray-900 mb-1"
                                            editable={editable}
                                        />
                                        {showDescription && (
                                            <EditableText
                                                value={item.description}
                                                onChange={(v) => {
                                                    const updated = [...descriptions]
                                                    updated[i] = v
                                                    onContentChange?.('descriptions', updated)
                                                }}
                                                as="p"
                                                className="text-sm text-gray-500 leading-relaxed"
                                                editable={editable}
                                                multiline
                                            />
                                        )}
                                    </div>
                                </DynamicListItem>
                                {editable && (
                                    <InsertDot onInsert={() => {
                                        onContentChange?.('titles', insertListItem(titles, i + 1, `Feature ${itemCount + 1}`))
                                        onContentChange?.('descriptions', insertListItem(descriptions, i + 1, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'))
                                    }} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {editable && layout === 'grid' && (
                    <InsertDot onInsert={addItem} className="mt-2" />
                )}
            </div>
        </section>
    )
}

export const FeaturesNumberedFamily: TemplateFamily = {
    id: 'features-numbered',
    category: 'features',
    name: 'Numbered Features',
    description: 'Feature items with prominent number markers',
    tags: ['numbered', 'sequence', 'features', 'list', 'ordered'],
    Canvas,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
            ],
            defaultValue: 'grid',
        },
        {
            key: 'showDividers',
            label: 'Dividers',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDescription',
            label: 'Description',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        layout: 'grid',
        showDividers: true,
        showDescription: true,
    },
    defaultContent: {
        tagline: 'Features',
        heading: 'Why choose us',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        titles: ['Feature one', 'Feature two', 'Feature three', 'Feature four'],
        descriptions: Array(4).fill('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'),
    },
}
