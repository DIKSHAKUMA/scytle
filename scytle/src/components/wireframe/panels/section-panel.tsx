'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { X, Globe, ChevronRight, Wand2, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUnifiedStore } from '@/store'
import { getTemplateById } from '@/lib/designs/v2/layouts'
import { SectionControls } from './section-controls'
import type { WireframeSection, WireframePage } from '@/types'

interface SectionPanelProps {
    section: WireframeSection
    page: WireframePage
    onCloseAction: () => void
    onOpenLibraryAction?: () => void
    className?: string
}

/**
 * SectionPanel Component
 * 
 * Design inspiration:
 * - Relume: Section editing with component selector
 * - Framer: Clean property controls
 * - Figma: Consistent panel styling
 * 
 * Shows when a section is selected. Allows editing section
 * properties, toggling global, and changing the component.
 */
export function SectionPanel({
    section,
    page,
    onCloseAction,
    onOpenLibraryAction,
    className,
}: SectionPanelProps) {
    const [name, setName] = useState(section.name)
    const [description, setDescription] = useState(section.description || '')

    const {
        updateSection,
        updateSectionControls,
        toggleGlobalSection,
        setActivePanelView,
        selectedPageId,
    } = useUnifiedStore()

    // Look up the current template from the V2 registry
    const { displayName, displaySubtitle } = useMemo(() => {
        if (!section.componentId) return { displayName: undefined, displaySubtitle: undefined }

        // V2: Check template registry
        const v2Template = getTemplateById(section.componentId)
        if (v2Template) {
            return {
                displayName: v2Template.name,
                displaySubtitle: v2Template.category.charAt(0).toUpperCase() + v2Template.category.slice(1),
            }
        }

        return { displayName: undefined, displaySubtitle: undefined }
    }, [section.componentId])

    // Sync local state when section changes
    useEffect(() => {
        setName(section.name)
        setDescription(section.description || '')
    }, [section.id, section.name, section.description])

    // Debounced save for name
    const handleNameChange = useCallback((value: string) => {
        setName(value)
        if (selectedPageId) {
            updateSection(selectedPageId, section.id, { name: value })
        }
    }, [section.id, selectedPageId, updateSection])

    // Debounced save for description
    const handleDescriptionChange = useCallback((value: string) => {
        setDescription(value)
        if (selectedPageId) {
            updateSection(selectedPageId, section.id, { description: value })
        }
    }, [section.id, selectedPageId, updateSection])

    const handleToggleGlobal = useCallback(() => {
        if (selectedPageId) {
            toggleGlobalSection(selectedPageId, section.id)
        }
    }, [section.id, selectedPageId, toggleGlobalSection])

    const handleOpenLibrary = useCallback(() => {
        if (onOpenLibraryAction) {
            onOpenLibraryAction()
        } else {
            setActivePanelView('library')
        }
    }, [onOpenLibraryAction, setActivePanelView])

    const handleGenerateCopy = useCallback(() => {
        // TODO: Implement AI copy generation for section
        console.log('✨ Generate copy for section:', section.id)
    }, [section.id])

    const handleControlChange = useCallback((key: string, value: string | number | boolean) => {
        if (selectedPageId) {
            updateSectionControls(selectedPageId, section.id, { [key]: value })
        }
    }, [section.id, selectedPageId, updateSectionControls])

    // V2: When axis controls resolve a new layout, update componentId via setComponent
    const { setComponent } = useUnifiedStore()
    const handleComponentChange = useCallback((newComponentId: string) => {
        if (selectedPageId) {
            setComponent(selectedPageId, section.id, newComponentId)
        }
    }, [section.id, selectedPageId, setComponent])

    return (
        <div className={cn(
            'flex flex-col h-full min-h-0 w-full max-w-full bg-background overflow-hidden',
            className
        )}>
            {/* Panel Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 w-full">
                <h2 className="text-sm font-semibold text-foreground">Section</h2>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onCloseAction}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Panel Content */}
            <ScrollArea className="flex-1 min-h-0 w-full">
                <div className="p-4 space-y-4 w-full max-w-full box-border">
                    {/* Global Section Toggle */}
                    <Button
                        variant={section.isGlobal ? 'secondary' : 'outline'}
                        className={cn(
                            'w-full justify-start h-10',
                            section.isGlobal && 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                        )}
                        onClick={handleToggleGlobal}
                    >
                        <Globe className={cn(
                            'h-4 w-4 mr-2',
                            section.isGlobal ? 'text-emerald-600' : 'text-muted-foreground'
                        )} />
                        {section.isGlobal ? 'Global section' : 'Make a global section'}
                        {section.isGlobal && (
                            <span className="ml-auto text-xs text-emerald-600">✓</span>
                        )}
                    </Button>

                    {section.isGlobal && (
                        <p className="text-xs text-muted-foreground">
                            Changes sync across all pages using this section.
                        </p>
                    )}

                    <Separator />

                    {/* Name Field */}
                    <div className="space-y-1.5 w-full max-w-full">
                        <Label htmlFor="section-name" className="text-xs font-medium">
                            Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="section-name"
                            value={name}
                            onChange={(e) => handleNameChange(e.target.value)}
                            placeholder="Section name"
                            className="h-9 w-full max-w-full"
                        />
                    </div>

                    {/* Description Field */}
                    <div className="space-y-1.5 w-full max-w-full">
                        <Label htmlFor="section-description" className="text-xs font-medium">
                            Description
                        </Label>
                        <Textarea
                            id="section-description"
                            value={description}
                            onChange={(e) => handleDescriptionChange(e.target.value)}
                            placeholder="Describe this section..."
                            rows={3}
                            className="resize-none text-sm min-h-18 w-full max-w-full"
                        />
                    </div>

                    <Separator />

                    {/* Component Selector — Opens library panel */}
                    <button
                        onClick={handleOpenLibrary}
                        className={cn(
                            'w-full flex items-center gap-3 p-3',
                            'bg-muted/50 rounded-lg',
                            'hover:bg-muted transition-colors',
                            'cursor-pointer text-left',
                            'overflow-hidden'
                        )}
                    >
                        {/* Icon preview */}
                        <div className="w-10 h-10 bg-background rounded-lg border flex items-center justify-center shrink-0 overflow-hidden">
                            <Layers className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="text-sm font-medium truncate">
                                {displayName ?? section.name}
                            </div>
                            <div className="text-xs text-muted-foreground capitalize truncate">
                                {displaySubtitle ?? section.type}
                            </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>

                    <Separator />

                    {/* Section-Specific Controls */}
                    <SectionControls
                        componentId={section.componentId}
                        sectionType={section.type}
                        controls={section.controls}
                        onControlChangeAction={handleControlChange}
                        onComponentChangeAction={handleComponentChange}
                    />

                    <Separator />

                    {/* Generate Copy Button */}
                    <Button
                        variant="ghost"
                        className="w-full justify-start h-9 px-3 text-sm font-normal"
                        onClick={handleGenerateCopy}
                    >
                        <Wand2 className="h-4 w-4 mr-2 text-muted-foreground" />
                        Generate copy
                    </Button>
                </div>
            </ScrollArea>
        </div>
    )
}
