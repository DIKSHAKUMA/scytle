/**
 * Footer Section Designs — Barrel Export
 */

// Families
export { FooterColumnsFamily } from './families/footer-columns'
export { FooterSimpleFamily } from './families/footer-simple'
export { FooterCtaFamily } from './families/footer-cta'
export { FooterBigFamily } from './families/footer-big'

// Presets
export {
    footerPresets,
    Footer1Preset,
    Footer2Preset,
    Footer3Preset,
    Footer4Preset,
    Footer5Preset,
    Footer6Preset,
} from './presets'

// Aggregate exports for registry
import { FooterColumnsFamily } from './families/footer-columns'
import { FooterSimpleFamily } from './families/footer-simple'
import { FooterCtaFamily } from './families/footer-cta'
import { FooterBigFamily } from './families/footer-big'
import type { TemplateFamily } from '../types'

export const footerFamilies: TemplateFamily[] = [
    FooterColumnsFamily,
    FooterSimpleFamily,
    FooterCtaFamily,
    FooterBigFamily,
]

export { footerPresets as footerPresetsArray } from './presets'
