// ============================================================
// Page Planner Prompt
// AI analyzes user's product description and outputs a JSON plan
// of 3-5 pages with shared theme context.
// ============================================================

export interface PagePlan {
    projectName: string
    theme: {
        primary: string
        secondary: string
        accent: string
        bg: string
        text: string
        tone: string
    }
    pages: PagePlanEntry[]
}

export interface PagePlanEntry {
    name: string
    description: string
    pageType: 'marketing' | 'application' | 'auth' | 'content'
    priority: number
}

export function buildPagePlannerPrompt(productType: 'web' | 'app'): string {
    const isApp = productType === 'app'

    return `You are an expert product designer. Given a user's product description, plan the pages for their ${isApp ? 'mobile application' : 'website'}.

OUTPUT: Valid JSON only. No markdown fences, no explanation, no extra text before or after the JSON.

Schema:
{
  "projectName": "string - short product name (2-4 words)",
  "theme": {
    "primary": "#hex - main brand color",
    "secondary": "#hex - supporting color",
    "accent": "#hex - highlight/action color",
    "bg": "#hex - background color",
    "text": "#hex - text color",
    "tone": "modern | playful | professional | minimal | bold | elegant"
  },
  "pages": [
    {
      "name": "string - page name (e.g. 'Dashboard', 'Home', 'Profile')",
      "description": "string - 2-3 sentences describing exactly what UI elements, data, and layout this page shows",
      "pageType": "marketing | application | auth | content",
      "priority": 1
    }
  ]
}

RULES:
- Generate exactly ${isApp ? '4-5' : '3-5'} pages.
- Priority 1 is generated first (the main/home page).
- Page descriptions MUST be highly specific about UI elements. Examples of GOOD descriptions:
${isApp ? `  - "Home screen with a search bar at top, horizontal scrollable category chips (Pizza, Sushi, Burgers, etc.), a 'Featured' section with 2 large restaurant cards showing photos and ratings, and a vertical list of 4 nearby restaurants with distance, delivery time, and price range. Bottom tab bar with Home, Search, Orders, Profile."
  - "Order tracking screen showing a map placeholder at top, order status timeline (Confirmed > Preparing > On the way > Delivered) with current step highlighted, rider info card with name/photo/phone, and estimated arrival time countdown. Back button in header."
  - "Profile screen with user avatar and name at top, account stats row (Orders: 47, Reviews: 12, Saved: 8), settings list items (Payment Methods, Addresses, Notifications, Help, About) with right chevrons, and a Sign Out button at bottom."` : `  - "Analytics dashboard with sidebar navigation (Dashboard, Analytics, Users, Settings), 4 KPI cards at top (Total Revenue $142,850 +12.3%, Active Users 2,847, Conversion Rate 3.2%, Avg Order $68.40), a line chart showing monthly revenue trends for the last 6 months, and a data table of recent orders with columns: Order ID, Customer, Amount, Status badge, Date."
  - "Landing page with a hero section featuring gradient background, headline, subheading, email capture form, and product screenshot. Below: logo bar of 5 client logos, 3-column features grid with icons, a testimonial carousel with 3 quotes, pricing section with 3 tier cards (Starter/Pro/Enterprise), and a dark footer with 4-column links."
  - "Settings page with left sidebar showing setting categories (Profile, Security, Billing, Notifications, Integrations, API), main content area showing the Profile section with avatar upload, name/email form fields, timezone dropdown, and a 'Save Changes' primary button."`}
- Choose a color palette that matches the product's industry and vibe. Don't always use blue.
- Ensure pages feel like a cohesive product, not isolated designs.
- Output ONLY the JSON object. No markdown code blocks.`
}

export function buildPagePlannerMessage(description: string): string {
    return `Design the pages for this product: ${description}

Output valid JSON only.`
}
