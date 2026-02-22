'use client'

import { useMemo, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { useUnifiedStore } from '@/store'
import { PagePanel } from './panels/page-panel'
import { SectionPanel } from './panels/section-panel'
import { ComponentLibraryPanel } from './panels/component-library-panel'
import { StyleGuidePanel } from './panels/style-guide-panel'
import { SchemePickerPanel } from './panels/scheme-picker-panel'
import { ImageControlsPanel } from './panels/image-controls-panel'
import { VideoControlsPanel } from './panels/video-controls-panel'

interface WireframeSidebarProps {
    className?: string
}

/**
 * WireframeSidebar Component
 * 
 * Design inspiration:
 * - Figma: Context-sensitive panels that slide in
 * - Linear: Smooth transitions, minimal chrome
 * - Notion: Clean panel switching
 * 
 * Shows the appropriate panel based on selection:
 * - Page Panel: When a page is selected (but not a section)
 * - Section Panel: When a section is selected
 * - Library Panel: When browsing component variants
 * - Hidden: When nothing is selected
 */
export function WireframeSidebar({ className }: WireframeSidebarProps) {
    const {
        pages,
        selectedPageId,
        selectedSectionId,
        activePanelView,
        deselectAll,
        setActivePanelView,
    } = useUnifiedStore()

    // Get selected page
    const selectedPage = useMemo(() => {
        if (!selectedPageId) return null
        return pages.find(p => p.id === selectedPageId) ?? null
    }, [pages, selectedPageId])

    // Get selected section
    const selectedSection = useMemo(() => {
        if (!selectedSectionId || !selectedPage) return null
        return selectedPage.sections.find(s => s.id === selectedSectionId) ?? null
    }, [selectedPage, selectedSectionId])

    // Determine if sidebar should be visible
    const isVisible = activePanelView === 'page' || activePanelView === 'section' || activePanelView === 'library' || activePanelView === 'style-guide' || activePanelView === 'scheme-picker' || activePanelView === 'image-controls' || activePanelView === 'video-controls'

    // Handle close
    const handleClose = () => {
        deselectAll()
    }

    // Handle open library (for component picker)
    const handleOpenLibrary = () => {
        setActivePanelView('library')
    }

    // Handle back from library to section panel
    const handleBackFromLibrary = () => {
        setActivePanelView('section')
    }

    // Stop wheel events from propagating to the canvas
    const handleWheel = useCallback((e: React.WheelEvent) => {
        e.stopPropagation()
    }, [])

    return (
        <div
            data-wireframe-sidebar
            className={cn(
                'absolute left-14 top-0 bottom-0 w-72 max-w-72 bg-background border-r z-20',
                'flex flex-col overflow-hidden',
                !isVisible && 'hidden',
                className
            )}
            onWheel={handleWheel}
        >
            {/* Page Panel */}
            {activePanelView === 'page' && selectedPage && (
                <PagePanel
                    page={selectedPage}
                    onCloseAction={handleClose}
                    className="flex-1"
                />
            )}

            {/* Section Panel */}
            {activePanelView === 'section' && selectedSection && selectedPage && (
                <SectionPanel
                    section={selectedSection}
                    page={selectedPage}
                    onCloseAction={handleClose}
                    onOpenLibraryAction={handleOpenLibrary}
                    className="flex-1"
                />
            )}

            {/* Component Library Panel */}
            {activePanelView === 'library' && selectedSection && (
                <ComponentLibraryPanel
                    section={selectedSection}
                    onBackAction={handleBackFromLibrary}
                    className="flex-1"
                />
            )}

            {/* Style Guide Panel */}
            {activePanelView === 'style-guide' && (
                <StyleGuidePanel
                    onCloseAction={handleClose}
                    className="flex-1"
                />
            )}

            {/* Scheme Picker Panel */}
            {activePanelView === 'scheme-picker' && selectedSection && (
                <SchemePickerPanel
                    sectionId={selectedSection.id}
                    onBackAction={handleBackFromLibrary}
                    onCloseAction={handleClose}
                    className="flex-1"
                />
            )}

            {/* Image Controls Panel */}
            {activePanelView === 'image-controls' && selectedSection && selectedPage && (
                <ImageControlsPanel
                    pageId={selectedPage.id}
                    sectionId={selectedSection.id}
                    onBackAction={handleBackFromLibrary}
                    onCloseAction={handleClose}
                    className="flex-1"
                />
            )}

            {/* Video Controls Panel */}
            {activePanelView === 'video-controls' && selectedSection && selectedPage && (
                <VideoControlsPanel
                    pageId={selectedPage.id}
                    sectionId={selectedSection.id}
                    onBackAction={handleBackFromLibrary}
                    onCloseAction={handleClose}
                    className="flex-1"
                />
            )}
        </div>
    )
}
