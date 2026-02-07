/**
 * Design System - Main Export
 * 
 * Usage:
 *   import { getDesignById, getDesignsForCategory, DESIGN_CATEGORIES } from '@/lib/designs'
 */

// Re-export everything from registry
export {
    DESIGN_REGISTRY,
    DESIGN_CATEGORIES,
    getDesignById,
    getDesignsForCategory,
    getActiveCategories,
    searchDesigns,
    designToVariant,
    designToLayout,
    getCategoryVariants,
    getCategoryLayouts,
} from './registry'

// Re-export types
export type {
    DesignDefinition,
    CanvasProps,
    DesignCategory,
    DesignCategoryId,
    ComponentVariant,
    SectionLayout,
} from './types'

// Re-export CategoryMeta type from registry
export type { CategoryMeta } from './registry'
