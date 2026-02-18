/**
 * V2 Selection System — Barrel export
 *
 * Components:
 *   - SectionSelectionWrapper: wraps each section for click/dblclick handling
 *   - LayerWrapper: wraps each block for hover/click selection
 *   - SelectionKeyboardHandler: global shortcut listener (renders nothing)
 *   - BlockContextMenu: right-click menu for blocks
 *
 * Store:
 *   - useSelectionStore (re-exported from @/store/selection-store)
 */

export { SectionSelectionWrapper } from './section-wrapper'
export { LayerWrapper } from './layer-wrapper'
export { SelectionKeyboardHandler } from './keyboard-handler'
export { BlockContextMenu } from './context-menu'
export {
    useSelectionStore,
    type SelectionMode,
    type SelectionState,
    type HoverTarget,
    type ClipboardPayload,
} from '@/store/selection-store'
