/**
 * Preset Catalog for AI Prompts — Server-Safe
 * 
 * Static catalog strings listing available design presets grouped by family.
 * Used by API routes to inject into AI prompts so the AI can pick specific
 * componentIds for varied, accurate wireframe generation.
 * 
 * This module does NOT import React components, making it safe for server routes.
 * Keep in sync with the design registry when families/presets are added.
 */

import type { PageContext } from '@/types'

const MARKETING_CATALOG = `[hero] Split Hero: hero-split, hero-split-landscape | Centered Hero: hero-centered, hero-with-image, hero-image-bg-centered | Video Hero: hero-video-centered | Minimal Hero: hero-minimal-with-image, hero-minimal-text-only | Image BG Hero: hero-image-bg-dark, hero-image-bg-split-text | Form Hero: hero-form-inline, hero-form-split, hero-form-stacked | Card Hero: hero-card-left, hero-card-centered
[features] Features Grid: features-grid-3col, features-grid-2col, features-grid-4col, features-grid-bordered | Features List: features-list-default | Features Split: features-split-default | Features Numbered: features-numbered-grid, features-numbered-list
[cta] CTA Banner: cta-banner-centered, cta-banner-accent, cta-banner-light | CTA Split: cta-split-default | CTA Minimal: cta-minimal-centered
[testimonials] Testimonial Cards: testimonials-cards-3-centered, testimonials-cards-2, testimonials-cards-3-left, testimonials-cards-cta | Testimonial Slider: testimonials-slider-arrows, testimonials-slider-logo | Testimonial Simple: testimonials-simple-default, testimonials-simple-stars, testimonials-simple-logo | Testimonial Split: testimonials-split-left, testimonials-split-right | Testimonial Card Image: testimonials-card-image-3, testimonials-card-image-2 | Testimonial Card BG: testimonials-card-bg-3, testimonials-card-bg-2
[pricing] Pricing Cards: pricing-cards-3tier, pricing-cards-2tier, pricing-cards-4tier | Pricing Comparison: pricing-comparison-3plan, pricing-comparison-2plan | Pricing Split: pricing-split-default | Pricing Left Header: pricing-left-header-3tier, pricing-left-header-2tier
[faq] FAQ Accordion: faq-accordion-centered, faq-accordion-left, faq-accordion-split, faq-accordion-cards, faq-accordion-categories | FAQ Two Column: faq-twocol-accordion, faq-twocol-flat | FAQ Flat: faq-flat-3col
[contact] Contact Split: contact-split-default, contact-split-reversed | Contact Simple: contact-simple-default, contact-simple-minimal | Contact Map: contact-map-default | Contact Info: contact-info-grid, contact-info-split, contact-info-list | Contact Locations: contact-locations-images, contact-locations-simple
[footer] Footer Columns: footer-columns-4, footer-columns-newsletter | Footer Simple: footer-simple-default | Footer CTA: footer-cta-default | Footer Big: footer-big-default, footer-big-newsletter | Footer Centered: footer-centered-default | Footer Branded: footer-branded-default
[navbar] Navbar Standard: navbar-standard-default, navbar-standard-search, navbar-standard-center | Navbar Centered: navbar-centered-default | Navbar Mega: navbar-mega-default | Navbar Floating: navbar-floating-default, navbar-floating-dual | Navbar Double: navbar-double-default | Navbar Fullscreen: navbar-fullscreen-grid, navbar-fullscreen-sidebar
[content] Content Text: content-1, content-2 | Content Tabs: content-3, content-4 | Content Steps: content-5, content-6 | Content Comparison: content-7 | Content Cards: content-8, content-9 | Content Image: content-10 | Content Video: content-11
[gallery] Gallery Grid: gallery-1, gallery-2 | Gallery Mosaic: gallery-3, gallery-4 | Gallery Filmstrip: gallery-5, gallery-6 | Gallery Featured: gallery-7 | Gallery Collage: gallery-8 | Gallery Showcase: gallery-9, gallery-10
[team] Team Grid: team-1 | Team Carousel: team-2 | Team Compact: team-3
[blog] Blog Grid: blog-1 | Blog Featured: blog-2 | Blog List: blog-3 | Blog Horizontal: blog-4
[stats] Stats Row: stats-1 | Stats Highlight: stats-2 | Stats Timeline: stats-3 | Stats Cards: stats-4, stats-5
[logos] Logo Row: logos-1 | Logo Grid: logos-2 | Logo Split: logos-3 | Logo Badge: logos-4`

const APPLICATION_CATALOG = `[dashboard] Stat Cards: stat-cards-1, stat-cards-2, stat-cards-3, stat-cards-4, stat-cards-5, stat-cards-6, stat-cards-7, stat-cards-8 | Page Header: page-header-1, page-header-2, page-header-3, page-header-4
[data-table] Standard Table: table-standard-1, table-standard-2, table-standard-3, table-standard-8, table-standard-9, table-standard-10 | Filtered Table: table-filtered-4, table-filtered-5, table-filtered-6 | Expandable Table: table-expandable-7
[app-list] Stacked List: list-stacked-1, list-stacked-2, list-stacked-3, list-stacked-4, list-stacked-5, list-stacked-6, list-stacked-7, list-stacked-8, list-stacked-9, list-stacked-10 | Grid List: list-grid-1, list-grid-2, list-grid-3, list-grid-4, list-grid-5, list-grid-6, list-grid-7, list-grid-8, list-grid-9, list-grid-10
[chart] Bar Chart: chart-bar-1, chart-bar-2, chart-bar-3 | Line Chart: chart-line-1, chart-line-2, chart-line-3 | Pie Chart: chart-pie-1, chart-pie-2, chart-pie-3 | Area Chart: chart-area-1, chart-area-2, chart-area-3
[app-form] Profile Form: form-profile-1, form-profile-2, form-profile-3, form-profile-4 | Payment Form: form-payment-1, form-payment-2, form-payment-3 | Preferences Form: form-preferences-1, form-preferences-2, form-preferences-3 | Description List: description-list-1, description-list-2, description-list-3, description-list-4
[empty-state] Empty State: empty-state-1, empty-state-2, empty-state-3, empty-state-4 | Onboarding: empty-state-5, empty-state-6, empty-state-7`

const AUTH_CATALOG = `[auth] Auth Signup: auth-signup-1, auth-signup-2, auth-signup-3, auth-signup-4, auth-signup-5, auth-signup-6, auth-signup-7, auth-signup-8, auth-signup-9 | Auth Login: auth-login-1, auth-login-2, auth-login-3, auth-login-4 | Auth Modal: auth-modal-1, auth-modal-2 | Auth Onboarding: auth-onboarding-1, auth-onboarding-2`

/**
 * Get the preset catalog filtered by page context.
 * Returns a formatted string listing all available presets grouped by family.
 */
export function getPresetCatalog(context?: PageContext): string {
    switch (context) {
        case 'marketing': return MARKETING_CATALOG
        case 'application': return APPLICATION_CATALOG
        case 'auth': return AUTH_CATALOG
        default: return `${MARKETING_CATALOG}\n${APPLICATION_CATALOG}\n${AUTH_CATALOG}`
    }
}
