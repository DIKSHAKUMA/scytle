'use client'

/**
 * Blog Sidebar Family — Blog posts grid with a sidebar (categories/tags/newsletter).
 *
 * Controls:
 * - itemCount: 3 | 4 | 6
 * - sidebarPosition: left | right
 * - showExcerpt: boolean
 * - showNewsletter: boolean
 *
 * Editable content arrays: postTitles, postCategories, postExcerpts, postAuthors, postDates
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const defaultTitles = Array.from({ length: 6 }, () => 'Blog post title heading will go here')
const defaultCategories = Array.from({ length: 6 }, () => 'Category')
const defaultExcerpts = Array.from({ length: 6 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.')
const defaultAuthors = Array.from({ length: 6 }, () => 'Full name')
const defaultDates = Array.from({ length: 6 }, () => '11 Jan 2022')
const defaultSidebarCategories = ['Design', 'Development', 'Marketing', 'Business', 'Technology']

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 4)
    const sidebarPosition = (controls?.sidebarPosition as string) ?? 'right'
    const showExcerpt = controls?.showExcerpt !== false
    const showNewsletter = controls?.showNewsletter !== false

    const postTitles = (content?.postTitles as string[]) ?? defaultTitles
    const postCategories = (content?.postCategories as string[]) ?? defaultCategories
    const postExcerpts = (content?.postExcerpts as string[]) ?? defaultExcerpts
    const postAuthors = (content?.postAuthors as string[]) ?? defaultAuthors
    const postDates = (content?.postDates as string[]) ?? defaultDates
    const sidebarCategories = (content?.sidebarCategories as string[]) ?? defaultSidebarCategories

    const sidebar = (
        <aside className={`${isMobile ? 'w-full' : 'w-72'} space-y-8 flex-shrink-0`}>
            {/* Categories */}
            <div>
                <EditableText
                    value={(content?.sidebarTitle as string) || 'Categories'}
                    onChange={(v) => onContentChange?.('sidebarTitle', v)}
                    as="h3"
                    className="font-semibold text-gray-900 text-sm mb-4"
                    editable={editable}
                />
                <div className="space-y-2">
                    {sidebarCategories.map((cat, i) => (
                        <EditableText
                            key={i}
                            value={cat}
                            onChange={(v) => { const u = [...sidebarCategories]; u[i] = v; onContentChange?.('sidebarCategories', u) }}
                            as="div"
                            className="text-xs text-gray-600 py-1.5 px-3 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer"
                            editable={editable}
                        />
                    ))}
                </div>
            </div>

            {/* Newsletter */}
            {showNewsletter && (
                <div className="border border-gray-200 rounded-lg p-5">
                    <EditableText
                        value={(content?.newsletterHeading as string) || 'Subscribe to newsletter'}
                        onChange={(v) => onContentChange?.('newsletterHeading', v)}
                        as="h4"
                        className="font-semibold text-gray-900 text-sm mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.newsletterDescription as string) || 'Get the latest posts delivered to your inbox.'}
                        onChange={(v) => onContentChange?.('newsletterDescription', v)}
                        as="p"
                        className="text-xs text-gray-500 mb-4"
                        editable={editable}
                    />
                    <div className="flex gap-2">
                        <div className="flex-1 h-9 bg-gray-50 border border-gray-200 rounded px-3 flex items-center">
                            <span className="text-xs text-gray-400">Enter email</span>
                        </div>
                        <EditableText
                            value={(content?.newsletterButton as string) || 'Subscribe'}
                            onChange={(v) => onContentChange?.('newsletterButton', v)}
                            as="span"
                            className="inline-flex items-center bg-gray-900 text-white text-xs px-4 py-2 rounded"
                            editable={editable}
                        />
                    </div>
                </div>
            )}
        </aside>
    )

    const posts = (
        <div className="flex-1">
            <div className="space-y-6">
                {Array.from({ length: itemCount }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                        <div className={`${isMobile ? 'w-24 h-20' : 'w-40 h-28'} bg-gray-100 border border-gray-200 flex items-center justify-center rounded flex-shrink-0`}>
                            <ImageIcon className="w-5 h-5 text-gray-300" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <EditableText
                                    value={postCategories[i] ?? 'Category'}
                                    onChange={(v) => { const u = [...postCategories]; u[i] = v; onContentChange?.('postCategories', u) }}
                                    as="span"
                                    className="text-[10px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full"
                                    editable={editable}
                                />
                                <span className="text-[10px] text-gray-300">•</span>
                                <EditableText
                                    value={postDates[i] ?? '11 Jan 2022'}
                                    onChange={(v) => { const u = [...postDates]; u[i] = v; onContentChange?.('postDates', u) }}
                                    as="span"
                                    className="text-[10px] text-gray-400"
                                    editable={editable}
                                />
                            </div>
                            <EditableText
                                value={postTitles[i] ?? 'Blog post title heading will go here'}
                                onChange={(v) => { const u = [...postTitles]; u[i] = v; onContentChange?.('postTitles', u) }}
                                as="h3"
                                className="font-semibold text-gray-900 text-sm leading-snug"
                                editable={editable}
                            />
                            {showExcerpt && (
                                <EditableText
                                    value={postExcerpts[i] ?? 'Lorem ipsum dolor sit amet.'}
                                    onChange={(v) => { const u = [...postExcerpts]; u[i] = v; onContentChange?.('postExcerpts', u) }}
                                    as="p"
                                    className="text-xs text-gray-500 mt-1 line-clamp-2"
                                    editable={editable}
                                    multiline
                                />
                            )}
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-5 h-5 rounded-full bg-gray-200 flex-shrink-0" />
                                <EditableText
                                    value={postAuthors[i] ?? 'Full name'}
                                    onChange={(v) => { const u = [...postAuthors]; u[i] = v; onContentChange?.('postAuthors', u) }}
                                    as="span"
                                    className="text-[10px] text-gray-500"
                                    editable={editable}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mb-12">
                    <EditableText
                        value={(content?.tagline as string) || 'Blog'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-3"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Short heading goes here'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                        editable={editable}
                    />
                </div>

                {/* Content + Sidebar */}
                <div className={`flex gap-10 ${isMobile ? 'flex-col' : ''} ${sidebarPosition === 'left' && !isMobile ? 'flex-row-reverse' : ''}`}>
                    {posts}
                    {sidebar}
                </div>
            </div>
        </section>
    )
}

export const BlogSidebarFamily: TemplateFamily = {
    id: 'blog-sidebar',
    category: 'blog',
    name: 'Blog Sidebar',
    description: 'Blog posts with a sidebar for categories and newsletter',
    tags: ['blog', 'sidebar', 'categories', 'newsletter'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Posts',
            type: 'toggle-group',
            options: [
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '6', label: '6' },
            ],
            defaultValue: '4',
        },
        {
            key: 'sidebarPosition',
            label: 'Sidebar',
            type: 'toggle-group',
            options: [
                { value: 'right', label: 'Right' },
                { value: 'left', label: 'Left' },
            ],
            defaultValue: 'right',
        },
        {
            key: 'showExcerpt',
            label: 'Show Excerpt',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showNewsletter',
            label: 'Newsletter Box',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        itemCount: '4',
        sidebarPosition: 'right',
        showExcerpt: true,
        showNewsletter: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Short heading goes here',
        sidebarTitle: 'Categories',
        newsletterHeading: 'Subscribe to newsletter',
        newsletterDescription: 'Get the latest posts delivered to your inbox.',
        newsletterButton: 'Subscribe',
    },
}
