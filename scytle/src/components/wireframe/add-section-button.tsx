'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUnifiedStore } from '@/store'
import { SectionPicker } from './section-picker'

interface AddSectionButtonProps {
    pageId: string
    insertIndex: number
    className?: string
}

/**
 * AddSectionButton Component
 * 
 * Design inspiration:
 * - Notion: "+" button that appears between blocks
 * - Webflow: Add element between sections
 * - Relume: Insert section control
 * 
 * Shows a subtle "+" line between sections.
 * On hover, expands to show the add button.
 * On click, opens the section picker.
 */
export function AddSectionButton({
    pageId,
    insertIndex,
    className,
}: AddSectionButtonProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const zoomLevel = useUnifiedStore(state => state.zoomLevel)
    const inverseScale = Math.min(100 / zoomLevel, 2) // cap at 2x to prevent oversized buttons

    // Hide when zoomed out below threshold; inverse-scale when visible
    const ZOOM_THRESHOLD = 15
    if (zoomLevel < ZOOM_THRESHOLD) return null

    return (
        <div
            className={cn(
                'relative group h-6 flex items-center justify-center',
                'transition-all duration-200',
                isHovered || isPickerOpen ? 'h-8' : 'h-3',
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => !isPickerOpen && setIsHovered(false)}
        >
            {/* Horizontal Line */}
            <div
                className={cn(
                    'absolute inset-x-4 h-px bg-transparent transition-colors duration-200',
                    (isHovered || isPickerOpen) && 'bg-primary/30'
                )}
            />

            {/* Add Button - inverse zoom scaled (capped) */}
            <button
                onClick={() => setIsPickerOpen(true)}
                className={cn(
                    'relative z-10 flex items-center justify-center',
                    'w-5 h-5 rounded-full bg-primary text-primary-foreground',
                    'shadow-sm hover:shadow-md',
                    'transition-all duration-200',
                    'opacity-0',
                    (isHovered || isPickerOpen) && 'opacity-100'
                )}
                style={{
                    transform: `scale(${inverseScale})`,
                }}
            >
                <Plus className="h-3 w-3" />
            </button>

            {/* Section Picker */}
            {isPickerOpen && (
                <SectionPicker
                    pageId={pageId}
                    insertIndex={insertIndex}
                    onCloseAction={() => {
                        setIsPickerOpen(false)
                        setIsHovered(false)
                    }}
                />
            )}
        </div>
    )
}
