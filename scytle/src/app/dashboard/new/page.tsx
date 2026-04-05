'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowUp, Sparkles, ArrowLeft, Zap, Globe, Smartphone,
    Paperclip, X, Image as ImageIcon,
    Loader2
} from 'lucide-react'
import { ModelSelector } from '@/components/model-selector'
import { useProjectStore } from '@/store'
import { DEFAULT_MODEL } from '@/lib/ai/model-defs'
import { processImageFile, extractBase64Data } from '@/lib/image-utils'
import type { ImageAttachment } from '@/types'
// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

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
    const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL)
    const [attachedImages, setAttachedImages] = useState<ImageAttachment[]>([])
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatingStatus, setGeneratingStatus] = useState('')

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

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

    // ── Image attachment handlers ──────────────────────────────
    const addImages = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files).slice(0, 5 - attachedImages.length)
        const processed = await Promise.all(
            fileArray.map(f => processImageFile(f).catch(() => null))
        )
        const valid = processed.filter(Boolean) as ImageAttachment[]
        if (valid.length > 0) {
            setAttachedImages(prev => [...prev, ...valid].slice(0, 5))
        }
    }, [attachedImages.length])

    const removeImage = useCallback((id: string) => {
        setAttachedImages(prev => prev.filter(img => img.id !== id))
    }, [])

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) addImages(e.target.files)
        e.target.value = ''
    }, [addImages])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'))
        if (files.length > 0) addImages(files)
    }, [addImages])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }, [])

    const handlePaste = useCallback((e: React.ClipboardEvent) => {
        const items = Array.from(e.clipboardData.items)
        const imageFiles = items
            .filter(item => item.type.startsWith('image/'))
            .map(item => item.getAsFile())
            .filter(Boolean) as File[]
        if (imageFiles.length > 0) {
            e.preventDefault()
            addImages(imageFiles)
        }
    }, [addImages])

    const handleSubmit = useCallback(async () => {
        const trimmed = input.trim()
        const hasImages = attachedImages.length > 0
        if ((!trimmed && !hasImages) || isLoading || isGenerating) return

        setIsGenerating(true)
        const description = trimmed || 'Replicate this design'
        const name = trimmed ? deriveProjectName(trimmed) : 'Reference Design'

        // Create the project first
        const project = await createProject({
            name: name || 'Untitled Project',
            description,
            productType,
            aiModel: selectedModel as 'gemini-pro' | 'gemini-flash',
        })

        if (project) {
            // If images are attached, store them in sessionStorage for the project page to pick up
            if (hasImages) {
                const imagePayload = attachedImages.map(img => extractBase64Data(img.dataUrl))
                try {
                    sessionStorage.setItem(
                        `scytle-ref-images-${project.projectId}`,
                        JSON.stringify({
                            images: imagePayload,
                            userPrompt: trimmed || undefined,
                            model: selectedModel,
                        })
                    )
                } catch {
                    // sessionStorage might be full for large images, continue without
                    console.warn('⚠️ Could not store reference images in sessionStorage')
                }
            }

            const params = new URLSearchParams()
            if (productType !== 'web') params.set('type', productType)
            if (selectedModel !== 'gemini-pro') params.set('model', selectedModel)
            if (hasImages) params.set('ref', '1')
            const qs = params.toString()
            router.push(`/project/${project.projectId}${qs ? `?${qs}` : ''}`)
        } else {
            setIsGenerating(false)
            setGeneratingStatus('')
        }
    }, [input, isLoading, isGenerating, createProject, router, productType, selectedModel, attachedImages])

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

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
                    <div
                        className="relative rounded-2xl border border-border/50 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.04)] focus-within:shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] transition-shadow duration-200"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                    >
                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                        />

                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            placeholder={attachedImages.length > 0 ? 'Describe what to create from this reference (optional)...' : PLACEHOLDERS[productType]}
                            rows={1}
                            className="w-full resize-none bg-transparent px-5 pt-4 pb-16 text-base placeholder:text-muted-foreground/40 focus:outline-none focus-visible:outline-none focus:ring-0 min-h-14 max-h-[200px]"
                        />

                        {/* Image preview strip */}
                        {attachedImages.length > 0 && (
                            <div className="px-5 pb-2 flex flex-wrap gap-2">
                                {attachedImages.map(img => (
                                    <div key={img.id} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border/40 group">
                                        <img src={img.dataUrl} alt="" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(img.id)}
                                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Bottom toolbar */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center">
                            {/* Left tools */}
                            <div className="flex items-center gap-1">
                                {/* Model Selector */}
                                <ModelSelector 
                                    value={selectedModel} 
                                    onChange={setSelectedModel}
                                    compact
                                />
                                
                                {/* Divider */}
                                <div className="w-px h-4 bg-border/50 mx-1" />
                                
                                {/* Attach */}
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={attachedImages.length >= 5}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                    {attachedImages.length > 0 ? `${attachedImages.length}/5` : 'Reference'}
                                </button>

                            </div>

                            <div className="flex-1" />

                            {/* Generate button */}
                            <button
                                onClick={handleSubmit}
                                disabled={(!input.trim() && attachedImages.length === 0) || isGenerating}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-150 active:scale-[0.97]"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        {generatingStatus || 'Creating...'}
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
