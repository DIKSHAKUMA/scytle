'use client'

/**
 * Auth presets — frozen snapshots for Sign Up, Log In, Modal, and Onboarding families.
 *
 * Auth 1–9:   Sign Up variants
 * Auth 10–13: Log In variants
 * Auth 14–15: Modal variants
 * Auth 16–17: Onboarding variants
 */

import type { DesignPreset } from '../types'

/* ── Thumbnail helpers ── */

function SignupCenteredThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col items-center justify-center gap-1">
            <div className="h-2 w-10 bg-gray-800 rounded-sm" />
            <div className="h-1 w-14 bg-gray-200 rounded-sm" />
            <div className="w-12 space-y-1 mt-1">
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-200" />
            </div>
            <div className="h-2 w-12 bg-gray-700 rounded mt-1" />
        </div>
    )
}

function SignupCardThumb() {
    return (
        <div className="w-full h-full bg-gray-50 rounded p-2 flex items-center justify-center">
            <div className="border border-gray-200 rounded bg-white p-1.5 w-14 flex flex-col items-center gap-0.5">
                <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
                <div className="h-0.5 w-10 bg-gray-200 rounded-sm" />
                <div className="w-full space-y-0.5 mt-0.5">
                    <div className="h-0.5 w-full bg-gray-200" />
                    <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="h-1.5 w-10 bg-gray-700 rounded mt-0.5" />
            </div>
        </div>
    )
}

function SplitTestimonialThumb() {
    return (
        <div className="w-full h-full bg-white rounded flex overflow-hidden">
            <div className="flex-1 p-1.5 flex flex-col justify-center gap-0.5">
                <div className="h-1.5 w-6 bg-gray-800 rounded-sm" />
                <div className="h-0.5 w-8 bg-gray-200 rounded-sm" />
                <div className="space-y-0.5 mt-0.5">
                    <div className="h-0.5 w-full bg-gray-200" />
                    <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="h-1.5 w-8 bg-gray-700 rounded mt-0.5" />
            </div>
            <div className="flex-1 bg-gray-50 p-1 flex flex-col items-center justify-center gap-0.5">
                <div className="flex gap-0.5">
                    {[0, 1, 2].map((i) => <div key={i} className="w-1 h-1 bg-gray-300 rounded-full" />)}
                </div>
                <div className="h-0.5 w-8 bg-gray-300 rounded-sm" />
                <div className="w-2 h-2 bg-gray-200 rounded-full" />
            </div>
        </div>
    )
}

function SplitImageThumb() {
    return (
        <div className="w-full h-full bg-white rounded flex overflow-hidden">
            <div className="flex-1 p-1.5 flex flex-col justify-center gap-0.5">
                <div className="h-1.5 w-6 bg-gray-800 rounded-sm" />
                <div className="h-0.5 w-8 bg-gray-200 rounded-sm" />
                <div className="space-y-0.5 mt-0.5">
                    <div className="h-0.5 w-full bg-gray-200" />
                    <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="h-1.5 w-8 bg-gray-700 rounded mt-0.5" />
            </div>
            <div className="flex-1 bg-gray-100" />
        </div>
    )
}

function TabbedThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col items-center justify-center gap-1">
            <div className="flex gap-0">
                <div className="h-1.5 w-6 bg-gray-800 rounded-l text-[3px] leading-none" />
                <div className="h-1.5 w-6 bg-gray-100 rounded-r text-[3px] leading-none" />
            </div>
            <div className="w-12 space-y-1 mt-0.5">
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-200" />
            </div>
            <div className="h-2 w-12 bg-gray-700 rounded mt-0.5" />
        </div>
    )
}

function LoginCenteredThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col items-center justify-center gap-1">
            <div className="h-2 w-8 bg-gray-800 rounded-sm" />
            <div className="h-1 w-14 bg-gray-200 rounded-sm" />
            <div className="w-12 space-y-1 mt-1">
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-200" />
            </div>
            <div className="h-2 w-12 bg-gray-700 rounded mt-1" />
            <div className="w-3 h-3 bg-gray-100 rounded-full mt-0.5" />
        </div>
    )
}

function ModalThumb() {
    return (
        <div className="w-full h-full bg-gray-300/40 rounded flex items-center justify-center">
            <div className="bg-white rounded shadow-sm p-1.5 w-14 flex flex-col items-center gap-0.5">
                <div className="self-end w-1.5 h-1.5 bg-gray-200 rounded-sm" />
                <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
                <div className="space-y-0.5 w-full mt-0.5">
                    <div className="h-0.5 w-full bg-gray-200" />
                    <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="h-1.5 w-10 bg-gray-700 rounded mt-0.5" />
            </div>
        </div>
    )
}

function OnboardingBarThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1 w-6 bg-gray-200 rounded" />
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-gray-800 rounded-full" />
            </div>
            <div className="h-0.5 w-8 bg-gray-300 rounded-sm" />
            <div className="h-1.5 w-10 bg-gray-800 rounded-sm mt-0.5" />
            <div className="space-y-0.5 mt-0.5">
                <div className="h-0.5 w-full bg-gray-200" />
                <div className="h-0.5 w-full bg-gray-200" />
            </div>
            <div className="flex justify-between items-center mt-auto pt-1 border-t border-gray-100">
                <div className="h-1 w-4 bg-gray-300 rounded-sm" />
                <div className="h-1.5 w-5 bg-gray-800 rounded" />
            </div>
        </div>
    )
}

function OnboardingSplitThumb() {
    return (
        <div className="w-full h-full bg-white rounded flex overflow-hidden">
            <div className="flex-1 p-1.5 flex flex-col gap-0.5">
                <div className="h-0.5 w-4 bg-gray-200 rounded" />
                <div className="h-0.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-1/3 bg-gray-800 rounded-full" />
                </div>
                <div className="h-1.5 w-6 bg-gray-800 rounded-sm mt-0.5" />
                <div className="space-y-0.5 mt-0.5 flex-1">
                    <div className="h-0.5 w-full bg-gray-200" />
                    <div className="h-0.5 w-full bg-gray-200" />
                </div>
                <div className="flex justify-between items-center pt-0.5 border-t border-gray-100">
                    <div className="h-0.5 w-3 bg-gray-300 rounded-sm" />
                    <div className="h-1 w-4 bg-gray-800 rounded" />
                </div>
            </div>
            <div className="flex-1 bg-gray-50 p-1 flex flex-col items-center justify-center gap-0.5">
                <div className="h-0.5 w-8 bg-gray-300 rounded-sm" />
                <div className="w-2 h-2 bg-gray-200 rounded-full" />
            </div>
        </div>
    )
}

/* ── Presets ── */

export const authPresets: DesignPreset[] = [
    /* ── Sign Up (Auth 1–9) ── */
    {
        id: 'auth-signup-1',
        familyId: 'auth-signup',
        name: 'Auth 1',
        description: 'Centered sign-up, one social icon',
        controls: { layout: 'centered', showSocial: true, socialCount: '1', showTerms: false },
        Thumbnail: SignupCenteredThumb,
    },
    {
        id: 'auth-signup-2',
        familyId: 'auth-signup',
        name: 'Auth 2',
        description: 'Centered sign-up, three social icons',
        controls: { layout: 'centered', showSocial: true, socialCount: '3', showTerms: false },
        Thumbnail: SignupCenteredThumb,
    },
    {
        id: 'auth-signup-3',
        familyId: 'auth-signup',
        name: 'Auth 3',
        description: 'Centered sign-up with terms',
        controls: { layout: 'centered', showSocial: true, socialCount: '1', showTerms: true },
        Thumbnail: SignupCenteredThumb,
    },
    {
        id: 'auth-signup-4',
        familyId: 'auth-signup',
        name: 'Auth 4',
        description: 'Card sign-up form',
        controls: { layout: 'card', showSocial: true, socialCount: '1', showTerms: false },
        Thumbnail: SignupCardThumb,
    },
    {
        id: 'auth-signup-5',
        familyId: 'auth-signup',
        name: 'Auth 5',
        description: 'Split layout with testimonial',
        controls: { layout: 'split-testimonial', showSocial: true, socialCount: '1', showTerms: false },
        Thumbnail: SplitTestimonialThumb,
    },
    {
        id: 'auth-signup-6',
        familyId: 'auth-signup',
        name: 'Auth 6',
        description: 'Split testimonial with terms text',
        controls: { layout: 'split-testimonial', showSocial: true, socialCount: '3', showTerms: true },
        Thumbnail: SplitTestimonialThumb,
    },
    {
        id: 'auth-signup-7',
        familyId: 'auth-signup',
        name: 'Auth 7',
        description: 'Split layout with image',
        controls: { layout: 'split-image', showSocial: true, socialCount: '1', showTerms: false },
        Thumbnail: SplitImageThumb,
    },
    {
        id: 'auth-signup-8',
        familyId: 'auth-signup',
        name: 'Auth 8',
        description: 'Split image with three social icons',
        controls: { layout: 'split-image', showSocial: true, socialCount: '3', showTerms: false },
        Thumbnail: SplitImageThumb,
    },
    {
        id: 'auth-signup-9',
        familyId: 'auth-signup',
        name: 'Auth 9',
        description: 'Tabbed sign up / log in switcher',
        controls: { layout: 'tabbed', showSocial: true, socialCount: '1', showTerms: false },
        Thumbnail: TabbedThumb,
    },

    /* ── Log In (Auth 10–13) ── */
    {
        id: 'auth-login-1',
        familyId: 'auth-login',
        name: 'Auth 10',
        description: 'Centered login with social + forgot password',
        controls: { layout: 'centered', showSocial: true, showRemember: false, showForgot: true },
        Thumbnail: LoginCenteredThumb,
    },
    {
        id: 'auth-login-2',
        familyId: 'auth-login',
        name: 'Auth 11',
        description: 'Card login',
        controls: { layout: 'card', showSocial: true, showRemember: true, showForgot: true },
        Thumbnail: SignupCardThumb,
    },
    {
        id: 'auth-login-3',
        familyId: 'auth-login',
        name: 'Auth 12',
        description: 'Split login with testimonial',
        controls: { layout: 'split-testimonial', showSocial: true, showRemember: false, showForgot: true },
        Thumbnail: SplitTestimonialThumb,
    },
    {
        id: 'auth-login-4',
        familyId: 'auth-login',
        name: 'Auth 13',
        description: 'Split login with image',
        controls: { layout: 'split-image', showSocial: true, showRemember: true, showForgot: true },
        Thumbnail: SplitImageThumb,
    },

    /* ── Modal (Auth 14–15) ── */
    {
        id: 'auth-modal-1',
        familyId: 'auth-modal',
        name: 'Auth 14',
        description: 'Modal sign-up dialog',
        controls: { formType: 'signup', showSocial: true, showClose: true },
        Thumbnail: ModalThumb,
    },
    {
        id: 'auth-modal-2',
        familyId: 'auth-modal',
        name: 'Auth 15',
        description: 'Modal login dialog',
        controls: { formType: 'login', showSocial: true, showClose: true },
        Thumbnail: ModalThumb,
    },

    /* ── Onboarding (Auth 16–17) ── */
    {
        id: 'auth-onboarding-1',
        familyId: 'auth-onboarding',
        name: 'Auth 16',
        description: 'Stacked onboarding with progress bar',
        controls: { layout: 'stacked', stepCount: '4', showProgress: true, progressStyle: 'bar' },
        Thumbnail: OnboardingBarThumb,
    },
    {
        id: 'auth-onboarding-2',
        familyId: 'auth-onboarding',
        name: 'Auth 17',
        description: 'Split onboarding with step indicators',
        controls: { layout: 'split-testimonial', stepCount: '4', showProgress: true, progressStyle: 'steps' },
        Thumbnail: OnboardingSplitThumb,
    },
]
