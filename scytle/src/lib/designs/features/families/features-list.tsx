'use client'

/**
 * Features List Family — Vertical list of features with icons.
 *
 * Controls:
 * - showIcon: boolean
 * - showDividers: boolean
 * - itemCount: 3 | 4 | 5 | 6
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const showIcon = controls?.showIcon !== false
    const showDividers = controls?.showDividers !== false
    const itemCount = Number(controls?.itemCount ?? 4)

    const features = Array.from({ length: itemCount }, (_, i) => ({
        title: `Feature ${i + 1}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    }))

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-3xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <EditableText
                        value={(content?.tagline as string) || 'Features'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Why choose our product'}
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

                {/* Feature List */}
                <div className="space-y-0">
                    {features.map((feature, i) => (
                        <div
                            key={i}
                            className={`flex items-start gap-4 py-5 ${showDividers && i < itemCount - 1 ? 'border-b border-gray-100' : ''
                                }`}
                        >
                            {showIcon && (
                                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <div className="w-5 h-5 bg-gray-300 rounded" />
                                </div>
                            )}
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const FeaturesListFamily: TemplateFamily = {
    id: 'features-list',
    category: 'features',
    name: 'Features List',
    description: 'Vertical list of features with icons',
    tags: ['list', 'icons', 'vertical', 'features'],
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Items',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
            ],
            defaultValue: '4',
        },
        {
            key: 'showIcon',
            label: 'Show Icons',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDividers',
            label: 'Show Dividers',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        itemCount: '4',
        showIcon: true,
        showDividers: true,
    },
    defaultContent: {
        tagline: 'Features',
        heading: 'Why choose our product',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
}
