/**
 * HTML Parser Test Suite
 * Tests the html-to-nodes parser against 8 key scenarios.
 * Run: npx tsx scripts/test-parser.ts
 */

import { JSDOM } from 'jsdom'

// Setup DOM globals for parser (it expects browser DOMParser)
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
    url: 'http://localhost',
})

// Inject all required globals
const globalAny = global as unknown as Record<string, unknown>
globalAny.DOMParser = dom.window.DOMParser
globalAny.XMLSerializer = dom.window.XMLSerializer
globalAny.Element = dom.window.Element
globalAny.Document = dom.window.Document
globalAny.Node = dom.window.Node
globalAny.window = dom.window
globalAny.document = dom.window.document
globalAny.HTMLElement = dom.window.HTMLElement
globalAny.SVGElement = dom.window.SVGElement

// Now import parser (after DOM is set up)
import { parseHtmlToNodes } from '../src/lib/parser/html-to-nodes'
import type { FrameNode, TextNode, ImageNode } from '../src/types/canvas'

// ============================================================
// Test Cases
// ============================================================

interface TestCase {
    name: string
    html: string
    assertions: (root: FrameNode) => string[] // Returns array of failure messages
}

const TEST_CASES: TestCase[] = [
    // 1. SVG Icon with currentColor (wrapped as AI would generate)
    {
        name: 'SVG icon with currentColor',
        html: `
            <div>
                <div class="text-blue-500">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    </svg>
                </div>
            </div>
        `,
        assertions: (root) => {
            const errors: string[] = []
            // root = page, children[0] = outer div (text-blue), children[0] of that = svg as image
            const container = root.children?.[0] as FrameNode
            const icon = container?.children?.[0]
            
            if (!icon) {
                errors.push('Expected icon node')
                return errors
            }
            if (icon.type !== 'image') {
                errors.push(`Expected icon type='image', got '${icon.type}'`)
            }
            // Check that currentColor was resolved (not gray default)
            const imgNode = icon as ImageNode
            if (imgNode.src && imgNode.src.includes('currentColor')) {
                errors.push('currentColor was NOT resolved in SVG src')
            }
            return errors
        }
    },

    // 2. SVG icon with explicit fill/stroke
    {
        name: 'SVG icon with explicit colors',
        html: `
            <div>
                <svg width="24" height="24" fill="#ff0000" stroke="#00ff00">
                    <circle cx="12" cy="12" r="10"/>
                </svg>
            </div>
        `,
        assertions: (root) => {
            const errors: string[] = []
            const icon = root.children?.[0]
            if (!icon) {
                errors.push('Expected icon node')
                return errors
            }
            if (icon.type !== 'image') {
                errors.push(`Expected type='image', got '${icon.type}'`)
            }
            const imgNode = icon as ImageNode
            if (imgNode.src && !imgNode.src.includes('ff0000')) {
                errors.push('Expected red fill preserved in SVG')
            }
            return errors
        }
    },

    // 3. IMG tag (wrapped)
    {
        name: 'IMG tag parsing',
        html: `
            <div>
                <img src="https://example.com/photo.jpg" alt="Photo" width="300" height="200" class="rounded-lg"/>
            </div>
        `,
        assertions: (root) => {
            const errors: string[] = []
            const img = root.children?.[0]
            if (!img) {
                errors.push('Expected image node')
                return errors
            }
            if (img.type !== 'image') {
                errors.push(`Expected type='image', got '${img.type}'`)
            }
            const imgNode = img as ImageNode
            if (imgNode.src !== 'https://example.com/photo.jpg') {
                errors.push(`Expected src='https://example.com/photo.jpg', got '${imgNode.src}'`)
            }
            if (imgNode.width !== 300) {
                errors.push(`Expected width=300, got ${imgNode.width}`)
            }
            return errors
        }
    },

    // 4. Flex row with hug sizing - nested to test properly
    {
        name: 'Flex row - children should hug by default',
        html: `
            <div>
                <div class="flex flex-row gap-4">
                    <span>Item A</span>
                    <span>Item B</span>
                </div>
            </div>
        `,
        assertions: (root) => {
            const errors: string[] = []
            // root = page wrapper, children[0] = flex row container
            const container = root.children?.[0] as FrameNode
            if (!container) {
                errors.push('Expected container frame')
                return errors
            }
            if (container.layout?.mode !== 'flex') {
                errors.push(`Expected layout.mode='flex', got '${container.layout?.mode}'`)
            }
            if (container.layout?.direction !== 'row') {
                errors.push(`Expected layout.direction='row', got '${container.layout?.direction}'`)
            }
            if (container.layout?.gap !== 16) {
                errors.push(`Expected gap=16 (gap-4), got ${container.layout?.gap}`)
            }
            for (const child of container.children || []) {
                if (child.sizing?.horizontal !== 'hug') {
                    errors.push(`Expected child horizontal sizing='hug', got '${child.sizing?.horizontal}'`)
                }
            }
            return errors
        }
    },

    // 5. Flex column - text fills width
    {
        name: 'Flex column - paragraph fills width',
        html: `
            <div class="flex flex-col">
                <p class="w-full">This is a full-width paragraph.</p>
            </div>
        `,
        assertions: (root) => {
            const errors: string[] = []
            // root IS the flex-col container (single top-level div)
            if (root.layout?.direction !== 'column') {
                errors.push(`Expected direction='column', got '${root.layout?.direction}'`)
            }
            const para = root.children?.[0] as TextNode
            if (!para) {
                errors.push('Expected paragraph')
                return errors
            }
            if (para.sizing?.horizontal !== 'fill') {
                errors.push(`Expected paragraph horizontal='fill' (w-full), got '${para.sizing?.horizontal}'`)
            }
            return errors
        }
    },

    // 6. Grid layout with columns
    {
        name: 'Grid layout with 3 columns',
        html: `
            <div class="grid grid-cols-3 gap-6">
                <div>Card 1</div>
                <div>Card 2</div>
                <div>Card 3</div>
            </div>
        `,
        assertions: (root) => {
            const errors: string[] = []
            // root IS the grid container (single top-level div)
            if (root.layout?.mode !== 'grid') {
                errors.push(`Expected layout.mode='grid', got '${root.layout?.mode}'`)
            }
            if (root.layout?.columns !== 3) {
                errors.push(`Expected columns=3, got ${root.layout?.columns}`)
            }
            const gap = root.layout?.gap ?? root.layout?.columnGap ?? 0
            if (gap !== 24) {
                errors.push(`Expected gap=24 (gap-6), got ${gap}`)
            }
            return errors
        }
    },

    // 7. No forced gap when not specified
    {
        name: 'No gap injection when not specified',
        html: `
            <div class="flex flex-col">
                <span>A</span>
                <span>B</span>
            </div>
        `,
        assertions: (root) => {
            const errors: string[] = []
            // root IS the flex-col container
            const gap = root.layout?.gap ?? 0
            if (gap > 0) {
                errors.push(`Expected gap=0 (no forced injection), got gap=${gap}`)
            }
            return errors
        }
    },

    // 8. Heading should hug content (wrapped)
    {
        name: 'Heading hugs content (not fill)',
        html: `
            <div>
                <h1 class="text-4xl font-bold">Hello World</h1>
            </div>
        `,
        assertions: (root) => {
            const errors: string[] = []
            const heading = root.children?.[0] as TextNode
            if (!heading) {
                errors.push('Expected heading node')
                return errors
            }
            if (heading.type !== 'text') {
                errors.push(`Expected type='text', got '${heading.type}'`)
            }
            // Headings should hug by default
            if (heading.sizing?.horizontal === 'fill') {
                errors.push(`Expected heading horizontal='hug', got 'fill'`)
            }
            if (heading.autoResize !== 'width-and-height') {
                errors.push(`Expected autoResize='width-and-height', got '${heading.autoResize}'`)
            }
            return errors
        }
    },
]

// ============================================================
// Run Tests
// ============================================================

console.log('\n🧪 HTML Parser V2 Test Suite\n')
console.log('='.repeat(60))

let passed = 0
let failed = 0

for (const test of TEST_CASES) {
    try {
        const root = parseHtmlToNodes(test.html, 'Test')
        const errors = test.assertions(root)

        if (errors.length === 0) {
            console.log(`✅ PASS: ${test.name}`)
            passed++
        } else {
            console.log(`❌ FAIL: ${test.name}`)
            for (const err of errors) {
                console.log(`   └─ ${err}`)
            }
            failed++
        }
    } catch (err) {
        console.log(`❌ ERROR: ${test.name}`)
        console.log(`   └─ ${err instanceof Error ? err.message : String(err)}`)
        failed++
    }
}

console.log('='.repeat(60))
console.log(`\n📊 Results: ${passed} passed, ${failed} failed out of ${TEST_CASES.length} tests\n`)

process.exit(failed > 0 ? 1 : 0)
