/**
 * ButtonGroupBlock — Flex row of ButtonBlock children
 *
 * Container block — renders its `children` array as a horizontal row.
 * Each child should be a ButtonBlock.
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, ButtonGroupBlockProps, TextAlign } from './types'
import { ButtonBlock } from './button-block'

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

const JUSTIFY_CLASS: Record<TextAlign, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
}

// ============================================
// Component
// ============================================

export function ButtonGroupBlock({ block, className }: Props) {
    const props = block.props as unknown as ButtonGroupBlockProps
    const children = block.children ?? []

    const align = props.align ?? 'left'
    const gap = props.gap ?? 12

    return (
        <div
            className={cn('flex flex-wrap items-center', JUSTIFY_CLASS[align], className)}
            style={{ gap: `${gap}px` }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Button Group"
        >
            {children.map((child) => (
                <ButtonBlock key={child.id} block={child} />
            ))}
        </div>
    )
}
