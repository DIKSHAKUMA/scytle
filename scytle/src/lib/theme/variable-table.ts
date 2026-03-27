/**
 * Variable Table — flat key→value map that the canvas renderer resolves refs against.
 *
 * Each variable has a light and dark value. Nodes store ref strings (e.g. 'bg/primary')
 * that point into this table. The renderer resolves: table[ref][mode] → actual value.
 *
 * conceptToVariableTable() bridges the high-level Concept type → this flat table.
 */

import type { Concept } from '@/lib/designs/v2/tokens'
import { getMainAccent } from '@/lib/designs/v2/tokens/defaults'

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface VariableValue {
    light: string
    dark: string
}

export type VariableTable = Record<string, VariableValue>
export type ThemeMode = 'light' | 'dark'

// ═══════════════════════════════════════════════════
// Variable Keys
// ═══════════════════════════════════════════════════

export const VARIABLE_KEYS = [
    // Colors (7)
    'bg/primary', 'bg/secondary', 'text/primary', 'text/secondary',
    'accent', 'text/on-accent', 'border',
    // Fonts (2)
    'font/heading', 'font/body',
    // Font weights (2)
    'fontWeight/heading', 'fontWeight/body',
    // Radius (3)
    'radius/sm', 'radius/md', 'radius/lg',
    // Spacing (4)
    'spacing/sm', 'spacing/md', 'spacing/lg', 'spacing/gap',
    // Shadows (2)
    'shadow/sm', 'shadow/md',
    // Font sizes (3)
    'fontSize/h1', 'fontSize/h2', 'fontSize/body',
] as const

export type VariableKey = (typeof VARIABLE_KEYS)[number]

// ═══════════════════════════════════════════════════
// Concept → VariableTable Conversion
// ═══════════════════════════════════════════════════

/** Extract the clean Google Font name from a CSS font-family string like "'Raleway', sans-serif" */
function extractFontName(cssFamily: string): string {
    return cssFamily.replace(/['"]/g, '').split(',')[0].trim()
}

/** Derive radius scale from buttonRadius + cardRadius */
function deriveRadiusScale(buttonRadius: number, cardRadius: number): { sm: string; md: string; lg: string } {
    // sm = buttons/inputs, md = cards/medium elements, lg = sections/large containers
    const sm = String(Math.max(buttonRadius, 0))
    const md = String(Math.max(cardRadius, buttonRadius))
    const lg = String(Math.max(cardRadius * 2, 16))
    return { sm, md, lg }
}

/** Generate shadow values for a given mode */
function deriveShadows(mode: 'light' | 'dark'): { sm: string; md: string } {
    if (mode === 'dark') {
        return {
            sm: '0 1px 3px rgba(0,0,0,0.4)',
            md: '0 4px 12px rgba(0,0,0,0.5)',
        }
    }
    return {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
        md: '0 4px 12px rgba(0,0,0,0.1)',
    }
}

/** Derive font sizes from sizeScale */
function deriveFontSizes(sizeScale: number): { h1: string; h2: string; body: string } {
    return {
        h1: String(Math.round(48 * sizeScale)),
        h2: String(Math.round(32 * sizeScale)),
        body: '16',
    }
}

/**
 * Convert a Concept (high-level style guide settings) into a flat VariableTable
 * that the renderer can resolve refs against.
 *
 * Each concept has its own light/dark color sets depending on its mode,
 * but we also generate the "other mode" values using sensible defaults
 * so that toggling mode works without a separate dark-mode concept.
 */
export function conceptToVariableTable(concept: Concept): VariableTable {
    const { colors, typography, ui } = concept
    const accent = getMainAccent(colors)
    const isLight = colors.mode === 'light'

    const headingFont = extractFontName(typography.headingFont)
    const bodyFont = extractFontName(typography.bodyFont)
    const radius = deriveRadiusScale(ui.buttonRadius, ui.cardRadius)
    const lightShadows = deriveShadows('light')
    const darkShadows = deriveShadows('dark')
    const fontSizes = deriveFontSizes(typography.sizeScale)

    // For the "current" mode we use the concept's actual colors.
    // For the "other" mode we derive inverted defaults.
    // This means nodes generated in light mode will look sensible when toggled to dark.
    const light = {
        bgPrimary: isLight ? colors.bgPrimary : '#ffffff',
        bgSecondary: isLight ? colors.bgSecondary : '#f5f5f5',
        textPrimary: isLight ? colors.textPrimary : '#111111',
        textSecondary: isLight ? colors.textSecondary : '#666666',
        accent,
        textOnAccent: isLight ? colors.textOnAccent : '#ffffff',
        border: isLight ? colors.border : '#e5e5e5',
    }

    const dark = {
        bgPrimary: !isLight ? colors.bgPrimary : '#0a0a0a',
        bgSecondary: !isLight ? colors.bgSecondary : '#141414',
        textPrimary: !isLight ? colors.textPrimary : '#fafafa',
        textSecondary: !isLight ? colors.textSecondary : '#a3a3a3',
        accent,
        textOnAccent: !isLight ? colors.textOnAccent : '#000000',
        border: !isLight ? colors.border : '#2a2a2a',
    }

    return {
        'bg/primary': { light: light.bgPrimary, dark: dark.bgPrimary },
        'bg/secondary': { light: light.bgSecondary, dark: dark.bgSecondary },
        'text/primary': { light: light.textPrimary, dark: dark.textPrimary },
        'text/secondary': { light: light.textSecondary, dark: dark.textSecondary },
        'accent': { light: light.accent, dark: dark.accent },
        'text/on-accent': { light: light.textOnAccent, dark: dark.textOnAccent },
        'border': { light: light.border, dark: dark.border },

        'font/heading': { light: headingFont, dark: headingFont },
        'font/body': { light: bodyFont, dark: bodyFont },

        'fontWeight/heading': { light: String(typography.headingWeight), dark: String(typography.headingWeight) },
        'fontWeight/body': { light: String(typography.bodyWeight), dark: String(typography.bodyWeight) },

        'radius/sm': { light: radius.sm, dark: radius.sm },
        'radius/md': { light: radius.md, dark: radius.md },
        'radius/lg': { light: radius.lg, dark: radius.lg },

        'spacing/sm': { light: '16', dark: '16' },
        'spacing/md': { light: '24', dark: '24' },
        'spacing/lg': { light: '48', dark: '48' },
        'spacing/gap': { light: '16', dark: '16' },

        'shadow/sm': { light: lightShadows.sm, dark: darkShadows.sm },
        'shadow/md': { light: lightShadows.md, dark: darkShadows.md },

        'fontSize/h1': { light: fontSizes.h1, dark: fontSizes.h1 },
        'fontSize/h2': { light: fontSizes.h2, dark: fontSizes.h2 },
        'fontSize/body': { light: fontSizes.body, dark: fontSizes.body },
    }
}

// ═══════════════════════════════════════════════════
// Link Maps — Reverse lookup for single-pass parser+linker
// ═══════════════════════════════════════════════════

export interface LinkMaps {
    colorMap: Map<string, string>
    fontMap: Map<string, string>
    radiusMap: Map<string, string>
    spacingMap: Map<string, string>
    shadowMap: Map<string, string>
    fontSizeMap: Map<string, string>
}

function normalizeHex(hex: string): string {
    let h = hex.trim().toLowerCase()
    if (!h.startsWith('#')) return h
    if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
    return h
}

function normalizeShadow(s: string): string {
    return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * Build reverse-lookup maps from a variable table for a given mode.
 * Used by the parser to assign refs during node creation.
 *
 * Each map: value → variable key (e.g. '#3B82F6' → 'accent')
 * Variables are bucketed by prefix so color values only match color variables, etc.
 */
export function buildLinkMaps(vars: VariableTable, mode: ThemeMode): LinkMaps {
    const maps: LinkMaps = {
        colorMap: new Map(),
        fontMap: new Map(),
        radiusMap: new Map(),
        spacingMap: new Map(),
        shadowMap: new Map(),
        fontSizeMap: new Map(),
    }

    for (const [name, val] of Object.entries(vars)) {
        const v = val[mode]
        if (name.startsWith('font/')) maps.fontMap.set(v.toLowerCase(), name)
        else if (name.startsWith('radius/')) maps.radiusMap.set(v, name)
        else if (name.startsWith('spacing/')) maps.spacingMap.set(v, name)
        else if (name.startsWith('shadow/')) maps.shadowMap.set(normalizeShadow(v), name)
        else if (name.startsWith('fontSize/')) maps.fontSizeMap.set(v, name)
        else maps.colorMap.set(normalizeHex(v), name)
    }

    return maps
}

export { normalizeHex, normalizeShadow }

// ═══════════════════════════════════════════════════
// Variable Collections — Organizational layer
// ═══════════════════════════════════════════════════

/**
 * A VariableCollection groups related variables together.
 * Inspired by Figma's collections, but purely organisational —
 * it doesn't change how refs or resolution work.
 */
export interface VariableCollection {
    id: string
    name: string
    icon: string               // lucide icon name for UI display
    groups: VariableGroup[]
}

/**
 * A VariableGroup is a sub-section within a collection.
 * e.g. the "Colors" collection has "Backgrounds", "Text", "Accent", "Border" groups.
 */
export interface VariableGroup {
    id: string
    name: string
    variableKeys: VariableKey[]
}

/**
 * What kind of value a variable holds — used by the UI to render
 * the right editor (color swatch vs number input vs text input).
 */
export type VariableValueType = 'color' | 'number' | 'font' | 'shadow'

/**
 * Metadata for a single variable key.
 */
export interface VariableMeta {
    key: VariableKey
    displayName: string
    valueType: VariableValueType
}

// ── Variable metadata registry ──────────────────────

const VARIABLE_META: Record<VariableKey, { displayName: string; valueType: VariableValueType }> = {
    // Colors
    'bg/primary':       { displayName: 'Background Primary',   valueType: 'color' },
    'bg/secondary':     { displayName: 'Background Secondary', valueType: 'color' },
    'text/primary':     { displayName: 'Text Primary',         valueType: 'color' },
    'text/secondary':   { displayName: 'Text Secondary',       valueType: 'color' },
    'accent':           { displayName: 'Accent',               valueType: 'color' },
    'text/on-accent':   { displayName: 'Text on Accent',       valueType: 'color' },
    'border':           { displayName: 'Border',               valueType: 'color' },
    // Fonts
    'font/heading':     { displayName: 'Heading Font',         valueType: 'font' },
    'font/body':        { displayName: 'Body Font',            valueType: 'font' },
    // Font weights
    'fontWeight/heading': { displayName: 'Heading Weight',     valueType: 'number' },
    'fontWeight/body':    { displayName: 'Body Weight',        valueType: 'number' },
    // Radius
    'radius/sm':        { displayName: 'Small',                valueType: 'number' },
    'radius/md':        { displayName: 'Medium',               valueType: 'number' },
    'radius/lg':        { displayName: 'Large',                valueType: 'number' },
    // Spacing
    'spacing/sm':       { displayName: 'Small',                valueType: 'number' },
    'spacing/md':       { displayName: 'Medium',               valueType: 'number' },
    'spacing/lg':       { displayName: 'Large',                valueType: 'number' },
    'spacing/gap':      { displayName: 'Gap',                  valueType: 'number' },
    // Shadows
    'shadow/sm':        { displayName: 'Small',                valueType: 'shadow' },
    'shadow/md':        { displayName: 'Medium',               valueType: 'shadow' },
    // Font sizes
    'fontSize/h1':      { displayName: 'Heading 1',            valueType: 'number' },
    'fontSize/h2':      { displayName: 'Heading 2',            valueType: 'number' },
    'fontSize/body':    { displayName: 'Body',                 valueType: 'number' },
}

/**
 * Pre-defined collections that organize the 24 standard variable keys.
 * The structure mirrors how Relume organizes their design system
 * (Primitives → Color Schemes → Typography → Spacing).
 */
export const STANDARD_COLLECTIONS: VariableCollection[] = [
    {
        id: 'colors',
        name: 'Colors',
        icon: 'Palette',
        groups: [
            {
                id: 'backgrounds',
                name: 'Backgrounds',
                variableKeys: ['bg/primary', 'bg/secondary'],
            },
            {
                id: 'text-colors',
                name: 'Text',
                variableKeys: ['text/primary', 'text/secondary'],
            },
            {
                id: 'accent',
                name: 'Accent',
                variableKeys: ['accent', 'text/on-accent'],
            },
            {
                id: 'border',
                name: 'Border',
                variableKeys: ['border'],
            },
        ],
    },
    {
        id: 'typography',
        name: 'Typography',
        icon: 'Type',
        groups: [
            {
                id: 'font-families',
                name: 'Font Families',
                variableKeys: ['font/heading', 'font/body'],
            },
            {
                id: 'font-weights',
                name: 'Font Weights',
                variableKeys: ['fontWeight/heading', 'fontWeight/body'],
            },
            {
                id: 'font-sizes',
                name: 'Font Sizes',
                variableKeys: ['fontSize/h1', 'fontSize/h2', 'fontSize/body'],
            },
        ],
    },
    {
        id: 'spacing',
        name: 'Spacing',
        icon: 'Ruler',
        groups: [
            {
                id: 'spacing-values',
                name: 'Spacing',
                variableKeys: ['spacing/sm', 'spacing/md', 'spacing/lg', 'spacing/gap'],
            },
            {
                id: 'radius',
                name: 'Radius',
                variableKeys: ['radius/sm', 'radius/md', 'radius/lg'],
            },
        ],
    },
    {
        id: 'effects',
        name: 'Effects',
        icon: 'Layers',
        groups: [
            {
                id: 'shadows',
                name: 'Shadows',
                variableKeys: ['shadow/sm', 'shadow/md'],
            },
        ],
    },
]

// ── Helpers ──────────────────────────────────────────

/**
 * Get the display name for a variable key.
 * e.g. 'bg/primary' → 'Background Primary'
 */
export function getVariableDisplayName(key: VariableKey): string {
    return VARIABLE_META[key]?.displayName ?? key
}

/**
 * Get the value type of a variable (color, number, font, shadow).
 */
export function getVariableValueType(key: VariableKey): VariableValueType {
    return VARIABLE_META[key]?.valueType ?? 'number'
}

/**
 * Get the full metadata for a variable key.
 */
export function getVariableMeta(key: VariableKey): VariableMeta {
    const meta = VARIABLE_META[key]
    return { key, displayName: meta.displayName, valueType: meta.valueType }
}

/**
 * Find which collection and group a variable key belongs to.
 */
export function getCollectionForKey(key: string): { collection: string; group: string } | null {
    for (const collection of STANDARD_COLLECTIONS) {
        for (const group of collection.groups) {
            if ((group.variableKeys as readonly string[]).includes(key)) {
                return { collection: collection.name, group: group.name }
            }
        }
    }
    return null
}

/**
 * Scoping map — controls which variables appear in the picker
 * for each property type. Like Figma's VariableScope.
 */
export const VARIABLE_SCOPES: Record<string, VariableKey[]> = {
    'fill.color':       ['bg/primary', 'bg/secondary', 'accent', 'text/primary', 'text/secondary', 'text/on-accent', 'border'],
    'text.color':       ['text/primary', 'text/secondary', 'text/on-accent', 'accent'],
    'text.fontFamily':  ['font/heading', 'font/body'],
    'text.fontSize':    ['fontSize/h1', 'fontSize/h2', 'fontSize/body'],
    'text.fontWeight':  ['fontWeight/heading', 'fontWeight/body'],
    'shadow.color':     ['accent', 'text/primary', 'border'],
    'borderRadius':     ['radius/sm', 'radius/md', 'radius/lg'],
    'padding':          ['spacing/sm', 'spacing/md', 'spacing/lg'],
    'gap':              ['spacing/gap', 'spacing/sm', 'spacing/md', 'spacing/lg'],
}

/**
 * Get the scoped variable keys for a property type.
 * Returns all variable keys if no specific scope is defined.
 */
export function getScopedVariables(propertyType: string): VariableKey[] {
    return VARIABLE_SCOPES[propertyType] ?? (VARIABLE_KEYS as unknown as VariableKey[])
}
