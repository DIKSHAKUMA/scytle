/**
 * Deterministic Section Templates
 *
 * Maps page archetypes (name + context) to pre-defined section lists.
 * Replaces AI-driven section selection for speed + accuracy:
 *   - Instant (zero API calls)
 *   - Context-correct (no dashboard presets on marketing pages)
 *   - Consistent, high-quality wireframe output
 *
 * Each template returns `{type, name, description}` tuples that feed into
 * `createSection()` in the unified store for full preset resolution.
 */

interface SectionTemplate {
    type: string
    name: string
    description: string
}

// ─────────────────────────────────────────────
// Marketing Page Templates
// ─────────────────────────────────────────────

const MARKETING_TEMPLATES: Record<string, SectionTemplate[]> = {
    home: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation with logo and menu links' },
        { type: 'hero', name: 'Hero', description: 'Bold headline, subheading, CTA buttons, and hero image' },
        { type: 'logos', name: 'Trusted By', description: 'Logo bar of partner or client brands' },
        { type: 'features', name: 'Features', description: 'Key product features in a grid layout' },
        { type: 'content', name: 'How It Works', description: 'Step-by-step process explanation' },
        { type: 'testimonials', name: 'Testimonials', description: 'Customer reviews and social proof cards' },
        { type: 'cta', name: 'Call to Action', description: 'Final conversion banner with CTA button' },
        { type: 'footer', name: 'Footer', description: 'Site footer with links, social icons, and copyright' },
    ],
    landing: [
        { type: 'navbar', name: 'Navbar', description: 'Minimal navigation with logo and single CTA' },
        { type: 'hero', name: 'Hero', description: 'Headline with value proposition and signup form' },
        { type: 'logos', name: 'Trusted By', description: 'Social proof logo strip' },
        { type: 'features', name: 'Benefits', description: 'Three key benefits with icons' },
        { type: 'testimonials', name: 'Social Proof', description: 'Customer testimonials carousel' },
        { type: 'pricing', name: 'Pricing', description: 'Simple pricing cards' },
        { type: 'faq', name: 'FAQ', description: 'Frequently asked questions accordion' },
        { type: 'cta', name: 'Call to Action', description: 'Final CTA banner with conversion focus' },
        { type: 'footer', name: 'Footer', description: 'Minimal footer with links' },
    ],
    about: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'About Hero', description: 'Company mission statement with background image' },
        { type: 'content', name: 'Our Story', description: 'Company history and journey narrative' },
        { type: 'stats', name: 'Company Stats', description: 'Key numbers: years, customers, team size' },
        { type: 'team', name: 'Our Team', description: 'Team member cards with photos and roles' },
        { type: 'cta', name: 'Join Us', description: 'Careers or contact call to action' },
        { type: 'footer', name: 'Footer', description: 'Site footer with links' },
    ],
    pricing: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Pricing Hero', description: 'Pricing page headline with toggle for monthly/annual' },
        { type: 'pricing', name: 'Pricing Plans', description: 'Tiered pricing cards with features comparison' },
        { type: 'features', name: 'Feature Comparison', description: 'Detailed feature comparison table' },
        { type: 'faq', name: 'Pricing FAQ', description: 'Common pricing questions and answers' },
        { type: 'cta', name: 'Get Started', description: 'Final conversion CTA' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    contact: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Contact Hero', description: 'Contact page headline with subtitle' },
        { type: 'contact', name: 'Contact Form', description: 'Form with name, email, message fields and submit CTA' },
        { type: 'content', name: 'Office Locations', description: 'Address, map, and business hours' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    features: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Features Hero', description: 'Features page headline with product screenshot' },
        { type: 'features', name: 'Core Features', description: 'Primary features grid with icons and descriptions' },
        { type: 'content', name: 'Feature Spotlight', description: 'Detailed split-view showcasing key feature' },
        { type: 'features', name: 'Additional Features', description: 'Secondary features in compact list' },
        { type: 'cta', name: 'Try It Free', description: 'CTA to start using the product' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    services: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Services Hero', description: 'Services page headline' },
        { type: 'features', name: 'Our Services', description: 'Grid of service offerings with descriptions' },
        { type: 'content', name: 'How We Work', description: 'Process steps from consultation to delivery' },
        { type: 'testimonials', name: 'Client Results', description: 'Client success stories and testimonials' },
        { type: 'cta', name: 'Get a Quote', description: 'Contact CTA for service inquiry' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    blog: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Blog Hero', description: 'Blog page title with search bar' },
        { type: 'blog', name: 'Blog Posts', description: 'Grid of blog post cards with thumbnails and excerpts' },
        { type: 'cta', name: 'Subscribe', description: 'Newsletter subscription CTA' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    faq: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'FAQ Hero', description: 'FAQ page title with search' },
        { type: 'faq', name: 'FAQ', description: 'Categorized accordion questions and answers' },
        { type: 'cta', name: 'Still Have Questions?', description: 'CTA to contact support' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    team: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Team Hero', description: 'Meet the team headline' },
        { type: 'team', name: 'Leadership', description: 'Leadership team cards with photos and bios' },
        { type: 'team', name: 'Our Team', description: 'Full team grid with roles' },
        { type: 'cta', name: 'Join Our Team', description: 'Careers page CTA' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    careers: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Careers Hero', description: 'Join our team headline with company culture image' },
        { type: 'content', name: 'Why Work With Us', description: 'Benefits and culture highlights' },
        { type: 'features', name: 'Open Positions', description: 'List of current job openings with filters' },
        { type: 'testimonials', name: 'Employee Stories', description: 'Team member testimonials' },
        { type: 'cta', name: 'Apply Now', description: 'Application CTA' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    portfolio: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Portfolio Hero', description: 'Portfolio page headline' },
        { type: 'gallery', name: 'Project Gallery', description: 'Filterable grid of project thumbnails' },
        { type: 'testimonials', name: 'Client Testimonials', description: 'Client feedback cards' },
        { type: 'cta', name: 'Start a Project', description: 'Contact CTA' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    gallery: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Gallery Hero', description: 'Gallery page headline' },
        { type: 'gallery', name: 'Photo Gallery', description: 'Mosaic image gallery with lightbox' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    testimonials: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Testimonials Hero', description: 'Customer stories headline' },
        { type: 'testimonials', name: 'Featured Reviews', description: 'Highlighted customer testimonials' },
        { type: 'stats', name: 'Results', description: 'Customer success metrics' },
        { type: 'cta', name: 'Join Them', description: 'Conversion CTA' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    integrations: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Integrations Hero', description: 'Integrations page headline' },
        { type: 'logos', name: 'Integration Partners', description: 'Grid of integration logos and names' },
        { type: 'features', name: 'Popular Integrations', description: 'Featured integrations with descriptions' },
        { type: 'cta', name: 'Request Integration', description: 'CTA to request new integrations' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    changelog: [
        { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
        { type: 'hero', name: 'Changelog Hero', description: 'Product updates headline' },
        { type: 'content', name: 'Recent Updates', description: 'Timeline of product updates and releases' },
        { type: 'cta', name: 'Stay Updated', description: 'Newsletter subscription CTA' },
        { type: 'footer', name: 'Footer', description: 'Site footer' },
    ],
    // E-commerce marketing pages
    shop: [
        { type: 'navbar', name: 'Navbar', description: 'Navigation with cart and search' },
        { type: 'hero', name: 'Shop Hero', description: 'Featured product or collection banner' },
        { type: 'features', name: 'Product Categories', description: 'Category grid with thumbnails' },
        { type: 'gallery', name: 'Best Sellers', description: 'Product card grid with prices' },
        { type: 'testimonials', name: 'Customer Reviews', description: 'Shopper reviews and ratings' },
        { type: 'cta', name: 'Shop Now', description: 'Promotional CTA banner' },
        { type: 'footer', name: 'Footer', description: 'Site footer with policies and contact' },
    ],
}

// Marketing fallback (generic marketing page)
const MARKETING_DEFAULT: SectionTemplate[] = [
    { type: 'navbar', name: 'Navbar', description: 'Main navigation' },
    { type: 'hero', name: 'Hero', description: 'Page headline with supporting copy' },
    { type: 'content', name: 'Content', description: 'Main page content section' },
    { type: 'cta', name: 'Call to Action', description: 'Conversion CTA' },
    { type: 'footer', name: 'Footer', description: 'Site footer' },
]

// ─────────────────────────────────────────────
// Application Page Templates
// ─────────────────────────────────────────────

const APPLICATION_TEMPLATES: Record<string, SectionTemplate[]> = {
    dashboard: [
        { type: 'dashboard', name: 'Page Header', description: 'Page title with date range filter and action buttons' },
        { type: 'dashboard', name: 'Stats Overview', description: 'Row of stat cards showing key metrics' },
        { type: 'chart', name: 'Revenue Trend Chart', description: 'Line chart showing trends over time' },
        { type: 'data-table', name: 'Recent Activity Table', description: 'Table of latest events or transactions' },
    ],
    overview: [
        { type: 'dashboard', name: 'Page Header', description: 'Overview page title with quick actions' },
        { type: 'dashboard', name: 'Stats Overview', description: 'Summary metric cards' },
        { type: 'chart', name: 'Activity Chart', description: 'Bar chart of recent activity' },
        { type: 'app-list', name: 'Quick Access', description: 'Grid of recently accessed items' },
    ],
    settings: [
        { type: 'dashboard', name: 'Page Header', description: 'Settings page title with breadcrumbs' },
        { type: 'app-form', name: 'Profile Settings Form', description: 'User profile form with avatar, name, email fields' },
        { type: 'app-form', name: 'Notification Preferences', description: 'Toggle switches for notification settings' },
    ],
    profile: [
        { type: 'dashboard', name: 'Page Header', description: 'Profile page title' },
        { type: 'app-form', name: 'Profile Information', description: 'User profile form with avatar and personal details' },
        { type: 'app-form', name: 'Security Settings', description: 'Password change and two-factor auth settings' },
    ],
    account: [
        { type: 'dashboard', name: 'Page Header', description: 'Account settings title' },
        { type: 'app-form', name: 'Account Details', description: 'Account information form' },
        { type: 'app-form', name: 'Preferences', description: 'Language, timezone, and display preferences' },
    ],
    analytics: [
        { type: 'dashboard', name: 'Page Header', description: 'Analytics title with date range picker' },
        { type: 'dashboard', name: 'Key Metrics', description: 'Row of KPI cards with trends' },
        { type: 'chart', name: 'Revenue Trend Chart', description: 'Primary analytics line chart' },
        { type: 'chart', name: 'Distribution Breakdown Chart', description: 'Pie chart showing distribution' },
        { type: 'data-table', name: 'Detailed Data Table', description: 'Sortable data table with export option' },
    ],
    reports: [
        { type: 'dashboard', name: 'Page Header', description: 'Reports title with generate button' },
        { type: 'chart', name: 'Summary Chart', description: 'Overview chart of report data' },
        { type: 'data-table', name: 'Report Data Table', description: 'Detailed report table with filters' },
    ],
    billing: [
        { type: 'dashboard', name: 'Page Header', description: 'Billing page title' },
        { type: 'app-form', name: 'Subscription Details', description: 'Current plan info and description list' },
        { type: 'app-form', name: 'Payment Method Form', description: 'Credit card and billing address form' },
        { type: 'data-table', name: 'Invoice History Table', description: 'Table of past invoices with download links' },
    ],
    payments: [
        { type: 'dashboard', name: 'Page Header', description: 'Payments page title' },
        { type: 'dashboard', name: 'Payment Stats', description: 'Total revenue, pending, and processed stats' },
        { type: 'data-table', name: 'Payment History Table', description: 'Payments table with status and amounts' },
    ],
    projects: [
        { type: 'dashboard', name: 'Page Header', description: 'Projects title with create button' },
        { type: 'app-list', name: 'Project List', description: 'Grid of project cards with status and progress' },
    ],
    'project-detail': [
        { type: 'dashboard', name: 'Page Header', description: 'Project name with tabs and actions' },
        { type: 'dashboard', name: 'Stats Overview', description: 'Project metrics: tasks, progress, deadline' },
        { type: 'data-table', name: 'Task List', description: 'Sortable task list with status and assignees' },
    ],
    orders: [
        { type: 'dashboard', name: 'Page Header', description: 'Orders title with filters' },
        { type: 'dashboard', name: 'Order Stats', description: 'Total orders, pending, completed, revenue' },
        { type: 'data-table', name: 'Orders Table', description: 'Order table with status, customer, and amount' },
    ],
    'order-detail': [
        { type: 'dashboard', name: 'Page Header', description: 'Order details with status badge' },
        { type: 'app-form', name: 'Order Information', description: 'Order summary with items and shipping details' },
    ],
    products: [
        { type: 'dashboard', name: 'Page Header', description: 'Products title with add product button' },
        { type: 'app-list', name: 'Product List', description: 'Grid of product cards with images and prices' },
    ],
    customers: [
        { type: 'dashboard', name: 'Page Header', description: 'Customers title with search' },
        { type: 'dashboard', name: 'Customer Stats', description: 'Total customers, active, churned' },
        { type: 'data-table', name: 'Customer Table', description: 'Customer table with name, email, and status' },
    ],
    users: [
        { type: 'dashboard', name: 'Page Header', description: 'Users management title' },
        { type: 'data-table', name: 'Users Table', description: 'User list with roles and status' },
    ],
    members: [
        { type: 'dashboard', name: 'Page Header', description: 'Team members title with invite button' },
        { type: 'app-list', name: 'Member List', description: 'Team member cards with roles and status' },
    ],
    inbox: [
        { type: 'dashboard', name: 'Page Header', description: 'Inbox title with compose button' },
        { type: 'app-list', name: 'Message List', description: 'List of messages with sender and preview' },
    ],
    notifications: [
        { type: 'dashboard', name: 'Page Header', description: 'Notifications title with mark all read' },
        { type: 'app-list', name: 'Notification Feed', description: 'List of notifications grouped by date' },
    ],
    tasks: [
        { type: 'dashboard', name: 'Page Header', description: 'Tasks title with add task button' },
        { type: 'dashboard', name: 'Task Stats', description: 'Open, in progress, completed task counts' },
        { type: 'data-table', name: 'Task List', description: 'Task table with priority, assignee, and due date' },
    ],
    calendar: [
        { type: 'dashboard', name: 'Page Header', description: 'Calendar title with view toggle' },
        { type: 'chart', name: 'Calendar View', description: 'Monthly calendar grid with events' },
    ],
    inventory: [
        { type: 'dashboard', name: 'Page Header', description: 'Inventory title with add item button' },
        { type: 'dashboard', name: 'Inventory Stats', description: 'Total items, low stock, out of stock counts' },
        { type: 'data-table', name: 'Inventory Table', description: 'Product inventory with stock levels and SKU' },
    ],
}

// Application fallback (generic app page)
const APPLICATION_DEFAULT: SectionTemplate[] = [
    { type: 'dashboard', name: 'Page Header', description: 'Page title with actions' },
    { type: 'app-list', name: 'Item List', description: 'List of items with search and filters' },
]

// ─────────────────────────────────────────────
// Auth Page Templates
// ─────────────────────────────────────────────

const AUTH_TEMPLATES: Record<string, SectionTemplate[]> = {
    login: [
        { type: 'auth', name: 'Login Form', description: 'Email/password login with social login options and forgot password link' },
    ],
    'sign-in': [
        { type: 'auth', name: 'Login Form', description: 'Email/password login with social login options' },
    ],
    signup: [
        { type: 'auth', name: 'Signup Form', description: 'Registration form with name, email, password and social signup options' },
    ],
    register: [
        { type: 'auth', name: 'Signup Form', description: 'Registration form with name, email, password fields' },
    ],
    'sign-up': [
        { type: 'auth', name: 'Signup Form', description: 'Registration form with social signup options' },
    ],
    'forgot-password': [
        { type: 'auth', name: 'Reset Password', description: 'Password reset form with email field' },
    ],
    'reset-password': [
        { type: 'auth', name: 'Reset Password', description: 'New password form with confirmation' },
    ],
    verify: [
        { type: 'auth', name: 'Verify Email', description: 'Email verification code input' },
    ],
    onboarding: [
        { type: 'auth', name: 'Onboarding', description: 'Multi-step onboarding wizard' },
    ],
}

// Auth fallback
const AUTH_DEFAULT: SectionTemplate[] = [
    { type: 'auth', name: 'Login Form', description: 'Authentication form' },
]

// ─────────────────────────────────────────────
// Main API
// ─────────────────────────────────────────────

/**
 * Get deterministic section templates for a page based on its name, slug, and context.
 *
 * Resolution order:
 * 1. Exact match on page name/slug against template key
 * 2. Keyword match against template keys
 * 3. Context-based default (marketing/application/auth)
 */
export function getSectionsForPage(
    pageName: string,
    slug: string,
    context: 'marketing' | 'application' | 'auth'
): SectionTemplate[] {
    const nameKey = pageName.toLowerCase().replace(/\s+/g, '-')
    const slugKey = slug.replace(/^\//, '').split('/').pop() || ''

    // Pick the right template bank
    const templates = context === 'auth'
        ? AUTH_TEMPLATES
        : context === 'application'
            ? APPLICATION_TEMPLATES
            : MARKETING_TEMPLATES

    const defaultTemplate = context === 'auth'
        ? AUTH_DEFAULT
        : context === 'application'
            ? APPLICATION_DEFAULT
            : MARKETING_DEFAULT

    // 1. Exact match on name key
    if (templates[nameKey]) return templates[nameKey]

    // 2. Exact match on slug key
    if (templates[slugKey]) return templates[slugKey]

    // 3. Keyword match — check if any template key appears in the name or slug
    const combined = `${nameKey} ${slugKey}`
    for (const [key, template] of Object.entries(templates)) {
        if (combined.includes(key)) return template
    }

    // 4. Marketing special: pages with these keywords in their name
    if (context === 'marketing') {
        if (/home|landing|main/.test(combined)) return MARKETING_TEMPLATES.home
        if (/about|story|mission/.test(combined)) return MARKETING_TEMPLATES.about
        if (/pric/.test(combined)) return MARKETING_TEMPLATES.pricing
        if (/contact|reach|get.in.touch/.test(combined)) return MARKETING_TEMPLATES.contact
        if (/feature|capability|what.we/.test(combined)) return MARKETING_TEMPLATES.features
        if (/service|solution|offering/.test(combined)) return MARKETING_TEMPLATES.services
        if (/blog|news|article|post/.test(combined)) return MARKETING_TEMPLATES.blog
        if (/faq|help|support|question/.test(combined)) return MARKETING_TEMPLATES.faq
        if (/team|people|staff/.test(combined)) return MARKETING_TEMPLATES.team
        if (/career|job|hiring|join/.test(combined)) return MARKETING_TEMPLATES.careers
        if (/portfolio|work|case.stud/.test(combined)) return MARKETING_TEMPLATES.portfolio
        if (/gallery|photo|image/.test(combined)) return MARKETING_TEMPLATES.gallery
        if (/testimonial|review|client/.test(combined)) return MARKETING_TEMPLATES.testimonials
        if (/integrat|connect|plugin/.test(combined)) return MARKETING_TEMPLATES.integrations
        if (/changelog|update|release|what.s.new/.test(combined)) return MARKETING_TEMPLATES.changelog
        if (/shop|store|product|catalog/.test(combined)) return MARKETING_TEMPLATES.shop
    }

    if (context === 'application') {
        if (/dashboard|home|overview/.test(combined)) return APPLICATION_TEMPLATES.dashboard
        if (/analytic|insight|metric/.test(combined)) return APPLICATION_TEMPLATES.analytics
        if (/report/.test(combined)) return APPLICATION_TEMPLATES.reports
        if (/setting|config|preference/.test(combined)) return APPLICATION_TEMPLATES.settings
        if (/profile|my.account/.test(combined)) return APPLICATION_TEMPLATES.profile
        if (/billing|subscription|plan/.test(combined)) return APPLICATION_TEMPLATES.billing
        if (/payment|transaction/.test(combined)) return APPLICATION_TEMPLATES.payments
        if (/project/.test(combined)) return APPLICATION_TEMPLATES.projects
        if (/order/.test(combined)) return APPLICATION_TEMPLATES.orders
        if (/product|item|inventory/.test(combined)) return APPLICATION_TEMPLATES.products
        if (/customer|client/.test(combined)) return APPLICATION_TEMPLATES.customers
        if (/user|member|team/.test(combined)) return APPLICATION_TEMPLATES.users
        if (/inbox|message|chat/.test(combined)) return APPLICATION_TEMPLATES.inbox
        if (/notification|alert/.test(combined)) return APPLICATION_TEMPLATES.notifications
        if (/task|todo|ticket/.test(combined)) return APPLICATION_TEMPLATES.tasks
        if (/calendar|schedule|event/.test(combined)) return APPLICATION_TEMPLATES.calendar
    }

    if (context === 'auth') {
        if (/signup|sign.up|register/.test(combined)) return AUTH_TEMPLATES.signup
        if (/forgot|reset/.test(combined)) return AUTH_TEMPLATES['forgot-password']
        if (/verify|confirm/.test(combined)) return AUTH_TEMPLATES.verify
        if (/onboard|welcome|setup/.test(combined)) return AUTH_TEMPLATES.onboarding
    }

    return defaultTemplate
}
