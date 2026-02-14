'use client'

import { cn } from '@/lib/utils'
import { Search, Bell, Menu, ChevronDown } from 'lucide-react'
import type { ViewportDevice } from '@/types'

/**
 * Topbar level determines which elements are shown:
 *
 * Level 3 — Full (topbar-only shells, no sidebar)
 *   Logo · Nav Links · Search · Bell · Avatar       (1440px)
 *
 * Level 2 — Above sidebar
 *   Logo · Search · Bell · Avatar                   (1440px, no nav links)
 *
 * Level 1 — Beside sidebar (narrower, sidebar owns logo)
 *   Page Title · Search · Bell · Avatar             (content-width)
 *
 * Figma ref: Topbar 1–4 (node 4174:122640)
 */

export interface AppTopbarProps {
    level?: 1 | 2 | 3
    showSearch?: boolean
    showNavLinks?: boolean
    /** Page title shown on level 1 topbars */
    pageTitle?: string
    viewport?: ViewportDevice
    className?: string
}

export function AppTopbar({
    level = 2,
    showSearch = true,
    showNavLinks = false,
    pageTitle = 'Dashboard',
    viewport = 'desktop',
    className,
}: AppTopbarProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div
            className={cn(
                'flex items-center h-14 px-4 border-b border-gray-200 bg-gray-950 shrink-0',
                className,
            )}
        >
            {/* Left side */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Mobile hamburger */}
                {isMobile && (
                    <div className="w-8 h-8 rounded flex items-center justify-center">
                        <Menu className="w-4 h-4 text-gray-400" />
                    </div>
                )}

                {/* Logo — Level 2 & 3 show logo; Level 1 shows page title */}
                {level >= 2 && !isMobile && (
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Logo placeholder — rounded square */}
                        <div className="w-6 h-6 bg-gray-700 rounded" />
                    </div>
                )}

                {level === 1 && !isMobile && (
                    <span className="text-sm font-medium text-gray-300 truncate">
                        {pageTitle}
                    </span>
                )}

                {/* Nav Links — Only Level 3, desktop only */}
                {level === 3 && (showNavLinks || level === 3) && !isMobile && (
                    <nav className="flex items-center gap-1 ml-4">
                        {['Link One', 'Link Two', 'Link Three'].map((link) => (
                            <span
                                key={link}
                                className="px-3 py-1.5 text-xs text-gray-400 rounded hover:text-gray-200 cursor-default"
                            >
                                {link}
                            </span>
                        ))}
                        <span className="flex items-center gap-0.5 px-3 py-1.5 text-xs text-gray-400 rounded hover:text-gray-200 cursor-default">
                            Link Four
                            <ChevronDown className="w-3 h-3" />
                        </span>
                    </nav>
                )}
            </div>

            {/* Right side — Search · Bell · Avatar */}
            <div className="flex items-center gap-2 shrink-0">
                {/* Search */}
                {showSearch && (
                    <div className="flex items-center">
                        {/* Expanded search bar on desktop, icon only on mobile */}
                        {!isMobile && level !== 1 ? (
                            <div className="flex items-center gap-2 h-8 pl-2.5 pr-8 bg-gray-800 rounded-md min-w-[160px]">
                                <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                                <span className="text-xs text-gray-500">Search...</span>
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded flex items-center justify-center">
                                <Search className="w-4 h-4 text-gray-400" />
                            </div>
                        )}
                    </div>
                )}

                {/* Notification bell */}
                <div className="w-8 h-8 rounded flex items-center justify-center">
                    <Bell className="w-4 h-4 text-gray-400" />
                </div>

                {/* Avatar */}
                <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-gray-500" />

                {/* Name — only on specific level 1 variants, desktop */}
                {level === 1 && !isMobile && viewport === 'desktop' && (
                    <span className="text-xs text-gray-400 ml-1 hidden lg:inline">Name Surname</span>
                )}
            </div>
        </div>
    )
}
