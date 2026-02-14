'use client'

/**
 * Auth Signup Family — Registration form with multiple layout options.
 *
 * Figma ref: Signup 1–9 (node 4174:123314)
 * Layouts:
 *  - centered: full-page centered form, no card border (Signup 1)
 *  - card: form inside bordered card container (Signup 4)
 *  - split-testimonial: left form + right testimonial carousel (Signup 5)
 *  - split-image: left form + right placeholder image (Signup 7)
 *  - tabbed: centered with Sign Up / Log In tab switcher (Signup 9)
 *
 * Controls:
 *  - layout: centered | card | split-testimonial | split-image | tabbed
 *  - showSocial: boolean
 *  - socialCount: '1' | '3'
 *  - showTerms: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

/* ── Shared sub-components ── */

function InputField({ label }: { label: string }) {
    return (
        <div className="space-y-2">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="h-10 w-full border-b border-gray-300" />
        </div>
    )
}

function SocialIcons({ count }: { count: number }) {
    if (count >= 3) {
        return (
            <div className="flex items-center justify-center gap-3">
                {['G', 'f', '\u{F8FF}'].map((icon, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
                        {icon}
                    </div>
                ))}
            </div>
        )
    }
    return (
        <div className="flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                G
            </div>
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
                &ldquo;Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.&rdquo;
            </p>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                    <div className="text-sm font-medium text-gray-900">Name Surname</div>
                    <div className="text-xs text-gray-500">Position, Company name</div>
                </div>
                <div className="w-px h-8 bg-gray-200 mx-2" />
                <div className="h-5 w-20 bg-gray-200 rounded" />
            </div>
            <div className="flex gap-1.5 mt-4">
                <div className="w-2 h-2 rounded-full bg-gray-400" />
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <div className="w-2 h-2 rounded-full bg-gray-200" />
            </div>
        </div>
    )
}

function ImagePanel() {
    return (
        <div className="flex-1 bg-gray-100 flex items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
            </div>
        </div>
    )
}

/* ── Main Canvas ── */

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const layout = (controls?.layout as string) ?? 'centered'
    const showSocial = controls?.showSocial !== false
    const socialCount = Number(controls?.socialCount ?? 1)
    const showTerms = controls?.showTerms === true

    const isSplit = layout === 'split-testimonial' || layout === 'split-image'
    const isTabbed = layout === 'tabbed'
    const isCard = layout === 'card'

    const formContent = (
        <div className={`flex flex-col ${isCard ? 'p-8' : ''} ${isSplit ? 'px-10 py-12' : 'px-8 py-12'}`}>
            {/* Tab switcher for tabbed layout */}
            {isTabbed && (
                <div className="flex gap-0 mb-8 mx-auto">
                    <div className="px-6 py-2 bg-gray-800 text-white text-sm font-medium rounded-l">
                        Sign Up
                    </div>
                    <div className="px-6 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-r">
                        Log In
                    </div>
                </div>
            )}

            {/* Heading */}
            <EditableText
                value={(content?.heading as string) || 'Sign Up'}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h1"
                className={`font-semibold text-gray-900 mb-3 ${isSplit ? 'text-2xl' : 'text-3xl text-center'}`}
                editable={editable}
            />
            <EditableText
                value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet adipiscing elit.'}
                onChange={(v) => onContentChange?.('subtitle', v)}
                as="p"
                className={`text-sm text-gray-500 mb-8 ${isSplit ? '' : 'text-center'}`}
                editable={editable}
            />

            {/* Form fields — Figma uses underline-style inputs */}
            <div className="space-y-6 w-full max-w-sm mx-auto">
                <InputField label="Name*" />
                <InputField label="Email*" />
                <InputField label="Password*" />
            </div>

            {/* Submit button */}
            <div className="mt-8 max-w-sm mx-auto w-full">
                <div className="w-full h-11 bg-gray-700 rounded flex items-center justify-center text-white text-sm font-medium">
                    Sign up
                </div>
            </div>

            {/* Social login */}
            {showSocial && (
                <div className="mt-6 max-w-sm mx-auto w-full">
                    <SocialIcons count={socialCount} />
                </div>
            )}

            {/* Terms */}
            {showTerms && (
                <p className="text-xs text-gray-400 text-center mt-4 max-w-sm mx-auto">
                    By creating an account, you agree to our Terms &amp; Conditions
                </p>
            )}

            {/* Switch link */}
            <p className={`text-sm text-gray-500 mt-6 ${isSplit ? '' : 'text-center'}`}>
                Already have an account?{' '}
                <span className="text-gray-900 underline">Log In</span>
            </p>
        </div>
    )

    /* ── Layout wrappers ── */

    if (isSplit && !isMobile) {
        return (
            <section className="flex min-h-[560px]">
                <div className="flex-1 flex flex-col justify-center">{formContent}</div>
                {layout === 'split-testimonial' ? <TestimonialPanel /> : <ImagePanel />}
            </section>
        )
    }

    if (isCard) {
        return (
            <section className="flex items-center justify-center py-16 px-4">
                {/* Top-right switch link for non-card centered */}
                <div className="w-full max-w-md border border-gray-200 rounded-lg bg-white">
                    {formContent}
                </div>
            </section>
        )
    }

    // Centered (default) and tabbed
    return (
        <section className="flex flex-col items-center justify-center py-16 px-4 min-h-[560px] relative">
            {/* Top-right link — matches Figma Signup 1 layout */}
            <div className="absolute top-4 right-6 text-sm text-gray-500">
                Already have an account?{' '}
                <span className="text-gray-900 underline">Log In</span>
            </div>
            <div className="w-full max-w-sm">
                {formContent}
            </div>
            {/* Footer */}
            <div className="absolute bottom-4 text-xs text-gray-400">&copy; 2025 Company</div>
        </section>
    )
}

export const AuthSignupFamily: TemplateFamily = {
    id: 'auth-signup',
    category: 'auth',
    name: 'Sign Up',
    description: 'Registration form with centered, card, split, or tabbed layouts',
    tags: ['auth', 'signup', 'register', 'form', 'onboarding'],
    Canvas,
    hasForm: true,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'centered', label: 'Centered' },
                { value: 'card', label: 'Card' },
                { value: 'split-testimonial', label: 'Split+Quote' },
                { value: 'split-image', label: 'Split+Image' },
                { value: 'tabbed', label: 'Tabbed' },
            ],
            defaultValue: 'centered',
        },
        {
            key: 'showSocial',
            label: 'Social Login',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'socialCount',
            label: 'Social Icons',
            type: 'toggle-group',
            options: [
                { value: '1', label: '1' },
                { value: '3', label: '3' },
            ],
            defaultValue: '1',
            showWhen: { key: 'showSocial', value: true },
        },
        {
            key: 'showTerms',
            label: 'Terms Text',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        layout: 'centered',
        showSocial: true,
        socialCount: '1',
        showTerms: false,
    },
    defaultContent: {
        heading: 'Sign Up',
        subtitle: 'Lorem ipsum dolor sit amet adipiscing elit.',
    },
}
