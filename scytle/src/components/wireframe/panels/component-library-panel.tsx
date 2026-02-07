'use client'

import { useState, useCallback, useMemo } from 'react'
import { ChevronLeft, Search, Shuffle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUnifiedStore } from '@/store'
import { ComponentCard } from './component-card'
import { getDesignsForCategory, searchDesigns, type DesignCategoryId, type DesignDefinition } from '@/lib/designs'
import type { WireframeSection } from '@/types'

// Component variant interface for internal use (backwards compatible)
export interface ComponentVariant {
    id: string
    sectionType: string
    variant?: string
    name: string
    description: string
    tags: string[]
}

// Convert DesignDefinition to ComponentVariant for UI
function designToComponentVariant(design: DesignDefinition): ComponentVariant {
    return {
        id: design.id,
        sectionType: design.category,
        variant: design.layout,
        name: design.name,
        description: design.description,
        tags: design.tags || [],
    }
}

// Get component variants for a section type (from registry)
function getVariantsForType(sectionType: string): ComponentVariant[] {
    const designs = getDesignsForCategory(sectionType as DesignCategoryId)
    return designs.map(designToComponentVariant)
}

interface ComponentLibraryPanelProps {
    section: WireframeSection
    onBackAction: () => void
    className?: string
}

/**
 * ComponentLibraryPanel Component
 * 
 * Design inspiration:
 * - Relume: Component library with thumbnails
 * - Figma: Assets panel with search and filtering
 * - Shadcn: Clean component picker pattern
 * 
 * Allows users to swap the current section's component
 * with a different variant from the library.
 */
export function ComponentLibraryPanel({
    section,
    onBackAction,
    className,
}: ComponentLibraryPanelProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState<'suggested' | 'saved'>('suggested')
    const [savedComponents, setSavedComponents] = useState<string[]>(() => {
        // Load saved components from localStorage
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('scytle_saved_components')
            return saved ? JSON.parse(saved) : []
        }
        return []
    })

    const { setComponent, setActivePanelView, setGhostPreviewLayout, selectedPageId } = useUnifiedStore()

    // Handle layout hover for ghost preview
    const handleComponentHover = useCallback((component: ComponentVariant | null) => {
        if (component) {
            setGhostPreviewLayout({
                type: component.sectionType,
                variant: component.variant,
                name: component.name,
            })
        } else {
            setGhostPreviewLayout(null)
        }
    }, [setGhostPreviewLayout])

    // Get components for this section type (from centralized registry)
    const sectionType = section.type.toLowerCase()
    const availableComponents = useMemo((): ComponentVariant[] => {
        const typeVariants = getVariantsForType(sectionType)

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return typeVariants.filter((c: ComponentVariant) =>
                c.name.toLowerCase().includes(query) ||
                c.id.toLowerCase().includes(query) ||
                c.description.toLowerCase().includes(query)
            )
        }

        return typeVariants
    }, [sectionType, searchQuery])

    // Suggested components (AI would recommend these)
    const suggestedComponents = useMemo((): ComponentVariant[] => {
        return availableComponents.slice(0, 6)
    }, [availableComponents])

    // Saved/bookmarked components
    const savedComponentsList = useMemo((): ComponentVariant[] => {
        return availableComponents.filter((c: ComponentVariant) => savedComponents.includes(c.id))
    }, [availableComponents, savedComponents])

    // Handle component selection
    const handleSelectComponent = useCallback((componentId: string) => {
        if (selectedPageId) {
            setComponent(selectedPageId, section.id, componentId)
        }
        setActivePanelView('section')
    }, [section.id, selectedPageId, setComponent, setActivePanelView])

    // Handle bookmark toggle
    const handleToggleBookmark = useCallback((componentId: string) => {
        setSavedComponents(prev => {
            const newSaved = prev.includes(componentId)
                ? prev.filter(id => id !== componentId)
                : [...prev, componentId]

            // Persist to localStorage
            if (typeof window !== 'undefined') {
                localStorage.setItem('scytle_saved_components', JSON.stringify(newSaved))
            }

            return newSaved
        })
    }, [])

    // Handle shuffle - select random component
    const handleShuffle = useCallback(() => {
        if (availableComponents.length > 0) {
            const randomIndex = Math.floor(Math.random() * availableComponents.length)
            handleSelectComponent(availableComponents[randomIndex].id)
        }
    }, [availableComponents, handleSelectComponent])

    return (
        <div className={cn(
            'flex flex-col h-full min-h-0 bg-background',
            className
        )}>
            {/* Panel Header */}
            <div className="flex items-center gap-2 px-3 py-3 border-b">
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onBackAction}
                    className="h-7 w-7"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-sm font-semibold text-foreground flex-1">
                    Replace Component
                </h2>
            </div>

            {/* Search Bar */}
            <div className="px-3 py-2 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search components..."
                        className="pl-8 h-9"
                    />
                </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'suggested' | 'saved')} className="flex-1 flex flex-col h-0">
                <div className="px-3 pt-2">
                    <TabsList className="w-full">
                        <TabsTrigger value="suggested" className="flex-1 text-xs">
                            Suggested
                        </TabsTrigger>
                        <TabsTrigger value="saved" className="flex-1 text-xs">
                            Saved ({savedComponentsList.length})
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="suggested" className="flex-1 m-0 h-0">
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-2">
                            {suggestedComponents.length === 0 ? (
                                <EmptyState message="No components found for this section type." />
                            ) : (
                                suggestedComponents.map((component: ComponentVariant) => (
                                    <ComponentCard
                                        key={component.id}
                                        component={component}
                                        isSelected={section.componentId === component.id}
                                        isSaved={savedComponents.includes(component.id)}
                                        onSelectAction={() => handleSelectComponent(component.id)}
                                        onToggleBookmarkAction={() => handleToggleBookmark(component.id)}
                                        onHoverAction={handleComponentHover}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="saved" className="flex-1 m-0 h-0">
                    <ScrollArea className="h-full">
                        <div className="p-3 space-y-2">
                            {savedComponentsList.length === 0 ? (
                                <EmptyState message="No saved components yet. Click the bookmark icon to save components." />
                            ) : (
                                savedComponentsList.map((component: ComponentVariant) => (
                                    <ComponentCard
                                        key={component.id}
                                        component={component}
                                        isSelected={section.componentId === component.id}
                                        isSaved={true}
                                        onSelectAction={() => handleSelectComponent(component.id)}
                                        onToggleBookmarkAction={() => handleToggleBookmark(component.id)}
                                        onHoverAction={handleComponentHover}
                                    />
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>

            {/* Shuffle Button */}
            <div className="p-3 border-t">
                <Button
                    variant="ghost"
                    className="w-full justify-center gap-2"
                    onClick={handleShuffle}
                    disabled={availableComponents.length === 0}
                >
                    <Shuffle className="h-4 w-4" />
                    Shuffle component
                </Button>
            </div>
        </div>
    )
}

/**
 * Empty state for component lists
 */
function EmptyState({ message }: { message: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-3">
                <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground max-w-50">
                {message}
            </p>
        </div>
    )
}
