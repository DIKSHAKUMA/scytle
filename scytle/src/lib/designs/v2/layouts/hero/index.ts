/**
 * Hero Layout — Barrel Exports
 *
 * Registers all hero layout templates for the V2 registry.
 */

import type { LayoutTemplate } from '../types'
import { Hero44Layout, Hero57Layout } from './hero-layouts'
import { Hero44Thumbnail, Hero57Thumbnail } from './hero-thumbnails'
import { ALL_HERO_PRESETS, HERO_BLOCK_FACTORIES, HERO_PRESETS_MAP } from './presets'

// ============================================
// Layout Templates
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_HERO_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'hero',
    description: preset.description,
    component: preset.id === 'hero-44' ? Hero44Layout : Hero57Layout,
    defaultBlocks: HERO_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: preset.id === 'hero-44' ? Hero44Thumbnail : Hero57Thumbnail,
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports
// ============================================

export { ALL_HERO_PRESETS, HERO_PRESETS_MAP, HERO_BLOCK_FACTORIES } from './presets'
export { Hero44Layout, Hero57Layout } from './hero-layouts'
export { Hero44Thumbnail, Hero57Thumbnail } from './hero-thumbnails'
export type { HeroContent, HeroAlignment, HeroPresetConfig } from './types'
export { DEFAULT_CONTENT } from './types'
