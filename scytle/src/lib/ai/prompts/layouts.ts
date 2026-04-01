// ============================================================
// Layout Archetypes
// 12 named layout patterns the planner selects from.
// Each includes a mini HTML skeleton used as few-shot context
// for the section generator.
// ============================================================

export interface LayoutArchetype {
    id: string
    name: string
    description: string
    /** CSS pattern summary for quick reference */
    cssHint: string
    /** Mini HTML skeleton (30-60 lines) injected as few-shot */
    skeleton: string
}

export const LAYOUT_ARCHETYPES: LayoutArchetype[] = [
    {
        id: 'split-hero',
        name: 'Split Hero',
        description: 'Content on one side, image/visual on the other. Great for hero sections and feature highlights.',
        cssHint: 'flex flex-row with two equal children',
        skeleton: `<section class="flex flex-row gap-0 w-full bg-white">
  <div class="flex flex-col gap-6 justify-center w-[720px] px-16 py-20">
    <span class="text-sm font-medium text-blue-600 uppercase tracking-wider">Introducing Acme</span>
    <h1 class="text-5xl font-bold tracking-tight text-gray-900 leading-tight">Ship products faster with less friction</h1>
    <p class="text-lg text-gray-600 leading-relaxed">The modern platform for teams that build. From prototype to production in days, not months.</p>
    <div class="flex flex-row gap-4">
      <button class="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium">Start building</button>
      <button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium">Watch demo</button>
    </div>
  </div>
  <div class="w-[720px]">
    <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=720&h=560&fit=crop" alt="Team working" class="w-full h-full object-cover" />
  </div>
</section>`,
    },
    {
        id: 'centered-hero',
        name: 'Centered Hero',
        description: 'Full-width centered text with optional background image or gradient. Maximum impact for headlines.',
        cssHint: 'flex flex-col items-center text-center',
        skeleton: `<section class="flex flex-col items-center gap-8 w-full px-16 py-24 bg-gray-950 text-center">
  <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400">Now in beta</span>
  <h1 class="text-6xl font-bold tracking-tight text-white leading-tight">The future of<br/>design engineering</h1>
  <p class="text-xl text-gray-400 leading-relaxed w-[640px]">Build stunning interfaces at the speed of thought. No compromises on quality or performance.</p>
  <div class="flex flex-row gap-4">
    <button class="px-8 py-4 bg-white text-gray-900 rounded-xl font-medium text-lg">Get started free</button>
    <button class="px-8 py-4 border border-gray-700 text-gray-300 rounded-xl font-medium text-lg">Learn more</button>
  </div>
</section>`,
    },
    {
        id: 'bento-grid',
        name: 'Bento Grid',
        description: 'Mixed-size cards in an asymmetric grid. Modern, editorial feel. Great for features or showcases.',
        cssHint: 'grid with col/row spans for variety',
        skeleton: `<section class="flex flex-col gap-8 w-full px-16 py-20 bg-white">
  <div class="flex flex-col gap-3">
    <h2 class="text-4xl font-bold text-gray-900">Everything you need</h2>
    <p class="text-lg text-gray-600">Powerful tools, thoughtfully designed.</p>
  </div>
  <div class="flex flex-row gap-4 w-full">
    <div class="flex flex-col gap-4 w-[480px] bg-gray-50 rounded-2xl p-8">
      <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/></svg>
      </div>
      <h3 class="text-xl font-semibold text-gray-900">Real-time collaboration</h3>
      <p class="text-gray-600">Work together with your team in real-time. See changes as they happen.</p>
    </div>
    <div class="flex flex-col gap-4 w-[480px] bg-blue-600 rounded-2xl p-8">
      <h3 class="text-xl font-semibold text-white">Analytics built in</h3>
      <p class="text-blue-100">Track engagement, conversions, and growth — all from one dashboard.</p>
      <div class="flex flex-row items-end gap-2 h-32">
        <div class="w-12 bg-blue-400 rounded-t-lg" style="height:40%"></div>
        <div class="w-12 bg-blue-400 rounded-t-lg" style="height:65%"></div>
        <div class="w-12 bg-blue-400 rounded-t-lg" style="height:80%"></div>
        <div class="w-12 bg-white rounded-t-lg" style="height:95%"></div>
      </div>
    </div>
    <div class="flex flex-col gap-4 w-[440px] bg-gray-50 rounded-2xl p-8">
      <h3 class="text-xl font-semibold text-gray-900">99.99% uptime</h3>
      <p class="text-gray-600">Enterprise-grade infrastructure you can trust. Built on Cloudflare's global network.</p>
    </div>
  </div>
</section>`,
    },
    {
        id: 'card-mosaic',
        name: 'Card Mosaic',
        description: 'Uniform cards in a clean grid. Classic pattern for features, team, testimonials, or pricing.',
        cssHint: 'flex flex-row flex-wrap gap-6, equal-width cards',
        skeleton: `<section class="flex flex-col gap-10 w-full px-16 py-20 bg-gray-50">
  <div class="flex flex-col gap-3 items-center text-center">
    <h2 class="text-4xl font-bold text-gray-900">What our customers say</h2>
    <p class="text-lg text-gray-600">Join 2,400+ teams already shipping faster.</p>
  </div>
  <div class="flex flex-row gap-6 w-full">
    <div class="flex flex-col gap-4 w-[440px] bg-white rounded-2xl p-8 border border-gray-200">
      <p class="text-gray-700 leading-relaxed">"Completely transformed our workflow. We shipped our redesign in 2 weeks instead of 2 months."</p>
      <div class="flex flex-row gap-3 items-center">
        <div class="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 text-sm font-semibold">SC</div>
        <div class="flex flex-col gap-0">
          <span class="text-sm font-semibold text-gray-900">Sarah Chen</span>
          <span class="text-xs text-gray-500">VP Engineering, Raycast</span>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-4 w-[440px] bg-white rounded-2xl p-8 border border-gray-200">
      <p class="text-gray-700 leading-relaxed">"The best tool we've added to our stack this year. Period."</p>
      <div class="flex flex-row gap-3 items-center">
        <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-semibold">MR</div>
        <div class="flex flex-col gap-0">
          <span class="text-sm font-semibold text-gray-900">Marcus Rivera</span>
          <span class="text-xs text-gray-500">CTO, Lattice</span>
        </div>
      </div>
    </div>
    <div class="flex flex-col gap-4 w-[440px] bg-white rounded-2xl p-8 border border-gray-200">
      <p class="text-gray-700 leading-relaxed">"Finally, a tool that respects design quality AND developer speed. We're never going back."</p>
      <div class="flex flex-row gap-3 items-center">
        <div class="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-sm font-semibold">ET</div>
        <div class="flex flex-col gap-0">
          <span class="text-sm font-semibold text-gray-900">Emma Thompson</span>
          <span class="text-xs text-gray-500">Design Lead, Linear</span>
        </div>
      </div>
    </div>
  </div>
</section>`,
    },
    {
        id: 'zigzag',
        name: 'Zigzag',
        description: 'Alternating image/text rows. Each row flips direction. Great for feature walkthroughs.',
        cssHint: 'flex flex-col gap-16, alternating flex-row / flex-row-reverse children',
        skeleton: `<section class="flex flex-col gap-16 w-full px-16 py-20 bg-white">
  <div class="flex flex-row gap-12 items-center">
    <div class="flex flex-col gap-4 w-[640px]">
      <h3 class="text-3xl font-bold text-gray-900">Design with intelligence</h3>
      <p class="text-lg text-gray-600 leading-relaxed">Our AI understands your design system and suggests components that match your brand, not generic templates.</p>
    </div>
    <div class="w-[640px] h-[360px] rounded-2xl bg-gray-100 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=640&h=360&fit=crop" alt="Design interface" class="w-full h-full object-cover" />
    </div>
  </div>
  <div class="flex flex-row-reverse gap-12 items-center">
    <div class="flex flex-col gap-4 w-[640px]">
      <h3 class="text-3xl font-bold text-gray-900">Ship with confidence</h3>
      <p class="text-lg text-gray-600 leading-relaxed">Every component is production-ready. Clean HTML, semantic markup, and accessible by default.</p>
    </div>
    <div class="w-[640px] h-[360px] rounded-2xl bg-gray-100 overflow-hidden">
      <img src="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=640&h=360&fit=crop" alt="Code editor" class="w-full h-full object-cover" />
    </div>
  </div>
</section>`,
    },
    {
        id: 'editorial',
        name: 'Editorial',
        description: 'Magazine-style with large featured image and overlapping text. Bold and visual.',
        cssHint: 'full-width image with text overlay positioned via flex',
        skeleton: `<section class="flex flex-col gap-0 w-full bg-gray-900">
  <div class="w-full h-[500px] overflow-hidden">
    <img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1440&h=500&fit=crop" alt="Landscape" class="w-full h-full object-cover opacity-60" />
  </div>
  <div class="flex flex-col gap-6 px-16 py-16 bg-gray-900">
    <h2 class="text-5xl font-bold text-white leading-tight">Crafted for creators<br/>who demand more</h2>
    <p class="text-xl text-gray-400 w-[600px] leading-relaxed">Every pixel intentional. Every interaction considered. Build products that people remember.</p>
    <button class="w-fit px-8 py-4 bg-white text-gray-900 rounded-xl font-medium">Explore the platform</button>
  </div>
</section>`,
    },
    {
        id: 'sidebar-feature',
        name: 'Sidebar Feature',
        description: 'Fixed sidebar with scrolling content area. Perfect for dashboards, settings, or app-style layouts.',
        cssHint: 'flex flex-row, narrow sidebar + wide content',
        skeleton: `<section class="flex flex-row gap-0 w-full h-[700px] bg-white">
  <div class="flex flex-col gap-1 w-[260px] bg-gray-50 border-r border-gray-200 p-4">
    <div class="flex flex-row gap-3 items-center px-3 py-2">
      <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-bold">A</div>
      <span class="text-sm font-semibold text-gray-900">Acme Inc</span>
    </div>
    <div class="flex flex-col gap-0 mt-4">
      <div class="flex flex-row gap-3 items-center px-3 py-2 bg-blue-50 rounded-lg text-blue-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        <span class="text-sm font-medium">Dashboard</span>
      </div>
      <div class="flex flex-row gap-3 items-center px-3 py-2 text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        <span class="text-sm font-medium">Team</span>
      </div>
      <div class="flex flex-row gap-3 items-center px-3 py-2 text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6"/></svg>
        <span class="text-sm font-medium">Settings</span>
      </div>
    </div>
  </div>
  <div class="flex flex-col gap-6 flex-1 p-8">
    <h2 class="text-2xl font-bold text-gray-900">Dashboard</h2>
    <div class="flex flex-row gap-4">
      <div class="flex flex-col gap-2 flex-1 bg-gray-50 rounded-xl p-6">
        <span class="text-sm text-gray-500">Total Revenue</span>
        <span class="text-3xl font-bold text-gray-900">$45,231</span>
        <span class="text-sm text-emerald-600">+20.1% from last month</span>
      </div>
      <div class="flex flex-col gap-2 flex-1 bg-gray-50 rounded-xl p-6">
        <span class="text-sm text-gray-500">Active Users</span>
        <span class="text-3xl font-bold text-gray-900">2,350</span>
        <span class="text-sm text-emerald-600">+180 this week</span>
      </div>
    </div>
  </div>
</section>`,
    },
    {
        id: 'full-bleed',
        name: 'Full Bleed',
        description: 'Edge-to-edge sections with no inner container constraints. Bold, immersive feel.',
        cssHint: 'w-full sections with no max-w or container',
        skeleton: `<section class="flex flex-col gap-0 w-full">
  <div class="w-full bg-indigo-600 px-16 py-24 flex flex-col gap-6">
    <h2 class="text-5xl font-bold text-white">Ready to transform your workflow?</h2>
    <p class="text-xl text-indigo-200">Join 5,000+ teams already using our platform.</p>
    <div class="flex flex-row gap-4">
      <button class="px-8 py-4 bg-white text-indigo-600 rounded-xl font-medium text-lg">Start free trial</button>
      <button class="px-8 py-4 border border-indigo-400 text-white rounded-xl font-medium text-lg">Talk to sales</button>
    </div>
  </div>
</section>`,
    },
    {
        id: 'stacked-cards',
        name: 'Stacked Cards',
        description: 'Vertically stacked wide cards. Clean and scannable. Great for pricing or feature comparison.',
        cssHint: 'flex flex-col gap-6, full-width cards',
        skeleton: `<section class="flex flex-col gap-8 w-full px-16 py-20 bg-gray-50">
  <h2 class="text-4xl font-bold text-gray-900">Simple, transparent pricing</h2>
  <div class="flex flex-col gap-4">
    <div class="flex flex-row gap-8 items-center w-full bg-white rounded-2xl p-8 border border-gray-200">
      <div class="flex flex-col gap-2 flex-1">
        <h3 class="text-xl font-semibold text-gray-900">Starter</h3>
        <p class="text-gray-600">For individuals and small teams getting started.</p>
      </div>
      <span class="text-3xl font-bold text-gray-900">$19<span class="text-base font-normal text-gray-500">/mo</span></span>
      <button class="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium">Choose plan</button>
    </div>
    <div class="flex flex-row gap-8 items-center w-full bg-blue-600 rounded-2xl p-8">
      <div class="flex flex-col gap-2 flex-1">
        <div class="flex flex-row gap-2 items-center">
          <h3 class="text-xl font-semibold text-white">Pro</h3>
          <span class="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 text-white">Popular</span>
        </div>
        <p class="text-blue-100">For growing teams that need more power and flexibility.</p>
      </div>
      <span class="text-3xl font-bold text-white">$49<span class="text-base font-normal text-blue-200">/mo</span></span>
      <button class="px-6 py-3 bg-white text-blue-600 rounded-xl font-medium">Choose plan</button>
    </div>
  </div>
</section>`,
    },
    {
        id: 'dashboard',
        name: 'Dashboard',
        description: 'App UI with sidebar, header, and content area. For SaaS application screens.',
        cssHint: 'flex flex-row, sidebar + flex-col main with header + content',
        skeleton: `<section class="flex flex-row gap-0 w-full h-[800px] bg-gray-100">
  <div class="flex flex-col gap-2 w-[240px] bg-white border-r border-gray-200 p-4">
    <div class="flex flex-row gap-2 items-center px-2 py-3">
      <div class="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white text-xs font-bold">P</div>
      <span class="text-sm font-semibold text-gray-900">Pulse</span>
    </div>
    <div class="flex flex-col gap-1 mt-2">
      <div class="px-3 py-2 rounded-lg bg-violet-50 text-violet-700 text-sm font-medium">Overview</div>
      <div class="px-3 py-2 text-gray-600 text-sm">Customers</div>
      <div class="px-3 py-2 text-gray-600 text-sm">Products</div>
      <div class="px-3 py-2 text-gray-600 text-sm">Analytics</div>
      <div class="px-3 py-2 text-gray-600 text-sm">Settings</div>
    </div>
  </div>
  <div class="flex flex-col gap-6 flex-1 p-6">
    <div class="flex flex-row justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-900">Overview</h1>
      <button class="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium">Export</button>
    </div>
    <div class="flex flex-row gap-4">
      <div class="flex flex-col gap-1 flex-1 bg-white rounded-xl p-5 border border-gray-200">
        <span class="text-xs text-gray-500 uppercase tracking-wider">Revenue</span>
        <span class="text-2xl font-bold text-gray-900">$142,850</span>
        <span class="text-xs text-emerald-600 font-medium">+12.3% vs last month</span>
      </div>
      <div class="flex flex-col gap-1 flex-1 bg-white rounded-xl p-5 border border-gray-200">
        <span class="text-xs text-gray-500 uppercase tracking-wider">Customers</span>
        <span class="text-2xl font-bold text-gray-900">2,847</span>
        <span class="text-xs text-emerald-600 font-medium">+89 this week</span>
      </div>
      <div class="flex flex-col gap-1 flex-1 bg-white rounded-xl p-5 border border-gray-200">
        <span class="text-xs text-gray-500 uppercase tracking-wider">Conversion</span>
        <span class="text-2xl font-bold text-gray-900">3.2%</span>
        <span class="text-xs text-red-500 font-medium">-0.4% vs last month</span>
      </div>
    </div>
  </div>
</section>`,
    },
    {
        id: 'asymmetric',
        name: 'Asymmetric',
        description: 'Unequal columns with strong visual weight on one side. Bold editorial feel.',
        cssHint: 'flex flex-row with 2/3 + 1/3 split',
        skeleton: `<section class="flex flex-row gap-0 w-full bg-white">
  <div class="flex flex-col gap-6 w-[920px] px-16 py-20 bg-gray-950">
    <h2 class="text-5xl font-bold text-white leading-tight">We don't just build tools.<br/>We build leverage.</h2>
    <p class="text-lg text-gray-400 leading-relaxed">Every feature is designed to multiply your team's output. Less busywork, more building.</p>
    <div class="flex flex-row gap-8 mt-8">
      <div class="flex flex-col gap-2">
        <span class="text-4xl font-bold text-white">10x</span>
        <span class="text-sm text-gray-500">Faster iteration</span>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-4xl font-bold text-white">98%</span>
        <span class="text-sm text-gray-500">Customer satisfaction</span>
      </div>
      <div class="flex flex-col gap-2">
        <span class="text-4xl font-bold text-white">50K+</span>
        <span class="text-sm text-gray-500">Components shipped</span>
      </div>
    </div>
  </div>
  <div class="w-[520px] bg-gray-100">
    <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=520&h=600&fit=crop" alt="Team collaboration" class="w-full h-full object-cover" />
  </div>
</section>`,
    },
    {
        id: 'magazine',
        name: 'Magazine',
        description: 'Multi-section editorial layout with varied content blocks. Great for blog pages or about pages.',
        cssHint: 'flex flex-col with mixed-width inner sections',
        skeleton: `<section class="flex flex-col gap-12 w-full px-16 py-20 bg-white">
  <div class="flex flex-col gap-4 w-[800px]">
    <span class="text-sm font-medium text-blue-600 uppercase tracking-wider">Our Story</span>
    <h2 class="text-5xl font-bold text-gray-900 leading-tight">Building the future of creative tools</h2>
    <p class="text-xl text-gray-600 leading-relaxed">Founded in 2024 by designers who were tired of generic tools. We believe every team deserves software that feels like it was built just for them.</p>
  </div>
  <div class="flex flex-row gap-8">
    <div class="flex flex-col gap-4 w-[640px]">
      <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=640&h=400&fit=crop" alt="Team meeting" class="w-full h-[400px] object-cover rounded-2xl" />
      <p class="text-gray-600 leading-relaxed">Our team of 32 is distributed across 8 countries. We ship fast, iterate constantly, and never compromise on craft.</p>
    </div>
    <div class="flex flex-col gap-6 w-[500px]">
      <div class="flex flex-col gap-2 p-6 bg-gray-50 rounded-xl">
        <span class="text-3xl font-bold text-gray-900">2024</span>
        <span class="text-gray-600">Founded in San Francisco</span>
      </div>
      <div class="flex flex-col gap-2 p-6 bg-gray-50 rounded-xl">
        <span class="text-3xl font-bold text-gray-900">$12M</span>
        <span class="text-gray-600">Series A from Sequoia</span>
      </div>
      <div class="flex flex-col gap-2 p-6 bg-gray-50 rounded-xl">
        <span class="text-3xl font-bold text-gray-900">5,000+</span>
        <span class="text-gray-600">Teams trust us daily</span>
      </div>
    </div>
  </div>
</section>`,
    },
]

/** Get a layout archetype by ID */
export function getLayoutById(id: string): LayoutArchetype | undefined {
    return LAYOUT_ARCHETYPES.find(l => l.id === id)
}

/** Get all layout IDs for the planner prompt */
export function getLayoutSummary(): string {
    return LAYOUT_ARCHETYPES.map(l =>
        `- "${l.id}": ${l.description}`
    ).join('\n')
}
