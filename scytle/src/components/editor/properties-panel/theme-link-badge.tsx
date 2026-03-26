/**
 * ThemeLinkBadge — tiny inline indicator showing when a property
 * is linked to a theme variable.
 *
 * Shows a small diamond ⬡ icon when linked (like Figma's variable icon).
 * Renders nothing when not linked.
 */

import { cn } from '@/lib/utils'

interface ThemeLinkBadgeProps {
    /** Whether the property is currently linked to a theme variable */
    isLinked: boolean
    /** The variable name (e.g. 'accent', 'font/heading') — shown in tooltip */
    variableName?: string
    className?: string
}

export function ThemeLinkBadge({ isLinked, variableName, className }: ThemeLinkBadgeProps) {
    if (!isLinked) return null

    return (
        <span
            className={cn(
                'inline-flex items-center justify-center w-3.5 h-3.5 shrink-0',
                'text-primary/50 hover:text-primary/80 transition-colors cursor-default',
                className,
            )}
            title={variableName ? `Linked to: ${variableName}` : 'Theme-linked'}
        >
            {/* Diamond/hexagon icon — Figma-style variable indicator */}
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
                <path
                    d="M5 1L9 5L5 9L1 5L5 1Z"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    fill="currentColor"
                    fillOpacity="0.15"
                />
            </svg>
        </span>
    )
}
