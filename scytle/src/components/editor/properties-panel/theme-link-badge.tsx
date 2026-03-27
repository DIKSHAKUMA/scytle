/**
 * ThemeLinkBadge — tiny inline indicator showing when a property
 * is linked to a theme variable.
 *
 * Shows a small diamond ⬡ icon when linked (like Figma's variable icon).
 * When onClick is provided, the badge is clickable (opens VariablePicker).
 * When not linked and showUnlinked is true, shows a subtle bind button.
 */

import { cn } from '@/lib/utils'

interface ThemeLinkBadgeProps {
    /** Whether the property is currently linked to a theme variable */
    isLinked: boolean
    /** The variable name (e.g. 'accent', 'font/heading') — shown in tooltip */
    variableName?: string
    /** Click handler — when provided, badge becomes a button (opens VariablePicker) */
    onClick?: () => void
    /** Show a subtle unlinked state button (for binding) — requires onClick */
    showUnlinked?: boolean
    className?: string
}

export function ThemeLinkBadge({ isLinked, variableName, onClick, showUnlinked, className }: ThemeLinkBadgeProps) {
    // If not linked and we don't show unlinked state, render nothing
    if (!isLinked && !showUnlinked) return null

    const isButton = !!onClick

    const element = (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
            <path
                d="M5 1L9 5L5 9L1 5L5 1Z"
                stroke="currentColor"
                strokeWidth="1.2"
                fill={isLinked ? 'currentColor' : 'none'}
                fillOpacity={isLinked ? 0.15 : 0}
            />
        </svg>
    )

    if (isButton) {
        return (
            <button
                className={cn(
                    'inline-flex items-center justify-center w-3.5 h-3.5 shrink-0 transition-colors',
                    isLinked
                        ? 'text-primary/60 hover:text-primary cursor-pointer'
                        : 'text-muted-foreground/20 hover:text-muted-foreground/50 cursor-pointer opacity-0 group-hover:opacity-100',
                    className,
                )}
                onClick={(e) => {
                    e.stopPropagation()
                    onClick()
                }}
                title={
                    isLinked
                        ? variableName ? `Linked to: ${variableName} (click to change)` : 'Theme-linked (click to change)'
                        : 'Bind variable'
                }
            >
                {element}
            </button>
        )
    }

    return (
        <span
            className={cn(
                'inline-flex items-center justify-center w-3.5 h-3.5 shrink-0',
                'text-primary/50 hover:text-primary/80 transition-colors cursor-default',
                className,
            )}
            title={variableName ? `Linked to: ${variableName}` : 'Theme-linked'}
        >
            {element}
        </span>
    )
}
