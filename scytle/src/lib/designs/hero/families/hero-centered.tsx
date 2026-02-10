'use client'

/**
 * Hero Centered Family — Centered text with optional image below.
 * 
 * Controls:
 * - textAlign: left | center | right
 * - buttonCount: 0 | 1 | 2
 * - showTagline: boolean
 * - showImage: boolean (when true, renders image placeholder below text)
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

// ===== CANVAS =====
function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const textAlign = (controls?.textAlign as string) ?? 'center'
    const buttonCount = Number(controls?.buttonCount ?? 2)
    const showTagline = controls?.showTagline !== false
    const showImage = controls?.showImage === true

    const alignClass = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'
    const justifyClass = textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : ''

    return (
        <section className="relative">
            {/* Text Content Section */}
            <div className={`py-16 ${isMobile ? 'px-4' : isTablet ? 'px-8' : 'px-16'}`}>
                <div className={`max-w-3xl mx-auto ${alignClass} space-y-6`}>
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
                        <div className={`flex gap-3 ${justifyClass} pt-2`}>
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

            {/* Image Placeholder Section — only when showImage is true */}
            {showImage && (
                <div className={`${isMobile ? 'px-4 pb-8' : isTablet ? 'px-8 pb-12' : 'px-16 pb-16'}`}>
                    <div className="max-w-5xl mx-auto">
                        <div className="aspect-video bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <svg className="w-16 h-16 mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <path d="M21 15l-5-5L5 21" />
                                </svg>
                                <p className="text-sm">Image placeholder</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    )
}

// ===== FAMILY EXPORT =====
export const HeroCenteredFamily: TemplateFamily = {
    id: 'hero-centered',
    category: 'hero',
    name: 'Centered Hero',
    description: 'Centered text with optional image below',
    tags: ['centered', 'minimal', 'clean', 'text-only'],
    hasImage: false, // depends on showImage control
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
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        textAlign: 'center',
        buttonCount: '2',
        showTagline: true,
        showImage: false,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length hero headline goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        primaryCta: 'Button',
        secondaryCta: 'Button',
    },
}
