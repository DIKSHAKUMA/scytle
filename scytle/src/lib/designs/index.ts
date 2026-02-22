/**
 * Design System — V2 Only
 *
 * V1 families/presets have been removed.
 * All layout rendering now goes through V2 layout templates.
 *
 * Re-exports the V2 layout system for convenience.
 */

export {
    LAYOUT_REGISTRY,
    ALL_LAYOUT_TEMPLATES,
    LAYOUT_TEMPLATES_MAP,
    getTemplatesByCategory,
    getTemplateById,
} from './v2/layouts'

export type {
    LayoutTemplate,
    LayoutCategory,
    LayoutRegistry,
    LayoutProps,
} from './v2/layouts'

export type {
    LayoutControlAxis,
    LayoutControlOption,
    LayoutControlDef,
} from './v2/layouts'

export {
    getControlDef,
    getControlDefForLayout,
    getControlDefsForCategory,
} from './v2/layouts'
