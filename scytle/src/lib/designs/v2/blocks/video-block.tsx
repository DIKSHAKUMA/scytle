/**
 * VideoBlock — Token-driven video / placeholder
 *
 * Reads from CSS custom properties:
 *   --sg-bg-secondary
 *   --sg-image-radius
 *   --sg-text-muted
 *
 * Mode-aware:
 *   Design mode + content.src → renders real <video> or YouTube/Vimeo <iframe>
 *   Wireframe mode (or no src) → renders styled placeholder with play button
 */

'use client'

import { cn } from '@/lib/utils'
import { Play } from 'lucide-react'
import { useUnifiedStore } from '@/store'
import { getEmbedUrl } from '../utils/video-helpers'
import { ratioToCSS } from '../utils/image-helpers'
import type { Block, VideoBlockProps, VideoBlockContent, ImageRatio } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Aspect ratios (reused from ImageBlock)
// ============================================

const ASPECT_PADDING: Record<ImageRatio, string> = {
    '1:1': '100%',
    '4:3': '75%',
    '16:9': '56.25%',
    '3:2': '66.67%',
    '2:3': '150%',
    '3:4': '133.33%',
    'auto': '56.25%', // default to 16:9
}

// ============================================
// Component
// ============================================

export function VideoBlock({ block, className }: Props) {
    const canvasMode = useUnifiedStore(s => s.canvasMode)
    const props = block.props as unknown as VideoBlockProps
    const content = block.content as unknown as VideoBlockContent

    const ratio = props.ratio ?? '16:9'
    const paddingBottom = ASPECT_PADDING[ratio] ?? ASPECT_PADDING['16:9']
    const src = content.src
    const showRealVideo = canvasMode === 'design' && !!src

    // Design mode: render real video or embed
    if (showRealVideo) {
        const embedUrl = getEmbedUrl(src!)
        const aspectRatio = ratioToCSS(ratio) ?? '16/9'

        return (
            <div
                className={cn('relative w-full overflow-hidden', className)}
                style={{
                    aspectRatio,
                    borderRadius: 'var(--sg-image-radius)',
                }}
                data-layer-id={block.id}
                data-layer-type={block.type}
                data-layer-label="Video"
            >
                {embedUrl ? (
                    <iframe
                        src={embedUrl}
                        className="absolute inset-0 w-full h-full"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ border: 'none' }}
                        title={content.alt ?? 'Embedded video'}
                    />
                ) : (
                    <video
                        src={src}
                        className="absolute inset-0 w-full h-full object-cover"
                        controls
                        playsInline
                        poster={content.alt}
                    />
                )}
            </div>
        )
    }

    // Wireframe placeholder
    return (
        <div
            className={cn('relative w-full overflow-hidden', className)}
            style={{
                paddingBottom,
                borderRadius: 'var(--sg-image-radius)',
                backgroundColor: 'var(--sg-bg-secondary)',
            }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Video"
        >
            {/* Play button overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div
                    className="flex items-center justify-center"
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'color-mix(in oklch, var(--sg-text-primary) 12%, transparent)',
                        color: 'var(--sg-text-muted)',
                    }}
                >
                    <Play size={28} style={{ marginLeft: '3px' }} />
                </div>
            </div>

            {/* Caption */}
            {content.caption && (
                <div
                    className="absolute bottom-0 left-0 right-0 px-3 py-2"
                    style={{
                        fontSize: '12px',
                        color: 'var(--sg-text-muted)',
                        backgroundColor: 'color-mix(in oklch, var(--sg-bg-secondary) 80%, transparent)',
                    }}
                >
                    {content.caption}
                </div>
            )}
        </div>
    )
}
