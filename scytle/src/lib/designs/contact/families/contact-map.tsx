'use client'

/**
 * Contact Map Family — Contact info with map placeholder.
 *
 * Controls:
 * - mapPlacement: top | bottom
 * - showForm: boolean
 */

import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const mapPlacement = (controls?.mapPlacement as string) ?? 'top'
    const showForm = controls?.showForm !== false

    const mapBlock = (
        <div className="w-full aspect-[16/7] bg-gray-100 border border-gray-200 flex items-center justify-center">
            <div className="text-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-2" />
                <div className="text-xs text-gray-400">Map Placeholder</div>
            </div>
        </div>
    )

    const infoBlock = (
        <div className={`max-w-7xl mx-auto ${isMobile ? 'px-4 py-8' : isTablet ? 'px-8 py-12' : 'px-16 py-16'}`}>
            <div className={`${isMobile ? 'flex flex-col gap-8' : 'flex gap-16'}`}>
                {/* Contact Info */}
                <div className="flex-1 space-y-4">
                    <EditableText
                        value={(content?.heading as string) || 'Visit us'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'} mb-3`}
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.subheading as string) || 'Come visit our office or reach out through the form.'}
                        onChange={(v) => onContentChange?.('subheading', v)}
                        as="p"
                        className="text-gray-500 mb-6"
                        editable={editable}
                        multiline
                    />

                    <div className="space-y-4">
                        <div>
                            <div className="font-medium text-gray-900 text-sm">Address</div>
                            <div className="text-gray-500 text-sm">123 Main St, City, Country</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 text-sm">Email</div>
                            <div className="text-gray-500 text-sm">hello@example.com</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 text-sm">Phone</div>
                            <div className="text-gray-500 text-sm">+1 (555) 000-0000</div>
                        </div>
                        <div>
                            <div className="font-medium text-gray-900 text-sm">Hours</div>
                            <div className="text-gray-500 text-sm">Mon-Fri 9am-5pm</div>
                        </div>
                    </div>
                </div>

                {/* Optional Form */}
                {showForm && (
                    <div className="flex-1">
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Name</div>
                                <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Email</div>
                                <div className="h-10 bg-gray-50 border border-gray-200 rounded" />
                            </div>
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Message</div>
                                <div className="h-24 bg-gray-50 border border-gray-200 rounded" />
                            </div>
                            <div className="bg-gray-800 text-white text-center py-2.5 text-sm font-medium">
                                Send Message
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <section>
            {mapPlacement === 'top' ? (
                <>
                    {mapBlock}
                    {infoBlock}
                </>
            ) : (
                <>
                    {infoBlock}
                    {mapBlock}
                </>
            )}
        </section>
    )
}

export const ContactMapFamily: TemplateFamily = {
    id: 'contact-map',
    category: 'contact',
    name: 'Contact with Map',
    description: 'Contact info with map placeholder',
    tags: ['map', 'location', 'address', 'contact'],
    hasForm: true,
    Canvas,
    controlsDef: [
        {
            key: 'mapPlacement',
            label: 'Map Position',
            type: 'toggle-group',
            options: [
                { value: 'top', label: 'Top' },
                { value: 'bottom', label: 'Bottom' },
            ],
            defaultValue: 'top',
        },
        {
            key: 'showForm',
            label: 'Show Form',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        mapPlacement: 'top',
        showForm: true,
    },
    defaultContent: {
        heading: 'Visit us',
        subheading: 'Come visit our office or reach out through the form.',
    },
}
