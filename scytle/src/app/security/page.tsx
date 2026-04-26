import type { Metadata } from 'next'
import Link from 'next/link'
import { LandingHeader } from '@/components/layout/landing-header'

export const metadata: Metadata = {
  title: 'Security and Data Protection | Scytle',
  description: 'How Scytle protects customer data, secures infrastructure, and responds to security events.',
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

export default function SecurityPage() {
  const tableOfContents = [
    { id: 'overview', title: '1. Security Overview' },
    { id: 'encryption', title: '2. Data Encryption' },
    { id: 'access', title: '3. Access Controls' },
    { id: 'infra', title: '4. Infrastructure and Application Security' },
    { id: 'monitoring', title: '5. Monitoring and Incident Response' },
    { id: 'backup', title: '6. Backups and Recovery' },
    { id: 'vendors', title: '7. Vendor and Subprocessor Controls' },
    { id: 'privacy', title: '8. Privacy by Design and Minimization' },
    { id: 'compliance', title: '9. Compliance Posture' },
    { id: 'contact', title: '10. Security Contact' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main>
        <div className="container py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <header className="space-y-3 pb-8">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Legal</p>
              <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight text-foreground">
                Security and Data Protection
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                This page describes baseline practices Scytle uses to protect customer data and maintain service
                security.
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
              <Section id="overview" title="1. Security Overview">
                <p>
                  Scytle applies administrative, technical, and organizational safeguards designed to protect customer
                  data against unauthorized access, disclosure, alteration, and loss.
                </p>
                <p>
                  Security controls are reviewed and improved over time as our product, infrastructure, and threat
                  landscape evolve.
                </p>
              </Section>

              <Section id="encryption" title="2. Data Encryption">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Data is encrypted in transit using industry-standard TLS protections.</li>
                  <li>Data at rest is protected by encryption mechanisms provided by our infrastructure providers.</li>
                  <li>Secrets and credentials are stored with restricted access and rotated as appropriate.</li>
                </ul>
              </Section>

              <Section id="access" title="3. Access Controls">
                <ul className="list-disc pl-5 space-y-2">
                  <li>Production access is limited to authorized personnel with a business need.</li>
                  <li>Access is scoped by role and follows least-privilege principles.</li>
                  <li>Administrative access may require additional verification and is audited.</li>
                </ul>
              </Section>

              <Section id="infra" title="4. Infrastructure and Application Security">
                <ul className="list-disc pl-5 space-y-2">
                  <li>We use reputable cloud infrastructure providers with established security programs.</li>
                  <li>We apply security updates and dependency maintenance as part of routine operations.</li>
                  <li>Security checks are incorporated into development workflows before release.</li>
                </ul>
              </Section>

              <Section id="monitoring" title="5. Monitoring and Incident Response">
                <ul className="list-disc pl-5 space-y-2">
                  <li>We monitor service health, error events, and operational logs to detect potential issues.</li>
                  <li>Incidents are triaged by severity and investigated with documented response steps.</li>
                  <li>Where required, affected customers are notified in line with legal obligations.</li>
                </ul>
              </Section>

              <Section id="backup" title="6. Backups and Recovery">
                <ul className="list-disc pl-5 space-y-2">
                  <li>We maintain backups and recovery procedures intended to support service continuity.</li>
                  <li>Backup access is restricted and governed by internal access controls.</li>
                  <li>Recovery processes are periodically reviewed to improve reliability.</li>
                </ul>
              </Section>

              <Section id="vendors" title="7. Vendor and Subprocessor Controls">
                <p>Scytle works with service providers for infrastructure, analytics, and operational support.</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>We assess vendors based on security and privacy considerations before onboarding.</li>
                  <li>Vendors are expected to protect data through contractual and technical safeguards.</li>
                  <li>Access shared with vendors is limited to what is necessary for the service provided.</li>
                </ul>
              </Section>

              <Section id="privacy" title="8. Privacy by Design and Minimization">
                <ul className="list-disc pl-5 space-y-2">
                  <li>We seek to collect only data needed to operate and improve Scytle.</li>
                  <li>Data retention periods are aligned to operational and legal requirements.</li>
                  <li>Product and engineering decisions consider security and privacy impacts early.</li>
                </ul>
              </Section>

              <Section id="compliance" title="9. Compliance Posture">
                <p>
                  Scytle is committed to maintaining practical security and privacy controls suitable for our stage and
                  service model.
                </p>
                <p>
                  We only make formal certification or compliance claims when those claims are complete and can be
                  substantiated in writing.
                </p>
              </Section>

              <Section id="contact" title="10. Security Contact">
                <p>
                  To report a potential security issue, contact{' '}
                  <a href="mailto:support@scytle.com" className="text-foreground underline underline-offset-4">
                    support@scytle.com
                  </a>{' '}
                  with the subject line "Security Report."
                </p>
                <p>
                  For related information, review our{' '}
                  <Link href="/privacy" className="text-foreground underline underline-offset-4">
                    Privacy Policy
                  </Link>{' '}
                  and{' '}
                  <Link href="/terms" className="text-foreground underline underline-offset-4">
                    Terms of Service
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