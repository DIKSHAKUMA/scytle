'use client'

/**
 * App Form presets — frozen snapshots for Profile, Payment, Preferences, and Description List families.
 *
 * Form 1–4:  Profile variants
 * Form 5–7:  Payment variants
 * Form 8–10: Preferences variants
 * Form 11–14: Description List variants
 */

import type { DesignPreset } from '../types'

/* ── Thumbnail helpers ── */

function ProfileFormThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="h-1 w-14 bg-gray-200 rounded-sm" />
            <div className="w-4 h-4 bg-gray-100 rounded-full mt-0.5" />
            <div className="space-y-1 mt-0.5">
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-200" />
            </div>
            <div className="h-3 w-full bg-gray-50 rounded mt-0.5" />
            <div className="flex justify-end mt-auto pt-0.5 border-t border-gray-100">
                <div className="h-1.5 w-5 bg-gray-700 rounded" />
            </div>
        </div>
    )
}

function PaymentFormThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
            <div className="h-1 w-14 bg-gray-200 rounded-sm" />
            <div className="space-y-1 mt-0.5">
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="flex gap-1">
                    <div className="h-0.5 w-1/2 bg-gray-200" />
                    <div className="h-0.5 w-1/2 bg-gray-200" />
                </div>
                <div className="h-0.5 w-full bg-gray-200" />
            </div>
            <div className="space-y-0.5 mt-1">
                <div className="flex items-center gap-1">
                    <div className="h-1 w-8 bg-gray-200 rounded-sm" />
                    <div className="w-1.5 h-1.5 rounded-full border border-gray-800 ml-auto" />
                </div>
                <div className="flex items-center gap-1">
                    <div className="h-1 w-8 bg-gray-200 rounded-sm" />
                    <div className="w-1.5 h-1.5 rounded-full border border-gray-200 ml-auto" />
                </div>
            </div>
            <div className="flex justify-end mt-auto pt-0.5 border-t border-gray-100">
                <div className="h-1.5 w-5 bg-gray-700 rounded" />
            </div>
        </div>
    )
}

function PreferencesFormThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
            <div className="h-1 w-14 bg-gray-200 rounded-sm" />
            <div className="space-y-1 mt-1">
                <div className="flex items-center justify-between">
                    <div className="h-1 w-8 bg-gray-200 rounded-sm" />
                    <div className="w-4 h-2 bg-gray-800 rounded-full" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="h-1 w-8 bg-gray-200 rounded-sm" />
                    <div className="w-4 h-2 bg-gray-200 rounded-full" />
                </div>
            </div>
            <div className="space-y-0.5 mt-1">
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-gray-800 rounded-sm" />
                    <div className="h-1 w-6 bg-gray-200 rounded-sm" />
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 border border-gray-200 rounded-sm" />
                    <div className="h-1 w-6 bg-gray-200 rounded-sm" />
                </div>
            </div>
            <div className="flex justify-end mt-auto pt-0.5 border-t border-gray-100">
                <div className="h-1.5 w-5 bg-gray-700 rounded" />
            </div>
        </div>
    )
}

function DescListInlineThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="h-1 w-14 bg-gray-200 rounded-sm" />
            <div className="space-y-1 mt-1 divide-y divide-gray-100">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between gap-1 pt-1">
                        <div className="h-1 w-5 bg-gray-300 rounded-sm" />
                        <div className="h-1 w-7 bg-gray-200 rounded-sm" />
                        <div className="h-1 w-4 bg-gray-400 rounded-sm underline" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function DescListStackedThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="h-1 w-14 bg-gray-200 rounded-sm" />
            <div className="space-y-1.5 mt-1">
                {[0, 1].map((i) => (
                    <div key={i} className="space-y-0.5">
                        <div className="h-0.5 w-4 bg-gray-300 rounded-sm" />
                        <div className="h-1 w-8 bg-gray-200 rounded-sm" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function DescListStripedThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-0">
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm mb-1" />
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className={`flex items-center justify-between gap-1 px-1 py-0.5 ${i % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <div className="h-0.5 w-4 bg-gray-300 rounded-sm" />
                    <div className="h-0.5 w-6 bg-gray-200 rounded-sm" />
                </div>
            ))}
        </div>
    )
}

/* ── Presets ── */

export const appFormPresets: DesignPreset[] = [
    /* ── Profile Form (Form 1–4) ── */
    {
        id: 'form-profile-1',
        familyId: 'form-profile',
        name: 'Form 1',
        description: 'Full profile form with photo, bio, and password',
        controls: { showPhoto: true, showAbout: true, showPassword: true, showLanguage: true },
        Thumbnail: ProfileFormThumb,
    },
    {
        id: 'form-profile-2',
        familyId: 'form-profile',
        name: 'Form 2',
        description: 'Profile form without photo upload',
        controls: { showPhoto: false, showAbout: true, showPassword: true, showLanguage: true },
        Thumbnail: ProfileFormThumb,
    },
    {
        id: 'form-profile-3',
        familyId: 'form-profile',
        name: 'Form 3',
        description: 'Minimal profile without bio or password',
        controls: { showPhoto: true, showAbout: false, showPassword: false, showLanguage: true },
        Thumbnail: ProfileFormThumb,
    },
    {
        id: 'form-profile-4',
        familyId: 'form-profile',
        name: 'Form 4',
        description: 'Basic profile — name, email, website only',
        controls: { showPhoto: false, showAbout: false, showPassword: false, showLanguage: false },
        Thumbnail: ProfileFormThumb,
    },

    /* ── Payment Form (Form 5–7) ── */
    {
        id: 'form-payment-1',
        familyId: 'form-payment',
        name: 'Form 5',
        description: 'Full payment form with address and plan selection',
        controls: { showAddress: true, showPlan: true, planCount: '3' },
        Thumbnail: PaymentFormThumb,
    },
    {
        id: 'form-payment-2',
        familyId: 'form-payment',
        name: 'Form 6',
        description: 'Payment form without address',
        controls: { showAddress: false, showPlan: true, planCount: '3' },
        Thumbnail: PaymentFormThumb,
    },
    {
        id: 'form-payment-3',
        familyId: 'form-payment',
        name: 'Form 7',
        description: 'Card-only payment form',
        controls: { showAddress: true, showPlan: false, planCount: '3' },
        Thumbnail: PaymentFormThumb,
    },

    /* ── Preferences Form (Form 8–10) ── */
    {
        id: 'form-preferences-1',
        familyId: 'form-preferences',
        name: 'Form 8',
        description: 'Full preferences: toggles, checkboxes, and radios',
        controls: { showToggles: true, showCheckboxes: true, showRadios: true },
        Thumbnail: PreferencesFormThumb,
    },
    {
        id: 'form-preferences-2',
        familyId: 'form-preferences',
        name: 'Form 9',
        description: 'Toggles and checkboxes only',
        controls: { showToggles: true, showCheckboxes: true, showRadios: false },
        Thumbnail: PreferencesFormThumb,
    },
    {
        id: 'form-preferences-3',
        familyId: 'form-preferences',
        name: 'Form 10',
        description: 'Toggles only (simple preferences)',
        controls: { showToggles: true, showCheckboxes: false, showRadios: false },
        Thumbnail: PreferencesFormThumb,
    },

    /* ── Description List (Form 11–14) ── */
    {
        id: 'description-list-1',
        familyId: 'description-list',
        name: 'Form 11',
        description: 'Inline description list with change links',
        controls: { layout: 'inline', showActions: true, fieldCount: '6' },
        Thumbnail: DescListInlineThumb,
    },
    {
        id: 'description-list-2',
        familyId: 'description-list',
        name: 'Form 12',
        description: 'Stacked description list',
        controls: { layout: 'stacked', showActions: true, fieldCount: '6' },
        Thumbnail: DescListStackedThumb,
    },
    {
        id: 'description-list-3',
        familyId: 'description-list',
        name: 'Form 13',
        description: 'Striped description list',
        controls: { layout: 'striped', showActions: true, fieldCount: '6' },
        Thumbnail: DescListStripedThumb,
    },
    {
        id: 'description-list-4',
        familyId: 'description-list',
        name: 'Form 14',
        description: 'Inline list without actions',
        controls: { layout: 'inline', showActions: false, fieldCount: '4' },
        Thumbnail: DescListInlineThumb,
    },
]
