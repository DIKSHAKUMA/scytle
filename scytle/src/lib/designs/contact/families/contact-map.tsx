'use client'

/**
 * Contact Map Family — Contact info with map placeholder.
 *
 * Controls:
 * - mapPlacement: top | bottom
 * - showForm: boolean
 */

import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'
import { DynamicListItem, InsertDot, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const mapPlacement = (controls?.mapPlacement as string) ?? 'top'
    const showForm = controls?.showForm !== false
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const infoLabels = (content?.infoLabels as string[]) ?? ['Address', 'Email', 'Phone', 'Hours']
    const infoValues = (content?.infoValues as string[]) ?? ['123 Main St, City, Country', 'hello@example.com', '+1 (555) 000-0000', 'Mon-Fri 9am-5pm']
    const infoIcons = (content?.infoIcons as string[]) ?? ['MapPin', 'Mail', 'Phone', 'Clock']
    const itemCount = infoLabels.length

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

    const mapBlock = (
        <div className="w-full aspect-[16/7] bg-gray-100 border border-gray-200 flex items-center justify-center">
            <div className="text-center">
                <EditableIcon
                    iconName={(content?.mapIcon as string) || 'MapPin'}
                    onChange={(name) => onContentChange?.('mapIcon', name)}
                    editable={editable}
                    size="lg"
                />
                <div className="text-xs text-gray-400 mt-2">Map Placeholder</div>
            </div>
        </div>
    )

    const infoBlock = (
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-8' : isTablet ? 'px-8 py-12' : 'px-16 py-16'}`}>
            <div className={`${isMobile ? 'flex flex-col gap-8' : 'flex gap-16'}`}>
                {/* Contact Info */}
                <div className="flex-1 space-y-4">
                    <EditableText
                        value={(content?.heading as string) || 'Visit us'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Come visit our office or reach out through the form.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500 mb-6"
                        editable={editable}
                        multiline
                    />

                    <div className="space-y-4">
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
                                <div className="flex items-start gap-3">
                                    <EditableIcon
                                        iconName={infoIcons[i] || 'Info'}
                                        onChange={(name) => {
                                            const updated = [...infoIcons]
                                            updated[i] = name
                                            onContentChange?.('infoIcons', updated)
                                        }}
                                        editable={editable}
                                        size="sm"
                                        className="mt-0.5 flex-shrink-0"
                                    />
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
                            </DynamicListItem>
                        ))}
                        {editable && <InsertDot onInsert={() => insertItem(itemCount)} />}
                    </div>
                </div>

                {/* Optional Form */}
                {showForm && (
                    <div className="flex-1">
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Name</div>
                                <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Email</div>
                                <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Message</div>
                                <div className="h-24 bg-gray-50 border border-gray-200 rounded" />
                            </div>
                            <div className="bg-gray-800 text-white text-center py-2.5 text-sm font-medium">
                                Send Message
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <section>
            {mapPlacement === 'top' ? (
                <>
                    {mapBlock}
                    {infoBlock}
                </>
            ) : (
                <>
                    {infoBlock}
                    {mapBlock}
                </>
            )}
        </section>
    )
}

export const ContactMapFamily: TemplateFamily = {
    id: 'contact-map',
    category: 'contact',
    name: 'Contact with Map',
    description: 'Contact info with map placeholder',
    tags: ['map', 'location', 'address', 'contact'],
    hasForm: true,
    Canvas,
    controlsDef: [
        {
            key: 'mapPlacement',
            label: 'Map Position',
            type: 'toggle-group',
            options: [
                { value: 'top', label: 'Top' },
                { value: 'bottom', label: 'Bottom' },
            ],
            defaultValue: 'top',
        },
        {
            key: 'showForm',
            label: 'Show Form',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        mapPlacement: 'top',
        showForm: true,
    },
    defaultContent: {
        heading: 'Visit us',
        subheading: 'Come visit our office or reach out through the form.',
        mapIcon: 'MapPin',
        infoLabels: ['Address', 'Email', 'Phone', 'Hours'],
        infoValues: ['123 Main St, City, Country', 'hello@example.com', '+1 (555) 000-0000', 'Mon-Fri 9am-5pm'],
        infoIcons: ['MapPin', 'Mail', 'Phone', 'Clock'],
    },
}
