/**
 * Content Section Designs — Barrel Export
 */

// Families
export { ContentTextFamily } from './families/content-text'
export { ContentSplitFamily } from './families/content-split'
export { ContentCardsFamily } from './families/content-cards'

// Presets
export { contentPresets, Content1Preset, Content2Preset, Content3Preset, Content4Preset, Content5Preset } from './presets'

// Aggregate exports for registry
import { ContentTextFamily } from './families/content-text'
import { ContentSplitFamily } from './families/content-split'
import { ContentCardsFamily } from './families/content-cards'
import type { TemplateFamily } from '../types'

export const contentFamilies: TemplateFamily[] = [
    ContentTextFamily,
    ContentSplitFamily,
    ContentCardsFamily,
]

export { contentPresets as contentPresetsArray } from './presets'
