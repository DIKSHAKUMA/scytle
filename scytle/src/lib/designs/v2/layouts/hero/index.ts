/**
 * Hero Layout — Barrel Exports
 *
 * Registers all hero layout templates for the V2 registry.
 */

import type { LayoutTemplate } from '../types'
import { Hero44Layout, Hero57Layout, Hero1Layout, Hero3Layout, Hero5Layout } from './hero-layouts'
import { Hero44Thumbnail, Hero57Thumbnail, Hero1Thumbnail, Hero3Thumbnail, Hero5Thumbnail } from './hero-thumbnails'
import { ALL_HERO_PRESETS, HERO_BLOCK_FACTORIES, HERO_PRESETS_MAP } from './presets'

// ============================================
// Component + Thumbnail lookup by preset ID
// ============================================

const COMPONENT_MAP: Record<string, React.FC<import('../types').LayoutProps>> = {
    'hero-44': Hero44Layout,
    'hero-57': Hero57Layout,
    'hero-1': Hero1Layout,
    'hero-3': Hero3Layout,
    'hero-5': Hero5Layout,
}

const THUMBNAIL_MAP: Record<string, React.FC> = {
    'hero-44': Hero44Thumbnail,
    'hero-57': Hero57Thumbnail,
    'hero-1': Hero1Thumbnail,
    'hero-3': Hero3Thumbnail,
    'hero-5': Hero5Thumbnail,
}

// ============================================
// Layout Templates
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_HERO_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'hero',
    description: preset.description,
    component: COMPONENT_MAP[preset.id] ?? Hero44Layout,
    defaultBlocks: HERO_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: THUMBNAIL_MAP[preset.id] ?? Hero44Thumbnail,
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports
// ============================================

export { ALL_HERO_PRESETS, HERO_PRESETS_MAP, HERO_BLOCK_FACTORIES } from './presets'
export { Hero44Layout, Hero57Layout, Hero1Layout, Hero3Layout, Hero5Layout } from './hero-layouts'
export { Hero44Thumbnail, Hero57Thumbnail, Hero1Thumbnail, Hero3Thumbnail, Hero5Thumbnail } from './hero-thumbnails'
export type { HeroContent, HeroLayout, HeroPresetConfig } from './types'
export { DEFAULT_CONTENT } from './types'
