/**
 * Hero Thumbnails — Miniature wireframe previews for the component library
 *
 * Each thumbnail renders a scaled-down representation of the hero layout
 * that matches the actual design structure (alignment × background × actions).
 * Designed to fit exactly within the component card's aspect-video frame.
 */

'use client'

import type { HeroAlignment, HeroBackground, HeroActions, HeroPresetConfig } from './types'

// ============================================
// Background colors for wireframe thumbnails
// ============================================

const BG_COLORS: Record<HeroBackground, string> = {
    dark: '#1a1a1a',
    neutral: '#f5f5f5',
    image: '#6b7280',
}

const TEXT_COLORS: Record<HeroBackground, { primary: string; secondary: string; muted: string }> = {
    dark: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.7)', muted: 'rgba(255,255,255,0.5)' },
    neutral: { primary: '#1a1a1a', secondary: '#4b5563', muted: '#9ca3af' },
    image: { primary: '#ffffff', secondary: 'rgba(255,255,255,0.8)', muted: 'rgba(255,255,255,0.5)' },
}

const BTN_COLORS: Record<HeroBackground, { primaryBg: string; primaryText: string; secondaryBorder: string; secondaryText: string }> = {
    dark: { primaryBg: '#ffffff', primaryText: '#1a1a1a', secondaryBorder: 'rgba(255,255,255,0.2)', secondaryText: '#ffffff' },
    neutral: { primaryBg: '#1a1a1a', primaryText: '#ffffff', secondaryBorder: 'rgba(26,26,26,0.2)', secondaryText: '#1a1a1a' },
    image: { primaryBg: '#ffffff', primaryText: '#1a1a1a', secondaryBorder: 'rgba(255,255,255,0.3)', secondaryText: '#ffffff' },
}

// ============================================
// Thumbnail sub-elements
// ============================================

function TTagline({ bg }: { bg: HeroBackground }) {
    return (
        <div
            className="h-[3px] w-[20px] rounded-full"
            style={{ backgroundColor: TEXT_COLORS[bg].muted }}
        />
    )
}

function THeading({ bg, lines = 2 }: { bg: HeroBackground; lines?: number }) {
    return (
        <div className="flex flex-col gap-[2px]">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-[5px] rounded-[1px]"
                    style={{
                        backgroundColor: TEXT_COLORS[bg].primary,
                        width: i === lines - 1 ? '65%' : '100%',
                    }}
                />
            ))}
        </div>
    )
}

function TDescription({ bg, lines = 2 }: { bg: HeroBackground; lines?: number }) {
    return (
        <div className="flex flex-col gap-[1.5px]">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className="h-[2.5px] rounded-[0.5px]"
                    style={{
                        backgroundColor: TEXT_COLORS[bg].secondary,
                        width: i === lines - 1 ? '70%' : '100%',
                    }}
                />
            ))}
        </div>
    )
}

function TButtons({ bg }: { bg: HeroBackground }) {
    const c = BTN_COLORS[bg]
    return (
        <div className="flex gap-[3px]">
            <div
                className="h-[7px] w-[24px] rounded-[1px]"
                style={{ backgroundColor: c.primaryBg }}
            />
            <div
                className="h-[7px] w-[24px] rounded-[1px]"
                style={{ border: `1px solid ${c.secondaryBorder}` }}
            />
        </div>
    )
}

function TForm({ bg }: { bg: HeroBackground }) {
    const c = BTN_COLORS[bg]
    const inputBorder = bg === 'neutral' ? 'rgba(26,26,26,0.2)' : 'rgba(255,255,255,0.3)'
    return (
        <div className="flex flex-col gap-[3px] w-full">
            <div className="flex gap-[3px] w-full">
                <div
                    className="flex-1 h-[8px] rounded-[1px]"
                    style={{ border: `1px solid ${inputBorder}` }}
                />
                <div
                    className="h-[8px] w-[22px] rounded-[1px]"
                    style={{ backgroundColor: c.primaryBg }}
                />
            </div>
            <div
                className="h-[2px] w-[60%] rounded-[0.5px]"
                style={{ backgroundColor: TEXT_COLORS[bg].muted }}
            />
        </div>
    )
}

// ============================================
// Layout thumbnails
// ============================================

function LeftThumbnail({ bg, actions }: { bg: HeroBackground; actions: HeroActions }) {
    return (
        <div className="flex flex-col items-start gap-[5px] p-3 w-[65%]">
            {actions !== 'none' && <TTagline bg={bg} />}
            <THeading bg={bg} />
            <TDescription bg={bg} />
            {actions === 'buttons' && <TButtons bg={bg} />}
            {actions === 'form' && <TForm bg={bg} />}
        </div>
    )
}

function SplitThumbnail({ bg, actions }: { bg: HeroBackground; actions: HeroActions }) {
    return (
        <div className="flex items-start gap-[8px] p-3 w-full">
            {/* Left: tagline + heading */}
            <div className="flex-1 flex flex-col items-start gap-[3px]">
                {actions !== 'none' && <TTagline bg={bg} />}
                <THeading bg={bg} lines={3} />
            </div>
            {/* Right: description + actions */}
            <div className="flex-1 flex flex-col items-start gap-[5px]">
                <TDescription bg={bg} lines={3} />
                {actions === 'buttons' && <TButtons bg={bg} />}
                {actions === 'form' && <TForm bg={bg} />}
            </div>
        </div>
    )
}

function CenterThumbnail({ bg, actions }: { bg: HeroBackground; actions: HeroActions }) {
    return (
        <div className="flex flex-col items-center gap-[5px] p-3 w-full">
            {actions !== 'none' && <TTagline bg={bg} />}
            <div className="flex flex-col items-center gap-[2px] w-[70%]">
                <THeading bg={bg} />
            </div>
            <div className="flex flex-col items-center gap-[1.5px] w-[75%]">
                <TDescription bg={bg} />
            </div>
            {actions === 'buttons' && <TButtons bg={bg} />}
            {actions === 'form' && (
                <div className="w-[60%]">
                    <TForm bg={bg} />
                </div>
            )}
        </div>
    )
}

// ============================================
// Main thumbnail factory
// ============================================

export function HeroThumbnail({ alignment, background, actions }: {
    alignment: HeroAlignment
    background: HeroBackground
    actions: HeroActions
}) {
    const bgColor = BG_COLORS[background]

    // Image background gets a subtle gradient overlay
    const bgStyle: React.CSSProperties = background === 'image'
        ? { background: `linear-gradient(135deg, #94a3b8 0%, #64748b 100%)` }
        : { backgroundColor: bgColor }

    return (
        <div
            className="w-full h-full flex items-center justify-start relative overflow-hidden"
            style={bgStyle}
        >
            {background === 'image' && (
                <div className="absolute inset-0 bg-black/35" />
            )}
            <div className="relative z-10 w-full h-full flex items-center">
                {alignment === 'left' && <LeftThumbnail bg={background} actions={actions} />}
                {alignment === 'split' && <SplitThumbnail bg={background} actions={actions} />}
                {alignment === 'center' && <CenterThumbnail bg={background} actions={actions} />}
            </div>
        </div>
    )
}

/**
 * Create a thumbnail component bound to a specific preset config.
 * Returns a React.FC with no props (ready for the component library).
 */
export function createHeroThumbnail(preset: HeroPresetConfig): React.FC {
    function Thumbnail() {
        return (
            <HeroThumbnail
                alignment={preset.alignment}
                background={preset.background}
                actions={preset.actions}
            />
        )
    }
    Thumbnail.displayName = `${preset.name}Thumbnail`
    return Thumbnail
}
