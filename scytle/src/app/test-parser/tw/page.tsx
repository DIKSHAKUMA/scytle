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
<div class="w-[390px] min-h-[844px] bg-[#F9FAFB] relative overflow-hidden flex flex-col pb-20" style="font-family: 'Inter', sans-serif;">
  <!-- Header -->
  <div class="px-6 pt-12 pb-4 flex justify-between items-center bg-[#FFFFFF] rounded-b-3xl shadow-sm z-10">
    <div class="flex flex-col gap-1">
      <span class="text-[11px] text-[#E11D48] font-semibold uppercase tracking-wider" style="font-family: 'Plus Jakarta Sans', sans-serif;">Delivering to</span>
      <div class="flex items-center gap-1 cursor-pointer">
        <h2 class="text-[#111827] text-lg font-bold" style="font-family: 'Plus Jakarta Sans', sans-serif;">New York, 10012</h2>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
      </div>
    </div>
    <div class="w-11 h-11 rounded-full overflow-hidden border-2 border-[#FFFFFF] shadow-sm">
      <img src="https://images.unsplash.com/photo-1539605480396-a61f99da1041?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxwcm9maWxlJTIwcGljdHVyZSUyMHBvcnRyYWl0fGVufDB8MHx8fDE3NzY0MjEwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" alt="Profile" class="w-full h-full object-cover">
    </div>
  </div>

  <div class="flex-1 overflow-y-auto overflow-x-hidden">
    <!-- Search -->
    <div class="px-6 py-5">
      <div class="relative flex items-center w-full h-14 rounded-2xl bg-[#FFFFFF] shadow-sm border border-gray-100 overflow-hidden px-4 gap-3">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" placeholder="What are you craving?" class="flex-1 bg-transparent border-none outline-none text-[#111827] text-sm placeholder-[#6B7280]">
        <div class="w-8 h-8 rounded-full bg-[#FFE4E6] flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21V14"/><path d="M4 10V3"/><path d="M12 21V12"/><path d="M12 8V3"/><path d="M20 21V16"/><path d="M20 12V3"/><path d="M1 14h6"/><path d="M9 8h6"/><path d="M17 16h6"/></svg>
        </div>
      </div>
    </div>

    <!-- Categories -->
    <div class="pl-6 pb-6">
      <h3 class="text-[#111827] text-lg font-bold mb-4" style="font-family: 'Plus Jakarta Sans', sans-serif;">Categories</h3>
      <div class="flex gap-4 overflow-x-auto pr-6 pb-2" style="scrollbar-width: none;">
        <!-- Cat 1 -->
        <div class="flex flex-col items-center gap-2 min-w-[72px]">
          <div class="w-16 h-16 rounded-2xl bg-[#E11D48] flex items-center justify-center shadow-md shadow-[#e11d48]/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.686 2 6 4.686 6 8c0 1.258.384 2.427 1.037 3.393L12 22l4.963-10.607A5.975 5.975 0 0 0 18 8c0-3.314-2.686-6-6-6Z"/><circle cx="12" cy="8" r="2"/></svg>
          </div>
          <span class="text-[#111827] text-xs font-semibold">Near Me</span>
        </div>
        <!-- Cat 2 -->
        <div class="flex flex-col items-center gap-2 min-w-[72px]">
          <div class="w-16 h-16 rounded-2xl bg-[#FFFFFF] flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden p-1">
             <img src="https://images.unsplash.com/photo-1627378378955-a3f4e406c5de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwYnVyZ2VyfGVufDB8MHx8fDE3NzY0MjEwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" class="w-full h-full object-cover rounded-xl" alt="Burger">
          </div>
          <span class="text-[#6B7280] text-xs font-medium">Burger</span>
        </div>
        <!-- Cat 3 -->
        <div class="flex flex-col items-center gap-2 min-w-[72px]">
          <div class="w-16 h-16 rounded-2xl bg-[#FFFFFF] flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden p-1">
             <img src="https://images.unsplash.com/photo-1579751626657-72bc17010498?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHx3b29kJTIwZmlyZWQlMjBwaXp6YXxlbnwwfDB8fHwxNzc2NDIxMDAxfDA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" class="w-full h-full object-cover rounded-xl" alt="Pizza">
          </div>
          <span class="text-[#6B7280] text-xs font-medium">Pizza</span>
        </div>
        <!-- Cat 4 -->
        <div class="flex flex-col items-center gap-2 min-w-[72px]">
          <div class="w-16 h-16 rounded-2xl bg-[#FFFFFF] flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden p-1">
             <img src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJvbGx8ZW58MHwwfHx8MTc3NjQyMTAwMXww&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" class="w-full h-full object-cover rounded-xl" alt="Sushi">
          </div>
          <span class="text-[#6B7280] text-xs font-medium">Sushi</span>
        </div>
        <!-- Cat 5 -->
        <div class="flex flex-col items-center gap-2 min-w-[72px]">
          <div class="w-16 h-16 rounded-2xl bg-[#FFFFFF] flex items-center justify-center shadow-sm border border-gray-100 overflow-hidden p-1">
             <img src="https://images.unsplash.com/photo-1578657084274-03b9d153b0dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwc2FsYWQlMjBib3dsfGVufDB8MHx8fDE3NzY0MjEwMDJ8MA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" class="w-full h-full object-cover rounded-xl" alt="Healthy">
          </div>
          <span class="text-[#6B7280] text-xs font-medium">Healthy</span>
        </div>
      </div>
    </div>

    <!-- Featured -->
    <div class="px-6 pb-8">
      <div class="flex justify-between items-end mb-4">
        <h3 class="text-[#111827] text-xl font-bold" style="font-family: 'Plus Jakarta Sans', sans-serif;">Featured for you</h3>
        <span class="text-[#E11D48] text-sm font-semibold cursor-pointer">See all</span>
      </div>

      <div class="flex flex-col gap-6">
        <!-- Card 1 -->
        <div class="w-full bg-[#FFFFFF] rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer relative">
          <div class="absolute top-4 right-4 z-10 w-8 h-8 bg-[#FFFFFF] rounded-full flex items-center justify-center shadow-md cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div class="w-full h-48 relative overflow-hidden">
            <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1627378378955-a3f4e406c5de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxnb3VybWV0JTIwYnVyZ2VyfGVufDB8MHx8fDE3NzY0MjEwMDF8MA&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" alt="The Artisan Burger" class="w-full h-full object-cover">
            <div class="absolute bottom-3 left-3 z-20 flex items-center gap-2">
              <span class="bg-[#FFFFFF] text-[#111827] text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                4.8
              </span>
              <span class="bg-[#FFFFFF] text-[#111827] text-xs font-bold px-2 py-1 rounded-lg shadow-sm">25-35 min</span>
            </div>
          </div>
          <div class="p-4">
            <h4 class="text-[#111827] text-lg font-bold mb-1" style="font-family: 'Plus Jakarta Sans', sans-serif;">The Artisan Burger Co.</h4>
            <p class="text-[#6B7280] text-sm mb-3">American • Burgers • Fries</p>
            <div class="flex items-center gap-4 text-sm font-medium">
              <span class="flex items-center gap-1 text-[#6B7280]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                $2.99 Delivery
              </span>
              <span class="w-1 h-1 rounded-full bg-gray-300"></span>
              <span class="text-[#111827] flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                Free over $30
              </span>
            </div>
          </div>
        </div>

        <!-- Card 2 -->
        <div class="w-full bg-[#FFFFFF] rounded-3xl overflow-hidden shadow-sm border border-gray-100 group cursor-pointer relative">
          <div class="absolute top-4 right-4 z-10 w-8 h-8 bg-[#FFFFFF] rounded-full flex items-center justify-center shadow-md cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <div class="w-full h-48 relative overflow-hidden">
             <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"></div>
            <img src="https://images.unsplash.com/photo-1579871494447-9811cf80d66c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w5MTI1NTZ8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMHJvbGx8ZW58MHwwfHx8MTc3NjQyMTAwMXww&ixlib=rb-4.1.0&q=80&w=1080&w=1200&q=80" alt="Tokyo Sushi Bar" class="w-full h-full object-cover">
            <div class="absolute bottom-3 left-3 z-20 flex items-center gap-2">
              <span class="bg-[#FFFFFF] text-[#111827] text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                4.9
              </span>
              <span class="bg-[#FFFFFF] text-[#111827] text-xs font-bold px-2 py-1 rounded-lg shadow-sm">15-25 min</span>
            </div>
          </div>
          <div class="p-4">
            <h4 class="text-[#111827] text-lg font-bold mb-1" style="font-family: 'Plus Jakarta Sans', sans-serif;">Tokyo Sushi Bar</h4>
            <p class="text-[#6B7280] text-sm mb-3">Japanese • Sushi • Healthy</p>
            <div class="flex items-center gap-4 text-sm font-medium">
              <span class="flex items-center gap-1 text-[#E11D48]">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
                Free Delivery
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

  <!-- Bottom Nav -->
  <div class="absolute bottom-0 left-0 right-0 h-20 bg-[#FFFFFF] border-t border-gray-100 flex items-center justify-around px-4 pb-2 z-50">
    <div class="flex flex-col items-center gap-1 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#E11D48" stroke="#E11D48" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      <span class="text-[10px] font-bold text-[#E11D48]">Home</span>
    </div>
    <div class="flex flex-col items-center gap-1 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <span class="text-[10px] font-medium text-[#6B7280]">Search</span>
    </div>
    <div class="flex flex-col items-center gap-1 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <span class="text-[10px] font-medium text-[#6B7280]">Orders</span>
    </div>
    <div class="flex flex-col items-center gap-1 cursor-pointer">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span class="text-[10px] font-medium text-[#6B7280]">Profile</span>
    </div>
  </div>
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

            // DEBUG: Find ALL large colored elements in rendered canvas
            setTimeout(() => {
                const allEls = document.querySelectorAll('[data-node-id]')
                allEls.forEach(el => {
                    const htmlEl = el as HTMLElement
                    const cs = getComputedStyle(htmlEl)
                    const rect = htmlEl.getBoundingClientRect()
                    const bg = cs.backgroundColor
                    const shadow = cs.boxShadow
                    // Log any element wider than 80px that has a non-white/non-transparent bg
                    const isTransparent = !bg || bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent'
                    const isWhite = bg === 'rgb(255, 255, 255)' || bg === 'rgba(255, 255, 255, 1)'
                    const isLightGray = bg === 'rgb(249, 250, 251)'
                    if (!isTransparent && !isWhite && !isLightGray && rect.width > 50) {
                        console.log(`[DOM-COLORED] tag=${htmlEl.tagName} w=${rect.width.toFixed(1)} h=${rect.height.toFixed(1)} x=${rect.x.toFixed(0)} y=${rect.y.toFixed(0)} | bg="${bg}" | shadow="${shadow?.slice(0,60)}" | style.width="${htmlEl.style.width}" style.height="${htmlEl.style.height}"`)
                    }
                    // Also log any element with red-ish box-shadow
                    if (shadow && shadow.includes('225') && rect.width > 30) {
                        console.log(`[DOM-SHADOW] tag=${htmlEl.tagName} w=${rect.width.toFixed(1)} h=${rect.height.toFixed(1)} | shadow="${shadow}"`)
                    }
                })
            }, 1000)
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
