/**
 * Header Family C — Block Factories & Preset Configs
 *
 * 3 presets: Header 49, 60, 61
 * Layout: Minimal two-column split. Left column has heading only,
 *         right column has body text only. No tagline, no actions.
 *
 * Axes: Background (none/image/video) — single axis, no element toggle
 *
 * Shell mapping:
 *   Background=none  → 'container'     (solid bg, standard text color)
 *   Background=image → 'bg-container'  (bg image + dark overlay, white text)
 *   Background=video → 'bg-container'  (video placeholder, white text)
 *
 * Figma structure (desktop):
 *   section → Container(1280) → Component(2-col, gap-80)
 *     ├── Column 1 (flex-1): Heading
 *     └── Column 2 (flex-1): Body
 *   Mobile: stacks vertical, gap-20
 */

import type { Block } from '../../../blocks/types'
import type { HeaderPresetConfig } from '../types'
import { uid, resetUid, makeHeading, makeBody } from './shared-builders'

// ============================================
// Column builders
// ============================================

/** Left column: heading only (flex-1) */
function makeLeftColumn(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
        },
        content: {},
        children: [makeHeading('left')],
    }
}

/** Right column: body text only (flex-1) */
function makeRightColumn(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            sizing: { width: 'fill' },
        },
        content: {},
        children: [makeBody('left')],
    }
}

// ============================================
// Block tree builder (single layout, no element axis)
// ============================================

/**
 * Two-column split: heading (left) + body (right).
 * Root frame: horizontal, gap-80, stacks on mobile.
 */
function buildSplitBlocks(): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'horizontal',
            gap: 80,
            sizing: { width: 'fill' },
            className: '@max-sm:!flex-col @max-sm:!gap-5',
        },
        content: {},
        children: [makeLeftColumn(), makeRightColumn()],
    }]
}

// ============================================
// Block Factories (3 total)
// ============================================

/** Header 49 — None (minimal split) */
export function buildHeader49Blocks(): Block[] { resetUid(); return buildSplitBlocks() }

/** Header 60 — Image (minimal split on background image) */
export function buildHeader60Blocks(): Block[] { resetUid(); return buildSplitBlocks() }

/** Header 61 — Video (minimal split on background video) */
export function buildHeader61Blocks(): Block[] { resetUid(); return buildSplitBlocks() }

// ============================================
// Preset Configs (3 total)
// ============================================

const HEADER_49: HeaderPresetConfig = {
    id: 'header-49', name: 'Header 49', family: 'c',
    description: 'Minimal split header — heading + body',
    tags: ['header', 'split', 'minimal', 'two-column'],
    shell: 'container', align: 'left', background: 'none',
    imageRole: 'none', supportsVideo: false,
    axes: { background: 'none' },
}

const HEADER_60: HeaderPresetConfig = {
    id: 'header-60', name: 'Header 60', family: 'c',
    description: 'Minimal split header on background image',
    tags: ['header', 'split', 'minimal', 'background', 'image', 'two-column'],
    shell: 'bg-container', align: 'left', background: 'image',
    imageRole: 'background', supportsVideo: false,
    axes: { background: 'image' },
}

const HEADER_61: HeaderPresetConfig = {
    id: 'header-61', name: 'Header 61', family: 'c',
    description: 'Minimal split header on background video',
    tags: ['header', 'split', 'minimal', 'background', 'video', 'two-column'],
    shell: 'bg-container', align: 'left', background: 'video',
    imageRole: 'none', supportsVideo: true,
    axes: { background: 'video' },
}

// ============================================
// Aggregated exports
// ============================================

export const FAMILY_C_PRESETS: HeaderPresetConfig[] = [
    HEADER_49, HEADER_60, HEADER_61,
]

export const FAMILY_C_PRESETS_MAP: Record<string, HeaderPresetConfig> = Object.fromEntries(
    FAMILY_C_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_C_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'header-49': buildHeader49Blocks,
    'header-60': buildHeader60Blocks,
    'header-61': buildHeader61Blocks,
}
