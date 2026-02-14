'use client'

/**
 * Auth Onboarding Family — Multi-step onboarding / wizard form.
 *
 * Figma ref: Onboarding 1 (node 4174:125087)
 * Multi-step vertical layout with progress indicator, "Step X/N" label,
 * stacked form steps with Next/Back buttons.
 *
 * Controls:
 *  - layout: stacked | split-testimonial
 *  - stepCount: 3 | 4 | 5
 *  - showProgress: boolean
 *  - progressStyle: bar | steps
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function InputField({ label }: { label: string }) {
    return (
        <div className="space-y-2">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="h-10 w-full border-b border-gray-300" />
        </div>
    )
}

function ProgressBar({ current, total }: { current: number; total: number }) {
    const pct = (current / total) * 100
    return (
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gray-800 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
    )
}

function ProgressSteps({ current, total }: { current: number; total: number }) {
    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: total }, (_, i) => (
                <div key={i} className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${i < current ? 'bg-gray-800 text-white' : i === current ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {i + 1}
                    </div>
                    {i < total - 1 && (
                        <div className={`w-8 h-px ${i < current ? 'bg-gray-800' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

function TestimonialPanel() {
    return (
        <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center px-10 py-12">
            <div className="flex gap-1 mb-6">
                {[0, 1, 2, 3, 4].map((i) => (
                    <span key={i} className="text-gray-400 text-lg">★</span>
                ))}
            </div>
            <p className="text-center text-gray-600 text-lg leading-relaxed mb-8 max-w-sm">
                &ldquo;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.&rdquo;
            </p>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                    <div className="text-sm font-medium text-gray-900">Name Surname</div>
                    <div className="text-xs text-gray-500">Position, Company name</div>
                </div>
            </div>
        </div>
    )
}

/* Each onboarding step content */
const STEP_CONFIG = [
    { title: 'Your name', subtitle: 'Please provide your name.', fields: ['First name', 'Last name'] },
    { title: 'Your contact details', subtitle: 'Share how we can reach you.', fields: ['Phone number', 'Location'] },
    { title: 'Your company', subtitle: 'Tell us about your organization.', fields: ['Company name', 'Role'] },
    { title: 'Your preferences', subtitle: 'Help us customize your experience.', fields: ['Industry', 'Team size'] },
    { title: 'Almost done!', subtitle: 'One last step to complete setup.', fields: ['How did you hear about us?'] },
]

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const layout = (controls?.layout as string) ?? 'stacked'
    const stepCount = Number(controls?.stepCount ?? 4)
    const showProgress = controls?.showProgress !== false
    const progressStyle = (controls?.progressStyle as string) ?? 'bar'
    const isSplit = layout === 'split-testimonial' && !isMobile

    const currentStep = 0 // Always show first step in wireframe
    const steps = STEP_CONFIG.slice(0, stepCount)
    const step = steps[currentStep]

    const formContent = (
        <div className={`flex flex-col ${isSplit ? 'px-10 py-12 flex-1' : 'px-8 py-12 w-full max-w-lg mx-auto'}`}>
            {/* Logo placeholder */}
            <div className="mb-8">
                <div className="h-6 w-24 bg-gray-200 rounded" />
            </div>

            {/* Progress indicator */}
            {showProgress && (
                <div className="mb-6">
                    {progressStyle === 'bar' ? (
                        <ProgressBar current={currentStep + 1} total={stepCount} />
                    ) : (
                        <ProgressSteps current={currentStep} total={stepCount} />
                    )}
                </div>
            )}

            {/* Step label */}
            <p className="text-sm text-gray-400 mb-2">Step {currentStep + 1} of {stepCount}</p>

            {/* Step heading */}
            <EditableText
                value={(content?.heading as string) || step.title}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h2"
                className="text-2xl font-semibold text-gray-900 mb-2"
                editable={editable}
            />
            <EditableText
                value={(content?.subtitle as string) || step.subtitle}
                onChange={(v) => onContentChange?.('subtitle', v)}
                as="p"
                className="text-sm text-gray-500 mb-8"
                editable={editable}
            />

            {/* Form fields for current step */}
            <div className="space-y-5 flex-1">
                {step.fields.map((field) => (
                    <InputField key={field} label={field} />
                ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
                <span className="text-sm text-gray-400">Back</span>
                <div className="h-10 px-6 bg-gray-800 rounded flex items-center justify-center text-white text-sm font-medium">
                    Next
                </div>
            </div>
        </div>
    )

    if (isSplit) {
        return (
            <section className="flex min-h-[560px]">
                {formContent}
                <TestimonialPanel />
            </section>
        )
    }

    return (
        <section className="flex flex-col items-center justify-center min-h-[560px]">
            {formContent}
        </section>
    )
}

export const AuthOnboardingFamily: TemplateFamily = {
    id: 'auth-onboarding',
    category: 'auth',
    name: 'Onboarding',
    description: 'Multi-step onboarding wizard with progress tracking',
    tags: ['auth', 'onboarding', 'wizard', 'steps', 'setup'],
    Canvas,
    hasForm: true,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'stacked', label: 'Stacked' },
                { value: 'split-testimonial', label: 'Split+Quote' },
            ],
            defaultValue: 'stacked',
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
            defaultValue: '4',
        },
        {
            key: 'showProgress',
            label: 'Progress',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'progressStyle',
            label: 'Progress Style',
            type: 'toggle-group',
            options: [
                { value: 'bar', label: 'Bar' },
                { value: 'steps', label: 'Steps' },
            ],
            defaultValue: 'bar',
            showWhen: { key: 'showProgress', value: true },
        },
    ],
    defaultControls: {
        layout: 'stacked',
        stepCount: '4',
        showProgress: true,
        progressStyle: 'bar',
    },
    defaultContent: {
        heading: 'Your name',
        subtitle: 'Please provide your name.',
    },
}
