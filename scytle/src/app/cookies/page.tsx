import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '@/components/layout/landing-header'

export const metadata: Metadata = {
  title: 'Cookies Policy | Scytle',
  description: 'How Scytle uses cookies and similar technologies, and how you can manage your preferences.',
}

function Section({
  id,
  title,
  children,
}: {
  id: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/60 py-7 md:py-9">
      <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm md:text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  )
}

export default function CookiesPage() {
  const tableOfContents = [
    { id: 'what', title: '1. What Cookies Are' },
    { id: 'why', title: '2. Why We Use Cookies' },
    { id: 'types', title: '3. Cookie Categories' },
    { id: 'manage', title: '4. Managing Cookie Preferences' },
    { id: 'browser', title: '5. Browser Controls' },
    { id: 'third-party', title: '6. Third-Party Services' },
    { id: 'updates', title: '7. Policy Updates and Contact' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main>
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <header className="space-y-3 pb-8">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Legal</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">Cookies Policy</h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                This policy explains how Scytle uses cookies and similar technologies across our website and product.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Effective date: April 20, 2026</p>
            </header>

            <nav aria-label="Table of contents" className="border-y border-border/60 py-4">
              <p className="text-sm font-medium text-foreground">On this page</p>
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {tableOfContents.map((item) => (
                  <li key={item.id}>
                    <a href={`#${item.id}`} className="hover:text-foreground transition-colors">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <Section id="what" title="1. What Cookies Are">
                <p>
                  Cookies are small text files placed on your device when you visit a website. They help websites
                  remember information about your session, preferences, and interactions.
                </p>
                <p>
                  We may also use similar technologies (for example local storage or pixels) for related purposes.
                </p>
              </Section>

              <Section id="why" title="2. Why We Use Cookies">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Keep the service running and secure.</li>
                  <li>Remember preferences and improve usability.</li>
                  <li>Understand usage trends and performance.</li>
                  <li>Measure and improve product quality over time.</li>
                </ul>
              </Section>

              <Section id="types" title="3. Cookie Categories">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    Essential: Required for core functionality such as authentication, security, and session
                    continuity.
                  </li>
                  <li>Functional: Remember settings and preferences to improve your experience.</li>
                  <li>Analytics: Help us understand feature usage and improve reliability and performance.</li>
                  <li>
                    Marketing: May be used to measure campaign effectiveness when marketing tools are enabled.
                  </li>
                </ul>
              </Section>

              <Section id="manage" title="4. Managing Cookie Preferences">
                <p>
                  Where available, you can manage non-essential cookie preferences through product or site settings.
                </p>
                <p>
                  Disabling some cookies may affect functionality, including sign-in persistence and personalized
                  settings.
                </p>
              </Section>

              <Section id="browser" title="5. Browser Controls">
                <p>
                  Most browsers let you block or delete cookies. You can usually find these controls in your browser
                  privacy or security settings.
                </p>
                <p>
                  Browser-level choices apply per device and browser, so you may need to update settings in each
                  environment you use.
                </p>
              </Section>

              <Section id="third-party" title="6. Third-Party Services">
                <p>
                  Some cookies may be set by third-party providers used for infrastructure, analytics, and support
                  tooling. Those providers process data under their own policies and agreements.
                </p>
                <p>
                  For broader data handling details, review our{' '}
                  <Link href="/privacy" className="text-foreground underline underline-offset-4">
                    Privacy Policy
                  </Link>
                  .
                </p>
              </Section>

              <Section id="updates" title="7. Policy Updates and Contact">
                <p>
                  We may update this Cookies Policy from time to time. The effective date at the top indicates when
                  the latest version became active.
                </p>
                <p>
                  For questions, contact{' '}
                  <a href="mailto:support@scytle.com" className="text-foreground underline underline-offset-4">
                    support@scytle.com
                  </a>
                  .
                </p>
              </Section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}