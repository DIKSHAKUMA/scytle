'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
    MessageSquare, Paintbrush, FileText, Layers, Undo2, Redo2,
    Share2, Download, Zap, Plus, ChevronRight, ChevronDown,
    Eye, EyeOff, Lock, Unlock, Trash2, GripVertical, Sparkles,
    Paperclip, ArrowUp, MousePointer, Hand, Type, Square, ImageIcon,
    ZoomIn, ZoomOut, Minus, Check, ArrowLeft, Search,
    LayoutGrid, X, Move, Palette, SlidersHorizontal
} from 'lucide-react'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

type LeftTab = 'files' | 'chat'
type RightTab = 'design' | 'theme'
type CanvasTool = 'select' | 'hand' | 'text' | 'frame'

interface SitemapNode {
    id: string
    name: string
    status: 'planned' | 'generating' | 'designed'
    x: number
    y: number
    children?: string[]
}

interface ChatMessage {
    id: string
    role: 'user' | 'ai' | 'system'
    text: string
    timestamp: string
}

interface LayerNode {
    id: string
    name: string
    type: 'frame' | 'text' | 'image'
    visible: boolean
    locked: boolean
    expanded?: boolean
    depth: number
    children?: LayerNode[]
}

// ─────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────

const MOCK_SITEMAP: SitemapNode[] = [
    { id: 'home', name: 'Home', status: 'designed', x: 400, y: 60, children: ['about', 'pricing', 'blog'] },
    { id: 'dashboard', name: 'Dashboard', status: 'designed', x: 720, y: 60, children: ['projects', 'settings'] },
    { id: 'about', name: 'About', status: 'planned', x: 280, y: 200 },
    { id: 'pricing', name: 'Pricing', status: 'planned', x: 400, y: 200 },
    { id: 'blog', name: 'Blog', status: 'planned', x: 520, y: 200 },
    { id: 'projects', name: 'Projects', status: 'planned', x: 660, y: 200 },
    { id: 'settings', name: 'Settings', status: 'planned', x: 780, y: 200 },
]

const MOCK_CHAT: ChatMessage[] = [
    { id: '1', role: 'system', text: 'Project created: FreelanceHub', timestamp: '2:30 PM' },
    { id: '2', role: 'ai', text: 'I\'ve generated a sitemap for FreelanceHub with 7 pages: Home, Dashboard, About, Pricing, Blog, Projects, and Settings.', timestamp: '2:30 PM' },
    { id: '3', role: 'user', text: 'Generate the home page design', timestamp: '2:31 PM' },
    { id: '4', role: 'ai', text: 'Home page designed! I created a modern landing page with:\n\n• Hero section with headline and CTA\n• Trusted by logos bar\n• 3-column features grid\n• Testimonials carousel\n• Pricing cards\n• Footer with links', timestamp: '2:31 PM' },
    { id: '5', role: 'user', text: 'Now design the dashboard', timestamp: '2:32 PM' },
    { id: '6', role: 'ai', text: 'Dashboard is ready! I used a sidebar layout with:\n\n• Dark sidebar with nav items\n• Stats cards row (Revenue, Projects, Clients, Hours)\n• Revenue chart\n• Recent projects table\n• Activity feed', timestamp: '2:33 PM' },
]

const MOCK_LAYERS: LayerNode[] = [
    {
        id: 'root', name: 'Dashboard', type: 'frame', visible: true, locked: false, expanded: true, depth: 0,
        children: [
            {
                id: 'sidebar', name: 'Sidebar', type: 'frame', visible: true, locked: false, expanded: false, depth: 1,
                children: [
                    { id: 'logo', name: 'Logo', type: 'text', visible: true, locked: false, depth: 2 },
                    { id: 'nav', name: 'Nav Items', type: 'frame', visible: true, locked: false, depth: 2 },
                ]
            },
            {
                id: 'main', name: 'Main Content', type: 'frame', visible: true, locked: false, expanded: true, depth: 1,
                children: [
                    { id: 'header', name: 'Page Header', type: 'frame', visible: true, locked: false, depth: 2 },
                    {
                        id: 'stats', name: 'Stats Cards', type: 'frame', visible: true, locked: false, expanded: false, depth: 2,
                        children: [
                            { id: 'stat1', name: '$12.4k Revenue', type: 'frame', visible: true, locked: false, depth: 3 },
                            { id: 'stat2', name: '24 Projects', type: 'frame', visible: true, locked: false, depth: 3 },
                            { id: 'stat3', name: '8 Clients', type: 'frame', visible: true, locked: false, depth: 3 },
                            { id: 'stat4', name: '156h Hours', type: 'frame', visible: true, locked: false, depth: 3 },
                        ]
                    },
                    { id: 'chart', name: 'Revenue Chart', type: 'frame', visible: true, locked: false, depth: 2 },
                    { id: 'table', name: 'Recent Projects', type: 'frame', visible: true, locked: false, depth: 2 },
                ]
            },
        ]
    }
]

const THEME_PRESETS = [
    { name: 'Default', primary: '#6366f1', bg: '#ffffff', text: '#111827' },
    { name: 'Ocean', primary: '#0ea5e9', bg: '#f0f9ff', text: '#0c4a6e' },
    { name: 'Forest', primary: '#10b981', bg: '#f0fdf4', text: '#14532d' },
    { name: 'Sunset', primary: '#f97316', bg: '#fff7ed', text: '#7c2d12' },
    { name: 'Rose', primary: '#f43f5e', bg: '#fff1f2', text: '#881337' },
    { name: 'Dark', primary: '#8b5cf6', bg: '#0f172a', text: '#e2e8f0' },
]

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function WorkspaceDemoPage() {
    const [leftTab, setLeftTab] = useState<LeftTab>('files')
    const [rightTab, setRightTab] = useState<RightTab>('design')
    const [activeTool, setActiveTool] = useState<CanvasTool>('select')
    const [selectedNodeId, setSelectedNodeId] = useState<string | null>('dashboard')
    const [zoom, setZoom] = useState(65)
    const [chatInput, setChatInput] = useState('')
    const [showRightPanel, setShowRightPanel] = useState(true)
    const [contextPage, setContextPage] = useState('Dashboard')
    const [activeTheme, setActiveTheme] = useState(0)
    const [expandedLayers, setExpandedLayers] = useState<Set<string>>(new Set(['root', 'main']))
    const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null)
    const [pagesCollapsed, setPagesCollapsed] = useState(false)
    const [layersCollapsed, setLayersCollapsed] = useState(false)
    const [activePage, setActivePage] = useState('home')

    const handleNodeClick = useCallback((nodeId: string) => {
        setSelectedNodeId(nodeId)
        const node = MOCK_SITEMAP.find(n => n.id === nodeId)
        if (node) {
            setContextPage(node.name)
            if (node.status === 'designed') {
                setShowRightPanel(true)
            }
        }
    }, [])

    return (
        <div className="h-screen flex flex-col bg-[#f8f7f5] overflow-hidden">
            {/* ═══════════════════════════════════════ TOP BAR ═══════════════════════════════════════ */}
            <header className="flex items-center h-12 px-3 bg-card border-b border-border/60 shrink-0">
                {/* Left: Back + Project name */}
                <Link href="/demo/flow" className="text-muted-foreground hover:text-foreground mr-2">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                        <Zap className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-display font-semibold text-sm">FreelanceHub</span>
                    <span className="text-xs text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded">Web App</span>
                </div>

                {/* Center: Tools */}
                <div className="flex-1 flex items-center justify-center gap-0.5">
                    {([
                        { key: 'select' as const, icon: MousePointer, label: 'Select (V)' },
                        { key: 'hand' as const, icon: Hand, label: 'Hand (H)' },
                        { key: 'frame' as const, icon: Square, label: 'Frame (F)' },
                        { key: 'text' as const, icon: Type, label: 'Text (T)' },
                    ]).map(tool => (
                        <button
                            key={tool.key}
                            title={tool.label}
                            onClick={() => setActiveTool(tool.key)}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${activeTool === tool.key
                                    ? 'bg-foreground text-background'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                }`}
                        >
                            <tool.icon className="w-4 h-4" />
                        </button>
                    ))}

                    <div className="w-px h-5 bg-border/60 mx-2" />

                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                        <Undo2 className="w-4 h-4" />
                    </button>
                    <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground/40">
                        <Redo2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                        <Share2 className="w-3.5 h-3.5" />
                        Share
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium hover:opacity-90 transition-colors">
                        <Download className="w-3.5 h-3.5" />
                        Export
                    </button>
                </div>
            </header>

            {/* ═══════════════════════════════════════ MAIN AREA ═══════════════════════════════════════ */}
            <div className="flex-1 flex min-h-0">

                {/* ─── LEFT PANEL (Figma-style: Files | Chat) ──────── */}
                <div className="w-72 flex flex-col shrink-0 border-r border-border/60 bg-card">
                    {/* Tab bar — horizontal, like Figma's "File" / "Assets" */}
                    <div className="flex items-center border-b border-border/40">
                        <button
                            onClick={() => setLeftTab('files')}
                            className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors relative ${leftTab === 'files'
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/60 hover:text-foreground'
                                }`}
                        >
                            Files
                            {leftTab === 'files' && (
                                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-foreground rounded-full" />
                            )}
                        </button>
                        <button
                            onClick={() => setLeftTab('chat')}
                            className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors relative ${leftTab === 'chat'
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/60 hover:text-foreground'
                                }`}
                        >
                            Chat
                            {leftTab === 'chat' && (
                                <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-foreground rounded-full" />
                            )}
                        </button>
                        <button className="px-2.5 py-2.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                            <Search className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* ═══ FILES TAB — Pages + Layers (like Figma) ═══ */}
                    {leftTab === 'files' && (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* ── Pages Section ── */}
                            <div className={`${layersCollapsed ? 'flex-1' : ''} shrink-0`}>
                                <button
                                    onClick={() => setPagesCollapsed(!pagesCollapsed)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground/70 hover:text-foreground transition-colors"
                                >
                                    <div className="flex items-center gap-1.5">
                                        {pagesCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        Pages
                                    </div>
                                    <Plus className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-foreground" />
                                </button>

                                {!pagesCollapsed && (
                                    <div className="px-1 pb-1 space-y-px">
                                        {MOCK_SITEMAP.map(page => (
                                            <button
                                                key={page.id}
                                                onClick={() => { setActivePage(page.id); handleNodeClick(page.id) }}
                                                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-all group ${activePage === page.id
                                                        ? 'bg-accent/10 text-accent font-medium'
                                                        : 'text-foreground/70 hover:bg-muted/50'
                                                    }`}
                                            >
                                                <span className="flex-1 text-left truncate">{page.name}</span>
                                                <span className={`text-[10px] opacity-60 ${page.status === 'designed' ? 'text-green-600' : 'text-muted-foreground'
                                                    }`}>
                                                    {page.status === 'designed' ? '✨' : '📝'}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── Divider ── */}
                            <div className="h-px bg-border/40" />

                            {/* ── Layers Section ── */}
                            <div className="flex-1 flex flex-col min-h-0">
                                <button
                                    onClick={() => setLayersCollapsed(!layersCollapsed)}
                                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-muted-foreground/70 hover:text-foreground transition-colors shrink-0"
                                >
                                    <div className="flex items-center gap-1.5">
                                        {layersCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                        Layers
                                    </div>
                                    <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground/40 hover:text-foreground" />
                                </button>

                                {!layersCollapsed && (
                                    <div className="flex-1 overflow-y-auto px-1 pb-1">
                                        {renderLayerTree(MOCK_LAYERS, expandedLayers, setExpandedLayers, selectedLayerId, setSelectedLayerId)}
                                    </div>
                                )}
                            </div>

                            {/* Generate all button */}
                            <div className="p-2 border-t border-border/40 shrink-0">
                                <button className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-accent/10 text-accent text-xs font-medium hover:bg-accent/15 transition-colors">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    Generate All Pages
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ═══ CHAT TAB ═══ */}
                    {leftTab === 'chat' && (
                        <div className="flex-1 flex flex-col min-h-0">
                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
                                {MOCK_CHAT.map(msg => (
                                    <div key={msg.id} className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                                        {msg.role === 'system' ? (
                                            <div className="text-center">
                                                <span className="text-[10px] text-muted-foreground/40 bg-muted/50 px-2 py-0.5 rounded-full">
                                                    {msg.text} · {msg.timestamp}
                                                </span>
                                            </div>
                                        ) : msg.role === 'user' ? (
                                            <div className="max-w-[85%] bg-foreground text-background px-3 py-2 rounded-2xl rounded-br-sm">
                                                <p className="text-xs leading-relaxed">{msg.text}</p>
                                            </div>
                                        ) : (
                                            <div className="max-w-[95%]">
                                                <div className="flex items-center gap-1.5 mb-1">
                                                    <div className="w-4 h-4 rounded-full bg-linear-to-br from-accent to-accent/70 flex items-center justify-center">
                                                        <Sparkles className="w-2.5 h-2.5 text-white" />
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground/50">{msg.timestamp}</span>
                                                </div>
                                                <div className="bg-muted/40 px-3 py-2 rounded-2xl rounded-tl-sm border border-border/30">
                                                    <p className="text-xs leading-relaxed text-foreground/80 whitespace-pre-line">{msg.text}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Context indicator + Input */}
                            <div className="border-t border-border/40 p-2.5 shrink-0">
                                <div className="flex items-center gap-1.5 mb-2 px-1">
                                    <span className="text-[10px] text-muted-foreground/50">Context:</span>
                                    <button className="inline-flex items-center gap-1 text-[10px] font-medium text-accent bg-accent/5 px-1.5 py-0.5 rounded border border-accent/10">
                                        {contextPage}
                                        <ChevronDown className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                                <div className="flex items-end gap-1.5">
                                    <div className="flex-1 relative">
                                        <textarea
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Type a message..."
                                            rows={1}
                                            className="w-full resize-none bg-muted/40 border border-border/40 rounded-xl px-3 py-2 text-xs placeholder:text-muted-foreground/40 focus:outline-none focus:border-accent/40 min-h-9 max-h-25"
                                        />
                                        <button className="absolute bottom-1.5 right-1.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                                            <Paperclip className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                    <button className="w-8 h-8 rounded-xl bg-foreground text-background flex items-center justify-center shrink-0 hover:opacity-90 transition-colors">
                                        <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ─── CANVAS ─────────────────────────────────────── */}
                <div className="flex-1 relative overflow-hidden bg-[#e8e5e0]">
                    {/* Canvas content — mock sitemap + design */}
                    <div className="absolute inset-0" style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
                        {/* Grid dots background */}
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle, #ccc 1px, transparent 1px)',
                            backgroundSize: '30px 30px',
                        }} />

                        {/* ═══ SITEMAP NODES ═══ */}
                        {MOCK_SITEMAP.map(node => (
                            <div
                                key={node.id}
                                className={`absolute cursor-pointer transition-all ${selectedNodeId === node.id ? 'ring-2 ring-accent ring-offset-2' : ''
                                    }`}
                                style={{ left: node.x, top: node.y, width: 120 }}
                                onClick={() => handleNodeClick(node.id)}
                            >
                                <div className={`rounded-xl border-2 p-3 text-center transition-colors ${node.status === 'designed'
                                        ? 'bg-white border-green-200 shadow-sm'
                                        : 'bg-white/80 border-border/60 border-dashed'
                                    }`}>
                                    <div className="text-xs font-medium text-foreground mb-1">{node.name}</div>
                                    <div className={`text-[10px] ${node.status === 'designed' ? 'text-green-600' : 'text-muted-foreground/40'
                                        }`}>
                                        {node.status === 'designed' ? '✨ Designed' : '📝 Planned'}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* ═══ Connection lines (SVG) ═══ */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                            {MOCK_SITEMAP.filter(n => n.children).flatMap(parent =>
                                (parent.children || []).map(childId => {
                                    const child = MOCK_SITEMAP.find(n => n.id === childId)
                                    if (!child) return null
                                    return (
                                        <line
                                            key={`${parent.id}-${childId}`}
                                            x1={parent.x + 60}
                                            y1={parent.y + 65}
                                            x2={child.x + 60}
                                            y2={child.y}
                                            stroke="#d1d5db"
                                            strokeWidth="1.5"
                                            strokeDasharray="4 4"
                                        />
                                    )
                                })
                            )}
                        </svg>

                        {/* ═══ GENERATED DESIGN FRAME (Dashboard) ═══ */}
                        <div
                            className={`absolute rounded-xl overflow-hidden shadow-xl border-2 transition-all ${selectedNodeId === 'dashboard' ? 'border-accent' : 'border-border/40'
                                }`}
                            style={{ left: 180, top: 340, width: 760, height: 500 }}
                        >
                            <div className="absolute -top-6 left-0 text-xs font-medium text-accent flex items-center gap-1.5">
                                <Square className="w-3 h-3" />
                                Dashboard — 1440×900
                            </div>

                            {/* Mock Dashboard Design */}
                            <div className="w-full h-full bg-white flex">
                                <div className="w-35 bg-gray-900 text-white p-3 shrink-0">
                                    <div className="h-5 w-16 bg-white/20 rounded mb-4" />
                                    <div className="space-y-1">
                                        {['Dashboard', 'Projects', 'Invoices', 'Clients', 'Time', 'Settings'].map((item, i) => (
                                            <div key={item} className={`text-[9px] px-2 py-1.5 rounded-md flex items-center gap-1.5 ${i === 0 ? 'bg-indigo-600' : 'text-gray-400 hover:bg-gray-800'
                                                }`}>
                                                <div className="w-2.5 h-2.5 rounded bg-current opacity-50" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">Dashboard</div>
                                            <div className="text-[9px] text-gray-400">Welcome back, Dilip</div>
                                        </div>
                                        <div className="w-14 h-5 bg-indigo-600 rounded-md text-[8px] text-white flex items-center justify-center">New Project</div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mb-3">
                                        {[
                                            { label: 'Revenue', value: '$12.4k', change: '+12%', color: 'text-green-600' },
                                            { label: 'Projects', value: '24', change: '+3', color: 'text-green-600' },
                                            { label: 'Clients', value: '8', change: '+1', color: 'text-green-600' },
                                            { label: 'Hours', value: '156h', change: '-5h', color: 'text-red-500' },
                                        ].map(stat => (
                                            <div key={stat.label} className="bg-gray-50 border border-gray-100 rounded-lg p-2">
                                                <div className="text-[8px] text-gray-400">{stat.label}</div>
                                                <div className="text-xs font-bold text-gray-900">{stat.value}</div>
                                                <div className={`text-[8px] ${stat.color}`}>{stat.change}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 mb-3">
                                        <div className="text-[9px] font-medium text-gray-700 mb-2">Revenue Overview</div>
                                        <div className="h-20 flex items-end gap-1 px-1">
                                            {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((h, i) => (
                                                <div key={i} className="flex-1 bg-indigo-500/20 rounded-t relative">
                                                    <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-t" style={{ height: `${h}%` }} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-2">
                                        <div className="text-[9px] font-medium text-gray-700 mb-2">Recent Projects</div>
                                        <table className="w-full">
                                            <thead>
                                                <tr className="text-[8px] text-gray-400 border-b border-gray-200">
                                                    <td className="pb-1">Project</td>
                                                    <td className="pb-1">Client</td>
                                                    <td className="pb-1">Status</td>
                                                    <td className="pb-1 text-right">Amount</td>
                                                </tr>
                                            </thead>
                                            <tbody className="text-[8px] text-gray-700">
                                                {[
                                                    { name: 'Brand Identity', client: 'TechCorp', status: 'Active', amount: '$2,400' },
                                                    { name: 'Web Redesign', client: 'Global Agency', status: 'Active', amount: '$1,850' },
                                                    { name: 'Mobile App', client: 'StartupX', status: 'Review', amount: '$3,200' },
                                                ].map((row, i) => (
                                                    <tr key={i} className="border-b border-gray-100 last:border-0">
                                                        <td className="py-1 font-medium">{row.name}</td>
                                                        <td className="py-1 text-gray-400">{row.client}</td>
                                                        <td className="py-1">
                                                            <span className={`px-1 py-0.5 rounded text-[7px] ${row.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                                                }`}>{row.status}</span>
                                                        </td>
                                                        <td className="py-1 text-right font-medium">{row.amount}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ═══ GENERATED DESIGN FRAME (Home - Landing Page) ═══ */}
                        <div
                            className={`absolute rounded-xl overflow-hidden shadow-xl border-2 transition-all ${selectedNodeId === 'home' ? 'border-accent' : 'border-border/40'
                                }`}
                            style={{ left: 1020, top: 340, width: 760, height: 500 }}
                        >
                            <div className="absolute -top-6 left-0 text-xs font-medium text-accent flex items-center gap-1.5">
                                <Square className="w-3 h-3" />
                                Home — 1440×3200
                            </div>
                            <div className="w-full h-full bg-white overflow-hidden">
                                <div className="h-8 bg-white border-b border-gray-100 flex items-center px-4">
                                    <div className="w-12 h-3 bg-gray-900 rounded" />
                                    <div className="flex-1" />
                                    <div className="flex gap-3">
                                        {['Features', 'Pricing', 'Blog'].map(item => (
                                            <div key={item} className="text-[8px] text-gray-500">{item}</div>
                                        ))}
                                        <div className="w-12 h-4 bg-indigo-600 rounded text-[7px] text-white flex items-center justify-center">Get Started</div>
                                    </div>
                                </div>
                                <div className="px-8 py-6 text-center">
                                    <div className="inline-block px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-[7px] mb-2">#1 Freelance Platform</div>
                                    <div className="text-sm font-bold text-gray-900 mb-1">Manage Projects Like a Pro</div>
                                    <div className="text-[8px] text-gray-500 max-w-75 mx-auto mb-3">Track time, send invoices, and delight clients — all in one beautiful platform.</div>
                                    <div className="flex justify-center gap-1.5">
                                        <div className="w-16 h-5 bg-indigo-600 rounded-md text-[7px] text-white flex items-center justify-center">Start Free</div>
                                        <div className="w-16 h-5 bg-white border border-gray-200 rounded-md text-[7px] text-gray-700 flex items-center justify-center">View Demo</div>
                                    </div>
                                </div>
                                <div className="px-8 py-3 border-t border-b border-gray-100">
                                    <div className="text-[7px] text-gray-400 text-center mb-2">Trusted by 2,000+ freelancers</div>
                                    <div className="flex justify-center gap-4">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <div key={i} className="w-12 h-4 bg-gray-100 rounded" />
                                        ))}
                                    </div>
                                </div>
                                <div className="px-8 py-4">
                                    <div className="text-xs font-bold text-gray-900 text-center mb-3">Everything you need</div>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { title: 'Time Tracking', desc: 'Smart timer with project tagging' },
                                            { title: 'Invoicing', desc: 'Professional invoices in seconds' },
                                            { title: 'Client Portal', desc: 'Branded portal for clients' },
                                        ].map(f => (
                                            <div key={f.title} className="p-2 bg-gray-50 rounded-lg">
                                                <div className="w-5 h-5 bg-indigo-100 rounded-md mb-1.5 flex items-center justify-center">
                                                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-sm" />
                                                </div>
                                                <div className="text-[9px] font-semibold text-gray-900">{f.title}</div>
                                                <div className="text-[7px] text-gray-500 mt-0.5">{f.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ═══ ZOOM CONTROLS (overlay) ═══ */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-card/90 backdrop-blur-sm border border-border/60 rounded-xl px-2 py-1 shadow-sm">
                        <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                            <ZoomOut className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setZoom(100)} className="px-2 py-1 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors min-w-11 text-center">
                            {zoom}%
                        </button>
                        <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                            <ZoomIn className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* ─── RIGHT PANEL (Figma-style: Design | Theme) ──── */}
                {showRightPanel && (
                    <div className="w-64 flex flex-col shrink-0 border-l border-border/60 bg-card">
                        {/* Tab bar — like Figma's "Design" / "Prototype" */}
                        <div className="flex items-center border-b border-border/40">
                            <button
                                onClick={() => setRightTab('design')}
                                className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors relative ${rightTab === 'design'
                                        ? 'text-foreground'
                                        : 'text-muted-foreground/60 hover:text-foreground'
                                    }`}
                            >
                                Design
                                {rightTab === 'design' && (
                                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-foreground rounded-full" />
                                )}
                            </button>
                            <button
                                onClick={() => setRightTab('theme')}
                                className={`flex-1 py-2.5 text-xs font-medium text-center transition-colors relative ${rightTab === 'theme'
                                        ? 'text-foreground'
                                        : 'text-muted-foreground/60 hover:text-foreground'
                                    }`}
                            >
                                Theme
                                {rightTab === 'theme' && (
                                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-foreground rounded-full" />
                                )}
                            </button>
                        </div>

                        {/* ═══ DESIGN TAB (Properties) ═══ */}
                        {rightTab === 'design' && (
                            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Name</label>
                                    <div className="mt-1 h-8 bg-muted/40 border border-border/40 rounded-lg px-2.5 flex items-center text-xs">
                                        {contextPage}
                                    </div>
                                </div>

                                {/* Position */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Position</label>
                                    <div className="mt-1 grid grid-cols-2 gap-1.5">
                                        <div className="h-7 bg-muted/40 border border-border/40 rounded-lg px-2 flex items-center text-[10px]">
                                            <span className="text-muted-foreground/50 mr-1">X</span> 180
                                        </div>
                                        <div className="h-7 bg-muted/40 border border-border/40 rounded-lg px-2 flex items-center text-[10px]">
                                            <span className="text-muted-foreground/50 mr-1">Y</span> 340
                                        </div>
                                    </div>
                                </div>

                                {/* Size */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Size</label>
                                    <div className="mt-1 grid grid-cols-2 gap-1.5">
                                        <div className="h-7 bg-muted/40 border border-border/40 rounded-lg px-2 flex items-center text-[10px]">
                                            <span className="text-muted-foreground/50 mr-1">W</span> 1440
                                        </div>
                                        <div className="h-7 bg-muted/40 border border-border/40 rounded-lg px-2 flex items-center text-[10px]">
                                            <span className="text-muted-foreground/50 mr-1">H</span> 900
                                        </div>
                                    </div>
                                </div>

                                {/* Fill */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Fill</label>
                                    <div className="mt-1 flex items-center gap-2 h-7 bg-muted/40 border border-border/40 rounded-lg px-2">
                                        <div className="w-4 h-4 rounded border border-border/60 bg-white" />
                                        <span className="text-[10px] font-mono text-muted-foreground">#FFFFFF</span>
                                    </div>
                                </div>

                                {/* Border */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Border</label>
                                    <div className="mt-1 flex items-center gap-2 h-7 bg-muted/40 border border-border/40 rounded-lg px-2">
                                        <div className="w-4 h-4 rounded border border-border/60 bg-gray-200" />
                                        <span className="text-[10px] font-mono text-muted-foreground">#E5E7EB</span>
                                        <span className="text-[10px] text-muted-foreground/50 ml-auto">1px</span>
                                    </div>
                                </div>

                                {/* Border Radius */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Radius</label>
                                    <div className="mt-1 h-7 bg-muted/40 border border-border/40 rounded-lg px-2.5 flex items-center text-[10px] font-mono text-muted-foreground">
                                        12
                                    </div>
                                </div>

                                {/* Layout */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Layout</label>
                                    <div className="mt-1 flex gap-1">
                                        {['None', 'Flex', 'Grid'].map((l, i) => (
                                            <button key={l} className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium ${i === 1 ? 'bg-foreground text-background' : 'bg-muted/40 text-muted-foreground'
                                                }`}>{l}</button>
                                        ))}
                                    </div>
                                    <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                                        <div className="h-7 bg-muted/40 border border-border/40 rounded-lg px-2 flex items-center text-[10px]">
                                            <span className="text-muted-foreground/50 mr-1">Dir</span> Row
                                        </div>
                                        <div className="h-7 bg-muted/40 border border-border/40 rounded-lg px-2 flex items-center text-[10px]">
                                            <span className="text-muted-foreground/50 mr-1">Gap</span> 0
                                        </div>
                                    </div>
                                </div>

                                {/* Opacity */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Opacity</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className="flex-1 h-2 bg-muted/60 rounded-full relative">
                                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-card" />
                                        </div>
                                        <span className="text-[10px] font-mono text-muted-foreground/50 w-8 text-right">100%</span>
                                    </div>
                                </div>

                                {/* Variables — like Figma */}
                                <div className="pt-2 border-t border-border/40">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Variables</label>
                                        <SlidersHorizontal className="w-3 h-3 text-muted-foreground/40" />
                                    </div>
                                </div>

                                {/* Styles — like Figma */}
                                <div className="pt-2 border-t border-border/40">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Styles</label>
                                        <Plus className="w-3 h-3 text-muted-foreground/40" />
                                    </div>
                                </div>

                                {/* Export — like Figma */}
                                <div className="pt-2 border-t border-border/40">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Export</label>
                                        <Plus className="w-3 h-3 text-muted-foreground/40" />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ═══ THEME TAB ═══ */}
                        {rightTab === 'theme' && (
                            <div className="flex-1 overflow-y-auto p-3 space-y-5">
                                {/* Preset Themes */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Presets</label>
                                        <button className="text-[10px] text-accent font-medium hover:underline">Shuffle</button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {THEME_PRESETS.map((theme, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setActiveTheme(i)}
                                                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all ${activeTheme === i
                                                        ? 'border-accent bg-accent/5'
                                                        : 'border-border/40 hover:border-border'
                                                    }`}
                                            >
                                                <div className="flex gap-0.5">
                                                    <div className="w-4 h-4 rounded-full border border-border/40" style={{ background: theme.primary }} />
                                                    <div className="w-4 h-4 rounded-full border border-border/40" style={{ background: theme.bg }} />
                                                    <div className="w-4 h-4 rounded-full border border-border/40" style={{ background: theme.text }} />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground">{theme.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Colors */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Colors</label>
                                    <div className="mt-2 space-y-1.5">
                                        {[
                                            { label: 'Primary', color: THEME_PRESETS[activeTheme].primary },
                                            { label: 'Background', color: THEME_PRESETS[activeTheme].bg },
                                            { label: 'Text', color: THEME_PRESETS[activeTheme].text },
                                            { label: 'Accent', color: '#10b981' },
                                            { label: 'Muted', color: '#6b7280' },
                                            { label: 'Border', color: '#e5e7eb' },
                                        ].map(c => (
                                            <div key={c.label} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
                                                <div className="w-5 h-5 rounded-md border border-border/60" style={{ background: c.color }} />
                                                <span className="text-xs text-muted-foreground flex-1">{c.label}</span>
                                                <span className="text-[10px] font-mono text-muted-foreground/50">{c.color}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Typography */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Typography</label>
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-14">Heading</span>
                                            <div className="flex-1 h-8 bg-muted/40 border border-border/40 rounded-lg px-2.5 flex items-center text-xs">
                                                Inter
                                                <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground/40" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-14">Body</span>
                                            <div className="flex-1 h-8 bg-muted/40 border border-border/40 rounded-lg px-2.5 flex items-center text-xs">
                                                Inter
                                                <ChevronDown className="w-3 h-3 ml-auto text-muted-foreground/40" />
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-14">Scale</span>
                                            <div className="flex-1 h-2 bg-muted/60 rounded-full relative">
                                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-card" />
                                            </div>
                                            <span className="text-[10px] font-mono text-muted-foreground/50 w-8 text-right">1.0x</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Style */}
                                <div>
                                    <label className="text-[10px] font-medium text-muted-foreground/60 uppercase tracking-wider">Style</label>
                                    <div className="mt-2 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-muted-foreground w-14">Radius</span>
                                            <div className="flex-1 h-2 bg-muted/60 rounded-full relative">
                                                <div className="absolute left-[60%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-foreground border-2 border-card" />
                                            </div>
                                            <span className="text-[10px] font-mono text-muted-foreground/50 w-8 text-right">12px</span>
                                        </div>

                                        <div>
                                            <span className="text-xs text-muted-foreground">Buttons</span>
                                            <div className="mt-1.5 flex gap-1">
                                                {['Solid', 'Outline', 'Ghost', 'Pill'].map((s, i) => (
                                                    <button
                                                        key={s}
                                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${i === 0
                                                                ? 'bg-foreground text-background'
                                                                : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                                                            }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-xs text-muted-foreground">Cards</span>
                                            <div className="mt-1.5 flex gap-1">
                                                {['Bordered', 'Shadow', 'Flat'].map((s, i) => (
                                                    <button
                                                        key={s}
                                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-medium transition-all ${i === 0
                                                                ? 'bg-foreground text-background'
                                                                : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                                                            }`}
                                                    >
                                                        {s}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Apply button */}
                                <button className="w-full py-2 rounded-xl bg-accent text-white text-xs font-medium hover:opacity-90 transition-colors">
                                    Apply to All Pages
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// ─────────────────────────────────────────────
// Layer Tree Renderer
// ─────────────────────────────────────────────

function renderLayerTree(
    nodes: LayerNode[],
    expanded: Set<string>,
    setExpanded: React.Dispatch<React.SetStateAction<Set<string>>>,
    selectedId: string | null,
    setSelectedId: (id: string) => void,
): React.ReactNode {
    return nodes.map(node => {
        const hasChildren = node.children && node.children.length > 0
        const isExpanded = expanded.has(node.id)
        const isSelected = selectedId === node.id

        return (
            <div key={node.id}>
                <button
                    onClick={() => setSelectedId(node.id)}
                    className={`w-full flex items-center gap-1 px-1 py-1 rounded text-[11px] transition-all hover:bg-muted/50 group ${isSelected ? 'bg-accent/10 text-accent' : 'text-foreground/80'
                        }`}
                    style={{ paddingLeft: `${8 + node.depth * 16}px` }}
                >
                    {hasChildren ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                setExpanded(prev => {
                                    const next = new Set(prev)
                                    isExpanded ? next.delete(node.id) : next.add(node.id)
                                    return next
                                })
                            }}
                            className="w-3 h-3 flex items-center justify-center shrink-0"
                        >
                            {isExpanded ? <ChevronDown className="w-2.5 h-2.5" /> : <ChevronRight className="w-2.5 h-2.5" />}
                        </button>
                    ) : (
                        <span className="w-3" />
                    )}

                    <span className="shrink-0">
                        {node.type === 'frame' ? <Square className="w-3 h-3 text-blue-500/60" /> :
                            node.type === 'text' ? <Type className="w-3 h-3 text-purple-500/60" /> :
                                <ImageIcon className="w-3 h-3 text-green-500/60" />}
                    </span>

                    <span className="flex-1 truncate text-left">{node.name}</span>

                    <span className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        {node.visible ? <Eye className="w-3 h-3 text-muted-foreground/30" /> : <EyeOff className="w-3 h-3 text-muted-foreground/30" />}
                    </span>
                </button>

                {hasChildren && isExpanded && (
                    <div>
                        {renderLayerTree(node.children!, expanded, setExpanded, selectedId, setSelectedId)}
                    </div>
                )}
            </div>
        )
    })
}
