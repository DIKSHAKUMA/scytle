/**
 * Hero Header — Unified Type Definitions
 *
 * Single HeroHeaderPresetConfig covers ALL families (A–F, 48 variants).
 * The `shell` + `align` + `background` fields drive the parametric renderer.
 * The `axes` record holds opaque control-system values per family.
 *
 * Family A (16) — Split hero: text + inline image/video, left/right placement
 * Family B (8)  — Full-background hero: centered text over bg image/video
 * Family C (4)  — Stacked: image on top, two-column text below
 * Family D (4)  — Split with extended content: text + description left, media right
 * Family E (4)  — Split hero variant: text + media side-by-side
 * Family F (12) — Centered hero: optional background, optional card
 */

import type { ImageRole } from '../../tokens'

// ============================================
// Content (shared across all families)
// ============================================

export interface HeroHeaderContent {
    tagline: string
    heading: string
    body: string
    primaryButton: string
    secondaryButton: string
    inputPlaceholder: string
    submitButton: string
    termsText: string
}

export const DEFAULT_CONTENT: HeroHeaderContent = {
    tagline: 'Tagline',
    heading: 'Medium length hero headline goes here',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
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
    | 'card'           // section → container → bordered card → blocks
    | 'card-bg'        // section → container → card + bg layer inside → blocks

/** Content alignment inside the container */
export type ContentAlign = 'left' | 'center'

// ============================================
// Unified Preset Config
// ============================================

export interface HeroHeaderPresetConfig {
    /** Unique preset ID, e.g. 'hero-header-1' */
    id: string
    /** Display name, e.g. 'Hero Header 1' */
    name: string
    /** Short description for the picker */
    description: string
    /** Searchable tags */
    tags: string[]

    // ── Family grouping ──
    /** Which family this preset belongs to */
    family: 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

    // ── Image / video controls ──
    /** How images are used: 'inline' | 'background' | 'none' */
    imageRole: ImageRole
    /** Whether this preset supports video */
    supportsVideo: boolean

    // ── Renderer config (drives section-shell.tsx) ──
    /** Structural shell type */
    shell: SectionShell
    /** Content alignment */
    align: ContentAlign
    /** Background type */
    background: 'none' | 'image' | 'video'
    /** Max-width constraint on content inside card (px) */
    contentMaxWidth?: number

    // ── Control axes (opaque to renderer, used by controls.ts) ──
    /** Family-specific axis values for the control system */
    axes: Record<string, string>
}
