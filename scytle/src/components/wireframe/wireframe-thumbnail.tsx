'use client'

import { ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getDesignById } from '@/lib/designs'

/**
 * WireframeThumbnail - Shared component for sidebar thumbnails
 * 
 * Renders actual wireframe layouts (not skeletons) that match
 * the canvas designs. Used in:
 * - AddSectionSidebar (layout picker)
 * - ComponentLibraryPanel (replace component)
 * - Ghost preview on canvas
 * 
 * Design philosophy:
 * - Match the actual wireframe-layouts.tsx designs
 * - Scaled-down but recognizable
 * - Real text placeholders
 * - Image placeholders with icons
 * 
 * MIGRATION NOTE:
 * This component now uses the centralized design registry.
 * New designs should be added to lib/designs/ folder.
 * Legacy switch-case fallback for non-migrated designs.
 */

interface WireframeThumbnailProps {
    type: string
    variant?: string
    className?: string
    /** Show as ghost/transparent preview */
    ghost?: boolean
}

export function WireframeThumbnail({ type, variant, className, ghost = false }: WireframeThumbnailProps) {
    const key = variant ? `${type}-${variant}` : type

    // Try to get from centralized design registry first
    const design = getDesignById(key)

    return (
        <div className={cn(
            'w-full h-full overflow-hidden',
            ghost && 'opacity-50',
            className
        )}>
            {design ? (
                // Use new centralized design thumbnail
                <design.Thumbnail />
            ) : (
                // Fallback to legacy switch-case for non-migrated designs
                <ThumbnailContent layoutKey={key} type={type} variant={variant} />
            )}
        </div>
    )
}

// Mini image placeholder
function MiniImage({ className, size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'p-1', md: 'p-2', lg: 'p-3' }
    const iconSizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' }
    return (
        <div className={cn('bg-gray-200 flex items-center justify-center', sizes[size], className)}>
            <ImageIcon className={cn('text-gray-400', iconSizes[size])} />
        </div>
    )
}

// Render actual thumbnail content based on layout key
function ThumbnailContent({ layoutKey, type, variant }: { layoutKey: string; type: string; variant?: string }) {
    switch (layoutKey) {
        // ===== HERO LAYOUTS =====
        case 'hero-split':
            return (
                <div className="w-full h-full bg-white p-2 flex gap-2">
                    <div className="flex-1 flex flex-col justify-center space-y-1">
                        <div className="text-[6px] text-gray-400 uppercase">Tagline</div>
                        <div className="text-[8px] font-semibold text-gray-800 leading-tight">
                            Medium length hero headline goes here
                        </div>
                        <div className="text-[5px] text-gray-500 leading-tight">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </div>
                        <div className="flex gap-1 mt-1">
                            <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                            <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
                        </div>
                    </div>
                    <MiniImage className="flex-1 aspect-[4/3]" />
                </div>
            )

        case 'hero-centered':
            return (
                <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center space-y-1">
                    <div className="text-[6px] text-gray-400 uppercase">Tagline</div>
                    <div className="text-[8px] font-semibold text-gray-800 leading-tight max-w-[80%]">
                        Medium length hero headline goes here
                    </div>
                    <div className="text-[5px] text-gray-500 leading-tight max-w-[70%]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </div>
                    <div className="flex gap-1 mt-1">
                        <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                        <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
                    </div>
                </div>
            )

        case 'hero-with-image':
            return (
                <div className="w-full h-full bg-white p-2 flex flex-col">
                    <div className="text-center space-y-0.5 mb-1.5">
                        <div className="text-[6px] text-gray-400 uppercase">Tagline</div>
                        <div className="text-[8px] font-semibold text-gray-800 leading-tight">
                            Medium length hero headline
                        </div>
                        <div className="text-[5px] text-gray-500">Lorem ipsum dolor sit amet</div>
                        <div className="flex gap-1 justify-center mt-0.5">
                            <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                            <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
                        </div>
                    </div>
                    <MiniImage className="flex-1 w-full aspect-[21/9]" />
                </div>
            )

        // ===== FEATURES LAYOUTS =====
        case 'features-grid':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1.5">
                        <div className="text-[6px] text-gray-400 uppercase">Features</div>
                        <div className="text-[7px] font-semibold text-gray-800">Short heading goes here</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center space-y-0.5">
                                <div className="w-4 h-4 bg-gray-100 mx-auto flex items-center justify-center">
                                    <div className="w-2 h-2 bg-gray-300" />
                                </div>
                                <div className="text-[5px] font-medium text-gray-800">Feature {i}</div>
                                <div className="text-[4px] text-gray-500 leading-tight">Lorem ipsum dolor</div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'features-with-image':
            return (
                <div className="w-full h-full bg-white p-2 flex gap-2">
                    <MiniImage className="flex-1 aspect-square" />
                    <div className="flex-1 space-y-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-1">
                                <div className="w-3 h-3 bg-gray-200 shrink-0 mt-0.5 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-gray-400" />
                                </div>
                                <div>
                                    <div className="text-[5px] font-medium text-gray-800">Feature {i}</div>
                                    <div className="text-[4px] text-gray-500">Lorem ipsum</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'features-list':
            return (
                <div className="w-full h-full bg-white p-2 space-y-1.5">
                    <div className="text-center mb-1">
                        <div className="text-[6px] text-gray-400 uppercase">Features</div>
                        <div className="text-[7px] font-semibold text-gray-800">Heading</div>
                    </div>
                    {[1, 2].map((i) => (
                        <div key={i} className={cn('flex gap-2', i % 2 === 0 && 'flex-row-reverse')}>
                            <MiniImage className="w-1/3 aspect-video" size="sm" />
                            <div className="flex-1">
                                <div className="text-[5px] font-medium text-gray-800">Feature {i}</div>
                                <div className="text-[4px] text-gray-500">Lorem ipsum dolor sit amet</div>
                            </div>
                        </div>
                    ))}
                </div>
            )

        // ===== TESTIMONIALS LAYOUTS =====
        case 'testimonials-grid':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1.5">
                        <div className="text-[7px] font-semibold text-gray-800">Testimonials</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-gray-50 p-1 space-y-0.5">
                                <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <div key={s} className="w-1 h-1 bg-gray-400" />
                                    ))}
                                </div>
                                <div className="text-[4px] text-gray-600 leading-tight">
                                    &quot;Lorem ipsum dolor sit amet&quot;
                                </div>
                                <div className="flex items-center gap-1 mt-0.5">
                                    <div className="w-3 h-3 bg-gray-200 rounded-full" />
                                    <div className="text-[4px] text-gray-500">Name</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'testimonials-single':
            return (
                <div className="w-full h-full bg-white p-2 flex items-center justify-center">
                    <div className="text-center space-y-1 max-w-[80%]">
                        <div className="flex gap-0.5 justify-center">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className="w-1.5 h-1.5 bg-gray-400" />
                            ))}
                        </div>
                        <div className="text-[6px] text-gray-600 italic leading-tight">
                            &quot;Lorem ipsum dolor sit amet, consectetur adipiscing elit.&quot;
                        </div>
                        <div className="flex items-center gap-1 justify-center">
                            <div className="w-4 h-4 bg-gray-200 rounded-full" />
                            <div className="text-[5px] text-gray-700">Customer Name</div>
                        </div>
                    </div>
                </div>
            )

        case 'testimonials-carousel':
            return (
                <div className="w-full h-full bg-white p-2 flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-200 shrink-0 flex items-center justify-center">
                        <span className="text-[6px] text-gray-400">‹</span>
                    </div>
                    <div className="flex-1 bg-gray-50 p-1.5 text-center">
                        <div className="flex gap-0.5 justify-center mb-0.5">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <div key={s} className="w-1 h-1 bg-gray-400" />
                            ))}
                        </div>
                        <div className="text-[5px] text-gray-600 italic">&quot;Lorem ipsum dolor sit amet&quot;</div>
                        <div className="flex items-center gap-1 justify-center mt-1">
                            <div className="w-3 h-3 bg-gray-200 rounded-full" />
                            <div className="text-[4px] text-gray-500">Name</div>
                        </div>
                    </div>
                    <div className="w-3 h-3 bg-gray-200 shrink-0 flex items-center justify-center">
                        <span className="text-[6px] text-gray-400">›</span>
                    </div>
                </div>
            )

        // ===== CTA LAYOUTS =====
        case 'cta-centered':
            return (
                <div className="w-full h-full bg-gray-100 p-2 flex items-center justify-center">
                    <div className="text-center space-y-1">
                        <div className="text-[8px] font-semibold text-gray-800">Call to action heading</div>
                        <div className="text-[5px] text-gray-500">Lorem ipsum dolor sit amet</div>
                        <div className="flex gap-1 justify-center mt-1">
                            <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                            <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
                        </div>
                    </div>
                </div>
            )

        case 'cta-split':
            return (
                <div className="w-full h-full bg-gray-100 p-2 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="text-[7px] font-semibold text-gray-800">CTA heading</div>
                        <div className="text-[5px] text-gray-500">Lorem ipsum dolor sit amet</div>
                    </div>
                    <div className="flex gap-1">
                        <div className="bg-gray-800 text-white text-[5px] px-1.5 py-0.5">Button</div>
                        <div className="border border-gray-300 text-gray-600 text-[5px] px-1.5 py-0.5">Button</div>
                    </div>
                </div>
            )

        case 'cta-banner':
            return (
                <div className="w-full h-full bg-gray-800 p-2 flex items-center justify-between">
                    <div className="space-y-0.5">
                        <div className="text-[7px] font-semibold text-white">Get started today</div>
                        <div className="text-[5px] text-gray-300">Lorem ipsum dolor sit amet</div>
                    </div>
                    <div className="bg-white text-gray-800 text-[5px] px-2 py-1">Get Started</div>
                </div>
            )

        // ===== PRICING LAYOUTS =====
        case 'pricing-3-tier':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1.5">
                        <div className="text-[7px] font-semibold text-gray-800">Pricing</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {['Basic', 'Pro', 'Enterprise'].map((plan, i) => (
                            <div key={plan} className={cn(
                                'p-1 text-center',
                                i === 1 ? 'bg-gray-100 border border-gray-300' : 'bg-gray-50'
                            )}>
                                <div className="text-[5px] font-medium text-gray-800">{plan}</div>
                                <div className="text-[7px] font-bold text-gray-900 my-0.5">${(i + 1) * 19}</div>
                                <div className="space-y-0.5">
                                    {[1, 2, 3].map((f) => (
                                        <div key={f} className="text-[4px] text-gray-500">Feature {f}</div>
                                    ))}
                                </div>
                                <div className="bg-gray-800 text-white text-[4px] px-1 py-0.5 mt-1">
                                    Choose
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'pricing-comparison':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1">
                        <div className="text-[7px] font-semibold text-gray-800">Pricing</div>
                    </div>
                    <div className="border border-gray-200 text-[4px]">
                        <div className="flex border-b border-gray-200 bg-gray-50">
                            <div className="flex-1 p-0.5">Feature</div>
                            <div className="flex-1 p-0.5 text-center border-l border-gray-200">Basic</div>
                            <div className="flex-1 p-0.5 text-center border-l border-gray-200">Pro</div>
                        </div>
                        {[1, 2, 3].map((row) => (
                            <div key={row} className="flex border-b border-gray-100 last:border-0">
                                <div className="flex-1 p-0.5 text-gray-600">Feature {row}</div>
                                <div className="flex-1 p-0.5 text-center border-l border-gray-100">✓</div>
                                <div className="flex-1 p-0.5 text-center border-l border-gray-100">✓</div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        // ===== CONTACT LAYOUTS =====
        case 'contact-split':
            return (
                <div className="w-full h-full bg-white p-2 flex gap-2">
                    <div className="flex-1 space-y-1">
                        <div className="text-[6px] text-gray-400 uppercase">Contact</div>
                        <div className="text-[7px] font-semibold text-gray-800">Get in touch</div>
                        <div className="text-[5px] text-gray-500 leading-tight">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-50 p-1.5 space-y-1">
                        <div className="h-2 bg-white border border-gray-200" />
                        <div className="h-2 bg-white border border-gray-200" />
                        <div className="h-4 bg-white border border-gray-200" />
                        <div className="h-2.5 bg-gray-800 text-white text-[5px] flex items-center justify-center">
                            Submit
                        </div>
                    </div>
                </div>
            )

        case 'contact-simple':
            return (
                <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center">
                    <div className="text-center space-y-0.5 mb-1.5">
                        <div className="text-[7px] font-semibold text-gray-800">Contact Us</div>
                        <div className="text-[5px] text-gray-500">Get in touch with us</div>
                    </div>
                    <div className="w-[60%] space-y-1">
                        <div className="h-2 bg-white border border-gray-200" />
                        <div className="h-2 bg-white border border-gray-200" />
                        <div className="h-4 bg-white border border-gray-200" />
                        <div className="h-2.5 bg-gray-800 text-white text-[5px] flex items-center justify-center">
                            Send Message
                        </div>
                    </div>
                </div>
            )

        // ===== FAQ LAYOUTS =====
        case 'faq-accordion':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1.5">
                        <div className="text-[7px] font-semibold text-gray-800">FAQs</div>
                    </div>
                    <div className="space-y-0.5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center justify-between p-1 bg-gray-50 border border-gray-100">
                                <div className="text-[5px] text-gray-700">Question number {i}?</div>
                                <div className="text-[6px] text-gray-400">+</div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'faq-grid':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1.5">
                        <div className="text-[7px] font-semibold text-gray-800">FAQs</div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-0.5">
                                <div className="text-[5px] font-medium text-gray-800">Question {i}?</div>
                                <div className="text-[4px] text-gray-500 leading-tight">
                                    Lorem ipsum dolor sit amet.
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        // ===== ABOUT LAYOUTS =====
        case 'about-with-image':
            return (
                <div className="w-full h-full bg-white p-2 flex gap-2">
                    <MiniImage className="flex-1 aspect-square" />
                    <div className="flex-1 space-y-1">
                        <div className="text-[6px] text-gray-400 uppercase">About</div>
                        <div className="text-[7px] font-semibold text-gray-800">Our Story</div>
                        <div className="text-[5px] text-gray-500 leading-tight">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </div>
                    </div>
                </div>
            )

        case 'about-centered':
            return (
                <div className="w-full h-full bg-white p-2 flex flex-col items-center justify-center text-center">
                    <div className="text-[6px] text-gray-400 uppercase">About</div>
                    <div className="text-[8px] font-semibold text-gray-800 mt-0.5">Our Story</div>
                    <div className="text-[5px] text-gray-500 leading-tight max-w-[80%] mt-1">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim.
                    </div>
                </div>
            )

        case 'about-split':
            return (
                <div className="w-full h-full bg-white p-2 flex gap-3">
                    <div className="flex-1 space-y-1">
                        <div className="text-[6px] font-semibold text-gray-800">Our Mission</div>
                        <div className="text-[4px] text-gray-500 leading-tight">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        <div className="text-[6px] font-semibold text-gray-800">Our Vision</div>
                        <div className="text-[4px] text-gray-500 leading-tight">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </div>
                    </div>
                </div>
            )

        // ===== TEAM LAYOUTS =====
        case 'team-grid':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1.5">
                        <div className="text-[7px] font-semibold text-gray-800">Our Team</div>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="text-center">
                                <div className="w-5 h-5 bg-gray-200 rounded-full mx-auto mb-0.5" />
                                <div className="text-[4px] font-medium text-gray-800">Name</div>
                                <div className="text-[3px] text-gray-500">Role</div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'team-carousel':
            return (
                <div className="w-full h-full bg-white p-2 flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-200 shrink-0 flex items-center justify-center">
                        <span className="text-[6px] text-gray-400">‹</span>
                    </div>
                    <div className="flex-1 grid grid-cols-3 gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="text-center">
                                <div className="w-5 h-5 bg-gray-200 rounded-full mx-auto mb-0.5" />
                                <div className="text-[4px] font-medium text-gray-800">Name</div>
                                <div className="text-[3px] text-gray-500">Role</div>
                            </div>
                        ))}
                    </div>
                    <div className="w-3 h-3 bg-gray-200 shrink-0 flex items-center justify-center">
                        <span className="text-[6px] text-gray-400">›</span>
                    </div>
                </div>
            )

        // ===== BLOG LAYOUTS =====
        case 'blog-grid':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1.5">
                        <div className="text-[7px] font-semibold text-gray-800">Blog</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-0.5">
                                <MiniImage className="aspect-video" size="sm" />
                                <div className="text-[4px] text-gray-400">Category</div>
                                <div className="text-[5px] font-medium text-gray-800 leading-tight">
                                    Article Title
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'blog-featured':
            return (
                <div className="w-full h-full bg-white p-2 flex gap-2">
                    <div className="flex-1">
                        <MiniImage className="aspect-video mb-1" size="sm" />
                        <div className="text-[4px] text-gray-400">Featured</div>
                        <div className="text-[6px] font-medium text-gray-800 leading-tight">
                            Featured Article Title
                        </div>
                    </div>
                    <div className="flex-1 space-y-1">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex gap-1">
                                <MiniImage className="w-6 aspect-video shrink-0" size="sm" />
                                <div>
                                    <div className="text-[4px] font-medium text-gray-800">Title {i}</div>
                                    <div className="text-[3px] text-gray-500">Lorem ipsum</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        // ===== GALLERY LAYOUTS =====
        case 'gallery-grid':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1">
                        <div className="text-[7px] font-semibold text-gray-800">Gallery</div>
                    </div>
                    <div className="grid grid-cols-4 gap-0.5">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <MiniImage key={i} className="aspect-square" size="sm" />
                        ))}
                    </div>
                </div>
            )

        case 'gallery-masonry':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1">
                        <div className="text-[7px] font-semibold text-gray-800">Gallery</div>
                    </div>
                    <div className="flex gap-0.5">
                        <div className="flex-1 space-y-0.5">
                            <MiniImage className="h-6" size="sm" />
                            <MiniImage className="h-4" size="sm" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                            <MiniImage className="h-4" size="sm" />
                            <MiniImage className="h-6" size="sm" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                            <MiniImage className="h-5" size="sm" />
                            <MiniImage className="h-5" size="sm" />
                        </div>
                    </div>
                </div>
            )

        // ===== STATS LAYOUTS =====
        case 'stats-row':
            return (
                <div className="w-full h-full bg-white p-2 flex items-center justify-center gap-4">
                    {['100+', '50K', '99%', '24/7'].map((stat, i) => (
                        <div key={i} className="text-center">
                            <div className="text-[8px] font-bold text-gray-900">{stat}</div>
                            <div className="text-[4px] text-gray-500">Metric {i + 1}</div>
                        </div>
                    ))}
                </div>
            )

        case 'stats-cards':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1.5">
                        <div className="text-[7px] font-semibold text-gray-800">Our Impact</div>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                        {['100+', '50K', '99%', '24/7'].map((stat, i) => (
                            <div key={i} className="bg-gray-50 p-1 text-center border border-gray-100">
                                <div className="text-[7px] font-bold text-gray-900">{stat}</div>
                                <div className="text-[4px] text-gray-500">Metric</div>
                            </div>
                        ))}
                    </div>
                </div>
            )

        // ===== LOGOS LAYOUTS =====
        case 'logos-scroll':
            return (
                <div className="w-full h-full bg-white p-2 flex items-center">
                    <div className="flex gap-3 w-full overflow-hidden">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="w-8 h-4 bg-gray-200 shrink-0 flex items-center justify-center">
                                <span className="text-[4px] text-gray-400">Logo</span>
                            </div>
                        ))}
                    </div>
                </div>
            )

        case 'logos-grid':
            return (
                <div className="w-full h-full bg-white p-2">
                    <div className="text-center mb-1">
                        <div className="text-[5px] text-gray-500">Trusted by</div>
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="aspect-[3/2] bg-gray-100 flex items-center justify-center">
                                <span className="text-[4px] text-gray-400">Logo</span>
                            </div>
                        ))}
                    </div>
                </div>
            )

        // ===== BLANK/CONTENT LAYOUTS =====
        case 'content-blank':
            return (
                <div className="w-full h-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-6 h-6 bg-gray-200 mx-auto mb-1 flex items-center justify-center">
                            <span className="text-[6px] text-gray-400">+</span>
                        </div>
                        <div className="text-[5px] text-gray-400">Blank Section</div>
                    </div>
                </div>
            )

        // ===== DEFAULT =====
        default:
            return (
                <div className="w-full h-full bg-white p-2 flex items-center justify-center">
                    <div className="text-center space-y-1">
                        <div className="text-[7px] font-semibold text-gray-800">{type}</div>
                        <div className="text-[5px] text-gray-500">{variant || 'Default'}</div>
                    </div>
                </div>
            )
    }
}
