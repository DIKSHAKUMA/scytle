'use client'

import type { WireframeSection } from '@/types'
import {
    NavbarLayout,
    HeroSplitLayout,
    HeroCenteredLayout,
    HeroWithImageLayout,
    FeaturesGridLayout,
    FeaturesWithImageLayout,
    TestimonialsLayout,
    CTALayout,
    FooterLayout,
    PricingLayout,
    FAQLayout,
    ContactLayout,
    TeamLayout,
    StatsLayout,
    BlogLayout,
    LogosLayout,
    GalleryLayout,
    GenericLayout,
} from './wireframe-layouts'

interface PlaceholderRendererProps {
    section: WireframeSection
    viewport: 'desktop' | 'mobile'
    className?: string
}

/**
 * PlaceholderRenderer
 * 
 * Maps section type to the appropriate wireframe layout component.
 * Uses Relume-style actual wireframe designs with real text and layouts.
 */
export function PlaceholderRenderer({ section, viewport, className }: PlaceholderRendererProps) {
    const type = section.type.toLowerCase()
    // Use layoutVariant if set, otherwise try to infer from componentId
    // e.g. componentId 'hero-centered' → variant 'centered'
    const layoutVariant = section.layoutVariant?.toLowerCase()
        || inferVariantFromComponentId(section.componentId, type)

    // Get the appropriate layout based on type and variant
    const Layout = getLayoutComponent(type, layoutVariant)

    return <Layout section={section} viewport={viewport} className={className} />
}

/**
 * Infer layout variant from componentId when layoutVariant is not explicitly set.
 * e.g. componentId='hero-centered' with type='hero' → variant='centered'
 */
function inferVariantFromComponentId(componentId?: string, type?: string): string | undefined {
    if (!componentId || !type) return undefined
    const lower = componentId.toLowerCase()
    // Strip the type prefix to get the variant: 'hero-centered' → 'centered'
    if (lower.startsWith(`${type}-`)) {
        return lower.slice(type.length + 1)
    }
    return undefined
}

type LayoutComponent = React.ComponentType<{
    section: WireframeSection
    viewport: 'desktop' | 'mobile'
    className?: string
}>

function getLayoutComponent(type: string, variant?: string): LayoutComponent {
    // Navigation
    if (matchesType(type, ['navbar', 'navigation', 'header', 'nav'])) {
        return NavbarLayout
    }

    // Hero sections - check variant for specific layout
    if (matchesType(type, ['hero', 'hero-section', 'hero-header', 'banner', 'jumbotron'])) {
        if (variant === 'centered' || variant === 'center') {
            return HeroCenteredLayout
        }
        if (variant === 'with-image' || variant === 'image-bottom') {
            return HeroWithImageLayout
        }
        // Default to split layout
        return HeroSplitLayout
    }

    // Features
    if (matchesType(type, ['features', 'features-grid', 'features-list', 'feature-grid', 'benefits'])) {
        if (variant === 'with-image' || variant === 'side-image') {
            return FeaturesWithImageLayout
        }
        return FeaturesGridLayout
    }

    // Testimonials
    if (matchesType(type, ['testimonials', 'testimonial', 'testimonial-single', 'reviews', 'social-proof'])) {
        return TestimonialsLayout
    }

    // Pricing
    if (matchesType(type, ['pricing', 'pricing-table', 'pricing-plans', 'plans'])) {
        return PricingLayout
    }

    // FAQ
    if (matchesType(type, ['faq', 'faq-section', 'questions', 'faqs'])) {
        return FAQLayout
    }

    // CTA
    if (matchesType(type, ['cta', 'cta-banner', 'call-to-action', 'action'])) {
        return CTALayout
    }

    // Contact
    if (matchesType(type, ['contact', 'contact-form', 'contact-section', 'get-in-touch'])) {
        return ContactLayout
    }

    // Footer
    if (matchesType(type, ['footer', 'site-footer'])) {
        return FooterLayout
    }

    // Logos/Partners
    if (matchesType(type, ['logos', 'partners', 'clients', 'logo-cloud', 'trusted-by'])) {
        return LogosLayout
    }

    // Stats
    if (matchesType(type, ['stats', 'statistics', 'metrics', 'numbers', 'counters'])) {
        return StatsLayout
    }

    // Team
    if (matchesType(type, ['team', 'team-section', 'about-team', 'our-team', 'people'])) {
        return TeamLayout
    }

    // Gallery
    if (matchesType(type, ['gallery', 'portfolio', 'images', 'work', 'projects'])) {
        return GalleryLayout
    }

    // Blog
    if (matchesType(type, ['blog', 'blog-list', 'articles', 'posts', 'news'])) {
        return BlogLayout
    }

    // About - use features with image or generic
    if (matchesType(type, ['about', 'about-section', 'about-us', 'story'])) {
        return FeaturesWithImageLayout
    }

    // Services - use features grid
    if (matchesType(type, ['services', 'services-grid', 'what-we-do'])) {
        return FeaturesGridLayout
    }

    // Content/Text sections
    if (matchesType(type, ['content', 'text', 'text-section', 'copy'])) {
        return GenericLayout
    }

    // Default to generic layout
    return GenericLayout
}

function matchesType(type: string, patterns: string[]): boolean {
    return patterns.some(pattern =>
        type === pattern ||
        type.includes(pattern) ||
        pattern.includes(type)
    )
}
