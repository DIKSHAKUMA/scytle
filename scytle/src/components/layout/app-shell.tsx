'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useCallback, useEffect } from 'react'
import {
    Zap,
    LayoutDashboard,
    FolderOpen,
    Settings,
    LogOut,
    Plus,
    User,
    CreditCard,
    HelpCircle,
    Loader2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SupportWidget } from '@/components/layout/support-widget'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore, useProjectStore } from '@/store'
import { storage, BUCKETS } from '@/lib/appwrite'
import { UpgradeModal } from '@/components/billing/upgrade-modal'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderOpen },
]

interface AppShellProps {
    children: React.ReactNode
    hideNav?: boolean
}

export function AppShell({ children, hideNav = false }: AppShellProps) {
    const pathname = usePathname()
    const router = useRouter()
    const { user, logout, checkSession, isLoading: isAuthLoading } = useAuthStore()
    const { projects, createProject } = useProjectStore()
    const [isCreating, setIsCreating] = useState(false)

    // Verify session on mount
    useEffect(() => {
        if (!user) {
            checkSession()
        }
    }, [user, checkSession])

    const handleNewProject = useCallback(async () => {
        if (isCreating) return
        setIsCreating(true)
        try {
            const prefix = 'Untitled Project'
            const nums = projects
                .map(p => p.name.match(/^Untitled Project\s*(\d*)$/)?.[1])
                .filter(Boolean)
                .map(n => parseInt(n || '1', 10))
            const next = nums.length ? Math.max(...nums) + 1 : 1
            const project = await createProject({ name: `${prefix} ${next}` })
            if (project) {
                router.push(`/project/${project.projectId}`)
            }
        } finally {
            setIsCreating(false)
        }
    }, [createProject, projects, router, isCreating])

    const initials = user?.name
        ?.split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase() || 'U'

    const avatarId = user?.prefs?.avatarId as string | undefined
    let avatarUrl: string | undefined = undefined

    if (avatarId) {
        try {
            avatarUrl = storage.getFilePreview(BUCKETS.AVATARS, avatarId).toString()
        } catch (error) {
            console.error('Failed to get header avatar preview:', error)
        }
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
                <div className="container flex h-14 items-center">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2.5 mr-8 group">
                        <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Zap className="w-3.5 h-3.5 text-background" strokeWidth={2.5} />
                        </div>
                        <span className="font-display font-bold text-[17px] tracking-tight hidden sm:inline-block">
                            Scytle
                        </span>
                    </Link>

                    {/* Navigation */}
                    {!hideNav && (
                        <nav className="flex items-center gap-0.5">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className={cn(
                                            'inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150',
                                            isActive
                                                ? 'text-foreground bg-muted/80'
                                                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        <span className="hidden sm:inline">{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                        {user && (
                            <button
                                onClick={handleNewProject}
                                disabled={isCreating}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60"
                            >
                                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">New</span>
                            </button>
                        )}

                        {/* User Menu / Login Buttons */}
                        {isAuthLoading && !user ? (
                            <div className="flex items-center justify-center w-8 h-8">
                                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/60" />
                            </div>
                        ) : user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center rounded-full p-0.5 hover:bg-muted/60 transition-colors focus:outline-none focus:ring-2 focus:ring-ring/20">
                                        <Avatar className="w-7 h-7">
                                            <AvatarImage src={avatarUrl} className="object-cover" />
                                            <AvatarFallback className="text-[11px] font-semibold bg-gradient-to-br from-accent to-accent/80 text-white">
                                                {initials}
                                            </AvatarFallback>
                                        </Avatar>
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56" sideOffset={8}>
                                    <DropdownMenuLabel className="pb-2">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="w-8 h-8">
                                                <AvatarImage src={avatarUrl} className="object-cover" />
                                                <AvatarFallback className="text-xs font-semibold bg-gradient-to-br from-accent to-accent/80 text-white">
                                                    {initials}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col text-left">
                                                <span className="font-medium text-sm">{user?.name || 'User'}</span>
                                                <span className="text-xs text-muted-foreground font-normal truncate max-w-[150px]">
                                                    {user?.email}
                                                </span>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings/profile" className="cursor-pointer">
                                            <Settings className="w-4 h-4 mr-2" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings/billing" className="cursor-pointer">
                                            <CreditCard className="w-4 h-4 mr-2" />
                                            Billing
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => logout()}
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost" size="sm" className="h-8 px-3 rounded-md text-xs font-semibold">
                                        Log In
                                    </Button>
                                </Link>
                                <Link href="/signup">
                                    <Button size="sm" className="h-8 px-3 rounded-md text-xs font-semibold bg-foreground text-background hover:opacity-90 transition-opacity">
                                        Start for free
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Global Support Widget - Only visible outside of the project editor */}
            {!pathname.startsWith('/project') && <SupportWidget />}

            {/* Global Upgrade Modal */}
            <UpgradeModal />
        </div>
    )
}
