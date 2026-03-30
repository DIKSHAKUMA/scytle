// ============================================================
// Export Node — DOM-based raster/vector export via html-to-image
//
// How the canvas renders nodes:
// - All sizes use:   calc(Npx * var(--z, 1))
// - Top-level left:  calc(Xpx * var(--z, 1) + var(--px, 0) * 1px)
// - Top-level top:   calc(Ypx * var(--z, 1) + var(--py, 0) * 1px)
//
// html-to-image clones the subtree and reads COMPUTED styles.
// At zoom != 1, computed "width: calc(1440px * 0.25)" = "360px",
// which gets baked into the clone → tiny content in a 1440px canvas.
//
// Fix: Clone the target element into an OFF-SCREEN container that
// has --z=1, --px=0, --py=0. This makes all calc() expressions
// evaluate at true 1x dimensions. Then capture the clone.
// The live canvas is NEVER modified → no visual glitch.
// ============================================================

import { toPng, toJpeg, toSvg } from 'html-to-image'
import type { ScytleNode, FrameNode } from '@/types/canvas'
import { nodeToHtml, pageFrameToHtml } from './nodes-to-html'
import { wrapInDocument } from './html-template'

// ── Types ────────────────────────────────────────────────────

export type ExportFormat = 'PNG' | 'JPG' | 'SVG' | 'HTML'

export interface ExportConfig {
    id: string
    format: ExportFormat
    scale: number      // 0.5, 1, 1.5, 2, 3, 4
    suffix: string     // e.g. '@2x', appended before extension
}

export interface ExportResult {
    blob: Blob
    filename: string
}

// ── Defaults ─────────────────────────────────────────────────

export const DEFAULT_EXPORT_CONFIG: Omit<ExportConfig, 'id'> = {
    format: 'PNG',
    scale: 1,
    suffix: '',
}

export const FORMAT_OPTIONS: { value: ExportFormat; label: string }[] = [
    { value: 'PNG', label: 'PNG' },
    { value: 'JPG', label: 'JPG' },
    { value: 'SVG', label: 'SVG' },
    { value: 'HTML', label: 'HTML' },
]

export const SCALE_OPTIONS = [
    { value: '0.5', label: '0.5x' },
    { value: '1', label: '1x' },
    { value: '1.5', label: '1.5x' },
    { value: '2', label: '2x' },
    { value: '3', label: '3x' },
    { value: '4', label: '4x' },
]

// ── Filename builder ─────────────────────────────────────────

function buildFilename(nodeName: string, config: ExportConfig): string {
    const safe = nodeName.replace(/[/\\?%*:|"<>]/g, '-').trim() || 'export'
    const ext = config.format.toLowerCase()
    return `${safe}${config.suffix}.${ext}`
}

// ── Find DOM element for a node ──────────────────────────────

function findNodeElement(nodeId: string): HTMLElement | null {
    return document.querySelector(`[data-node-id="${nodeId}"]`)
}

// ── Filter: skip editor chrome (selection, tooltips, etc.) ───

function exportFilter(domNode: HTMLElement): boolean {
    if (domNode.nodeType !== 1) return true
    if (domNode.dataset?.selectionOverlay) return false
    if (domNode.classList?.contains('selection-box')) return false
    return true
}

// ── Off-screen clone for 1x capture ──────────────────────────
// Instead of mutating the live viewport (which causes glitch + empty
// exports), we deep-clone the target into an invisible container
// with --z=1, --px=0, --py=0. All calc() expressions resolve at 1x.

async function createOffscreenClone(
    sourceEl: HTMLElement,
    node: ScytleNode,
): Promise<{ wrapper: HTMLElement; clone: HTMLElement }> {
    // Copy ALL stylesheets into the off-screen context so computed
    // styles (fonts, custom properties, etc.) resolve identically.
    // html-to-image walks getComputedStyle on the SOURCE element's
    // tree — but we're giving it our CLONE, so the clone must live
    // in a context that inherits the same CSS variables.

    const wrapper = document.createElement('div')
    wrapper.style.cssText = [
        'position: fixed',
        'left: -99999px',
        'top: -99999px',
        `width: ${node.width}px`,
        `height: ${node.height}px`,
        'overflow: hidden',
        'pointer-events: none',
        'z-index: -1',
        // Force 1x scale, no pan — this is the key fix
        '--z: 1',
        '--px: 0',
        '--py: 0',
    ].join('; ')

    // Deep-clone the target element (with all children)
    const clone = sourceEl.cloneNode(true) as HTMLElement

    // Reset the clone's position so it renders at 0,0 inside the wrapper.
    // The original has left: calc(Xpx * var(--z) + var(--px) * 1px)
    // With --z=1 and --px=0, that becomes X px. We need 0,0.
    clone.style.position = 'relative'
    clone.style.left = '0'
    clone.style.top = '0'
    // Ensure the clone has explicit 1x dimensions (not calc-based)
    clone.style.width = `${node.width}px`
    clone.style.height = `${node.height}px`

    wrapper.appendChild(clone)
    document.body.appendChild(wrapper)

    // Wait for one animation frame so the browser computes layout
    await new Promise<void>((resolve) => requestAnimationFrame(() => {
        // Double-rAF ensures layout + paint are both flushed
        requestAnimationFrame(() => resolve())
    }))

    return { wrapper, clone }
}

function removeOffscreenClone(wrapper: HTMLElement) {
    wrapper.remove()
}

// ── Shared html-to-image options builder ─────────────────────

function buildOptions(node: ScytleNode, scale: number, extra?: Record<string, unknown>) {
    return {
        width: node.width,
        height: node.height,
        pixelRatio: scale,
        skipFonts: true,
        filter: exportFilter,
        ...extra,
    }
}

// ── Core export pipeline ─────────────────────────────────────

async function captureRaster(
    node: ScytleNode,
    el: HTMLElement,
    format: 'PNG' | 'JPG',
    scale: number,
): Promise<Blob> {
    const options = buildOptions(node, scale, {
        backgroundColor: format === 'JPG' ? '#ffffff' : undefined,
    })

    if (format === 'PNG') {
        const dataUrl = await toPng(el, options)
        return dataUrlToBlob(dataUrl)
    } else {
        const dataUrl = await toJpeg(el, { ...options, quality: 0.95 })
        return dataUrlToBlob(dataUrl)
    }
}

async function captureSvg(node: ScytleNode, el: HTMLElement): Promise<Blob> {
    const options = buildOptions(node, 1)
    const dataUrl = await toSvg(el, options)
    const svgXml = decodeURIComponent(dataUrl.split(',')[1] || '')
    return new Blob([svgXml], { type: 'image/svg+xml' })
}

function captureHtml(node: ScytleNode): Blob {
    const html = node.type === 'frame'
        ? wrapInDocument(pageFrameToHtml(node as FrameNode), node.name)
        : wrapInDocument(nodeToHtml(node), node.name)
    return new Blob([html], { type: 'text/html' })
}

// ── Public API ───────────────────────────────────────────────

/**
 * Export a single node with the given config.
 * Creates an off-screen clone at 1x scale for accurate capture.
 * The live canvas is never modified — no visual glitch.
 */
export async function exportNode(
    node: ScytleNode,
    config: ExportConfig,
): Promise<ExportResult> {
    const filename = buildFilename(node.name, config)

    if (config.format === 'HTML') {
        return { blob: captureHtml(node), filename }
    }

    const el = findNodeElement(node.id)
    if (!el) {
        throw new Error(`Cannot find rendered element for node "${node.name}"`)
    }

    // Create off-screen clone with --z=1 for accurate 1x capture
    const { wrapper, clone } = await createOffscreenClone(el, node)

    let blob: Blob
    try {
        switch (config.format) {
            case 'PNG':
            case 'JPG':
                blob = await captureRaster(node, clone, config.format, config.scale)
                break
            case 'SVG':
                blob = await captureSvg(node, clone)
                break
            default:
                throw new Error(`Unsupported format: ${config.format}`)
        }
    } finally {
        // Always clean up the off-screen clone
        removeOffscreenClone(wrapper)
    }

    return { blob, filename }
}

/**
 * Export a node with multiple configs (like Figma's multi-export).
 */
export async function exportNodeMulti(
    node: ScytleNode,
    configs: ExportConfig[],
): Promise<ExportResult[]> {
    const results: ExportResult[] = []
    for (const config of configs) {
        results.push(await exportNode(node, config))
    }
    return results
}

/**
 * Trigger browser download for a blob.
 */
export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Quick export: export node with given config and immediately download.
 */
export async function quickExport(
    node: ScytleNode,
    config: ExportConfig,
): Promise<void> {
    const { blob, filename } = await exportNode(node, config)
    downloadBlob(blob, filename)
}

// ── Helpers ──────────────────────────────────────────────────

function dataUrlToBlob(dataUrl: string): Blob {
    const [header, base64] = dataUrl.split(',')
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png'
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return new Blob([bytes], { type: mime })
}
