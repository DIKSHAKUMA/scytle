'use client'

import { ChevronDown, Check, Plus, Copy, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useStyleGuideStore } from '@/store'

/**
 * ConceptDropdown — Concept switcher dropdown.
 *
 * Shows the active concept with a command-palette style dropdown
 * for switching, creating, duplicating, and deleting concepts.
 */
export function ConceptDropdown() {
    const data = useStyleGuideStore(s => s.data)
    const switchConcept = useStyleGuideStore(s => s.switchConcept)
    const createConcept = useStyleGuideStore(s => s.createConcept)
    const duplicateConcept = useStyleGuideStore(s => s.duplicateConcept)
    const deleteConcept = useStyleGuideStore(s => s.deleteConcept)

    const activeConcept = data.concepts.find(c => c.id === data.activeConceptId)
    const conceptCount = data.concepts.length

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-full justify-between text-xs font-medium px-2"
                >
                    <span className="truncate">{activeConcept?.name ?? 'Concept 1'}</span>
                    <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
                {/* Concept list */}
                <DropdownMenuGroup>
                    {data.concepts.map(concept => (
                        <DropdownMenuItem
                            key={concept.id}
                            onClick={() => switchConcept(concept.id)}
                            className="text-xs flex items-center justify-between"
                        >
                            <span className="truncate">{concept.name}</span>
                            {concept.id === data.activeConceptId && (
                                <Check className="h-3 w-3 text-foreground shrink-0" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                {/* Actions */}
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        onClick={() => createConcept()}
                        className="text-xs gap-2"
                    >
                        <Plus className="h-3 w-3" />
                        New Concept
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => duplicateConcept(data.activeConceptId)}
                        className="text-xs gap-2"
                    >
                        <Copy className="h-3 w-3" />
                        Duplicate Concept
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => deleteConcept(data.activeConceptId)}
                        className={cn('text-xs gap-2', conceptCount <= 1 && 'opacity-50 pointer-events-none')}
                        disabled={conceptCount <= 1}
                    >
                        <Trash2 className="h-3 w-3" />
                        Delete Concept
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
