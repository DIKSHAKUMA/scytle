// ============================================================
// Iframe Parser Test Suite
//
// Tests the iframe-based HTML→ScytleNode parser.
//
// ENVIRONMENT NOTE: These tests run in happy-dom, which does NOT
// have a real CSS layout engine. This means:
//   - Tailwind CDN cannot load (script loading disabled)
//   - getComputedStyle() returns default values
//   - getBoundingClientRect() returns zeros
//
// The iframe parser will either:
//   a) Fall back to the legacy parser (if iframe creation fails), OR
//   b) Run the walker with default computed values (if iframe works)
//
// Therefore, these tests verify:
//   1. The async API contract (returns Promise<FrameNode>)
//   2. Output is always valid (never throws, always produces a tree)
//   3. Theme linking works via relinkNodes()
//   4. Edge cases (empty/malformed HTML) handled gracefully
//   5. Options are passed correctly
//
// For pixel-perfect layout tests, use @vitest/browser with Playwright
// or test manually via /test/parser (toggle "Iframe Parser" mode).
// ============================================================

import { describe, it, expect } from 'vitest'
import { parseHtmlToNodesViaIframe } from './iframe-parser'
import type { FrameNode, TextNode, ScytleNode } from '@/types/canvas'
import type { VariableTable } from '@/lib/theme/variable-table'

// ── Helpers ─────────────────────────────────────────────────

function findFirstOfType(root: FrameNode, type: string): ScytleNode | undefined {
    for (const child of root.children) {
        if (child.type === type) return child
        if (child.type === 'frame') {
            const found = findFirstOfType(child, type)
            if (found) return found
        }
    }
    return undefined
}

function findFirstText(root: FrameNode): TextNode | undefined {
    return findFirstOfType(root, 'text') as TextNode | undefined
}

function countAllNodes(root: FrameNode): number {
    let count = 0
    for (const child of root.children) {
        count++
        if (child.type === 'frame') {
            count += countAllNodes(child)
        }
    }
    return count
}

// ── Minimal variable table for theme linking tests ──

const TEST_VARIABLE_TABLE: VariableTable = {
    'accent': { light: '#3b82f6', dark: '#60a5fa' },
    'bg/primary': { light: '#ffffff', dark: '#111827' },
    'bg/secondary': { light: '#f5f5f5', dark: '#1f2937' },
    'text/primary': { light: '#111827', dark: '#f9fafb' },
    'text/secondary': { light: '#6b7280', dark: '#9ca3af' },
    'text/on-accent': { light: '#ffffff', dark: '#000000' },
    'border': { light: '#e5e7eb', dark: '#374151' },
    'font/heading': { light: 'Inter', dark: 'Inter' },
    'font/body': { light: 'Inter', dark: 'Inter' },
    'fontWeight/heading': { light: '700', dark: '700' },
    'fontWeight/body': { light: '400', dark: '400' },
    'radius/sm': { light: '4', dark: '4' },
    'radius/md': { light: '8', dark: '8' },
    'radius/lg': { light: '16', dark: '16' },
    'spacing/sm': { light: '16', dark: '16' },
    'spacing/md': { light: '24', dark: '24' },
    'spacing/lg': { light: '48', dark: '48' },
    'spacing/gap': { light: '16', dark: '16' },
    'shadow/sm': { light: '0 1px 3px rgba(0,0,0,0.08)', dark: '0 1px 3px rgba(0,0,0,0.4)' },
    'shadow/md': { light: '0 4px 12px rgba(0,0,0,0.1)', dark: '0 4px 12px rgba(0,0,0,0.5)' },
    'fontSize/h1': { light: '48', dark: '48' },
    'fontSize/h2': { light: '32', dark: '32' },
    'fontSize/body': { light: '16', dark: '16' },
}

// ════════════════════════════════════════════════════════════
// 1. Async API Contract
// ════════════════════════════════════════════════════════════

describe('parseHtmlToNodesViaIframe — API contract', () => {
    it('returns a Promise', () => {
        const result = parseHtmlToNodesViaIframe('<div><p>Hello</p></div>', 'Test')
        expect(result).toBeInstanceOf(Promise)
    })

    it('resolves to a FrameNode', async () => {
        const frame = await parseHtmlToNodesViaIframe('<div><p>Hello</p></div>', 'Test')
        expect(frame).toBeDefined()
        expect(frame.type).toBe('frame')
    })

    it('uses pageName as the root frame name', async () => {
        const frame = await parseHtmlToNodesViaIframe('<div><p>Hello</p></div>', 'My Page')
        expect(frame.name).toBe('My Page')
    })

    it('defaults pageName to "Page"', async () => {
        const frame = await parseHtmlToNodesViaIframe('<div><p>Hello</p></div>')
        expect(frame.name).toBe('Page')
    })

    it('accepts all options without throwing', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div><p>Hello</p></div>',
            'Test',
            {
                rootWidth: 800,
                variableTable: TEST_VARIABLE_TABLE,
                themeMode: 'light',
                fonts: ['Playfair Display'],
            },
        )
        expect(frame.type).toBe('frame')
    })
})

// ════════════════════════════════════════════════════════════
// 2. Output Validity (always produces valid ScytleNode tree)
// ════════════════════════════════════════════════════════════

describe('parseHtmlToNodesViaIframe — output validity', () => {
    it('always returns a frame with children array', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><h1>Title</h1><p>Body</p></div>',
            'Test',
        )
        expect(frame.type).toBe('frame')
        expect(Array.isArray(frame.children)).toBe(true)
    })

    it('produces text nodes with required properties', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><p>Hello World</p></div>',
            'Test',
        )
        const text = findFirstText(frame)
        expect(text).toBeDefined()
        if (text) {
            expect(text.type).toBe('text')
            expect(typeof text.characters).toBe('string')
            expect(text.characters.length).toBeGreaterThan(0)
            expect(typeof text.fontSize).toBe('number')
            expect(typeof text.fontWeight).toBe('number')
            expect(typeof text.color).toBe('string')
            expect(typeof text.width).toBe('number')
            expect(typeof text.height).toBe('number')
        }
    })

    it('produces frame nodes with layout property', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><div class="p-4">A</div><div class="p-4">B</div></div>',
            'Test',
        )
        expect(frame.layout).toBeDefined()
        expect(frame.layout.mode).toBeDefined()
    })

    it('produces valid node IDs', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><p>Hello</p><p>World</p></div>',
            'Test',
        )
        expect(typeof frame.id).toBe('string')
        expect(frame.id.length).toBeGreaterThan(0)

        for (const child of frame.children) {
            expect(typeof child.id).toBe('string')
            expect(child.id.length).toBeGreaterThan(0)
            expect(child.id).not.toBe(frame.id) // unique
        }
    })

    it('all children have valid types', async () => {
        const html = `<div class="flex flex-col">
            <h1 class="text-4xl font-bold">Title</h1>
            <p class="text-base">Body</p>
            <div class="p-4 bg-white"><span>Nested</span></div>
        </div>`
        const frame = await parseHtmlToNodesViaIframe(html, 'Test')
        const validTypes = new Set(['frame', 'text', 'image', 'vector'])

        function checkTypes(nodes: ScytleNode[]) {
            for (const n of nodes) {
                expect(validTypes.has(n.type)).toBe(true)
                if (n.type === 'frame') checkTypes(n.children)
            }
        }
        checkTypes(frame.children)
    })

    it('produces non-empty tree from substantial HTML', async () => {
        const html = `<div class="flex flex-col">
            <nav class="flex items-center px-8 py-4">
                <span class="text-xl font-bold">Brand</span>
            </nav>
            <section class="flex flex-col items-center py-24 px-8">
                <h1 class="text-5xl font-bold">Welcome</h1>
                <p class="text-xl">Description</p>
            </section>
            <footer class="px-8 py-6">
                <span class="text-sm">© 2026</span>
            </footer>
        </div>`
        const frame = await parseHtmlToNodesViaIframe(html, 'Landing')

        expect(frame.name).toBe('Landing')
        expect(frame.children.length).toBeGreaterThan(0)
        const totalNodes = countAllNodes(frame)
        expect(totalNodes).toBeGreaterThanOrEqual(3) // At least nav + section + footer
    })
})

// ════════════════════════════════════════════════════════════
// 3. Theme Linking
// ════════════════════════════════════════════════════════════

describe('parseHtmlToNodesViaIframe — theme linking', () => {
    it('assigns font refs via relinkNodes when variableTable provided', async () => {
        const html = `<div class="flex flex-col">
            <h1 class="text-4xl font-bold">Title</h1>
            <p class="text-base">Body text</p>
        </div>`

        const frame = await parseHtmlToNodesViaIframe(html, 'Test', {
            variableTable: TEST_VARIABLE_TABLE,
            themeMode: 'light',
        })

        // relinkNodes should assign font/heading to h1 tags
        const text = findFirstText(frame)
        expect(text).toBeDefined()
        if (text && text.htmlTag === 'h1') {
            expect(text.fontFamilyRef).toBe('font/heading')
        }
    })

    it('assigns color refs to text nodes', async () => {
        const html = `<div class="flex flex-col">
            <h2 class="text-2xl font-bold text-[#111827]">Dark Title</h2>
        </div>`

        const frame = await parseHtmlToNodesViaIframe(html, 'Test', {
            variableTable: TEST_VARIABLE_TABLE,
            themeMode: 'light',
        })

        const text = findFirstText(frame)
        expect(text).toBeDefined()
        if (text) {
            // relinkNodes classifies dark text → text/primary
            expect(text.colorRef).toBeDefined()
        }
    })

    it('works without variableTable', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><h1>Title</h1></div>',
            'Test',
        )
        expect(frame.type).toBe('frame')
        // No errors, just no refs
    })

    it('supports light mode', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><p class="text-[#111827]">Text</p></div>',
            'Test',
            { variableTable: TEST_VARIABLE_TABLE, themeMode: 'light' },
        )
        expect(frame.type).toBe('frame')
    })

    it('supports dark mode', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><p class="text-[#f9fafb]">Text</p></div>',
            'Test',
            { variableTable: TEST_VARIABLE_TABLE, themeMode: 'dark' },
        )
        expect(frame.type).toBe('frame')
    })
})

// ════════════════════════════════════════════════════════════
// 4. Edge Cases & Error Recovery
// ════════════════════════════════════════════════════════════

describe('parseHtmlToNodesViaIframe — edge cases', () => {
    it('handles empty HTML string', async () => {
        const frame = await parseHtmlToNodesViaIframe('', 'Test')
        expect(frame.type).toBe('frame')
        expect(frame.name).toBe('Test')
    })

    it('handles whitespace-only HTML', async () => {
        const frame = await parseHtmlToNodesViaIframe('   \n\n   ', 'Test')
        expect(frame.type).toBe('frame')
    })

    it('handles malformed HTML without crashing', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div><p>Unclosed paragraph<div>Nested improperly</p></div>',
            'Test',
        )
        expect(frame.type).toBe('frame')
    })

    it('strips script tags for safety', async () => {
        const html = `<div class="flex flex-col">
            <script>alert("xss")</script>
            <p>Safe text</p>
        </div>`
        const frame = await parseHtmlToNodesViaIframe(html, 'Test')
        const text = findFirstText(frame)
        expect(text).toBeDefined()
        expect(text!.characters).toBe('Safe text')
    })

    it('handles self-closing tags', async () => {
        const html = `<div class="flex flex-col">
            <img src="test.jpg" alt="Test" />
            <hr />
            <input type="text" placeholder="Name" />
        </div>`
        const frame = await parseHtmlToNodesViaIframe(html, 'Test')
        expect(frame.type).toBe('frame')
        expect(frame.children.length).toBeGreaterThan(0)
    })

    it('handles deeply nested HTML (> 10 levels)', async () => {
        let html = '<p>Deep</p>'
        for (let i = 0; i < 12; i++) {
            html = `<div class="p-2">${html}</div>`
        }
        const frame = await parseHtmlToNodesViaIframe(html, 'Test')
        expect(frame.type).toBe('frame')
        // Should find the text somewhere in the tree
        const text = findFirstText(frame)
        expect(text).toBeDefined()
    })

    it('never returns null or undefined', async () => {
        const inputs = [
            '',
            ' ',
            '<div></div>',
            '<br/>',
            '<!-- comment -->',
            '<span></span>',
        ]
        for (const html of inputs) {
            const frame = await parseHtmlToNodesViaIframe(html, 'Test')
            expect(frame).toBeDefined()
            expect(frame).not.toBeNull()
            expect(frame.type).toBe('frame')
        }
    })
})

// ════════════════════════════════════════════════════════════
// 5. Options Handling
// ════════════════════════════════════════════════════════════

describe('parseHtmlToNodesViaIframe — options', () => {
    it('respects rootWidth option', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><p>Hello</p></div>',
            'Test',
            { rootWidth: 800 },
        )
        expect(frame.width).toBe(800)
    })

    it('defaults rootWidth to 1440', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div class="flex flex-col"><p>Hello</p></div>',
            'Test',
        )
        expect(frame.width).toBe(1440)
    })

    it('handles rootWidth of 320 (mobile)', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div><p>Mobile</p></div>',
            'Test',
            { rootWidth: 320 },
        )
        expect(frame.width).toBe(320)
    })

    it('passes fonts option without error', async () => {
        const frame = await parseHtmlToNodesViaIframe(
            '<div><p>Hello</p></div>',
            'Test',
            { fonts: ['Playfair Display', 'Roboto', 'Montserrat'] },
        )
        expect(frame.type).toBe('frame')
    })
})
