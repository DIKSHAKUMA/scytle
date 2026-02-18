/**
 * SocialBlock — Token-driven social media icon row
 *
 * Reads from CSS custom properties:
 *   --sg-text-muted
 *   --sg-text-primary
 *
 * Renders a row of social platform icons. In wireframe mode,
 * uses generic circle placeholders labeled with the first
 * letter of each platform.
 */

'use client'

import { cn } from '@/lib/utils'
import type { Block, SocialBlockProps, SocialBlockContent, SocialPlatform } from './types'

// ============================================
// Props
// ============================================

interface Props {
    block: Block
    className?: string
}

// ============================================
// Platform label map (first letter or abbreviation)
// ============================================

const PLATFORM_LABEL: Record<SocialPlatform, string> = {
    twitter: '𝕏',
    facebook: 'f',
    instagram: 'ig',
    linkedin: 'in',
    youtube: '▶',
    github: 'gh',
    dribbble: 'dr',
    tiktok: 'tk',
}

// ============================================
// Component
// ============================================

export function SocialBlock({ block, className }: Props) {
    const props = block.props as unknown as SocialBlockProps
    const content = block.content as unknown as SocialBlockContent

    const iconSize = props.iconSize ?? 20
    const gap = props.gap ?? 12
    const platforms = content.platforms ?? []

    return (
        <div
            className={cn('flex items-center', className)}
            style={{ gap: `${gap}px` }}
            data-layer-id={block.id}
            data-layer-type={block.type}
            data-layer-label="Social"
        >
            {platforms.map((platform) => (
                <span
                    key={platform}
                    className="inline-flex items-center justify-center"
                    style={{
                        width: `${iconSize + 12}px`,
                        height: `${iconSize + 12}px`,
                        borderRadius: '50%',
                        backgroundColor: 'color-mix(in oklch, var(--sg-text-primary) 8%, transparent)',
                        color: 'var(--sg-text-muted)',
                        fontSize: `${Math.max(10, iconSize * 0.55)}px`,
                        fontWeight: 600,
                        flexShrink: 0,
                    }}
                    title={platform}
                >
                    {PLATFORM_LABEL[platform] ?? platform.charAt(0)}
                </span>
            ))}
        </div>
    )
}
