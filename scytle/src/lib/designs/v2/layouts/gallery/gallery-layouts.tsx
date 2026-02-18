/**
 * Gallery Layout Components — 27 wrapper components
 *
 * Each binds a variant number to GallerySection via factory.
 * These are the actual components registered in the layout registry.
 */

'use client'

import { GallerySection } from './gallery-section'
import type { GallerySectionProps } from './gallery-section'
import type { GalleryPresetConfig } from './types'
import {
    GALLERY_1, GALLERY_2, GALLERY_3, GALLERY_4, GALLERY_5, GALLERY_6,
    GALLERY_7, GALLERY_8, GALLERY_9, GALLERY_10,
    GALLERY_11, GALLERY_12,
    GALLERY_13, GALLERY_14, GALLERY_15, GALLERY_16, GALLERY_17, GALLERY_18, GALLERY_19,
    GALLERY_20, GALLERY_21, GALLERY_22, GALLERY_23,
    GALLERY_24,
    GALLERY_25, GALLERY_26, GALLERY_27,
} from './presets'

// ============================================
// Factory
// ============================================

type GalleryComponentProps = Omit<GallerySectionProps, 'variant'>

function createGalleryComponent(preset: GalleryPresetConfig) {
    function GalleryComponent(props: GalleryComponentProps) {
        return (
            <GallerySection
                {...props}
                variant={preset.relumeGallery}
            />
        )
    }
    GalleryComponent.displayName = preset.name.replace(' ', '')
    return GalleryComponent
}

// ============================================
// Static Grids (1-6)
// ============================================

export const Gallery1 = createGalleryComponent(GALLERY_1)
export const Gallery2 = createGalleryComponent(GALLERY_2)
export const Gallery3 = createGalleryComponent(GALLERY_3)
export const Gallery4 = createGalleryComponent(GALLERY_4)
export const Gallery5 = createGalleryComponent(GALLERY_5)
export const Gallery6 = createGalleryComponent(GALLERY_6)

// ============================================
// Masonry (7-10)
// ============================================

export const Gallery7 = createGalleryComponent(GALLERY_7)
export const Gallery8 = createGalleryComponent(GALLERY_8)
export const Gallery9 = createGalleryComponent(GALLERY_9)
export const Gallery10 = createGalleryComponent(GALLERY_10)

// ============================================
// Full-bleed (11-12)
// ============================================

export const Gallery11 = createGalleryComponent(GALLERY_11)
export const Gallery12 = createGalleryComponent(GALLERY_12)

// ============================================
// Sliders — Overlaid (13-19)
// ============================================

export const Gallery13 = createGalleryComponent(GALLERY_13)
export const Gallery14 = createGalleryComponent(GALLERY_14)
export const Gallery15 = createGalleryComponent(GALLERY_15)
export const Gallery16 = createGalleryComponent(GALLERY_16)
export const Gallery17 = createGalleryComponent(GALLERY_17)
export const Gallery18 = createGalleryComponent(GALLERY_18)
export const Gallery19 = createGalleryComponent(GALLERY_19)

// ============================================
// Sliders — Below (20-23)
// ============================================

export const Gallery20 = createGalleryComponent(GALLERY_20)
export const Gallery21 = createGalleryComponent(GALLERY_21)
export const Gallery22 = createGalleryComponent(GALLERY_22)
export const Gallery23 = createGalleryComponent(GALLERY_23)

// ============================================
// Peek (24)
// ============================================

export const Gallery24 = createGalleryComponent(GALLERY_24)

// ============================================
// Split (25-27)
// ============================================

export const Gallery25 = createGalleryComponent(GALLERY_25)
export const Gallery26 = createGalleryComponent(GALLERY_26)
export const Gallery27 = createGalleryComponent(GALLERY_27)
