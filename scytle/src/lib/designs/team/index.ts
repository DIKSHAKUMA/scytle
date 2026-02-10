/**
 * Team Section Designs — Barrel Export
 */

// Families
export { TeamGridFamily } from './families/team-grid'
export { TeamCardsFamily } from './families/team-cards'
export { TeamSimpleFamily } from './families/team-simple'

// Presets
export { teamPresets, Team1Preset, Team2Preset, Team3Preset, Team4Preset } from './presets'

// Aggregate exports for registry
import { TeamGridFamily } from './families/team-grid'
import { TeamCardsFamily } from './families/team-cards'
import { TeamSimpleFamily } from './families/team-simple'
import type { TemplateFamily } from '../types'

export const teamFamilies: TemplateFamily[] = [
    TeamGridFamily,
    TeamCardsFamily,
    TeamSimpleFamily,
]

export { teamPresets as teamPresetsArray } from './presets'
