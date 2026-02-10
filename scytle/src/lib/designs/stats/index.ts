/**
 * Stats Section Designs — Barrel Export
 */

// Families
export { StatsRowFamily } from './families/stats-row'
export { StatsCardsFamily } from './families/stats-cards'
export { StatsSplitFamily } from './families/stats-split'

// Presets
export { statsPresets, Stats1Preset, Stats2Preset, Stats3Preset, Stats4Preset } from './presets'

// Aggregate exports for registry
import { StatsRowFamily } from './families/stats-row'
import { StatsCardsFamily } from './families/stats-cards'
import { StatsSplitFamily } from './families/stats-split'
import type { TemplateFamily } from '../types'

export const statsFamilies: TemplateFamily[] = [
    StatsRowFamily,
    StatsCardsFamily,
    StatsSplitFamily,
]

export { statsPresets as statsPresetsArray } from './presets'
