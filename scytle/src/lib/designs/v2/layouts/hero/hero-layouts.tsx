/**
 * Hero Layout Components — 27 wrapper components
 *
 * Each function generates a bound HeroSection component for a specific preset.
 * These are the actual components registered in the layout registry.
 */

'use client'

import { HeroSection } from './hero-section'
import type { HeroSectionProps } from './hero-section'
import type { HeroPresetConfig } from './types'
import {
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
} from './presets'

// ============================================
// Factory to create a preset-bound component
// ============================================

type HeroComponentProps = Omit<HeroSectionProps, 'alignment' | 'background' | 'actions'>

function createHeroComponent(preset: HeroPresetConfig) {
    function HeroComponent(props: HeroComponentProps) {
        return (
            <HeroSection
                {...props}
                alignment={preset.alignment}
                background={preset.background}
                actions={preset.actions}
            />
        )
    }
    HeroComponent.displayName = preset.name.replace(' ', '')
    return HeroComponent
}

// ============================================
// Left-aligned, single column
// ============================================

/** Left + Dark + Buttons */
export const Hero1 = createHeroComponent(HERO_1)

/** Left + Dark + Form */
export const Hero2 = createHeroComponent(HERO_2)

/** Left + Dark + None */
export const Hero3 = createHeroComponent(HERO_3)

/** Left + Neutral + Buttons */
export const Hero4 = createHeroComponent(HERO_4)

/** Left + Neutral + Form */
export const Hero5 = createHeroComponent(HERO_5)

/** Left + Neutral + None */
export const Hero6 = createHeroComponent(HERO_6)

/** Left + Image + Buttons */
export const Hero7 = createHeroComponent(HERO_7)

/** Left + Image + Form */
export const Hero8 = createHeroComponent(HERO_8)

/** Left + Image + None */
export const Hero9 = createHeroComponent(HERO_9)

// ============================================
// Split two-column
// ============================================

/** Split + Dark + Buttons */
export const Hero10 = createHeroComponent(HERO_10)

/** Split + Dark + Form */
export const Hero11 = createHeroComponent(HERO_11)

/** Split + Dark + None */
export const Hero12 = createHeroComponent(HERO_12)

/** Split + Neutral + Buttons */
export const Hero13 = createHeroComponent(HERO_13)

/** Split + Neutral + Form */
export const Hero14 = createHeroComponent(HERO_14)

/** Split + Neutral + None */
export const Hero15 = createHeroComponent(HERO_15)

/** Split + Image + Buttons */
export const Hero16 = createHeroComponent(HERO_16)

/** Split + Image + Form */
export const Hero17 = createHeroComponent(HERO_17)

/** Split + Image + None */
export const Hero18 = createHeroComponent(HERO_18)

// ============================================
// Center-aligned, single column
// ============================================

/** Center + Dark + Buttons */
export const Hero19 = createHeroComponent(HERO_19)

/** Center + Dark + Form */
export const Hero20 = createHeroComponent(HERO_20)

/** Center + Dark + None */
export const Hero21 = createHeroComponent(HERO_21)

/** Center + Neutral + Buttons */
export const Hero22 = createHeroComponent(HERO_22)

/** Center + Neutral + Form */
export const Hero23 = createHeroComponent(HERO_23)

/** Center + Neutral + None */
export const Hero24 = createHeroComponent(HERO_24)

/** Center + Image + Buttons */
export const Hero25 = createHeroComponent(HERO_25)

/** Center + Image + Form */
export const Hero26 = createHeroComponent(HERO_26)

/** Center + Image + None */
export const Hero27 = createHeroComponent(HERO_27)
