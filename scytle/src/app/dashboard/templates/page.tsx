'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    ArrowLeft,
    Loader2,
    Briefcase,
    ShoppingBag,
    BookOpen,
    Camera,
    Utensils,
    BarChart3,
    Check,
    ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useProjectStore } from '@/store'

interface Template {
    id: string
    name: string
    description: string
    icon: LucideIcon
    color: string
    pages: string[]
    popular?: boolean
}

const templates: Template[] = [
    {
        id: 'saas',
        name: 'SaaS Landing Page',
        description: 'Perfect for software products with features, pricing, and testimonials',
        icon: BarChart3,
        color: 'from-violet-500/20 to-violet-500/5',
        pages: ['Home', 'Features', 'Pricing', 'About', 'Contact', 'Blog'],
        popular: true,
    },
    {
        id: 'portfolio',
        name: 'Portfolio Website',
        description: 'Showcase your work with a beautiful, minimal portfolio',
        icon: Camera,
        color: 'from-rose-500/20 to-rose-500/5',
        pages: ['Home', 'Projects', 'About', 'Contact'],
    },
    {
        id: 'ecommerce',
        name: 'E-commerce Store',
        description: 'Online store with product catalog, cart, and checkout',
        icon: ShoppingBag,
        color: 'from-emerald-500/20 to-emerald-500/5',
        pages: ['Home', 'Products', 'Product Detail', 'Cart', 'Checkout', 'Account'],
    },
    {
        id: 'agency',
        name: 'Agency Website',
        description: 'Professional site for design, marketing, or development agencies',
        icon: Briefcase,
        color: 'from-blue-500/20 to-blue-500/5',
        pages: ['Home', 'Services', 'Work', 'Team', 'Contact'],
    },
    {
        id: 'blog',
        name: 'Blog / Content Site',
        description: 'Clean blog layout for writers, journalists, or content creators',
        icon: BookOpen,
        color: 'from-amber-500/20 to-amber-500/5',
        pages: ['Home', 'Blog', 'Article', 'About', 'Contact'],
    },
    {
        id: 'restaurant',
        name: 'Restaurant Website',
        description: 'Menu, reservations, and contact for restaurants and cafes',
        icon: Utensils,
        color: 'from-orange-500/20 to-orange-500/5',
        pages: ['Home', 'Menu', 'Reservations', 'About', 'Contact'],
    },
]

export default function TemplatesPage() {
    const router = useRouter()
    const { createProject, isLoading } = useProjectStore()
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

    const handleUseTemplate = async (template: Template) => {
        setSelectedTemplate(template.id)

        const project = await createProject({
            name: `My ${template.name}`,
            description: `${template.description}. Pages: ${template.pages.join(', ')}`,
        })

        if (project) {
            router.push(`/project/${project.projectId}`)
        }

        setSelectedTemplate(null)
    }

    return (
        <AppShell>
            <div className="min-h-[calc(100vh-4rem)]">
                {/* Header */}
                <div className="border-b border-border/50 bg-secondary/30">
                    <div className="container py-10">
                        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Back to Dashboard
                        </Link>

                        <h1 className="text-3xl font-display font-bold tracking-tight mb-2">
                            Start with a template
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Choose a pre-built structure and customize it to your needs
                        </p>
                    </div>
                </div>

                {/* Templates Grid */}
                <div className="container py-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => (
                            <Card
                                key={template.id}
                                className={`relative cursor-pointer border-border/50 hover:border-accent/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group overflow-hidden ${selectedTemplate === template.id ? 'ring-2 ring-accent' : ''
                                    }`}
                                onClick={() => handleUseTemplate(template)}
                            >
                                {template.popular && (
                                    <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-accent text-white text-xs font-medium">
                                        Popular
                                    </div>
                                )}

                                <CardContent className="p-6">
                                    {/* Icon */}
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${template.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                        <template.icon className="w-7 h-7 text-foreground" />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-semibold mb-2">{template.name}</h3>
                                    <p className="text-muted-foreground text-sm mb-4">
                                        {template.description}
                                    </p>

                                    {/* Pages preview */}
                                    <div className="flex flex-wrap gap-1.5 mb-5">
                                        {template.pages.map((page, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-1 rounded-md bg-muted text-xs text-muted-foreground"
                                            >
                                                {page}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Button */}
                                    <Button
                                        className="w-full gap-2"
                                        variant="outline"
                                        disabled={isLoading && selectedTemplate === template.id}
                                    >
                                        {isLoading && selectedTemplate === template.id ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                Use this template
                                                <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Custom option */}
                    <div className="mt-10 text-center">
                        <p className="text-muted-foreground mb-4">
                            Don&apos;t see what you need?
                        </p>
                        <Link href="/dashboard/new">
                            <Button variant="outline" className="gap-2">
                                Start from scratch with AI
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
