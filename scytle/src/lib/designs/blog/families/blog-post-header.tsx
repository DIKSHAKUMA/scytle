'use client'

/**
 * Blog Post Header Family — Single blog post header/hero section.
 * For the top of individual blog post pages (Blog Post Header 1-5 designs).
 *
 * Controls:
 * - layout: centered | leftAligned | fullWidth | overlay | split
 * - showBreadcrumb: boolean
 * - showMeta: boolean
 * - showAuthorBio: boolean
 *
 * Editable content: title, category, author, date, readTime, authorBio
 */

import { ImageIcon, ChevronRight } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const layout = (controls?.layout as string) ?? 'centered'
    const showBreadcrumb = controls?.showBreadcrumb !== false
    const showMeta = controls?.showMeta !== false
    const showAuthorBio = controls?.showAuthorBio === true

    const breadcrumb = (
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-4">
            <EditableText
                value={(content?.breadcrumbHome as string) || 'Blog'}
                onChange={(v) => onContentChange?.('breadcrumbHome', v)}
                as="span"
                className="text-xs text-gray-400"
                editable={editable}
            />
            <ChevronRight className="w-3 h-3" />
            <EditableText
                value={(content?.breadcrumbCategory as string) || 'Category'}
                onChange={(v) => onContentChange?.('breadcrumbCategory', v)}
                as="span"
                className="text-xs text-gray-400"
                editable={editable}
            />
        </div>
    )

    const meta = showMeta ? (
        <div className="flex items-center gap-3 flex-wrap">
            <EditableText
                value={(content?.category as string) || 'Category'}
                onChange={(v) => onContentChange?.('category', v)}
                as="span"
                className="text-[10px] text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full"
                editable={editable}
            />
            <span className="text-[10px] text-gray-300">•</span>
            <EditableText
                value={(content?.readTime as string) || '5 min read'}
                onChange={(v) => onContentChange?.('readTime', v)}
                as="span"
                className="text-[10px] text-gray-400"
                editable={editable}
            />
        </div>
    ) : null

    const author = (
        <div className="flex items-center gap-3 mt-6">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div>
                <EditableText
                    value={(content?.author as string) || 'Full name'}
                    onChange={(v) => onContentChange?.('author', v)}
                    as="div"
                    className="text-sm font-medium text-gray-900"
                    editable={editable}
                />
                <EditableText
                    value={(content?.date as string) || '11 Jan 2022'}
                    onChange={(v) => onContentChange?.('date', v)}
                    as="div"
                    className="text-xs text-gray-400"
                    editable={editable}
                />
            </div>
        </div>
    )

    const authorBio = showAuthorBio ? (
        <EditableText
            value={(content?.authorBio as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.'}
            onChange={(v) => onContentChange?.('authorBio', v)}
            as="p"
            className="text-xs text-gray-500 mt-2 max-w-md"
            editable={editable}
            multiline
        />
    ) : null

    if (layout === 'centered') {
        return (
            <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
                <div className="max-w-3xl mx-auto text-center">
                    {showBreadcrumb && <div className="flex justify-center">{breadcrumb}</div>}
                    <div className="mb-4">{meta}</div>
                    <EditableText
                        value={(content?.title as string) || 'Blog post title heading will go here'}
                        onChange={(v) => onContentChange?.('title', v)}
                        as="h1"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-5xl'} leading-tight`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                        onChange={(v) => onContentChange?.('subtitle', v)}
                        as="p"
                        className={`text-gray-500 mt-4 ${isMobile ? 'text-sm' : 'text-lg'}`}
                        editable={editable}
                        multiline
                    />
                    <div className="flex justify-center">{author}</div>
                    {authorBio && <div className="flex justify-center">{authorBio}</div>}
                    <div className="mt-10 aspect-[16/8] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                </div>
            </section>
        )
    }

    if (layout === 'leftAligned') {
        return (
            <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
                <div className="max-w-4xl mx-auto">
                    {showBreadcrumb && breadcrumb}
                    <div className="mb-4">{meta}</div>
                    <EditableText
                        value={(content?.title as string) || 'Blog post title heading will go here'}
                        onChange={(v) => onContentChange?.('title', v)}
                        as="h1"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-5xl'} leading-tight`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('subtitle', v)}
                        as="p"
                        className={`text-gray-500 mt-4 ${isMobile ? 'text-sm' : 'text-lg'} max-w-2xl`}
                        editable={editable}
                        multiline
                    />
                    {author}
                    {authorBio}
                    <div className="mt-10 aspect-[16/8] bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                    </div>
                </div>
            </section>
        )
    }

    if (layout === 'fullWidth') {
        return (
            <section>
                <div className="aspect-[16/6] bg-gray-100 flex items-center justify-center relative">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                </div>
                <div className={`max-w-3xl mx-auto ${isMobile ? 'px-4 py-8' : 'px-8 py-12'}`}>
                    {showBreadcrumb && breadcrumb}
                    <div className="mb-4">{meta}</div>
                    <EditableText
                        value={(content?.title as string) || 'Blog post title heading will go here'}
                        onChange={(v) => onContentChange?.('title', v)}
                        as="h1"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'} leading-tight`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('subtitle', v)}
                        as="p"
                        className="text-gray-500 mt-4 text-base"
                        editable={editable}
                        multiline
                    />
                    {author}
                    {authorBio}
                </div>
            </section>
        )
    }

    if (layout === 'overlay') {
        return (
            <section className="relative">
                <div className={`aspect-[16/7] bg-gray-800 flex items-center justify-center ${isMobile ? 'px-4' : 'px-16'}`}>
                    <div className="max-w-3xl mx-auto text-center relative z-10">
                        {showBreadcrumb && (
                            <div className="flex justify-center mb-4">
                                <div className="flex items-center gap-1 text-xs text-gray-300">
                                    <EditableText
                                        value={(content?.breadcrumbHome as string) || 'Blog'}
                                        onChange={(v) => onContentChange?.('breadcrumbHome', v)}
                                        as="span"
                                        className="text-xs text-gray-300"
                                        editable={editable}
                                    />
                                    <ChevronRight className="w-3 h-3" />
                                    <EditableText
                                        value={(content?.breadcrumbCategory as string) || 'Category'}
                                        onChange={(v) => onContentChange?.('breadcrumbCategory', v)}
                                        as="span"
                                        className="text-xs text-gray-300"
                                        editable={editable}
                                    />
                                </div>
                            </div>
                        )}
                        {showMeta && (
                            <div className="flex items-center gap-3 justify-center mb-4 flex-wrap">
                                <EditableText
                                    value={(content?.category as string) || 'Category'}
                                    onChange={(v) => onContentChange?.('category', v)}
                                    as="span"
                                    className="text-[10px] text-gray-300 border border-gray-500 px-2 py-0.5 rounded-full"
                                    editable={editable}
                                />
                            </div>
                        )}
                        <EditableText
                            value={(content?.title as string) || 'Blog post title heading will go here'}
                            onChange={(v) => onContentChange?.('title', v)}
                            as="h1"
                            className={`font-bold text-white ${isMobile ? 'text-2xl' : 'text-5xl'} leading-tight`}
                            editable={editable}
                        />
                        <EditableText
                            value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                            onChange={(v) => onContentChange?.('subtitle', v)}
                            as="p"
                            className={`text-gray-300 mt-4 ${isMobile ? 'text-sm' : 'text-lg'}`}
                            editable={editable}
                            multiline
                        />
                        <div className="flex justify-center mt-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0" />
                                <div className="text-left">
                                    <EditableText
                                        value={(content?.author as string) || 'Full name'}
                                        onChange={(v) => onContentChange?.('author', v)}
                                        as="div"
                                        className="text-sm font-medium text-white"
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={(content?.date as string) || '11 Jan 2022'}
                                        onChange={(v) => onContentChange?.('date', v)}
                                        as="div"
                                        className="text-xs text-gray-400"
                                        editable={editable}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    // layout === 'split'
    return (
        <section className={`${isMobile ? 'py-12 px-4' : ''}`}>
            <div className={`${isMobile ? '' : 'flex'} max-w-7xl mx-auto`}>
                <div className={`${isMobile ? 'w-full aspect-[16/9]' : 'w-1/2 min-h-[500px]'} bg-gray-100 flex items-center justify-center flex-shrink-0`}>
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                </div>
                <div className={`${isMobile ? 'py-8' : 'w-1/2 px-12 flex flex-col justify-center py-16'}`}>
                    {showBreadcrumb && breadcrumb}
                    <div className="mb-4">{meta}</div>
                    <EditableText
                        value={(content?.title as string) || 'Blog post title heading will go here'}
                        onChange={(v) => onContentChange?.('title', v)}
                        as="h1"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-2xl' : 'text-4xl'} leading-tight`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subtitle as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('subtitle', v)}
                        as="p"
                        className="text-gray-500 mt-4 text-sm"
                        editable={editable}
                        multiline
                    />
                    {author}
                    {authorBio}
                </div>
            </div>
        </section>
    )
}

export const BlogPostHeaderFamily: TemplateFamily = {
    id: 'blog-post-header',
    category: 'blog',
    name: 'Blog Post Header',
    description: 'Single blog post header/hero section',
    tags: ['blog', 'post', 'header', 'hero', 'article'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'layout',
            label: 'Layout',
            type: 'toggle-group',
            options: [
                { value: 'centered', label: 'Center' },
                { value: 'leftAligned', label: 'Left' },
                { value: 'fullWidth', label: 'Full' },
                { value: 'overlay', label: 'Overlay' },
                { value: 'split', label: 'Split' },
            ],
            defaultValue: 'centered',
        },
        {
            key: 'showBreadcrumb',
            label: 'Breadcrumb',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showMeta',
            label: 'Show Meta',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'showAuthorBio',
            label: 'Author Bio',
            type: 'switch',
            defaultValue: false,
        },
    ],
    defaultControls: {
        layout: 'centered',
        showBreadcrumb: true,
        showMeta: true,
        showAuthorBio: false,
    },
    defaultContent: {
        title: 'Blog post title heading will go here',
        subtitle: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        category: 'Category',
        author: 'Full name',
        date: '11 Jan 2022',
        readTime: '5 min read',
        breadcrumbHome: 'Blog',
        breadcrumbCategory: 'Category',
    },
}
