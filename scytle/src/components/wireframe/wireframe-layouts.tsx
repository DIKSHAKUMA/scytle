'use client'

import { cn } from '@/lib/utils'
import { ImageIcon } from 'lucide-react'
import type { WireframeSection } from '@/types'

/**
 * Wireframe Layouts - Relume-style actual wireframe designs
 * 
 * Design philosophy:
 * - Real text content (Lorem ipsum style but meaningful)
 * - Actual image placeholders with icons
 * - Minimal color palette (gray-50 to gray-400)
 * - Realistic layouts matching real websites
 * 
 * These look like actual website designs, not abstract shapes.
 */

interface WireframeLayoutProps {
    section: WireframeSection
    viewport: 'desktop' | 'mobile'
    className?: string
}

// ============================================
// Shared Components
// ============================================

function ImagePlaceholder({ className, aspectRatio = 'aspect-video' }: { className?: string; aspectRatio?: string }) {
    return (
        <div className={cn('bg-gray-200 flex items-center justify-center rounded-sm', aspectRatio, className)}>
            <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
    )
}

function AvatarPlaceholder({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'w-10 h-10', md: 'w-12 h-12', lg: 'w-16 h-16' }
    return (
        <div className={cn('bg-gray-200 rounded-full flex items-center justify-center', sizes[size])}>
            <ImageIcon className="w-4 h-4 text-gray-400" />
        </div>
    )
}

// ============================================
// Navbar Layout
// ============================================

export function NavbarLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-4 bg-white border-b border-gray-100', className)}>
            <div className="flex items-center justify-between max-w-6xl mx-auto">
                <span className="text-sm font-semibold text-gray-700">Logo</span>

                {isMobile ? (
                    <div className="flex flex-col gap-1 p-2">
                        <div className="w-5 h-0.5 bg-gray-600" />
                        <div className="w-5 h-0.5 bg-gray-600" />
                        <div className="w-5 h-0.5 bg-gray-600" />
                    </div>
                ) : (
                    <div className="flex items-center gap-8">
                        <nav className="flex items-center gap-6">
                            {['Home', 'About', 'Services', 'Portfolio', 'Contact'].map((item) => (
                                <span key={item} className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                                    {item}
                                </span>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            <button className="text-sm text-gray-600 px-4 py-2 hover:text-gray-900">
                                Sign up
                            </button>
                            <button className="text-sm bg-gray-900 text-white px-4 py-2">
                                Explore
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================
// Hero Layouts
// ============================================

export function HeroSplitLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'
    const name = section.name || 'Hero Section'

    return (
        <div className={cn('px-6 py-16 bg-white', isMobile && 'py-12', className)}>
            <div className={cn(
                'max-w-6xl mx-auto flex gap-12',
                isMobile ? 'flex-col' : 'items-center'
            )}>
                {/* Content */}
                <div className={cn('flex-1 space-y-6', isMobile && 'text-center')}>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tagline</p>
                    <h1 className={cn(
                        'font-bold text-gray-900 leading-tight',
                        isMobile ? 'text-3xl' : 'text-5xl'
                    )}>
                        Medium length hero headline goes here
                    </h1>
                    <p className="text-gray-600 text-lg max-w-lg">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        Suspendisse varius enim in eros elementum tristique.
                    </p>
                    <div className={cn('flex gap-3 pt-2', isMobile && 'justify-center')}>
                        <button className="bg-gray-900 text-white px-6 py-3 text-sm font-medium">
                            Button
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium">
                            Button
                        </button>
                    </div>
                </div>

                {/* Image */}
                <div className={cn('flex-1', isMobile && 'w-full')}>
                    <ImagePlaceholder aspectRatio={isMobile ? 'aspect-video' : 'aspect-[4/3]'} />
                </div>
            </div>
        </div>
    )
}

export function HeroCenteredLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-20 bg-white text-center', isMobile && 'py-16', className)}>
            <div className="max-w-4xl mx-auto space-y-6">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tagline</p>
                <h1 className={cn(
                    'font-bold text-gray-900 leading-tight',
                    isMobile ? 'text-3xl' : 'text-5xl'
                )}>
                    Medium length hero headline goes here
                </h1>
                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in eros elementum tristique.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                    <button className="bg-gray-900 text-white px-6 py-3 text-sm font-medium">
                        Button
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium">
                        Button
                    </button>
                </div>
            </div>
        </div>
    )
}

export function HeroWithImageLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16 bg-white', isMobile && 'py-12', className)}>
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tagline</p>
                    <h1 className={cn(
                        'font-bold text-gray-900 leading-tight',
                        isMobile ? 'text-3xl' : 'text-5xl'
                    )}>
                        Medium length hero headline goes here
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                    <div className="flex gap-3 justify-center pt-2">
                        <button className="bg-gray-900 text-white px-6 py-3 text-sm font-medium">
                            Button
                        </button>
                        <button className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium">
                            Button
                        </button>
                    </div>
                </div>
                <ImagePlaceholder aspectRatio="aspect-[21/9]" className="w-full" />
            </div>
        </div>
    )
}

// ============================================
// Features Layouts
// ============================================

export function FeaturesGridLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    const features = [
        { title: 'Feature one', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { title: 'Feature two', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { title: 'Feature three', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    ]

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Features</p>
                    <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-4xl')}>
                        Short heading goes here
                    </h2>
                    <p className="text-gray-600 mt-4 max-w-2xl mx-auto">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                <div className={cn('grid gap-8', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
                    {features.map((feature, i) => (
                        <div key={i} className="text-center space-y-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                                <div className="w-6 h-6 bg-gray-300 rounded" />
                            </div>
                            <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                            <p className="text-gray-600 text-sm">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function FeaturesWithImageLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className={cn(
                'max-w-6xl mx-auto flex gap-12',
                isMobile ? 'flex-col' : 'items-center'
            )}>
                <div className="flex-1">
                    <ImagePlaceholder aspectRatio="aspect-square" />
                </div>
                <div className="flex-1 space-y-8">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Features</p>
                        <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-3xl')}>
                            Medium length section heading goes here
                        </h2>
                        <p className="text-gray-600 mt-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                        </p>
                    </div>

                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                                <div className="w-5 h-5 bg-gray-300 rounded" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">Feature {i}</h4>
                                <p className="text-gray-600 text-sm mt-1">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Testimonials Layout
// ============================================

export function TestimonialsLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    const testimonials = [
        { name: 'Name Surname', role: 'Position, Company name', quote: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."' },
        { name: 'Name Surname', role: 'Position, Company name', quote: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."' },
        { name: 'Name Surname', role: 'Position, Company name', quote: '"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique."' },
    ]

    return (
        <div className={cn('px-6 py-16 bg-gray-50', className)}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-4xl')}>
                        Customer testimonials
                    </h2>
                    <p className="text-gray-600 mt-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                <div className={cn('grid gap-8', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
                    {(isMobile ? [testimonials[0]] : testimonials).map((t, i) => (
                        <div key={i} className="bg-white p-6 rounded-lg space-y-4">
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((s) => (
                                    <div key={s} className="w-5 h-5 bg-gray-900 rounded-sm" />
                                ))}
                            </div>
                            <p className="text-gray-700">{t.quote}</p>
                            <div className="flex items-center gap-3 pt-2">
                                <AvatarPlaceholder size="md" />
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                                    <p className="text-gray-500 text-xs">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================
// CTA Layout
// ============================================

export function CTALayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16 bg-gray-100', className)}>
            <div className="max-w-3xl mx-auto text-center space-y-6">
                <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-4xl')}>
                    Medium length CTA headline goes here
                </h2>
                <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    Suspendisse varius enim in eros elementum tristique.
                </p>
                <div className="flex gap-3 justify-center pt-2">
                    <button className="bg-gray-900 text-white px-6 py-3 text-sm font-medium">
                        Button
                    </button>
                    <button className="border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium">
                        Button
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Footer Layout
// ============================================

export function FooterLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    const columns = [
        { title: 'Column One', links: ['Link One', 'Link Two', 'Link Three', 'Link Four', 'Link Five'] },
        { title: 'Column Two', links: ['Link Six', 'Link Seven', 'Link Eight', 'Link Nine', 'Link Ten'] },
        { title: 'Column Three', links: ['Link Eleven', 'Link Twelve', 'Link Thirteen', 'Link Fourteen', 'Link Fifteen'] },
    ]

    return (
        <div className={cn('px-6 py-12 bg-white border-t border-gray-200', className)}>
            <div className="max-w-6xl mx-auto">
                <div className={cn('grid gap-8 mb-8', isMobile ? 'grid-cols-2' : 'grid-cols-5')}>
                    {/* Logo & Description */}
                    <div className={cn('space-y-4', isMobile ? 'col-span-2' : 'col-span-2')}>
                        <span className="text-sm font-semibold text-gray-700">Logo</span>
                        <p className="text-gray-600 text-sm">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                    </div>

                    {/* Link Columns */}
                    {columns.map((col, i) => (
                        <div key={i} className="space-y-3">
                            <p className="font-semibold text-gray-900 text-sm">{col.title}</p>
                            {col.links.slice(0, isMobile ? 3 : 5).map((link, j) => (
                                <p key={j} className="text-gray-600 text-sm hover:text-gray-900 cursor-pointer">
                                    {link}
                                </p>
                            ))}
                        </div>
                    ))}
                </div>

                {/* Bottom */}
                <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 text-xs">© 2024 Company. All rights reserved.</p>
                    <div className="flex gap-4">
                        {['Privacy Policy', 'Terms of Service', 'Cookies'].map((item) => (
                            <span key={item} className="text-gray-500 text-xs hover:text-gray-700 cursor-pointer underline">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Pricing Layout
// ============================================

export function PricingLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    const plans = [
        { name: 'Basic', price: '$19', period: '/mo', features: ['Feature text goes here', 'Feature text goes here', 'Feature text goes here'] },
        { name: 'Professional', price: '$49', period: '/mo', features: ['Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here'], popular: true },
        { name: 'Enterprise', price: '$99', period: '/mo', features: ['Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here', 'Feature text goes here'] },
    ]

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Pricing</p>
                    <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-4xl')}>
                        Pricing plans
                    </h2>
                    <p className="text-gray-600 mt-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                <div className={cn('grid gap-6', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
                    {(isMobile ? plans.slice(0, 2) : plans).map((plan, i) => (
                        <div
                            key={i}
                            className={cn(
                                'p-6 rounded-lg border',
                                plan.popular ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                            )}
                        >
                            <p className="font-semibold text-gray-900">{plan.name}</p>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                                <span className="text-gray-500">{plan.period}</span>
                            </div>
                            <ul className="mt-6 space-y-3">
                                {plan.features.map((f, j) => (
                                    <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                                        <div className="w-4 h-4 bg-gray-200 rounded-full" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button className={cn(
                                'w-full mt-6 px-4 py-2.5 text-sm font-medium',
                                plan.popular
                                    ? 'bg-gray-900 text-white'
                                    : 'border border-gray-300 text-gray-700'
                            )}>
                                Get started
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================
// FAQ Layout
// ============================================

export function FAQLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    const faqs = [
        { q: 'Question text goes here', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { q: 'Question text goes here', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { q: 'Question text goes here', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { q: 'Question text goes here', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
        { q: 'Question text goes here', a: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.' },
    ]

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-4xl')}>
                        FAQs
                    </h2>
                    <p className="text-gray-600 mt-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border border-gray-200 rounded-lg">
                            <div className="flex items-center justify-between p-4 cursor-pointer">
                                <span className="font-medium text-gray-900">{faq.q}</span>
                                <div className="w-5 h-5 border border-gray-300 rounded flex items-center justify-center text-gray-500 text-xs">
                                    +
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Contact Layout
// ============================================

export function ContactLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className={cn(
                'max-w-6xl mx-auto grid gap-12',
                isMobile ? 'grid-cols-1' : 'grid-cols-2'
            )}>
                {/* Info */}
                <div className="space-y-6">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Contact</p>
                        <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-4xl')}>
                            Get in touch
                        </h2>
                        <p className="text-gray-600 mt-4">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Email', value: 'hello@email.com' },
                            { label: 'Phone', value: '+1 (555) 000-0000' },
                            { label: 'Address', value: '123 Street Name, City, Country' },
                        ].map((item, i) => (
                            <div key={i}>
                                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                                <p className="text-gray-900">{item.value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-gray-50 p-6 space-y-4">
                    <div className={cn('grid gap-4', isMobile ? 'grid-cols-1' : 'grid-cols-2')}>
                        <div>
                            <label className="text-sm text-gray-600 block mb-1">First name</label>
                            <div className="h-10 bg-white border border-gray-200" />
                        </div>
                        <div>
                            <label className="text-sm text-gray-600 block mb-1">Last name</label>
                            <div className="h-10 bg-white border border-gray-200" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 block mb-1">Email</label>
                        <div className="h-10 bg-white border border-gray-200" />
                    </div>
                    <div>
                        <label className="text-sm text-gray-600 block mb-1">Message</label>
                        <div className="h-32 bg-white border border-gray-200" />
                    </div>
                    <button className="w-full bg-gray-900 text-white px-4 py-2.5 text-sm font-medium">
                        Submit
                    </button>
                </div>
            </div>
        </div>
    )
}

// ============================================
// Team Layout
// ============================================

export function TeamLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    const team = [
        { name: 'Full name', role: 'Job title' },
        { name: 'Full name', role: 'Job title' },
        { name: 'Full name', role: 'Job title' },
        { name: 'Full name', role: 'Job title' },
    ]

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Our team</p>
                    <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-4xl')}>
                        Meet our team
                    </h2>
                    <p className="text-gray-600 mt-4">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                </div>

                <div className={cn('grid gap-8', isMobile ? 'grid-cols-2' : 'grid-cols-4')}>
                    {team.map((member, i) => (
                        <div key={i} className="text-center space-y-3">
                            <ImagePlaceholder aspectRatio="aspect-square" className="rounded-lg" />
                            <div>
                                <p className="font-semibold text-gray-900">{member.name}</p>
                                <p className="text-gray-500 text-sm">{member.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Stats Layout
// ============================================

export function StatsLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    const stats = [
        { value: '50%', label: 'Short description here' },
        { value: '50%', label: 'Short description here' },
        { value: '50%', label: 'Short description here' },
        { value: '50%', label: 'Short description here' },
    ]

    return (
        <div className={cn('px-6 py-16 bg-gray-50', className)}>
            <div className={cn(
                'max-w-6xl mx-auto grid gap-8 text-center',
                isMobile ? 'grid-cols-2' : 'grid-cols-4'
            )}>
                {stats.map((stat, i) => (
                    <div key={i}>
                        <p className={cn('font-bold text-gray-900', isMobile ? 'text-3xl' : 'text-5xl')}>
                            {stat.value}
                        </p>
                        <p className="text-gray-600 mt-2 text-sm">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

// ============================================
// Blog/Articles Layout
// ============================================

export function BlogLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    const posts = [
        { category: 'Category', title: 'Blog title heading will go here', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { category: 'Category', title: 'Blog title heading will go here', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
        { category: 'Category', title: 'Blog title heading will go here', desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
    ]

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-4xl')}>
                            Blog
                        </h2>
                        <p className="text-gray-600 mt-2">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                    </div>
                    {!isMobile && (
                        <button className="border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium">
                            View all
                        </button>
                    )}
                </div>

                <div className={cn('grid gap-8', isMobile ? 'grid-cols-1' : 'grid-cols-3')}>
                    {(isMobile ? posts.slice(0, 2) : posts).map((post, i) => (
                        <div key={i} className="space-y-4">
                            <ImagePlaceholder aspectRatio="aspect-video" className="rounded-lg" />
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-500">{post.category}</p>
                                <h3 className="font-semibold text-gray-900">{post.title}</h3>
                                <p className="text-gray-600 text-sm">{post.desc}</p>
                            </div>
                            <button className="text-sm font-medium text-gray-900 flex items-center gap-1">
                                Read more →
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Logos/Partners Layout
// ============================================

export function LogosLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-12 bg-white', className)}>
            <div className="max-w-6xl mx-auto">
                <p className="text-center text-gray-500 text-sm mb-8">
                    Trusted by the world&apos;s most innovative teams
                </p>
                <div className={cn(
                    'flex flex-wrap items-center justify-center gap-8',
                    isMobile && 'gap-6'
                )}>
                    {Array.from({ length: isMobile ? 4 : 6 }).map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                'bg-gray-100 rounded flex items-center justify-center text-gray-400 text-xs font-medium',
                                isMobile ? 'w-20 h-8' : 'w-28 h-10'
                            )}
                        >
                            Logo
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Gallery Layout
// ============================================

export function GalleryLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className="max-w-6xl mx-auto">
                <div className={cn('grid gap-4', isMobile ? 'grid-cols-2' : 'grid-cols-3')}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <ImagePlaceholder
                            key={i}
                            aspectRatio={i === 0 && !isMobile ? 'aspect-square col-span-2 row-span-2' : 'aspect-square'}
                            className="rounded-lg"
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

// ============================================
// Generic Content Layout
// ============================================

export function GenericLayout({ section, viewport, className }: WireframeLayoutProps) {
    const isMobile = viewport === 'mobile'

    return (
        <div className={cn('px-6 py-16 bg-white', className)}>
            <div className="max-w-3xl mx-auto space-y-6">
                <h2 className={cn('font-bold text-gray-900', isMobile ? 'text-2xl' : 'text-3xl')}>
                    {section.name || 'Section heading'}
                </h2>
                <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.
                    Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.
                </p>
                <ImagePlaceholder aspectRatio="aspect-video" className="rounded-lg" />
                <p className="text-gray-600">
                    Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.
                </p>
            </div>
        </div>
    )
}
