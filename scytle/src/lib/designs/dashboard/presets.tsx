'use client'

/**
 * Dashboard presets — frozen snapshots of Stat Cards + Page Header families.
 *
 * Stat 1–4: 3-column variants
 * Stat 5–8: 4-column variants
 * Header 1: standard with search
 * Header 2: standard without search
 * Header 3: minimal
 * Header 4: profile
 */

import type { DesignPreset } from '../types'

/* ── Thumbnail helpers ─────────────────────────────────────── */

function StatCardThumb3() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
                <div className="h-1 w-4 bg-gray-300 rounded-sm" />
            </div>
            <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2].map((k) => (
                    <div key={k} className="border border-gray-200 rounded p-1.5">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded mb-1" />
                        <div className="h-1 w-6 bg-gray-300 rounded-sm mb-0.5" />
                        <div className="h-2 w-5 bg-gray-800 rounded-sm" />
                        <div className="mt-0.5 h-1 w-4 bg-emerald-200 rounded-sm" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatCardThumb4() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
                <div className="h-1 w-4 bg-gray-300 rounded-sm" />
            </div>
            <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((k) => (
                    <div key={k} className="border border-gray-200 rounded p-1">
                        <div className="w-2 h-2 bg-gray-100 rounded mb-0.5" />
                        <div className="h-1 w-5 bg-gray-300 rounded-sm mb-0.5" />
                        <div className="h-1.5 w-4 bg-gray-800 rounded-sm" />
                        <div className="mt-0.5 h-1 w-3 bg-red-200 rounded-sm" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function StatCardThumbCTA() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
                <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
                <div className="h-1 w-4 bg-gray-300 rounded-sm" />
            </div>
            <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2].map((k) => (
                    <div key={k} className="border border-gray-200 rounded p-1.5">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded mb-1" />
                        <div className="h-1 w-6 bg-gray-300 rounded-sm mb-0.5" />
                        <div className="h-2 w-5 bg-gray-800 rounded-sm" />
                        <div className="mt-1 pt-1 border-t border-gray-100">
                            <div className="h-1 w-7 bg-gray-400 rounded-sm" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

function HeaderStandardThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1.5">
            <div className="h-1 w-6 bg-gray-300 rounded-sm" />
            <div className="h-2 w-14 bg-gray-800 rounded-sm" />
            <div className="h-1 w-20 bg-gray-300 rounded-sm" />
            <div className="h-2 w-full bg-gray-50 border border-gray-200 rounded" />
        </div>
    )
}

function HeaderMinimalThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1 w-6 bg-gray-300 rounded-sm" />
            <div className="flex justify-between items-center">
                <div className="h-2 w-14 bg-gray-800 rounded-sm" />
                <div className="h-2 w-6 bg-gray-800 rounded" />
            </div>
        </div>
    )
}

function HeaderProfileThumb() {
    return (
        <div className="w-full h-full bg-white rounded overflow-hidden flex flex-col">
            <div className="h-6 bg-gray-200" />
            <div className="px-2 pb-1.5 -mt-2 flex items-end gap-1.5">
                <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-white shrink-0" />
                <div className="flex-1 pt-3">
                    <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
                    <div className="h-1 w-10 bg-gray-300 rounded-sm mt-0.5" />
                </div>
            </div>
        </div>
    )
}

/* ── Presets ────────────────────────────────────────────────── */

export const dashboardPresets: DesignPreset[] = [
    /* Stat Cards 3-col */
    {
        id: 'stat-cards-1',
        familyId: 'stat-cards',
        name: 'Stat Cards 1',
        description: '3-column stat cards with icon + trend',
        controls: { columns: '3', showIcon: true, showTrend: true, showCTA: false, showMenu: true },
        Thumbnail: StatCardThumb3,
    },
    {
        id: 'stat-cards-2',
        familyId: 'stat-cards',
        name: 'Stat Cards 2',
        description: '3-column stat cards, no icon',
        controls: { columns: '3', showIcon: false, showTrend: true, showCTA: false, showMenu: true },
        Thumbnail: StatCardThumb3,
    },
    {
        id: 'stat-cards-3',
        familyId: 'stat-cards',
        name: 'Stat Cards 3',
        description: '3-column stat cards with CTA link',
        controls: { columns: '3', showIcon: true, showTrend: true, showCTA: true, showMenu: true },
        Thumbnail: StatCardThumbCTA,
    },
    {
        id: 'stat-cards-4',
        familyId: 'stat-cards',
        name: 'Stat Cards 4',
        description: '3-column minimal, no menu',
        controls: { columns: '3', showIcon: true, showTrend: true, showCTA: false, showMenu: false },
        Thumbnail: StatCardThumb3,
    },
    /* Stat Cards 4-col */
    {
        id: 'stat-cards-5',
        familyId: 'stat-cards',
        name: 'Stat Cards 5',
        description: '4-column stat cards',
        controls: { columns: '4', showIcon: true, showTrend: true, showCTA: false, showMenu: true },
        Thumbnail: StatCardThumb4,
    },
    {
        id: 'stat-cards-6',
        familyId: 'stat-cards',
        name: 'Stat Cards 6',
        description: '4-column, no icon',
        controls: { columns: '4', showIcon: false, showTrend: true, showCTA: false, showMenu: true },
        Thumbnail: StatCardThumb4,
    },
    {
        id: 'stat-cards-7',
        familyId: 'stat-cards',
        name: 'Stat Cards 7',
        description: '4-column with CTA link',
        controls: { columns: '4', showIcon: true, showTrend: true, showCTA: true, showMenu: true },
        Thumbnail: StatCardThumb4,
    },
    {
        id: 'stat-cards-8',
        familyId: 'stat-cards',
        name: 'Stat Cards 8',
        description: '4-column minimal',
        controls: { columns: '4', showIcon: true, showTrend: false, showCTA: false, showMenu: false },
        Thumbnail: StatCardThumb4,
    },
    /* Page Headers */
    {
        id: 'page-header-1',
        familyId: 'page-header',
        name: 'Page Header 1',
        description: 'Standard with breadcrumb, description and search',
        controls: { style: 'standard', showBreadcrumb: true, showSearch: true, showDescription: true },
        Thumbnail: HeaderStandardThumb,
    },
    {
        id: 'page-header-2',
        familyId: 'page-header',
        name: 'Page Header 2',
        description: 'Standard without search',
        controls: { style: 'standard', showBreadcrumb: true, showSearch: false, showDescription: true },
        Thumbnail: HeaderStandardThumb,
    },
    {
        id: 'page-header-3',
        familyId: 'page-header',
        name: 'Page Header 3',
        description: 'Minimal header with breadcrumb',
        controls: { style: 'minimal', showBreadcrumb: true, showSearch: false, showDescription: false },
        Thumbnail: HeaderMinimalThumb,
    },
    {
        id: 'page-header-4',
        familyId: 'page-header',
        name: 'Page Header 4',
        description: 'Profile header with cover image and avatar',
        controls: { style: 'profile', showBreadcrumb: true, showSearch: false, showDescription: false },
        Thumbnail: HeaderProfileThumb,
    },
]
