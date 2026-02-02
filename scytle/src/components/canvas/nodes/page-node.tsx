'use client'

import { memo, useState, useCallback } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
    MoreHorizontal,
    Plus,
    Trash2,
    Sparkles,
    Copy,
    Scissors,
    ClipboardPaste,
    Home,
    FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { useSitemapStore } from '@/store/sitemap-store'
import { DraggableSection } from './draggable-section'

// Section can be either a string (legacy) or an object with name/description
interface SectionData {
    id?: string
    name: string
    description?: string
}

interface PageNodeData {
    label: string
    slug?: string
    sections?: (string | SectionData)[]
    description?: string
}

// Helper to normalize section data
function normalizeSection(section: string | SectionData, index: number, pageId: string): SectionData & { id: string } {
    if (typeof section === 'string') {
        return { id: `${pageId}-section-${index}`, name: section, description: '' }
    }
    return { ...section, id: section.id || `${pageId}-section-${index}` }
}

export const PageNode = memo(function PageNode({
    data,
    selected,
    id,
}: NodeProps & { data: PageNodeData }) {
    const rawSections = data.sections || []
    const sections = rawSections.map((s, i) => normalizeSection(s, i, id))
    const isHomePage = id === 'home' || data.slug === '/'
    const [menuSearch, setMenuSearch] = useState('')
    const [hoveredGapIndex, setHoveredGapIndex] = useState<number | null>(null)

    // Store actions
    const { openSectionPicker, removeSectionFromPage, moveSectionInPage } = useSitemapStore()

    const PageIcon = isHomePage ? Home : FileText

    // Check if section is a global section (Navbar/Footer)
    const isGlobalSection = (name: string) => {
        const lower = name.toLowerCase()
        return lower === 'navbar' || lower === 'footer' || lower === 'header' || lower === 'navigation'
    }

    const handleAddSection = (atIndex: number) => {
        openSectionPicker(id, atIndex)
    }

    const handleDeleteSection = (index: number) => {
        removeSectionFromPage(id, index)
    }

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // 5px movement required before drag starts
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
            const oldIndex = sections.findIndex(s => s.id === active.id)
            const newIndex = sections.findIndex(s => s.id === over.id)
            
            if (oldIndex !== -1 && newIndex !== -1) {
                moveSectionInPage(id, oldIndex, newIndex)
            }
        }
    }, [sections, id, moveSectionInPage])

    return (
        <div
            className={cn(
                'group relative bg-background rounded-lg shadow-md transition-all duration-150',
                'border-2 min-w-[260px] max-w-[300px]',
                selected
                    ? 'border-primary shadow-lg shadow-primary/10'
                    : 'border-border hover:border-primary/40 hover:shadow-lg'
            )}
        >
            {/* Top handle */}
            <Handle
                type="target"
                position={Position.Top}
                className="!w-3 !h-3 !bg-primary !border-2 !border-background !-top-1.5"
            />

            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <PageIcon className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{data.label}</h3>
                    </div>
                </div>

                {/* Actions dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className={cn(
                                'p-1 rounded hover:bg-muted transition-colors',
                                'opacity-0 group-hover:opacity-100 focus:opacity-100',
                                selected && 'opacity-100'
                            )}
                        >
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <div className="px-2 pb-2">
                            <Input
                                placeholder="Search actions..."
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                        <DropdownMenuSeparator />

                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Sparkles className="w-4 h-4 mr-2 text-primary" />
                                Ask AI
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-48">
                                <DropdownMenuItem>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate page
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Edit sitemap prompt
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Scissors className="w-4 h-4 mr-2" />
                            Cut
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <ClipboardPaste className="w-4 h-4 mr-2" />
                            Paste
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem>
                            <Plus className="w-4 h-4 mr-2" />
                            Add child page
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Sections list with drag and drop */}
            <div className="p-2 nodrag">
                {sections.length > 0 ? (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sections.map(s => s.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-1">
                                {sections.map((section, index) => (
                                    <div key={section.id}>
                                        {/* Gap with + button (between sections) */}
                                        {index > 0 && (
                                            <div
                                                className="relative h-2 -my-0.5 flex items-center justify-center"
                                                onMouseEnter={() => setHoveredGapIndex(index)}
                                                onMouseLeave={() => setHoveredGapIndex(null)}
                                            >
                                                {/* Hover line */}
                                                <div
                                                    className={cn(
                                                        'absolute inset-x-2 h-0.5 rounded-full transition-all duration-150',
                                                        hoveredGapIndex === index
                                                            ? 'bg-primary/40'
                                                            : 'bg-transparent'
                                                    )}
                                                />
                                                {/* Add button */}
                                                <button
                                                    className={cn(
                                                        'absolute z-10 w-5 h-5 rounded-full',
                                                        'bg-primary text-primary-foreground',
                                                        'flex items-center justify-center',
                                                        'shadow-md hover:scale-110 transition-all duration-150',
                                                        hoveredGapIndex === index
                                                            ? 'opacity-100 scale-100'
                                                            : 'opacity-0 scale-75 pointer-events-none'
                                                    )}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleAddSection(index)
                                                    }}
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                        )}

                                        {/* Draggable section */}
                                        <DraggableSection
                                            section={section}
                                            index={index}
                                            isGlobal={isGlobalSection(section.name)}
                                            onEdit={() => console.log('Edit section:', section.name)}
                                            onDelete={() => handleDeleteSection(index)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                ) : null}

                {/* Add section button at end */}
                <div
                    className="mt-1"
                    onMouseEnter={() => setHoveredGapIndex(sections.length)}
                    onMouseLeave={() => setHoveredGapIndex(null)}
                >
                    <button
                        className={cn(
                            'w-full flex items-center justify-center gap-1.5 py-2',
                            'rounded-md border-2 border-dashed',
                            'text-xs transition-all duration-150',
                            hoveredGapIndex === sections.length || sections.length === 0
                                ? 'border-primary/40 text-primary bg-primary/5'
                                : 'border-muted-foreground/20 text-muted-foreground'
                        )}
                        onClick={() => handleAddSection(sections.length)}
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Section
                    </button>
                </div>
            </div>

            {/* Bottom handle */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-primary !border-2 !border-background !-bottom-1.5"
            />
        </div>
    )
})
