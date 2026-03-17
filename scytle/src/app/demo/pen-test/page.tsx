'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas } from '@/components/editor'
import { PropertiesPanel } from '@/components/editor'

/**
 * Standalone test page for the Pen tool & Vector Edit system.
 * Bypasses auth — starts with an empty canvas.
 * Visit: /demo/pen-test
 */
export default function PenTestPage() {
    useEffect(() => {
        // Start with empty canvas for clean pen tool testing
        const store = useEditorStore.getState()
        if (store.nodes.length > 0) {
            store.setNodes([])
        }
        // Reset to select tool
        store.setActiveTool('select')
    }, [])

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-background" data-testid="pen-test-page">
            {/* Simple header */}
            <header className="h-10 border-b border-border bg-background flex items-center px-4 gap-3 shrink-0 z-10">
                <span className="text-sm font-medium">Pen Tool Test</span>
            </header>

            {/* Main area: canvas + properties panel */}
            <div className="flex-1 flex overflow-hidden">
                <div className="flex-1 overflow-hidden" data-testid="canvas-container">
                    <EditorCanvas />
                </div>
                <div className="w-64 shrink-0 border-l border-border bg-background overflow-y-auto" data-testid="properties-panel">
                    <PropertiesPanel />
                </div>
            </div>
        </div>
    )
}
