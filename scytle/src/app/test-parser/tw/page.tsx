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
<section class="w-full min-h-screen bg-[#e8e4db] py-24 px-8 md:px-12 flex justify-center" style="font-family: 'Outfit', sans-serif;">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Outfit:wght@300;400;500&display=swap');
  </style>

  <div class="max-w-6xl w-full flex flex-col lg:flex-row gap-10 items-start">
    
    <!-- Left Column: Sticky Profile & Navigation -->
    <aside class="w-full lg:w-[340px] shrink-0 sticky top-24 flex flex-col gap-6">
      
      <!-- Profile Summary Card -->
      <div class="bg-[#faf9f7] rounded-[32px] p-8 border border-[#dcd6ca] flex flex-col items-center text-center shadow-xl shadow-[#2a2a28]/5 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-[#f5f3ef] to-[#faf9f7]"></div>
        
        <div class="w-28 h-28 rounded-full overflow-hidden border-4 border-[#faf9f7] bg-[#e8e4db] relative z-10 mb-4 shadow-lg shadow-[#2a2a28]/10">
          <img src="https://images.unsplash.com/photo-1772443325800-e1510d7758f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxzb2Z0JTIwcG9ydHJhaXQlMjBtaW5pbWFsJTIwc2VyZW5lfGVufDB8MHx8fDE3NzY0NTM0Nzh8MA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" alt="Profile" class="w-full h-full object-cover">
        </div>
        
        <h2 class="text-[#2a2a28] text-2xl font-medium mb-1 relative z-10" style="font-family: 'Cormorant Garamond', serif;">Elena Kowalski</h2>
        <p class="text-[#73716a] text-sm mb-6 relative z-10 font-light">elena.kowalski@example.com</p>
        
        <div class="flex items-center justify-center gap-2 relative z-10 w-full">
           <div class="px-5 py-2.5 bg-[#f5f3ef] border border-[#e8e4db] rounded-full text-xs font-medium text-[#73716a] tracking-wide uppercase flex-1">Free Plan</div>
        </div>
      </div>

      <!-- Navigation Card -->
      <nav class="bg-[#faf9f7] rounded-[32px] p-4 border border-[#dcd6ca] flex flex-col gap-2 shadow-xl shadow-[#2a2a28]/5">
        <a href="#" class="flex items-center justify-between px-5 py-4 text-[#73716a] hover:bg-[#f5f3ef]/80 hover:text-[#2a2a28] rounded-2xl font-medium text-sm transition-colors">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            My Profile
          </div>
        </a>
        <a href="#" class="flex items-center justify-between px-5 py-4 text-[#73716a] hover:bg-[#f5f3ef]/80 hover:text-[#2a2a28] rounded-2xl font-medium text-sm transition-colors">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z"></path><path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"></path><path d="M12 2v2"></path><path d="M12 22v-2"></path><path d="m17 20.66-1-1.73"></path><path d="M11 10.27 7 3.34"></path><path d="m20.66 17-1.73-1"></path><path d="m3.34 7 1.73 1"></path><path d="M14 12h8"></path><path d="M2 12h2"></path><path d="m20.66 7-1.73 1"></path><path d="m3.34 17 1.73-1"></path><path d="m17 3.34-1 1.73"></path><path d="m11 13.73-4 6.93"></path></svg>
            Preferences
          </div>
        </a>
        <a href="#" class="flex items-center justify-between px-5 py-4 text-[#73716a] hover:bg-[#f5f3ef]/80 hover:text-[#2a2a28] rounded-2xl font-medium text-sm transition-colors">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            Security
          </div>
        </a>
        <a href="#" class="flex items-center justify-between px-5 py-4 bg-[#f5f3ef] text-[#2a2a28] rounded-2xl font-medium text-sm transition-colors border border-[#e8e4db] shadow-sm">
          <div class="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
            Billing
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"></path></svg>
        </a>
      </nav>
      
    </aside>

    <!-- Right Column: Settings Forms -->
    <main class="flex-1 flex flex-col gap-8 w-full">
      
      <!-- Top Title -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#faf9f7] rounded-[32px] p-8 border border-[#dcd6ca] shadow-xl shadow-[#2a2a28]/5 gap-6">
        <h1 class="text-4xl text-[#2a2a28]" style="font-family: 'Cormorant Garamond', serif;">Billing & Subscription</h1>
        <div class="flex items-center gap-2 text-[#73716a] text-sm font-light">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Secure payment via Stripe
        </div>
      </div>

      <!-- Current Plan Card -->
      <div class="bg-[#faf9f7] rounded-[32px] p-8 md:p-12 border border-[#dcd6ca] shadow-xl shadow-[#2a2a28]/5 flex flex-col lg:flex-row justify-between gap-10">
        <div class="flex-1">
          <h3 class="text-[#a35d49] text-xs font-medium tracking-widest uppercase mb-3">Current Plan</h3>
          <h2 class="text-[#2a2a28] text-4xl mb-4" style="font-family: 'Cormorant Garamond', serif;">Reverie Free</h2>
          <p class="text-[#73716a] text-[15px] font-light leading-relaxed max-w-sm mb-8">
            You are currently on our free tier. This gives you access to a quiet space for your daily reflections and basic monthly insights.
          </p>
          <div class="flex items-baseline gap-2">
            <span class="text-[#2a2a28] text-5xl" style="font-family: 'Cormorant Garamond', serif;">$0</span>
            <span class="text-[#73716a] text-sm">/ month</span>
          </div>
        </div>
        
        <div class="flex-1 bg-[#f5f3ef] rounded-2xl p-8 border border-[#e8e4db] flex flex-col">
          <h4 class="text-[#2a2a28] text-lg font-medium mb-6" style="font-family: 'Cormorant Garamond', serif;">Upgrade to Reverie Premium</h4>
          
          <ul class="flex flex-col gap-4 mb-8">
            <li class="flex items-start gap-3 text-[#73716a] text-sm font-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a35d49" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Unlimited access to all Guided Paths
            </li>
            <li class="flex items-start gap-3 text-[#73716a] text-sm font-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a35d49" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Deep chronological Insights & Word Constellations
            </li>
            <li class="flex items-start gap-3 text-[#73716a] text-sm font-light">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a35d49" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Export entries to PDF, Markdown, and TXT
            </li>
          </ul>
          
          <button class="w-full py-3.5 bg-[#2a2a28] text-[#f5f3ef] text-[15px] font-medium rounded-full hover:bg-[#1a1a18] transition-colors shadow-lg shadow-[#2a2a28]/20 mt-auto">
            Upgrade for $8 / month
          </button>
        </div>
      </div>

      <!-- Payment Method Card -->
      <div class="bg-[#faf9f7] rounded-[32px] p-8 md:p-12 border border-[#dcd6ca] shadow-xl shadow-[#2a2a28]/5 flex flex-col gap-8">
        <div>
          <h3 class="text-[#2a2a28] text-3xl mb-2" style="font-family: 'Cormorant Garamond', serif;">Payment Method</h3>
          <p class="text-[#73716a] text-[15px] font-light">Manage your cards and billing preferences.</p>
        </div>
        
        <div class="flex flex-col sm:flex-row items-center justify-between p-6 bg-[#f5f3ef] border border-[#e8e4db] border-dashed rounded-2xl gap-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-[#faf9f7] border border-[#dcd6ca] flex items-center justify-center text-[#73716a]">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"></rect><line x1="2" x2="22" y1="10" y2="10"></line></svg>
            </div>
            <div>
              <p class="text-[#2a2a28] font-medium text-[15px]">No payment method added</p>
              <p class="text-[#73716a] text-sm font-light">Add a card to subscribe to premium.</p>
            </div>
          </div>
          <button class="px-6 py-2.5 bg-transparent border border-[#dcd6ca] text-[#2a2a28] text-[14px] font-medium rounded-full hover:bg-[#e8e4db] transition-colors whitespace-nowrap">
            Add Payment Method
          </button>
        </div>
      </div>

      <!-- Billing History -->
      <div class="bg-[#faf9f7] rounded-[32px] p-8 md:p-12 border border-[#dcd6ca] shadow-xl shadow-[#2a2a28]/5 flex flex-col gap-8">
        <div>
          <h3 class="text-[#2a2a28] text-3xl mb-2" style="font-family: 'Cormorant Garamond', serif;">Billing History</h3>
          <p class="text-[#73716a] text-[15px] font-light">Review your past invoices and receipts.</p>
        </div>
        
        <div class="w-full border border-[#e8e4db] rounded-2xl overflow-hidden">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-[#f5f3ef] border-b border-[#e8e4db]">
                <th class="py-4 px-6 text-xs font-medium text-[#73716a] tracking-widest uppercase">Date</th>
                <th class="py-4 px-6 text-xs font-medium text-[#73716a] tracking-widest uppercase">Plan</th>
                <th class="py-4 px-6 text-xs font-medium text-[#73716a] tracking-widest uppercase hidden sm:table-cell">Amount</th>
                <th class="py-4 px-6 text-xs font-medium text-[#73716a] tracking-widest uppercase text-right">Receipt</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-[#e8e4db] hover:bg-[#f5f3ef]/50 transition-colors group">
                <td class="py-4 px-6 text-[#2a2a28] text-[15px] font-light">Oct 11, 2023</td>
                <td class="py-4 px-6 text-[#2a2a28] text-[15px] font-light">Free Plan</td>
                <td class="py-4 px-6 text-[#73716a] text-[15px] font-light hidden sm:table-cell">$0.00</td>
                <td class="py-4 px-6 text-right">
                  <button class="text-[#73716a] hover:text-[#a35d49] transition-colors inline-flex">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
                  </button>
                </td>
              </tr>
              <tr class="hover:bg-[#f5f3ef]/50 transition-colors group">
                <td class="py-4 px-6 text-[#2a2a28] text-[15px] font-light">Sep 11, 2023</td>
                <td class="py-4 px-6 text-[#2a2a28] text-[15px] font-light">Free Plan</td>
                <td class="py-4 px-6 text-[#73716a] text-[15px] font-light hidden sm:table-cell">$0.00</td>
                <td class="py-4 px-6 text-right">
                  <button class="text-[#73716a] hover:text-[#a35d49] transition-colors inline-flex">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" x2="12" y1="15" y2="3"></line></svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>

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
            // Preserve fixed-width roots (e.g., mobile 390px) — don't stretch to PAGE_WIDTH
            if (newNode.sizing?.horizontal === 'fixed' && newNode.width < PAGE_WIDTH) {
                // Keep parsed width, just ensure vertical sizing is preserved
                newNode.sizing = { ...newNode.sizing }
            } else {
                newNode.width = PAGE_WIDTH
                newNode.sizing = { horizontal: 'fill', vertical: newNode.sizing?.vertical ?? 'hug' }
            }

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
