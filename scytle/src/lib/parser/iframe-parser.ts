/**
 * Iframe-Based HTML → ScytleNode Parser
 *
 * Replaces the heuristic-based class-parser + html-to-nodes pipeline with a
 * browser-rendered approach. The AI-generated HTML is injected into a hidden
 * iframe with Tailwind CDN, then getComputedStyle() and getBoundingClientRect()
 * provide pixel-perfect values for every element.
 *
 * Pipeline:
 *   AI HTML → iframe render → getComputedStyle/getBoundingClientRect
 *          → walkRenderedElement → relinkNodes → ScytleNode tree
 *
 * Called from:
 *   - generate-page.ts (page generation)
 *   - chat-tab.tsx (refine / chat actions)
 */

import { generateId } from '@/lib/utils'
import {
    createFrame, createText, createImage, createVector,
    type FrameNode, type TextNode, type ImageNode, type VectorNode,
    type ScytleNode, type Fill, type Border, type Shadow,
    type Layout, type Padding, type Sizing, type BorderRadius,
} from '@/types/canvas'
import { IframeRenderer, type IframeRendererOptions } from './iframe-renderer'
import {
    buildLinkMaps, normalizeHex, normalizeShadow,
    type LinkMaps, type VariableTable, type ThemeMode,
} from '@/lib/theme/variable-table'
import { relinkNodes } from '@/lib/theme/relink-nodes'
import { parseSvgToNetwork, computeBoundingBox, normalizeNetwork } from './svg-path-parser'
import { parseHtmlToNodes } from './html-to-nodes'

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface IframeParserOptions {
    rootWidth?: number
    variableTable?: VariableTable
    themeMode?: ThemeMode
    fonts?: string[]
}

// ═══════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════

const SKIP_TAGS = new Set([
    'script', 'style', 'noscript', 'meta', 'link', 'head', 'template',
    'br', 'wbr',
])

const TEXT_ONLY_TAGS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'label'])

const INLINE_TAGS = new Set([
    'span', 'strong', 'em', 'b', 'i', 'a', 'code', 'small', 'sub', 'sup',
    'mark', 'abbr', 'cite', 'time', 'del', 'ins', 'kbd', 'var', 'u',
])

const HTML_TAG_MAP: Record<string, TextNode['htmlTag']> = {
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
    p: 'p', span: 'span', a: 'a', li: 'li',
}

const SEMANTIC_NAMES: Record<string, string> = {
    nav: 'Nav', header: 'Header', footer: 'Footer',
    main: 'Main', aside: 'Sidebar', section: 'Section',
    article: 'Article', form: 'Form', button: 'Button',
    ul: 'List', ol: 'List', figure: 'Figure',
}

// ═══════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════

/**
 * Parse HTML into a ScytleNode tree using a hidden iframe for real browser layout.
 *
 * This is the ASYNC replacement for parseHtmlToNodes(). It:
 *   1. Renders HTML in a hidden iframe with Tailwind CSS
 *   2. Walks the rendered DOM, reading getComputedStyle() + getBoundingClientRect()
 *   3. Builds ScytleNodes with real values (no heuristics)
 *   4. Runs two-phase theme linking (exact-match + semantic relink)
 *   5. Cleans up the iframe
 *
 * Falls back to the legacy sync parser if the iframe approach fails.
 */
export async function parseHtmlToNodesViaIframe(
    html: string,
    pageName: string = 'Page',
    options?: IframeParserOptions,
): Promise<FrameNode> {
    const renderer = new IframeRenderer()

    try {
        const width = options?.rootWidth ?? 1440

        renderer.create({ width })

        const doc = await renderer.render(html, {
            width,
            fonts: options?.fonts,
        })

        const win = doc.defaultView
        if (!win) {
            throw new Error('IframeParser: No window context available')
        }

        // Build link maps for single-pass exact-match linking
        const lm = options?.variableTable && options?.themeMode
            ? buildLinkMaps(options.variableTable, options.themeMode)
            : undefined

        // Find the root element — typically the AI's wrapper <div>
        const rootEl = doc.body.firstElementChild as HTMLElement
        if (!rootEl) {
            // Empty HTML — return empty page frame
            return createEmptyPageFrame(pageName, width)
        }

        // Walk the rendered DOM tree → ScytleNode tree
        const rootChildren: ScytleNode[] = []

        // If root is a single wrapper div, walk its children as page sections
        // Otherwise, walk body children directly
        const walkRoot = rootEl
        const rootCs = win.getComputedStyle(walkRoot)
        const rootRect = walkRoot.getBoundingClientRect()

        // Check if root is a simple wrapper (no visual properties) with section children
        const isSimpleWrapper = !hasVisualProperties(rootCs) &&
            walkRoot.children.length > 0

        if (isSimpleWrapper) {
            // Walk children of the wrapper as top-level page sections
            for (const child of walkRoot.children) {
                // Use nodeType check instead of instanceof — instanceof fails
                // across frame boundaries (iframe elements have different constructors)
                if (child.nodeType === Node.ELEMENT_NODE) {
                    const node = walkRenderedElement(child as HTMLElement, win, walkRoot, lm)
                    if (node) rootChildren.push(node)
                }
            }
        } else {
            // The root element itself is the content — walk it
            const node = walkRenderedElement(walkRoot, win, null, lm)
            if (node) rootChildren.push(node)
        }

        // Build the page frame
        // Only apply root fills to the page frame when root was unwrapped (isSimpleWrapper).
        // When root has visual properties and is walked as a child, its fills are on
        // the child node — putting them on the page frame too would double the background.
        const pageFrame = createFrame({
            id: generateId(),
            name: pageName,
            width,
            height: rootRect.height || doc.body.scrollHeight,
            children: rootChildren,
            layout: {
                mode: 'flex',
                direction: 'column',
                gap: 0,
            },
            sizing: { horizontal: 'fixed', vertical: 'hug' },
            fills: isSimpleWrapper ? extractFills(rootCs) : [],
        })

        // Assign sequential Y positions to children based on their layout
        assignChildPositions(pageFrame)

        // CRITICAL: Run semantic relinker AFTER building the full tree
        // This fills in any refs that exact-match linking missed
        if (options?.variableTable && options?.themeMode) {
            relinkNodes(
                pageFrame.children,
                options.variableTable,
                options.themeMode,
            )
        }

        return pageFrame
    } catch (error) {
        // Fallback to legacy parser
        console.warn('[IframeParser] Failed, falling back to legacy parser:', error)
        const frame = parseHtmlToNodes(html, pageName, {
            rootWidth: options?.rootWidth,
            variableTable: options?.variableTable,
            themeMode: options?.themeMode,
        })
        if (options?.variableTable && options?.themeMode) {
            relinkNodes(frame.children, options.variableTable, options.themeMode)
        }
        return frame
    } finally {
        // ALWAYS clean up the iframe
        renderer.destroy()
    }
}

// ═══════════════════════════════════════════════════
// Core Walker
// ═══════════════════════════════════════════════════

/**
 * Recursively walk a rendered DOM element and build a ScytleNode.
 *
 * This replaces walkElement() + parseClasses() + all buildXxxNode() functions.
 * Instead of parsing Tailwind classes, it reads real computed values.
 */
function walkRenderedElement(
    el: HTMLElement,
    win: Window,
    parentEl: HTMLElement | null,
    lm?: LinkMaps,
): ScytleNode | null {
    const tag = el.tagName.toLowerCase()

    // Skip non-visual elements
    if (SKIP_TAGS.has(tag)) return null

    const cs = win.getComputedStyle(el)

    // Skip hidden elements
    if (cs.display === 'none' || cs.visibility === 'collapse') return null

    const rect = el.getBoundingClientRect()

    // Skip zero-size elements with no children and no text
    if (rect.width === 0 && rect.height === 0 &&
        el.children.length === 0 && !el.textContent?.trim()) {
        return null
    }

    // ── Dispatch by element type ──

    // Images
    if (tag === 'img') return buildImageNodeFromComputed(el as HTMLImageElement, cs, rect)

    // SVGs — three-tier handling
    if (tag === 'svg') return buildSvgNodeFromComputed(el as unknown as SVGSVGElement, cs, rect, win)

    // Media placeholders
    if (tag === 'video' || tag === 'iframe') return buildMediaPlaceholder(el, cs, rect, tag)

    // Form elements
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return buildInputNodeFromComputed(el as HTMLInputElement, cs, rect, tag, lm)
    }

    // HR dividers
    if (tag === 'hr') return buildDividerNode(el, cs, rect)

    // Text-only elements (no block-level children, only text content)
    // BUT: if the element has visual properties (bg, border, padding, radius),
    // it must be a container (FrameNode) with a text child — not a plain TextNode.
    // Example: <button class="px-3 py-1.5 bg-blue-600 text-white rounded-lg">Buy Now</button>
    if (isTextOnlyElement(el, tag, win) && !hasVisualProperties(cs)) {
        return buildTextNodeFromComputed(el, cs, rect, tag, lm, win)
    }

    // Container elements (has element children or is a layout container)
    return buildContainerNodeFromComputed(el, cs, rect, tag, win, lm)
}

// ═══════════════════════════════════════════════════
// Node Builders — from Computed Styles
// ═══════════════════════════════════════════════════

/**
 * Build a TextNode from computed styles.
 *
 * Key differences from legacy buildTextNode():
 * - width/height from getBoundingClientRect() — no CHAR_WIDTH_RATIO guessing
 * - fontSize/fontWeight/lineHeight from getComputedStyle() — no Tailwind class lookup
 * - color from computed style (includes CSS inheritance) — no resolveColor() heuristic
 */
function buildTextNodeFromComputed(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    tag: string,
    lm?: LinkMaps,
    win?: Window,
): TextNode {
    const text = extractTextContent(el, cs)
    const color = rgbToHex(cs.color)
    const fontFamily = extractPrimaryFont(cs.fontFamily)
    const fontSize = parseFloat(cs.fontSize) || 16
    const fontWeight = parseInt(cs.fontWeight) || 400
    const htmlTag = inferHtmlTag(tag)

    return createText({
        id: generateId(),
        name: text.slice(0, 40) || tag,
        x: 0,
        y: 0,
        width: Math.max(rect.width, 1),
        height: Math.max(rect.height, 1),
        characters: text,
        htmlTag,

        // Typography — all from getComputedStyle, no guessing
        fontSize,
        fontWeight,
        fontFamily,
        fontStyle: cs.fontStyle === 'italic' ? 'italic' : undefined,
        lineHeight: cs.lineHeight === 'normal'
            ? 'auto'
            : parseFloat(cs.lineHeight),
        letterSpacing: cs.letterSpacing === 'normal'
            ? 0
            : parseFloat(cs.letterSpacing),
        textAlign: mapTextAlign(cs.textAlign),
        textTransform: mapTextTransform(cs.textTransform),
        textDecoration: parseTextDecoration(cs.textDecorationLine),
        color,

        // Auto-resize behavior based on context
        autoResize: inferAutoResize(tag, cs),

        // Text truncation
        ...(cs.textOverflow === 'ellipsis' ? {
            autoResize: 'none' as const,
            textTruncation: 'ending' as const,
            maxLines: inferMaxLines(cs),
        } : {}),

        // Sizing — determined by display context
        sizing: inferTextSizing(tag, cs, el, win),

        // Base properties
        opacity: parseFloat(cs.opacity) || 1,
        rotation: 0,
        overflow: 'visible',
        borderRadius: 0,
        fills: [],
        shadows: [],
        positioning: cs.position === 'absolute' || cs.position === 'fixed' ? 'absolute' : 'auto',
        margin: extractMargin(cs),
        autoMargin: win ? extractAutoMargin(el, win) : undefined,

        // Theme variable refs (exact-match from LinkMaps)
        colorRef: lm ? matchColor(color, lm) : undefined,
        fontFamilyRef: lm ? matchFont(fontFamily, lm) : undefined,
        fontSizeRef: lm ? matchFontSize(fontSize, lm) : undefined,
        fontWeightRef: lm ? matchFontWeight(fontWeight, lm) : undefined,
    })
}

/**
 * Build a FrameNode from computed styles.
 *
 * Key differences from legacy buildContainerNode():
 * - All dimensions from getBoundingClientRect()
 * - Layout mode from computed display/flex-direction, not class inference
 * - Colors from computed backgroundColor, not Tailwind class mapping
 */
function buildContainerNodeFromComputed(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    tag: string,
    win: Window,
    lm?: LinkMaps,
): FrameNode {
    // Recursively walk children
    const children: ScytleNode[] = []
    for (const child of el.children) {
        // Use nodeType instead of instanceof — instanceof fails across iframe boundaries
        if (child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as HTMLElement
            const node = walkRenderedElement(childEl, win, el, lm)
            if (node) {
                // For absolutely positioned children, compute position relative to parent's padding box.
                // In CSS, absolute positioning is relative to the containing block's padding edge.
                // getBoundingClientRect() gives border-box positions, so we subtract the parent's
                // border width to get the position relative to the padding box.
                if (node.positioning === 'absolute') {
                    const childRect = childEl.getBoundingClientRect()
                    const borderLeft = parseFloat(cs.borderLeftWidth) || 0
                    const borderTop = parseFloat(cs.borderTopWidth) || 0
                    node.x = childRect.left - rect.left - borderLeft
                    node.y = childRect.top - rect.top - borderTop
                }
                children.push(node)
            }
        }
    }

    // Handle mixed content (element children + inline text)
    // If container has text-only content not caught by isTextOnlyElement
    if (children.length === 0 && el.textContent?.trim()) {
        const textNode = buildTextNodeFromComputed(el, cs, rect, tag, lm, win)
        if (hasVisualProperties(cs)) {
            // Wrap text inside the visual container
            children.push(textNode)
        } else {
            // Promote to plain text node (no visual container needed)
            return textNode as unknown as FrameNode
        }
    }

    // Extract computed properties
    const layout = extractLayout(cs)
    const padding = extractPadding(cs)
    const fills = extractFills(cs)
    const border = extractBorder(cs)
    const borderRadius = extractBorderRadius(cs)
    const shadows = extractShadows(cs.boxShadow)

    // Link fills to theme variables (exact-match)
    if (lm) {
        for (const fill of fills) {
            if (fill.type === 'solid' && 'color' in fill && fill.color) {
                (fill as { colorRef?: string }).colorRef = matchColor(fill.color, lm)
            }
        }
    }

    const maxPad = Math.max(padding.top, padding.right, padding.bottom, padding.left)

    const frame = createFrame({
        id: generateId(),
        name: inferNodeName(el, tag, children),
        x: 0,
        y: 0,
        width: Math.max(rect.width, 1),
        height: Math.max(rect.height, 1),
        children,

        // Layout — from computed styles, no inference needed
        layout: {
            ...layout,
            gapRef: lm && layout.gap ? matchSpacing(layout.gap, lm) : undefined,
        },

        // Spacing — from computed styles
        padding,
        paddingRef: lm ? matchSpacing(maxPad, lm) : undefined,

        // Visual — from computed styles
        fills,
        border,
        borderRadius,
        borderRadiusRef: lm ? matchRadius(borderRadius, lm) : undefined,
        shadows,
        shadowRef: lm && shadows.length > 0 ? matchShadow(shadows, lm) : undefined,
        opacity: parseFloat(cs.opacity) || 1,
        overflow: (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden')
            ? 'hidden'
            : 'visible',
        rotation: 0,

        // Sizing
        sizing: inferContainerSizing(el, cs, win),
        positioning: cs.position === 'absolute' || cs.position === 'fixed' ? 'absolute' : 'auto',

        // Min/max constraints
        ...extractMinMaxConstraints(cs),

        // Flex child properties
        ...(cs.flexGrow !== '0' && cs.flexGrow !== '' ? { layoutGrow: parseFloat(cs.flexGrow) } : {}),
        ...(cs.flexShrink !== '1' && cs.flexShrink !== '' ? { flexShrink: parseFloat(cs.flexShrink) } : {}),
        ...(cs.flexBasis !== 'auto' && cs.flexBasis !== '0px' && cs.flexBasis !== ''
            ? { flexBasis: parseFloat(cs.flexBasis) }
            : {}),

        // Grid child
        ...(cs.gridColumnEnd && cs.gridColumnEnd !== 'auto' ? {
            gridColumnSpan: parseGridSpan(cs.gridColumnStart, cs.gridColumnEnd),
        } : {}),
        ...(cs.gridRowEnd && cs.gridRowEnd !== 'auto' ? {
            gridRowSpan: parseGridSpan(cs.gridRowStart, cs.gridRowEnd),
        } : {}),

        // Margins
        margin: extractMargin(cs),
        autoMargin: extractAutoMargin(el, win),
    })

    // Assign child positions within this frame
    assignChildPositions(frame)

    return frame
}

/**
 * Build an ImageNode from a computed <img> element.
 */
function buildImageNodeFromComputed(
    el: HTMLImageElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
): ScytleNode {
    const src = el.src || el.getAttribute('data-src') || ''
    const alt = el.alt || ''
    const width = rect.width || parseInt(el.getAttribute('width') || '') || 300
    const height = rect.height || parseInt(el.getAttribute('height') || '') || 200

    // Handle aspect-ratio CSS property
    let finalHeight = height
    if (cs.aspectRatio && cs.aspectRatio !== 'auto' && rect.height === 0 && width > 0) {
        const parts = cs.aspectRatio.split('/')
        if (parts.length === 2) {
            const ratio = parseFloat(parts[0]) / parseFloat(parts[1])
            if (ratio > 0) finalHeight = width / ratio
        }
    }

    // If the image has a real src, use ImageFill on a FrameNode (Figma pattern)
    if (src && !src.startsWith('data:') && src !== '') {
        return createFrame({
            id: generateId(),
            name: alt || 'Image',
            width,
            height: finalHeight,
            fills: [{
                type: 'image',
                id: generateId(),
                src,
                fit: mapObjectFit(cs.objectFit) as 'cover' | 'contain' | 'fill' | 'tile' | 'crop',
                visible: true,
                opacity: 1,
            }],
            sizing: { horizontal: 'fill', vertical: 'fixed' },
            borderRadius: extractBorderRadius(cs),
            opacity: parseFloat(cs.opacity) || 1,
            overflow: 'hidden',
            children: [],
            layout: { mode: 'none' },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
        })
    }

    // Placeholder image
    return createImage({
        id: generateId(),
        name: alt || 'Image',
        width,
        height: finalHeight,
        src: '',
        alt: alt || 'Image placeholder',
        fit: 'cover',
        isPlaceholder: true,
        placeholderLabel: alt || 'Image',
        sizing: { horizontal: 'fill', vertical: 'fixed' },
        borderRadius: extractBorderRadius(cs),
        opacity: parseFloat(cs.opacity) || 1,
    })
}

// ═══════════════════════════════════════════════════
// SVG Handling — Three-Tier Strategy
// ═══════════════════════════════════════════════════

/**
 * Build a ScytleNode from an SVG element.
 *
 * Three-tier strategy:
 *   1. Simple icons (≤8 paths, no masks/clips/gradients) → VectorNode
 *   2. Failed conversion → data URI ImageFill on FrameNode
 *   3. Complex SVGs → data URI ImageFill directly
 */
function buildSvgNodeFromComputed(
    el: SVGSVGElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    win: Window,
): ScytleNode {
    const width = rect.width || parseFloat(el.getAttribute('width') || '24')
    const height = rect.height || parseFloat(el.getAttribute('height') || '24')

    // Check SVG complexity
    const paths = el.querySelectorAll('path, circle, rect, ellipse, line, polygon, polyline')
    const hasComplexFeatures = el.querySelector(
        'mask, clipPath, linearGradient, radialGradient, use, filter, pattern, image'
    )

    // Simple icons → try VectorNode conversion
    if (paths.length > 0 && paths.length <= 8 && !hasComplexFeatures) {
        try {
            const network = parseSvgToNetwork(el)
            if (network && network.vertices.length > 0) {
                return buildVectorNodeFromNetwork(el, network, width, height, cs)
            }
        } catch {
            // Fall through to data URI fallback
        }
    }

    // Complex SVGs or failed conversion → data URI image
    return buildSvgAsDataUri(el, width, height, cs)
}

/**
 * Build a VectorNode from a successfully parsed SVG network.
 */
function buildVectorNodeFromNetwork(
    el: SVGSVGElement,
    network: ReturnType<typeof parseSvgToNetwork>,
    width: number,
    height: number,
    cs: CSSStyleDeclaration,
): VectorNode {
    // Normalize network coordinates to start at (0,0)
    const offset = normalizeNetwork(network)
    const bbox = computeBoundingBox(network)

    // Resolve fill color (handle currentColor via computed style)
    const fillColor = resolveCurrentColor(el, cs)

    return createVector({
        id: generateId(),
        name: inferSvgName(el),
        width: bbox.width || width,
        height: bbox.height || height,
        vectorNetwork: network,
        positioning: 'auto',
        fills: fillColor ? [{
            type: 'solid',
            id: generateId(),
            color: fillColor,
            opacity: 1,
            visible: true,
        }] : [],
        strokeColor: rgbToHex(cs.stroke || '#000000'),
        strokeWeight: parseFloat(cs.strokeWidth || '0') || 0,
        strokeVisible: parseFloat(cs.strokeWidth || '0') > 0,
        opacity: parseFloat(cs.opacity) || 1,
    })
}

/**
 * Build a FrameNode with a data URI ImageFill for complex SVGs.
 * Preserves visual fidelity for SVGs that can't be converted to VectorNetwork.
 */
function buildSvgAsDataUri(
    el: SVGSVGElement,
    width: number,
    height: number,
    cs: CSSStyleDeclaration,
): FrameNode {
    // Clone and prepare SVG for serialization
    const clone = el.cloneNode(true) as SVGSVGElement

    // Ensure viewBox is set for proper scaling
    if (!clone.getAttribute('viewBox')) {
        clone.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }

    // Set explicit dimensions
    clone.setAttribute('width', String(width))
    clone.setAttribute('height', String(height))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    const svgString = new XMLSerializer().serializeToString(clone)
    const dataUri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgString)}`

    return createFrame({
        id: generateId(),
        name: inferSvgName(el),
        width,
        height,
        sizing: { horizontal: 'fixed', vertical: 'fixed' },
        positioning: 'auto',
        layout: { mode: 'none' },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        fills: [{
            type: 'image',
            id: generateId(),
            src: dataUri,
            fit: 'contain',
            visible: true,
            opacity: 1,
        }],
        borderRadius: 0,
        shadows: [],
        opacity: parseFloat(cs.opacity) || 1,
        overflow: 'hidden',
        children: [],
    })
}

// ═══════════════════════════════════════════════════
// Edge Case Builders
// ═══════════════════════════════════════════════════

/**
 * Build a placeholder for video/iframe embeds.
 */
function buildMediaPlaceholder(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    tag: string,
): ScytleNode {
    const width = rect.width || parseInt(el.getAttribute('width') || '') || 640
    const height = rect.height || parseInt(el.getAttribute('height') || '') || 360

    return createImage({
        id: generateId(),
        name: tag === 'video' ? 'Video' : 'Embed',
        width,
        height,
        src: '',
        alt: tag === 'video' ? 'Video placeholder' : 'Embed placeholder',
        fit: 'cover',
        isPlaceholder: true,
        placeholderLabel: tag === 'video' ? 'Video' : 'Embed',
        sizing: { horizontal: 'fill', vertical: 'fixed' },
    })
}

/**
 * Build a FrameNode from form input elements.
 */
function buildInputNodeFromComputed(
    el: HTMLInputElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
    tag: string,
    lm?: LinkMaps,
): FrameNode {
    const placeholder = el.placeholder || el.value || tag
    const width = Math.max(rect.width, 100)
    const height = Math.max(rect.height, 36)

    // Build the input as a frame with a text child for the placeholder
    const textChild = createText({
        id: generateId(),
        name: placeholder.slice(0, 40),
        characters: placeholder,
        color: rgbToHex(cs.color),
        fontFamily: extractPrimaryFont(cs.fontFamily),
        fontSize: parseFloat(cs.fontSize) || 14,
        fontWeight: parseInt(cs.fontWeight) || 400,
        sizing: { horizontal: 'fill', vertical: 'hug' },
        opacity: el.placeholder ? 0.5 : 1,
    })

    return createFrame({
        id: generateId(),
        name: tag === 'select' ? 'Select' : tag === 'textarea' ? 'Textarea' : 'Input',
        width,
        height,
        children: [textChild],
        layout: { mode: 'flex', direction: 'row', align: 'center' },
        padding: extractPadding(cs),
        fills: extractFills(cs),
        border: extractBorder(cs),
        borderRadius: extractBorderRadius(cs),
        sizing: { horizontal: 'fill', vertical: 'fixed' },
    })
}

/**
 * Build a thin frame for <hr> dividers.
 */
function buildDividerNode(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    rect: DOMRect,
): FrameNode {
    const color = rgbToHex(cs.borderTopColor || cs.borderColor || cs.backgroundColor || 'rgb(229, 231, 235)')

    return createFrame({
        id: generateId(),
        name: 'Divider',
        width: Math.max(rect.width, 100),
        height: Math.max(rect.height, 1),
        fills: [{
            type: 'solid',
            id: generateId(),
            color,
            opacity: 1,
            visible: true,
        }],
        sizing: { horizontal: 'fill', vertical: 'fixed' },
        children: [],
        layout: { mode: 'none' },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: extractMargin(cs),
    })
}

// ═══════════════════════════════════════════════════
// Color Conversion Utilities
// ═══════════════════════════════════════════════════

/**
 * Convert CSS computed color string to hex.
 *
 * getComputedStyle returns different formats depending on browser and CSS:
 *   - rgb(59, 130, 246)         — standard sRGB
 *   - rgba(59, 130, 246, 0.5)   — sRGB with alpha
 *   - oklch(0.623 0.214 259.1)  — Tailwind v4 default color space
 *   - color(srgb 0.23 0.51 0.96)— modern color function
 *   - color(display-p3 ...)     — wide-gamut
 *
 * LinkMaps are keyed on hex strings, so we must convert to hex.
 */
function rgbToHex(rgb: string): string {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent'

    // Already hex?
    if (rgb.startsWith('#')) return normalizeHex(rgb)

    // Standard rgb/rgba
    const rgbMatch = rgb.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/)
    if (rgbMatch) {
        const r = parseInt(rgbMatch[1])
        const g = parseInt(rgbMatch[2])
        const b = parseInt(rgbMatch[3])
        return '#' + [r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')
    }

    // Modern space-separated rgb/rgba: rgb(59 130 246) or rgb(59 130 246 / 0.5)
    const rgbSpaceMatch = rgb.match(/rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
    if (rgbSpaceMatch) {
        const r = Math.round(parseFloat(rgbSpaceMatch[1]))
        const g = Math.round(parseFloat(rgbSpaceMatch[2]))
        const b = Math.round(parseFloat(rgbSpaceMatch[3]))
        return '#' + [r, g, b].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')
    }

    // oklch(L C H) or oklch(L C H / alpha) — Tailwind v4 default color space
    const oklchMatch = rgb.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
    if (oklchMatch) {
        return oklchToHex(
            parseFloat(oklchMatch[1]),
            parseFloat(oklchMatch[2]),
            parseFloat(oklchMatch[3]),
        )
    }

    // color(srgb r g b) or color(srgb r g b / alpha)
    const srgbMatch = rgb.match(/color\(\s*srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
    if (srgbMatch) {
        const r = Math.round(parseFloat(srgbMatch[1]) * 255)
        const g = Math.round(parseFloat(srgbMatch[2]) * 255)
        const b = Math.round(parseFloat(srgbMatch[3]) * 255)
        return '#' + [r, g, b].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')
    }

    // color(display-p3 r g b) — approximate to sRGB
    const p3Match = rgb.match(/color\(\s*display-p3\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/)
    if (p3Match) {
        // Approximate: display-p3 values are close to sRGB for most web colors
        const r = Math.round(parseFloat(p3Match[1]) * 255)
        const g = Math.round(parseFloat(p3Match[2]) * 255)
        const b = Math.round(parseFloat(p3Match[3]) * 255)
        return '#' + [r, g, b].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')
    }

    return '#000000'
}

/**
 * Convert oklch to hex (approximate conversion via Lab → XYZ → sRGB).
 * Tailwind v4 uses oklch as its internal color space.
 */
function oklchToHex(L: number, C: number, H: number): string {
    // oklch → oklab
    const hRad = (H * Math.PI) / 180
    const a = C * Math.cos(hRad)
    const b = C * Math.sin(hRad)

    // oklab → linear sRGB (via LMS)
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b
    const s_ = L - 0.0894841775 * a - 1.2914855480 * b

    const l = l_ * l_ * l_
    const m = m_ * m_ * m_
    const s = s_ * s_ * s_

    const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s
    const bVal = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s

    // Linear sRGB → sRGB (gamma correction)
    const toSrgb = (x: number) => {
        if (x <= 0) return 0
        if (x >= 1) return 255
        return Math.round((x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055) * 255)
    }

    return '#' + [toSrgb(r), toSrgb(g), toSrgb(bVal)]
        .map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0'))
        .join('')
}

/**
 * Extract opacity from computed color string.
 * Handles rgba(), oklch(... / alpha), color(... / alpha), and space-separated rgb().
 */
function rgbToOpacity(rgb: string): number {
    if (rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 0

    // rgba(r, g, b, a) — comma-separated
    const rgbaMatch = rgb.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/)
    if (rgbaMatch) return parseFloat(rgbaMatch[1])

    // Modern format: rgb(r g b / a) or oklch(L C H / a) or color(srgb r g b / a)
    const slashMatch = rgb.match(/\/\s*([\d.]+)\s*\)/)
    if (slashMatch) return parseFloat(slashMatch[1])

    return 1
}

/**
 * Check if a computed color value represents transparent.
 * Handles all color formats: rgba, oklch, color(), etc.
 */
function isTransparentColor(color: string): boolean {
    if (!color) return true
    if (color === 'transparent') return true
    if (color === 'rgba(0, 0, 0, 0)') return true
    // oklch with zero alpha: oklch(0 0 0 / 0), oklch(... / 0)
    if (color.includes('/ 0)') || color.includes('/0)')) return true
    return false
}

// ═══════════════════════════════════════════════════
// Layout Extraction
// ═══════════════════════════════════════════════════

/**
 * Extract layout mode from computed display/flex properties.
 * No class parsing needed — just read the computed values.
 */
function extractLayout(cs: CSSStyleDeclaration): Layout {
    const display = cs.display

    if (display === 'grid' || display === 'inline-grid') {
        return {
            mode: 'grid',
            direction: 'row',
            gap: parseFloat(cs.gap) || 0,
            columns: parseGridTemplateCount(cs.gridTemplateColumns),
            rows: parseGridTemplateCount(cs.gridTemplateRows),
            columnGap: parseFloat(cs.columnGap) || undefined,
            rowGap: parseFloat(cs.rowGap) || undefined,
        }
    }

    if (display === 'flex' || display === 'inline-flex') {
        return {
            mode: 'flex',
            direction: (cs.flexDirection === 'column' || cs.flexDirection === 'column-reverse')
                ? 'column'
                : 'row',
            justify: mapJustifyContent(cs.justifyContent),
            align: mapAlignItems(cs.alignItems),
            wrap: cs.flexWrap !== 'nowrap' ? true : undefined,
            gap: parseFloat(cs.gap) || 0,
        }
    }

    // Block/inline elements with children → treat as flex column.
    // In the Scytle canvas, layout mode 'none' means freeform/absolute positioning
    // which breaks normal document flow. Block elements naturally stack children
    // vertically, which is equivalent to flex-column.
    return { mode: 'flex', direction: 'column', gap: 0 }
}

function parseGridTemplateCount(template: string): number | undefined {
    if (!template || template === 'none') return undefined
    // getComputedStyle resolves repeat() → space-separated pixel values
    return template.split(/\s+/).filter(v => v && v !== 'none').length
}

function parseGridSpan(start: string, end: string): number | undefined {
    // grid-column: span 2 → gridColumnStart: "span 2" or end - start
    const spanMatch = start?.match(/span\s+(\d+)/) || end?.match(/span\s+(\d+)/)
    if (spanMatch) return parseInt(spanMatch[1])

    const s = parseInt(start)
    const e = parseInt(end)
    if (!isNaN(s) && !isNaN(e) && e > s) return e - s

    return undefined
}

// ═══════════════════════════════════════════════════
// Style Extraction Utilities
// ═══════════════════════════════════════════════════

function extractPadding(cs: CSSStyleDeclaration): Padding {
    return {
        top: parseFloat(cs.paddingTop) || 0,
        right: parseFloat(cs.paddingRight) || 0,
        bottom: parseFloat(cs.paddingBottom) || 0,
        left: parseFloat(cs.paddingLeft) || 0,
    }
}

function extractMargin(cs: CSSStyleDeclaration): { top: number; right: number; bottom: number; left: number } {
    return {
        top: parseFloat(cs.marginTop) || 0,
        right: parseFloat(cs.marginRight) || 0,
        bottom: parseFloat(cs.marginBottom) || 0,
        left: parseFloat(cs.marginLeft) || 0,
    }
}

/**
 * Detect which margin sides have 'auto' value.
 * Uses the display:none trick — when element is taken out of layout,
 * getComputedStyle returns 'auto' instead of resolved pixels.
 */
function extractAutoMargin(el: HTMLElement, win: Window): { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean } | undefined {
    const origDisplay = el.style.display
    const origVisibility = el.style.visibility
    el.style.display = 'none'
    el.style.visibility = 'hidden'
    const cs = win.getComputedStyle(el)
    const auto: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean } = {}
    if (cs.marginTop === 'auto') auto.top = true
    if (cs.marginRight === 'auto') auto.right = true
    if (cs.marginBottom === 'auto') auto.bottom = true
    if (cs.marginLeft === 'auto') auto.left = true
    el.style.display = origDisplay
    el.style.visibility = origVisibility
    const hasAny = auto.top || auto.right || auto.bottom || auto.left
    return hasAny ? auto : undefined
}

/**
 * Extract min/max width/height constraints from computed styles.
 * Returns only non-default values (0 for min, none for max).
 */
function extractMinMaxConstraints(cs: CSSStyleDeclaration): {
    minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number
} {
    const result: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number } = {}
    const minW = parseFloat(cs.minWidth)
    if (minW > 0 && cs.minWidth !== '0px') result.minWidth = minW
    const maxW = parseFloat(cs.maxWidth)
    if (!isNaN(maxW) && cs.maxWidth !== 'none') result.maxWidth = maxW
    const minH = parseFloat(cs.minHeight)
    if (minH > 0 && cs.minHeight !== '0px') result.minHeight = minH
    const maxH = parseFloat(cs.maxHeight)
    if (!isNaN(maxH) && cs.maxHeight !== 'none') result.maxHeight = maxH
    return result
}

function extractBorder(cs: CSSStyleDeclaration): Border | undefined {
    const width = parseFloat(cs.borderTopWidth) || 0
    if (width === 0) return undefined

    if (isTransparentColor(cs.borderTopColor)) return undefined
    const color = rgbToHex(cs.borderTopColor)

    return {
        color,
        width,
        style: (cs.borderTopStyle === 'dashed' ? 'dashed'
            : cs.borderTopStyle === 'dotted' ? 'dotted'
                : 'solid') as 'solid' | 'dashed' | 'dotted',
        position: 'inside',
        opacity: rgbToOpacity(cs.borderTopColor),
        visible: true,
    }
}

function extractBorderRadius(cs: CSSStyleDeclaration): BorderRadius {
    const tl = parseFloat(cs.borderTopLeftRadius) || 0
    const tr = parseFloat(cs.borderTopRightRadius) || 0
    const br = parseFloat(cs.borderBottomRightRadius) || 0
    const bl = parseFloat(cs.borderBottomLeftRadius) || 0

    // If all corners are equal, return single number (Scytle convention)
    if (tl === tr && tr === br && br === bl) return tl

    return { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl }
}

function extractFills(cs: CSSStyleDeclaration): Fill[] {
    const fills: Fill[] = []

    // Background color — check for transparent in all color formats
    const bgColor = cs.backgroundColor
    if (bgColor && !isTransparentColor(bgColor)) {
        fills.push({
            type: 'solid',
            id: generateId(),
            color: rgbToHex(bgColor),
            opacity: rgbToOpacity(bgColor),
            visible: true,
        })
    }

    // Background image (gradients or URLs)
    const bgImage = cs.backgroundImage
    if (bgImage && bgImage !== 'none') {
        if (bgImage.includes('gradient')) {
            const gradientFill = parseGradientFromComputed(bgImage)
            if (gradientFill) fills.push(gradientFill)
        } else if (bgImage.includes('url(')) {
            // Background image URL
            const urlMatch = bgImage.match(/url\(["']?(.*?)["']?\)/)
            if (urlMatch) {
                fills.push({
                    type: 'image',
                    id: generateId(),
                    src: urlMatch[1],
                    fit: mapBackgroundSizeFit(cs.backgroundSize),
                    visible: true,
                    opacity: 1,
                })
            }
        }
    }

    return fills
}

function extractShadows(boxShadow: string): Shadow[] {
    if (!boxShadow || boxShadow === 'none') return []

    const shadows: Shadow[] = []
    const parts = splitBoxShadowParts(boxShadow)

    for (const part of parts) {
        const shadow = parseSingleShadow(part.trim())
        if (shadow) shadows.push(shadow)
    }

    return shadows
}

/**
 * Split box-shadow value by commas, but not commas inside rgba().
 */
function splitBoxShadowParts(boxShadow: string): string[] {
    const parts: string[] = []
    let current = ''
    let depth = 0

    for (const char of boxShadow) {
        if (char === '(') depth++
        if (char === ')') depth--
        if (char === ',' && depth === 0) {
            parts.push(current)
            current = ''
        } else {
            current += char
        }
    }
    if (current.trim()) parts.push(current)
    return parts
}

function parseSingleShadow(shadow: string): Shadow | null {
    const isInner = shadow.includes('inset')
    const cleaned = shadow.replace('inset', '').trim()

    // Extract color — handle rgb(), rgba(), oklch(), color(), hex, and named colors.
    // Tailwind v4 outputs oklch(0 0 0 / 0.1) — we must preserve the alpha channel.
    // Try function-style colors first (most specific), then hex, then named colors.
    const funcColorMatch = cleaned.match(/((?:rgba?|oklch|color)\([^)]+\))/)
    const hexColorMatch = !funcColorMatch ? cleaned.match(/(#[0-9a-fA-F]{3,8})\b/) : null

    let color: string
    let colorRaw: string  // Raw color string to remove from numeric extraction
    if (funcColorMatch) {
        colorRaw = funcColorMatch[1]
        // Convert to hex but also extract opacity separately
        color = rgbToHex(colorRaw)
    } else if (hexColorMatch) {
        colorRaw = hexColorMatch[1]
        color = normalizeHex(colorRaw)
    } else {
        colorRaw = ''
        color = '#000000'
    }

    // Extract the alpha/opacity from the original color value
    const opacity = colorRaw ? rgbToOpacity(colorRaw) : 1

    // If the color has alpha < 1, store it as hex + let the canvas renderer handle opacity
    // The Shadow schema expects `color` as hex, so we need the hex.
    // But the canvas renderer uses the color directly in box-shadow CSS.
    // To preserve alpha, we need to output an rgba/hex8 value.
    if (opacity < 1 && color !== 'transparent') {
        // Convert hex + opacity to 8-digit hex (with alpha)
        const hex = color.replace('#', '')
        const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0')
        color = `#${hex}${alphaHex}`
    }

    // Extract numeric values (remove the color first)
    const numsStr = colorRaw
        ? cleaned.replace(colorRaw, '').trim()
        : cleaned
    const nums = numsStr
        .split(/\s+/)
        .filter(n => n.length > 0)
        .map(n => parseFloat(n) || 0)

    if (nums.length < 2) return null

    return {
        type: isInner ? 'inner' : 'drop',
        x: nums[0],
        y: nums[1],
        blur: nums[2] || 0,
        spread: nums[3] || 0,
        color,
        visible: true,
    }
}

// ═══════════════════════════════════════════════════
// Gradient Parsing
// ═══════════════════════════════════════════════════

/**
 * Convert CSS gradient keyword direction to angle in degrees.
 * CSS gradient angles: "to top" = 0deg, "to right" = 90deg, etc.
 */
function directionToAngle(dir: string): number {
    const normalized = dir.toLowerCase().replace(/\s+/g, ' ').trim()
    const map: Record<string, number> = {
        'top': 0,
        'right': 90,
        'bottom': 180,
        'left': 270,
        'top right': 45,
        'right top': 45,
        'bottom right': 135,
        'right bottom': 135,
        'bottom left': 225,
        'left bottom': 225,
        'top left': 315,
        'left top': 315,
    }
    return map[normalized] ?? 180
}

/**
 * Parse a CSS gradient string into a GradientFill.
 * The computed background-image returns resolved gradient values.
 */
function parseGradientFromComputed(bgImage: string): Fill | null {
    // linear-gradient(angle, color-stop, ...)
    const linearMatch = bgImage.match(/linear-gradient\((.+)\)/)
    if (linearMatch) {
        const content = linearMatch[1]

        // Parse angle — support numeric degrees AND keyword directions
        let angle = 180
        const angleMatch = content.match(/^([\d.]+)deg/)
        if (angleMatch) {
            angle = parseFloat(angleMatch[1])
        } else {
            // Keyword directions: "to bottom right", "to right", etc.
            const dirMatch = content.match(/^to\s+([\w\s]+?)(?:\s*,)/)
            if (dirMatch) {
                angle = directionToAngle(dirMatch[1].trim())
            }
        }

        // Parse color stops — handle rgb(), oklch(), color() formats
        const stops: Array<{ position: number; color: string; opacity?: number }> = []
        // Generic approach: extract any color function followed by optional percentage
        // Matches: rgb(...) 50%, rgba(...) 0%, oklch(...) 100%, color(srgb ...) 50%
        const colorFuncRegex = /((?:rgba?|oklch|color)\([^)]+\))\s*([\d.]+%)?/g
        let match
        while ((match = colorFuncRegex.exec(content)) !== null) {
            const colorStr = match[1]
            const position = match[2] ? parseFloat(match[2]) / 100 : -1
            stops.push({
                position,
                color: rgbToHex(colorStr),
                opacity: rgbToOpacity(colorStr),
            })
        }

        // Normalize positions for stops without explicit percentage
        if (stops.length > 0) {
            const hasPositions = stops.some(s => s.position >= 0)
            if (!hasPositions) {
                // No stops had percentages — distribute evenly
                stops.forEach((s, idx) => { s.position = idx / Math.max(1, stops.length - 1) })
            } else {
                // Fill in missing positions (auto-distribute between known positions)
                stops.forEach((s, idx) => {
                    if (s.position < 0) {
                        s.position = idx / Math.max(1, stops.length - 1)
                    }
                })
            }
        }

        // Fallback: hex colors (some engines return hex in gradients)
        if (stops.length === 0) {
            const hexRegex = /(#[0-9a-fA-F]{3,8})\s*([\d.]+%)?/g
            while ((match = hexRegex.exec(content)) !== null) {
                stops.push({
                    position: match[2] ? parseFloat(match[2]) / 100 : stops.length,
                    color: normalizeHex(match[1]),
                    opacity: 1,
                })
            }
            if (stops.length > 1 && !content.includes('%')) {
                stops.forEach((s, idx) => { s.position = idx / (stops.length - 1) })
            }
        }

        if (stops.length < 2) return null

        return {
            type: 'gradient',
            id: generateId(),
            gradientType: 'linear',
            angle,
            stops: stops.map(s => ({
                id: generateId(),
                position: s.position,
                color: s.color,
                opacity: s.opacity,
            })),
            visible: true,
            opacity: 1,
        }
    }

    // radial-gradient
    const radialMatch = bgImage.match(/radial-gradient\((.+)\)/)
    if (radialMatch) {
        const content = radialMatch[1]
        const stops: Array<{ position: number; color: string; opacity?: number }> = []
        const colorFuncRegex = /((?:rgba?|oklch|color)\([^)]+\))\s*([\d.]+%)?/g
        let match
        while ((match = colorFuncRegex.exec(content)) !== null) {
            stops.push({
                position: match[2] ? parseFloat(match[2]) / 100 : -1,
                color: rgbToHex(match[1]),
                opacity: rgbToOpacity(match[1]),
            })
        }
        // Normalize missing positions
        if (stops.length > 0) {
            stops.forEach((s, idx) => {
                if (s.position < 0) s.position = idx / Math.max(1, stops.length - 1)
            })
        }

        if (stops.length < 2) return null

        return {
            type: 'gradient',
            id: generateId(),
            gradientType: 'radial',
            stops: stops.map(s => ({
                id: generateId(),
                position: s.position,
                color: s.color,
                opacity: s.opacity,
            })),
            visible: true,
            opacity: 1,
        }
    }

    // Fallback: store as raw CSS gradient string
    return {
        type: 'gradient',
        id: generateId(),
        gradient: bgImage,
        visible: true,
        opacity: 1,
    }
}

// ═══════════════════════════════════════════════════
// Sizing Inference
// ═══════════════════════════════════════════════════

/**
 * Get the CSS "computed" (not resolved) width/height using the display:none trick.
 *
 * When an element is laid out, `getComputedStyle(el).width` returns resolved pixels
 * (e.g. "389.33px") — useless for distinguishing auto vs 50% vs 300px.
 *
 * Setting `display: none` takes the element out of layout. Now `getComputedStyle(el).width`
 * returns the **computed** value: "auto", "50%", "300px", etc.
 *
 * This is the industry-standard approach used by Builder.io (html-to-figma) and others.
 */
function getComputedSizingIntent(el: HTMLElement, win: Window): { width: string; height: string } {
    const origDisplay = el.style.display
    const origVisibility = el.style.visibility
    // Hide element to get computed (not resolved) values
    el.style.display = 'none'
    el.style.visibility = 'hidden'
    const cs = win.getComputedStyle(el)
    const width = cs.width    // "auto", "50%", "300px" — NOT resolved pixels
    const height = cs.height
    // Restore immediately to avoid layout thrash
    el.style.display = origDisplay
    el.style.visibility = origVisibility
    return { width, height }
}

function inferContainerSizing(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    win: Window,
): Sizing {
    const parentEl = el.parentElement
    const parentCs = parentEl ? win.getComputedStyle(parentEl) : null
    const parentIsFlexRow = parentCs?.display.includes('flex') &&
        (parentCs?.flexDirection === 'row' || parentCs?.flexDirection === 'row-reverse')
    const parentIsFlexCol = parentCs?.display.includes('flex') &&
        (parentCs?.flexDirection === 'column' || parentCs?.flexDirection === 'column-reverse')
    const parentIsGrid = parentCs?.display.includes('grid')

    let horizontal: 'fixed' | 'hug' | 'fill' = 'hug'
    let vertical: 'fixed' | 'hug' | 'fill' = 'hug'

    // ── Use display:none trick to get the computed (not resolved) width/height ──
    // This reveals the authored CSS intent: "auto", "50%", "300px", etc.
    const intent = getComputedSizingIntent(el, win)

    // Helper: check if cross-axis is stretched
    const isCrossAxisStretched = (alignSelf: string, parentAlignItems?: string) => {
        if (alignSelf === 'stretch') return true
        // auto/normal inherit from parent's align-items (default is 'stretch' in flex/grid)
        if (alignSelf === 'auto' || alignSelf === 'normal' || alignSelf === '') {
            return parentAlignItems === 'stretch' || parentAlignItems === 'normal' || !parentAlignItems
        }
        return false
    }

    // Helper: percentage → fill only if 100%, otherwise fixed (Figma has no fractional fill)
    const isFullWidth = (pct: string) => {
        const v = parseFloat(pct)
        return v >= 99.5  // 100% (with floating point tolerance)
    }

    // ── Horizontal sizing ──
    if (parentIsGrid) {
        // Grid children fill their grid cell
        horizontal = 'fill'
    } else if (parentIsFlexRow) {
        // FLEX ROW: horizontal = main axis
        if (parseFloat(cs.flexGrow) > 0) {
            horizontal = 'fill'
        } else if (intent.width === 'auto') {
            horizontal = 'hug'
        } else if (intent.width.endsWith('%')) {
            horizontal = isFullWidth(intent.width) ? 'fill' : 'fixed'
        } else if (intent.width.endsWith('px')) {
            horizontal = 'fixed'
        } else {
            horizontal = 'hug'
        }
    } else if (parentIsFlexCol) {
        // FLEX COL: horizontal = cross axis
        if (isCrossAxisStretched(cs.alignSelf, parentCs?.alignItems)) {
            horizontal = 'fill'
        } else if (intent.width === 'auto') {
            horizontal = 'hug'
        } else if (intent.width.endsWith('%')) {
            horizontal = isFullWidth(intent.width) ? 'fill' : 'fixed'
        } else if (intent.width.endsWith('px')) {
            horizontal = 'fixed'
        } else {
            horizontal = 'hug'
        }
    } else if (intent.width === 'auto') {
        const isBlockLevel = cs.display === 'block' || cs.display === 'flex' ||
            cs.display === 'grid' || cs.display === 'list-item' ||
            cs.display === 'table'
        horizontal = isBlockLevel ? 'fill' : 'hug'
    } else if (intent.width.endsWith('%')) {
        horizontal = isFullWidth(intent.width) ? 'fill' : 'fixed'
    } else if (intent.width.endsWith('px')) {
        horizontal = 'fixed'
    } else {
        // Fallback: spatial analysis — compare element width to parent content width
        if (parentEl) {
            const parentRect = parentEl.getBoundingClientRect()
            const elRect = el.getBoundingClientRect()
            const parentPadL = parseFloat(parentCs?.paddingLeft || '0')
            const parentPadR = parseFloat(parentCs?.paddingRight || '0')
            const parentContentWidth = parentRect.width - parentPadL - parentPadR
            if (parentContentWidth > 0 && Math.abs(elRect.width - parentContentWidth) < 2) {
                horizontal = 'fill'
            } else {
                horizontal = 'fixed'
            }
        } else {
            horizontal = 'fixed'
        }
    }

    // Helper: percentage → fill only if 100%, otherwise fixed
    const isFullHeight = (pct: string) => {
        const v = parseFloat(pct)
        return v >= 99.5
    }

    // ── Vertical sizing ──
    if (parentIsFlexCol) {
        // FLEX COL: vertical = main axis
        if (parseFloat(cs.flexGrow) > 0) {
            vertical = 'fill'
        } else if (intent.height === 'auto') {
            vertical = 'hug'
        } else if (intent.height.endsWith('%')) {
            vertical = isFullHeight(intent.height) ? 'fill' : 'fixed'
        } else if (intent.height.endsWith('px')) {
            vertical = 'fixed'
        }
    } else if (parentIsFlexRow) {
        // FLEX ROW: vertical = cross axis
        if (isCrossAxisStretched(cs.alignSelf, parentCs?.alignItems)) {
            if (intent.height === 'auto') {
                vertical = 'fill'
            } else if (intent.height.endsWith('px')) {
                vertical = 'fixed'
            } else if (intent.height.endsWith('%')) {
                vertical = isFullHeight(intent.height) ? 'fill' : 'fixed'
            }
        } else if (intent.height === 'auto') {
            vertical = 'hug'
        } else if (intent.height.endsWith('%')) {
            vertical = isFullHeight(intent.height) ? 'fill' : 'fixed'
        } else if (intent.height.endsWith('px')) {
            vertical = 'fixed'
        }
    } else if (parentIsGrid && intent.height === '100%') {
        vertical = 'fill'
    } else if (intent.height === 'auto') {
        vertical = 'hug'
    } else if (intent.height.endsWith('%')) {
        vertical = isFullHeight(intent.height) ? 'fill' : 'fixed'
    } else if (intent.height.endsWith('px')) {
        vertical = 'fixed'
    }
    // else leave as 'hug' (default)

    return { horizontal, vertical }
}

function inferTextSizing(
    tag: string,
    cs: CSSStyleDeclaration,
    el?: HTMLElement,
    win?: Window,
): Sizing {
    const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
    const isBlock = cs.display === 'block'
    const isInline = cs.display === 'inline' || cs.display === 'inline-block'

    // Check parent context — flex-row children should hug, not fill
    if (el?.parentElement && win) {
        const parentCs = win.getComputedStyle(el.parentElement)
        const parentIsFlex = parentCs.display.includes('flex')
        const parentIsRow = parentCs.flexDirection === 'row' || parentCs.flexDirection === 'row-reverse'
        if (parentIsFlex && parentIsRow) {
            return { horizontal: 'hug', vertical: 'hug' }
        }
    }

    if (isInline) return { horizontal: 'hug', vertical: 'hug' }
    if (isBlock || isHeading) return { horizontal: 'fill', vertical: 'hug' }
    return { horizontal: 'hug', vertical: 'hug' }
}

function inferAutoResize(tag: string, cs: CSSStyleDeclaration): TextNode['autoResize'] {
    if (cs.textOverflow === 'ellipsis') return 'none'
    if (cs.overflow === 'hidden' && cs.whiteSpace === 'nowrap') return 'none'

    const isBlock = cs.display === 'block'
    if (isBlock) return 'height'  // Block text grows vertically

    return 'width-and-height'
}

function inferMaxLines(cs: CSSStyleDeclaration): number {
    // Check for -webkit-line-clamp
    const clamp = (cs as unknown as Record<string, string>)['-webkit-line-clamp'] ||
        (cs as unknown as Record<string, string>)['webkitLineClamp']
    if (clamp && clamp !== 'none') return parseInt(clamp) || 1

    // Single line truncation
    if (cs.whiteSpace === 'nowrap') return 1

    return 1
}

// ═══════════════════════════════════════════════════
// Text Content Extraction
// ═══════════════════════════════════════════════════

/**
 * Extract text content from an element, handling inline children.
 * Respects white-space CSS property.
 */
function extractTextContent(el: HTMLElement, cs: CSSStyleDeclaration): string {
    const preserveWhitespace = cs.whiteSpace === 'pre' || cs.whiteSpace === 'pre-wrap'

    if (preserveWhitespace) {
        return el.textContent || ''
    }

    // Walk child nodes to build text, including inline elements
    let text = ''
    for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent || ''
        } else if (child.nodeName === 'BR') {
            text += '\n'
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            // For inline elements (strong, em, a, span), include their text
            const childEl = child as HTMLElement
            const childTag = childEl.tagName.toLowerCase()
            if (INLINE_TAGS.has(childTag) || childEl.style.display === 'inline' || childEl.style.display === 'inline-block') {
                text += childEl.textContent || ''
            }
        }
    }

    return text.replace(/\s+/g, ' ').trim()
}

/**
 * Check if an element should be treated as a text node.
 * True if it contains only inline content (text, spans, etc.)
 */
function isTextOnlyElement(el: HTMLElement, tag: string, win: Window): boolean {
    // Always treat these as text
    if (TEXT_ONLY_TAGS.has(tag)) return true

    // Flex/grid containers should NEVER be flattened to text nodes —
    // even if all their children are inline, they need their layout mode preserved.
    const cs = win.getComputedStyle(el)
    if (cs.display.includes('flex') || cs.display.includes('grid')) return false

    // If no children but has text content → text node
    if (el.children.length === 0) return !!el.textContent?.trim()

    // Check if ALL children are inline
    for (const child of el.children) {
        const childCs = win.getComputedStyle(child)
        if (childCs.display !== 'inline' && childCs.display !== 'inline-block') {
            return false
        }
    }

    return true
}

// ═══════════════════════════════════════════════════
// Node Naming
// ═══════════════════════════════════════════════════

function inferNodeName(el: HTMLElement, tag: string, children: ScytleNode[]): string {
    // 1. aria-label
    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel

    // 2. data-name attribute
    const dataName = el.getAttribute('data-name')
    if (dataName) return dataName

    // 3. Semantic tag names
    if (SEMANTIC_NAMES[tag]) return SEMANTIC_NAMES[tag]

    // 4. Class-based heuristics
    const cls = el.className
    if (typeof cls === 'string') {
        if (cls.includes('hero')) return 'Hero'
        if (cls.includes('card')) return 'Card'
        if (cls.includes('feature')) return 'Features'
        if (cls.includes('testimonial')) return 'Testimonials'
        if (cls.includes('cta')) return 'CTA'
        if (cls.includes('pricing')) return 'Pricing'
        if (cls.includes('faq')) return 'FAQ'
        if (cls.includes('contact')) return 'Contact'
    }

    // 5. First heading text
    const heading = el.querySelector('h1, h2, h3')
    if (heading?.textContent) return heading.textContent.trim().slice(0, 40)

    // 6. Button text
    if (tag === 'button' || tag === 'a') {
        const text = el.textContent?.trim()
        if (text && text.length < 40) return text
    }

    return 'Frame'
}

function inferSvgName(el: SVGSVGElement): string {
    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel

    const title = el.querySelector('title')
    if (title?.textContent) return title.textContent.trim()

    const className = el.getAttribute('class') || ''
    if (className.includes('lucide-')) {
        const match = className.match(/lucide-(\S+)/)
        if (match) return match[1].replace(/-/g, ' ')
    }

    return 'Icon'
}

// ═══════════════════════════════════════════════════
// CSS Value Mappers
// ═══════════════════════════════════════════════════

function mapJustifyContent(value: string): Layout['justify'] {
    switch (value) {
        case 'flex-start': case 'start': return 'start'
        case 'flex-end': case 'end': return 'end'
        case 'center': return 'center'
        case 'space-between': return 'between'
        default: return 'start'
    }
}

function mapAlignItems(value: string): Layout['align'] {
    switch (value) {
        case 'flex-start': case 'start': return 'start'
        case 'flex-end': case 'end': return 'end'
        case 'center': return 'center'
        case 'stretch': return 'stretch'
        case 'baseline': return 'baseline'
        default: return 'stretch'
    }
}

function mapTextAlign(value: string): TextNode['textAlign'] {
    switch (value) {
        case 'left': case 'start': return 'left'
        case 'right': case 'end': return 'right'
        case 'center': return 'center'
        case 'justify': return 'justify'
        default: return 'left'
    }
}

function mapTextTransform(value: string): TextNode['textTransform'] {
    switch (value) {
        case 'uppercase': return 'uppercase'
        case 'lowercase': return 'lowercase'
        case 'capitalize': return 'capitalize'
        default: return 'none'
    }
}

function parseTextDecoration(value: string): TextNode['textDecoration'] {
    if (value.includes('underline')) return 'underline'
    if (value.includes('line-through')) return 'line-through'
    return 'none'
}

function mapObjectFit(value: string): string {
    switch (value) {
        case 'cover': return 'cover'
        case 'contain': return 'contain'
        case 'fill': return 'fill'
        default: return 'cover'
    }
}

function mapBackgroundSizeFit(value: string): 'cover' | 'contain' | 'fill' | 'tile' | 'crop' {
    if (value === 'cover') return 'cover'
    if (value === 'contain') return 'contain'
    return 'cover'
}

function inferHtmlTag(tag: string): TextNode['htmlTag'] | undefined {
    return HTML_TAG_MAP[tag] ?? undefined
}

// ═══════════════════════════════════════════════════
// SVG Helpers
// ═══════════════════════════════════════════════════

/**
 * Resolve currentColor in SVG fills by reading the parent's computed color.
 */
function resolveCurrentColor(el: SVGSVGElement, cs: CSSStyleDeclaration): string | undefined {
    const fill = el.getAttribute('fill')
    if (fill === 'none') return undefined
    if (fill === 'currentColor' || !fill) {
        return rgbToHex(cs.color)
    }
    if (fill.startsWith('#')) return fill
    if (fill.startsWith('rgb')) return rgbToHex(fill)
    return rgbToHex(cs.color)
}

// ═══════════════════════════════════════════════════
// Visual Property Detection
// ═══════════════════════════════════════════════════

/**
 * Check if an element has visual properties (background, border, shadow, etc.)
 * Used to decide whether a container should be kept or flattened to text.
 */
function hasVisualProperties(cs: CSSStyleDeclaration): boolean {
    const hasBg = !isTransparentColor(cs.backgroundColor)
    const hasBorder = parseFloat(cs.borderTopWidth) > 0 &&
        !isTransparentColor(cs.borderTopColor)
    const hasShadow = cs.boxShadow !== 'none' && cs.boxShadow !== ''
    const hasBgImage = cs.backgroundImage !== 'none'
    const hasPadding = parseFloat(cs.paddingTop) > 0 ||
        parseFloat(cs.paddingRight) > 0 ||
        parseFloat(cs.paddingBottom) > 0 ||
        parseFloat(cs.paddingLeft) > 0
    const hasBorderRadius = parseFloat(cs.borderTopLeftRadius) > 0

    return hasBg || hasBorder || hasShadow || hasBgImage || hasPadding || hasBorderRadius
}

// ════════���══════════════════════════════════════════
// Font Utilities
// ═══════════════════════════════════════════════════

/**
 * Extract the primary font name from a CSS font-family stack.
 * e.g., "'Playfair Display', serif" → "Playfair Display"
 */
function extractPrimaryFont(fontFamily: string): string {
    return fontFamily
        .split(',')[0]
        .trim()
        .replace(/^['"]|['"]$/g, '')
}

// ═══════════════════════════════════════════════════
// Theme Variable Matching (Exact-Match)
// ═══════════════════════════════════════════════════

/** Match a hex color to a variable key */
function matchColor(hex: string, lm: LinkMaps): string | undefined {
    if (hex === 'transparent') return undefined
    return lm.colorMap.get(normalizeHex(hex))
}

/** Match a font family name to a variable key */
function matchFont(family: string, lm: LinkMaps): string | undefined {
    const clean = family.replace(/['"]/g, '').split(',')[0].trim().toLowerCase()
    return lm.fontMap.get(clean)
}

/** Match a font size (number) to a variable key */
function matchFontSize(size: number, lm: LinkMaps): string | undefined {
    return lm.fontSizeMap.get(String(Math.round(size)))
}

/** Match a font weight to a variable key (using font weight map if exists) */
function matchFontWeight(_weight: number, _lm: LinkMaps): string | undefined {
    // Font weights are handled by relinkNodes semantic classification
    // because they depend on HTML tag context (heading vs body)
    return undefined
}

/** Match a border radius value to a variable key */
function matchRadius(r: BorderRadius, lm: LinkMaps): string | undefined {
    if (typeof r !== 'number') return undefined
    return lm.radiusMap.get(String(r))
}

/** Match a spacing/padding/gap value to a variable key */
function matchSpacing(value: number, lm: LinkMaps): string | undefined {
    if (value <= 0) return undefined
    return lm.spacingMap.get(String(Math.round(value)))
}

/** Match shadow array to a variable key */
function matchShadow(shadows: Shadow[], lm: LinkMaps): string | undefined {
    if (shadows.length === 0) return undefined
    const s = shadows[0]
    const shadowStr = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
    return lm.shadowMap.get(normalizeShadow(shadowStr))
}

// ═══════════════════════════════════════════════════
// Position Assignment
// ═══════════════════════════════════════════════════

/**
 * Assign y positions to children of a frame.
 * In the Scytle canvas, children are positioned relative to their parent.
 * For flex-column containers, children stack vertically.
 */
function assignChildPositions(frame: FrameNode): void {
    if (frame.layout.mode === 'none') return

    // Grid children are positioned by CSS grid, not manually stacked.
    // Just reset to (0,0) and recurse into child frames.
    if (frame.layout.mode === 'grid') {
        for (const child of frame.children) {
            child.x = 0
            child.y = 0
            if (child.type === 'frame') {
                assignChildPositions(child)
            }
        }
        return
    }

    // Flex layout: stack children sequentially along the flex direction.
    // Account for margins on children — margins create additional spacing beyond gap.
    const direction = frame.layout.direction || 'column'
    const gap = frame.layout.gap || 0

    let offset = 0
    let prevChildProcessed = false

    for (const child of frame.children) {
        if (child.positioning === 'absolute') continue

        const margin = child.margin || { top: 0, right: 0, bottom: 0, left: 0 }

        // Add gap between siblings (not before the first child)
        if (prevChildProcessed) {
            offset += gap
        }

        if (direction === 'column') {
            offset += margin.top
            child.x = 0
            child.y = offset
            offset += child.height + margin.bottom
        } else {
            offset += margin.left
            child.x = offset
            child.y = 0
            offset += child.width + margin.right
        }

        prevChildProcessed = true

        // Recurse into child frames
        if (child.type === 'frame') {
            assignChildPositions(child)
        }
    }
}

// ═══════════════════════════════════════════════════
// Empty Frame Helper
// ═══════════════════════════════════════════════════

function createEmptyPageFrame(name: string, width: number): FrameNode {
    return createFrame({
        id: generateId(),
        name,
        width,
        height: 800,
        children: [],
        layout: { mode: 'flex', direction: 'column' },
        sizing: { horizontal: 'fixed', vertical: 'hug' },
    })
}
