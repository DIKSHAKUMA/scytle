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
<section class="w-full bg-[#FAF8F5] py-32 px-12">
  <div class="max-w-7xl mx-auto">
    <div class="flex items-end justify-between mb-24">
      <div class="max-w-xl">
        <h3 class="text-5xl text-[#1A1A1A] font-light leading-tight mb-6" style="font-family: 'Cormorant Garamond', serif;">
          Curated <span class="italic text-[#D4AF37]">Destinations</span>
        </h3>
        <p class="text-[#5A5A5A] leading-relaxed" style="font-family: 'Manrope', sans-serif;">
          From the sun-drenched cliffs of the Mediterranean to the serene temples of the East, our handpicked collection represents the pinnacle of experiential travel.
        </p>
      </div>
      <a href="#" class="hidden md:flex items-center gap-3 text-[#1A1A1A] uppercase tracking-widest text-xs border-b border-[#1A1A1A] pb-1 hover:text-[#D4AF37] hover:border-[#D4AF37] transition-all" style="font-family: 'Manrope', sans-serif;">
        View All Locations
      </a>
    </div>

    <div class="grid grid-cols-12 gap-8">
      <!-- Destination 1 (Tall) -->
      <div class="col-span-12 md:col-span-5 flex flex-col group cursor-pointer">
        <div class="relative overflow-hidden aspect-[4/5] mb-6">
          <img src="https://images.unsplash.com/photo-1752888444795-1775afa62e65?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxhbWFsZmklMjBjb2FzdCUyMGNsaWZmc2lkZXxlbnwwfDB8fHwxNzc2MzYzOTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" alt="Amalfi Coast" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
          <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
        </div>
        <div class="flex justify-between items-start">
          <div>
            <span class="text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-2 block" style="font-family: 'Manrope', sans-serif;">Italy</span>
            <h4 class="text-3xl text-[#1A1A1A] font-light" style="font-family: 'Cormorant Garamond', serif;">Amalfi Coast</h4>
          </div>
          <span class="text-[#5A5A5A] text-sm italic" style="font-family: 'Cormorant Garamond', serif;">from $8,500</span>
        </div>
      </div>

      <!-- Destination 2 & 3 (Stacked offset) -->
      <div class="col-span-12 md:col-span-7 flex flex-col justify-between pt-24 md:pl-12">
        
        <div class="flex flex-col group cursor-pointer mb-20 md:ml-auto md:w-[85%]">
          <div class="relative overflow-hidden aspect-[16/9] mb-6">
            <img src="https://images.unsplash.com/photo-1700474896901-6afb362d2f8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxreW90byUyMGF1dHVtbiUyMHRlbXBsZXxlbnwwfDB8fHwxNzc2MzYzOTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" alt="Kyoto Temple" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-2 block" style="font-family: 'Manrope', sans-serif;">Japan</span>
              <h4 class="text-3xl text-[#1A1A1A] font-light" style="font-family: 'Cormorant Garamond', serif;">Kyoto Serenity</h4>
            </div>
            <span class="text-[#5A5A5A] text-sm italic" style="font-family: 'Cormorant Garamond', serif;">from $6,200</span>
          </div>
        </div>

        <div class="flex flex-col group cursor-pointer w-full md:w-[70%]">
          <div class="relative overflow-hidden aspect-square mb-6">
            <img src="https://images.unsplash.com/photo-1667987566780-3b31fa5485c8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxzYWZhcmklMjBsb2RnZSUyMHNlcmVuZ2V0aXxlbnwwfDB8fHwxNzc2MzYzOTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" alt="Serengeti Safari" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105">
            <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500"></div>
          </div>
          <div class="flex justify-between items-start">
            <div>
              <span class="text-[#D4AF37] text-xs uppercase tracking-[0.2em] mb-2 block" style="font-family: 'Manrope', sans-serif;">Tanzania</span>
              <h4 class="text-3xl text-[#1A1A1A] font-light" style="font-family: 'Cormorant Garamond', serif;">Serengeti Wild</h4>
            </div>
            <span class="text-[#5A5A5A] text-sm italic" style="font-family: 'Cormorant Garamond', serif;">from $12,450</span>
          </div>
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
