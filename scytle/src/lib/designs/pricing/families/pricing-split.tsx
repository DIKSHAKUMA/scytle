'use client'

/**
 * Pricing Split Family — Split layout: heading + features left, pricing card right.
 *
 * Controls:
 * - showFeatures: boolean
 * - showLogos: boolean
 * - showIcon: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'
import { DynamicListItem, InsertDot, addListItem, insertListItem, removeListItem } from '@/components/wireframe/dynamic-list'
import { useState } from 'react'
import { Check } from 'lucide-react'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const showFeatures = controls?.showFeatures !== false
    const showLogos = controls?.showLogos === true
    const showIcon = controls?.showIcon !== false

    const featureTitles = (content?.featureTitles as string[]) ?? ['Key feature heading', 'Key feature heading', 'Key feature heading', 'Key feature heading']
    const featureDescriptions = (content?.featureDescriptions as string[]) ?? [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    ]
    const icons = (content?.icons as string[]) ?? ['Layers', 'Zap', 'Shield', 'Target']
    const featureCount = featureTitles.length
    const checkIcon = (content?.checkIcon as string) || 'Check'

    const addItem = () => {
        onContentChange?.('featureTitles', addListItem(featureTitles, `Key feature heading`))
        onContentChange?.('featureDescriptions', addListItem(featureDescriptions, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'))
        onContentChange?.('icons', addListItem(icons, 'Star'))
    }
    const removeItem = (index: number) => {
        const newTitles = removeListItem(featureTitles, index, 2)
        const newDescs = removeListItem(featureDescriptions, index, 2)
        const newIcons = removeListItem(icons, index, 2)
        if (newTitles && newDescs && newIcons) {
            onContentChange?.('featureTitles', newTitles)
            onContentChange?.('featureDescriptions', newDescs)
            onContentChange?.('icons', newIcons)
        }
    }
    const insertItem = (index: number) => {
        onContentChange?.('featureTitles', insertListItem(featureTitles, index, `Key feature heading`))
        onContentChange?.('featureDescriptions', insertListItem(featureDescriptions, index, 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'))
        onContentChange?.('icons', insertListItem(icons, index, 'Star'))
    }

    const cardFeatures = Array.from({ length: 10 }, () => `Feature text goes here`)

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`max-w-7xl mx-auto ${isMobile ? 'space-y-10' : 'flex gap-12 items-start'}`}>
                {/* Left: Heading + Features */}
                <div className={`${isMobile ? '' : 'w-1/2'} space-y-6`}>
                    <div>
                        <EditableText
                            value={(content?.tagline as string) || 'Tagline'}
                            onChange={(v) => onContentChange?.('tagline', v)}
                            as="p"
                            className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.heading as string) || 'Pricing plan'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h2"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'} mb-3`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                            onChange={(v) => onContentChange?.('subheading', v)}
                            as="p"
                            className="text-gray-500 leading-relaxed"
                            editable={editable}
                            multiline
                        />
                    </div>

                    {showFeatures && (
                        <div className="space-y-5 pt-4">
                            {Array.from({ length: featureCount }).map((_, i) => (
                                <div key={i}>
                                    {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                                    <DynamicListItem
                                        index={i}
                                        selectedIndex={selectedIndex}
                                        onSelect={setSelectedIndex}
                                        onDelete={() => removeItem(i)}
                                        deletable={featureCount > 2}
                                        editable={editable}
                                        className="flex gap-3"
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
                                                size="md"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <EditableText
                                                value={featureTitles[i] || 'Key feature heading'}
                                                onChange={(v) => {
                                                    const updated = [...featureTitles]
                                                    updated[i] = v
                                                    onContentChange?.('featureTitles', updated)
                                                }}
                                                as="h4"
                                                className="text-sm font-semibold text-gray-900 mb-1"
                                                editable={editable}
                                            />
                                            <EditableText
                                                value={featureDescriptions[i] || 'Description goes here.'}
                                                onChange={(v) => {
                                                    const updated = [...featureDescriptions]
                                                    updated[i] = v
                                                    onContentChange?.('featureDescriptions', updated)
                                                }}
                                                as="p"
                                                className="text-sm text-gray-500 leading-relaxed"
                                                editable={editable}
                                                multiline
                                            />
                                        </div>
                                    </DynamicListItem>
                                    {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                                </div>
                            ))}
                        </div>
                    )}

                    {showLogos && (
                        <div className="pt-4">
                            <div className="text-xs font-semibold text-gray-500 mb-3">Used by the world&apos;s leading companies</div>
                            <div className="flex gap-6">
                                {['Logo', 'Logo', 'Logo', 'Logo'].map((logo, i) => (
                                    <div key={i} className="flex items-center gap-1.5">
                                        <EditableIcon
                                            iconName={(content?.logoIcons as string[])?.[i] || ['Building2', 'Globe', 'Briefcase', 'Award'][i]}
                                            onChange={(name) => {
                                                const updated = [...((content?.logoIcons as string[]) ?? ['Building2', 'Globe', 'Briefcase', 'Award'])]
                                                updated[i] = name
                                                onContentChange?.('logoIcons', updated)
                                            }}
                                            editable={editable}
                                            size="sm"
                                        />
                                        <span className="text-xs font-medium text-gray-500">{logo}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Pricing Card */}
                <div className={`${isMobile ? '' : 'w-1/2'}`}>
                    <div className="border border-gray-200 rounded-lg p-6">
                        <div className="flex items-start justify-between mb-2">
                            <div>
                                <h3 className="font-semibold text-gray-900 text-base">Basic plan</h3>
                                <p className="text-sm text-gray-500">Lorem ipsum dolor sit amet</p>
                            </div>
                            <span className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}>
                                $19<span className="text-base font-normal text-gray-400">/mo</span>
                            </span>
                        </div>
                        <div className="border-t border-gray-200 my-4" />
                        <div className="text-xs font-medium text-gray-500 mb-3">Includes:</div>
                        <div className={`${isMobile ? '' : 'grid grid-cols-2'} gap-x-6 gap-y-2.5`}>
                            {cardFeatures.map((feature, i) => (
                                <div key={i} className="flex items-center gap-2 text-sm text-gray-600 py-0.5">
                                    <EditableIcon
                                        iconName={checkIcon}
                                        onChange={(name) => onContentChange?.('checkIcon', name)}
                                        editable={editable}
                                        size="sm"
                                        className="w-5 h-5"
                                        iconClassName="w-3 h-3 text-gray-400"
                                    />
                                    {feature}
                                </div>
                            ))}
                        </div>
                        <div className="border-t border-gray-200 my-4" />
                        <div className="bg-gray-800 text-white text-center py-2.5 text-sm font-medium">
                            Get started
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const PricingSplitFamily: TemplateFamily = {
    id: 'pricing-split',
    category: 'pricing',
    name: 'Pricing Split',
    description: 'Heading + features left, pricing card right',
    tags: ['split', 'asymmetric', 'hero', 'single-plan', 'pricing'],
    Canvas,
    controlsDef: [
        {
            key: 'showFeatures',
            label: 'Show Key Features',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showIcon',
            label: 'Show Feature Icons',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showLogos',
            label: 'Show Logo Cloud',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        showFeatures: true,
        showIcon: true,
        showLogos: false,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Pricing plan',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        featureTitles: ['Key feature heading', 'Key feature heading', 'Key feature heading', 'Key feature heading'],
        featureDescriptions: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        ],
        icons: ['Layers', 'Zap', 'Shield', 'Target'],
        checkIcon: 'Check',
        logoIcons: ['Building2', 'Globe', 'Briefcase', 'Award'],
    },
}
