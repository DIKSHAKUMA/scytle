/**
 * CTA-B Layouts — Named wrapper components
 *
 * Each layout is a thin re-export that resolves to the correct
 * CTA-B section component. Registered in LayoutTemplate registry.
 *
 * CTA 13–18 (Text-Only)  → CtaBTextOnly
 * CTA 21–22 (Stacked)    → CtaBStacked
 * CTA 61–62 (Expand)     → CtaBExpand
 */

export { CtaBTextOnly as Cta13Layout } from './cta-b-section'
export { CtaBTextOnly as Cta14Layout } from './cta-b-section'
export { CtaBTextBgImage as Cta15Layout } from './cta-b-section'
export { CtaBTextBgImage as Cta16Layout } from './cta-b-section'
export { CtaBTextBgVideo as Cta17Layout } from './cta-b-section'
export { CtaBTextBgVideo as Cta18Layout } from './cta-b-section'
export { CtaBStacked as Cta21Layout } from './cta-b-section'
export { CtaBStacked as Cta22Layout } from './cta-b-section'
export { CtaBExpand as CtaB61Layout } from './cta-b-section'
export { CtaBExpand as CtaB62Layout } from './cta-b-section'
