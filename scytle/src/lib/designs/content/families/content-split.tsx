'use client'

/**
 * Content Split Family — Text + image side by side.
 *
 * Controls:
 * - imagePlacement: left | right
 * - showButton: boolean
 * - showList: boolean
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const imagePlacement = (controls?.imagePlacement as string) ?? 'right'
    const showButton = controls?.showButton !== false
    const showList = controls?.showList === true
    const imageAspect = (controls?.imageAspect as string) ?? '4:3'

    const flexDir = imagePlacement === 'left' ? 'flex-row-reverse' : 'flex-row'
    const aspectMap: Record<string, string> = { '4:3': 'aspect-[4/3]', '16:9': 'aspect-[16/9]', '1:1': 'aspect-square' }

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className={`max-w-7xl mx-auto ${isMobile ? 'flex flex-col gap-8' : `flex items-center gap-12 ${flexDir}`}`}>
                {/* Text Side */}
                <div className="flex-1 space-y-4">
                    <EditableText
                        value={(content?.tagline as string) || 'About'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Content section heading goes here'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.body as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                        onChange={(v) => onContentChange?.('body', v)}
                        as="p"
                        className="text-gray-500 leading-relaxed"
                        editable={editable}
                        multiline
                    />
                    {showList && (
                        <div className="space-y-2 pt-2">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 mt-0.5" />
                                    <p className="text-gray-600 text-sm">Key point or benefit number {i + 1}</p>
                                </div>
                            ))}
                        </div>
                    )}
                    {showButton && (
                        <div className="pt-2">
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

                {/* Image Side */}
                <div className={`${isMobile ? 'w-full' : 'flex-1'} ${aspectMap[imageAspect] ?? 'aspect-[4/3]'} bg-gray-100 border border-gray-200 flex items-center justify-center`}>
                    <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
            </div>
        </section>
    )
}

export const ContentSplitFamily: TemplateFamily = {
    id: 'content-split',
    category: 'content',
    name: 'Split Content',
    description: 'Text + image side by side',
    tags: ['split', 'image', 'text', 'about', 'content'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'imagePlacement',
            label: 'Image Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: '←', icon: 'ArrowLeft' },
                { value: 'right', label: '→', icon: 'ArrowRight' },
            ],
            defaultValue: 'right',
        },
        {
            key: 'showButton',
            label: 'Show Button',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showList',
            label: 'Show Bullet List',
            type: 'switch',
            defaultValue: false,
        },
        {
            key: 'imageAspect',
            label: 'Image Ratio',
            type: 'toggle-group',
            options: [
                { value: '4:3', label: '4:3' },
                { value: '16:9', label: '16:9' },
                { value: '1:1', label: '1:1' },
            ],
            defaultValue: '4:3',
        },
    ],
    defaultControls: {
        imagePlacement: 'right',
        showButton: true,
        showList: false,
        imageAspect: '4:3',
    },
    defaultContent: {
        tagline: 'About',
        heading: 'Content section heading goes here',
        body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        cta: 'Learn More',
    },
}
