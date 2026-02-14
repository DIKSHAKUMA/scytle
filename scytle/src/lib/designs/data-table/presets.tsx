'use client'

/**
 * Data Table presets — frozen snapshots of Standard, Filtered, Expandable table families.
 *
 * Maps to Figma Tables 1–10 (node 2322:52)
 */

import type { DesignPreset } from '../types'

/* ── Thumbnail helpers ─────────────────────────────────────── */

function TableBasicThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-1.5 flex flex-col gap-1">
            <div className="flex justify-between items-center">
                <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
                <div className="h-1.5 w-5 bg-gray-800 rounded" />
            </div>
            <div className="border border-gray-200 rounded flex-1 flex flex-col">
                <div className="flex gap-1 px-1 py-0.5 bg-gray-50 border-b border-gray-200">
                    {[6, 8, 5, 6].map((w, i) => (
                        <div key={i} className="h-1 bg-gray-300 rounded-sm" style={{ width: `${w * 3}px` }} />
                    ))}
                </div>
                {[0, 1, 2].map((r) => (
                    <div key={r} className="flex gap-1 px-1 py-1 border-b border-gray-50 last:border-b-0">
                        {[6, 8, 5, 6].map((w, i) => (
                            <div key={i} className="h-1 bg-gray-200 rounded-sm" style={{ width: `${w * 3}px` }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

function TableAvatarThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-1.5 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="border border-gray-200 rounded flex-1 flex flex-col">
                <div className="flex gap-1 px-1 py-0.5 bg-gray-50 border-b border-gray-200">
                    {[8, 6, 5, 5].map((w, i) => (
                        <div key={i} className="h-1 bg-gray-300 rounded-sm" style={{ width: `${w * 3}px` }} />
                    ))}
                </div>
                {[0, 1, 2].map((r) => (
                    <div key={r} className="flex gap-1 px-1 py-1 border-b border-gray-50 last:border-b-0 items-center">
                        <div className="w-2 h-2 rounded-full bg-gray-200 shrink-0" />
                        {[6, 5, 5].map((w, i) => (
                            <div key={i} className="h-1 bg-gray-200 rounded-sm" style={{ width: `${w * 3}px` }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

function TableFilteredThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-1.5 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="border border-gray-200 rounded flex-1 flex flex-col">
                <div className="px-1 py-1 border-b border-gray-200 space-y-0.5">
                    <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                    <div className="flex gap-0.5">
                        <div className="h-1.5 w-4 bg-gray-800 rounded-full" />
                        <div className="h-1.5 w-5 bg-gray-100 rounded-full" />
                        <div className="h-1.5 w-5 bg-gray-100 rounded-full" />
                    </div>
                </div>
                {[0, 1, 2].map((r) => (
                    <div key={r} className="flex gap-1 px-1 py-1 border-b border-gray-50 last:border-b-0">
                        {[6, 8, 5, 5].map((w, i) => (
                            <div key={i} className="h-1 bg-gray-200 rounded-sm" style={{ width: `${w * 3}px` }} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    )
}

function TableExpandableThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-1.5 flex flex-col gap-1">
            <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
            <div className="border border-gray-200 rounded flex-1 flex flex-col">
                <div className="flex gap-1 px-1 py-0.5 bg-gray-50 border-b border-gray-200">
                    <div className="w-1.5 h-1" />
                    {[6, 6, 5].map((w, i) => (
                        <div key={i} className="h-1 bg-gray-300 rounded-sm" style={{ width: `${w * 3}px` }} />
                    ))}
                </div>
                {/* Expanded row */}
                <div className="flex gap-1 px-1 py-1 border-b border-gray-200 items-center">
                    <div className="w-1.5 text-[5px] text-gray-400">▼</div>
                    {[6, 6, 5].map((w, i) => (
                        <div key={i} className="h-1 bg-gray-200 rounded-sm" style={{ width: `${w * 3}px` }} />
                    ))}
                </div>
                <div className="bg-gray-50 px-2 py-1 border-b border-gray-200 grid grid-cols-2 gap-0.5">
                    {[0, 1, 2, 3].map((k) => (
                        <div key={k}>
                            <div className="h-0.5 w-3 bg-gray-300 rounded-sm mb-0.5" />
                            <div className="h-1 w-5 bg-gray-200 rounded-sm" />
                        </div>
                    ))}
                </div>
                <div className="flex gap-1 px-1 py-1 items-center">
                    <div className="w-1.5 text-[5px] text-gray-400">›</div>
                    {[6, 6, 5].map((w, i) => (
                        <div key={i} className="h-1 bg-gray-200 rounded-sm" style={{ width: `${w * 3}px` }} />
                    ))}
                </div>
            </div>
        </div>
    )
}

/* ── Presets ────────────────────────────────────────────────── */

export const dataTablePresets: DesignPreset[] = [
    /* Standard variants (Tables 1–3) */
    {
        id: 'table-standard-1',
        familyId: 'table-standard',
        name: 'Table 1',
        description: 'Standard 5-col table with View action and pagination',
        controls: { columns: '5', rows: '5', showCheckbox: false, showAvatar: false, showPagination: true, rowAction: 'view' },
        Thumbnail: TableBasicThumb,
    },
    {
        id: 'table-standard-2',
        familyId: 'table-standard',
        name: 'Table 2',
        description: 'Table with avatar and checkbox',
        controls: { columns: '5', rows: '5', showCheckbox: true, showAvatar: true, showPagination: true, rowAction: 'view' },
        Thumbnail: TableAvatarThumb,
    },
    {
        id: 'table-standard-3',
        familyId: 'table-standard',
        name: 'Table 3',
        description: '4-col compact table with menu action',
        controls: { columns: '4', rows: '5', showCheckbox: false, showAvatar: false, showPagination: true, rowAction: 'menu' },
        Thumbnail: TableBasicThumb,
    },
    /* Standard 8–10 (extra rows, 6-col) */
    {
        id: 'table-standard-8',
        familyId: 'table-standard',
        name: 'Table 8',
        description: '6-col dense table, 10 rows',
        controls: { columns: '6', rows: '10', showCheckbox: false, showAvatar: false, showPagination: true, rowAction: 'view' },
        Thumbnail: TableBasicThumb,
    },
    {
        id: 'table-standard-9',
        familyId: 'table-standard',
        name: 'Table 9',
        description: '5-col avatar table, 10 rows',
        controls: { columns: '5', rows: '10', showCheckbox: true, showAvatar: true, showPagination: true, rowAction: 'menu' },
        Thumbnail: TableAvatarThumb,
    },
    {
        id: 'table-standard-10',
        familyId: 'table-standard',
        name: 'Table 10',
        description: '4-col minimal table, no pagination',
        controls: { columns: '4', rows: '5', showCheckbox: false, showAvatar: false, showPagination: false, rowAction: 'none' },
        Thumbnail: TableBasicThumb,
    },
    /* Filtered variants (Tables 4–6) */
    {
        id: 'table-filtered-4',
        familyId: 'table-filtered',
        name: 'Table 4',
        description: 'Table with search + filter chips',
        controls: { showSearch: true, showChips: true, showResultCount: true, grouped: false, rowAction: 'view' },
        Thumbnail: TableFilteredThumb,
    },
    {
        id: 'table-filtered-5',
        familyId: 'table-filtered',
        name: 'Table 5',
        description: 'Grouped filtered table',
        controls: { showSearch: true, showChips: true, showResultCount: true, grouped: true, rowAction: 'view' },
        Thumbnail: TableFilteredThumb,
    },
    {
        id: 'table-filtered-6',
        familyId: 'table-filtered',
        name: 'Table 6',
        description: 'Filtered table, chips only, no search',
        controls: { showSearch: false, showChips: true, showResultCount: false, grouped: false, rowAction: 'menu' },
        Thumbnail: TableFilteredThumb,
    },
    /* Expandable (Table 7) */
    {
        id: 'table-expandable-7',
        familyId: 'table-expandable',
        name: 'Table 7',
        description: 'Expandable rows with detail metadata panel',
        controls: { showCheckbox: false, detailColumns: '2', showPagination: true },
        Thumbnail: TableExpandableThumb,
    },
]
