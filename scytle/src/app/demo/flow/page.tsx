'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Zap, Sparkles, Layout, Paintbrush, Code, MousePointer } from 'lucide-react'

const steps = [
    {
        number: '01',
        title: 'Create Project',
        desc: 'Enhanced new project page with product type toggle, wireframe mode, attachments, and smart prompts.',
        href: '/demo/flow/new-project',
        icon: Sparkles,
        color: 'from-violet-500 to-purple-600',
    },
    {
        number: '02',
        title: 'Canvas Workspace',
        desc: 'Full workspace with chat, theme, pages, layers tabs. Sitemap on canvas, AI-generated designs, properties panel.',
        href: '/demo/flow/workspace',
        icon: Layout,
        color: 'from-blue-500 to-cyan-500',
    },
]

export default function FlowDemoPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header */}
            <header className="flex items-center h-14 px-6 border-b border-border/40">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    ← Dashboard
                </Link>
                <div className="flex-1" />
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center overflow-hidden">
                        <Image src="/Icon.svg" alt="Scytle" width={24} height={24} />
                    </div>
                    <span className="font-display font-bold text-sm tracking-tight">Scytle</span>
                    <span className="ml-2 text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Demo Flow</span>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
                <div className="w-full max-w-3xl">
                    {/* Title */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-accent to-accent/70 mb-6 shadow-lg shadow-accent/20">
                            <MousePointer className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-display font-bold tracking-tight mb-3">
                            New Architecture Flow
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            Visual prototype of the canvas-first AI design workflow.
                            Click through each step to see the experience.
                        </p>
                    </div>

                    {/* Steps */}
                    <div className="space-y-4">
                        {steps.map((step) => (
                            <Link
                                key={step.number}
                                href={step.href}
                                className="group flex items-center gap-6 p-6 rounded-2xl border border-border/60 bg-card hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5 transition-all"
                            >
                                <div className={`shrink-0 w-14 h-14 rounded-2xl bg-linear-to-br ${step.color} flex items-center justify-center shadow-lg`}>
                                    <step.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-xs font-mono text-muted-foreground/60">STEP {step.number}</span>
                                    </div>
                                    <h2 className="text-xl font-display font-semibold tracking-tight mb-1">{step.title}</h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-1 transition-all shrink-0" />
                            </Link>
                        ))}
                    </div>

                    {/* Legend */}
                    <div className="mt-12 p-5 rounded-xl bg-muted/50 border border-border/40">
                        <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-3">How to use</p>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                These are <strong className="text-foreground">visual mockups only</strong> — no real AI, no real data
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                Click tabs, select nodes, and interact to see the layout and flow
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                                Use these to validate the UX before implementing the real system
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
