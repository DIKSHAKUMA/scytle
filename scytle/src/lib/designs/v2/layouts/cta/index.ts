/**
 * CTA Families A, B & C — Barrel Exports
 *
 * Registers all CTA layout templates for the V2 registry.
 *
 * Family A: CTA 1, 2, 39, 40, 59, 60       (side-by-side text + inline image)
 * Family B: CTA 13–18, 21–22, 61–62         (two-column text ± image below)
 * Family C: CTA 3–6, 19–20, 25–32, 41–44,  (single-column text, optional bg/card/image)
 *           51–56, 65
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
// Family C
import {
    Cta19Layout, Cta20Layout, Cta3Layout, Cta4Layout,
    Cta5Layout, Cta6Layout, Cta41Layout, Cta42Layout,
    Cta43Layout, Cta44Layout, Cta25Layout, Cta26Layout,
    Cta27Layout, Cta28Layout, Cta29Layout, Cta30Layout,
    Cta51Layout, Cta52Layout, Cta53Layout, Cta54Layout,
    Cta55Layout, Cta56Layout, Cta31Layout, Cta32Layout,
    Cta65Layout,
} from './cta-c-layouts'
import {
    Cta19Thumbnail, Cta20Thumbnail, Cta3Thumbnail, Cta4Thumbnail,
    Cta5Thumbnail, Cta6Thumbnail, Cta41Thumbnail, Cta42Thumbnail,
    Cta43Thumbnail, Cta44Thumbnail, Cta25Thumbnail, Cta26Thumbnail,
    Cta27Thumbnail, Cta28Thumbnail, Cta29Thumbnail, Cta30Thumbnail,
    Cta51Thumbnail, Cta52Thumbnail, Cta53Thumbnail, Cta54Thumbnail,
    Cta55Thumbnail, Cta56Thumbnail, Cta31Thumbnail, Cta32Thumbnail,
    Cta65Thumbnail,
} from './cta-c-thumbnails'
import { ALL_CTA_C_PRESETS, CTA_C_BLOCK_FACTORIES, CTA_C_PRESETS_MAP } from './presets-c'

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
    // Family C
    'cta-19': Cta19Layout,
    'cta-20': Cta20Layout,
    'cta-3': Cta3Layout,
    'cta-4': Cta4Layout,
    'cta-5': Cta5Layout,
    'cta-6': Cta6Layout,
    'cta-41': Cta41Layout,
    'cta-42': Cta42Layout,
    'cta-43': Cta43Layout,
    'cta-44': Cta44Layout,
    'cta-25': Cta25Layout,
    'cta-26': Cta26Layout,
    'cta-27': Cta27Layout,
    'cta-28': Cta28Layout,
    'cta-29': Cta29Layout,
    'cta-30': Cta30Layout,
    'cta-51': Cta51Layout,
    'cta-52': Cta52Layout,
    'cta-53': Cta53Layout,
    'cta-54': Cta54Layout,
    'cta-55': Cta55Layout,
    'cta-56': Cta56Layout,
    'cta-31': Cta31Layout,
    'cta-32': Cta32Layout,
    'cta-65': Cta65Layout,
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
    // Family C
    'cta-19': Cta19Thumbnail,
    'cta-20': Cta20Thumbnail,
    'cta-3': Cta3Thumbnail,
    'cta-4': Cta4Thumbnail,
    'cta-5': Cta5Thumbnail,
    'cta-6': Cta6Thumbnail,
    'cta-41': Cta41Thumbnail,
    'cta-42': Cta42Thumbnail,
    'cta-43': Cta43Thumbnail,
    'cta-44': Cta44Thumbnail,
    'cta-25': Cta25Thumbnail,
    'cta-26': Cta26Thumbnail,
    'cta-27': Cta27Thumbnail,
    'cta-28': Cta28Thumbnail,
    'cta-29': Cta29Thumbnail,
    'cta-30': Cta30Thumbnail,
    'cta-51': Cta51Thumbnail,
    'cta-52': Cta52Thumbnail,
    'cta-53': Cta53Thumbnail,
    'cta-54': Cta54Thumbnail,
    'cta-55': Cta55Thumbnail,
    'cta-56': Cta56Thumbnail,
    'cta-31': Cta31Thumbnail,
    'cta-32': Cta32Thumbnail,
    'cta-65': Cta65Thumbnail,
}

// ============================================
// All preset configs + block factories (merged)
// ============================================

const ALL_PRESETS = [...ALL_CTA_PRESETS, ...ALL_CTA_B_PRESETS, ...ALL_CTA_C_PRESETS]
const ALL_BLOCK_FACTORIES: Record<string, () => import('../../blocks/types').Block[]> = {
    ...CTA_BLOCK_FACTORIES,
    ...CTA_B_BLOCK_FACTORIES,
    ...CTA_C_BLOCK_FACTORIES,
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

// ============================================
// Re-exports — Family C
// ============================================

export { ALL_CTA_C_PRESETS, CTA_C_PRESETS_MAP, CTA_C_BLOCK_FACTORIES } from './presets-c'
export {
    Cta19Layout, Cta20Layout, Cta3Layout, Cta4Layout,
    Cta5Layout, Cta6Layout, Cta41Layout, Cta42Layout,
    Cta43Layout, Cta44Layout, Cta25Layout, Cta26Layout,
    Cta27Layout, Cta28Layout, Cta29Layout, Cta30Layout,
    Cta51Layout, Cta52Layout, Cta53Layout, Cta54Layout,
    Cta55Layout, Cta56Layout, Cta31Layout, Cta32Layout,
    Cta65Layout,
} from './cta-c-layouts'
export {
    Cta19Thumbnail, Cta20Thumbnail, Cta3Thumbnail, Cta4Thumbnail,
    Cta5Thumbnail, Cta6Thumbnail, Cta41Thumbnail, Cta42Thumbnail,
    Cta43Thumbnail, Cta44Thumbnail, Cta25Thumbnail, Cta26Thumbnail,
    Cta27Thumbnail, Cta28Thumbnail, Cta29Thumbnail, Cta30Thumbnail,
    Cta51Thumbnail, Cta52Thumbnail, Cta53Thumbnail, Cta54Thumbnail,
    Cta55Thumbnail, Cta56Thumbnail, Cta31Thumbnail, Cta32Thumbnail,
    Cta65Thumbnail,
} from './cta-c-thumbnails'
export type { CtaCContent, CtaCLayout, CtaCPresetConfig } from './types-c'
export { DEFAULT_CONTENT_C } from './types-c'
