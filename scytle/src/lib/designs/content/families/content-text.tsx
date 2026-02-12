'use client'

/**
 * Content Text Family — Simple text section with heading + body.
 *
 * Controls:
 * - textAlign: left | center
 * - showButton: boolean
 * - maxWidth: narrow | medium | wide
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const textAlign = (controls?.textAlign as string) ?? 'center'
    const showButton = controls?.showButton === true
    const maxWidth = (controls?.maxWidth as string) ?? 'medium'
    const showSecondParagraph = controls?.showSecondParagraph !== false

    const widthClass = maxWidth === 'narrow' ? 'max-w-xl' : maxWidth === 'wide' ? 'max-w-4xl' : 'max-w-2xl'
    const alignClass = textAlign === 'center' ? 'text-center mx-auto' : ''

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`${widthClass} ${alignClass}`}>
                <EditableText
                    value={(content?.tagline as string) || 'Tagline'}
                    onChange={(v) => onContentChange?.('tagline', v)}
                    as="p"
                    className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                    editable={editable}
                />
                <EditableText
                    value={(content?.heading as string) || 'Content section heading'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-4`}
                    editable={editable}
                />
                <EditableText
                    value={(content?.body as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'}
                    onChange={(v) => onContentChange?.('body', v)}
                    as="p"
                    className="text-gray-500 leading-relaxed mb-4"
                    editable={editable}
                    multiline
                />
                {showSecondParagraph && (
                    <EditableText
                        value={(content?.body2 as string) || 'Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.'}
                        onChange={(v) => onContentChange?.('body2', v)}
                        as="p"
                        className="text-gray-500 leading-relaxed"
                        editable={editable}
                        multiline
                    />
                )}
                {showButton && (
                    <div className={`mt-6 ${textAlign === 'center' ? '' : ''}`}>
                        <div className="inline-block bg-gray-800 text-white px-5 py-2.5 text-sm font-medium">
                            <EditableText
                                value={(content?.cta as string) || 'Learn More'}
                                onChange={(v) => onContentChange?.('cta', v)}
                                as="span"
                                editable={editable}
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const ContentTextFamily: TemplateFamily = {
    id: 'content-text',
    category: 'content',
    name: 'Text Content',
    description: 'Simple heading + body text section',
    tags: ['text', 'body', 'paragraph', 'content'],
    Canvas,
    controlsDef: [
        {
            key: 'textAlign',
            label: 'Alignment',
            type: 'toggle-group',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
            defaultValue: 'center',
        },
        {
            key: 'maxWidth',
            label: 'Width',
            type: 'toggle-group',
            options: [
                { value: 'narrow', label: 'Narrow' },
                { value: 'medium', label: 'Medium' },
                { value: 'wide', label: 'Wide' },
            ],
            defaultValue: 'medium',
        },
        {
            key: 'showButton',
            label: 'Show Button',
            type: 'switch',
            defaultValue: false,
        },
        {
            key: 'showSecondParagraph',
            label: 'Second Paragraph',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        textAlign: 'center',
        maxWidth: 'medium',
        showButton: false,
        showSecondParagraph: true,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Content section heading',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.',
        body2: 'Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.',
        cta: 'Learn More',
    },
}
