/**
 * Shared React contexts for the V2 wireframe selection system.
 *
 * - PageIdContext: set in page-frame.tsx, consumed by FrameBlock for store mutations
 * - SectionIdContext: set in SectionSelectionWrapper, consumed by LayerWrapper for auto-enter
 */

import { createContext } from 'react'

/** The page ID containing the current section/block tree */
export const PageIdContext = createContext<string | null>(null)

/** The section ID wrapping the current block tree */
export const SectionIdContext = createContext<string | null>(null)

/**
 * When a Set<string>: child blocks whose IDs are in the set render with
 * useSortable() for Figma-style drag-to-reorder. Provided by SortableChildren
 * in FrameBlock. When null (default): no drag-sort, LayerWrapper renders plain.
 */
export const SortableItemsContext = createContext<Set<string> | null>(null)
