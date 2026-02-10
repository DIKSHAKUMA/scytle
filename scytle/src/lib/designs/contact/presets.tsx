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

/** All Contact presets for registry */
export const contactPresets: DesignPreset[] = [
    Contact1Preset,
    Contact2Preset,
    Contact3Preset,
    Contact4Preset,
    Contact5Preset,
]
