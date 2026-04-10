'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Plus,
    FolderOpen,
    Clock,
    MoreHorizontal,
    Trash2,
    Edit,
    Copy,
    Loader2,
    Sparkles,
    Search,
    ArrowRight,
    FileText,
    LayoutTemplate,
    Import,
    Command,
} from 'lucide-react'

import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useProjectStore, useAuthStore } from '@/store'
import type { Project } from '@/types'
import { formatRelativeTime } from '@/lib/utils'

/** Generate a default project name like "Untitled Project 4" */
function nextProjectName(projects: Project[]): string {
    const prefix = 'Untitled Project'
    const nums = projects
        .map(p => p.name.match(/^Untitled Project\s*(\d*)$/)?.[1])
        .filter(Boolean)
        .map(n => parseInt(n || '1', 10))
    const next = nums.length ? Math.max(...nums) + 1 : 1
    return `${prefix} ${next}`
}

type StatusFilter = 'all' | 'draft' | 'in-progress' | 'completed'

const STATUS_CONFIG = {
    draft: {
        label: 'Draft',
        dot: 'bg-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
        text: 'text-amber-700 dark:text-amber-400',
    },
    'in-progress': {
        label: 'In Progress',
        dot: 'bg-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
        text: 'text-blue-700 dark:text-blue-400',
    },
    completed: {
        label: 'Completed',
        dot: 'bg-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
        text: 'text-emerald-700 dark:text-emerald-400',
    },
} as const

// Gradient patterns for project card thumbnails
const CARD_GRADIENTS = [
    'from-rose-100 via-pink-50 to-orange-50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-orange-950/20',
    'from-violet-100 via-purple-50 to-indigo-50 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-indigo-950/20',
    'from-sky-100 via-cyan-50 to-teal-50 dark:from-sky-950/40 dark:via-cyan-950/20 dark:to-teal-950/20',
    'from-amber-100 via-yellow-50 to-lime-50 dark:from-amber-950/40 dark:via-yellow-950/20 dark:to-lime-950/20',
    'from-emerald-100 via-green-50 to-cyan-50 dark:from-emerald-950/40 dark:via-green-950/20 dark:to-cyan-950/20',
    'from-fuchsia-100 via-pink-50 to-rose-50 dark:from-fuchsia-950/40 dark:via-pink-950/20 dark:to-rose-950/20',
]

function getGreeting(): string {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
}

function getGradient(index: number): string {
    return CARD_GRADIENTS[index % CARD_GRADIENTS.length]
}

export default function DashboardPage() {
    const router = useRouter()
    const { user, setUser } = useAuthStore()
    const { projects, isLoading, fetchProjects, deleteProject, createProject } = useProjectStore()

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [authChecked, setAuthChecked] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // Create a blank project and navigate straight to the canvas
    const handleNewProject = useCallback(async () => {
        if (isCreating) return
        setIsCreating(true)
        try {
            const project = await createProject({ name: nextProjectName(projects) })
            if (project) {
                router.push(`/project/${project.projectId}`)
            }
        } finally {
            setIsCreating(false)
        }
    }, [createProject, projects, router, isCreating])

    // Check authentication on mount
    useEffect(() => {
        let cancelled = false
        useProjectStore.setState({ isLoading: false })

        const verifyAuth = async () => {
            try {
                const { getUser } = await import('@/lib/appwrite')
                const currentUser = await getUser()
                if (cancelled) return
                if (currentUser) {
                    setIsAuthenticated(true)
                    setUser(currentUser)
                    fetchProjects()
                    setAuthChecked(true)
                } else {
                    setAuthChecked(true)
                    window.location.href = '/login?redirect=/dashboard'
                }
            } catch {
                if (cancelled) return
                setAuthChecked(true)
                window.location.href = '/login?redirect=/dashboard'
            }
        }
        verifyAuth()
        return () => { cancelled = true }
    }, [setUser, fetchProjects])

    // Staggered mount animation
    useEffect(() => {
        if (authChecked && isAuthenticated) {
            const t = setTimeout(() => setMounted(true), 50)
            return () => clearTimeout(t)
        }
    }, [authChecked, isAuthenticated])

    // Keyboard shortcut for search
    const searchInputRef = useCallback((node: HTMLInputElement | null) => {
        if (!node) return
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                node.focus()
            }
        }
        document.addEventListener('keydown', handler)
        return () => document.removeEventListener('keydown', handler)
    }, [])

    // Filter and search projects
    const filteredProjects = useMemo(() => {
        return projects.filter((project: Project) => {
            const matchesSearch = searchQuery === '' ||
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (project.description?.toLowerCase().includes(searchQuery.toLowerCase()))
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter
            return matchesSearch && matchesStatus
        })
    }, [projects, searchQuery, statusFilter])

    // Stats
    const stats = useMemo(() => ({
        total: projects.length,
        draft: projects.filter((p: Project) => p.status === 'draft').length,
        inProgress: projects.filter((p: Project) => p.status === 'in-progress').length,
        completed: projects.filter((p: Project) => p.status === 'completed').length,
    }), [projects])

    const filterTabs: { key: StatusFilter; label: string; count: number }[] = [
        { key: 'all', label: 'All', count: stats.total },
        { key: 'draft', label: 'Drafts', count: stats.draft },
        { key: 'in-progress', label: 'In Progress', count: stats.inProgress },
        { key: 'completed', label: 'Completed', count: stats.completed },
    ]

    if (!authChecked || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <AppShell>
            <div className="min-h-[calc(100vh-3.5rem)]">
                {/* Hero Header */}
                <div className="border-b bg-gradient-to-b from-muted/40 to-background">
                    <div className="container pt-10 pb-8">
                        <div
                            className="transition-all duration-700 ease-out"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                            }}
                        >
                            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight text-foreground">
                                {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
                            </h1>
                            <p className="text-muted-foreground mt-1.5 text-[15px]">
                                Pick up where you left off, or start something new.
                            </p>
                        </div>

                        {/* Quick Actions — compact pill-style row */}
                        <div
                            className="flex flex-wrap gap-2.5 mt-6 transition-all duration-700 ease-out delay-100"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                            }}
                        >
                            <button
                                onClick={handleNewProject}
                                disabled={isCreating}
                                className="group inline-flex items-center gap-2.5 rounded-full bg-foreground text-background px-5 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                            >
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                New Project
                            </button>
                            <button
                                onClick={handleNewProject}
                                disabled={isCreating}
                                className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:border-foreground/20 hover:shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                            >
                                <Sparkles className="w-3.5 h-3.5 text-accent" />
                                AI Generate
                            </button>
                            <Link href="/dashboard/templates">
                                <button className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground/80 hover:text-foreground hover:border-foreground/20 hover:shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]">
                                    <LayoutTemplate className="w-3.5 h-3.5" />
                                    Templates
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container py-8">
                    {/* Toolbar: Filter Tabs + Search */}
                    <div
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 transition-all duration-700 ease-out delay-200"
                        style={{
                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'translateY(0)' : 'translateY(8px)',
                        }}
                    >
                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60">
                            {filterTabs.map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setStatusFilter(tab.key)}
                                    className={`
                                        relative px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200
                                        ${statusFilter === tab.key
                                            ? 'bg-card text-foreground shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }
                                    `}
                                >
                                    {tab.label}
                                    {tab.count > 0 && (
                                        <span className={`ml-1.5 text-xs tabular-nums ${
                                            statusFilter === tab.key
                                                ? 'text-foreground/60'
                                                : 'text-muted-foreground/60'
                                        }`}>
                                            {tab.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-9 rounded-lg border border-border bg-card pl-9 pr-14 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring/40 transition-all"
                            />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground/60">
                                <Command className="w-2.5 h-2.5" />K
                            </kbd>
                        </div>
                    </div>

                    {/* Content */}
                    {isLoading ? (
                        <div className="flex items-center justify-center py-24">
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">Loading projects...</span>
                            </div>
                        </div>
                    ) : projects.length === 0 ? (
                        /* Empty State */
                        <div
                            className="flex flex-col items-center justify-center py-24 transition-all duration-700 ease-out delay-300"
                            style={{
                                opacity: mounted ? 1 : 0,
                                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                            }}
                        >
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                    <FileText className="w-10 h-10 text-muted-foreground/40" strokeWidth={1.5} />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center">
                                    <Plus className="w-4 h-4 text-accent" />
                                </div>
                            </div>
                            <h3 className="text-lg font-display font-semibold mb-1.5">
                                Create your first project
                            </h3>
                            <p className="text-muted-foreground text-sm text-center max-w-xs mb-6 leading-relaxed">
                                Describe your idea and let AI generate a complete sitemap, wireframes, and design for you.
                            </p>
                            <button
                                onClick={handleNewProject}
                                disabled={isCreating}
                                className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
                            >
                                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                New Project
                                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                            </button>
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        /* No Search Results */
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-16 h-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
                                <Search className="w-7 h-7 text-muted-foreground/40" />
                            </div>
                            <h3 className="text-base font-semibold mb-1">No results</h3>
                            <p className="text-muted-foreground text-sm mb-4">
                                No projects match &ldquo;{searchQuery || statusFilter}&rdquo;
                            </p>
                            <button
                                onClick={() => { setSearchQuery(''); setStatusFilter('all') }}
                                className="text-sm text-accent font-medium hover:underline"
                            >
                                Clear filters
                            </button>
                        </div>
                    ) : (
                        /* Project Grid */
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {filteredProjects.map((project: Project, i: number) => {
                                const status = STATUS_CONFIG[project.status]
                                return (
                                    <Link
                                        key={project.projectId}
                                        href={`/project/${project.projectId}`}
                                        className="group block"
                                    >
                                        <div
                                            className="relative h-full rounded-xl border border-border/60 bg-card overflow-hidden transition-all duration-300 hover:border-border hover:shadow-lg hover:shadow-black/[0.03] dark:hover:shadow-black/20"
                                            style={{
                                                opacity: mounted ? 1 : 0,
                                                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                                                transitionDelay: `${300 + i * 60}ms`,
                                                transitionDuration: '500ms',
                                                transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                                            }}
                                        >
                                            {/* Gradient Preview Area */}
                                            <div className={`h-28 bg-gradient-to-br ${getGradient(i)} relative overflow-hidden`}>
                                                {/* Decorative grid pattern */}
                                                <div className="absolute inset-0 opacity-[0.15]" style={{
                                                    backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(to right, var(--border) 1px, transparent 1px)`,
                                                    backgroundSize: '24px 24px',
                                                }} />
                                                {/* Project icon */}
                                                <div className="absolute bottom-3 left-4">
                                                    <div className="w-10 h-10 rounded-lg bg-card/90 backdrop-blur-sm shadow-sm flex items-center justify-center border border-white/20 dark:border-white/10">
                                                        <span className="text-base font-display font-bold text-foreground/80">
                                                            {project.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                                {/* Actions */}
                                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                            <button className="w-7 h-7 rounded-md bg-card/90 backdrop-blur-sm shadow-sm flex items-center justify-center border border-white/20 dark:border-white/10 hover:bg-card transition-colors">
                                                                <MoreHorizontal className="w-3.5 h-3.5 text-foreground/70" />
                                                            </button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-44">
                                                            <DropdownMenuItem className="text-sm">
                                                                <Edit className="w-3.5 h-3.5 mr-2" />
                                                                Rename
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-sm">
                                                                <Copy className="w-3.5 h-3.5 mr-2" />
                                                                Duplicate
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={(e) => {
                                                                    e.preventDefault()
                                                                    deleteProject(project.projectId)
                                                                }}
                                                                className="text-destructive focus:text-destructive text-sm"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                                Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-4">
                                                <h3 className="font-semibold text-[15px] text-foreground line-clamp-1 group-hover:text-accent transition-colors duration-200">
                                                    {project.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground/70 line-clamp-1 mt-0.5">
                                                    {project.description || 'No description'}
                                                </p>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between mt-3.5 pt-3.5 border-t border-border/40">
                                                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                                                        {status.label}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground/50">
                                                        <Clock className="w-3 h-3" />
                                                        {formatRelativeTime(project.updatedAt)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}

                            {/* New Project Card */}
                            <button onClick={handleNewProject} disabled={isCreating} className="group block text-left w-full">
                                <div
                                    className="h-full min-h-[232px] rounded-xl border border-dashed border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:border-accent/40 hover:bg-accent/[0.03]"
                                    style={{
                                        opacity: mounted ? 1 : 0,
                                        transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                                        transitionDelay: `${300 + filteredProjects.length * 60}ms`,
                                        transitionDuration: '500ms',
                                    }}
                                >
                                    <div className="w-10 h-10 rounded-xl bg-muted/60 flex items-center justify-center group-hover:bg-accent/10 group-hover:scale-110 transition-all duration-300">
                                        {isCreating ? <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" /> : <Plus className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />}
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                        New Project
                                    </span>
                                </div>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    )
}
