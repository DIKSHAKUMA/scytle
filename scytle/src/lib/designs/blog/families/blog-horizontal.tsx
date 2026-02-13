'use client'

/**
 * Blog Horizontal Family — Full-width horizontal cards (image left, text right).
 *
 * Controls:
 * - itemCount: 2 | 3 | 4
 * - showExcerpt: boolean
 * - showAuthor: boolean
 *
 * Editable content arrays: postTitles, postCategories, postExcerpts, postAuthors, postDates
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

const defaultTitles = Array.from({ length: 4 }, () => 'Blog post title heading will go here')
const defaultCategories = Array.from({ length: 4 }, () => 'Category')
const defaultExcerpts = Array.from({ length: 4 }, () => 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.')
const defaultAuthors = Array.from({ length: 4 }, () => 'Full name')
const defaultDates = Array.from({ length: 4 }, () => '11 Jan 2022')

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const itemCount = Number(controls?.itemCount ?? 3)
    const showExcerpt = controls?.showExcerpt !== false
    const showAuthor = controls?.showAuthor !== false

    const postTitles = (content?.postTitles as string[]) ?? defaultTitles
    const postCategories = (content?.postCategories as string[]) ?? defaultCategories
    const postExcerpts = (content?.postExcerpts as string[]) ?? defaultExcerpts
    const postAuthors = (content?.postAuthors as string[]) ?? defaultAuthors
    const postDates = (content?.postDates as string[]) ?? defaultDates

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
                    <EditableText
                        value={(content?.subheading as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className={`text-gray-500 mt-4 ${isMobile ? 'text-sm' : 'text-base'}`}
                        editable={editable}
                    />
                </div>

                {/* Horizontal Cards */}
                <div className="space-y-6">
                    {Array.from({ length: itemCount }).map((_, i) => (
                        <div key={i} className={`flex ${isMobile ? 'flex-col' : ''} gap-6 border border-gray-200 rounded-lg overflow-hidden`}>
                            <div className={`${isMobile ? 'w-full aspect-[16/9]' : 'w-2/5 min-h-[200px]'} bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                                <ImageIcon className="w-8 h-8 text-gray-300" />
                            </div>
                            <div className="flex-1 p-5 flex flex-col justify-center">
                                <div className="flex items-center gap-2 mb-2">
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
                                    className={`font-semibold text-gray-900 ${isMobile ? 'text-sm' : 'text-lg'} leading-snug`}
                                    editable={editable}
                                />
                                {showExcerpt && (
                                    <EditableText
                                        value={postExcerpts[i] ?? 'Lorem ipsum dolor sit amet.'}
                                        onChange={(v) => { const u = [...postExcerpts]; u[i] = v; onContentChange?.('postExcerpts', u) }}
                                        as="p"
                                        className="text-xs text-gray-500 mt-2 line-clamp-2"
                                        editable={editable}
                                        multiline
                                    />
                                )}
                                {showAuthor && (
                                    <div className="flex items-center gap-2 mt-4">
                                        <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0" />
                                        <div>
                                            <EditableText
                                                value={postAuthors[i] ?? 'Full name'}
                                                onChange={(v) => { const u = [...postAuthors]; u[i] = v; onContentChange?.('postAuthors', u) }}
                                                as="span"
                                                className="text-xs font-medium text-gray-700 block"
                                                editable={editable}
                                            />
                                            <EditableText
                                                value={postDates[i] ?? '11 Jan 2022'}
                                                onChange={(v) => { const u = [...postDates]; u[i] = v; onContentChange?.('postDates', u) }}
                                                as="span"
                                                className="text-[10px] text-gray-400 block"
                                                editable={editable}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* View All Button */}
                <div className="mt-12 text-center">
                    <EditableText
                        value={(content?.ctaButton as string) || 'View all'}
                        onChange={(v) => onContentChange?.('ctaButton', v)}
                        as="span"
                        className="inline-block border border-gray-900 text-gray-900 px-5 py-2.5 text-sm font-medium"
                        editable={editable}
                    />
                </div>
            </div>
        </section>
    )
}

export const BlogHorizontalFamily: TemplateFamily = {
    id: 'blog-horizontal',
    category: 'blog',
    name: 'Blog Horizontal',
    description: 'Full-width horizontal blog post cards',
    tags: ['blog', 'horizontal', 'cards', 'posts'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'itemCount',
            label: 'Posts',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        {
            key: 'showExcerpt',
            label: 'Show Excerpt',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showAuthor',
            label: 'Show Author',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        itemCount: '3',
        showExcerpt: true,
        showAuthor: true,
    },
    defaultContent: {
        tagline: 'Blog',
        heading: 'Short heading goes here',
        subheading: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        ctaButton: 'View all',
    },
}
