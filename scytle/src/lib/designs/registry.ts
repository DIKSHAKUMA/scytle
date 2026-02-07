/**
 * Design Registry - Single Source of Truth
 * 
 * This is the central hub for all design definitions.
 * Import designs here and they automatically become available
 * in all panels (Add Section, Replace Component, Wireframe Preview).
 */

import type { DesignDefinition, DesignCategory, DesignCategoryId, ComponentVariant, SectionLayout } from './types'

// Import all category designs
import { Header1, Header2, Header3 } from './hero'

// ===== DESIGN REGISTRY =====
// The single source of truth - add new designs here!

export const DESIGN_REGISTRY: DesignDefinition[] = [
    // Hero Sections
    Header1,
    Header2,
    Header3,

    // Future categories:
    // ...FeatureDesigns,
    // ...CTADesigns,
    // ...FooterDesigns,
    // ...NavbarDesigns,
]

// ===== CATEGORY METADATA =====
// Used by Add Section Sidebar for category labels and organization

export interface CategoryMeta {
    id: DesignCategoryId
    name: string
    description: string
    icon?: string
}

export const DESIGN_CATEGORIES: CategoryMeta[] = [
    { id: 'hero', name: 'Hero Sections', description: 'Page headers and hero banners' },
    { id: 'features', name: 'Features', description: 'Feature showcases and grids' },
    { id: 'cta', name: 'Call to Action', description: 'Conversion sections' },
    { id: 'testimonials', name: 'Testimonials', description: 'Social proof sections' },
    { id: 'pricing', name: 'Pricing', description: 'Pricing tables and plans' },
    { id: 'faq', name: 'FAQ', description: 'Frequently asked questions' },
    { id: 'contact', name: 'Contact', description: 'Contact forms and info' },
    { id: 'footer', name: 'Footer', description: 'Page footers' },
    { id: 'navbar', name: 'Navigation', description: 'Navigation bars' },
    { id: 'content', name: 'Content', description: 'General content sections' },
    { id: 'gallery', name: 'Gallery', description: 'Image galleries' },
    { id: 'team', name: 'Team', description: 'Team member sections' },
    { id: 'blog', name: 'Blog', description: 'Blog layouts' },
    { id: 'stats', name: 'Statistics', description: 'Stats and numbers' },
    { id: 'logos', name: 'Logos', description: 'Logo clouds and partners' },
]

// ===== HELPER FUNCTIONS =====

/**
 * Get a design by its unique ID
 */
export function getDesignById(id: string): DesignDefinition | undefined {
    return DESIGN_REGISTRY.find(design => design.id === id)
}

/**
 * Get all designs for a specific category
 */
export function getDesignsForCategory(category: DesignCategoryId): DesignDefinition[] {
    return DESIGN_REGISTRY.filter(design => design.category === category)
}

/**
 * Get categories that have at least one design
 */
export function getActiveCategories(): CategoryMeta[] {
    const categoriesWithDesigns = new Set(
        DESIGN_REGISTRY.map(design => design.category)
    )
    return DESIGN_CATEGORIES.filter(cat => categoriesWithDesigns.has(cat.id))
}

/**
 * Search designs by name, description, or tags
 */
export function searchDesigns(query: string): DesignDefinition[] {
    const lowerQuery = query.toLowerCase()
    return DESIGN_REGISTRY.filter(design =>
        design.name.toLowerCase().includes(lowerQuery) ||
        design.description.toLowerCase().includes(lowerQuery) ||
        design.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
}

/**
 * Convert DesignDefinition to ComponentVariant (for backwards compatibility)
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
 * Convert DesignDefinition to SectionLayout (for Add Section Sidebar)
 */
export function designToLayout(design: DesignDefinition): SectionLayout {
    return {
        id: design.id,
        name: design.name,
        description: design.description,
    }
}

/**
 * Get designs as ComponentVariants for a category (backwards compatible)
 */
export function getCategoryVariants(category: DesignCategoryId): ComponentVariant[] {
    return getDesignsForCategory(category).map(designToVariant)
}

/**
 * Get designs as SectionLayouts for a category (for sidebar)
 */
export function getCategoryLayouts(category: DesignCategoryId): SectionLayout[] {
    return getDesignsForCategory(category).map(designToLayout)
}
