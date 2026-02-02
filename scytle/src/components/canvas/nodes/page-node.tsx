'use client'

import { memo, useState } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import {
    ChevronRight,
    MoreHorizontal,
    Plus,
    Trash2,
    GripVertical,
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

interface PageNodeData {
    label: string
    slug?: string
    sections?: string[]
    description?: string
}

export const PageNode = memo(function PageNode({
    data,
    selected,
    id,
}: NodeProps & { data: PageNodeData }) {
    const sections = data.sections || []
    const isHomePage = id === 'home' || data.slug === '/'
    const [menuSearch, setMenuSearch] = useState('')

    const PageIcon = isHomePage ? Home : FileText

    return (
        <div
            className={cn(
                'group relative bg-background rounded-lg shadow-md transition-all duration-150',
                'border-2 min-w-[220px] max-w-[260px]',
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
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                    <PageIcon className="w-4 h-4 text-muted-foreground/70 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{data.label}</h3>
                    </div>
                </div>

                {/* Actions dropdown - Relume-style context menu */}
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
                        {/* Search */}
                        <div className="px-2 pb-2">
                            <Input
                                placeholder="Search actions..."
                                value={menuSearch}
                                onChange={(e) => setMenuSearch(e.target.value)}
                                className="h-8 text-xs"
                            />
                        </div>
                        <DropdownMenuSeparator />

                        {/* AI Actions */}
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
                                <DropdownMenuItem>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate new sitemap
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Generate new page
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>

                        <DropdownMenuSeparator />

                        {/* Edit actions */}
                        <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                            <span className="ml-auto text-xs text-muted-foreground">⌘D</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                            <span className="ml-auto text-xs text-muted-foreground">⌫</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Copy
                            <span className="ml-auto text-xs text-muted-foreground">⌘C</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Scissors className="w-4 h-4 mr-2" />
                            Cut
                            <span className="ml-auto text-xs text-muted-foreground">⌘X</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <ClipboardPaste className="w-4 h-4 mr-2" />
                            Paste
                            <span className="ml-auto text-xs text-muted-foreground">⌘V</span>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {/* Add actions */}
                        <DropdownMenuItem>
                            <Plus className="w-4 h-4 mr-2" />
                            Add page
                            <span className="ml-auto text-xs text-muted-foreground">⌘↵</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            <Plus className="w-4 h-4 mr-2" />
                            Add section
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Sections list */}
            <div className="p-2">
                {sections.length > 0 ? (
                    <div className="space-y-1">
                        {sections.map((section, index) => (
                            <div
                                key={index}
                                className={cn(
                                    'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs',
                                    'bg-muted/50 hover:bg-muted transition-colors cursor-pointer',
                                    'group/section'
                                )}
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
                                <span className="flex-1 truncate text-muted-foreground">
                                    {section}
                                </span>
                                <ChevronRight className="w-3 h-3 text-muted-foreground/50 opacity-0 group-hover/section:opacity-100" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-xs text-muted-foreground text-center py-2">
                        Click to add sections
                    </div>
                )}
            </div>

            {/* Hover actions - Relume style (below the node) */}
            <div
                className={cn(
                    'absolute -bottom-12 left-0 right-0 flex flex-col gap-1 px-2',
                    'opacity-0 group-hover:opacity-100 transition-opacity duration-150',
                    'pointer-events-none group-hover:pointer-events-auto'
                )}
            >
                <button
                    className={cn(
                        'w-full flex items-center justify-center gap-2 py-2 rounded-md',
                        'bg-background border border-border shadow-sm',
                        'text-xs text-muted-foreground hover:text-foreground hover:border-primary/50',
                        'transition-all'
                    )}
                >
                    <Plus className="w-3 h-3" />
                    Section
                </button>
                <button
                    className={cn(
                        'w-full flex items-center justify-center gap-2 py-2 rounded-md',
                        'bg-background border border-border shadow-sm',
                        'text-xs text-primary hover:bg-primary/5 hover:border-primary/50',
                        'transition-all'
                    )}
                >
                    <Sparkles className="w-3 h-3" />
                    Generate content
                </button>
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
