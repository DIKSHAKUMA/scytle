import Link from 'next/link'
import { ArrowRight, Zap, Sparkles, Layers, Code, Rocket, Check, Play, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { LandingHeader } from '@/components/landing-header'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-radial" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-accent/3 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container py-20 md:py-28 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary border border-border/50 px-4 py-2 text-sm mb-8 shadow-sm">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              </div>
              <span className="text-muted-foreground">Loved by 2,000+ makers</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-6">
              From idea to live —
              <br />
              <span className="text-accent">with AI that thinks</span>
              <br />
              before it builds
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Unlike tools that just generate code, Scytle researches your market,
              plans your product, designs your UI, then builds production-ready code.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 text-base font-semibold bg-primary hover:bg-primary/90 shadow-xl shadow-primary/25 gap-2">
                  Start building for free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="#demo">
                <Button variant="outline" size="lg" className="h-14 px-8 text-base font-medium gap-2 border-border/80 bg-background hover:bg-secondary">
                  <Play className="w-4 h-4" />
                  Watch demo
                </Button>
              </Link>
            </div>

            {/* Social proof */}
            <p className="mt-8 text-sm text-muted-foreground">
              Free to start • No credit card required • Ship in minutes
            </p>
          </div>

          {/* Hero Image/Demo */}
          <div className="mt-20 mx-auto max-w-6xl">
            <div className="relative rounded-2xl border border-border/50 bg-gradient-to-b from-card to-secondary/50 shadow-2xl shadow-primary/5 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px]" />
              <div className="relative aspect-[16/10] flex items-center justify-center p-8">
                {/* Fake UI Preview */}
                <div className="w-full h-full bg-card rounded-xl border border-border/50 shadow-lg flex">
                  {/* Sidebar */}
                  <div className="w-80 border-r border-border/50 p-4 flex flex-col gap-3">
                    <div className="h-8 w-32 bg-muted rounded-md" />
                    <div className="flex-1 space-y-2">
                      <div className="h-10 bg-accent/10 rounded-lg" />
                      <div className="h-10 bg-muted/50 rounded-lg" />
                      <div className="h-10 bg-muted/50 rounded-lg" />
                    </div>
                    <div className="h-12 bg-muted rounded-lg" />
                  </div>
                  {/* Main area */}
                  <div className="flex-1 p-6">
                    <div className="flex gap-2 mb-6">
                      <div className="h-9 w-24 bg-accent rounded-lg" />
                      <div className="h-9 w-24 bg-muted rounded-lg" />
                      <div className="h-9 w-24 bg-muted rounded-lg" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="aspect-square bg-muted/50 rounded-xl border-2 border-dashed border-border" />
                      <div className="aspect-square bg-muted/50 rounded-xl border-2 border-dashed border-border" />
                      <div className="aspect-square bg-muted/50 rounded-xl border-2 border-dashed border-border" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 lg:py-32 bg-gradient-warm">
        <div className="container">
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">Features</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6">
              Everything you need to
              <br />
              build products faster
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              One platform that takes you from initial idea to deployed product,
              with AI assistance at every step.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: Sparkles,
                title: 'AI Research',
                description: 'Analyze competitors, find market gaps, and validate your idea before building.',
                color: 'from-violet-500/20 to-violet-500/5',
              },
              {
                icon: Layers,
                title: 'Visual Sitemap',
                description: 'Plan your product structure with an intuitive drag-and-drop sitemap editor.',
                color: 'from-blue-500/20 to-blue-500/5',
              },
              {
                icon: Code,
                title: 'Code Generation',
                description: 'Generate production-ready Next.js code with TypeScript and Tailwind CSS.',
                color: 'from-emerald-500/20 to-emerald-500/5',
              },
              {
                icon: Zap,
                title: 'Style Guide',
                description: 'AI creates a complete design system with colors, typography, and components.',
                color: 'from-amber-500/20 to-amber-500/5',
              },
              {
                icon: Rocket,
                title: 'One-Click Deploy',
                description: 'Export your project or deploy directly to Vercel with one click.',
                color: 'from-rose-500/20 to-rose-500/5',
              },
              {
                icon: Check,
                title: 'Best Practices',
                description: 'Every generated project follows accessibility and performance best practices.',
                color: 'from-teal-500/20 to-teal-500/5',
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-8 rounded-2xl border border-border/50 bg-card shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 lg:py-32">
        <div className="container">
          <div className="text-center mb-16 lg:mb-20">
            <p className="text-sm font-semibold text-accent uppercase tracking-wider mb-4">How it works</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6">
              From idea to production
              <br />
              in 4 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Describe your idea', desc: 'Tell AI what you want to build in plain English' },
              { step: '02', title: 'AI researches & plans', desc: 'We analyze competitors and create your strategy' },
              { step: '03', title: 'Review & customize', desc: 'Edit sitemap, wireframes, and design to your liking' },
              { step: '04', title: 'Export & deploy', desc: 'Get production-ready code and deploy instantly' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl lg:text-6xl font-display font-bold text-accent/20 mb-4">{item.step}</div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight mb-6">
              Ready to build something amazing?
            </h2>
            <p className="text-lg opacity-80 mb-10">
              Join thousands of makers shipping products faster with Scytle.
              Start for free, no credit card required.
            </p>
            <Link href="/signup">
              <Button size="lg" variant="secondary" className="h-14 px-10 text-base font-semibold gap-2 shadow-xl">
                Get started for free
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-secondary/30">
        <div className="container py-16">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
            {/* Brand */}
            <div className="max-w-xs">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="font-display font-bold text-lg">Scytle</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                From idea to live — with AI that thinks before it builds.
              </p>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                  <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                  <li><Link href="/changelog" className="hover:text-foreground transition-colors">Changelog</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
                  <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                  <li><Link href="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link></li>
                  <li><Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Scytle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
