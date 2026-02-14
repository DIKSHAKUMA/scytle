'use client'

/**
 * Table Expandable Family — rows that expand to show detail panel.
 *
 * Figma ref: Table 7 (node 2322:52)
 * - Chevron on left of each row
 * - Click expands a detail panel below with key-value metadata grid
 *
 * Controls:
 * - showCheckbox: boolean
 * - detailColumns: '2' | '3'
 * - showPagination: boolean
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

interface ExpandRow {
    cells: string[]
    details: { label: string; value: string }[]
}

function Canvas({ content, controls, viewport, onContentChange, editable }: CanvasProps) {
    const isMobile = viewport === 'mobile'
    const showCheckbox = controls?.showCheckbox === true
    const detailCols = Number(controls?.detailColumns ?? 2)
    const showPagination = controls?.showPagination !== false
    const [expandedRow, setExpandedRow] = useState<number | null>(0)
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const headers = (content?.headers as string[]) || ['Name', 'Company', 'Status', 'Date']
    const rows = (content?.rows as ExpandRow[]) || Array.from({ length: 5 }, () => ({
        cells: ['Full Name', 'Company', 'Active', 'Jan 1, 2025'],
        details: [
            { label: 'Email', value: 'email@example.com' },
            { label: 'Phone', value: '+1 234 567 890' },
            { label: 'Location', value: 'New York, US' },
            { label: 'Role', value: 'Designer' },
        ],
    }))

    const handleCellChange = (ri: number, ci: number, v: string) => {
        const updated = [...rows]
        updated[ri] = { ...updated[ri], cells: [...updated[ri].cells] }
        updated[ri].cells[ci] = v
        onContentChange?.('rows', updated)
    }

    const insertRow = (i: number) => {
        onContentChange?.('rows', insertListItem(rows, i, {
            cells: Array.from({ length: headers.length }, () => 'Lorem ipsum'),
            details: [
                { label: 'Email', value: 'email@example.com' },
                { label: 'Phone', value: '+1 234 567 890' },
            ],
        }))
    }

    const removeRow = (i: number) => {
        const result = removeListItem(rows, i, 1)
        if (result) onContentChange?.('rows', result)
    }

    const totalCols = (showCheckbox ? 1 : 0) + 1 + headers.length // +1 for chevron

    return (
        <section className={isMobile ? 'p-3' : 'p-6'}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <EditableText
                        value={(content?.heading as string) || 'Expandable Table'}
                        onChange={(v) => onContentChange?.('heading', v)}
                        as="h2"
                        className="text-xl font-semibold text-gray-900"
                        editable={editable}
                    />
                    <EditableText
                        value={(content?.description as string) || 'Click a row to view details.'}
                        onChange={(v) => onContentChange?.('description', v)}
                        as="p"
                        className="text-sm text-gray-500 mt-1"
                        editable={editable}
                    />
                </div>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {showCheckbox && (
                                    <th className="w-10 px-3 py-2.5">
                                        <div className="w-4 h-4 border border-gray-300 rounded" />
                                    </th>
                                )}
                                <th className="w-10 px-2 py-2.5" /> {/* chevron */}
                                {headers.map((h, i) => (
                                    <th key={i} className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, ri) => (
                                <tr key={ri}>
                                    <td colSpan={totalCols} className="p-0">
                                        {editable && ri === 0 && <InsertDot onInsert={() => insertRow(0)} />}
                                        <DynamicListItem
                                            index={ri}
                                            selectedIndex={selectedIndex}
                                            onSelect={setSelectedIndex}
                                            onDelete={() => removeRow(ri)}
                                            deletable={rows.length > 1}
                                            editable={editable}
                                        >
                                            {/* Main row */}
                                            <table className="w-full"><tbody>
                                                <tr
                                                    className="border-b border-gray-100 cursor-pointer hover:bg-gray-50"
                                                    onClick={() => setExpandedRow(expandedRow === ri ? null : ri)}
                                                >
                                                    {showCheckbox && (
                                                        <td className="w-10 px-3 py-3">
                                                            <div className="w-4 h-4 border border-gray-300 rounded" />
                                                        </td>
                                                    )}
                                                    <td className="w-10 px-2 py-3 text-gray-400">
                                                        <span className={`inline-block transition-transform ${expandedRow === ri ? 'rotate-90' : ''}`}>
                                                            ›
                                                        </span>
                                                    </td>
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
                                                </tr>
                                            </tbody></table>

                                            {/* Detail panel */}
                                            {expandedRow === ri && (
                                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                                    <div
                                                        className="grid gap-3"
                                                        style={{ gridTemplateColumns: `repeat(${isMobile ? 1 : detailCols}, minmax(0, 1fr))` }}
                                                    >
                                                        {row.details.map((d, di) => (
                                                            <div key={di}>
                                                                <div className="text-xs text-gray-400 mb-0.5">{d.label}</div>
                                                                <div className="text-sm text-gray-700">{d.value}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </DynamicListItem>
                                        {editable && <InsertDot onInsert={() => insertRow(ri + 1)} />}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showPagination && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                        <span className="text-xs text-gray-500">Page 1 of 10</span>
                        <div className="flex items-center gap-1">
                            <div className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-xs text-gray-500">‹</div>
                            {[1, 2, 3].map((p) => (
                                <div
                                    key={p}
                                    className={`w-7 h-7 rounded flex items-center justify-center text-xs ${p === 1 ? 'bg-gray-800 text-white' : 'border border-gray-200 text-gray-600'
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

export const TableExpandableFamily: TemplateFamily = {
    id: 'table-expandable',
    category: 'data-table',
    name: 'Expandable Table',
    description: 'Table rows that expand to reveal a detail metadata panel',
    tags: ['table', 'expandable', 'detail', 'accordion', 'dashboard'],
    Canvas,
    controlsDef: [
        { key: 'showCheckbox', label: 'Checkbox', type: 'switch', defaultValue: false },
        {
            key: 'detailColumns',
            label: 'Detail Columns',
            type: 'toggle-group',
            options: [
                { value: '2', label: '2' },
                { value: '3', label: '3' },
            ],
            defaultValue: '2',
        },
        { key: 'showPagination', label: 'Pagination', type: 'switch', defaultValue: true },
    ],
    defaultControls: {
        showCheckbox: false,
        detailColumns: '2',
        showPagination: true,
    },
    defaultContent: {
        heading: 'Expandable Table',
        description: 'Click a row to view details.',
        headers: ['Name', 'Company', 'Status', 'Date'],
        rows: Array.from({ length: 5 }, () => ({
            cells: ['Full Name', 'Company', 'Active', 'Jan 1, 2025'],
            details: [
                { label: 'Email', value: 'email@example.com' },
                { label: 'Phone', value: '+1 234 567 890' },
                { label: 'Location', value: 'New York, US' },
                { label: 'Role', value: 'Designer' },
            ],
        })),
    },
}
