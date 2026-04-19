'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Settings, CreditCard, Shield, HelpCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/layout/app-shell'
import { useAuthStore } from '@/store'

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const { user } = useAuthStore()

    const settingsNavigation = [
        { name: 'Profile', href: '/settings/profile', icon: User, protected: true },
    ].filter(item => !item.protected || !!user)

    return (
        <AppShell>
            <div className="container py-10 max-w-6xl">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Sidebar */}
                    <aside className="w-full md:w-64 shrink-0">
                        <div className="space-y-1">
                            <h2 className="text-lg font-display font-semibold px-3 mb-4">Settings</h2>
                            <nav className="space-y-1">
                                {settingsNavigation.map((item) => {
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                                                isActive 
                                                    ? "bg-foreground text-background shadow-md shadow-foreground/10" 
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                            )}
                                        >
                                            <item.icon className="w-4 h-4" />
                                            {item.name}
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                    </aside>

                    {/* Content Area */}
                    <main className="flex-1 min-h-screen relative overflow-hidden">
                        {/* Background Treatment */}
                        <div className="absolute inset-0 -z-10 pointer-events-none">
                            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
                            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent/3 rounded-full blur-[120px]" />
                        </div>

                        <div className="max-w-4xl px-8 py-10 mx-auto relative">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </AppShell>
    )
}
