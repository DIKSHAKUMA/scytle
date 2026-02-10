/**
 * Design System - Main Export
 * 
 * Two-tier model: Template Families + Design Presets
 * 
 * Usage:
 *   import { getFamilyById, getPresetById, getPresetsForCategory } from '@/lib/designs'
 *   import { getDesignById } from '@/lib/designs'  // backward compat
 */

// Re-export registries
export {
    FAMILY_REGISTRY,
    PRESET_REGISTRY,
    DESIGN_CATEGORIES,
} from './registry'

// Re-export family + preset helpers
export {
    getFamilyById,
    getFamiliesForCategory,
    getPresetById,
    getPresetsForCategory,
    getPresetsForFamily,
    resolvePreset,
    searchPresets,
} from './registry'

// Re-export backward-compatible helpers
export {
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
    TemplateFamily,
    DesignPreset,
    DesignDefinition,
    CanvasProps,
    ControlType,
    ControlDefinition,
    ControlOption,
    DesignCategory,
    DesignCategoryId,
    ComponentVariant,
    SectionLayout,
} from './types'

// Re-export CategoryMeta type from registry
export type { CategoryMeta } from './registry'
