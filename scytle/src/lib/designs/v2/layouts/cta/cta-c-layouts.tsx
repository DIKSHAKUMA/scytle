/**
 * CTA-C Layouts — Named wrapper components
 *
 * Each layout is a thin re-export that resolves to the correct
 * CTA-C section component. Registered in LayoutTemplate registry.
 *
 * Left Normal:
 *   CTA 19, 20 (no bg)      → CtaCLeftNoBg
 *   CTA 3, 4   (bg image)   → CtaCLeftBgImage
 *   CTA 5, 6   (bg video)   → CtaCLeftBgVideo
 *
 * Left Card:
 *   CTA 41, 42 (bg image)   → CtaCLeftCardBgImage
 *   CTA 43, 44 (bg video)   → CtaCLeftCardBgVideo
 *
 * Center Normal:
 *   CTA 25, 26 (no bg)      → CtaCCenterNoBg
 *   CTA 27, 28 (bg image)   → CtaCCenterBgImage
 *   CTA 29, 30 (bg video)   → CtaCCenterBgVideo
 *
 * Center Card:
 *   CTA 51, 52 (no bg)      → CtaCCenterCardNoBg
 *   CTA 53, 54 (bg image)   → CtaCCenterCardBgImage
 *   CTA 55, 56 (bg video)   → CtaCCenterCardBgVideo
 *
 * Center Stacked:
 *   CTA 31, 32              → CtaCCenterStacked
 *
 * Center Expand:
 *   CTA 65                  → CtaCCenterExpand
 */

// Left Normal
export { CtaCLeftNoBg as Cta19Layout } from './cta-c-section'
export { CtaCLeftNoBg as Cta20Layout } from './cta-c-section'
export { CtaCLeftBgImage as Cta3Layout } from './cta-c-section'
export { CtaCLeftBgImage as Cta4Layout } from './cta-c-section'
export { CtaCLeftBgVideo as Cta5Layout } from './cta-c-section'
export { CtaCLeftBgVideo as Cta6Layout } from './cta-c-section'

// Left Card
export { CtaCLeftCardBgImage as Cta41Layout } from './cta-c-section'
export { CtaCLeftCardBgImage as Cta42Layout } from './cta-c-section'
export { CtaCLeftCardBgVideo as Cta43Layout } from './cta-c-section'
export { CtaCLeftCardBgVideo as Cta44Layout } from './cta-c-section'

// Center Normal
export { CtaCCenterNoBg as Cta25Layout } from './cta-c-section'
export { CtaCCenterNoBg as Cta26Layout } from './cta-c-section'
export { CtaCCenterBgImage as Cta27Layout } from './cta-c-section'
export { CtaCCenterBgImage as Cta28Layout } from './cta-c-section'
export { CtaCCenterBgVideo as Cta29Layout } from './cta-c-section'
export { CtaCCenterBgVideo as Cta30Layout } from './cta-c-section'

// Center Card
export { CtaCCenterCardNoBg as Cta51Layout } from './cta-c-section'
export { CtaCCenterCardNoBg as Cta52Layout } from './cta-c-section'
export { CtaCCenterCardBgImage as Cta53Layout } from './cta-c-section'
export { CtaCCenterCardBgImage as Cta54Layout } from './cta-c-section'
export { CtaCCenterCardBgVideo as Cta55Layout } from './cta-c-section'
export { CtaCCenterCardBgVideo as Cta56Layout } from './cta-c-section'

// Center Stacked
export { CtaCCenterStacked as Cta31Layout } from './cta-c-section'
export { CtaCCenterStacked as Cta32Layout } from './cta-c-section'

// Center Expand
export { CtaCCenterExpand as Cta65Layout } from './cta-c-section'
