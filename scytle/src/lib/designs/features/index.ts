/**
 * Features Section Designs — Barrel Export
 */

// Families
export { FeaturesGridFamily } from './families/features-grid'
export { FeaturesListFamily } from './families/features-list'
export { FeaturesSplitFamily } from './families/features-alternating'
export { FeaturesNumberedFamily } from './families/features-numbered'

// Presets
export {
    featuresPresets,
    Features1Preset, Features2Preset, Features3Preset, Features4Preset, Features5Preset,
    Features6Preset, Features7Preset, Features8Preset,
} from './presets'

// Aggregate exports for registry
import { FeaturesGridFamily } from './families/features-grid'
import { FeaturesListFamily } from './families/features-list'
import { FeaturesSplitFamily } from './families/features-alternating'
import { FeaturesNumberedFamily } from './families/features-numbered'
import type { TemplateFamily } from '../types'

export const featuresFamilies: TemplateFamily[] = [
    FeaturesGridFamily,
    FeaturesListFamily,
    FeaturesSplitFamily,
    FeaturesNumberedFamily,
]

export { featuresPresets as featuresPresetsArray } from './presets'
