/**
 * Navbar Section Designs — Barrel Export
 */

// Families
export { NavbarStandardFamily } from './families/navbar-standard'
export { NavbarCenteredFamily } from './families/navbar-centered'
export { NavbarMegaFamily } from './families/navbar-mega'

// Presets
export { navbarPresets, Navbar1Preset, Navbar2Preset, Navbar3Preset, Navbar4Preset, Navbar5Preset } from './presets'

// Aggregate exports for registry
import { NavbarStandardFamily } from './families/navbar-standard'
import { NavbarCenteredFamily } from './families/navbar-centered'
import { NavbarMegaFamily } from './families/navbar-mega'
import type { TemplateFamily } from '../types'

export const navbarFamilies: TemplateFamily[] = [
    NavbarStandardFamily,
    NavbarCenteredFamily,
    NavbarMegaFamily,
]

export { navbarPresets as navbarPresetsArray } from './presets'
