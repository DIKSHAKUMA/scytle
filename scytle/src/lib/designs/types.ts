/**
 * Design System Types
 * 
 * Central type definitions for the Scytle design system.
 * Two-tier model: TemplateFamily (parametric Canvas) + DesignPreset (frozen controls).
 */

import type { ViewportDevice } from '@/types'

// ===== CONTROL SYSTEM =====

/**
 * Control types supported by the sidebar renderer
 */
export type ControlType =
    | 'toggle-group'    // Segmented button group
    | 'switch'          // On/off toggle
    | 'slider'          // Numeric range (e.g., columns: 1-6)
    | 'select'          // Dropdown (e.g., card style variants)
    | 'color'           // Color picker (e.g., background theme)
    | 'number'          // Numeric input (e.g., item count)

/**
 * A single option within a toggle-group or select control
 */
export interface ControlOption {
    value: string
    label: string
    /** Lucide icon component name (rendered by sidebar) */
    icon?: string
}

/**
 * ControlDefinition - Declares what controls a design supports
 * 
 * Each family declares an array of these. The sidebar reads them
 * and renders the appropriate widgets. The Canvas reads the values
 * from section.controls and applies them.
 */
export interface ControlDefinition {
    /** Key stored in section.controls (e.g. 'textAlign') */
    key: string
    /** Display label in sidebar (e.g. 'Text Alignment') */
    label: string
    /** Widget type */
    type: ControlType
    /** Options for toggle-group, select types */
    options?: ControlOption[]
    /** Default value when control is not set */
    defaultValue: string | number | boolean
    /** Minimum value for slider, number types */
    min?: number
    /** Maximum value for slider, number types */
    max?: number
    /** Step increment for slider, number types */
    step?: number
    /** Only show this control when another control has a specific value */
    showWhen?: { key: string; value: string | number | boolean }
}

/**
 * Category ID type - all valid section categories
 */
export type DesignCategoryId =
    | 'hero'
    | 'features'
    | 'testimonials'
    | 'cta'
    | 'pricing'
    | 'faq'
    | 'contact'
    | 'footer'
    | 'navbar'
    | 'content'
    | 'gallery'
    | 'team'
    | 'blog'
    | 'stats'
    | 'logos'

// ===== TIER 1: TEMPLATE FAMILY =====

/**
 * TemplateFamily — A parametric React component with rich controls.
 * One family generates many visual variations through controls.
 *
 * Example: "pricing-cards" family renders 1-4 pricing cards in a row,
 * with optional tabs toggle, text alignment, etc.
 */
export interface TemplateFamily {
    /** Unique family ID: 'hero-split', 'pricing-cards' */
    id: string

    /** Category: 'hero', 'pricing', 'features', etc. */
    category: DesignCategoryId

    /** Display name: 'Split Hero', 'Pricing Cards' */
    name: string

    /** Short description of the layout pattern */
    description: string

    /** Searchable tags */
    tags?: string[]

    /** The parametric Canvas component */
    Canvas: React.FC<CanvasProps>

    /** Controls this family supports (rendered in sidebar) */
    controlsDef: ControlDefinition[]

    /** Default control values (applied when no preset specifies otherwise) */
    defaultControls: Record<string, string | number | boolean>

    /** Default content structure (field names + placeholder values) */
    defaultContent: Record<string, unknown>

    /** Layout metadata */
    hasImage?: boolean
    hasVideo?: boolean
    hasForm?: boolean
}

// ===== TIER 2: DESIGN PRESET =====

/**
 * DesignPreset — A named snapshot of control values for a family.
 * This is what users browse in the sidebar.
 *
 * Example: "Pricing 10" = family:pricing-cards + {tabs:false, plans:2}
 *          "Pricing 20" = family:pricing-cards + {tabs:false, plans:3, textAlign:'left'}
 */
export interface DesignPreset {
    /** Unique preset ID: 'header-1', 'pricing-10' */
    id: string

    /** Which family this belongs to */
    familyId: string

    /** Display name shown in sidebar: 'Header 1', 'Pricing 10' */
    name: string

    /** Short description of this specific variation */
    description: string

    /** Frozen control values that define this preset */
    controls: Record<string, string | number | boolean>

    /** Optional content overrides (if different from family defaults) */
    content?: Record<string, unknown>

    /** Thumbnail component for sidebar (renders at preset's control values) */
    Thumbnail: React.FC
}

/**
 * Props passed to Canvas components
 */
export interface CanvasProps {
    /** Editable content (heading, subheading, etc.) */
    content: Record<string, unknown>
    /** Control values (alignment, columns, etc.) */
    controls: Record<string, unknown>
    /** Current viewport */
    viewport: ViewportDevice
    /** Content change handler (Phase 6 — define now, wire later) */
    onContentChange?: (key: string, value: unknown) => void
    /** Whether inline editing is enabled (Phase 6) */
    editable?: boolean
}

// ===== DEPRECATED: DesignDefinition =====

/**
 * @deprecated Use TemplateFamily + DesignPreset instead.
 * Kept during migration period for backward compatibility.
 */
export interface DesignDefinition {
    id: string
    category: DesignCategoryId
    name: string
    description: string
    tags?: string[]
    Thumbnail: React.FC
    Canvas: React.FC<CanvasProps>
    layout?: string
    hasImage?: boolean
    hasVideo?: boolean
    hasForm?: boolean
    controlsDef?: ControlDefinition[]
    defaultControls?: Record<string, string | number | boolean>
}

/**
 * Category grouping for the sidebar
 */
export interface DesignCategory {
    /** Category key */
    id: DesignCategoryId
    /** Display name */
    name: string
    /** Number of designs in this category */
    count: number
}

/**
 * Simplified variant info for backward compatibility
 * Used by components that don't need full DesignDefinition
 */
export interface ComponentVariant {
    id: string
    sectionType?: string
    variant?: string
    name: string
    description: string
    tags?: string[]
    layout?: string
    hasImage?: boolean
}

/**
 * Layout info for add-section-sidebar
 */
export interface SectionLayout {
    id: string
    name: string
    type?: string
    variant?: string
    description?: string
}
