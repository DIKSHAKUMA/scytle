/**
 * Features Section Designs — Barrel Export
 */

// Families
export { FeaturesGridFamily } from './families/features-grid'
export { FeaturesListFamily } from './families/features-list'
export { FeaturesSplitFamily } from './families/features-alternating'

// Presets
export { featuresPresets, Features1Preset, Features2Preset, Features3Preset, Features4Preset, Features5Preset } from './presets'

// Aggregate exports for registry
import { FeaturesGridFamily } from './families/features-grid'
import { FeaturesListFamily } from './families/features-list'
import { FeaturesSplitFamily } from './families/features-alternating'
import type { TemplateFamily } from '../types'

export const featuresFamilies: TemplateFamily[] = [
    FeaturesGridFamily,
    FeaturesListFamily,
    FeaturesSplitFamily,
]

export { featuresPresets as featuresPresetsArray } from './presets'
