'use client'

/**
 * Table Standard Family — standard data tables with rows + columns.
 *
 * Figma ref: Tables 1–3 & 8–10 (node 2322:52)
 * - Section header: heading + description + button + ellipsis
 * - Column headers in muted row
 * - Data rows with dividers, optional checkbox, optional avatar, last-col action
 * - Pagination bar: < 1 2 3 4 >
 *
 * Controls:
 * - columns: '4' | '5' | '6'
 * - rows: '5' | '10'
 * - showCheckbox: boolean
 * - showAvatar: boolean
 * - showPagination: boolean
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

interface RowData {
    cells: string[]
}

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const colCount = Number(controls?.columns ?? 5)
    const rowCount = Number(controls?.rows ?? 5)
    const showCheckbox = controls?.showCheckbox === true
    const showAvatar = controls?.showAvatar === true
    const showPagination = controls?.showPagination !== false
    const rowAction = (controls?.rowAction as string) ?? 'view'
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const headers = (content?.headers as string[]) || Array.from({ length: colCount }, (_, i) => `Column ${i + 1}`)
    const rows = (content?.rows as RowData[]) || Array.from({ length: rowCount }, () => ({
        cells: Array.from({ length: colCount }, () => 'Lorem ipsum'),
    }))

    const handleHeaderChange = (i: number, value: string) => {
        const updated = [...headers]
        updated[i] = value
        onContentChange?.('headers', updated)
    }

    const handleCellChange = (rowIdx: number, colIdx: number, value: string) => {
        const updated = [...rows]
        updated[rowIdx] = { ...updated[rowIdx], cells: [...updated[rowIdx].cells] }
        updated[rowIdx].cells[colIdx] = value
        onContentChange?.('rows', updated)
    }

    const insertRow = (i: number) => {
        onContentChange?.('rows', insertListItem(rows, i, {
            cells: Array.from({ length: colCount }, () => 'Lorem ipsum'),
        }))
    }

    const removeRow = (i: number) => {
        const result = removeListItem(rows, i, 1)
        if (result) onContentChange?.('rows', result)
    }

    return (
        <section className={isMobile ? 'p-3' : 'p-6'}>
            {/* Section Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <EditableText
                        value={(content?.heading as string) || 'Table Title'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className="text-xl font-semibold text-gray-900"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.description as string) || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'}
                        onChange={(v) => onContentChange?.('description', v)}
                        as="p"
                        className="text-sm text-gray-500 mt-1"
                        editable={editable}
                        multiline
                    />
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                    <div className="h-8 px-4 bg-gray-800 text-white text-xs font-medium rounded flex items-center">
                        Button
                    </div>
                    <div className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">•••</div>
                </div>
            </div>

            {/* Table */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        {/* Head */}
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {showCheckbox && (
                                    <th className="w-10 px-3 py-2.5">
                                        <div className="w-4 h-4 border border-gray-300 rounded" />
                                    </th>
                                )}
                                {headers.slice(0, colCount).map((h, i) => (
                                    <th key={i} className="px-4 py-2.5 text-left font-medium text-gray-500">
                                        <EditableText
                                            value={h}
                                            onChange={(v) => handleHeaderChange(i, v)}
                                            className="text-xs uppercase tracking-wide"
                                            editable={editable}
                                        />
                                    </th>
                                ))}
                                {rowAction !== 'none' && (
                                    <th className="w-20 px-4 py-2.5" />
                                )}
                            </tr>
                        </thead>

                        {/* Body */}
                        <tbody>
                            {rows.slice(0, rowCount).map((row, ri) => (
                                <tr key={ri}>
                                    <td colSpan={
                                        (showCheckbox ? 1 : 0) +
                                        colCount +
                                        (rowAction !== 'none' ? 1 : 0)
                                    } className="p-0">
                                        {editable && ri === 0 && <InsertDot onInsert={() => insertRow(0)} />}
                                        <DynamicListItem
                                            index={ri}
                                            selectedIndex={selectedIndex}
                                            onSelect={setSelectedIndex}
                                            onDelete={() => removeRow(ri)}
                                            deletable={rows.length > 1}
                                            editable={editable}
                                        >
                                            <table className="w-full">
                                                <tbody>
                                                    <tr className="border-b border-gray-100 last:border-b-0">
                                                        {showCheckbox && (
                                                            <td className="w-10 px-3 py-3">
                                                                <div className="w-4 h-4 border border-gray-300 rounded" />
                                                            </td>
                                                        )}
                                                        {row.cells.slice(0, colCount).map((cell, ci) => (
                                                            <td key={ci} className="px-4 py-3">
                                                                <div className="flex items-center gap-2.5">
                                                                    {ci === 0 && showAvatar && (
                                                                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                                                                    )}
                                                                    <EditableText
                                                                        value={cell}
                                                                        onChange={(v) => handleCellChange(ri, ci, v)}
                                                                        className="text-gray-700"
                                                                        editable={editable}
                                                                    />
                                                                </div>
                                                            </td>
                                                        ))}
                                                        {rowAction === 'view' && (
                                                            <td className="w-20 px-4 py-3 text-right">
                                                                <span className="text-sm text-gray-600 font-medium">View</span>
                                                            </td>
                                                        )}
                                                        {rowAction === 'menu' && (
                                                            <td className="w-10 px-3 py-3 text-right text-gray-400 text-sm">
                                                                •••
                                                            </td>
                                                        )}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </DynamicListItem>
                                        {editable && <InsertDot onInsert={() => insertRow(ri + 1)} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {showPagination && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <span className="text-xs text-gray-500">Page 1 of 10</span>
                        <div className="flex items-center gap-1">
                            <div className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">‹</div>
                            {[1, 2, 3, 4].map((p) => (
                                <div
                                    key={p}
                                    className={`w-7 h-7 rounded flex items-center justify-center text-xs ${p === 1
                                            ? 'bg-gray-800 text-white'
                                            : 'border border-gray-200 text-gray-600'
                                        }`}
                                >
                                    {p}
                                </div>
                            ))}
                            <div className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">›</div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}

export const TableStandardFamily: TemplateFamily = {
    id: 'table-standard',
    category: 'data-table',
    name: 'Standard Table',
    description: 'Standard data table with sortable columns and pagination',
    tags: ['table', 'data', 'list', 'pagination', 'dashboard'],
    Canvas,
    controlsDef: [
        {
            key: 'columns',
            label: 'Columns',
            type: 'toggle-group',
            options: [
                { value: '4', label: '4' },
                { value: '5', label: '5' },
                { value: '6', label: '6' },
            ],
            defaultValue: '5',
        },
        {
            key: 'rows',
            label: 'Rows',
            type: 'toggle-group',
            options: [
                { value: '5', label: '5' },
                { value: '10', label: '10' },
            ],
            defaultValue: '5',
        },
        { key: 'showCheckbox', label: 'Checkbox', type: 'switch', defaultValue: false },
        { key: 'showAvatar', label: 'Avatar', type: 'switch', defaultValue: false },
        { key: 'showPagination', label: 'Pagination', type: 'switch', defaultValue: true },
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
        columns: '5',
        rows: '5',
        showCheckbox: false,
        showAvatar: false,
        showPagination: true,
        rowAction: 'view',
    },
    defaultContent: {
        heading: 'Table Title',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        headers: ['Name', 'Company', 'Number', 'Team', 'Date'],
        rows: Array.from({ length: 5 }, () => ({
            cells: ['Full Name', 'Company Name', '1234', 'Design', 'Jan 1, 2025'],
        })),
    },
}
