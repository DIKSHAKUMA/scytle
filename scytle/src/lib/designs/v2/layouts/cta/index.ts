/**
 * CTA Families A & B — Barrel Exports
 *
 * Registers all CTA layout templates for the V2 registry.
 *
 * Family A: CTA 1, 2, 39, 40, 59, 60 (side-by-side text + inline image)
 * Family B: CTA 13–18, 21–22, 61–62 (two-column text ± image below)
 */

import type { LayoutTemplate } from '../types'
// Family A
import {
    Cta1Layout, Cta2Layout, Cta39Layout, Cta40Layout,
    Cta59Layout, Cta60Layout,
} from './cta-layouts'
import {
    Cta1Thumbnail, Cta2Thumbnail, Cta39Thumbnail, Cta40Thumbnail,
    Cta59Thumbnail, Cta60Thumbnail,
} from './cta-thumbnails'
import { ALL_CTA_PRESETS, CTA_BLOCK_FACTORIES, CTA_PRESETS_MAP } from './presets'
// Family B
import {
    Cta13Layout, Cta14Layout, Cta15Layout, Cta16Layout,
    Cta17Layout, Cta18Layout, Cta21Layout, Cta22Layout,
    CtaB61Layout, CtaB62Layout,
} from './cta-b-layouts'
import {
    Cta13Thumbnail, Cta14Thumbnail, Cta15Thumbnail, Cta16Thumbnail,
    Cta17Thumbnail, Cta18Thumbnail, Cta21Thumbnail, Cta22Thumbnail,
    CtaB61Thumbnail, CtaB62Thumbnail,
} from './cta-b-thumbnails'
import { ALL_CTA_B_PRESETS, CTA_B_BLOCK_FACTORIES, CTA_B_PRESETS_MAP } from './presets-b'

// ============================================
// Component + Thumbnail lookup by preset ID
// ============================================

const COMPONENT_MAP: Record<string, React.FC<import('../types').LayoutProps>> = {
    // Family A
    'cta-1': Cta1Layout,
    'cta-2': Cta2Layout,
    'cta-39': Cta39Layout,
    'cta-40': Cta40Layout,
    'cta-59': Cta59Layout,
    'cta-60': Cta60Layout,
    // Family B
    'cta-13': Cta13Layout,
    'cta-14': Cta14Layout,
    'cta-15': Cta15Layout,
    'cta-16': Cta16Layout,
    'cta-17': Cta17Layout,
    'cta-18': Cta18Layout,
    'cta-21': Cta21Layout,
    'cta-22': Cta22Layout,
    'cta-61': CtaB61Layout,
    'cta-62': CtaB62Layout,
}

const THUMBNAIL_MAP: Record<string, React.FC> = {
    // Family A
    'cta-1': Cta1Thumbnail,
    'cta-2': Cta2Thumbnail,
    'cta-39': Cta39Thumbnail,
    'cta-40': Cta40Thumbnail,
    'cta-59': Cta59Thumbnail,
    'cta-60': Cta60Thumbnail,
    // Family B
    'cta-13': Cta13Thumbnail,
    'cta-14': Cta14Thumbnail,
    'cta-15': Cta15Thumbnail,
    'cta-16': Cta16Thumbnail,
    'cta-17': Cta17Thumbnail,
    'cta-18': Cta18Thumbnail,
    'cta-21': Cta21Thumbnail,
    'cta-22': Cta22Thumbnail,
    'cta-61': CtaB61Thumbnail,
    'cta-62': CtaB62Thumbnail,
}

// ============================================
// All preset configs + block factories (merged)
// ============================================

const ALL_PRESETS = [...ALL_CTA_PRESETS, ...ALL_CTA_B_PRESETS]
const ALL_BLOCK_FACTORIES: Record<string, () => import('../../blocks/types').Block[]> = {
    ...CTA_BLOCK_FACTORIES,
    ...CTA_B_BLOCK_FACTORIES,
}

// ============================================
// Layout Templates
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'cta',
    description: preset.description,
    component: COMPONENT_MAP[preset.id] ?? Cta1Layout,
    defaultBlocks: ALL_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: THUMBNAIL_MAP[preset.id] ?? Cta1Thumbnail,
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports — Family A
// ============================================

export { ALL_CTA_PRESETS, CTA_PRESETS_MAP, CTA_BLOCK_FACTORIES } from './presets'
export {
    Cta1Layout, Cta2Layout, Cta39Layout, Cta40Layout,
    Cta59Layout, Cta60Layout,
} from './cta-layouts'
export {
    Cta1Thumbnail, Cta2Thumbnail, Cta39Thumbnail, Cta40Thumbnail,
    Cta59Thumbnail, Cta60Thumbnail,
} from './cta-thumbnails'
export type { CtaContent, CtaLayout, CtaPresetConfig } from './types'
export { DEFAULT_CONTENT } from './types'

// ============================================
// Re-exports — Family B
// ============================================

export { ALL_CTA_B_PRESETS, CTA_B_PRESETS_MAP, CTA_B_BLOCK_FACTORIES } from './presets-b'
export {
    Cta13Layout, Cta14Layout, Cta15Layout, Cta16Layout,
    Cta17Layout, Cta18Layout, Cta21Layout, Cta22Layout,
    CtaB61Layout, CtaB62Layout,
} from './cta-b-layouts'
export {
    Cta13Thumbnail, Cta14Thumbnail, Cta15Thumbnail, Cta16Thumbnail,
    Cta17Thumbnail, Cta18Thumbnail, Cta21Thumbnail, Cta22Thumbnail,
    CtaB61Thumbnail, CtaB62Thumbnail,
} from './cta-b-thumbnails'
export type { CtaBContent, CtaBLayout, CtaBPresetConfig } from './types-b'
export { DEFAULT_CONTENT_B } from './types-b'
