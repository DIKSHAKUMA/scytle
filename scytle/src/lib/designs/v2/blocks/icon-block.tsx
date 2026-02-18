/**
 * IconBlock — Token-driven icon placeholder
 *
 * Reads from CSS custom properties:
 *   --sg-text-primary
 *   --sg-text-muted
 *   --sg-bg-accent
 *   --sg-text-on-accent
 *
 * Renders a lucide icon or a generic icon placeholder.
 * In wireframe mode, most icons render as a styled circle.
 */

'use client'

import { cn } from '@/lib/utils'
import { Star } from 'lucide-react'
import type { Block, IconBlockProps } from './types'

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

const ICON_SIZE: Record<string, number> = {
    sm: 20,
    md: 24,
    lg: 32,
    xl: 48,
}

// ============================================
// Component
// ============================================

export function IconBlock({ block, className }: Props) {
    const props = block.props as unknown as IconBlockProps

    const size = ICON_SIZE[props.size ?? 'md'] ?? ICON_SIZE.md
    const filled = props.filled ?? false

    // Wireframe: render a generic icon placeholder or the default star
    return (
        <span
            className={cn('inline-flex items-center justify-center flex-shrink-0', className)}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                color: filled ? 'var(--sg-text-on-accent)' : 'var(--sg-text-muted)',
                backgroundColor: filled ? 'var(--sg-bg-accent)' : 'transparent',
                borderRadius: filled ? '8px' : '0',
            }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Icon"
        >
            <Star size={size * 0.6} />
        </span>
    )
}
