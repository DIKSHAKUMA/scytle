/**
 * Hero Header — Presets Aggregator
 *
 * Merges all 6 families into unified collections.
 * 48 total presets across families A–F.
 */

import type { Block } from '../../../blocks/types'
import type { HeroHeaderPresetConfig } from '../types'

// ── Family imports ──────────────────────────────────────────

import {
    FAMILY_A_PRESETS, FAMILY_A_PRESETS_MAP, FAMILY_A_BLOCK_FACTORIES,
} from './family-a'
import {
    FAMILY_B_PRESETS, FAMILY_B_PRESETS_MAP, FAMILY_B_BLOCK_FACTORIES,
} from './family-b'
import {
    FAMILY_C_PRESETS, FAMILY_C_PRESETS_MAP, FAMILY_C_BLOCK_FACTORIES,
} from './family-c'
import {
    FAMILY_D_PRESETS, FAMILY_D_PRESETS_MAP, FAMILY_D_BLOCK_FACTORIES,
} from './family-d'
import {
    FAMILY_E_PRESETS, FAMILY_E_PRESETS_MAP, FAMILY_E_BLOCK_FACTORIES,
} from './family-e'
import {
    FAMILY_F_PRESETS, FAMILY_F_PRESETS_MAP, FAMILY_F_BLOCK_FACTORIES,
} from './family-f'

// ============================================
// Unified aggregated exports
// ============================================

/** All 48 hero-header presets across all families */
export const ALL_HERO_HEADER_PRESETS: HeroHeaderPresetConfig[] = [
    ...FAMILY_A_PRESETS,
    ...FAMILY_B_PRESETS,
    ...FAMILY_C_PRESETS,
    ...FAMILY_D_PRESETS,
    ...FAMILY_E_PRESETS,
    ...FAMILY_F_PRESETS,
]

/** Quick lookup by preset ID (e.g. 'hero-header-1') */
export const HERO_HEADER_PRESETS_MAP: Record<string, HeroHeaderPresetConfig> = {
    ...FAMILY_A_PRESETS_MAP,
    ...FAMILY_B_PRESETS_MAP,
    ...FAMILY_C_PRESETS_MAP,
    ...FAMILY_D_PRESETS_MAP,
    ...FAMILY_E_PRESETS_MAP,
    ...FAMILY_F_PRESETS_MAP,
}

/** Block factories by preset ID */
export const HERO_HEADER_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    ...FAMILY_A_BLOCK_FACTORIES,
    ...FAMILY_B_BLOCK_FACTORIES,
    ...FAMILY_C_BLOCK_FACTORIES,
    ...FAMILY_D_BLOCK_FACTORIES,
    ...FAMILY_E_BLOCK_FACTORIES,
    ...FAMILY_F_BLOCK_FACTORIES,
}

// ── Per-family re-exports (for controls.ts) ─────────────────

export {
    FAMILY_A_PRESETS, FAMILY_A_PRESETS_MAP, FAMILY_A_BLOCK_FACTORIES,
} from './family-a'
export {
    FAMILY_B_PRESETS, FAMILY_B_PRESETS_MAP, FAMILY_B_BLOCK_FACTORIES,
} from './family-b'
export {
    FAMILY_C_PRESETS, FAMILY_C_PRESETS_MAP, FAMILY_C_BLOCK_FACTORIES,
} from './family-c'
export {
    FAMILY_D_PRESETS, FAMILY_D_PRESETS_MAP, FAMILY_D_BLOCK_FACTORIES,
} from './family-d'
export {
    FAMILY_E_PRESETS, FAMILY_E_PRESETS_MAP, FAMILY_E_BLOCK_FACTORIES,
} from './family-e'
export {
    FAMILY_F_PRESETS, FAMILY_F_PRESETS_MAP, FAMILY_F_BLOCK_FACTORIES,
} from './family-f'
