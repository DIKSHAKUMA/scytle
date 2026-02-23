/**
 * Header — Background Layers
 *
 * Header-specific background layers include a dark overlay (40% opacity)
 * for text readability, matching the Figma designs. This differs from
 * CTA backgrounds which have no overlay.
 */

'use client'

import { ImageIcon, VideoIcon } from 'lucide-react'
import { useUnifiedStore } from '@/store'
import { positionToCSS } from '../../../utils/image-helpers'

// ============================================
// Background Image Layer (with dark overlay)
// ============================================

/**
 * Renders background image with a 40% dark overlay for readability.
 * In design mode with uploaded image → real image + overlay.
 * In wireframe mode / no image → placeholder fill with ImageIcon.
 */
export function BgImageLayer({ sectionId }: { sectionId: string }) {
    const canvasMode = useUnifiedStore(s => s.canvasMode)
    const designProps = useUnifiedStore(s => {
        for (const page of s.pages) {
            const section = page.sections.find(sec => sec.id === sectionId)
            if (section) return section.designProps
        }
        return undefined
    })

    const bgImage = designProps?.backgroundImage
    const showRealBg = canvasMode === 'design' && bgImage?.url

    return (
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
            {showRealBg ? (
                <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={bgImage.url}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            objectPosition: positionToCSS(bgImage.position),
                        }}
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-black/40" />
                </>
            ) : (
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ backgroundColor: 'var(--sg-bg-secondary)' }}
                >
                    <ImageIcon
                        className="opacity-20"
                        style={{ color: 'var(--sg-text-muted)' }}
                        size={64}
                    />
                </div>
            )}
        </div>
    )
}

// ============================================
// Background Video Layer
// ============================================

/** Renders a video placeholder (wireframe mode). */
export function BgVideoLayer() {
    return (
        <div className="absolute inset-0" style={{ zIndex: 0 }}>
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: 'var(--sg-bg-secondary)' }}
            >
                <VideoIcon
                    className="opacity-20"
                    style={{ color: 'var(--sg-text-muted)' }}
                    size={64}
                />
            </div>
        </div>
    )
}
