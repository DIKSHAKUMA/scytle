'use client'

/**
 * Empty State Onboarding Family — First-time user / setup guide empty state.
 *
 * Shows a setup checklist or getting-started wizard when the user
 * has not completed initial setup steps.
 *
 * Controls:
 *  - style: checklist | cards
 *  - stepCount: '3' | '4' | '5'
 *  - showProgress: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const STEPS = [
    { title: 'Create your profile', desc: 'Set up your name, avatar, and bio' },
    { title: 'Connect your accounts', desc: 'Link your social and work accounts' },
    { title: 'Invite your team', desc: 'Add team members to collaborate' },
    { title: 'Set your preferences', desc: 'Choose your notification settings' },
    { title: 'Complete onboarding', desc: 'Review and confirm your setup' },
]

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const style = (controls?.style as string) ?? 'checklist'
    const stepCount = Number(controls?.stepCount ?? 3)
    const showProgress = controls?.showProgress !== false
    const steps = STEPS.slice(0, stepCount)
    const completed = 1 // Always show 1 completed in wireframe

    return (
        <section className="py-8 px-6 max-w-xl mx-auto">
            {/* Heading */}
            <EditableText
                value={(content?.heading as string) || 'Getting Started'}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h3"
                className="text-lg font-semibold text-gray-900 mb-2"
                editable={editable}
            />
            <EditableText
                value={(content?.subtitle as string) || 'Complete these steps to set up your workspace.'}
                onChange={(v) => onContentChange?.('subtitle', v)}
                as="p"
                className="text-sm text-gray-500 mb-6"
                editable={editable}
            />

            {/* Progress bar */}
            {showProgress && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">{completed} of {stepCount} completed</span>
                        <span className="text-xs font-medium text-gray-700">{Math.round((completed / stepCount) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-gray-800 rounded-full" style={{ width: `${(completed / stepCount) * 100}%` }} />
                    </div>
                </div>
            )}

            {/* Steps */}
            {style === 'checklist' ? (
                <div className="space-y-3">
                    {steps.map((step, i) => {
                        const done = i < completed
                        return (
                            <div key={i} className="flex items-start gap-3 py-3">
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? 'bg-gray-800' : 'border-2 border-gray-200'}`}>
                                    {done && (
                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <div className={`text-sm font-medium ${done ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{step.title}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
                                </div>
                                {!done && (
                                    <span className="text-xs text-gray-900 underline shrink-0">Start</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {steps.map((step, i) => {
                        const done = i < completed
                        return (
                            <div key={i} className={`p-4 rounded-lg ${done ? 'bg-gray-50' : 'bg-white border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${done ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        {done ? '✓' : i + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className={`text-sm font-medium ${done ? 'text-gray-400' : 'text-gray-900'}`}>{step.title}</div>
                                        <div className="text-xs text-gray-500 mt-0.5">{step.desc}</div>
                                    </div>
                                    {!done && (
                                        <div className="h-7 px-3 bg-gray-700 rounded flex items-center justify-center text-white text-xs font-medium shrink-0">
                                            Start
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </section>
    )
}

export const EmptyStateOnboardingFamily: TemplateFamily = {
    id: 'empty-state-onboarding',
    category: 'empty-state',
    name: 'Onboarding Checklist',
    description: 'First-time user setup guide with progress and step checklist',
    tags: ['empty', 'onboarding', 'setup', 'checklist', 'getting-started'],
    Canvas,
    controlsDef: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'checklist', label: 'Checklist' },
                { value: 'cards', label: 'Cards' },
            ],
            defaultValue: 'checklist',
        },
        {
            key: 'stepCount',
            label: 'Steps',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
            defaultValue: '3',
        },
        { key: 'showProgress', label: 'Progress Bar', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        style: 'checklist',
        stepCount: '3',
        showProgress: true,
    },
    defaultContent: {
        heading: 'Getting Started',
        subtitle: 'Complete these steps to set up your workspace.',
    },
}
