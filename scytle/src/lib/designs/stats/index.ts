/**
 * Stats Section Designs — Barrel Export
 *
 * 15 families: row, cards, split, banner, icon, progress, counter,
 * comparison, highlight, grid, list, minimal, circular, infographic, timeline.
 */

// Families
export { StatsRowFamily } from './families/stats-row'
export { StatsCardsFamily } from './families/stats-cards'
export { StatsSplitFamily } from './families/stats-split'
export { StatsBannerFamily } from './families/stats-banner'
export { StatsIconFamily } from './families/stats-icon'
export { StatsProgressFamily } from './families/stats-progress'
export { StatsCounterFamily } from './families/stats-counter'
export { StatsComparisonFamily } from './families/stats-comparison'
export { StatsHighlightFamily } from './families/stats-highlight'
export { StatsGridFamily } from './families/stats-grid'
export { StatsListFamily } from './families/stats-list'
export { StatsMinimalFamily } from './families/stats-minimal'
export { StatsCircularFamily } from './families/stats-circular'
export { StatsInfographicFamily } from './families/stats-infographic'
export { StatsTimelineFamily } from './families/stats-timeline'

// Presets
export {
    statsPresets,
    Stats1Preset, Stats2Preset, Stats3Preset, Stats4Preset, Stats5Preset, Stats6Preset,
    Stats7Preset, Stats8Preset, Stats9Preset, Stats10Preset, Stats11Preset, Stats12Preset,
    Stats13Preset, Stats14Preset, Stats15Preset,
} from './presets'

// Aggregate exports for registry
import { StatsRowFamily } from './families/stats-row'
import { StatsCardsFamily } from './families/stats-cards'
import { StatsSplitFamily } from './families/stats-split'
import { StatsBannerFamily } from './families/stats-banner'
import { StatsIconFamily } from './families/stats-icon'
import { StatsProgressFamily } from './families/stats-progress'
import { StatsCounterFamily } from './families/stats-counter'
import { StatsComparisonFamily } from './families/stats-comparison'
import { StatsHighlightFamily } from './families/stats-highlight'
import { StatsGridFamily } from './families/stats-grid'
import { StatsListFamily } from './families/stats-list'
import { StatsMinimalFamily } from './families/stats-minimal'
import { StatsCircularFamily } from './families/stats-circular'
import { StatsInfographicFamily } from './families/stats-infographic'
import { StatsTimelineFamily } from './families/stats-timeline'
import type { TemplateFamily } from '../types'

export const statsFamilies: TemplateFamily[] = [
    StatsRowFamily,
    StatsCardsFamily,
    StatsSplitFamily,
    StatsBannerFamily,
    StatsIconFamily,
    StatsProgressFamily,
    StatsCounterFamily,
    StatsComparisonFamily,
    StatsHighlightFamily,
    StatsGridFamily,
    StatsListFamily,
    StatsMinimalFamily,
    StatsCircularFamily,
    StatsInfographicFamily,
    StatsTimelineFamily,
]

export { statsPresets as statsPresetsArray } from './presets'
