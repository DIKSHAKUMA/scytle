/**
 * Gallery Layouts — Barrel export
 *
 * Exports all 27 gallery layout components, preset configs, types,
 * and the gallery layout template registry.
 */

// Types
export type {
    GalleryStyle,
    GalleryArrows,
    GalleryColumns,
    GalleryPresetConfig,
    GalleryContent,
} from './types'
export { DEFAULT_GALLERY_CONTENT } from './types'

// Core composable component
export { GallerySection } from './gallery-section'
export type { GallerySectionProps } from './gallery-section'

// Thumbnails
export { GalleryThumbnail, createGalleryThumbnail } from './gallery-thumbnails'

// Preset configs
export {
    GALLERY_1, GALLERY_2, GALLERY_3, GALLERY_4, GALLERY_5, GALLERY_6,
    GALLERY_7, GALLERY_8, GALLERY_9, GALLERY_10,
    GALLERY_11, GALLERY_12,
    GALLERY_13, GALLERY_14, GALLERY_15, GALLERY_16, GALLERY_17, GALLERY_18, GALLERY_19,
    GALLERY_20, GALLERY_21, GALLERY_22, GALLERY_23,
    GALLERY_24,
    GALLERY_25, GALLERY_26, GALLERY_27,
    ALL_GALLERY_PRESETS,
    GALLERY_PRESETS_MAP,
} from './presets'

// 27 named layout components
export {
    Gallery1, Gallery2, Gallery3, Gallery4, Gallery5, Gallery6,
    Gallery7, Gallery8, Gallery9, Gallery10,
    Gallery11, Gallery12,
    Gallery13, Gallery14, Gallery15, Gallery16, Gallery17, Gallery18, Gallery19,
    Gallery20, Gallery21, Gallery22, Gallery23,
    Gallery24,
    Gallery25, Gallery26, Gallery27,
} from './gallery-layouts'

// ============================================
// Gallery Layout Templates (for registry)
// ============================================

import type { LayoutTemplate } from '../types'
import { createGalleryThumbnail } from './gallery-thumbnails'
import {
    Gallery1, Gallery2, Gallery3, Gallery4, Gallery5, Gallery6,
    Gallery7, Gallery8, Gallery9, Gallery10,
    Gallery11, Gallery12,
    Gallery13, Gallery14, Gallery15, Gallery16, Gallery17, Gallery18, Gallery19,
    Gallery20, Gallery21, Gallery22, Gallery23,
    Gallery24,
    Gallery25, Gallery26, Gallery27,
} from './gallery-layouts'
import { ALL_GALLERY_PRESETS } from './presets'

/** Map preset config → component */
const GALLERY_COMPONENTS: Record<string, React.ComponentType<{ sectionId: string; className?: string }>> = {
    'gallery-1': Gallery1,
    'gallery-2': Gallery2,
    'gallery-3': Gallery3,
    'gallery-4': Gallery4,
    'gallery-5': Gallery5,
    'gallery-6': Gallery6,
    'gallery-7': Gallery7,
    'gallery-8': Gallery8,
    'gallery-9': Gallery9,
    'gallery-10': Gallery10,
    'gallery-11': Gallery11,
    'gallery-12': Gallery12,
    'gallery-13': Gallery13,
    'gallery-14': Gallery14,
    'gallery-15': Gallery15,
    'gallery-16': Gallery16,
    'gallery-17': Gallery17,
    'gallery-18': Gallery18,
    'gallery-19': Gallery19,
    'gallery-20': Gallery20,
    'gallery-21': Gallery21,
    'gallery-22': Gallery22,
    'gallery-23': Gallery23,
    'gallery-24': Gallery24,
    'gallery-25': Gallery25,
    'gallery-26': Gallery26,
    'gallery-27': Gallery27,
}

function getDescription(preset: { style: string; columns: number; arrows: string }): string {
    const s = preset.style.charAt(0).toUpperCase() + preset.style.slice(1)
    const c = `${preset.columns}-col`
    const a = preset.arrows === 'none' ? 'no controls' : `${preset.arrows} arrows`
    return `${s} layout, ${c}, ${a}`
}

function getTags(preset: { style: string; columns: number; arrows: string }): string[] {
    const tags = ['gallery', preset.style, `${preset.columns}-col`]
    if (preset.arrows !== 'none') tags.push('slider', preset.arrows)
    return tags
}

/** All 27 gallery LayoutTemplates, ready for the registry */
export const GALLERY_LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_GALLERY_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'gallery' as const,
    description: getDescription(preset),
    relumeId: `gallery-${preset.relumeGallery}`,
    component: GALLERY_COMPONENTS[preset.id],
    defaultBlocks: () => [],
    tags: getTags(preset),
    Thumbnail: createGalleryThumbnail(preset),
}))

/** Quick lookup by layout ID */
export const GALLERY_TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    GALLERY_LAYOUT_TEMPLATES.map((t) => [t.id, t])
)
