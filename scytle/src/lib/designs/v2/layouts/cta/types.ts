/**
 * CTA Family A — Type Definitions
 *
 * Family A covers CTA 1, 2, 39, 40, 59, 60.
 * Layout: Side-by-side text + inline image.
 * Axes: Style (Normal/Card), Asset Style (Default/Expand), Element (Button/Form)
 */

import type { ImageRole } from '../../tokens'

// ============================================
// Content
// ============================================

export interface CtaContent {
    heading: string
    body: string
    primaryButton: string
    secondaryButton: string
    inputPlaceholder: string
    submitButton: string
    termsText: string
}

export const DEFAULT_CONTENT: CtaContent = {
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

export type CtaLayout =
    | 'normal-button'    // CTA 1
    | 'normal-form'      // CTA 2
    | 'card-button'      // CTA 39
    | 'card-form'        // CTA 40
    | 'expand-button'    // CTA 59
    | 'expand-form'      // CTA 60

// ============================================
// Preset Config
// ============================================

export interface CtaPresetConfig {
    id: string
    name: string
    description: string
    layout: CtaLayout
    tags: string[]
    imageRole: ImageRole
    supportsVideo: boolean
    element: 'button' | 'form'
    style: 'normal' | 'card' | 'expand'
}
