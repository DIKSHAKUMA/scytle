'use client'

import { useCallback, useEffect, useRef } from 'react'
import {
    ReactFlow,
    Background,
    useReactFlow,
    Connection,
    BackgroundVariant,
    NodeTypes,
    EdgeTypes,
    ReactFlowProvider,
    ConnectionLineType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { PageNode } from './nodes/page-node'
import { ProjectNode } from './nodes/project-node'
import { SitemapEdge as SitemapEdgeComponent } from './edges/sitemap-edge'
import { useSitemapStore, SitemapEdge } from '@/store/sitemap-store'

// Custom node types
const nodeTypes: NodeTypes = {
    page: PageNode,
    project: ProjectNode,
}

// Custom edge types
const edgeTypes: EdgeTypes = {
    sitemap: SitemapEdgeComponent,
}

interface SitemapViewProps {
    projectName?: string
}

function SitemapCanvas({ projectName }: SitemapViewProps) {
    const reactFlowInstance = useReactFlow()
    const containerRef = useRef<HTMLDivElement>(null)

    const {
        nodes,
        edges,
        activeTool,
        isPanning,
        onNodesChange,
        onEdgesChange,
        setEdges,
        setZoomLevel,
        setIsPanning,
        setSelectedNodeId,
        setActiveTool,
        setReactFlowFunctions,
        addNode,
    } = useSitemapStore()

    // Register ReactFlow zoom functions for toolbar controls
    useEffect(() => {
        const zoomTo = (zoom: number) => {
            reactFlowInstance.zoomTo(zoom, { duration: 200 })
        }
        const fitView = () => {
            reactFlowInstance.fitView({ padding: 0.3, duration: 300 })
        }
        setReactFlowFunctions(zoomTo, fitView)
    }, [reactFlowInstance, setReactFlowFunctions])

    // Update project name in nodes
    useEffect(() => {
        if (projectName) {
            const projectNode = nodes.find(n => n.id === 'project')
            if (projectNode && projectNode.data.label !== projectName) {
                useSitemapStore.getState().updateNode('project', { label: projectName })
            }
        }
    }, [projectName, nodes])

    // Handle space key for panning (Figma-style) - only when not in an input field
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Don't intercept space key when typing in inputs
            const target = e.target as HTMLElement
            if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                return
            }

            if (e.code === 'Space' && !e.repeat) {
                e.preventDefault()
                setIsPanning(true)
            }
        }

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setIsPanning(false)
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            window.removeEventListener('keyup', handleKeyUp)
        }
    }, [setIsPanning])

    // Handle zoom changes - update on every move for real-time feedback
    const onMove = useCallback(() => {
        const zoom = reactFlowInstance.getZoom()
        setZoomLevel(Math.round(zoom * 100))
    }, [reactFlowInstance, setZoomLevel])

    // Handle new connections
    const onConnect = useCallback(
        (params: Connection) => {
            const newEdge: SitemapEdge = {
                ...params,
                type: 'smoothstep',
                id: `e-${params.source}-${params.target}`,
                source: params.source || '',
                target: params.target || '',
                sourceHandle: params.sourceHandle ?? null,
                targetHandle: params.targetHandle ?? null,
            }
            setEdges([...edges, newEdge])
        },
        [edges, setEdges]
    )

    // Handle node selection
    const onNodeClick = useCallback((_: React.MouseEvent, node: { id: string }) => {
        setSelectedNodeId(node.id)
    }, [setSelectedNodeId])

    // Handle pane click - deselect or add new node in add mode
    const onPaneClick = useCallback((event: React.MouseEvent) => {
        if (activeTool === 'add') {
            // Get click position in flow coordinates
            const reactFlowBounds = containerRef.current?.getBoundingClientRect()
            if (!reactFlowBounds) return

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            })

            // Create a new page node
            const newNodeId = `page-${Date.now()}`
            const newNode = {
                id: newNodeId,
                type: 'page',
                position,
                data: {
                    label: 'New Page',
                    slug: '/new-page',
                    sections: [],
                    isNew: true,
                },
            }

            addNode(newNode)
            setSelectedNodeId(newNodeId)
            setActiveTool('select') // Switch back to select after adding
        } else {
            setSelectedNodeId(null)
        }
    }, [activeTool, reactFlowInstance, addNode, setSelectedNodeId, setActiveTool])

    // Determine cursor and pan mode
    const shouldPan = isPanning || activeTool === 'hand'
    const cursorClass = shouldPan
        ? 'cursor-grab active:cursor-grabbing'
        : activeTool === 'add'
            ? 'cursor-crosshair'
            : ''  // Use ReactFlow's default cursor (pointer for nodes, default for canvas)

    return (
        <div ref={containerRef} className={`w-full h-full ${cursorClass}`}>
            <style jsx global>{`
                .react-flow__pane {
                    cursor: default !important;
                }
                .react-flow__node {
                    cursor: pointer !important;
                }
                .react-flow__edge-path {
                    cursor: pointer;
                }
            `}</style>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onNodeClick={onNodeClick}
                onPaneClick={onPaneClick}
                onMove={onMove}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                fitView
                fitViewOptions={{
                    padding: 0.2,
                    duration: 400,
                }}
                panOnDrag={shouldPan}
                selectionOnDrag={!shouldPan}
                // Figma-style: two-finger scroll to pan, pinch to zoom
                panOnScroll={true}
                panOnScrollSpeed={0.8}
                zoomOnScroll={false}
                zoomOnPinch={true}
                zoomOnDoubleClick={false}
                preventScrolling={true}
                minZoom={0.1}
                maxZoom={2}
                defaultEdgeOptions={{
                    type: 'sitemap',
                    animated: false,
                }}
                connectionLineType={ConnectionLineType.SmoothStep}
                proOptions={{ hideAttribution: true }}
                className="bg-muted/20"
            >
                <Background
                    variant={BackgroundVariant.Dots}
                    gap={24}
                    size={1}
                    color="#d1d5db"
                />
            </ReactFlow>
        </div>
    )
}

export function SitemapView({ projectName = 'My Project' }: SitemapViewProps) {
    return (
        <ReactFlowProvider>
            <SitemapCanvas projectName={projectName} />
        </ReactFlowProvider>
    )
}