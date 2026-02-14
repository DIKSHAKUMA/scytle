'use client'

/**
 * Page Header Family — Dashboard page-level header with breadcrumb/search/profile.
 *
 * Figma ref: Page Headers 1–5 (node 4174:122818)
 * - Standard: breadcrumb + heading + description + search bar + button
 * - Minimal: breadcrumb + heading + button
 * - Profile: cover image + rounded avatar + breadcrumb + name + email
 *
 * Controls:
 * - style: standard | minimal | profile
 * - showBreadcrumb: boolean
 * - showSearch: boolean
 * - showDescription: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const style = (controls?.style as string) ?? 'standard'
    const showBreadcrumb = controls?.showBreadcrumb !== false
    const showSearch = controls?.showSearch !== false
    const showDescription = controls?.showDescription !== false

    const Breadcrumb = () =>
        showBreadcrumb ? (
            <div className="flex items-center gap-1.5 text-sm text-gray-400 mb-2">
                <span>Home</span>
                <span>/</span>
                <EditableText
                    value={(content?.breadcrumb as string) || 'Dashboard'}
                    onChange={(v) => onContentChange?.('breadcrumb', v)}
                    className="text-gray-900 font-medium"
                    editable={editable}
                />
            </div>
        ) : null

    /* ── Profile variant ─────────────────────────────────────── */
    if (style === 'profile') {
        return (
            <section className="overflow-hidden">
                {/* Cover */}
                <div className="h-32 bg-gray-200 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-100" />
                </div>
                {/* Profile bar */}
                <div className={`${isMobile ? 'px-4' : 'px-6'} pb-5`}>
                    <div className="flex items-end gap-4 -mt-10 relative z-10">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gray-300 border-4 border-white shrink-0" />
                        <div className="flex-1 min-w-0 pt-12">
                            <div className="flex items-start justify-between">
                                <div>
                                    {showBreadcrumb && <Breadcrumb />}
                                    <EditableText
                                        value={(content?.heading as string) || 'Full Name'}
                                        onChange={(v) => onContentChange?.('heading', v)}
                                        as="h1"
                                        className="text-xl font-semibold text-gray-900"
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={(content?.subtitle as string) || 'email@example.com'}
                                        onChange={(v) => onContentChange?.('subtitle', v)}
                                        className="text-sm text-gray-500 mt-0.5"
                                        editable={editable}
                                    />
                                </div>
                                <div className="h-8 px-4 bg-gray-800 text-white text-xs font-medium rounded flex items-center shrink-0">
                                    Button
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    /* ── Standard / Minimal variant ──────────────────────────── */
    return (
        <section className={isMobile ? 'p-4' : 'p-6'}>
            <Breadcrumb />

            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                    <EditableText
                        value={(content?.heading as string) || 'Page Title'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h1"
                        className={`font-semibold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}
                        editable={editable}
                    />
                    {showDescription && style === 'standard' && (
                        <EditableText
                            value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                            onChange={(v) => onContentChange?.('description', v)}
                            as="p"
                            className="text-sm text-gray-500 mt-1 max-w-xl"
                            editable={editable}
                            multiline
                        />
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="h-8 px-4 bg-gray-800 text-white text-xs font-medium rounded flex items-center">
                        Button
                    </div>
                    <div className="w-8 h-8 rounded flex items-center justify-center text-gray-400 text-sm">
                        •••
                    </div>
                </div>
            </div>

            {showSearch && style === 'standard' && (
                <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 flex items-center text-sm text-gray-400">
                        Search…
                    </div>
                </div>
            )}
        </section>
    )
}

export const PageHeaderFamily: TemplateFamily = {
    id: 'page-header',
    category: 'dashboard',
    name: 'Page Header',
    description: 'Top-of-page breadcrumb, title, search and profile headers',
    tags: ['dashboard', 'header', 'breadcrumb', 'page-title', 'profile'],
    Canvas,
    controlsDef: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'standard', label: 'Standard' },
                { value: 'minimal', label: 'Minimal' },
                { value: 'profile', label: 'Profile' },
            ],
            defaultValue: 'standard',
        },
        {
            key: 'showBreadcrumb',
            label: 'Breadcrumb',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showSearch',
            label: 'Search bar',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showDescription',
            label: 'Description',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        style: 'standard',
        showBreadcrumb: true,
        showSearch: true,
        showDescription: true,
    },
    defaultContent: {
        heading: 'Page Title',
        breadcrumb: 'Dashboard',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        subtitle: 'email@example.com',
    },
}
