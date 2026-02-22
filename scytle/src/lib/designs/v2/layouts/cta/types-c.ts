/**
 * CTA Family C — Type Definitions
 *
 * Family C covers CTA 3–6, 19–20, 25–32, 41–44, 51–56, 65.
 * The most complex CTA family with 25 variants.
 *
 * Layout: Single-column text (heading + body + actions) with various
 *         combinations of alignment, background, card style, and image placement.
 *
 * Axes: Text (Left/Center), Style (Normal/Card), Background (None/Image/Video),
 *       Element (Button/Form), Asset (None/Image), Asset Style (Default/Expand)
 *
 * Section variants:
 *   Left Normal    (19–20, 3–6):  Left-aligned text, optional section bg
 *   Left Card      (41–44):       Left-aligned text inside a card, bg inside card
 *   Center Normal  (25–30):       Center-aligned text, optional section bg
 *   Center Card    (51–56):       Center-aligned text inside a card, optional bg
 *   Center Stacked (31–32):       Center text + full-width image below (in container)
 *   Center Expand  (65):          Center text (padded) + full-bleed image below
 */

import type { ImageRole } from '../../tokens'

// ============================================
// Content
// ============================================

export interface CtaCContent {
    heading: string
    body: string
    primaryButton: string
    secondaryButton: string
    inputPlaceholder: string
    submitButton: string
    termsText: string
}

export const DEFAULT_CONTENT_C: CtaCContent = {
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

export type CtaCLayout =
    // Text=Left, Normal
    | 'left-normal-none-button'       // CTA 19
    | 'left-normal-none-form'         // CTA 20
    | 'left-normal-image-button'      // CTA 3
    | 'left-normal-image-form'        // CTA 4
    | 'left-normal-video-button'      // CTA 5
    | 'left-normal-video-form'        // CTA 6
    // Text=Left, Card
    | 'left-card-image-button'        // CTA 41
    | 'left-card-image-form'          // CTA 42
    | 'left-card-video-button'        // CTA 43
    | 'left-card-video-form'          // CTA 44
    // Text=Center, Normal
    | 'center-normal-none-button'     // CTA 25
    | 'center-normal-none-form'       // CTA 26
    | 'center-normal-image-button'    // CTA 27
    | 'center-normal-image-form'      // CTA 28
    | 'center-normal-video-button'    // CTA 29
    | 'center-normal-video-form'      // CTA 30
    // Text=Center, Card
    | 'center-card-none-button'       // CTA 51
    | 'center-card-none-form'         // CTA 52
    | 'center-card-image-button'      // CTA 53
    | 'center-card-image-form'        // CTA 54
    | 'center-card-video-button'      // CTA 55
    | 'center-card-video-form'        // CTA 56
    // Text=Center, Asset=Image
    | 'center-stacked-default-button' // CTA 31
    | 'center-stacked-default-form'   // CTA 32
    | 'center-expand-button'          // CTA 65

// ============================================
// Preset Config
// ============================================

export interface CtaCPresetConfig {
    id: string
    name: string
    description: string
    layout: CtaCLayout
    tags: string[]
    imageRole: ImageRole
    supportsVideo: boolean
    element: 'button' | 'form'
    /** Text alignment */
    textAlignment: 'left' | 'center'
    /** Visual style */
    style: 'normal' | 'card'
    /** Background type */
    background: 'none' | 'image' | 'video'
    /** Asset presence (for Center+Asset=Image path) */
    asset: 'none' | 'image'
    /** Asset style (for Center+Asset=Image path) */
    assetStyle: 'default' | 'expand'
    /** Section structure group — determines which renderer to use */
    sectionGroup: 'left-normal' | 'left-card' | 'center-normal' | 'center-card' | 'center-stacked' | 'center-expand'
}
