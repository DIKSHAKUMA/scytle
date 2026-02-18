/**
 * FormBlock — Token-driven form container
 *
 * Reads from CSS custom properties (via children):
 *   Delegates all styling to child InputBlock / ButtonBlock
 *
 * Container block — renders `children` in a vertical stack.
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, FormBlockProps } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    renderChild?: (child: Block) => React.ReactNode
    className?: string
}

// ============================================
// Component
// ============================================

export function FormBlock({ block, renderChild, className }: Props) {
    const props = block.props as unknown as FormBlockProps
    const children = block.children ?? []

    const gap = props.gap ?? 16

    return (
        <div
            className={cn('flex flex-col', className)}
            style={{ gap: `${gap}px` }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Form"
            role="form"
        >
            {children.map((child) =>
                renderChild ? (
                    <div key={child.id}>{renderChild(child)}</div>
                ) : null,
            )}
        </div>
    )
}
