/**
 * Hero Layout — Type Definitions
 *
 * The 27 hero layouts form a 3×3×3 matrix:
 *   Alignment: left | split | center
 *   Background: dark | neutral | image
 *   Actions: buttons | form | none
 *
 * Sequential numbering 1–27 (Relume headers 44–70 preserved as relumeHeader).
 */

// ============================================
// Hero Configuration Axes
// ============================================

/** Content alignment within the section */
export type HeroAlignment = 'left' | 'split' | 'center'

/** Background treatment */
export type HeroBackground = 'dark' | 'neutral' | 'image'

/** Call-to-action type */
export type HeroActions = 'buttons' | 'form' | 'none'

// ============================================
// Hero Preset Configuration
// ============================================

export interface HeroPresetConfig {
    /** Unique layout ID, e.g. 'hero-1' */
    id: string
    /** Display name, e.g. 'Hero 1' */
    name: string
    /** Relume reference number (for documentation) */
    relumeHeader: number
    /** Content alignment */
    alignment: HeroAlignment
    /** Background style */
    background: HeroBackground
    /** Action type */
    actions: HeroActions
    /** Whether tagline is shown (true when actions !== 'none') */
    hasTagline: boolean
}

// ============================================
// Hero Content (for default block generation)
// ============================================

export interface HeroContent {
    tagline?: string
    heading: string
    description: string
    primaryButtonText?: string
    secondaryButtonText?: string
    inputPlaceholder?: string
    submitButtonText?: string
    termsText?: string
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
    tagline: 'Tagline',
    heading: 'Short heading here',
    description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    primaryButtonText: 'Button',
    secondaryButtonText: 'Button',
    inputPlaceholder: 'Enter your email',
    submitButtonText: 'Sign up',
    termsText:
        "By clicking Sign Up you're confirming that you agree with our Terms and Conditions.",
}
