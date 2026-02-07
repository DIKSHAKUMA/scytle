'use client'

import { useState, useCallback, forwardRef } from 'react'
import { GripVertical, Maximize2, Plus, Globe, Trash2, Copy, Sparkles } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { WireframeSection } from '@/types'
import { PlaceholderRenderer } from './placeholder-renderer'

interface SectionBlockProps {
    section: WireframeSection
    isSelected: boolean
    viewport: 'desktop' | 'mobile'
    onSelectAction: (sectionId: string) => void
    onAddBelowAction?: () => void
    onExpandAction?: () => void
    onDeleteAction?: () => void
    onDuplicateAction?: () => void
    onToggleGlobalAction?: () => void
    onGenerateAction?: () => void
    className?: string
    // For dnd-kit
    isDragging?: boolean
    dragHandleProps?: React.HTMLAttributes<HTMLDivElement>
}

/**
 * SectionBlock Component
 * 
 * Design inspiration:
 * - Relume: Clean section cards with hover states
 * - Figma: Selection rings and handles
 * - Webflow: Minimal section headers
 * 
 * A single section within a page frame, showing wireframe
 * placeholders with hover controls for interaction.
 */
export const SectionBlock = forwardRef<HTMLDivElement, SectionBlockProps>(function SectionBlock({
    section,
    isSelected,
    viewport,
    onSelectAction,
    onAddBelowAction,
    onExpandAction,
    onDeleteAction,
    onDuplicateAction,
    onToggleGlobalAction,
    onGenerateAction,
    className,
    isDragging = false,
    dragHandleProps,
}, ref) {
    const [isHovered, setIsHovered] = useState(false)
    const [contextMenuOpen, setContextMenuOpen] = useState(false)

    const handleClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onSelectAction(section.id)
    }, [section.id, onSelectAction])

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        // Only open context menu, don't select (which would open sidebar)
        setContextMenuOpen(true)
    }, [])

    const handleAddClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onAddBelowAction?.()
    }, [onAddBelowAction])

    const handleExpandClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onExpandAction?.()
    }, [onExpandAction])

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onDeleteAction?.()
    }, [onDeleteAction])

    return (
        <div className="relative group" ref={ref}>
            {/* Main Section Block */}
            <div
                className={cn(
                    'relative rounded-lg overflow-hidden cursor-pointer',
                    'transition-all duration-150 ease-out',
                    'bg-white',
                    // Border states
                    isSelected
                        ? 'ring-2 ring-violet-500 ring-offset-2'
                        : isHovered
                            ? 'ring-1 ring-violet-300'
                            : 'ring-1 ring-gray-200',
                    // Dragging state
                    isDragging && 'opacity-50 ring-2 ring-violet-400 shadow-lg',
                    className
                )}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Drag Handle - Left side on hover */}
                <div
                    {...dragHandleProps}
                    className={cn(
                        'absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center',
                        'bg-linear-to-r from-gray-50 to-transparent',
                        'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                        'cursor-grab active:cursor-grabbing z-10'
                    )}
                >
                    <GripVertical className="w-4 h-4 text-gray-400" />
                </div>

                {/* Section Header - Top bar */}
                <div
                    className={cn(
                        'absolute top-0 left-0 right-0 h-8',
                        'flex items-center justify-between px-3',
                        'bg-linear-to-b from-white/95 to-white/0',
                        'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                        'z-10'
                    )}
                >
                    {/* Left: Section info */}
                    <div className="flex items-center gap-2">
                        {section.isGlobal && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-medium">
                                <Globe className="w-3 h-3" />
                                <span>Global</span>
                            </div>
                        )}
                        <span className="text-xs font-medium text-gray-600">
                            {section.name}
                        </span>
                    </div>

                    {/* Right: Action buttons */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handleExpandClick}
                            className={cn(
                                'p-1 rounded hover:bg-gray-100 transition-colors',
                                'text-gray-400 hover:text-gray-600'
                            )}
                            title="Expand"
                        >
                            <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={handleDeleteClick}
                            className={cn(
                                'p-1 rounded hover:bg-red-50 transition-colors',
                                'text-gray-400 hover:text-red-500'
                            )}
                            title="Delete section"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                {/* Placeholder Content */}
                <PlaceholderRenderer
                    section={section}
                    viewport={viewport}
                />
            </div>

            {/* Context Menu (Right-click only) */}
            <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
                <DropdownMenuTrigger asChild>
                    <span className="sr-only">Context menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                    <DropdownMenuItem onClick={onDuplicateAction}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                        <span className="ml-auto text-xs text-muted-foreground">⌘D</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onGenerateAction}>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate copy
                        <span className="ml-auto text-xs text-muted-foreground">⌘G</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onToggleGlobalAction}>
                        <Globe className="w-4 h-4 mr-2" />
                        {section.isGlobal ? 'Unmark global' : 'Make global'}
                        <span className="ml-auto text-xs text-muted-foreground">G</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onAddBelowAction}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add section below
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDeleteAction} className="text-red-600 focus:text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                        <span className="ml-auto text-xs text-muted-foreground">⌫</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Section Button - Below on hover */}
            <div
                className={cn(
                    'absolute -bottom-3 left-1/2 -translate-x-1/2',
                    'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                    'z-20'
                )}
            >
                <button
                    onClick={handleAddClick}
                    className={cn(
                        'flex items-center gap-1 px-2 py-1',
                        'bg-violet-500 hover:bg-violet-600 text-white',
                        'rounded-full text-xs font-medium',
                        'shadow-sm hover:shadow transition-all duration-150',
                        'transform hover:scale-105'
                    )}
                >
                    <Plus className="w-3 h-3" />
                    <span>Section</span>
                </button>
            </div>
        </div>
    )
})

/**
 * SortableSectionBlock
 * 
 * Wrapper that makes SectionBlock draggable with dnd-kit.
 */
export function SortableSectionBlock(props: Omit<SectionBlockProps, 'isDragging' | 'dragHandleProps'>) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: props.section.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div style={style}>
            <SectionBlock
                {...props}
                ref={setNodeRef}
                isDragging={isDragging}
                dragHandleProps={{ ...attributes, ...listeners }}
            />
        </div>
    )
}

/**
 * AddSectionTrigger Component
 * 
 * Shows between sections or at the top/bottom of a page.
 * Minimal line that expands on hover.
 */
interface AddSectionTriggerProps {
    onAddAction: () => void
    className?: string
}

export function AddSectionTrigger({ onAddAction, className }: AddSectionTriggerProps) {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <div
            className={cn(
                'relative h-6 flex items-center justify-center',
                'cursor-pointer group',
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onAddAction}
        >
            {/* Line */}
            <div
                className={cn(
                    'absolute inset-x-4 h-px',
                    'transition-all duration-150',
                    isHovered ? 'bg-violet-300' : 'bg-transparent group-hover:bg-gray-200'
                )}
            />

            {/* Button */}
            <button
                className={cn(
                    'relative z-10 flex items-center gap-1 px-2 py-0.5',
                    'rounded-full text-xs font-medium',
                    'transition-all duration-150',
                    isHovered
                        ? 'bg-violet-500 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 opacity-0 group-hover:opacity-100'
                )}
            >
                <Plus className="w-3 h-3" />
                <span>Add</span>
            </button>
        </div>
    )
}
