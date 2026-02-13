'use client'

/**
 * Testimonials Split Family — Image on one side, quote on the other.
 * Covers Relume T13-T16: large portrait/landscape image + single quote.
 *
 * Controls:
 * - imagePlacement: left | right
 * - showStars: boolean
 * - showLogo: boolean
 * - imageAspect: portrait | landscape
 */

import { ImageIcon, Star } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const imagePlacement = (controls?.imagePlacement as string) ?? 'left'
    const showStars = controls?.showStars !== false
    const showLogo = controls?.showLogo === true
    const imageAspect = (controls?.imageAspect as string) ?? 'portrait'

    const flexDir = imagePlacement === 'right' ? 'flex-row-reverse' : 'flex-row'
    const aspectClass = imageAspect === 'landscape' ? 'aspect-[4/3]' : 'aspect-[3/4]'

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : `flex items-center gap-12 ${flexDir}`}`}>
                {/* Image */}
                <div className={`${isMobile ? 'w-full' : 'flex-1'} ${aspectClass} bg-gray-100 border border-gray-200 flex items-center justify-center`}>
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>

                {/* Quote Content */}
                <div className="flex-1 space-y-6">
                    {/* Company Logo */}
                    {showLogo && (
                        <EditableIcon
                            iconName={(content?.logoIcon as string) || 'Building2'}
                            onChange={(name) => onContentChange?.('logoIcon', name)}
                            editable={editable}
                            size="lg"
                        />
                    )}

                    {/* Stars */}
                    {showStars && (
                        <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, s) => (
                                <Star key={s} className="w-5 h-5 text-gray-300 fill-gray-300" />
                            ))}
                        </div>
                    )}

                    {/* Quote */}
                    <EditableText
                        value={(content?.quote as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.'}
                        onChange={(v) => onContentChange?.('quote', v)}
                        as="p"
                        className={`text-gray-700 leading-relaxed ${isMobile ? 'text-base' : 'text-xl'}`}
                        editable={editable}
                        multiline
                    />

                    {/* Attribution */}
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 border border-gray-200 rounded-full flex-shrink-0" />
                        <div>
                            <EditableText
                                value={(content?.name as string) || 'Person Name'}
                                onChange={(v) => onContentChange?.('name', v)}
                                as="div"
                                className="font-medium text-gray-900 text-sm"
                                editable={editable}
                            />
                            <EditableText
                                value={(content?.role as string) || 'Job Title, Company'}
                                onChange={(v) => onContentChange?.('role', v)}
                                as="div"
                                className="text-gray-500 text-xs"
                                editable={editable}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const TestimonialsSplitFamily: TemplateFamily = {
    id: 'testimonials-split',
    category: 'testimonials',
    name: 'Testimonial Split',
    description: 'Image on one side, quote on the other',
    tags: ['split', 'image', 'side-by-side', 'portrait'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'imagePlacement',
            label: 'Image Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: '←', icon: 'ArrowLeft' },
                { value: 'right', label: '→', icon: 'ArrowRight' },
            ],
            defaultValue: 'left',
        },
        {
            key: 'imageAspect',
            label: 'Image Aspect',
            type: 'toggle-group',
            options: [
                { value: 'portrait', label: 'Tall' },
                { value: 'landscape', label: 'Wide' },
            ],
            defaultValue: 'portrait',
        },
        {
            key: 'showStars',
            label: 'Show Stars',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showLogo',
            label: 'Show Logo',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        imagePlacement: 'left',
        imageAspect: 'portrait',
        showStars: true,
        showLogo: false,
    },
    defaultContent: {
        quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare.',
        name: 'Person Name',
        role: 'Job Title, Company',
        logoIcon: 'Building2',
    },
}
