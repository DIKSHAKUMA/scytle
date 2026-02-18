/**
 * DividerBlock — Token-driven horizontal rule
 *
 * Reads from CSS custom properties:
 *   --sg-border-muted
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, DividerBlockProps } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Component
// ============================================

export function DividerBlock({ block, className }: Props) {
    const props = block.props as unknown as DividerBlockProps

    const variant = props.variant ?? 'line'

    if (variant === 'dots') {
        return (
            <div
                className={cn('flex items-center justify-center gap-2 py-1', className)}
                data-layer-id={block.id}
                data-layer-type={block.type}
                data-layer-label="Divider"
            >
                {[0, 1, 2].map((i) => (
                    <span
                        key={i}
                        style={{
                            width: '4px',
                            height: '4px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--sg-border-muted)',
                        }}
                    />
                ))}
            </div>
        )
    }

    // Default: line variant
    return (
        <hr
            className={cn('border-0', className)}
            style={{
                height: '1px',
                backgroundColor: 'var(--sg-border-muted)',
            }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Divider"
        />
    )
}
