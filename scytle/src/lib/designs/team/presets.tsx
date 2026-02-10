'use client'

/**
 * Team Presets — Named snapshots of Team family control values.
 */

import { User } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Team 1 Thumbnail: 4-column grid */
function Team1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1.5">
                <div className="text-[6px] font-semibold text-gray-800">Meet the team</div>
            </div>
            <div className="grid grid-cols-4 gap-1 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-0.5">
                        <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
                        <div className="text-[3px] font-medium text-gray-700">Name</div>
                        <div className="text-[2.5px] text-gray-400">Role</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Team 2 Thumbnail: 3-column grid with bios */
function Team2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Our team</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-0.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200" />
                        <div className="text-[3px] font-medium text-gray-700">Name</div>
                        <div className="text-[2.5px] text-gray-400">Role</div>
                        <div className="text-[2px] text-gray-300 text-center">Short bio text</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Team 3 Thumbnail: Cards with photos */
function Team3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Leadership</div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden">
                        <div className="aspect-[4/3] bg-gray-100" />
                        <div className="p-0.5">
                            <div className="text-[3px] font-medium text-gray-700">Name</div>
                            <div className="text-[2.5px] text-gray-400">Title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Team 4 Thumbnail: Simple row */
function Team4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col justify-center">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">The team</div>
            </div>
            <div className="flex gap-2 justify-center">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-0.5">
                        <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200" />
                        <div>
                            <div className="text-[3px] font-medium text-gray-700">Name</div>
                            <div className="text-[2.5px] text-gray-400">Role</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

export const Team1Preset: DesignPreset = {
    id: 'team-1',
    familyId: 'team-grid',
    name: 'Team 1',
    description: 'Four-column grid with roles',
    controls: { columns: '4', itemCount: '4', showRole: true, showBio: false },
    Thumbnail: Team1Thumbnail,
}

export const Team2Preset: DesignPreset = {
    id: 'team-2',
    familyId: 'team-grid',
    name: 'Team 2',
    description: 'Three-column grid with bios',
    controls: { columns: '3', itemCount: '3', showRole: true, showBio: true },
    Thumbnail: Team2Thumbnail,
}

export const Team3Preset: DesignPreset = {
    id: 'team-3',
    familyId: 'team-cards',
    name: 'Team 3',
    description: 'Card layout with photos and social links',
    controls: { columns: '3', itemCount: '3', showSocial: true },
    Thumbnail: Team3Thumbnail,
}

export const Team4Preset: DesignPreset = {
    id: 'team-4',
    familyId: 'team-simple',
    name: 'Team 4',
    description: 'Simple horizontal row',
    controls: { itemCount: '4', showRole: true },
    Thumbnail: Team4Thumbnail,
}

export const teamPresets: DesignPreset[] = [
    Team1Preset,
    Team2Preset,
    Team3Preset,
    Team4Preset,
]
