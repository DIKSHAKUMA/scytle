/**
 * V2 Layout Control System — Matrix Navigation
 *
 * Each category defines control axes that form a matrix of layout variants.
 * Changing any control resolves the new combination and updates the componentId.
 *
 * Example: Hero has 3 axes (alignment × background × actions) = 27 variants.
 * The user picks "Text: Center" → "Background: Image" → "Element: Form" → hero-26.
 */

import type { LayoutCategory } from './types'
import { ALL_HERO_PRESETS, HERO_PRESETS_MAP } from './hero'

// ============================================
// Generic Control Types
// ============================================

export interface LayoutControlOption {
    /** Value stored in the axis, e.g. 'left', 'dark', 'buttons' */
    value: string
    /** Display label, e.g. 'Left', 'Dark', 'Buttons' */
    label: string
    /** Optional Lucide icon name */
    icon?: string
}

export interface LayoutControlAxis {
    /** Axis key, e.g. 'alignment', 'background', 'element' */
    key: string
    /** Display label, e.g. 'Text', 'Background', 'Element' */
    label: string
    /** Available options for this axis */
    options: LayoutControlOption[]
}

export interface LayoutControlDef {
    /** Which category this control definition is for */
    category: LayoutCategory
    /** The control axes (order = display order) */
    axes: LayoutControlAxis[]
    /** Given axis values, resolve to a layout ID. Returns undefined if no match. */
    resolve: (values: Record<string, string>) => string | undefined
    /** Given a layout ID, extract its axis values. Returns empty object if unknown. */
    extract: (layoutId: string) => Record<string, string>
}

// ============================================
// Hero Control Definition
// ============================================

const HERO_CONTROL_DEF: LayoutControlDef = {
    category: 'hero',
    axes: [
        {
            key: 'alignment',
            label: 'Text',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'split', label: 'Split', icon: 'Columns2' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
        },
        {
            key: 'background',
            label: 'Background',
            options: [
                { value: 'dark', label: 'None' },
                { value: 'neutral', label: 'None' },
                { value: 'image', label: 'Image', icon: 'Image' },
            ],
        },
        {
            key: 'element',
            label: 'Element',
            options: [
                { value: 'none', label: 'None' },
                { value: 'form', label: 'Form' },
                { value: 'buttons', label: 'Button' },
            ],
        },
    ],
    resolve: (values) => {
        const alignment = values.alignment ?? 'left'
        const background = values.background ?? 'neutral'
        const element = values.element ?? 'buttons'

        const match = ALL_HERO_PRESETS.find(
            (p) => p.alignment === alignment && p.background === background && p.actions === element
        )
        return match?.id
    },
    extract: (layoutId: string): Record<string, string> => {
        const preset = HERO_PRESETS_MAP[layoutId]
        if (!preset) return {} as Record<string, string>
        return {
            alignment: preset.alignment,
            background: preset.background,
            element: preset.actions,
        } as Record<string, string>
    },
}

// ============================================
// Control Registry
// ============================================

/** All registered control definitions, keyed by category */
const CONTROL_REGISTRY: Partial<Record<LayoutCategory, LayoutControlDef>> = {
    hero: HERO_CONTROL_DEF,
}

/** Get the control definition for a category (if V2 controls exist) */
export function getControlDef(category: LayoutCategory): LayoutControlDef | undefined {
    return CONTROL_REGISTRY[category]
}

/** Check if a layout ID belongs to a V2 category with controls */
export function getControlDefForLayout(layoutId: string): LayoutControlDef | undefined {
    for (const def of Object.values(CONTROL_REGISTRY)) {
        if (def) {
            const extracted = def.extract(layoutId)
            if (Object.keys(extracted).length > 0) return def
        }
    }
    return undefined
}
