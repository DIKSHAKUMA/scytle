'use client'

/**
 * Contact Presets — Named snapshots of Contact family control values.
 */

import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Contact 1 Thumbnail: Split with form right */
function Contact1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            <div className="flex-1 flex flex-col justify-center space-y-0.5">
                <div className="text-[7px] font-semibold text-gray-800">Get in touch</div>
                <div className="text-[3.5px] text-gray-400">We&apos;d love to hear from you</div>
                <div className="space-y-0.5 mt-1">
                    <div className="flex items-center gap-0.5">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded" />
                        <div className="text-[3px] text-gray-500">hello@example.com</div>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded" />
                        <div className="text-[3px] text-gray-500">+1 (555) 000</div>
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded p-1 space-y-0.5">
                <div className="grid grid-cols-2 gap-0.5">
                    <div className="h-2 bg-white border border-gray-200 rounded" />
                    <div className="h-2 bg-white border border-gray-200 rounded" />
                </div>
                <div className="h-2 bg-white border border-gray-200 rounded" />
                <div className="h-4 bg-white border border-gray-200 rounded" />
                <div className="bg-gray-800 text-white text-[3px] text-center py-0.5">Send</div>
            </div>
        </div>
    )
}

/** Contact 2 Thumbnail: Split with form left */
function Contact2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            <div className="flex-1 bg-gray-50 border border-gray-200 rounded p-1 space-y-0.5">
                <div className="grid grid-cols-2 gap-0.5">
                    <div className="h-2 bg-white border border-gray-200 rounded" />
                    <div className="h-2 bg-white border border-gray-200 rounded" />
                </div>
                <div className="h-2 bg-white border border-gray-200 rounded" />
                <div className="h-4 bg-white border border-gray-200 rounded" />
                <div className="bg-gray-800 text-white text-[3px] text-center py-0.5">Send</div>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-0.5">
                <div className="text-[7px] font-semibold text-gray-800">Get in touch</div>
                <div className="text-[3.5px] text-gray-400">We&apos;d love to hear from you</div>
                <div className="space-y-0.5 mt-1">
                    <div className="flex items-center gap-0.5">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded" />
                        <div className="text-[3px] text-gray-500">hello@example.com</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

/** Contact 3 Thumbnail: Simple centered form */
function Contact3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Contact us</div>
                <div className="text-[3.5px] text-gray-400">Fill out the form below</div>
            </div>
            <div className="w-[80%] space-y-0.5">
                <div className="grid grid-cols-2 gap-0.5">
                    <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                    <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                </div>
                <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                <div className="h-4 bg-gray-50 border border-gray-200 rounded" />
                <div className="bg-gray-800 text-white text-[3px] text-center py-0.5">Send</div>
            </div>
        </div>
    )
}

/** Contact 4 Thumbnail: Simple without subject */
function Contact4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center">
            <div className="text-center mb-1.5">
                <div className="text-[7px] font-semibold text-gray-800">Contact us</div>
            </div>
            <div className="w-[80%] space-y-0.5">
                <div className="grid grid-cols-2 gap-0.5">
                    <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                    <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                </div>
                <div className="h-2 bg-gray-50 border border-gray-200 rounded" />
                <div className="h-5 bg-gray-50 border border-gray-200 rounded" />
                <div className="bg-gray-800 text-white text-[3px] text-center py-0.5">Send</div>
            </div>
        </div>
    )
}

/** Contact 5 Thumbnail: Map + form */
function Contact5Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1 flex flex-col">
            <div className="w-full aspect-[16/5] bg-gray-100 border border-gray-200 flex items-center justify-center mb-1">
                <div className="w-3 h-3 bg-gray-300 rounded-full" />
            </div>
            <div className="flex gap-1.5 flex-1 px-1">
                <div className="flex-1 space-y-0.5">
                    <div className="text-[5px] font-semibold text-gray-800">Visit us</div>
                    <div className="text-[3px] text-gray-500">123 Main St</div>
                    <div className="text-[3px] text-gray-500">hello@example.com</div>
                </div>
                <div className="flex-1 space-y-0.5">
                    <div className="h-1.5 bg-gray-50 border border-gray-200 rounded" />
                    <div className="h-1.5 bg-gray-50 border border-gray-200 rounded" />
                    <div className="h-3 bg-gray-50 border border-gray-200 rounded" />
                    <div className="bg-gray-800 text-white text-[2.5px] text-center py-0.5">Send</div>
                </div>
            </div>
        </div>
    )
}

/** Contact 6 Thumbnail: Info cards grid */
function Contact6Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Contact us</div>
                <div className="text-[3px] text-gray-400">Reach out through any channel</div>
            </div>
            <div className="grid grid-cols-3 gap-1 w-full">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="border border-gray-200 rounded p-1 text-center">
                        <div className="w-3 h-3 bg-gray-100 rounded-full mx-auto mb-0.5" />
                        <div className="text-[3.5px] font-medium text-gray-700">
                            {['Email', 'Phone', 'Address'][i]}
                        </div>
                        <div className="text-[2.5px] text-gray-400">info here</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Contact 7 Thumbnail: Info split with image */
function Contact7Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex gap-2">
            <div className="flex-1 flex flex-col justify-center space-y-0.5">
                <div className="text-[6px] font-semibold text-gray-800">Contact us</div>
                <div className="text-[3px] text-gray-400">Reach out anytime</div>
                <div className="space-y-0.5 mt-1">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-0.5">
                            <div className="w-2 h-2 bg-gray-100 rounded" />
                            <div className="text-[2.5px] text-gray-500">
                                {['Email', 'Phone', 'Address'][i]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-gray-100 rounded flex items-center justify-center">
                <div className="w-6 h-6 text-gray-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

/** Contact 8 Thumbnail: Info list minimal */
function Contact8Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col items-center">
            <div className="text-center mb-1.5">
                <div className="text-[6px] font-semibold text-gray-800">Get in touch</div>
            </div>
            <div className="w-[70%] space-y-1">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-1 border-b border-gray-100 pb-0.5">
                        <div className="w-2.5 h-2.5 bg-gray-100 rounded" />
                        <div>
                            <div className="text-[3.5px] font-medium text-gray-700">
                                {['Email', 'Phone', 'Address'][i]}
                            </div>
                            <div className="text-[2.5px] text-gray-400">contact info</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Contact 9 Thumbnail: Locations grid with images */
function Contact9Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Our offices</div>
                <div className="text-[3px] text-gray-400">Visit us worldwide</div>
            </div>
            <div className="grid grid-cols-3 gap-1 flex-1">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden">
                        <div className="aspect-[16/9] bg-gray-100" />
                        <div className="p-0.5">
                            <div className="text-[3.5px] font-medium text-gray-700">
                                {['New York', 'London', 'Tokyo'][i]}
                            </div>
                            <div className="text-[2.5px] text-gray-400">123 Main St</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Contact 10 Thumbnail: Locations 2-col no images */
function Contact10Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Locations</div>
            </div>
            <div className="grid grid-cols-2 gap-1 flex-1">
                {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="border border-gray-200 rounded p-1">
                        <div className="text-[3.5px] font-medium text-gray-700">
                            {['New York', 'London', 'Tokyo', 'Sydney'][i]}
                        </div>
                        <div className="text-[2.5px] text-gray-400 mt-0.5">123 Main St</div>
                        <div className="text-[2.5px] text-gray-400">+1 555-0100</div>
                        <div className="text-[2.5px] text-gray-600 mt-0.5 underline">Directions →</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ===== PRESETS =====

/** Contact 1 — Split form right */
export const Contact1Preset: DesignPreset = {
    id: 'contact-split-default',
    familyId: 'contact-split',
    name: 'Contact 1',
    description: 'Form + contact info side by side',
    controls: {
        formPlacement: 'right',
        showPhone: true,
        showAddress: true,
    },
    Thumbnail: Contact1Thumbnail,
}

/** Contact 2 — Split form left */
export const Contact2Preset: DesignPreset = {
    id: 'contact-split-reversed',
    familyId: 'contact-split',
    name: 'Contact 2',
    description: 'Form on left, info on right',
    controls: {
        formPlacement: 'left',
        showPhone: true,
        showAddress: false,
    },
    Thumbnail: Contact2Thumbnail,
}

/** Contact 3 — Simple centered with subject */
export const Contact3Preset: DesignPreset = {
    id: 'contact-simple-default',
    familyId: 'contact-simple',
    name: 'Contact 3',
    description: 'Centered form with subject field',
    controls: {
        showSubject: true,
        showPhone: false,
    },
    Thumbnail: Contact3Thumbnail,
}

/** Contact 4 — Minimal centered */
export const Contact4Preset: DesignPreset = {
    id: 'contact-simple-minimal',
    familyId: 'contact-simple',
    name: 'Contact 4',
    description: 'Minimal contact form',
    controls: {
        showSubject: false,
        showPhone: false,
    },
    Thumbnail: Contact4Thumbnail,
}

/** Contact 5 — Map with form */
export const Contact5Preset: DesignPreset = {
    id: 'contact-map-default',
    familyId: 'contact-map',
    name: 'Contact 5',
    description: 'Map + contact form layout',
    controls: {
        mapPlacement: 'top',
        showForm: true,
    },
    Thumbnail: Contact5Thumbnail,
}

/** Contact 6 — Info cards grid */
export const Contact6Preset: DesignPreset = {
    id: 'contact-info-grid',
    familyId: 'contact-info',
    name: 'Contact 6',
    description: 'Info cards in centered grid',
    controls: {
        layout: 'grid',
        itemLayout: 'cards',
        itemCount: '3',
        showImage: false,
    },
    Thumbnail: Contact6Thumbnail,
}

/** Contact 7 — Info split with image */
export const Contact7Preset: DesignPreset = {
    id: 'contact-info-split',
    familyId: 'contact-info',
    name: 'Contact 7',
    description: 'Contact info with side image',
    controls: {
        layout: 'split',
        itemLayout: 'list',
        itemCount: '3',
        showImage: true,
    },
    Thumbnail: Contact7Thumbnail,
}

/** Contact 8 — Info list minimal */
export const Contact8Preset: DesignPreset = {
    id: 'contact-info-list',
    familyId: 'contact-info',
    name: 'Contact 8',
    description: 'Minimal contact info list',
    controls: {
        layout: 'grid',
        itemLayout: 'list',
        itemCount: '3',
        showImage: false,
    },
    Thumbnail: Contact8Thumbnail,
}

/** Contact 9 — Locations grid with images */
export const Contact9Preset: DesignPreset = {
    id: 'contact-locations-images',
    familyId: 'contact-locations',
    name: 'Contact 9',
    description: 'Office locations with photos',
    controls: {
        columns: '3',
        itemCount: '3',
        titleAlign: 'center',
        showImage: true,
    },
    Thumbnail: Contact9Thumbnail,
}

/** Contact 10 — Locations 2-col no images */
export const Contact10Preset: DesignPreset = {
    id: 'contact-locations-simple',
    familyId: 'contact-locations',
    name: 'Contact 10',
    description: 'Office locations without images',
    controls: {
        columns: '2',
        itemCount: '4',
        titleAlign: 'center',
        showImage: false,
    },
    Thumbnail: Contact10Thumbnail,
}

/** All Contact presets for registry */
export const contactPresets: DesignPreset[] = [
    Contact1Preset,
    Contact2Preset,
    Contact3Preset,
    Contact4Preset,
    Contact5Preset,
    Contact6Preset,
    Contact7Preset,
    Contact8Preset,
    Contact9Preset,
    Contact10Preset,
]
