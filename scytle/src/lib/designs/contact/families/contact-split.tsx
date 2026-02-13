'use client'

/**
 * Contact Split Family — Form on one side, info on the other.
 *
 * Controls:
 * - formPlacement: left | right
 */

import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'
import { DynamicListItem, InsertDot, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const formPlacement = (controls?.formPlacement as string) ?? 'right'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const flexDir = formPlacement === 'left' ? 'flex-row-reverse' : 'flex-row'

    const infoLabels = (content?.infoLabels as string[]) ?? ['Email', 'Phone', 'Address']
    const infoValues = (content?.infoValues as string[]) ?? ['hello@example.com', '+1 (555) 000-0000', '123 Main St, City, Country']
    const infoIcons = (content?.infoIcons as string[]) ?? ['Mail', 'Phone', 'MapPin']
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

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-10' : `flex gap-16 ${flexDir}`}`}>
                {/* Info Side */}
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
                            value={(content?.subheading as string) || 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.'}
                            onChange={(v) => onContentChange?.('subheading', v)}
                            as="p"
                            className="text-gray-500"
                            editable={editable}
                            multiline
                        />
                    </div>

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
                            </DynamicListItem>
                        ))}
                        {editable && <InsertDot onInsert={() => insertItem(itemCount)} />}
                    </div>
                </div>

                {/* Form Side */}
                <div className="flex-1">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 space-y-4">
                        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">First Name</div>
                                <div className="h-10 bg-white border border-gray-200 rounded" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Last Name</div>
                                <div className="h-10 bg-white border border-gray-200 rounded" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Email</div>
                            <div className="h-10 bg-white border border-gray-200 rounded" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Message</div>
                            <div className="h-24 bg-white border border-gray-200 rounded" />
                        </div>
                        <div className="bg-gray-800 text-white text-center py-2.5 text-sm font-medium">
                            Send Message
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const ContactSplitFamily: TemplateFamily = {
    id: 'contact-split',
    category: 'contact',
    name: 'Contact Split',
    description: 'Form + info side by side',
    tags: ['split', 'form', 'info', 'contact'],
    hasForm: true,
    Canvas,
    controlsDef: [
        {
            key: 'formPlacement',
            label: 'Form Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: '←', icon: 'ArrowLeft' },
                { value: 'right', label: '→', icon: 'ArrowRight' },
            ],
            defaultValue: 'right',
        },
    ],
    defaultControls: {
        formPlacement: 'right',
    },
    defaultContent: {
        tagline: 'Contact',
        heading: 'Get in touch',
        subheading: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
        infoLabels: ['Email', 'Phone', 'Address'],
        infoValues: ['hello@example.com', '+1 (555) 000-0000', '123 Main St, City, Country'],
        infoIcons: ['Mail', 'Phone', 'MapPin'],
    },
}
