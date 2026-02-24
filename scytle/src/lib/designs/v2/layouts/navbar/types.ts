/**
 * Navbar — Unified Type Definitions
 *
 * Single NavbarPresetConfig covers ALL 32 navbar variants.
 * The `shell` + `layout` fields drive the parametric renderer.
 *
 * Shell types:
 *   bar        — Full-width navigation bar (72px)
 *   floating   — Inset bar with border (inside padded wrapper)
 *   two-row    — Top info/links row + main navigation bar
 *
 * Layout types:
 *   standard          — Logo left, links + buttons right
 *   center-links      — Logo left, links center, buttons right
 *   center-logo       — Links left, logo center, buttons right
 *   hamburger         — Logo left, button + menu icon right
 *   hamburger-links   — Logo left, links + button + menu icon right
 */

import type { ImageRole } from '../../tokens'

// ============================================
// Content (shared across all navbar variants)
// ============================================

export interface NavbarContent {
    logoText: string
    links: string[]
    primaryButton: string
    secondaryButton: string
    topRowLinks: string[]
}

export const DEFAULT_CONTENT: NavbarContent = {
    logoText: 'Logo',
    links: ['Link One', 'Link Two', 'Link Three', 'Link Four'],
    primaryButton: 'Button',
    secondaryButton: 'Button',
    topRowLinks: ['Link Five', 'Link Six', 'Link Seven'],
}

// ============================================
// Renderer primitives
// ============================================

/** Section shell type — drives the parametric renderer */
export type NavbarShell =
    | 'bar'        // Full-width navigation bar
    | 'floating'   // Inset bar with border/padding
    | 'two-row'    // Top info row + main navigation bar

/** Content layout inside the bar */
export type NavbarLayout =
    | 'standard'         // Logo left, links + buttons right
    | 'center-links'     // Logo left, links center, buttons right
    | 'center-logo'      // Links left, logo center, buttons right
    | 'hamburger'        // Logo left, button + menu icon right
    | 'hamburger-links'  // Logo left, links + button + menu icon right

// ============================================
// Unified Preset Config
// ============================================

export interface NavbarPresetConfig {
    /** Unique preset ID, e.g. 'navbar-1' */
    id: string
    /** Display name, e.g. 'Navbar 1' */
    name: string
    /** Short description for the picker */
    description: string
    /** Searchable tags */
    tags: string[]

    // ── Family grouping ──
    /** Which family this preset belongs to */
    family: 'a'

    // ── Image / video controls ──
    /** Navbars don't use images */
    imageRole: ImageRole
    /** Navbars don't support video */
    supportsVideo: boolean

    // ── Renderer config ──
    /** Structural shell type */
    shell: NavbarShell
    /** Content layout arrangement */
    layout: NavbarLayout
    /** Number of nav links */
    linkCount: number
    /** Number of action buttons (0, 1, or 2) */
    buttonCount: 0 | 1 | 2

    // ── Control axes (empty — navbars are standalone) ──
    axes: Record<string, string>
}
