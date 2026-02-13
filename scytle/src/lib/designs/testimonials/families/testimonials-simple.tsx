'use client'

/**
 * Testimonials Simple Family — Centered single quote, minimal layout.
 * Covers Relume T1-T6: centered quote with optional stars, logo, avatar variants.
 *
 * Controls:
 * - showAvatar: boolean
 * - showLogo: boolean
 * - showStars: boolean
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
    const showLogo = controls?.showLogo === true
    const showStars = controls?.showStars === true
    const avatarLayout = (controls?.avatarLayout as string) ?? 'stacked'

    return (
        <section className={`bg-gray-50 ${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-2xl mx-auto text-center">
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

                {/* Star Rating (above quote) */}
                {showStars && (
                    <div className="flex gap-1 justify-center mb-4">
                        {Array.from({ length: 5 }).map((_, s) => (
                            <Star key={s} className="w-4 h-4 text-gray-300 fill-gray-300" />
                        ))}
                    </div>
                )}

                {/* Quote */}
                <EditableText
                    value={(content?.quote as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                    onChange={(v) => onContentChange?.('quote', v)}
                    as="p"
                    className={`text-gray-700 leading-relaxed mb-6 ${isMobile ? 'text-base' : 'text-lg'}`}
                    editable={editable}
                    multiline
                />

                {/* Attribution — stacked or inline */}
                {avatarLayout === 'inline' ? (
                    <div className="flex items-center justify-center gap-3">
                        {showAvatar && (
                            <div className="w-12 h-12 bg-gray-200 border border-gray-200 rounded-full flex-shrink-0" />
                        )}
                        <div className="text-left">
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
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        {showAvatar && (
                            <div className="w-12 h-12 bg-gray-200 border border-gray-200 rounded-full" />
                        )}
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
                )}
            </div>
        </section>
    )
}

export const TestimonialsSimpleFamily: TemplateFamily = {
    id: 'testimonials-simple',
    category: 'testimonials',
    name: 'Simple Testimonial',
    description: 'Centered single quote with optional stars, logo, avatar',
    tags: ['simple', 'centered', 'minimal', 'quote', 'single'],
    Canvas,
    controlsDef: [
        {
            key: 'showAvatar',
            label: 'Show Avatar',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showLogo',
            label: 'Show Company Logo',
            type: 'switch',
            defaultValue: false,
        },
        {
            key: 'showStars',
            label: 'Show Stars',
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
        showLogo: false,
        showStars: false,
        avatarLayout: 'stacked',
    },
    defaultContent: {
        quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        name: 'Person Name',
        role: 'Job Title, Company',
        logoIcon: 'Building2',
    },
}
