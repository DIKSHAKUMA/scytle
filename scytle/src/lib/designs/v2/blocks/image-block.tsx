/**
 * ImageBlock — Token-driven image / placeholder
 *
 * Reads from CSS custom properties:
 *   --sg-image-radius
 *   --sg-border, --sg-border-muted
 *   --sg-text-muted (for placeholder icon)
 *   --sg-bg-secondary (placeholder bg)
 *
 * Mode-aware:
 *   Design mode + content.src → renders real <img>
 *   Wireframe mode (or no src) → renders styled placeholder
 */

'use client'

import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnifiedStore } from '@/store'
import { positionToCSS } from '../utils/image-helpers'
import type { Block, ImageBlockProps, ImageBlockContent, ImageRatio } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Aspect ratio → CSS padding-bottom percentages
// ============================================

const RATIO_PADDING: Record<ImageRatio, string> = {
    '1:1': '100%',
    '4:3': '75%',
    '16:9': '56.25%',
    '3:2': '66.67%',
    '2:3': '150%',
    '3:4': '133.33%',
    'auto': '0',
}

// ============================================
// Component
// ============================================

export function ImageBlock({ block, className }: Props) {
    const canvasMode = useUnifiedStore(s => s.canvasMode)
    const props = block.props as unknown as ImageBlockProps
    const content = block.content as unknown as ImageBlockContent

    const ratio = props.ratio ?? '16:9'
    const shape = props.shape ?? 'rectangle'
    const position = props.position ?? 'center'
    const fillMode = props.fillMode ?? 'cover'
    const src = content.src
    const alt = content.alt ?? ''

    const isCircle = shape === 'circle'
    const isAutoRatio = ratio === 'auto'
    const paddingBottom = RATIO_PADDING[ratio] ?? RATIO_PADDING['16:9']

    // Only show real image in design mode when src is available
    const showRealImage = canvasMode === 'design' && !!src

    // Overlay
    const overlay = props.overlay
    const hasOverlay = overlay?.enabled && overlay.color

    return (
        <div
            className={cn('relative overflow-hidden w-full', className)}
            style={{
                borderRadius: isCircle ? '50%' : 'var(--sg-image-radius)',
                ...(isCircle && { aspectRatio: '1 / 1' }),
            }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Image"
        >
            {/* Aspect ratio container (skip for auto) */}
            <div
                className="relative w-full"
                style={{
                    paddingBottom: isAutoRatio ? undefined : paddingBottom,
                    minHeight: isAutoRatio ? '200px' : undefined,
                }}
            >
                {showRealImage ? (
                    /* Real image (design mode only) */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={src}
                        alt={alt}
                        className={cn(
                            'absolute inset-0 w-full h-full',
                        )}
                        style={{
                            objectFit: fillMode,
                            objectPosition: positionToCSS(position),
                        }}
                        loading="lazy"
                    />
                ) : (
                    /* Placeholder (wireframe mode or no src) */
                    <div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{
                            backgroundColor: 'var(--sg-bg-secondary)',
                            border: '1px solid var(--sg-border-muted)',
                        }}
                    >
                        <ImageIcon
                            className="opacity-40"
                            style={{ color: 'var(--sg-text-muted)' }}
                            size={48}
                        />
                    </div>
                )}

                {/* Overlay */}
                {hasOverlay && (
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundColor: overlay.color,
                            opacity: overlay.opacity ?? 0.3,
                        }}
                    />
                )}
            </div>
        </div>
    )
}
