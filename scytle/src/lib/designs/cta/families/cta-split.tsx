'use client'

/**
 * CTA Split Family — Text on one side, image on the other.
 *
 * Controls:
 * - assetPlacement: left | right
 * - buttonCount: 1 | 2
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const assetPlacement = (controls?.assetPlacement as string) ?? 'right'
    const buttonCount = Number(controls?.buttonCount ?? 2)

    const flexDir = assetPlacement === 'left' ? 'flex-row-reverse' : 'flex-row'

    return (
        <section className={`bg-gray-50 ${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : `flex items-center gap-12 ${flexDir}`}`}>
                {/* Text Content */}
                <div className="flex-1 space-y-4">
                    <EditableText
                        value={(content?.heading as string) || 'Call to action heading goes here'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-600"
                        multiline
                        editable={editable}
                    />
                    <div className="flex gap-3 pt-2">
                        <div className="bg-gray-800 text-white px-5 py-2.5 text-sm font-medium">
                            <EditableText
                                value={(content?.primaryCta as string) || 'Get Started'}
                                onChange={(v) => onContentChange?.('primaryCta', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                        {buttonCount >= 2 && (
                            <div className="border border-gray-300 text-gray-700 px-5 py-2.5 text-sm font-medium">
                                <EditableText
                                    value={(content?.secondaryCta as string) || 'Learn More'}
                                    onChange={(v) => onContentChange?.('secondaryCta', v)}
                                    as="span"
                                    editable={editable}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Image Placeholder */}
                <div className={`${isMobile ? 'w-full' : 'flex-1'} aspect-[4/3] bg-gray-200 border border-gray-200 flex items-center justify-center`}>
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
            </div>
        </section>
    )
}

export const CtaSplitFamily: TemplateFamily = {
    id: 'cta-split',
    category: 'cta',
    name: 'Split CTA',
    description: 'Text on one side, image on the other',
    tags: ['split', 'image', 'conversion', 'cta'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'assetPlacement',
            label: 'Image Placement',
            type: 'toggle-group',
            options: [
                { value: 'left', label: '←', icon: 'ArrowLeft' },
                { value: 'right', label: '→', icon: 'ArrowRight' },
            ],
            defaultValue: 'right',
        },
        {
            key: 'buttonCount',
            label: 'Buttons',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '2',
        },
    ],
    defaultControls: {
        assetPlacement: 'right',
        buttonCount: '2',
    },
    defaultContent: {
        heading: 'Call to action heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        primaryCta: 'Get Started',
        secondaryCta: 'Learn More',
    },
}
