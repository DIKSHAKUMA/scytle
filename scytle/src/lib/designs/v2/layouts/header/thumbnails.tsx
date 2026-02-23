/**
 * Header — Auto-generated Thumbnails
 *
 * One factory function creates thumbnail components from preset config.
 * Icons represent alignment, background, and element axes.
 */

import {
    AlignLeft, AlignCenter, ImageIcon,
    Mail, VideoIcon, Layers,
} from 'lucide-react'
import type { HeaderPresetConfig } from './types'

// ============================================
// Label generator
// ============================================

function getLabel(config: HeaderPresetConfig): string {
    const parts: string[] = []
    const element = config.axes.element ?? 'button'

    // Alignment
    parts.push(config.align === 'center' ? 'Center' : 'Left')

    // Element
    if (element === 'form') parts.push('Form')
    else if (element === 'none') parts.push('Minimal')
    else parts.push('CTA')

    // Background
    if (config.background === 'image') parts.push('BG')
    if (config.background === 'video') parts.push('Video')

    return parts.join(' ')
}

// ============================================
// Icon picker
// ============================================

function getIcons(config: HeaderPresetConfig) {
    const icons: { Icon: React.FC<{ className?: string }>; size: string }[] = []
    const element = config.axes.element ?? 'button'

    // Alignment icon
    if (config.align === 'left') icons.push({ Icon: AlignLeft, size: 'w-4 h-4' })
    else icons.push({ Icon: AlignCenter, size: 'w-4 h-4' })

    // Background icon
    if (config.background === 'image') icons.push({ Icon: Layers, size: 'w-4 h-4' })
    if (config.background === 'video') icons.push({ Icon: VideoIcon, size: 'w-4 h-4' })

    // Image role indicator
    if (config.imageRole === 'background') icons.push({ Icon: ImageIcon, size: 'w-5 h-5' })

    // Element icon (form only)
    if (element === 'form') icons.push({ Icon: Mail, size: 'w-4 h-4' })

    return icons
}

// ============================================
// Thumbnail factory
// ============================================

/** Creates a thumbnail component from a header preset config. */
export function createThumbnail(config: HeaderPresetConfig): React.FC {
    const icons = getIcons(config)
    const label = getLabel(config)

    const Thumbnail = function HeaderThumbnail() {
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

    Thumbnail.displayName = `Header${config.id.replace('header-', '')}Thumbnail`
    return Thumbnail
}
