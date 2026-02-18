/**
 * LogoBlock — Token-driven brand logo placeholder
 *
 * Reads from CSS custom properties:
 *   --sg-text-primary
 *   --sg-text-muted
 *
 * Renders either an actual image (`src`) or a generic
 * rectangle placeholder for wireframes.
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, LogoBlockProps, LogoBlockContent } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Size map
// ============================================

const LOGO_HEIGHT: Record<string, number> = {
    sm: 24,
    md: 32,
    lg: 48,
}

// ============================================
// Component
// ============================================

export function LogoBlock({ block, className }: Props) {
    const props = block.props as unknown as LogoBlockProps
    const content = block.content as unknown as LogoBlockContent

    const height = LOGO_HEIGHT[props.size ?? 'md'] ?? LOGO_HEIGHT.md
    const src = content.src

    if (src) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={content.alt || 'Logo'}
                className={cn('object-contain', className)}
                style={{ height: `${height}px`, width: 'auto' }}
                data-layer-id={block.id}
                data-layer-type={block.type}
                data-layer-label="Logo"
            />
        )
    }

    // Placeholder
    return (
        <div
            className={cn('flex items-center gap-2', className)}
            style={{ height: `${height}px` }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Logo"
        >
            <div
                style={{
                    width: `${height}px`,
                    height: `${height}px`,
                    borderRadius: '6px',
                    backgroundColor: 'var(--sg-text-primary)',
                    opacity: 0.15,
                }}
            />
            <span
                style={{
                    fontWeight: 700,
                    fontSize: `${Math.max(14, height * 0.5)}px`,
                    color: 'var(--sg-text-primary)',
                    letterSpacing: '-0.02em',
                }}
            >
                {content.alt || 'Logo'}
            </span>
        </div>
    )
}
