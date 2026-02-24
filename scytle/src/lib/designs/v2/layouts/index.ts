/**
 * V2 Layout System — Registry & Barrel Exports
 *
 * Central registry of all layout templates across all categories.
 * New categories are added by importing their templates and
 * adding them to the LAYOUT_REGISTRY.
 */

import type { LayoutTemplate, LayoutCategory, LayoutRegistry } from './types'

// ── Category imports ────────────────────────────────────────────
import { LAYOUT_TEMPLATES as HERO_TEMPLATES } from './hero'
import { LAYOUT_TEMPLATES as CTA_TEMPLATES } from './cta'
import { LAYOUT_TEMPLATES as HEADER_TEMPLATES } from './header'
import { LAYOUT_TEMPLATES as FAQ_TEMPLATES } from './faq'
import { LAYOUT_TEMPLATES as HERO_HEADER_TEMPLATES } from './hero-header'
import { LAYOUT_TEMPLATES as NAVBAR_TEMPLATES } from './navbar'

// Re-export types
export type { LayoutTemplate, LayoutCategory, LayoutRegistry, LayoutProps } from './types'

// Re-export controls
export type { LayoutControlAxis, LayoutControlOption, LayoutControlDef } from './controls'
export { getControlDef, getControlDefForLayout, getControlDefsForCategory } from './controls'

// ============================================
// Global Layout Registry
// ============================================

/** All registered layout templates, grouped by category */
export const LAYOUT_REGISTRY: Partial<LayoutRegistry> = {
    hero: HERO_TEMPLATES,
    cta: CTA_TEMPLATES,
    header: HEADER_TEMPLATES,
    faq: FAQ_TEMPLATES,
    'hero-header': HERO_HEADER_TEMPLATES,
    navbar: NAVBAR_TEMPLATES,
}

/** Flat array of all layout templates */
export const ALL_LAYOUT_TEMPLATES: LayoutTemplate[] = Object.values(LAYOUT_REGISTRY).flat()

/** Quick lookup by layout ID across all categories */
export const LAYOUT_TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    ALL_LAYOUT_TEMPLATES.map((t) => [t.id, t])
)

/** Get all templates for a specific category */
export function getTemplatesByCategory(category: LayoutCategory): LayoutTemplate[] {
    return LAYOUT_REGISTRY[category] ?? []
}

/** Get a specific template by ID */
export function getTemplateById(id: string): LayoutTemplate | undefined {
    return LAYOUT_TEMPLATES_MAP[id]
}

// ============================================
// Preset Config Lookup (cross-category)
// ============================================

import type { ImageRole } from '../tokens'
import { HERO_PRESETS_MAP } from './hero/presets'
import { CTA_PRESETS_MAP } from './cta/presets'
import { HERO_HEADER_PRESETS_MAP } from './hero-header/presets'
import { HEADER_PRESETS_MAP } from './header/presets'
import { NAVBAR_PRESETS_MAP } from './navbar/presets'

export interface PresetImageConfig {
    imageRole: ImageRole
    supportsVideo: boolean
}

/**
 * Look up image/video config for any V2 preset across all categories.
 * Used by image-controls-panel and section-panel to determine which
 * media controls to show.
 */
export function getPresetConfig(componentId: string): PresetImageConfig | undefined {
    const heroConfig = HERO_PRESETS_MAP[componentId]
    if (heroConfig) return { imageRole: heroConfig.imageRole, supportsVideo: heroConfig.supportsVideo }

    const ctaConfig = CTA_PRESETS_MAP[componentId]
    if (ctaConfig) return { imageRole: ctaConfig.imageRole, supportsVideo: ctaConfig.supportsVideo }

    const headerConfig = HEADER_PRESETS_MAP[componentId]
    if (headerConfig) return { imageRole: headerConfig.imageRole, supportsVideo: headerConfig.supportsVideo }

    const hhConfig = HERO_HEADER_PRESETS_MAP[componentId]
    if (hhConfig) return { imageRole: hhConfig.imageRole, supportsVideo: hhConfig.supportsVideo }

    const navConfig = NAVBAR_PRESETS_MAP[componentId]
    if (navConfig) return { imageRole: navConfig.imageRole, supportsVideo: navConfig.supportsVideo }

    return undefined
}
