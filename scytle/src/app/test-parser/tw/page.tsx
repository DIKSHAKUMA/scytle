'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useEditorStore } from '@/store/editor-store'
import { EditorCanvas } from '@/components/editor'
import type { FrameNode, ScytleNode } from '@/types/canvas'

// ═══════════════════════════════════════════════════════════════
// Parser Test — real canvas output
// Write Tailwind HTML → Parse → See it on the actual canvas
// Browser preview iframe floats on the canvas next to the parsed frame
// ═══════════════════════════════════════════════════════════════

const DEFAULT_HTML = `
<section class="w-full bg-[#F5F3ED] py-16 px-8 lg:px-16" style="font-family: 'Newsreader', serif;">
  <div class="max-w-7xl mx-auto flex flex-col gap-32">
    
    <!-- Theme 1 -->
    <div class="flex flex-col lg:flex-row items-center gap-16 group cursor-pointer">
      <div class="lg:w-5/12 order-2 lg:order-1 flex flex-col items-start pr-0 lg:pr-12">
        <span class="text-[#1A1A1A] text-2xl mb-4 font-semibold opacity-30">I.</span>
        <h2 class="text-5xl text-[#1A1A1A] leading-[1.2] mb-6 font-medium group-hover:text-[#8C2A1E] transition-colors" style="font-family: 'Lora', serif;">
          Architecture & Space
        </h2>
        <p class="text-xl text-[#5C5A55] leading-relaxed mb-10">
          Essays examining the psychological impact of the built environment. How the spaces we inhabit ultimately construct our internal narratives.
        </p>
        <div class="flex items-center justify-between w-full border-t border-[#EBE7DC] pt-6">
          <span class="text-[#1A1A1A] text-sm uppercase tracking-widest font-semibold">14 Essays</span>
          <span class="text-[#5C5A55] text-sm italic group-hover:text-[#8C2A1E] transition-colors flex items-center gap-2">Explore <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
        </div>
      </div>
      <div class="lg:w-7/12 order-1 lg:order-2 w-full aspect-[16/9] relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1744148621897-5fb0b6323543?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwYXJjaGl0ZWN0dXJlJTIwY29uY3JldGV8ZW58MHwwfHx8MTc3NjQwOTg0MHww&ixlib=rb-4.1.0&q=80&w=1080" alt="Minimalist architecture concrete" class="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-in-out" />
        <div class="absolute inset-0 border border-[#1A1A1A]/10 m-4 pointer-events-none"></div>
      </div>
    </div>

    <!-- Theme 2 -->
    <div class="flex flex-col lg:flex-row items-center gap-16 group cursor-pointer">
      <div class="lg:w-7/12 w-full aspect-[16/9] relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1604434295959-d3360b707f5a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxhbmFsb2clMjBmaWxtJTIwY2FtZXJhfGVufDB8MHx8fDE3NzY0MDk4NDF8MA&ixlib=rb-4.1.0&q=80&w=1080" alt="Analog film camera" class="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-in-out" />
        <div class="absolute inset-0 border border-[#1A1A1A]/10 m-4 pointer-events-none"></div>
      </div>
      <div class="lg:w-5/12 flex flex-col items-start pl-0 lg:pl-12">
        <span class="text-[#1A1A1A] text-2xl mb-4 font-semibold opacity-30">II.</span>
        <h2 class="text-5xl text-[#1A1A1A] leading-[1.2] mb-6 font-medium group-hover:text-[#8C2A1E] transition-colors" style="font-family: 'Lora', serif;">
          The Material World
        </h2>
        <p class="text-xl text-[#5C5A55] leading-relaxed mb-10">
          A defense of analog documentation in a digital ecosystem. Investigating the friction, permanence, and melancholy of physical objects.
        </p>
        <div class="flex items-center justify-between w-full border-t border-[#EBE7DC] pt-6">
          <span class="text-[#1A1A1A] text-sm uppercase tracking-widest font-semibold">9 Essays</span>
          <span class="text-[#5C5A55] text-sm italic group-hover:text-[#8C2A1E] transition-colors flex items-center gap-2">Explore <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
        </div>
      </div>
    </div>

    <!-- Theme 3 -->
    <div class="flex flex-col lg:flex-row items-center gap-16 group cursor-pointer">
      <div class="lg:w-5/12 order-2 lg:order-1 flex flex-col items-start pr-0 lg:pr-12">
        <span class="text-[#1A1A1A] text-2xl mb-4 font-semibold opacity-30">III.</span>
        <h2 class="text-5xl text-[#1A1A1A] leading-[1.2] mb-6 font-medium group-hover:text-[#8C2A1E] transition-colors" style="font-family: 'Lora', serif;">
          Solitude & Being
        </h2>
        <p class="text-xl text-[#5C5A55] leading-relaxed mb-10">
          Musings on isolation, the necessity of boredom, and the quiet act of withdrawing from the relentless noise of modernity.
        </p>
        <div class="flex items-center justify-between w-full border-t border-[#EBE7DC] pt-6">
          <span class="text-[#1A1A1A] text-sm uppercase tracking-widest font-semibold">22 Essays</span>
          <span class="text-[#5C5A55] text-sm italic group-hover:text-[#8C2A1E] transition-colors flex items-center gap-2">Explore <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
        </div>
      </div>
      <div class="lg:w-7/12 order-1 lg:order-2 w-full aspect-[16/9] relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1644892530846-06397fea62f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxzb2xpdHVkZSUyMGxhbmRzY2FwZXxlbnwwfDB8fHwxNzc2NDA5ODQwfDA&ixlib=rb-4.1.0&q=80&w=1080" alt="Solitude landscape" class="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-in-out" />
        <div class="absolute inset-0 border border-[#1A1A1A]/10 m-4 pointer-events-none"></div>
      </div>
    </div>
    
    <!-- Theme 4 -->
    <div class="flex flex-col lg:flex-row items-center gap-16 group cursor-pointer">
      <div class="lg:w-7/12 w-full aspect-[16/9] relative overflow-hidden">
        <img src="https://images.unsplash.com/photo-1643596028210-cdde50b7f37b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxvbGQlMjBjbG9jayUyMHZpbnRhZ2V8ZW58MHwwfHx8MTc3NjQwOTg0MHww&ixlib=rb-4.1.0&q=80&w=1080" alt="Vintage clock" class="w-full h-full object-cover grayscale opacity-90 group-hover:scale-105 group-hover:grayscale-0 transition-all duration-700 ease-in-out" />
        <div class="absolute inset-0 border border-[#1A1A1A]/10 m-4 pointer-events-none"></div>
      </div>
      <div class="lg:w-5/12 flex flex-col items-start pl-0 lg:pl-12">
        <span class="text-[#1A1A1A] text-2xl mb-4 font-semibold opacity-30">IV.</span>
        <h2 class="text-5xl text-[#1A1A1A] leading-[1.2] mb-6 font-medium group-hover:text-[#8C2A1E] transition-colors" style="font-family: 'Lora', serif;">
          Time & Memory
        </h2>
        <p class="text-xl text-[#5C5A55] leading-relaxed mb-10">
          How nostalgia functions as both a sanctuary and a prison. Exploring the non-linear way we experience our own personal histories.
        </p>
        <div class="flex items-center justify-between w-full border-t border-[#EBE7DC] pt-6">
          <span class="text-[#1A1A1A] text-sm uppercase tracking-widest font-semibold">11 Essays</span>
          <span class="text-[#5C5A55] text-sm italic group-hover:text-[#8C2A1E] transition-colors flex items-center gap-2">Explore <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>
        </div>
      </div>
    </div>

  </div>
</section>
`

const PAGE_WIDTH = 1440
const PREVIEW_GAP = 100
const PREVIEW_X = PAGE_WIDTH + PREVIEW_GAP // 1540 — right of the parsed frame

function createPageFrame(width: number = PAGE_WIDTH): FrameNode {
    return {
        id: crypto.randomUUID(),
        type: 'frame',
        name: 'Test Page',
        visible: true,
        locked: false,
        x: 0,
        y: 0,
        width,
        height: 800,
        sizing: { horizontal: 'fixed', vertical: 'hug' },
        positioning: 'auto',
        opacity: 1,
        rotation: 0,
        overflow: 'hidden',
        borderRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
        fills: [{ type: 'solid', color: '#FFFFFF', opacity: 1, visible: true }],
        shadows: [],
        children: [],
        layout: { mode: 'flex', direction: 'column', gap: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
    }
}

/** Build an iframe srcdoc that renders the HTML with Tailwind CDN */
function buildIframeSrcdoc(htmlContent: string): string {
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<script src="https://cdn.tailwindcss.com"><\/script>
<style>body{margin:0;font-family:system-ui,-apple-system,sans-serif;}</style>
</head>
<body>${htmlContent}</body>
</html>`
}

/**
 * Overlay iframe that floats on the canvas, positioned using the same
 * zoom/pan CSS vars as real canvas nodes. Appears to the right of the
 * parsed frame with a 100px gap.
 */
function BrowserPreviewOverlay({ srcdoc }: { srcdoc: string }) {
    const zoom = useEditorStore((s) => s.zoom)
    const panX = useEditorStore((s) => s.panX)
    const panY = useEditorStore((s) => s.panY)
    const iframeRef = useRef<HTMLIFrameElement>(null)
    const [iframeHeight, setIframeHeight] = useState(5000)

    // Poll iframe content height to auto-size
    useEffect(() => {
        if (!srcdoc) return
        const interval = setInterval(() => {
            try {
                const doc = iframeRef.current?.contentDocument
                if (doc?.body) {
                    const h = Math.max(
                        doc.body.scrollHeight,
                        doc.documentElement?.scrollHeight || 0,
                        doc.body.offsetHeight,
                    )
                    if (h > 0 && h !== iframeHeight) setIframeHeight(h)
                }
            } catch { /* cross-origin safety */ }
        }, 300)
        return () => clearInterval(interval)
    }, [srcdoc, iframeHeight])

    if (!srcdoc) return null

    // Position using same formula as canvas nodes:
    // left = canvasX * zoom + panX
    // top  = canvasY * zoom + panY
    const left = PREVIEW_X * zoom + panX
    const top = 0 * zoom + panY
    const width = PAGE_WIDTH * zoom
    const height = iframeHeight * zoom

    return (
        <div
            style={{
                position: 'absolute',
                left,
                top,
                width,
                height,
                pointerEvents: 'none', // Let canvas events pass through
                zIndex: 10,
            }}
        >
            {/* Label above the preview */}
            <div style={{
                position: 'absolute',
                top: -24 * zoom,
                left: 0,
                fontSize: 12 * zoom,
                fontWeight: 600,
                color: '#6b7280',
                fontFamily: 'system-ui, sans-serif',
                whiteSpace: 'nowrap',
            }}>
                Browser Preview (Ground Truth)
            </div>
            <iframe
                ref={iframeRef}
                srcDoc={srcdoc}
                style={{
                    width: PAGE_WIDTH,
                    height: iframeHeight,
                    border: 'none',
                    background: '#fff',
                    display: 'block',
                    transformOrigin: 'top left',
                    transform: `scale(${zoom})`,
                    pointerEvents: 'none', // All events go to canvas (zoom/pan)
                    boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                }}
                sandbox="allow-scripts"
                title="Browser Preview"
            />
        </div>
    )
}

export default function ParserTestPage() {
    const [html, setHtml] = useState(DEFAULT_HTML)
    const [timing, setTiming] = useState<{ convert: number; parse: number } | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [ready, setReady] = useState(false)
    const [iframeSrc, setIframeSrc] = useState<string>('')

    // Initialize editor store once on mount
    useEffect(() => {
        const store = useEditorStore.getState()
        if (store._projectId !== 'parser-test') {
            store.initForProject('parser-test')
        }
        setReady(true)
    }, [])

    const run = useCallback(async () => {
        if (!ready) return
        setLoading(true)
        setError(null)
        try {
            // Update browser preview
            setIframeSrc(buildIframeSrcdoc(html))

            // Step 1: Tailwind → inline styles
            const t0 = performance.now()
            const res = await fetch('/api/tailwind-to-inline', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ html }),
            })
            if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`)
            const { html: inlined } = await res.json()
            const convertMs = Math.round(performance.now() - t0)

            // Step 2: DOMParser → ScytleNode tree
            const t1 = performance.now()
            const { parseHtmlViaDOMParser } = await import('@/lib/parser/domparser')
            const parsed = await parseHtmlViaDOMParser(inlined, 'Section')
            const parseMs = Math.round(performance.now() - t1)


            // Step 3: Inject into canvas
            const store = useEditorStore.getState()
            store.setNodes([])

            const pageFrame = createPageFrame(PAGE_WIDTH)
            store.addNode(pageFrame)

            const newNode: ScytleNode = parsed.children.length === 1 ? parsed.children[0] : parsed
            newNode.width = PAGE_WIDTH
            newNode.sizing = { horizontal: 'fill', vertical: 'hug' }

            store.addNode(newNode, pageFrame.id)

            setTiming({ convert: convertMs, parse: parseMs })
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e))
        }
        setLoading(false)
    }, [html, ready])

    const clearCanvas = useCallback(() => {
        useEditorStore.getState().setNodes([])
        setIframeSrc('')
        setTiming(null)
    }, [])

    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'system-ui, sans-serif' }}>
            {/* Left: Code Editor Panel */}
            <div style={{
                width: 420,
                minWidth: 420,
                borderRight: '1px solid #e5e5e5',
                display: 'flex',
                flexDirection: 'column',
                background: '#fafafa',
            }}>
                {/* Toolbar */}
                <div style={{
                    padding: '10px 12px',
                    borderBottom: '1px solid #e5e5e5',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: '#fff',
                }}>
                    <button
                        onClick={run}
                        disabled={loading || !ready}
                        style={{
                            padding: '7px 18px',
                            background: loading ? '#999' : '#3b82f6',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            letterSpacing: '0.02em',
                        }}
                    >
                        {loading ? '⏳ Parsing...' : '▶ Parse & Render'}
                    </button>
                    <button
                        onClick={clearCanvas}
                        style={{
                            padding: '7px 14px',
                            background: '#fff',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: 6,
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        Clear
                    </button>
                    {timing && (
                        <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#999', marginLeft: 'auto' }}>
                            tw:{timing.convert}ms dom:{timing.parse}ms total:{timing.convert + timing.parse}ms
                        </span>
                    )}
                </div>

                {error && (
                    <div style={{
                        padding: '8px 12px',
                        background: '#fef2f2',
                        borderBottom: '1px solid #fecaca',
                        color: '#dc2626',
                        fontSize: 11,
                        fontFamily: 'monospace',
                    }}>
                        {error}
                    </div>
                )}

                {/* HTML Editor */}
                <textarea
                    value={html}
                    onChange={e => setHtml(e.target.value)}
                    spellCheck={false}
                    style={{
                        flex: 1,
                        background: '#1e1e1e',
                        color: '#d4d4d4',
                        border: 'none',
                        padding: 12,
                        fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
                        fontSize: 11,
                        lineHeight: 1.6,
                        resize: 'none',
                        outline: 'none',
                        tabSize: 2,
                    }}
                />
            </div>

            {/* Right: Canvas + Browser Preview Overlay */}
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {ready && <EditorCanvas showToolbar={false} />}
                {/* Browser preview floats on canvas at x=1540, same zoom/pan */}
                <BrowserPreviewOverlay srcdoc={iframeSrc} />
            </div>
        </div>
    )
}
