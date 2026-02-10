/**
 * Pricing Section Designs — Barrel Export
 */

// Families
export { PricingCardsFamily } from './families/pricing-cards'
export { PricingComparisonFamily } from './families/pricing-comparison'

// Presets
export { pricingPresets, Pricing1Preset, Pricing2Preset, Pricing3Preset, Pricing4Preset, Pricing5Preset } from './presets'

// Aggregate exports for registry
import { PricingCardsFamily } from './families/pricing-cards'
import { PricingComparisonFamily } from './families/pricing-comparison'
import type { TemplateFamily } from '../types'

export const pricingFamilies: TemplateFamily[] = [
    PricingCardsFamily,
    PricingComparisonFamily,
]

export { pricingPresets as pricingPresetsArray } from './presets'
