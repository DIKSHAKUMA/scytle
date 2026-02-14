'use client'

/**
 * Form Profile Family — Account / profile settings form.
 *
 * Figma ref: Form 1 (node 4174:140349)
 * Layout: "Account" heading + subtitle, Photo upload, Username, Website,
 * Email (with icon), About textarea (with char count), Password section,
 * Language dropdown, Save button. All fields use underline-style inputs.
 *
 * Controls:
 *  - showPhoto: boolean
 *  - showPassword: boolean
 *  - showLanguage: boolean
 *  - showAbout: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function InputField({ label, placeholder, icon }: { label: string; placeholder?: string; icon?: boolean }) {
    return (
        <div className="space-y-2">
            <span className="text-sm text-gray-500">{label}</span>
            <div className="flex items-center gap-2 border-b border-gray-300 h-10">
                {icon && (
                    <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                )}
                {placeholder && (
                    <span className="text-sm text-gray-300">{placeholder}</span>
                )}
            </div>
        </div>
    )
}

function PasswordField({ label }: { label: string }) {
    return (
        <div className="space-y-2">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{label}</span>
                <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-4m0-4h.01" />
                </svg>
            </div>
            <div className="flex items-center border-b border-gray-300 h-10">
                <span className="text-sm text-gray-300 tracking-widest">••••••••</span>
            </div>
        </div>
    )
}

function Canvas({ content, controls, onContentChange, editable }: CanvasProps) {
    const showPhoto = controls?.showPhoto !== false
    const showPassword = controls?.showPassword !== false
    const showLanguage = controls?.showLanguage !== false
    const showAbout = controls?.showAbout !== false

    return (
        <section className="py-8 px-6 max-w-2xl">
            {/* Heading */}
            <EditableText
                value={(content?.heading as string) || 'Account'}
                onChange={(v) => onContentChange?.('heading', v)}
                as="h2"
                className="text-2xl font-semibold text-gray-900 mb-2"
                editable={editable}
            />
            <EditableText
                value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'}
                onChange={(v) => onContentChange?.('subtitle', v)}
                as="p"
                className="text-sm text-gray-500 mb-8"
                editable={editable}
            />

            <div className="space-y-6">
                {/* Photo upload */}
                {showPhoto && (
                    <div className="space-y-2">
                        <span className="text-sm text-gray-500">Photo</span>
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                )}

                {/* Username */}
                <InputField label="Username" />

                {/* Website */}
                <InputField label="Website" placeholder="www.relume.io" />

                {/* Email address */}
                <InputField label="Email address" placeholder="email@example.com" icon />

                {/* About textarea */}
                {showAbout && (
                    <div className="space-y-2">
                        <span className="text-sm text-gray-500">About</span>
                        <div className="border-b border-gray-300 min-h-[100px] py-2">
                            <span className="text-sm text-gray-300">Write a short bio…</span>
                        </div>
                        <p className="text-xs text-gray-400">263 characters left</p>
                    </div>
                )}

                {/* Password section */}
                {showPassword && (
                    <div className="space-y-5 pt-2">
                        <span className="text-sm font-medium text-gray-700">Password</span>
                        <PasswordField label="Current password" />
                        <PasswordField label="New password" />
                    </div>
                )}

                {/* Language dropdown */}
                {showLanguage && (
                    <div className="space-y-2">
                        <span className="text-sm text-gray-500">Language</span>
                        <div className="flex items-center justify-between border-b border-gray-300 h-10">
                            <span className="text-sm text-gray-700">English</span>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                )}
            </div>

            {/* Save button — right-aligned per Figma */}
            <div className="flex justify-end mt-10 pt-6 border-t border-gray-100">
                <div className="h-10 px-6 bg-gray-700 rounded flex items-center justify-center text-white text-sm font-medium">
                    Save
                </div>
            </div>
        </section>
    )
}

export const FormProfileFamily: TemplateFamily = {
    id: 'form-profile',
    category: 'app-form',
    name: 'Profile Form',
    description: 'Account settings form with photo, bio, password, and preferences',
    tags: ['form', 'profile', 'account', 'settings', 'edit'],
    Canvas,
    hasForm: true,
    controlsDef: [
        { key: 'showPhoto', label: 'Photo Upload', type: 'switch', defaultValue: true },
        { key: 'showAbout', label: 'About / Bio', type: 'switch', defaultValue: true },
        { key: 'showPassword', label: 'Password', type: 'switch', defaultValue: true },
        { key: 'showLanguage', label: 'Language', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        showPhoto: true,
        showAbout: true,
        showPassword: true,
        showLanguage: true,
    },
    defaultContent: {
        heading: 'Account',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.',
    },
}
