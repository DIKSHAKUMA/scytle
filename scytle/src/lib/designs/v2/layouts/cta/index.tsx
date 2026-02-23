/**
 * CTA — Unified Barrel Exports
 *
 * Config-driven: one parametric renderer (CtaSectionShell) handles all 41 presets.
 * Layout components are created by factory from preset configs.
 * Thumbnails are auto-generated from config metadata.
 *
 * Family A: CTA 1, 2, 39, 40, 59, 60       (side-by-side text + inline image)
 * Family B: CTA 13–18, 21–22, 61–62         (two-column text ± image below)
 * Family C: CTA 3–6, 19–20, 25–32, 41–44,  (single-column text, optional bg/card/image)
 *           51–56, 65
 */

import type { LayoutTemplate, LayoutProps } from '../types'
import type { CtaPresetConfig } from './types'
import { ALL_CTA_PRESETS, CTA_BLOCK_FACTORIES } from './presets'
import { CtaSectionShell } from './renderers/section-shell'
import { createThumbnail } from './thumbnails'

// ============================================
// Layout component factory
// ============================================

/** Creates a layout component that injects the preset config into CtaSectionShell. */
function createLayoutComponent(config: CtaPresetConfig): React.FC<LayoutProps> {
    const Component = function CtaLayout(props: LayoutProps) {
        return <CtaSectionShell {...props} config={config} />
    }
    Component.displayName = `Cta${config.id.replace('cta-', '')}Layout`
    return Component
}

// ============================================
// Layout Templates (auto-wired from presets)
// ============================================

export const LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_CTA_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'cta',
    description: preset.description,
    component: createLayoutComponent(preset),
    defaultBlocks: CTA_BLOCK_FACTORIES[preset.id],
    tags: preset.tags,
    Thumbnail: createThumbnail(preset),
}))

export const TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    LAYOUT_TEMPLATES.map((t) => [t.id, t]),
)

// ============================================
// Re-exports
// ============================================

export type { CtaContent, CtaPresetConfig, SectionShell, ContentAlign } from './types'
export { DEFAULT_CONTENT } from './types'
export { ALL_CTA_PRESETS, CTA_PRESETS_MAP, CTA_BLOCK_FACTORIES } from './presets'
