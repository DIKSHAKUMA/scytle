'use client'

/**
 * Hero Split Family — Text on one side, image on the other.
 * 
 * Controls:
 * - textAlign: left | center | right
 * - assetPlacement: left | right (which side the image goes)
 * - buttonCount: 0 | 1 | 2
 * - showTagline: boolean
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

// ===== CANVAS =====
function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const textAlign = (controls?.textAlign as string) ?? 'left'
    const assetPlacement = (controls?.assetPlacement as string) ?? 'right'
    const buttonCount = Number(controls?.buttonCount ?? 2)
    const showTagline = controls?.showTagline !== false
    const imageAspect = (controls?.imageAspect as string) ?? 'square'

    const alignClass = textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'
    const flexDir = assetPlacement === 'left' ? 'flex-row-reverse' : 'flex-row'
    const aspectClass = imageAspect === 'landscape' ? 'aspect-[16/10]' : imageAspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-[4/3]'

    return (
        <section className={`py-12 ${isMobile ? 'px-4' : isTablet ? 'px-8' : 'px-16'}`}>
            <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : `flex items-center gap-12 ${flexDir}`}`}>
                {/* Text Content */}
                <div className={`flex-1 space-y-4 ${alignClass}`}>
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
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500"
                        editable={editable}
                        multiline
                    />
                    {buttonCount > 0 && (
                        <div className={`flex gap-3 pt-2 ${textAlign === 'center' ? 'justify-center' : textAlign === 'right' ? 'justify-end' : ''}`}>
                            <div className="bg-gray-800 text-white px-5 py-2.5 text-sm font-medium">
                                <EditableText
                                    value={(content?.primaryCta as string) || 'Button'}
                                    onChange={(v) => onContentChange?.('primaryCta', v)}
                                    as="span"
                                    editable={editable}
                                />
                            </div>
                            {buttonCount >= 2 && (
                                <div className="border border-gray-300 text-gray-700 px-5 py-2.5 text-sm font-medium">
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

                {/* Image Placeholder */}
                <div className={`${isMobile ? 'w-full' : 'flex-1'} ${aspectClass} bg-gray-100 border border-gray-200 flex items-center justify-center`}>
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
            </div>
        </section>
    )
}

// ===== FAMILY EXPORT =====
export const HeroSplitFamily: TemplateFamily = {
    id: 'hero-split',
    category: 'hero',
    name: 'Split Hero',
    description: 'Text on one side, image on the other',
    tags: ['split', 'image', 'classic', 'side-by-side'],
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
            defaultValue: 'left',
        },
        {
            key: 'assetPlacement',
            label: 'Asset Placement',
            type: 'toggle-group',
            options: [
                { value: 'left', label: '←', icon: 'ArrowLeft' },
                { value: 'right', label: '→', icon: 'ArrowRight' },
            ],
            defaultValue: 'right',
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
            key: 'imageAspect',
            label: 'Image Aspect',
            type: 'toggle-group',
            options: [
                { value: 'square', label: 'Square' },
                { value: 'landscape', label: 'Wide' },
                { value: 'portrait', label: 'Tall' },
            ],
            defaultValue: 'square',
        },
    ],
    defaultControls: {
        textAlign: 'left',
        assetPlacement: 'right',
        buttonCount: '2',
        showTagline: true,
        imageAspect: 'square',
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length hero headline goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        primaryCta: 'Button',
        secondaryCta: 'Button',
    },
}
