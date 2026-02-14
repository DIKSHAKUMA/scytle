'use client'

/**
 * Table Filtered Family — tables with search, filter chips, result count.
 *
 * Figma ref: Tables 4–6 (node 2322:52)
 * - Search bar + filter chip row
 * - Result count badge
 * - Grouped section dividers (optional)
 *
 * Controls:
 * - showSearch: boolean
 * - showChips: boolean
 * - showResultCount: boolean
 * - grouped: boolean
 * - rowAction: 'none' | 'view' | 'menu'
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

interface RowData { cells: string[] }

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const showSearch = controls?.showSearch !== false
    const showChips = controls?.showChips !== false
    const showResultCount = controls?.showResultCount !== false
    const grouped = controls?.grouped === true
    const rowAction = (controls?.rowAction as string) ?? 'view'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const headers = (content?.headers as string[]) || ['Name', 'Company', 'Number', 'Team', 'Date']
    const rows = (content?.rows as RowData[]) || Array.from({ length: 5 }, () => ({
        cells: ['Full Name', 'Company Name', '1234', 'Design', 'Jan 1, 2025'],
    }))
    const chips = (content?.chips as string[]) || ['All', 'Active', 'Inactive', 'Archived']

    const handleCellChange = (ri: number, ci: number, v: string) => {
        const updated = [...rows]
        updated[ri] = { ...updated[ri], cells: [...updated[ri].cells] }
        updated[ri].cells[ci] = v
        onContentChange?.('rows', updated)
    }

    const insertRow = (i: number) => {
        onContentChange?.('rows', insertListItem(rows, i, {
            cells: Array.from({ length: headers.length }, () => 'Lorem ipsum'),
        }))
    }

    const removeRow = (i: number) => {
        const result = removeListItem(rows, i, 1)
        if (result) onContentChange?.('rows', result)
    }

    return (
        <section className={isMobile ? 'p-3' : 'p-6'}>
            {/* Section header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <EditableText
                        value={(content?.heading as string) || 'Filtered Table'}
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

            {/* Search + Chips */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                {(showSearch || showChips) && (
                    <div className="p-3 border-b border-gray-200 space-y-2">
                        {showSearch && (
                            <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg px-3 flex items-center text-sm text-gray-400">
                                Search…
                            </div>
                        )}
                        {showChips && (
                            <div className="flex items-center gap-2 flex-wrap">
                                {chips.map((chip, i) => (
                                    <div
                                        key={i}
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${i === 0
                                                ? 'bg-gray-800 text-white'
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                    >
                                        {chip}
                                    </div>
                                ))}
                            </div>
                        )}
                        {showResultCount && (
                            <div className="text-xs text-gray-400">{rows.length} results</div>
                        )}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {headers.map((h, i) => (
                                    <th key={i} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                                {rowAction !== 'none' && <th className="w-20 px-4 py-2.5" />}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri}>
                                    <td colSpan={headers.length + (rowAction !== 'none' ? 1 : 0)} className="p-0">
                                        {editable && ri === 0 && <InsertDot onInsert={() => insertRow(0)} />}
                                        {grouped && ri > 0 && ri % 3 === 0 && (
                                            <div className="bg-gray-50 px-4 py-1.5 text-xs font-medium text-gray-500 border-y border-gray-100">
                                                Group {Math.floor(ri / 3) + 1}
                                            </div>
                                        )}
                                        <DynamicListItem
                                            index={ri}
                                            selectedIndex={selectedIndex}
                                            onSelect={setSelectedIndex}
                                            onDelete={() => removeRow(ri)}
                                            deletable={rows.length > 1}
                                            editable={editable}
                                        >
                                            <table className="w-full"><tbody>
                                                <tr className="border-b border-gray-100">
                                                    {row.cells.map((cell, ci) => (
                                                        <td key={ci} className="px-4 py-3">
                                                            <EditableText
                                                                value={cell}
                                                                onChange={(v) => handleCellChange(ri, ci, v)}
                                                                className="text-gray-700"
                                                                editable={editable}
                                                            />
                                                        </td>
                                                    ))}
                                                    {rowAction === 'view' && (
                                                        <td className="w-20 px-4 py-3 text-right">
                                                            <span className="text-sm text-gray-600 font-medium">View</span>
                                                        </td>
                                                    )}
                                                    {rowAction === 'menu' && (
                                                        <td className="w-10 px-3 py-3 text-right text-gray-400 text-sm">•••</td>
                                                    )}
                                                </tr>
                                            </tbody></table>
                                        </DynamicListItem>
                                        {editable && <InsertDot onInsert={() => insertRow(ri + 1)} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </section>
    )
}

export const TableFilteredFamily: TemplateFamily = {
    id: 'table-filtered',
    category: 'data-table',
    name: 'Filtered Table',
    description: 'Data table with search, filter chips and result count',
    tags: ['table', 'filter', 'search', 'chips', 'dashboard'],
    Canvas,
    controlsDef: [
        { key: 'showSearch', label: 'Search', type: 'switch', defaultValue: true },
        { key: 'showChips', label: 'Filter Chips', type: 'switch', defaultValue: true },
        { key: 'showResultCount', label: 'Result Count', type: 'switch', defaultValue: true },
        { key: 'grouped', label: 'Grouped Rows', type: 'switch', defaultValue: false },
        {
            key: 'rowAction',
            label: 'Row Action',
            type: 'toggle-group',
            options: [
                { value: 'none', label: 'None' },
                { value: 'view', label: 'View' },
                { value: 'menu', label: 'Menu' },
            ],
            defaultValue: 'view',
        },
    ],
    defaultControls: {
        showSearch: true,
        showChips: true,
        showResultCount: true,
        grouped: false,
        rowAction: 'view',
    },
    defaultContent: {
        heading: 'Filtered Table',
        description: 'Lorem ipsum dolor sit amet.',
        chips: ['All', 'Active', 'Inactive', 'Archived'],
        headers: ['Name', 'Company', 'Number', 'Team', 'Date'],
        rows: Array.from({ length: 5 }, () => ({
            cells: ['Full Name', 'Company Name', '1234', 'Design', 'Jan 1, 2025'],
        })),
    },
}
