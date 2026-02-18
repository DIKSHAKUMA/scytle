/**
 * HeroSection — Composable hero layout component
 *
 * Single component that renders all 27 hero variations.
 * Axes: alignment (left|split|center) × background (dark|neutral|image) × actions (buttons|form|none)
 *
 * Reads --sg-* CSS custom properties for theming.
 * Uses container queries (@container) for responsive because sections
 * render inside fixed-width canvas frames — viewport queries don't fire.
 *
 * When no TokenProvider is present (wireframe view), the BackgroundLayer
 * sets sensible CSS var defaults so all children render correctly.
 */

'use client'

import type { HeroAlignment, HeroBackground, HeroActions, HeroContent } from './types'
import { DEFAULT_HERO_CONTENT } from './types'

// ============================================
// Props
// ============================================

export interface HeroSectionProps {
    sectionId: string
    alignment: HeroAlignment
    background: HeroBackground
    actions: HeroActions
    content?: Partial<HeroContent>
    className?: string
}

// ============================================
// Sub-components
// ============================================

/** Tagline badge */
function Tagline({ text, centered }: { text: string; centered?: boolean }) {
    return (
        <p
            className={`font-semibold text-[16px] leading-[1.5] text-[var(--sg-text)] ${centered ? 'text-center' : ''}`}
            data-layer-type="tagline"
        >
            {text}
        </p>
    )
}

/** H1 heading */
function Heading({ text, centered }: { text: string; centered?: boolean }) {
    return (
        <h1
            className={`font-[var(--sg-font-display)] font-medium leading-[1.2] tracking-[-0.01em] text-[var(--sg-text)] text-[clamp(2rem,5vw,4.5rem)] ${centered ? 'text-center' : ''}`}
            data-layer-type="heading"
        >
            {text}
        </h1>
    )
}

/** Description text */
function Description({ text, centered }: { text: string; centered?: boolean }) {
    return (
        <p
            className={`font-[var(--sg-font-body)] font-normal leading-[1.5] text-[var(--sg-text)] text-[clamp(0.875rem,1.5vw,1.125rem)] opacity-90 ${centered ? 'text-center' : ''}`}
            data-layer-type="text"
        >
            {text}
        </p>
    )
}

/** Primary filled button — dark on light bg, light on dark bg */
function PrimaryButton({ text, variant }: { text: string; variant: HeroBackground }) {
    // dark/image = dark overlays → white button with dark text
    // neutral = light surface → dark button with white text
    const onDarkSurface = variant === 'dark' || variant === 'image'
    return (
        <button
            className={`inline-flex items-center justify-center px-6 py-3 font-[var(--sg-font-body)] font-medium text-base leading-[1.5] border transition-colors ${onDarkSurface
                ? 'bg-white border-white text-[var(--sg-bg)]'
                : 'bg-[var(--sg-bg)] border-[var(--sg-bg)] text-white'
                }`}
            data-layer-type="button"
            type="button"
        >
            {text}
        </button>
    )
}

/** Secondary outline button */
function SecondaryButton({ text, variant }: { text: string; variant: HeroBackground }) {
    const onDarkSurface = variant === 'dark' || variant === 'image'
    return (
        <button
            className={`inline-flex items-center justify-center px-6 py-3 font-[var(--sg-font-body)] font-normal text-base leading-[1.5] border transition-colors ${onDarkSurface
                ? 'bg-transparent border-white/20 text-white'
                : 'bg-transparent border-[var(--sg-bg)]/20 text-[var(--sg-bg)]'
                }`}
            data-layer-type="button"
            type="button"
        >
            {text}
        </button>
    )
}

/** Button pair (primary + secondary) */
function ButtonActions({ content, variant }: { content: HeroContent; variant: HeroBackground }) {
    return (
        <div className="flex gap-4 items-start flex-wrap" data-layer-type="button-group">
            <PrimaryButton text={content.primaryButtonText ?? 'Button'} variant={variant} />
            <SecondaryButton text={content.secondaryButtonText ?? 'Button'} variant={variant} />
        </div>
    )
}

/** Email signup form (input + button + terms) */
function FormActions({ content, variant, centered }: { content: HeroContent; variant: HeroBackground; centered?: boolean }) {
    const onDarkSurface = variant === 'dark' || variant === 'image'
    return (
        <div className={`flex flex-col gap-4 w-full max-w-[513px] ${centered ? 'mx-auto' : ''}`}>
            <div className="flex gap-4 w-full @max-sm:flex-col">
                <input
                    className={`flex-1 min-w-0 p-3 font-[var(--sg-font-body)] text-base leading-[1.5] bg-transparent border outline-none ${onDarkSurface
                        ? 'border-white/60 text-white placeholder:text-white/65'
                        : 'border-[var(--sg-bg)]/30 text-[var(--sg-text)] placeholder:text-[var(--sg-text)]/50'
                        }`}
                    data-layer-type="input"
                    placeholder={content.inputPlaceholder ?? 'Enter your email'}
                    type="email"
                />
                <button
                    className={`shrink-0 px-6 py-3 font-[var(--sg-font-body)] font-medium text-base leading-[1.5] border transition-colors @max-sm:w-full ${onDarkSurface
                        ? 'bg-white border-white text-[var(--sg-bg)]'
                        : 'bg-[var(--sg-bg)] border-[var(--sg-bg)] text-white'
                        }`}
                    data-layer-type="button"
                    type="button"
                >
                    {content.submitButtonText ?? 'Sign up'}
                </button>
            </div>
            <p
                className={`text-xs leading-[1.5] opacity-70 ${centered ? 'text-center' : ''}`}
                style={{ color: 'var(--sg-text)' }}
                data-layer-type="text"
            >
                {content.termsText}
            </p>
        </div>
    )
}

// ============================================
// Background wrapper
// ============================================

/**
 * Default CSS custom property values for the hero section.
 * Bridges the gap between the short `--sg-*` names used inside the hero
 * and the full `--sg-*-primary` names from the TokenProvider.
 * When no TokenProvider is present (wireframe view), hardcoded fallbacks apply.
 */
const CSS_VAR_DEFAULTS: Record<string, string> = {
    '--sg-bg': 'var(--sg-bg-primary, #1a1a1a)',
    '--sg-surface': 'var(--sg-bg-secondary, #f5f5f5)',
    '--sg-text': 'var(--sg-text-primary, #1a1a1a)',
    '--sg-accent': 'var(--sg-bg-accent, #4f46e5)',
    '--sg-font-display': 'var(--sg-font-heading, system-ui)',
    '--sg-font-body': 'var(--sg-font-body, system-ui)',
}

function BackgroundLayer({ background, children, className }: {
    background: HeroBackground
    children: React.ReactNode
    className?: string
}) {
    const bgClass =
        background === 'dark'
            ? 'bg-[var(--sg-bg)]'
            : background === 'neutral'
                ? 'bg-[var(--sg-surface)]'
                : '' // image → transparent, image is absolute-positioned

    return (
        <section
            className={`@container relative flex flex-col items-center w-full overflow-hidden px-[clamp(1rem,5vw,4rem)] py-[clamp(3rem,8vw,7rem)] ${bgClass} ${className ?? ''}`}
            style={CSS_VAR_DEFAULTS as React.CSSProperties}
            data-layout-type="hero"
        >
            {background === 'image' && (
                <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-[var(--sg-surface)]" />
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}
            {children}
        </section>
    )
}

// ============================================
// Layout variants — use @container queries
// ============================================

/** Left-aligned single column */
function LeftLayout({
    content,
    actions,
    background,
    hasTagline,
}: {
    content: HeroContent
    actions: HeroActions
    background: HeroBackground
    hasTagline: boolean
}) {
    return (
        <div className="relative z-10 w-full max-w-[1280px]">
            <div className="flex flex-col items-start max-w-[768px] gap-6 @max-sm:gap-5">
                {/* Section title */}
                <div className="flex flex-col items-start w-full gap-4">
                    {hasTagline && content.tagline && <Tagline text={content.tagline} />}
                    <div className="flex flex-col items-start w-full gap-5">
                        <Heading text={content.heading} />
                        <Description text={content.description} />
                    </div>
                </div>

                {/* Actions */}
                {actions === 'buttons' && (
                    <ButtonActions content={content} variant={background} />
                )}
                {actions === 'form' && (
                    <FormActions content={content} variant={background} />
                )}
            </div>
        </div>
    )
}

/** Split two-column layout */
function SplitLayout({
    content,
    actions,
    background,
    hasTagline,
}: {
    content: HeroContent
    actions: HeroActions
    background: HeroBackground
    hasTagline: boolean
}) {
    return (
        <div className="relative z-10 w-full max-w-[1280px]">
            <div className="flex items-start w-full gap-20 @max-lg:gap-12 @max-md:flex-col @max-md:gap-6">
                {/* Left column: tagline + heading */}
                <div className="flex-1 min-w-0 flex flex-col items-start gap-4">
                    {hasTagline && content.tagline && <Tagline text={content.tagline} />}
                    <Heading text={content.heading} />
                </div>

                {/* Right column: description + actions */}
                <div className="flex-1 min-w-0 flex flex-col items-start gap-6">
                    <Description text={content.description} />
                    {actions === 'buttons' && (
                        <ButtonActions content={content} variant={background} />
                    )}
                    {actions === 'form' && (
                        <FormActions content={content} variant={background} />
                    )}
                </div>
            </div>
        </div>
    )
}

/** Center-aligned single column */
function CenterLayout({
    content,
    actions,
    background,
    hasTagline,
}: {
    content: HeroContent
    actions: HeroActions
    background: HeroBackground
    hasTagline: boolean
}) {
    return (
        <div className="relative z-10 w-full max-w-[1280px] flex flex-col items-center">
            <div className="flex flex-col items-center max-w-[768px] w-full gap-6 @max-sm:gap-5">
                {/* Section title */}
                <div className="flex flex-col items-center w-full gap-4">
                    {hasTagline && content.tagline && <Tagline text={content.tagline} centered />}
                    <div className="flex flex-col items-center w-full gap-5">
                        <Heading text={content.heading} centered />
                        <Description text={content.description} centered />
                    </div>
                </div>

                {/* Actions */}
                {actions === 'buttons' && (
                    <ButtonActions content={content} variant={background} />
                )}
                {actions === 'form' && (
                    <FormActions content={content} variant={background} centered />
                )}
            </div>
        </div>
    )
}

// ============================================
// Main Component
// ============================================

export function HeroSection({
    sectionId,
    alignment,
    background,
    actions,
    content: contentOverrides,
    className,
}: HeroSectionProps) {
    const content: HeroContent = {
        ...DEFAULT_HERO_CONTENT,
        ...contentOverrides,
    }

    const hasTagline = actions !== 'none'

    return (
        <BackgroundLayer background={background} className={className}>
            {alignment === 'left' && (
                <LeftLayout
                    content={content}
                    actions={actions}
                    background={background}
                    hasTagline={hasTagline}
                />
            )}
            {alignment === 'split' && (
                <SplitLayout
                    content={content}
                    actions={actions}
                    background={background}
                    hasTagline={hasTagline}
                />
            )}
            {alignment === 'center' && (
                <CenterLayout
                    content={content}
                    actions={actions}
                    background={background}
                    hasTagline={hasTagline}
                />
            )}
        </BackgroundLayer>
    )
}
