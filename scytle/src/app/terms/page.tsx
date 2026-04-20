import type { Metadata } from 'next'
import Link from 'next/link'
import { Scale } from 'lucide-react'
import { LandingHeader } from '@/components/layout/landing-header'

export const metadata: Metadata = {
  title: 'Terms of Service | Scytle',
  description: 'Terms governing use of Scytle products and services.',
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
    <section id={id} className="scroll-mt-24 rounded-2xl border border-border/60 bg-card p-6 md:p-8 shadow-sm">
      <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-4 space-y-3 text-sm md:text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 right-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute top-1/3 left-[10%] h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="container py-14 md:py-20">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                <Scale className="h-3.5 w-3.5 text-blue-500" />
                Legal
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">Terms of Service</h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                These Terms govern your use of Scytle websites, products, and services.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Effective date: April 19, 2026</p>
            </div>

            <Section id="acceptance" title="1. Acceptance of Terms">
              <p>
                By accessing or using Scytle, you agree to these Terms. If you use Scytle on behalf of an organization,
                you represent that you have authority to bind that organization.
              </p>
            </Section>

            <Section id="eligibility" title="2. Eligibility and Accounts">
              <ul className="list-disc pl-5 space-y-2">
                <li>You must be legally able to enter into a binding agreement.</li>
                <li>You are responsible for account credentials and activity under your account.</li>
                <li>You must provide accurate registration and billing information.</li>
              </ul>
            </Section>

            <Section id="use" title="3. Permitted Use and Restrictions">
              <p>You agree not to misuse the service, including by:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Violating laws, rights of others, or platform security.</li>
                <li>Reverse engineering or attempting unauthorized access.</li>
                <li>Automated scraping or abusive traffic that harms reliability.</li>
                <li>Using the service to generate unlawful or harmful content.</li>
              </ul>
            </Section>

            <Section id="content" title="4. Customer Content and AI Output">
              <ul className="list-disc pl-5 space-y-2">
                <li>You retain ownership of content you provide to Scytle.</li>
                <li>You grant Scytle rights necessary to host, process, and deliver services to you.</li>
                <li>AI-generated output may be probabilistic and should be reviewed before production use.</li>
                <li>You are responsible for your use of generated output and legal compliance.</li>
              </ul>
            </Section>

            <Section id="billing" title="5. Billing, Subscriptions, and Fees">
              <ul className="list-disc pl-5 space-y-2">
                <li>Paid features may require a subscription or usage-based fees.</li>
                <li>Unless otherwise stated, subscriptions renew automatically until canceled.</li>
                <li>Fees are generally non-refundable except where required by law.</li>
                <li>Payment processing is handled by third-party processors.</li>
              </ul>
            </Section>

            <Section id="ip" title="6. Intellectual Property">
              <p>
                Scytle and its licensors own the service, software, branding, and related intellectual property except
                for your content.
              </p>
              <p>
                You may not copy, resell, or create derivative services from Scytle except as expressly allowed.
              </p>
            </Section>

            <Section id="third-party" title="7. Third-Party Services">
              <p>
                Scytle may integrate with third-party tools or providers. Their terms and policies govern those
                services, and Scytle is not responsible for third-party operations outside our control.
              </p>
            </Section>

            <Section id="disclaimers" title="8. Disclaimers">
              <p>
                The service is provided on an as-is and as-available basis. To the fullest extent permitted by law,
                Scytle disclaims implied warranties, including merchantability, fitness for a particular purpose, and
                non-infringement.
              </p>
            </Section>

            <Section id="liability" title="9. Limitation of Liability">
              <p>
                To the fullest extent permitted by law, Scytle is not liable for indirect, incidental, special,
                consequential, or punitive damages, or loss of data, revenue, or profits.
              </p>
            </Section>

            <Section id="termination" title="10. Termination">
              <p>
                You may stop using the service at any time. We may suspend or terminate access for violations, abuse,
                legal requirements, or security reasons.
              </p>
            </Section>

            <Section id="law" title="11. Governing Law and Disputes">
              <p>
                These Terms are governed by applicable laws stated in your order form, contract, or jurisdictional
                default where no separate agreement applies.
              </p>
            </Section>

            <Section id="updates" title="12. Updates to These Terms">
              <p>
                We may update these Terms from time to time. Continued use after updates become effective means you
                accept the revised Terms.
              </p>
            </Section>

            <Section id="contact" title="13. Contact Us">
              <p>
                For legal questions, contact{' '}
                <a href="mailto:support@scytle.com" className="text-foreground underline underline-offset-4">
                  support@scytle.com
                </a>
                .
              </p>
              <p>
                Please also review our{' '}
                <Link href="/privacy" className="text-foreground underline underline-offset-4">
                  Privacy Policy
                </Link>
                .
              </p>
            </Section>
          </div>
        </div>
      </main>
    </div>
  )
}
