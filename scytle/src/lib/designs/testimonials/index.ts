/**
 * Testimonials Section Designs — Barrel Export
 * 6 families covering 67 Relume variants with 15 presets.
 */

// Families
export { TestimonialsCardsFamily } from './families/testimonials-cards'
export { TestimonialsSliderFamily } from './families/testimonials-slider'
export { TestimonialsSimpleFamily } from './families/testimonials-simple'
export { TestimonialsSplitFamily } from './families/testimonials-split'
export { TestimonialsCardImageFamily } from './families/testimonials-card-image'
export { TestimonialsCardBgFamily } from './families/testimonials-card-bg'

// Presets
export {
    testimonialsPresets,
    Testimonials1Preset, Testimonials2Preset, Testimonials3Preset, Testimonials4Preset, Testimonials5Preset,
    Testimonials6Preset, Testimonials7Preset, Testimonials8Preset, Testimonials9Preset, Testimonials10Preset,
    Testimonials11Preset, Testimonials12Preset, Testimonials13Preset, Testimonials14Preset, Testimonials15Preset,
} from './presets'

// Aggregate exports for registry
import { TestimonialsCardsFamily } from './families/testimonials-cards'
import { TestimonialsSliderFamily } from './families/testimonials-slider'
import { TestimonialsSimpleFamily } from './families/testimonials-simple'
import { TestimonialsSplitFamily } from './families/testimonials-split'
import { TestimonialsCardImageFamily } from './families/testimonials-card-image'
import { TestimonialsCardBgFamily } from './families/testimonials-card-bg'
import type { TemplateFamily } from '../types'

export const testimonialsFamilies: TemplateFamily[] = [
    TestimonialsCardsFamily,
    TestimonialsSliderFamily,
    TestimonialsSimpleFamily,
    TestimonialsSplitFamily,
    TestimonialsCardImageFamily,
    TestimonialsCardBgFamily,
]

export { testimonialsPresets as testimonialsPresetsArray } from './presets'
