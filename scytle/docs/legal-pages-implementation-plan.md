# Scytle Legal Pages Implementation Plan

Last updated: April 20, 2026

## 1. Goal

Implement a complete legal surface for Scytle with clear, public policy pages and consistent footer links.

Primary outcome:

- Users can always find and read policy pages without logging in.
- Subscription, cancellation, and refund behavior are explained in simple language.
- Legal page coverage matches current SaaS expectations for launch.

## 2. Policy Set to Ship

Scytle footer should include these 4 links:

1. Terms and Conditions (`/terms`) (already exists)
2. Privacy Policy (`/privacy`) (already exists)
3. Security and Data Protection (`/security`) (to add)
4. Cookies Policy (`/cookies`) (to add)

Refund and cancellation policy language is included inside Terms and Conditions (`/terms`) instead of a separate footer route.

## 3. Current State (as of plan date)

Already present:

- `src/app/terms/page.tsx`
- `src/app/privacy/page.tsx`
- Footer legal links in `src/app/page.tsx` currently include only Privacy and Terms.

Missing:

- Security and Data Protection page.
- Cookies Policy page.
- Expanded legal links in footer.

## 4. Key Product and Policy Decisions

### 4.1 Public accessibility

All legal pages must be public and crawlable. No auth required.

### 4.2 Subscription behavior (plain language)

- Subscriptions auto-renew until canceled.
- Users can cancel anytime.
- Cancellation stops future renewals, not current-period access.
- Users do not need to provide a reason to cancel.

### 4.3 Refund behavior (recommended launch rule)

- Default: fees are non-refundable and non-prorated once a billing period starts.
- Exceptions:
  - refund required by law,
  - duplicate charge,
  - verified billing error.
- Optional growth lever:
  - one-time 14-day refund window for first annual plan purchase.

### 4.4 Re-subscribe behavior

- If subscription is still active but renewal was canceled: allow "Resume" with no immediate charge.
- If subscription has expired: new charge starts a new billing cycle.

## 5. Route and File Plan

## 5.1 New routes

Create:

- `src/app/security/page.tsx`
- `src/app/cookies/page.tsx`

Do not create a separate refund route. Keep refund and cancellation terms under billing in `src/app/terms/page.tsx`.

## 5.2 Existing routes to retain

- `src/app/privacy/page.tsx`
- `src/app/terms/page.tsx`

## 5.3 Navigation updates

Update legal section in footer:

- `src/app/page.tsx`

Optional refactor (recommended):

- Extract reusable footer component into `src/components/layout/footer.tsx` so legal links stay consistent across pages.

## 6. Content Structure per Page

## 6.1 Terms and Conditions (`/terms`)

Ensure these sections exist and are clear:

1. Acceptance of terms
2. Eligibility and account responsibilities
3. Allowed use and restrictions
4. Customer content and AI output responsibility
5. Billing and subscriptions
6. Auto-renewal and cancellation
7. Liability disclaimers
8. Termination
9. Governing law and disputes
10. Updates and contact

## 6.2 Privacy Policy (`/privacy`)

Ensure these sections exist and are clear:

1. Scope
2. Data categories collected
3. How data is used
4. Sharing with providers and subprocessors
5. AI processing disclosures
6. Retention
7. Security safeguards
8. User rights
9. International transfers
10. Children
11. Changes and contact

## 6.3 Security and Data Protection (`/security`)

Sections to include:

1. Security overview
2. Data encryption (in transit/at rest)
3. Access controls
4. Infrastructure and app security practices
5. Monitoring and incident response
6. Backups and recovery
7. Vendor/subprocessor controls
8. Privacy-by-design and minimization
9. Compliance posture (only factual claims)
10. Security contact for reports

Important: only claim certifications that are actually completed.

## 6.4 Cookies Policy (`/cookies`)

Sections to include:

1. What cookies are
2. Why cookies are used
3. Cookie categories:
   - Essential
   - Functional
   - Analytics
   - Marketing (if applicable)
4. How users can manage cookie preferences
5. Browser-level controls
6. Third-party cookie/analytics references (if used)
7. Policy changes and contact

## 6.5 Refund and Cancellation (inside `/terms`)

Include these points in the Terms billing section:

1. Scope and billing model (monthly/annual)
2. Auto-renewal
3. How to cancel
4. What happens after cancellation
5. Refund eligibility
6. Non-refundable scenarios
7. Exceptions (law, duplicate, billing error)
8. Upgrade/downgrade handling
9. Reactivation and re-subscribe behavior
10. Contact for billing support

## 7. Implementation Work Breakdown

## Phase A: Route creation and UI parity

Tasks:

1. Create 2 new pages (`/security`, `/cookies`) using same visual pattern as existing `terms` and `privacy` pages.
2. Add metadata (`title`, `description`) for each page.
3. Match typography, section spacing, and card style used in existing legal pages.

Done when:

- New pages render correctly on desktop and mobile.
- No TypeScript or lint errors.

## Phase B: Footer and entry-point links

Tasks:

1. Update footer legal list in `src/app/page.tsx` to include Privacy, Terms, Security, and Cookies.
2. Keep `signup` references to Terms and Privacy as-is; optionally add line for Refund policy if needed by billing flow.

Done when:

- Footer shows all required legal links.
- All links resolve (no 404).

## Phase C: Policy text finalization

Tasks:

1. Fill each page with final approved policy language.
2. Ensure effective date is shown.
3. Ensure contact email appears consistently.

Done when:

- Product + legal review completed.
- Text matches actual platform behavior.

## Phase D: Billing behavior alignment

Tasks:

1. Confirm subscription UI text matches policy wording:
   - auto-renew,
   - cancel anytime,
   - access until period end,
   - refund exceptions.
2. Confirm billing system supports resume and re-subscribe behavior stated in policy.

Done when:

- Billing UX and policy content do not conflict.

## 8. QA Checklist

Functional:

1. All 5 legal routes return HTTP 200.
2. Footer links work from landing page.
3. Terms/Privacy links in signup still work.

Content:

1. Effective date visible on every policy page.
2. Contact email consistent across pages.
3. No contradictory statements between Terms, Refund, and Privacy.

Compliance sanity:

1. No unverified certification claims.
2. Refund language reflects actual billing implementation.
3. Cookie policy matches actual cookie/analytics usage.

## 9. Suggested Release Order

1. Publish Security, Cookies, Refund pages.
2. Update footer to include all links.
3. Run final consistency review.
4. Ship and announce in changelog.

## 10. Risks and Mitigation

Risk: policy says behavior that billing system does not implement.
Mitigation: verify billing flow before final wording is approved.

Risk: claims in security page exceed current controls.
Mitigation: include only factual, currently implemented controls.

Risk: stale legal dates or contact info.
Mitigation: keep a single internal checklist item in release process for legal page date/contact updates.

## 11. Post-Launch Enhancements (Optional)

1. Add a `/legal` hub page linking all policies.
2. Add version history links for Terms/Privacy/Refund.
3. Add DPA and Subprocessors pages when enterprise requirements increase.
