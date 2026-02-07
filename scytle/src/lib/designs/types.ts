/**
 * Design System Types
 * 
 * Central type definitions for the Scytle design system.
 * Each design is self-contained with its thumbnail and canvas components.
 */

import type { ReactNode } from 'react'

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

/**
 * DesignDefinition - The core interface for a section design
 * 
 * Each design file exports one of these, containing everything
 * needed to render the design in sidebars and on canvas.
 */
export interface DesignDefinition {
    /** Unique identifier: 'hero-split', 'features-grid', etc. */
    id: string

    /** Category key: 'hero', 'features', 'testimonials', etc. */
    category: DesignCategoryId

    /** Display name: 'Header 1', 'Feature 2', etc. */
    name: string

    /** Short description: 'Text left, image right' */
    description: string

    /** Searchable tags: ['split', 'image', 'classic'] */
    tags?: string[]

    /** 
     * Thumbnail component for sidebar previews
     * Renders a scaled-down preview of the design
     */
    Thumbnail: React.FC

    /** 
     * Canvas component for the main wireframe
     * Renders the full-size design with editable content
     */
    Canvas: React.FC<CanvasProps>

    // Optional metadata for filtering
    /** Layout pattern */
    layout?: string
    /** Contains image placeholders */
    hasImage?: boolean
    /** Contains video placeholders */
    hasVideo?: boolean
    /** Contains form elements */
    hasForm?: boolean
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
    viewport: 'desktop' | 'mobile'
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
