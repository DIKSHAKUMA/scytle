'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowUp, Loader2, Sparkles, ArrowLeft, Zap } from 'lucide-react'

import { useProjectStore } from '@/store'

const suggestions = [
    { label: 'SaaS landing page', desc: 'Marketing site with pricing & features' },
    { label: 'Portfolio website', desc: 'Showcase creative work & projects' },
    { label: 'E-commerce store', desc: 'Product catalog with cart & checkout' },
    { label: 'Dashboard app', desc: 'Analytics & data visualization' },
    { label: 'Blog platform', desc: 'Content-first publishing site' },
    { label: 'Restaurant website', desc: 'Menu, reservations & delivery' },
]

function deriveProjectName(description: string): string {
    // Take first ~5 meaningful words as project name
    const cleaned = description
        .replace(/^(i want to |i need |build me |create |make |design )/i, '')
        .replace(/^(a |an |the )/i, '')
    const words = cleaned.split(/\s+/).slice(0, 5).join(' ')
    return words.charAt(0).toUpperCase() + words.slice(1)
}

export default function NewProjectPage() {
    const router = useRouter()
    const { createProject, isLoading } = useProjectStore()
    const [input, setInput] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-focus the input on mount
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

    const handleSubmit = async () => {
        const trimmed = input.trim()
        if (!trimmed || isLoading) return

        const name = deriveProjectName(trimmed)
        const project = await createProject({
            name: name || 'Untitled Project',
            description: trimmed,
        })

        if (project) {
            router.push(`/project/${project.projectId}`)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleSuggestionClick = (label: string) => {
        setInput(label)
        textareaRef.current?.focus()
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Minimal header */}
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

            {/* Centered content */}
            <div className="flex-1 flex flex-col items-center justify-center px-5 pb-24">
                <div className="w-full max-w-2xl">
                    {/* Heading */}
                    <div className="text-center mb-10">
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

                    {/* Chat-style input */}
                    <div className="relative rounded-2xl border border-border bg-card shadow-sm focus-within:border-accent/40 focus-within:shadow-md focus-within:shadow-accent/5 transition-all">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="A SaaS platform for managing freelance projects with time tracking, invoicing, and client portal..."
                            rows={1}
                            className="w-full resize-none bg-transparent px-5 pt-4 pb-14 text-base placeholder:text-muted-foreground/50 focus:outline-none min-h-[56px] max-h-[200px]"
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <span className="text-xs text-muted-foreground/40 mr-1 select-none">
                                {input.trim() ? 'Enter ↵' : 'Shift+Enter for new line'}
                            </span>
                            <button
                                onClick={handleSubmit}
                                disabled={!input.trim() || isLoading}
                                className="w-9 h-9 rounded-xl bg-foreground text-background flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all active:scale-95"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Suggestion chips */}
                    <div className="mt-6">
                        <div className="flex flex-wrap justify-center gap-2">
                            {suggestions.map((s) => (
                                <button
                                    key={s.label}
                                    type="button"
                                    onClick={() => handleSuggestionClick(s.label)}
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
