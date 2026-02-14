'use client'

/**
 * List Stacked Family — vertical list rows with avatar, text lines, and actions.
 *
 * Figma ref: Stacked Lists 1–10 (node 4174:133785)
 * - User/Person style: avatar + name + email + job title + menu
 * - Progress/Task style: name + progress bar + percentage
 *
 * Controls:
 * - style: 'user' | 'progress'
 * - showSearch: boolean
 * - showFilter: boolean
 * - showAvatar: boolean
 * - showMenu: boolean
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

interface UserItem {
    name: string
    email: string
    title: string
}

interface ProgressItem {
    name: string
    progress: number
}

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const style = (controls?.style as string) ?? 'user'
    const showSearch = controls?.showSearch !== false
    const showFilter = controls?.showFilter === true
    const showAvatar = controls?.showAvatar !== false
    const showMenu = controls?.showMenu !== false
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const isUser = style === 'user'

    const userItems = (content?.userItems as UserItem[]) || Array.from({ length: 6 }, () => ({
        name: 'Full Name', email: 'email@example.com', title: 'Job Title',
    }))

    const progressItems = (content?.progressItems as ProgressItem[]) || [
        { name: 'Design System', progress: 85 },
        { name: 'API Integration', progress: 60 },
        { name: 'Documentation', progress: 40 },
        { name: 'Testing Suite', progress: 25 },
        { name: 'Deployment', progress: 10 },
    ]

    const items = isUser ? userItems : progressItems

    const insertItem = (i: number) => {
        if (isUser) {
            onContentChange?.('userItems', insertListItem(userItems, i, {
                name: 'Full Name', email: 'email@example.com', title: 'Job Title',
            }))
        } else {
            onContentChange?.('progressItems', insertListItem(progressItems, i, {
                name: 'New Task', progress: 50,
            }))
        }
    }

    const removeItem = (i: number) => {
        if (isUser) {
            const result = removeListItem(userItems, i, 1)
            if (result) onContentChange?.('userItems', result)
        } else {
            const result = removeListItem(progressItems, i, 1)
            if (result) onContentChange?.('progressItems', result)
        }
    }

    return (
        <section className={isMobile ? 'p-3' : 'p-6'}>
            {/* Section header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <EditableText
                        value={(content?.heading as string) || (isUser ? 'New Users' : 'Tasks')}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className="text-xl font-semibold text-gray-900"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.description as string) || 'Lorem ipsum dolor sit amet.'}
                        onChange={(v) => onContentChange?.('description', v)}
                        as="p"
                        className="text-sm text-gray-500 mt-1"
                        editable={editable}
                    />
                </div>
                <div className="h-8 px-4 bg-gray-800 text-white text-xs font-medium rounded flex items-center shrink-0 ml-4">
                    Button
                </div>
            </div>

            <div>
                {/* Search + Filter */}
                {(showSearch || showFilter) && (
                    <div className="pb-4 flex items-center gap-2">
                        {showSearch && (
                            <div className="flex-1 h-10 bg-gray-50 rounded px-3 flex items-center text-sm text-gray-400">
                                Search…
                            </div>
                        )}
                        {showFilter && (
                            <div className="h-10 px-4 bg-gray-50 rounded flex items-center text-sm text-gray-500 gap-1">
                                Filter <span className="text-gray-300">▾</span>
                            </div>
                        )}
                    </div>
                )}

                {/* List rows */}
                <div className="divide-y divide-gray-200">
                    {items.map((item, i) => (
                        <div key={i}>
                            {editable && i === 0 && <InsertDot onInsert={() => insertItem(0)} />}
                            <DynamicListItem
                                index={i}
                                selectedIndex={selectedIndex}
                                onSelect={setSelectedIndex}
                                onDelete={() => removeItem(i)}
                                deletable={items.length > 1}
                                editable={editable}
                            >
                                {isUser ? (
                                    /* User row */
                                    <div className="flex items-center gap-3 px-4 py-3">
                                        {showAvatar && (
                                            <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <EditableText
                                                value={(item as UserItem).name}
                                                onChange={(v) => {
                                                    const u = [...userItems]
                                                    u[i] = { ...u[i], name: v }
                                                    onContentChange?.('userItems', u)
                                                }}
                                                className="text-sm font-medium text-gray-900"
                                                editable={editable}
                                            />
                                            <EditableText
                                                value={(item as UserItem).email}
                                                onChange={(v) => {
                                                    const u = [...userItems]
                                                    u[i] = { ...u[i], email: v }
                                                    onContentChange?.('userItems', u)
                                                }}
                                                className="text-xs text-gray-500"
                                                editable={editable}
                                            />
                                        </div>
                                        <div className="text-sm text-gray-500 shrink-0">
                                            {(item as UserItem).title}
                                        </div>
                                        {showMenu && (
                                            <span className="text-gray-400 text-sm ml-2 shrink-0">•••</span>
                                        )}
                                    </div>
                                ) : (
                                    /* Progress row */
                                    <div className="px-4 py-3 flex items-center gap-4">
                                        <EditableText
                                            value={(item as ProgressItem).name}
                                            onChange={(v) => {
                                                const p = [...progressItems]
                                                p[i] = { ...p[i], name: v }
                                                onContentChange?.('progressItems', p)
                                            }}
                                            className="text-sm font-medium text-gray-900 w-32 shrink-0"
                                            editable={editable}
                                        />
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gray-800 rounded-full"
                                                style={{ width: `${(item as ProgressItem).progress}%` }}
                                            />
                                        </div>
                                        <span className="text-sm text-gray-500 w-10 text-right shrink-0">
                                            {(item as ProgressItem).progress}%
                                        </span>
                                        {showMenu && (
                                            <span className="text-gray-400 text-sm ml-1 shrink-0">•••</span>
                                        )}
                                    </div>
                                )}
                            </DynamicListItem>
                            {editable && <InsertDot onInsert={() => insertItem(i + 1)} />}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export const ListStackedFamily: TemplateFamily = {
    id: 'list-stacked',
    category: 'app-list',
    name: 'Stacked List',
    description: 'Vertical list rows — user/person or progress/task style',
    tags: ['list', 'stacked', 'user', 'progress', 'dashboard'],
    Canvas,
    controlsDef: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'user', label: 'User' },
                { value: 'progress', label: 'Progress' },
            ],
            defaultValue: 'user',
        },
        { key: 'showSearch', label: 'Search', type: 'switch', defaultValue: true },
        { key: 'showFilter', label: 'Filter', type: 'switch', defaultValue: false },
        { key: 'showAvatar', label: 'Avatar', type: 'switch', defaultValue: true },
        { key: 'showMenu', label: 'Row Menu', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        style: 'user',
        showSearch: true,
        showFilter: false,
        showAvatar: true,
        showMenu: true,
    },
    defaultContent: {
        heading: 'New Users',
        description: 'Lorem ipsum dolor sit amet.',
        userItems: Array.from({ length: 6 }, () => ({
            name: 'Full Name', email: 'email@example.com', title: 'Job Title',
        })),
        progressItems: [
            { name: 'Design System', progress: 85 },
            { name: 'API Integration', progress: 60 },
            { name: 'Documentation', progress: 40 },
            { name: 'Testing Suite', progress: 25 },
            { name: 'Deployment', progress: 10 },
        ],
    },
}
