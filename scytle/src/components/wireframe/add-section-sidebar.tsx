'use client'

import { useState, useMemo, useCallback } from 'react'
import {
    X,
    Search,
    Sparkles,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Plus,
    Bookmark,
    Globe,
    LayoutTemplate,
    Loader2,
    Settings2,
    Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUnifiedStore } from '@/store'
import { WireframeThumbnail } from './wireframe-thumbnail'
import { getDesignsForCategory, getActiveCategories, type DesignCategoryId, type DesignDefinition } from '@/lib/designs'
import type { WireframeSection } from '@/types'

/**
 * AddSectionSidebar - Relume-style left sidebar for adding sections
 * 
 * Features:
 * - Fixed left sidebar that slides in
 * - Global sections (Navbar, Footer)
 * - Saved components section
 * - Categories with drill-down to layouts
 * - Search functionality
 * - AI suggestion
 * 
 * MIGRATION NOTE:
 * Now uses centralized design registry from lib/designs/
 * Categories and layouts are dynamically generated from registry.
 */

interface AddSectionSidebarProps {
    isOpen: boolean
    onCloseAction: () => void
    pageId: string
    insertIndex: number
}

// Interface for layout (converted from DesignDefinition)
interface SectionLayout {
    id: string
    name: string
    type: string
    variant?: string
    preview?: string
}

// Interface for category (built from registry)
interface SectionCategory {
    id: string
    name: string
    description?: string
    layouts: SectionLayout[]
}

// Convert design to layout format
function designToLayout(design: DesignDefinition): SectionLayout {
    return {
        id: design.id,
        name: design.name,
        type: design.category,
        variant: design.layout,
        preview: design.description,
    }
}

// Build categories from registry dynamically
function buildCategoriesFromRegistry(): SectionCategory[] {
    const activeCategories = getActiveCategories()

    // All possible categories (for showing empty ones too)
    const allCategoryMeta: { id: DesignCategoryId; name: string }[] = [
        { id: 'hero', name: 'Hero Header' },
        { id: 'features', name: 'Features' },
        { id: 'testimonials', name: 'Testimonials' },
        { id: 'cta', name: 'Call To Action' },
        { id: 'pricing', name: 'Pricing' },
        { id: 'faq', name: 'FAQ' },
        { id: 'contact', name: 'Contact' },
        { id: 'team', name: 'Team' },
        { id: 'blog', name: 'Blog' },
        { id: 'gallery', name: 'Gallery' },
        { id: 'stats', name: 'Stats' },
        { id: 'logos', name: 'Logo Cloud' },
        { id: 'content', name: 'Content' },
        { id: 'footer', name: 'Footer' },
        { id: 'navbar', name: 'Navigation' },
    ]

    return allCategoryMeta.map(cat => ({
        id: cat.id,
        name: cat.name,
        layouts: getDesignsForCategory(cat.id).map(designToLayout),
    }))
}

// Global sections that appear on all pages
const GLOBAL_SECTIONS = [
    { id: 'footer', name: 'Footer', type: 'footer', instances: 0 },
    { id: 'navbar', name: 'Navbar', type: 'navbar', instances: 0 },
]

// Section categories built dynamically from design registry
const SECTION_CATEGORIES = buildCategoriesFromRegistry()

export function AddSectionSidebar({
    isOpen,
    onCloseAction,
    pageId,
    insertIndex,
}: AddSectionSidebarProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<SectionCategory | null>(null)
    const [isAISuggesting, setIsAISuggesting] = useState(false)

    const { addSection, pages, setGhostPreviewLayout } = useUnifiedStore()

    // Handle layout hover for ghost preview
    const handleLayoutHover = useCallback((layout: SectionLayout | null) => {
        if (layout) {
            setGhostPreviewLayout({
                type: layout.type,
                variant: layout.variant,
                name: layout.name,
            })
        } else {
            setGhostPreviewLayout(null)
        }
    }, [setGhostPreviewLayout])

    // Count global section instances
    const globalSectionCounts = useMemo(() => {
        const counts: Record<string, number> = { footer: 0, navbar: 0 }
        pages.forEach(page => {
            page.sections.forEach(section => {
                if (section.type === 'footer') counts.footer++
                if (section.type === 'navbar') counts.navbar++
            })
        })
        return counts
    }, [pages])

    // Filter categories by search
    const filteredCategories = useMemo(() => {
        if (!searchQuery) return SECTION_CATEGORIES
        const query = searchQuery.toLowerCase()
        return SECTION_CATEGORIES.filter(cat =>
            cat.name.toLowerCase().includes(query) ||
            cat.layouts.some(l => l.name.toLowerCase().includes(query))
        )
    }, [searchQuery])

    // Handle adding a layout
    const handleAddLayout = useCallback((layout: SectionLayout) => {
        const newSection: WireframeSection = {
            id: `section-${Date.now()}`,
            type: layout.type,
            name: layout.name,
            description: `${selectedCategory?.name || layout.type} section`,
            componentId: layout.id,
            layoutVariant: layout.variant,
            order: insertIndex,
            isGlobal: layout.type === 'navbar' || layout.type === 'footer',
            content: {},
            controls: {},
        }

        addSection(pageId, newSection, insertIndex)
        onCloseAction()
    }, [pageId, insertIndex, addSection, onCloseAction, selectedCategory])

    // Handle adding global section
    const handleAddGlobal = useCallback((type: 'navbar' | 'footer') => {
        const newSection: WireframeSection = {
            id: `section-${Date.now()}`,
            type,
            name: type === 'navbar' ? 'Navbar' : 'Footer',
            componentId: `${type}-standard`,
            order: type === 'navbar' ? 0 : 999,
            isGlobal: true,
            content: {},
            controls: {},
        }

        addSection(pageId, newSection, type === 'navbar' ? 0 : insertIndex)
        onCloseAction()
    }, [pageId, insertIndex, addSection, onCloseAction])

    // Handle AI suggestion
    const handleAISuggest = useCallback(async () => {
        setIsAISuggesting(true)
        try {
            const page = pages.find(p => p.id === pageId)
            const existingSections = page?.sections.map(s => ({
                type: s.type,
                name: s.name,
            })) || []

            const response = await fetch('/api/ai/suggest-section', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageId,
                    pageName: page?.name || 'Page',
                    pageDescription: page?.description,
                    existingSections,
                    position: insertIndex === 0 ? 'top' : 'middle',
                }),
            })

            if (!response.ok) throw new Error('Failed to get suggestion')

            const data = await response.json()
            const suggestion = data.suggestion

            const newSection: WireframeSection = {
                id: `section-${Date.now()}`,
                type: suggestion.type,
                name: suggestion.name,
                description: suggestion.description,
                componentId: suggestion.componentId,
                layoutVariant: suggestion.variant,
                order: insertIndex,
                isGlobal: suggestion.isGlobal || false,
                content: {},
                controls: {},
            }

            addSection(pageId, newSection, insertIndex)
            onCloseAction()
        } catch (error) {
            console.error('❌ AI suggestion failed:', error)
        } finally {
            setIsAISuggesting(false)
        }
    }, [pageId, pages, insertIndex, addSection, onCloseAction])

    // Back to categories
    const handleBack = useCallback(() => {
        setSelectedCategory(null)
    }, [])

    return (
        <div
            data-add-section-sidebar
            className={cn(
                'absolute left-14 top-0 bottom-0 w-72 bg-background border-r z-40',
                'flex flex-col',
                !isOpen && 'hidden'
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
                {selectedCategory ? (
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {selectedCategory.name}
                    </button>
                ) : (
                    <span className="text-sm font-semibold">Add</span>
                )}
                <button
                    onClick={onCloseAction}
                    className="p-1 hover:bg-gray-100"
                >
                    <X className="h-4 w-4 text-gray-500" />
                </button>
            </div>

            {/* Search */}
            <div className="px-3 py-2 border-b">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search"
                            className="pl-8 h-8 text-sm bg-gray-50 border-gray-200"
                        />
                    </div>
                    <button className="p-2 hover:bg-gray-100">
                        <Settings2 className="h-4 w-4 text-gray-500" />
                    </button>
                </div>
            </div>

            {/* Content - ScrollArea with fixed height like sitemap section picker */}
            <ScrollArea className="h-[calc(100%-110px)]">
                {selectedCategory ? (
                    // Layout selection view
                    <LayoutSelectionView
                        category={selectedCategory}
                        onSelectLayout={handleAddLayout}
                        onHoverLayout={handleLayoutHover}
                    />
                ) : (
                    // Category list view
                    <CategoryListView
                        categories={filteredCategories}
                        globalSections={GLOBAL_SECTIONS}
                        globalCounts={globalSectionCounts}
                        onSelectCategory={setSelectedCategory}
                        onAddGlobal={handleAddGlobal}
                        onAISuggest={handleAISuggest}
                        isAISuggesting={isAISuggesting}
                    />
                )}
            </ScrollArea>
        </div>
    )
}

// Category list view component
interface CategoryListViewProps {
    categories: SectionCategory[]
    globalSections: typeof GLOBAL_SECTIONS
    globalCounts: Record<string, number>
    onSelectCategory: (cat: SectionCategory) => void
    onAddGlobal: (type: 'navbar' | 'footer') => void
    onAISuggest: () => void
    isAISuggesting: boolean
}

function CategoryListView({
    categories,
    globalSections,
    globalCounts,
    onSelectCategory,
    onAddGlobal,
    onAISuggest,
    isAISuggesting,
}: CategoryListViewProps) {
    return (
        <div className="py-2">
            {/* AI Suggest */}
            <div className="px-3 pb-3">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2 h-9 rounded-none"
                    onClick={onAISuggest}
                    disabled={isAISuggesting}
                >
                    {isAISuggesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="h-4 w-4" />
                    )}
                    Suggest section
                </Button>
            </div>

            {/* Global Sections */}
            <div className="px-3 pb-2">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Global sections
                </p>
                {globalSections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => onAddGlobal(section.type as 'navbar' | 'footer')}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-emerald-100 flex items-center justify-center">
                                <Globe className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div className="text-left">
                                <p className="text-sm font-medium text-gray-900">{section.name}</p>
                                <p className="text-xs text-gray-500">
                                    {globalCounts[section.type]} instances
                                </p>
                            </div>
                        </div>
                        <Plus className="h-4 w-4 text-gray-400" />
                    </button>
                ))}
            </div>

            {/* Saved */}
            <div className="px-3 pb-2 border-t pt-3">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Saved
                </p>
                <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                            <Bookmark className="h-4 w-4 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">Components</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
                <button className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                            <Bookmark className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-medium text-gray-900">Page Templates</p>
                            <p className="text-xs text-gray-500">0 saved</p>
                        </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
            </div>

            {/* Categories */}
            <div className="px-3 pt-3 border-t">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Categories
                </p>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => onSelectCategory(category)}
                        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 flex items-center justify-center">
                                <LayoutTemplate className="h-4 w-4 text-gray-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{category.name}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                    </button>
                ))}
            </div>
        </div>
    )
}

// Layout selection view component
interface LayoutSelectionViewProps {
    category: SectionCategory
    onSelectLayout: (layout: SectionLayout) => void
    onHoverLayout?: (layout: SectionLayout | null) => void
}

// Layout filter options - Relume-style
const LAYOUT_FILTERS = ['All', 'Split', 'Centered', 'Grid', 'List', 'Carousel'] as const
const ELEMENT_FILTERS = ['All', 'With Image', 'With Form', 'With Cards', 'Minimal'] as const

type LayoutFilter = (typeof LAYOUT_FILTERS)[number]
type ElementFilter = (typeof ELEMENT_FILTERS)[number]

function LayoutSelectionView({ category, onSelectLayout, onHoverLayout }: LayoutSelectionViewProps) {
    const [layoutFilter, setLayoutFilter] = useState<LayoutFilter>('All')
    const [elementFilter, setElementFilter] = useState<ElementFilter>('All')

    // Filter layouts based on selected filters
    const filteredLayouts = useMemo(() => {
        return category.layouts.filter((layout) => {
            const variant = layout.variant?.toLowerCase() || ''

            // Layout filter matching
            if (layoutFilter !== 'All') {
                const layoutMatches = {
                    Split: ['split', 'with-image'].some((v) => variant.includes(v)),
                    Centered: variant.includes('centered') || variant.includes('simple'),
                    Grid: variant.includes('grid') || variant.includes('3-tier'),
                    List: variant.includes('list') || variant.includes('accordion'),
                    Carousel: variant.includes('carousel') || variant.includes('scroll'),
                }
                if (!layoutMatches[layoutFilter as keyof typeof layoutMatches]) {
                    return false
                }
            }

            // Element filter matching
            if (elementFilter !== 'All') {
                const elementMatches = {
                    'With Image': variant.includes('image') || variant.includes('split'),
                    'With Form': ['contact', 'newsletter'].includes(layout.type),
                    'With Cards': variant.includes('grid') || variant.includes('cards'),
                    Minimal: variant.includes('simple') || variant.includes('centered') || variant.includes('banner'),
                }
                if (!elementMatches[elementFilter as keyof typeof elementMatches]) {
                    return false
                }
            }

            return true
        })
    }, [category.layouts, layoutFilter, elementFilter])

    return (
        <div className="flex flex-col h-full">
            {/* Relume-style Filter Dropdowns */}
            <div className="px-3 py-2 border-b bg-gray-50 flex gap-2">
                {/* Layout Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 flex-1">
                            <span className="truncate">Layout: {layoutFilter}</span>
                            <ChevronDown className="h-3 w-3 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36">
                        {LAYOUT_FILTERS.map((filter) => (
                            <DropdownMenuItem
                                key={filter}
                                onClick={() => setLayoutFilter(filter)}
                                className="text-xs"
                            >
                                <Check
                                    className={cn(
                                        'h-3 w-3 mr-2',
                                        layoutFilter === filter ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                {filter}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Elements Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2 gap-1 flex-1">
                            <span className="truncate">Elements: {elementFilter}</span>
                            <ChevronDown className="h-3 w-3 shrink-0" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-36">
                        {ELEMENT_FILTERS.map((filter) => (
                            <DropdownMenuItem
                                key={filter}
                                onClick={() => setElementFilter(filter)}
                                className="text-xs"
                            >
                                <Check
                                    className={cn(
                                        'h-3 w-3 mr-2',
                                        elementFilter === filter ? 'opacity-100' : 'opacity-0'
                                    )}
                                />
                                {filter}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Layout Grid */}
            <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                {filteredLayouts.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-500">
                        No layouts match your filters.
                        <button
                            onClick={() => {
                                setLayoutFilter('All')
                                setElementFilter('All')
                            }}
                            className="block mx-auto mt-2 text-blue-600 hover:underline"
                        >
                            Clear filters
                        </button>
                    </div>
                ) : (
                    filteredLayouts.map((layout) => (
                        <button
                            key={layout.id}
                            onClick={() => onSelectLayout(layout)}
                            onMouseEnter={() => onHoverLayout?.(layout)}
                            onMouseLeave={() => onHoverLayout?.(null)}
                            className="w-full bg-white border border-gray-200 overflow-hidden hover:border-gray-400 hover:shadow-sm transition-all"
                        >
                            {/* Layout Preview - Use actual wireframe thumbnail */}
                            <div className="aspect-[16/10] bg-white border-b">
                                <WireframeThumbnail type={layout.type} variant={layout.variant} />
                            </div>

                            {/* Layout Info - Relume-style name */}
                            <div className="px-3 py-2 flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                    {layout.name}
                                </span>
                                <Bookmark className="h-4 w-4 text-gray-300 hover:text-gray-500" />
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
