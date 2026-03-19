/**
 * Skeleton Frame Generator
 *
 * Creates FrameNode structures that look like skeleton/loading placeholders.
 * These are placed on the canvas immediately when the AI plan is ready,
 * then swapped out for real generated frames as each page completes.
 *
 * This gives users an instant sense of the layout (like FlutterFlow)
 * instead of showing a text-only progress bar.
 */

import { createFrame, createText } from '@/types/canvas'
import type { FrameNode } from '@/types/canvas'

/**
 * Create a skeleton placeholder frame for a page that's being generated.
 * The skeleton mimics a typical page structure with grey blocks.
 */
export function createSkeletonFrame(
    pageName: string,
    options: {
        width?: number
        height?: number
    } = {}
): FrameNode {
    const width = options.width ?? 1440
    const height = options.height ?? 900

    // Shimmer grey background color
    const shimmerGrey = '#E5E7EB'
    const lightGrey = '#F3F4F6'
    const mediumGrey = '#D1D5DB'

    return createFrame({
        name: `⏳ ${pageName}`,
        width,
        height,
        fills: [{ type: 'solid', color: '#FFFFFF', opacity: 1 }],
        layout: { mode: 'flex', direction: 'column', gap: 0 },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        overflow: 'hidden',
        children: [
            // ── Navbar skeleton ──
            createFrame({
                name: 'skeleton-navbar',
                width,
                height: 64,
                sizing: { horizontal: 'fill', vertical: 'fixed' },
                fills: [{ type: 'solid', color: '#FFFFFF', opacity: 1 }],
                border: { color: '#E5E7EB', width: 1, style: 'solid', position: 'inside' },
                layout: { mode: 'flex', direction: 'row', align: 'center', justify: 'between' },
                padding: { top: 0, right: 24, bottom: 0, left: 24 },
                children: [
                    // Logo placeholder
                    createFrame({
                        name: 'skeleton-logo',
                        width: 120,
                        height: 24,
                        sizing: { horizontal: 'fixed', vertical: 'fixed' },
                        borderRadius: 4,
                        fills: [{ type: 'solid', color: shimmerGrey, opacity: 1 }],
                        children: [],
                        layout: { mode: 'none' },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    }),
                    // Nav links placeholder
                    createFrame({
                        name: 'skeleton-nav-links',
                        width: 300,
                        height: 16,
                        sizing: { horizontal: 'fixed', vertical: 'fixed' },
                        layout: { mode: 'flex', direction: 'row', gap: 24, align: 'center' },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                        fills: [],
                        children: [
                            ...Array.from({ length: 4 }, (_, i) =>
                                createFrame({
                                    name: `skeleton-link-${i}`,
                                    width: 56,
                                    height: 12,
                                    sizing: { horizontal: 'fixed', vertical: 'fixed' },
                                    borderRadius: 3,
                                    fills: [{ type: 'solid', color: lightGrey, opacity: 1 }],
                                    children: [],
                                    layout: { mode: 'none' },
                                    padding: { top: 0, right: 0, bottom: 0, left: 0 },
                                })
                            )
                        ],
                    }),
                ],
            }),

            // ── Hero section skeleton ──
            createFrame({
                name: 'skeleton-hero',
                width,
                height: 400,
                sizing: { horizontal: 'fill', vertical: 'fixed' },
                fills: [{ type: 'solid', color: lightGrey, opacity: 1 }],
                layout: { mode: 'flex', direction: 'column', align: 'center', justify: 'center', gap: 16 },
                padding: { top: 48, right: 80, bottom: 48, left: 80 },
                children: [
                    // Headline placeholder
                    createFrame({
                        name: 'skeleton-headline',
                        width: 500,
                        height: 32,
                        sizing: { horizontal: 'fixed', vertical: 'fixed' },
                        borderRadius: 6,
                        fills: [{ type: 'solid', color: mediumGrey, opacity: 1 }],
                        children: [],
                        layout: { mode: 'none' },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    }),
                    // Subheadline placeholder
                    createFrame({
                        name: 'skeleton-subheadline',
                        width: 380,
                        height: 16,
                        sizing: { horizontal: 'fixed', vertical: 'fixed' },
                        borderRadius: 4,
                        fills: [{ type: 'solid', color: shimmerGrey, opacity: 1 }],
                        children: [],
                        layout: { mode: 'none' },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    }),
                    // CTA button placeholder
                    createFrame({
                        name: 'skeleton-cta',
                        width: 160,
                        height: 40,
                        sizing: { horizontal: 'fixed', vertical: 'fixed' },
                        borderRadius: 8,
                        fills: [{ type: 'solid', color: mediumGrey, opacity: 1 }],
                        children: [],
                        layout: { mode: 'none' },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    }),
                ],
            }),

            // ── Content section skeleton (3-column grid) ──
            createFrame({
                name: 'skeleton-content',
                width,
                height: 280,
                sizing: { horizontal: 'fill', vertical: 'fixed' },
                fills: [{ type: 'solid', color: '#FFFFFF', opacity: 1 }],
                layout: { mode: 'flex', direction: 'row', gap: 24, justify: 'center', align: 'start' },
                padding: { top: 40, right: 60, bottom: 40, left: 60 },
                children: Array.from({ length: 3 }, (_, i) =>
                    createFrame({
                        name: `skeleton-card-${i}`,
                        width: 320,
                        height: 200,
                        sizing: { horizontal: 'fill', vertical: 'fixed' },
                        borderRadius: 8,
                        fills: [],
                        border: { color: '#E5E7EB', width: 1, style: 'solid', position: 'inside' },
                        layout: { mode: 'flex', direction: 'column', gap: 12 },
                        padding: { top: 20, right: 20, bottom: 20, left: 20 },
                        children: [
                            // Icon placeholder
                            createFrame({
                                name: `skeleton-icon-${i}`,
                                width: 40,
                                height: 40,
                                sizing: { horizontal: 'fixed', vertical: 'fixed' },
                                borderRadius: 8,
                                fills: [{ type: 'solid', color: shimmerGrey, opacity: 1 }],
                                children: [],
                                layout: { mode: 'none' },
                                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                            }),
                            // Title placeholder
                            createFrame({
                                name: `skeleton-title-${i}`,
                                width: 160,
                                height: 16,
                                sizing: { horizontal: 'fixed', vertical: 'fixed' },
                                borderRadius: 4,
                                fills: [{ type: 'solid', color: mediumGrey, opacity: 1 }],
                                children: [],
                                layout: { mode: 'none' },
                                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                            }),
                            // Description lines
                            createFrame({
                                name: `skeleton-desc-1-${i}`,
                                width: 240,
                                height: 10,
                                sizing: { horizontal: 'fixed', vertical: 'fixed' },
                                borderRadius: 3,
                                fills: [{ type: 'solid', color: lightGrey, opacity: 1 }],
                                children: [],
                                layout: { mode: 'none' },
                                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                            }),
                            createFrame({
                                name: `skeleton-desc-2-${i}`,
                                width: 200,
                                height: 10,
                                sizing: { horizontal: 'fixed', vertical: 'fixed' },
                                borderRadius: 3,
                                fills: [{ type: 'solid', color: lightGrey, opacity: 1 }],
                                children: [],
                                layout: { mode: 'none' },
                                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                            }),
                        ],
                    })
                ),
            }),

            // ── Footer skeleton ──
            createFrame({
                name: 'skeleton-footer',
                width,
                height: 120,
                sizing: { horizontal: 'fill', vertical: 'fixed' },
                fills: [{ type: 'solid', color: lightGrey, opacity: 1 }],
                layout: { mode: 'flex', direction: 'row', align: 'center', justify: 'between' },
                padding: { top: 24, right: 48, bottom: 24, left: 48 },
                children: [
                    createFrame({
                        name: 'skeleton-footer-left',
                        width: 100,
                        height: 12,
                        sizing: { horizontal: 'fixed', vertical: 'fixed' },
                        borderRadius: 3,
                        fills: [{ type: 'solid', color: shimmerGrey, opacity: 1 }],
                        children: [],
                        layout: { mode: 'none' },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    }),
                    createFrame({
                        name: 'skeleton-footer-right',
                        width: 200,
                        height: 12,
                        sizing: { horizontal: 'fixed', vertical: 'fixed' },
                        borderRadius: 3,
                        fills: [{ type: 'solid', color: shimmerGrey, opacity: 1 }],
                        children: [],
                        layout: { mode: 'none' },
                        padding: { top: 0, right: 0, bottom: 0, left: 0 },
                    }),
                ],
            }),
        ],
    })
}

/**
 * Create a "Generating..." label node to overlay on a skeleton frame.
 */
export function createSkeletonLabel(pageName: string): ReturnType<typeof createText> {
    return createText({
        characters: `✨ Generating ${pageName}...`,
        fontSize: 14,
        fontWeight: 500,
        fontFamily: 'Inter',
        color: '#6B7280',
        textAlign: 'center',
        width: 300,
        height: 20,
        sizing: { horizontal: 'fixed', vertical: 'fixed' },
    })
}
