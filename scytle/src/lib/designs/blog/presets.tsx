'use client'

/**
 * Blog Presets — Named snapshots of Blog family control values.
 */

import { ImageIcon } from 'lucide-react'
import type { DesignPreset } from '../types'

// ===== THUMBNAILS =====

/** Blog 1 Thumbnail: 3-column grid */
function Blog1Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Latest articles</div>
            </div>
            <div className="grid grid-cols-3 gap-0.5 flex-1">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden">
                        <div className="aspect-[16/9] bg-gray-100" />
                        <div className="p-0.5">
                            <div className="text-[2.5px] text-gray-400">Category</div>
                            <div className="text-[3px] font-medium text-gray-700">Post title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog 2 Thumbnail: 2-column grid */
function Blog2Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="text-center mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Blog</div>
            </div>
            <div className="grid grid-cols-2 gap-0.5 flex-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded overflow-hidden">
                        <div className="aspect-[16/9] bg-gray-100" />
                        <div className="p-0.5">
                            <div className="text-[3px] font-medium text-gray-700">Post title</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog 3 Thumbnail: List */
function Blog3Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-2 flex flex-col">
            <div className="mb-1">
                <div className="text-[7px] font-semibold text-gray-800">All posts</div>
            </div>
            <div className="flex-1 space-y-0.5">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-1 pb-0.5 border-b border-gray-100">
                        <div className="w-6 h-4 bg-gray-100 border border-gray-200 rounded flex-shrink-0" />
                        <div className="flex-1">
                            <div className="text-[3px] font-medium text-gray-700">Post title goes here</div>
                            <div className="text-[2.5px] text-gray-400">Excerpt text...</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/** Blog 4 Thumbnail: Featured */
function Blog4Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Featured</div>
            </div>
            <div className="flex gap-0.5 flex-1">
                <div className="flex-1 border border-gray-200 rounded overflow-hidden">
                    <div className="aspect-[16/10] bg-gray-100" />
                    <div className="p-0.5">
                        <div className="text-[3px] font-medium text-gray-700">Featured post</div>
                    </div>
                </div>
                <div className="w-8 space-y-0.5">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded overflow-hidden">
                            <div className="aspect-[16/9] bg-gray-100" />
                            <div className="p-0.5">
                                <div className="text-[2.5px] font-medium text-gray-700">Post</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

/** Blog 5 Thumbnail: Featured with 3 side */
function Blog5Thumbnail() {
    return (
        <div className="w-full h-full bg-white p-1.5 flex flex-col">
            <div className="mb-1">
                <div className="text-[6px] font-semibold text-gray-800">Featured</div>
            </div>
            <div className="flex gap-0.5 flex-1">
                <div className="flex-1 border border-gray-200 rounded overflow-hidden">
                    <div className="h-full bg-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-3 h-3 text-gray-300" />
                    </div>
                </div>
                <div className="w-8 space-y-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border border-gray-200 rounded p-0.5">
                            <div className="text-[2.5px] font-medium text-gray-700">Post title</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ===== PRESETS =====

export const Blog1Preset: DesignPreset = {
    id: 'blog-1',
    familyId: 'blog-grid',
    name: 'Blog 1',
    description: 'Three-column blog card grid',
    controls: { columns: '3', itemCount: '3', showImage: true, showExcerpt: true },
    Thumbnail: Blog1Thumbnail,
}

export const Blog2Preset: DesignPreset = {
    id: 'blog-2',
    familyId: 'blog-grid',
    name: 'Blog 2',
    description: 'Two-column blog grid',
    controls: { columns: '2', itemCount: '4', showImage: true, showExcerpt: false },
    Thumbnail: Blog2Thumbnail,
}

export const Blog3Preset: DesignPreset = {
    id: 'blog-3',
    familyId: 'blog-list',
    name: 'Blog 3',
    description: 'Vertical post list with thumbnails',
    controls: { itemCount: '4', showImage: true, showDividers: true },
    Thumbnail: Blog3Thumbnail,
}

export const Blog4Preset: DesignPreset = {
    id: 'blog-4',
    familyId: 'blog-featured',
    name: 'Blog 4',
    description: 'Featured post with 2 side posts',
    controls: { sideCount: '2', showExcerpt: true },
    Thumbnail: Blog4Thumbnail,
}

export const Blog5Preset: DesignPreset = {
    id: 'blog-5',
    familyId: 'blog-featured',
    name: 'Blog 5',
    description: 'Featured post with 3 side posts',
    controls: { sideCount: '3', showExcerpt: false },
    Thumbnail: Blog5Thumbnail,
}

export const blogPresets: DesignPreset[] = [
    Blog1Preset,
    Blog2Preset,
    Blog3Preset,
    Blog4Preset,
    Blog5Preset,
]
