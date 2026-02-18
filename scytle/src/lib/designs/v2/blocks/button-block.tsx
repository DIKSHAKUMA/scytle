/**
 * ButtonBlock — Token-driven button element
 *
 * Reads from CSS custom properties:
 *   --sg-button-primary-bg, --sg-button-primary-text
 *   --sg-button-secondary-bg, --sg-button-secondary-text, --sg-button-secondary-border
 *   --sg-button-radius
 *   --sg-button-style (solid | outline | ghost | brick | gradient)
 *   --sg-font-body
 *   --sg-bg-accent (for gradient style)
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, ButtonBlockProps, ButtonBlockContent, ButtonVariant } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Size presets
// ============================================

const SIZE_CLASSES: Record<string, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
}

// ============================================
// Component
// ============================================

export function ButtonBlock({ block, className }: Props) {
    const props = block.props as unknown as ButtonBlockProps
    const content = block.content as unknown as ButtonBlockContent

    const variant = props.variant ?? 'primary'
    const size = props.size ?? 'md'
    const text = content.text ?? 'Button'

    const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.md

    return (
        <span
            role="button"
            className={cn(
                'inline-flex items-center justify-center font-medium transition-colors whitespace-nowrap',
                sizeClass,
                className,
            )}
            style={getButtonStyle(variant)}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label={`${variant} Button`}
        >
            {text}
        </span>
    )
}

// ============================================
// Style computation
// ============================================

function getButtonStyle(variant: ButtonVariant): React.CSSProperties {
    const base: React.CSSProperties = {
        fontFamily: 'var(--sg-font-body)',
        borderRadius: 'var(--sg-button-radius)',
    }

    switch (variant) {
        case 'primary':
            return {
                ...base,
                backgroundColor: 'var(--sg-button-primary-bg)',
                color: 'var(--sg-button-primary-text)',
                border: '2px solid transparent',
            }

        case 'secondary':
            return {
                ...base,
                backgroundColor: 'var(--sg-button-secondary-bg)',
                color: 'var(--sg-button-secondary-text)',
                border: '2px solid var(--sg-button-secondary-border)',
            }

        case 'link':
            return {
                ...base,
                backgroundColor: 'transparent',
                color: 'var(--sg-text-primary)',
                border: 'none',
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                borderRadius: '0',
                padding: '0',
            }
    }
}
