'use client'

/**
 * Navbar Presets — Named snapshots of navbar family control values.
 */

import { Search, ChevronDown, Menu, X, Phone } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Navbar 1 Thumbnail: Standard — logo left, links, CTA right */
function Navbar1Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-b border-gray-200 px-2 flex items-center justify-between">
            <div className="font-bold text-[7px] text-gray-900">Logo</div>
            <div className="flex items-center gap-2">
                {['Link', 'Link', 'Link'].map((l, i) => (
                    <span key={i} className="text-[5px] text-gray-500">{l}</span>
                ))}
            </div>
            <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Sign Up</div>
        </div>
    )
}

/** Navbar 2 Thumbnail: Standard with search */
function Navbar2Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-b border-gray-200 px-2 flex items-center justify-between">
            <div className="font-bold text-[7px] text-gray-900">Logo</div>
            <div className="flex items-center gap-2">
                {['Link', 'Link', 'Link'].map((l, i) => (
                    <span key={i} className="text-[5px] text-gray-500">{l}</span>
                ))}
            </div>
            <div className="flex items-center gap-1">
                <Search className="w-2 h-2 text-gray-400" />
                <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Sign Up</div>
            </div>
        </div>
    )
}

/** Navbar 3 Thumbnail: Centered — logo centered above links */
function Navbar3Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-b border-gray-200 flex flex-col">
            <div className="flex items-center justify-center py-1 border-b border-gray-100">
                <div className="font-bold text-[7px] text-gray-900">Logo</div>
            </div>
            <div className="flex items-center justify-center gap-2 py-0.5">
                {['Link', 'Link', 'Link', 'Link'].map((l, i) => (
                    <span key={i} className="text-[5px] text-gray-500">{l}</span>
                ))}
            </div>
        </div>
    )
}

/** Navbar 4 Thumbnail: Mega menu */
function Navbar4Thumbnail() {
    return (
        <div className="w-full h-full bg-white flex flex-col">
            <div className="border-b border-gray-200 px-2 py-1 flex items-center justify-between">
                <div className="font-bold text-[7px] text-gray-900">Logo</div>
                <div className="flex items-center gap-2">
                    <span className="text-[5px] text-gray-500 flex items-center gap-0.5">
                        Products <ChevronDown className="w-1.5 h-1.5" />
                    </span>
                    <span className="text-[5px] text-gray-500">Pricing</span>
                </div>
                <div className="bg-gray-800 text-white text-[5px] px-1 py-0.5">CTA</div>
            </div>
            <div className="border-b border-gray-200 px-2 py-1.5 grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-0.5">
                        <div className="text-[4px] font-semibold text-gray-400 uppercase">Cat {i}</div>
                        <div className="text-[4px] text-gray-600">Item One</div>
                        <div className="text-[4px] text-gray-600">Item Two</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Navbar 5 Thumbnail: Standard, logo centered in link row */
function Navbar5Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-b border-gray-200 px-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                {['Link', 'Link'].map((l, i) => (
                    <span key={i} className="text-[5px] text-gray-500">{l}</span>
                ))}
            </div>
            <div className="font-bold text-[7px] text-gray-900">Logo</div>
            <div className="flex items-center gap-2">
                {['Link', 'Link'].map((l, i) => (
                    <span key={i} className="text-[5px] text-gray-500">{l}</span>
                ))}
                <div className="bg-gray-800 text-white text-[5px] px-1 py-0.5">CTA</div>
            </div>
        </div>
    )
}

/** Navbar 6 Thumbnail: Floating pill navbar */
function Navbar6Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex items-start justify-center pt-1.5 px-2">
            <div className="w-full bg-white border border-gray-200 rounded-full px-2 py-0.5 flex items-center justify-between shadow-sm">
                <div className="font-bold text-[6px] text-gray-900">Logo</div>
                <div className="flex items-center gap-1.5">
                    {['Link', 'Link', 'Link'].map((l, i) => (
                        <span key={i} className="text-[4px] text-gray-500">{l}</span>
                    ))}
                </div>
                <div className="bg-gray-800 text-white text-[4px] px-1.5 py-0.5 rounded-full">CTA</div>
            </div>
        </div>
    )
}

/** Navbar 7 Thumbnail: Floating pill with 2 buttons */
function Navbar7Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-50 flex items-start justify-center pt-1.5 px-2">
            <div className="w-full bg-white border border-gray-200 rounded-full px-2 py-0.5 flex items-center justify-between shadow-sm">
                <div className="font-bold text-[6px] text-gray-900">Logo</div>
                <div className="flex items-center gap-1.5">
                    {['Link', 'Link', 'Link'].map((l, i) => (
                        <span key={i} className="text-[4px] text-gray-500">{l}</span>
                    ))}
                </div>
                <div className="flex items-center gap-0.5">
                    <div className="border border-gray-300 text-[4px] text-gray-700 px-1.5 py-0.5 rounded-full">Login</div>
                    <div className="bg-gray-800 text-white text-[4px] px-1.5 py-0.5 rounded-full">Sign Up</div>
                </div>
            </div>
        </div>
    )
}

/** Navbar 8 Thumbnail: Double-row with utility bar */
function Navbar8Thumbnail() {
    return (
        <div className="w-full h-full bg-white flex flex-col">
            {/* Utility bar */}
            <div className="bg-gray-50 border-b border-gray-100 px-2 py-0.5 flex items-center justify-between">
                <div className="flex items-center gap-1">
                    <Phone className="w-1.5 h-1.5 text-gray-400" />
                    <span className="text-[3px] text-gray-400">+1 (555) 000</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-[3px] text-gray-400">Login</span>
                    <span className="text-[3px] text-gray-400">Register</span>
                </div>
            </div>
            {/* Main nav */}
            <div className="border-b border-gray-200 px-2 py-1 flex items-center justify-between">
                <div className="font-bold text-[7px] text-gray-900">Logo</div>
                <div className="flex items-center gap-2">
                    {['Link', 'Link', 'Link'].map((l, i) => (
                        <span key={i} className="text-[5px] text-gray-500">{l}</span>
                    ))}
                </div>
                <div className="flex items-center gap-0.5">
                    <div className="border border-gray-300 text-gray-700 text-[4px] px-1 py-0.5">Login</div>
                    <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5">CTA</div>
                </div>
            </div>
        </div>
    )
}

/** Navbar 9 Thumbnail: Fullscreen overlay (grid) */
function Navbar9Thumbnail() {
    return (
        <div className="w-full h-full bg-gray-900 p-1.5 flex flex-col">
            <div className="flex items-center justify-between mb-1.5">
                <div className="font-bold text-[6px] text-white">Logo</div>
                <X className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-1 flex-1">
                {['About', 'Services', 'Work', 'Contact'].map((item) => (
                    <div key={item} className="text-[5px] font-medium text-white">{item}</div>
                ))}
            </div>
        </div>
    )
}

/** Navbar 10 Thumbnail: Fullscreen overlay (sidebar) */
function Navbar10Thumbnail() {
    return (
        <div className="w-full h-full flex">
            <div className="w-1/2 bg-gray-800" />
            <div className="w-1/2 bg-gray-900 p-1.5 flex flex-col">
                <div className="flex justify-end mb-1.5">
                    <X className="w-2.5 h-2.5 text-white" />
                </div>
                <div className="space-y-1 flex-1">
                    {['About', 'Services', 'Work', 'Blog', 'Contact'].map((item) => (
                        <div key={item} className="text-[5px] font-medium text-white">{item}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** Navbar 1 — Standard: Logo left, links, CTA */
export const Navbar1Preset: DesignPreset = {
    id: 'navbar-standard-default',
    familyId: 'navbar-standard',
    name: 'Navbar 1',
    description: 'Logo left, links center, CTA right',
    controls: {
        logoPosition: 'left',
        showCta: true,
        showSearch: false,
    },
    Thumbnail: Navbar1Thumbnail,
}

/** Navbar 2 — Standard with search */
export const Navbar2Preset: DesignPreset = {
    id: 'navbar-standard-search',
    familyId: 'navbar-standard',
    name: 'Navbar 2',
    description: 'Standard with search icon',
    controls: {
        logoPosition: 'left',
        showCta: true,
        showSearch: true,
    },
    Thumbnail: Navbar2Thumbnail,
}

/** Navbar 3 — Centered logo above links */
export const Navbar3Preset: DesignPreset = {
    id: 'navbar-centered-default',
    familyId: 'navbar-centered',
    name: 'Navbar 3',
    description: 'Logo centered above links',
    controls: {
        showCta: true,
        showSearch: false,
    },
    Thumbnail: Navbar3Thumbnail,
}

/** Navbar 4 — Mega menu with 3 columns */
export const Navbar4Preset: DesignPreset = {
    id: 'navbar-mega-default',
    familyId: 'navbar-mega',
    name: 'Navbar 4',
    description: 'Navigation with mega dropdown',
    controls: {
        logoPosition: 'left',
        showCta: true,
        megaColumns: '3',
    },
    Thumbnail: Navbar4Thumbnail,
}

/** Navbar 5 — Standard, logo center-inline */
export const Navbar5Preset: DesignPreset = {
    id: 'navbar-standard-center',
    familyId: 'navbar-standard',
    name: 'Navbar 5',
    description: 'Logo centered in navigation row',
    controls: {
        logoPosition: 'center',
        showCta: true,
        showSearch: false,
    },
    Thumbnail: Navbar5Thumbnail,
}

/** Navbar 6 — Floating pill with single CTA */
export const Navbar6Preset: DesignPreset = {
    id: 'navbar-floating-default',
    familyId: 'navbar-floating',
    name: 'Navbar 6',
    description: 'Floating pill-shaped navbar',
    controls: {
        buttonCount: '1',
        showDropdown: false,
        showSearch: false,
    },
    Thumbnail: Navbar6Thumbnail,
}

/** Navbar 7 — Floating pill with dual buttons */
export const Navbar7Preset: DesignPreset = {
    id: 'navbar-floating-dual',
    familyId: 'navbar-floating',
    name: 'Navbar 7',
    description: 'Floating pill with two buttons',
    controls: {
        buttonCount: '2',
        showDropdown: false,
        showSearch: false,
    },
    Thumbnail: Navbar7Thumbnail,
}

/** Navbar 8 — Double-row with utility bar */
export const Navbar8Preset: DesignPreset = {
    id: 'navbar-double-default',
    familyId: 'navbar-double',
    name: 'Navbar 8',
    description: 'Two-row navbar with utility bar',
    controls: {
        showSearch: true,
        showAuth: true,
        showUtilityLinks: true,
    },
    Thumbnail: Navbar8Thumbnail,
}

/** Navbar 9 — Fullscreen overlay (grid) */
export const Navbar9Preset: DesignPreset = {
    id: 'navbar-fullscreen-grid',
    familyId: 'navbar-fullscreen',
    name: 'Navbar 9',
    description: 'Fullscreen overlay with grid links',
    controls: {
        menuStyle: 'grid',
        showSocial: true,
        showContact: false,
    },
    Thumbnail: Navbar9Thumbnail,
}

/** Navbar 10 — Fullscreen overlay (sidebar) */
export const Navbar10Preset: DesignPreset = {
    id: 'navbar-fullscreen-sidebar',
    familyId: 'navbar-fullscreen',
    name: 'Navbar 10',
    description: 'Fullscreen sidebar panel overlay',
    controls: {
        menuStyle: 'sidebar',
        showSocial: true,
        showContact: true,
    },
    Thumbnail: Navbar10Thumbnail,
}

/** All navbar presets for registry */
export const navbarPresets: DesignPreset[] = [
    Navbar1Preset,
    Navbar2Preset,
    Navbar3Preset,
    Navbar4Preset,
    Navbar5Preset,
    Navbar6Preset,
    Navbar7Preset,
    Navbar8Preset,
    Navbar9Preset,
    Navbar10Preset,
]
