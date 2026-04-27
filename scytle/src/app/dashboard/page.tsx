'use client'

import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
    Plus,
    MoreHorizontal,
    Trash2,
    Edit,
    Copy,
    Loader2,
    Search,
    FileText,
    LayoutGrid,
    List,
    Archive,
    LinkIcon,
    Check,
    X,
} from 'lucide-react'

import { AppShell } from '@/components/layout/app-shell'
import { useProjectStore, useAuthStore } from '@/store'
import type { Project } from '@/types'
import { formatRelativeTime } from '@/lib/utils'
import { getThumbnailUrl } from '@/lib/thumbnail'

function nextProjectName(projects: Project[]): string {
    const prefix = 'Untitled Project'
    const nums = projects
        .map(p => p.name.match(/^Untitled Project\s*(\d*)$/)?.[1])
        .filter(Boolean)
        .map(n => parseInt(n || '1', 10))
    const next = nums.length ? Math.max(...nums) + 1 : 1
    return `${prefix} ${next}`
}

type FileTab = 'all' | 'recents' | 'archived'
type ViewMode = 'grid' | 'list'

/** Thumbnail component — tries to load the stored thumbnail image */
function ProjectThumbnail({ projectId }: { projectId: string }) {
    const [loaded, setLoaded] = useState(false)
    const [error, setError] = useState(false)

    // Cache-bust: generate a unique timestamp per mount so the browser
    // always fetches the latest thumbnail when arriving at the dashboard.
    const [cacheBuster] = useState(() => Date.now())
    const baseUrl = getThumbnailUrl(projectId)
    const url = baseUrl
        ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}_t=${cacheBuster}`
        : undefined

    if (error || !url) return null

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={url}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-200 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
            loading="lazy"
        />
    )
}

export default function FilesPage() {
    const router = useRouter()
    const { user, checkSession } = useAuthStore()
    const { projects, isLoading, fetchProjects, deleteProject, createProject, updateProject } = useProjectStore()

    const [activeTab, setActiveTab] = useState<FileTab>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [searchQuery, setSearchQuery] = useState('')
    const [authChecked, setAuthChecked] = useState(!!user)
    const [isCreating, setIsCreating] = useState(false)

    // Context menu
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; project: Project } | null>(null)

    // Inline rename
    const [renamingId, setRenamingId] = useState<string | null>(null)
    const [renameValue, setRenameValue] = useState('')
    const renameInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (!contextMenu) return
        const close = () => setContextMenu(null)
        document.addEventListener('click', close)
        document.addEventListener('scroll', close, true)
        return () => {
            document.removeEventListener('click', close)
            document.removeEventListener('scroll', close, true)
        }
    }, [contextMenu])

    // Focus rename input when it appears
    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus()
            renameInputRef.current.select()
        }
    }, [renamingId])

    const handleNewProject = useCallback(async () => {
        if (isCreating) return
        setIsCreating(true)
        try {
            const project = await createProject({ name: nextProjectName(projects) })
            if (project) router.push(`/project/${project.projectId}`)
        } finally {
            setIsCreating(false)
        }
    }, [createProject, projects, router, isCreating])

    // Auth — instant if user already exists in store
    useEffect(() => {
        if (user) {
            setAuthChecked(true)
            fetchProjects()
            return
        }
        let cancelled = false
        const resolve = async () => {
            await checkSession()
            if (!cancelled) {
                setAuthChecked(true)
                // Fetch projects now that we have a session
                fetchProjects()
            }
        }
        resolve()
        return () => { cancelled = true }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // Redirect if no user after auth check
    useEffect(() => {
        if (authChecked && !user) {
            router.replace('/login?redirect=/dashboard')
        }
    }, [authChecked, user, router])

    const filteredProjects = useMemo(() => {
        const now = Date.now()
        const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
        let filtered = projects

        switch (activeTab) {
            case 'recents':
                filtered = filtered.filter(
                    p => p.status !== 'completed' && (now - new Date(p.updatedAt).getTime()) < thirtyDaysMs
                )
                break
            case 'archived':
                filtered = filtered.filter(p => p.status === 'completed')
                break
            default:
                filtered = filtered.filter(p => p.status !== 'completed')
                break
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            filtered = filtered.filter(
                p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
            )
        }

        return [...filtered].sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
    }, [projects, activeTab, searchQuery])

    // Context actions
    const handleContextAction = useCallback((action: string, project: Project) => {
        setContextMenu(null)
        switch (action) {
            case 'rename':
                setRenamingId(project.projectId)
                setRenameValue(project.name)
                break
            case 'duplicate':
                createProject({ name: `${project.name} (copy)`, description: project.description })
                break
            case 'copy-link':
                navigator.clipboard.writeText(`${window.location.origin}/project/${project.projectId}`)
                break
            case 'archive':
                updateProject(project.projectId, { status: 'completed' })
                break
            case 'unarchive':
                updateProject(project.projectId, { status: 'draft' })
                break
            case 'delete':
                deleteProject(project.projectId)
                break
        }
    }, [createProject, updateProject, deleteProject])

    const commitRename = useCallback(() => {
        if (renamingId && renameValue.trim()) {
            updateProject(renamingId, { name: renameValue.trim() })
        }
        setRenamingId(null)
        setRenameValue('')
    }, [renamingId, renameValue, updateProject])

    const cancelRename = useCallback(() => {
        setRenamingId(null)
        setRenameValue('')
    }, [])

    const openContextMenu = useCallback((e: React.MouseEvent, project: Project) => {
        e.preventDefault()
        e.stopPropagation()
        setContextMenu({ x: e.clientX, y: e.clientY, project })
    }, [])

    if (!authChecked || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const tabs: { key: FileTab; label: string }[] = [
        { key: 'all', label: 'All' },
        { key: 'recents', label: 'Recents' },
        { key: 'archived', label: 'Archived' },
    ]

    return (
        <AppShell>
            <div className="min-h-screen">
                {/* Header */}
                <div className="px-8 lg:px-10 pt-8 pb-5">
                    <div className="flex items-center justify-between">
                        <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
                            Files
                        </h1>
                        <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center gap-0.5">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.key}
                                        onClick={() => setActiveTab(tab.key)}
                                        className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-75 ${
                                            activeTab === tab.key
                                                ? 'bg-foreground/[0.07] text-foreground'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center border border-border/40 rounded-md overflow-hidden">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-foreground/[0.07] text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                                >
                                    <LayoutGrid className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-foreground/[0.07] text-foreground' : 'text-muted-foreground/50 hover:text-muted-foreground'}`}
                                >
                                    <List className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="relative hidden sm:block">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40" />
                                <input
                                    type="text"
                                    placeholder="Search files"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-48 h-8 rounded-md border border-border/40 bg-transparent pl-8 pr-3 text-[13px] placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-ring/30 transition-all"
                                />
                            </div>
                            <button
                                onClick={handleNewProject}
                                disabled={isCreating}
                                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                            >
                                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                New file
                            </button>
                        </div>
                    </div>
                    <div className="flex sm:hidden items-center gap-0.5 mt-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-75 ${activeTab === tab.key ? 'bg-foreground/[0.07] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="px-8 lg:px-10 pb-10">
                    {isLoading && projects.length === 0 ? (
                        <div className="flex items-center justify-center py-32">
                            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                <FileText className="w-6 h-6 text-muted-foreground/30" strokeWidth={1.5} />
                            </div>
                            <p className="text-[14px] font-medium text-foreground mb-1">
                                {searchQuery ? 'No results' : activeTab === 'archived' ? 'No archived files' : 'No files yet'}
                            </p>
                            <p className="text-[13px] text-muted-foreground mb-5">
                                {searchQuery ? `Nothing matches "${searchQuery}"` : activeTab === 'archived' ? 'Completed projects will appear here.' : 'Create your first file to get started.'}
                            </p>
                            {!searchQuery && activeTab !== 'archived' && (
                                <button onClick={handleNewProject} disabled={isCreating} className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-foreground text-background text-[13px] font-medium hover:opacity-90 disabled:opacity-60">
                                    {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                    New file
                                </button>
                            )}
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
                            {filteredProjects.map((project) => (
                                <div key={project.projectId} onContextMenu={(e) => openContextMenu(e, project)}>
                                    <Link
                                        href={`/project/${project.projectId}`}
                                        className="group block"
                                        onClick={(e) => { if (renamingId === project.projectId) e.preventDefault() }}
                                    >
                                        <div className="relative rounded-lg border border-border/40 bg-card overflow-hidden transition-all duration-150 hover:border-border/70 hover:shadow-sm">
                                            {/* Thumbnail — clean neutral canvas, ready for real thumbnails */}
                                            <div className="relative aspect-[4/3] bg-[#f8f8f8] dark:bg-[#1a1a1a] overflow-hidden border-b border-border/30">
                                                {/* Thumbnail image — rendered if available */}
                                                <ProjectThumbnail projectId={project.projectId} />
                                                {/* 3-dot trigger */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-75 z-10">
                                                    <button
                                                        onClick={(e) => openContextMenu(e, project)}
                                                        className="w-6 h-6 rounded bg-white/80 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-white dark:hover:bg-black/70 transition-colors"
                                                    >
                                                        <MoreHorizontal className="w-3.5 h-3.5 text-foreground/50" />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="px-3 py-2.5">
                                                {renamingId === project.projectId ? (
                                                    <div className="flex items-center gap-1" onClick={(e) => e.preventDefault()}>
                                                        <input
                                                            ref={renameInputRef}
                                                            type="text"
                                                            value={renameValue}
                                                            onChange={(e) => setRenameValue(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') commitRename()
                                                                if (e.key === 'Escape') cancelRename()
                                                            }}
                                                            onBlur={commitRename}
                                                            className="flex-1 text-[13px] font-medium bg-transparent border-b border-foreground/20 focus:border-foreground/50 outline-none py-0.5 text-foreground"
                                                        />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-[13px] font-medium text-foreground truncate">
                                                            {project.name}
                                                        </p>
                                                        <p className="text-[11px] text-muted-foreground/50 mt-0.5">
                                                            Edited {formatRelativeTime(project.updatedAt)}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div>
                            {filteredProjects.map((project) => (
                                <div key={project.projectId} onContextMenu={(e) => openContextMenu(e, project)}>
                                    <Link
                                        href={`/project/${project.projectId}`}
                                        className="group block"
                                        onClick={(e) => { if (renamingId === project.projectId) e.preventDefault() }}
                                    >
                                        <div className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/30 transition-colors duration-75">
                                            <div className="flex-1 min-w-0">
                                                {renamingId === project.projectId ? (
                                                    <input
                                                        ref={renameInputRef}
                                                        type="text"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') commitRename()
                                                            if (e.key === 'Escape') cancelRename()
                                                        }}
                                                        onBlur={commitRename}
                                                        onClick={(e) => e.preventDefault()}
                                                        className="w-full text-[13px] font-medium bg-transparent border-b border-foreground/20 focus:border-foreground/50 outline-none py-0.5 text-foreground"
                                                    />
                                                ) : (
                                                    <p className="text-[13px] font-medium text-foreground truncate group-hover:text-accent transition-colors">
                                                        {project.name}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-[12px] text-muted-foreground/50 shrink-0">
                                                Edited {formatRelativeTime(project.updatedAt)}
                                            </span>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                <button onClick={(e) => openContextMenu(e, project)} className="w-7 h-7 rounded-md hover:bg-muted/60 flex items-center justify-center">
                                                    <MoreHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                                                </button>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed z-50 min-w-[180px] rounded-lg border border-border/60 bg-popover shadow-lg py-1 animate-in fade-in scale-in duration-100"
                    style={{
                        left: Math.min(contextMenu.x, (typeof window !== 'undefined' ? window.innerWidth : 1000) - 200),
                        top: Math.min(contextMenu.y, (typeof window !== 'undefined' ? window.innerHeight : 800) - 260),
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => handleContextAction('rename', contextMenu.project)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/50 transition-colors">
                        <Edit className="w-3.5 h-3.5 text-muted-foreground" /> Rename
                    </button>
                    <button onClick={() => handleContextAction('duplicate', contextMenu.project)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/50 transition-colors">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" /> Duplicate
                    </button>
                    <button onClick={() => handleContextAction('copy-link', contextMenu.project)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/50 transition-colors">
                        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" /> Copy link
                    </button>
                    <div className="h-px bg-border/40 my-1" />
                    {contextMenu.project.status === 'completed' ? (
                        <button onClick={() => handleContextAction('unarchive', contextMenu.project)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/50 transition-colors">
                            <Archive className="w-3.5 h-3.5 text-muted-foreground" /> Unarchive
                        </button>
                    ) : (
                        <button onClick={() => handleContextAction('archive', contextMenu.project)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted/50 transition-colors">
                            <Archive className="w-3.5 h-3.5 text-muted-foreground" /> Archive
                        </button>
                    )}
                    <div className="h-px bg-border/40 my-1" />
                    <button onClick={() => handleContextAction('delete', contextMenu.project)} className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-destructive hover:bg-muted/50 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                </div>
            )}
        </AppShell>
    )
}
