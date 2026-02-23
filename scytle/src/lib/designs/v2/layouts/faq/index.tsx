/**
 * FAQ — Unified Barrel Exports
 *
 * Config-driven: one parametric renderer (FaqSectionShell) handles all presets.
 * Layout components are created by factory from preset configs.
 * Thumbnails are auto-generated from config metadata.
 *
 * Family A: FAQ 1,2,4,5,10,11  (6 variants: text × style × columns)
 * Family B: FAQ 3,6             (2 variants: style)
 * Family C: FAQ 7,12,13         (3 variants: columns)
 * Family D: FAQ 8               (1 variant: standalone)
 * Family E: FAQ 9               (1 variant: standalone)
 * Family F: FAQ 14              (1 variant: standalone)
 */

import type { LayoutTemplate, LayoutProps } from '../types'
import type { FaqPresetConfig } from './types'
import { ALL_FAQ_PRESETS, FAQ_BLOCK_FACTORIES } from './presets'
import { FaqSectionShell } from './renderers/section-shell'
import { createThumbnail } from './thumbnails'

// ============================================
// Layout component factory
// ============================================

/** Creates a layout component that injects the preset config into FaqSectionShell. */
function createLayoutComponent(config: FaqPresetConfig): React.FC<LayoutProps> {
    const Component = function FaqLayout(props: LayoutProps) {
        return <FaqSectionShell {...props} config={config} />
    }
    Component.displayName = `Faq${config.id.replace('faq-', '')}Layout`
    return Component
}

// ============================================
// Layout Templates (auto-wired from presets)
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_FAQ_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'faq',
    description: preset.description,
    component: createLayoutComponent(preset),
    defaultBlocks: FAQ_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: createThumbnail(preset),
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports
// ============================================

export type { FaqContent, FaqPresetConfig, ContentAlign } from './types'
export { DEFAULT_CONTENT } from './types'
export { ALL_FAQ_PRESETS, FAQ_PRESETS_MAP, FAQ_BLOCK_FACTORIES } from './presets'
