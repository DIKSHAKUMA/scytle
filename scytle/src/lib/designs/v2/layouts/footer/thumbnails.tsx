/**
 * Footer — Auto-generated Thumbnails
 *
 * One factory function creates thumbnail components from preset config.
 * Icons represent layout structure: columns, newsletter, social, contact, CTA, etc.
 */

import {
    AlignLeft,
    Columns2,
    Columns3,
    Mail,
    Users,
    Phone,
    Megaphone,
    Image,
    LayoutList,
    CreditCard,
    Minus,
} from 'lucide-react'
import type { FooterPresetConfig } from './types'

// ============================================
// Label generator
// ============================================

function getLabel(config: FooterPresetConfig): string {
    const parts: string[] = []

    // Family-specific prefix
    switch (config.family) {
        case 'a':
            parts.push('Newsletter+Cols')
            break
        case 'b':
            parts.push('Logo+Cols+Sub')
            break
        case 'c':
            parts.push('Contact+Links')
            break
        case 'd':
            parts.push('CTA+Links')
            break
        case 'e':
            // Use tags for standalone variants
            if (config.tags.includes('minimal')) parts.push('Minimal')
            else if (config.tags.includes('compact')) parts.push('Compact')
            else if (config.tags.includes('cta')) parts.push('CTA+Cols')
            else if (config.tags.includes('contact')) parts.push('Contact')
            else if (config.tags.includes('newsletter')) parts.push('Newsletter')
            else parts.push('Footer')
            break
    }

    // Card badge
    if (config.shell === 'card') parts.push('Card')

    return parts.join(' ')
}

// ============================================
// Icon picker
// ============================================

function getIcons(config: FooterPresetConfig) {
    const icons: { Icon: React.FC<{ className?: string }>; size: string }[] = []

    // Layout structure icon
    icons.push({ Icon: AlignLeft, size: 'w-4 h-4' })

    // Card indicator
    if (config.shell === 'card') {
        icons.push({ Icon: CreditCard, size: 'w-4 h-4' })
    }

    // Feature icons from tags
    const tags = config.tags
    if (tags.includes('newsletter')) icons.push({ Icon: Mail, size: 'w-3.5 h-3.5' })
    if (tags.includes('social')) icons.push({ Icon: Users, size: 'w-3.5 h-3.5' })
    if (tags.includes('contact')) icons.push({ Icon: Phone, size: 'w-3.5 h-3.5' })
    if (tags.includes('cta')) icons.push({ Icon: Megaphone, size: 'w-3.5 h-3.5' })
    if (tags.includes('brand-logo')) icons.push({ Icon: Image, size: 'w-3.5 h-3.5' })

    // Column count hints
    if (tags.includes('columns')) {
        if (tags.includes('large')) icons.push({ Icon: Columns3, size: 'w-3.5 h-3.5' })
        else icons.push({ Icon: Columns2, size: 'w-3.5 h-3.5' })
    }
    if (tags.includes('inline-links')) icons.push({ Icon: Minus, size: 'w-3.5 h-3.5' })
    if (tags.includes('avatars')) icons.push({ Icon: LayoutList, size: 'w-3.5 h-3.5' })

    return icons
}

// ============================================
// Thumbnail factory
// ============================================

/** Creates a thumbnail component from a Footer preset config. */
export function createThumbnail(config: FooterPresetConfig): React.FC {
    const icons = getIcons(config)
    const label = getLabel(config)

    const Thumbnail = function FooterThumbnail() {
        return (
            <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1.5">
                <div className="flex items-center gap-1.5">
                    {icons.map(({ Icon, size }, i) => (
                        <Icon key={i} className={`${size} text-gray-400`} />
                    ))}
                </div>
                <span className="text-[10px] text-gray-400 font-medium">{label}</span>
            </div>
        )
    }

    Thumbnail.displayName = `Footer${config.id.replace('footer-', '')}Thumbnail`
    return Thumbnail
}
