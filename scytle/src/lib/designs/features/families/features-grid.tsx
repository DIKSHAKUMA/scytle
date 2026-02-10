'use client'

/**
 * Features Grid Family — Icon + title + description cards in a grid.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - showIcon: boolean
 * - textAlign: left | center
 * - itemCount: 3 | 4 | 6 | 8
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const columns = Number(controls?.columns ?? 3)
    const showIcon = controls?.showIcon !== false
    const textAlign = (controls?.textAlign as string) ?? 'center'
    const itemCount = Number(controls?.itemCount ?? 6)

    const gridCols = isMobile ? 1 : isTablet ? 2 : columns
    const alignClass = textAlign === 'center' ? 'text-center items-center' : 'text-left items-start'

    const features = Array.from({ length: itemCount }, (_, i) => ({
        title: `Feature ${i + 1}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    }))

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`mb-12 ${textAlign === 'center' ? 'text-center max-w-2xl mx-auto' : 'max-w-2xl'}`}>
                    <EditableText
                        value={(content?.tagline as string) || 'Features'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Product features that stand out'}
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

                {/* Feature Grid */}
                <div
                    className="grid gap-8"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {features.map((feature, i) => (
                        <div key={i} className={`flex flex-col ${alignClass} space-y-2`}>
                            {showIcon && (
                                <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center mb-1">
                                    <div className="w-5 h-5 bg-gray-300 rounded" />
                                </div>
                            )}
                            <h3 className="font-semibold text-gray-900 text-sm">
                                {feature.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const FeaturesGridFamily: TemplateFamily = {
    id: 'features-grid',
    category: 'features',
    name: 'Features Grid',
    description: 'Icon cards in a responsive grid layout',
    tags: ['grid', 'icons', 'cards', 'features'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'itemCount',
            label: 'Items',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
                { value: '8', label: '8' },
            ],
            defaultValue: '6',
        },
        {
            key: 'showIcon',
            label: 'Show Icons',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'textAlign',
            label: 'Text Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
            defaultValue: 'center',
        },
    ],
    defaultControls: {
        columns: '3',
        itemCount: '6',
        showIcon: true,
        textAlign: 'center',
    },
    defaultContent: {
        tagline: 'Features',
        heading: 'Product features that stand out',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    },
}
