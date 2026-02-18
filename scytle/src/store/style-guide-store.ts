/**
 * Style Guide Store — Design Token State + Concepts
 *
 * Single source of truth for all visual decisions in the wireframe.
 * Manages color tokens, typography, UI styling, concepts, and
 * per-section color scheme overrides.
 *
 * Architecture:
 *   useStyleGuideStore
 *       → activeConcept (Concept)
 *       → computedCSS (CSSTokenMap)  ← memoized CSS custom property object
 *       → applied by <TokenProvider> to canvas wrapper div
 *
 * Pattern: Zustand + immer + subscribeWithSelector
 * (matches unified-store.ts)
 */

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { subscribeWithSelector } from 'zustand/middleware'

import type {
    Concept,
    StyleGuideData,
    ColorTokens,
    TypographyTokens,
    UITokens,
    ColorScheme,
    CSSTokenMap,
    AccentColor,
    HeadingWeight,
    BodyWeight,
    SizeScale,
    LetterSpacingStyle,
    ButtonStyle,
    CardStyle,
    RadiusPreset,
} from '@/lib/designs/v2/tokens'

import {
    createDefaultStyleGuideData,
    createDefaultConcept,
    computeTokenCSS,
    computeSchemeOverrideCSS,
} from '@/lib/designs/v2/tokens/defaults'

import {
    type ColorPalette,
    getRandomPalette,
    getRandomPaletteExcluding,
} from '@/lib/designs/v2/tokens/palettes'

import {
    type FontPair,
    getRandomFontPair,
    getRandomFontPairExcluding,
    loadGoogleFonts,
} from '@/lib/designs/v2/tokens/font-pairs'

import { generateId } from '@/lib/utils'

// ============================================
// Store State Interface
// ============================================

interface StyleGuideState {
    // ---- Core Data ----
    /** Full style guide data (persisted to Appwrite) */
    data: StyleGuideData

    /** Currently active palette ID (for shuffle-excluding logic) */
    activePaletteId: string | null
    /** Currently active font pair ID (for shuffle-excluding logic) */
    activeFontPairId: string | null

    // ---- Computed (derived from data) ----
    /** Memoized CSS custom property map for the active concept */
    computedCSS: CSSTokenMap

    // ---- Actions: Data Lifecycle ----

    /** Load style guide data (e.g. from Appwrite on project open) */
    loadData: (data: StyleGuideData) => void
    /** Reset to factory defaults */
    resetToDefaults: () => void
    /** Export current data for persistence */
    exportData: () => StyleGuideData

    // ---- Actions: Concept Management ----

    /** Get the active concept */
    getActiveConcept: () => Concept
    /** Switch to a different concept by ID */
    switchConcept: (conceptId: string) => void
    /** Create a new concept (clones the active one) */
    createConcept: (name?: string) => string
    /** Duplicate an existing concept */
    duplicateConcept: (conceptId: string) => string
    /** Delete a concept (cannot delete last one) */
    deleteConcept: (conceptId: string) => void
    /** Rename a concept */
    renameConcept: (conceptId: string, name: string) => void

    // ---- Actions: Color Tokens ----

    /** Toggle light/dark mode */
    toggleMode: () => void
    /** Set mode explicitly */
    setMode: (mode: 'light' | 'dark') => void
    /** Apply a color palette (from palette library) */
    applyPalette: (palette: ColorPalette) => void
    /** Shuffle to a random palette */
    shuffleColors: () => void
    /** Update a specific accent color */
    updateAccent: (accentId: string, updates: Partial<AccentColor>) => void
    /** Add a new accent color */
    addAccent: (name: string, hex: string) => void
    /** Remove an accent color (must keep at least 1) */
    removeAccent: (accentId: string) => void
    /** Set which accent is the main one */
    setMainAccent: (accentId: string) => void

    // ---- Actions: Typography Tokens ----

    /** Apply a font pair (from font pair library) */
    applyFontPair: (pair: FontPair) => void
    /** Shuffle to a random font pair */
    shuffleTypography: () => void
    /** Set heading font family */
    setHeadingFont: (font: string) => void
    /** Set body font family */
    setBodyFont: (font: string) => void
    /** Set heading weight */
    setHeadingWeight: (weight: HeadingWeight) => void
    /** Set body weight */
    setBodyWeight: (weight: BodyWeight) => void
    /** Set size scale */
    setSizeScale: (scale: SizeScale) => void
    /** Set letter spacing style */
    setLetterSpacingStyle: (style: LetterSpacingStyle) => void

    // ---- Actions: UI Tokens ----

    /** Set button style */
    setButtonStyle: (style: ButtonStyle) => void
    /** Set button radius */
    setButtonRadius: (radius: RadiusPreset) => void
    /** Set card style */
    setCardStyle: (style: CardStyle) => void
    /** Set card radius */
    setCardRadius: (radius: RadiusPreset) => void
    /** Set image radius */
    setImageRadius: (radius: RadiusPreset) => void
    /** Shuffle all UI styling (random button+card style+radius) */
    shuffleUI: () => void

    // ---- Actions: Section Scheme Overrides ----

    /** Set a section's color scheme override */
    setSectionScheme: (sectionId: string, scheme: ColorScheme | null) => void
    /** Get a section's scheme override (null = inherit global) */
    getSectionScheme: (sectionId: string) => ColorScheme | null
    /** Get computed CSS overrides for a specific section */
    getSectionSchemeCSS: (sectionId: string) => CSSTokenMap | null
    /** Shuffle a section's scheme to a random one */
    shuffleSectionScheme: (sectionId: string) => void
    /** Clear all section scheme overrides */
    clearAllSectionSchemes: () => void
}

// ============================================
// Private Helpers
// ============================================

/** Recompute computed CSS from the active concept */
function recompute(data: StyleGuideData): CSSTokenMap {
    const concept = data.concepts.find(c => c.id === data.activeConceptId)
    if (!concept) return {}
    return computeTokenCSS(concept)
}

/** Get a random item from an array */
function randomFrom<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

const BUTTON_STYLES: ButtonStyle[] = ['solid', 'outline', 'ghost', 'brick', 'gradient']
const CARD_STYLES: CardStyle[] = ['default', 'outlined', 'flat']
const RADIUS_PRESETS: RadiusPreset[] = [0, 4, 8, 12, 9999]
const SCHEMES: ColorScheme[] = ['light', 'dark', 'accent']

// ============================================
// Store
// ============================================

export const useStyleGuideStore = create<StyleGuideState>()(
    subscribeWithSelector(
        immer((set, get) => {
            const defaultData = createDefaultStyleGuideData()

            return {
                // ---- Core Data ----
                data: defaultData,
                activePaletteId: null,
                activeFontPairId: null,
                computedCSS: recompute(defaultData),

                // ============================================
                // Data Lifecycle
                // ============================================

                loadData: (data) => set((state) => {
                    state.data = data
                    state.computedCSS = recompute(data)
                }),

                resetToDefaults: () => set((state) => {
                    const fresh = createDefaultStyleGuideData()
                    state.data = fresh
                    state.activePaletteId = null
                    state.activeFontPairId = null
                    state.computedCSS = recompute(fresh)
                }),

                exportData: () => {
                    return structuredClone(get().data)
                },

                // ============================================
                // Concept Management
                // ============================================

                getActiveConcept: () => {
                    const { data } = get()
                    const concept = data.concepts.find(c => c.id === data.activeConceptId)
                    return concept ?? data.concepts[0]
                },

                switchConcept: (conceptId) => set((state) => {
                    const exists = state.data.concepts.some(c => c.id === conceptId)
                    if (!exists) return
                    state.data.activeConceptId = conceptId
                    state.computedCSS = recompute(state.data)
                }),

                createConcept: (name) => {
                    const newId = generateId()
                    set((state) => {
                        const active = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                        if (!active) return
                        const clone: Concept = {
                            ...structuredClone(active),
                            id: newId,
                            name: name ?? `Concept ${state.data.concepts.length + 1}`,
                            createdAt: new Date().toISOString(),
                        }
                        state.data.concepts.push(clone)
                        state.data.activeConceptId = newId
                        state.computedCSS = recompute(state.data)
                    })
                    return newId
                },

                duplicateConcept: (conceptId) => {
                    const newId = generateId()
                    set((state) => {
                        const source = state.data.concepts.find(c => c.id === conceptId)
                        if (!source) return
                        const clone: Concept = {
                            ...structuredClone(source),
                            id: newId,
                            name: `${source.name} (Copy)`,
                            createdAt: new Date().toISOString(),
                        }
                        state.data.concepts.push(clone)
                    })
                    return newId
                },

                deleteConcept: (conceptId) => set((state) => {
                    if (state.data.concepts.length <= 1) return // Can't delete last

                    const idx = state.data.concepts.findIndex(c => c.id === conceptId)
                    if (idx === -1) return
                    state.data.concepts.splice(idx, 1)

                    // If we deleted the active, switch to first
                    if (state.data.activeConceptId === conceptId) {
                        state.data.activeConceptId = state.data.concepts[0].id
                        state.computedCSS = recompute(state.data)
                    }
                }),

                renameConcept: (conceptId, name) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === conceptId)
                    if (concept) concept.name = name
                }),

                // ============================================
                // Color Tokens
                // ============================================

                toggleMode: () => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    const isLight = concept.colors.mode === 'light'
                    concept.colors = {
                        ...concept.colors,
                        mode: isLight ? 'dark' : 'light',
                        bgPrimary: isLight ? '#0c0a05' : '#ffffff',
                        bgSecondary: isLight ? '#1a1917' : '#f9fafb',
                        textPrimary: isLight ? '#ffffff' : '#111827',
                        textSecondary: isLight ? '#a1a1aa' : '#6b7280',
                        textMuted: isLight ? '#71717a' : '#9ca3af',
                        border: isLight ? '#2d2b26' : '#e5e7eb',
                        borderMuted: isLight ? '#1f1d1a' : '#f3f4f6',
                    }
                    state.computedCSS = recompute(state.data)
                }),

                setMode: (mode) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept || concept.colors.mode === mode) return
                    // Use toggleMode logic
                    const isGoingDark = mode === 'dark'
                    concept.colors = {
                        ...concept.colors,
                        mode,
                        bgPrimary: isGoingDark ? '#0c0a05' : '#ffffff',
                        bgSecondary: isGoingDark ? '#1a1917' : '#f9fafb',
                        textPrimary: isGoingDark ? '#ffffff' : '#111827',
                        textSecondary: isGoingDark ? '#a1a1aa' : '#6b7280',
                        textMuted: isGoingDark ? '#71717a' : '#9ca3af',
                        border: isGoingDark ? '#2d2b26' : '#e5e7eb',
                        borderMuted: isGoingDark ? '#1f1d1a' : '#f3f4f6',
                    }
                    state.computedCSS = recompute(state.data)
                }),

                applyPalette: (palette) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.colors.neutralBase = palette.neutralBase
                    concept.colors.accents = palette.accents.map(a => ({ ...a }))
                    state.activePaletteId = palette.id
                    state.computedCSS = recompute(state.data)
                }),

                shuffleColors: () => {
                    const currentId = get().activePaletteId
                    const palette = currentId
                        ? getRandomPaletteExcluding(currentId)
                        : getRandomPalette()
                    get().applyPalette(palette)
                },

                updateAccent: (accentId, updates) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    const accent = concept.colors.accents.find(a => a.id === accentId)
                    if (!accent) return
                    Object.assign(accent, updates)
                    state.computedCSS = recompute(state.data)
                }),

                addAccent: (name, hex) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    if (concept.colors.accents.length >= 3) return // Max 3
                    concept.colors.accents.push({
                        id: `accent-${concept.colors.accents.length + 1}`,
                        name,
                        hex,
                        isMain: false,
                    })
                    state.computedCSS = recompute(state.data)
                }),

                removeAccent: (accentId) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    if (concept.colors.accents.length <= 1) return // Keep at least 1
                    const idx = concept.colors.accents.findIndex(a => a.id === accentId)
                    if (idx === -1) return
                    const wasMain = concept.colors.accents[idx].isMain
                    concept.colors.accents.splice(idx, 1)
                    // If we removed the main, promote the first remaining
                    if (wasMain && concept.colors.accents.length > 0) {
                        concept.colors.accents[0].isMain = true
                    }
                    state.computedCSS = recompute(state.data)
                }),

                setMainAccent: (accentId) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    for (const a of concept.colors.accents) {
                        a.isMain = a.id === accentId
                    }
                    state.computedCSS = recompute(state.data)
                }),

                // ============================================
                // Typography Tokens
                // ============================================

                applyFontPair: (pair) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.typography.headingFont = pair.heading.family
                    concept.typography.bodyFont = pair.body.family
                    state.activeFontPairId = pair.id

                    // Load the Google Fonts
                    loadGoogleFonts(pair, concept.typography.headingWeight, concept.typography.bodyWeight)

                    state.computedCSS = recompute(state.data)
                }),

                shuffleTypography: () => {
                    const currentId = get().activeFontPairId
                    const pair = currentId
                        ? getRandomFontPairExcluding(currentId)
                        : getRandomFontPair()
                    get().applyFontPair(pair)
                },

                setHeadingFont: (font) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.typography.headingFont = font
                    state.computedCSS = recompute(state.data)
                }),

                setBodyFont: (font) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.typography.bodyFont = font
                    state.computedCSS = recompute(state.data)
                }),

                setHeadingWeight: (weight) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.typography.headingWeight = weight
                    state.computedCSS = recompute(state.data)
                }),

                setBodyWeight: (weight) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.typography.bodyWeight = weight
                    state.computedCSS = recompute(state.data)
                }),

                setSizeScale: (scale) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.typography.sizeScale = scale
                    state.computedCSS = recompute(state.data)
                }),

                setLetterSpacingStyle: (style) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.typography.letterSpacingStyle = style
                    state.computedCSS = recompute(state.data)
                }),

                // ============================================
                // UI Tokens
                // ============================================

                setButtonStyle: (style) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.ui.buttonStyle = style
                    state.computedCSS = recompute(state.data)
                }),

                setButtonRadius: (radius) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.ui.buttonRadius = radius
                    state.computedCSS = recompute(state.data)
                }),

                setCardStyle: (style) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.ui.cardStyle = style
                    state.computedCSS = recompute(state.data)
                }),

                setCardRadius: (radius) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.ui.cardRadius = radius
                    state.computedCSS = recompute(state.data)
                }),

                setImageRadius: (radius) => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.ui.imageRadius = radius
                    state.computedCSS = recompute(state.data)
                }),

                shuffleUI: () => set((state) => {
                    const concept = state.data.concepts.find(c => c.id === state.data.activeConceptId)
                    if (!concept) return
                    concept.ui.buttonStyle = randomFrom(BUTTON_STYLES)
                    concept.ui.buttonRadius = randomFrom(RADIUS_PRESETS)
                    concept.ui.cardStyle = randomFrom(CARD_STYLES)
                    concept.ui.cardRadius = randomFrom(RADIUS_PRESETS)
                    state.computedCSS = recompute(state.data)
                }),

                // ============================================
                // Section Scheme Overrides
                // ============================================

                setSectionScheme: (sectionId, scheme) => set((state) => {
                    if (scheme === null) {
                        delete state.data.sectionSchemeOverrides[sectionId]
                    } else {
                        state.data.sectionSchemeOverrides[sectionId] = scheme
                    }
                }),

                getSectionScheme: (sectionId) => {
                    return get().data.sectionSchemeOverrides[sectionId] ?? null
                },

                getSectionSchemeCSS: (sectionId) => {
                    const scheme = get().data.sectionSchemeOverrides[sectionId]
                    if (!scheme) return null
                    const concept = get().getActiveConcept()
                    return computeSchemeOverrideCSS(scheme, concept)
                },

                shuffleSectionScheme: (sectionId) => set((state) => {
                    const current = state.data.sectionSchemeOverrides[sectionId] ?? null
                    const options = SCHEMES.filter(s => s !== current)
                    // Include null (inherit global) as an option
                    const allOptions = [...options, null] as (ColorScheme | null)[]
                    const picked = randomFrom(allOptions)
                    if (picked === null) {
                        delete state.data.sectionSchemeOverrides[sectionId]
                    } else {
                        state.data.sectionSchemeOverrides[sectionId] = picked
                    }
                }),

                clearAllSectionSchemes: () => set((state) => {
                    state.data.sectionSchemeOverrides = {}
                }),
            }
        })
    )
)
