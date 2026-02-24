/**
 * Navbar Presets — Aggregated Exports
 *
 * Merges all family presets, preset maps, and block factories.
 * Currently single family (A) covering all 32 variants.
 */

import type { NavbarPresetConfig } from '../types'
import type { Block } from '../../../blocks/types'
import { FAMILY_A_PRESETS, FAMILY_A_PRESETS_MAP, FAMILY_A_BLOCK_FACTORIES } from './family-a'

// ── All presets (flat) ──────────────────────────────────────────

export const ALL_NAVBAR_PRESETS: NavbarPresetConfig[] = [
    ...FAMILY_A_PRESETS,
]

// ── Unified lookup map ──────────────────────────────────────────

export const NAVBAR_PRESETS_MAP: Record<string, NavbarPresetConfig> = {
    ...FAMILY_A_PRESETS_MAP,
}

// ── Unified block factories ─────────────────────────────────────

export const NAVBAR_BLOCK_FACTORIES: Record<string, () => Block[]> = {
    ...FAMILY_A_BLOCK_FACTORIES,
}

// ── Per-family re-exports ───────────────────────────────────────

export {
    FAMILY_A_PRESETS, FAMILY_A_PRESETS_MAP, FAMILY_A_BLOCK_FACTORIES,
} from './family-a'
