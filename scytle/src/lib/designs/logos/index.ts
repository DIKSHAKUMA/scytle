/**
 * Logos Section Designs — Barrel Export
 */

// Families
export { LogosRowFamily } from './families/logos-row'
export { LogosGridFamily } from './families/logos-grid'
export { LogosMarqueeFamily } from './families/logos-marquee'

// Presets
export { logosPresets, Logos1Preset, Logos2Preset, Logos3Preset, Logos4Preset } from './presets'

// Aggregate exports for registry
import { LogosRowFamily } from './families/logos-row'
import { LogosGridFamily } from './families/logos-grid'
import { LogosMarqueeFamily } from './families/logos-marquee'
import type { TemplateFamily } from '../types'

export const logosFamilies: TemplateFamily[] = [
    LogosRowFamily,
    LogosGridFamily,
    LogosMarqueeFamily,
]

export { logosPresets as logosPresetsArray } from './presets'
