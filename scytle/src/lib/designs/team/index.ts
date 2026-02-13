/**
 * Team Section Designs — Barrel Export
 */

// Families
export { TeamGridFamily } from './families/team-grid'
export { TeamCarouselFamily } from './families/team-cards'
export { TeamCompactFamily } from './families/team-simple'
export { TeamSplitFamily } from './families/team-split'
export { TeamAlternatingFamily } from './families/team-alternating'
export { TeamStaggeredFamily } from './families/team-staggered'

// Presets
export { teamPresets } from './presets'

// Aggregate exports for registry
import { TeamGridFamily } from './families/team-grid'
import { TeamCarouselFamily } from './families/team-cards'
import { TeamCompactFamily } from './families/team-simple'
import { TeamSplitFamily } from './families/team-split'
import { TeamAlternatingFamily } from './families/team-alternating'
import { TeamStaggeredFamily } from './families/team-staggered'
import type { TemplateFamily } from '../types'

export const teamFamilies: TemplateFamily[] = [
    TeamGridFamily,
    TeamCarouselFamily,
    TeamCompactFamily,
    TeamSplitFamily,
    TeamAlternatingFamily,
    TeamStaggeredFamily,
]

export { teamPresets as teamPresetsArray } from './presets'
