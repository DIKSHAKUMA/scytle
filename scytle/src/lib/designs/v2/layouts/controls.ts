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
import {
    FAMILY_A_PRESETS_MAP as HH_A_PRESETS_MAP,
    FAMILY_B_PRESETS_MAP as HH_B_PRESETS_MAP,
    FAMILY_C_PRESETS_MAP as HH_C_PRESETS_MAP,
    FAMILY_D_PRESETS_MAP as HH_D_PRESETS_MAP,
    FAMILY_E_PRESETS_MAP as HH_E_PRESETS_MAP,
    FAMILY_F_PRESETS_MAP as HH_F_PRESETS_MAP,
} from './hero-header/presets'
import {
    FAMILY_A_PRESETS_MAP as NAVBAR_A_PRESETS_MAP,
} from './navbar/presets'
import {
    FAMILY_A_PRESETS_MAP as FOOTER_A_PRESETS_MAP,
    FAMILY_B_PRESETS_MAP as FOOTER_B_PRESETS_MAP,
    FAMILY_C_PRESETS_MAP as FOOTER_C_PRESETS_MAP,
    FAMILY_D_PRESETS_MAP as FOOTER_D_PRESETS_MAP,
    FAMILY_E_PRESETS_MAP as FOOTER_E_PRESETS_MAP,
} from './footer/presets'

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
// Hero Header Controls — Family A (Split layouts)
// ============================================
// Side-by-side text + inline media. 4 axes: style×asset×placement×element.
// 16 variants: Hero Header 1–4, 19–22, 84–87, 92–95.

const HERO_HEADER_A_CONTROL_DEF: LayoutControlDef = {
    category: 'hero-header',
    familyId: 'hero-header-a',
    axes: [
        {
            key: 'style',
            label: 'Style',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'card', label: 'Card', icon: 'CreditCard' },
            ],
        },
        {
            key: 'asset',
            label: 'Asset',
            options: [
                { value: 'image', label: 'Image', icon: 'Image' },
                { value: 'video', label: 'Video', icon: 'Video' },
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
        const style = values.style ?? 'normal'
        const asset = values.asset ?? 'image'
        const placement = values.assetPlacement ?? 'right'
        const element = values.element ?? 'button'

        if (style === 'normal') {
            if (placement === 'right') {
                if (asset === 'image') return element === 'form' ? 'hero-header-2' : 'hero-header-1'
                return element === 'form' ? 'hero-header-4' : 'hero-header-3'
            }
            // left
            if (asset === 'image') return element === 'form' ? 'hero-header-20' : 'hero-header-19'
            return element === 'form' ? 'hero-header-22' : 'hero-header-21'
        }
        // card
        if (placement === 'right') {
            if (asset === 'image') return element === 'form' ? 'hero-header-85' : 'hero-header-84'
            return element === 'form' ? 'hero-header-87' : 'hero-header-86'
        }
        // card + left
        if (asset === 'image') return element === 'form' ? 'hero-header-93' : 'hero-header-92'
        return element === 'form' ? 'hero-header-95' : 'hero-header-94'
    },
    extract(layoutId) {
        const preset = HH_A_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Hero Header Controls — Family B (Full background)
// ============================================
// Centered text over background image/video, normal/card.
// 8 variants: Hero Header 5–8, 88–91.

const HERO_HEADER_B_CONTROL_DEF: LayoutControlDef = {
    category: 'hero-header',
    familyId: 'hero-header-b',
    axes: [
        {
            key: 'style',
            label: 'Style',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'card', label: 'Card', icon: 'CreditCard' },
            ],
        },
        {
            key: 'background',
            label: 'Background',
            options: [
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
        const style = values.style ?? 'normal'
        const bg = values.background ?? 'image'
        const element = values.element ?? 'button'

        if (style === 'normal') {
            if (bg === 'image') return element === 'form' ? 'hero-header-6' : 'hero-header-5'
            return element === 'form' ? 'hero-header-8' : 'hero-header-7'
        }
        // card
        if (bg === 'image') return element === 'form' ? 'hero-header-89' : 'hero-header-88'
        return element === 'form' ? 'hero-header-91' : 'hero-header-90'
    },
    extract(layoutId) {
        const preset = HH_B_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Hero Header Controls — Family C (Stacked)
// ============================================
// Image/video on top, two-column text below.
// 4 variants: Hero Header 9, 10, 13, 14.

const HERO_HEADER_C_CONTROL_DEF: LayoutControlDef = {
    category: 'hero-header',
    familyId: 'hero-header-c',
    axes: [
        {
            key: 'asset',
            label: 'Asset',
            options: [
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
        const asset = values.asset ?? 'image'
        const element = values.element ?? 'button'

        if (asset === 'image') return element === 'form' ? 'hero-header-10' : 'hero-header-9'
        return element === 'form' ? 'hero-header-14' : 'hero-header-13'
    },
    extract(layoutId) {
        const preset = HH_C_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Hero Header Controls — Family D (Split + extended)
// ============================================
// Text + description left, media right. No card/placement axes.
// 4 variants: Hero Header 15–18.

const HERO_HEADER_D_CONTROL_DEF: LayoutControlDef = {
    category: 'hero-header',
    familyId: 'hero-header-d',
    axes: [
        {
            key: 'asset',
            label: 'Asset',
            options: [
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
        const asset = values.asset ?? 'image'
        const element = values.element ?? 'button'

        if (asset === 'image') return element === 'form' ? 'hero-header-16' : 'hero-header-15'
        return element === 'form' ? 'hero-header-18' : 'hero-header-17'
    },
    extract(layoutId) {
        const preset = HH_D_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Hero Header Controls — Family E (Side-by-side)
// ============================================
// Text + media side-by-side, vertically centered content.
// 4 variants: Hero Header 26–29.

const HERO_HEADER_E_CONTROL_DEF: LayoutControlDef = {
    category: 'hero-header',
    familyId: 'hero-header-e',
    axes: [
        {
            key: 'asset',
            label: 'Asset',
            options: [
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
        const asset = values.asset ?? 'image'
        const element = values.element ?? 'button'

        if (asset === 'image') return element === 'form' ? 'hero-header-27' : 'hero-header-26'
        return element === 'form' ? 'hero-header-29' : 'hero-header-28'
    },
    extract(layoutId) {
        const preset = HH_E_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Hero Header Controls — Family F (Centered + optional bg)
// ============================================
// Centered hero with optional background (none/image/video), normal/card.
// 12 variants: Hero Header 23, 24, 30, 31, 33, 34, 96–101.

const HERO_HEADER_F_CONTROL_DEF: LayoutControlDef = {
    category: 'hero-header',
    familyId: 'hero-header-f',
    axes: [
        {
            key: 'style',
            label: 'Style',
            options: [
                { value: 'normal', label: 'Normal' },
                { value: 'card', label: 'Card', icon: 'CreditCard' },
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
            ],
        },
    ],
    resolve(values) {
        const style = values.style ?? 'normal'
        const bg = values.background ?? 'none'
        const element = values.element ?? 'button'

        if (style === 'normal') {
            if (bg === 'none') return element === 'form' ? 'hero-header-24' : 'hero-header-23'
            if (bg === 'image') return element === 'form' ? 'hero-header-31' : 'hero-header-30'
            return element === 'form' ? 'hero-header-34' : 'hero-header-33'
        }
        // card
        if (bg === 'none') return element === 'form' ? 'hero-header-97' : 'hero-header-96'
        if (bg === 'image') return element === 'form' ? 'hero-header-99' : 'hero-header-98'
        return element === 'form' ? 'hero-header-101' : 'hero-header-100'
    },
    extract(layoutId) {
        const preset = HH_F_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Navbar Controls (no axes — all standalone)
// ============================================

const NAVBAR_A_CONTROL_DEF: LayoutControlDef = {
    category: 'navbar',
    familyId: 'navbar-a',
    axes: [],
    resolve: () => undefined,
    extract: (layoutId: string) => {
        const preset = NAVBAR_A_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return {}
    },
}

// ============================================
// Footer Controls — Family A (Newsletter left + 3 columns)
// ============================================
// Style axis: normal/card. Footer 1 ↔ Footer 11.

const FOOTER_A_CONTROL_DEF: LayoutControlDef = {
    category: 'footer',
    familyId: 'footer-a',
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
        return style === 'card' ? 'footer-11' : 'footer-1'
    },
    extract(layoutId) {
        const preset = FOOTER_A_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Footer Controls — Family B (Logo + 3 columns + Subscribe)
// ============================================
// Style axis: normal/card. Footer 3 ↔ Footer 10.

const FOOTER_B_CONTROL_DEF: LayoutControlDef = {
    category: 'footer',
    familyId: 'footer-b',
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
        return style === 'card' ? 'footer-10' : 'footer-3'
    },
    extract(layoutId) {
        const preset = FOOTER_B_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Footer Controls — Family C (Contact left + 2 link lists)
// ============================================
// Style axis: normal/card. Footer 6 ↔ Footer 12.

const FOOTER_C_CONTROL_DEF: LayoutControlDef = {
    category: 'footer',
    familyId: 'footer-c',
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
        return style === 'card' ? 'footer-12' : 'footer-6'
    },
    extract(layoutId) {
        const preset = FOOTER_C_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Footer Controls — Family D (CTA + headingless links)
// ============================================
// Style axis: normal/card. Footer 9 ↔ Footer 15.

const FOOTER_D_CONTROL_DEF: LayoutControlDef = {
    category: 'footer',
    familyId: 'footer-d',
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
        return style === 'card' ? 'footer-15' : 'footer-9'
    },
    extract(layoutId) {
        const preset = FOOTER_D_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return { ...preset.axes }
    },
}

// ============================================
// Footer Controls — Family E (9 standalone, no axes)
// ============================================

const FOOTER_E_CONTROL_DEF: LayoutControlDef = {
    category: 'footer',
    familyId: 'footer-e',
    axes: [],
    resolve: () => undefined,
    extract(layoutId) {
        const preset = FOOTER_E_PRESETS_MAP[layoutId]
        if (!preset) return {}
        return {}
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
    'hero-header-a': HERO_HEADER_A_CONTROL_DEF,
    'hero-header-b': HERO_HEADER_B_CONTROL_DEF,
    'hero-header-c': HERO_HEADER_C_CONTROL_DEF,
    'hero-header-d': HERO_HEADER_D_CONTROL_DEF,
    'hero-header-e': HERO_HEADER_E_CONTROL_DEF,
    'hero-header-f': HERO_HEADER_F_CONTROL_DEF,
    'navbar-a': NAVBAR_A_CONTROL_DEF,
    'footer-a': FOOTER_A_CONTROL_DEF,
    'footer-b': FOOTER_B_CONTROL_DEF,
    'footer-c': FOOTER_C_CONTROL_DEF,
    'footer-d': FOOTER_D_CONTROL_DEF,
    'footer-e': FOOTER_E_CONTROL_DEF,
}

/** Maps each layout category to its family IDs */
const CATEGORY_FAMILIES: Partial<Record<LayoutCategory, string[]>> = {
    hero: ['hero'],
    cta: ['cta-a', 'cta-b', 'cta-c'],
    header: ['header-a', 'header-b', 'header-c', 'header-d'],
    faq: ['faq-a', 'faq-b', 'faq-c', 'faq-d', 'faq-e', 'faq-f'],
    'hero-header': ['hero-header-a', 'hero-header-b', 'hero-header-c', 'hero-header-d', 'hero-header-e', 'hero-header-f'],
    navbar: ['navbar-a'],
    footer: ['footer-a', 'footer-b', 'footer-c', 'footer-d', 'footer-e'],
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
