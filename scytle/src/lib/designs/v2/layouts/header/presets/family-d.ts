/**
 * Header Family D — Block Factories & Preset Configs
 *
 * 6 presets: Header 96–101
 * Layout: Card overlay. Section contains a constrained card (1280 container)
 *         with centered content (max-width 768px). The card itself carries
 *         background/border styling — NOT the section.
 *
 * Axes: Background (none/image/video) × Element (button/form)
 * Combo: 3 × 2 = 6 variants
 *
 * Shell mapping:
 *   Background=none  → 'card'     (bordered card, foreground bg, standard text)
 *   Background=image → 'card-bg'  (card with bg image + overlay inside card, white text)
 *   Background=video → 'card-bg'  (card with solid neutral-dark bg, white text)
 *
 * Figma structure (desktop):
 *   section(py-80 px-64) → Container(1280) → Card(full-width, h-640, px-64)
 *     └── Content(max-w-768, centered, gap-32)
 *           ├── TextGroup(gap-24): Heading + Body
 *           └── Actions: ButtonGroup (center) or Form (center, 513px)
 *   Mobile: Card(p-32), Content(gap-24), TextGroup(gap-20)
 */

import type { Block } from '../../../blocks/types'
import type { HeaderPresetConfig } from '../types'
import {
    uid, resetUid,
    makeHeading, makeBody,
    makeButtonGroup, makeFormActions,
} from './shared-builders'

// ============================================
// Content builder (shared across all D variants)
// ============================================

/** Text group: heading + body (centered, gap-24, mobile gap-20) */
function makeTextGroup(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-5',
        },
        content: {},
        children: [makeHeading('center'), makeBody('center')],
    }
}

// ============================================
// Block tree builders (parametrized by element)
// ============================================

/**
 * Element=button: centered content with button group.
 * Single frame: vertical, max-width 768, gap-32, centered.
 */
function buildButtonBlocks(): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 768,
            sizing: { width: 'fill' },
            className: 'items-center text-center mx-auto @max-sm:!gap-6',
        },
        content: {},
        children: [makeTextGroup(), makeButtonGroup('center')],
    }]
}

/**
 * Element=form: centered content with email form.
 * Single frame: vertical, max-width 768, gap-32, centered.
 */
function buildFormBlocks(): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 768,
            sizing: { width: 'fill' },
            className: 'items-center text-center mx-auto @max-sm:!gap-6',
        },
        content: {},
        children: [makeTextGroup(), makeFormActions('center', 513)],
    }]
}

// ============================================
// Block Factories (6 total)
// ============================================

// ── Background = None ───────────────────────────────────────

/** Header 96 — Card + None + Button */
export function buildHeader96Blocks(): Block[] { resetUid(); return buildButtonBlocks() }

/** Header 97 — Card + None + Form */
export function buildHeader97Blocks(): Block[] { resetUid(); return buildFormBlocks() }

// ── Background = Image ──────────────────────────────────────

/** Header 98 — Card + Image + Button */
export function buildHeader98Blocks(): Block[] { resetUid(); return buildButtonBlocks() }

/** Header 99 — Card + Image + Form */
export function buildHeader99Blocks(): Block[] { resetUid(); return buildFormBlocks() }

// ── Background = Video ──────────────────────────────────────

/** Header 100 — Card + Video + Button */
export function buildHeader100Blocks(): Block[] { resetUid(); return buildButtonBlocks() }

/** Header 101 — Card + Video + Form */
export function buildHeader101Blocks(): Block[] { resetUid(); return buildFormBlocks() }

// ============================================
// Preset Configs (6 total)
// ============================================

const HEADER_96: HeaderPresetConfig = {
    id: 'header-96', name: 'Header 96', family: 'd',
    description: 'Card header with centered buttons',
    tags: ['header', 'card', 'button', 'centered'],
    shell: 'card', align: 'center', background: 'none',
    imageRole: 'none', supportsVideo: false,
    axes: { background: 'none', element: 'button' },
}

const HEADER_97: HeaderPresetConfig = {
    id: 'header-97', name: 'Header 97', family: 'd',
    description: 'Card header with centered email form',
    tags: ['header', 'card', 'form', 'centered'],
    shell: 'card', align: 'center', background: 'none',
    imageRole: 'none', supportsVideo: false,
    axes: { background: 'none', element: 'form' },
}

const HEADER_98: HeaderPresetConfig = {
    id: 'header-98', name: 'Header 98', family: 'd',
    description: 'Card header with buttons on background image',
    tags: ['header', 'card', 'button', 'background', 'image', 'centered'],
    shell: 'card-bg', align: 'center', background: 'image',
    imageRole: 'background', supportsVideo: false,
    axes: { background: 'image', element: 'button' },
}

const HEADER_99: HeaderPresetConfig = {
    id: 'header-99', name: 'Header 99', family: 'd',
    description: 'Card header with email form on background image',
    tags: ['header', 'card', 'form', 'background', 'image', 'centered'],
    shell: 'card-bg', align: 'center', background: 'image',
    imageRole: 'background', supportsVideo: false,
    axes: { background: 'image', element: 'form' },
}

const HEADER_100: HeaderPresetConfig = {
    id: 'header-100', name: 'Header 100', family: 'd',
    description: 'Card header with buttons on background video',
    tags: ['header', 'card', 'button', 'background', 'video', 'centered'],
    shell: 'card-bg', align: 'center', background: 'video',
    imageRole: 'none', supportsVideo: true,
    axes: { background: 'video', element: 'button' },
}

const HEADER_101: HeaderPresetConfig = {
    id: 'header-101', name: 'Header 101', family: 'd',
    description: 'Card header with email form on background video',
    tags: ['header', 'card', 'form', 'background', 'video', 'centered'],
    shell: 'card-bg', align: 'center', background: 'video',
    imageRole: 'none', supportsVideo: true,
    axes: { background: 'video', element: 'form' },
}

// ============================================
// Aggregated exports
// ============================================

export const FAMILY_D_PRESETS: HeaderPresetConfig[] = [
    HEADER_96, HEADER_97,
    HEADER_98, HEADER_99,
    HEADER_100, HEADER_101,
]

export const FAMILY_D_PRESETS_MAP: Record<string, HeaderPresetConfig> = Object.fromEntries(
    FAMILY_D_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_D_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'header-96': buildHeader96Blocks,
    'header-97': buildHeader97Blocks,
    'header-98': buildHeader98Blocks,
    'header-99': buildHeader99Blocks,
    'header-100': buildHeader100Blocks,
    'header-101': buildHeader101Blocks,
}
