'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import {
    Plus,
    FolderOpen,
    Clock,
    MoreVertical,
    Trash2,
    Edit,
    Copy,
    Loader2,
    Sparkles,
    Search,
    Filter,
    LayoutGrid,
    List,
} from 'lucide-react'

import { AppShell } from '@/components/app-shell'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useProjectStore, useAuthStore } from '@/store'
import { formatRelativeTime } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type StatusFilter = 'all' | 'draft' | 'in-progress' | 'completed'
type ViewMode = 'grid' | 'list'

export default function DashboardPage() {
    const router = useRouter()
    const { user, setUser } = useAuthStore()
    const { projects, isLoading, fetchProjects, deleteProject } = useProjectStore()

    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [authChecked, setAuthChecked] = useState(false)
    const [isAuthenticated, setIsAuthenticated] = useState(false)

    // Check authentication on mount using direct Appwrite call
    useEffect(() => {
        let cancelled = false

        // Reset loading state on mount (prevents stuck spinner after HMR)
        useProjectStore.setState({ isLoading: false })

        const verifyAuth = async () => {
            try {
                const { getUser } = await import('@/lib/appwrite')
                const currentUser = await getUser()
                if (cancelled) return
                console.log('📊 Dashboard auth check:', currentUser?.email || 'no user')
                if (currentUser) {
                    setIsAuthenticated(true)
                    setUser(currentUser)
                    fetchProjects()
                    setAuthChecked(true)
                } else {
                    console.log('📊 No user found, redirecting to login')
                    setAuthChecked(true)
                    window.location.href = '/login?redirect=/dashboard'
                }
            } catch (error) {
                if (cancelled) return
                console.log('📊 Auth check failed:', error)
                setAuthChecked(true)
                window.location.href = '/login?redirect=/dashboard'
            }
        }
        verifyAuth()

        return () => {
            cancelled = true
        }
    }, [setUser, fetchProjects])

    // Filter and search projects
    const filteredProjects = useMemo(() => {
        return projects.filter(project => {
            // Search filter
            const matchesSearch = searchQuery === '' ||
                project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (project.description?.toLowerCase().includes(searchQuery.toLowerCase()))

            // Status filter
            const matchesStatus = statusFilter === 'all' || project.status === statusFilter

            return matchesSearch && matchesStatus
        })
    }, [projects, searchQuery, statusFilter])

    const statusColors = {
        draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500',
        'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-500',
        completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-500',
    }

    // Show loading while checking authentication
    if (!authChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    // Don't render dashboard if not authenticated (redirect is happening)
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <AppShell>
            <div className="container py-10">
                {/* Header */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight">
                            Welcome back, {user?.name?.split(' ')[0] || 'there'}
                        </h1>
                        <p className="text-muted-foreground mt-2">
                            Here&apos;s an overview of your projects
                        </p>
                    </div>
                    <Link href="/dashboard/new">
                        <Button className="gap-2 shadow-lg shadow-primary/20 font-medium">
                            <Plus className="w-4 h-4" />
                            New Project
                        </Button>
                    </Link>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <Link href="/dashboard/new">
                        <Card className="cursor-pointer border-border/50 hover:border-accent/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group hover:-translate-y-1">
                            <CardContent className="flex items-center gap-5 p-6">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent/20 to-accent/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Sparkles className="w-7 h-7 text-accent" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Start from scratch</h3>
                                    <p className="text-sm text-muted-foreground">Describe your idea to AI</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/templates">
                        <Card className="cursor-pointer border-border/50 hover:border-accent/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group hover:-translate-y-1">
                            <CardContent className="flex items-center gap-5 p-6">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <FolderOpen className="w-7 h-7 text-blue-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Use a template</h3>
                                    <p className="text-sm text-muted-foreground">Start with pre-built layouts</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link href="/dashboard/import">
                        <Card className="cursor-pointer border-border/50 hover:border-accent/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group hover:-translate-y-1">
                            <CardContent className="flex items-center gap-5 p-6">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Copy className="w-7 h-7 text-emerald-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Import existing</h3>
                                    <p className="text-sm text-muted-foreground">From Figma or sitemap</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Projects Section */}
                <div>
                    {/* Section Header with Search & Filter */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-xl font-display font-semibold">
                            Recent Projects
                            {filteredProjects.length > 0 && (
                                <span className="text-muted-foreground font-normal ml-2">
                                    ({filteredProjects.length})
                                </span>
                            )}
                        </h2>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Search */}
                            <div className="relative flex-1 sm:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search projects..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-background"
                                />
                            </div>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                                <SelectTrigger className="w-[140px] bg-background">
                                    <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="in-progress">In Progress</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* View Toggle */}
                            <div className="hidden sm:flex items-center border rounded-lg p-1 bg-muted/50">
                                <Button
                                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <LayoutGrid className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : projects.length === 0 ? (
                        <Card className="border-border/50 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-20">
                                <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
                                    <FolderOpen className="w-10 h-10 text-muted-foreground" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
                                <p className="text-muted-foreground text-center mb-6 max-w-sm">
                                    Get started by creating your first project. Describe your idea and let AI help you build it.
                                </p>
                                <Link href="/dashboard/new">
                                    <Button className="gap-2 shadow-lg shadow-primary/20">
                                        <Plus className="w-4 h-4" />
                                        Create Project
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : filteredProjects.length === 0 ? (
                        <Card className="border-border/50 border-dashed">
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <Search className="w-12 h-12 text-muted-foreground mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No matches found</h3>
                                <p className="text-muted-foreground text-center mb-4">
                                    Try adjusting your search or filter
                                </p>
                                <Button variant="outline" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                                    Clear filters
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProjects.map((project) => (
                                <Link key={project.projectId} href={`/project/${project.projectId}`}>
                                    <Card className="cursor-pointer border-border/50 hover:border-accent/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 h-full hover:-translate-y-1">
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1.5">
                                                    <CardTitle className="text-lg line-clamp-1">
                                                        {project.name}
                                                    </CardTitle>
                                                    <CardDescription className="line-clamp-2">
                                                        {project.description || 'No description'}
                                                    </CardDescription>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                                            <MoreVertical className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem>
                                                            <Edit className="w-4 h-4 mr-2" />
                                                            Rename
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem>
                                                            <Copy className="w-4 h-4 mr-2" />
                                                            Duplicate
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            onClick={(e) => {
                                                                e.preventDefault()
                                                                deleteProject(project.projectId)
                                                            }}
                                                            className="text-destructive focus:text-destructive"
                                                        >
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-0">
                                            <div className="flex items-center justify-between">
                                                <Badge
                                                    variant="secondary"
                                                    className={statusColors[project.status]}
                                                >
                                                    {project.status}
                                                </Badge>
                                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock className="w-3 h-3" />
                                                    {formatRelativeTime(project.updatedAt)}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppShell>
    )
}
