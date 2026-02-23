/**
 * Header — Unified Type Definitions
 *
 * Single HeaderPresetConfig covers ALL header families (A, B, C, D).
 * The `shell` + `align` + `background` fields drive the parametric renderer.
 * The `axes` record holds opaque control-system values per family.
 *
 * Family A — Simple Header (18 variants): full-width banner with
 *   optional bg media, left/center alignment, button/form/none element.
 */

import type { ImageRole } from '../../tokens'

// ============================================
// Content (shared across all header families)
// ============================================

export interface HeaderContent {
    tagline: string
    heading: string
    body: string
    primaryButton: string
    secondaryButton: string
    inputPlaceholder: string
    submitButton: string
    termsText: string
}

export const DEFAULT_CONTENT: HeaderContent = {
    tagline: 'Tagline',
    heading: 'Short heading here',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    primaryButton: 'Button',
    secondaryButton: 'Button',
    inputPlaceholder: 'Enter your email',
    submitButton: 'Sign Up',
    termsText: "By clicking Sign Up you're confirming that you agree with our Terms and Conditions.",
}

// ============================================
// Renderer primitives
// ============================================

/** Section shell type — drives the parametric renderer */
export type SectionShell =
    | 'container'      // section → container → blocks
    | 'bg-container'   // section + bg layer (with dark overlay) → container → blocks
    | 'card'           // section → container → bordered card (foreground bg) → blocks
    | 'card-bg'        // section → container → card + bg layer (inside card) → blocks

/** Content alignment inside the container */
export type ContentAlign = 'left' | 'center'

// ============================================
// Unified Preset Config
// ============================================

export interface HeaderPresetConfig {
    /** Unique preset ID, e.g. 'header-44' */
    id: string
    /** Display name, e.g. 'Header 44' */
    name: string
    /** Short description for the picker */
    description: string
    /** Searchable tags */
    tags: string[]

    // ── Family grouping ──
    /** Which family this preset belongs to */
    family: 'a' | 'b' | 'c' | 'd'

    // ── Image / video controls ──
    /** How images are used: 'background' | 'none' */
    imageRole: ImageRole
    /** Whether this preset supports background video */
    supportsVideo: boolean

    // ── Renderer config (drives section-shell.tsx) ──
    /** Structural shell type */
    shell: SectionShell
    /** Content alignment */
    align: ContentAlign
    /** Background type */
    background: 'none' | 'image' | 'video'

    // ── Control axes (opaque to renderer, used by controls.ts) ──
    /** Family-specific axis values for the control system */
    axes: Record<string, string>
}
