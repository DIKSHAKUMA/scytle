'use client'

/**
 * App List presets — frozen snapshots of Stacked List + Grid List families.
 *
 * Maps to Figma Stacked Lists 1–10 (node 4174:133785) and Grid Lists 1–10 (node 4174:135105)
 */

import type { DesignPreset } from '../types'

/* ── Thumbnail helpers ─────────────────────────────────────── */

function UserListThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-1.5 flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
                <div className="h-1.5 w-5 bg-gray-800 rounded" />
            </div>
            <div className="border border-gray-200 rounded flex-1 flex flex-col">
                <div className="px-1 py-1 border-b border-gray-200">
                    <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                </div>
                {[0, 1, 2, 3].map((r) => (
                    <div key={r} className="flex items-center gap-1 px-1 py-1 border-b border-gray-50 last:border-b-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-0.5">
                            <div className="h-1 w-7 bg-gray-800 rounded-sm" />
                            <div className="h-0.5 w-10 bg-gray-200 rounded-sm" />
                        </div>
                        <div className="h-1 w-5 bg-gray-200 rounded-sm" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProgressListThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-1.5 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="border border-gray-200 rounded flex-1 flex flex-col">
                {[85, 60, 40, 25].map((p, i) => (
                    <div key={i} className="flex items-center gap-1 px-1 py-1.5 border-b border-gray-50 last:border-b-0">
                        <div className="h-1 w-6 bg-gray-800 rounded-sm shrink-0" />
                        <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gray-800 rounded-full" style={{ width: `${p}%` }} />
                        </div>
                        <div className="h-1 w-3 bg-gray-300 rounded-sm shrink-0" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function PeopleGridThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-1.5 flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
                <div className="h-1.5 w-5 bg-gray-800 rounded" />
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {[0, 1, 2, 3, 4, 5].map((k) => (
                    <div key={k} className="border border-gray-200 rounded p-1 flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-200 mb-0.5" />
                        <div className="h-1 w-5 bg-gray-800 rounded-sm" />
                        <div className="h-0.5 w-4 bg-gray-300 rounded-sm mt-0.5" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function ProjectGridThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-1.5 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="grid grid-cols-3 gap-1 flex-1">
                {[0, 1, 2, 3, 4, 5].map((k) => (
                    <div key={k} className="border border-gray-200 rounded p-1">
                        <div className="flex items-center gap-0.5 mb-0.5">
                            <div className="w-2 h-2 bg-gray-100 rounded" />
                            <div className="h-1 w-5 bg-gray-800 rounded-sm" />
                        </div>
                        <div className="flex gap-0.5 mb-0.5">
                            <div className="h-0.5 w-4 bg-gray-300 rounded-sm" />
                            <div className="h-1 w-3 bg-gray-100 rounded-full" />
                        </div>
                        <div className="h-0.5 w-full bg-gray-200 rounded-sm" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ── Presets ────────────────────────────────────────────────── */

export const appListPresets: DesignPreset[] = [
    /* Stacked List — User variants */
    {
        id: 'list-stacked-1',
        familyId: 'list-stacked',
        name: 'User List 1',
        description: 'User list with search, avatar, email, title',
        controls: { style: 'user', showSearch: true, showFilter: false, showAvatar: true, showMenu: true },
        Thumbnail: UserListThumb,
    },
    {
        id: 'list-stacked-2',
        familyId: 'list-stacked',
        name: 'User List 2',
        description: 'User list with search + filter dropdown',
        controls: { style: 'user', showSearch: true, showFilter: true, showAvatar: true, showMenu: true },
        Thumbnail: UserListThumb,
    },
    {
        id: 'list-stacked-3',
        familyId: 'list-stacked',
        name: 'User List 3',
        description: 'Compact user list, no search, no menu',
        controls: { style: 'user', showSearch: false, showFilter: false, showAvatar: true, showMenu: false },
        Thumbnail: UserListThumb,
    },
    {
        id: 'list-stacked-4',
        familyId: 'list-stacked',
        name: 'User List 4',
        description: 'User list without avatar',
        controls: { style: 'user', showSearch: true, showFilter: false, showAvatar: false, showMenu: true },
        Thumbnail: UserListThumb,
    },
    {
        id: 'list-stacked-5',
        familyId: 'list-stacked',
        name: 'User List 5',
        description: 'User list with all features enabled',
        controls: { style: 'user', showSearch: true, showFilter: true, showAvatar: true, showMenu: true },
        Thumbnail: UserListThumb,
    },
    /* Stacked List — Progress variants */
    {
        id: 'list-stacked-6',
        familyId: 'list-stacked',
        name: 'Progress List 1',
        description: 'Progress bars with percentage',
        controls: { style: 'progress', showSearch: false, showFilter: false, showAvatar: false, showMenu: true },
        Thumbnail: ProgressListThumb,
    },
    {
        id: 'list-stacked-7',
        familyId: 'list-stacked',
        name: 'Progress List 2',
        description: 'Progress with search',
        controls: { style: 'progress', showSearch: true, showFilter: false, showAvatar: false, showMenu: true },
        Thumbnail: ProgressListThumb,
    },
    {
        id: 'list-stacked-8',
        familyId: 'list-stacked',
        name: 'Progress List 3',
        description: 'Minimal progress list',
        controls: { style: 'progress', showSearch: false, showFilter: false, showAvatar: false, showMenu: false },
        Thumbnail: ProgressListThumb,
    },
    {
        id: 'list-stacked-9',
        familyId: 'list-stacked',
        name: 'Progress List 4',
        description: 'Progress with search + filter',
        controls: { style: 'progress', showSearch: true, showFilter: true, showAvatar: false, showMenu: true },
        Thumbnail: ProgressListThumb,
    },
    {
        id: 'list-stacked-10',
        familyId: 'list-stacked',
        name: 'Progress List 5',
        description: 'Progress list, all features',
        controls: { style: 'progress', showSearch: true, showFilter: true, showAvatar: false, showMenu: true },
        Thumbnail: ProgressListThumb,
    },
    /* Grid List — People variants */
    {
        id: 'list-grid-1',
        familyId: 'list-grid',
        name: 'People Grid 1',
        description: '3-col people cards with centered avatar',
        controls: { style: 'people', columns: '3', showDescription: true, showTag: true },
        Thumbnail: PeopleGridThumb,
    },
    {
        id: 'list-grid-2',
        familyId: 'list-grid',
        name: 'People Grid 2',
        description: '4-col people cards',
        controls: { style: 'people', columns: '4', showDescription: true, showTag: true },
        Thumbnail: PeopleGridThumb,
    },
    {
        id: 'list-grid-3',
        familyId: 'list-grid',
        name: 'People Grid 3',
        description: '2-col people cards, no description',
        controls: { style: 'people', columns: '2', showDescription: false, showTag: true },
        Thumbnail: PeopleGridThumb,
    },
    {
        id: 'list-grid-4',
        familyId: 'list-grid',
        name: 'People Grid 4',
        description: '3-col people, no description',
        controls: { style: 'people', columns: '3', showDescription: false, showTag: true },
        Thumbnail: PeopleGridThumb,
    },
    {
        id: 'list-grid-5',
        familyId: 'list-grid',
        name: 'People Grid 5',
        description: '3-col people, full details',
        controls: { style: 'people', columns: '3', showDescription: true, showTag: true },
        Thumbnail: PeopleGridThumb,
    },
    /* Grid List — Project variants */
    {
        id: 'list-grid-6',
        familyId: 'list-grid',
        name: 'Project Grid 1',
        description: '3-col project cards with icon + tag',
        controls: { style: 'project', columns: '3', showDescription: true, showTag: true },
        Thumbnail: ProjectGridThumb,
    },
    {
        id: 'list-grid-7',
        familyId: 'list-grid',
        name: 'Project Grid 2',
        description: '4-col project cards with icon + tag',
        controls: { style: 'project', columns: '4', showDescription: true, showTag: true },
        Thumbnail: ProjectGridThumb,
    },
    {
        id: 'list-grid-8',
        familyId: 'list-grid',
        name: 'Project Grid 3',
        description: '2-col project cards, no tag',
        controls: { style: 'project', columns: '2', showDescription: true, showTag: false },
        Thumbnail: ProjectGridThumb,
    },
    {
        id: 'list-grid-9',
        familyId: 'list-grid',
        name: 'Project Grid 4',
        description: '3-col project, no description',
        controls: { style: 'project', columns: '3', showDescription: false, showTag: true },
        Thumbnail: ProjectGridThumb,
    },
    {
        id: 'list-grid-10',
        familyId: 'list-grid',
        name: 'Project Grid 5',
        description: '3-col project, all features',
        controls: { style: 'project', columns: '3', showDescription: true, showTag: true },
        Thumbnail: ProjectGridThumb,
    },
]
