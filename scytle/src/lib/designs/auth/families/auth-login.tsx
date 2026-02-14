'use client'

/**
 * Auth Login Family — Login form with multiple layout options.
 *
 * Figma ref: Login 1 (node 4174:123891)
 * Layouts:
 *  - centered: full-page centered form (Login 1)
 *  - card: form inside bordered card
 *  - split-testimonial: left form + right testimonial (Login 5)
 *  - split-image: left form + right placeholder image (Login 7)
 *
 * Controls:
 *  - layout: centered | card | split-testimonial | split-image
 *  - showSocial: boolean
 *  - showRemember: boolean
 *  - showForgot: boolean
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
    const showRemember = controls?.showRemember === true
    const showForgot = controls?.showForgot !== false

    const isSplit = layout === 'split-testimonial' || layout === 'split-image'
    const isCard = layout === 'card'

    const formContent = (
        <div className={`flex flex-col ${isCard ? 'p-8' : ''} ${isSplit ? 'px-10 py-12' : 'px-8 py-12'}`}>
            {/* Heading */}
            <EditableText
                value={(content?.heading as string) || 'Log In'}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h1"
                className={`font-semibold text-gray-900 mb-3 ${isSplit ? 'text-2xl' : 'text-3xl text-center'}`}
                editable={editable}
            />
            <EditableText
                value={(content?.subtitle as string) || 'Welcome back. Please enter your details.'}
                onChange={(v) => onContentChange?.('subtitle', v)}
                as="p"
                className={`text-sm text-gray-500 mb-8 ${isSplit ? '' : 'text-center'}`}
                editable={editable}
            />

            {/* Form fields */}
            <div className="space-y-6 w-full max-w-sm mx-auto">
                <InputField label="Email*" />
                <InputField label="Password*" />
            </div>

            {/* Remember + Forgot row */}
            {(showRemember || showForgot) && (
                <div className="flex items-center justify-between mt-4 max-w-sm mx-auto w-full">
                    {showRemember ? (
                        <label className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-4 h-4 border border-gray-300 rounded" />
                            Remember me
                        </label>
                    ) : <span />}
                    {showForgot && (
                        <span className="text-sm text-gray-900 underline">Forgot your password?</span>
                    )}
                </div>
            )}

            {/* Submit button */}
            <div className="mt-8 max-w-sm mx-auto w-full">
                <div className="w-full h-11 bg-gray-700 rounded flex items-center justify-center text-white text-sm font-medium">
                    Log in
                </div>
            </div>

            {/* Social login */}
            {showSocial && (
                <div className="mt-6 max-w-sm mx-auto w-full">
                    <div className="flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                            G
                        </div>
                    </div>
                </div>
            )}

            {/* Switch link */}
            <p className={`text-sm text-gray-500 mt-6 ${isSplit ? '' : 'text-center'}`}>
                Don&apos;t have an account?{' '}
                <span className="text-gray-900 underline">Sign Up</span>
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
                <div className="w-full max-w-md border border-gray-200 rounded-lg bg-white">
                    {formContent}
                </div>
            </section>
        )
    }

    // Centered (default)
    return (
        <section className="flex flex-col items-center justify-center py-16 px-4 min-h-[560px] relative">
            <div className="absolute top-4 right-6 text-sm text-gray-500">
                Don&apos;t have an account?{' '}
                <span className="text-gray-900 underline">Sign Up</span>
            </div>
            <div className="w-full max-w-sm">
                {formContent}
            </div>
            <div className="absolute bottom-4 text-xs text-gray-400">&copy; 2025 Company</div>
        </section>
    )
}

export const AuthLoginFamily: TemplateFamily = {
    id: 'auth-login',
    category: 'auth',
    name: 'Log In',
    description: 'Login form with centered, card, or split layouts',
    tags: ['auth', 'login', 'sign-in', 'form'],
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
            key: 'showRemember',
            label: 'Remember Me',
            type: 'switch',
            defaultValue: false,
        },
        {
            key: 'showForgot',
            label: 'Forgot Password',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        layout: 'centered',
        showSocial: true,
        showRemember: false,
        showForgot: true,
    },
    defaultContent: {
        heading: 'Log In',
        subtitle: 'Welcome back. Please enter your details.',
    },
}
