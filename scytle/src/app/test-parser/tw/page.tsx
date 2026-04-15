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
<div style="font-family: system-ui, sans-serif">

<!-- ═══════════════════════════════════════════════════════════════
     ISSUE 1: GRID — Do children fill their 1fr columns?
     Expected: 3 equal-width cards filling the full row width
     Bug: Cards might render at "hug" width (as narrow as content)
     ═══════════════════════════════════════════════════════════════ -->
<section class="w-full bg-[#1A1A1A] py-16 px-16">
  <h2 class="text-2xl font-bold text-white mb-8">ISSUE 1: Grid cols-3 — should fill</h2>
  <div class="grid grid-cols-3 gap-6">
    <div class="bg-[#FFD700] rounded-2xl p-8 flex flex-col items-center gap-4">
      <div class="w-24 h-24 rounded-full bg-[#333] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop" class="w-full h-full object-cover" alt="Burgers" />
      </div>
      <span class="text-lg font-bold text-[#1A1A1A]">Burgers</span>
      <p class="text-sm text-[#333] text-center">Classic American favorites with premium toppings</p>
    </div>
    <div class="bg-[#FF4500] rounded-2xl p-8 flex flex-col items-center gap-4">
      <div class="w-24 h-24 rounded-full bg-[#333] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop" class="w-full h-full object-cover" alt="Pizza" />
      </div>
      <span class="text-lg font-bold text-white">Pizza</span>
      <p class="text-sm text-white text-center">Wood-fired artisan pizzas from local chefs</p>
    </div>
    <div class="bg-[#2E8B57] rounded-2xl p-8 flex flex-col items-center gap-4">
      <div class="w-24 h-24 rounded-full bg-[#333] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop" class="w-full h-full object-cover" alt="Healthy" />
      </div>
      <span class="text-lg font-bold text-white">Healthy</span>
      <p class="text-sm text-white text-center">Fresh salads, bowls, and smoothies</p>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════
     ISSUE 2: ABSOLUTE — Does inset-0 overlay fill parent?
     Expected: Image fills section, gradient overlay covers it,
               text sits at bottom-left on top of everything
     Bug: Overlay/image might collapse to 0x0 or not layer correctly
     ═══════════════════════════════════════════════════════════════ -->
<section class="w-full relative" style="min-height: 500px">
  <h2 class="absolute top-4 left-16 text-sm font-bold text-white" style="z-index: 99">ISSUE 2: Absolute inset-0 overlay</h2>
  <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1440&h=500&fit=crop" class="w-full h-full object-cover absolute inset-0" alt="Food hero" />
  <div class="absolute inset-0" style="background: linear-gradient(to right, rgba(0,0,0,0.8), transparent)"></div>
  <div class="absolute bottom-12 left-16 max-w-lg">
    <h1 class="text-5xl font-bold text-white" style="line-height: 1.1">CRAVING IT? We've got it.</h1>
    <p class="text-lg text-[#ccc] mt-4">Find your next favorite meal from 5,000+ restaurants</p>
    <div class="flex gap-4 mt-6">
      <button class="bg-[#FF6B00] text-white font-bold px-8 py-3 rounded-lg">Order Now</button>
      <button class="border-2 border-white text-white font-bold px-8 py-3 rounded-lg">Browse</button>
    </div>
  </div>
</section>

<!-- ═══════════════════════════════════════════════════════════════
     ISSUE 3: WIDTH — Do restaurant cards fill grid cells?
     Expected: 3 cards equal width, images stretch to card width,
               each card fills its 1fr column
     Bug: Cards might be narrow, not filling their grid column
     ═══════════════════════════════════════════════════════════════ -->
<section class="w-full bg-[#0A0A0A] py-16 px-16">
  <h2 class="text-2xl font-bold text-white mb-8">ISSUE 3: Grid cards — width fill</h2>
  <div class="grid grid-cols-3 gap-8">
    <div class="bg-[#1e1e1e] rounded-2xl overflow-hidden">
      <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=500&h=250&fit=crop" class="w-full h-48 object-cover" alt="Restaurant 1" />
      <div class="p-6">
        <h3 class="text-xl font-bold text-white">Thai Orchid Café</h3>
        <p class="text-sm text-[#888] mt-1">Thai cuisine • 4.8 ★ • 25-35 min</p>
        <div class="flex gap-2 mt-3">
          <span class="bg-[#333] text-[#aaa] text-xs px-3 py-1 rounded-full">Popular</span>
          <span class="bg-[#333] text-[#aaa] text-xs px-3 py-1 rounded-full">Free delivery</span>
        </div>
      </div>
    </div>
    <div class="bg-[#1e1e1e] rounded-2xl overflow-hidden">
      <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&h=250&fit=crop" class="w-full h-48 object-cover" alt="Restaurant 2" />
      <div class="p-6">
        <h3 class="text-xl font-bold text-white">Le Fork Bistro</h3>
        <p class="text-sm text-[#888] mt-1">French bistro • 4.9 ★ • 30-45 min</p>
        <div class="flex gap-2 mt-3">
          <span class="bg-[#333] text-[#aaa] text-xs px-3 py-1 rounded-full">Top rated</span>
          <span class="bg-[#333] text-[#aaa] text-xs px-3 py-1 rounded-full">$$</span>
        </div>
      </div>
    </div>
    <div class="bg-[#1e1e1e] rounded-2xl overflow-hidden">
      <img src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=500&h=250&fit=crop" class="w-full h-48 object-cover" alt="Restaurant 3" />
      <div class="p-6">
        <h3 class="text-xl font-bold text-white">Garden Grill Co.</h3>
        <p class="text-sm text-[#888] mt-1">American grill • 4.7 ★ • 20-30 min</p>
        <div class="flex gap-2 mt-3">
          <span class="bg-[#333] text-[#aaa] text-xs px-3 py-1 rounded-full">New</span>
          <span class="bg-[#333] text-[#aaa] text-xs px-3 py-1 rounded-full">Patio</span>
        </div>
      </div>
    </div>
  </div>
</section>

</div>
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
