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
        showIcon: true,
        textAlign: 'left',
    },
    Thumbnail: Features5Thumbnail,
}

// ===== NEW FAMILY THUMBNAILS =====

/** Features 6 Thumbnail: Numbered grid */
function Features6Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Numbered</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-gray-100 p-1 space-y-0.5">
                        <div className="text-[7px] font-bold text-gray-200">{String(i + 1).padStart(2, '0')}</div>
                        <div className="text-[3px] font-medium text-gray-700">Feature</div>
                        <div className="text-[2px] text-gray-400">Lorem ipsum</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Features 7 Thumbnail: Numbered list */
function Features7Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Process</div>
            </div>
            <div className="space-y-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex items-center gap-1 ${i > 0 ? 'border-t border-gray-100 pt-1' : ''}`}>
                        <div className="text-[6px] font-bold text-gray-200 w-3">{String(i + 1).padStart(2, '0')}</div>
                        <div className="text-[3px] font-medium text-gray-700">Feature {i + 1}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Features 8 Thumbnail: Bordered grid cards */
function Features8Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Features</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded p-1 flex flex-col items-center text-center space-y-0.5">
                        <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded" />
                        <div className="text-[3.5px] font-medium text-gray-700">Feature</div>
                        <div className="text-[2.5px] text-gray-400">Lorem ipsum</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== NEW PRESETS =====

/** Features 6 — Numbered grid */
export const Features6Preset: DesignPreset = {
    id: 'features-numbered-grid',
    familyId: 'features-numbered',
    name: 'Features 6',
    description: 'Numbered feature grid with descriptions',
    controls: {
        layout: 'grid',
        showDividers: true,
        showDescription: true,
    },
    Thumbnail: Features6Thumbnail,
}

/** Features 7 — Numbered list */
export const Features7Preset: DesignPreset = {
    id: 'features-numbered-list',
    familyId: 'features-numbered',
    name: 'Features 7',
    description: 'Numbered vertical list with dividers',
    controls: {
        layout: 'list',
        showDividers: true,
        showDescription: true,
    },
    Thumbnail: Features7Thumbnail,
}

/** Features 8 — Bordered card grid */
export const Features8Preset: DesignPreset = {
    id: 'features-grid-bordered',
    familyId: 'features-grid',
    name: 'Features 8',
    description: '3-column bordered card grid',
    controls: {
        columns: '3',
        showIcon: true,
        textAlign: 'center',
        cardStyle: 'bordered',
    },
    Thumbnail: Features8Thumbnail,
}

/** All Features presets for registry */
export const featuresPresets: DesignPreset[] = [
    Features1Preset,
    Features2Preset,
    Features3Preset,
    Features4Preset,
    Features5Preset,
    Features6Preset,
    Features7Preset,
    Features8Preset,
]
