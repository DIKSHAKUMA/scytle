'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    Zap,
    LayoutDashboard,
    FolderOpen,
    Settings,
    LogOut,
    ChevronDown,
    Plus,
    User,
    CreditCard,
    HelpCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store'

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
    const { user, logout } = useAuthStore()

    const initials = user?.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase() || 'U'

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    {/* Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2 mr-6">
                        <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
                            <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-display font-semibold text-lg hidden sm:inline-block">
                            Scytle
                        </span>
                    </Link>

                    {/* Navigation */}
                    {!hideNav && (
                        <nav className="flex items-center gap-1">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                                return (
                                    <Link key={item.name} href={item.href}>
                                        <Button
                                            variant={isActive ? 'secondary' : 'ghost'}
                                            size="sm"
                                            className={cn(
                                                'gap-2',
                                                isActive && 'bg-secondary'
                                            )}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            <span className="hidden sm:inline">{item.name}</span>
                                        </Button>
                                    </Link>
                                )
                            })}
                        </nav>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Link href="/dashboard/new">
                            <Button size="sm" className="gap-2">
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">New Project</span>
                            </Button>
                        </Link>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2 px-2">
                                    <Avatar className="w-6 h-6">
                                        <AvatarImage src={undefined} />
                                        <AvatarFallback className="text-xs bg-accent text-white">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{user?.name || 'User'}</span>
                                        <span className="text-xs text-muted-foreground font-normal">
                                            {user?.email}
                                        </span>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/profile" className="cursor-pointer">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings/billing" className="cursor-pointer">
                                        <CreditCard className="w-4 h-4 mr-2" />
                                        Billing
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/settings" className="cursor-pointer">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <Link href="/help" className="cursor-pointer">
                                        <HelpCircle className="w-4 h-4 mr-2" />
                                        Help & Support
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
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
