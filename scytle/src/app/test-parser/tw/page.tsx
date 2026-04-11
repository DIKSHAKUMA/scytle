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
<div>
<!-- ============ NAVBAR (flex) ============ -->
<nav class="flex items-center justify-between px-8 py-4 bg-slate-900 text-white">
  <div class="text-xl font-bold tracking-tight">Scytle<span class="text-cyan-400">.</span>ai</div>
  <div class="flex gap-6 text-sm font-medium">
    <a class="hover:text-cyan-400" href="#">Products</a>
    <a class="hover:text-cyan-400" href="#">Solutions</a>
    <a class="hover:text-cyan-400" href="#">Pricing</a>
    <a class="hover:text-cyan-400" href="#">Docs</a>
  </div>
  <div class="flex gap-3">
    <button class="px-4 py-2 text-sm border border-slate-600 rounded-lg hover:bg-slate-800">Log in</button>
    <button class="px-4 py-2 text-sm bg-cyan-500 rounded-lg font-semibold hover:bg-cyan-400">Sign up</button>
  </div>
</nav>

<!-- ============ HERO (relative + absolute badge) ============ -->
<section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 text-white px-8 py-24 overflow-hidden">
  <div class="absolute top-6 right-8 bg-cyan-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">New</div>
  <div class="absolute -bottom-20 -left-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"></div>
  <div class="absolute top-10 right-1/4 w-48 h-48 bg-indigo-500/15 rounded-full blur-2xl"></div>
  <div class="max-w-3xl mx-auto text-center relative z-10">
    <h1 class="text-5xl font-extrabold leading-tight mb-6">Build interfaces <span class="text-cyan-400">10x faster</span> with AI</h1>
    <p class="text-lg text-slate-300 mb-10 max-w-xl mx-auto">Design, prototype, and ship production-ready layouts in minutes. Powered by an intelligent canvas engine.</p>
    <div class="flex justify-center gap-4">
      <button class="px-8 py-3 bg-cyan-500 rounded-xl font-bold text-base hover:bg-cyan-400">Get Started Free</button>
      <button class="px-8 py-3 border border-slate-500 rounded-xl font-semibold text-base hover:bg-white/5">Watch Demo</button>
    </div>
  </div>
</section>

<!-- ============ STATS (4-col grid) ============ -->
<section class="grid grid-cols-4 gap-0 bg-slate-50 border-y border-slate-200">
  <div class="flex flex-col items-center py-10 border-r border-slate-200">
    <span class="text-4xl font-extrabold text-slate-900">50K+</span>
    <span class="text-sm text-slate-500 mt-1">Active Users</span>
  </div>
  <div class="flex flex-col items-center py-10 border-r border-slate-200">
    <span class="text-4xl font-extrabold text-slate-900">2M+</span>
    <span class="text-sm text-slate-500 mt-1">Designs Created</span>
  </div>
  <div class="flex flex-col items-center py-10 border-r border-slate-200">
    <span class="text-4xl font-extrabold text-slate-900">99.9%</span>
    <span class="text-sm text-slate-500 mt-1">Uptime</span>
  </div>
  <div class="flex flex-col items-center py-10">
    <span class="text-4xl font-extrabold text-slate-900">4.9★</span>
    <span class="text-sm text-slate-500 mt-1">User Rating</span>
  </div>
</section>

<!-- ============ FEATURES — asymmetric grid (2 cols, 3 rows) ============ -->
<section class="px-8 py-20 bg-white">
  <h2 class="text-3xl font-bold text-center mb-4">Everything you need</h2>
  <p class="text-slate-500 text-center mb-14 max-w-lg mx-auto">A complete design-to-code platform with intelligent tools built for speed.</p>
  <div class="grid grid-cols-2 grid-rows-3 gap-6 max-w-5xl mx-auto">
    <!-- tall left card spanning 2 rows -->
    <div class="row-span-2 bg-gradient-to-b from-indigo-600 to-indigo-800 rounded-2xl p-8 text-white flex flex-col justify-between">
      <div>
        <div class="text-sm font-semibold uppercase tracking-wider text-indigo-200 mb-3">AI Canvas</div>
        <h3 class="text-2xl font-bold mb-3">Intelligent layout engine</h3>
        <p class="text-indigo-100 text-sm leading-relaxed">Our AI understands design intent and generates pixel-perfect layouts with proper spacing, alignment, and responsive behavior.</p>
      </div>
      <div class="mt-6 h-36 bg-indigo-700/50 rounded-xl border border-indigo-500/30"></div>
    </div>
    <!-- top right -->
    <div class="bg-slate-50 rounded-2xl p-8 border border-slate-200">
      <div class="text-sm font-semibold uppercase tracking-wider text-cyan-600 mb-3">Parser</div>
      <h3 class="text-xl font-bold text-slate-900 mb-2">HTML to Canvas nodes</h3>
      <p class="text-slate-500 text-sm leading-relaxed">Paste any Tailwind HTML and see it rendered as editable canvas objects in real-time.</p>
    </div>
    <!-- middle right -->
    <div class="bg-slate-50 rounded-2xl p-8 border border-slate-200">
      <div class="text-sm font-semibold uppercase tracking-wider text-emerald-600 mb-3">Themes</div>
      <h3 class="text-xl font-bold text-slate-900 mb-2">Multi-mode variables</h3>
      <p class="text-slate-500 text-sm leading-relaxed">Light, dark, brand modes per frame. Same variable, different contexts — like Figma but simpler.</p>
    </div>
    <!-- bottom full-width row -->
    <div class="col-span-2 bg-slate-900 rounded-2xl p-8 text-white flex items-center gap-8">
      <div class="flex-1">
        <div class="text-sm font-semibold uppercase tracking-wider text-cyan-400 mb-3">Collaboration</div>
        <h3 class="text-2xl font-bold mb-2">Real-time multiplayer</h3>
        <p class="text-slate-400 text-sm leading-relaxed">Powered by Cloudflare Durable Objects. See cursors, selections, and changes live across your team.</p>
      </div>
      <div class="w-64 h-28 bg-slate-800 rounded-xl border border-slate-700 flex-shrink-0"></div>
    </div>
  </div>
</section>

<!-- ============ DASHBOARD PREVIEW — complex grid (3 cols with varying spans) ============ -->
<section class="px-8 py-20 bg-slate-50">
  <h2 class="text-3xl font-bold text-center mb-14">Dashboard-ready components</h2>
  <div class="grid grid-cols-3 gap-5 max-w-5xl mx-auto">
    <!-- wide card top -->
    <div class="col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div class="flex justify-between items-center mb-4">
        <h3 class="font-bold text-slate-900">Revenue Overview</h3>
        <span class="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">+12.5%</span>
      </div>
      <div class="h-40 bg-gradient-to-r from-cyan-50 to-indigo-50 rounded-lg border border-slate-100"></div>
    </div>
    <!-- small card top-right -->
    <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
      <h3 class="font-bold text-slate-900 mb-2">Active Now</h3>
      <div class="text-4xl font-extrabold text-indigo-600">1,247</div>
      <div class="text-xs text-slate-400 mt-2">+89 in last hour</div>
    </div>
    <!-- bottom 3 equal cards -->
    <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div class="relative h-24 mb-4 bg-amber-50 rounded-lg">
        <div class="absolute top-2 left-3 text-xs font-semibold text-amber-700">Conversions</div>
        <div class="absolute bottom-3 right-3 text-2xl font-bold text-amber-600">8.4%</div>
      </div>
      <p class="text-xs text-slate-500">Across all funnels this week</p>
    </div>
    <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div class="relative h-24 mb-4 bg-rose-50 rounded-lg">
        <div class="absolute top-2 left-3 text-xs font-semibold text-rose-700">Churn Rate</div>
        <div class="absolute bottom-3 right-3 text-2xl font-bold text-rose-600">2.1%</div>
      </div>
      <p class="text-xs text-slate-500">Down 0.3% from last month</p>
    </div>
    <div class="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
      <div class="relative h-24 mb-4 bg-emerald-50 rounded-lg">
        <div class="absolute top-2 left-3 text-xs font-semibold text-emerald-700">NPS Score</div>
        <div class="absolute bottom-3 right-3 text-2xl font-bold text-emerald-600">72</div>
      </div>
      <p class="text-xs text-slate-500">Excellent — top quartile</p>
    </div>
  </div>
</section>

<!-- ============ COMPARISON — flex row with absolute overlays ============ -->
<section class="px-8 py-20 bg-white">
  <h2 class="text-3xl font-bold text-center mb-14">Before & After</h2>
  <div class="flex gap-8 max-w-5xl mx-auto">
    <div class="flex-1 relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 p-6">
      <div class="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">Before</div>
      <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-red-500/10 to-transparent"></div>
      <div class="h-48 bg-slate-200 rounded-lg mb-4"></div>
      <div class="flex gap-3">
        <div class="h-8 flex-1 bg-slate-200 rounded"></div>
        <div class="h-8 flex-1 bg-slate-200 rounded"></div>
      </div>
    </div>
    <div class="flex-1 relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 p-6">
      <div class="absolute top-4 left-4 bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full z-10">After</div>
      <div class="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-cyan-500/10 to-transparent"></div>
      <div class="h-48 bg-slate-800 rounded-lg mb-4 border border-slate-700"></div>
      <div class="flex gap-3">
        <div class="h-8 flex-1 bg-slate-800 rounded border border-slate-700"></div>
        <div class="h-8 flex-1 bg-slate-800 rounded border border-slate-700"></div>
      </div>
    </div>
  </div>
</section>

<!-- ============ PRICING — 3-col grid with absolute "popular" badge ============ -->
<section class="px-8 py-20 bg-slate-50">
  <h2 class="text-3xl font-bold text-center mb-4">Simple pricing</h2>
  <p class="text-slate-500 text-center mb-14">No hidden fees. Cancel anytime.</p>
  <div class="grid grid-cols-3 gap-6 max-w-4xl mx-auto items-start">
    <div class="bg-white rounded-2xl p-8 border border-slate-200">
      <h3 class="font-bold text-slate-900 mb-1">Free</h3>
      <div class="text-3xl font-extrabold text-slate-900 mb-4">$0<span class="text-sm font-normal text-slate-400">/mo</span></div>
      <div class="flex flex-col gap-2 text-sm text-slate-600 mb-8">
        <span>3 projects</span>
        <span>Basic AI generation</span>
        <span>Community support</span>
      </div>
      <button class="w-full py-3 border border-slate-300 rounded-xl font-semibold text-sm">Get Started</button>
    </div>
    <div class="relative bg-white rounded-2xl p-8 border-2 border-cyan-500 shadow-lg shadow-cyan-500/10">
      <div class="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-white text-xs font-bold px-4 py-1 rounded-full">Most Popular</div>
      <h3 class="font-bold text-slate-900 mb-1">Pro</h3>
      <div class="text-3xl font-extrabold text-slate-900 mb-4">$19<span class="text-sm font-normal text-slate-400">/mo</span></div>
      <div class="flex flex-col gap-2 text-sm text-slate-600 mb-8">
        <span>Unlimited projects</span>
        <span>Advanced AI + themes</span>
        <span>Real-time collaboration</span>
        <span>Priority support</span>
      </div>
      <button class="w-full py-3 bg-cyan-500 text-white rounded-xl font-bold text-sm">Upgrade to Pro</button>
    </div>
    <div class="bg-white rounded-2xl p-8 border border-slate-200">
      <h3 class="font-bold text-slate-900 mb-1">Enterprise</h3>
      <div class="text-3xl font-extrabold text-slate-900 mb-4">Custom</div>
      <div class="flex flex-col gap-2 text-sm text-slate-600 mb-8">
        <span>Everything in Pro</span>
        <span>SSO & SCIM</span>
        <span>Dedicated support</span>
        <span>Custom integrations</span>
      </div>
      <button class="w-full py-3 border border-slate-300 rounded-xl font-semibold text-sm">Contact Sales</button>
    </div>
  </div>
</section>

<!-- ============ CTA (flex center + absolute decorations) ============ -->
<section class="relative bg-slate-900 text-white px-8 py-24 overflow-hidden">
  <div class="absolute top-0 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
  <div class="absolute bottom-0 right-1/4 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl"></div>
  <div class="relative z-10 flex flex-col items-center text-center">
    <h2 class="text-4xl font-extrabold mb-4">Ready to build?</h2>
    <p class="text-slate-400 mb-8 max-w-md">Join thousands of teams shipping faster with Scytle.</p>
    <div class="flex gap-4">
      <button class="px-8 py-3 bg-cyan-500 rounded-xl font-bold hover:bg-cyan-400">Start for Free</button>
      <button class="px-8 py-3 border border-slate-600 rounded-xl font-semibold hover:bg-white/5">Talk to Sales</button>
    </div>
  </div>
</section>

<!-- ============ FOOTER — complex grid (4 cols + full-width bottom) ============ -->
<footer class="bg-slate-950 text-slate-400 px-8 pt-16 pb-8">
  <div class="grid grid-cols-4 gap-8 max-w-5xl mx-auto mb-12">
    <div>
      <div class="text-white font-bold text-lg mb-4">Scytle<span class="text-cyan-400">.</span>ai</div>
      <p class="text-sm leading-relaxed">AI-powered design tool for modern teams. Build, collaborate, and ship.</p>
    </div>
    <div>
      <h4 class="text-white font-semibold text-sm mb-4">Product</h4>
      <div class="flex flex-col gap-2 text-sm">
        <a href="#">Features</a>
        <a href="#">Pricing</a>
        <a href="#">Changelog</a>
        <a href="#">Roadmap</a>
      </div>
    </div>
    <div>
      <h4 class="text-white font-semibold text-sm mb-4">Resources</h4>
      <div class="flex flex-col gap-2 text-sm">
        <a href="#">Documentation</a>
        <a href="#">API Reference</a>
        <a href="#">Blog</a>
        <a href="#">Community</a>
      </div>
    </div>
    <div>
      <h4 class="text-white font-semibold text-sm mb-4">Company</h4>
      <div class="flex flex-col gap-2 text-sm">
        <a href="#">About</a>
        <a href="#">Careers</a>
        <a href="#">Contact</a>
        <a href="#">Legal</a>
      </div>
    </div>
  </div>
  <div class="border-t border-slate-800 pt-6 text-center text-xs text-slate-600">
    &copy; 2026 Scytle.ai — All rights reserved.
  </div>
</footer>
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
