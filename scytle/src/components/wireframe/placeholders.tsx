'use client'

import { cn } from '@/lib/utils'

/**
 * Wireframe Placeholder Components
 * 
 * Design inspiration:
 * - Relume: Clean gray boxes with structure hints
 * - Balsamiq: Sketch-like placeholders
 * - Figma: Minimal shapes
 * 
 * These are low-fidelity visual representations showing
 * the structure of each section type without real content.
 */

import type { ViewportDevice } from '@/types'

interface PlaceholderProps {
    viewport: ViewportDevice
    className?: string
}

// Reusable placeholder primitives
const Box = ({ className }: { className?: string }) => (
    <div className={cn('bg-gray-200 rounded', className)} />
)

const TextLine = ({ className, width = 'w-full' }: { className?: string; width?: string }) => (
    <div className={cn('h-2.5 bg-gray-200 rounded-full', width, className)} />
)

const TextBlock = ({ lines = 3, className }: { lines?: number; className?: string }) => (
    <div className={cn('space-y-2', className)}>
        {Array.from({ length: lines }).map((_, i) => (
            <TextLine key={i} width={i === lines - 1 ? 'w-3/4' : 'w-full'} />
        ))}
    </div>
)

const Button = ({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = {
        sm: 'h-7 w-16',
        md: 'h-9 w-24',
        lg: 'h-11 w-32',
    }
    return <div className={cn('bg-gray-300 rounded-md', sizes[size], className)} />
}

const Avatar = ({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) => {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    }
    return <div className={cn('bg-gray-200 rounded-full', sizes[size], className)} />
}

const Icon = ({ className }: { className?: string }) => (
    <div className={cn('w-10 h-10 bg-gray-200 rounded-lg', className)} />
)

// ============================================
// Section Placeholders
// ============================================

/**
 * Navbar Placeholder
 */
export function NavbarPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-4 bg-white border-b border-gray-100', className)}>
            <div className="flex items-center justify-between">
                {/* Logo */}
                <Box className="w-24 h-6" />

                {isMobile ? (
                    /* Mobile: Hamburger */
                    <div className="flex flex-col gap-1">
                        <Box className="w-5 h-0.5" />
                        <Box className="w-5 h-0.5" />
                        <Box className="w-5 h-0.5" />
                    </div>
                ) : (
                    /* Desktop: Nav items */
                    <div className="flex items-center gap-6">
                        <div className="flex gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <TextLine key={i} width="w-12" />
                            ))}
                        </div>
                        <Button size="sm" />
                    </div>
                )}
            </div>
        </div>
    )
}

/**
 * Hero Placeholder
 */
export function HeroPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16', isMobile ? 'py-12' : 'py-20', className)}>
            <div className={cn(
                'flex gap-12',
                isMobile ? 'flex-col items-center text-center' : 'items-center'
            )}>
                {/* Text Content */}
                <div className={cn('flex-1 space-y-6', isMobile && 'space-y-4')}>
                    {/* Badge */}
                    <Box className="h-6 w-24 rounded-full" />

                    {/* Heading */}
                    <div className="space-y-2">
                        <Box className={cn('h-8', isMobile ? 'w-full' : 'w-4/5')} />
                        <Box className={cn('h-8', isMobile ? 'w-4/5 mx-auto' : 'w-3/5')} />
                    </div>

                    {/* Subheading */}
                    <TextBlock lines={2} className={isMobile ? 'max-w-xs mx-auto' : 'max-w-md'} />

                    {/* CTAs */}
                    <div className={cn('flex gap-3', isMobile && 'justify-center')}>
                        <Button size="lg" className="bg-gray-300" />
                        <Button size="lg" className="bg-gray-200" />
                    </div>
                </div>

                {/* Hero Image */}
                <div className={cn(
                    'bg-gray-100 rounded-xl',
                    isMobile ? 'w-full h-48' : 'flex-1 h-80'
                )}>
                    <div className="w-full h-full flex items-center justify-center">
                        <Box className="w-16 h-16 rounded-lg opacity-50" />
                    </div>
                </div>
            </div>
        </div>
    )
}

/**
 * Features Placeholder
 */
export function FeaturesPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'
    const cols = isMobile ? 1 : 3

    return (
        <div className={cn('px-6 py-16', className)}>
            {/* Section Header */}
            <div className="text-center mb-12 space-y-3">
                <Box className="h-6 w-20 mx-auto rounded-full" />
                <Box className="h-7 w-64 mx-auto" />
                <TextLine width="w-96 max-w-full" className="mx-auto" />
            </div>

            {/* Feature Grid */}
            <div className={cn(
                'grid gap-8',
                isMobile ? 'grid-cols-1' : 'grid-cols-3'
            )}>
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-4">
                        <Icon />
                        <Box className="h-5 w-32" />
                        <TextBlock lines={2} />
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Testimonials Placeholder
 */
export function TestimonialsPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16 bg-gray-50', className)}>
            {/* Section Header */}
            <div className="text-center mb-12 space-y-3">
                <Box className="h-7 w-48 mx-auto" />
            </div>

            {/* Testimonial Cards */}
            <div className={cn(
                'grid gap-6',
                isMobile ? 'grid-cols-1' : 'grid-cols-3'
            )}>
                {(isMobile ? [1] : [1, 2, 3]).map((i) => (
                    <div key={i} className="bg-white rounded-xl p-6 space-y-4">
                        {/* Stars */}
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Box key={s} className="w-4 h-4 rounded" />
                            ))}
                        </div>

                        {/* Quote */}
                        <TextBlock lines={3} />

                        {/* Author */}
                        <div className="flex items-center gap-3 pt-2">
                            <Avatar size="sm" />
                            <div className="space-y-1">
                                <TextLine width="w-24" />
                                <TextLine width="w-16" className="h-2 opacity-50" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Pricing Placeholder
 */
export function PricingPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16', className)}>
            {/* Section Header */}
            <div className="text-center mb-12 space-y-3">
                <Box className="h-7 w-40 mx-auto" />
                <TextLine width="w-80 max-w-full" className="mx-auto" />
            </div>

            {/* Pricing Cards */}
            <div className={cn(
                'grid gap-6',
                isMobile ? 'grid-cols-1' : 'grid-cols-3'
            )}>
                {(isMobile ? [1, 2] : [1, 2, 3]).map((i) => (
                    <div
                        key={i}
                        className={cn(
                            'rounded-xl p-6 space-y-6',
                            i === 2 ? 'bg-gray-100 ring-2 ring-gray-300' : 'bg-white border border-gray-200'
                        )}
                    >
                        {/* Plan Name */}
                        <TextLine width="w-20" />

                        {/* Price */}
                        <Box className="h-10 w-24" />

                        {/* Features */}
                        <div className="space-y-3">
                            {[1, 2, 3, 4].map((f) => (
                                <div key={f} className="flex items-center gap-2">
                                    <Box className="w-4 h-4 rounded" />
                                    <TextLine width="w-full" />
                                </div>
                            ))}
                        </div>

                        {/* CTA */}
                        <Button size="lg" className="w-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * FAQ Placeholder
 */
export function FAQPlaceholder({ viewport, className }: PlaceholderProps) {
    return (
        <div className={cn('px-6 py-16', className)}>
            {/* Section Header */}
            <div className="text-center mb-12 space-y-3">
                <Box className="h-7 w-56 mx-auto" />
            </div>

            {/* FAQ Items */}
            <div className="max-w-2xl mx-auto space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="bg-white border border-gray-200 rounded-lg p-4"
                    >
                        <div className="flex items-center justify-between">
                            <TextLine width="w-3/4" />
                            <Box className="w-5 h-5 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * CTA Placeholder
 */
export function CTAPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16 bg-gray-100', className)}>
            <div className="max-w-2xl mx-auto text-center space-y-6">
                {/* Heading */}
                <Box className={cn('h-8 mx-auto', isMobile ? 'w-full' : 'w-96')} />

                {/* Subheading */}
                <TextBlock lines={2} className="max-w-md mx-auto" />

                {/* CTA Buttons */}
                <div className="flex gap-3 justify-center">
                    <Button size="lg" className="bg-gray-300" />
                    <Button size="lg" className="bg-gray-200" />
                </div>
            </div>
        </div>
    )
}

/**
 * Contact Placeholder
 */
export function ContactPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16', className)}>
            <div className={cn(
                'grid gap-12',
                isMobile ? 'grid-cols-1' : 'grid-cols-2'
            )}>
                {/* Left: Info */}
                <div className="space-y-6">
                    <Box className="h-7 w-40" />
                    <TextBlock lines={3} />

                    <div className="space-y-4 pt-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Icon className="w-8 h-8" />
                                <TextLine width="w-40" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Form */}
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Box className="h-10 rounded-lg" />
                        <Box className="h-10 rounded-lg" />
                    </div>
                    <Box className="h-10 rounded-lg" />
                    <Box className="h-32 rounded-lg" />
                    <Button size="lg" className="w-full" />
                </div>
            </div>
        </div>
    )
}

/**
 * Footer Placeholder
 */
export function FooterPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-12 bg-gray-50 border-t border-gray-100', className)}>
            <div className={cn(
                'grid gap-8 mb-8',
                isMobile ? 'grid-cols-2' : 'grid-cols-4'
            )}>
                {/* Logo Column */}
                <div className="space-y-4">
                    <Box className="w-24 h-6" />
                    <TextBlock lines={2} className="max-w-xs" />
                </div>

                {/* Link Columns */}
                {[1, 2, 3].map((col) => (
                    <div key={col} className="space-y-3">
                        <TextLine width="w-16" className="h-3" />
                        {[1, 2, 3, 4].map((link) => (
                            <TextLine key={link} width="w-20" />
                        ))}
                    </div>
                ))}
            </div>

            {/* Bottom Bar */}
            <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                <TextLine width="w-48" />
                <div className="flex gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <Box key={i} className="w-8 h-8 rounded-full" />
                    ))}
                </div>
            </div>
        </div>
    )
}

/**
 * Logos/Partners Placeholder
 */
export function LogosPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'
    const logoCount = isMobile ? 4 : 6

    return (
        <div className={cn('px-6 py-12', className)}>
            <div className="text-center mb-8">
                <TextLine width="w-48" className="mx-auto" />
            </div>
            <div className={cn(
                'flex flex-wrap items-center justify-center gap-8',
                isMobile && 'gap-6'
            )}>
                {Array.from({ length: logoCount }).map((_, i) => (
                    <Box key={i} className={cn('rounded', isMobile ? 'w-20 h-8' : 'w-28 h-10')} />
                ))}
            </div>
        </div>
    )
}

/**
 * Stats Placeholder
 */
export function StatsPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-12 bg-gray-50', className)}>
            <div className={cn(
                'grid gap-8',
                isMobile ? 'grid-cols-2' : 'grid-cols-4'
            )}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center space-y-2">
                        <Box className="h-10 w-20 mx-auto" />
                        <TextLine width="w-24" className="mx-auto" />
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Team Placeholder
 */
export function TeamPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16', className)}>
            {/* Section Header */}
            <div className="text-center mb-12 space-y-3">
                <Box className="h-7 w-32 mx-auto" />
                <TextLine width="w-64" className="mx-auto" />
            </div>

            {/* Team Grid */}
            <div className={cn(
                'grid gap-8',
                isMobile ? 'grid-cols-2' : 'grid-cols-4'
            )}>
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center space-y-3">
                        <Avatar size="lg" className="mx-auto" />
                        <div className="space-y-1">
                            <TextLine width="w-24" className="mx-auto" />
                            <TextLine width="w-16" className="mx-auto h-2 opacity-50" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Gallery Placeholder
 */
export function GalleryPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16', className)}>
            <div className={cn(
                'grid gap-4',
                isMobile ? 'grid-cols-2' : 'grid-cols-3'
            )}>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Box
                        key={i}
                        className={cn(
                            'rounded-lg',
                            i === 1 && !isMobile ? 'col-span-2 row-span-2 h-80' : 'h-40'
                        )}
                    />
                ))}
            </div>
        </div>
    )
}

/**
 * Blog List Placeholder
 */
export function BlogListPlaceholder({ viewport, className }: PlaceholderProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16', className)}>
            {/* Section Header */}
            <div className="text-center mb-12 space-y-3">
                <Box className="h-7 w-32 mx-auto" />
            </div>

            {/* Blog Grid */}
            <div className={cn(
                'grid gap-8',
                isMobile ? 'grid-cols-1' : 'grid-cols-3'
            )}>
                {(isMobile ? [1, 2] : [1, 2, 3]).map((i) => (
                    <div key={i} className="space-y-4">
                        <Box className="h-48 rounded-lg" />
                        <div className="space-y-2">
                            <TextLine width="w-24" className="h-2 opacity-50" />
                            <Box className="h-5 w-full" />
                            <TextBlock lines={2} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/**
 * Generic/Content Placeholder
 */
export function GenericPlaceholder({ viewport, className }: PlaceholderProps) {
    return (
        <div className={cn('px-6 py-16', className)}>
            <div className="max-w-2xl mx-auto space-y-6">
                <Box className="h-7 w-48" />
                <TextBlock lines={4} />
                <Box className="h-48 w-full rounded-lg" />
                <TextBlock lines={3} />
            </div>
        </div>
    )
}
