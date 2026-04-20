import type { Metadata } from 'next'
import Link from 'next/link'
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
    <section id={id} className="scroll-mt-24 border-t border-border/60 py-7 md:py-9">
      <h2 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 space-y-3 text-sm md:text-[15px] leading-7 text-muted-foreground">{children}</div>
    </section>
  )
}

export default function TermsPage() {
  const tableOfContents = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'eligibility', title: '2. Eligibility and Accounts' },
    { id: 'use', title: '3. Permitted Use and Restrictions' },
    { id: 'content', title: '4. Customer Content and AI Output' },
    { id: 'billing', title: '5. Billing, Subscriptions, and Fees' },
    { id: 'ip', title: '6. Intellectual Property' },
    { id: 'third-party', title: '7. Third-Party Services' },
    { id: 'disclaimers', title: '8. Disclaimers' },
    { id: 'liability', title: '9. Limitation of Liability' },
    { id: 'termination', title: '10. Termination' },
    { id: 'law', title: '11. Governing Law and Disputes' },
    { id: 'updates', title: '12. Updates to These Terms' },
    { id: 'contact', title: '13. Contact Us' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main>
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <header className="space-y-3 pb-8">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Legal</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">Terms of Service</h1>
              <p className="text-sm md:text-base text-muted-foreground">
                These Terms govern your use of Scytle websites, products, and services.
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
                <li>Subscriptions renew automatically until canceled before the next renewal date.</li>
                <li>
                  You may cancel any time. Cancellation stops future renewals and your access continues until the end
                  of the current paid period.
                </li>
                <li>
                  Fees are generally non-refundable and non-prorated once a billing period starts, except where
                  required by law.
                </li>
                <li>
                  Refund requests may be considered for duplicate charges or verified billing errors when reported
                  promptly.
                </li>
                <li>
                  If you cancel renewal and your plan is still active, you can resume renewal before expiry without an
                  immediate new charge. If your plan has ended, re-subscribing starts a new billing cycle.
                </li>
                <li>Payment processing is handled by third-party processors.</li>
              </ul>
              <p>
                This section serves as Scytle&apos;s cancellation and refund policy.
              </p>
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
        </div>
      </main>
    </div>
  )
}
