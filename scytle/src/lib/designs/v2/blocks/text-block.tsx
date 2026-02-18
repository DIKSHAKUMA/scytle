/**
 * TextBlock — Token-driven paragraph / body text
 *
 * Reads from CSS custom properties:
 *   --sg-body-size, --sg-body-large-size, --sg-caption-size
 *   --sg-font-body
 *   --sg-body-weight
 *   --sg-text-secondary (body), --sg-text-muted (caption)
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, TextBlockProps, TextBlockContent, TextVariant, TextAlign } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Alignment
// ============================================

const ALIGN_CLASS: Record<TextAlign, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
}

// ============================================
// Variant → CSS token mapping
// ============================================

const VARIANT_STYLES: Record<TextVariant, { sizeVar: string; colorVar: string; lineHeight: string }> = {
    body: {
        sizeVar: 'var(--sg-body-size)',
        colorVar: 'var(--sg-text-secondary)',
        lineHeight: '1.6',
    },
    'body-large': {
        sizeVar: 'var(--sg-body-large-size)',
        colorVar: 'var(--sg-text-secondary)',
        lineHeight: '1.6',
    },
    small: {
        sizeVar: '0.875rem',
        colorVar: 'var(--sg-text-secondary)',
        lineHeight: '1.5',
    },
    caption: {
        sizeVar: 'var(--sg-caption-size)',
        colorVar: 'var(--sg-text-muted)',
        lineHeight: '1.5',
    },
}

// ============================================
// Component
// ============================================

export function TextBlock({ block, className }: Props) {
    const props = block.props as unknown as TextBlockProps
    const content = block.content as unknown as TextBlockContent

    const variant = props.variant ?? 'body'
    const align = props.align ?? 'left'
    const text = content.text ?? ''

    const variantStyle = VARIANT_STYLES[variant] ?? VARIANT_STYLES.body

    return (
        <p
            className={cn(ALIGN_CLASS[align], className)}
            style={{
                fontSize: variantStyle.sizeVar,
                lineHeight: variantStyle.lineHeight,
                fontFamily: 'var(--sg-font-body)',
                fontWeight: 'var(--sg-body-weight)',
                color: variantStyle.colorVar,
            } as React.CSSProperties}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Text"
        >
            {text}
        </p>
    )
}
