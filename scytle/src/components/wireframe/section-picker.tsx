'use client'

import { useState, useMemo, useCallback } from 'react'
import {
    X,
    Search,
    Sparkles,
    LayoutTemplate,
    Type,
    Users,
    Star,
    HelpCircle,
    Image,
    CreditCard,
    Phone,
    BarChart3,
    Building2,
    FileText,
    Menu,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useUnifiedStore } from '@/store'
import type { WireframeSection } from '@/types'

interface SectionPickerProps {
    pageId: string
    insertIndex: number
    onCloseAction: () => void
}

interface SectionCategory {
    id: string
    label: string
    icon: React.ComponentType<{ className?: string }>
}

interface SectionTemplate {
    id: string
    type: string
    name: string
    description: string
    category: string
}

const SECTION_CATEGORIES: SectionCategory[] = [
    { id: 'all', label: 'All', icon: LayoutTemplate },
    { id: 'hero', label: 'Hero', icon: Type },
    { id: 'features', label: 'Features', icon: Star },
    { id: 'testimonials', label: 'Testimonials', icon: Users },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'pricing', label: 'Pricing', icon: CreditCard },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'team', label: 'Team', icon: Building2 },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'navigation', label: 'Navigation', icon: Menu },
]

const SECTION_TEMPLATES: SectionTemplate[] = [
    // Hero sections
    { id: 'hero-centered', type: 'hero', name: 'Hero Centered', description: 'Centered headline with CTA', category: 'hero' },
    { id: 'hero-split', type: 'hero', name: 'Hero Split', description: 'Text left, image right', category: 'hero' },
    { id: 'hero-video', type: 'hero', name: 'Hero Video', description: 'Background video hero', category: 'hero' },

    // Features
    { id: 'features-grid', type: 'features', name: 'Features Grid', description: '3-column feature cards', category: 'features' },
    { id: 'features-list', type: 'features', name: 'Features List', description: 'Alternating layout', category: 'features' },
    { id: 'features-icons', type: 'features', name: 'Features Icons', description: 'Icon-focused features', category: 'features' },

    // Testimonials
    { id: 'testimonials-carousel', type: 'testimonials', name: 'Testimonials Carousel', description: 'Sliding testimonials', category: 'testimonials' },
    { id: 'testimonials-grid', type: 'testimonials', name: 'Testimonials Grid', description: 'Grid of quotes', category: 'testimonials' },

    // FAQ
    { id: 'faq-accordion', type: 'faq', name: 'FAQ Accordion', description: 'Expandable questions', category: 'faq' },
    { id: 'faq-two-column', type: 'faq', name: 'FAQ Two Column', description: 'Side-by-side FAQ', category: 'faq' },

    // Gallery
    { id: 'gallery-masonry', type: 'gallery', name: 'Gallery Masonry', description: 'Pinterest-style grid', category: 'gallery' },
    { id: 'gallery-grid', type: 'gallery', name: 'Gallery Grid', description: 'Uniform image grid', category: 'gallery' },

    // Pricing
    { id: 'pricing-3tier', type: 'pricing', name: 'Pricing 3-Tier', description: 'Three pricing plans', category: 'pricing' },
    { id: 'pricing-comparison', type: 'pricing', name: 'Pricing Table', description: 'Feature comparison', category: 'pricing' },

    // Contact
    { id: 'contact-split', type: 'contact', name: 'Contact Split', description: 'Form + info layout', category: 'contact' },
    { id: 'contact-simple', type: 'contact', name: 'Contact Simple', description: 'Simple contact form', category: 'contact' },

    // Stats
    { id: 'stats-counter', type: 'stats', name: 'Stats Counter', description: 'Animated numbers', category: 'stats' },
    { id: 'stats-cards', type: 'stats', name: 'Stats Cards', description: 'Stat cards grid', category: 'stats' },

    // Team
    { id: 'team-grid', type: 'team', name: 'Team Grid', description: 'Team member cards', category: 'team' },
    { id: 'team-carousel', type: 'team', name: 'Team Carousel', description: 'Scrolling team', category: 'team' },

    // Blog
    { id: 'blog-grid', type: 'blog', name: 'Blog Grid', description: 'Article cards grid', category: 'blog' },
    { id: 'blog-featured', type: 'blog', name: 'Blog Featured', description: 'Featured + list', category: 'blog' },

    // Navigation
    { id: 'navbar-standard', type: 'navbar', name: 'Navbar', description: 'Standard navigation', category: 'navigation' },
    { id: 'footer-4col', type: 'footer', name: 'Footer', description: '4-column footer', category: 'navigation' },

    // CTA
    { id: 'cta-centered', type: 'cta', name: 'CTA Centered', description: 'Call to action block', category: 'features' },
    { id: 'cta-banner', type: 'cta', name: 'CTA Banner', description: 'Full-width banner', category: 'features' },

    // Logos
    { id: 'logos-scroll', type: 'logos', name: 'Logo Cloud', description: 'Scrolling logos', category: 'features' },
]

/**
 * SectionPicker Component
 * 
 * Design inspiration:
 * - Relume: Section library with categories
 * - Webflow: Add element panel
 * - Notion: Block picker with search
 * 
 * Features:
 * - Category filter buttons
 * - Search functionality
 * - AI "Suggest section" button
 * - Click to add section
 */
export function SectionPicker({
    pageId,
    insertIndex,
    onCloseAction,
}: SectionPickerProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')
    const [isAISuggesting, setIsAISuggesting] = useState(false)

    const { addSection } = useUnifiedStore()

    // Filter sections by category and search
    const filteredSections = useMemo(() => {
        let sections = SECTION_TEMPLATES

        // Filter by category
        if (activeCategory !== 'all') {
            sections = sections.filter(s => s.category === activeCategory)
        }

        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            sections = sections.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.description.toLowerCase().includes(query) ||
                s.type.toLowerCase().includes(query)
            )
        }

        return sections
    }, [activeCategory, searchQuery])

    // Handle section selection
    const handleSelectSection = useCallback((template: SectionTemplate) => {
        const newSection: WireframeSection = {
            id: `section-${Date.now()}`,
            type: template.type,
            name: template.name,
            description: template.description,
            componentId: template.id,
            order: insertIndex,
            isGlobal: template.type === 'navbar' || template.type === 'footer',
            content: {},
            controls: {},
        }

        addSection(pageId, newSection, insertIndex)
        onCloseAction()
    }, [pageId, insertIndex, addSection, onCloseAction])

    // Handle AI suggestion
    const handleAISuggest = useCallback(async () => {
        setIsAISuggesting(true)

        try {
            // Get page context
            const page = useUnifiedStore.getState().pages.find(p => p.id === pageId)
            const existingSections = page?.sections.map(s => ({
                type: s.type,
                name: s.name,
            })) || []

            // Call AI suggestion API
            const response = await fetch('/api/ai/suggest-section', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pageId,
                    pageName: page?.name || 'Page',
                    pageDescription: page?.description,
                    existingSections,
                    position: insertIndex === 0 ? 'top' : 'middle',
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to get suggestion')
            }

            const data = await response.json()
            const suggestion = data.suggestion

            // Create section from suggestion
            const newSection: WireframeSection = {
                id: `section-${Date.now()}`,
                type: suggestion.type,
                name: suggestion.name,
                description: suggestion.description,
                componentId: suggestion.componentId,
                order: insertIndex,
                isGlobal: suggestion.isGlobal || false,
                content: {},
                controls: {},
            }

            addSection(pageId, newSection, insertIndex)
            onCloseAction()
        } catch (error) {
            console.error('❌ AI suggestion failed:', error)
            // Fall back to random selection
            const randomIndex = Math.floor(Math.random() * SECTION_TEMPLATES.length)
            handleSelectSection(SECTION_TEMPLATES[randomIndex])
        } finally {
            setIsAISuggesting(false)
        }
    }, [pageId, insertIndex, addSection, onCloseAction, handleSelectSection])

    return (
        <div
            className={cn(
                'absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50',
                'w-80 bg-white rounded-lg shadow-xl border border-gray-200',
                'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <span className="text-sm font-medium">Add Section</span>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6"
                    onClick={onCloseAction}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Search */}
            <div className="p-2 border-b">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search sections..."
                        className="pl-8 h-8 text-sm"
                    />
                </div>
            </div>

            {/* AI Suggest Button */}
            <div className="px-2 py-2 border-b">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center gap-2"
                    onClick={handleAISuggest}
                    disabled={isAISuggesting}
                >
                    {isAISuggesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="h-4 w-4" />
                    )}
                    Suggest section
                </Button>
            </div>

            {/* Category Tabs */}
            <div className="px-2 py-2 border-b overflow-x-auto">
                <div className="flex gap-1">
                    {SECTION_CATEGORIES.slice(0, 6).map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={cn(
                                'flex items-center gap-1.5 px-2 py-1 rounded text-xs whitespace-nowrap',
                                'transition-colors',
                                activeCategory === category.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                            )}
                        >
                            <category.icon className="h-3 w-3" />
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Section Grid */}
            <ScrollArea className="h-64">
                <div className="p-2 grid grid-cols-2 gap-2">
                    {filteredSections.map((template) => (
                        <button
                            key={template.id}
                            onClick={() => handleSelectSection(template)}
                            className={cn(
                                'flex flex-col items-start p-2 rounded-lg border',
                                'bg-white hover:bg-muted/50 hover:border-primary/50',
                                'transition-colors text-left'
                            )}
                        >
                            {/* Thumbnail placeholder */}
                            <div className="w-full aspect-video bg-muted rounded mb-2 flex items-center justify-center">
                                <LayoutTemplate className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                            <span className="text-xs font-medium truncate w-full">
                                {template.name}
                            </span>
                            <span className="text-[10px] text-muted-foreground truncate w-full">
                                {template.description}
                            </span>
                        </button>
                    ))}

                    {filteredSections.length === 0 && (
                        <div className="col-span-2 py-8 text-center text-sm text-muted-foreground">
                            No sections found
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
