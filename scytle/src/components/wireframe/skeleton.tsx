'use client'

import { cn } from '@/lib/utils'

interface SkeletonProps {
    className?: string
}

/**
 * Base Skeleton Component
 * 
 * Animated loading placeholder with pulse effect.
 */
export function Skeleton({ className }: SkeletonProps) {
    return (
        <div
            className={cn(
                'animate-pulse rounded bg-gray-200',
                className
            )}
        />
    )
}

/**
 * Section Skeleton
 * 
 * Loading placeholder for a wireframe section block.
 * Mimics the structure of a real section.
 */
interface SectionSkeletonProps {
    variant?: 'hero' | 'features' | 'testimonials' | 'generic'
    className?: string
}

export function SectionSkeleton({
    variant = 'generic',
    className
}: SectionSkeletonProps) {
    return (
        <div
            className={cn(
                'rounded-lg bg-white ring-1 ring-gray-200 overflow-hidden',
                className
            )}
        >
            {/* Section header skeleton */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-4 rounded" />
            </div>

            {/* Content area based on variant */}
            <div className="p-6">
                {variant === 'hero' && <HeroContentSkeleton />}
                {variant === 'features' && <FeaturesContentSkeleton />}
                {variant === 'testimonials' && <TestimonialsContentSkeleton />}
                {variant === 'generic' && <GenericContentSkeleton />}
            </div>
        </div>
    )
}

function HeroContentSkeleton() {
    return (
        <div className="text-center space-y-4 py-8">
            <Skeleton className="h-8 w-3/4 mx-auto" />
            <Skeleton className="h-4 w-1/2 mx-auto" />
            <Skeleton className="h-4 w-2/3 mx-auto" />
            <div className="pt-4">
                <Skeleton className="h-10 w-32 mx-auto rounded-full" />
            </div>
        </div>
    )
}

function FeaturesContentSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-6 w-1/3 mx-auto" />
            <div className="grid grid-cols-3 gap-4 pt-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="text-center space-y-2">
                        <Skeleton className="h-12 w-12 mx-auto rounded-lg" />
                        <Skeleton className="h-4 w-3/4 mx-auto" />
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6 mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function TestimonialsContentSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-6 w-1/4 mx-auto" />
            <div className="flex gap-4 pt-4">
                {[1, 2].map((i) => (
                    <div key={i} className="flex-1 p-4 rounded-lg bg-gray-50 space-y-3">
                        <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-5/6" />
                        <Skeleton className="h-3 w-4/6" />
                    </div>
                ))}
            </div>
        </div>
    )
}

function GenericContentSkeleton() {
    return (
        <div className="space-y-3">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
        </div>
    )
}

/**
 * Page Skeleton
 * 
 * Loading placeholder for an entire page frame.
 * Shows multiple section skeletons.
 */
interface PageSkeletonProps {
    sectionCount?: number
    className?: string
}

export function PageSkeleton({
    sectionCount = 5,
    className
}: PageSkeletonProps) {
    const variants: SectionSkeletonProps['variant'][] = [
        'hero',
        'features',
        'testimonials',
        'generic',
        'generic'
    ]

    return (
        <div
            className={cn(
                'flex flex-col bg-white rounded-lg shadow-sm ring-1 ring-gray-200',
                className
            )}
        >
            {/* Frame header skeleton */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 rounded-t-lg">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-4 rounded" />
            </div>

            {/* Section skeletons */}
            <div className="p-3 space-y-4">
                {Array.from({ length: sectionCount }).map((_, i) => (
                    <SectionSkeleton
                        key={i}
                        variant={variants[i % variants.length]}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * Progress Skeleton
 * 
 * Shows generation progress with animated bar.
 */
interface ProgressSkeletonProps {
    progress?: number // 0-100
    message?: string
    className?: string
}

export function ProgressSkeleton({
    progress = 0,
    message = 'Generating...',
    className
}: ProgressSkeletonProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{message}</span>
                <span className="text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                    className="h-full bg-violet-500 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    )
}

/**
 * Inline Text Skeleton
 * 
 * Small loading placeholder for inline text generation.
 */
interface TextSkeletonProps {
    width?: 'sm' | 'md' | 'lg' | 'full'
    className?: string
}

export function TextSkeleton({
    width = 'md',
    className
}: TextSkeletonProps) {
    const widthClasses = {
        sm: 'w-16',
        md: 'w-32',
        lg: 'w-48',
        full: 'w-full'
    }

    return (
        <Skeleton
            className={cn(
                'h-4 inline-block',
                widthClasses[width],
                className
            )}
        />
    )
}
