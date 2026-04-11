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

<!-- ═══ TEST 1: Hero with 2-column grid — inner content frame sizing ═══ -->
<section class="w-full bg-[#0F172A]">
  <div class="grid grid-cols-2 gap-16 px-16 py-16" style="min-height: 500px">
    <div class="flex flex-col justify-center gap-4">
      <span class="text-sm font-semibold text-[#0D9488] uppercase tracking-widest">240+ Verified Brands</span>
      <h1 class="text-5xl font-bold text-white" style="line-height: 1.15">Discover Brands Worth Buying From.</h1>
      <p class="text-base text-[#94A3B8]">BrandHub connects shoppers with the world's most thoughtful, independent, and celebrated brands — all in one curated marketplace.</p>
      <div class="flex gap-3 mt-4">
        <div class="bg-[#0D9488] text-white font-semibold px-6 py-3 text-sm" style="border-radius: 8px">Search</div>
      </div>
      <div class="flex gap-6 mt-4">
        <div class="flex flex-col gap-1">
          <span class="text-2xl font-bold text-[#0D9488]">240+</span>
          <span class="text-sm text-[#94A3B8]">New brands this month</span>
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-2xl font-bold text-[#0D9488]">2.4M</span>
          <span class="text-sm text-[#94A3B8]">Shoppers</span>
        </div>
      </div>
    </div>
    <div class="flex items-center justify-center" style="position: relative; overflow: hidden; border-radius: 16px">
      <img src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&h=400&fit=crop" alt="Brand product" class="w-full h-full object-cover" />
    </div>
  </div>
</section>

<!-- ═══ TEST 2: Revenue chart — bars with percentage heights inside flex-col ═══ -->
<section class="w-full bg-[#1E293B] px-16 py-16">
  <div class="bg-[#0F172A] p-8 flex flex-col gap-6" style="border-radius: 16px">
    <div class="flex justify-between items-center">
      <h3 class="text-xl font-bold text-white">Revenue Overview</h3>
      <div class="bg-[#0D9488] text-white text-xs font-semibold px-3 py-1" style="border-radius: 6px">This Month</div>
    </div>
    <!-- Chart bars: each bar has explicit height -->
    <div class="flex items-end gap-2" style="height: 200px">
      <div class="flex-1 bg-[#0D9488]" style="height: 40%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 65%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 45%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 70%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 55%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 80%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 30%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 90%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 50%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 75%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 60%; border-radius: 4px 4px 0 0"></div>
      <div class="flex-1 bg-[#0D9488]" style="height: 95%; border-radius: 4px 4px 0 0"></div>
    </div>
    <div class="flex justify-between">
      <div class="flex flex-col">
        <span class="text-3xl font-bold text-white">$48,290</span>
        <span class="text-sm text-[#94A3B8]">Total revenue this month</span>
      </div>
      <div class="flex flex-col items-end">
        <span class="text-3xl font-bold text-[#0D9488]">1,247</span>
        <span class="text-sm text-[#94A3B8]">Orders processed</span>
      </div>
    </div>
  </div>
</section>

<!-- ═══ TEST 3: Footer with inherited text-white on links ═══ -->
<footer class="w-full bg-[#0F172A] text-white px-16 py-12">
  <div class="grid grid-cols-4 gap-8 mb-8">
    <div class="flex flex-col gap-2">
      <span class="text-lg font-bold text-white">BrandHub</span>
      <p class="text-sm text-[#94A3B8]">The world's most trusted marketplace for discovering and shopping from verified independent brands.</p>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-sm font-semibold text-white uppercase tracking-wider">Discover</span>
      <a class="text-sm text-[#94A3B8]">All Brands</a>
      <a class="text-sm text-[#94A3B8]">New Arrivals</a>
      <a class="text-sm text-[#94A3B8]">Collections</a>
      <a class="text-sm text-[#94A3B8]">Deals</a>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-sm font-semibold text-white uppercase tracking-wider">For Brands</span>
      <a class="text-sm text-[#94A3B8]">List Your Brand</a>
      <a class="text-sm text-[#94A3B8]">Analytics Dashboard</a>
      <a class="text-sm text-[#94A3B8]">Pricing</a>
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-sm font-semibold text-white uppercase tracking-wider">Company</span>
      <a class="text-sm text-[#94A3B8]">About</a>
      <a class="text-sm text-[#94A3B8]">Careers</a>
      <a class="text-sm text-[#94A3B8]">Contact</a>
    </div>
  </div>
  <div class="flex justify-between pt-8" style="border-top: 1px solid #334155">
    <span class="text-sm text-[#64748B]">© 2025 BrandHub, Inc. All rights reserved.</span>
    <div class="flex gap-4">
      <a class="text-sm text-[#64748B]">Privacy Policy</a>
      <a class="text-sm text-[#64748B]">Terms of Service</a>
      <a class="text-sm text-[#64748B]">Cookie Settings</a>
    </div>
  </div>
</footer>

<!-- ═══ TEST 4: Feature cards in 2-col grid with icon + text (94% Revenue Share pattern) ═══ -->
<section class="w-full bg-[#F8FAFC] px-16 py-16">
  <div class="grid grid-cols-2 gap-6">
    <div class="bg-white p-6 flex flex-col gap-3" style="border-radius: 16px; border: 1px solid #E2E8F0">
      <div class="w-10 h-10 bg-[#0D9488] flex items-center justify-center" style="border-radius: 8px">
        <span class="text-white text-lg font-bold">📊</span>
      </div>
      <h3 class="text-lg font-bold text-[#0F172A]">Audience Matching</h3>
      <p class="text-sm text-[#64748B]">Our algorithm surfaces your brand to shoppers who share your values, aesthetics, and price point.</p>
      <a class="text-sm font-semibold text-[#0D9488]">See the algorithm →</a>
    </div>
    <div class="bg-[#0D9488] p-6 flex flex-col gap-3" style="border-radius: 16px">
      <div class="w-10 h-10 bg-white flex items-center justify-center" style="border-radius: 8px">
        <span class="text-[#0D9488] text-lg font-bold">💰</span>
      </div>
      <h3 class="text-lg font-bold text-white">94% Revenue Share</h3>
      <p class="text-sm text-white" style="opacity: 0.85">Keep 94 cents of every dollar. No monthly fees. No setup cost. We only succeed when you succeed.</p>
      <a class="text-sm font-semibold text-white">Compare to competitors →</a>
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
