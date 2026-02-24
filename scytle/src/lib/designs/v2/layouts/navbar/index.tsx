/**
 * Navbar — Unified Barrel Exports
 *
 * Config-driven: one parametric renderer (NavbarSectionShell) handles all presets.
 * Layout components are created by factory from preset configs.
 * Thumbnails are auto-generated from config metadata.
 *
 * Family A: Navbar 1–32 (32 variants)
 */

import type { LayoutTemplate, LayoutProps } from '../types'
import type { NavbarPresetConfig } from './types'
import { ALL_NAVBAR_PRESETS, NAVBAR_BLOCK_FACTORIES } from './presets'
import { NavbarSectionShell } from './renderers/section-shell'
import { createThumbnail } from './thumbnails'

// ============================================
// Layout component factory
// ============================================

/** Creates a layout component that injects the preset config into NavbarSectionShell. */
function createLayoutComponent(config: NavbarPresetConfig): React.FC<LayoutProps> {
    const Component = function NavbarLayout(props: LayoutProps) {
        return <NavbarSectionShell {...props} config={config} />
    }
    Component.displayName = `Navbar${config.id.replace('navbar-', '')}Layout`
    return Component
}

// ============================================
// Layout Templates (auto-wired from presets)
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_NAVBAR_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'navbar',
    description: preset.description,
    component: createLayoutComponent(preset),
    defaultBlocks: NAVBAR_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: createThumbnail(preset),
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports
// ============================================

export type { NavbarContent, NavbarPresetConfig, NavbarShell, NavbarLayout } from './types'
export { DEFAULT_CONTENT } from './types'
export { ALL_NAVBAR_PRESETS, NAVBAR_PRESETS_MAP, NAVBAR_BLOCK_FACTORIES } from './presets'
