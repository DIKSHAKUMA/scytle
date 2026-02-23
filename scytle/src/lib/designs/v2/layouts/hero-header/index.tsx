/**
 * Hero Header — Unified Barrel Exports
 *
 * Config-driven: one parametric renderer (HeroHeaderSectionShell) handles all 48 presets.
 * Layout components are created by factory from preset configs.
 * Thumbnails are auto-generated from config metadata.
 *
 * Family A (16): Split hero — text + inline image/video, left/right placement, normal/card
 * Family B (8):  Background hero — centered text over bg image/video, normal/card
 * Family C (4):  Stacked — image on top, two-column text below
 * Family D (4):  Split with extended content — text left, media right
 * Family E (4):  Split variant — text + media side-by-side
 * Family F (12): Centered hero — optional background, optional card
 */

import type { LayoutTemplate, LayoutProps } from '../types'
import type { HeroHeaderPresetConfig } from './types'
import { ALL_HERO_HEADER_PRESETS, HERO_HEADER_BLOCK_FACTORIES } from './presets'
import { HeroHeaderSectionShell } from './renderers/section-shell'
import { createThumbnail } from './thumbnails'

// ============================================
// Layout component factory
// ============================================

/** Creates a layout component that injects the preset config into HeroHeaderSectionShell. */
function createLayoutComponent(config: HeroHeaderPresetConfig): React.FC<LayoutProps> {
    const Component = function HeroHeaderLayout(props: LayoutProps) {
        return <HeroHeaderSectionShell {...props} config={config} />
    }
    Component.displayName = `HH${config.id.replace('hero-header-', '')}Layout`
    return Component
}

// ============================================
// Layout Templates (auto-wired from presets)
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_HERO_HEADER_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'hero-header' as const,
    description: preset.description,
    component: createLayoutComponent(preset),
    defaultBlocks: HERO_HEADER_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: createThumbnail(preset),
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports
// ============================================

export type { HeroHeaderContent, HeroHeaderPresetConfig, SectionShell, ContentAlign } from './types'
export { DEFAULT_CONTENT } from './types'
export { ALL_HERO_HEADER_PRESETS, HERO_HEADER_PRESETS_MAP, HERO_HEADER_BLOCK_FACTORIES } from './presets'
