import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { LandingHeader } from '@/components/layout/landing-header'

export const metadata: Metadata = {
  title: 'Privacy Policy | Scytle',
  description: 'How Scytle collects, uses, shares, and protects your personal information.',
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

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />

      <main className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-accent/10 blur-[120px]" />
          <div className="absolute top-1/3 right-[10%] h-80 w-80 rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="container py-14 md:py-20">
          <div className="mx-auto max-w-4xl space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-secondary/70 px-3 py-1 text-xs font-medium text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                Legal
              </div>
              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground">Privacy Policy</h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl">
                This policy explains how Scytle collects, uses, and protects personal information when you use
                our website and product.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Effective date: April 19, 2026</p>
            </div>

            <Section id="scope" title="1. Scope">
              <p>
                This Privacy Policy applies to Scytle websites, applications, APIs, and related services where this
                policy is linked.
              </p>
              <p>
                If you access third-party integrations, their own privacy policies apply to their services.
              </p>
            </Section>

            <Section id="collect" title="2. Information We Collect">
              <p>We may collect the following categories of information:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Account data: name, email, profile details, and authentication identifiers.</li>
                <li>Project data: prompts, sitemap/wireframe/design content, and files you upload.</li>
                <li>Usage data: pages viewed, actions taken, device/browser metadata, and logs.</li>
                <li>Support data: information you provide when contacting support.</li>
                <li>Billing data: handled by payment providers; Scytle receives limited transaction metadata.</li>
              </ul>
            </Section>

            <Section id="use" title="3. How We Use Information">
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide, maintain, and improve Scytle features and platform reliability.</li>
                <li>Authenticate users and protect account and project security.</li>
                <li>Process transactions, subscriptions, and service communications.</li>
                <li>Provide customer support and troubleshoot incidents.</li>
                <li>Detect abuse, fraud, and violations of our terms.</li>
                <li>Comply with legal obligations and enforce our agreements.</li>
              </ul>
            </Section>

            <Section id="ai" title="4. AI Processing">
              <p>
                Scytle may process product inputs (for example, prompts and design context) through AI services to
                generate outputs you request.
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>AI processing is limited to delivering requested product functionality.</li>
                <li>We do not sell your project inputs or outputs.</li>
                <li>We use provider contracts and controls to protect confidentiality and security.</li>
              </ul>
            </Section>

            <Section id="share" title="5. How We Share Information">
              <p>We may share information with:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Service providers that host infrastructure, analytics, security, support, and payments.</li>
                <li>Authorities where required by law or valid legal process.</li>
                <li>Successor entities in connection with mergers, acquisitions, or restructuring.</li>
              </ul>
              <p>We do not sell personal information for third-party advertising.</p>
            </Section>

            <Section id="retention" title="6. Retention">
              <p>
                We retain personal information only for as long as needed to provide services, meet legal obligations,
                resolve disputes, and enforce agreements.
              </p>
              <p>
                When retention is no longer required, we delete or anonymize data using reasonable technical and
                operational controls.
              </p>
            </Section>

            <Section id="security" title="7. Security">
              <p>
                We use administrative, technical, and organizational safeguards to protect information. No system is
                perfectly secure, but we continuously work to reduce risk and improve controls.
              </p>
            </Section>

            <Section id="rights" title="8. Your Rights and Choices">
              <p>Depending on your location and applicable law, you may have rights to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access, correct, export, or delete your personal data.</li>
                <li>Object to or restrict certain processing.</li>
                <li>Withdraw consent where processing depends on consent.</li>
                <li>Opt out of non-essential marketing communications.</li>
              </ul>
            </Section>

            <Section id="transfers" title="9. International Transfers">
              <p>
                Your information may be processed in countries outside your location. Where required, we apply
                contractual and technical safeguards for international transfers.
              </p>
            </Section>

            <Section id="children" title="10. Children">
              <p>
                Scytle is not intended for children under 13 (or higher age where required by local law). If we learn
                that prohibited data has been collected, we will take appropriate steps to delete it.
              </p>
            </Section>

            <Section id="changes" title="11. Changes to This Policy">
              <p>
                We may update this policy from time to time. Material changes will be reflected by updating the
                effective date and, where required, by additional notice.
              </p>
            </Section>

            <Section id="contact" title="12. Contact Us">
              <p>
                For privacy questions or requests, contact us at{' '}
                <a href="mailto:support@scytle.com" className="text-foreground underline underline-offset-4">
                  support@scytle.com
                </a>
                .
              </p>
              <p>
                You can also review our <Link href="/terms" className="text-foreground underline underline-offset-4">Terms of Service</Link>.
              </p>
            </Section>
          </div>
        </div>
      </main>
    </div>
  )
}
