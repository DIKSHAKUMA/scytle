/**
 * SpacerBlock — Vertical whitespace placeholder
 *
 * No token reads — purely structural. Provides consistent
 * vertical spacing between other blocks.
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, SpacerBlockProps, SpacerSize } from './types'

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

const SPACER_PX: Record<SpacerSize, number> = {
    xs: 8,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
    '2xl': 64,
}

// ============================================
// Component
// ============================================

export function SpacerBlock({ block, className }: Props) {
    const props = block.props as unknown as SpacerBlockProps

    const size = props.size ?? 'md'
    const height = SPACER_PX[size] ?? SPACER_PX.md

    return (
        <div
            className={cn('w-full', className)}
            style={{ height: `${height}px` }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Spacer"
            aria-hidden="true"
        />
    )
}
