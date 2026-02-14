'use client'

/**
 * Auth Modal Family — Auth form presented as a modal dialog overlay.
 *
 * Figma ref: Auth Modal (node 4174:124770)
 * Gray overlay background + centered card with form + close X button.
 *
 * Controls:
 *  - formType: login | signup
 *  - showSocial: boolean
 *  - showClose: boolean
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

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const formType = (controls?.formType as string) ?? 'signup'
    const showSocial = controls?.showSocial !== false
    const showClose = controls?.showClose !== false
    const isLogin = formType === 'login'

    const heading = isLogin ? 'Log In' : 'Sign Up'
    const subtitle = isLogin
        ? 'Welcome back. Please enter your details.'
        : 'Lorem ipsum dolor sit amet adipiscing elit.'
    const buttonText = isLogin ? 'Log in' : 'Sign up'
    const switchText = isLogin ? "Don't have an account?" : 'Already have an account?'
    const switchLink = isLogin ? 'Sign Up' : 'Log In'

    return (
        <section className="relative flex items-center justify-center py-16 px-4 min-h-[560px] bg-gray-800/40">
            {/* Modal card */}
            <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-8">
                {/* Close button */}
                {showClose && (
                    <button className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}

                {/* Heading */}
                <EditableText
                    value={(content?.heading as string) || heading}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className="text-2xl font-semibold text-gray-900 mb-2 text-center"
                    editable={editable}
                />
                <EditableText
                    value={(content?.subtitle as string) || subtitle}
                    onChange={(v) => onContentChange?.('subtitle', v)}
                    as="p"
                    className="text-sm text-gray-500 mb-8 text-center"
                    editable={editable}
                />

                {/* Form fields */}
                <div className="space-y-5">
                    {!isLogin && <InputField label="Name*" />}
                    <InputField label="Email*" />
                    <InputField label="Password*" />
                </div>

                {/* Submit button */}
                <div className="mt-8">
                    <div className="w-full h-11 bg-gray-700 rounded flex items-center justify-center text-white text-sm font-medium">
                        {buttonText}
                    </div>
                </div>

                {/* Social login */}
                {showSocial && (
                    <div className="flex items-center justify-center mt-5">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-600">
                            G
                        </div>
                    </div>
                )}

                {/* Switch link */}
                <p className="text-sm text-gray-500 mt-5 text-center">
                    {switchText}{' '}
                    <span className="text-gray-900 underline">{switchLink}</span>
                </p>
            </div>
        </section>
    )
}

export const AuthModalFamily: TemplateFamily = {
    id: 'auth-modal',
    category: 'auth',
    name: 'Auth Modal',
    description: 'Authentication form presented as a modal dialog overlay',
    tags: ['auth', 'modal', 'dialog', 'popup', 'overlay'],
    Canvas,
    hasForm: true,
    controlsDef: [
        {
            key: 'formType',
            label: 'Form Type',
            type: 'toggle-group',
            options: [
                { value: 'signup', label: 'Sign Up' },
                { value: 'login', label: 'Log In' },
            ],
            defaultValue: 'signup',
        },
        {
            key: 'showSocial',
            label: 'Social Login',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showClose',
            label: 'Close Button',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        formType: 'signup',
        showSocial: true,
        showClose: true,
    },
    defaultContent: {
        heading: 'Sign Up',
        subtitle: 'Lorem ipsum dolor sit amet adipiscing elit.',
    },
}
