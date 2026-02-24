/**
 * Footer — Unified Type Definitions
 *
 * Single FooterPresetConfig covers ALL footer families (A–E).
 * The `shell` field drives container vs card rendering.
 *
 * Family A — Newsletter left + 3 columns with Follow Us social (2 variants)
 *   Footer 1 (Normal) ↔ Footer 11 (Card)
 *
 * Family B — Logo + 3 titled columns + Newsletter right (2 variants)
 *   Footer 3 (Normal) ↔ Footer 10 (Card)
 *
 * Family C — Contact info left + 2 headingless link lists (2 variants)
 *   Footer 6 (Normal) ↔ Footer 12 (Card)
 *
 * Family D — CTA heading + buttons + 2 headingless link lists (2 variants)
 *   Footer 9 (Normal) ↔ Footer 15 (Card)
 *
 * Family E — Standalone variants, no axes (9 variants)
 *   Footer 2, 4, 5, 7, 8, 13, 14, 16, 17
 */

// ============================================
// Content (shared across all footer families)
// ============================================

export interface FooterContent {
    /** Newsletter description / company tagline */
    description: string
    /** Column heading titles */
    columnOneTitle: string
    columnTwoTitle: string
    columnThreeTitle: string
    /** Link text template */
    linkText: string
    /** Newsletter section */
    subscribeHeading: string
    subscribeBody: string
    privacyText: string
    inputPlaceholder: string
    buttonText: string
    /** Bottom bar */
    copyrightText: string
    /** CTA section (for Family D / Footer 14) */
    ctaHeading: string
    ctaBody: string
    /** Contact info (for Family C / Footer 16) */
    addressText: string
    phoneText: string
    emailText: string
}

export const DEFAULT_CONTENT: FooterContent = {
    description:
        'Join our newsletter to stay up to date on features and releases.',
    columnOneTitle: 'Column One',
    columnTwoTitle: 'Column Two',
    columnThreeTitle: 'Column Three',
    linkText: 'Link',
    subscribeHeading: 'Subscribe',
    subscribeBody:
        'Join our newsletter to stay up to date on features and releases.',
    privacyText:
        'By subscribing you agree to with our Privacy Policy and provide consent to receive updates from our company.',
    inputPlaceholder: 'Enter your email',
    buttonText: 'Subscribe',
    copyrightText: '© 2024 Company. All rights reserved.',
    ctaHeading: 'Join our community',
    ctaBody: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    addressText: '123 Sample St, Sydney NSW 2000 AU',
    phoneText: '+1 (555) 000-0000',
    emailText: 'hello@company.com',
}

// ============================================
// Shell type (Normal vs Card)
// ============================================

/** Container shell determines how the section wraps content */
export type FooterShell = 'container' | 'card'

// ============================================
// Unified Preset Config
// ============================================

export interface FooterPresetConfig {
    /** Unique preset ID, e.g. 'footer-1' */
    id: string
    /** Display name, e.g. 'Footer 1' */
    name: string
    /** Short description for the picker */
    description: string
    /** Searchable tags */
    tags: string[]

    // ── Family grouping ──
    /** Which family this preset belongs to */
    family: 'a' | 'b' | 'c' | 'd' | 'e'

    // ── Renderer config ──
    /** Container shell type */
    shell: FooterShell

    // ── Control axes (opaque to renderer, used by controls.ts) ──
    /** Family-specific axis values for the control system */
    axes: Record<string, string>
}
