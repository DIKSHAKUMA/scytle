/**
 * CTA Layouts — Named wrapper components
 *
 * Each layout is a thin re-export that resolves to the correct
 * CTA section component. These are what get registered in
 * the LayoutTemplate registry.
 *
 * CTA 1/2 (Normal) → CtaNormal
 * CTA 39/40 (Card) → CtaCard
 * CTA 59/60 (Expand) → CtaExpand
 */

export { CtaNormal as Cta1Layout } from './cta-section'
export { CtaNormal as Cta2Layout } from './cta-section'
export { CtaCard as Cta39Layout } from './cta-section'
export { CtaCard as Cta40Layout } from './cta-section'
export { CtaExpand as Cta59Layout } from './cta-section'
export { CtaExpand as Cta60Layout } from './cta-section'
