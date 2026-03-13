'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowUp, Sparkles, ArrowLeft, Zap, Globe, Smartphone,
    Paperclip, Check, ChevronDown, X, Image as ImageIcon,
    FileText, Loader2
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjectStore } from '@/store'
import type { AiModel } from '@/types'

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const AI_MODELS = [
    { id: 'claude-sonnet' as AiModel, label: 'Claude Sonnet', desc: 'Best design quality', recommended: true },
    { id: 'claude-opus' as AiModel, label: 'Claude Opus', desc: 'Premium quality' },
    { id: 'gemini-2.5-flash' as AiModel, label: 'Gemini 2.5 Flash', desc: 'Fast & balanced' },
    { id: 'gemini-2.5-pro' as AiModel, label: 'Gemini 2.5 Pro', desc: 'Best Gemini quality' },
] as const

const SUGGESTIONS = {
    web: [
        { label: 'SaaS Landing Page', desc: 'Marketing site with pricing & features' },
        { label: 'Portfolio Website', desc: 'Showcase creative work & projects' },
        { label: 'E-commerce Store', desc: 'Product catalog with cart & checkout' },
    ],
    app: [
        { label: 'Dashboard App', desc: 'Analytics & data visualization' },
        { label: 'Social Mobile App', desc: 'Feed, profiles, messaging' },
        { label: 'CRM Platform', desc: 'Manage leads, deals & contacts' },
    ],
} as const

const PLACEHOLDERS = {
    web: 'A SaaS platform for managing freelance projects with time tracking, invoicing, and client portal...',
    app: 'A project management app with Kanban boards, team chat, file sharing, and analytics dashboard...',
} as const

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function deriveProjectName(description: string): string {
    const cleaned = description
        .replace(/^(i want to |i need |build me |create |make |design )/i, '')
        .replace(/^(a |an |the )/i, '')
    const words = cleaned.split(/\s+/).slice(0, 5).join(' ')
    return words.charAt(0).toUpperCase() + words.slice(1)
}

// ─────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────

export default function NewProjectPage() {
    const router = useRouter()
    const { createProject, isLoading } = useProjectStore()

    const [input, setInput] = useState('')
    const [productType, setProductType] = useState<'web' | 'app'>('web')
    const [selectedModel, setSelectedModel] = useState<AiModel>('claude-sonnet')
    const [attachments, setAttachments] = useState<string[]>([])
    const [showAttachMenu, setShowAttachMenu] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const attachMenuRef = useRef<HTMLDivElement>(null)

    // Auto-focus
    useEffect(() => {
        textareaRef.current?.focus()
    }, [])

    // Auto-resize textarea
    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }, [input])

    // Close attach menu on outside click
    useEffect(() => {
        if (!showAttachMenu) return
        const handler = (e: MouseEvent) => {
            if (attachMenuRef.current && !attachMenuRef.current.contains(e.target as Node)) {
                setShowAttachMenu(false)
            }
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [showAttachMenu])

    const handleSubmit = useCallback(async () => {
        const trimmed = input.trim()
        if (!trimmed || isLoading || isGenerating) return

        setIsGenerating(true)
        const name = deriveProjectName(trimmed)
        const project = await createProject({
            name: name || 'Untitled Project',
            description: trimmed,
            productType,
            aiModel: selectedModel,
        })

        if (project) {
            const params = new URLSearchParams()
            if (productType !== 'web') params.set('type', productType)
            if (selectedModel !== 'claude-sonnet') params.set('model', selectedModel)
            const qs = params.toString()
            router.push(`/project/${project.projectId}${qs ? `?${qs}` : ''}`)
        } else {
            setIsGenerating(false)
        }
    }, [input, isLoading, isGenerating, createProject, router])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const currentModel = AI_MODELS.find(m => m.id === selectedModel) ?? AI_MODELS[1]

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="flex items-center h-14 px-5 border-b border-border/40">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Dashboard
                </Link>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
                        <Zap className="w-3 h-3 text-background" strokeWidth={2.5} />
                    </div>
                    <span className="font-display font-bold text-sm tracking-tight">Scytle</span>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 pb-24">
                <div className="w-full max-w-2xl">
                    {/* Heading */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-accent/70 mb-5 shadow-lg shadow-accent/20">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight mb-2">
                            What do you want to build?
                        </h1>
                        <p className="text-muted-foreground text-base">
                            Describe your idea and we&apos;ll bring it to life on canvas.
                        </p>
                    </div>

                    {/* Product Type Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="inline-flex items-center bg-muted/50 rounded-xl p-1 border border-border/30">
                            <button
                                onClick={() => setProductType('web')}
                                className={`inline-flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 ${productType === 'web'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Globe className="w-4 h-4" />
                                Website
                            </button>
                            <button
                                onClick={() => setProductType('app')}
                                className={`inline-flex items-center gap-2 px-5 py-2 rounded-[10px] text-sm font-medium transition-all duration-200 ${productType === 'app'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Smartphone className="w-4 h-4" />
                                App
                            </button>
                        </div>
                    </div>

                    {/* Main Input — subtle focus: shadow lift only, no border change, no outline */}
                    <div className="relative rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus-within:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] transition-shadow duration-200">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={PLACEHOLDERS[productType]}
                            rows={1}
                            className="w-full resize-none bg-transparent px-5 pt-4 pb-16 text-base placeholder:text-muted-foreground/40 focus:outline-none focus-visible:outline-none focus:ring-0 min-h-14 max-h-[200px]"
                        />

                        {/* Attachments preview */}
                        {attachments.length > 0 && (
                            <div className="px-5 pb-2 flex flex-wrap gap-2">
                                {attachments.map((name, i) => (
                                    <div key={`${name}-${i}`} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground border border-border/30">
                                        <ImageIcon className="w-3 h-3" />
                                        {name}
                                        <button
                                            onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))}
                                            className="hover:text-foreground transition-colors"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bottom toolbar */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center">
                            {/* Left tools */}
                            <div className="flex items-center gap-1">
                                {/* Attach */}
                                <div className="relative" ref={attachMenuRef}>
                                    <button
                                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                                    >
                                        <Paperclip className="w-3.5 h-3.5" />
                                        Attach
                                    </button>
                                    {showAttachMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-popover border border-border/50 rounded-xl shadow-lg p-1.5 z-10">
                                            <button
                                                onClick={() => { setAttachments(prev => [...prev, 'screenshot.png']); setShowAttachMenu(false) }}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                                            >
                                                <ImageIcon className="w-4 h-4" /> Reference Image
                                            </button>
                                            <button
                                                onClick={() => { setAttachments(prev => [...prev, 'requirements.pdf']); setShowAttachMenu(false) }}
                                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                                            >
                                                <FileText className="w-4 h-4" /> Document
                                            </button>
                                        </div>
                                    )}
                                </div>

                            </div>

                            <div className="flex-1" />

                            {/* Model selector */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors mr-2">
                                        <Zap className="w-3 h-3" />
                                        {currentModel.label}
                                        <ChevronDown className="w-3 h-3 opacity-50" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" sideOffset={8} className="w-56 rounded-xl p-1.5">
                                    {AI_MODELS.map((model) => (
                                        <DropdownMenuItem
                                            key={model.id}
                                            onClick={() => setSelectedModel(model.id)}
                                            className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer"
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium">{model.label}</span>
                                                    {'recommended' in model && model.recommended && (
                                                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-accent/10 text-accent leading-none">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">{model.desc}</p>
                                            </div>
                                            {selectedModel === model.id && (
                                                <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                                            )}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Generate button */}
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim() || isGenerating}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-150 active:scale-[0.97]"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        Generate
                                        <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Suggestion chips */}
                    <div className="mt-8">
                        <div className="flex flex-wrap justify-center gap-2">
                            {SUGGESTIONS[productType].map((s) => (
                                <button
                                    key={s.label}
                                    type="button"
                                    onClick={() => {
                                        setInput(s.label.toLowerCase())
                                        textareaRef.current?.focus()
                                    }}
                                    className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 text-sm text-muted-foreground hover:text-foreground hover:border-border hover:shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-all duration-200"
                                >
                                    <span className="font-medium">{s.label}</span>
                                    <span className="text-muted-foreground/30 hidden sm:inline">·</span>
                                    <span className="text-xs text-muted-foreground/40 hidden sm:inline">{s.desc}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
