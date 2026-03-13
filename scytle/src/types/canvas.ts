import { z } from 'zod'
import { generateId } from '@/lib/utils'

// ============================================================
// Canvas Constants
// ============================================================

export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 256
export const DEFAULT_ZOOM = 1
export const ZOOM_STEP = 1.2

export type CanvasTool = 'select' | 'hand' | 'frame' | 'text'

// ============================================================
// Zod Sub-Schemas (non-recursive leaf types)
// ============================================================

export const SolidFillSchema = z.object({
    type: z.literal('solid'),
    color: z.string(), // oklch, hex, or rgba
})

export const GradientFillSchema = z.object({
    type: z.literal('gradient'),
    gradient: z.string(), // CSS gradient string
})

export const ImageFillSchema = z.object({
    type: z.literal('image'),
    src: z.string(),
    fit: z.enum(['cover', 'contain', 'fill']),
})

export const FillSchema = z.discriminatedUnion('type', [
    SolidFillSchema,
    GradientFillSchema,
    ImageFillSchema,
])

export const ShadowSchema = z.object({
    type: z.enum(['drop', 'inner']),
    color: z.string(),
    x: z.number(),
    y: z.number(),
    blur: z.number(),
    spread: z.number(),
    visible: z.boolean().optional(),
})

export const BorderSchema = z.object({
    color: z.string(),
    width: z.number(),
    style: z.enum(['solid', 'dashed', 'dotted']),
})

export const SizingSchema = z.object({
    horizontal: z.enum(['fixed', 'hug', 'fill']),
    vertical: z.enum(['fixed', 'hug', 'fill']),
})

export const PaddingSchema = z.object({
    top: z.number(),
    right: z.number(),
    bottom: z.number(),
    left: z.number(),
})

export const LayoutSchema = z.object({
    mode: z.enum(['flex', 'grid', 'none']),
    direction: z.enum(['row', 'column']).optional(),
    justify: z.enum(['start', 'end', 'center', 'between']).optional(),
    align: z.enum(['start', 'end', 'center', 'stretch', 'baseline']).optional(),
    wrap: z.boolean().optional(),
    gap: z.number().optional(),
    columns: z.union([z.number(), z.string()]).optional(),
    rows: z.union([z.number(), z.string()]).optional(),
    columnGap: z.number().optional(),
    rowGap: z.number().optional(),
})

export const BorderRadiusSchema = z.union([
    z.number(),
    z.object({
        topLeft: z.number(),
        topRight: z.number(),
        bottomRight: z.number(),
        bottomLeft: z.number(),
    }),
])

// ============================================================
// TypeScript Types from Zod Schemas
// ============================================================

export type Fill = z.infer<typeof FillSchema>
export type Shadow = z.infer<typeof ShadowSchema>
export type Border = z.infer<typeof BorderSchema>
export type Sizing = z.infer<typeof SizingSchema>
export type Padding = z.infer<typeof PaddingSchema>
export type Layout = z.infer<typeof LayoutSchema>
export type BorderRadius = z.infer<typeof BorderRadiusSchema>

// ============================================================
// Node Type Interfaces (manual — recursive tree can't infer)
// ============================================================

/** Properties shared by all node types */
export interface BaseNodeProperties {
    id: string
    name: string
    visible: boolean
    locked: boolean
    x: number
    y: number
    width: number
    height: number
    sizing: Sizing
    positioning: 'auto' | 'absolute'
    opacity: number
    rotation: number
    overflow: 'visible' | 'hidden'
    borderRadius: BorderRadius
    fills: Fill[]
    border?: Border
    shadows: Shadow[]
}

/** Container node — div with optional auto-layout (flexbox/grid) */
export interface FrameNode extends BaseNodeProperties {
    type: 'frame'
    children: ScytleNode[]
    layout: Layout
    padding: Padding
}

/** Text leaf node — renders as heading/paragraph/span */
export interface TextNode extends BaseNodeProperties {
    type: 'text'
    characters: string
    fontFamily: string
    fontWeight: number
    fontStyle?: 'normal' | 'italic'
    fontSize: number
    lineHeight: number | 'auto'
    letterSpacing: number
    textAlign: 'left' | 'center' | 'right' | 'justify'
    textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
    textDecoration: 'none' | 'underline' | 'line-through'
    autoResize: 'none' | 'width-and-height' | 'height' | 'truncate'
    maxLines?: number
    color: string
    htmlTag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'a' | 'li'
}

/** Image node — renders as img tag or placeholder */
export interface ImageNode extends BaseNodeProperties {
    type: 'image'
    src: string
    alt: string
    fit: 'cover' | 'contain' | 'fill'
    isPlaceholder: boolean
    placeholderLabel?: string
}

/** Discriminated union of all node types */
export type ScytleNode = FrameNode | TextNode | ImageNode

/** Just the type discriminator values */
export type NodeType = ScytleNode['type']

// ============================================================
// Default Values
// ============================================================

const DEFAULT_BASE: Omit<BaseNodeProperties, 'id' | 'name'> = {
    visible: true,
    locked: false,
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    sizing: { horizontal: 'fixed', vertical: 'fixed' },
    positioning: 'auto',
    opacity: 1,
    rotation: 0,
    overflow: 'visible',
    borderRadius: 0,
    fills: [],
    shadows: [],
}

const DEFAULT_PADDING: Padding = { top: 0, right: 0, bottom: 0, left: 0 }

const DEFAULT_LAYOUT: Layout = {
    mode: 'none',
}

// ============================================================
// Factory Functions
// ============================================================

/** Create a new FrameNode with sensible defaults */
export function createFrame(
    overrides?: Partial<Omit<FrameNode, 'type'>>
): FrameNode {
    return {
        ...DEFAULT_BASE,
        id: generateId(),
        name: 'Frame',
        type: 'frame',
        children: [],
        layout: DEFAULT_LAYOUT,
        padding: DEFAULT_PADDING,
        ...overrides,
    }
}

/** Create a new TextNode with sensible defaults */
export function createText(
    overrides?: Partial<Omit<TextNode, 'type'>>
): TextNode {
    return {
        ...DEFAULT_BASE,
        id: generateId(),
        name: 'Text',
        type: 'text',
        width: 100,
        height: 24,
        sizing: { horizontal: 'hug', vertical: 'hug' },
        characters: 'Text',
        fontFamily: 'Inter',
        fontWeight: 400,
        fontSize: 16,
        lineHeight: 'auto',
        letterSpacing: 0,
        textAlign: 'left',
        textTransform: 'none',
        textDecoration: 'none',
        autoResize: 'width-and-height',
        color: '#000000',
        ...overrides,
    }
}

/** Create a new ImageNode with sensible defaults */
export function createImage(
    overrides?: Partial<Omit<ImageNode, 'type'>>
): ImageNode {
    return {
        ...DEFAULT_BASE,
        id: generateId(),
        name: 'Image',
        type: 'image',
        width: 300,
        height: 200,
        src: '',
        alt: '',
        fit: 'cover',
        isPlaceholder: true,
        placeholderLabel: 'Image',
        ...overrides,
    }
}

// ============================================================
// Tree Utility Functions
// ============================================================

/**
 * Recursively find a node by ID in the tree.
 * Works with both real state and immer draft state.
 */
export function findNodeById(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodes: readonly any[],
    id: string
): ScytleNode | null {
    for (const node of nodes) {
        if (node.id === id) return node as ScytleNode
        if (node.type === 'frame' && node.children) {
            const found = findNodeById(node.children, id)
            if (found) return found
        }
    }
    return null
}

/**
 * Find the parent frame containing a node with the given ID,
 * plus the index of that node within the parent's children.
 * Returns null if the node is at the top level or not found.
 *
 * For top-level nodes, returns { parent: null, index }.
 */
export function findParentOfNode(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nodes: readonly any[],
    id: string
): { parent: FrameNode | null; index: number } | null {
    // Check top level
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
            return { parent: null, index: i }
        }
    }

    // Recurse into frame children
    for (const node of nodes) {
        if (node.type === 'frame' && node.children) {
            for (let i = 0; i < node.children.length; i++) {
                if (node.children[i].id === id) {
                    return { parent: node as FrameNode, index: i }
                }
            }
            const found = findParentOfNode(node.children, id)
            if (found) return found
        }
    }

    return null
}

/**
 * Collect all node IDs in a subtree (for multi-delete, etc.)
 */
export function collectNodeIds(node: ScytleNode): string[] {
    const ids = [node.id]
    if (node.type === 'frame') {
        for (const child of node.children) {
            ids.push(...collectNodeIds(child))
        }
    }
    return ids
}

/**
 * Deep clone a node tree, generating fresh IDs for all nodes.
 * Used for copy/paste and duplicate operations.
 */
export function deepCloneWithNewIds(node: ScytleNode): ScytleNode {
    const clone = JSON.parse(JSON.stringify(node)) as ScytleNode
    clone.id = generateId()
    if (clone.type === 'frame') {
        clone.children = clone.children.map((child) => deepCloneWithNewIds(child))
    }
    return clone
}

/**
 * Find the deepest frame that contains the given canvas-space point.
 * Returns the frame ID, the point relative to the frame, and the frame's
 * canvas-absolute position.
 *
 * Uses an inset margin so clicks near the edge of a frame don't auto-nest.
 * Used for auto-nesting when drawing frames/creating text inside existing frames.
 */
export function findContainingFrame(
    nodes: readonly ScytleNode[],
    canvasX: number,
    canvasY: number,
    offsetX: number = 0,
    offsetY: number = 0,
    excludeIds?: ReadonlySet<string>,
    inset: number = 10,
): { frameId: string; relX: number; relY: number; frameAbsX: number; frameAbsY: number } | null {
    // Reverse iterate — topmost visual layer (last in array) checked first
    for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        // Skip excluded nodes (and their entire subtree)
        if (excludeIds && excludeIds.has(node.id)) continue

        if (node.type === 'frame') {
            const nodeAbsX = offsetX + node.x
            const nodeAbsY = offsetY + node.y

            // Point must be inside the frame (inset from all edges)
            if (
                canvasX >= nodeAbsX + inset &&
                canvasX <= nodeAbsX + node.width - inset &&
                canvasY >= nodeAbsY + inset &&
                canvasY <= nodeAbsY + node.height - inset
            ) {
                // Check children first (deeper nesting wins)
                const childResult = findContainingFrame(
                    node.children,
                    canvasX,
                    canvasY,
                    nodeAbsX,
                    nodeAbsY,
                    excludeIds,
                    inset,
                )
                if (childResult) return childResult

                return {
                    frameId: node.id,
                    relX: canvasX - nodeAbsX,
                    relY: canvasY - nodeAbsY,
                    frameAbsX: nodeAbsX,
                    frameAbsY: nodeAbsY,
                }
            }
        }
    }
    return null
}

/**
 * Get the canvas-absolute position of a node by walking up the parent chain.
 * For top-level nodes, returns their x,y directly.
 * For nested nodes, accumulates parent positions.
 */
export function getNodeCanvasPosition(
    nodes: readonly ScytleNode[],
    nodeId: string,
): { x: number; y: number } | null {
    const node = findNodeById(nodes as ScytleNode[], nodeId)
    if (!node) return null

    let x = node.x
    let y = node.y
    let curId = nodeId

    // Walk up parents accumulating offsets
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const result = findParentOfNode(nodes as ScytleNode[], curId)
        if (!result || !result.parent) break
        x += result.parent.x
        y += result.parent.y
        curId = result.parent.id
    }

    return { x, y }
}
