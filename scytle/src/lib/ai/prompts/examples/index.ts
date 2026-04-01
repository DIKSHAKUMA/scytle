/**
 * Few-shot HTML examples barrel export.
 * Provides layout reference examples per section type for AI prompt injection.
 */

import { HERO_EXAMPLES } from './hero'
import { FEATURES_EXAMPLES } from './features'
import { PRICING_EXAMPLES } from './pricing'
import { TESTIMONIALS_EXAMPLES } from './testimonials'
import { CTA_EXAMPLES } from './cta'
import { FOOTER_EXAMPLES } from './footer'
import { FAQ_EXAMPLES } from './faq'

const SECTION_EXAMPLES: Record<string, string[]> = {
    hero: HERO_EXAMPLES,
    features: FEATURES_EXAMPLES,
    pricing: PRICING_EXAMPLES,
    testimonials: TESTIMONIALS_EXAMPLES,
    cta: CTA_EXAMPLES,
    footer: FOOTER_EXAMPLES,
    faq: FAQ_EXAMPLES,
}

/**
 * Get a random example for a section type.
 * Returns undefined if no examples exist for the type.
 */
export function getExampleForSection(type: string): string | undefined {
    const examples = SECTION_EXAMPLES[type]
    if (!examples || examples.length === 0) return undefined
    return examples[Math.floor(Math.random() * examples.length)]
}
