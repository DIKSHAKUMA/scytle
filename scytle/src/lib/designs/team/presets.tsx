'use client'

/**
 * Team Presets — Named snapshots of Team family control values.
 * Mapped to Relume Figma designs Team 1–22.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Team 1: 4-col grid, circle avatars, center-aligned */
function Team1Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Meet our team</div>
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

/** Team 2: 4-col grid, rectangle photos, center */
function Team2Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Our team</div>
            </div>
            <div className="grid grid-cols-4 gap-0.5 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-0.5">
                        <div className="w-5 h-6 rounded-sm bg-gray-100 border border-gray-200" />
                        <div className="text-[3px] font-medium text-gray-700">Name</div>
                        <div className="text-[2.5px] text-gray-400">Role</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Team 3: 4-col grid, circle, left-aligned */
function Team3Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Meet our team</div>
            </div>
            <div className="grid grid-cols-4 gap-1 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-start space-y-0.5">
                        <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
                        <div className="text-[3px] font-medium text-gray-700">Name</div>
                        <div className="text-[2.5px] text-gray-400">Role</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Team 5: 3-col grid, circle, center */
function Team5Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Meet our team</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center space-y-0.5">
                        <div className="w-5 h-5 rounded-full bg-gray-100 border border-gray-200" />
                        <div className="text-[3px] font-medium text-gray-700">Name</div>
                        <div className="text-[2.5px] text-gray-400">Role</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Team 9: Carousel with arrows */
function Team9Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Our team</div>
            </div>
            <div className="flex gap-1 flex-1 items-start">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center space-y-0.5">
                        <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
                        <div className="text-[3px] font-medium text-gray-700">Name</div>
                    </div>
                ))}
            </div>
            <div className="flex items-center justify-between mt-0.5">
                <div className="flex gap-0.5">{[0,1].map(i => <div key={i} className={`w-1 h-1 rounded-full ${i===0 ? 'bg-gray-800' : 'bg-gray-200'}`}/>)}</div>
                <div className="flex gap-0.5">
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-300 flex items-center justify-center text-[5px] text-gray-400">‹</div>
                    <div className="w-2.5 h-2.5 rounded-full border border-gray-300 flex items-center justify-center text-[5px] text-gray-400">›</div>
                </div>
            </div>
        </div>
    )
}

/** Team 13: Compact inline avatars, 2-col */
function Team13Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Our team</div>
            </div>
            <div className="grid grid-cols-2 gap-1 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-0.5">
                        <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0" />
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

/** Team 17: Split — heading left, members right */
function Team17Thumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex gap-1.5">
            <div className="w-1/3 flex flex-col">
                <div className="text-[5px] font-semibold text-gray-800">Meet our team</div>
                <div className="text-[3px] text-gray-400 mt-0.5">Description text here</div>
            </div>
            <div className="flex-1 space-y-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-gray-100 border border-gray-200 flex-shrink-0" />
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

/** Team 16: Alternating image + text */
function Team16Thumb() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="mb-1">
                <div className="text-[5px] font-semibold text-gray-800">Our team</div>
            </div>
            <div className="space-y-1 flex-1">
                {[false, true].map((rev, i) => (
                    <div key={i} className={`flex gap-1 ${rev ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-5 bg-gray-100 rounded border border-gray-200 flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-[3px] font-medium text-gray-700">Name</div>
                            <div className="text-[2.5px] text-gray-400">Job title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Team 21: Staggered honeycomb */
function Team21Thumb() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Our team</div>
            </div>
            <div className="flex-1 flex flex-col items-center gap-0.5">
                <div className="flex gap-2">{[0,1].map(i => <div key={i} className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"/>)}</div>
                <div className="flex gap-2">{[0,1,2].map(i => <div key={i} className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"/>)}</div>
                <div className="flex gap-2">{[0,1].map(i => <div key={i} className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200"/>)}</div>
            </div>
        </div>
    )
}

// ===== PRESETS =====

export const Team1Preset: DesignPreset = {
    id: 'team-1',
    familyId: 'team-grid',
    name: 'Team 1',
    description: '4-column grid, circle avatars, center-aligned',
    controls: { columns: '4', itemCount: '4', alignment: 'center', avatarShape: 'circle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team1Thumb,
}

export const Team2Preset: DesignPreset = {
    id: 'team-2',
    familyId: 'team-grid',
    name: 'Team 2',
    description: '4-column grid, rectangular photos, center-aligned',
    controls: { columns: '4', itemCount: '8', alignment: 'center', avatarShape: 'rectangle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team2Thumb,
}

export const Team3Preset: DesignPreset = {
    id: 'team-3',
    familyId: 'team-grid',
    name: 'Team 3',
    description: '4-column grid, circle avatars, left-aligned',
    controls: { columns: '4', itemCount: '4', alignment: 'left', avatarShape: 'circle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team3Thumb,
}

export const Team4Preset: DesignPreset = {
    id: 'team-4',
    familyId: 'team-grid',
    name: 'Team 4',
    description: '4-column grid, rectangular photos, left-aligned',
    controls: { columns: '4', itemCount: '8', alignment: 'left', avatarShape: 'rectangle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team2Thumb,
}

export const Team5Preset: DesignPreset = {
    id: 'team-5',
    familyId: 'team-grid',
    name: 'Team 5',
    description: '3-column grid, circle avatars, center-aligned',
    controls: { columns: '3', itemCount: '6', alignment: 'center', avatarShape: 'circle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team5Thumb,
}

export const Team6Preset: DesignPreset = {
    id: 'team-6',
    familyId: 'team-grid',
    name: 'Team 6',
    description: '3-column grid, rectangular photos, center-aligned',
    controls: { columns: '3', itemCount: '6', alignment: 'center', avatarShape: 'rectangle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team5Thumb,
}

export const Team7Preset: DesignPreset = {
    id: 'team-7',
    familyId: 'team-grid',
    name: 'Team 7',
    description: '3-column grid, circle avatars, left-aligned',
    controls: { columns: '3', itemCount: '6', alignment: 'left', avatarShape: 'circle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team5Thumb,
}

export const Team8Preset: DesignPreset = {
    id: 'team-8',
    familyId: 'team-grid',
    name: 'Team 8',
    description: '3-column grid, rectangular photos, left-aligned',
    controls: { columns: '3', itemCount: '6', alignment: 'left', avatarShape: 'rectangle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team5Thumb,
}

export const Team9Preset: DesignPreset = {
    id: 'team-9',
    familyId: 'team-carousel',
    name: 'Team 9',
    description: 'Carousel slider with circle avatars',
    controls: { itemCount: '8', avatarShape: 'circle', showBio: true, showSocial: true },
    Thumbnail: Team9Thumb,
}

export const Team10Preset: DesignPreset = {
    id: 'team-10',
    familyId: 'team-carousel',
    name: 'Team 10',
    description: 'Carousel slider with rectangular photos',
    controls: { itemCount: '8', avatarShape: 'rectangle', showBio: true, showSocial: true },
    Thumbnail: Team9Thumb,
}

export const Team11Preset: DesignPreset = {
    id: 'team-11',
    familyId: 'team-grid',
    name: 'Team 11',
    description: '2-column grid, circle avatars, center-aligned',
    controls: { columns: '2', itemCount: '4', alignment: 'center', avatarShape: 'circle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team1Thumb,
}

export const Team12Preset: DesignPreset = {
    id: 'team-12',
    familyId: 'team-grid',
    name: 'Team 12',
    description: '2-column grid, rectangular photos, center-aligned',
    controls: { columns: '2', itemCount: '4', alignment: 'center', avatarShape: 'rectangle', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team2Thumb,
}

export const Team13Preset: DesignPreset = {
    id: 'team-13',
    familyId: 'team-compact',
    name: 'Team 13',
    description: 'Compact inline avatar, 2-column grid, center header',
    controls: { columns: '2', itemCount: '4', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team13Thumb,
}

export const Team14Preset: DesignPreset = {
    id: 'team-14',
    familyId: 'team-compact',
    name: 'Team 14',
    description: 'Compact inline avatar, 2-column grid with photos',
    controls: { columns: '2', itemCount: '4', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team13Thumb,
}

export const Team15Preset: DesignPreset = {
    id: 'team-15',
    familyId: 'team-compact',
    name: 'Team 15',
    description: 'Compact inline avatar, 2-column, no bio',
    controls: { columns: '2', itemCount: '4', showBio: false, showSocial: true, showCta: true },
    Thumbnail: Team13Thumb,
}

export const Team16Preset: DesignPreset = {
    id: 'team-16',
    familyId: 'team-alternating',
    name: 'Team 16',
    description: 'Alternating image + text rows',
    controls: { itemCount: '3', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team16Thumb,
}

export const Team17Preset: DesignPreset = {
    id: 'team-17',
    familyId: 'team-split',
    name: 'Team 17',
    description: 'Split — heading left, stacked members right',
    controls: { memberLayout: 'stacked', avatarShape: 'circle', itemCount: '3', showBio: true, showSocial: true },
    Thumbnail: Team17Thumb,
}

export const Team18Preset: DesignPreset = {
    id: 'team-18',
    familyId: 'team-split',
    name: 'Team 18',
    description: 'Split — heading left, stacked members with rect photos',
    controls: { memberLayout: 'stacked', avatarShape: 'rectangle', itemCount: '3', showBio: true, showSocial: true },
    Thumbnail: Team17Thumb,
}

export const Team19Preset: DesignPreset = {
    id: 'team-19',
    familyId: 'team-split',
    name: 'Team 19',
    description: 'Split — heading left, 2-col grid members right',
    controls: { memberLayout: 'grid', avatarShape: 'circle', itemCount: '4', showBio: true, showSocial: true },
    Thumbnail: Team17Thumb,
}

export const Team20Preset: DesignPreset = {
    id: 'team-20',
    familyId: 'team-split',
    name: 'Team 20',
    description: 'Split — heading left, 2-col grid with rect photos',
    controls: { memberLayout: 'grid', avatarShape: 'rectangle', itemCount: '6', showBio: true, showSocial: true },
    Thumbnail: Team17Thumb,
}

export const Team21Preset: DesignPreset = {
    id: 'team-21',
    familyId: 'team-staggered',
    name: 'Team 21',
    description: 'Honeycomb/staggered circle layout (2-3-2 pattern)',
    controls: { itemCount: '7', showBio: false, showSocial: true, showCta: true },
    Thumbnail: Team21Thumb,
}

export const Team22Preset: DesignPreset = {
    id: 'team-22',
    familyId: 'team-staggered',
    name: 'Team 22',
    description: 'Masonry staggered grid layout',
    controls: { itemCount: '9', showBio: true, showSocial: true, showCta: true },
    Thumbnail: Team21Thumb,
}

export const teamPresets: DesignPreset[] = [
    Team1Preset, Team2Preset, Team3Preset, Team4Preset,
    Team5Preset, Team6Preset, Team7Preset, Team8Preset,
    Team9Preset, Team10Preset, Team11Preset, Team12Preset,
    Team13Preset, Team14Preset, Team15Preset,
    Team16Preset, Team17Preset, Team18Preset,
    Team19Preset, Team20Preset, Team21Preset, Team22Preset,
]
