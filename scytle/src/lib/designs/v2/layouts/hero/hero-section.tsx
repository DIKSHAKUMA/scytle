/**
 * HeroSection — Composable hero layout component
 *
 * Single component that renders all 27 hero variations.
 * Axes: alignment (left|split|center) × background (dark|neutral|image) × actions (buttons|form|none)
 *
 * Reads --sg-* CSS custom properties for theming.
 * All text/button/input blocks use V2 block primitives.
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
            className={`font-[var(--sg-font-display)] font-medium leading-[1.2] tracking-[-0.01em] text-[var(--sg-text)] text-[clamp(2.75rem,5vw,4.5rem)] ${centered ? 'text-center' : ''}`}
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

/** Primary filled button */
function PrimaryButton({ text, variant }: { text: string; variant: HeroBackground }) {
    const isOnDark = variant === 'dark'
    return (
        <button
            className={`inline-flex items-center justify-center px-6 py-3 font-[var(--sg-font-body)] font-medium text-base leading-[1.5] border transition-colors ${isOnDark
                    ? 'bg-[var(--sg-accent)] border-[var(--sg-accent)] text-white'
                    : 'bg-white border-white text-[var(--sg-bg)]'
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
    const isOnDark = variant === 'dark'
    return (
        <button
            className={`inline-flex items-center justify-center px-6 py-3 font-[var(--sg-font-body)] font-normal text-base leading-[1.5] border transition-colors ${isOnDark
                    ? 'bg-transparent border-[var(--sg-text)]/15 text-[var(--sg-text)]'
                    : 'bg-transparent border-white text-white'
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
    const isOnImage = variant === 'image' || variant === 'neutral'
    return (
        <div className={`flex flex-col gap-4 w-full max-w-[513px] ${centered ? 'mx-auto' : ''}`}>
            <div className="flex gap-4 w-full max-sm:flex-col">
                <input
                    className={`flex-1 p-3 font-[var(--sg-font-body)] text-base leading-[1.5] bg-transparent border outline-none ${isOnImage
                            ? 'border-white/60 text-white placeholder:text-white/65'
                            : 'border-[var(--sg-text)]/30 text-[var(--sg-text)] placeholder:text-[var(--sg-text)]/50'
                        }`}
                    data-layer-type="input"
                    placeholder={content.inputPlaceholder ?? 'Enter your email'}
                    type="email"
                />
                <button
                    className={`shrink-0 px-6 py-3 font-[var(--sg-font-body)] font-medium text-base leading-[1.5] border transition-colors max-sm:w-full ${isOnImage
                            ? 'bg-white border-white text-[var(--sg-bg)]'
                            : 'bg-[var(--sg-accent)] border-[var(--sg-accent)] text-white'
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
            className={`relative flex flex-col items-center w-full px-[clamp(1.25rem,5vw,4rem)] py-[clamp(4rem,8vw,7rem)] ${bgClass} ${className ?? ''}`}
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
// Layout variants
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
            <div className="flex flex-col items-start max-w-[768px] gap-8">
                {/* Section title */}
                <div className="flex flex-col items-start w-full gap-4">
                    {hasTagline && content.tagline && <Tagline text={content.tagline} />}
                    <div className="flex flex-col items-start w-full gap-6">
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
            <div className="flex items-start w-full gap-20 max-md:flex-col max-md:gap-5">
                {/* Left column: tagline + heading */}
                <div className="flex-1 flex flex-col items-start gap-4">
                    {hasTagline && content.tagline && <Tagline text={content.tagline} />}
                    <Heading text={content.heading} />
                </div>

                {/* Right column: description + actions */}
                <div className="flex-1 flex flex-col items-start gap-8">
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
            <div className="flex flex-col items-center max-w-[768px] w-full gap-8">
                {/* Section title */}
                <div className="flex flex-col items-center w-full gap-4">
                    {hasTagline && content.tagline && <Tagline text={content.tagline} centered />}
                    <div className="flex flex-col items-center w-full gap-6">
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
