'use client'

/**
 * Empty State presets — frozen snapshots for Default and Onboarding empty states.
 */

import type { DesignPreset } from '../types'

/* ── Thumbnail helpers ── */

function EmptyDefaultThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-200 rounded" />
            </div>
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="h-1 w-12 bg-gray-200 rounded-sm" />
            <div className="h-2 w-8 bg-gray-700 rounded mt-0.5" />
        </div>
    )
}

function EmptyDualCTAThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col items-center justify-center gap-1">
            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                <div className="w-3 h-3 bg-gray-200 rounded" />
            </div>
            <div className="h-1.5 w-8 bg-gray-800 rounded-sm" />
            <div className="h-1 w-12 bg-gray-200 rounded-sm" />
            <div className="flex gap-0.5 mt-0.5">
                <div className="h-2 w-6 bg-gray-700 rounded" />
                <div className="h-2 w-6 border border-gray-200 rounded" />
            </div>
        </div>
    )
}

function OnboardingChecklistThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gray-800 rounded-full" />
            </div>
            <div className="space-y-1 mt-0.5">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-gray-800 rounded-full" />
                    <div className="h-1 w-10 bg-gray-300 rounded-sm" />
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 border border-gray-200 rounded-full" />
                    <div className="h-1 w-10 bg-gray-200 rounded-sm" />
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 border border-gray-200 rounded-full" />
                    <div className="h-1 w-10 bg-gray-200 rounded-sm" />
                </div>
            </div>
        </div>
    )
}

function OnboardingCardsThumb() {
    return (
        <div className="w-full h-full bg-white rounded p-2 flex flex-col gap-1">
            <div className="h-1.5 w-10 bg-gray-800 rounded-sm" />
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-1/4 bg-gray-800 rounded-full" />
            </div>
            <div className="space-y-0.5 mt-0.5">
                <div className="bg-gray-50 rounded p-1 flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-gray-800 rounded text-[3px] text-white flex items-center justify-center">✓</div>
                    <div className="h-1 w-8 bg-gray-300 rounded-sm" />
                </div>
                <div className="border border-gray-100 rounded p-1 flex items-center gap-1">
                    <div className="w-2.5 h-2.5 bg-gray-100 rounded text-[3px] text-gray-400 flex items-center justify-center">2</div>
                    <div className="h-1 w-8 bg-gray-200 rounded-sm" />
                </div>
            </div>
        </div>
    )
}

/* ── Presets ── */

export const emptyStatePresets: DesignPreset[] = [
    /* ── Default Empty States ── */
    {
        id: 'empty-state-1',
        familyId: 'empty-state-default',
        name: 'Empty 1',
        description: 'Icon + message + single CTA',
        controls: { showIcon: true, showCTA: true, ctaCount: '1' },
        Thumbnail: EmptyDefaultThumb,
    },
    {
        id: 'empty-state-2',
        familyId: 'empty-state-default',
        name: 'Empty 2',
        description: 'Icon + message + dual CTA',
        controls: { showIcon: true, showCTA: true, ctaCount: '2' },
        Thumbnail: EmptyDualCTAThumb,
    },
    {
        id: 'empty-state-3',
        familyId: 'empty-state-default',
        name: 'Empty 3',
        description: 'Message only, no icon or CTA',
        controls: { showIcon: false, showCTA: false, ctaCount: '1' },
        Thumbnail: EmptyDefaultThumb,
    },
    {
        id: 'empty-state-4',
        familyId: 'empty-state-default',
        name: 'Empty 4',
        description: 'Icon + message, no CTA',
        controls: { showIcon: true, showCTA: false, ctaCount: '1' },
        Thumbnail: EmptyDefaultThumb,
    },

    /* ── Onboarding Empty States ── */
    {
        id: 'empty-state-5',
        familyId: 'empty-state-onboarding',
        name: 'Empty 5',
        description: 'Onboarding checklist with 3 steps',
        controls: { style: 'checklist', stepCount: '3', showProgress: true },
        Thumbnail: OnboardingChecklistThumb,
    },
    {
        id: 'empty-state-6',
        familyId: 'empty-state-onboarding',
        name: 'Empty 6',
        description: 'Onboarding cards with 4 steps',
        controls: { style: 'cards', stepCount: '4', showProgress: true },
        Thumbnail: OnboardingCardsThumb,
    },
    {
        id: 'empty-state-7',
        familyId: 'empty-state-onboarding',
        name: 'Empty 7',
        description: 'Onboarding checklist, 5 steps, no progress bar',
        controls: { style: 'checklist', stepCount: '5', showProgress: false },
        Thumbnail: OnboardingChecklistThumb,
    },
]
