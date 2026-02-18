/**
 * Gallery Layout — Type Definitions
 *
 * 27 gallery layouts organized by pattern:
 *   Static: single, grid (2/3/4 cols), grid-multi-row
 *   Masonry: asymmetric, staggered, mixed, 3-col
 *   Full-bleed: no-gap grids
 *   Slider: overlaid arrows, below arrows, peek
 *   Split: title left + carousel right
 *
 * Sequential numbering 1–27 (matching Relume gallery numbers).
 */

// ============================================
// Gallery Configuration
// ============================================

/** Gallery layout style */
export type GalleryStyle = 'grid' | 'masonry' | 'fullbleed' | 'slider' | 'split'

/** Slider arrow position */
export type GalleryArrows = 'none' | 'overlaid' | 'below'

/** Number of visible columns */
export type GalleryColumns = 1 | 2 | 3 | 4

// ============================================
// Gallery Preset Configuration
// ============================================

export interface GalleryPresetConfig {
    /** Unique layout ID, e.g. 'gallery-1' */
    id: string
    /** Display name, e.g. 'Gallery 1' */
    name: string
    /** Relume reference number */
    relumeGallery: number
    /** Layout style category */
    style: GalleryStyle
    /** Number of visible columns */
    columns: GalleryColumns
    /** Number of images */
    imageCount: number
    /** Number of rows (for multi-row grids) */
    rows: number
    /** Slider arrow style */
    arrows: GalleryArrows
    /** Whether this has dots indicators */
    hasDots: boolean
    /** Short description */
    description: string
}

// ============================================
// Gallery Content (for default block generation)
// ============================================

export interface GalleryContent {
    heading: string
    description: string
    imageCount: number
}

export const DEFAULT_GALLERY_CONTENT: GalleryContent = {
    heading: 'Image Gallery',
    description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    imageCount: 6,
}
