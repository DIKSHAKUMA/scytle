/**
 * FAQ Presets — Aggregated Exports
 *
 * Merges all family presets, preset maps, and block factories
 * into single unified collections. Families A–F.
 */

import type { FaqPresetConfig } from '../types'
import type { Block } from '../../../blocks/types'
import { FAMILY_A_PRESETS, FAMILY_A_PRESETS_MAP, FAMILY_A_BLOCK_FACTORIES } from './family-a'
import { FAMILY_B_PRESETS, FAMILY_B_PRESETS_MAP, FAMILY_B_BLOCK_FACTORIES } from './family-b'
import { FAMILY_C_PRESETS, FAMILY_C_PRESETS_MAP, FAMILY_C_BLOCK_FACTORIES } from './family-c'
import { FAMILY_D_PRESETS, FAMILY_D_PRESETS_MAP, FAMILY_D_BLOCK_FACTORIES } from './family-d'
import { FAMILY_E_PRESETS, FAMILY_E_PRESETS_MAP, FAMILY_E_BLOCK_FACTORIES } from './family-e'
import { FAMILY_F_PRESETS, FAMILY_F_PRESETS_MAP, FAMILY_F_BLOCK_FACTORIES } from './family-f'

// ── All presets (flat) ──────────────────────────────────────────

export const ALL_FAQ_PRESETS: FaqPresetConfig[] = [
    ...FAMILY_A_PRESETS,
    ...FAMILY_B_PRESETS,
    ...FAMILY_C_PRESETS,
    ...FAMILY_D_PRESETS,
    ...FAMILY_E_PRESETS,
    ...FAMILY_F_PRESETS,
]

// ── Unified lookup map ──────────────────────────────────────────

export const FAQ_PRESETS_MAP: Record<string, FaqPresetConfig> = {
    ...FAMILY_A_PRESETS_MAP,
    ...FAMILY_B_PRESETS_MAP,
    ...FAMILY_C_PRESETS_MAP,
    ...FAMILY_D_PRESETS_MAP,
    ...FAMILY_E_PRESETS_MAP,
    ...FAMILY_F_PRESETS_MAP,
}

// ── Unified block factories ─────────────────────────────────────

export const FAQ_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    ...FAMILY_A_BLOCK_FACTORIES,
    ...FAMILY_B_BLOCK_FACTORIES,
    ...FAMILY_C_BLOCK_FACTORIES,
    ...FAMILY_D_BLOCK_FACTORIES,
    ...FAMILY_E_BLOCK_FACTORIES,
    ...FAMILY_F_BLOCK_FACTORIES,
}

// ── Per-family re-exports (for controls.ts extract/resolve) ─────

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
