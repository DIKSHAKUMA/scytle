'use client'

/**
 * List Grid Family — card grid layouts for people or projects.
 *
 * Figma ref: Grid Lists 1–10 (node 4174:135105)
 * - People: centered avatar + name + job title + description, bordered cards
 * - Project: icon + name + date + tag + description, horizontal layout
 *
 * Controls:
 * - style: 'people' | 'project'
 * - columns: '2' | '3' | '4'
 * - showDescription: boolean
 * - showTag: boolean
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

interface PersonCard {
    name: string
    title: string
    description: string
}

interface ProjectCard {
    name: string
    date: string
    tag: string
    description: string
}

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const style = (controls?.style as string) ?? 'people'
    const cols = Number(controls?.columns ?? 3)
    const showDescription = controls?.showDescription !== false
    const showTag = controls?.showTag !== false
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const isPeople = style === 'people'
    const gridCols = isMobile ? 2 : cols

    const peopleCards = (content?.peopleCards as PersonCard[]) || Array.from({ length: 6 }, () => ({
        name: 'Full Name', title: 'Job Title', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    }))

    const projectCards = (content?.projectCards as ProjectCard[]) || Array.from({ length: 6 }, () => ({
        name: 'Project Name', date: 'Jan 1, 2025', tag: 'Active', description: 'Lorem ipsum dolor sit amet.',
    }))

    const cards = isPeople ? peopleCards : projectCards

    const insertCard = (i: number) => {
        if (isPeople) {
            onContentChange?.('peopleCards', insertListItem(peopleCards, i, {
                name: 'Full Name', title: 'Job Title', description: 'Lorem ipsum dolor sit amet.',
            }))
        } else {
            onContentChange?.('projectCards', insertListItem(projectCards, i, {
                name: 'Project Name', date: 'Jan 1, 2025', tag: 'Active', description: 'Lorem ipsum dolor sit amet.',
            }))
        }
    }

    const removeCard = (i: number) => {
        if (isPeople) {
            const result = removeListItem(peopleCards, i, 1)
            if (result) onContentChange?.('peopleCards', result)
        } else {
            const result = removeListItem(projectCards, i, 1)
            if (result) onContentChange?.('projectCards', result)
        }
    }

    return (
        <section className={isMobile ? 'p-3' : 'p-6'}>
            {/* Section header */}
            <div className="flex items-start justify-between mb-5">
                <div className="flex-1 min-w-0">
                    <EditableText
                        value={(content?.heading as string) || (isPeople ? 'People you may know' : 'Projects')}
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

            {/* Grid */}
            <div
                className="grid gap-4"
                style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
                {cards.map((card, i) => (
                    <div key={i}>
                        {editable && i === 0 && <InsertDot onInsert={() => insertCard(0)} />}
                        <DynamicListItem
                            index={i}
                            selectedIndex={selectedIndex}
                            onSelect={setSelectedIndex}
                            onDelete={() => removeCard(i)}
                            deletable={cards.length > 1}
                            editable={editable}
                        >
                            {isPeople ? (
                                /* People card — centered avatar + name + title + description */
                                <div className="border border-gray-200 rounded-lg p-5 text-center">
                                    <div className="w-14 h-14 rounded-full bg-gray-200 mx-auto mb-3" />
                                    <EditableText
                                        value={(card as PersonCard).name}
                                        onChange={(v) => {
                                            const u = [...peopleCards]
                                            u[i] = { ...u[i], name: v }
                                            onContentChange?.('peopleCards', u)
                                        }}
                                        className="text-sm font-semibold text-gray-900"
                                        editable={editable}
                                    />
                                    <EditableText
                                        value={(card as PersonCard).title}
                                        onChange={(v) => {
                                            const u = [...peopleCards]
                                            u[i] = { ...u[i], title: v }
                                            onContentChange?.('peopleCards', u)
                                        }}
                                        className="text-xs text-gray-500 mt-0.5"
                                        editable={editable}
                                    />
                                    {showDescription && (
                                        <EditableText
                                            value={(card as PersonCard).description}
                                            onChange={(v) => {
                                                const u = [...peopleCards]
                                                u[i] = { ...u[i], description: v }
                                                onContentChange?.('peopleCards', u)
                                            }}
                                            className="text-xs text-gray-400 mt-2 line-clamp-2"
                                            editable={editable}
                                            multiline
                                        />
                                    )}
                                </div>
                            ) : (
                                /* Project card — icon + name + date + tag + description */
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-2">
                                        <div className="w-10 h-10 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center shrink-0">
                                            <div className="w-5 h-5 bg-gray-300 rounded" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <EditableText
                                                value={(card as ProjectCard).name}
                                                onChange={(v) => {
                                                    const u = [...projectCards]
                                                    u[i] = { ...u[i], name: v }
                                                    onContentChange?.('projectCards', u)
                                                }}
                                                className="text-sm font-semibold text-gray-900"
                                                editable={editable}
                                            />
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-xs text-gray-400">
                                                    {(card as ProjectCard).date}
                                                </span>
                                                {showTag && (
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                                        {(card as ProjectCard).tag}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {showDescription && (
                                        <EditableText
                                            value={(card as ProjectCard).description}
                                            onChange={(v) => {
                                                const u = [...projectCards]
                                                u[i] = { ...u[i], description: v }
                                                onContentChange?.('projectCards', u)
                                            }}
                                            className="text-xs text-gray-500 line-clamp-2"
                                            editable={editable}
                                            multiline
                                        />
                                    )}
                                </div>
                            )}
                        </DynamicListItem>
                        {editable && <InsertDot onInsert={() => insertCard(i + 1)} />}
                    </div>
                ))}
            </div>
        </section>
    )
}

export const ListGridFamily: TemplateFamily = {
    id: 'list-grid',
    category: 'app-list',
    name: 'Grid List',
    description: 'Card grids for people or project listings',
    tags: ['grid', 'cards', 'people', 'project', 'dashboard'],
    Canvas,
    controlsDef: [
        {
            key: 'style',
            label: 'Style',
            type: 'toggle-group',
            options: [
                { value: 'people', label: 'People' },
                { value: 'project', label: 'Project' },
            ],
            defaultValue: 'people',
        },
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
                { value: '4', label: '4' },
            ],
            defaultValue: '3',
        },
        { key: 'showDescription', label: 'Description', type: 'switch', defaultValue: true },
        { key: 'showTag', label: 'Tag (Project)', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        style: 'people',
        columns: '3',
        showDescription: true,
        showTag: true,
    },
    defaultContent: {
        heading: 'People you may know',
        description: 'Lorem ipsum dolor sit amet.',
        peopleCards: Array.from({ length: 6 }, () => ({
            name: 'Full Name', title: 'Job Title', description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        })),
        projectCards: Array.from({ length: 6 }, () => ({
            name: 'Project Name', date: 'Jan 1, 2025', tag: 'Active', description: 'Lorem ipsum dolor sit amet.',
        })),
    },
}
