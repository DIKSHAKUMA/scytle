/**
 * Hero Section Designs — Barrel Export
 * 
 * Exports families (parametric Canvas components) and presets (named snapshots).
 */

// Families
export { HeroSplitFamily } from './families/hero-split'
export { HeroCenteredFamily } from './families/hero-centered'
export { HeroImageBgFamily } from './families/hero-image-bg'
export { HeroVideoFamily } from './families/hero-video'

// Presets
export { heroPresets, Header1Preset, Header2Preset, Header3Preset, Header4Preset, Header5Preset } from './presets'

// Aggregate exports for registry
import { HeroSplitFamily } from './families/hero-split'
import { HeroCenteredFamily } from './families/hero-centered'
import { HeroImageBgFamily } from './families/hero-image-bg'
import { HeroVideoFamily } from './families/hero-video'
import type { TemplateFamily } from '../types'

export const heroFamilies: TemplateFamily[] = [
    HeroSplitFamily,
    HeroCenteredFamily,
    HeroImageBgFamily,
    HeroVideoFamily,
]

// Re-export presets array (already exported from presets.ts)
export { heroPresets as heroPresetsArray } from './presets'

