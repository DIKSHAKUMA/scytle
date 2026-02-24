/**
 * Navbar — Auto-generated Thumbnails
 *
 * One factory function creates thumbnail components from preset config.
 * Icons represent layout, shell, and features.
 */

import {
    AlignLeft, AlignCenter,
    Menu, PanelTop, Columns2,
    Navigation,
} from 'lucide-react'
import type { NavbarPresetConfig } from './types'

// ============================================
// Label generator
// ============================================

function getLabel(config: NavbarPresetConfig): string {
    const parts: string[] = []

    // Shell type
    if (config.shell === 'floating') parts.push('Floating')
    else if (config.shell === 'two-row') parts.push('Two-Row')

    // Layout type
    switch (config.layout) {
        case 'center-links':
            parts.push('Center Nav')
            break
        case 'center-logo':
            parts.push('Center Logo')
            break
        case 'hamburger':
            parts.push('Hamburger')
            break
        case 'hamburger-links':
            parts.push('Burger+Nav')
            break
        default:
            parts.push('Standard')
    }

    // Button count
    if (config.buttonCount === 1) parts.push('1 Btn')
    else if (config.buttonCount === 2) parts.push('2 Btn')

    return parts.join(' · ')
}

// ============================================
// Icon picker
// ============================================

function getIcons(config: NavbarPresetConfig) {
    const icons: { Icon: React.FC<{ className?: string }>; size: string }[] = []

    // Layout icon
    switch (config.layout) {
        case 'center-links':
        case 'center-logo':
            icons.push({ Icon: AlignCenter, size: 'w-4 h-4' })
            break
        case 'hamburger':
        case 'hamburger-links':
            icons.push({ Icon: Menu, size: 'w-4 h-4' })
            break
        default:
            icons.push({ Icon: AlignLeft, size: 'w-4 h-4' })
    }

    // Shell icon
    if (config.shell === 'floating') {
        icons.push({ Icon: PanelTop, size: 'w-4 h-4' })
    } else if (config.shell === 'two-row') {
        icons.push({ Icon: Columns2, size: 'w-4 h-4' })
    } else {
        icons.push({ Icon: Navigation, size: 'w-4 h-4' })
    }

    return icons
}

// ============================================
// Thumbnail factory
// ============================================

/** Creates a thumbnail component from a navbar preset config. */
export function createThumbnail(config: NavbarPresetConfig): React.FC {
    const icons = getIcons(config)
    const label = getLabel(config)

    const Thumbnail = function NavbarThumbnail() {
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

    Thumbnail.displayName = `Navbar${config.id.replace('navbar-', '')}Thumbnail`
    return Thumbnail
}
