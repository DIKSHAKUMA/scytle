/**
 * Header Family A — Block Factories & Preset Configs
 *
 * 18 presets: Header 44–46, 50–55, 62–70
 * Layout: Full-width banner with heading, body, optional element
 *         (buttons or email form), optional background media.
 *         Content alignment controlled by Text axis (left/center).
 *
 * Axes: Text (left/center) × Background (none/image/video) × Element (button/form/none)
 * Combo: 2 × 3 × 3 = 18 variants
 *
 * Shell mapping:
 *   Background=none  → 'container'     (solid bg, standard text color)
 *   Background=image → 'bg-container'  (bg image + dark overlay, white text)
 *   Background=video → 'bg-container'  (video placeholder + dark overlay, white text)
 */

import type { Block } from '../../../blocks/types'
import type { HeaderPresetConfig, ContentAlign } from '../types'
import {
    uid, resetUid,
    makeSectionTitle, makeHeading, makeBody,
    makeButtonGroup, makeFormActions,
} from './shared-builders'

// ============================================
// Block tree builders (parametrized by align)
// ============================================

/**
 * Element=button variant: sectionTitle (tagline + heading + body) + buttonGroup
 * Wrapped in root frame with max-w-768px
 */
function buildButtonBlocks(align: ContentAlign): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 768,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeSectionTitle(align), makeButtonGroup(align)],
    }]
}

/**
 * Element=form variant: sectionTitle (tagline + heading + body) + formActions
 * Wrapped in root frame with max-w-768px
 */
function buildFormBlocks(align: ContentAlign): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 32,
            maxWidth: 768,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-6',
        },
        content: {},
        children: [makeSectionTitle(align), makeFormActions(align)],
    }]
}

/**
 * Element=none variant: just heading + body (no tagline, no actions)
 * Wrapped in root frame with max-w-768px
 */
function buildNoneBlocks(align: ContentAlign): Block[] {
    return [{
        id: uid(),
        type: 'frame',
        props: {
            direction: 'vertical',
            gap: 24,
            maxWidth: 768,
            sizing: { width: 'fill' },
            className: '@max-sm:!gap-5',
        },
        content: {},
        children: [makeHeading(align), makeBody(align)],
    }]
}

// ============================================
// Block Factories (18 total)
// ============================================

// ── Text = Left, Background = None ──────────────────────────

/** Header 44 — Left + None + Button */
export function buildHeader44Blocks(): Block[] { resetUid(); return buildButtonBlocks('left') }

/** Header 45 — Left + None + Form */
export function buildHeader45Blocks(): Block[] { resetUid(); return buildFormBlocks('left') }

/** Header 46 — Left + None + None */
export function buildHeader46Blocks(): Block[] { resetUid(); return buildNoneBlocks('left') }

// ── Text = Left, Background = Image/Video ───────────────────

/** Header 50 — Left + Image + Button */
export function buildHeader50Blocks(): Block[] { resetUid(); return buildButtonBlocks('left') }

/** Header 51 — Left + Video + Button */
export function buildHeader51Blocks(): Block[] { resetUid(); return buildButtonBlocks('left') }

/** Header 52 — Left + Image + Form */
export function buildHeader52Blocks(): Block[] { resetUid(); return buildFormBlocks('left') }

/** Header 53 — Left + Video + Form */
export function buildHeader53Blocks(): Block[] { resetUid(); return buildFormBlocks('left') }

/** Header 54 — Left + Image + None */
export function buildHeader54Blocks(): Block[] { resetUid(); return buildNoneBlocks('left') }

/** Header 55 — Left + Video + None */
export function buildHeader55Blocks(): Block[] { resetUid(); return buildNoneBlocks('left') }

// ── Text = Center, Background = None ────────────────────────

/** Header 62 — Center + None + Button */
export function buildHeader62Blocks(): Block[] { resetUid(); return buildButtonBlocks('center') }

/** Header 63 — Center + None + Form */
export function buildHeader63Blocks(): Block[] { resetUid(); return buildFormBlocks('center') }

/** Header 64 — Center + None + None */
export function buildHeader64Blocks(): Block[] { resetUid(); return buildNoneBlocks('center') }

// ── Text = Center, Background = Image/Video ─────────────────

/** Header 65 — Center + Image + Button */
export function buildHeader65Blocks(): Block[] { resetUid(); return buildButtonBlocks('center') }

/** Header 66 — Center + Video + Button */
export function buildHeader66Blocks(): Block[] { resetUid(); return buildButtonBlocks('center') }

/** Header 67 — Center + Image + Form */
export function buildHeader67Blocks(): Block[] { resetUid(); return buildFormBlocks('center') }

/** Header 68 — Center + Video + Form */
export function buildHeader68Blocks(): Block[] { resetUid(); return buildFormBlocks('center') }

/** Header 69 — Center + Image + None */
export function buildHeader69Blocks(): Block[] { resetUid(); return buildNoneBlocks('center') }

/** Header 70 — Center + Video + None */
export function buildHeader70Blocks(): Block[] { resetUid(); return buildNoneBlocks('center') }

// ============================================
// Preset Configs (18 total)
// ============================================

// ── Text = Left (9 configs) ─────────────────────────────────

const HEADER_44_CONFIG: HeaderPresetConfig = {
    id: 'header-44', name: 'Header 44',
    description: 'Left-aligned text with buttons',
    tags: ['header', 'left', 'button'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'container', align: 'left', background: 'none',
    axes: { text: 'left', background: 'none', element: 'button' },
}

const HEADER_45_CONFIG: HeaderPresetConfig = {
    id: 'header-45', name: 'Header 45',
    description: 'Left-aligned text with email form',
    tags: ['header', 'left', 'form'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'container', align: 'left', background: 'none',
    axes: { text: 'left', background: 'none', element: 'form' },
}

const HEADER_46_CONFIG: HeaderPresetConfig = {
    id: 'header-46', name: 'Header 46',
    description: 'Left-aligned text only',
    tags: ['header', 'left', 'minimal'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'container', align: 'left', background: 'none',
    axes: { text: 'left', background: 'none', element: 'none' },
}

const HEADER_50_CONFIG: HeaderPresetConfig = {
    id: 'header-50', name: 'Header 50',
    description: 'Left-aligned text with buttons, background image',
    tags: ['header', 'left', 'button', 'background', 'image'],
    family: 'a', imageRole: 'background', supportsVideo: false,
    shell: 'bg-container', align: 'left', background: 'image',
    axes: { text: 'left', background: 'image', element: 'button' },
}

const HEADER_51_CONFIG: HeaderPresetConfig = {
    id: 'header-51', name: 'Header 51',
    description: 'Left-aligned text with buttons, background video',
    tags: ['header', 'left', 'button', 'background', 'video'],
    family: 'a', imageRole: 'none', supportsVideo: true,
    shell: 'bg-container', align: 'left', background: 'video',
    axes: { text: 'left', background: 'video', element: 'button' },
}

const HEADER_52_CONFIG: HeaderPresetConfig = {
    id: 'header-52', name: 'Header 52',
    description: 'Left-aligned text with email form, background image',
    tags: ['header', 'left', 'form', 'background', 'image'],
    family: 'a', imageRole: 'background', supportsVideo: false,
    shell: 'bg-container', align: 'left', background: 'image',
    axes: { text: 'left', background: 'image', element: 'form' },
}

const HEADER_53_CONFIG: HeaderPresetConfig = {
    id: 'header-53', name: 'Header 53',
    description: 'Left-aligned text with email form, background video',
    tags: ['header', 'left', 'form', 'background', 'video'],
    family: 'a', imageRole: 'none', supportsVideo: true,
    shell: 'bg-container', align: 'left', background: 'video',
    axes: { text: 'left', background: 'video', element: 'form' },
}

const HEADER_54_CONFIG: HeaderPresetConfig = {
    id: 'header-54', name: 'Header 54',
    description: 'Left-aligned text only, background image',
    tags: ['header', 'left', 'minimal', 'background', 'image'],
    family: 'a', imageRole: 'background', supportsVideo: false,
    shell: 'bg-container', align: 'left', background: 'image',
    axes: { text: 'left', background: 'image', element: 'none' },
}

const HEADER_55_CONFIG: HeaderPresetConfig = {
    id: 'header-55', name: 'Header 55',
    description: 'Left-aligned text only, background video',
    tags: ['header', 'left', 'minimal', 'background', 'video'],
    family: 'a', imageRole: 'none', supportsVideo: true,
    shell: 'bg-container', align: 'left', background: 'video',
    axes: { text: 'left', background: 'video', element: 'none' },
}

// ── Text = Center (9 configs) ───────────────────────────────

const HEADER_62_CONFIG: HeaderPresetConfig = {
    id: 'header-62', name: 'Header 62',
    description: 'Center-aligned text with buttons',
    tags: ['header', 'center', 'button'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'container', align: 'center', background: 'none',
    axes: { text: 'center', background: 'none', element: 'button' },
}

const HEADER_63_CONFIG: HeaderPresetConfig = {
    id: 'header-63', name: 'Header 63',
    description: 'Center-aligned text with email form',
    tags: ['header', 'center', 'form'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'container', align: 'center', background: 'none',
    axes: { text: 'center', background: 'none', element: 'form' },
}

const HEADER_64_CONFIG: HeaderPresetConfig = {
    id: 'header-64', name: 'Header 64',
    description: 'Center-aligned text only',
    tags: ['header', 'center', 'minimal'],
    family: 'a', imageRole: 'none', supportsVideo: false,
    shell: 'container', align: 'center', background: 'none',
    axes: { text: 'center', background: 'none', element: 'none' },
}

const HEADER_65_CONFIG: HeaderPresetConfig = {
    id: 'header-65', name: 'Header 65',
    description: 'Center-aligned text with buttons, background image',
    tags: ['header', 'center', 'button', 'background', 'image'],
    family: 'a', imageRole: 'background', supportsVideo: false,
    shell: 'bg-container', align: 'center', background: 'image',
    axes: { text: 'center', background: 'image', element: 'button' },
}

const HEADER_66_CONFIG: HeaderPresetConfig = {
    id: 'header-66', name: 'Header 66',
    description: 'Center-aligned text with buttons, background video',
    tags: ['header', 'center', 'button', 'background', 'video'],
    family: 'a', imageRole: 'none', supportsVideo: true,
    shell: 'bg-container', align: 'center', background: 'video',
    axes: { text: 'center', background: 'video', element: 'button' },
}

const HEADER_67_CONFIG: HeaderPresetConfig = {
    id: 'header-67', name: 'Header 67',
    description: 'Center-aligned text with email form, background image',
    tags: ['header', 'center', 'form', 'background', 'image'],
    family: 'a', imageRole: 'background', supportsVideo: false,
    shell: 'bg-container', align: 'center', background: 'image',
    axes: { text: 'center', background: 'image', element: 'form' },
}

const HEADER_68_CONFIG: HeaderPresetConfig = {
    id: 'header-68', name: 'Header 68',
    description: 'Center-aligned text with email form, background video',
    tags: ['header', 'center', 'form', 'background', 'video'],
    family: 'a', imageRole: 'none', supportsVideo: true,
    shell: 'bg-container', align: 'center', background: 'video',
    axes: { text: 'center', background: 'video', element: 'form' },
}

const HEADER_69_CONFIG: HeaderPresetConfig = {
    id: 'header-69', name: 'Header 69',
    description: 'Center-aligned text only, background image',
    tags: ['header', 'center', 'minimal', 'background', 'image'],
    family: 'a', imageRole: 'background', supportsVideo: false,
    shell: 'bg-container', align: 'center', background: 'image',
    axes: { text: 'center', background: 'image', element: 'none' },
}

const HEADER_70_CONFIG: HeaderPresetConfig = {
    id: 'header-70', name: 'Header 70',
    description: 'Center-aligned text only, background video',
    tags: ['header', 'center', 'minimal', 'background', 'video'],
    family: 'a', imageRole: 'none', supportsVideo: true,
    shell: 'bg-container', align: 'center', background: 'video',
    axes: { text: 'center', background: 'video', element: 'none' },
}

// ============================================
// Aggregated Exports
// ============================================

export const FAMILY_A_PRESETS: HeaderPresetConfig[] = [
    HEADER_44_CONFIG, HEADER_45_CONFIG, HEADER_46_CONFIG,
    HEADER_50_CONFIG, HEADER_51_CONFIG, HEADER_52_CONFIG,
    HEADER_53_CONFIG, HEADER_54_CONFIG, HEADER_55_CONFIG,
    HEADER_62_CONFIG, HEADER_63_CONFIG, HEADER_64_CONFIG,
    HEADER_65_CONFIG, HEADER_66_CONFIG, HEADER_67_CONFIG,
    HEADER_68_CONFIG, HEADER_69_CONFIG, HEADER_70_CONFIG,
]

export const FAMILY_A_PRESETS_MAP: Record<string, HeaderPresetConfig> = Object.fromEntries(
    FAMILY_A_PRESETS.map(p => [p.id, p]),
)

export const FAMILY_A_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    'header-44': buildHeader44Blocks,
    'header-45': buildHeader45Blocks,
    'header-46': buildHeader46Blocks,
    'header-50': buildHeader50Blocks,
    'header-51': buildHeader51Blocks,
    'header-52': buildHeader52Blocks,
    'header-53': buildHeader53Blocks,
    'header-54': buildHeader54Blocks,
    'header-55': buildHeader55Blocks,
    'header-62': buildHeader62Blocks,
    'header-63': buildHeader63Blocks,
    'header-64': buildHeader64Blocks,
    'header-65': buildHeader65Blocks,
    'header-66': buildHeader66Blocks,
    'header-67': buildHeader67Blocks,
    'header-68': buildHeader68Blocks,
    'header-69': buildHeader69Blocks,
    'header-70': buildHeader70Blocks,
}
