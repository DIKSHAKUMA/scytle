import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Node, Edge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from '@xyflow/react'

export type CanvasTool = 'select' | 'hand' | 'add'

// Export edge type for components
export interface SitemapEdge {
    id: string
    source: string
    target: string
    sourceHandle: string | null
    targetHandle: string | null
    type: string
}

// Constants for layout spacing - Relume-style spacing
const LAYOUT = {
    NODE_WIDTH: 280,           // Wider to accommodate section descriptions
    NODE_BASE_HEIGHT: 60,      // Base height (header)
    SECTION_HEIGHT: 50,        // Height per section (name + description + padding)
    SECTION_GAP_HEIGHT: 12,    // Height for gap between sections (+ button area)
    HORIZONTAL_GAP: 80,        // Gap between sibling nodes (larger for cleaner connectors)
    VERTICAL_GAP: 80,          // Gap between levels
    PROJECT_HEIGHT: 50,
    ADD_SECTION_BUTTON_HEIGHT: 40, // Height for "Add Section" button at bottom
}

// Calculate estimated node height based on sections
const estimateNodeHeight = (node: Node): number => {
    if (node.type === 'project') return LAYOUT.PROJECT_HEIGHT
    const sections = (node.data as { sections?: (string | SectionData)[] })?.sections || []
    const sectionCount = sections.length
    
    if (sectionCount === 0) {
        // Just the header + empty state add button
        return LAYOUT.NODE_BASE_HEIGHT + LAYOUT.ADD_SECTION_BUTTON_HEIGHT
    }
    
    // Header + sections + gaps between sections + add button
    const sectionsHeight = sectionCount * LAYOUT.SECTION_HEIGHT
    const gapsHeight = Math.max(0, sectionCount - 1) * LAYOUT.SECTION_GAP_HEIGHT
    return LAYOUT.NODE_BASE_HEIGHT + sectionsHeight + gapsHeight + LAYOUT.ADD_SECTION_BUTTON_HEIGHT
}

// Tree layout helper - calculates proper positions for sitemap hierarchy
const calculateTreeLayout = (
    nodes: Node[],
    edges: Edge[]
): Node[] => {
    if (nodes.length === 0) return nodes

    // Build adjacency map (parent -> children)
    const children: Record<string, string[]> = {}
    const nodeMap: Record<string, Node> = {}

    nodes.forEach(node => {
        nodeMap[node.id] = node
        children[node.id] = []
    })

    edges.forEach(edge => {
        if (children[edge.source]) {
            children[edge.source].push(edge.target)
        }
    })

    // Find root (node with no incoming edges)
    const targets = new Set(edges.map(e => e.target))
    const root = nodes.find(n => !targets.has(n.id)) || nodes[0]
    if (!root) return nodes

    // Step 1: Calculate subtree widths (bottom-up)
    const subtreeWidth: Record<string, number> = {}

    const calculateWidth = (nodeId: string): number => {
        const nodeChildren = children[nodeId] || []
        if (nodeChildren.length === 0) {
            subtreeWidth[nodeId] = LAYOUT.NODE_WIDTH
            return LAYOUT.NODE_WIDTH
        }

        const childWidths = nodeChildren.map(id => calculateWidth(id))
        const totalWidth = childWidths.reduce((sum, w) => sum + w, 0) +
            (nodeChildren.length - 1) * LAYOUT.HORIZONTAL_GAP
        subtreeWidth[nodeId] = Math.max(LAYOUT.NODE_WIDTH, totalWidth)
        return subtreeWidth[nodeId]
    }

    calculateWidth(root.id)

    // Step 2: Position nodes (top-down)
    const positions: Record<string, { x: number; y: number }> = {}

    const positionNode = (nodeId: string, centerX: number, y: number) => {
        const node = nodeMap[nodeId]
        if (!node) return

        // Position node so its center is at centerX
        positions[nodeId] = {
            x: centerX - LAYOUT.NODE_WIDTH / 2,
            y
        }

        const nodeChildren = children[nodeId] || []
        if (nodeChildren.length === 0) return

        // Calculate the height of this node for next level positioning
        const nodeHeight = estimateNodeHeight(node)
        const childY = y + nodeHeight + LAYOUT.VERTICAL_GAP

        // Calculate total width needed for all children
        const totalChildWidth = nodeChildren.reduce(
            (sum, id) => sum + subtreeWidth[id], 0
        ) + (nodeChildren.length - 1) * LAYOUT.HORIZONTAL_GAP

        // Start positioning from left, centered under parent
        let childCenterX = centerX - totalChildWidth / 2

        nodeChildren.forEach(childId => {
            const childSubtreeWidth = subtreeWidth[childId]
            // Position child at center of its subtree allocation
            positionNode(childId, childCenterX + childSubtreeWidth / 2, childY)
            childCenterX += childSubtreeWidth + LAYOUT.HORIZONTAL_GAP
        })
    }

    // Start layout from center of canvas
    positionNode(root.id, 600, 50)

    // Apply calculated positions to nodes
    return nodes.map(node => ({
        ...node,
        position: positions[node.id] || node.position,
    }))
}

interface SitemapState {
    // Nodes and edges
    nodes: Node[]
    edges: Edge[]

    // Canvas state
    activeTool: CanvasTool
    zoomLevel: number
    isPanning: boolean
    selectedNodeId: string | null

    // Section picker state
    sectionPickerOpen: boolean
    sectionPickerTargetPageId: string | null
    sectionPickerInsertIndex: number | null

    // ReactFlow instance reference for zoom control
    reactFlowZoom: ((zoom: number) => void) | null
    reactFlowFitView: (() => void) | null

    // History for undo/redo
    history: { nodes: Node[]; edges: Edge[] }[]
    historyIndex: number

    // Actions
    setNodes: (nodes: Node[]) => void
    setEdges: (edges: Edge[]) => void
    onNodesChange: (changes: NodeChange[]) => void
    onEdgesChange: (changes: EdgeChange[]) => void

    setActiveTool: (tool: CanvasTool) => void
    setZoomLevel: (zoom: number) => void
    setIsPanning: (isPanning: boolean) => void
    setSelectedNodeId: (id: string | null) => void
    setReactFlowFunctions: (zoomFn: (zoom: number) => void, fitViewFn: () => void) => void

    addNode: (node: Node) => void
    updateNode: (id: string, data: Partial<Node['data']>) => void
    deleteNode: (id: string) => void

    addEdge: (edge: Edge) => void
    deleteEdge: (id: string) => void

    // Section actions
    openSectionPicker: (pageId: string, insertIndex: number) => void
    closeSectionPicker: () => void
    addSectionToPage: (pageId: string, section: SectionData, atIndex: number) => void
    removeSectionFromPage: (pageId: string, sectionIndex: number) => void
    moveSectionInPage: (pageId: string, fromIndex: number, toIndex: number) => void

    undo: () => void
    redo: () => void
    saveToHistory: () => void

    fitView: () => void
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void

    // Load sitemap from AI
    loadSitemap: (pages: AIGeneratedPage[], projectName?: string) => void
    loadRawSitemap: (nodes: Node[], edges: SitemapEdge[]) => void
    clearSitemap: () => void
}

// AI-generated page structure - supports both legacy string[] and new object format
interface SectionData {
    id?: string
    name: string
    description?: string
}

interface AIGeneratedPage {
    id: string
    label: string
    slug: string
    sections: (string | SectionData)[]
    children?: AIGeneratedPage[]
}

// Default demo sitemap - positions will be recalculated by layout
const defaultNodes: Node[] = [
    {
        id: 'project',
        type: 'project',
        position: { x: 500, y: 50 },
        data: { label: 'My Project' },
        draggable: false,
    },
    {
        id: 'home',
        type: 'page',
        position: { x: 500, y: 170 },
        data: {
            label: 'Home',
            slug: '/',
            sections: ['Hero', 'Features', 'Testimonials', 'CTA']
        },
    },
    {
        id: 'about',
        type: 'page',
        position: { x: 110, y: 420 },
        data: {
            label: 'About',
            slug: '/about',
            sections: ['Our Story', 'Team', 'Values']
        },
    },
    {
        id: 'services',
        type: 'page',
        position: { x: 370, y: 420 },
        data: {
            label: 'Services',
            slug: '/services',
            sections: ['Service List', 'Pricing', 'FAQ']
        },
    },
    {
        id: 'contact',
        type: 'page',
        position: { x: 630, y: 420 },
        data: {
            label: 'Contact',
            slug: '/contact',
            sections: ['Header', 'Contact Form', 'Map', 'Footer']
        },
    },
]

const defaultEdges: Edge[] = [
    { id: 'e-project-home', source: 'project', target: 'home', type: 'sitemap' },
    { id: 'e-home-about', source: 'home', target: 'about', type: 'sitemap' },
    { id: 'e-home-services', source: 'home', target: 'services', type: 'sitemap' },
    { id: 'e-home-contact', source: 'home', target: 'contact', type: 'sitemap' },
]

export const useSitemapStore = create<SitemapState>()(
    immer((set, get) => ({
        nodes: defaultNodes,
        edges: defaultEdges,
        activeTool: 'select',
        zoomLevel: 100,
        isPanning: false,
        selectedNodeId: null,
        sectionPickerOpen: false,
        sectionPickerTargetPageId: null,
        sectionPickerInsertIndex: null,
        reactFlowZoom: null,
        reactFlowFitView: null,
        history: [{ nodes: defaultNodes, edges: defaultEdges }],
        historyIndex: 0,

        setNodes: (nodes) => set({ nodes }),
        setEdges: (edges) => set({ edges }),

        onNodesChange: (changes) => {
            set((state) => {
                state.nodes = applyNodeChanges(changes, state.nodes) as Node[]
            })
        },

        onEdgesChange: (changes) => {
            set((state) => {
                state.edges = applyEdgeChanges(changes, state.edges) as Edge[]
            })
        },

        setActiveTool: (tool) => set({ activeTool: tool }),
        setZoomLevel: (zoom) => set({ zoomLevel: Math.round(zoom) }),
        setIsPanning: (isPanning) => set({ isPanning }),
        setSelectedNodeId: (id) => set({ selectedNodeId: id }),
        setReactFlowFunctions: (zoomFn, fitViewFn) => set({ reactFlowZoom: zoomFn, reactFlowFitView: fitViewFn }),

        addNode: (node) => {
            set((state) => {
                state.nodes.push(node)
            })
            get().saveToHistory()
        },

        updateNode: (id, data) => {
            set((state) => {
                const node = state.nodes.find(n => n.id === id)
                if (node) {
                    node.data = { ...node.data, ...data }
                }
            })
            get().saveToHistory()
        },

        deleteNode: (id) => {
            set((state) => {
                state.nodes = state.nodes.filter(n => n.id !== id)
                state.edges = state.edges.filter(e => e.source !== id && e.target !== id)
            })
            get().saveToHistory()
        },

        addEdge: (edge) => {
            set((state) => {
                state.edges.push(edge)
            })
            get().saveToHistory()
        },

        deleteEdge: (id) => {
            set((state) => {
                state.edges = state.edges.filter(e => e.id !== id)
            })
            get().saveToHistory()
        },

        saveToHistory: () => {
            set((state) => {
                const newHistory = state.history.slice(0, state.historyIndex + 1)
                newHistory.push({
                    nodes: JSON.parse(JSON.stringify(state.nodes)),
                    edges: JSON.parse(JSON.stringify(state.edges))
                })
                // Keep only last 50 states
                if (newHistory.length > 50) newHistory.shift()
                state.history = newHistory
                state.historyIndex = newHistory.length - 1
            })
        },

        undo: () => {
            const { historyIndex, history } = get()
            if (historyIndex > 0) {
                set((state) => {
                    state.historyIndex = historyIndex - 1
                    state.nodes = JSON.parse(JSON.stringify(history[historyIndex - 1].nodes))
                    state.edges = JSON.parse(JSON.stringify(history[historyIndex - 1].edges))
                })
            }
        },

        redo: () => {
            const { historyIndex, history } = get()
            if (historyIndex < history.length - 1) {
                set((state) => {
                    state.historyIndex = historyIndex + 1
                    state.nodes = JSON.parse(JSON.stringify(history[historyIndex + 1].nodes))
                    state.edges = JSON.parse(JSON.stringify(history[historyIndex + 1].edges))
                })
            }
        },

        fitView: () => {
            const { reactFlowFitView } = get()
            if (reactFlowFitView) {
                reactFlowFitView()
            }
        },

        zoomIn: () => {
            const { zoomLevel, reactFlowZoom } = get()
            const newZoom = Math.min(200, zoomLevel + 25)
            set({ zoomLevel: newZoom })
            if (reactFlowZoom) {
                reactFlowZoom(newZoom / 100)
            }
        },

        zoomOut: () => {
            const { zoomLevel, reactFlowZoom } = get()
            const newZoom = Math.max(25, zoomLevel - 25)
            set({ zoomLevel: newZoom })
            if (reactFlowZoom) {
                reactFlowZoom(newZoom / 100)
            }
        },

        resetZoom: () => {
            const { reactFlowZoom } = get()
            set({ zoomLevel: 100 })
            if (reactFlowZoom) {
                reactFlowZoom(1)
            }
        },

        // Section picker actions
        openSectionPicker: (pageId, insertIndex) => {
            set({
                sectionPickerOpen: true,
                sectionPickerTargetPageId: pageId,
                sectionPickerInsertIndex: insertIndex,
            })
        },

        closeSectionPicker: () => {
            set({
                sectionPickerOpen: false,
                sectionPickerTargetPageId: null,
                sectionPickerInsertIndex: null,
            })
        },

        addSectionToPage: (pageId, section, atIndex) => {
            set((state) => {
                const node = state.nodes.find(n => n.id === pageId)
                if (node && node.data) {
                    const sections = [...((node.data as { sections?: SectionData[] }).sections || [])]
                    // Insert section at the specified index
                    sections.splice(atIndex, 0, {
                        id: `${pageId}-${section.id}-${Date.now()}`,
                        name: section.name,
                        description: section.description,
                    })
                    node.data = { ...node.data, sections }
                }
            })
            // Recalculate layout after adding section (node height changed)
            set((state) => {
                state.nodes = calculateTreeLayout(state.nodes, state.edges)
            })
            get().saveToHistory()
            get().closeSectionPicker()
        },

        removeSectionFromPage: (pageId, sectionIndex) => {
            set((state) => {
                const node = state.nodes.find(n => n.id === pageId)
                if (node && node.data) {
                    const sections = [...((node.data as { sections?: SectionData[] }).sections || [])]
                    sections.splice(sectionIndex, 1)
                    node.data = { ...node.data, sections }
                }
            })
            // Recalculate layout after removing section (node height changed)
            set((state) => {
                state.nodes = calculateTreeLayout(state.nodes, state.edges)
            })
            get().saveToHistory()
        },

        moveSectionInPage: (pageId, fromIndex, toIndex) => {
            if (fromIndex === toIndex) return
            set((state) => {
                const node = state.nodes.find(n => n.id === pageId)
                if (node && node.data) {
                    const sections = [...((node.data as { sections?: SectionData[] }).sections || [])]
                    const [movedSection] = sections.splice(fromIndex, 1)
                    sections.splice(toIndex, 0, movedSection)
                    node.data = { ...node.data, sections }
                }
            })
            get().saveToHistory()
        },

        loadSitemap: (pages, projectName = 'My Project') => {
            // Convert AI-generated pages to ReactFlow nodes and edges
            const rawNodes: Node[] = []
            const rawEdges: Edge[] = []

            // Add project node at the top
            rawNodes.push({
                id: 'project',
                type: 'project',
                position: { x: 0, y: 0 }, // Will be laid out by dagre
                data: { label: projectName },
                draggable: false,
            })

            // Find home page (first page or page with slug '/')
            const homePage = pages.find(p => p.slug === '/' || p.id === 'home') || pages[0]
            const otherPages = pages.filter(p => p !== homePage)

            // Add home page
            if (homePage) {
                rawNodes.push({
                    id: homePage.id,
                    type: 'page',
                    position: { x: 0, y: 0 },
                    data: {
                        label: homePage.label,
                        slug: homePage.slug,
                        sections: homePage.sections,
                        isHome: true,
                    },
                })

                // Connect project to home
                rawEdges.push({
                    id: `e-project-${homePage.id}`,
                    source: 'project',
                    target: homePage.id,
                    type: 'sitemap',
                })

                // Add other pages
                otherPages.forEach((page) => {
                    rawNodes.push({
                        id: page.id,
                        type: 'page',
                        position: { x: 0, y: 0 },
                        data: {
                            label: page.label,
                            slug: page.slug,
                            sections: page.sections,
                        },
                    })

                    // Connect home to each child page
                    rawEdges.push({
                        id: `e-${homePage.id}-${page.id}`,
                        source: homePage.id,
                        target: page.id,
                        type: 'sitemap',
                    })

                    // Handle nested children
                    if (page.children?.length) {
                        page.children.forEach((child) => {
                            rawNodes.push({
                                id: child.id,
                                type: 'page',
                                position: { x: 0, y: 0 },
                                data: {
                                    label: child.label,
                                    slug: child.slug,
                                    sections: child.sections,
                                },
                            })

                            rawEdges.push({
                                id: `e-${page.id}-${child.id}`,
                                source: page.id,
                                target: child.id,
                                type: 'sitemap',
                            })
                        })
                    }
                })
            }

            // Apply tree layout for proper spacing
            const layoutedNodes = calculateTreeLayout(rawNodes, rawEdges)

            set((state) => {
                state.nodes = layoutedNodes
                state.edges = rawEdges
                state.selectedNodeId = null
            })
            get().saveToHistory()

            // Fit view after layout is applied
            setTimeout(() => {
                const { reactFlowFitView } = get()
                if (reactFlowFitView) {
                    reactFlowFitView()
                }
            }, 100)
        },

        loadRawSitemap: (nodes, edges) => {
            set((state) => {
                state.nodes = nodes
                state.edges = edges as Edge[]
                state.selectedNodeId = null
            })
            get().saveToHistory()
        },

        clearSitemap: () => {
            set((state) => {
                state.nodes = defaultNodes
                state.edges = defaultEdges
                state.selectedNodeId = null
                state.history = []
                state.historyIndex = -1
            })
        },
    }))
)
