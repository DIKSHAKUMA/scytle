'use client'

/**
 * Gallery Tabs Family — Tabbed category gallery grid.
 *
 * Controls:
 * - columns: 2 | 3 | 4
 * - tabStyle: underline | pill
 */

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
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
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
    const [activeTab, setActiveTab] = useState(0)
    const columns = isMobile ? 2 : Number(controls?.columns ?? 3)
    const tabStyle = (controls?.tabStyle as string) ?? 'underline'
    const tabs = (content?.tabs as Array<{ label: string; images: Array<{ caption: string }> }>) || []

    const currentTab = tabs[activeTab] || { label: 'All', images: [] }

    const handleTabLabelChange = (tabIdx: number, value: string) => {
        const updated = [...tabs]
        updated[tabIdx] = { ...updated[tabIdx], label: value }
        onContentChange?.('tabs', updated)
    }

    const handleImageChange = (imgIdx: number, value: string) => {
        const updated = [...tabs]
        const tabImages = [...currentTab.images]
        tabImages[imgIdx] = { ...tabImages[imgIdx], caption: value }
        updated[activeTab] = { ...updated[activeTab], images: tabImages }
        onContentChange?.('tabs', updated)
    }

    const insertItem = (i: number) => {
        const updated = [...tabs]
        updated[activeTab] = {
            ...updated[activeTab],
            images: insertListItem(currentTab.images, i, { caption: 'New image' }),
        }
        onContentChange?.('tabs', updated)
    }

    const removeItem = (i: number) => {
        const result = removeListItem(currentTab.images, i, 1)
        if (result) {
            const updated = [...tabs]
            updated[activeTab] = { ...updated[activeTab], images: result }
            onContentChange?.('tabs', updated)
        }
    }

    const colClass = columns === 4 ? 'grid-cols-4' : columns === 3 ? 'grid-cols-3' : 'grid-cols-2'

    return (
        <section className={`${isMobile ? 'py-10 px-4' : 'py-20 px-16'}`}>
            <div className="max-w-6xl mx-auto">
                <EditableText
                    value={(content?.heading as string) || 'Gallery'}
                    onChange={(v) => onContentChange?.('heading', v)}
                    as="h2"
                    className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 text-center mb-8`}
                    editable={editable}
                />

                {/* Tab bar */}
                <div className={`flex ${isMobile ? 'gap-2 overflow-x-auto' : 'gap-4 justify-center'} mb-8`}>
                    {tabs.map((tab, tIdx) => (
                        <button
                            key={tIdx}
                            onClick={() => setActiveTab(tIdx)}
                            className={`whitespace-nowrap text-sm font-medium px-3 py-2 transition-colors ${
                                tabStyle === 'pill'
                                    ? tIdx === activeTab
                                        ? 'bg-gray-900 text-white rounded-full'
                                        : 'bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200'
                                    : tIdx === activeTab
                                        ? 'text-gray-900 border-b-2 border-gray-900'
                                        : 'text-gray-400 border-b-2 border-transparent hover:text-gray-600'
                            }`}
                        >
                            {editable ? (
                                <EditableText
                                    value={tab.label}
                                    onChange={(v) => handleTabLabelChange(tIdx, v)}
                                    className="inline"
                                    editable={editable}
                                />
                            ) : (
                                tab.label
                            )}
                        </button>
                    ))}
                </div>

                {/* Gallery grid */}
                <div className={`grid ${colClass} gap-4`}>
                    {currentTab.images.map((img, i) => (
                        <div key={i}>
                            {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={currentTab.images.length > 1}
                                editable={editable}
                            >
                                <div>
                                    <div className="aspect-square bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center">
                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                    </div>
                                    <EditableText
                                        value={img.caption}
                                        onChange={(v) => handleImageChange(i, v)}
                                        className="text-xs text-gray-500 mt-2"
                                        editable={editable}
                                    />
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

export const GalleryTabsFamily: TemplateFamily = {
    id: 'gallery-tabs',
    category: 'gallery',
    name: 'Gallery Tabs',
    description: 'Category-filtered gallery with tab navigation',
    tags: ['gallery', 'tabs', 'filter', 'categories'],
    Canvas,
    controlsDef: [
        { key: 'columns', label: 'Columns', type: 'toggle-group', options: [{ value: '2', label: '2' }, { value: '3', label: '3' }, { value: '4', label: '4' }], defaultValue: '3' },
        { key: 'tabStyle', label: 'Tab Style', type: 'toggle-group', options: [{ value: 'underline', label: 'Underline' }, { value: 'pill', label: 'Pill' }], defaultValue: 'underline' },
    ],
    defaultControls: { columns: '3', tabStyle: 'underline' },
    defaultContent: {
        heading: 'Gallery',
        tabs: [
            { label: 'All', images: [{ caption: 'Image 1' }, { caption: 'Image 2' }, { caption: 'Image 3' }, { caption: 'Image 4' }, { caption: 'Image 5' }, { caption: 'Image 6' }] },
            { label: 'Branding', images: [{ caption: 'Brand 1' }, { caption: 'Brand 2' }, { caption: 'Brand 3' }] },
            { label: 'Photography', images: [{ caption: 'Photo 1' }, { caption: 'Photo 2' }, { caption: 'Photo 3' }] },
            { label: 'Illustration', images: [{ caption: 'Illust 1' }, { caption: 'Illust 2' }] },
        ],
    },
    hasImage: true,
}
