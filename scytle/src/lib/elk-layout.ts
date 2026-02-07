'use client'

import ELK, { type ElkNode } from 'elkjs/lib/elk.bundled.js'
import type { Node, Edge } from '@xyflow/react'

const elk = new ELK()

interface LayoutOptions {
    direction?: 'DOWN' | 'RIGHT' | 'LEFT' | 'UP'
    nodeSpacing?: number
    layerSpacing?: number
}

// ELK edge section with bend points (from layout output)
interface ElkEdgeSectionOutput {
    id: string
    startPoint: { x: number; y: number }
    endPoint: { x: number; y: number }
    bendPoints?: Array<{ x: number; y: number }>
}

// ELK layouted edge (layout output)
interface ElkLayoutedEdge {
    id: string
    sources: string[]
    targets: string[]
    sections?: ElkEdgeSectionOutput[]
}

// Layouted ELK graph (response type)
interface ElkLayoutedGraph extends ElkNode {
    edges?: ElkLayoutedEdge[]
}

/**
 * Apply ELK layout to nodes and edges
 * Uses orthogonal edge routing for clean, right-angled connectors
 */
export async function applyElkLayout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): Promise<{ nodes: Node[]; edges: Edge[] }> {
    const {
        direction = 'DOWN',
        nodeSpacing = 50,
        layerSpacing = 100,
    } = options

    // Filter out any invalid edges (where source or target doesn't exist)
    const nodeIds = new Set(nodes.map(n => n.id))
    const validEdges = edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))

    // Build ELK graph
    const elkGraph = {
        id: 'root',
        layoutOptions: {
            'elk.algorithm': 'layered',
            'elk.direction': direction,
            'elk.spacing.nodeNode': String(nodeSpacing),
            'elk.layered.spacing.nodeNodeBetweenLayers': String(layerSpacing),
            'elk.edgeRouting': 'ORTHOGONAL',
            'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
            'elk.layered.nodePlacement.strategy': 'BRANDES_KOEPF',
            'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
        },
        children: nodes.map(node => ({
            id: node.id,
            width: node.measured?.width || node.width || 300,
            height: node.measured?.height || node.height || 200,
        })),
        edges: validEdges.map(edge => ({
            id: edge.id,
            sources: [edge.source],
            targets: [edge.target],
        })),
    }

    try {
        const layoutedGraph = await elk.layout(elkGraph) as ElkLayoutedGraph

        // Apply positions back to nodes
        const layoutedNodes = nodes.map(node => {
            const elkNode = layoutedGraph.children?.find(n => n.id === node.id)
            if (elkNode) {
                return {
                    ...node,
                    position: {
                        x: elkNode.x ?? node.position.x,
                        y: elkNode.y ?? node.position.y,
                    },
                }
            }
            return node
        })

        // Create orthogonal edge paths from ELK routing
        const layoutedEdges = validEdges.map(edge => {
            const elkEdge = layoutedGraph.edges?.find(e => e.id === edge.id)

            // If ELK provides bend points, use them for the edge path
            if (elkEdge?.sections?.[0]) {
                const section = elkEdge.sections[0]
                const bendPoints = section.bendPoints || []

                // Create a custom edge with bend points data
                return {
                    ...edge,
                    data: {
                        ...edge.data,
                        bendPoints: [
                            section.startPoint,
                            ...bendPoints,
                            section.endPoint,
                        ],
                    },
                }
            }

            return edge
        })

        return { nodes: layoutedNodes, edges: layoutedEdges }
    } catch (error) {
        console.error('ELK layout failed:', error)
        // Return original nodes/edges on error
        return { nodes, edges }
    }
}

/**
 * Calculate tree layout for sitemap (simpler, synchronous)
 * Falls back when ELK is not needed (initial render)
 */
export function calculateSimpleTreeLayout(
    nodes: Node[],
    edges: Edge[],
    options: LayoutOptions = {}
): { nodes: Node[] } {
    const {
        direction = 'DOWN',
        nodeSpacing = 50,
        layerSpacing = 150,
    } = options

    // Build adjacency map for tree structure
    const childrenMap = new Map<string, string[]>()
    edges.forEach(edge => {
        const children = childrenMap.get(edge.source) || []
        children.push(edge.target)
        childrenMap.set(edge.source, children)
    })

    // Find root nodes (no incoming edges)
    const hasParent = new Set(edges.map(e => e.target))
    const roots = nodes.filter(n => !hasParent.has(n.id))

    // Position nodes using simple tree layout
    const positioned = new Map<string, { x: number; y: number }>()
    let maxX = 0

    function positionSubtree(
        nodeId: string,
        depth: number,
        startX: number
    ): number {
        const node = nodes.find(n => n.id === nodeId)
        if (!node) return startX

        const children = childrenMap.get(nodeId) || []
        const nodeWidth = node.measured?.width || node.width || 300

        if (children.length === 0) {
            // Leaf node
            const x = startX
            positioned.set(nodeId, { x, y: depth * layerSpacing })
            return startX + nodeWidth + nodeSpacing
        }

        // Position all children first
        let currentX = startX
        const childPositions: number[] = []

        for (const childId of children) {
            const beforeX = currentX
            currentX = positionSubtree(childId, depth + 1, currentX)
            const childNode = nodes.find(n => n.id === childId)
            const childWidth = childNode?.measured?.width || childNode?.width || 300
            childPositions.push(beforeX + childWidth / 2)
        }

        // Center parent over children
        const minChildX = Math.min(...childPositions)
        const maxChildX = Math.max(...childPositions)
        const centerX = (minChildX + maxChildX) / 2 - nodeWidth / 2

        positioned.set(nodeId, { x: centerX, y: depth * layerSpacing })

        return currentX
    }

    // Position all root nodes
    let currentX = 0
    for (const root of roots) {
        currentX = positionSubtree(root.id, 0, currentX)
    }

    // Apply positions to nodes
    return {
        nodes: nodes.map(node => {
            const pos = positioned.get(node.id)
            if (pos) {
                return { ...node, position: pos }
            }
            return node
        }),
    }
}
