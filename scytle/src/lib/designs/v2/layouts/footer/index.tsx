/**
 * Footer — Unified Barrel Exports
 *
 * Config-driven: one parametric renderer (FooterSectionShell) handles all presets.
 * Layout components are created by factory from preset configs.
 * Thumbnails are auto-generated from config metadata.
 *
 * Family A: Footer 1, 11   (2 variants: style normal/card)
 * Family B: Footer 3, 10   (2 variants: style normal/card)
 * Family C: Footer 6, 12   (2 variants: style normal/card)
 * Family D: Footer 9, 15   (2 variants: style normal/card)
 * Family E: Footer 2, 4, 5, 7, 8, 13, 14, 16, 17 (9 standalone)
 */

import type { LayoutTemplate, LayoutProps } from '../types'
import type { FooterPresetConfig } from './types'
import { ALL_FOOTER_PRESETS, FOOTER_BLOCK_FACTORIES } from './presets'
import { FooterSectionShell } from './renderers/section-shell'
import { createThumbnail } from './thumbnails'

// ============================================
// Layout component factory
// ============================================

/** Creates a layout component that injects the preset config into FooterSectionShell. */
function createLayoutComponent(config: FooterPresetConfig): React.FC<LayoutProps> {
    const Component = function FooterLayout(props: LayoutProps) {
        return <FooterSectionShell {...props} config={config} />
    }
    Component.displayName = `Footer${config.id.replace('footer-', '')}Layout`
    return Component
}

// ============================================
// Layout Templates (auto-wired from presets)
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_FOOTER_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'footer',
    description: preset.description,
    component: createLayoutComponent(preset),
    defaultBlocks: FOOTER_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: createThumbnail(preset),
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports
// ============================================

export type { FooterContent, FooterPresetConfig, FooterShell } from './types'
export { DEFAULT_CONTENT } from './types'
export { ALL_FOOTER_PRESETS, FOOTER_PRESETS_MAP, FOOTER_BLOCK_FACTORIES } from './presets'
