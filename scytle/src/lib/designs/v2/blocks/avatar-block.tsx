/**
 * AvatarBlock — Token-driven circular avatar
 *
 * Reads from CSS custom properties:
 *   --sg-bg-secondary
 *   --sg-text-muted
 *   --sg-text-on-accent
 *   --sg-bg-accent
 */

'use client'

import { cn } from '@/lib/utils'
import { User } from 'lucide-react'
import type { Block, AvatarBlockProps, AvatarBlockContent } from './types'

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

const AVATAR_SIZE: Record<string, number> = {
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
}

// ============================================
// Component
// ============================================

export function AvatarBlock({ block, className }: Props) {
    const props = block.props as unknown as AvatarBlockProps
    const content = block.content as unknown as AvatarBlockContent

    const size = AVATAR_SIZE[props.size ?? 'md'] ?? AVATAR_SIZE.md
    const src = content.src

    if (src) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={content.alt || 'Avatar'}
                className={cn('object-cover', className)}
                style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    borderRadius: '50%',
                    flexShrink: 0,
                }}
                data-layer-id={block.id}
                data-layer-type={block.type}
                data-layer-label="Avatar"
            />
        )
    }

    // Initials or icon placeholder
    const initials = content.initials

    return (
        <div
            className={cn('flex items-center justify-center flex-shrink-0', className)}
            style={{
                width: `${size}px`,
                height: `${size}px`,
                borderRadius: '50%',
                backgroundColor: initials ? 'var(--sg-bg-accent)' : 'var(--sg-bg-secondary)',
                color: initials ? 'var(--sg-text-on-accent)' : 'var(--sg-text-muted)',
                fontSize: `${Math.max(12, size * 0.4)}px`,
                fontWeight: 600,
            }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Avatar"
        >
            {initials || <User size={size * 0.45} />}
        </div>
    )
}
