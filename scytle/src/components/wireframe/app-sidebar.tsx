'use client'

import { cn } from '@/lib/utils'
import {
    Search,
    Home,
    Bookmark,
    LayoutDashboard,
    TrendingUp,
    BarChart3,
    History,
    FolderOpen,
    FileText,
    HelpCircle,
    Settings,
    ChevronDown,
    MoreHorizontal,
} from 'lucide-react'
import type { ViewportDevice } from '@/types'

/**
 * Sidebar level determines which elements are shown:
 *
 * Level 3 — Standalone (no topbar handles identity)
 *   Logo · Search · Nav groups with icons/badges/sub-items · User profile
 *   Width: 240px expanded / 64px collapsed
 *
 * Level 2 — Below topbar (topbar has logo/search/avatar)
 *   Logo (optional) · Nav items with icons/groups · NO search/avatar
 *   Width: 240px expanded / 64px collapsed
 *
 * Level 1 — Simple nav only
 *   Nav items only (no logo, no search, no avatar)
 *   Width: 200px expanded / 64px collapsed
 *
 * Figma ref: Sidebar 1–9 (node 4174:121341)
 */

/* ─── Navigation Data ─── */

interface NavItem {
    icon: React.ComponentType<{ className?: string }>
    label: string
    active?: boolean
    badge?: number
    children?: { label: string; active?: boolean }[]
}

interface NavGroup {
    header?: string
    items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
    {
        items: [
            { icon: Home, label: 'Home', active: true },
            { icon: Bookmark, label: 'Saved', badge: 24 },
            { icon: LayoutDashboard, label: 'Dashboard' },
        ],
    },
    {
        items: [
            {
                icon: TrendingUp,
                label: 'Analytics',
                children: [
                    { label: 'Trends' },
                    { label: 'Analytics' },
                    { label: 'Historical' },
                ],
            },
            { icon: FolderOpen, label: 'Projects' },
            { icon: FileText, label: 'Documents' },
        ],
    },
]

const BOTTOM_NAV: NavItem[] = [
    { icon: HelpCircle, label: 'Support' },
    { icon: Settings, label: 'Settings' },
]

/* ─── Component ─── */

export interface AppSidebarProps {
    level?: 1 | 2 | 3
    collapsed?: boolean
    showGroups?: boolean
    showBadges?: boolean
    viewport?: ViewportDevice
    className?: string
}

export function AppSidebar({
    level = 2,
    collapsed = false,
    showGroups = true,
    showBadges = false,
    viewport = 'desktop',
    className,
}: AppSidebarProps) {
    const isCollapsed = collapsed || viewport === 'tablet'
    const isHidden = viewport === 'mobile'

    if (isHidden) return null

    const sidebarWidth = isCollapsed ? 'w-16' : level === 1 ? 'w-[200px]' : 'w-[240px]'

    return (
        <div
            className={cn(
                'flex flex-col h-full border-r border-gray-200 bg-gray-950 shrink-0 overflow-y-auto',
                sidebarWidth,
                className,
            )}
        >
            {/* Logo — Level 2 & 3 */}
            {level >= 2 && (
                <div className={cn('flex items-center h-14 px-4 shrink-0', isCollapsed && 'justify-center px-0')}>
                    {isCollapsed ? (
                        <div className="w-8 h-8 bg-gray-700 rounded" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-gray-700 rounded" />
                        </div>
                    )}
                </div>
            )}

            {/* Search — Level 3 only */}
            {level === 3 && (
                <div className={cn('px-3 mb-2 shrink-0', isCollapsed && 'px-2')}>
                    {isCollapsed ? (
                        <div className="flex items-center justify-center w-10 h-8 mx-auto rounded bg-gray-800">
                            <Search className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 h-8 px-2.5 bg-gray-800 rounded-md">
                            <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                            <span className="text-xs text-gray-500">Search...</span>
                        </div>
                    )}
                </div>
            )}

            {/* Nav Groups */}
            <nav className="flex-1 flex flex-col gap-0.5 px-2 py-1 overflow-y-auto">
                {(showGroups ? NAV_GROUPS : [{ items: NAV_GROUPS.flatMap((g) => g.items) }]).map(
                    (group, gi) => (
                        <div key={gi} className={cn(gi > 0 && 'mt-3')}>
                            {/* Group header — only when showGroups is true, expanded, and header exists */}
                            {group.header && !isCollapsed && showGroups && (
                                <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-gray-600 font-medium">
                                    {group.header}
                                </div>
                            )}

                            {group.items.map((item) => (
                                <NavItemRow
                                    key={item.label}
                                    item={item}
                                    collapsed={isCollapsed}
                                    showBadges={showBadges}
                                    level={level}
                                />
                            ))}

                            {/* Separator between groups */}
                            {gi < (showGroups ? NAV_GROUPS : []).length - 1 && (
                                <div className="mx-2 my-1 border-t border-gray-800" />
                            )}
                        </div>
                    ),
                )}
            </nav>

            {/* Separator before bottom nav */}
            <div className="mx-3 border-t border-gray-800 shrink-0" />

            {/* Bottom nav — Support/Settings */}
            <div className="px-2 py-1 shrink-0">
                {BOTTOM_NAV.map((item) => (
                    <NavItemRow key={item.label} item={item} collapsed={isCollapsed} showBadges={false} level={level} />
                ))}
            </div>

            {/* User profile — Level 3 only */}
            {level === 3 && (
                <div
                    className={cn(
                        'flex items-center gap-2 px-3 py-3 border-t border-gray-800 shrink-0',
                        isCollapsed && 'justify-center px-2',
                    )}
                >
                    <div className="w-8 h-8 bg-gray-600 rounded-full shrink-0" />
                    {!isCollapsed && (
                        <>
                            <div className="flex-1 min-w-0">
                                <div className="text-xs text-gray-300 truncate">Name Surname</div>
                                <div className="text-[10px] text-gray-500 truncate">email@example.com</div>
                            </div>
                            <MoreHorizontal className="w-4 h-4 text-gray-500 shrink-0" />
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

/* ─── NavItemRow ─── */

function NavItemRow({
    item,
    collapsed,
    showBadges,
    level,
}: {
    item: NavItem
    collapsed: boolean
    showBadges: boolean
    level: number
}) {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0

    if (collapsed) {
        return (
            <div
                className={cn(
                    'flex items-center justify-center w-10 h-9 mx-auto rounded cursor-default',
                    item.active ? 'bg-gray-800 text-white' : 'text-gray-500 hover:bg-gray-800/50 hover:text-gray-300',
                )}
            >
                <Icon className="w-4 h-4" />
            </div>
        )
    }

    return (
        <div>
            <div
                className={cn(
                    'flex items-center gap-2 h-8 px-2 rounded cursor-default text-xs',
                    item.active
                        ? 'bg-gray-800 text-white font-medium'
                        : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-300',
                )}
            >
                {/* Icon — Level 2 & 3 show icons; Level 1 text only */}
                {level >= 2 && <Icon className="w-4 h-4 shrink-0" />}
                <span className="flex-1 truncate">{item.label}</span>

                {/* Badge */}
                {showBadges && item.badge && (
                    <span className="text-[10px] text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full">
                        {item.badge}
                    </span>
                )}

                {/* Expand indicator */}
                {hasChildren && <ChevronDown className="w-3 h-3 text-gray-600" />}
            </div>

            {/* Sub-items — show when parent is active or always visible in wireframe */}
            {hasChildren && (
                <div className={cn('ml-4 pl-2 border-l border-gray-800', level < 2 && 'ml-2')}>
                    {item.children!.map((child) => (
                        <div
                            key={child.label}
                            className={cn(
                                'flex items-center h-7 px-2 rounded text-xs cursor-default',
                                child.active
                                    ? 'text-white font-medium'
                                    : 'text-gray-500 hover:text-gray-300',
                            )}
                        >
                            {child.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
