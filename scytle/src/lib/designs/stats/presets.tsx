'use client'

/**
 * Stats Presets — Named snapshots of Stats family control values.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Stats 1 — Row with dividers */
function Stats1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex items-center justify-center">
            <div className="flex gap-2 w-full">
                {['10K+', '50+', '$2M+', '99.9%'].map((val, i) => (
                    <div key={i} className={`flex-1 text-center py-1 ${i < 3 ? 'border-r border-gray-200' : ''}`}>
                        <div className="text-[8px] font-bold text-gray-800">{val}</div>
                        <div className="text-[3px] text-gray-400">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 2 — Row, no dividers */
function Stats2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex items-center justify-center">
            <div className="flex gap-3 w-full">
                {['10K+', '50+', '$2M+'].map((val, i) => (
                    <div key={i} className="flex-1 text-center py-1">
                        <div className="text-[9px] font-bold text-gray-800">{val}</div>
                        <div className="text-[3px] text-gray-400">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 3 — Cards */
function Stats3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1"><div className="text-[6px] font-semibold text-gray-800">By the numbers</div></div>
            <div className="grid grid-cols-3 gap-0.5 flex-1">
                {['10K+', '50+', '$2M+'].map((val, i) => (
                    <div key={i} className="border border-gray-200 rounded flex flex-col items-center justify-center py-1">
                        <div className="text-[7px] font-bold text-gray-800">{val}</div>
                        <div className="text-[3px] text-gray-400">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 4 — Split with image */
function Stats4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1.5 items-center">
            <div className="flex-1 space-y-1">
                <div className="text-[6px] font-semibold text-gray-800">Trusted</div>
                <div className="grid grid-cols-2 gap-0.5">
                    {['10K+', '50+', '$2M+', '99%'].map((val, i) => (
                        <div key={i} className="py-0.5">
                            <div className="text-[6px] font-bold text-gray-800">{val}</div>
                            <div className="text-[2.5px] text-gray-400">Label</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 aspect-[4/3] bg-gray-100 border border-gray-200 rounded" />
        </div>
    )
}

/** Stats 5 — Dark banner */
function Stats5Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-900 p-2 flex items-center justify-center">
            <div className="flex gap-2 w-full">
                {['10K+', '50+', '$2M+', '99.9%'].map((val, i) => (
                    <div key={i} className={`flex-1 text-center py-1 ${i < 3 ? 'border-r border-gray-700' : ''}`}>
                        <div className="text-[8px] font-bold text-white">{val}</div>
                        <div className="text-[3px] text-gray-500">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 6 — Progress bars */
function Stats6Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5"><div className="text-[6px] font-semibold text-gray-800">Performance</div></div>
            <div className="space-y-1.5 flex-1 flex flex-col justify-center">
                {[95, 78, 90].map((pct, i) => (
                    <div key={i}>
                        <div className="flex justify-between mb-0.5">
                            <div className="text-[3px] text-gray-500">Metric</div>
                            <div className="text-[3px] font-bold text-gray-800">{pct}%</div>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-1">
                            <div className="bg-gray-800 h-1 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 7 — Counter (large centered) */
function Stats7Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center">
            <div className="text-[5px] text-gray-400 mb-1">By the Numbers</div>
            <div className="flex gap-3 w-full">
                {['10M+', '99.9%', '4.9★'].map((val, i) => (
                    <div key={i} className="flex-1 text-center">
                        <div className="text-[10px] font-bold text-gray-800">{val}</div>
                        <div className="text-[3px] text-gray-400">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 8 — Comparison (before/after) */
function Stats8Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-[5px] font-semibold text-gray-800 mb-1">Before &amp; After</div>
            <div className="space-y-1 flex-1 flex flex-col justify-center">
                {['4.2s → 0.8s', '2.1% → 7.8%', '65% → 94%'].map((pair, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="text-[3px] text-gray-400 w-6">Metric</div>
                        <div className="text-[5px] font-bold text-emerald-600">{pair}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 9 — Highlight (one hero stat) */
function Stats9Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center">
            <div className="text-[14px] font-bold text-gray-800">99.9%</div>
            <div className="text-[4px] text-gray-400 mb-1.5">Uptime</div>
            <div className="flex gap-2 w-full">
                {['50M+', '150ms', '24/7'].map((val, i) => (
                    <div key={i} className="flex-1 text-center">
                        <div className="text-[6px] font-semibold text-gray-600">{val}</div>
                        <div className="text-[3px] text-gray-400">Stat</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 10 — Grid with borders */
function Stats10Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-[5px] font-semibold text-gray-800 text-center mb-1">Key Metrics</div>
            <div className="grid grid-cols-3 gap-px flex-1 bg-gray-200">
                {['500+', '1.2K', '98%', '15+', '50+', '24/7'].map((val, i) => (
                    <div key={i} className="bg-white flex flex-col items-center justify-center py-0.5">
                        <div className="text-[6px] font-bold text-gray-800">{val}</div>
                        <div className="text-[3px] text-gray-400">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 11 — List with dividers */
function Stats11Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-[5px] font-semibold text-gray-800 mb-1">Our Impact</div>
            <div className="space-y-0 flex-1 flex flex-col justify-center">
                {['2.5M', '$4.2B', '150+', '99.9%'].map((val, i) => (
                    <div key={i} className={`flex items-center justify-between py-0.5 ${i > 0 ? 'border-t border-gray-100' : ''}`}>
                        <div className="text-[3px] text-gray-500">Metric</div>
                        <div className="text-[6px] font-bold text-gray-800">{val}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 12 — Minimal numbers */
function Stats12Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex items-center justify-center">
            <div className="flex gap-4">
                {['12', '850', '40'].map((val, i) => (
                    <div key={i} className="text-center">
                        <div className="text-[12px] font-bold text-gray-800">{val}</div>
                        <div className="text-[3px] text-gray-400">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 13 — Circular progress rings */
function Stats13Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center">
            <div className="text-[5px] font-semibold text-gray-800 mb-1">Performance</div>
            <div className="flex gap-2">
                {[95, 87, 99].map((pct, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <svg width="18" height="18" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                            <circle cx="18" cy="18" r="14" fill="none" stroke="#1f2937" strokeWidth="3"
                                strokeDasharray={`${pct * 0.88} 88`} strokeLinecap="round"
                                transform="rotate(-90 18 18)" />
                        </svg>
                        <div className="text-[4px] font-bold text-gray-800 mt-0.5">{pct}%</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 14 — Infographic colored cards */
function Stats14Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-[5px] font-semibold text-gray-800 text-center mb-1">Results</div>
            <div className="grid grid-cols-2 gap-0.5 flex-1">
                {[
                    { val: '10x', bg: 'bg-indigo-50 text-indigo-700' },
                    { val: '60%', bg: 'bg-emerald-50 text-emerald-700' },
                    { val: '3M+', bg: 'bg-amber-50 text-amber-700' },
                    { val: '200+', bg: 'bg-rose-50 text-rose-700' },
                ].map((s, i) => (
                    <div key={i} className={`${s.bg} rounded flex flex-col items-center justify-center py-1`}>
                        <div className="text-[7px] font-bold">{s.val}</div>
                        <div className="text-[3px] opacity-70">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 15 — Timeline milestones */
function Stats15Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-[5px] font-semibold text-gray-800 mb-1">Milestones</div>
            <div className="flex-1 flex flex-col justify-center pl-2 space-y-1 relative">
                <div className="absolute left-[4px] top-0 bottom-0 w-px bg-gray-200" />
                {['$1M', '100K', 'Series B'].map((val, i) => (
                    <div key={i} className="flex items-center gap-1 relative">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-800 z-10" />
                        <div>
                            <div className="text-[5px] font-bold text-gray-800">{val}</div>
                            <div className="text-[3px] text-gray-400">202{i}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

export const Stats1Preset: DesignPreset = {
    id: 'stats-1',
    familyId: 'stats-row',
    name: 'Stats 1',
    description: 'Four stats in a row with dividers',
    controls: { showLabel: true, showDividers: true },
    Thumbnail: Stats1Thumbnail,
}

export const Stats2Preset: DesignPreset = {
    id: 'stats-2',
    familyId: 'stats-row',
    name: 'Stats 2',
    description: 'Three stats in a row, no dividers',
    controls: { showLabel: true, showDividers: false },
    Thumbnail: Stats2Thumbnail,
}

export const Stats3Preset: DesignPreset = {
    id: 'stats-3',
    familyId: 'stats-cards',
    name: 'Stats 3',
    description: 'Three stats in card boxes',
    controls: { columns: '3', showIcon: false },
    Thumbnail: Stats3Thumbnail,
}

export const Stats4Preset: DesignPreset = {
    id: 'stats-4',
    familyId: 'stats-split',
    name: 'Stats 4',
    description: 'Stats with image on the right',
    controls: { statsPlacement: 'left', showImage: true },
    Thumbnail: Stats4Thumbnail,
}

export const Stats5Preset: DesignPreset = {
    id: 'stats-5',
    familyId: 'stats-banner',
    name: 'Stats 5',
    description: 'Dark full-width banner stats',
    controls: { style: 'dark' },
    Thumbnail: Stats5Thumbnail,
}

export const Stats6Preset: DesignPreset = {
    id: 'stats-6',
    familyId: 'stats-progress',
    name: 'Stats 6',
    description: 'Progress bar visualizations',
    controls: { columns: '1', showPercentage: true },
    Thumbnail: Stats6Thumbnail,
}

export const Stats7Preset: DesignPreset = {
    id: 'stats-7',
    familyId: 'stats-counter',
    name: 'Stats 7',
    description: 'Large centered counter numbers',
    controls: { alignment: 'center', showDescription: true },
    Thumbnail: Stats7Thumbnail,
}

export const Stats8Preset: DesignPreset = {
    id: 'stats-8',
    familyId: 'stats-comparison',
    name: 'Stats 8',
    description: 'Before & after comparison',
    controls: { layout: 'side', showLabels: true },
    Thumbnail: Stats8Thumbnail,
}

export const Stats9Preset: DesignPreset = {
    id: 'stats-9',
    familyId: 'stats-highlight',
    name: 'Stats 9',
    description: 'One hero stat with supporting metrics',
    controls: { heroAlignment: 'center', showSupporting: true },
    Thumbnail: Stats9Thumbnail,
}

export const Stats10Preset: DesignPreset = {
    id: 'stats-10',
    familyId: 'stats-grid',
    name: 'Stats 10',
    description: 'Multi-row bordered grid',
    controls: { columns: '3', showBorder: true },
    Thumbnail: Stats10Thumbnail,
}

export const Stats11Preset: DesignPreset = {
    id: 'stats-11',
    familyId: 'stats-list',
    name: 'Stats 11',
    description: 'Vertical list with dividers',
    controls: { valuePosition: 'right', showDividers: true },
    Thumbnail: Stats11Thumbnail,
}

export const Stats12Preset: DesignPreset = {
    id: 'stats-12',
    familyId: 'stats-minimal',
    name: 'Stats 12',
    description: 'Ultra-clean minimal numbers',
    controls: { size: 'large', showLabel: true },
    Thumbnail: Stats12Thumbnail,
}

export const Stats13Preset: DesignPreset = {
    id: 'stats-13',
    familyId: 'stats-circular',
    name: 'Stats 13',
    description: 'SVG circular progress rings',
    controls: { columns: '3', ringSize: 'large' },
    Thumbnail: Stats13Thumbnail,
}

export const Stats14Preset: DesignPreset = {
    id: 'stats-14',
    familyId: 'stats-infographic',
    name: 'Stats 14',
    description: 'Colored infographic cards',
    controls: { style: 'gradient', columns: '2' },
    Thumbnail: Stats14Thumbnail,
}

export const Stats15Preset: DesignPreset = {
    id: 'stats-15',
    familyId: 'stats-timeline',
    name: 'Stats 15',
    description: 'Timeline milestones with dates',
    controls: { linePosition: 'left', showDate: true },
    Thumbnail: Stats15Thumbnail,
}

export const statsPresets: DesignPreset[] = [
    Stats1Preset,
    Stats2Preset,
    Stats3Preset,
    Stats4Preset,
    Stats5Preset,
    Stats6Preset,
    Stats7Preset,
    Stats8Preset,
    Stats9Preset,
    Stats10Preset,
    Stats11Preset,
    Stats12Preset,
    Stats13Preset,
    Stats14Preset,
    Stats15Preset,
]
