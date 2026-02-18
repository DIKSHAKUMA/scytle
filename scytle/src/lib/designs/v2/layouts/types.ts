/**
 * V2 Layout System — Type Definitions
 *
 * A Layout is a pre-designed arrangement of V2 Blocks that forms a
 * complete section (hero, features, cta, etc.). Each layout:
 * - Has a unique `id` (e.g. 'hero-44')
 * - Belongs to a `category`
 * - Defines default blocks + arrangement
 * - Reads ALL visual styling from CSS custom properties (--sg-*)
 * - Is fully responsive (desktop → mobile via Tailwind breakpoints)
 */

import type { Block } from '../blocks/types'

// ============================================
// Layout Category
// ============================================

export type LayoutCategory =
    | 'hero'
    | 'navbar'
    | 'footer'
    | 'features'
    | 'cta'
    | 'pricing'
    | 'testimonials'
    | 'faq'
    | 'contact'
    | 'content'
    | 'team'
    | 'blog'
    | 'stats'
    | 'gallery'

// ============================================
// Layout Template
// ============================================

export interface LayoutTemplate {
    /** Unique layout ID, e.g. 'hero-44' */
    id: string
    /** Human-readable name, e.g. 'Header 44' */
    name: string
    /** Section category */
    category: LayoutCategory
    /** Short description of visual arrangement */
    description: string
    /** Relume reference ID for documentation link */
    relumeId?: string
    /** The React component that renders this layout */
    component: React.ComponentType<LayoutProps>
    /** Default blocks for this layout (used when creating a new section) */
    defaultBlocks: () => Block[]
    /** Tags for search/filtering */
    tags?: string[]
    /** Thumbnail component for the component library panel */
    Thumbnail?: React.FC
}

// ============================================
// Layout Props (passed to every layout component)
// ============================================

export interface LayoutProps {
    /** Parent section ID (for selection system integration) */
    sectionId: string
    /** The block data to render (overrides defaults if provided) */
    blocks?: Block[]
    /** Additional CSS classes */
    className?: string
}

// ============================================
// Layout Registry
// ============================================

export type LayoutRegistry = Record<LayoutCategory, LayoutTemplate[]>
