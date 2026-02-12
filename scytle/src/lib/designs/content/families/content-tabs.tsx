'use client'

/**
 * Content Tabs Family — Tabbed content section.
 *
 * Archetype: Section heading, tab switcher, and content panel per tab.
 * Each tab can show text, image, or text+image.
 *
 * Covers Relume Layouts with tabbed/segmented content patterns.
 *
 * Controls:
 * - tabCount: '2' | '3' | '4' | '5'    — number of tabs
 * - tabStyle: 'underline' | 'pill' | 'boxed' — tab visual style
 * - showImage: boolean                    — show image in tab content
 * - imagePosition: 'right' | 'bottom'   — image placement relative to text
 */

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'

    const tabCount = parseInt((controls?.tabCount as string) ?? '3', 10)
    const tabStyle = (controls?.tabStyle as string) ?? 'underline'
    const showImage = controls?.showImage !== false
    const imagePosition = (controls?.imagePosition as string) ?? 'right'

    const [activeTab, setActiveTab] = useState(0)

    const tabs = Array.from({ length: tabCount })
    const isImageBelow = imagePosition === 'bottom' || isMobile

    const tabBaseClass = 'px-4 py-2 text-sm font-medium transition-colors cursor-pointer'
    const tabStyles: Record<string, { active: string; inactive: string }> = {
        underline: {
            active: `${tabBaseClass} text-gray-900 border-b-2 border-gray-900`,
            inactive: `${tabBaseClass} text-gray-400 border-b-2 border-transparent hover:text-gray-600`,
        },
        pill: {
            active: `${tabBaseClass} text-white bg-gray-900 rounded-full`,
            inactive: `${tabBaseClass} text-gray-500 hover:text-gray-700`,
        },
        boxed: {
            active: `${tabBaseClass} text-gray-900 bg-gray-100 rounded`,
            inactive: `${tabBaseClass} text-gray-500 hover:bg-gray-50 rounded`,
        },
    }

    const currentStyle = tabStyles[tabStyle] ?? tabStyles.underline

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className={`${isMobile ? 'mb-6' : 'mb-10'} max-w-3xl`}>
                    <EditableText
                        value={(content?.tagline as string) || 'Tagline'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 font-semibold uppercase tracking-wide mb-3"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Medium length section heading goes here'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 leading-tight ${isMobile ? 'text-2xl' : 'text-4xl'}`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('description', v)}
                        as="p"
                        className="text-gray-500 leading-relaxed mt-4"
                        editable={editable}
                        multiline
                    />
                </div>

                {/* Tab Switcher */}
                <div className={`flex gap-1 ${isMobile ? 'overflow-x-auto pb-2' : ''} ${tabStyle === 'underline' ? 'border-b border-gray-200' : ''} mb-8`}>
                    {tabs.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setActiveTab(i)}
                            className={activeTab === i ? currentStyle.active : currentStyle.inactive}
                        >
                            {((content?.tabLabels as string[]) ?? [])[i] || `Tab ${i + 1}`}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className={`${showImage && !isImageBelow ? `flex gap-8 ${isMobile ? 'flex-col' : ''}` : 'space-y-6'}`}>
                    <div className={`${showImage && !isImageBelow ? 'flex-1' : ''} space-y-4`}>
                        <EditableText
                            value={((content?.tabHeadings as string[]) ?? [])[activeTab] || `Tab ${activeTab + 1} heading goes here`}
                            onChange={(v) => {
                                const items = ((content?.tabHeadings as string[]) ?? []).slice()
                                items[activeTab] = v
                                onContentChange?.('tabHeadings', items)
                            }}
                            as="h3"
                            className={`font-bold text-gray-900 ${isMobile ? 'text-lg' : 'text-2xl'}`}
                            editable={editable}
                        />
                        <EditableText
                            value={((content?.tabDescriptions as string[]) ?? [])[activeTab] || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.'}
                            onChange={(v) => {
                                const items = ((content?.tabDescriptions as string[]) ?? []).slice()
                                items[activeTab] = v
                                onContentChange?.('tabDescriptions', items)
                            }}
                            as="p"
                            className="text-gray-500 leading-relaxed"
                            editable={editable}
                            multiline
                        />
                    </div>

                    {showImage && (
                        <div className={`${isImageBelow ? 'w-full' : 'flex-1'} aspect-video bg-gray-100 border border-gray-200 flex items-center justify-center rounded`}>
                            <ImageIcon className="w-12 h-12 text-gray-300" />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export const ContentTabsFamily: TemplateFamily = {
    id: 'content-tabs',
    category: 'content',
    name: 'Tabbed Content',
    description: 'Content sections with tab switcher',
    tags: ['tabs', 'tabbed', 'toggle', 'segmented', 'content', 'switcher'],
    hasImage: true,
    Canvas,
    controlsDef: [
        {
            key: 'tabCount',
            label: 'Tabs',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
                { value: '5', label: '5' },
            ],
            defaultValue: '3',
        },
        {
            key: 'tabStyle',
            label: 'Tab Style',
            type: 'toggle-group',
            options: [
                { value: 'underline', label: 'Line' },
                { value: 'pill', label: 'Pill' },
                { value: 'boxed', label: 'Box' },
            ],
            defaultValue: 'underline',
        },
        {
            key: 'showImage',
            label: 'Show Image',
            type: 'switch',
            defaultValue: true,
        },
        {
            key: 'imagePosition',
            label: 'Image Position',
            type: 'toggle-group',
            options: [
                { value: 'right', label: 'Side' },
                { value: 'bottom', label: 'Below' },
            ],
            defaultValue: 'right',
            showWhen: { key: 'showImage', value: true },
        },
    ],
    defaultControls: {
        tabCount: '3',
        tabStyle: 'underline',
        showImage: true,
        imagePosition: 'right',
    },
    defaultContent: {
        tagline: 'Tagline',
        heading: 'Medium length section heading goes here',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        tabLabels: ['Tab one', 'Tab two', 'Tab three', 'Tab four', 'Tab five'],
        tabHeadings: [
            'First tab heading goes here',
            'Second tab heading goes here',
            'Third tab heading goes here',
            'Fourth tab heading goes here',
            'Fifth tab heading goes here',
        ],
        tabDescriptions: [
            'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique.',
            'Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat.',
            'Aenean faucibus nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.',
            'Cras ultricies ligula sed magna dictum porta. Curabitur non nulla sit amet nisl tempus convallis.',
            'Pellentesque in ipsum id orci porta dapibus. Nulla quis lorem ut libero malesuada feugiat.',
        ],
    },
}
