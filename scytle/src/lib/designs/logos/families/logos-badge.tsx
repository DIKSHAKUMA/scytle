'use client'

/**
 * Logos Badge Family — Logos in pill/badge containers with labels.
 *
 * Controls:
 * - style: pill | card
 * - showDescription: boolean
 */

import { useState } from 'react'
import type { TemplateFamily, CanvasProps } from '../../types'
import { EditableText } from '@/components/wireframe/editable-text'
import {
    DynamicListItem,
    InsertDot,
    insertListItem,
    removeListItem,
} from '@/components/wireframe/dynamic-list'

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const isTablet = viewport === 'tablet'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const style = (controls?.style as string) ?? 'pill'
    const showDescription = controls?.showDescription !== false
    const logos = (content?.logos as Array<{ name: string; description: string }>) || []
    const itemCount = logos.length

    const gridCols = isMobile ? 2 : isTablet ? 3 : 4

    const handleLogoChange = (index: number, field: 'name' | 'description', value: string) => {
        const updated = [...logos]
        updated[index] = { ...updated[index], [field]: value }
        onContentChange?.('logos', updated)
    }

    const insertItem = (index: number) => {
        onContentChange?.('logos', insertListItem(logos, index, { name: `Partner ${itemCount + 1}`, description: 'Design platform' }))
    }

    const removeItem = (index: number) => {
        const result = removeListItem(logos, index, 1)
        if (result) onContentChange?.('logos', result)
    }

    const isPill = style === 'pill'

    return (
        <section className={`${isMobile ? 'py-12 px-4' : isTablet ? 'py-16 px-8' : 'py-20 px-16'}`}>
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-10 max-w-2xl mx-auto">
                    <EditableText
                        value={(content?.tagline as string) || 'Integrations'}
                        onChange={(v) => onContentChange?.('tagline', v)}
                        as="p"
                        className="text-sm text-gray-400 uppercase tracking-wide mb-2"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.heading as string) || 'Works with your favorite tools'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-3xl'}`}
                        editable={editable}
                    />
                </div>

                <div
                    className={`grid ${isPill ? 'gap-3' : 'gap-4'}`}
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                >
                    {logos.map((logo, i) => (
                        <div key={i}>
                            {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={itemCount > 1}
                                editable={editable}
                            >
                                <div
                                    className={`flex items-center gap-3 ${
                                        isPill
                                            ? 'px-4 py-3 bg-gray-50 rounded-full border border-gray-200'
                                            : 'p-4 bg-white rounded-lg border border-gray-200'
                                    }`}
                                >
                                    <div className="w-8 h-8 bg-gray-100 border border-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                                        <span className="text-[8px] text-gray-400">Logo</span>
                                    </div>
                                    <div className="min-w-0">
                                        <EditableText
                                            value={logo.name}
                                            onChange={(v) => handleLogoChange(i, 'name', v)}
                                            className="text-sm font-medium text-gray-900"
                                            editable={editable}
                                        />
                                        {showDescription && !isPill && (
                                            <EditableText
                                                value={logo.description}
                                                onChange={(v) => handleLogoChange(i, 'description', v)}
                                                className="text-xs text-gray-500 mt-0.5"
                                                editable={editable}
                                            />
                                        )}
                                    </div>
                                </div>
                            </DynamicListItem>
                            {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const LogosBadgeFamily: TemplateFamily = {
    id: 'logos-badge',
    category: 'logos',
    name: 'Logos Badge',
    description: 'Logos in pill or card badges with labels',
    tags: ['logos', 'badge', 'integration', 'tools'],
    Canvas,
    controlsDef: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'pill', label: 'Pill' },
                { value: 'card', label: 'Card' },
            ],
            defaultValue: 'pill',
        },
        {
            key: 'showDescription',
            label: 'Description',
            type: 'switch',
            defaultValue: true,
        },
    ],
    defaultControls: {
        style: 'pill',
        showDescription: true,
    },
    defaultContent: {
        tagline: 'Integrations',
        heading: 'Works with your favorite tools',
        logos: [
            { name: 'Figma', description: 'Design platform' },
            { name: 'Slack', description: 'Team messaging' },
            { name: 'GitHub', description: 'Code management' },
            { name: 'Notion', description: 'Project docs' },
            { name: 'Linear', description: 'Issue tracking' },
            { name: 'Vercel', description: 'Deployment' },
            { name: 'Stripe', description: 'Payments' },
            { name: 'Resend', description: 'Email delivery' },
        ],
    },
}
