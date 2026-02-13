/**
 * Gallery Section Designs — Barrel Export
 *
 * 28 families covering: grid, masonry, carousel, lightbox, featured, filmstrip,
 * mosaic, slideshow, collage, fullwidth, with-text, offset, before-after, card,
 * hover, magazine, split, minimal, numbered, polaroid, portrait, panoramic,
 * scattered, stacked, tabs, zigzag, banner, showcase.
 */

// Families
export { GalleryGridFamily } from './families/gallery-grid'
export { GalleryMasonryFamily } from './families/gallery-masonry'
export { GalleryCarouselFamily } from './families/gallery-carousel'
export { GalleryLightboxFamily } from './families/gallery-lightbox'
export { GalleryFeaturedFamily } from './families/gallery-featured'
export { GalleryFilmstripFamily } from './families/gallery-filmstrip'
export { GalleryMosaicFamily } from './families/gallery-mosaic'
export { GallerySlideshowFamily } from './families/gallery-slideshow'
export { GalleryCollageFamily } from './families/gallery-collage'
export { GalleryFullwidthFamily } from './families/gallery-fullwidth'
export { GalleryWithTextFamily } from './families/gallery-with-text'
export { GalleryOffsetFamily } from './families/gallery-offset'
export { GalleryBeforeAfterFamily } from './families/gallery-before-after'
export { GalleryCardFamily } from './families/gallery-card'
export { GalleryHoverFamily } from './families/gallery-hover'
export { GalleryMagazineFamily } from './families/gallery-magazine'
export { GallerySplitFamily } from './families/gallery-split'
export { GalleryMinimalFamily } from './families/gallery-minimal'
export { GalleryNumberedFamily } from './families/gallery-numbered'
export { GalleryPolaroidFamily } from './families/gallery-polaroid'
export { GalleryPortraitFamily } from './families/gallery-portrait'
export { GalleryPanoramicFamily } from './families/gallery-panoramic'
export { GalleryScatteredFamily } from './families/gallery-scattered'
export { GalleryStackedFamily } from './families/gallery-stacked'
export { GalleryTabsFamily } from './families/gallery-tabs'
export { GalleryZigzagFamily } from './families/gallery-zigzag'
export { GalleryBannerFamily } from './families/gallery-banner'
export { GalleryShowcaseFamily } from './families/gallery-showcase'

// Presets
export {
    galleryPresets,
    Gallery1Preset, Gallery2Preset, Gallery3Preset, Gallery4Preset,
    Gallery5Preset, Gallery6Preset, Gallery7Preset, Gallery8Preset,
    Gallery9Preset, Gallery10Preset, Gallery11Preset, Gallery12Preset,
    Gallery13Preset, Gallery14Preset, Gallery15Preset, Gallery16Preset,
    Gallery17Preset, Gallery18Preset, Gallery19Preset, Gallery20Preset,
    Gallery21Preset, Gallery22Preset, Gallery23Preset, Gallery24Preset,
    Gallery25Preset, Gallery26Preset, Gallery27Preset, Gallery28Preset,
} from './presets'

// Aggregate exports for registry
import { GalleryGridFamily } from './families/gallery-grid'
import { GalleryMasonryFamily } from './families/gallery-masonry'
import { GalleryCarouselFamily } from './families/gallery-carousel'
import { GalleryLightboxFamily } from './families/gallery-lightbox'
import { GalleryFeaturedFamily } from './families/gallery-featured'
import { GalleryFilmstripFamily } from './families/gallery-filmstrip'
import { GalleryMosaicFamily } from './families/gallery-mosaic'
import { GallerySlideshowFamily } from './families/gallery-slideshow'
import { GalleryCollageFamily } from './families/gallery-collage'
import { GalleryFullwidthFamily } from './families/gallery-fullwidth'
import { GalleryWithTextFamily } from './families/gallery-with-text'
import { GalleryOffsetFamily } from './families/gallery-offset'
import { GalleryBeforeAfterFamily } from './families/gallery-before-after'
import { GalleryCardFamily } from './families/gallery-card'
import { GalleryHoverFamily } from './families/gallery-hover'
import { GalleryMagazineFamily } from './families/gallery-magazine'
import { GallerySplitFamily } from './families/gallery-split'
import { GalleryMinimalFamily } from './families/gallery-minimal'
import { GalleryNumberedFamily } from './families/gallery-numbered'
import { GalleryPolaroidFamily } from './families/gallery-polaroid'
import { GalleryPortraitFamily } from './families/gallery-portrait'
import { GalleryPanoramicFamily } from './families/gallery-panoramic'
import { GalleryScatteredFamily } from './families/gallery-scattered'
import { GalleryStackedFamily } from './families/gallery-stacked'
import { GalleryTabsFamily } from './families/gallery-tabs'
import { GalleryZigzagFamily } from './families/gallery-zigzag'
import { GalleryBannerFamily } from './families/gallery-banner'
import { GalleryShowcaseFamily } from './families/gallery-showcase'
import type { TemplateFamily } from '../types'

export const galleryFamilies: TemplateFamily[] = [
    GalleryGridFamily,
    GalleryMasonryFamily,
    GalleryCarouselFamily,
    GalleryLightboxFamily,
    GalleryFeaturedFamily,
    GalleryFilmstripFamily,
    GalleryMosaicFamily,
    GallerySlideshowFamily,
    GalleryCollageFamily,
    GalleryFullwidthFamily,
    GalleryWithTextFamily,
    GalleryOffsetFamily,
    GalleryBeforeAfterFamily,
    GalleryCardFamily,
    GalleryHoverFamily,
    GalleryMagazineFamily,
    GallerySplitFamily,
    GalleryMinimalFamily,
    GalleryNumberedFamily,
    GalleryPolaroidFamily,
    GalleryPortraitFamily,
    GalleryPanoramicFamily,
    GalleryScatteredFamily,
    GalleryStackedFamily,
    GalleryTabsFamily,
    GalleryZigzagFamily,
    GalleryBannerFamily,
    GalleryShowcaseFamily,
]

export { galleryPresets as galleryPresetsArray } from './presets'
