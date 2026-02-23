/**
 * Header Family B — Block Factories & Preset Configs
 *
 * 6 presets: Header 47–48, 56–59
 * Layout: Two-column split. Left column has tagline + heading,
 *         right column has body + actions (buttons or form).
 *         No text alignment axis — content is always left-aligned.
 *
 * Axes: Background (none/image/video) × Element (button/form)
 * Combo: 3 × 2 = 6 variants
 *
 * Shell mapping:
 *   Background=none  → 'container'     (solid bg, standard text color)
 *   Background=image → 'bg-container'  (bg image + dark overlay, white text)
 *   Background=video → 'bg-container'  (video placeholder, white text)
 *
 * Figma structure (desktop):
 *   section → Container(1280) → Component(2-col, gap-80)
 *     ├── Column 1 (flex-1, gap-16): Tagline + Heading
 *     └── Column 2 (flex-1, gap-32): Body + Actions
 *   Mobile: stacks vertical, gap-20
 */

import type { Block } from '../../../blocks/types'
import type { HeaderPresetConfig } from '../types'
import {
    uid, resetUid,
    makeTagline, makeHeading, makeBody,
    makeButtonGroup, makeFormActions,
} from './shared-builders'

// ============================================
// Column builders
// ============================================

/** Left column: tagline + heading (gap-16, mobile gap-12) */
function makeLeftColumn(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 16,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-3',
        },
        content: {},
        children: [makeTagline('left'), makeHeading('left')],
    }
}

/** Right column with buttons: body + buttonGroup (gap-32, mobile gap-24) */
function makeRightColumnButton(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeBody('left'), makeButtonGroup('left')],
    }
}

/** Right column with form: body + formActions (gap-32, mobile gap-24) */
function makeRightColumnForm(): Block {
    return {
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeBody('left'), makeFormActions('left', 513)],
    }
}

// ============================================
// Block tree builders (parametrized by element)
// ============================================

/**
 * Element=button: split layout with buttonGroup in right column.
 * Root frame: horizontal, gap-80, stacks on mobile.
 */
function buildButtonBlocks(): Block[] {
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
        children: [makeLeftColumn(), makeRightColumnButton()],
    }]
}

/**
 * Element=form: split layout with formActions in right column.
 * Root frame: horizontal, gap-80, stacks on mobile.
 */
function buildFormBlocks(): Block[] {
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
        children: [makeLeftColumn(), makeRightColumnForm()],
    }]
}

// ============================================
// Block Factories (6 total)
// ============================================

// ── Background = None ───────────────────────────────────────

/** Header 47 — None + Button */
export function buildHeader47Blocks(): Block[] { resetUid(); return buildButtonBlocks() }

/** Header 48 — None + Form */
export function buildHeader48Blocks(): Block[] { resetUid(); return buildFormBlocks() }

// ── Background = Image ──────────────────────────────────────

/** Header 56 — Image + Button */
export function buildHeader56Blocks(): Block[] { resetUid(); return buildButtonBlocks() }

/** Header 58 — Image + Form */
export function buildHeader58Blocks(): Block[] { resetUid(); return buildFormBlocks() }

// ── Background = Video ──────────────────────────────────────

/** Header 57 — Video + Button */
export function buildHeader57Blocks(): Block[] { resetUid(); return buildButtonBlocks() }

/** Header 59 — Video + Form */
export function buildHeader59Blocks(): Block[] { resetUid(); return buildFormBlocks() }

// ============================================
// Preset Configs (6 total)
// ============================================

const HEADER_47: HeaderPresetConfig = {
    id: 'header-47', name: 'Header 47', family: 'b',
    description: 'Split header with buttons',
    tags: ['header', 'split', 'button', 'two-column'],
    shell: 'container', align: 'left', background: 'none',
    imageRole: 'none', supportsVideo: false,
    axes: { background: 'none', element: 'button' },
}

const HEADER_48: HeaderPresetConfig = {
    id: 'header-48', name: 'Header 48', family: 'b',
    description: 'Split header with email form',
    tags: ['header', 'split', 'form', 'two-column'],
    shell: 'container', align: 'left', background: 'none',
    imageRole: 'none', supportsVideo: false,
    axes: { background: 'none', element: 'form' },
}

const HEADER_56: HeaderPresetConfig = {
    id: 'header-56', name: 'Header 56', family: 'b',
    description: 'Split header with buttons on background image',
    tags: ['header', 'split', 'button', 'background', 'image', 'two-column'],
    shell: 'bg-container', align: 'left', background: 'image',
    imageRole: 'background', supportsVideo: false,
    axes: { background: 'image', element: 'button' },
}

const HEADER_57: HeaderPresetConfig = {
    id: 'header-57', name: 'Header 57', family: 'b',
    description: 'Split header with buttons on background video',
    tags: ['header', 'split', 'button', 'background', 'video', 'two-column'],
    shell: 'bg-container', align: 'left', background: 'video',
    imageRole: 'none', supportsVideo: true,
    axes: { background: 'video', element: 'button' },
}

const HEADER_58: HeaderPresetConfig = {
    id: 'header-58', name: 'Header 58', family: 'b',
    description: 'Split header with email form on background image',
    tags: ['header', 'split', 'form', 'background', 'image', 'two-column'],
    shell: 'bg-container', align: 'left', background: 'image',
    imageRole: 'background', supportsVideo: false,
    axes: { background: 'image', element: 'form' },
}

const HEADER_59: HeaderPresetConfig = {
    id: 'header-59', name: 'Header 59', family: 'b',
    description: 'Split header with email form on background video',
    tags: ['header', 'split', 'form', 'background', 'video', 'two-column'],
    shell: 'bg-container', align: 'left', background: 'video',
    imageRole: 'none', supportsVideo: true,
    axes: { background: 'video', element: 'form' },
}

// ============================================
// Aggregated exports
// ============================================

export const FAMILY_B_PRESETS: HeaderPresetConfig[] = [
    HEADER_47, HEADER_48,
    HEADER_56, HEADER_57, HEADER_58, HEADER_59,
]

export const FAMILY_B_PRESETS_MAP: Record<string, HeaderPresetConfig> = Object.fromEntries(
    FAMILY_B_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_B_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'header-47': buildHeader47Blocks,
    'header-48': buildHeader48Blocks,
    'header-56': buildHeader56Blocks,
    'header-57': buildHeader57Blocks,
    'header-58': buildHeader58Blocks,
    'header-59': buildHeader59Blocks,
}
