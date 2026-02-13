/**
 * Navbar Section Designs — Barrel Export
 */

// Families
export { NavbarStandardFamily } from './families/navbar-standard'
export { NavbarCenteredFamily } from './families/navbar-centered'
export { NavbarMegaFamily } from './families/navbar-mega'
export { NavbarFloatingFamily } from './families/navbar-floating'
export { NavbarDoubleFamily } from './families/navbar-double'
export { NavbarFullscreenFamily } from './families/navbar-fullscreen'

// Presets
export {
    navbarPresets,
    Navbar1Preset,
    Navbar2Preset,
    Navbar3Preset,
    Navbar4Preset,
    Navbar5Preset,
    Navbar6Preset,
    Navbar7Preset,
    Navbar8Preset,
    Navbar9Preset,
    Navbar10Preset,
} from './presets'

// Aggregate exports for registry
import { NavbarStandardFamily } from './families/navbar-standard'
import { NavbarCenteredFamily } from './families/navbar-centered'
import { NavbarMegaFamily } from './families/navbar-mega'
import { NavbarFloatingFamily } from './families/navbar-floating'
import { NavbarDoubleFamily } from './families/navbar-double'
import { NavbarFullscreenFamily } from './families/navbar-fullscreen'
import type { TemplateFamily } from '../types'

export const navbarFamilies: TemplateFamily[] = [
    NavbarStandardFamily,
    NavbarCenteredFamily,
    NavbarMegaFamily,
    NavbarFloatingFamily,
    NavbarDoubleFamily,
    NavbarFullscreenFamily,
]

export { navbarPresets as navbarPresetsArray } from './presets'
