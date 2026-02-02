'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Loader2,
    Sparkles,
    ArrowRight,
    Lightbulb,
    Zap,
    Search,
    Layout,
    Code,
} from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useProjectStore } from '@/store'

const suggestions = [
    'A dog walking marketplace like Rover',
    'A portfolio website for a photographer',
    'An online learning platform for developers',
    'A restaurant ordering system with delivery tracking',
    'A habit tracking app with gamification',
    'A SaaS dashboard for analytics',
]

const steps = [
    { icon: Sparkles, title: 'Think', desc: 'AI clarifies your idea' },
    { icon: Search, title: 'Research', desc: 'Analyze competitors' },
    { icon: Layout, title: 'Design', desc: 'Create sitemap & UI' },
    { icon: Code, title: 'Build', desc: 'Generate code' },
]

export default function NewProjectPage() {
    const router = useRouter()
    const { createProject, isLoading } = useProjectStore()

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const project = await createProject({
            name: name || 'Untitled Project',
            description: description || undefined,
        })

        if (project) {
            router.push(`/project/${project.projectId}`)
        }
    }

    const handleSuggestionClick = (suggestion: string) => {
        setDescription(suggestion)
        if (!name) {
            // Extract a name from the suggestion
            const words = suggestion.split(' ').slice(1, 4).join(' ')
            setName(words.charAt(0).toUpperCase() + words.slice(1))
        }
    }

    return (
        <AppShell>
            <div className="min-h-[calc(100vh-4rem)] flex flex-col">
                {/* Hero Section */}
                <div className="relative bg-gradient-to-b from-secondary via-secondary/50 to-background border-b border-border/50">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />
                    <div className="container max-w-3xl py-12 relative">
                        {/* Back Button */}
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>

                        {/* Header */}
                        <div className="flex items-start gap-6 mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shadow-accent/25 shrink-0">
                                <Zap className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
                                    Create a new project
                                </h1>
                                <p className="text-muted-foreground text-lg">
                                    Describe your idea and let AI help you build it from scratch
                                </p>
                            </div>
                        </div>

                        {/* Steps Preview */}
                        <div className="grid grid-cols-4 gap-4">
                            {steps.map((step, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/80 backdrop-blur-sm border border-border/50">
                                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                                        <step.icon className="w-5 h-5 text-accent" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-medium text-sm">{step.title}</div>
                                        <div className="text-xs text-muted-foreground truncate">{step.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="container max-w-3xl py-10 flex-1">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">
                                    Project name
                                </label>
                                <Input
                                    id="name"
                                    placeholder="My Awesome Project"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 text-base bg-background"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label htmlFor="description" className="text-sm font-medium">
                                    Describe your idea
                                </label>
                                <Textarea
                                    id="description"
                                    placeholder="I want to build a platform that helps dog owners find local dog walkers..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    className="text-base resize-none bg-background"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Be as detailed as you want. Our AI will ask clarifying questions if needed.
                                </p>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                Need inspiration? Try one of these:
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="px-4 py-2 rounded-full border border-border/80 bg-secondary/50 hover:bg-accent/10 hover:border-accent/50 text-sm transition-all hover:scale-105"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full h-14 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating project...
                                    </>
                                ) : (
                                    <>
                                        Start building with AI
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </AppShell>
    )
}
