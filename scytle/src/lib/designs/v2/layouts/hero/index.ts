/**
 * Hero Layouts — Barrel export
 *
 * Exports all 27 hero layout components, preset configs, types,
 * and the hero layout template registry.
 */

// Types
export type {
    HeroAlignment,
    HeroBackground,
    HeroActions,
    HeroPresetConfig,
    HeroContent,
} from './types'
export { DEFAULT_HERO_CONTENT } from './types'

// Core composable component
export { HeroSection } from './hero-section'
export type { HeroSectionProps } from './hero-section'

// Thumbnails
export { HeroThumbnail, createHeroThumbnail } from './hero-thumbnails'

// Preset configs
export {
    HERO_1,
    HERO_2,
    HERO_3,
    HERO_4,
    HERO_5,
    HERO_6,
    HERO_7,
    HERO_8,
    HERO_9,
    HERO_10,
    HERO_11,
    HERO_12,
    HERO_13,
    HERO_14,
    HERO_15,
    HERO_16,
    HERO_17,
    HERO_18,
    HERO_19,
    HERO_20,
    HERO_21,
    HERO_22,
    HERO_23,
    HERO_24,
    HERO_25,
    HERO_26,
    HERO_27,
    ALL_HERO_PRESETS,
    HERO_PRESETS_MAP,
} from './presets'

// 27 named layout components
export {
    Hero1,
    Hero2,
    Hero3,
    Hero4,
    Hero5,
    Hero6,
    Hero7,
    Hero8,
    Hero9,
    Hero10,
    Hero11,
    Hero12,
    Hero13,
    Hero14,
    Hero15,
    Hero16,
    Hero17,
    Hero18,
    Hero19,
    Hero20,
    Hero21,
    Hero22,
    Hero23,
    Hero24,
    Hero25,
    Hero26,
    Hero27,
} from './hero-layouts'

// ============================================
// Hero Layout Templates (for registry)
// ============================================

import type { LayoutTemplate } from '../types'
import { createHeroThumbnail } from './hero-thumbnails'
import {
    Hero1,
    Hero2,
    Hero3,
    Hero4,
    Hero5,
    Hero6,
    Hero7,
    Hero8,
    Hero9,
    Hero10,
    Hero11,
    Hero12,
    Hero13,
    Hero14,
    Hero15,
    Hero16,
    Hero17,
    Hero18,
    Hero19,
    Hero20,
    Hero21,
    Hero22,
    Hero23,
    Hero24,
    Hero25,
    Hero26,
    Hero27,
} from './hero-layouts'
import { ALL_HERO_PRESETS } from './presets'

/** Map preset config → component */
const HERO_COMPONENTS: Record<string, React.ComponentType<{ sectionId: string; className?: string }>> = {
    'hero-1': Hero1,
    'hero-2': Hero2,
    'hero-3': Hero3,
    'hero-4': Hero4,
    'hero-5': Hero5,
    'hero-6': Hero6,
    'hero-7': Hero7,
    'hero-8': Hero8,
    'hero-9': Hero9,
    'hero-10': Hero10,
    'hero-11': Hero11,
    'hero-12': Hero12,
    'hero-13': Hero13,
    'hero-14': Hero14,
    'hero-15': Hero15,
    'hero-16': Hero16,
    'hero-17': Hero17,
    'hero-18': Hero18,
    'hero-19': Hero19,
    'hero-20': Hero20,
    'hero-21': Hero21,
    'hero-22': Hero22,
    'hero-23': Hero23,
    'hero-24': Hero24,
    'hero-25': Hero25,
    'hero-26': Hero26,
    'hero-27': Hero27,
}

function getDescription(alignment: string, background: string, actions: string): string {
    const a = alignment === 'left' ? 'Left-aligned' : alignment === 'split' ? 'Split two-column' : 'Center-aligned'
    const b = background === 'dark' ? 'dark background' : background === 'neutral' ? 'neutral background' : 'background image'
    const c = actions === 'buttons' ? 'two buttons' : actions === 'form' ? 'email form' : 'text only'
    return `${a}, ${b}, ${c}`
}

function getTags(alignment: string, background: string, actions: string): string[] {
    return ['hero', alignment, background, actions]
}

/** All 27 hero LayoutTemplates, ready for the registry */
export const HERO_LAYOUT_TEMPLATES: LayoutTemplate[] = ALL_HERO_PRESETS.map((preset) => ({
    id: preset.id,
    name: preset.name,
    category: 'hero' as const,
    description: getDescription(preset.alignment, preset.background, preset.actions),
    relumeId: `header-${preset.relumeHeader}`,
    component: HERO_COMPONENTS[preset.id],
    defaultBlocks: () => [],
    tags: getTags(preset.alignment, preset.background, preset.actions),
    Thumbnail: createHeroThumbnail(preset),
}))

/** Quick lookup by layout ID */
export const HERO_TEMPLATES_MAP: Record<string, LayoutTemplate> = Object.fromEntries(
    HERO_LAYOUT_TEMPLATES.map((t) => [t.id, t])
)
