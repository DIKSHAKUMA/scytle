'use client'

/**
 * Footer Presets — Named snapshots of footer family control values.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Footer 1 Thumbnail: 4-column with social */
function Footer1Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-t border-gray-200 p-1.5 flex flex-col justify-between">
            <div className="grid grid-cols-4 gap-1">
                {['Product', 'Company', 'Resources', 'Legal'].map((col) => (
                    <div key={col} className="space-y-0.5">
                        <div className="text-[4px] font-semibold text-gray-800">{col}</div>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-[3px] text-gray-400">Link</div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-100 pt-1 flex items-center justify-between">
                <div className="text-[3px] text-gray-400">© Company</div>
                <div className="flex gap-0.5">
                    {['FB', 'TW', 'IG'].map((s) => (
                        <div key={s} className="w-2.5 h-2.5 bg-gray-100 rounded flex items-center justify-center text-[3px] text-gray-400">{s}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Footer 2 Thumbnail: Simple single row */
function Footer2Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-t border-gray-200 p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="font-bold text-[6px] text-gray-900">Logo</div>
                <div className="text-[4px] text-gray-400">© 2024 Company</div>
            </div>
            <div className="flex items-center gap-2">
                {['Privacy', 'Terms'].map((l) => (
                    <span key={l} className="text-[4px] text-gray-400">{l}</span>
                ))}
                <div className="flex gap-0.5">
                    {['FB', 'TW'].map((s) => (
                        <div key={s} className="w-2 h-2 bg-gray-100 rounded flex items-center justify-center text-[3px] text-gray-400">{s}</div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Footer 3 Thumbnail: CTA + columns */
function Footer3Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-t border-gray-200 flex flex-col">
            {/* CTA */}
            <div className="p-1.5 border-b border-gray-100 flex flex-col items-center space-y-0.5">
                <div className="text-[5px] font-semibold text-gray-800">Stay up to date</div>
                <div className="flex gap-0.5">
                    <div className="w-12 h-2.5 bg-gray-100 border border-gray-200" />
                    <div className="bg-gray-800 text-white text-[3px] px-1 py-0.5">Subscribe</div>
                </div>
            </div>
            {/* Columns */}
            <div className="p-1.5 grid grid-cols-4 gap-1 flex-1">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-0.5">
                        <div className="text-[3px] font-semibold text-gray-800">Col {i}</div>
                        <div className="text-[3px] text-gray-400">Link</div>
                        <div className="text-[3px] text-gray-400">Link</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Footer 4 Thumbnail: Big footer with logo */
function Footer4Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-t border-gray-200 p-1.5 flex flex-col justify-between">
            <div className="flex gap-2">
                <div className="w-1/3 space-y-0.5">
                    <div className="font-bold text-[6px] text-gray-900">Logo</div>
                    <div className="text-[3px] text-gray-400 leading-tight">Brief company description</div>
                    <div className="flex gap-0.5 pt-0.5">
                        {['FB', 'TW', 'IG'].map((s) => (
                            <div key={s} className="w-2 h-2 bg-gray-100 rounded flex items-center justify-center text-[3px] text-gray-400">{s}</div>
                        ))}
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-1">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="space-y-0.5">
                            <div className="text-[3px] font-semibold text-gray-800">Col</div>
                            <div className="text-[3px] text-gray-400">Link</div>
                            <div className="text-[3px] text-gray-400">Link</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t border-gray-100 pt-1 flex justify-between">
                <div className="text-[3px] text-gray-400">© Company</div>
                <div className="text-[3px] text-gray-400">Privacy · Terms</div>
            </div>
        </div>
    )
}

/** Footer 5 Thumbnail: Columns with newsletter */
function Footer5Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-t border-gray-200 p-1.5 flex flex-col justify-between">
            <div className="grid grid-cols-4 gap-1">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="space-y-0.5">
                        <div className="text-[3px] font-semibold text-gray-800">Col {i}</div>
                        <div className="text-[3px] text-gray-400">Link</div>
                        <div className="text-[3px] text-gray-400">Link</div>
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-100 pt-1 space-y-0.5">
                <div className="flex gap-0.5 items-center">
                    <div className="text-[3px] text-gray-600">Subscribe</div>
                    <div className="w-10 h-2 bg-gray-100 border border-gray-200" />
                    <div className="bg-gray-800 text-white text-[3px] px-1 py-0.5">Go</div>
                </div>
            </div>
        </div>
    )
}

/** Footer 6 Thumbnail: Big footer with newsletter */
function Footer6Thumbnail() {
    return (
        <div className="w-full h-full bg-white border-t border-gray-200 p-1.5 flex flex-col justify-between">
            <div className="flex gap-2">
                <div className="w-1/3 space-y-0.5">
                    <div className="font-bold text-[6px] text-gray-900">Logo</div>
                    <div className="text-[3px] text-gray-400 leading-tight">Company desc</div>
                </div>
                <div className="flex-1 grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-0.5">
                            <div className="text-[3px] font-semibold text-gray-800">Col</div>
                            <div className="text-[3px] text-gray-400">Link</div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="border-t border-gray-100 pt-1 space-y-0.5">
                <div className="flex gap-0.5 items-center">
                    <div className="text-[3px] text-gray-500">Newsletter</div>
                    <div className="w-10 h-2 bg-gray-100 border border-gray-200" />
                    <div className="bg-gray-800 text-white text-[3px] px-1 py-0.5">Go</div>
                </div>
                <div className="text-[3px] text-gray-400">© Company · Privacy · Terms</div>
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** Footer 1 — 4-column with social */
export const Footer1Preset: DesignPreset = {
    id: 'footer-columns-4',
    familyId: 'footer-columns',
    name: 'Footer 1',
    description: '4-column footer with social icons',
    controls: {
        columns: '4',
        showNewsletter: false,
        showSocial: true,
    },
    Thumbnail: Footer1Thumbnail,
}

/** Footer 2 — Simple single row */
export const Footer2Preset: DesignPreset = {
    id: 'footer-simple-default',
    familyId: 'footer-simple',
    name: 'Footer 2',
    description: 'Minimal single-row footer',
    controls: {
        showSocial: true,
        showLegal: true,
    },
    Thumbnail: Footer2Thumbnail,
}

/** Footer 3 — CTA + columns */
export const Footer3Preset: DesignPreset = {
    id: 'footer-cta-default',
    familyId: 'footer-cta',
    name: 'Footer 3',
    description: 'Newsletter CTA above columns',
    controls: {
        columns: '4',
        showSocial: true,
    },
    Thumbnail: Footer3Thumbnail,
}

/** Footer 4 — Big footer with logo & columns */
export const Footer4Preset: DesignPreset = {
    id: 'footer-big-default',
    familyId: 'footer-big',
    name: 'Footer 4',
    description: 'Big footer with logo & columns',
    controls: {
        columns: '3',
        showNewsletter: false,
        showSocial: true,
    },
    Thumbnail: Footer4Thumbnail,
}

/** Footer 5 — Columns with newsletter */
export const Footer5Preset: DesignPreset = {
    id: 'footer-columns-newsletter',
    familyId: 'footer-columns',
    name: 'Footer 5',
    description: '4-column footer with newsletter',
    controls: {
        columns: '4',
        showNewsletter: true,
        showSocial: true,
    },
    Thumbnail: Footer5Thumbnail,
}

/** Footer 6 — Big footer with newsletter */
export const Footer6Preset: DesignPreset = {
    id: 'footer-big-newsletter',
    familyId: 'footer-big',
    name: 'Footer 6',
    description: 'Big footer with newsletter',
    controls: {
        columns: '4',
        showNewsletter: true,
        showSocial: true,
    },
    Thumbnail: Footer6Thumbnail,
}

/** All footer presets for registry */
export const footerPresets: DesignPreset[] = [
    Footer1Preset,
    Footer2Preset,
    Footer3Preset,
    Footer4Preset,
    Footer5Preset,
    Footer6Preset,
]
