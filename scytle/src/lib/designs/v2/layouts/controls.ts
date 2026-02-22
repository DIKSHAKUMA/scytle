/**
 * V2 Layout Control System — Matrix Navigation
 *
 * Each category defines control axes that form a matrix of layout variants.
 * Changing any control resolves the new combination and updates the componentId.
 */

import type { LayoutCategory } from './types'
import { ALL_HERO_PRESETS, HERO_PRESETS_MAP } from './hero/presets'

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
