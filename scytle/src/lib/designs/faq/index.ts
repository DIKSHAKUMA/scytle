/**
 * FAQ Section Designs — Barrel Export
 * 3 families covering 14 Relume FAQ variants with 8 presets.
 */

// Families
export { FaqAccordionFamily } from './families/faq-accordion'
export { FaqTwoColumnFamily } from './families/faq-two-column'
export { FaqFlatFamily } from './families/faq-flat'

// Presets
export {
    faqPresets,
    Faq1Preset, Faq2Preset, Faq3Preset, Faq4Preset,
    Faq5Preset, Faq6Preset, Faq7Preset, Faq8Preset,
} from './presets'

// Aggregate exports for registry
import { FaqAccordionFamily } from './families/faq-accordion'
import { FaqTwoColumnFamily } from './families/faq-two-column'
import { FaqFlatFamily } from './families/faq-flat'
import type { TemplateFamily } from '../types'

export const faqFamilies: TemplateFamily[] = [
    FaqAccordionFamily,
    FaqTwoColumnFamily,
    FaqFlatFamily,
]

export { faqPresets as faqPresetsArray } from './presets'
