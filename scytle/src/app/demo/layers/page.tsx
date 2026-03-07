'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas, LayersPanel, PropertiesPanel } from '@/components/editor'
import { createSeedHeroSection } from '@/components/editor/seed-data'

/**
 * Standalone demo for the layers panel — bypasses auth.
 * Visit: /demo/layers
 */
export default function LayersDemoPage() {
    useEffect(() => {
        if (useEditorStore.getState().nodes.length === 0) {
            useEditorStore.getState().setNodes([createSeedHeroSection()])
        }
    }, [])

    const zoom = useEditorStore((s) => s.zoom)

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background">
            {/* Simple header */}
            <header className="h-10 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0 z-10">
                <span className="text-sm font-medium">Layers Panel Demo</span>
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">
                    {Math.round(zoom * 100)}%
                </span>
            </header>

            {/* Main area: layers panel + canvas */}
            <div className="flex-1 flex overflow-hidden">
                <div className="w-60 shrink-0 overflow-hidden">
                    <LayersPanel />
                </div>
                <div className="flex-1 overflow-hidden">
                    <EditorCanvas />
                </div>
                <div className="w-64 shrink-0 border-l border-border bg-background overflow-hidden">
                    <PropertiesPanel />
                </div>
            </div>
        </div>
    )
}
