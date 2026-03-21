'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { parseHtmlToNodes } from '@/lib/parser/html-to-nodes'
import type { FrameNode, ScytleNode, VectorNode } from '@/types/canvas'
import { networkToSVGPaths } from '@/lib/vector-utils'
import { ChevronRight, ChevronDown, Save, Trash2, Copy, Check, Monitor, Smartphone, Tablet } from 'lucide-react'

const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

const INTER_FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'

// ============================================================
// Viewport Presets
// ============================================================

const VIEWPORTS = [
  { name: 'Mobile', width: 375, icon: Smartphone },
  { name: 'Tablet', width: 768, icon: Tablet },
  { name: 'Desktop', width: 1280, icon: Monitor },
] as const

// ============================================================
// Complex Test Presets
// ============================================================

const PRESETS: Record<string, string> = {
  'Margin Spacing': `<div class="flex flex-col gap-2 p-4 bg-gray-50">
  <div class="m-4 p-4 bg-blue-100 rounded-lg">
    <p class="text-sm text-blue-800">m-4 (16px all sides)</p>
  </div>
  <div class="mx-8 my-2 p-4 bg-green-100 rounded-lg">
    <p class="text-sm text-green-800">mx-8 my-2 (32px horizontal, 8px vertical)</p>
  </div>
  <div class="mt-6 mb-2 ml-12 p-4 bg-purple-100 rounded-lg">
    <p class="text-sm text-purple-800">mt-6 mb-2 ml-12 (asymmetric)</p>
  </div>
  <div class="flex flex-row gap-2">
    <div class="flex-1 mr-4 p-3 bg-red-100 rounded">
      <p class="text-xs text-red-800">flex-1 mr-4</p>
    </div>
    <div class="flex-1 ml-4 p-3 bg-orange-100 rounded">
      <p class="text-xs text-orange-800">flex-1 ml-4</p>
    </div>
  </div>
</div>`,

  'Grid Col-Span': `<div class="grid grid-cols-4 gap-4 p-6 bg-white">
  <div class="p-4 bg-blue-100 rounded-lg text-center text-sm font-medium">1 col</div>
  <div class="p-4 bg-blue-100 rounded-lg text-center text-sm font-medium">1 col</div>
  <div class="col-span-2 p-4 bg-indigo-200 rounded-lg text-center text-sm font-medium">col-span-2</div>
  <div class="col-span-3 p-4 bg-purple-200 rounded-lg text-center text-sm font-medium">col-span-3</div>
  <div class="p-4 bg-blue-100 rounded-lg text-center text-sm font-medium">1 col</div>
  <div class="col-span-full p-4 bg-pink-200 rounded-lg text-center text-sm font-medium">col-span-full (entire row)</div>
  <div class="col-span-2 p-4 bg-rose-200 rounded-lg text-center text-sm font-medium">col-span-2</div>
  <div class="col-span-2 p-4 bg-rose-200 rounded-lg text-center text-sm font-medium">col-span-2</div>
</div>`,

  'Section No Padding': `<div class="bg-white">
  <section class="bg-gray-900 text-white">
    <h2 class="text-2xl font-bold">Section with NO padding classes</h2>
    <p class="text-gray-300 mt-2">Should have zero padding, not hardcoded 64/80px</p>
  </section>
  <section class="p-8 bg-blue-50">
    <h2 class="text-2xl font-bold text-blue-900">Section with p-8</h2>
    <p class="text-blue-700 mt-2">Should have exactly 32px padding all sides</p>
  </section>
  <section class="px-4 py-12 bg-green-50">
    <h2 class="text-2xl font-bold text-green-900">Section with px-4 py-12</h2>
    <p class="text-green-700 mt-2">16px horizontal, 48px vertical</p>
  </section>
</div>`,

  'Flex Mixed Widths': `<div class="flex flex-row gap-4 p-6 bg-gray-50">
  <div class="w-1/4 p-4 bg-blue-100 rounded-lg shrink-0">
    <p class="text-sm font-medium">w-1/4 (fixed 25%)</p>
    <p class="text-xs text-gray-500 mt-1">shrink-0</p>
  </div>
  <div class="flex-1 p-4 bg-green-100 rounded-lg">
    <p class="text-sm font-medium">flex-1 (grows)</p>
    <p class="text-xs text-gray-500 mt-1">Takes remaining space</p>
  </div>
  <div class="w-48 p-4 bg-purple-100 rounded-lg shrink-0">
    <p class="text-sm font-medium">w-48 (192px fixed)</p>
    <p class="text-xs text-gray-500 mt-1">shrink-0</p>
  </div>
</div>`,

  'Typography & Line Height': `<div class="flex flex-col gap-6 p-8 bg-white">
  <div>
    <p class="text-xs text-gray-400 mb-1">text-xs (12px / leading 16px)</p>
    <p class="text-xs">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-base (16px / leading 24px)</p>
    <p class="text-base">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-2xl (24px / leading 32px)</p>
    <p class="text-2xl font-bold">The quick brown fox jumps over the lazy dog.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-base leading-tight (1.25x)</p>
    <p class="text-base leading-tight">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-base leading-loose (2x)</p>
    <p class="text-base leading-loose">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump.</p>
  </div>
  <div>
    <p class="text-xs text-gray-400 mb-1">text-lg leading-8 (32px line-height)</p>
    <p class="text-lg leading-8">The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.</p>
  </div>
</div>`,

  'Nested Complex Layout': `<div class="flex flex-col bg-white">
  <nav class="flex items-center justify-between px-6 py-4 bg-white shadow">
    <div class="text-xl font-bold text-blue-600">Brand</div>
    <div class="flex items-center gap-6">
      <a class="text-sm text-gray-600">Products</a>
      <a class="text-sm text-gray-600">Pricing</a>
      <a class="text-sm text-gray-600">About</a>
      <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">Sign Up</button>
    </div>
  </nav>
  <section class="flex flex-col items-center py-16 px-8 bg-gradient-to-br from-blue-600 to-purple-700 text-white">
    <h1 class="text-4xl font-bold mb-4 text-center">Build Something Amazing</h1>
    <p class="text-lg text-center max-w-2xl mb-8 opacity-90">The all-in-one platform for teams to design, build, and ship products faster than ever before.</p>
    <div class="flex gap-4">
      <button class="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold text-sm">Get Started Free</button>
      <button class="px-6 py-3 border-2 border-white rounded-full font-semibold text-sm">Watch Demo</button>
    </div>
  </section>
  <section class="py-16 px-8">
    <h2 class="text-2xl font-bold text-center mb-12">Features</h2>
    <div class="grid grid-cols-3 gap-8 max-w-5xl mx-auto">
      <div class="p-6 bg-gray-50 rounded-xl">
        <div class="w-10 h-10 bg-blue-100 rounded-lg mb-4"></div>
        <h3 class="text-lg font-semibold mb-2">Lightning Fast</h3>
        <p class="text-sm text-gray-600">Built for speed with optimized rendering and smart caching.</p>
      </div>
      <div class="p-6 bg-gray-50 rounded-xl">
        <div class="w-10 h-10 bg-green-100 rounded-lg mb-4"></div>
        <h3 class="text-lg font-semibold mb-2">Team Ready</h3>
        <p class="text-sm text-gray-600">Real-time collaboration with built-in version control.</p>
      </div>
      <div class="p-6 bg-gray-50 rounded-xl">
        <div class="w-10 h-10 bg-purple-100 rounded-lg mb-4"></div>
        <h3 class="text-lg font-semibold mb-2">AI Powered</h3>
        <p class="text-sm text-gray-600">Smart suggestions and automated workflows save hours.</p>
      </div>
    </div>
  </section>
  <footer class="flex items-center justify-between px-8 py-6 bg-gray-900 text-white">
    <p class="text-sm text-gray-400">2024 Brand Inc. All rights reserved.</p>
    <div class="flex gap-6">
      <a class="text-sm text-gray-400">Privacy</a>
      <a class="text-sm text-gray-400">Terms</a>
      <a class="text-sm text-gray-400">Contact</a>
    </div>
  </footer>
</div>`,

  'Card Grid + Margins': `<div class="p-8 bg-gray-100">
  <h2 class="text-2xl font-bold mb-6">Popular Products</h2>
  <div class="grid grid-cols-3 gap-6">
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="h-40 bg-gradient-to-br from-blue-400 to-blue-600"></div>
      <div class="p-5">
        <h3 class="font-semibold text-lg mb-1">Product One</h3>
        <p class="text-sm text-gray-500 mb-3">A fantastic product with great features.</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-blue-600">$49</span>
          <button class="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg">Buy Now</button>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="h-40 bg-gradient-to-br from-green-400 to-green-600"></div>
      <div class="p-5">
        <h3 class="font-semibold text-lg mb-1">Product Two</h3>
        <p class="text-sm text-gray-500 mb-3">Another amazing product for your needs.</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-green-600">$79</span>
          <button class="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg">Buy Now</button>
        </div>
      </div>
    </div>
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <div class="h-40 bg-gradient-to-br from-purple-400 to-purple-600"></div>
      <div class="p-5">
        <h3 class="font-semibold text-lg mb-1">Product Three</h3>
        <p class="text-sm text-gray-500 mb-3">Premium product with exclusive features.</p>
        <div class="flex items-center justify-between">
          <span class="text-lg font-bold text-purple-600">$99</span>
          <button class="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg">Buy Now</button>
        </div>
      </div>
    </div>
  </div>
</div>`,

  'Dashboard Layout': `<div class="flex flex-row h-[600px] bg-gray-100">
  <aside class="w-56 bg-gray-900 text-white flex flex-col shrink-0">
    <div class="px-5 py-4 text-lg font-bold border-b border-gray-700">Dashboard</div>
    <nav class="flex flex-col gap-1 p-3">
      <a class="px-3 py-2 bg-blue-600 rounded-lg text-sm">Overview</a>
      <a class="px-3 py-2 text-gray-300 text-sm">Analytics</a>
      <a class="px-3 py-2 text-gray-300 text-sm">Projects</a>
      <a class="px-3 py-2 text-gray-300 text-sm">Settings</a>
    </nav>
  </aside>
  <main class="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Overview</h1>
      <button class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg">New Project</button>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div class="p-5 bg-white rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Total Revenue</p>
        <p class="text-2xl font-bold">$45,231</p>
        <p class="text-xs text-green-600 mt-1">+20.1% from last month</p>
      </div>
      <div class="p-5 bg-white rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Active Users</p>
        <p class="text-2xl font-bold">2,350</p>
        <p class="text-xs text-green-600 mt-1">+180 new this week</p>
      </div>
      <div class="p-5 bg-white rounded-xl shadow-sm">
        <p class="text-sm text-gray-500 mb-1">Projects</p>
        <p class="text-2xl font-bold">12</p>
        <p class="text-xs text-gray-400 mt-1">3 in progress</p>
      </div>
    </div>
    <div class="flex-1 bg-white rounded-xl shadow-sm p-5">
      <h3 class="font-semibold mb-4">Recent Activity</h3>
      <div class="flex flex-col gap-3">
        <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div class="w-8 h-8 bg-blue-100 rounded-full shrink-0"></div>
          <div class="flex-1">
            <p class="text-sm font-medium">New project created</p>
            <p class="text-xs text-gray-400">2 hours ago</p>
          </div>
        </div>
        <div class="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div class="w-8 h-8 bg-green-100 rounded-full shrink-0"></div>
          <div class="flex-1">
            <p class="text-sm font-medium">Design review completed</p>
            <p class="text-xs text-gray-400">5 hours ago</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</div>`,
}

const DEFAULT_HTML = PRESETS['Margin Spacing']

// ============================================================
// Resize Handle Hook
// ============================================================

function useResizeHandle(
  initialWidth: number,
  minWidth: number,
  maxWidth: number,
  direction: 'left' | 'right' = 'right'
) {
  const [width, setWidth] = useState(initialWidth)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = width

    const onMouseMove = (me: MouseEvent) => {
      if (!dragging.current) return
      const dx = me.clientX - startX.current
      const delta = direction === 'right' ? dx : -dx
      const newW = Math.max(minWidth, Math.min(maxWidth, startW.current + delta))
      setWidth(newW)
    }

    const onMouseUp = () => {
      dragging.current = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [width, minWidth, maxWidth, direction])

  return { width, onMouseDown }
}

// ============================================================
// Drag Handle Component
// ============================================================

function DragHandle({ onMouseDown }: { onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <div
      className="w-1.5 cursor-col-resize flex items-center justify-center group hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors shrink-0 select-none"
      onMouseDown={onMouseDown}
    >
      <div className="w-0.5 h-8 bg-gray-300 group-hover:bg-blue-500 rounded-full transition-colors" />
    </div>
  )
}

// ============================================================
// Node Tree Component
// ============================================================

interface NodeTreeProps {
  node: ScytleNode
  depth?: number
  onSelect?: (node: ScytleNode) => void
  selectedId?: string
}

function NodeTree({ node, depth = 0, onSelect, selectedId }: NodeTreeProps) {
  const [expanded, setExpanded] = useState(depth < 2)
  const hasChildren = node.type === 'frame' && (node as FrameNode).children?.length > 0
  const isSelected = node.id === selectedId

  const getNodeLabel = () => {
    const badges: string[] = []
    if (node.type === 'frame') {
      const frame = node as FrameNode
      if (frame.layout?.mode === 'flex') badges.push(frame.layout.direction === 'row' ? '→' : '↓')
      if (frame.layout?.mode === 'grid') badges.push('▦')
    }
    return `${node.type}: ${node.name} ${badges.join(' ')}`
  }

  const getSizingBadge = () => {
    const h = node.sizing?.horizontal?.[0]?.toUpperCase() || '?'
    const v = node.sizing?.vertical?.[0]?.toUpperCase() || '?'
    return `${h}×${v}`
  }

  const hasMargin = node.margin && (node.margin.top > 0 || node.margin.right > 0 || node.margin.bottom > 0 || node.margin.left > 0)

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer text-sm font-mono ${isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'}`}
        onClick={() => onSelect?.(node)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
            className="w-4 h-4 flex items-center justify-center"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-4" />
        )}
        <span className={`px-1 rounded text-xs ${node.type === 'frame' ? 'bg-purple-100 text-purple-700' :
          node.type === 'text' ? 'bg-green-100 text-green-700' :
            'bg-orange-100 text-orange-700'
          }`}>
          {node.type}
        </span>
        <span className="truncate flex-1">{node.name}</span>
        {hasMargin && <span className="text-xs text-orange-500 mr-1" title="Has margin">M</span>}
        <span className="text-xs text-gray-400">{getSizingBadge()}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {(node as FrameNode).children.map((child) => (
            <NodeTree
              key={child.id}
              node={child}
              depth={depth + 1}
              onSelect={onSelect}
              selectedId={selectedId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Node Inspector Component
// ============================================================

function NodeInspector({ node }: { node: ScytleNode | null }) {
  const [copied, setCopied] = useState(false)

  if (!node) {
    return (
      <div className="p-4 text-gray-400 text-sm">
        Click a node in the tree to inspect
      </div>
    )
  }

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(node, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">{node.name}</h4>
        <button onClick={copyJson} className="p-1 hover:bg-gray-100 rounded" title="Copy JSON">
          {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-[300px] font-mono">
        {JSON.stringify(node, null, 2)}
      </pre>
    </div>
  )
}

// ============================================================
// Canvas Preview Component
// ============================================================

function CanvasPreview({ root }: { root: FrameNode | null }) {
  if (!root) return <div className="p-4 text-gray-400">No output</div>

  const shadowBleed = root.shadows?.length
    ? Math.ceil(
      Math.max(
        ...root.shadows.map((shadow) => {
          const spread = Math.max(shadow.spread, 0)
          return Math.max(
            Math.abs(shadow.x) + shadow.blur + spread,
            Math.abs(shadow.y) + shadow.blur + spread,
          )
        }),
      ),
    )
    : 0

  const previewPadding = 16 + shadowBleed

  return (
    <div
      className="overflow-auto h-full bg-gray-50"
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        padding: previewPadding,
      }}
    >
      <ScytleNodeRenderer node={root} />
    </div>
  )
}

function ScytleNodeRenderer({ node }: { node: ScytleNode }) {
  const style = useMemo(() => computeNodeStyle(node), [node])

  if (node.type === 'text') {
    return (
      <div style={style} title={`TextNode: ${node.name}`}>
        {node.characters}
      </div>
    )
  }

  if (node.type === 'image') {
    return (
      <img
        src={node.src || 'https://via.placeholder.com/100'}
        alt={node.name}
        style={style}
        title={`ImageNode: ${node.name}`}
      />
    )
  }

  if (node.type === 'frame') {
    const frame = node as FrameNode
    return (
      <div style={style} title={`FrameNode: ${node.name}`}>
        {frame.children?.map((child) => (
          <ScytleNodeRenderer key={child.id} node={child} />
        ))}
      </div>
    )
  }

  if (node.type === 'vector') {
    const vector = node as VectorNode
    const paths = networkToSVGPaths(vector.vectorNetwork)
    const d = paths.join(' ')

    return (
      <svg
        width={vector.width}
        height={vector.height}
        viewBox={`0 0 ${vector.width} ${vector.height}`}
        style={style}
        data-node-name={`VectorNode: ${node.name}`}
      >
        <title>{`VectorNode: ${node.name}`}</title>
        {vector.fills?.length > 0 && (
          <path
            d={d}
            fill={vector.fills[0].type === 'solid' ? vector.fills[0].color : 'none'}
            stroke="none"
          />
        )}
        {vector.strokeVisible && (
          <path
            d={d}
            fill="none"
            stroke={vector.strokeColor}
            strokeWidth={vector.strokeWeight}
            strokeLinecap={vector.strokeCap?.toLowerCase() as 'round' | 'butt' | 'square'}
            strokeLinejoin={vector.strokeJoin?.toLowerCase() as 'round' | 'miter' | 'bevel'}
            strokeOpacity={vector.strokeOpacity}
          />
        )}
      </svg>
    )
  }

  return null
}

function computeNodeStyle(node: ScytleNode): React.CSSProperties {
  const style: React.CSSProperties = {}

  const horizontalSizing = node.sizing?.horizontal || 'hug'
  const verticalSizing = node.sizing?.vertical || 'hug'

  if (horizontalSizing === 'fixed' && node.width) {
    style.width = node.width
  } else if (horizontalSizing === 'fill') {
    style.alignSelf = 'stretch'
    style.width = '100%'
  }

  if (verticalSizing === 'fixed' && node.height) {
    style.height = node.height
  } else if (verticalSizing === 'fill') {
    style.height = '100%'
  }

  if (node.minWidth) style.minWidth = node.minWidth
  if (node.minHeight) style.minHeight = node.minHeight
  if (node.maxWidth) style.maxWidth = node.maxWidth
  if (node.maxHeight) style.maxHeight = node.maxHeight

  if (node.opacity !== undefined && node.opacity !== 1) {
    style.opacity = node.opacity
  }

  // Margin rendering
  if (node.margin) {
    const { top, right, bottom, left } = node.margin
    if (top || right || bottom || left) {
      style.marginTop = top
      style.marginRight = right
      style.marginBottom = bottom
      style.marginLeft = left
    }
  }

  if (node.borderRadius) {
    if (typeof node.borderRadius === 'number') {
      style.borderRadius = node.borderRadius
    } else {
      style.borderTopLeftRadius = node.borderRadius.topLeft
      style.borderTopRightRadius = node.borderRadius.topRight
      style.borderBottomRightRadius = node.borderRadius.bottomRight
      style.borderBottomLeftRadius = node.borderRadius.bottomLeft
    }
  }

  if (node.shadows?.length) {
    style.boxShadow = node.shadows
      .map((shadow) => {
        const inset = shadow.type === 'inner' ? 'inset ' : ''
        return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
      })
      .join(', ')
  }

  if (node.fills?.length) {
    const fill = node.fills[0]
    if (fill.type === 'solid') {
      style.backgroundColor = fill.color
    } else if (fill.type === 'gradient') {
      if ('stops' in fill && fill.stops?.length) {
        const stops = fill.stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')
        const angle = ('angle' in fill && fill.angle) || 180
        style.background = `linear-gradient(${angle}deg, ${stops})`
      } else if ('gradient' in fill && typeof fill.gradient === 'string') {
        style.background = fill.gradient
      }
    } else if (fill.type === 'image' && 'src' in fill && fill.src) {
      style.backgroundImage = `url(${fill.src})`
      const fitMode = ('fit' in fill && fill.fit) || 'cover'
      if (fitMode === 'cover' || fitMode === 'contain') {
        style.backgroundSize = fitMode
      } else if (fitMode === 'fill') {
        style.backgroundSize = '100% 100%'
      } else if (fitMode === 'tile') {
        style.backgroundSize = 'auto'
        style.backgroundRepeat = 'repeat'
      }
      style.backgroundPosition = 'center'
      style.backgroundRepeat = style.backgroundRepeat || 'no-repeat'
    }
  }

  if (node.type === 'text') {
    if (node.fontFamily) style.fontFamily = node.fontFamily
    if (node.fontSize) style.fontSize = node.fontSize
    if (node.fontWeight) style.fontWeight = node.fontWeight
    if (node.letterSpacing) style.letterSpacing = node.letterSpacing
    if (node.textAlign) style.textAlign = node.textAlign as React.CSSProperties['textAlign']
    if (node.textTransform && node.textTransform !== 'none') {
      style.textTransform = node.textTransform as React.CSSProperties['textTransform']
    }
    if (node.textDecoration && node.textDecoration !== 'none') {
      style.textDecoration = node.textDecoration
    }
    if (node.color) {
      style.color = node.color
    } else {
      const textFill = node.fills?.[0]
      if (textFill && textFill.type === 'solid') {
        style.color = textFill.color
      }
    }
    if (node.lineHeight) {
      // lineHeight is now always in pixels from the parser
      if (typeof node.lineHeight === 'number') {
        style.lineHeight = `${node.lineHeight}px`
      } else {
        style.lineHeight = node.lineHeight
      }
    }
  }

  if (node.type === 'frame') {
    const frame = node as FrameNode

    if (frame.overflow === 'hidden') {
      style.overflow = 'hidden'
    }

    if (frame.layout?.mode === 'flex') {
      style.display = 'flex'
      style.flexDirection = frame.layout.direction === 'row' ? 'row' : 'column'
      if (frame.layout.gap) style.gap = frame.layout.gap
      if (frame.layout.justify) {
        const justifyMap: Record<string, string> = {
          start: 'flex-start', center: 'center', end: 'flex-end',
          between: 'space-between', around: 'space-around', evenly: 'space-evenly'
        }
        style.justifyContent = justifyMap[frame.layout.justify] || frame.layout.justify
      }
      if (frame.layout.align) {
        const alignMap: Record<string, string> = {
          start: 'flex-start', center: 'center', end: 'flex-end', stretch: 'stretch'
        }
        style.alignItems = alignMap[frame.layout.align] || frame.layout.align
      }
      if (frame.layout.wrap) {
        style.flexWrap = 'wrap'
      }
    } else if (frame.layout?.mode === 'grid') {
      style.display = 'grid'
      if (frame.layout.columns) {
        style.gridTemplateColumns = `repeat(${frame.layout.columns}, minmax(0, 1fr))`
      }
      if (frame.layout.gap) style.gap = frame.layout.gap
    }

    if (frame.padding) {
      style.paddingTop = frame.padding.top
      style.paddingRight = frame.padding.right
      style.paddingBottom = frame.padding.bottom
      style.paddingLeft = frame.padding.left
    }

    if (frame.border) {
      style.borderWidth = frame.border.width
      style.borderColor = frame.border.color
      style.borderStyle = frame.border.style || 'solid'
    }

    // Grid child: col-span
    if (frame.gridColumnSpan) {
      if (frame.gridColumnSpan === -1) {
        style.gridColumn = '1 / -1'
      } else {
        style.gridColumn = `span ${frame.gridColumnSpan}`
      }
    }

    // Flex child properties
    if (frame.flexShrink != null) {
      style.flexShrink = frame.flexShrink
    }
    if (frame.layoutGrow != null && frame.layoutGrow > 0) {
      style.flexGrow = frame.layoutGrow
    }
  }

  if (node.type === 'image') {
    style.objectFit = node.fit || 'cover'
  }

  return style
}

// ============================================================
// Saved Tests Manager
// ============================================================

interface SavedTest {
  id: string
  name: string
  html: string
  createdAt: number
}

const STORAGE_KEY = 'scytle-parser-tests'

function loadSavedTests(): SavedTest[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function saveSavedTests(tests: SavedTest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tests))
}

// ============================================================
// Main Page Component
// ============================================================

export default function ParserTestPage() {
  const [html, setHtml] = useState(DEFAULT_HTML)
  const [parsedRoot, setParsedRoot] = useState<FrameNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<ScytleNode | null>(null)
  const [savedTests, setSavedTests] = useState<SavedTest[]>([])
  const [testName, setTestName] = useState('')
  const [viewportWidth, setViewportWidth] = useState(VIEWPORTS[2].width) // Desktop default

  // Resizable panels
  const leftPanel = useResizeHandle(400, 250, 700, 'right')
  const rightPanel = useResizeHandle(350, 250, 600, 'left')

  // Load saved tests on mount
  useEffect(() => {
    setSavedTests(loadSavedTests())
  }, [])

  // Load Inter font
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = INTER_FONT_URL
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  // Parse HTML whenever it changes or viewport changes
  useEffect(() => {
    try {
      const root = parseHtmlToNodes(html, 'Test', { rootWidth: viewportWidth })
      setParsedRoot(root)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse error')
      setParsedRoot(null)
    }
  }, [html, viewportWidth])

  const handleSaveTest = useCallback(() => {
    const name = testName.trim() || `Test ${savedTests.length + 1}`
    const newTest: SavedTest = {
      id: crypto.randomUUID(),
      name,
      html,
      createdAt: Date.now(),
    }
    const updated = [...savedTests, newTest]
    setSavedTests(updated)
    saveSavedTests(updated)
    setTestName('')
  }, [html, testName, savedTests])

  const handleDeleteTest = useCallback((id: string) => {
    const updated = savedTests.filter(t => t.id !== id)
    setSavedTests(updated)
    saveSavedTests(updated)
  }, [savedTests])

  const handleLoadTest = useCallback((test: SavedTest) => {
    setHtml(test.html)
  }, [])

  const handleLoadPreset = useCallback((name: string) => {
    setHtml(PRESETS[name])
  }, [])

  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Parser test page is only available in development.</p>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b shrink-0">
        <h1 className="text-lg font-bold">Parser Test Lab</h1>
        <div className="flex items-center gap-4">
          {/* Viewport selector */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
            {VIEWPORTS.map(vp => {
              const Icon = vp.icon
              return (
                <button
                  key={vp.name}
                  onClick={() => setViewportWidth(vp.width)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs transition-all ${viewportWidth === vp.width
                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                    : 'text-gray-500 hover:text-gray-800'
                    }`}
                  title={`${vp.name} (${vp.width}px)`}
                >
                  <Icon size={14} />
                  <span>{vp.width}</span>
                </button>
              )
            })}
          </div>

          {/* Presets dropdown */}
          <select
            className="px-3 py-1.5 border rounded-lg text-sm"
            onChange={(e) => e.target.value && handleLoadPreset(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>Load Preset...</option>
            {Object.keys(PRESETS).map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Save test */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Test name..."
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="px-2 py-1.5 border rounded-lg text-sm w-32"
            />
            <button
              onClick={handleSaveTest}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
            >
              <Save size={14} />
              Save
            </button>
          </div>
        </div>
      </header>

      {/* Saved Tests Bar */}
      {savedTests.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b overflow-x-auto shrink-0">
          <span className="text-xs text-gray-500 shrink-0">Saved:</span>
          {savedTests.map(test => (
            <div
              key={test.id}
              className="flex items-center gap-1 px-2 py-1 bg-white border rounded text-sm shrink-0"
            >
              <button onClick={() => handleLoadTest(test)} className="hover:text-blue-600">
                {test.name}
              </button>
              <button onClick={() => handleDeleteTest(test.id)} className="text-gray-400 hover:text-red-600">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content - 3 Resizable Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Monaco Editor */}
        <div className="flex flex-col" style={{ width: leftPanel.width }}>
          <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium shrink-0">
            HTML + Tailwind Input
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              language="html"
              theme="vs-light"
              value={html}
              onChange={(value) => setHtml(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: 'on',
                wordWrap: 'on',
                tabSize: 2,
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        <DragHandle onMouseDown={leftPanel.onMouseDown} />

        {/* Middle: Browser Preview + Scytle Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Browser Preview */}
          <div className="flex-1 flex flex-col border-b min-h-0">
            <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium flex items-center gap-2 shrink-0">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Browser Preview
              <span className="text-xs text-gray-400 ml-auto">{viewportWidth}px</span>
            </div>
            <div className="flex-1 overflow-auto bg-gray-200 flex justify-center p-4">
              <iframe
                srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <link rel="preconnect" href="https://fonts.googleapis.com">
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                  <link href="${INTER_FONT_URL}" rel="stylesheet">
                  <script src="https://cdn.tailwindcss.com"><\/script>
                  <script>
                    tailwind.config = {
                      theme: {
                        extend: {
                          fontFamily: {
                            sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                          },
                        },
                      },
                    }
                  <\/script>
                  <style>body { margin: 0; font-family: 'Inter', sans-serif; }</style>
                </head>
                <body>${html}</body>
                </html>
              `}
                style={{ width: viewportWidth, minHeight: 200 }}
                className="bg-white shadow-lg border"
                title="HTML Preview"
              />
            </div>
          </div>

          {/* Scytle Canvas Preview */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium flex items-center gap-2 shrink-0">
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-blue-500'}`} />
              Scytle Canvas Output
              {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
              <span className="text-xs text-gray-400 ml-auto">
                {parsedRoot ? `${Math.round(parsedRoot.width)}×${Math.round(parsedRoot.height)}` : ''}
              </span>
            </div>
            <div className="flex-1 overflow-auto bg-gray-200 flex justify-center p-4">
              <div style={{ width: viewportWidth }} className="bg-white shadow-lg border">
                <CanvasPreview root={parsedRoot} />
              </div>
            </div>
          </div>
        </div>

        <DragHandle onMouseDown={rightPanel.onMouseDown} />

        {/* Right: Node Tree + Inspector */}
        <div className="flex flex-col" style={{ width: rightPanel.width }}>
          {/* Node Tree */}
          <div className="flex-1 flex flex-col border-b overflow-hidden min-h-0">
            <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium shrink-0">
              Node Tree
            </div>
            <div className="flex-1 overflow-auto p-2">
              {parsedRoot && (
                <NodeTree
                  node={parsedRoot}
                  onSelect={setSelectedNode}
                  selectedId={selectedNode?.id}
                />
              )}
            </div>
          </div>

          {/* Node Inspector */}
          <div className="h-[40%] flex flex-col overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium shrink-0">
              Node Inspector
            </div>
            <div className="flex-1 overflow-auto">
              <NodeInspector node={selectedNode} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
