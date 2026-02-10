'use client'

/**
 * Features Presets — Named snapshots of Features family control values.
 */

import { ImageIcon } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Features 1 Thumbnail: 3-column grid, centered */
function Features1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[5px] text-gray-400 uppercase">Features</div>
                <div className="text-[7px] font-semibold text-gray-800">Product features</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center text-center space-y-0.5">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded" />
                        <div className="text-[4px] font-medium text-gray-700">Feature</div>
                        <div className="text-[3px] text-gray-400 leading-tight">Lorem ipsum</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Features 2 Thumbnail: 2-column grid */
function Features2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Features</div>
            </div>
            <div className="grid grid-cols-2 gap-1 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center text-center space-y-0.5">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded" />
                        <div className="text-[4px] font-medium text-gray-700">Feature</div>
                        <div className="text-[3px] text-gray-400 leading-tight">Lorem ipsum</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Features 3 Thumbnail: Vertical list */
function Features3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Features</div>
            </div>
            <div className="space-y-1 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1 border-b border-gray-50 pb-1">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded flex-shrink-0" />
                        <div>
                            <div className="text-[4px] font-medium text-gray-700">Feature {i + 1}</div>
                            <div className="text-[3px] text-gray-400">Lorem ipsum dolor</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Features 4 Thumbnail: Split alternating */
function Features4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col gap-1.5">
            <div className="text-center mb-0.5">
                <div className="text-[7px] font-semibold text-gray-800">Features</div>
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className={`flex gap-1.5 items-center ${i % 2 === 1 ? 'flex-row-reverse' : ''}`}>
                    <div className="flex-1 space-y-0.5">
                        <div className="text-[5px] font-medium text-gray-700">Feature heading</div>
                        <div className="text-[3px] text-gray-400">Lorem ipsum dolor sit</div>
                    </div>
                    <div className="flex-1 aspect-[4/3] bg-gray-100 border border-gray-200 flex items-center justify-center">
                        <ImageIcon className="w-2 h-2 text-gray-300" />
                    </div>
                </div>
            ))}
        </div>
    )
}

/** Features 5 Thumbnail: 4-column grid, left-aligned */
function Features5Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Features</div>
            </div>
            <div className="grid grid-cols-4 gap-1 flex-1">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-start space-y-0.5">
                        <div className="w-2.5 h-2.5 bg-gray-100 border border-gray-200 rounded" />
                        <div className="text-[3.5px] font-medium text-gray-700">Feature</div>
                        <div className="text-[3px] text-gray-400 leading-tight">Lorem</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** Features 1 — 3-column centered grid */
export const Features1Preset: DesignPreset = {
    id: 'features-grid-3col',
    familyId: 'features-grid',
    name: 'Features 1',
    description: '3-column icon grid, centered',
    controls: {
        columns: '3',
        itemCount: '6',
        showIcon: true,
        textAlign: 'center',
    },
    Thumbnail: Features1Thumbnail,
}

/** Features 2 — 2-column grid */
export const Features2Preset: DesignPreset = {
    id: 'features-grid-2col',
    familyId: 'features-grid',
    name: 'Features 2',
    description: '2-column icon grid',
    controls: {
        columns: '2',
        itemCount: '4',
        showIcon: true,
        textAlign: 'center',
    },
    Thumbnail: Features2Thumbnail,
}

/** Features 3 — Vertical list */
export const Features3Preset: DesignPreset = {
    id: 'features-list-default',
    familyId: 'features-list',
    name: 'Features 3',
    description: 'Vertical feature list with icons',
    controls: {
        itemCount: '4',
        showIcon: true,
        showDividers: true,
    },
    Thumbnail: Features3Thumbnail,
}

/** Features 4 — Alternating split */
export const Features4Preset: DesignPreset = {
    id: 'features-split-default',
    familyId: 'features-split',
    name: 'Features 4',
    description: 'Alternating image + text rows',
    controls: {
        startPlacement: 'right',
        itemCount: '3',
        showButton: true,
    },
    Thumbnail: Features4Thumbnail,
}

/** Features 5 — 4-column grid, left-aligned */
export const Features5Preset: DesignPreset = {
    id: 'features-grid-4col',
    familyId: 'features-grid',
    name: 'Features 5',
    description: '4-column compact grid',
    controls: {
        columns: '4',
        itemCount: '8',
        showIcon: true,
        textAlign: 'left',
    },
    Thumbnail: Features5Thumbnail,
}

/** All Features presets for registry */
export const featuresPresets: DesignPreset[] = [
    Features1Preset,
    Features2Preset,
    Features3Preset,
    Features4Preset,
    Features5Preset,
]
