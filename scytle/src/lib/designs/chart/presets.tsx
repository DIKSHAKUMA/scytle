'use client'

/**
 * Chart presets — frozen snapshots for Bar, Line, Pie/Donut, and Area chart families.
 */

import type { DesignPreset } from '../types'

/* ── Thumbnail helpers ── */

function BarVerticalThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="h-1 w-12 bg-gray-200 rounded-sm" />
            <div className="flex items-end gap-0.5 flex-1 mt-1">
                {[60, 85, 40, 90, 55, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-gray-200 rounded-t" style={{ height: `${h}%` }} />
                ))}
            </div>
        </div>
    )
}

function BarHorizontalThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="flex flex-col gap-0.5 flex-1 mt-1 justify-center">
                {[75, 90, 50, 65].map((w, i) => (
                    <div key={i} className="h-1.5 bg-gray-200 rounded-r" style={{ width: `${w}%` }} />
                ))}
            </div>
        </div>
    )
}

function LineChartThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="flex-1 mt-1 relative">
                <svg viewBox="0 0 60 30" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,20 C10,15 20,10 30,14 C40,18 50,5 60,8" fill="none" stroke="#9CA3AF" strokeWidth={1.5} />
                    <path d="M0,25 C10,22 20,18 30,20 C40,22 50,12 60,15" fill="none" stroke="#D1D5DB" strokeWidth={1.5} />
                </svg>
            </div>
        </div>
    )
}

function PieThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col items-center justify-center gap-1">
            <div className="self-start h-1.5 w-8 bg-gray-800 rounded-sm" />
            <svg viewBox="0 0 40 40" className="w-10 h-10">
                <circle cx="20" cy="20" r="18" fill="#E5E7EB" />
                <path d="M20 20 L20 2 A18 18 0 0 1 37 25 Z" fill="#9CA3AF" />
                <path d="M20 20 L37 25 A18 18 0 0 1 10 35 Z" fill="#D1D5DB" />
            </svg>
        </div>
    )
}

function DonutThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col items-center justify-center gap-1">
            <div className="self-start h-1.5 w-8 bg-gray-800 rounded-sm" />
            <svg viewBox="0 0 40 40" className="w-10 h-10">
                <circle cx="20" cy="20" r="18" fill="#E5E7EB" />
                <path d="M20 20 L20 2 A18 18 0 0 1 37 25 Z" fill="#9CA3AF" />
                <path d="M20 20 L37 25 A18 18 0 0 1 10 35 Z" fill="#D1D5DB" />
                <circle cx="20" cy="20" r="9" fill="white" />
            </svg>
        </div>
    )
}

function AreaChartThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="flex-1 mt-1 relative">
                <svg viewBox="0 0 60 30" className="w-full h-full" preserveAspectRatio="none">
                    <path d="M0,20 C10,15 20,10 30,14 C40,18 50,5 60,8 L60,30 L0,30 Z" fill="rgba(156,163,175,0.2)" />
                    <path d="M0,20 C10,15 20,10 30,14 C40,18 50,5 60,8" fill="none" stroke="#9CA3AF" strokeWidth={1.5} />
                </svg>
            </div>
        </div>
    )
}

/* ── Presets ── */

export const chartPresets: DesignPreset[] = [
    /* ── Bar Chart ── */
    {
        id: 'chart-bar-1',
        familyId: 'chart-bar',
        name: 'Chart 1',
        description: 'Vertical bar chart with header and legend',
        controls: { orientation: 'vertical', barCount: '6', showHeader: true, showLegend: true },
        Thumbnail: BarVerticalThumb,
    },
    {
        id: 'chart-bar-2',
        familyId: 'chart-bar',
        name: 'Chart 2',
        description: 'Horizontal bar chart',
        controls: { orientation: 'horizontal', barCount: '6', showHeader: true, showLegend: true },
        Thumbnail: BarHorizontalThumb,
    },
    {
        id: 'chart-bar-3',
        familyId: 'chart-bar',
        name: 'Chart 3',
        description: 'Minimal vertical bars, no legend',
        controls: { orientation: 'vertical', barCount: '4', showHeader: true, showLegend: false },
        Thumbnail: BarVerticalThumb,
    },

    /* ── Line Chart ── */
    {
        id: 'chart-line-1',
        familyId: 'chart-line',
        name: 'Chart 4',
        description: 'Two-line chart with grid',
        controls: { lineCount: '2', showGrid: true, showHeader: true, showLegend: true },
        Thumbnail: LineChartThumb,
    },
    {
        id: 'chart-line-2',
        familyId: 'chart-line',
        name: 'Chart 5',
        description: 'Single line trend',
        controls: { lineCount: '1', showGrid: true, showHeader: true, showLegend: false },
        Thumbnail: LineChartThumb,
    },
    {
        id: 'chart-line-3',
        familyId: 'chart-line',
        name: 'Chart 6',
        description: 'Three-line comparison',
        controls: { lineCount: '3', showGrid: true, showHeader: true, showLegend: true },
        Thumbnail: LineChartThumb,
    },

    /* ── Pie / Donut Chart ── */
    {
        id: 'chart-pie-1',
        familyId: 'chart-pie',
        name: 'Chart 7',
        description: 'Donut chart with 4 segments',
        controls: { style: 'donut', segmentCount: '4', showHeader: true, showLegend: true },
        Thumbnail: DonutThumb,
    },
    {
        id: 'chart-pie-2',
        familyId: 'chart-pie',
        name: 'Chart 8',
        description: 'Pie chart with 3 segments',
        controls: { style: 'pie', segmentCount: '3', showHeader: true, showLegend: true },
        Thumbnail: PieThumb,
    },
    {
        id: 'chart-pie-3',
        familyId: 'chart-pie',
        name: 'Chart 9',
        description: 'Donut chart with 5 segments',
        controls: { style: 'donut', segmentCount: '5', showHeader: true, showLegend: true },
        Thumbnail: DonutThumb,
    },

    /* ── Area Chart ── */
    {
        id: 'chart-area-1',
        familyId: 'chart-area',
        name: 'Chart 10',
        description: 'Single area chart with grid',
        controls: { areaCount: '1', showGrid: true, showHeader: true, showLegend: true },
        Thumbnail: AreaChartThumb,
    },
    {
        id: 'chart-area-2',
        familyId: 'chart-area',
        name: 'Chart 11',
        description: 'Stacked area chart (two series)',
        controls: { areaCount: '2', showGrid: true, showHeader: true, showLegend: true },
        Thumbnail: AreaChartThumb,
    },
    {
        id: 'chart-area-3',
        familyId: 'chart-area',
        name: 'Chart 12',
        description: 'Minimal area chart, no legend',
        controls: { areaCount: '1', showGrid: false, showHeader: true, showLegend: false },
        Thumbnail: AreaChartThumb,
    },
]
