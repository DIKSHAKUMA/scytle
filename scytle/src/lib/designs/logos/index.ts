/**
 * Logos Section Designs — Barrel Export
 */

// Families
export { LogosRowFamily } from './families/logos-row'
export { LogosGridFamily } from './families/logos-grid'
export { LogosMarqueeFamily } from './families/logos-marquee'
export { LogosFeaturedFamily } from './families/logos-featured'
export { LogosSplitFamily } from './families/logos-split'
export { LogosBadgeFamily } from './families/logos-badge'

// Presets
export { logosPresets, Logos1Preset, Logos2Preset, Logos3Preset, Logos4Preset, Logos5Preset, Logos6Preset } from './presets'

// Aggregate exports for registry
import { LogosRowFamily } from './families/logos-row'
import { LogosGridFamily } from './families/logos-grid'
import { LogosMarqueeFamily } from './families/logos-marquee'
import { LogosFeaturedFamily } from './families/logos-featured'
import { LogosSplitFamily } from './families/logos-split'
import { LogosBadgeFamily } from './families/logos-badge'
import type { TemplateFamily } from '../types'

export const logosFamilies: TemplateFamily[] = [
    LogosRowFamily,
    LogosGridFamily,
    LogosMarqueeFamily,
    LogosFeaturedFamily,
    LogosSplitFamily,
    LogosBadgeFamily,
]

export { logosPresets as logosPresetsArray } from './presets'
