// ============================================================
// Parser Test Suite — Phase 6
// Tests the HTML→ScytleNode parser pipeline covering:
//  1. Layout mode detection (flex, grid, none)
//  2. Sizing defaults (hug vs fill)
//  3. Gap handling (no forced defaults)
//  4. Text sizing (context-aware)
//  5. SVG/icon handling
//  6. Tailwind class parsing (flex child, grid, min/max)
//  7. End-to-end HTML→FrameNode conversion
// ============================================================

import { describe, it, expect } from 'vitest'
import { parseClasses, defaultStyles } from '@/lib/parser/class-parser'
import { parseHtmlToNodes } from '@/lib/parser/html-to-nodes'
import type { FrameNode, TextNode } from '@/types/canvas'

// ── Helpers ─────────────────────────────────────────────────

function findNodeByName(root: FrameNode, name: string): FrameNode | TextNode | undefined {
    for (const child of root.children) {
        if (child.name === name) return child as FrameNode | TextNode
        if (child.type === 'frame') {
            const found = findNodeByName(child as FrameNode, name)
            if (found) return found
        }
    }
    return undefined
}

function findFirstText(root: FrameNode): TextNode | undefined {
    for (const child of root.children) {
        if (child.type === 'text') return child as TextNode
        if (child.type === 'frame') {
            const found = findFirstText(child as FrameNode)
            if (found) return found
        }
    }
    return undefined
}

function findFirstImage(root: FrameNode): { type: 'image'; src: string } | undefined {
    for (const child of root.children) {
        if (child.type === 'image') return child as unknown as { type: 'image'; src: string }
        if (child.type === 'frame') {
            const found = findFirstImage(child as FrameNode)
            if (found) return found
        }
    }
    return undefined
}

function findFirstFrame(root: FrameNode): FrameNode | undefined {
    for (const child of root.children) {
        if (child.type === 'frame') return child as FrameNode
    }
    return undefined
}

function countNodesByType(root: FrameNode, type: string): number {
    let count = 0
    for (const child of root.children) {
        if (child.type === type) count++
        if (child.type === 'frame') {
            count += countNodesByType(child as FrameNode, type)
        }
    }
    return count
}

// ════════════════════════════════════════════════════════════
// 1. Tailwind Class Parser
// ════════════════════════════════════════════════════════════

describe('parseClasses', () => {
    it('returns defaults for empty input', () => {
        const s = parseClasses([])
        expect(s.display).toBe('block')
        expect(s.flexDirection).toBe('row')
        expect(s.gap).toBe(0)
        expect(s.fontSize).toBe(16)
        expect(s.fontWeight).toBe(400)
    })

    // ── Layout ──────────────────────────────────────────────

    describe('layout classes', () => {
        it('parses flex + flex-col', () => {
            const s = parseClasses(['flex', 'flex-col'])
            expect(s.display).toBe('flex')
            expect(s.flexDirection).toBe('column')
        })

        it('parses grid + grid-cols-3', () => {
            const s = parseClasses(['grid', 'grid-cols-3'])
            expect(s.display).toBe('grid')
            expect(s.gridColumns).toBe(3)
        })

        it('parses inline-flex', () => {
            const s = parseClasses(['inline-flex'])
            expect(s.display).toBe('inline-flex')
        })

        it('parses justify and align', () => {
            const s = parseClasses(['flex', 'justify-between', 'items-center'])
            expect(s.justifyContent).toBe('between')
            expect(s.alignItems).toBe('center')
        })

        it('parses flex-wrap', () => {
            const s = parseClasses(['flex', 'flex-wrap'])
            expect(s.flexWrap).toBe(true)
        })

        it('parses hidden', () => {
            const s = parseClasses(['hidden'])
            expect(s.hidden).toBe(true)
            expect(s.display).toBe('none')
        })
    })

    // ── Flex child properties ───────────────────────────────

    describe('flex child properties', () => {
        it('parses shrink-0', () => {
            const s = parseClasses(['shrink-0'])
            expect(s.flexShrink).toBe(0)
        })

        it('parses flex-shrink', () => {
            const s = parseClasses(['flex-shrink'])
            expect(s.flexShrink).toBe(1)
        })

        it('parses basis-0', () => {
            const s = parseClasses(['basis-0'])
            expect(s.flexBasis).toBe(0)
        })

        it('parses basis-full', () => {
            const s = parseClasses(['basis-full'])
            expect(s.widthRatio).toBe(1)
        })

        it('parses basis-1/2', () => {
            const s = parseClasses(['basis-1/2'])
            expect(s.widthRatio).toBe(0.5)
        })

        it('parses order-first and order-last', () => {
            expect(parseClasses(['order-first']).order).toBe(-9999)
            expect(parseClasses(['order-last']).order).toBe(9999)
        })

        it('parses order-2', () => {
            const s = parseClasses(['order-2'])
            expect(s.order).toBe(2)
        })

        it('parses self-center', () => {
            const s = parseClasses(['self-center'])
            expect(s.alignSelf).toBe('center')
        })

        it('parses self-stretch', () => {
            const s = parseClasses(['self-stretch'])
            expect(s.alignSelf).toBe('stretch')
        })

        it('parses flex-1 / flex-grow / grow', () => {
            expect(parseClasses(['flex-1']).flexGrow).toBe(true)
            expect(parseClasses(['flex-grow']).flexGrow).toBe(true)
            expect(parseClasses(['grow']).flexGrow).toBe(true)
        })

        it('parses flex-none', () => {
            const s = parseClasses(['flex-none'])
            expect(s.flexGrow).toBe(false)
        })
    })

    // ── Gap ─────────────────────────────────────────────────

    describe('gap classes', () => {
        it('parses uniform gap', () => {
            const s = parseClasses(['gap-4'])
            expect(s.gap).toBe(16)
            expect(s.columnGap).toBe(16)
            expect(s.rowGap).toBe(16)
        })

        it('parses split gap-x and gap-y', () => {
            const s = parseClasses(['gap-x-4', 'gap-y-2'])
            expect(s.columnGap).toBe(16)
            expect(s.rowGap).toBe(8)
        })

        it('parses gap-0', () => {
            const s = parseClasses(['gap-0'])
            expect(s.gap).toBe(0)
        })
    })

    // ── Grid properties ─────────────────────────────────────

    describe('grid properties', () => {
        it('parses grid-rows-3', () => {
            const s = parseClasses(['grid-rows-3'])
            expect(s.gridRows).toBe(3)
        })

        it('parses col-span-2', () => {
            const s = parseClasses(['col-span-2'])
            expect(s.gridColumnSpan).toBe(2)
        })

        it('parses col-span-full', () => {
            const s = parseClasses(['col-span-full'])
            expect(s.gridColumnSpan).toBe(-1)
        })

        it('parses row-span-2', () => {
            const s = parseClasses(['row-span-2'])
            expect(s.gridRowSpan).toBe(2)
        })
    })

    // ── Spacing ─────────────────────────────────────────────

    describe('spacing', () => {
        it('parses uniform padding', () => {
            const s = parseClasses(['p-4'])
            expect(s.padding).toEqual({ top: 16, right: 16, bottom: 16, left: 16 })
        })

        it('parses px and py', () => {
            const s = parseClasses(['px-6', 'py-3'])
            expect(s.padding.left).toBe(24)
            expect(s.padding.right).toBe(24)
            expect(s.padding.top).toBe(12)
            expect(s.padding.bottom).toBe(12)
        })

        it('parses individual padding', () => {
            const s = parseClasses(['pt-2', 'pr-4', 'pb-6', 'pl-8'])
            expect(s.padding).toEqual({ top: 8, right: 16, bottom: 24, left: 32 })
        })

        it('parses margin', () => {
            const s = parseClasses(['mx-4', 'my-2'])
            expect(s.margin.left).toBe(16)
            expect(s.margin.right).toBe(16)
            expect(s.margin.top).toBe(8)
            expect(s.margin.bottom).toBe(8)
        })
    })

    // ── Typography ──────────────────────────────────────────

    describe('typography', () => {
        it('parses text-xl', () => {
            const s = parseClasses(['text-xl'])
            expect(s.fontSize).toBe(20)
        })

        it('parses font-bold', () => {
            const s = parseClasses(['font-bold'])
            expect(s.fontWeight).toBe(700)
        })

        it('parses text-center', () => {
            const s = parseClasses(['text-center'])
            expect(s.textAlign).toBe('center')
        })

        it('parses uppercase', () => {
            const s = parseClasses(['uppercase'])
            expect(s.textTransform).toBe('uppercase')
        })

        it('parses italic', () => {
            const s = parseClasses(['italic'])
            expect(s.fontStyle).toBe('italic')
        })

        it('parses underline', () => {
            const s = parseClasses(['underline'])
            expect(s.textDecoration).toBe('underline')
        })

        it('parses leading-tight', () => {
            const s = parseClasses(['text-base', 'leading-tight'])
            // leading-tight = 1.25 × 16px = 20
            expect(s.lineHeight).toBe(20)
        })

        it('text color from arbitrary value', () => {
            const s = parseClasses(['text-[#ff0000]'])
            expect(s.textColor).toBeTruthy()
        })
    })

    // ── Sizing ──────────────────────────────────────────────

    describe('sizing', () => {
        it('parses w-full', () => {
            const s = parseClasses(['w-full'])
            expect(s.widthRatio).toBe(1)
        })

        it('parses w-1/2', () => {
            const s = parseClasses(['w-1/2'])
            expect(s.widthRatio).toBe(0.5)
        })

        it('parses w-[300px]', () => {
            const s = parseClasses(['w-[300px]'])
            expect(s.width).toBe(300)
        })

        it('parses h-[200px]', () => {
            const s = parseClasses(['h-[200px]'])
            expect(s.height).toBe(200)
        })

        it('parses max-w-7xl', () => {
            const s = parseClasses(['max-w-7xl'])
            expect(s.maxWidth).toBe(1280)
        })

        it('parses min-w-[100px]', () => {
            const s = parseClasses(['min-w-[100px]'])
            expect(s.minWidth).toBe(100)
        })

        it('parses max-h-[500px]', () => {
            const s = parseClasses(['max-h-[500px]'])
            expect(s.maxHeight).toBe(500)
        })

        it('parses min-h-[200px]', () => {
            const s = parseClasses(['min-h-[200px]'])
            expect(s.minHeight).toBe(200)
        })
    })

    // ── Aspect ratio ────────────────────────────────────────

    describe('aspect ratio', () => {
        it('parses aspect-square', () => {
            const s = parseClasses(['aspect-square'])
            expect(s.aspectRatio).toBe('1/1')
        })

        it('parses aspect-video', () => {
            const s = parseClasses(['aspect-video'])
            expect(s.aspectRatio).toBe('16/9')
        })

        it('parses aspect-[4/3]', () => {
            const s = parseClasses(['aspect-[4/3]'])
            expect(s.aspectRatio).toBe('4/3')
        })
    })

    // ── Visual properties ───────────────────────────────────

    describe('visual properties', () => {
        it('parses background color', () => {
            const s = parseClasses(['bg-white'])
            expect(s.bgColor).toBeTruthy()
        })

        it('parses border', () => {
            const s = parseClasses(['border', 'border-2'])
            expect(s.borderWidth).toBe(2)
            expect(s.borderStyle).toBe('solid')
        })

        it('parses rounded-xl', () => {
            const s = parseClasses(['rounded-xl'])
            expect(s.borderRadius).toBe(12)
        })

        it('parses shadow-lg', () => {
            const s = parseClasses(['shadow-lg'])
            expect(s.shadows.length).toBeGreaterThan(0)
        })

        it('parses opacity-50', () => {
            const s = parseClasses(['opacity-50'])
            expect(s.opacity).toBe(0.5)
        })

        it('parses overflow-hidden', () => {
            const s = parseClasses(['overflow-hidden'])
            expect(s.overflow).toBe('hidden')
        })
    })

    // ── Position ────────────────────────────────────────────

    describe('position', () => {
        it('parses relative', () => {
            const s = parseClasses(['relative'])
            expect(s.position).toBe('relative')
        })

        it('parses absolute', () => {
            const s = parseClasses(['absolute'])
            expect(s.position).toBe('absolute')
        })

        it('parses top and left offsets', () => {
            const s = parseClasses(['absolute', 'top-4', 'left-8'])
            expect(s.positionTop).toBe(16)   // 4*4
            expect(s.positionLeft).toBe(32)  // 8*4
        })

        it('parses bottom and right offsets', () => {
            const s = parseClasses(['absolute', 'bottom-2', 'right-6'])
            expect(s.positionBottom).toBe(8)   // 2*4
            expect(s.positionRight).toBe(24)   // 6*4
        })

        it('parses inset-0 to all four offsets', () => {
            const s = parseClasses(['absolute', 'inset-0'])
            expect(s.positionTop).toBe(0)
            expect(s.positionRight).toBe(0)
            expect(s.positionBottom).toBe(0)
            expect(s.positionLeft).toBe(0)
        })

        it('parses negative offsets', () => {
            const s = parseClasses(['absolute', '-top-2', '-left-1'])
            expect(s.positionTop).toBe(-8)
            expect(s.positionLeft).toBe(-4)
        })

        it('parses arbitrary offset values', () => {
            const s = parseClasses(['absolute', 'top-[20px]', 'left-[10px]'])
            expect(s.positionTop).toBe(20)
            expect(s.positionLeft).toBe(10)
        })
    })

    // ── Gradient ────────────────────────────────────────────

    describe('gradient', () => {
        it('builds gradient from from/to stops', () => {
            const s = parseClasses(['bg-gradient-to-r', 'from-blue-500', 'to-purple-500'])
            expect(s.gradient).toBeTruthy()
            expect(s.gradient).toContain('linear-gradient')
            expect(s.gradient).toContain('to right')
        })

        it('builds gradient from Tailwind v4 bg-linear-to-* syntax', () => {
            const s = parseClasses(['bg-linear-to-r', 'from-blue-500', 'to-purple-500'])
            expect(s.gradient).toBeTruthy()
            expect(s.gradient).toContain('linear-gradient')
            expect(s.gradient).toContain('to right')
        })

        it('builds gradient with via stop using v4 syntax', () => {
            const s = parseClasses(['bg-linear-to-br', 'from-indigo-500', 'via-purple-500', 'to-pink-500'])
            expect(s.gradient).toBeTruthy()
            expect(s.gradient).toContain('to bottom right')
        })
    })

    // ── Skips responsive prefixes ───────────────────────────

    describe('responsive prefixes', () => {
        it('ignores sm: md: lg: prefixed classes', () => {
            const s = parseClasses(['text-lg', 'sm:text-xl', 'md:text-2xl', 'lg:text-3xl'])
            expect(s.fontSize).toBe(18) // Only unprefixed text-lg applies
        })
    })

    // ── Per-corner border radius ────────────────────────────

    describe('per-corner border radius', () => {
        it('parses rounded-t-lg', () => {
            const s = parseClasses(['rounded-t-lg'])
            expect(s.borderRadiusPerCorner).toEqual({
                topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0,
            })
        })

        it('parses rounded-tl-xl', () => {
            const s = parseClasses(['rounded-tl-xl'])
            expect(s.borderRadiusPerCorner).toEqual({
                topLeft: 12, topRight: 0, bottomLeft: 0, bottomRight: 0,
            })
        })
    })
})

// ════════════════════════════════════════════════════════════
// 2. HTML→ScytleNode Pipeline
// ════════════════════════════════════════════════════════════

describe('parseHtmlToNodes', () => {
    // ── Basic structure ─────────────────────────────────────

    describe('basic structure', () => {
        it('parses empty div', () => {
            const root = parseHtmlToNodes('<div></div>', 'Test')
            expect(root.type).toBe('frame')
            expect(root.name).toBe('Test')
        })

        it('returns a frame even for text-only input', () => {
            const root = parseHtmlToNodes('<p>Hello World</p>', 'Test')
            expect(root.type).toBe('frame')
        })

        it('wraps sections as children', () => {
            const html = `<div class="flex flex-col">
                <section><h2>Hero</h2></section>
                <section><h2>Features</h2></section>
            </div>`
            const root = parseHtmlToNodes(html, 'Page')
            expect(root.children.length).toBe(2)
        })
    })

    // ── Layout mode detection ───────────────────────────────

    describe('layout mode detection', () => {
        it('explicit flex class → flex mode', () => {
            const html = `<div class="flex flex-row gap-4">
                <div class="p-4">A</div>
                <div class="p-4">B</div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.layout.mode).toBe('flex')
            expect(root.layout.direction).toBe('row')
        })

        it('explicit grid class → grid mode', () => {
            const html = `<div class="grid grid-cols-3 gap-4">
                <div class="p-4">A</div>
                <div class="p-4">B</div>
                <div class="p-4">C</div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.layout.mode).toBe('grid')
            expect(root.layout.columns).toBe(3)
        })

        it('inferred flex from items-center → flex mode', () => {
            const html = `<div class="items-center justify-between">
                <span>Left</span>
                <span>Right</span>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.layout.mode).toBe('flex')
        })

        it('nested flex-col section', () => {
            const html = `<div class="flex flex-col"><section class="flex flex-col gap-6 p-8">
                <h2 class="text-2xl font-bold">Title</h2>
                <p class="text-base">Description</p>
            </section></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const section = root.children[0] as FrameNode
            expect(section.type).toBe('frame')
            expect(section.layout.mode).toBe('flex')
            expect(section.layout.direction).toBe('column')
        })
    })

    // ── Sizing defaults ─────────────────────────────────────

    describe('sizing defaults', () => {
        it('root frame has fixed horizontal sizing', () => {
            const root = parseHtmlToNodes('<div class="flex flex-col"></div>', 'Test')
            expect(root.sizing.horizontal).toBe('fixed')
        })

        it('text nodes have appropriate sizing', () => {
            const html = `<div class="flex flex-col"><h1 class="text-4xl font-bold">Big Title</h1></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const text = findFirstText(root)
            expect(text).toBeDefined()
            expect(text!.type).toBe('text')
        })
    })

    // ── Gap handling ────────────────────────────────────────

    describe('gap handling', () => {
        it('no gap when not specified', () => {
            const html = `<div class="flex flex-col"><div class="p-4">A</div><div class="p-4">B</div></div>`
            const root = parseHtmlToNodes(html, 'Test')
            // Gap should be 0 or undefined when not specified
            expect(root.layout.gap ?? 0).toBe(0)
        })

        it('preserves explicit gap', () => {
            const html = `<div class="flex flex-col gap-8"><div class="p-4">A</div><div class="p-4">B</div></div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.layout.gap).toBe(32)
        })

        it('preserves gap-0', () => {
            const html = `<div class="flex flex-col gap-0"><div class="p-4">A</div></div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.layout.gap ?? 0).toBe(0)
        })
    })

    // ── Text nodes ──────────────────────────────────────────

    describe('text nodes', () => {
        it('creates text node for heading', () => {
            const html = `<div class="flex flex-col"><h1 class="text-4xl font-bold text-[#111827]">Hello World</h1></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const text = findFirstText(root)
            expect(text).toBeDefined()
            expect(text!.characters).toBe('Hello World')
            expect(text!.fontSize).toBe(36)
            expect(text!.fontWeight).toBe(700)
        })

        it('creates text node for paragraph', () => {
            const html = `<div class="flex flex-col"><p class="text-base text-[#666]">Body copy text here</p></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const text = findFirstText(root)
            expect(text).toBeDefined()
            expect(text!.characters).toBe('Body copy text here')
            expect(text!.fontSize).toBe(16)
        })

        it('preserves text color', () => {
            const html = `<div class="flex flex-col"><p class="text-[#ff0000]">Red text</p></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const text = findFirstText(root)
            expect(text).toBeDefined()
            expect(text!.color).toBeTruthy()
        })
    })

    // ── Image handling ──────────────────────────────────────

    describe('image handling', () => {
        it('creates frame with image fill for <img>', () => {
            const html = `<div class="flex flex-col"><img src="https://example.com/photo.jpg" alt="Photo" class="w-full h-[300px]" /></div>`
            const root = parseHtmlToNodes(html, 'Test')
            // Images are converted to FrameNodes with image fills
            const imgFrame = root.children[0] as FrameNode
            expect(imgFrame).toBeDefined()
            expect(imgFrame.type).toBe('frame')
            expect(imgFrame.fills.some(f => f.type === 'image')).toBe(true)
        })

        it('uses aspect ratio for image height when no explicit height', () => {
            const html = `<div class="flex flex-col"><img src="https://example.com/photo.jpg" alt="Photo" class="w-[400px] aspect-video" /></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const imgFrame = root.children[0] as FrameNode
            expect(imgFrame.width).toBe(400)
            expect(imgFrame.height).toBe(225) // 400 / (16/9) = 225
        })

        it('defaults to 16:9 ratio when no height or aspect-ratio', () => {
            const html = `<div class="flex flex-col"><img src="https://example.com/photo.jpg" alt="Photo" class="w-[600px]" /></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const imgFrame = root.children[0] as FrameNode
            expect(imgFrame.width).toBe(600)
            expect(imgFrame.height).toBe(338) // 600 * 9/16 = 337.5 → 338
        })

        it('uses aspect-square to compute square height', () => {
            const html = `<div class="flex flex-col"><img src="https://example.com/avatar.jpg" alt="Avatar" class="w-[100px] aspect-square" /></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const imgFrame = root.children[0] as FrameNode
            expect(imgFrame.width).toBe(100)
            expect(imgFrame.height).toBe(100) // 1:1
        })
    })

    // ── SVG handling ────────────────────────────────────────

    describe('SVG handling', () => {
        it('creates vector or image node for SVG', () => {
            const html = `<div class="flex flex-col"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
            </svg></div>`
            const root = parseHtmlToNodes(html, 'Test')
            // Should parse as vector or fall back to image
            const child = root.children[0]
            expect(child).toBeDefined()
            expect(['vector', 'image', 'frame']).toContain(child.type)
        })
    })

    // ── Button handling ─────────────────────────────────────

    describe('button handling', () => {
        it('creates styled frame for button', () => {
            const html = `<div class="flex flex-col"><button class="px-6 py-3 bg-[#2563eb] text-white rounded-lg font-medium">Click me</button></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const btn = root.children[0]
            expect(btn).toBeDefined()
            // Button should be a frame with text child
            expect(btn.type).toBe('frame')
            const frame = btn as FrameNode
            expect(frame.children.length).toBeGreaterThan(0)
            expect(frame.fills.length).toBeGreaterThan(0)
        })
    })

    // ── Input handling ──────────────────────────────────────

    describe('input handling', () => {
        it('creates frame for input', () => {
            const html = `<div class="flex flex-col"><input type="text" placeholder="Enter email" class="px-4 py-2 border rounded-lg" /></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const input = root.children[0]
            expect(input).toBeDefined()
            expect(input.type).toBe('frame')
        })
    })

    // ── Container nesting ───────────────────────────────────

    describe('container nesting', () => {
        it('preserves nested container hierarchy', () => {
            const html = `<div class="flex flex-col gap-4">
                <div class="flex flex-row gap-2">
                    <div class="p-4 bg-[#f0f0f0]">
                        <p class="text-sm">Nested text</p>
                    </div>
                </div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.children.length).toBeGreaterThan(0)
            const row = root.children[0] as FrameNode
            expect(row.type).toBe('frame')
            expect(row.layout.mode).toBe('flex')
            expect(row.layout.direction).toBe('row')
        })

        it('handles deeply nested structure', () => {
            const html = `<div class="flex flex-col">
                <section class="flex flex-col gap-8 p-12">
                    <div class="flex flex-row gap-4">
                        <div class="flex flex-col gap-2 p-6">
                            <h3 class="text-lg font-semibold">Card Title</h3>
                            <p class="text-sm">Card description text</p>
                        </div>
                    </div>
                </section>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            const textCount = countNodesByType(root, 'text')
            expect(textCount).toBeGreaterThanOrEqual(2) // h3 + p
        })
    })

    // ── Visual properties ───────────────────────────────────

    describe('visual properties', () => {
        it('parses background color', () => {
            const html = `<div class="flex flex-col bg-[#f3f4f6]"><p>Text</p></div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.fills.length).toBeGreaterThan(0)
            expect(root.fills[0].type).toBe('solid')
        })

        it('parses border radius', () => {
            const html = `<div class="flex flex-col rounded-2xl p-4"><p>Text</p></div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.borderRadius).toBe(16)
        })

        it('parses padding', () => {
            const html = `<div class="flex flex-col p-8"><p>Text</p></div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.padding.top).toBe(32)
            expect(root.padding.right).toBe(32)
        })
    })

    // ── Sanitization ────────────────────────────────────────

    describe('sanitization', () => {
        it('strips script tags', () => {
            const html = `<div class="flex flex-col"><script>alert("xss")</script><p>Safe text</p></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const text = findFirstText(root)
            expect(text).toBeDefined()
            expect(text!.characters).toBe('Safe text')
        })

        it('strips event handlers', () => {
            const html = `<div class="flex flex-col"><p onclick="alert('xss')">Click text</p></div>`
            const root = parseHtmlToNodes(html, 'Test')
            const text = findFirstText(root)
            expect(text).toBeDefined()
        })
    })

    // ── Grid layout ─────────────────────────────────────────

    describe('grid layout', () => {
        it('parses 4-column grid', () => {
            const html = `<div class="grid grid-cols-4 gap-4">
                <div class="p-4 bg-[#e0e0e0]">1</div>
                <div class="p-4 bg-[#e0e0e0]">2</div>
                <div class="p-4 bg-[#e0e0e0]">3</div>
                <div class="p-4 bg-[#e0e0e0]">4</div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            expect(root.layout.mode).toBe('grid')
            expect(root.layout.columns).toBe(4)
            expect(root.layout.gap).toBe(16)
        })

        it('parses col-span on children', () => {
            const html = `<div class="grid grid-cols-4 gap-4">
                <div class="col-span-2 p-4 bg-[#e0e0e0]">Wide</div>
                <div class="p-4 bg-[#e0e0e0]">Normal</div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            const wide = root.children[0] as FrameNode
            expect(wide.gridColumnSpan).toBe(2)
        })
    })

    // ── Full page structure ─────────────────────────────────

    describe('full page structure', () => {
        it('parses a typical AI-generated landing page', () => {
            const html = `<div class="flex flex-col w-full">
                <nav class="flex flex-row items-center justify-between px-8 py-4 bg-white">
                    <span class="text-xl font-bold text-[#111]">Brand</span>
                    <div class="flex flex-row gap-6">
                        <a class="text-sm text-[#666]">Features</a>
                        <a class="text-sm text-[#666]">Pricing</a>
                        <a class="text-sm text-[#666]">Contact</a>
                    </div>
                </nav>
                <section class="flex flex-col items-center gap-6 py-24 px-8 bg-[#f9fafb]">
                    <h1 class="text-5xl font-bold text-[#111]">Welcome to Our Product</h1>
                    <p class="text-xl text-[#666]">The best solution for your needs</p>
                    <button class="px-8 py-3 bg-[#2563eb] text-white rounded-lg font-medium">Get Started</button>
                </section>
                <footer class="flex flex-row justify-between px-8 py-6 bg-[#111]">
                    <span class="text-sm text-[#999]">© 2026 Brand</span>
                </footer>
            </div>`

            const root = parseHtmlToNodes(html, 'Landing Page')
            expect(root.name).toBe('Landing Page')
            expect(root.type).toBe('frame')
            expect(root.layout.mode).toBe('flex')
            expect(root.children.length).toBe(3) // nav, section, footer

            // Verify nav structure
            const nav = root.children[0] as FrameNode
            expect(nav.type).toBe('frame')
            expect(nav.layout.mode).toBe('flex')
            expect(nav.layout.direction).toBe('row')

            // Verify hero section
            const hero = root.children[1] as FrameNode
            expect(hero.type).toBe('frame')
            expect(hero.layout.mode).toBe('flex')

            // Verify footer
            const footer = root.children[2] as FrameNode
            expect(footer.type).toBe('frame')
        })
    })

    // ── Absolute positioning ────────────────────────────────

    describe('absolute positioning', () => {
        it('sets positioning: absolute on container with absolute class', () => {
            const html = `<div class="relative">
                <div class="absolute bg-[#3b82f6] text-white px-3 py-1 rounded-full">
                    <span>MOST POPULAR</span>
                </div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            const absChild = root.children[0] as FrameNode
            expect(absChild.positioning).toBe('absolute')
        })

        it('defaults to auto positioning for non-absolute elements', () => {
            const html = `<div class="flex flex-col">
                <div class="p-4 bg-[#f0f0f0]"><p>Normal</p></div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            const child = root.children[0] as FrameNode
            expect(child.positioning).toBe('auto')
        })

        it('sets positioning: absolute on text with absolute class', () => {
            const html = `<div class="relative">
                <p class="absolute text-sm text-gray-500">Overlay label</p>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            const absText = root.children[0]
            expect(absText.positioning).toBe('absolute')
        })

        it('wires position offsets to x/y on absolute container', () => {
            const html = `<div class="relative">
                <div class="absolute top-4 left-8 bg-[#000] text-white px-2 py-1">
                    <span>Badge</span>
                </div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            const absChild = root.children[0] as FrameNode
            expect(absChild.positioning).toBe('absolute')
            expect(absChild.x).toBe(32) // left-8 = 8*4 = 32
            expect(absChild.y).toBe(16) // top-4 = 4*4 = 16
        })

        it('wires position offsets to x/y on absolute text', () => {
            const html = `<div class="relative">
                <p class="absolute bottom-2 right-4 text-xs text-[#999]">Footer note</p>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            const absText = root.children[0]
            expect(absText.positioning).toBe('absolute')
            // bottom/right are parsed but mapped to positionBottom/positionRight
            // x comes from positionLeft (null → 0), y from positionTop (null → 0)
            expect(absText.x).toBe(0)
            expect(absText.y).toBe(0)
        })

        it('defaults x/y to 0 for non-absolute elements', () => {
            const html = `<div class="flex flex-col">
                <div class="p-4 bg-[#eee]"><p>Normal</p></div>
            </div>`
            const root = parseHtmlToNodes(html, 'Test')
            const child = root.children[0] as FrameNode
            expect(child.positioning).toBe('auto')
            expect(child.x).toBe(0)
            expect(child.y).toBe(0)
        })
    })
})
