/**
 * Contact Section Designs — Barrel Export
 */

// Families
export { ContactSplitFamily } from './families/contact-split'
export { ContactSimpleFamily } from './families/contact-simple'
export { ContactMapFamily } from './families/contact-map'
export { ContactInfoFamily } from './families/contact-info'
export { ContactLocationsFamily } from './families/contact-locations'

// Presets
export {
    contactPresets,
    Contact1Preset,
    Contact2Preset,
    Contact3Preset,
    Contact4Preset,
    Contact5Preset,
    Contact6Preset,
    Contact7Preset,
    Contact8Preset,
    Contact9Preset,
    Contact10Preset,
} from './presets'

// Aggregate exports for registry
import { ContactSplitFamily } from './families/contact-split'
import { ContactSimpleFamily } from './families/contact-simple'
import { ContactMapFamily } from './families/contact-map'
import { ContactInfoFamily } from './families/contact-info'
import { ContactLocationsFamily } from './families/contact-locations'
import type { TemplateFamily } from '../types'

export const contactFamilies: TemplateFamily[] = [
    ContactSplitFamily,
    ContactSimpleFamily,
    ContactMapFamily,
    ContactInfoFamily,
    ContactLocationsFamily,
]

export { contactPresets as contactPresetsArray } from './presets'
