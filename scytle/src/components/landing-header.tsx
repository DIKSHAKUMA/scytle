'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Zap, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/store'

export function LandingHeader() {
    const { user, isAuthenticated, isLoading, checkSession, logout } = useAuthStore()

    useEffect(() => {
        checkSession()
    }, [checkSession])

    const handleLogout = async () => {
        await logout()
    }

    const getInitials = (name: string | undefined) => {
        if (!name) return 'U'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
            <div className="container flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center shadow-lg shadow-accent/20">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-display font-bold text-xl tracking-tight">Scytle</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Features
                    </Link>
                    <Link href="#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        How it works
                    </Link>
                    <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Pricing
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : isAuthenticated && user ? (
                        <>
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="font-medium">
                                    Dashboard
                                </Button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-full">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback className="bg-accent text-white text-sm font-medium">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center justify-start gap-2 p-2">
                                        <div className="flex flex-col space-y-1 leading-none">
                                            <p className="font-medium">{user.name}</p>
                                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/dashboard">Dashboard</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/settings">Settings</Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm" className="font-medium">Log in</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="font-medium bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                                    Get Started
                                </Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    )
}
