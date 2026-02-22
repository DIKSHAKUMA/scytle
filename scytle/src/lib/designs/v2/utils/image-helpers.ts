/**
 * Image utility helpers for V2 Design Mode
 *
 * Shared by ImageBlock, Hero5 (background image), and future
 * section components that render real images in design mode.
 */

import type { ImagePosition } from '../tokens'

// ============================================
// Aspect Ratio → CSS
// ============================================

/** Map a ratio string like '16:9' to a CSS aspect-ratio value like '16/9' */
export function ratioToCSS(ratio?: string): string | undefined {
    if (!ratio || ratio === 'auto') return undefined
    const map: Record<string, string> = {
        '16:9': '16/9',
        '3:2': '3/2',
        '4:3': '4/3',
        '1:1': '1/1',
        '3:4': '3/4',
        '2:3': '2/3',
    }
    return map[ratio]
}

// ============================================
// 9-Point Position → CSS object-position
// ============================================

const POSITION_MAP: Record<string, string> = {
    'top-left': 'left top',
    'top-center': 'center top',
    'top-right': 'right top',
    'center-left': 'left center',
    'center': 'center center',
    'center-right': 'right center',
    'bottom-left': 'left bottom',
    'bottom-center': 'center bottom',
    'bottom-right': 'right bottom',
}

/** Convert a 9-point position enum to a CSS object-position value */
export function positionToCSS(position?: ImagePosition | string): string {
    if (!position) return 'center center'
    return POSITION_MAP[position] ?? position
}
