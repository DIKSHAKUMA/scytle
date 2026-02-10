'use client'

/**
 * Contact Simple Family — Centered contact form.
 *
 * Controls:
 * - showSubject: boolean
 * - showPhone: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const showSubject = controls?.showSubject !== false
    const showPhone = controls?.showPhone === true

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-8">
                    <EditableText
                        value={(content?.tagline as string) || 'Contact'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Contact us'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Fill out the form below and we\'ll get back to you.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Form */}
                <div className="space-y-4">
                    <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">First Name</div>
                            <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Last Name</div>
                            <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Email</div>
                        <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                    </div>
                    {showPhone && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Phone</div>
                            <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                        </div>
                    )}
                    {showSubject && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Subject</div>
                            <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                        </div>
                    )}
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Message</div>
                        <div className="h-28 bg-gray-50 border border-gray-200 rounded" />
                    </div>
                    <div className="bg-gray-800 text-white text-center py-2.5 text-sm font-medium w-full">
                        Send Message
                    </div>
                </div>
            </div>
        </section>
    )
}

export const ContactSimpleFamily: TemplateFamily = {
    id: 'contact-simple',
    category: 'contact',
    name: 'Contact Simple',
    description: 'Centered contact form',
    tags: ['simple', 'centered', 'form', 'contact'],
    hasForm: true,
    Canvas,
    controlsDef: [
        {
            key: 'showSubject',
            label: 'Subject Field',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showPhone',
            label: 'Phone Field',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        showSubject: true,
        showPhone: false,
    },
    defaultContent: {
        tagline: 'Contact',
        heading: 'Contact us',
        subheading: 'Fill out the form below and we\'ll get back to you.',
    },
}
