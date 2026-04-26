'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/layout/app-shell'
import { useAuthStore } from '@/store'

const settingsTabs = [
    { name: 'Profile', href: '/settings/profile' },
    { name: 'Billing', href: '/settings/billing' },
]

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, checkSession } = useAuthStore()
    const [authChecked, setAuthChecked] = useState(!!user)

    useEffect(() => {
        if (user) {
            setAuthChecked(true)
            return
        }
        let cancelled = false
        const verifyAuth = async () => {
            await checkSession()
            if (!cancelled) setAuthChecked(true)
        }
        verifyAuth()
        return () => { cancelled = true }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!authChecked) return
        if (user) return
        const redirectPath = pathname || '/settings'
        router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`)
    }, [authChecked, user, router, pathname])

    useEffect(() => {
        if (pathname === '/settings') {
            router.replace('/settings/profile')
        }
        // Redirect old support route to profile
        if (pathname === '/settings/support') {
            router.replace('/settings/profile')
        }
    }, [pathname, router])

    if (!authChecked || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <AppShell>
            <div className="min-h-screen">
                <div className="px-8 lg:px-10 pt-8 pb-0">
                    <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
                        Settings
                    </h1>

                    <nav className="flex items-center gap-0.5 mt-4">
                        {settingsTabs.map((tab) => {
                            const isActive = pathname === tab.href
                            return (
                                <Link
                                    key={tab.name}
                                    href={tab.href}
                                    className={cn(
                                        'px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors duration-75',
                                        isActive
                                            ? 'bg-foreground/[0.07] text-foreground'
                                            : 'text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    {tab.name}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                <div className="px-8 lg:px-10 py-8">
                    <div className="max-w-xl">
                        {children}
                    </div>
                </div>
            </div>
        </AppShell>
    )
}
