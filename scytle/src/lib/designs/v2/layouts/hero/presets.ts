/**
 * Hero Presets — All 27 hero layout configurations
 *
 * 3×3×3 matrix:
 *   Alignment: left | split | center
 *   Background: dark | neutral | image
 *   Actions: buttons | form | none
 *
 * Sequential numbering 1–27. Relume reference numbers preserved in relumeHeader.
 */

import type { HeroPresetConfig } from './types'

// ============================================
// Left-aligned, single column (1–9)
// ============================================

export const HERO_1: HeroPresetConfig = {
    id: 'hero-1',
    name: 'Hero 1',
    relumeHeader: 44,
    alignment: 'left',
    background: 'dark',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_2: HeroPresetConfig = {
    id: 'hero-2',
    name: 'Hero 2',
    relumeHeader: 45,
    alignment: 'left',
    background: 'dark',
    actions: 'form',
    hasTagline: true,
}

export const HERO_3: HeroPresetConfig = {
    id: 'hero-3',
    name: 'Hero 3',
    relumeHeader: 46,
    alignment: 'left',
    background: 'dark',
    actions: 'none',
    hasTagline: false,
}

export const HERO_4: HeroPresetConfig = {
    id: 'hero-4',
    name: 'Hero 4',
    relumeHeader: 51,
    alignment: 'left',
    background: 'neutral',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_5: HeroPresetConfig = {
    id: 'hero-5',
    name: 'Hero 5',
    relumeHeader: 53,
    alignment: 'left',
    background: 'neutral',
    actions: 'form',
    hasTagline: true,
}

export const HERO_6: HeroPresetConfig = {
    id: 'hero-6',
    name: 'Hero 6',
    relumeHeader: 55,
    alignment: 'left',
    background: 'neutral',
    actions: 'none',
    hasTagline: false,
}

export const HERO_7: HeroPresetConfig = {
    id: 'hero-7',
    name: 'Hero 7',
    relumeHeader: 50,
    alignment: 'left',
    background: 'image',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_8: HeroPresetConfig = {
    id: 'hero-8',
    name: 'Hero 8',
    relumeHeader: 52,
    alignment: 'left',
    background: 'image',
    actions: 'form',
    hasTagline: true,
}

export const HERO_9: HeroPresetConfig = {
    id: 'hero-9',
    name: 'Hero 9',
    relumeHeader: 54,
    alignment: 'left',
    background: 'image',
    actions: 'none',
    hasTagline: false,
}

// ============================================
// Split two-column (10–18)
// ============================================

export const HERO_10: HeroPresetConfig = {
    id: 'hero-10',
    name: 'Hero 10',
    relumeHeader: 47,
    alignment: 'split',
    background: 'dark',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_11: HeroPresetConfig = {
    id: 'hero-11',
    name: 'Hero 11',
    relumeHeader: 48,
    alignment: 'split',
    background: 'dark',
    actions: 'form',
    hasTagline: true,
}

export const HERO_12: HeroPresetConfig = {
    id: 'hero-12',
    name: 'Hero 12',
    relumeHeader: 49,
    alignment: 'split',
    background: 'dark',
    actions: 'none',
    hasTagline: false,
}

export const HERO_13: HeroPresetConfig = {
    id: 'hero-13',
    name: 'Hero 13',
    relumeHeader: 57,
    alignment: 'split',
    background: 'neutral',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_14: HeroPresetConfig = {
    id: 'hero-14',
    name: 'Hero 14',
    relumeHeader: 59,
    alignment: 'split',
    background: 'neutral',
    actions: 'form',
    hasTagline: true,
}

export const HERO_15: HeroPresetConfig = {
    id: 'hero-15',
    name: 'Hero 15',
    relumeHeader: 61,
    alignment: 'split',
    background: 'neutral',
    actions: 'none',
    hasTagline: false,
}

export const HERO_16: HeroPresetConfig = {
    id: 'hero-16',
    name: 'Hero 16',
    relumeHeader: 56,
    alignment: 'split',
    background: 'image',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_17: HeroPresetConfig = {
    id: 'hero-17',
    name: 'Hero 17',
    relumeHeader: 58,
    alignment: 'split',
    background: 'image',
    actions: 'form',
    hasTagline: true,
}

export const HERO_18: HeroPresetConfig = {
    id: 'hero-18',
    name: 'Hero 18',
    relumeHeader: 60,
    alignment: 'split',
    background: 'image',
    actions: 'none',
    hasTagline: false,
}

// ============================================
// Center-aligned, single column (19–27)
// ============================================

export const HERO_19: HeroPresetConfig = {
    id: 'hero-19',
    name: 'Hero 19',
    relumeHeader: 62,
    alignment: 'center',
    background: 'dark',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_20: HeroPresetConfig = {
    id: 'hero-20',
    name: 'Hero 20',
    relumeHeader: 63,
    alignment: 'center',
    background: 'dark',
    actions: 'form',
    hasTagline: true,
}

export const HERO_21: HeroPresetConfig = {
    id: 'hero-21',
    name: 'Hero 21',
    relumeHeader: 64,
    alignment: 'center',
    background: 'dark',
    actions: 'none',
    hasTagline: false,
}

export const HERO_22: HeroPresetConfig = {
    id: 'hero-22',
    name: 'Hero 22',
    relumeHeader: 66,
    alignment: 'center',
    background: 'neutral',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_23: HeroPresetConfig = {
    id: 'hero-23',
    name: 'Hero 23',
    relumeHeader: 68,
    alignment: 'center',
    background: 'neutral',
    actions: 'form',
    hasTagline: true,
}

export const HERO_24: HeroPresetConfig = {
    id: 'hero-24',
    name: 'Hero 24',
    relumeHeader: 70,
    alignment: 'center',
    background: 'neutral',
    actions: 'none',
    hasTagline: false,
}

export const HERO_25: HeroPresetConfig = {
    id: 'hero-25',
    name: 'Hero 25',
    relumeHeader: 65,
    alignment: 'center',
    background: 'image',
    actions: 'buttons',
    hasTagline: true,
}

export const HERO_26: HeroPresetConfig = {
    id: 'hero-26',
    name: 'Hero 26',
    relumeHeader: 67,
    alignment: 'center',
    background: 'image',
    actions: 'form',
    hasTagline: true,
}

export const HERO_27: HeroPresetConfig = {
    id: 'hero-27',
    name: 'Hero 27',
    relumeHeader: 69,
    alignment: 'center',
    background: 'image',
    actions: 'none',
    hasTagline: false,
}

// ============================================
// All presets in array (ordered 1–27)
// ============================================

export const ALL_HERO_PRESETS: HeroPresetConfig[] = [
    // Left-aligned, single column (1–9)
    HERO_1, HERO_2, HERO_3,
    HERO_4, HERO_5, HERO_6,
    HERO_7, HERO_8, HERO_9,
    // Split two-column (10–18)
    HERO_10, HERO_11, HERO_12,
    HERO_13, HERO_14, HERO_15,
    HERO_16, HERO_17, HERO_18,
    // Center-aligned, single column (19–27)
    HERO_19, HERO_20, HERO_21,
    HERO_22, HERO_23, HERO_24,
    HERO_25, HERO_26, HERO_27,
]

/** Quick lookup by ID */
export const HERO_PRESETS_MAP: Record<string, HeroPresetConfig> = Object.fromEntries(
    ALL_HERO_PRESETS.map((p) => [p.id, p])
)
