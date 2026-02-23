/**
 * Header — Unified Barrel Exports
 *
 * Config-driven: one parametric renderer (HeaderSectionShell) handles all presets.
 * Layout components are created by factory from preset configs.
 * Thumbnails are auto-generated from config metadata.
 *
 * Family A: Header 44–55, 62–70  (18 variants: text × background × element)
 */

import type { LayoutTemplate, LayoutProps } from '../types'
import type { HeaderPresetConfig } from './types'
import { ALL_HEADER_PRESETS, HEADER_BLOCK_FACTORIES } from './presets'
import { HeaderSectionShell } from './renderers/section-shell'
import { createThumbnail } from './thumbnails'

// ============================================
// Layout component factory
// ============================================

/** Creates a layout component that injects the preset config into HeaderSectionShell. */
function createLayoutComponent(config: HeaderPresetConfig): React.FC<LayoutProps> {
    const Component = function HeaderLayout(props: LayoutProps) {
        return <HeaderSectionShell {...props} config={config} />
    }
    Component.displayName = `Header${config.id.replace('header-', '')}Layout`
    return Component
}

// ============================================
// Layout Templates (auto-wired from presets)
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_HEADER_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'header',
    description: preset.description,
    component: createLayoutComponent(preset),
    defaultBlocks: HEADER_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: createThumbnail(preset),
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports
// ============================================

export type { HeaderContent, HeaderPresetConfig, SectionShell, ContentAlign } from './types'
export { DEFAULT_CONTENT } from './types'
export { ALL_HEADER_PRESETS, HEADER_PRESETS_MAP, HEADER_BLOCK_FACTORIES } from './presets'
