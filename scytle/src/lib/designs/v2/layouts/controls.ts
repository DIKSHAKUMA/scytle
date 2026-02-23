/**
 * V2 Layout Control System — Matrix Navigation
 *
 * Each category defines control axes that form a matrix of layout variants.
 * Changing any control resolves the new combination and updates the componentId.
 */

import type { LayoutCategory } from './types'
import { ALL_HERO_PRESETS, HERO_PRESETS_MAP } from './hero/presets'
import {
    FAMILY_A_PRESETS_MAP,
    FAMILY_B_PRESETS_MAP,
    FAMILY_C_PRESETS_MAP,
    CTA_PRESETS_MAP,
} from './cta/presets'
import {
    FAMILY_A_PRESETS_MAP as HEADER_A_PRESETS_MAP,
    FAMILY_B_PRESETS_MAP as HEADER_B_PRESETS_MAP,
    FAMILY_C_PRESETS_MAP as HEADER_C_PRESETS_MAP,
    FAMILY_D_PRESETS_MAP as HEADER_D_PRESETS_MAP,
} from './header/presets'
import {
    FAMILY_A_PRESETS_MAP as FAQ_A_PRESETS_MAP,
    FAMILY_B_PRESETS_MAP as FAQ_B_PRESETS_MAP,
    FAMILY_C_PRESETS_MAP as FAQ_C_PRESETS_MAP,
    FAMILY_D_PRESETS_MAP as FAQ_D_PRESETS_MAP,
    FAMILY_E_PRESETS_MAP as FAQ_E_PRESETS_MAP,
    FAMILY_F_PRESETS_MAP as FAQ_F_PRESETS_MAP,
} from './faq/presets'

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
        const preset = FAMILY_A_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
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
        const preset = FAMILY_B_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// CTA Controls — Family C (Single-column text)
// ============================================
// Single-column text with optional background, card wrap, or image below.
// 6 axes: text, style, background, element, asset, assetStyle
// Complex dynamic visibility based on axis combinations.

const CTA_C_CONTROL_DEF: LayoutControlDef = {
    category: 'cta',
    familyId: 'cta-c',
    axes: [
        {
            key: 'text',
            label: 'Text',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
            ],
            // Hidden when center+card, center+asset=image, or expand
            condition: (values) =>
                values.text === 'left' ||
                (values.style !== 'card' && values.asset !== 'image' && values.assetStyle !== 'expand'),
        },
        {
            key: 'style',
            label: 'Style',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'card', label: 'Card', icon: 'CreditCard' },
            ],
            // Left path: visible when bg != none. Center path: visible unless asset=image or expand.
            condition: (values) => {
                if (values.text === 'left') return values.background !== 'none'
                return values.asset !== 'image' && values.assetStyle !== 'expand'
            },
        },
        {
            key: 'background',
            label: 'Background',
            options: [
                { value: 'none', label: 'None' },
                { value: 'image', label: 'Image', icon: 'Image' },
                { value: 'video', label: 'Video', icon: 'Video' },
            ],
            // Hidden when asset=image or expand
            condition: (values) => values.asset !== 'image' && values.assetStyle !== 'expand',
        },
        {
            key: 'element',
            label: 'Element',
            options: [
                { value: 'button', label: 'Button', icon: 'MousePointerClick' },
                { value: 'form', label: 'Form', icon: 'Mail' },
            ],
            // Hidden only in expand mode (CTA 65 is button-only)
            condition: (values) => values.assetStyle !== 'expand',
        },
        {
            key: 'asset',
            label: 'Asset',
            options: [
                { value: 'none', label: 'None' },
                { value: 'image', label: 'Image', icon: 'Image' },
            ],
            // Only visible in center + normal + bg=none (not in expand)
            condition: (values) =>
                values.text === 'center' &&
                values.style !== 'card' &&
                values.background === 'none' &&
                values.assetStyle !== 'expand',
        },
        {
            key: 'assetStyle',
            label: 'Asset Style',
            options: [
                { value: 'default', label: 'Default' },
                { value: 'expand', label: 'Expand', icon: 'Maximize2' },
            ],
            // Only visible when asset=image
            condition: (values) => values.asset === 'image',
        },
    ],
    resolve(values) {
        const text = values.text ?? 'left'
        const style = values.style ?? 'normal'
        const bg = values.background ?? 'none'
        const element = values.element ?? 'button'
        const asset = values.asset ?? 'none'
        const assetStyle = values.assetStyle ?? 'default'

        // Expand path (center only)
        if (asset === 'image' && assetStyle === 'expand') {
            return 'cta-65'
        }

        // Asset=Image stacked path (center only)
        if (asset === 'image') {
            return element === 'form' ? 'cta-32' : 'cta-31'
        }

        // Left path
        if (text === 'left') {
            if (style === 'card') {
                // Card mode — bg=none defaults to bg=image (no Left+Card+NoBg variant)
                if (bg === 'video') return element === 'form' ? 'cta-44' : 'cta-43'
                return element === 'form' ? 'cta-42' : 'cta-41'
            }
            // Normal
            if (bg === 'video') return element === 'form' ? 'cta-6' : 'cta-5'
            if (bg === 'image') return element === 'form' ? 'cta-4' : 'cta-3'
            return element === 'form' ? 'cta-20' : 'cta-19'
        }

        // Center path
        if (style === 'card') {
            if (bg === 'video') return element === 'form' ? 'cta-56' : 'cta-55'
            if (bg === 'image') return element === 'form' ? 'cta-54' : 'cta-53'
            return element === 'form' ? 'cta-52' : 'cta-51'
        }
        // Center normal
        if (bg === 'video') return element === 'form' ? 'cta-30' : 'cta-29'
        if (bg === 'image') return element === 'form' ? 'cta-28' : 'cta-27'
        return element === 'form' ? 'cta-26' : 'cta-25'
    },
    extract(layoutId) {
        const preset = FAMILY_C_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Header Controls — Family A (Full-width banner)
// ============================================
// Full-width banner with optional background media.
// 3 axes: text (left/center), background (none/image/video), element (button/form/none).

const HEADER_A_CONTROL_DEF: LayoutControlDef = {
    category: 'header',
    familyId: 'header-a',
    axes: [
        {
            key: 'text',
            label: 'Text',
            options: [
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
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
        },
        {
            key: 'element',
            label: 'Element',
            options: [
                { value: 'button', label: 'Button', icon: 'MousePointerClick' },
                { value: 'form', label: 'Form', icon: 'Mail' },
                { value: 'none', label: 'None' },
            ],
        },
    ],
    resolve(values) {
        const text = values.text ?? 'left'
        const bg = values.background ?? 'none'
        const element = values.element ?? 'button'

        // Left path
        if (text === 'left') {
            if (bg === 'none') {
                if (element === 'form') return 'header-45'
                if (element === 'none') return 'header-46'
                return 'header-44'
            }
            if (bg === 'image') {
                if (element === 'form') return 'header-52'
                if (element === 'none') return 'header-54'
                return 'header-50'
            }
            // bg === 'video'
            if (element === 'form') return 'header-53'
            if (element === 'none') return 'header-55'
            return 'header-51'
        }

        // Center path
        if (bg === 'none') {
            if (element === 'form') return 'header-63'
            if (element === 'none') return 'header-64'
            return 'header-62'
        }
        if (bg === 'image') {
            if (element === 'form') return 'header-67'
            if (element === 'none') return 'header-69'
            return 'header-65'
        }
        // bg === 'video'
        if (element === 'form') return 'header-68'
        if (element === 'none') return 'header-70'
        return 'header-66'
    },
    extract(layoutId) {
        const preset = HEADER_A_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Header Controls — Family B (Split layout)
// ============================================
// Two-column split. Left col: tagline + heading. Right col: body + actions.
// 2 axes: background (none/image/video), element toggle (button/form).

const HEADER_B_CONTROL_DEF: LayoutControlDef = {
    category: 'header',
    familyId: 'header-b',
    axes: [
        {
            key: 'background',
            label: 'Background',
            options: [
                { value: 'none', label: 'None' },
                { value: 'image', label: 'Image', icon: 'Image' },
                { value: 'video', label: 'Video', icon: 'Video' },
            ],
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
        const bg = values.background ?? 'none'
        const element = values.element ?? 'button'

        if (bg === 'none') return element === 'form' ? 'header-48' : 'header-47'
        if (bg === 'image') return element === 'form' ? 'header-58' : 'header-56'
        // bg === 'video'
        return element === 'form' ? 'header-59' : 'header-57'
    },
    extract(layoutId) {
        const preset = HEADER_B_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Header Controls — Family C (Minimal split)
// ============================================
// Two-column split. Left col: heading only. Right col: body only.
// 1 axis: background (none/image/video). No element toggle.

const HEADER_C_CONTROL_DEF: LayoutControlDef = {
    category: 'header',
    familyId: 'header-c',
    axes: [
        {
            key: 'background',
            label: 'Background',
            options: [
                { value: 'none', label: 'None' },
                { value: 'image', label: 'Image', icon: 'Image' },
                { value: 'video', label: 'Video', icon: 'Video' },
            ],
        },
    ],
    resolve(values) {
        const bg = values.background ?? 'none'
        if (bg === 'image') return 'header-60'
        if (bg === 'video') return 'header-61'
        return 'header-49'
    },
    extract(layoutId) {
        const preset = HEADER_C_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Header Controls — Family D (Card layout)
// ============================================
// Card overlay with centered content. Section → container → bordered/bg card → blocks.
// 2 axes: background (none/image/video), element toggle (button/form).

const HEADER_D_CONTROL_DEF: LayoutControlDef = {
    category: 'header',
    familyId: 'header-d',
    axes: [
        {
            key: 'background',
            label: 'Background',
            options: [
                { value: 'none', label: 'None' },
                { value: 'image', label: 'Image', icon: 'Image' },
                { value: 'video', label: 'Video', icon: 'Video' },
            ],
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
        const bg = values.background ?? 'none'
        const element = values.element ?? 'button'

        if (bg === 'none') return element === 'form' ? 'header-97' : 'header-96'
        if (bg === 'image') return element === 'form' ? 'header-99' : 'header-98'
        // bg === 'video'
        return element === 'form' ? 'header-101' : 'header-100'
    },
    extract(layoutId) {
        const preset = HEADER_D_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// FAQ Controls — Family A (Accordion + bottom CTA)
// ============================================
// Accordion list with optional bottom CTA.
// 3 axes: text (center/left), style (normal/card), columns (1/2).
// Dynamic visibility: text=center shows columns; text=left hides columns;
// columns=2 hides text axis.

const FAQ_A_CONTROL_DEF: LayoutControlDef = {
    category: 'faq',
    familyId: 'faq-a',
    axes: [
        {
            key: 'text',
            label: 'Text',
            options: [
                { value: 'center', label: 'Center', icon: 'AlignCenter' },
                { value: 'left', label: 'Left', icon: 'AlignLeft' },
            ],
            // Hidden when columns=2
            condition: (values) => values.columns !== '2',
        },
        {
            key: 'style',
            label: 'Style',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'card', label: 'Card', icon: 'CreditCard' },
            ],
        },
        {
            key: 'columns',
            label: 'Columns',
            options: [
                { value: '1', label: '1 Column' },
                { value: '2', label: '2 Columns', icon: 'Columns2' },
            ],
            // Hidden when text=left
            condition: (values) => values.text !== 'left',
        },
    ],
    resolve(values) {
        const columns = values.columns ?? '1'
        const text = values.text ?? 'center'
        const style = values.style ?? 'normal'

        // 2-column path (always center)
        if (columns === '2') {
            return style === 'card' ? 'faq-11' : 'faq-10'
        }
        // Left path
        if (text === 'left') {
            return style === 'card' ? 'faq-5' : 'faq-2'
        }
        // Center 1-col path
        return style === 'card' ? 'faq-4' : 'faq-1'
    },
    extract(layoutId) {
        const preset = FAQ_A_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// FAQ Controls — Family B (Split + Accordion)
// ============================================
// Split layout: left col (title + CTA button), right col (accordion list).
// 1 axis: style (normal/card).

const FAQ_B_CONTROL_DEF: LayoutControlDef = {
    category: 'faq',
    familyId: 'faq-b',
    axes: [
        {
            key: 'style',
            label: 'Style',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'card', label: 'Card', icon: 'CreditCard' },
            ],
        },
    ],
    resolve(values) {
        const style = values.style ?? 'normal'
        return style === 'card' ? 'faq-6' : 'faq-3'
    },
    extract(layoutId) {
        const preset = FAQ_B_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// FAQ Controls — Family C (Grid + bottom CTA)
// ============================================
// Non-accordion grid of Q/A pairs with bottom CTA.
// 1 axis: columns (1/2/3).

const FAQ_C_CONTROL_DEF: LayoutControlDef = {
    category: 'faq',
    familyId: 'faq-c',
    axes: [
        {
            key: 'columns',
            label: 'Columns',
            options: [
                { value: '1', label: '1 Column' },
                { value: '2', label: '2 Columns', icon: 'Columns2' },
                { value: '3', label: '3 Columns', icon: 'Columns3' },
            ],
        },
    ],
    resolve(values) {
        const cols = values.columns ?? '1'
        if (cols === '3') return 'faq-13'
        if (cols === '2') return 'faq-12'
        return 'faq-7'
    },
    extract(layoutId) {
        const preset = FAQ_C_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// FAQ Controls — Family D (Split + horizontal Q/A)
// ============================================
// Split layout with horizontal Q/A rows (dividers). Standalone.

const FAQ_D_CONTROL_DEF: LayoutControlDef = {
    category: 'faq',
    familyId: 'faq-d',
    axes: [],
    resolve() { return 'faq-8' },
    extract(layoutId) {
        const preset = FAQ_D_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// FAQ Controls — Family E (Horizontal Q/A + CTA)
// ============================================
// Full-width horizontal Q/A rows with bottom CTA. Standalone.

const FAQ_E_CONTROL_DEF: LayoutControlDef = {
    category: 'faq',
    familyId: 'faq-e',
    axes: [],
    resolve() { return 'faq-9' },
    extract(layoutId) {
        const preset = FAQ_E_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// FAQ Controls — Family F (Icon grid + CTA)
// ============================================
// 3×2 icon grid with centered bottom CTA. Standalone.

const FAQ_F_CONTROL_DEF: LayoutControlDef = {
    category: 'faq',
    familyId: 'faq-f',
    axes: [],
    resolve() { return 'faq-14' },
    extract(layoutId) {
        const preset = FAQ_F_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
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
    'cta-c': CTA_C_CONTROL_DEF,
    'header-a': HEADER_A_CONTROL_DEF,
    'header-b': HEADER_B_CONTROL_DEF,
    'header-c': HEADER_C_CONTROL_DEF,
    'header-d': HEADER_D_CONTROL_DEF,
    'faq-a': FAQ_A_CONTROL_DEF,
    'faq-b': FAQ_B_CONTROL_DEF,
    'faq-c': FAQ_C_CONTROL_DEF,
    'faq-d': FAQ_D_CONTROL_DEF,
    'faq-e': FAQ_E_CONTROL_DEF,
    'faq-f': FAQ_F_CONTROL_DEF,
}

/** Maps each layout category to its family IDs */
const CATEGORY_FAMILIES: Partial<Record<LayoutCategory, string[]>> = {
    hero: ['hero'],
    cta: ['cta-a', 'cta-b', 'cta-c'],
    header: ['header-a', 'header-b', 'header-c', 'header-d'],
    faq: ['faq-a', 'faq-b', 'faq-c', 'faq-d', 'faq-e', 'faq-f'],
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
