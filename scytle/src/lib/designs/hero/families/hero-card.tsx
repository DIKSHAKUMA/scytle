'use client'

/**
 * Hero Card Family — Contained image card hero.
 * A white page with a bounded card featuring a background image + overlay + text.
 *
 * Covers Relume Headers: 88-101, 138, 156 (~18 variants)
 *
 * Controls:
 * - textAlign: left | center
 * - buttonCount: 0 | 1 | 2
 * - showTagline: boolean
 * - overlayOpacity: number (0-100)
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const textAlign = (controls?.textAlign as string) ?? 'left'
    const buttonCount = Number(controls?.buttonCount ?? 2)
    const showTagline = controls?.showTagline !== false
    const overlayOpacity = Number(controls?.overlayOpacity ?? 40)

    const alignClass = textAlign === 'center' ? 'text-center items-center' : 'text-left items-start'
    const justifyClass = textAlign === 'center' ? 'justify-center' : ''

    return (
        <section className={`bg-white ${isMobile ? 'px-4 py-8' : isTablet ? 'px-8 py-12' : 'px-16 py-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Card with background image */}
                <div className={`relative bg-gray-200 ${isMobile ? 'py-16 px-6' : 'py-24 px-16'} flex flex-col justify-center overflow-hidden`} style={{ minHeight: isMobile ? 400 : 640 }}>
                    {/* BG image indicator */}
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 bg-white/80 rounded text-[10px] text-gray-400">
                        <ImageIcon className="w-3 h-3" />
                        Card Image
                    </div>

                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity / 100 }} />

                    {/* Content */}
                    <div className={`relative max-w-xl ${textAlign === 'center' ? 'mx-auto' : ''} flex flex-col ${alignClass} space-y-6`}>
                        {showTagline && (
                            <EditableText
                                value={(content?.tagline as string) || 'Tagline'}
                                onChange={(v) => onContentChange?.('tagline', v)}
                                as="p"
                                className="text-sm text-gray-300 uppercase tracking-wide"
                                editable={editable}
                            />
                        )}
                        <EditableText
                            value={(content?.heading as string) || 'Medium length hero headline goes here'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h1"
                            className={`font-bold text-white ${isMobile ? 'text-2xl' : 'text-5xl'} leading-tight`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                            onChange={(v) => onContentChange?.('subheading', v)}
                            as="p"
                            className="text-gray-300 text-lg"
                            editable={editable}
                            multiline
                        />
                        {buttonCount > 0 && (
                            <div className={`flex gap-3 pt-2 ${justifyClass}`}>
                                <div className="bg-white text-gray-900 px-6 py-3 text-sm font-medium">
                                    <EditableText
                                        value={(content?.primaryCta as string) || 'Button'}
                                        onChange={(v) => onContentChange?.('primaryCta', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </div>
                                {buttonCount >= 2 && (
                                    <div className="border border-white text-white px-6 py-3 text-sm font-medium">
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
            </div>
        </section>
    )
}

export const HeroCardFamily: TemplateFamily = {
    id: 'hero-card',
    category: 'hero',
    name: 'Card Hero',
    description: 'Contained image card with text overlay',
    tags: ['card', 'contained', 'image', 'overlay', 'bounded'],
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
            ],
            defaultValue: 'left',
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
        {
            key: 'overlayOpacity',
            label: 'Overlay Opacity',
            type: 'slider',
            min: 0,
            max: 100,
            step: 10,
            defaultValue: 40,
        },
    ],
    defaultControls: {
        textAlign: 'left',
        buttonCount: '2',
        showTagline: true,
        overlayOpacity: 40,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length hero headline goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        primaryCta: 'Button',
        secondaryCta: 'Button',
    },
}
