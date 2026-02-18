/**
 * Gallery Presets — All 27 gallery layout configurations
 *
 * Organized by layout pattern:
 *   1-6:   Static grids
 *   7-10:  Masonry layouts
 *   11-12: Full-bleed (no gap)
 *   13-19: Sliders with overlaid arrows
 *   20-23: Sliders with arrows below
 *   24:    Peek/overflow slider
 *   25-27: Split layout (title left + carousel right)
 */

import type { GalleryPresetConfig } from './types'

// ============================================
// Static Grids (1–6)
// ============================================

export const GALLERY_1: GalleryPresetConfig = {
    id: 'gallery-1',
    name: 'Gallery 1',
    relumeGallery: 1,
    style: 'grid',
    columns: 1,
    imageCount: 1,
    rows: 1,
    arrows: 'none',
    hasDots: false,
    description: 'Single full-width image',
}

export const GALLERY_2: GalleryPresetConfig = {
    id: 'gallery-2',
    name: 'Gallery 2',
    relumeGallery: 2,
    style: 'grid',
    columns: 2,
    imageCount: 2,
    rows: 1,
    arrows: 'none',
    hasDots: false,
    description: '2 equal images side by side',
}

export const GALLERY_3: GalleryPresetConfig = {
    id: 'gallery-3',
    name: 'Gallery 3',
    relumeGallery: 3,
    style: 'grid',
    columns: 3,
    imageCount: 3,
    rows: 1,
    arrows: 'none',
    hasDots: false,
    description: '3 equal images in a row',
}

export const GALLERY_4: GalleryPresetConfig = {
    id: 'gallery-4',
    name: 'Gallery 4',
    relumeGallery: 4,
    style: 'grid',
    columns: 4,
    imageCount: 4,
    rows: 1,
    arrows: 'none',
    hasDots: false,
    description: '4 equal square images in a row',
}

export const GALLERY_5: GalleryPresetConfig = {
    id: 'gallery-5',
    name: 'Gallery 5',
    relumeGallery: 5,
    style: 'grid',
    columns: 3,
    imageCount: 6,
    rows: 2,
    arrows: 'none',
    hasDots: false,
    description: '3×2 equal square grid (6 images)',
}

export const GALLERY_6: GalleryPresetConfig = {
    id: 'gallery-6',
    name: 'Gallery 6',
    relumeGallery: 6,
    style: 'grid',
    columns: 4,
    imageCount: 8,
    rows: 2,
    arrows: 'none',
    hasDots: false,
    description: '4×2 equal square grid (8 images)',
}

// ============================================
// Masonry Layouts (7–10)
// ============================================

export const GALLERY_7: GalleryPresetConfig = {
    id: 'gallery-7',
    name: 'Gallery 7',
    relumeGallery: 7,
    style: 'masonry',
    columns: 2,
    imageCount: 3,
    rows: 1,
    arrows: 'none',
    hasDots: false,
    description: '1 tall portrait + 2 stacked landscape',
}

export const GALLERY_8: GalleryPresetConfig = {
    id: 'gallery-8',
    name: 'Gallery 8',
    relumeGallery: 8,
    style: 'masonry',
    columns: 2,
    imageCount: 4,
    rows: 2,
    arrows: 'none',
    hasDots: false,
    description: '2-col staggered heights (tall-short, short-tall)',
}

export const GALLERY_9: GalleryPresetConfig = {
    id: 'gallery-9',
    name: 'Gallery 9',
    relumeGallery: 9,
    style: 'masonry',
    columns: 2,
    imageCount: 5,
    rows: 2,
    arrows: 'none',
    hasDots: false,
    description: '1 large left + 2×2 small grid right',
}

export const GALLERY_10: GalleryPresetConfig = {
    id: 'gallery-10',
    name: 'Gallery 10',
    relumeGallery: 10,
    style: 'masonry',
    columns: 3,
    imageCount: 7,
    rows: 2,
    arrows: 'none',
    hasDots: false,
    description: '3-col masonry with staggered heights',
}

// ============================================
// Full-bleed (11–12)
// ============================================

export const GALLERY_11: GalleryPresetConfig = {
    id: 'gallery-11',
    name: 'Gallery 11',
    relumeGallery: 11,
    style: 'fullbleed',
    columns: 2,
    imageCount: 2,
    rows: 1,
    arrows: 'none',
    hasDots: false,
    description: '2 images side by side, no gap',
}

export const GALLERY_12: GalleryPresetConfig = {
    id: 'gallery-12',
    name: 'Gallery 12',
    relumeGallery: 12,
    style: 'fullbleed',
    columns: 2,
    imageCount: 4,
    rows: 2,
    arrows: 'none',
    hasDots: false,
    description: '2×2 grid, no gap between images',
}

// ============================================
// Sliders — Overlaid Arrows (13–19)
// ============================================

export const GALLERY_13: GalleryPresetConfig = {
    id: 'gallery-13',
    name: 'Gallery 13',
    relumeGallery: 13,
    style: 'slider',
    columns: 1,
    imageCount: 3,
    rows: 1,
    arrows: 'overlaid',
    hasDots: true,
    description: 'Full-bleed single image carousel',
}

export const GALLERY_14: GalleryPresetConfig = {
    id: 'gallery-14',
    name: 'Gallery 14',
    relumeGallery: 14,
    style: 'slider',
    columns: 1,
    imageCount: 3,
    rows: 1,
    arrows: 'overlaid',
    hasDots: true,
    description: 'Full-width single image carousel',
}

export const GALLERY_15: GalleryPresetConfig = {
    id: 'gallery-15',
    name: 'Gallery 15',
    relumeGallery: 15,
    style: 'slider',
    columns: 1,
    imageCount: 3,
    rows: 1,
    arrows: 'overlaid',
    hasDots: true,
    description: 'Centered large image carousel',
}

export const GALLERY_16: GalleryPresetConfig = {
    id: 'gallery-16',
    name: 'Gallery 16',
    relumeGallery: 16,
    style: 'slider',
    columns: 2,
    imageCount: 4,
    rows: 1,
    arrows: 'overlaid',
    hasDots: true,
    description: '2-col carousel with overlaid arrows',
}

export const GALLERY_17: GalleryPresetConfig = {
    id: 'gallery-17',
    name: 'Gallery 17',
    relumeGallery: 17,
    style: 'slider',
    columns: 2,
    imageCount: 4,
    rows: 1,
    arrows: 'overlaid',
    hasDots: true,
    description: '2-col carousel with overlaid arrows (variant)',
}

export const GALLERY_18: GalleryPresetConfig = {
    id: 'gallery-18',
    name: 'Gallery 18',
    relumeGallery: 18,
    style: 'slider',
    columns: 3,
    imageCount: 6,
    rows: 1,
    arrows: 'overlaid',
    hasDots: true,
    description: '3-col carousel with overlaid arrows',
}

export const GALLERY_19: GalleryPresetConfig = {
    id: 'gallery-19',
    name: 'Gallery 19',
    relumeGallery: 19,
    style: 'slider',
    columns: 4,
    imageCount: 8,
    rows: 1,
    arrows: 'overlaid',
    hasDots: true,
    description: '4-col carousel with overlaid arrows',
}

// ============================================
// Sliders — Arrows Below (20–23)
// ============================================

export const GALLERY_20: GalleryPresetConfig = {
    id: 'gallery-20',
    name: 'Gallery 20',
    relumeGallery: 20,
    style: 'slider',
    columns: 1,
    imageCount: 3,
    rows: 1,
    arrows: 'below',
    hasDots: true,
    description: 'Landscape carousel with arrows + dots below',
}

export const GALLERY_21: GalleryPresetConfig = {
    id: 'gallery-21',
    name: 'Gallery 21',
    relumeGallery: 21,
    style: 'slider',
    columns: 2,
    imageCount: 4,
    rows: 1,
    arrows: 'below',
    hasDots: true,
    description: '2-col carousel with arrows + dots below',
}

export const GALLERY_22: GalleryPresetConfig = {
    id: 'gallery-22',
    name: 'Gallery 22',
    relumeGallery: 22,
    style: 'slider',
    columns: 3,
    imageCount: 6,
    rows: 1,
    arrows: 'below',
    hasDots: true,
    description: '3-col carousel with arrows + dots below',
}

export const GALLERY_23: GalleryPresetConfig = {
    id: 'gallery-23',
    name: 'Gallery 23',
    relumeGallery: 23,
    style: 'slider',
    columns: 4,
    imageCount: 8,
    rows: 1,
    arrows: 'below',
    hasDots: true,
    description: '4-col carousel with arrows + dots below',
}

// ============================================
// Peek / Overflow Slider (24)
// ============================================

export const GALLERY_24: GalleryPresetConfig = {
    id: 'gallery-24',
    name: 'Gallery 24',
    relumeGallery: 24,
    style: 'slider',
    columns: 1,
    imageCount: 3,
    rows: 1,
    arrows: 'none',
    hasDots: false,
    description: 'Horizontal peek carousel, overflow visible',
}

// ============================================
// Split Layout (25–27)
// ============================================

export const GALLERY_25: GalleryPresetConfig = {
    id: 'gallery-25',
    name: 'Gallery 25',
    relumeGallery: 25,
    style: 'split',
    columns: 1,
    imageCount: 7,
    rows: 1,
    arrows: 'below',
    hasDots: true,
    description: 'Split: title left + 1 large image carousel right',
}

export const GALLERY_26: GalleryPresetConfig = {
    id: 'gallery-26',
    name: 'Gallery 26',
    relumeGallery: 26,
    style: 'split',
    columns: 2,
    imageCount: 7,
    rows: 1,
    arrows: 'below',
    hasDots: true,
    description: 'Split: title left + 2-col grid carousel right',
}

export const GALLERY_27: GalleryPresetConfig = {
    id: 'gallery-27',
    name: 'Gallery 27',
    relumeGallery: 27,
    style: 'split',
    columns: 3,
    imageCount: 7,
    rows: 1,
    arrows: 'below',
    hasDots: true,
    description: 'Split: title left + 3-col grid carousel right',
}

// ============================================
// Aggregated Exports
// ============================================

export const ALL_GALLERY_PRESETS: GalleryPresetConfig[] = [
    GALLERY_1, GALLERY_2, GALLERY_3, GALLERY_4, GALLERY_5, GALLERY_6,
    GALLERY_7, GALLERY_8, GALLERY_9, GALLERY_10,
    GALLERY_11, GALLERY_12,
    GALLERY_13, GALLERY_14, GALLERY_15, GALLERY_16, GALLERY_17, GALLERY_18, GALLERY_19,
    GALLERY_20, GALLERY_21, GALLERY_22, GALLERY_23,
    GALLERY_24,
    GALLERY_25, GALLERY_26, GALLERY_27,
]

export const GALLERY_PRESETS_MAP: Record<string, GalleryPresetConfig> = Object.fromEntries(
    ALL_GALLERY_PRESETS.map((p) => [p.id, p])
)
