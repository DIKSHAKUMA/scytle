/**
 * Hero Layout — Type Definitions
 *
 * Content types and defaults for hero section layouts.
 * Each preset builds a nested frame block tree from these defaults.
 */

// ============================================
// Hero Content
// ============================================

export interface HeroContent {
    tagline: string
    heading: string
    body: string
    primaryButton: string
    secondaryButton: string
}

export const DEFAULT_CONTENT: HeroContent = {
    tagline: 'Tagline',
    heading: 'Medium length hero headline goes here',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.',
    primaryButton: 'Button',
    secondaryButton: 'Button',
}

// ============================================
// Hero Preset Config
// ============================================

export type HeroAlignment = 'left' | 'split'

export interface HeroPresetConfig {
    /** Unique layout ID, e.g. 'hero-44' */
    id: string
    /** Display name, e.g. 'Header 44' */
    name: string
    /** Description for the component library */
    description: string
    /** Layout alignment */
    alignment: HeroAlignment
    /** Tags for search */
    tags: string[]
}
