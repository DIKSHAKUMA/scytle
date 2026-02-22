/**
 * CTA Family B — Type Definitions
 *
 * Family B covers CTA 13, 14, 15, 16, 17, 18, 21, 22, 61, 62.
 * Layout: Two-column text with optional full-width image below.
 *         Heading in the left column, body + actions in the right column.
 * Axes: Asset (None/Image), Background OR Asset Style, Element (Button/Form)
 *
 * Section variants:
 *   Text-Only (13–18): Just two text columns, bg handled at section-level
 *   Stacked   (21–22): Two text columns + full-width image below (inside container)
 *   Expand    (61–62): Two text columns (padded) + full-bleed image (edge-to-edge)
 */

import type { ImageRole } from '../../tokens'

// ============================================
// Content
// ============================================

export interface CtaBContent {
    heading: string
    body: string
    primaryButton: string
    secondaryButton: string
    inputPlaceholder: string
    submitButton: string
    termsText: string
}

export const DEFAULT_CONTENT_B: CtaBContent = {
    heading: 'Medium length heading goes here',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    primaryButton: 'Button',
    secondaryButton: 'Button',
    inputPlaceholder: 'Enter your email',
    submitButton: 'Sign Up',
    termsText: "By clicking Sign Up you're confirming that you agree with our Terms and Conditions.",
}

// ============================================
// Layout Variants
// ============================================

export type CtaBLayout =
    | 'text-none-button'         // CTA 13
    | 'text-none-form'           // CTA 14
    | 'text-bgimage-button'      // CTA 15
    | 'text-bgimage-form'        // CTA 16
    | 'text-bgvideo-button'      // CTA 17
    | 'text-bgvideo-form'        // CTA 18
    | 'stacked-default-button'   // CTA 21
    | 'stacked-default-form'     // CTA 22
    | 'stacked-expand-button'    // CTA 61
    | 'stacked-expand-form'      // CTA 62

// ============================================
// Preset Config
// ============================================

export interface CtaBPresetConfig {
    id: string
    name: string
    description: string
    layout: CtaBLayout
    tags: string[]
    imageRole: ImageRole
    supportsVideo: boolean
    element: 'button' | 'form'
    /** Section style determines which section component renders this preset */
    sectionStyle: 'text-only' | 'stacked' | 'expand'
    /** Background type — only relevant for text-only variants in design mode */
    background: 'none' | 'image' | 'video'
}
