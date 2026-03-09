'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
    ArrowLeft, ArrowUp, Zap, Sparkles, Globe, Smartphone,
    Paperclip, Map, Image, X, Check, FileText
} from 'lucide-react'

const suggestions = [
    { label: 'SaaS Landing Page', desc: 'Marketing site with pricing & features', type: 'web' as const },
    { label: 'Portfolio Website', desc: 'Showcase creative work & projects', type: 'web' as const },
    { label: 'E-commerce Store', desc: 'Product catalog with cart & checkout', type: 'web' as const },
    { label: 'Dashboard App', desc: 'Analytics & data visualization', type: 'app' as const },
    { label: 'Social Mobile App', desc: 'Feed, profiles, messaging', type: 'app' as const },
    { label: 'CRM Platform', desc: 'Manage leads, deals & contacts', type: 'app' as const },
]

export default function NewProjectDemoPage() {
    const [input, setInput] = useState('')
    const [productType, setProductType] = useState<'web' | 'app'>('web')
    const [sitemapOn, setSitemapOn] = useState(true)
    const [attachments, setAttachments] = useState<string[]>([])
    const [showAttachMenu, setShowAttachMenu] = useState(false)
    const [isGenerating, setIsGenerating] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        textareaRef.current?.focus()
    }, [])

    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${Math.min(el.scrollHeight, 200)}px`
    }, [input])

    const handleGenerate = () => {
        if (!input.trim()) return
        setIsGenerating(true)
        // Simulate redirect after 1.5s
        setTimeout(() => {
            window.location.href = '/demo/flow/workspace'
        }, 1500)
    }

    const addMockAttachment = (name: string) => {
        setAttachments(prev => [...prev, name])
        setShowAttachMenu(false)
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="flex items-center h-14 px-5 border-b border-border/40">
                <Link
                    href="/demo/flow"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                    Back to Flow
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
            <div className="flex-1 flex flex-col items-center justify-center px-5 pb-20">
                <div className="w-full max-w-2xl">
                    {/* Heading */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-linear-to-br from-accent to-accent/70 mb-5 shadow-lg shadow-accent/20">
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
                        <div className="inline-flex items-center bg-muted/60 rounded-xl p-1 border border-border/40">
                            <button
                                onClick={() => { setProductType('web'); setSitemapOn(true) }}
                                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${productType === 'web'
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Globe className="w-4 h-4" />
                                Website
                            </button>
                            <button
                                onClick={() => { setProductType('app'); setSitemapOn(false) }}
                                className={`inline-flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all ${productType === 'app'
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                            >
                                <Smartphone className="w-4 h-4" />
                                App
                            </button>
                        </div>
                    </div>

                    {/* Main Input */}
                    <div className="relative rounded-2xl border border-border bg-card shadow-sm focus-within:border-accent/40 focus-within:shadow-md focus-within:shadow-accent/5 transition-all">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate() } }}
                            placeholder={
                                productType === 'web'
                                    ? 'A SaaS platform for managing freelance projects with time tracking, invoicing, and client portal...'
                                    : 'A project management app with Kanban boards, team chat, file sharing, and analytics dashboard...'
                            }
                            rows={1}
                            className="w-full resize-none bg-transparent px-5 pt-4 pb-16 text-base placeholder:text-muted-foreground/40 focus:outline-none min-h-14 max-h-50"
                        />

                        {/* Attachments preview */}
                        {attachments.length > 0 && (
                            <div className="px-5 pb-2 flex flex-wrap gap-2">
                                {attachments.map((name, i) => (
                                    <div key={i} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 text-xs text-muted-foreground border border-border/40">
                                        <Image className="w-3 h-3" />
                                        {name}
                                        <button onClick={() => setAttachments(prev => prev.filter((_, j) => j !== i))} className="hover:text-foreground">
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
                                <div className="relative">
                                    <button
                                        onClick={() => setShowAttachMenu(!showAttachMenu)}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
                                    >
                                        <Paperclip className="w-3.5 h-3.5" />
                                        Attach
                                    </button>
                                    {showAttachMenu && (
                                        <div className="absolute bottom-full left-0 mb-2 w-48 bg-card border border-border rounded-xl shadow-lg p-1.5 z-10">
                                            <button onClick={() => addMockAttachment('screenshot.png')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                                <Image className="w-4 h-4" /> Reference Image
                                            </button>
                                            <button onClick={() => addMockAttachment('requirements.pdf')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors">
                                                <FileText className="w-4 h-4" /> Document
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="w-px h-5 bg-border/60 mx-1" />

                                {/* Sitemap toggle */}
                                <button
                                    onClick={() => setSitemapOn(!sitemapOn)}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${sitemapOn
                                            ? 'bg-accent/10 text-accent border border-accent/20'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                                        }`}
                                >
                                    <Map className="w-3.5 h-3.5" />
                                    Sitemap
                                    {sitemapOn && <Check className="w-3 h-3" />}
                                </button>


                            </div>

                            <div className="flex-1" />

                            {/* Generate button */}
                            <button
                                onClick={handleGenerate}
                                disabled={!input.trim() || isGenerating}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-[0.97]"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                                        Generating...
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

                    {/* Active options indicator */}
                    <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground/50">
                        <span>Type: <strong className="text-muted-foreground">{productType === 'web' ? 'Website' : 'Application'}</strong></span>
                        <span>·</span>
                        <span>Sitemap: <strong className={sitemapOn ? 'text-accent' : 'text-muted-foreground'}>{sitemapOn ? 'On' : 'Off'}</strong></span>
                        {attachments.length > 0 && (
                            <>
                                <span>·</span>
                                <span>{attachments.length} attachment{attachments.length > 1 ? 's' : ''}</span>
                            </>
                        )}
                    </div>

                    {/* Suggestion chips */}
                    <div className="mt-8">
                        <div className="flex flex-wrap justify-center gap-2">
                            {suggestions
                                .filter(s => s.type === productType)
                                .map((s) => (
                                    <button
                                        key={s.label}
                                        type="button"
                                        onClick={() => setInput(s.label.toLowerCase())}
                                        className="group inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/70 bg-card/50 text-sm text-muted-foreground hover:text-foreground hover:border-accent/40 hover:bg-accent/5 transition-all"
                                    >
                                        <span className="font-medium">{s.label}</span>
                                        <span className="text-muted-foreground/40 hidden sm:inline">·</span>
                                        <span className="text-xs text-muted-foreground/50 hidden sm:inline">{s.desc}</span>
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
