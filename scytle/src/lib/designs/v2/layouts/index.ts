/**
 * V2 Layout System — Registry & Barrel Exports
 *
 * Central registry of all layout templates across all categories.
 * New categories are added by importing their templates and
 * adding them to the LAYOUT_REGISTRY.
 */

import type { LayoutTemplate, LayoutCategory, LayoutRegistry } from './types'

// Re-export types
export type { LayoutTemplate, LayoutCategory, LayoutRegistry, LayoutProps } from './types'

// Re-export controls
export type { LayoutControlAxis, LayoutControlOption, LayoutControlDef } from './controls'
export { getControlDef, getControlDefForLayout } from './controls'

// ============================================
// Global Layout Registry
// ============================================

/** All registered layout templates, grouped by category */
export const LAYOUT_REGISTRY: Partial<LayoutRegistry> = {
    // Categories will be added here as they are built
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
