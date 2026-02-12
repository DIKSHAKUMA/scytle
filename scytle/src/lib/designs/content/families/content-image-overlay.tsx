'use client'

/**
 * Content Image-Overlay Family — Full-width image with overlaid text.
 *
 * Archetype: Large background image with heading, description, and optional
 * buttons overlaid on top with a dark gradient/overlay.
 *
 * Covers Relume Layouts with full-bleed image + text overlay patterns.
 *
 * Controls:
 * - textPosition: 'bottom-left' | 'center' | 'bottom-right' — text alignment on image
 * - overlayDarkness: 'light' | 'medium' | 'dark' — overlay opacity
 * - imageHeight: 'medium' | 'large' | 'full' — section height
 * - showButton: boolean — show CTA button
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'

    const textPosition = (controls?.textPosition as string) ?? 'bottom-left'
    const overlayDarkness = (controls?.overlayDarkness as string) ?? 'medium'
    const imageHeight = (controls?.imageHeight as string) ?? 'large'
    const showButton = controls?.showButton !== false

    const heightMap: Record<string, string> = {
        medium: isMobile ? 'h-[300px]' : 'h-[400px]',
        large: isMobile ? 'h-[400px]' : 'h-[560px]',
        full: isMobile ? 'h-[500px]' : 'h-[700px]',
    }

    const overlayMap: Record<string, string> = {
        light: 'bg-black/20',
        medium: 'bg-black/40',
        dark: 'bg-black/60',
    }

    const positionMap: Record<string, string> = {
        'bottom-left': 'items-end justify-start text-left',
        'center': 'items-center justify-center text-center',
        'bottom-right': 'items-end justify-end text-right',
    }

    const maxWidthMap: Record<string, string> = {
        'bottom-left': 'max-w-xl',
        'center': 'max-w-2xl',
        'bottom-right': 'max-w-xl',
    }

    return (
        <section className={`${isMobile ? 'px-4 py-12' : isTablet ? 'px-8 py-16' : 'px-16 py-20'}`}>
            <div className="max-w-7xl mx-auto">
                <div className={`relative ${heightMap[imageHeight] ?? heightMap.large} bg-gray-200 overflow-hidden`}>
                    {/* Placeholder Image Background */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-300" />
                    </div>

                    {/* Overlay */}
                    <div className={`absolute inset-0 ${overlayMap[overlayDarkness] ?? overlayMap.medium}`} />

                    {/* Content */}
                    <div className={`relative h-full flex ${positionMap[textPosition] ?? positionMap['bottom-left']} p-8 md:p-12`}>
                        <div className={`${maxWidthMap[textPosition] ?? maxWidthMap['bottom-left']}`}>
                            <EditableText
                                value={(content?.tagline as string) || 'Tagline'}
                                onChange={(v) => onContentChange?.('tagline', v)}
                                as="p"
                                className="text-sm text-white/70 font-semibold uppercase tracking-wide mb-3"
                                editable={editable}
                            />
                            <EditableText
                                value={(content?.heading as string) || 'Medium length heading goes here'}
                                onChange={(v) => onContentChange?.('heading', v)}
                                as="h2"
                                className={`font-bold text-white leading-tight ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                                editable={editable}
                            />
                            <EditableText
                                value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                                onChange={(v) => onContentChange?.('description', v)}
                                as="p"
                                className="text-white/80 leading-relaxed mt-4"
                                editable={editable}
                                multiline
                            />
                            {showButton && (
                                <div className={`mt-6 ${textPosition === 'center' ? 'flex justify-center' : ''}`}>
                                    <div className="inline-block bg-white text-gray-900 px-6 py-3 text-sm font-medium">
                                        <EditableText
                                            value={(content?.cta as string) || 'Button'}
                                            onChange={(v) => onContentChange?.('cta', v)}
                                            as="span"
                                            editable={editable}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export const ContentImageOverlayFamily: TemplateFamily = {
    id: 'content-image-overlay',
    category: 'content',
    name: 'Image Overlay',
    description: 'Full-width image with overlaid text and CTA',
    tags: ['image', 'overlay', 'background', 'hero-like', 'full-width', 'content'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'textPosition',
            label: 'Text Position',
            type: 'toggle-group',
            options: [
                { value: 'bottom-left', label: '↙', icon: 'ArrowDownLeft' },
                { value: 'center', label: '⊙', icon: 'Crosshair' },
                { value: 'bottom-right', label: '↘', icon: 'ArrowDownRight' },
            ],
            defaultValue: 'bottom-left',
        },
        {
            key: 'overlayDarkness',
            label: 'Overlay',
            type: 'toggle-group',
            options: [
                { value: 'light', label: 'Light' },
                { value: 'medium', label: 'Medium' },
                { value: 'dark', label: 'Dark' },
            ],
            defaultValue: 'medium',
        },
        {
            key: 'imageHeight',
            label: 'Height',
            type: 'toggle-group',
            options: [
                { value: 'medium', label: 'M' },
                { value: 'large', label: 'L' },
                { value: 'full', label: 'XL' },
            ],
            defaultValue: 'large',
        },
        {
            key: 'showButton',
            label: 'Show Button',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        textPosition: 'bottom-left',
        overlayDarkness: 'medium',
        imageHeight: 'large',
        showButton: true,
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length heading goes here',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        cta: 'Button',
    },
}
