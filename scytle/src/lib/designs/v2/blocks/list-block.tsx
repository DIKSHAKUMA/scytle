/**
 * ListBlock — Token-driven list with icon bullets
 *
 * Reads from CSS custom properties:
 *   --sg-text-primary
 *   --sg-text-secondary
 *   --sg-text-muted
 *   --sg-bg-accent
 *   --sg-font-body
 *   --sg-body-size
 *   --sg-body-weight
 */

'use client'

import { cn } from '@/lib/utils'
import { Check, ChevronRight, Circle, Minus } from 'lucide-react'
import type { Block, ListBlockProps, ListBlockContent, ListIcon } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Icon resolvers
// ============================================

function getListIcon(icon: ListIcon, index: number): React.ReactNode {
    const size = 16

    switch (icon) {
        case 'check':
            return <Check size={size} />
        case 'arrow':
            return <ChevronRight size={size} />
        case 'number':
            return (
                <span
                    className="inline-flex items-center justify-center"
                    style={{
                        width: '20px',
                        height: '20px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '50%',
                        backgroundColor: 'var(--sg-bg-accent)',
                        color: 'var(--sg-text-on-accent)',
                        flexShrink: 0,
                    }}
                >
                    {index + 1}
                </span>
            )
        case 'bullet':
            return <Circle size={6} fill="currentColor" />
        case 'dash':
            return <Minus size={size} />
        default:
            return null
    }
}

// ============================================
// Component
// ============================================

export function ListBlock({ block, className }: Props) {
    const props = block.props as unknown as ListBlockProps
    const content = block.content as unknown as ListBlockContent

    const icon = props.icon ?? 'bullet'
    const gap = props.gap ?? 12
    const items = content.items ?? []

    const isOrdered = icon === 'number'
    const Tag = isOrdered ? 'ol' : 'ul'

    return (
        <Tag
            className={cn('list-none p-0 m-0', className)}
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: `${gap}px`,
                fontFamily: 'var(--sg-font-body)',
                fontSize: 'var(--sg-body-size)',
                fontWeight: 'var(--sg-body-weight)',
                color: 'var(--sg-text-secondary)',
            }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="List"
        >
            {items.map((item, i) => (
                <li
                    key={i}
                    className="flex items-start"
                    style={{ gap: '10px' }}
                >
                    {icon !== 'none' && (
                        <span
                            className="flex-shrink-0 flex items-center justify-center"
                            style={{
                                marginTop: '2px',
                                color: 'var(--sg-text-muted)',
                            }}
                        >
                            {getListIcon(icon, i)}
                        </span>
                    )}
                    <span>{item}</span>
                </li>
            ))}
        </Tag>
    )
}
