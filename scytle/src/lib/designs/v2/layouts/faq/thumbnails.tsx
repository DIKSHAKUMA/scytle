/**
 * FAQ — Auto-generated Thumbnails
 *
 * One factory function creates thumbnail components from preset config.
 * Icons represent layout structure: accordion, grid, split, columns, icons.
 */

import {
    AlignLeft, AlignCenter,
    List, LayoutGrid, Columns2,
    HelpCircle, Sparkles,
} from 'lucide-react'
import type { FaqPresetConfig } from './types'

// ============================================
// Label generator
// ============================================

function getLabel(config: FaqPresetConfig): string {
    const parts: string[] = []

    switch (config.family) {
        case 'a':
            parts.push('Accordion')
            if (config.axes.columns === '2') parts.push('2-Col')
            if (config.axes.style === 'card') parts.push('Card')
            break
        case 'b':
            parts.push('Split')
            if (config.axes.style === 'card') parts.push('Card')
            break
        case 'c': {
            const cols = config.axes.columns ?? '1'
            parts.push(`${cols}-Col Grid`)
            break
        }
        case 'd':
            parts.push('Split H-QA')
            break
        case 'e':
            parts.push('H-QA')
            break
        case 'f':
            parts.push('Icon Grid')
            break
    }

    return parts.join(' ')
}

// ============================================
// Icon picker
// ============================================

function getIcons(config: FaqPresetConfig) {
    const icons: { Icon: React.FC<{ className?: string }>; size: string }[] = []

    // Alignment
    if (config.align === 'left') icons.push({ Icon: AlignLeft, size: 'w-4 h-4' })
    else icons.push({ Icon: AlignCenter, size: 'w-4 h-4' })

    // Family-specific
    switch (config.family) {
        case 'a':
        case 'b':
            icons.push({ Icon: List, size: 'w-4 h-4' })
            if (config.axes.columns === '2') icons.push({ Icon: Columns2, size: 'w-4 h-4' })
            break
        case 'c':
            icons.push({ Icon: LayoutGrid, size: 'w-4 h-4' })
            break
        case 'd':
            icons.push({ Icon: Columns2, size: 'w-4 h-4' })
            icons.push({ Icon: HelpCircle, size: 'w-4 h-4' })
            break
        case 'e':
            icons.push({ Icon: HelpCircle, size: 'w-4 h-4' })
            break
        case 'f':
            icons.push({ Icon: Sparkles, size: 'w-4 h-4' })
            break
    }

    return icons
}

// ============================================
// Thumbnail factory
// ============================================

/** Creates a thumbnail component from a FAQ preset config. */
export function createThumbnail(config: FaqPresetConfig): React.FC {
    const icons = getIcons(config)
    const label = getLabel(config)

    const Thumbnail = function FaqThumbnail() {
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

    Thumbnail.displayName = `Faq${config.id.replace('faq-', '')}Thumbnail`
    return Thumbnail
}
