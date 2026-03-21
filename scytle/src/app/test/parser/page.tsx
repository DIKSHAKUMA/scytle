'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import { parseHtmlToNodes } from '@/lib/parser/html-to-nodes'
import type { FrameNode, ScytleNode, VectorNode } from '@/types/canvas'
import { networkToSVGPaths } from '@/lib/vector-utils'
import { ChevronRight, ChevronDown, Save, Trash2, Plus, Copy, Check } from 'lucide-react'

// Dynamic import Monaco to avoid SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

// Load Inter font for the main page (to match iframe preview)
const INTER_FONT_URL = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'

// ============================================================
// Preset Examples
// ============================================================

const PRESETS: Record<string, string> = {
  'Flex Row': `<div class="flex flex-row gap-4 p-4 bg-gray-100">
  <span class="px-3 py-1 bg-blue-500 text-white rounded">Item A</span>
  <span class="px-3 py-1 bg-green-500 text-white rounded">Item B</span>
  <span class="px-3 py-1 bg-purple-500 text-white rounded">Item C</span>
</div>`,

  'Flex Column': `<div class="flex flex-col gap-4 p-6 bg-white">
  <h1 class="text-2xl font-bold">Hello World</h1>
  <p class="text-gray-600 w-full">This is a full-width paragraph that should fill the container.</p>
  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg">Click Me</button>
</div>`,

  'Grid Layout': `<div class="grid grid-cols-3 gap-6 p-4">
  <div class="p-4 bg-red-100 rounded-lg">Card 1</div>
  <div class="p-4 bg-green-100 rounded-lg">Card 2</div>
  <div class="p-4 bg-blue-100 rounded-lg">Card 3</div>
  <div class="p-4 bg-yellow-100 rounded-lg col-span-2">Wide Card</div>
  <div class="p-4 bg-purple-100 rounded-lg">Card 5</div>
</div>`,

  'SVG Icon': `<div class="flex items-center gap-2 p-4 text-blue-600">
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>
  <span class="font-medium">Icon with currentColor</span>
</div>`,

  'Image': `<div class="p-4">
  <img src="https://picsum.photos/400/300" alt="Sample Image" width="400" height="300" class="rounded-lg shadow-lg"/>
</div>`,

  'Hero Section': `<section class="flex flex-col items-center justify-center min-h-[400px] bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8">
  <h1 class="text-4xl font-bold mb-4">Welcome to Scytle</h1>
  <p class="text-xl text-center max-w-2xl mb-8 opacity-90">Build beautiful designs with AI-powered generation</p>
  <div class="flex gap-4">
    <button class="px-6 py-3 bg-white text-blue-600 rounded-full font-semibold">Get Started</button>
    <button class="px-6 py-3 border-2 border-white rounded-full font-semibold">Learn More</button>
  </div>
</section>`,

  'Card Component': `<div class="max-w-sm bg-white rounded-xl shadow-lg overflow-hidden">
  <img src="https://picsum.photos/400/200" alt="Card image" class="w-full h-48 object-cover"/>
  <div class="p-6">
    <h3 class="text-xl font-bold mb-2">Card Title</h3>
    <p class="text-gray-600 mb-4">This is a sample card with an image, title, description and a call-to-action button.</p>
    <button class="w-full py-2 bg-blue-600 text-white rounded-lg">Read More</button>
  </div>
</div>`,

  'Navigation': `<nav class="flex items-center justify-between px-6 py-4 bg-white shadow">
  <div class="text-xl font-bold text-blue-600">Logo</div>
  <div class="flex gap-6">
    <a href="#" class="text-gray-600 hover:text-blue-600">Home</a>
    <a href="#" class="text-gray-600 hover:text-blue-600">About</a>
    <a href="#" class="text-gray-600 hover:text-blue-600">Services</a>
    <a href="#" class="text-gray-600 hover:text-blue-600">Contact</a>
  </div>
  <button class="px-4 py-2 bg-blue-600 text-white rounded-lg">Sign Up</button>
</nav>`,
}

const DEFAULT_HTML = PRESETS['Flex Row']

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

  return (
    <div style={{ paddingLeft: depth * 12 }}>
      <div
        className={`flex items-center gap-1 py-1 px-2 rounded cursor-pointer text-sm font-mono ${isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-100'
          }`}
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
        <button
          onClick={copyJson}
          className="p-1 hover:bg-gray-100 rounded"
          title="Copy JSON"
        >
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

  return (
    <div className="p-4 overflow-auto h-full bg-white" style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
      <ScytleNodeRenderer node={root} />
    </div>
  )
}

// Simple renderer for preview (mirrors the actual canvas logic)
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
        {/* Fill path */}
        {vector.fills?.length > 0 && (
          <path
            d={d}
            fill={vector.fills[0].type === 'solid' ? vector.fills[0].color : 'none'}
            stroke="none"
          />
        )}
        {/* Stroke path */}
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

  // Dimensions - respect sizing mode
  // Only set fixed width/height when sizing is 'fixed', not when 'hug' or 'fill'
  const horizontalSizing = node.sizing?.horizontal || 'hug'
  const verticalSizing = node.sizing?.vertical || 'hug'

  if (horizontalSizing === 'fixed' && node.width) {
    style.width = node.width
  } else if (horizontalSizing === 'fill') {
    // 'fill' means stretch to parent width - use alignSelf: stretch for flex children
    style.alignSelf = 'stretch'
    style.width = '100%'
  }
  // 'hug' = no width set, let content determine size

  if (verticalSizing === 'fixed' && node.height) {
    style.height = node.height
  } else if (verticalSizing === 'fill') {
    style.height = '100%'
  }
  // 'hug' = no height set, let content determine size

  if (node.minWidth) style.minWidth = node.minWidth
  if (node.minHeight) style.minHeight = node.minHeight

  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    style.opacity = node.opacity
  }

  // Border radius
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

  // Fills (background)
  if (node.fills?.length) {
    const fill = node.fills[0]
    if (fill.type === 'solid') {
      style.backgroundColor = fill.color
    } else if (fill.type === 'gradient') {
      // Gradient fill - check for stops array or legacy gradient string
      if ('stops' in fill && fill.stops?.length) {
        const stops = fill.stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')
        const angle = ('angle' in fill && fill.angle) || 180
        style.background = `linear-gradient(${angle}deg, ${stops})`
      } else if ('gradient' in fill && typeof fill.gradient === 'string') {
        // Legacy gradient string
        style.background = fill.gradient
      }
    } else if (fill.type === 'image' && 'src' in fill && fill.src) {
      // Image fill - render as background image
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

  // Text styles
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
    // Use direct color property (preferred) or fallback to fills
    if (node.color) {
      style.color = node.color
    } else {
      const textFill = node.fills?.[0]
      if (textFill && textFill.type === 'solid') {
        style.color = textFill.color
      }
    }
    if (node.lineHeight) {
      // Line-height: if it's a small multiplier (< 10), use as unitless; otherwise treat as px
      if (typeof node.lineHeight === 'number') {
        style.lineHeight = node.lineHeight < 10 ? node.lineHeight : `${node.lineHeight}px`
      } else {
        style.lineHeight = node.lineHeight
      }
    }
  }

  // Frame layout
  if (node.type === 'frame') {
    const frame = node as FrameNode

    // Overflow
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
    } else if (frame.layout?.mode === 'grid') {
      style.display = 'grid'
      if (frame.layout.columns) {
        style.gridTemplateColumns = `repeat(${frame.layout.columns}, minmax(0, 1fr))`
      }
      if (frame.layout.gap) style.gap = frame.layout.gap
    }

    // Padding
    if (frame.padding) {
      style.paddingTop = frame.padding.top
      style.paddingRight = frame.padding.right
      style.paddingBottom = frame.padding.bottom
      style.paddingLeft = frame.padding.left
    }

    // Border
    if (frame.border) {
      style.borderWidth = frame.border.width
      style.borderColor = frame.border.color
      style.borderStyle = frame.border.style || 'solid'
    }

    // Grid child properties (col-span)
    if (frame.gridColumnSpan) {
      if (frame.gridColumnSpan === -1) {
        // col-span-full
        style.gridColumn = '1 / -1'
      } else {
        style.gridColumn = `span ${frame.gridColumnSpan}`
      }
    }
  }

  // Image fit
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

  // Dynamic width measurement for pixel-perfect rendering
  const iframeContainerRef = useRef<HTMLDivElement>(null)
  const [contentWidth, setContentWidth] = useState<number | null>(null)

  // Load saved tests on mount
  useEffect(() => {
    setSavedTests(loadSavedTests())
  }, [])

  // Load Inter font for the main page to match iframe preview
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = INTER_FONT_URL
    document.head.appendChild(link)
    return () => {
      document.head.removeChild(link)
    }
  }, [])

  // Measure iframe container width dynamically
  useEffect(() => {
    const container = iframeContainerRef.current
    if (!container) return

    const updateWidth = () => {
      const containerWidth = container.clientWidth
      // Subtract 32px for body padding (16px on each side) in the iframe
      setContentWidth(containerWidth - 32)
    }

    // Initial measurement
    updateWidth()

    // Update on resize
    const resizeObserver = new ResizeObserver(updateWidth)
    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [])

  // Parse HTML whenever it changes or content width changes
  useEffect(() => {
    // Wait for width measurement
    if (contentWidth === null) return

    try {
      // Use measured content width to match browser preview exactly
      const root = parseHtmlToNodes(html, 'Test', { rootWidth: contentWidth })
      setParsedRoot(root)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Parse error')
      setParsedRoot(null)
    }
  }, [html, contentWidth])

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

  // Dev-only check
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
      <header className="flex items-center justify-between px-4 py-2 bg-white border-b">
        <h1 className="text-lg font-bold">🧪 Parser Test Lab</h1>
        <div className="flex items-center gap-4">
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
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b overflow-x-auto">
          <span className="text-xs text-gray-500 shrink-0">Saved:</span>
          {savedTests.map(test => (
            <div
              key={test.id}
              className="flex items-center gap-1 px-2 py-1 bg-white border rounded text-sm shrink-0"
            >
              <button
                onClick={() => handleLoadTest(test)}
                className="hover:text-blue-600"
              >
                {test.name}
              </button>
              <button
                onClick={() => handleDeleteTest(test.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Content - 3 Panels */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Monaco Editor */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium">
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

        {/* Middle: HTML Preview + Scytle Canvas */}
        <div className="w-1/3 border-r flex flex-col">
          {/* HTML Preview */}
          <div className="flex-1 flex flex-col border-b">
            <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Browser Preview
            </div>
            <div ref={iframeContainerRef} className="flex-1">
              <iframe
                srcDoc={`
                <!DOCTYPE html>
                <html>
                <head>
                  <link rel="preconnect" href="https://fonts.googleapis.com">
                  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap" rel="stylesheet">
                  <script src="https://cdn.tailwindcss.com"></script>
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
                  </script>
                  <style>body { margin: 0; padding: 16px; font-family: 'Inter', sans-serif; }</style>
                </head>
                <body>${html}</body>
                </html>
              `}
              className="flex-1 w-full bg-white"
              title="HTML Preview"
            />
            </div>
          </div>

          {/* Scytle Canvas Preview */}
          <div className="flex-1 flex flex-col">
            <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-blue-500'}`} />
              Scytle Canvas Output
              {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
            </div>
            <div className="flex-1 overflow-auto">
              <CanvasPreview root={parsedRoot} />
            </div>
          </div>
        </div>

        {/* Right: Node Tree + Inspector */}
        <div className="w-1/3 flex flex-col">
          {/* Node Tree */}
          <div className="flex-1 flex flex-col border-b overflow-hidden">
            <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium">
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
            <div className="px-3 py-2 bg-gray-100 border-b text-sm font-medium">
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
