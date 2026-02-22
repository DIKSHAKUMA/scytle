/**
 * V2 Layout Control System — Matrix Navigation
 *
 * Each category defines control axes that form a matrix of layout variants.
 * Changing any control resolves the new combination and updates the componentId.
 */

import type { LayoutCategory } from './types'
import { ALL_HERO_PRESETS, HERO_PRESETS_MAP } from './hero/presets'
import { CTA_PRESETS_MAP } from './cta/presets'
import { CTA_B_PRESETS_MAP } from './cta/presets-b'

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
    /** Only show this axis when condition is met (receives current axis values) */
    condition?: (values: Record<string, string>) => boolean
    /** 'wireframe' = wireframe mode only, 'design' = design mode only, 'both' = always (default) */
    modeVisibility?: 'wireframe' | 'design' | 'both'
}

export interface LayoutControlDef {
    /** Which category this control definition is for */
    category: LayoutCategory
    /** Unique family identifier (e.g. 'hero', 'cta-a', 'cta-b') */
    familyId: string
    /** The control axes (order = display order) */
    axes: LayoutControlAxis[]
    /** Given axis values, resolve to a layout ID. Returns undefined if no match. */
    resolve: (values: Record<string, string>) => string | undefined
    /** Given a layout ID, extract its axis values. Returns empty object if unknown. */
    extract: (layoutId: string) => Record<string, string>
}

// ============================================
// Hero Controls
// ============================================

const HERO_CONTROL_DEF: LayoutControlDef = {
    category: 'hero',
    familyId: 'hero',
    axes: [
        {
            key: 'layout',
            label: 'Layout',
            options: [
                { value: 'minimal', label: 'Minimal', icon: 'AlignLeft' },
                { value: 'split-text', label: 'Split Text', icon: 'Columns2' },
                { value: 'split-image', label: 'Split + Image', icon: 'Image' },
                { value: 'split-video', label: 'Split + Video', icon: 'PlayCircle' },
                { value: 'bg-image', label: 'BG Image', icon: 'Layers' },
            ],
        },
        {
            key: 'asset',
            label: 'Asset',
            options: [
                { value: 'image', label: 'Image', icon: 'Image' },
                { value: 'video', label: 'Video', icon: 'Video' },
            ],
            condition: (values) => ['split-image', 'split-video'].includes(values.layout),
            modeVisibility: 'design',
        },
        {
            key: 'assetPlacement',
            label: 'Placement',
            options: [
                { value: 'right', label: 'Right', icon: 'ArrowRight' },
                { value: 'left', label: 'Left', icon: 'ArrowLeft' },
            ],
            condition: (values) => ['split-image', 'split-video'].includes(values.layout),
            modeVisibility: 'design',
        },
    ],
    resolve(values) {
        const layout = values.layout ?? 'minimal'
        const match = ALL_HERO_PRESETS.find(p => p.layout === layout)
        return match?.id
    },
    extract(layoutId: string): Record<string, string> {
        const preset = HERO_PRESETS_MAP[layoutId]
        if (!preset) return {}
        // Base layout value + sensible defaults for conditional axes
        const result: Record<string, string> = { layout: preset.layout }
        // Default asset based on preset imageRole
        if (preset.imageRole === 'inline') result.asset = 'image'
        else if (preset.supportsVideo) result.asset = 'video'
        // Default placement
        if (['split-image', 'split-video'].includes(preset.layout)) {
            result.assetPlacement = 'right'
        }
        return result
    },
}

// ============================================
// CTA Controls — Family A (Split layouts)
// ============================================
// Side-by-side text + inline image. Styles: normal, card, expand.

const CTA_A_CONTROL_DEF: LayoutControlDef = {
    category: 'cta',
    familyId: 'cta-a',
    axes: [
        {
            key: 'style',
            label: 'Style',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'card', label: 'Card', icon: 'CreditCard' },
            ],
            condition: (values) => values.assetStyle !== 'expand',
        },
        {
            key: 'assetStyle',
            label: 'Asset Style',
            options: [
                { value: 'default', label: 'Default' },
                { value: 'expand', label: 'Expand', icon: 'Maximize2' },
            ],
            condition: (values) => values.style !== 'card',
        },
        {
            key: 'element',
            label: 'Element',
            options: [
                { value: 'button', label: 'Button', icon: 'MousePointerClick' },
                { value: 'form', label: 'Form', icon: 'Mail' },
            ],
        },
        {
            key: 'assetPlacement',
            label: 'Placement',
            options: [
                { value: 'right', label: 'Right', icon: 'ArrowRight' },
                { value: 'left', label: 'Left', icon: 'ArrowLeft' },
            ],
            modeVisibility: 'design',
        },
    ],
    resolve(values) {
        const element = values.element ?? 'button'
        const assetStyle = values.assetStyle ?? 'default'
        const style = values.style ?? 'normal'

        if (assetStyle === 'expand') {
            return element === 'form' ? 'cta-60' : 'cta-59'
        }
        if (style === 'card') {
            return element === 'form' ? 'cta-40' : 'cta-39'
        }
        return element === 'form' ? 'cta-2' : 'cta-1'
    },
    extract(layoutId) {
        const preset = CTA_PRESETS_MAP[layoutId]
        if (!preset) return {}
        const result: Record<string, string> = {
            element: preset.element,
        }
        if (preset.style === 'expand') {
            result.assetStyle = 'expand'
            result.style = 'normal'
        } else if (preset.style === 'card') {
            result.style = 'card'
            result.assetStyle = 'default'
        } else {
            result.style = 'normal'
            result.assetStyle = 'default'
        }
        result.assetPlacement = 'right'
        return result
    },
}

// ============================================
// CTA Controls — Family B (Text-Only / Stacked)
// ============================================
// Two text columns, optional background or stacked image below.

const CTA_B_CONTROL_DEF: LayoutControlDef = {
    category: 'cta',
    familyId: 'cta-b',
    axes: [
        {
            key: 'asset',
            label: 'Asset',
            options: [
                { value: 'none', label: 'None' },
                { value: 'image', label: 'Image', icon: 'Image' },
            ],
        },
        {
            key: 'background',
            label: 'Background',
            options: [
                { value: 'none', label: 'None' },
                { value: 'image', label: 'Image', icon: 'Image' },
                { value: 'video', label: 'Video', icon: 'Video' },
            ],
            condition: (values) => values.asset === 'none',
        },
        {
            key: 'assetStyle',
            label: 'Asset Style',
            options: [
                { value: 'default', label: 'Default' },
                { value: 'expand', label: 'Expand', icon: 'Maximize2' },
            ],
            condition: (values) => values.asset === 'image',
        },
        {
            key: 'element',
            label: 'Element',
            options: [
                { value: 'button', label: 'Button', icon: 'MousePointerClick' },
                { value: 'form', label: 'Form', icon: 'Mail' },
            ],
        },
    ],
    resolve(values) {
        const asset = values.asset ?? 'none'
        const element = values.element ?? 'button'

        if (asset === 'none') {
            const bg = values.background ?? 'none'
            if (bg === 'video') return element === 'form' ? 'cta-18' : 'cta-17'
            if (bg === 'image') return element === 'form' ? 'cta-16' : 'cta-15'
            return element === 'form' ? 'cta-14' : 'cta-13'
        }

        // asset === 'image'
        const assetStyle = values.assetStyle ?? 'default'
        if (assetStyle === 'expand') return element === 'form' ? 'cta-62' : 'cta-61'
        return element === 'form' ? 'cta-22' : 'cta-21'
    },
    extract(layoutId) {
        const preset = CTA_B_PRESETS_MAP[layoutId]
        if (!preset) return {}
        const result: Record<string, string> = {
            element: preset.element,
        }
        if (preset.sectionStyle === 'text-only') {
            result.asset = 'none'
            result.background = preset.background
        } else if (preset.sectionStyle === 'stacked') {
            result.asset = 'image'
            result.assetStyle = 'default'
        } else if (preset.sectionStyle === 'expand') {
            result.asset = 'image'
            result.assetStyle = 'expand'
        }
        return result
    },
}

// ============================================
// Control Registry
// ============================================

/** All registered control definitions, keyed by family ID */
const CONTROL_REGISTRY: Record<string, LayoutControlDef> = {
    'hero': HERO_CONTROL_DEF,
    'cta-a': CTA_A_CONTROL_DEF,
    'cta-b': CTA_B_CONTROL_DEF,
}

/** Maps each layout category to its family IDs */
const CATEGORY_FAMILIES: Partial<Record<LayoutCategory, string[]>> = {
    hero: ['hero'],
    cta: ['cta-a', 'cta-b'],
}

/** Get all control definitions for a category (one per family) */
export function getControlDefsForCategory(category: LayoutCategory): LayoutControlDef[] {
    const familyIds = CATEGORY_FAMILIES[category]
    if (!familyIds) return []
    return familyIds.map(id => CONTROL_REGISTRY[id]).filter(Boolean)
}

/** Get the control definition for a category (first family — backward compat) */
export function getControlDef(category: LayoutCategory): LayoutControlDef | undefined {
    const defs = getControlDefsForCategory(category)
    return defs[0]
}

/** Find the control def that owns a specific layout ID */
export function getControlDefForLayout(layoutId: string): LayoutControlDef | undefined {
    for (const def of Object.values(CONTROL_REGISTRY)) {
        const extracted = def.extract(layoutId)
        if (Object.keys(extracted).length > 0) return def
    }
    return undefined
}
