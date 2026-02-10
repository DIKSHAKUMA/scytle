/**
 * FAQ Section Designs — Barrel Export
 */

// Families
export { FaqAccordionFamily } from './families/faq-accordion'
export { FaqTwoColumnFamily } from './families/faq-two-column'

// Presets
export { faqPresets, Faq1Preset, Faq2Preset, Faq3Preset, Faq4Preset } from './presets'

// Aggregate exports for registry
import { FaqAccordionFamily } from './families/faq-accordion'
import { FaqTwoColumnFamily } from './families/faq-two-column'
import type { TemplateFamily } from '../types'

export const faqFamilies: TemplateFamily[] = [
    FaqAccordionFamily,
    FaqTwoColumnFamily,
]

export { faqPresets as faqPresetsArray } from './presets'
