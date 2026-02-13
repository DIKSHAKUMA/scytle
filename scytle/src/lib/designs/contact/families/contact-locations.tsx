'use client'

/**
 * Contact Locations Family — Multi-location office/branch cards.
 * Covers Relume Contact 25-30: location cards with images, addresses, directions.
 *
 * Controls:
 * - columns: 2 | 3
 * - titleAlign: left | center
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
    const columns = Number(controls?.columns ?? 3)
    const titleAlign = (controls?.titleAlign as string) ?? 'center'
    const showImage = controls?.showImage !== false
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns

    const locationNames = (content?.locationNames as string[]) ?? ['New York', 'London', 'Tokyo']
    const locationAddresses = (content?.locationAddresses as string[]) ?? ['123 Broadway, NY 10001', '456 Oxford St, London W1A', '789 Shibuya, Tokyo 150-8512']
    const locationPhones = (content?.locationPhones as string[]) ?? ['+1 (212) 555-0100', '+44 20 7946 0958', '+81 3-1234-5678']
    const itemCount = locationNames.length

    const insertItem = (index: number) => {
        onContentChange?.('locationNames', insertListItem(locationNames, index, 'City'))
        onContentChange?.('locationAddresses', insertListItem(locationAddresses, index, '123 Street, City'))
        onContentChange?.('locationPhones', insertListItem(locationPhones, index, '+1 (555) 000-0000'))
    }

    const removeItem = (index: number) => {
        const newN = removeListItem(locationNames, index, 1)
        const newA = removeListItem(locationAddresses, index, 1)
        const newP = removeListItem(locationPhones, index, 1)
        if (newN && newA && newP) {
            onContentChange?.('locationNames', newN)
            onContentChange?.('locationAddresses', newA)
            onContentChange?.('locationPhones', newP)
        }
    }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`mb-12 ${titleAlign === 'center' ? 'text-center max-w-2xl mx-auto' : ''}`}>
                    <EditableText
                        value={(content?.tagline as string) || 'Locations'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Our offices'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Visit us at one of our locations around the world.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Location Cards Grid */}
                <div
                    className="grid gap-6"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {locationNames.map((name, i) => (
                        <DynamicListItem
                            key={i}
                            index={i}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                            onDelete={() => removeItem(i)}
                            deletable={itemCount > 1}
                            editable={editable}
                        >
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* Image */}
                                {showImage && (
                                    <div className="aspect-[16/9] bg-gray-100 border-b border-gray-200 flex items-center justify-center">
                                        <ImageIcon className="w-10 h-10 text-gray-300" />
                                    </div>
                                )}

                                {/* Info */}
                                <div className="p-6 space-y-3">
                                    <EditableText
                                        value={name}
                                        onChange={(v) => {
                                            const updated = [...locationNames]
                                            updated[i] = v
                                            onContentChange?.('locationNames', updated)
                                        }}
                                        as="h3"
                                        className="font-semibold text-gray-900 text-base"
                                        editable={editable}
                                    />
                                    <div className="space-y-2">
                                        <div className="flex items-start gap-2">
                                            <EditableIcon
                                                iconName={(content?.addressIcon as string) || 'MapPin'}
                                                onChange={(n) => onContentChange?.('addressIcon', n)}
                                                editable={editable}
                                                size="sm"
                                                className="mt-0.5 flex-shrink-0"
                                            />
                                            <EditableText
                                                value={locationAddresses[i] || '123 Street, City'}
                                                onChange={(v) => {
                                                    const updated = [...locationAddresses]
                                                    updated[i] = v
                                                    onContentChange?.('locationAddresses', updated)
                                                }}
                                                as="span"
                                                className="text-gray-500 text-sm"
                                                editable={editable}
                                            />
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <EditableIcon
                                                iconName={(content?.phoneIcon as string) || 'Phone'}
                                                onChange={(n) => onContentChange?.('phoneIcon', n)}
                                                editable={editable}
                                                size="sm"
                                                className="mt-0.5 flex-shrink-0"
                                            />
                                            <EditableText
                                                value={locationPhones[i] || '+1 (555) 000-0000'}
                                                onChange={(v) => {
                                                    const updated = [...locationPhones]
                                                    updated[i] = v
                                                    onContentChange?.('locationPhones', updated)
                                                }}
                                                as="span"
                                                className="text-gray-500 text-sm"
                                                editable={editable}
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-2">
                                        <span className="text-sm font-medium text-gray-700 underline underline-offset-2">
                                            Get directions →
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </DynamicListItem>
                    ))}
                </div>

                {editable && (
                    <InsertDot onInsert={() => insertItem(itemCount)} />
                )}
            </div>
        </section>
    )
}

export const ContactLocationsFamily: TemplateFamily = {
    id: 'contact-locations',
    category: 'contact',
    name: 'Contact Locations',
    description: 'Multi-location office/branch cards',
    tags: ['locations', 'offices', 'branches', 'map', 'address'],
    hasImage: true,
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
            key: 'showImage',
            label: 'Show Images',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        columns: '3',
        titleAlign: 'center',
        showImage: true,
    },
    defaultContent: {
        tagline: 'Locations',
        heading: 'Our offices',
        subheading: 'Visit us at one of our locations around the world.',
        locationNames: ['New York', 'London', 'Tokyo'],
        locationAddresses: ['123 Broadway, NY 10001', '456 Oxford St, London W1A', '789 Shibuya, Tokyo 150-8512'],
        locationPhones: ['+1 (212) 555-0100', '+44 20 7946 0958', '+81 3-1234-5678'],
        addressIcon: 'MapPin',
        phoneIcon: 'Phone',
    },
}
