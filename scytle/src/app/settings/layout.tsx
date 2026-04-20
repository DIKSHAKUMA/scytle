'use client'

import React, { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { useAuthStore } from '@/store'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { user, checkSession } = useAuthStore()
    const [authChecked, setAuthChecked] = useState(false)

    useEffect(() => {
        let cancelled = false

        const verifyAuth = async () => {
            if (!user) {
                await checkSession()
            }

            if (!cancelled) {
                setAuthChecked(true)
            }
        }

        verifyAuth()

        return () => {
            cancelled = true
        }
    }, [checkSession, user])

    useEffect(() => {
        if (!authChecked) return
        if (user) return

        const redirectPath = pathname || '/settings'
        router.replace(`/login?redirect=${encodeURIComponent(redirectPath)}`)
    }, [authChecked, user, router, pathname])

    if (!authChecked || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <AppShell>
            <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden">
                <div className="pointer-events-none absolute inset-0 -z-10">
                    <div className="absolute -top-24 left-[20%] h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
                    <div className="absolute bottom-0 right-[8%] h-80 w-80 rounded-full bg-accent/10 blur-[120px]" />
                </div>

                <div className="container py-8 md:py-10">
                    <main className="mx-auto w-full max-w-6xl">
                        {children}
                    </main>
                </div>
            </div>
        </AppShell>
    )
}
