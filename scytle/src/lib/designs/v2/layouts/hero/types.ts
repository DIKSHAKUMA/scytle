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

/** Layout style discriminator across all hero presets */
export type HeroLayout =
    | 'minimal'       // hero-44: Left-aligned single column, no media
    | 'split-text'    // hero-57: Split two-column, text both sides
    | 'split-image'   // hero-1:  Split, text left + image right
    | 'split-video'   // hero-3:  Split, text left + video right
    | 'bg-image'      // hero-5:  Full background image with overlay

export interface HeroPresetConfig {
    /** Unique layout ID, e.g. 'hero-44' */
    id: string
    /** Display name, e.g. 'Header 44' */
    name: string
    /** Description for the component library */
    description: string
    /** Layout style variant */
    layout: HeroLayout
    /** Tags for search */
    tags: string[]
    /** What kind of image this layout uses */
    imageRole: import('@/lib/designs/v2/tokens').ImageRole
    /** Whether this layout supports video variant */
    supportsVideo: boolean
}
