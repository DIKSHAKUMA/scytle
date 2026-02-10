/**
 * Blog Section Designs — Barrel Export
 */

// Families
export { BlogGridFamily } from './families/blog-grid'
export { BlogListFamily } from './families/blog-list'
export { BlogFeaturedFamily } from './families/blog-featured'

// Presets
export { blogPresets, Blog1Preset, Blog2Preset, Blog3Preset, Blog4Preset, Blog5Preset } from './presets'

// Aggregate exports for registry
import { BlogGridFamily } from './families/blog-grid'
import { BlogListFamily } from './families/blog-list'
import { BlogFeaturedFamily } from './families/blog-featured'
import type { TemplateFamily } from '../types'

export const blogFamilies: TemplateFamily[] = [
    BlogGridFamily,
    BlogListFamily,
    BlogFeaturedFamily,
]

export { blogPresets as blogPresetsArray } from './presets'
