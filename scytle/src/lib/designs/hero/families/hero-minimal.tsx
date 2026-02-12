'use client'

/**
 * Hero Minimal Family — Two-column text-only split.
 * Heading on one side, body + CTA on the other. Optional image below.
 *
 * Covers Relume Headers: 15-18, 73-75, 109-110, 120, 145-152 (~18 variants)
 *
 * Controls:
 * - showImage: boolean (full-width image below text)
 * - showTagline: boolean
 * - buttonCount: 0 | 1 | 2
 * - contentAlign: top | center (vertical alignment of right column)
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const showImage = controls?.showImage !== false
    const showTagline = controls?.showTagline !== false
    const buttonCount = Number(controls?.buttonCount ?? 2)
    const contentAlign = (controls?.contentAlign as string) ?? 'top'

    const rightAlignClass = contentAlign === 'center' ? 'justify-center' : 'justify-start'

    return (
        <section className={`${isMobile ? 'px-4 py-12' : isTablet ? 'px-8 py-16' : 'px-16 py-20'}`}>
            <div className="max-w-7xl mx-auto space-y-16">
                {/* Two-column text split */}
                <div className={`${isMobile ? 'flex flex-col gap-6' : 'flex gap-20'}`}>
                    {/* Left: Heading */}
                    <div className="flex-1">
                        {showTagline && (
                            <EditableText
                                value={(content?.tagline as string) || 'Tagline'}
                                onChange={(v) => onContentChange?.('tagline', v)}
                                as="p"
                                className="text-sm text-gray-400 uppercase tracking-wide mb-4"
                                editable={editable}
                            />
                        )}
                        <EditableText
                            value={(content?.heading as string) || 'Medium length hero heading goes here'}
                            onChange={(v) => onContentChange?.('heading', v)}
                            as="h1"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-5xl'} leading-tight`}
                            editable={editable}
                        />
                    </div>

                    {/* Right: Body + CTA */}
                    <div className={`flex-1 flex flex-col ${rightAlignClass} space-y-6`}>
                        <EditableText
                            value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'}
                            onChange={(v) => onContentChange?.('subheading', v)}
                            as="p"
                            className="text-gray-500 text-lg"
                            editable={editable}
                            multiline
                        />
                        {buttonCount > 0 && (
                            <div className="flex gap-3">
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

                {/* Optional full-width image below */}
                {showImage && (
                    <div className="w-full">
                        <div className="aspect-video bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <ImageIcon className="w-16 h-16 mx-auto mb-2" />
                                <p className="text-sm">Image placeholder</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const HeroMinimalFamily: TemplateFamily = {
    id: 'hero-minimal',
    category: 'hero',
    name: 'Minimal Hero',
    description: 'Two-column text-only split with optional image below',
    tags: ['minimal', 'text-only', 'split', 'two-column', 'clean'],
    hasImage: false,
    Canvas,
    controlsDef: [
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showTagline',
            label: 'Show Tagline',
            type: 'switch',
            defaultValue: true,
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
            key: 'contentAlign',
            label: 'Content Align',
            type: 'toggle-group',
            options: [
                { value: 'top', label: 'Top' },
                { value: 'center', label: 'Center' },
            ],
            defaultValue: 'top',
        },
    ],
    defaultControls: {
        showImage: true,
        showTagline: true,
        buttonCount: '2',
        contentAlign: 'top',
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length hero heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.',
        primaryCta: 'Button',
        secondaryCta: 'Button',
    },
}
