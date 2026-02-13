/**
 * Pricing Section Designs — Barrel Export
 */

// Families
export { PricingCardsFamily } from './families/pricing-cards'
export { PricingComparisonFamily } from './families/pricing-comparison'
export { PricingSplitFamily } from './families/pricing-split'
export { PricingLeftHeaderFamily } from './families/pricing-left-header'

// Presets
export {
    pricingPresets,
    Pricing1Preset,
    Pricing2Preset,
    Pricing3Preset,
    Pricing4Preset,
    Pricing5Preset,
    Pricing6Preset,
    Pricing7Preset,
    Pricing8Preset,
} from './presets'

// Aggregate exports for registry
import { PricingCardsFamily } from './families/pricing-cards'
import { PricingComparisonFamily } from './families/pricing-comparison'
import { PricingSplitFamily } from './families/pricing-split'
import { PricingLeftHeaderFamily } from './families/pricing-left-header'
import type { TemplateFamily } from '../types'

export const pricingFamilies: TemplateFamily[] = [
    PricingCardsFamily,
    PricingComparisonFamily,
    PricingSplitFamily,
    PricingLeftHeaderFamily,
]

export { pricingPresets as pricingPresetsArray } from './presets'
