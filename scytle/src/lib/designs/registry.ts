/**
 * Design Registry - Single Source of Truth
 * 
 * Two-tier registry: Template Families (parametric Canvas components) +
 * Design Presets (named control snapshots users browse in the sidebar).
 */

import type {
    TemplateFamily,
    DesignPreset,
    DesignDefinition,
    DesignCategory,
    DesignCategoryId,
    ComponentVariant,
    SectionLayout,
} from './types'
import type { PageContext } from '@/types'

// Import all category families + presets
import { heroFamilies, heroPresets } from './hero'
import { ctaFamilies, ctaPresets } from './cta'
import { navbarFamilies, navbarPresets } from './navbar'
import { footerFamilies, footerPresets } from './footer'
import { featuresFamilies, featuresPresets } from './features'
import { testimonialsFamilies, testimonialsPresets } from './testimonials'
import { pricingFamilies, pricingPresets } from './pricing'
import { faqFamilies, faqPresets } from './faq'
import { contactFamilies, contactPresets } from './contact'
import { contentFamilies, contentPresets } from './content'
import { galleryFamilies, galleryPresets } from './gallery'
import { teamFamilies, teamPresets } from './team'
import { blogFamilies, blogPresets } from './blog'
import { statsFamilies, statsPresets } from './stats'
import { logosFamilies, logosPresets } from './logos'
// SaaS / Application categories
import { dashboardFamilies, dashboardPresets } from './dashboard'
import { dataTableFamilies, dataTablePresets } from './data-table'
import { appListFamilies, appListPresets } from './app-list'
import { authFamilies, authPresets } from './auth'
import { appFormFamilies, appFormPresets } from './app-form'
import { chartFamilies, chartPresets } from './chart'
import { emptyStateFamilies, emptyStatePresets } from './empty-state'

// ===== FAMILY REGISTRY =====
// Parametric Canvas components — one per layout pattern

export const FAMILY_REGISTRY: TemplateFamily[] = [
    ...heroFamilies,
    ...ctaFamilies,
    ...navbarFamilies,
    ...footerFamilies,
    ...featuresFamilies,
    ...testimonialsFamilies,
    ...pricingFamilies,
    ...faqFamilies,
    ...contactFamilies,
    ...contentFamilies,
    ...galleryFamilies,
    ...teamFamilies,
    ...blogFamilies,
    ...statsFamilies,
    ...logosFamilies,
    ...dashboardFamilies,
    ...dataTableFamilies,
    ...appListFamilies,
    ...authFamilies,
    ...appFormFamilies,
    ...chartFamilies,
    ...emptyStateFamilies,
]

// ===== PRESET REGISTRY =====
// Named control snapshots — what users browse in the sidebar

export const PRESET_REGISTRY: DesignPreset[] = [
    ...heroPresets,
    ...ctaPresets,
    ...navbarPresets,
    ...footerPresets,
    ...featuresPresets,
    ...testimonialsPresets,
    ...pricingPresets,
    ...faqPresets,
    ...contactPresets,
    ...contentPresets,
    ...galleryPresets,
    ...teamPresets,
    ...blogPresets,
    ...statsPresets,
    ...logosPresets,
    ...dashboardPresets,
    ...dataTablePresets,
    ...appListPresets,
    ...authPresets,
    ...appFormPresets,
    ...chartPresets,
    ...emptyStatePresets,
]

// ===== CATEGORY METADATA =====

export interface CategoryMeta {
    id: DesignCategoryId
    name: string
    description: string
    icon?: string
    /** Page context this category belongs to */
    context: PageContext
}

export const DESIGN_CATEGORIES: CategoryMeta[] = [
    // Marketing categories
    { id: 'hero', name: 'Hero Sections', description: 'Page headers and hero banners', context: 'marketing' },
    { id: 'features', name: 'Features', description: 'Feature showcases and grids', context: 'marketing' },
    { id: 'cta', name: 'Call to Action', description: 'Conversion sections', context: 'marketing' },
    { id: 'testimonials', name: 'Testimonials', description: 'Social proof sections', context: 'marketing' },
    { id: 'pricing', name: 'Pricing', description: 'Pricing tables and plans', context: 'marketing' },
    { id: 'faq', name: 'FAQ', description: 'Frequently asked questions', context: 'marketing' },
    { id: 'contact', name: 'Contact', description: 'Contact forms and info', context: 'marketing' },
    { id: 'footer', name: 'Footer', description: 'Page footers', context: 'marketing' },
    { id: 'navbar', name: 'Navigation', description: 'Navigation bars', context: 'marketing' },
    { id: 'content', name: 'Content', description: 'General content sections', context: 'marketing' },
    { id: 'gallery', name: 'Gallery', description: 'Image galleries', context: 'marketing' },
    { id: 'team', name: 'Team', description: 'Team member sections', context: 'marketing' },
    { id: 'blog', name: 'Blog', description: 'Blog layouts', context: 'marketing' },
    { id: 'stats', name: 'Statistics', description: 'Stats and numbers', context: 'marketing' },
    { id: 'logos', name: 'Logos', description: 'Logo clouds and partners', context: 'marketing' },
    // Application categories (SaaS)
    { id: 'dashboard', name: 'Dashboard', description: 'Stat cards, page headers, KPIs', context: 'application' },
    { id: 'data-table', name: 'Data Tables', description: 'Tables with filters, sorting, and pagination', context: 'application' },
    { id: 'app-list', name: 'Lists', description: 'Stacked lists and card grids', context: 'application' },
    { id: 'chart', name: 'Charts', description: 'Bar, line, pie, and area chart wireframes', context: 'application' },
    { id: 'app-form', name: 'Forms', description: 'Settings, profile, payment, and preference forms', context: 'application' },
    { id: 'empty-state', name: 'Empty States', description: 'Zero-data and onboarding placeholders', context: 'application' },
    // Auth category
    { id: 'auth', name: 'Authentication', description: 'Login, signup, onboarding, and auth modals', context: 'auth' },
]

// ===== FAMILY HELPERS =====

/** Get a family by its unique ID */
export function getFamilyById(id: string): TemplateFamily | undefined {
    return FAMILY_REGISTRY.find(f => f.id === id)
}

/** Get all families for a specific category */
export function getFamiliesForCategory(category: DesignCategoryId): TemplateFamily[] {
    return FAMILY_REGISTRY.filter(f => f.category === category)
}

/** Get categories filtered by page context */
export function getCategoriesForContext(context: PageContext): CategoryMeta[] {
    return DESIGN_CATEGORIES.filter(cat => cat.context === context)
}

// ===== PRESET HELPERS =====

/** Get a preset by its unique ID */
export function getPresetById(id: string): DesignPreset | undefined {
    return PRESET_REGISTRY.find(p => p.id === id)
}

/** Get all presets for a category (by resolving preset → family → category) */
export function getPresetsForCategory(category: DesignCategoryId): DesignPreset[] {
    const familyIds = new Set(
        FAMILY_REGISTRY.filter(f => f.category === category).map(f => f.id)
    )
    return PRESET_REGISTRY.filter(p => familyIds.has(p.familyId))
}

/** Get all presets for a specific family */
export function getPresetsForFamily(familyId: string): DesignPreset[] {
    return PRESET_REGISTRY.filter(p => p.familyId === familyId)
}

/** 
 * Resolve a preset to its family + merged controls.
 * Returns the three-layer merge ingredients.
 */
export function resolvePreset(presetId: string): {
    family: TemplateFamily
    controls: Record<string, string | number | boolean>
    content: Record<string, unknown>
} | undefined {
    const preset = getPresetById(presetId)
    if (!preset) return undefined

    const family = getFamilyById(preset.familyId)
    if (!family) return undefined

    return {
        family,
        controls: {
            ...family.defaultControls,
            ...preset.controls,
        },
        content: {
            ...family.defaultContent,
            ...(preset.content ?? {}),
        },
    }
}

/** Search presets by name, description, or family tags */
export function searchPresets(query: string): DesignPreset[] {
    const lowerQuery = query.toLowerCase()
    return PRESET_REGISTRY.filter(preset => {
        if (preset.name.toLowerCase().includes(lowerQuery)) return true
        if (preset.description.toLowerCase().includes(lowerQuery)) return true
        // Also search the family's tags
        const family = getFamilyById(preset.familyId)
        if (family?.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) return true
        return false
    })
}

// ===== BACKWARD COMPATIBILITY =====

/**
 * Get a design by ID — works with both preset IDs and family IDs.
 * 
 * Resolution order:
 * 1. Try as preset ID → return its family (with preset.controls as defaults)
 * 2. Try as family ID → return the family directly
 * 3. Return undefined
 * 
 * This wraps the result into a DesignDefinition-shaped object for
 * components that haven't been migrated to the family/preset model yet.
 */
export function getDesignById(id: string): DesignDefinition | undefined {
    // Try as preset first
    const preset = getPresetById(id)
    if (preset) {
        const family = getFamilyById(preset.familyId)
        if (family) {
            return {
                id: preset.id,
                category: family.category,
                name: preset.name,
                description: preset.description,
                tags: family.tags,
                Thumbnail: preset.Thumbnail,
                Canvas: family.Canvas,
                hasImage: family.hasImage,
                hasVideo: family.hasVideo,
                hasForm: family.hasForm,
                controlsDef: family.controlsDef,
                defaultControls: {
                    ...family.defaultControls,
                    ...preset.controls,
                },
            }
        }
    }

    // Try as family directly
    const family = getFamilyById(id)
    if (family) {
        return {
            id: family.id,
            category: family.category,
            name: family.name,
            description: family.description,
            tags: family.tags,
            Thumbnail: () => null, // Families don't have thumbnails (presets do)
            Canvas: family.Canvas,
            hasImage: family.hasImage,
            hasVideo: family.hasVideo,
            hasForm: family.hasForm,
            controlsDef: family.controlsDef,
            defaultControls: family.defaultControls,
        }
    }

    return undefined
}

/**
 * @deprecated Use getPresetsForCategory() instead
 */
export function getDesignsForCategory(category: DesignCategoryId): DesignDefinition[] {
    return getPresetsForCategory(category).map(preset => {
        const family = getFamilyById(preset.familyId)
        return {
            id: preset.id,
            category: family?.category ?? category,
            name: preset.name,
            description: preset.description,
            tags: family?.tags,
            Thumbnail: preset.Thumbnail,
            Canvas: family?.Canvas ?? (() => null),
            hasImage: family?.hasImage,
            hasVideo: family?.hasVideo,
            hasForm: family?.hasForm,
            controlsDef: family?.controlsDef,
            defaultControls: {
                ...(family?.defaultControls ?? {}),
                ...preset.controls,
            },
        } as DesignDefinition
    })
}

/** Get categories that have at least one preset */
export function getActiveCategories(): CategoryMeta[] {
    const familyIds = new Set(PRESET_REGISTRY.map(p => p.familyId))
    const categoriesWithPresets = new Set(
        FAMILY_REGISTRY.filter(f => familyIds.has(f.id)).map(f => f.category)
    )
    return DESIGN_CATEGORIES.filter(cat => categoriesWithPresets.has(cat.id))
}

/**
 * @deprecated Use searchPresets() instead
 */
export function searchDesigns(query: string): DesignDefinition[] {
    return searchPresets(query).map(preset => {
        const design = getDesignById(preset.id)
        return design!
    }).filter(Boolean)
}

/**
 * @deprecated Backward compat — convert preset to ComponentVariant
 */
export function designToVariant(design: DesignDefinition): ComponentVariant {
    return {
        id: design.id,
        name: design.name,
        description: design.description,
        layout: design.layout,
        hasImage: design.hasImage,
    }
}

/**
 * @deprecated Backward compat — convert preset to SectionLayout
 */
export function designToLayout(design: DesignDefinition): SectionLayout {
    return {
        id: design.id,
        name: design.name,
        description: design.description,
    }
}

/**
 * @deprecated Use getPresetsForCategory() instead
 */
export function getCategoryVariants(category: DesignCategoryId): ComponentVariant[] {
    return getDesignsForCategory(category).map(designToVariant)
}

/**
 * @deprecated Use getPresetsForCategory() instead
 */
export function getCategoryLayouts(category: DesignCategoryId): SectionLayout[] {
    return getDesignsForCategory(category).map(designToLayout)
}
