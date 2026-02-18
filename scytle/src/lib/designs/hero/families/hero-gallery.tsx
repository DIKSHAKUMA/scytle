'use client'

/**
 * Hero Gallery Family — Dark hero with left-aligned text and a mosaic
 * image collage below. Based on Relume Header 107.
 *
 * Controls:
 * - buttonCount: 1 | 2
 * - showDescription: boolean
 *
 * Content:
 * - heading, description, primaryCta, secondaryCta
 */

import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

// ===== CANVAS =====

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const buttonCount = Number(controls?.buttonCount ?? 2)
    const showDescription = controls?.showDescription !== false

    return (
        <section className="bg-neutral-950 w-full overflow-hidden">
            {/* Text content */}
            <div className={`${isMobile ? 'px-5 pt-16 pb-12' : isTablet ? 'px-10 pt-20 pb-16' : 'px-16 pt-28 pb-20'}`}>
                <div className="max-w-[1280px]">
                    <div className="max-w-[768px] space-y-6">
                        {/* Content block */}
                        <div className={`space-y-${isMobile ? '5' : '6'}`}>
                            <EditableText
                                value={(content?.heading as string) || 'Long heading is what you see here in this header section'}
                                onChange={(v) => onContentChange?.('heading', v)}
                                as="h1"
                                className={`text-white font-medium leading-[1.2] tracking-tight ${isMobile ? 'text-[2.75rem]' : isTablet ? 'text-[3.5rem]' : 'text-[4.5rem]'}`}
                                editable={editable}
                                multiline
                            />
                            {showDescription && (
                                <EditableText
                                    value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.'}
                                    onChange={(v) => onContentChange?.('description', v)}
                                    as="p"
                                    className={`text-white/80 leading-[1.5] ${isMobile ? 'text-xs' : 'text-lg'}`}
                                    editable={editable}
                                    multiline
                                />
                            )}
                        </div>

                        {/* Actions */}
                        {buttonCount > 0 && (
                            <div className="flex gap-4 items-center">
                                <div className="bg-[#2b5c8a] px-3 py-1.5 text-white text-sm font-medium leading-[1.5]">
                                    <EditableText
                                        value={(content?.primaryCta as string) || 'Button'}
                                        onChange={(v) => onContentChange?.('primaryCta', v)}
                                        as="span"
                                        editable={editable}
                                    />
                                </div>
                                {buttonCount >= 2 && (
                                    <div className="px-3 py-1.5 text-neutral-700 text-sm font-medium leading-[1.5] border border-white/15">
                                        <EditableText
                                            value={(content?.secondaryCta as string) || 'Button'}
                                            onChange={(v) => onContentChange?.('secondaryCta', v)}
                                            as="span"
                                            editable={editable}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Image mosaic gallery */}
            {isMobile ? (
                <MobileGallery />
            ) : isTablet ? (
                <TabletGallery />
            ) : (
                <DesktopGallery />
            )}
        </section>
    )
}

// ===== IMAGE PLACEHOLDER =====

function Placeholder({ className }: { className: string }) {
    return (
        <div className={`bg-neutral-800 flex items-center justify-center flex-shrink-0 ${className}`}>
            <ImageIcon className="w-8 h-8 text-neutral-600" />
        </div>
    )
}

// ===== GALLERY VARIANTS =====

function DesktopGallery() {
    return (
        <div className="flex gap-4 items-start overflow-hidden w-full">
            {/* Image 1 — portrait */}
            <Placeholder className="w-[316px] h-[475px]" />

            {/* Image 2+3 — stacked column */}
            <div className="flex flex-col gap-4 flex-shrink-0">
                <Placeholder className="w-[216px] h-[216px]" />
                <Placeholder className="w-[216px] h-[288px]" />
            </div>

            {/* Image 4 — square */}
            <Placeholder className="w-[316px] h-[316px]" />

            {/* Image 5 — large tall */}
            <Placeholder className="w-[432px] h-[724px]" />

            {/* Image 6 — medium portrait */}
            <Placeholder className="w-[316px] h-[422px]" />
        </div>
    )
}

function TabletGallery() {
    return (
        <div className="flex gap-3 items-start overflow-hidden w-full">
            <Placeholder className="w-[200px] h-[300px]" />
            <div className="flex flex-col gap-3 flex-shrink-0">
                <Placeholder className="w-[140px] h-[140px]" />
                <Placeholder className="w-[140px] h-[180px]" />
            </div>
            <Placeholder className="w-[200px] h-[200px]" />
            <Placeholder className="w-[280px] h-[460px]" />
            <Placeholder className="w-[200px] h-[280px]" />
        </div>
    )
}

function MobileGallery() {
    return (
        <div className="flex gap-4 items-start overflow-hidden w-full">
            {/* Stacked column */}
            <div className="flex flex-col gap-4 flex-shrink-0">
                <Placeholder className="w-[112px] h-[112px]" />
                <Placeholder className="w-[112px] h-[150px]" />
            </div>

            {/* Large image */}
            <Placeholder className="w-[188px] h-[542px]" />

            {/* Trailing image */}
            <Placeholder className="w-[150px] h-[200px]" />
        </div>
    )
}

// ===== FAMILY EXPORT =====

export const HeroGalleryFamily: TemplateFamily = {
    id: 'hero-gallery',
    category: 'hero',
    name: 'Gallery Hero',
    description: 'Dark hero with left-aligned text and mosaic image collage',
    tags: ['gallery', 'mosaic', 'dark', 'collage', 'images'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'buttonCount',
            label: 'Buttons',
            type: 'toggle-group',
            options: [
                { value: '0', label: 'None' },
                { value: '1', label: '1' },
                { value: '2', label: '2' },
            ],
            defaultValue: '2',
        },
        {
            key: 'showDescription',
            label: 'Show Description',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        buttonCount: '2',
        showDescription: true,
    },
    defaultContent: {
        heading: 'Long heading is what you see here in this header section',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
        primaryCta: 'Button',
        secondaryCta: 'Button',
    },
}
