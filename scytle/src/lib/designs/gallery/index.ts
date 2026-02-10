/**
 * Gallery Section Designs — Barrel Export
 */

// Families
export { GalleryGridFamily } from './families/gallery-grid'
export { GalleryMasonryFamily } from './families/gallery-masonry'
export { GalleryCarouselFamily } from './families/gallery-carousel'

// Presets
export { galleryPresets, Gallery1Preset, Gallery2Preset, Gallery3Preset, Gallery4Preset } from './presets'

// Aggregate exports for registry
import { GalleryGridFamily } from './families/gallery-grid'
import { GalleryMasonryFamily } from './families/gallery-masonry'
import { GalleryCarouselFamily } from './families/gallery-carousel'
import type { TemplateFamily } from '../types'

export const galleryFamilies: TemplateFamily[] = [
    GalleryGridFamily,
    GalleryMasonryFamily,
    GalleryCarouselFamily,
]

export { galleryPresets as galleryPresetsArray } from './presets'
