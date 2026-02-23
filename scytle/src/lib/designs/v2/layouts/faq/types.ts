/**
 * FAQ — Unified Type Definitions
 *
 * Single FaqPresetConfig covers ALL FAQ families (A–F).
 * The `align` field drives content alignment in the renderer.
 * The `axes` record holds opaque control-system values per family.
 *
 * Family A — Accordion + bottom CTA (6 variants)
 * Family B — Accordion + split layout with top CTA button (2 variants)
 * Family C — Non-accordion grid + bottom CTA (3 variants)
 * Family D — Non-accordion grid + split layout with top CTA button (1 variant)
 * Family E — Non-accordion horizontal Q/A + bottom CTA (1 variant)
 * Family F — Non-accordion icon grid + bottom CTA (1 variant)
 */

// ============================================
// Content (shared across all FAQ families)
// ============================================

export interface FaqContent {
    heading: string
    body: string
    questionText: string
    answerText: string
    ctaHeading: string
    ctaBody: string
    buttonText: string
}

export const DEFAULT_CONTENT: FaqContent = {
    heading: 'FAQs',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
    questionText: 'Question text goes here',
    answerText:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.',
    ctaHeading: 'Still have questions?',
    ctaBody: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    buttonText: 'Button',
}

// ============================================
// Renderer primitives
// ============================================

/** Content alignment inside the container */
export type ContentAlign = 'left' | 'center'

// ============================================
// Unified Preset Config
// ============================================

export interface FaqPresetConfig {
    /** Unique preset ID, e.g. 'faq-1' */
    id: string
    /** Display name, e.g. 'FAQ 1' */
    name: string
    /** Short description for the picker */
    description: string
    /** Searchable tags */
    tags: string[]

    // ── Family grouping ──
    /** Which family this preset belongs to */
    family: 'a' | 'b' | 'c' | 'd' | 'e' | 'f'

    // ── Renderer config ──
    /** Content alignment */
    align: ContentAlign

    // ── Control axes (opaque to renderer, used by controls.ts) ──
    /** Family-specific axis values for the control system */
    axes: Record<string, string>
}
