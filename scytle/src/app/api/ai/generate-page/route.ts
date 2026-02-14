import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromJWT } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'

const GeneratePageSchema = z.object({
    pageName: z.string().min(1, 'Page name is required'),
    pageDescription: z.string().optional(),
    pageContext: z.enum(['marketing', 'application', 'auth']).optional(),
    projectDescription: z.string().optional(),
    industry: z.string().optional(),
    existingSections: z.array(z.string()).optional(),
    sectionCount: z.number().min(1).max(12).optional(),
})

export async function POST(request: NextRequest) {
    try {
        // 1. Verify authentication
        const authHeader = request.headers.get('Authorization')
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const user = await getUserFromJWT(authHeader)
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // 2. Validate input
        const body = await request.json()
        const validation = GeneratePageSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const {
            pageName,
            pageDescription,
            pageContext,
            projectDescription,
            industry,
            existingSections,
            sectionCount: rawSectionCount,
        } = validation.data

        // Determine count based on context
        const context = pageContext || 'marketing'
        const sectionCount = rawSectionCount || (context === 'auth' ? 1 : context === 'application' ? 4 : 5)

        // 3. Generate page sections using AI
        const systemPrompt = `You are an expert web designer. Your task is to generate sections for a web page based on the page name, context, and layout.

INSTRUCTIONS:
1. Analyze the page name, description, and context
2. Generate appropriate sections for this type of page
3. Consider the project context and industry
4. Use clear, descriptive section names
5. Follow the rules for the page context

PAGE CONTEXT RULES:

"marketing" pages (layout: stacked):
  - Use section types: hero, features, about, team, testimonials, pricing, faq, cta, contact, gallery, services, stats, blog, content, navbar, footer
  - Include navbar at top and footer at bottom

"application" pages (layout: app-shell):
  - Use section types: dashboard, data-table, chart, app-form, app-list, app-header, empty-state
  - Do NOT include navbar or footer sections (the app shell provides built-in chrome)
  - Use descriptive names: "Stats Overview", "Revenue Chart", "Recent Orders Table", "User Settings Form"

"auth" pages (layout: centered):
  - Use section type: auth
  - Generate only 1-2 sections (just the auth form)
  - Do NOT include navbar or footer sections

RESPONSE FORMAT (JSON ONLY):
{
  "sections": [
    {
      "id": "stats-overview",
      "name": "Stats Overview",
      "type": "dashboard",
      "description": "Row of stat cards showing key metrics"
    }
  ],
  "pageTitle": "Page Title Suggestion",
  "metaDescription": "SEO meta description for this page"
}

SECTION TYPES (marketing):
- hero, features, about, team, testimonials, pricing, faq, cta, contact, gallery, services, stats, blog, header, footer

SECTION TYPES (application):
- dashboard: Stat cards, KPI widgets, overview panels
- data-table: Sortable/filterable data tables
- chart: Line charts, bar charts, pie charts, analytics
- app-form: Settings forms, profile editors, input forms
- app-list: Activity feeds, task lists, item lists
- app-header: Page title with actions and breadcrumbs
- empty-state: Zero-data state with illustration and CTA

SECTION TYPES (auth):
- auth: Login form, signup form, forgot password, verify email

IMPORTANT:
- Generate ${sectionCount} sections
- Order sections logically
- Only respond with valid JSON, no markdown`

        const userMessage = `Generate sections for the following page:

PAGE NAME: ${pageName}
PAGE CONTEXT: ${context}
${pageDescription ? `PAGE DESCRIPTION: ${pageDescription}` : ''}
${projectDescription ? `PROJECT CONTEXT: ${projectDescription}` : ''}
${industry ? `INDUSTRY: ${industry}` : ''}
${existingSections?.length ? `EXISTING SECTIONS (for context): ${existingSections.join(', ')}` : ''}

Generate ${sectionCount} appropriate sections for this "${context}" page. Follow the rules for "${context}" context strictly.`

        const aiResponse = await generate(userMessage, [], {
            model: 'fast',
            systemPrompt,
            temperature: 0.7,
        })

        // 4. Parse AI response
        let pageData
        try {
            // Extract JSON from response
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                throw new Error('No JSON found in response')
            }
            pageData = JSON.parse(jsonMatch[0])
        } catch (parseError) {
            console.error('🤖 Failed to parse AI response:', parseError)
            console.error('🤖 Raw response:', aiResponse)

            // Provide fallback sections based on page type
            pageData = {
                sections: getDefaultSectionsForPage(pageName, context),
                pageTitle: pageName,
                metaDescription: `${pageName} page`,
            }
        }

        // 5. Return the page structure
        return NextResponse.json({
            success: true,
            page: {
                name: pageName,
                sections: pageData.sections,
                pageTitle: pageData.pageTitle,
                metaDescription: pageData.metaDescription,
            },
        })
    } catch (error) {
        console.error('🤖 Generate page error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// Fallback sections based on common page types
function getDefaultSectionsForPage(pageName: string, pageContext?: string): Array<{
    id: string
    name: string
    type: string
    description: string
}> {
    const normalizedName = pageName.toLowerCase()
    const context = pageContext || 'marketing'

    // Auth pages — single auth section
    if (context === 'auth') {
        if (normalizedName.includes('signup') || normalizedName.includes('register') || normalizedName.includes('sign up')) {
            return [{ id: 'signup-form', name: 'Signup Form', type: 'auth', description: 'Registration form with name, email, password and social signup options' }]
        }
        if (normalizedName.includes('forgot') || normalizedName.includes('reset')) {
            return [{ id: 'reset-form', name: 'Reset Password', type: 'auth', description: 'Password reset form with email field and submit button' }]
        }
        return [{ id: 'login-form', name: 'Login Form', type: 'auth', description: 'Login form with email, password, social login options and forgot password link' }]
    }

    // Application pages — app section types (no navbar/footer)
    if (context === 'application') {
        if (normalizedName.includes('dashboard') || normalizedName.includes('overview')) {
            return [
                { id: 'page-header', name: 'Page Header', type: 'app-header', description: 'Page title with date filter and action buttons' },
                { id: 'stats', name: 'Stats Overview', type: 'dashboard', description: 'Row of stat cards showing key metrics' },
                { id: 'chart', name: 'Revenue Chart', type: 'chart', description: 'Line chart showing trends over time' },
                { id: 'recent', name: 'Recent Activity', type: 'data-table', description: 'Table of latest events or transactions' },
            ]
        }
        if (normalizedName.includes('setting') || normalizedName.includes('profile') || normalizedName.includes('account')) {
            return [
                { id: 'page-header', name: 'Page Header', type: 'app-header', description: 'Settings page title with breadcrumbs' },
                { id: 'profile-form', name: 'Profile Settings', type: 'app-form', description: 'User profile form with avatar, name, email fields' },
                { id: 'notification-form', name: 'Notification Preferences', type: 'app-form', description: 'Toggle switches for notification settings' },
            ]
        }
        if (normalizedName.includes('analytics') || normalizedName.includes('report')) {
            return [
                { id: 'page-header', name: 'Page Header', type: 'app-header', description: 'Analytics title with date range picker' },
                { id: 'chart-main', name: 'Main Chart', type: 'chart', description: 'Primary analytics chart (line or bar)' },
                { id: 'chart-secondary', name: 'Breakdown Chart', type: 'chart', description: 'Secondary chart showing distribution' },
                { id: 'data', name: 'Detailed Data', type: 'data-table', description: 'Sortable data table with export option' },
            ]
        }
        // Generic app page
        return [
            { id: 'page-header', name: 'Page Header', type: 'app-header', description: 'Page title with actions' },
            { id: 'list', name: 'Item List', type: 'app-list', description: 'List of items with search and filters' },
            { id: 'empty', name: 'Empty State', type: 'empty-state', description: 'Empty state shown when no items exist' },
        ]
    }

    // Marketing pages — original behavior
    if (normalizedName.includes('home')) {
        return [
            { id: 'hero', name: 'Hero', type: 'hero', description: 'Main hero section' },
            { id: 'features', name: 'Features', type: 'features', description: 'Key features' },
            { id: 'about', name: 'About', type: 'about', description: 'Brief about section' },
            { id: 'testimonials', name: 'Testimonials', type: 'testimonials', description: 'Customer reviews' },
            { id: 'cta', name: 'Call to Action', type: 'cta', description: 'Final CTA' },
        ]
    }

    if (normalizedName.includes('about')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Page title and intro' },
            { id: 'story', name: 'Our Story', type: 'about', description: 'Company story' },
            { id: 'values', name: 'Our Values', type: 'features', description: 'Company values' },
            { id: 'team', name: 'Our Team', type: 'team', description: 'Team members' },
            { id: 'cta', name: 'Join Us', type: 'cta', description: 'Career or contact CTA' },
        ]
    }

    if (normalizedName.includes('contact')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Contact page intro' },
            { id: 'form', name: 'Contact Form', type: 'contact', description: 'Main contact form' },
            { id: 'info', name: 'Contact Info', type: 'about', description: 'Address, phone, email' },
            { id: 'map', name: 'Location Map', type: 'gallery', description: 'Map embed' },
        ]
    }

    if (normalizedName.includes('service') || normalizedName.includes('product')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Services overview' },
            { id: 'services', name: 'Our Services', type: 'services', description: 'Service list' },
            { id: 'process', name: 'Our Process', type: 'features', description: 'How we work' },
            { id: 'pricing', name: 'Pricing', type: 'pricing', description: 'Pricing options' },
            { id: 'cta', name: 'Get Started', type: 'cta', description: 'Contact CTA' },
        ]
    }

    if (normalizedName.includes('pricing')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Pricing intro' },
            { id: 'pricing', name: 'Pricing Plans', type: 'pricing', description: 'Plan comparison' },
            { id: 'features', name: 'All Features', type: 'features', description: 'Feature comparison' },
            { id: 'faq', name: 'FAQ', type: 'faq', description: 'Pricing FAQs' },
            { id: 'cta', name: 'Start Now', type: 'cta', description: 'Sign up CTA' },
        ]
    }

    if (normalizedName.includes('blog')) {
        return [
            { id: 'hero', name: 'Page Header', type: 'header', description: 'Blog intro' },
            { id: 'posts', name: 'Latest Posts', type: 'blog', description: 'Blog post grid' },
            { id: 'categories', name: 'Categories', type: 'features', description: 'Blog categories' },
            { id: 'newsletter', name: 'Newsletter', type: 'cta', description: 'Newsletter signup' },
        ]
    }

    // Default sections for any page
    return [
        { id: 'hero', name: 'Page Header', type: 'header', description: 'Page title and intro' },
        { id: 'content', name: 'Main Content', type: 'about', description: 'Page content' },
        { id: 'features', name: 'Key Points', type: 'features', description: 'Important information' },
        { id: 'cta', name: 'Next Steps', type: 'cta', description: 'Call to action' },
    ]
}
