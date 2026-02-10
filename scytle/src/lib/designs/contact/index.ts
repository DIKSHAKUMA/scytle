/**
 * Contact Section Designs — Barrel Export
 */

// Families
export { ContactSplitFamily } from './families/contact-split'
export { ContactSimpleFamily } from './families/contact-simple'
export { ContactMapFamily } from './families/contact-map'

// Presets
export { contactPresets, Contact1Preset, Contact2Preset, Contact3Preset, Contact4Preset, Contact5Preset } from './presets'

// Aggregate exports for registry
import { ContactSplitFamily } from './families/contact-split'
import { ContactSimpleFamily } from './families/contact-simple'
import { ContactMapFamily } from './families/contact-map'
import type { TemplateFamily } from '../types'

export const contactFamilies: TemplateFamily[] = [
    ContactSplitFamily,
    ContactSimpleFamily,
    ContactMapFamily,
]

export { contactPresets as contactPresetsArray } from './presets'
