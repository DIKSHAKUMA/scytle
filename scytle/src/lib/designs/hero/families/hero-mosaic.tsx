'use client'

/**
 * Hero Mosaic Family — Centered text with a symmetric image mosaic below.
 * Based on Relume Header 108.
 *
 * Layout: Centered heading + description + CTAs, then a symmetrical
 * collage of 7 images arranged as a mirrored mosaic.
 *
 * Controls:
 * - buttonCount: 0 | 1 | 2
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
    const buttonCount = Number(controls?.buttonCount ?? 1)
    const showDescription = controls?.showDescription !== false

    return (
        <section className="w-full overflow-hidden">
            {/* Text + gallery wrapper with exact Figma padding */}
            <div
                className={`flex flex-col items-center ${isMobile ? 'gap-12 py-16' : isTablet ? 'gap-16 py-20' : 'gap-20 py-28'
                    }`}
            >
                {/* Text content — centered */}
                <div
                    className={`w-full flex flex-col items-center ${isMobile ? 'px-5' : isTablet ? 'px-10' : 'px-16'
                        }`}
                >
                    <div className="max-w-[1280px] w-full flex flex-col items-center">
                        <div
                            className={`max-w-[768px] w-full flex flex-col items-center ${isMobile ? 'gap-6' : 'gap-8'
                                }`}
                        >
                            {/* Heading + Description */}
                            <div
                                className={`w-full flex flex-col items-center text-center ${isMobile ? 'gap-5' : 'gap-6'
                                    }`}
                            >
                                <EditableText
                                    value={
                                        (content?.heading as string) ||
                                        'Medium length hero heading goes here'
                                    }
                                    onChange={(v) => onContentChange?.('heading', v)}
                                    as="h1"
                                    className={`font-medium leading-[1.2] tracking-tight text-gray-900 w-full ${isMobile ? 'text-[2.75rem]' : isTablet ? 'text-[3.5rem]' : 'text-[4.5rem]'
                                        }`}
                                    editable={editable}
                                    multiline
                                />
                                {showDescription && (
                                    <EditableText
                                        value={
                                            (content?.description as string) ||
                                            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.'
                                        }
                                        onChange={(v) => onContentChange?.('description', v)}
                                        as="p"
                                        className={`text-gray-500 leading-[1.5] w-full ${isMobile ? 'text-xs' : 'text-lg'
                                            }`}
                                        editable={editable}
                                        multiline
                                    />
                                )}
                            </div>

                            {/* Actions */}
                            {buttonCount > 0 && (
                                <div className="flex gap-4 items-center">
                                    <div className="bg-gray-800 text-white px-3 py-1.5 text-sm font-medium leading-[1.5]">
                                        <EditableText
                                            value={(content?.primaryCta as string) || 'Button'}
                                            onChange={(v) => onContentChange?.('primaryCta', v)}
                                            as="span"
                                            editable={editable}
                                        />
                                    </div>
                                    {buttonCount >= 2 && (
                                        <div className="border border-gray-300 text-gray-700 px-3 py-1.5 text-sm font-medium leading-[1.5]">
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

                {/* Symmetric image mosaic */}
                {isMobile ? <MobileGallery /> : isTablet ? <TabletGallery /> : <DesktopGallery />}
            </div>
        </section>
    )
}

// ===== IMAGE PLACEHOLDER =====

function Placeholder({ className }: { className: string }) {
    return (
        <div className={`bg-gray-100 flex items-center justify-center flex-shrink-0 ${className}`}>
            <ImageIcon className="w-8 h-8 text-gray-300" />
        </div>
    )
}

// ===== GALLERY VARIANTS =====

/**
 * Desktop: 7 images, symmetrical layout centered
 * [288×432] [260×260 / 260×346] [518×724] [260×346 / 260×260] [288×432]
 */
function DesktopGallery() {
    return (
        <div className="flex gap-4 items-center justify-center overflow-hidden">
            {/* Image 1 — left portrait */}
            <Placeholder className="w-[288px] h-[432px]" />

            {/* Image 2+3 — left stacked column */}
            <div className="flex flex-col gap-4 items-center flex-shrink-0">
                <Placeholder className="w-[260px] h-[260px]" />
                <Placeholder className="w-[260px] h-[346px]" />
            </div>

            {/* Image 4 — large center */}
            <Placeholder className="w-[518px] h-[724px]" />

            {/* Image 5+6 — right stacked column (mirrored) */}
            <div className="flex flex-col gap-4 items-center flex-shrink-0">
                <Placeholder className="w-[260px] h-[346px]" />
                <Placeholder className="w-[260px] h-[260px]" />
            </div>

            {/* Image 7 — right portrait */}
            <Placeholder className="w-[288px] h-[432px]" />
        </div>
    )
}

/**
 * Tablet: scaled down proportionally
 */
function TabletGallery() {
    return (
        <div className="flex gap-3 items-center justify-center overflow-hidden">
            <Placeholder className="w-[180px] h-[270px]" />
            <div className="flex flex-col gap-3 items-center flex-shrink-0">
                <Placeholder className="w-[160px] h-[160px]" />
                <Placeholder className="w-[160px] h-[216px]" />
            </div>
            <Placeholder className="w-[320px] h-[450px]" />
            <div className="flex flex-col gap-3 items-center flex-shrink-0">
                <Placeholder className="w-[160px] h-[216px]" />
                <Placeholder className="w-[160px] h-[160px]" />
            </div>
            <Placeholder className="w-[180px] h-[270px]" />
        </div>
    )
}

/**
 * Mobile: exact Figma sizes
 * [200×300] [150×150 / 150×200] [188×542] [150×200 / 150×150] [200×300]
 */
function MobileGallery() {
    return (
        <div className="flex gap-4 items-center justify-center overflow-hidden">
            <Placeholder className="w-[200px] h-[300px]" />
            <div className="flex flex-col gap-4 items-center flex-shrink-0">
                <Placeholder className="w-[150px] h-[150px]" />
                <Placeholder className="w-[150px] h-[200px]" />
            </div>
            <Placeholder className="w-[188px] h-[542px]" />
            <div className="flex flex-col gap-4 items-center flex-shrink-0">
                <Placeholder className="w-[150px] h-[200px]" />
                <Placeholder className="w-[150px] h-[150px]" />
            </div>
            <Placeholder className="w-[200px] h-[300px]" />
        </div>
    )
}

// ===== FAMILY EXPORT =====

export const HeroMosaicFamily: TemplateFamily = {
    id: 'hero-mosaic',
    category: 'hero',
    name: 'Mosaic Hero',
    description: 'Centered hero with symmetric image mosaic collage below',
    tags: ['mosaic', 'gallery', 'centered', 'collage', 'symmetric', 'images'],
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
            defaultValue: '1',
        },
        {
            key: 'showDescription',
            label: 'Show Description',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        buttonCount: '1',
        showDescription: true,
    },
    defaultContent: {
        heading: 'Medium length hero heading goes here',
        description:
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.',
        primaryCta: 'Button',
        secondaryCta: 'Button',
    },
}
