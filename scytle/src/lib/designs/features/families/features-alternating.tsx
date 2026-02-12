'use client'

/**
 * Features Split Family — Alternating image + text rows.
 *
 * Controls:
 * - startPlacement: left | right (which side the first image goes)
 * - itemCount: 2 | 3 | 4
 * - showButton: boolean
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const startPlacement = (controls?.startPlacement as string) ?? 'right'
    const itemCount = Number(controls?.itemCount ?? 3)
    const showButton = controls?.showButton !== false
    const imageAspect = (controls?.imageAspect as string) ?? '4:3'
    const aspectMap: Record<string, string> = { '4:3': 'aspect-[4/3]', '16:9': 'aspect-[16/9]', '1:1': 'aspect-square' }

    const features = Array.from({ length: itemCount }, (_, i) => ({
        title: `Feature heading ${i + 1}`,
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    }))

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Features'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Product features overview'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Alternating Rows */}
                {features.map((feature, i) => {
                    const imageOnRight = startPlacement === 'right' ? i % 2 === 0 : i % 2 !== 0
                    const flexDir = imageOnRight ? 'flex-row' : 'flex-row-reverse'

                    return (
                        <div
                            key={i}
                            className={`${isMobile ? 'flex flex-col gap-8' : `flex items-center gap-12 ${flexDir}`}`}
                        >
                            {/* Text */}
                            <div className="flex-1 space-y-3">
                                <h3 className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
                                    {feature.title}
                                </h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                                {showButton && (
                                    <div className="pt-2">
                                        <div className="inline-block border border-gray-300 text-gray-700 px-5 py-2 text-sm font-medium">
                                            Learn More
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Image Placeholder */}
                            <div className={`${isMobile ? 'w-full' : 'flex-1'} ${aspectMap[imageAspect] ?? 'aspect-[4/3]'} bg-gray-100 border border-gray-200 flex items-center justify-center`}>
                                <ImageIcon className="w-10 h-10 text-gray-300" />
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}

export const FeaturesSplitFamily: TemplateFamily = {
    id: 'features-split',
    category: 'features',
    name: 'Features Split',
    description: 'Alternating image + text rows',
    tags: ['split', 'alternating', 'image', 'features'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'startPlacement',
            label: 'First Image Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: '←', icon: 'ArrowLeft' },
                { value: 'right', label: '→', icon: 'ArrowRight' },
            ],
            defaultValue: 'right',
        },
        {
            key: 'itemCount',
            label: 'Rows',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showButton',
            label: 'Show Button',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'imageAspect',
            label: 'Image Ratio',
            type: 'toggle-group',
            options: [
                { value: '4:3', label: '4:3' },
                { value: '16:9', label: '16:9' },
                { value: '1:1', label: '1:1' },
            ],
            defaultValue: '4:3',
        },
    ],
    defaultControls: {
        startPlacement: 'right',
        itemCount: '3',
        showButton: true,
        imageAspect: '4:3',
    },
    defaultContent: {
        tagline: 'Features',
        heading: 'Product features overview',
    },
}
