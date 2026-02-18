/**
 * InputBlock — Token-driven form input / textarea placeholder
 *
 * Reads from CSS custom properties:
 *   --sg-card-bg             (input background)
 *   --sg-card-border         (input border)
 *   --sg-button-radius       (input rounding)
 *   --sg-text-primary        (input value text)
 *   --sg-text-muted          (placeholder text)
 *   --sg-font-body
 *   --sg-body-size
 *
 * This is a "dumb" block — it renders a visual representation
 * of a form field, not an interactive one.
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, InputBlockProps, InputBlockContent } from './types'

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

export function InputBlock({ block, className }: Props) {
    const props = block.props as unknown as InputBlockProps
    const content = block.content as unknown as InputBlockContent

    const fieldType = props.fieldType ?? 'text'
    const required = props.required ?? false

    const label = content.label
    const placeholder = content.placeholder || ''

    const isTextarea = fieldType === 'textarea'

    return (
        <div
            className={cn('flex flex-col gap-1.5', className)}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Input"
        >
            {/* Label */}
            {label && (
                <span
                    style={{
                        fontFamily: 'var(--sg-font-body)',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: 'var(--sg-text-primary)',
                    }}
                >
                    {label}
                    {required && (
                        <span style={{ color: 'var(--sg-bg-accent)', marginLeft: '2px' }}>*</span>
                    )}
                </span>
            )}

            {/* Field visual */}
            <div
                style={{
                    fontFamily: 'var(--sg-font-body)',
                    fontSize: 'var(--sg-body-size)',
                    color: 'var(--sg-text-muted)',
                    backgroundColor: 'var(--sg-card-bg)',
                    border: '1px solid var(--sg-card-border)',
                    borderRadius: 'var(--sg-button-radius)',
                    padding: isTextarea ? '10px 12px' : '8px 12px',
                    minHeight: isTextarea ? '80px' : 'auto',
                }}
            >
                {placeholder}
            </div>
        </div>
    )
}
