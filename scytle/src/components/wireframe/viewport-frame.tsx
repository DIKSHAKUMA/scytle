'use client'

import { cn } from '@/lib/utils'
import { PageFrame } from './page-frame'
import type { WireframePage } from '@/types'

interface ViewportFrameProps {
    page: WireframePage
    viewport: 'desktop' | 'mobile'
    scale?: number
    isVisible?: boolean
    className?: string
}

/**
 * ViewportFrame Component
 * 
 * Design inspiration:
 * - Figma Sites: Breakpoint labels above frames ("Desktop · Primary · 1280 +")
 * - Webflow: Device frame wrappers with clear visual hierarchy
 * 
 * Wraps a PageFrame with device type label and responsive width.
 */
export function ViewportFrame({
    page,
    viewport,
    scale = 1,
    isVisible = true,
    className
}: ViewportFrameProps) {
    if (!isVisible) return null

    // Viewport labels inspired by Figma Sites
    const viewportLabels = {
        desktop: {
            label: 'Desktop',
            sublabel: 'Primary',
            breakpoint: '1280 +',
        },
        mobile: {
            label: 'Mobile',
            sublabel: '',
            breakpoint: '1 - 1279',
        },
    }

    const config = viewportLabels[viewport]

    return (
        <div className={cn('flex flex-col', className)}>
            {/* Viewport Label - Figma Sites style */}
            <div className="flex items-center gap-2 mb-2 px-1">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {config.label}
                </span>
                {config.sublabel && (
                    <>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground">
                            {config.sublabel}
                        </span>
                    </>
                )}
                <span className="text-xs text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                    {config.breakpoint}
                </span>
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

interface DualViewportProps {
    page: WireframePage
    scale?: number
    desktopVisible?: boolean
    mobileVisible?: boolean
    className?: string
}

/**
 * DualViewport Component
 * 
 * Shows Desktop and Mobile viewports side by side.
 * This is the main pattern for wireframe view (Figma Sites style).
 */
export function DualViewport({
    page,
    scale = 1,
    desktopVisible = true,
    mobileVisible = true,
    className
}: DualViewportProps) {
    // If neither is visible, show at least desktop
    const showDesktop = desktopVisible || (!desktopVisible && !mobileVisible)
    const showMobile = mobileVisible

    return (
        <div className={cn(
            'flex items-start gap-8',
            className
        )}>
            {showDesktop && (
                <ViewportFrame
                    page={page}
                    viewport="desktop"
                    scale={scale}
                    isVisible={showDesktop}
                />
            )}
            {showMobile && (
                <ViewportFrame
                    page={page}
                    viewport="mobile"
                    scale={scale}
                    isVisible={showMobile}
                />
            )}
        </div>
    )
}
