'use client'

import {
    Plus,
    Monitor,
    Tablet,
    Smartphone,
    X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PageFrame } from './page-frame'
import { useUnifiedStore } from '@/store'
import type { WireframePage, ViewportDevice } from '@/types'
import { VIEWPORT_CONFIGS } from '@/types'

// ===== SINGLE VIEWPORT FRAME =====

interface ViewportFrameProps {
    page: WireframePage
    viewport: ViewportDevice
    scale?: number
    isVisible?: boolean
    /** Allow removing this viewport */
    onRemove?: () => void
    /** Select this frame's page */
    onSelect?: () => void
    className?: string
}

/**
 * ViewportFrame Component
 *
 * Figma Sites style: clean breakpoint label above frame.
 * "Desktop · Primary · 1280 +"
 * No collapse arrows — just label + frame.
 */
export function ViewportFrame({
    page,
    viewport,
    scale = 1,
    isVisible = true,
    onRemove,
    onSelect,
    className,
}: ViewportFrameProps) {
    if (!isVisible) return null

    const config = VIEWPORT_CONFIGS[viewport]

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Viewport Label — Figma Sites style, clickable to select frame */}
            <div
                className="flex items-center gap-1.5 mb-2 px-0.5 group cursor-default"
                onClick={(e) => { e.stopPropagation(); onSelect?.() }}
            >
                <span className="text-[11px] font-medium text-muted-foreground/70 tracking-wide">
                    {config.label}
                </span>
                {config.isPrimary && (
                    <>
                        <span className="text-[11px] text-muted-foreground/40">·</span>
                        <span className="text-[11px] text-muted-foreground/40">Primary</span>
                    </>
                )}
                <span className="text-[11px] text-muted-foreground/40">·</span>
                <span className="text-[11px] text-muted-foreground/40">
                    {config.breakpoint}
                </span>

                {/* Remove (×) button — visible on hover */}
                {onRemove && (
                    <button
                        onClick={onRemove}
                        className="ml-auto p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded transition-all"
                        title={`Remove ${config.label} viewport`}
                    >
                        <X className="w-3 h-3 text-muted-foreground" />
                    </button>
                )}
            </div>

            {/* Page Frame */}
            <PageFrame
                page={page}
                viewport={viewport}
                scale={scale}
            />
        </div>
    )
}

// ===== PAGE VIEWPORTS — Figma Sites row of frames per page =====

interface PageViewportsProps {
    page: WireframePage
    scale?: number
    className?: string
}

const DEVICE_ICONS: Record<ViewportDevice, typeof Monitor> = {
    desktop: Monitor,
    tablet: Tablet,
    mobile: Smartphone,
}

/**
 * PageViewports Component
 *
 * Figma Sites style: One row per page containing all active viewport frames
 * side-by-side, with a page header row showing page name and "+" button.
 */
export function PageViewports({ page, scale = 1, className }: PageViewportsProps) {
    const { activeViewports, addViewport, removeViewport, selectPage } = useUnifiedStore()

    return (
        <div className={cn('flex flex-col rounded-[3px] bg-[#eeeee8] border border-black/[0.06] p-6 pb-8', className)}>
            {/* Page Header Row — Figma Sites style, drag handle for free movement */}
            <div data-page-header className="flex items-center justify-between mb-3 px-0.5 cursor-grab active:cursor-grabbing">
                <span
                    className="text-sm font-medium text-foreground cursor-default"
                    onClick={(e) => { e.stopPropagation(); selectPage(page.id) }}
                >
                    {page.name}
                </span>

                {/* "+" button to add viewports */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-muted-foreground hover:text-foreground"
                            title="Add viewport"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        {(['desktop', 'tablet', 'mobile'] as ViewportDevice[]).map(device => {
                            const config = VIEWPORT_CONFIGS[device]
                            const Icon = DEVICE_ICONS[device]
                            const isActive = activeViewports.includes(device)
                            return (
                                <DropdownMenuItem
                                    key={device}
                                    onClick={() => !isActive && addViewport(device)}
                                    disabled={isActive}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        <span>{config.label}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {config.width}
                                    </span>
                                </DropdownMenuItem>
                            )
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem disabled className="flex items-center gap-2 opacity-50">
                            <Plus className="w-4 h-4" />
                            <span>Custom...</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Viewport Frames — side by side */}
            <div className="flex items-start gap-6">
                {activeViewports.map(device => (
                    <ViewportFrame
                        key={device}
                        page={page}
                        viewport={device}
                        scale={scale}
                        isVisible={true}
                        onSelect={() => selectPage(page.id)}
                        onRemove={
                            activeViewports.length > 1
                                ? () => removeViewport(device)
                                : undefined
                        }
                    />
                ))}
            </div>
        </div>
    )
}

// ===== BACKWARD COMPAT =====

export function DualViewport({
    page,
    scale = 1,
}: {
    page: WireframePage
    scale?: number
    desktopVisible?: boolean
    mobileVisible?: boolean
    className?: string
}) {
    return <PageViewports page={page} scale={scale} />
}
