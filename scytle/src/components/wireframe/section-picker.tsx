'use client'

import { useState, useMemo, useCallback } from 'react'
import {
    X,
    Search,
    Sparkles,
    LayoutTemplate,
    Loader2,
    Globe,
    LayoutDashboard,
    Lock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUnifiedStore } from '@/store'
import { getTemplatesByCategory, getControlDef } from '@/lib/designs/v2/layouts'
import type { LayoutCategory } from '@/lib/designs/v2/layouts'
import type { PageContext, WireframeSection } from '@/types'

interface SectionPickerProps {
    pageId: string
    insertIndex: number
    onCloseAction: () => void
}

/**
 * SectionPicker — Registry-driven inline section picker.
 *
 * Reads all categories + presets from the centralized design registry.
 * Auto-filters by the current page's context (marketing / application / auth).
 * Category tabs let users browse within that context; "All" shows everything.
 */
export function SectionPicker({
    pageId,
    insertIndex,
    onCloseAction,
}: SectionPickerProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [isAISuggesting, setIsAISuggesting] = useState(false)

    const { addSection, pages } = useUnifiedStore()

    // Derive context from current page
    const currentPage = useMemo(() => pages.find(p => p.id === pageId), [pages, pageId])
    const pageContext: PageContext = currentPage?.pageContext ?? 'marketing'

    // V2 category metadata for context filtering
    const V2_CATEGORY_META: Record<string, { name: string; contexts: PageContext[] }> = {
        hero: { name: 'Hero', contexts: ['marketing'] },
        navbar: { name: 'Navbar', contexts: ['marketing', 'application', 'auth'] },
        footer: { name: 'Footer', contexts: ['marketing', 'application', 'auth'] },
        features: { name: 'Features', contexts: ['marketing'] },
        cta: { name: 'CTA', contexts: ['marketing'] },
        pricing: { name: 'Pricing', contexts: ['marketing'] },
        testimonials: { name: 'Testimonials', contexts: ['marketing'] },
        faq: { name: 'FAQ', contexts: ['marketing'] },
        contact: { name: 'Contact', contexts: ['marketing'] },
        content: { name: 'Content', contexts: ['marketing', 'application'] },
        team: { name: 'Team', contexts: ['marketing'] },
        blog: { name: 'Blog', contexts: ['marketing'] },
        stats: { name: 'Stats', contexts: ['marketing'] },
        gallery: { name: 'Gallery', contexts: ['marketing'] },
    }

    // Get categories for this page's context — V2 only
    const contextCategories = useMemo(
        () => Object.entries(V2_CATEGORY_META)
            .filter(([, meta]) => meta.contexts.includes(pageContext))
            .filter(([catId]) => getTemplatesByCategory(catId as LayoutCategory).length > 0)
            .map(([catId, meta]) => ({ id: catId, name: meta.name })),
        [pageContext],
    )

    // Unified preset item shape
    type PickerItem = {
        id: string
        name: string
        description: string
        categoryId: string
        categoryName: string
        familyId?: string
        Thumbnail?: React.FC
        isV2?: boolean
    }

    // Build flat preset list from V2 templates
    const allPresets = useMemo(() => {
        const items: PickerItem[] = []
        for (const cat of contextCategories) {
            const v2Templates = getTemplatesByCategory(cat.id as LayoutCategory)
            if (v2Templates.length > 0) {
                const controlDef = getControlDef(cat.id as LayoutCategory)
                if (controlDef && controlDef.axes[0]) {
                    const primaryAxis = controlDef.axes[0]
                    for (const opt of primaryAxis.options) {
                        const resolvedId = controlDef.resolve({ [primaryAxis.key]: opt.value })
                        const tmpl = resolvedId ? v2Templates.find(t => t.id === resolvedId) : undefined
                        if (tmpl) {
                            items.push({
                                id: tmpl.id,
                                name: tmpl.name,
                                description: tmpl.description,
                                categoryId: cat.id,
                                categoryName: cat.name,
                                isV2: true,
                            })
                        }
                    }
                } else {
                    for (const tmpl of v2Templates.slice(0, 6)) {
                        items.push({
                            id: tmpl.id,
                            name: tmpl.name,
                            description: tmpl.description,
                            categoryId: cat.id,
                            categoryName: cat.name,
                            isV2: true,
                        })
                    }
                }
            }
        }
        return items
    }, [contextCategories])

    // Filter by category + search
    const filteredPresets = useMemo(() => {
        let list = allPresets

        if (activeCategory !== 'all') {
            list = list.filter(p => p.categoryId === activeCategory)
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            list = list.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.description.toLowerCase().includes(q) ||
                p.categoryName.toLowerCase().includes(q)
            )
        }

        return list
    }, [allPresets, activeCategory, searchQuery])

    // Handle preset selection
    const handleSelectPreset = useCallback((preset: PickerItem) => {
        const newSection: WireframeSection = {
            id: `section-${Date.now()}`,
            type: preset.categoryId,
            name: preset.name,
            description: preset.description,
            componentId: preset.id,
            layoutVariant: preset.isV2 ? undefined : preset.familyId,
            order: insertIndex,
            isGlobal: preset.categoryId === 'navbar' || preset.categoryId === 'footer',
            content: {},
            controls: {},
        }

        addSection(pageId, newSection, insertIndex)
        onCloseAction()
    }, [pageId, insertIndex, addSection, onCloseAction])

    // Handle AI suggestion
    const handleAISuggest = useCallback(async () => {
        setIsAISuggesting(true)

        try {
            const page = useUnifiedStore.getState().pages.find(p => p.id === pageId)
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
    }, [pageId, insertIndex, addSection, onCloseAction])

    return (
        <div
            className={cn(
                'absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50',
                'w-80 bg-white rounded-lg shadow-xl border border-gray-200',
                'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium">Add Section</span>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6"
                    onClick={onCloseAction}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Search */}
            <div className="p-2 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search sections..."
                        className="pl-8 h-8 text-sm"
                    />
                </div>
            </div>

            {/* AI Suggest Button */}
            <div className="px-2 py-2 border-b">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2"
                    onClick={handleAISuggest}
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

            {/* Category Tabs — from registry, filtered by page context */}
            <div className="px-2 py-2 border-b overflow-x-auto">
                <div className="flex gap-1">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={cn(
                            'flex items-center gap-1.5 px-2 py-1 rounded text-xs whitespace-nowrap transition-colors',
                            activeCategory === 'all'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                        )}
                    >
                        <LayoutTemplate className="h-3 w-3" />
                        All
                    </button>
                    {contextCategories.slice(0, 5).map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded text-xs whitespace-nowrap transition-colors',
                                activeCategory === cat.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Section Grid */}
            <ScrollArea className="h-64">
                <div className="p-2 grid grid-cols-2 gap-2">
                    {filteredPresets.map((preset) => (
                        <button
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset)}
                            className={cn(
                                'flex flex-col items-start p-2 rounded-lg border',
                                'bg-white hover:bg-muted/50 hover:border-primary/50',
                                'transition-colors text-left'
                            )}
                        >
                            {/* Thumbnail — use preset's Thumbnail component */}
                            <div className="w-full aspect-video bg-muted rounded mb-2 flex items-center justify-center overflow-hidden">
                                {preset.Thumbnail ? (
                                    <preset.Thumbnail />
                                ) : (
                                    <LayoutTemplate className="h-6 w-6 text-muted-foreground/50" />
                                )}
                            </div>
                            <span className="text-xs font-medium truncate w-full">
                                {preset.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate w-full">
                                {preset.description}
                            </span>
                        </button>
                    ))}

                    {filteredPresets.length === 0 && (
                        <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                            No sections found
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
