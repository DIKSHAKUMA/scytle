/**
 * CTA — Auto-generated Thumbnails
 *
 * One factory function creates thumbnail components from preset config,
 * replacing 41 individual hand-written thumbnail components.
 *
 * Icons are chosen based on shell, background, align, and element axis.
 */

import {
    AlignLeft, AlignCenter, ImageIcon, CreditCard,
    Maximize2, Mail, VideoIcon, Layers, Columns2,
} from 'lucide-react'
import type { CtaPresetConfig } from './types'

// ============================================
// Label generator
// ============================================

function getLabel(config: CtaPresetConfig): string {
    const parts: string[] = []
    const element = config.axes.element ?? 'button'
    const isForm = element === 'form'

    // Shell-based prefix
    if (config.shell === 'card' || config.shell === 'card-bg') parts.push('Card')
    else if (config.shell === 'expand' || config.shell === 'bare') parts.push('Expand')

    // Background
    if (config.background === 'image') parts.push('BG')
    if (config.background === 'video') parts.push('Video')

    // Element
    parts.push(isForm ? 'Form' : 'CTA')

    // Image presence
    if (config.imageRole === 'inline') parts.push('+ Image')

    return parts.join(' ')
}

// ============================================
// Icon picker
// ============================================

function getIcons(config: CtaPresetConfig) {
    const icons: { Icon: React.FC<{ className?: string }>; size: string }[] = []
    const element = config.axes.element ?? 'button'

    // Alignment icon (for families with explicit alignment)
    if (config.align === 'left') icons.push({ Icon: AlignLeft, size: 'w-4 h-4' })
    else if (config.align === 'center') icons.push({ Icon: AlignCenter, size: 'w-4 h-4' })

    // Family B two-column indicator
    if (config.family === 'b' && config.align === 'none') icons.push({ Icon: Columns2, size: 'w-4 h-4' })

    // Shell icon
    if (config.shell === 'card' || config.shell === 'card-bg') icons.push({ Icon: CreditCard, size: 'w-4 h-4' })
    if (config.shell === 'bare' || config.shell === 'expand') icons.push({ Icon: Maximize2, size: 'w-4 h-4' })

    // Background icon
    if (config.background === 'image') icons.push({ Icon: Layers, size: 'w-4 h-4' })
    if (config.background === 'video') icons.push({ Icon: VideoIcon, size: 'w-4 h-4' })

    // Inline image
    if (config.imageRole === 'inline') icons.push({ Icon: ImageIcon, size: 'w-5 h-5' })

    // Element icon (form only — button is default)
    if (element === 'form') icons.push({ Icon: Mail, size: 'w-4 h-4' })

    return icons
}

// ============================================
// Thumbnail factory
// ============================================

/** Creates a thumbnail component from a preset config. */
export function createThumbnail(config: CtaPresetConfig): React.FC {
    const icons = getIcons(config)
    const label = getLabel(config)

    const Thumbnail = function CtaThumbnail() {
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

    Thumbnail.displayName = `${config.id.replace('cta-', 'Cta')}Thumbnail`
    return Thumbnail
}
