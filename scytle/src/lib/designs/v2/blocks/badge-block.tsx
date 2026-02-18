/**
 * BadgeBlock — Token-driven label / tag
 *
 * Reads from CSS custom properties:
 *   --sg-bg-accent        (accent badge fill)
 *   --sg-text-on-accent   (accent badge text)
 *   --sg-text-primary     (default badge text)
 *   --sg-border           (outline border)
 *   --sg-button-radius    (re-uses button rounding for consistency)
 *   --sg-font-body
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, BadgeBlockProps, BadgeBlockContent } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Variant style builders
// ============================================

function getVariantStyle(variant: string): React.CSSProperties {
    switch (variant) {
        case 'accent':
            return {
                backgroundColor: 'var(--sg-bg-accent)',
                color: 'var(--sg-text-on-accent)',
                border: '1px solid transparent',
            }
        case 'outline':
            return {
                backgroundColor: 'transparent',
                color: 'var(--sg-text-primary)',
                border: '1px solid var(--sg-border)',
            }
        default: // 'default'
            return {
                backgroundColor: 'color-mix(in oklch, var(--sg-text-primary) 10%, transparent)',
                color: 'var(--sg-text-primary)',
                border: '1px solid transparent',
            }
    }
}

// ============================================
// Component
// ============================================

export function BadgeBlock({ block, className }: Props) {
    const props = block.props as unknown as BadgeBlockProps
    const content = block.content as unknown as BadgeBlockContent

    const variant = props.variant ?? 'default'

    return (
        <span
            className={cn('inline-flex items-center whitespace-nowrap', className)}
            style={{
                ...getVariantStyle(variant),
                fontFamily: 'var(--sg-font-body)',
                fontSize: '12px',
                fontWeight: 500,
                lineHeight: '1',
                padding: '4px 10px',
                borderRadius: 'var(--sg-button-radius)',
            }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Badge"
        >
            {content.text || 'Badge'}
        </span>
    )
}
