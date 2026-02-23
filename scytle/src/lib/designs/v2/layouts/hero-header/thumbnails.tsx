/**
 * Hero Header — Auto-generated Thumbnails
 *
 * One factory function creates thumbnail components from preset config,
 * replacing all individual hand-written thumbnail components.
 *
 * Icons chosen based on shell, background, align, family, and element axis.
 */

import {
    AlignLeft, AlignCenter, ImageIcon, CreditCard,
    Mail, VideoIcon, Layers, Columns2, LayoutPanelLeft,
} from 'lucide-react'
import type { HeroHeaderPresetConfig } from './types'

// ============================================
// Label generator
// ============================================

function getLabel(config: HeroHeaderPresetConfig): string {
    const parts: string[] = []
    const element = config.axes.element ?? 'button'
    const isForm = element === 'form'

    // Shell-based prefix
    if (config.shell === 'card' || config.shell === 'card-bg') parts.push('Card')

    // Background
    if (config.background === 'image') parts.push('BG')
    if (config.background === 'video') parts.push('Video BG')

    // Family-specific layout hint
    if (config.family === 'c') parts.push('Stacked')
    else if (config.family === 'a' || config.family === 'd' || config.family === 'e') {
        if (config.imageRole === 'inline') parts.push('Split')
    }

    // Element
    parts.push(isForm ? 'Form' : 'Hero')

    // Asset presence
    const asset = config.axes.asset
    if (asset === 'image' && config.imageRole === 'inline') parts.push('+ Img')
    if (asset === 'video' && config.imageRole === 'none' && config.background === 'none') parts.push('+ Vid')

    return parts.join(' ')
}

// ============================================
// Icon picker
// ============================================

function getIcons(config: HeroHeaderPresetConfig) {
    const icons: { Icon: React.FC<{ className?: string }>; size: string }[] = []
    const element = config.axes.element ?? 'button'

    // Alignment icon
    if (config.align === 'left') icons.push({ Icon: AlignLeft, size: 'w-4 h-4' })
    else if (config.align === 'center') icons.push({ Icon: AlignCenter, size: 'w-4 h-4' })

    // Split layout indicator
    if (config.family === 'a' || config.family === 'd' || config.family === 'e') {
        icons.push({ Icon: LayoutPanelLeft, size: 'w-4 h-4' })
    }

    // Stacked (two-column below) indicator
    if (config.family === 'c') icons.push({ Icon: Columns2, size: 'w-4 h-4' })

    // Shell icon
    if (config.shell === 'card' || config.shell === 'card-bg') {
        icons.push({ Icon: CreditCard, size: 'w-4 h-4' })
    }

    // Background icon
    if (config.background === 'image') icons.push({ Icon: Layers, size: 'w-4 h-4' })
    if (config.background === 'video') icons.push({ Icon: VideoIcon, size: 'w-4 h-4' })

    // Inline image
    if (config.imageRole === 'inline') icons.push({ Icon: ImageIcon, size: 'w-5 h-5' })

    // Inline video (no background, asset=video)
    if (config.axes.asset === 'video' && config.background === 'none') {
        icons.push({ Icon: VideoIcon, size: 'w-5 h-5' })
    }

    // Element icon (form only — button is default)
    if (element === 'form') icons.push({ Icon: Mail, size: 'w-4 h-4' })

    return icons
}

// ============================================
// Thumbnail factory
// ============================================

/** Creates a thumbnail component from a preset config. */
export function createThumbnail(config: HeroHeaderPresetConfig): React.FC {
    const icons = getIcons(config)
    const label = getLabel(config)

    const Thumbnail = function HeroHeaderThumbnail() {
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

    Thumbnail.displayName = `${config.id.replace('hero-header-', 'HH')}Thumbnail`
    return Thumbnail
}
