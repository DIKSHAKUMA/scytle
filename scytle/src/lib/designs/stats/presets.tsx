'use client'

/**
 * Stats Presets — Named snapshots of Stats family control values.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Stats 1 Thumbnail: 4-stat row with dividers */
function Stats1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex items-center justify-center">
            <div className="flex gap-2 w-full">
                {['10K+', '50+', '$2M+', '99.9%'].map((val, i) => (
                    <div
                        key={i}
                        className={`flex-1 text-center py-1 ${i < 3 ? 'border-r border-gray-200' : ''}`}
                    >
                        <div className="text-[8px] font-bold text-gray-800">{val}</div>
                        <div className="text-[3px] text-gray-400">Label</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Stats 2 Thumbnail: 3-stat row */
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

/** Stats 3 Thumbnail: Cards */
function Stats3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">By the numbers</div>
            </div>
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

/** Stats 4 Thumbnail: Split with image */
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

// ===== PRESETS =====

export const Stats1Preset: DesignPreset = {
    id: 'stats-1',
    familyId: 'stats-row',
    name: 'Stats 1',
    description: 'Four stats in a row with dividers',
    controls: { itemCount: '4', showLabel: true, showDividers: true },
    Thumbnail: Stats1Thumbnail,
}

export const Stats2Preset: DesignPreset = {
    id: 'stats-2',
    familyId: 'stats-row',
    name: 'Stats 2',
    description: 'Three stats in a row, no dividers',
    controls: { itemCount: '3', showLabel: true, showDividers: false },
    Thumbnail: Stats2Thumbnail,
}

export const Stats3Preset: DesignPreset = {
    id: 'stats-3',
    familyId: 'stats-cards',
    name: 'Stats 3',
    description: 'Three stats in card boxes',
    controls: { columns: '3', itemCount: '3', showIcon: false },
    Thumbnail: Stats3Thumbnail,
}

export const Stats4Preset: DesignPreset = {
    id: 'stats-4',
    familyId: 'stats-split',
    name: 'Stats 4',
    description: 'Stats with image on the right',
    controls: { statsPlacement: 'left', itemCount: '4', showImage: true },
    Thumbnail: Stats4Thumbnail,
}

export const statsPresets: DesignPreset[] = [
    Stats1Preset,
    Stats2Preset,
    Stats3Preset,
    Stats4Preset,
]
