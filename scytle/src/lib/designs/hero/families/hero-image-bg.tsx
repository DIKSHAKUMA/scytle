'use client'

/**
 * Hero Image Background Family — Full-bleed image with text overlay.
 *
 * Controls:
 * - textAlign: left | center | right
 * - buttonCount: 0 | 1 | 2
 * - showTagline: boolean
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const textAlign = (controls?.textAlign as string) ?? 'center'
    const buttonCount = Number(controls?.buttonCount ?? 2)
    const showTagline = controls?.showTagline !== false

    const alignClass = textAlign === 'center' ? 'text-center items-center' : textAlign === 'right' ? 'text-right items-end' : 'text-left items-start'
    const justifyClass = textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : ''

    return (
        <section className="relative bg-gray-100">
            {/* Background image placeholder indicator */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-white/80 rounded text-[10px] text-gray-400">
                <ImageIcon className="w-3 h-3" />
                Background Image
            </div>

            {/* Content */}
            <div className={`relative ${isMobile ? 'py-16 px-4' : isTablet ? 'py-24 px-8' : 'py-32 px-16'}`}>
                <div className={`max-w-3xl ${textAlign === 'center' ? 'mx-auto' : textAlign === 'right' ? 'ml-auto' : ''} flex flex-col ${alignClass} space-y-5`}>
                    {showTagline && (
                        <EditableText
                            value={(content?.tagline as string) || 'Tagline'}
                            onChange={(v) => onContentChange?.('tagline', v)}
                            as="p"
                            className="text-sm text-gray-400 uppercase tracking-wide"
                            editable={editable}
                        />
                    )}
                    <EditableText
                        value={(content?.heading as string) || 'Medium length hero headline goes here'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h1"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-5xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500 text-lg"
                        editable={editable}
                        multiline
                    />
                    {buttonCount > 0 && (
                        <div className={`flex gap-3 pt-2 ${justifyClass}`}>
                            <div className="bg-gray-800 text-white px-6 py-3 text-sm font-medium">
                                <EditableText
                                    value={(content?.primaryCta as string) || 'Button'}
                                    onChange={(v) => onContentChange?.('primaryCta', v)}
                                    as="span"
                                    editable={editable}
                                />
                            </div>
                            {buttonCount >= 2 && (
                                <div className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium">
                                    <EditableText
                                        value={(content?.secondaryCta as string) || 'Button'}
                                        onChange={(v) => onContentChange?.('secondaryCta', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export const HeroImageBgFamily: TemplateFamily = {
    id: 'hero-image-bg',
    category: 'hero',
    name: 'Image Background Hero',
    description: 'Full-bleed image with text overlay',
    tags: ['image', 'background', 'overlay', 'full-bleed'],
    hasImage: true,
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
                { value: '0', label: 'None' },
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '2',
        },
        {
            key: 'showTagline',
            label: 'Show Tagline',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        textAlign: 'center',
        buttonCount: '2',
        showTagline: true,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length hero headline goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        primaryCta: 'Button',
        secondaryCta: 'Button',
    },
}
