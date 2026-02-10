'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Plus, Sparkles } from 'lucide-react'
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
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/button'
import type { WireframePage, ViewportDevice } from '@/types'
import { VIEWPORT_CONFIGS } from '@/types'
import { useUnifiedStore } from '@/store'
import { SortableSectionBlock } from './section-block'
import { PlaceholderRenderer } from './placeholder-renderer'

interface PageFrameProps {
    page: WireframePage
    viewport: ViewportDevice
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
    const [frameWidth, setFrameWidth] = useState(VIEWPORT_CONFIGS[viewport].width)
    const [isResizing, setIsResizing] = useState(false)
    const resizeStartRef = useRef({ x: 0, width: 0, side: '' as 'left' | 'right' })

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
        updateSectionContent,
        openAddSidebar,
        // Ghost preview state
        ghostPreviewLayout,
        addSidebarPageId,
        addSidebarInsertIndex,
        isAddSidebarOpen,
        activePanelView,
    } = useUnifiedStore()

    const isPageSelected = selectedPageId === page.id && !selectedSectionId

    // Reset frame width when viewport changes
    useEffect(() => {
        setFrameWidth(VIEWPORT_CONFIGS[viewport].width)
    }, [viewport])

    // Show ghost preview for Add Sidebar OR for Replace Component library panel
    const showGhostPreviewForAdd = isAddSidebarOpen && ghostPreviewLayout && addSidebarPageId === page.id
    const showGhostPreviewForReplace = activePanelView === 'library' && ghostPreviewLayout && selectedSectionId !== null
    const showGhostPreview = showGhostPreviewForAdd || showGhostPreviewForReplace

    const scaledWidth = frameWidth * scale

    // ===== SIDE RESIZE HANDLES =====
    const handleResizeStart = useCallback((e: React.MouseEvent, side: 'left' | 'right') => {
        e.preventDefault()
        e.stopPropagation()
        setIsResizing(true)
        resizeStartRef.current = { x: e.clientX, width: frameWidth, side }

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - resizeStartRef.current.x
            const delta = resizeStartRef.current.side === 'right' ? dx : -dx
            // Adjust for scale
            const scaledDelta = delta / scale
            const newWidth = Math.max(320, Math.min(1920, resizeStartRef.current.width + scaledDelta))
            setFrameWidth(Math.round(newWidth))
        }

        const handleMouseUp = () => {
            setIsResizing(false)
            document.removeEventListener('mousemove', handleMouseMove)
            document.removeEventListener('mouseup', handleMouseUp)
            document.body.style.cursor = ''
            document.body.style.userSelect = ''
        }

        document.addEventListener('mousemove', handleMouseMove)
        document.addEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = 'col-resize'
        document.body.style.userSelect = 'none'
    }, [frameWidth, scale])

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

            if ((e.key === 'Backspace' || e.key === 'Delete') && !e.metaKey && !e.ctrlKey) {
                const target = e.target as HTMLElement
                if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
                    return
                }
                e.preventDefault()
                deleteSection(page.id, selectedSectionId)
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

    const handleFrameClick = useCallback((e: React.MouseEvent) => {
        // Select the page/frame when clicking its background
        // The sections call e.stopPropagation(), so this only fires for frame bg
        selectPage(page.id)
    }, [page.id, selectPage])

    // Open add section sidebar
    const handleAddSection = useCallback((index: number) => {
        openAddSidebar(page.id, index)
    }, [page.id, openAddSidebar])

    return (
        <div className="relative group/frame">
            {/* Left resize handle */}
            <div
                className={cn(
                    'absolute -left-[5px] top-0 bottom-0 w-[10px] z-10',
                    'cursor-col-resize',
                    'flex items-center justify-center',
                    isResizing ? 'opacity-100' : 'opacity-0 group-hover/frame:opacity-100',
                    'transition-opacity',
                )}
                onMouseDown={(e) => handleResizeStart(e, 'left')}
            >
                <div className="w-[3px] h-8 rounded-full bg-violet-500" />
            </div>

            {/* Right resize handle */}
            <div
                className={cn(
                    'absolute -right-[5px] top-0 bottom-0 w-[10px] z-10',
                    'cursor-col-resize',
                    'flex items-center justify-center',
                    isResizing ? 'opacity-100' : 'opacity-0 group-hover/frame:opacity-100',
                    'transition-opacity',
                )}
                onMouseDown={(e) => handleResizeStart(e, 'right')}
            >
                <div className="w-[3px] h-8 rounded-full bg-violet-500" />
            </div>

            {/* Figma-style frame — clean white artboard */}
            <div
                ref={containerRef}
                className={cn(
                    'flex flex-col bg-white pb-2',
                    'transition-all duration-200',
                    isPageSelected
                        ? 'ring-2 ring-violet-500'
                        : isResizing
                            ? 'ring-2 ring-violet-500'
                            : 'ring-1 ring-black/[0.06] hover:ring-violet-400',
                    className
                )}
                style={{ width: scaledWidth }}
                onClick={handleFrameClick}
            >
                {/* Frame Content — sections */}
                {page.sections.length === 0 ? (
                    <div className="relative">
                        {showGhostPreviewForAdd && (
                            <GhostPreviewBlock
                                type={ghostPreviewLayout.type}
                                variant={ghostPreviewLayout.variant}
                                name={ghostPreviewLayout.name}
                                presetId={ghostPreviewLayout.presetId}
                            />
                        )}
                        {!showGhostPreviewForAdd && (
                            <EmptyPageState onAddSection={() => handleAddSection(0)} />
                        )}
                    </div>
                ) : (
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
                                {showGhostPreviewForAdd && addSidebarInsertIndex === 0 && (
                                    <GhostPreviewBlock
                                        type={ghostPreviewLayout.type}
                                        variant={ghostPreviewLayout.variant}
                                        name={ghostPreviewLayout.name}
                                        presetId={ghostPreviewLayout.presetId}
                                    />
                                )}

                                {page.sections.map((section, index) => (
                                    <div key={section.id} className="relative">
                                        {showGhostPreviewForReplace && selectedSectionId === section.id ? (
                                            <GhostPreviewBlock
                                                type={ghostPreviewLayout.type}
                                                variant={ghostPreviewLayout.variant}
                                                name={ghostPreviewLayout.name}
                                                presetId={ghostPreviewLayout.presetId}
                                            />
                                        ) : (
                                            <SortableSectionBlock
                                                section={section}
                                                isSelected={selectedSectionId === section.id}
                                                viewport={viewport}
                                                editable
                                                onSelectAction={selectSection}
                                                onContentChange={(key, value) => {
                                                    updateSectionContent(page.id, section.id, { [key]: value })
                                                }}
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
                                        )}

                                        {showGhostPreviewForAdd && addSidebarInsertIndex === index + 1 && (
                                            <GhostPreviewBlock
                                                type={ghostPreviewLayout.type}
                                                variant={ghostPreviewLayout.variant}
                                                name={ghostPreviewLayout.name}
                                                presetId={ghostPreviewLayout.presetId}
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

            {/* Width indicator (visible while resizing) */}
            {isResizing && (
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-violet-500 text-white text-[10px] font-medium whitespace-nowrap">
                    {frameWidth}px
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
    /** Preset ID for direct design registry lookup */
    presetId?: string
}

function GhostPreviewBlock({ type, variant, presetId }: GhostPreviewBlockProps) {
    // Use presetId directly as componentId (the design registry resolves it).
    // Fallback: variant alone (often is the preset ID), then type.
    const componentId = presetId || variant || type

    // Construct a minimal section object for PlaceholderRenderer
    const ghostSection = {
        id: 'ghost-preview',
        type,
        name: 'Preview',
        componentId,
        layoutVariant: variant,
        order: 0,
        isGlobal: false,
        content: {},
        controls: {},
    }

    return (
        <div className="animate-in fade-in duration-200">
            <div
                className={cn(
                    "relative border-2 border-dashed border-violet-400 bg-violet-50/30",
                    "overflow-hidden"
                )}
            >
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
