'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { ChevronDown, ChevronRight, MoreHorizontal, Copy, Trash2, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import type { WireframePage } from '@/types'
import { useUnifiedStore } from '@/store'
import { SortableSectionBlock } from './section-block'
import { PlaceholderRenderer } from './placeholder-renderer'

interface PageFrameProps {
    page: WireframePage
    viewport: 'desktop' | 'mobile'
    scale?: number
    className?: string
}

/**
 * PageFrame Component
 * 
 * Design inspiration:
 * - Figma: Artboard frames with collapsible headers
 * - Relume: Clean page containers with section blocks
 * - Webflow: White canvas with subtle shadows
 * 
 * This is the white "artboard" that contains sections for each page.
 * Shows page name in header with options menu.
 */
export function PageFrame({ page, viewport, scale = 1, className }: PageFrameProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState(page.name)

    const {
        selectedPageId,
        selectedSectionId,
        selectPage,
        selectSection,
        deselectAll,
        reorderSections,
        deleteSection,
        duplicateSection,
        toggleGlobalSection,
        syncGlobalSection,
        openAddSidebar,
        // Ghost preview state
        ghostPreviewLayout,
        addSidebarPageId,
        addSidebarInsertIndex,
        isAddSidebarOpen,
        activePanelView,
    } = useUnifiedStore()

    const isPageSelected = selectedPageId === page.id && !selectedSectionId

    // Show ghost preview for Add Sidebar OR for Replace Component library panel
    // For add sidebar: show at insert position
    // For library panel: show in place of the selected section
    const showGhostPreviewForAdd = isAddSidebarOpen && ghostPreviewLayout && addSidebarPageId === page.id
    const showGhostPreviewForReplace = activePanelView === 'library' && ghostPreviewLayout && selectedSectionId !== null
    const showGhostPreview = showGhostPreviewForAdd || showGhostPreviewForReplace

    // Frame dimensions based on viewport
    const frameWidth = viewport === 'desktop' ? 1280 : 375
    const scaledWidth = frameWidth * scale

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8, // 8px movement before drag starts
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // Handle drag end
    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = page.sections.findIndex((s) => s.id === active.id)
            const newIndex = page.sections.findIndex((s) => s.id === over.id)

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderSections(page.id, oldIndex, newIndex)
            }
        }
    }, [page.id, page.sections, reorderSections])

    // Keyboard navigation for sections
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Only handle if this page's section is selected
            if (!selectedSectionId) return
            const currentIndex = page.sections.findIndex(s => s.id === selectedSectionId)
            if (currentIndex === -1) return

            if (e.key === 'ArrowDown' || e.key === 'j') {
                e.preventDefault()
                const nextIndex = Math.min(currentIndex + 1, page.sections.length - 1)
                selectSection(page.sections[nextIndex].id)
            }

            if (e.key === 'ArrowUp' || e.key === 'k') {
                e.preventDefault()
                const prevIndex = Math.max(currentIndex - 1, 0)
                selectSection(page.sections[prevIndex].id)
            }

            if (e.key === 'Escape') {
                deselectAll()
            }

            // Delete section with Backspace or Delete
            if ((e.key === 'Backspace' || e.key === 'Delete') && !e.metaKey && !e.ctrlKey) {
                // Don't delete if user is typing in an input
                const target = e.target as HTMLElement
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return
                }
                e.preventDefault()
                deleteSection(page.id, selectedSectionId)
                // Select next or previous section
                if (page.sections.length > 1) {
                    const nextIndex = Math.min(currentIndex, page.sections.length - 2)
                    const nextSection = page.sections.filter(s => s.id !== selectedSectionId)[nextIndex]
                    if (nextSection) {
                        selectSection(nextSection.id)
                    }
                } else {
                    selectPage(page.id)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [selectedSectionId, page.sections, page.id, selectSection, selectPage, deselectAll, deleteSection])

    const handleHeaderClick = useCallback(() => {
        selectPage(page.id)
    }, [page.id, selectPage])

    const handleNameDoubleClick = useCallback(() => {
        setIsEditingName(true)
    }, [])

    const handleNameBlur = useCallback(() => {
        setIsEditingName(false)
        // TODO: Save name change
    }, [])

    const handleNameKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setIsEditingName(false)
            // TODO: Save name change
        }
        if (e.key === 'Escape') {
            setEditedName(page.name)
            setIsEditingName(false)
        }
    }, [page.name])

    // Open add section sidebar instead of popup picker
    const handleAddSection = useCallback((index: number) => {
        openAddSidebar(page.id, index)
    }, [page.id, openAddSidebar])

    return (
        <div
            ref={containerRef}
            className={cn(
                'flex flex-col bg-white rounded-lg shadow-sm',
                'transition-all duration-200',
                isPageSelected ? 'ring-2 ring-violet-500 ring-offset-2' : 'ring-1 ring-gray-200',
                className
            )}
            style={{ width: scaledWidth }}
        >
            {/* Frame Header - Figma-style */}
            <div
                className={cn(
                    'flex items-center justify-between px-3 py-2',
                    'cursor-pointer hover:bg-gray-50 transition-colors',
                    'rounded-t-lg border-b border-gray-100'
                )}
                onClick={handleHeaderClick}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Collapse toggle */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsCollapsed(!isCollapsed)
                        }}
                        className="p-0.5 hover:bg-gray-200 rounded transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-gray-500" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-500" />
                        )}
                    </button>

                    {/* Page name - editable on double click */}
                    {isEditingName ? (
                        <input
                            type="text"
                            value={editedName}
                            onChange={(e) => setEditedName(e.target.value)}
                            onBlur={handleNameBlur}
                            onKeyDown={handleNameKeyDown}
                            autoFocus
                            className={cn(
                                'flex-1 px-1.5 py-0.5 text-sm font-medium',
                                'border border-violet-500 rounded outline-none',
                                'bg-white'
                            )}
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span
                            className="text-sm font-medium text-gray-900 truncate"
                            onDoubleClick={handleNameDoubleClick}
                        >
                            {page.name}
                        </span>
                    )}

                    {/* Slug badge */}
                    <span className="text-xs text-gray-400 truncate hidden sm:inline">
                        {page.slug}
                    </span>
                </div>

                {/* Options menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate Page
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Page
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Frame Content - Section blocks */}
            {!isCollapsed && (
                <div className="flex-1">
                    {page.sections.length === 0 ? (
                        /* Empty state with ghost preview support */
                        <div className="relative">
                            {showGhostPreviewForAdd && (
                                <GhostPreviewBlock
                                    type={ghostPreviewLayout.type}
                                    variant={ghostPreviewLayout.variant}
                                    name={ghostPreviewLayout.name}
                                />
                            )}
                            {!showGhostPreviewForAdd && (
                                <EmptyPageState onAddSection={() => handleAddSection(0)} />
                            )}
                        </div>
                    ) : (
                        /* Section blocks with drag & drop */
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={page.sections.map(s => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="relative">
                                    {/* Ghost preview at insert position 0 (for Add mode) */}
                                    {showGhostPreviewForAdd && addSidebarInsertIndex === 0 && (
                                        <GhostPreviewBlock
                                            type={ghostPreviewLayout.type}
                                            variant={ghostPreviewLayout.variant}
                                            name={ghostPreviewLayout.name}
                                        />
                                    )}

                                    {page.sections.map((section, index) => (
                                        <div key={section.id}>
                                            {/* Ghost preview replaces the selected section when in Replace mode */}
                                            {showGhostPreviewForReplace && selectedSectionId === section.id ? (
                                                <div className="px-3">
                                                    <GhostPreviewBlock
                                                        type={ghostPreviewLayout.type}
                                                        variant={ghostPreviewLayout.variant}
                                                        name={ghostPreviewLayout.name}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="px-3">
                                                    <SortableSectionBlock
                                                        section={section}
                                                        isSelected={selectedSectionId === section.id}
                                                        viewport={viewport}
                                                        onSelectAction={selectSection}
                                                        onAddBelowAction={() => handleAddSection(index + 1)}
                                                        onDeleteAction={() => deleteSection(page.id, section.id)}
                                                        onDuplicateAction={() => duplicateSection(page.id, section.id)}
                                                        onToggleGlobalAction={() => {
                                                            toggleGlobalSection(page.id, section.id)
                                                            if (!section.isGlobal) {
                                                                syncGlobalSection(section.id)
                                                            }
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            {/* Ghost preview at this position (for Add mode) */}
                                            {showGhostPreviewForAdd && addSidebarInsertIndex === index + 1 && (
                                                <GhostPreviewBlock
                                                    type={ghostPreviewLayout.type}
                                                    variant={ghostPreviewLayout.variant}
                                                    name={ghostPreviewLayout.name}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            )}
        </div>
    )
}

/**
 * Empty Page State
 * 
 * Shows when a page has no sections.
 * Clean, minimal design with two action options.
 */
interface EmptyPageStateProps {
    onAddSection: () => void
    onGenerate?: () => void
}

function EmptyPageState({ onAddSection, onGenerate }: EmptyPageStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            {/* Icon */}
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Plus className="w-5 h-5 text-gray-400" />
            </div>

            {/* Message */}
            <p className="text-sm text-muted-foreground mb-6">
                Add sections to build your page
            </p>

            {/* Actions */}
            <div className="flex gap-3">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onAddSection}
                    className="gap-1.5"
                >
                    <Plus className="w-4 h-4" />
                    Section
                </Button>
                <Button
                    variant="default"
                    size="sm"
                    onClick={onGenerate}
                    className="gap-1.5"
                >
                    <Sparkles className="w-4 h-4" />
                    Generate
                </Button>
            </div>
        </div>
    )
}

/**
 * GhostPreviewBlock Component
 * 
 * Shows a transparent preview of the section that will be added
 * when the user clicks on a layout in the sidebar.
 * Uses PlaceholderRenderer for actual design matching.
 */
interface GhostPreviewBlockProps {
    type: string
    variant?: string
    name: string
}

function GhostPreviewBlock({ type, variant }: GhostPreviewBlockProps) {
    // Construct a minimal section object for PlaceholderRenderer
    const ghostSection = {
        id: 'ghost-preview',
        type,
        name: 'Preview',
        componentId: variant ? `${type}-${variant}` : type,
        layoutVariant: variant,
        order: 0,
        isGlobal: false,
        content: {},
        controls: {},
    }

    return (
        <div className="px-3 py-2 animate-in fade-in duration-200">
            <div
                className={cn(
                    "relative rounded-lg border-2 border-dashed border-violet-400 bg-violet-50/30",
                    "overflow-hidden"
                )}
            >
                {/* Content with reduced opacity - using PlaceholderRenderer for actual design */}
                <div className="opacity-50">
                    <PlaceholderRenderer
                        section={ghostSection}
                        viewport="desktop"
                    />
                </div>
            </div>
        </div>
    )
}
