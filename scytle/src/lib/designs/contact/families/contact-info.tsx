'use client'

/**
 * Contact Info Family — Contact details + info cards, no form.
 * Covers Relume Contact 15-24: info blocks, cards, icons, split/grid layouts.
 *
 * Controls:
 * - layout: split | grid
 * - itemLayout: list | cards
 * - showImage: boolean
 */

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'
import { DynamicListItem, InsertDot, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const layout = (controls?.layout as string) ?? 'grid'
    const itemLayout = (controls?.itemLayout as string) ?? 'cards'
    const showImage = controls?.showImage === true
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const infoLabels = (content?.infoLabels as string[]) ?? ['Email', 'Phone', 'Address']
    const infoValues = (content?.infoValues as string[]) ?? ['hello@example.com', '+1 (555) 000-0000', '123 Main St, City, Country']
    const infoIcons = (content?.infoIcons as string[]) ?? ['Mail', 'Phone', 'MapPin']
    const itemCount = infoLabels.length

    const gridCols = isMobile ? 1 : isTablet ? 2 : Math.min(itemCount, 3)

    const insertItem = (index: number) => {
        onContentChange?.('infoLabels', insertListItem(infoLabels, index, 'Info'))
        onContentChange?.('infoValues', insertListItem(infoValues, index, 'Details here'))
        onContentChange?.('infoIcons', insertListItem(infoIcons, index, 'Info'))
    }

    const removeItem = (index: number) => {
        const newL = removeListItem(infoLabels, index, 1)
        const newV = removeListItem(infoValues, index, 1)
        const newI = removeListItem(infoIcons, index, 1)
        if (newL && newV && newI) {
            onContentChange?.('infoLabels', newL)
            onContentChange?.('infoValues', newV)
            onContentChange?.('infoIcons', newI)
        }
    }

    const infoItems = (
        <div
            className={itemLayout === 'list' ? 'space-y-4' : 'grid gap-6'}
            style={itemLayout === 'cards' ? { gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` } : undefined}
        >
            {infoLabels.map((label, i) => (
                <DynamicListItem
                    key={i}
                    index={i}
                    selectedIndex={selectedIndex}
                    onSelect={setSelectedIndex}
                    onDelete={() => removeItem(i)}
                    deletable={itemCount > 1}
                    editable={editable}
                >
                    {itemLayout === 'cards' ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                            <div className="flex justify-center mb-3">
                                <EditableIcon
                                    iconName={infoIcons[i] || 'Mail'}
                                    onChange={(name) => {
                                        const updated = [...infoIcons]
                                        updated[i] = name
                                        onContentChange?.('infoIcons', updated)
                                    }}
                                    editable={editable}
                                    size="md"
                                />
                            </div>
                            <EditableText
                                value={label}
                                onChange={(v) => {
                                    const updated = [...infoLabels]
                                    updated[i] = v
                                    onContentChange?.('infoLabels', updated)
                                }}
                                as="div"
                                className="font-medium text-gray-900 text-sm mb-1"
                                editable={editable}
                            />
                            <EditableText
                                value={infoValues[i] || 'Details here'}
                                onChange={(v) => {
                                    const updated = [...infoValues]
                                    updated[i] = v
                                    onContentChange?.('infoValues', updated)
                                }}
                                as="div"
                                className="text-gray-500 text-sm"
                                editable={editable}
                            />
                        </div>
                    ) : (
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                <EditableIcon
                                    iconName={infoIcons[i] || 'Mail'}
                                    onChange={(name) => {
                                        const updated = [...infoIcons]
                                        updated[i] = name
                                        onContentChange?.('infoIcons', updated)
                                    }}
                                    editable={editable}
                                    size="sm"
                                />
                            </div>
                            <div>
                                <EditableText
                                    value={label}
                                    onChange={(v) => {
                                        const updated = [...infoLabels]
                                        updated[i] = v
                                        onContentChange?.('infoLabels', updated)
                                    }}
                                    as="div"
                                    className="font-medium text-gray-900 text-sm"
                                    editable={editable}
                                />
                                <EditableText
                                    value={infoValues[i] || 'Details here'}
                                    onChange={(v) => {
                                        const updated = [...infoValues]
                                        updated[i] = v
                                        onContentChange?.('infoValues', updated)
                                    }}
                                    as="div"
                                    className="text-gray-500 text-sm"
                                    editable={editable}
                                />
                            </div>
                        </div>
                    )}
                </DynamicListItem>
            ))}
            {editable && <InsertDot onInsert={() => insertItem(itemCount)} />}
        </div>
    )

    if (layout === 'split') {
        return (
            <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
                <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-10' : 'flex gap-16'}`}>
                    {/* Text + Info */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <EditableText
                                value={(content?.tagline as string) || 'Contact'}
                                onChange={(v) => onContentChange?.('tagline', v)}
                                as="p"
                                className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                                editable={editable}
                            />
                            <EditableText
                                value={(content?.heading as string) || 'Get in touch'}
                                onChange={(v) => onContentChange?.('heading', v)}
                                as="h2"
                                className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                                editable={editable}
                            />
                            <EditableText
                                value={(content?.subheading as string) || 'Reach out to us through any of these channels.'}
                                onChange={(v) => onContentChange?.('subheading', v)}
                                as="p"
                                className="text-gray-500"
                                editable={editable}
                                multiline
                            />
                        </div>
                        {infoItems}
                    </div>

                    {/* Image */}
                    {showImage && (
                        <div className={`${isMobile ? 'w-full' : 'flex-1'} aspect-[4/3] bg-gray-100 border border-gray-200 flex items-center justify-center`}>
                            <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                    )}
                </div>
            </section>
        )
    }

    // Grid layout
    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Contact'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Get in touch'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Reach out to us through any of these channels.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                </div>

                {infoItems}
            </div>
        </section>
    )
}

export const ContactInfoFamily: TemplateFamily = {
    id: 'contact-info',
    category: 'contact',
    name: 'Contact Info',
    description: 'Contact details and info cards without form',
    tags: ['info', 'cards', 'details', 'no-form', 'contact'],
    Canvas,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'grid', label: 'Grid' },
                { value: 'split', label: 'Split' },
            ],
            defaultValue: 'grid',
        },
        {
            key: 'itemLayout',
            label: 'Item Style',
            type: 'toggle-group',
            options: [
                { value: 'cards', label: 'Cards' },
                { value: 'list', label: 'List' },
            ],
            defaultValue: 'cards',
        },
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        layout: 'grid',
        itemLayout: 'cards',
        showImage: false,
    },
    defaultContent: {
        tagline: 'Contact',
        heading: 'Get in touch',
        subheading: 'Reach out to us through any of these channels.',
        infoLabels: ['Email', 'Phone', 'Address'],
        infoValues: ['hello@example.com', '+1 (555) 000-0000', '123 Main St, City, Country'],
        infoIcons: ['Mail', 'Phone', 'MapPin'],
    },
}
