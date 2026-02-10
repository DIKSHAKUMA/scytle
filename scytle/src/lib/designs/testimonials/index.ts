/**
 * Testimonials Section Designs — Barrel Export
 */

// Families
export { TestimonialsCardsFamily } from './families/testimonials-cards'
export { TestimonialsSliderFamily } from './families/testimonials-slider'
export { TestimonialsSimpleFamily } from './families/testimonials-simple'

// Presets
export { testimonialsPresets, Testimonials1Preset, Testimonials2Preset, Testimonials3Preset, Testimonials4Preset, Testimonials5Preset } from './presets'

// Aggregate exports for registry
import { TestimonialsCardsFamily } from './families/testimonials-cards'
import { TestimonialsSliderFamily } from './families/testimonials-slider'
import { TestimonialsSimpleFamily } from './families/testimonials-simple'
import type { TemplateFamily } from '../types'

export const testimonialsFamilies: TemplateFamily[] = [
    TestimonialsCardsFamily,
    TestimonialsSliderFamily,
    TestimonialsSimpleFamily,
]

export { testimonialsPresets as testimonialsPresetsArray } from './presets'
