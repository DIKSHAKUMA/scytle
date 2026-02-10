/**
 * CTA Section Designs — Barrel Export
 */

// Families
export { CtaBannerFamily } from './families/cta-banner'
export { CtaSplitFamily } from './families/cta-split'
export { CtaMinimalFamily } from './families/cta-minimal'

// Presets
export { ctaPresets, Cta1Preset, Cta2Preset, Cta3Preset, Cta4Preset, Cta5Preset } from './presets'

// Aggregate exports for registry
import { CtaBannerFamily } from './families/cta-banner'
import { CtaSplitFamily } from './families/cta-split'
import { CtaMinimalFamily } from './families/cta-minimal'
import type { TemplateFamily } from '../types'

export const ctaFamilies: TemplateFamily[] = [
    CtaBannerFamily,
    CtaSplitFamily,
    CtaMinimalFamily,
]

export { ctaPresets as ctaPresetsArray } from './presets'
