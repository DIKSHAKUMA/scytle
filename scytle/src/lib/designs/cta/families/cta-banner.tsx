'use client'

/**
 * CTA Banner Family — Full-width call-to-action banner.
 *
 * Controls:
 * - textAlign: left | center | right
 * - buttonCount: 1 | 2
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const textAlign = (controls?.textAlign as string) ?? 'center'
    const buttonCount = Number(controls?.buttonCount ?? 2)

    const alignClass = textAlign === 'center' ? 'text-center items-center' : textAlign === 'right' ? 'text-right items-end' : 'text-left items-start'
    const justifyClass = textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : ''

    return (
        <section className={`bg-gray-50 border-t border-b border-gray-200 ${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`max-w-3xl ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : ''} flex flex-col ${alignClass} space-y-4`}>
                <EditableText
                    value={(content?.heading as string) || 'Call to action heading goes here'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                    editable={editable}
                />
                <EditableText
                    value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                    onChange={(v) => onContentChange?.('subheading', v)}
                    as="p"
                    className="text-gray-600 text-base"
                    multiline
                    editable={editable}
                />
                <div className={`flex gap-3 pt-2 ${justifyClass}`}>
                    <div className="bg-gray-800 text-white px-6 py-3 text-sm font-medium">
                        <EditableText
                            value={(content?.primaryCta as string) || 'Get Started'}
                            onChange={(v) => onContentChange?.('primaryCta', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                    {buttonCount >= 2 && (
                        <div className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium">
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
        </section>
    )
}

export const CtaBannerFamily: TemplateFamily = {
    id: 'cta-banner',
    category: 'cta',
    name: 'Banner CTA',
    description: 'Full-width call-to-action banner',
    tags: ['banner', 'full-width', 'conversion', 'cta'],
    Canvas,
    controlsDef: [
        {
            key: 'textAlign',
            label: 'Text Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
                { value: 'right', label: 'Right', icon: 'AlignRight' },
            ],
            defaultValue: 'center',
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
        textAlign: 'center',
        buttonCount: '2',
    },
    defaultContent: {
        heading: 'Call to action heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        primaryCta: 'Get Started',
        secondaryCta: 'Learn More',
    },
}
