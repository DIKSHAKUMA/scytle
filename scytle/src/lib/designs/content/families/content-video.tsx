'use client'

/**
 * Content Video Family — Content section with an embedded video placeholder.
 *
 * Archetype: Text heading + description above or beside a large video embed
 * with play button overlay.
 *
 * Controls:
 * - layout: 'stacked' | 'split' — video below text or beside text
 * - videoPosition: 'left' | 'right' — for split layout
 * - showButton: boolean
 * - aspectRatio: '16:9' | '4:3' | '21:9'
 */

import { Play } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'

    const layout = (controls?.layout as string) ?? 'stacked'
    const videoPosition = (controls?.videoPosition as string) ?? 'right'
    const showButton = controls?.showButton !== false
    const aspectRatio = (controls?.aspectRatio as string) ?? '16:9'

    const aspectMap: Record<string, string> = {
        '16:9': 'aspect-video',
        '4:3': 'aspect-[4/3]',
        '21:9': 'aspect-[21/9]',
    }

    const isSplit = layout === 'split' && !isMobile
    const flexDir = videoPosition === 'left' ? 'flex-row-reverse' : 'flex-row'

    const videoBlock = (
        <div className={`relative ${aspectMap[aspectRatio] ?? 'aspect-video'} bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden ${isSplit ? 'flex-1' : 'w-full'}`}>
            {/* Play button overlay */}
            <div className="w-16 h-16 bg-gray-800/80 rounded-full flex items-center justify-center">
                <Play className="w-7 h-7 text-white ml-1" fill="currentColor" />
            </div>
        </div>
    )

    const textBlock = (
        <div className={`${isSplit ? 'flex-1' : 'max-w-2xl'} space-y-4 ${!isSplit ? 'text-center mx-auto mb-8' : ''}`}>
            <EditableText
                value={(content?.tagline as string) || 'Video'}
                onChange={(v) => onContentChange?.('tagline', v)}
                as="p"
                className="text-sm text-gray-400 font-semibold uppercase tracking-wide"
                editable={editable}
            />
            <EditableText
                value={(content?.heading as string) || 'See it in action'}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h2"
                className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-3xl'}`}
                editable={editable}
            />
            <EditableText
                value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                onChange={(v) => onContentChange?.('description', v)}
                as="p"
                className="text-gray-500 leading-relaxed"
                editable={editable}
                multiline
            />
            {showButton && (
                <div className={`pt-2 ${!isSplit ? 'flex justify-center' : ''}`}>
                    <div className="inline-block bg-gray-800 text-white px-5 py-2.5 text-sm font-medium">
                        <EditableText
                            value={(content?.cta as string) || 'Watch Now'}
                            onChange={(v) => onContentChange?.('cta', v)}
                            as="span"
                            editable={editable}
                        />
                    </div>
                </div>
            )}
        </div>
    )

    return (
        <section className={`${isMobile ? 'px-4 py-12' : isTablet ? 'px-8 py-16' : 'px-16 py-20'}`}>
            <div className="max-w-7xl mx-auto">
                {isSplit ? (
                    <div className={`flex ${flexDir} items-center gap-12`}>
                        {textBlock}
                        {videoBlock}
                    </div>
                ) : (
                    <>
                        {textBlock}
                        {videoBlock}
                    </>
                )}
            </div>
        </section>
    )
}

export const ContentVideoFamily: TemplateFamily = {
    id: 'content-video',
    category: 'content',
    name: 'Video Content',
    description: 'Content section with embedded video placeholder',
    tags: ['video', 'embed', 'media', 'play', 'content'],
    hasVideo: true,
    Canvas,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'stacked', label: 'Stacked' },
                { value: 'split', label: 'Split' },
            ],
            defaultValue: 'stacked',
        },
        {
            key: 'videoPosition',
            label: 'Video Side',
            type: 'toggle-group',
            options: [
                { value: 'left', label: '←' },
                { value: 'right', label: '→' },
            ],
            defaultValue: 'right',
            showWhen: { key: 'layout', value: 'split' },
        },
        {
            key: 'aspectRatio',
            label: 'Aspect Ratio',
            type: 'toggle-group',
            options: [
                { value: '16:9', label: '16:9' },
                { value: '4:3', label: '4:3' },
                { value: '21:9', label: '21:9' },
            ],
            defaultValue: '16:9',
        },
        {
            key: 'showButton',
            label: 'Show Button',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        layout: 'stacked',
        videoPosition: 'right',
        aspectRatio: '16:9',
        showButton: true,
    },
    defaultContent: {
        tagline: 'Video',
        heading: 'See it in action',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        cta: 'Watch Now',
    },
}
