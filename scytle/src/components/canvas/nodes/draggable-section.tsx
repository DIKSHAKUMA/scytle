'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Pencil, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Note: Parent must have 'nodrag' class to prevent ReactFlow from capturing drag events

interface SectionData {
    id: string
    name: string
    description?: string
}

interface DraggableSectionProps {
    section: SectionData
    index: number
    isGlobal: boolean
    onEdit: () => void
    onDelete: () => void
}

export function DraggableSection({
    section,
    index,
    isGlobal,
    onEdit,
    onDelete,
}: DraggableSectionProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                'relative rounded-md border transition-all duration-150',
                'hover:border-primary/50 hover:shadow-sm group/section',
                isDragging && 'opacity-50 shadow-lg z-50',
                isGlobal
                    ? 'bg-emerald-50/50 border-emerald-200/60 dark:bg-emerald-950/20 dark:border-emerald-800/40'
                    : 'bg-background border-border'
            )}
        >
            <div className="flex items-start">
                {/* Drag handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className={cn(
                        'flex items-center justify-center py-3 px-1 border-r border-border/50',
                        'cursor-grab active:cursor-grabbing',
                        'opacity-0 group-hover/section:opacity-100 transition-opacity duration-150',
                        'touch-none' // Prevent touch scrolling while dragging
                    )}
                >
                    <GripVertical className="w-3 h-3 text-muted-foreground/50" />
                </div>

                {/* Section content */}
                <div className="flex-1 px-2.5 py-2 min-w-0">
                    {/* Section name */}
                    <div className="flex items-center gap-2">
                        <div className={cn(
                            'w-1.5 h-1.5 rounded-full shrink-0',
                            isGlobal ? 'bg-emerald-500' : 'bg-primary'
                        )} />
                        <span className="text-sm font-medium text-foreground truncate">
                            {section.name}
                        </span>
                    </div>
                    
                    {/* Section description */}
                    {section.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 pl-3.5">
                            {section.description}
                        </p>
                    )}
                </div>

                {/* Right side actions */}
                <div
                    className={cn(
                        'flex items-center gap-0.5 pr-1 py-2',
                        'opacity-0 group-hover/section:opacity-100 transition-opacity duration-150'
                    )}
                >
                    <button
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                            e.stopPropagation()
                            onEdit()
                        }}
                        title="Edit section"
                    >
                        <Pencil className="w-3 h-3" />
                    </button>
                    <button
                        className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete()
                        }}
                        title="Delete section"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </div>
    )
}
