import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { CanvasView, DevView, CanvasNode, CanvasEdge } from '@/types'

interface CanvasState {
    // View state
    activeView: CanvasView
    devView: DevView
    isDevelopmentMode: boolean

    // Tool state
    activeTool: 'hand' | 'select' | 'add' | 'zoom'

    // Viewport state
    zoomLevel: number
    canvasPosition: { x: number; y: number }

    // Selection
    selectedNodeId: string | null
    selectedNodeIds: string[]

    // Canvas data
    nodes: CanvasNode[]
    edges: CanvasEdge[]

    // Actions - Views
    setView: (view: CanvasView) => void
    setDevView: (view: DevView) => void
    toggleDevelopmentMode: () => void

    // Actions - Tools
    setTool: (tool: 'hand' | 'select' | 'add' | 'zoom') => void

    // Actions - Viewport
    setZoom: (level: number) => void
    zoomIn: () => void
    zoomOut: () => void
    resetZoom: () => void
    setCanvasPosition: (position: { x: number; y: number }) => void

    // Actions - Selection
    selectNode: (nodeId: string | null) => void
    selectNodes: (nodeIds: string[]) => void
    clearSelection: () => void

    // Actions - Nodes
    setNodes: (nodes: CanvasNode[]) => void
    addNode: (node: CanvasNode) => void
    updateNode: (nodeId: string, data: Partial<CanvasNode>) => void
    removeNode: (nodeId: string) => void

    // Actions - Edges
    setEdges: (edges: CanvasEdge[]) => void
    addEdge: (edge: CanvasEdge) => void
    removeEdge: (edgeId: string) => void

    // Actions - Undo/Redo (basic)
    undo: () => void
    redo: () => void

    // Reset
    reset: () => void
}

const ZOOM_MIN = 0.25
const ZOOM_MAX = 2
const ZOOM_STEP = 0.1

// History for undo/redo
interface HistoryEntry {
    nodes: CanvasNode[]
    edges: CanvasEdge[]
}

let history: HistoryEntry[] = []
let historyIndex = -1

export const useCanvasStore = create<CanvasState>()(
    immer((set, get) => ({
        // Initial state - Views
        activeView: 'sitemap' as CanvasView,
        devView: 'code' as DevView,
        isDevelopmentMode: false,

        // Initial state - Tools
        activeTool: 'select' as const,

        // Initial state - Viewport
        zoomLevel: 1,
        canvasPosition: { x: 0, y: 0 },

        // Initial state - Selection
        selectedNodeId: null,
        selectedNodeIds: [],

        // Initial state - Canvas data
        nodes: [],
        edges: [],

        // View actions
        setView: (view: CanvasView) => {
            set(state => {
                state.activeView = view
                state.isDevelopmentMode = false
            })
        },

        setDevView: (view: DevView) => {
            set(state => {
                state.devView = view
            })
        },

        toggleDevelopmentMode: () => {
            set(state => {
                state.isDevelopmentMode = !state.isDevelopmentMode
            })
        },

        // Tool actions
        setTool: (tool) => {
            set(state => {
                state.activeTool = tool
            })
        },

        // Viewport actions
        setZoom: (level: number) => {
            set(state => {
                state.zoomLevel = Math.min(Math.max(level, ZOOM_MIN), ZOOM_MAX)
            })
        },

        zoomIn: () => {
            set(state => {
                state.zoomLevel = Math.min(state.zoomLevel + ZOOM_STEP, ZOOM_MAX)
            })
        },

        zoomOut: () => {
            set(state => {
                state.zoomLevel = Math.max(state.zoomLevel - ZOOM_STEP, ZOOM_MIN)
            })
        },

        resetZoom: () => {
            set(state => {
                state.zoomLevel = 1
                state.canvasPosition = { x: 0, y: 0 }
            })
        },

        setCanvasPosition: (position) => {
            set(state => {
                state.canvasPosition = position
            })
        },

        // Selection actions
        selectNode: (nodeId) => {
            set(state => {
                state.selectedNodeId = nodeId
                state.selectedNodeIds = nodeId ? [nodeId] : []
            })
        },

        selectNodes: (nodeIds) => {
            set(state => {
                state.selectedNodeIds = nodeIds
                state.selectedNodeId = nodeIds.length === 1 ? nodeIds[0] : null
            })
        },

        clearSelection: () => {
            set(state => {
                state.selectedNodeId = null
                state.selectedNodeIds = []
            })
        },

        // Node actions
        setNodes: (nodes) => {
            // Save to history
            const current = get()
            history = history.slice(0, historyIndex + 1)
            history.push({ nodes: current.nodes, edges: current.edges })
            historyIndex++

            set(state => {
                state.nodes = nodes
            })
        },

        addNode: (node) => {
            // Save to history
            const current = get()
            history = history.slice(0, historyIndex + 1)
            history.push({ nodes: current.nodes, edges: current.edges })
            historyIndex++

            set(state => {
                state.nodes.push(node)
            })
        },

        updateNode: (nodeId, data) => {
            set(state => {
                const index = state.nodes.findIndex(n => n.id === nodeId)
                if (index !== -1) {
                    state.nodes[index] = { ...state.nodes[index], ...data }
                }
            })
        },

        removeNode: (nodeId) => {
            // Save to history
            const current = get()
            history = history.slice(0, historyIndex + 1)
            history.push({ nodes: current.nodes, edges: current.edges })
            historyIndex++

            set(state => {
                state.nodes = state.nodes.filter(n => n.id !== nodeId)
                // Also remove edges connected to this node
                state.edges = state.edges.filter(
                    e => e.source !== nodeId && e.target !== nodeId
                )
                // Clear selection if this node was selected
                if (state.selectedNodeId === nodeId) {
                    state.selectedNodeId = null
                    state.selectedNodeIds = state.selectedNodeIds.filter(id => id !== nodeId)
                }
            })
        },

        // Edge actions
        setEdges: (edges) => {
            set(state => {
                state.edges = edges
            })
        },

        addEdge: (edge) => {
            set(state => {
                // Check for duplicate edges
                const exists = state.edges.some(
                    e => e.source === edge.source && e.target === edge.target
                )
                if (!exists) {
                    state.edges.push(edge)
                }
            })
        },

        removeEdge: (edgeId) => {
            set(state => {
                state.edges = state.edges.filter(e => e.id !== edgeId)
            })
        },

        // Undo/Redo
        undo: () => {
            if (historyIndex > 0) {
                historyIndex--
                const entry = history[historyIndex]
                set(state => {
                    state.nodes = entry.nodes
                    state.edges = entry.edges
                })
            }
        },

        redo: () => {
            if (historyIndex < history.length - 1) {
                historyIndex++
                const entry = history[historyIndex]
                set(state => {
                    state.nodes = entry.nodes
                    state.edges = entry.edges
                })
            }
        },

        // Reset
        reset: () => {
            history = []
            historyIndex = -1

            set(state => {
                state.activeView = 'sitemap'
                state.devView = 'code'
                state.isDevelopmentMode = false
                state.activeTool = 'select'
                state.zoomLevel = 1
                state.canvasPosition = { x: 0, y: 0 }
                state.selectedNodeId = null
                state.selectedNodeIds = []
                state.nodes = []
                state.edges = []
            })
        },
    }))
)
