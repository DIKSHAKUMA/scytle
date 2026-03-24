/**
 * Test SVG icon parsing - checks if icons become VectorNode or fall back to ImageFill FrameNode.
 * Run via: npx vitest run scripts/test-svg-icons.ts
 */
import { describe, it, expect } from 'vitest'
import { parseHtmlToNodes } from '@/lib/parser/html-to-nodes'
import type { FrameNode, ScytleNode } from '@/types/canvas'

function findSvgChild(node: ScytleNode): ScytleNode | null {
  if (node.type === 'vector') return node
  if (node.type === 'frame') {
    const frame = node as FrameNode
    if (frame.fills?.some(f => f.type === 'image') && frame.children?.length === 0) return frame
    for (const child of frame.children || []) {
      const found = findSvgChild(child)
      if (found) return found
    }
  }
  return null
}

function printTree(n: ScytleNode, depth = 0) {
  const indent = '  '.repeat(depth)
  const extra = n.type === 'frame' ? ` fills=${(n as FrameNode).fills?.map(f => f.type).join(',')}` : ''
  console.log(`${indent}${n.type} "${n.name}" ${n.width}x${n.height}${extra}`)
  if (n.type === 'frame') {
    for (const c of (n as FrameNode).children || []) printTree(c, depth + 1)
  }
}

describe('SVG Icon Parsing', () => {
  it('1. Lucide Check (path-only) → should be VectorNode', () => {
    const html = `<div class="flex items-center gap-2 text-gray-700">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
      <span>Feature item</span>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    console.log('  Tree:'); printTree(root, 2)
    expect(svgNode).toBeTruthy()
    console.log(`  → type=${svgNode!.type}, name=${svgNode!.name}, size=${svgNode!.width}x${svgNode!.height}`)
    if (svgNode!.type === 'vector') {
      const v = svgNode as any
      console.log(`  → vertices=${v.vectorNetwork.vertices.length}, segments=${v.vectorNetwork.segments.length}`)
      console.log(`  → stroke=${v.strokeColor}, fills=${JSON.stringify(v.fills)}`)
    } else {
      console.log(`  → ⚠️ FELL BACK TO IMAGE FILL`)
    }
  })

  it('2. Lucide Info (circle+path) → expect ImageFill fallback', () => {
    const html = `<div class="flex items-center gap-2 text-blue-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4"/>
        <path d="M12 8h.01"/>
      </svg>
      <span>Info text</span>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    console.log('  Tree:'); printTree(root, 2)
    expect(svgNode).toBeTruthy()
    console.log(`  → type=${svgNode!.type}, name=${svgNode!.name}`)
    // circle + path → no <path> fallback or paths only, depends on impl
  })

  it('3. Lucide Star (complex path) → should be VectorNode', () => {
    const html = `<div class="flex gap-2 text-yellow-500">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
      <span>5 stars</span>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    console.log('  Tree:'); printTree(root, 2)
    expect(svgNode).toBeTruthy()
    console.log(`  → type=${svgNode!.type}`)
    if (svgNode!.type === 'vector') {
      const v = svgNode as any
      console.log(`  → vertices=${v.vectorNetwork.vertices.length}`)
    }
  })

  it('4. Heroicons Heart (filled, complex path) → should be VectorNode', () => {
    const html = `<div class="text-red-500">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6">
        <path fill-rule="evenodd" d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" clip-rule="evenodd" />
      </svg>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    console.log('  Tree:'); printTree(root, 2)
    expect(svgNode).toBeTruthy()
    console.log(`  → type=${svgNode!.type}`)
    if (svgNode!.type === 'vector') {
      const v = svgNode as any
      console.log(`  → fills=${JSON.stringify(v.fills)}`)
      console.log(`  → stroke=${v.strokeColor}, visible=${v.strokeVisible}`)
    }
  })

  it('5. Lucide Mail (rect+path) → expect ImageFill fallback', () => {
    const html = `<div class="text-gray-600">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    console.log('  Tree:'); printTree(root, 2)
    expect(svgNode).toBeTruthy()
    console.log(`  → type=${svgNode!.type}`)
  })

  it('6. Arrow Right (multi-path) → should be VectorNode', () => {
    const html = `<div class="text-gray-800">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14"/>
        <path d="m12 5 7 7-7 7"/>
      </svg>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    console.log('  Tree:'); printTree(root, 2)
    expect(svgNode).toBeTruthy()
    console.log(`  → type=${svgNode!.type}`)
    if (svgNode!.type === 'vector') {
      const v = svgNode as any
      console.log(`  → vertices=${v.vectorNetwork.vertices.length}, segments=${v.vectorNetwork.segments.length}`)
    }
  })

  it('7. Icon inside button with text', () => {
    const html = `<div class="flex">
      <a class="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"/>
          <path d="m12 5 7 7-7 7"/>
        </svg>
        Get Started
      </a>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    console.log('  Tree:'); printTree(root, 2)
    const svgNode = findSvgChild(root)
    expect(svgNode).toBeTruthy()
    console.log(`  → SVG type=${svgNode!.type}, name=${svgNode!.name}`)
  })

  // ── Shape-to-path conversion ──────────────────────────────

  it('8. Circle + path icon → VectorNode with correct dimensions', () => {
    const html = `<div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M8 12l3 3 5-6"/>
      </svg>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    expect(svgNode).toBeTruthy()
    expect(svgNode!.type).toBe('vector')
    expect(svgNode!.width).toBeGreaterThan(10)
    expect(svgNode!.height).toBeGreaterThan(10)
  })

  it('9. Rect element → converted to path in VectorNode', () => {
    const html = `<div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
      </svg>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    expect(svgNode).toBeTruthy()
    expect(svgNode!.type).toBe('vector')
    expect(svgNode!.width).toBeGreaterThan(10)
  })

  it('10. Ellipse + line icon → VectorNode', () => {
    const html = `<div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <ellipse cx="12" cy="12" rx="10" ry="6"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
      </svg>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    expect(svgNode).toBeTruthy()
    expect(svgNode!.type).toBe('vector')
  })

  it('11. Polygon (star) → VectorNode with correct structure', () => {
    const html = `<div>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12,2 15,9 22,9 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9 9,9"/>
      </svg>
    </div>`
    const root = parseHtmlToNodes(html, 'Test')
    const svgNode = findSvgChild(root)
    expect(svgNode).toBeTruthy()
    expect(svgNode!.type).toBe('vector')
    expect(svgNode!.width).toBeGreaterThan(10)
  })
})
