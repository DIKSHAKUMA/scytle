'use client'

import { Check, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComponentVariant } from './component-library-panel'
import { WireframeThumbnail } from '../wireframe-thumbnail'

interface ComponentCardProps {
    component: ComponentVariant
    isSelected: boolean
    isSaved: boolean
    onSelectAction: () => void
    onToggleBookmarkAction: () => void
    onHoverAction?: (component: ComponentVariant | null) => void
}

export function ComponentCard({
    component,
    isSelected,
    isSaved,
    onSelectAction,
    onToggleBookmarkAction,
    onHoverAction
}: ComponentCardProps) {
    return (
        <div
            className={cn(
                'group relative rounded-lg border bg-white overflow-hidden cursor-pointer transition-all',
                isSelected
                    ? 'border-blue-500 ring-2 ring-blue-100'
                    : 'border-gray-200 hover:border-gray-300'
            )}
            onClick={onSelectAction}
            onMouseEnter={() => onHoverAction?.(component)}
            onMouseLeave={() => onHoverAction?.(null)}
        >
            {/* Thumbnail Preview - Now using actual wireframe designs */}
            <div className="aspect-video bg-white relative border-b">
                <WireframeThumbnail type={component.sectionType} variant={component.variant} />

                {/* Selected Indicator */}
                {isSelected && (
                    <div className="absolute top-2 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                    </div>
                )}

                {/* Bookmark Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onToggleBookmarkAction()
                    }}
                    className={cn(
                        'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all',
                        isSaved
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600'
                    )}
                >
                    <Bookmark
                        className={cn('h-4 w-4', isSaved && 'fill-current')}
                    />
                </button>
            </div>

            {/* Component Info */}
            <div className="p-2.5">
                <p className="text-xs font-medium text-gray-900 truncate">
                    {component.name}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                    {component.description}
                </p>
            </div>
        </div>
    )
}

