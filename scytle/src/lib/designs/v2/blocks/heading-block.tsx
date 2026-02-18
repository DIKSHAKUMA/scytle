/**
 * HeadingBlock — Token-driven heading (h1–h6)
 *
 * Reads from CSS custom properties:
 *   --sg-h1-size … --sg-h6-size
 *   --sg-font-heading
 *   --sg-heading-weight
 *   --sg-heading-letter-spacing
 *   --sg-text-primary
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, HeadingBlockProps, HeadingBlockContent, TextAlign } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Alignment utility
// ============================================

const ALIGN_CLASS: Record<TextAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
}

// ============================================
// Size / line-height per level
// ============================================

const LEVEL_STYLES: Record<number, { sizeVar: string; lineHeight: string }> = {
    1: { sizeVar: 'var(--sg-h1-size)', lineHeight: '1.1' },
    2: { sizeVar: 'var(--sg-h2-size)', lineHeight: '1.15' },
    3: { sizeVar: 'var(--sg-h3-size)', lineHeight: '1.2' },
    4: { sizeVar: 'var(--sg-h4-size)', lineHeight: '1.25' },
    5: { sizeVar: 'var(--sg-h5-size)', lineHeight: '1.3' },
    6: { sizeVar: 'var(--sg-h6-size)', lineHeight: '1.35' },
}

// ============================================
// Component
// ============================================

export function HeadingBlock({ block, className }: Props) {
    const props = block.props as unknown as HeadingBlockProps
    const content = block.content as unknown as HeadingBlockContent

    const level = props.level ?? 1
    const align = props.align ?? 'left'
    const text = content.text ?? ''

    const Tag = `h${level}` as const
    const levelStyle = LEVEL_STYLES[level] ?? LEVEL_STYLES[1]

    return (
        <Tag
            className={cn(ALIGN_CLASS[align], className)}
            style={{
                fontSize: levelStyle.sizeVar,
                lineHeight: levelStyle.lineHeight,
                fontFamily: 'var(--sg-font-heading)',
                fontWeight: 'var(--sg-heading-weight)',
                letterSpacing: 'var(--sg-heading-letter-spacing)',
                color: 'var(--sg-text-primary)',
            } as React.CSSProperties}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label={`H${level}`}
        >
            {text}
        </Tag>
    )
}
