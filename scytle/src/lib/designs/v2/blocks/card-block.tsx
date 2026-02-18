/**
 * CardBlock — Token-driven card container
 *
 * Reads from CSS custom properties:
 *   --sg-card-bg
 *   --sg-card-border
 *   --sg-card-radius
 *   --sg-card-style (default | outlined | flat)
 *
 * Container block — renders its `children` array inside a styled card.
 * Uses the forward-reference RenderBlock for children (avoids circular import).
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, CardBlockProps } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    /** Render function for child blocks — passed from RenderBlock to avoid circular imports */
    renderChild?: (child: Block) => React.ReactNode
    className?: string
}

// ============================================
// Padding presets
// ============================================

const PADDING: Record<string, string> = {
    sm: '16px',
    md: '24px',
    lg: '32px',
}

// ============================================
// Component
// ============================================

export function CardBlock({ block, renderChild, className }: Props) {
    const props = block.props as unknown as CardBlockProps
    const children = block.children ?? []

    const padding = props.padding ?? 'md'

    return (
        <div
            className={cn('overflow-hidden', className)}
            style={getCardStyle(padding)}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Card"
        >
            {children.map((child) => (
                renderChild ? (
                    <div key={child.id}>{renderChild(child)}</div>
                ) : null
            ))}
        </div>
    )
}

// ============================================
// Style computation — reads --sg-card-style
// to determine visual treatment
// ============================================

function getCardStyle(padding: string): React.CSSProperties {
    // The card-style token is a keyword. CSS can't branch on keywords,
    // so we provide the "default" treatment here and override in the
    // component when card-style detection is needed (future Phase).
    // For now, the default treatment respects all card tokens.
    return {
        backgroundColor: 'var(--sg-card-bg)',
        border: '1px solid var(--sg-card-border)',
        borderRadius: 'var(--sg-card-radius)',
        padding: PADDING[padding] ?? PADDING.md,
    }
}
