/**
 * Content Section Designs — Barrel Export
 */

// Families
export { ContentTextFamily } from './families/content-text'
export { ContentSplitFamily } from './families/content-split'
export { ContentCardsFamily } from './families/content-cards'
export { ContentFeatureListFamily } from './families/content-feature-list'
export { ContentStepsFamily } from './families/content-steps'
export { ContentTabsFamily } from './families/content-tabs'
export { ContentImageOverlayFamily } from './families/content-image-overlay'
export { ContentComparisonFamily } from './families/content-comparison'
export { ContentSplitFeaturesFamily } from './families/content-split-features'
export { ContentVideoFamily } from './families/content-video'
export { ContentCenteredFeatureFamily } from './families/content-centered-feature'

// Presets
export {
    contentPresets,
    Content1Preset, Content2Preset, Content3Preset, Content4Preset, Content5Preset,
    Content6Preset, Content7Preset, Content8Preset, Content9Preset, Content10Preset,
    Content11Preset, Content12Preset, Content13Preset, Content14Preset, Content15Preset,
    Content16Preset, Content17Preset, Content18Preset, Content19Preset,
    Content20Preset, Content21Preset, Content22Preset,
} from './presets'

// Aggregate exports for registry
import { ContentTextFamily } from './families/content-text'
import { ContentSplitFamily } from './families/content-split'
import { ContentCardsFamily } from './families/content-cards'
import { ContentFeatureListFamily } from './families/content-feature-list'
import { ContentStepsFamily } from './families/content-steps'
import { ContentTabsFamily } from './families/content-tabs'
import { ContentImageOverlayFamily } from './families/content-image-overlay'
import { ContentComparisonFamily } from './families/content-comparison'
import { ContentSplitFeaturesFamily } from './families/content-split-features'
import { ContentVideoFamily } from './families/content-video'
import { ContentCenteredFeatureFamily } from './families/content-centered-feature'
import type { TemplateFamily } from '../types'

export const contentFamilies: TemplateFamily[] = [
    ContentTextFamily,
    ContentSplitFamily,
    ContentCardsFamily,
    ContentFeatureListFamily,
    ContentStepsFamily,
    ContentTabsFamily,
    ContentImageOverlayFamily,
    ContentComparisonFamily,
    ContentSplitFeaturesFamily,
    ContentVideoFamily,
    ContentCenteredFeatureFamily,
]

export { contentPresets as contentPresetsArray } from './presets'
