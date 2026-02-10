'use client'

/**
 * Testimonials Simple Family — Centered quote, minimal layout.
 *
 * Controls:
 * - showAvatar: boolean
 * - showLogo: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const showAvatar = controls?.showAvatar !== false
    const showLogo = controls?.showLogo === true

    return (
        <section className={`bg-gray-50 ${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-2xl mx-auto text-center">
                {showLogo && (
                    <div className="w-20 h-8 bg-gray-200 border border-gray-200 rounded mx-auto mb-6" />
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

                {/* Attribution */}
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
            </div>
        </section>
    )
}

export const TestimonialsSimpleFamily: TemplateFamily = {
    id: 'testimonials-simple',
    category: 'testimonials',
    name: 'Simple Testimonial',
    description: 'Centered quote with minimal layout',
    tags: ['simple', 'centered', 'minimal', 'quote'],
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
    ],
    defaultControls: {
        showAvatar: true,
        showLogo: false,
    },
    defaultContent: {
        quote: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        name: 'Person Name',
        role: 'Job Title, Company',
    },
}
