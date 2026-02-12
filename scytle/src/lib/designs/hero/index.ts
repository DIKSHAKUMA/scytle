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
export { HeroMinimalFamily } from './families/hero-minimal'
export { HeroFormFamily } from './families/hero-form'
export { HeroCardFamily } from './families/hero-card'

// Presets
export {
    heroPresets,
    Header1Preset, Header2Preset, Header3Preset, Header4Preset, Header5Preset,
    Header6Preset, Header7Preset, Header8Preset, Header9Preset, Header10Preset,
    Header11Preset, Header12Preset, Header13Preset, Header14Preset, Header15Preset,
} from './presets'

// Aggregate exports for registry
import { HeroSplitFamily } from './families/hero-split'
import { HeroCenteredFamily } from './families/hero-centered'
import { HeroImageBgFamily } from './families/hero-image-bg'
import { HeroVideoFamily } from './families/hero-video'
import { HeroMinimalFamily } from './families/hero-minimal'
import { HeroFormFamily } from './families/hero-form'
import { HeroCardFamily } from './families/hero-card'
import type { TemplateFamily } from '../types'

export const heroFamilies: TemplateFamily[] = [
    HeroSplitFamily,
    HeroCenteredFamily,
    HeroImageBgFamily,
    HeroVideoFamily,
    HeroMinimalFamily,
    HeroFormFamily,
    HeroCardFamily,
]

// Re-export presets array (already exported from presets.ts)
export { heroPresets as heroPresetsArray } from './presets'

