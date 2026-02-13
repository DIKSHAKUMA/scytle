'use client'

/**
 * Testimonials Slider Family — Single focused quote with carousel navigation.
 * Covers Relume T7-T12: centered quote with slider dots/arrows, stars, logo.
 *
 * Controls:
 * - showAvatar: boolean
 * - showRating: boolean
 * - showArrows: boolean
 * - showLogo: boolean
 * - avatarLayout: stacked | inline
 */

import { Star } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import { EditableIcon } from '@/components/wireframe/editable-icon'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const showAvatar = controls?.showAvatar !== false
    const showRating = controls?.showRating !== false
    const showArrows = controls?.showArrows !== false
    const showLogo = controls?.showLogo === true
    const avatarLayout = (controls?.avatarLayout as string) ?? 'stacked'

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-3xl mx-auto text-center">
                {/* Company Logo */}
                {showLogo && (
                    <div className="mx-auto mb-6">
                        <EditableIcon
                            iconName={(content?.logoIcon as string) || 'Building2'}
                            onChange={(name) => onContentChange?.('logoIcon', name)}
                            editable={editable}
                            size="lg"
                        />
                    </div>
                )}

                {/* Section Header */}
                <EditableText
                    value={(content?.tagline as string) || 'Testimonials'}
                    onChange={(v) => onContentChange?.('tagline', v)}
                    as="p"
                    className="text-sm text-gray-400 uppercase tracking-wide mb-6"
                    editable={editable}
                />

                {showRating && (
                    <div className="flex gap-0.5 justify-center mb-6">
                        {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className="w-5 h-5 text-gray-300 fill-gray-300" />
                        ))}
                    </div>
                )}

                {/* Quote */}
                <EditableText
                    value={(content?.quote as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'}
                    onChange={(v) => onContentChange?.('quote', v)}
                    as="p"
                    className={`text-gray-700 leading-relaxed mb-8 ${isMobile ? 'text-base' : 'text-xl'}`}
                    editable={editable}
                    multiline
                />

                {/* Attribution */}
                {avatarLayout === 'inline' ? (
                    <div className="flex items-center justify-center gap-3">
                        {showAvatar && (
                            <div className="w-14 h-14 bg-gray-200 border border-gray-200 rounded-full flex-shrink-0" />
                        )}
                        <div className="text-left">
                            <EditableText
                                value={(content?.name as string) || 'Person Name'}
                                onChange={(v) => onContentChange?.('name', v)}
                                as="div"
                                className="font-medium text-gray-900"
                                editable={editable}
                            />
                            <EditableText
                                value={(content?.role as string) || 'Job Title, Company'}
                                onChange={(v) => onContentChange?.('role', v)}
                                as="div"
                                className="text-gray-500 text-sm"
                                editable={editable}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        {showAvatar && (
                            <div className="w-14 h-14 bg-gray-200 border border-gray-200 rounded-full" />
                        )}
                        <div>
                            <EditableText
                                value={(content?.name as string) || 'Person Name'}
                                onChange={(v) => onContentChange?.('name', v)}
                                as="div"
                                className="font-medium text-gray-900"
                                editable={editable}
                            />
                            <EditableText
                                value={(content?.role as string) || 'Job Title, Company'}
                                onChange={(v) => onContentChange?.('role', v)}
                                as="div"
                                className="text-gray-500 text-sm"
                                editable={editable}
                            />
                        </div>
                    </div>
                )}

                {/* Navigation Dots + Arrows */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    {showArrows && (
                        <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-400 text-xs">
                            ←
                        </div>
                    )}
                    <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-gray-800 rounded-full" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                        <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    </div>
                    {showArrows && (
                        <div className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center text-gray-400 text-xs">
                            →
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export const TestimonialsSliderFamily: TemplateFamily = {
    id: 'testimonials-slider',
    category: 'testimonials',
    name: 'Testimonial Slider',
    description: 'Single focused quote with carousel navigation',
    tags: ['slider', 'carousel', 'single', 'quote', 'navigation'],
    Canvas,
    controlsDef: [
        {
            key: 'showAvatar',
            label: 'Show Avatar',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showRating',
            label: 'Show Rating',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showArrows',
            label: 'Show Arrows',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showLogo',
            label: 'Show Logo',
            type: 'switch',
            defaultValue: false,
        },
        {
            key: 'avatarLayout',
            label: 'Avatar Layout',
            type: 'toggle-group',
            options: [
                { value: 'stacked', label: 'Stacked' },
                { value: 'inline', label: 'Inline' },
            ],
            defaultValue: 'stacked',
        },
    ],
    defaultControls: {
        showAvatar: true,
        showRating: true,
        showArrows: true,
        showLogo: false,
        avatarLayout: 'stacked',
    },
    defaultContent: {
        tagline: 'Testimonials',
        quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
        name: 'Person Name',
        role: 'Job Title, Company',
        logoIcon: 'Building2',
    },
}
