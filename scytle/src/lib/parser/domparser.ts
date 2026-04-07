/**
 * DOMParser-Based HTML → ScytleNode Parser
 *
 * Parses HTML with DOMParser and reads element.style (inline styles) directly,
 * mapping CSS properties to ScytleNode properties. The HTML is expected to have
 * Tailwind classes already converted to inline styles before reaching this parser.
 *
 * Key difference from iframe-parser.ts:
 *   - No iframe, no getComputedStyle, no getBoundingClientRect
 *   - Reads el.style (CSSStyleDeclaration from inline styles)
 *   - Sizing inferred from CSS values (width:100% → fill, Npx → fixed, etc.)
 *   - Dimensions estimated (not measured)
 *
 * Pipeline:
 *   AI HTML → tailwind-to-inline → DOMParser → walkElement → relinkNodes → ScytleNode tree
 */

import { generateId } from '@/lib/utils'
import {
    createFrame, createText, createImage, createVector,
    type FrameNode, type TextNode, type ImageNode, type VectorNode,
    type ScytleNode, type Fill, type Border, type Shadow,
    type Layout, type Padding, type Sizing, type BorderRadius,
} from '@/types/canvas'
import {
    buildLinkMaps, normalizeHex, normalizeShadow,
    type LinkMaps, type VariableTable, type ThemeMode,
} from '@/lib/theme/variable-table'
import { relinkNodes } from '@/lib/theme/relink-nodes'
import { parseSvgToNetwork, computeBoundingBox, normalizeNetwork } from './svg-path-parser'
import { estimateTextHeight } from './size-utils'

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface DOMParserOptions {
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

/** Block-level display values — elements with these fill width by default */
const BLOCK_DISPLAYS = new Set(['block', 'flex', 'grid', 'list-item', 'table'])

// ═══════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════

/**
 * Parse HTML into a ScytleNode tree using DOMParser (no iframe needed).
 *
 * This reads inline styles directly from element.style, which works because
 * the HTML has already been processed through tailwind-to-inline to convert
 * Tailwind classes to inline styles.
 */
export async function parseHtmlViaDOMParser(
    html: string,
    pageName: string = 'Page',
    options?: DOMParserOptions,
): Promise<FrameNode> {
    const width = options?.rootWidth ?? 1440

    // Fix self-closing tags: <div /> → <div></div>
    // DOMParser (text/html) handles void elements (img, br, hr, input) natively,
    // but non-void self-closing tags like <div /> are invalid HTML and can break parsing.
    const fixedHtml = fixSelfClosingTags(html)

    // Parse with DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(fixedHtml, 'text/html')

    // Build link maps for single-pass exact-match linking
    const lm = options?.variableTable && options?.themeMode
        ? buildLinkMaps(options.variableTable, options.themeMode)
        : undefined

    // Find the root element
    const rootEl = doc.body.firstElementChild as HTMLElement
    if (!rootEl) {
        return createEmptyPageFrame(pageName, width)
    }

    // Walk the DOM tree → ScytleNode tree
    const rootChildren: ScytleNode[] = []
    const rootStyle = rootEl.style

    // Check if root is a simple wrapper (no visual properties) with section children
    const isSimpleWrapper = !hasVisualProperties(rootStyle) && rootEl.children.length > 0

    if (isSimpleWrapper) {
        for (const child of rootEl.children) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                const node = walkElement(child as HTMLElement, width, lm)
                if (node) rootChildren.push(node)
            }
        }
    } else {
        const node = walkElement(rootEl, width, lm)
        if (node) rootChildren.push(node)
    }

    // Estimate page height from children
    let pageHeight = 0
    for (const child of rootChildren) {
        pageHeight += child.height || 0
    }
    pageHeight = Math.max(pageHeight, 800)

    // Build the page frame
    const pageFrame = createFrame({
        id: generateId(),
        name: pageName,
        width,
        height: pageHeight,
        children: rootChildren,
        layout: {
            mode: 'flex',
            direction: 'column',
            gap: 0,
        },
        sizing: { horizontal: 'fixed', vertical: 'hug' },
        fills: isSimpleWrapper ? extractFills(rootStyle) : [],
    })

    // Assign sequential positions to children
    assignChildPositions(pageFrame)

    // Run semantic relinker AFTER building the full tree
    if (options?.variableTable && options?.themeMode) {
        relinkNodes(
            pageFrame.children,
            options.variableTable,
            options.themeMode,
        )
    }

    return pageFrame
}

// ═══════════════════════════════════════════════════
// Self-Closing Tag Fix
// ═══════════════════════════════════════════════════

/** Void elements that are legitimately self-closing in HTML */
const VOID_ELEMENTS = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
])

/**
 * Fix self-closing non-void tags: <div /> → <div></div>
 * DOMParser handles void elements natively, but <div/>, <section/>, etc.
 * are invalid and can break the parse tree.
 */
function fixSelfClosingTags(html: string): string {
    return html.replace(/<(\w+)(\s[^>]*)?\s*\/>/g, (match, tag, attrs) => {
        if (VOID_ELEMENTS.has(tag.toLowerCase())) return match
        return `<${tag}${attrs || ''}></${tag}>`
    })
}

// ═══════════════════════════════════════════════════
// Core Walker
// ═══════════════════════════════════════════════════

/**
 * Recursively walk a DOM element and build a ScytleNode.
 * Reads el.style (inline styles) instead of getComputedStyle.
 */
function walkElement(
    el: HTMLElement,
    parentWidth: number,
    lm?: LinkMaps,
): ScytleNode | null {
    const tag = el.tagName.toLowerCase()

    // Skip non-visual elements
    if (SKIP_TAGS.has(tag)) return null

    const cs = el.style

    // Skip hidden elements
    if (cs.display === 'none' || cs.visibility === 'collapse') return null

    // Dispatch by element type

    // Images
    if (tag === 'img') return buildImageNode(el as HTMLImageElement, cs, parentWidth)

    // SVGs
    if (tag === 'svg') return buildSvgNode(el as unknown as SVGSVGElement, cs, parentWidth)

    // Media placeholders
    if (tag === 'video' || tag === 'iframe') return buildMediaPlaceholder(el, cs, tag)

    // Form elements
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return buildInputNode(el as HTMLInputElement, cs, tag, parentWidth, lm)
    }

    // HR dividers
    if (tag === 'hr') return buildDividerNode(el, cs, parentWidth)

    // Text-only elements
    const _isTextOnly = isTextOnlyElement(el, tag)
    const _hasVisual = hasVisualProperties(cs)
    if (_isTextOnly && !_hasVisual) {
        return buildTextNode(el, cs, tag, parentWidth, lm)
    }

    // Container elements
    return buildContainerNode(el, cs, tag, parentWidth, lm)
}

// ═══════════════════════════════════════════════════
// Node Builders
// ═══════════════════════════════════════════════════

function buildTextNode(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    tag: string,
    parentWidth: number,
    lm?: LinkMaps,
): TextNode {
    const text = extractTextContent(el)
    const colorHex = rgbToHex(cs.color)
    const colorAlpha = rgbToOpacity(cs.color)
    const color = colorAlpha < 1 && colorHex !== 'transparent'
        ? `${colorHex}${Math.round(colorAlpha * 255).toString(16).padStart(2, '0')}`
        : colorHex
    const fontFamily = extractPrimaryFont(cs.fontFamily)
    const fontSize = parseFloat(cs.fontSize) || 16
    const fontWeight = parseInt(cs.fontWeight) || 400
    const htmlTag = inferHtmlTag(tag)
    const sizing = inferTextSizing(tag, cs)
    const w = sizing.horizontal === 'fill' ? parentWidth : estimateTextWidth(text, fontSize)
    const lhMultiplier = cs.lineHeight && cs.lineHeight !== 'normal'
        ? parseFloat(cs.lineHeight) / fontSize
        : 1.5
    const h = estimateTextHeight(text, fontSize, w, lhMultiplier)

    return createText({
        id: generateId(),
        name: text.slice(0, 40) || tag,
        x: 0,
        y: 0,
        width: Math.max(w, 1),
        height: Math.max(h, 1),
        characters: text,
        htmlTag,
        fontSize,
        fontWeight,
        fontFamily,
        fontStyle: cs.fontStyle === 'italic' ? 'italic' : undefined,
        lineHeight: !cs.lineHeight || cs.lineHeight === 'normal'
            ? 'auto'
            : parseFloat(cs.lineHeight),
        letterSpacing: !cs.letterSpacing || cs.letterSpacing === 'normal'
            ? 0
            : parseFloat(cs.letterSpacing),
        textAlign: mapTextAlign(cs.textAlign),
        textTransform: mapTextTransform(cs.textTransform),
        textDecoration: parseTextDecoration(cs.textDecorationLine || cs.textDecoration),
        color,
        autoResize: inferAutoResize(tag, cs),
        ...(cs.textOverflow === 'ellipsis' ? {
            autoResize: 'none' as const,
            textTruncation: 'ending' as const,
            maxLines: inferMaxLines(cs),
        } : {}),
        sizing,
        opacity: parseOpacity(cs.opacity),
        rotation: 0,
        overflow: 'visible',
        borderRadius: 0,
        fills: [],
        shadows: [],
        positioning: cs.position === 'absolute' || cs.position === 'fixed' ? 'absolute' : 'auto',
        margin: extractMargin(cs),
        autoMargin: extractAutoMargin(el),
        ...extractMinMaxConstraints(cs),
        colorRef: lm ? matchColor(color, lm) : undefined,
        fontFamilyRef: lm ? matchFont(fontFamily, lm) : undefined,
        fontSizeRef: lm ? matchFontSize(fontSize, lm) : undefined,
        fontWeightRef: lm ? matchFontWeight(fontWeight, lm) : undefined,
    })
}

function buildContainerNode(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    tag: string,
    parentWidth: number,
    lm?: LinkMaps,
): FrameNode {
    const layout = extractLayout(cs)
    const padding = extractPadding(cs)
    const sizing = inferContainerSizing(el, cs)

    // Estimate this container's available width for children
    const containerWidth = sizing.horizontal === 'fill'
        ? parentWidth
        : (parseFloat(cs.width) || parentWidth)
    const childAvailWidth = containerWidth - padding.left - padding.right

    // Recursively walk children
    const children: ScytleNode[] = []
    for (const child of el.childNodes) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as HTMLElement
            const node = walkElement(childEl, childAvailWidth, lm)
            if (node) children.push(node)
        } else if (child.nodeType === Node.TEXT_NODE) {
            const text = child.textContent?.trim()
            if (text) {
                const fontSize = parseFloat(cs.fontSize) || 16
                const fontWeight = parseInt(cs.fontWeight) || 400
                const inlineColorHex = rgbToHex(cs.color)
                const inlineColorAlpha = rgbToOpacity(cs.color)
                const inlineColor = inlineColorAlpha < 1 && inlineColorHex !== 'transparent'
                    ? `${inlineColorHex}${Math.round(inlineColorAlpha * 255).toString(16).padStart(2, '0')}`
                    : inlineColorHex
                const textNode = createText({
                    id: generateId(),
                    name: text.slice(0, 40),
                    x: 0,
                    y: 0,
                    width: 1,
                    height: 1,
                    characters: text,
                    fontSize,
                    fontWeight,
                    fontFamily: extractPrimaryFont(cs.fontFamily),
                    fontStyle: cs.fontStyle === 'italic' ? 'italic' : undefined,
                    lineHeight: !cs.lineHeight || cs.lineHeight === 'normal' ? 'auto' : parseFloat(cs.lineHeight),
                    letterSpacing: !cs.letterSpacing || cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing),
                    textDecoration: parseTextDecoration(cs.textDecorationLine || cs.textDecoration),
                    textTransform: mapTextTransform(cs.textTransform),
                    color: inlineColor,
                    textAlign: mapTextAlign(cs.textAlign),
                    autoResize: 'width-and-height',
                    sizing: { horizontal: 'hug', vertical: 'hug' },
                })
                children.push(textNode)
            }
        }
    }

    // Handle mixed content: container has text-only content not caught by isTextOnlyElement
    if (children.length === 0 && el.textContent?.trim()) {
        const textNode = buildTextNode(el, cs, tag, childAvailWidth, lm)
        if (hasVisualProperties(cs)) {
            textNode.positioning = 'auto'
            textNode.margin = undefined
            textNode.autoMargin = undefined
            textNode.sizing = { horizontal: 'hug', vertical: 'hug' }
            textNode.autoResize = 'width-and-height'
            children.push(textNode)
        } else {
            return textNode as unknown as FrameNode
        }
    }

    const fills = extractFills(cs)
    const border = extractBorder(cs)
    const borderRadius = extractBorderRadius(cs)
    const shadows = extractShadows(cs.boxShadow)

    // Link fills to theme variables
    if (lm) {
        for (const fill of fills) {
            if (fill.type === 'solid' && 'color' in fill && fill.color) {
                (fill as { colorRef?: string }).colorRef = matchColor(fill.color, lm)
            }
        }
    }

    const maxPad = Math.max(padding.top, padding.right, padding.bottom, padding.left)

    // Estimate dimensions
    let estWidth = sizing.horizontal === 'fixed'
        ? (parseFloat(cs.width) || containerWidth)
        : containerWidth
    let estHeight = sizing.vertical === 'fixed'
        ? (parseFloat(cs.height) || estimateContainerHeight(children, padding, layout))
        : estimateContainerHeight(children, padding, layout)

    // ── Aspect-ratio enforcement ──
    // Handles circles (w-12 h-12 rounded-full) and aspect-ratio CSS property.
    // When aspect-ratio is set on a container, enforce height = width / ratio.
    // Also: when both width and height are explicitly set in CSS as px values,
    // always use the CSS values (even if sizing was inferred as 'hug').
    const explicitW = cs.width?.endsWith('px') ? parseFloat(cs.width) : null
    const explicitH = cs.height?.endsWith('px') ? parseFloat(cs.height) : null

    if (cs.aspectRatio && cs.aspectRatio !== 'auto') {
        const parts = cs.aspectRatio.split('/')
        const ratio = parts.length === 2
            ? parseFloat(parts[0]) / parseFloat(parts[1])
            : parseFloat(parts[0])
        if (ratio > 0 && isFinite(ratio)) {
            if (explicitW) estHeight = explicitW / ratio
            else estHeight = estWidth / ratio
        }
    } else if (explicitW && explicitH) {
        // Both dimensions explicitly set in CSS — always use them.
        // This catches circles (w-12 h-12) where sizing may have been inferred as 'hug'.
        estWidth = explicitW
        estHeight = explicitH
    }

    const frame = createFrame({
        id: generateId(),
        name: inferNodeName(el, tag, children),
        x: 0,
        y: 0,
        width: Math.max(estWidth, 1),
        height: Math.max(estHeight, 1),
        children,
        layout: {
            ...layout,
            gapRef: lm && layout.gap ? matchSpacing(layout.gap, lm) : undefined,
        },
        padding,
        paddingRef: lm ? matchSpacing(maxPad, lm) : undefined,
        fills,
        border,
        borderRadius,
        borderRadiusRef: lm ? matchRadius(borderRadius, lm) : undefined,
        shadows,
        shadowRef: lm && shadows.length > 0 ? matchShadow(shadows, lm) : undefined,
        opacity: parseOpacity(cs.opacity),
        ...(extractLayerBlur(cs.filter)),
        overflow: (cs.overflow === 'hidden' || cs.overflowX === 'hidden' || cs.overflowY === 'hidden')
            ? 'hidden'
            : 'visible',
        rotation: 0,
        sizing,
        positioning: cs.position === 'absolute' || cs.position === 'fixed' ? 'absolute' : 'auto',
        ...extractMinMaxConstraints(cs),
        ...(cs.flexGrow && cs.flexGrow !== '0' ? { layoutGrow: parseFloat(cs.flexGrow) } : {}),
        ...(cs.flexShrink && cs.flexShrink !== '1' ? { flexShrink: parseFloat(cs.flexShrink) } : {}),
        ...(cs.flexBasis && cs.flexBasis !== 'auto' && cs.flexBasis !== '0px'
            ? { flexBasis: parseFloat(cs.flexBasis) }
            : {}),
        margin: extractMargin(cs),
        autoMargin: extractAutoMargin(el),
    })

    assignChildPositions(frame)
    return frame
}

function buildImageNode(
    el: HTMLImageElement,
    cs: CSSStyleDeclaration,
    parentWidth: number,
): ScytleNode {
    const src = el.src || el.getAttribute('data-src') || el.getAttribute('src') || ''
    const alt = el.alt || el.getAttribute('alt') || ''
    const width = parseFloat(cs.width) || parseInt(el.getAttribute('width') || '') || 300
    const height = parseFloat(cs.height) || parseInt(el.getAttribute('height') || '') || 200

    // Handle aspect-ratio CSS property
    let finalHeight = height
    if (cs.aspectRatio && cs.aspectRatio !== 'auto' && height === 200 && width > 0) {
        const parts = cs.aspectRatio.split('/')
        if (parts.length === 2) {
            const ratio = parseFloat(parts[0]) / parseFloat(parts[1])
            if (ratio > 0) finalHeight = width / ratio
        }
    }

    if (src && src !== '') {
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
            opacity: parseOpacity(cs.opacity),
            overflow: 'hidden',
            children: [],
            layout: { mode: 'none' },
            padding: { top: 0, right: 0, bottom: 0, left: 0 },
        })
    }

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
        opacity: parseOpacity(cs.opacity),
    })
}

// ═══════════════════════════════════════════════════
// SVG Handling
// ═══════════════════════════════════════════════════

function buildSvgNode(
    el: SVGSVGElement,
    cs: CSSStyleDeclaration,
    parentWidth: number,
): ScytleNode {
    const width = parseFloat(cs.width) || parseFloat(el.getAttribute('width') || '24')
    const height = parseFloat(cs.height) || parseFloat(el.getAttribute('height') || '24')

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

    return buildSvgAsDataUri(el, width, height, cs)
}

function buildVectorNodeFromNetwork(
    el: SVGSVGElement,
    network: ReturnType<typeof parseSvgToNetwork>,
    width: number,
    height: number,
    cs: CSSStyleDeclaration,
): VectorNode {
    const offset = normalizeNetwork(network)
    const bbox = computeBoundingBox(network)

    // Resolve fill color — walk parent chain for currentColor
    const fillColor = resolveCurrentColor(el, cs)

    // Read stroke from SVG attributes
    const firstPath = el.querySelector('path, circle, rect, ellipse, line, polygon, polyline')
    const svgStrokeRaw =
        firstPath?.getAttribute('stroke') ||
        el.getAttribute('stroke') ||
        ''
    const svgStrokeWidthRaw =
        firstPath?.getAttribute('stroke-width') ||
        el.getAttribute('stroke-width') ||
        '0'

    let strokeColor = '#000000'
    if (svgStrokeRaw && svgStrokeRaw !== 'none') {
        if (svgStrokeRaw === 'currentColor') {
            strokeColor = resolveCurrentColorFromChain(el) || '#000000'
        } else if (svgStrokeRaw === 'white') {
            strokeColor = '#ffffff'
        } else if (svgStrokeRaw === 'black') {
            strokeColor = '#000000'
        } else if (svgStrokeRaw.startsWith('#') || svgStrokeRaw.startsWith('rgb')) {
            strokeColor = rgbToHex(svgStrokeRaw)
        } else {
            strokeColor = resolveCurrentColorFromChain(el) || '#000000'
        }
    }

    const strokeWeight = parseFloat(svgStrokeWidthRaw) || 0
    const hasStroke = svgStrokeRaw !== '' && svgStrokeRaw !== 'none' && strokeWeight > 0

    const rawCap = firstPath?.getAttribute('stroke-linecap') || el.getAttribute('stroke-linecap') || ''
    const rawJoin = firstPath?.getAttribute('stroke-linejoin') || el.getAttribute('stroke-linejoin') || ''

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
        strokeColor,
        strokeWeight,
        strokeVisible: hasStroke,
        strokeCap: rawCap === 'round' ? 'ROUND' : rawCap === 'square' ? 'SQUARE' : 'NONE',
        strokeJoin: rawJoin === 'round' ? 'ROUND' : rawJoin === 'bevel' ? 'BEVEL' : 'MITER',
        opacity: parseOpacity(cs.opacity),
    })
}

function buildSvgAsDataUri(
    el: SVGSVGElement,
    width: number,
    height: number,
    cs: CSSStyleDeclaration,
): FrameNode {
    const clone = el.cloneNode(true) as SVGSVGElement

    if (!clone.getAttribute('viewBox')) {
        clone.setAttribute('viewBox', `0 0 ${width} ${height}`)
    }
    clone.setAttribute('width', String(width))
    clone.setAttribute('height', String(height))
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')

    // Resolve currentColor by walking parent chain
    const resolvedColor = resolveCurrentColorFromChain(el) || 'rgb(0, 0, 0)'
    const resolveCurrentColorInSvg = (node: Element) => {
        for (const attr of ['fill', 'stroke', 'color', 'stop-color', 'flood-color']) {
            const val = node.getAttribute(attr)
            if (val === 'currentColor') {
                node.setAttribute(attr, resolvedColor)
            }
        }
        const style = node.getAttribute('style')
        if (style && style.includes('currentColor')) {
            node.setAttribute('style', style.replace(/currentColor/g, resolvedColor))
        }
        for (const child of node.children) {
            resolveCurrentColorInSvg(child)
        }
    }
    for (const attr of ['fill', 'stroke']) {
        const val = clone.getAttribute(attr)
        if (val === 'currentColor') {
            clone.setAttribute(attr, resolvedColor)
        }
    }
    resolveCurrentColorInSvg(clone)

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
        opacity: parseOpacity(cs.opacity),
        overflow: 'hidden',
        children: [],
    })
}

// ═══════════════════════════════════════════════════
// Edge Case Builders
// ═══════════════════════════════════════════════════

function buildMediaPlaceholder(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    tag: string,
): ScytleNode {
    const width = parseFloat(cs.width) || parseInt(el.getAttribute('width') || '') || 640
    const height = parseFloat(cs.height) || parseInt(el.getAttribute('height') || '') || 360

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

function buildInputNode(
    el: HTMLInputElement,
    cs: CSSStyleDeclaration,
    tag: string,
    parentWidth: number,
    lm?: LinkMaps,
): FrameNode {
    const placeholder = el.placeholder || el.value || el.getAttribute('placeholder') || tag
    const width = parseFloat(cs.width) || Math.max(parentWidth, 100)
    const height = parseFloat(cs.height) || 36

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

function buildDividerNode(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
    parentWidth: number,
): FrameNode {
    const color = rgbToHex(
        cs.borderTopColor || cs.borderColor || cs.backgroundColor || '#e5e7eb'
    )

    return createFrame({
        id: generateId(),
        name: 'Divider',
        width: parseFloat(cs.width) || parentWidth,
        height: parseFloat(cs.height) || 1,
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

/** Parse opacity string, correctly handling opacity: 0 (which || 1 would clobber) */
function parseOpacity(val: string): number {
    if (!val) return 1
    const n = parseFloat(val)
    return isNaN(n) ? 1 : n
}

/**
 * Convert CSS color string to hex.
 *
 * Handles all formats that Tailwind v4 and inline style conversion may produce:
 *   - rgb(59, 130, 246)         — standard sRGB
 *   - rgba(59, 130, 246, 0.5)   — sRGB with alpha
 *   - oklch(0.623 0.214 259.1)  — Tailwind v4 default color space
 *   - oklab(L a b)              — Tailwind v4 near-achromatic
 *   - color(srgb 0.23 0.51 0.96)— modern color function
 *   - color(display-p3 ...)     — wide-gamut
 *   - #rrggbb / #rgb            — hex
 */
function rgbToHex(rgb: string): string {
    if (!rgb || rgb === 'transparent' || rgb === 'rgba(0, 0, 0, 0)') return 'transparent'

    // Already hex
    if (rgb.startsWith('#')) return normalizeHex(rgb)

    // Standard rgb/rgba (comma-separated)
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

    // oklch(L C H) or oklch(L% C H) or oklch(L C H / alpha)
    const oklchMatch = rgb.match(/oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)/)
    if (oklchMatch) {
        let L = parseFloat(oklchMatch[1])
        if (oklchMatch[2] === '%') L = L / 100
        return oklchToHex(
            L,
            parseFloat(oklchMatch[3]),
            parseFloat(oklchMatch[4]),
        )
    }

    // oklab(L a b) or oklab(L a b / alpha)
    const oklabMatch = rgb.match(/oklab\(\s*([\d.]+)(%?)\s+([-\d.]+)\s+([-\d.]+)/)
    if (oklabMatch) {
        let L = parseFloat(oklabMatch[1])
        if (oklabMatch[2] === '%') L = L / 100
        const a = parseFloat(oklabMatch[3])
        const b = parseFloat(oklabMatch[4])
        return oklabToHex(L, a, b)
    }

    // color(srgb r g b)
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
        const r = Math.round(parseFloat(p3Match[1]) * 255)
        const g = Math.round(parseFloat(p3Match[2]) * 255)
        const b = Math.round(parseFloat(p3Match[3]) * 255)
        return '#' + [r, g, b].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')
    }

    // Named colors (common ones from CSS)
    const named: Record<string, string> = {
        black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
        blue: '#0000ff', yellow: '#ffff00', gray: '#808080', grey: '#808080',
    }
    const lower = rgb.trim().toLowerCase()
    if (named[lower]) return named[lower]

    return '#000000'
}

/**
 * Convert oklch to hex (approximate via Lab → XYZ → sRGB).
 */
function oklchToHex(L: number, C: number, H: number): string {
    const hRad = (H * Math.PI) / 180
    const a = C * Math.cos(hRad)
    const b = C * Math.sin(hRad)
    return oklabToHex(L, a, b)
}

/**
 * Convert oklab to hex (direct Cartesian form).
 */
function oklabToHex(L: number, a: number, b: number): string {
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
 * Extract opacity from color string.
 * Handles rgba(), oklch(... / alpha), color(... / alpha), space-separated rgb().
 */
function rgbToOpacity(rgb: string): number {
    if (!rgb) return 1
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
 * Check if a color value represents transparent.
 */
function isTransparentColor(color: string): boolean {
    if (!color) return true
    if (color === 'transparent') return true
    if (color === 'rgba(0, 0, 0, 0)') return true
    const alphaMatch = color.match(/\/\s*([\d.]+)\s*\)$/)
    if (alphaMatch && parseFloat(alphaMatch[1]) === 0) return true
    return false
}

/**
 * Check if a color value is unresolvable (e.g. currentColor, inherit, initial).
 * DOMParser doesn't resolve CSS inheritance, so these are meaningless strings.
 */
function isUnresolvableColor(color: string): boolean {
    if (!color) return true
    const lower = color.toLowerCase().trim()
    return lower === 'currentcolor' || lower === 'inherit' || lower === 'initial' || lower === 'unset'
}

// ═══════════════════════════════════════════════════
// Layout Extraction
// ═══════════════════════════════════════════════════

function extractLayout(cs: CSSStyleDeclaration): Layout {
    const display = cs.display

    if (display === 'grid' || display === 'inline-grid') {
        return {
            mode: 'grid',
            direction: 'row',
            gap: parseFloat(cs.gap) || 0,
            columns: parseGridTemplate(cs.gridTemplateColumns),
            rows: parseGridTemplate(cs.gridTemplateRows),
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
            wrap: cs.flexWrap === 'wrap' ? true : undefined,
            gap: parseFloat(cs.gap) || 0,
        }
    }

    // Block/inline elements → treat as flex column for Scytle canvas
    return { mode: 'flex', direction: 'column', gap: 0 }
}

/**
 * Parse grid-template-columns/rows from inline style.
 * Inline styles use the authored value: "repeat(3, 1fr)", "1fr 1fr 1fr", etc.
 */
function parseGridTemplate(template: string): number | string | undefined {
    if (!template || template === 'none') return undefined

    // repeat(N, ...) → extract N
    const repeatMatch = template.match(/repeat\(\s*(\d+)/)
    if (repeatMatch) return parseInt(repeatMatch[1])

    // Count space-separated tracks (e.g. "1fr 1fr 1fr" → 3)
    const tracks = template.split(/\s+/).filter(v => v && v !== 'none')
    if (tracks.length > 0) return tracks.length

    return undefined
}

// ═══════════════════════════════════════════════════
// Style Extraction Utilities
// ═══════════════════════════════════════════════════

function extractPadding(cs: CSSStyleDeclaration): Padding {
    // Tailwind v4 outputs logical properties (padding-inline, padding-block)
    // which DOMParser doesn't expand to physical properties.
    // Check both physical and logical properties.
    const inlineVal = parseFloat((cs as any).paddingInline) || 0
    const blockVal = parseFloat((cs as any).paddingBlock) || 0

    return {
        top: parseFloat(cs.paddingTop) || blockVal,
        right: parseFloat(cs.paddingRight) || inlineVal,
        bottom: parseFloat(cs.paddingBottom) || blockVal,
        left: parseFloat(cs.paddingLeft) || inlineVal,
    }
}

function extractMargin(cs: CSSStyleDeclaration): { top: number; right: number; bottom: number; left: number } {
    // Handle Tailwind v4 logical properties (margin-inline, margin-block)
    const inlineVal = parseFloat((cs as any).marginInline) || 0
    const blockVal = parseFloat((cs as any).marginBlock) || 0

    return {
        top: parseFloat(cs.marginTop) || blockVal,
        right: parseFloat(cs.marginRight) || inlineVal,
        bottom: parseFloat(cs.marginBottom) || blockVal,
        left: parseFloat(cs.marginLeft) || inlineVal,
    }
}

/**
 * Detect auto margins by reading el.style directly.
 * Unlike iframe-parser, no display:none trick needed — we read inline style values.
 */
function extractAutoMargin(el: HTMLElement): { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean } | undefined {
    const s = el.style
    const auto: { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean } = {}
    if (s.marginTop === 'auto') auto.top = true
    if (s.marginRight === 'auto') auto.right = true
    if (s.marginBottom === 'auto') auto.bottom = true
    if (s.marginLeft === 'auto') auto.left = true

    // Also check shorthand margin
    if (s.margin) {
        const parts = s.margin.trim().split(/\s+/)
        if (parts.length === 1 && parts[0] === 'auto') {
            auto.top = auto.right = auto.bottom = auto.left = true
        } else if (parts.length === 2) {
            if (parts[0] === 'auto') { auto.top = true; auto.bottom = true }
            if (parts[1] === 'auto') { auto.left = true; auto.right = true }
        } else if (parts.length === 4) {
            if (parts[0] === 'auto') auto.top = true
            if (parts[1] === 'auto') auto.right = true
            if (parts[2] === 'auto') auto.bottom = true
            if (parts[3] === 'auto') auto.left = true
        }
    }

    const hasAny = auto.top || auto.right || auto.bottom || auto.left
    return hasAny ? auto : undefined
}

function extractMinMaxConstraints(cs: CSSStyleDeclaration): {
    minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number
} {
    const result: { minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number } = {}
    const minW = parseFloat(cs.minWidth)
    if (minW > 0) result.minWidth = minW
    const maxW = parseFloat(cs.maxWidth)
    if (!isNaN(maxW) && cs.maxWidth !== 'none') result.maxWidth = maxW
    const minH = parseFloat(cs.minHeight)
    if (minH > 0) result.minHeight = minH
    const maxH = parseFloat(cs.maxHeight)
    if (!isNaN(maxH) && cs.maxHeight !== 'none') result.maxHeight = maxH
    return result
}

function extractBorder(cs: CSSStyleDeclaration): Border | undefined {
    // Handle Tailwind v4 logical properties (border-inline-width, border-block-width)
    const inlineWidth = parseFloat((cs as any).borderInlineWidth) || 0
    const blockWidth = parseFloat((cs as any).borderBlockWidth) || 0
    const inlineColor = (cs as any).borderInlineColor || ''
    const blockColor = (cs as any).borderBlockColor || ''
    const inlineStyle = (cs as any).borderInlineStyle || ''
    const blockStyle = (cs as any).borderBlockStyle || ''

    // Early return: if no border-related inline styles are set, skip entirely
    // This prevents DOMParser defaults from creating phantom borders
    if (!cs.borderTopWidth && !cs.borderRightWidth && !cs.borderBottomWidth && !cs.borderLeftWidth
        && !cs.borderWidth && inlineWidth === 0 && blockWidth === 0) {
        return undefined
    }

    // Check individual sides and shorthand, with logical property fallbacks
    const sides = [
        { width: parseFloat(cs.borderTopWidth) || blockWidth, color: cs.borderTopColor || blockColor, style: cs.borderTopStyle || blockStyle },
        { width: parseFloat(cs.borderRightWidth) || inlineWidth, color: cs.borderRightColor || inlineColor, style: cs.borderRightStyle || inlineStyle },
        { width: parseFloat(cs.borderBottomWidth) || blockWidth, color: cs.borderBottomColor || blockColor, style: cs.borderBottomStyle || blockStyle },
        { width: parseFloat(cs.borderLeftWidth) || inlineWidth, color: cs.borderLeftColor || inlineColor, style: cs.borderLeftStyle || inlineStyle },
    ]

    // Also check shorthand border
    const shorthandWidth = parseFloat(cs.borderWidth) || 0
    const shorthandColor = cs.borderColor
    const shorthandStyle = cs.borderStyle

    // Find the thickest non-transparent, resolvable border
    let best = sides[0]
    for (const side of sides) {
        if (side.width > best.width && side.color && !isTransparentColor(side.color) && !isUnresolvableColor(side.color)) {
            best = side
        }
    }

    // If individual sides found nothing, try shorthand
    if (best.width === 0 && shorthandWidth > 0 && shorthandColor && !isTransparentColor(shorthandColor) && !isUnresolvableColor(shorthandColor)) {
        best = { width: shorthandWidth, color: shorthandColor, style: shorthandStyle || 'solid' }
    }

    if (best.width === 0) return undefined
    if (!best.color || isTransparentColor(best.color) || isUnresolvableColor(best.color)) return undefined

    const color = rgbToHex(best.color)

    return {
        color,
        width: best.width,
        style: (best.style === 'dashed' ? 'dashed'
            : best.style === 'dotted' ? 'dotted'
                : 'solid') as 'solid' | 'dashed' | 'dotted',
        position: 'inside',
        opacity: rgbToOpacity(best.color),
        visible: true,
    }
}

function extractBorderRadius(cs: CSSStyleDeclaration): BorderRadius {
    const tl = parseFloat(cs.borderTopLeftRadius) || 0
    const tr = parseFloat(cs.borderTopRightRadius) || 0
    const br = parseFloat(cs.borderBottomRightRadius) || 0
    const bl = parseFloat(cs.borderBottomLeftRadius) || 0

    // Also check shorthand
    if (tl === 0 && tr === 0 && br === 0 && bl === 0 && cs.borderRadius) {
        const val = parseFloat(cs.borderRadius)
        if (val > 0) return val
    }

    if (tl === tr && tr === br && br === bl) return tl
    return { topLeft: tl, topRight: tr, bottomRight: br, bottomLeft: bl }
}

function extractFills(cs: CSSStyleDeclaration): Fill[] {
    const fills: Fill[] = []

    // Background image (gradients or URLs)
    const bgImage = cs.backgroundImage
    let hasGradientOrImage = false
    if (bgImage && bgImage !== 'none') {
        if (bgImage.includes('gradient')) {
            const gradientFill = parseGradientFromComputed(bgImage)
            if (gradientFill) {
                fills.push(gradientFill)
                hasGradientOrImage = true
            }
        } else if (bgImage.includes('url(')) {
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
                hasGradientOrImage = true
            }
        }
    }

    // Background color
    const bgColor = cs.backgroundColor
    if (!hasGradientOrImage && bgColor && !isTransparentColor(bgColor)) {
        fills.push({
            type: 'solid',
            id: generateId(),
            color: rgbToHex(bgColor),
            opacity: rgbToOpacity(bgColor),
            visible: true,
        })
    }

    return fills
}

function extractLayerBlur(filter: string): { layerBlur: number } | Record<string, never> {
    if (!filter || filter === 'none') return {}
    const match = filter.match(/blur\(\s*([\d.]+)px\s*\)/)
    if (!match) return {}
    const val = parseFloat(match[1])
    return val > 0 ? { layerBlur: val } : {}
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

    // Extract color — handle rgb(), rgba(), oklch(), color(), hex, and named colors
    const funcColorMatch = cleaned.match(/((?:rgba?|oklch|oklab|color)\([^)]+\))/)
    const hexColorMatch = !funcColorMatch ? cleaned.match(/(#[0-9a-fA-F]{3,8})\b/) : null

    let color: string
    let colorRaw: string
    if (funcColorMatch) {
        colorRaw = funcColorMatch[1]
        color = rgbToHex(colorRaw)
    } else if (hexColorMatch) {
        colorRaw = hexColorMatch[1]
        color = normalizeHex(colorRaw)
    } else {
        colorRaw = ''
        color = '#000000'
    }

    const opacity = colorRaw ? rgbToOpacity(colorRaw) : 1

    if (opacity < 1 && color !== 'transparent') {
        const hex = color.replace('#', '')
        const alphaHex = Math.round(opacity * 255).toString(16).padStart(2, '0')
        color = `#${hex}${alphaHex}`
    }

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

function directionToAngle(dir: string): number {
    const normalized = dir.toLowerCase().replace(/\s+/g, ' ').trim()
    const map: Record<string, number> = {
        'top': 0, 'right': 90, 'bottom': 180, 'left': 270,
        'top right': 45, 'right top': 45,
        'bottom right': 135, 'right bottom': 135,
        'bottom left': 225, 'left bottom': 225,
        'top left': 315, 'left top': 315,
    }
    return map[normalized] ?? 180
}

function parseGradientFromComputed(bgImage: string): Fill | null {
    // linear-gradient
    const linearMatch = bgImage.match(/linear-gradient\((.+)\)/)
    if (linearMatch) {
        let content = linearMatch[1]

        // Strip color space hints: "in oklab", "in oklch", "in srgb"
        content = content.replace(/\s+in\s+\w+/g, '')

        let angle = 180
        const angleMatch = content.match(/^([\d.]+)deg/)
        if (angleMatch) {
            angle = parseFloat(angleMatch[1])
        } else {
            const dirMatch = content.match(/^to\s+([\w\s]+?)(?:\s*,)/)
            if (dirMatch) {
                angle = directionToAngle(dirMatch[1].trim())
            }
        }

        const stops: Array<{ position: number; color: string; opacity?: number }> = []

        // Match color functions + hex + transparent keyword
        const colorStopRegex = /((?:rgba?|oklch|oklab|color)\([^)]+\)|#[0-9a-fA-F]{3,8}|transparent)\s*([\d.]+%)?/g
        let match
        while ((match = colorStopRegex.exec(content)) !== null) {
            const raw = match[1]
            if (raw === 'transparent') {
                stops.push({
                    position: match[2] ? parseFloat(match[2]) / 100 : -1,
                    color: '#000000',
                    opacity: 0,
                })
            } else if (raw.startsWith('#')) {
                stops.push({
                    position: match[2] ? parseFloat(match[2]) / 100 : -1,
                    color: normalizeHex(raw),
                    opacity: 1,
                })
            } else {
                stops.push({
                    position: match[2] ? parseFloat(match[2]) / 100 : -1,
                    color: rgbToHex(raw),
                    opacity: rgbToOpacity(raw),
                })
            }
        }

        if (stops.length > 0) {
            const hasPositions = stops.some(s => s.position >= 0)
            if (!hasPositions) {
                stops.forEach((s, idx) => { s.position = idx / Math.max(1, stops.length - 1) })
            } else {
                stops.forEach((s, idx) => {
                    if (s.position < 0) s.position = idx / Math.max(1, stops.length - 1)
                })
            }
        }

        // Fallback: hex colors
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
        let content = radialMatch[1]
        // Strip color space hints
        content = content.replace(/\s+in\s+\w+/g, '')

        const stops: Array<{ position: number; color: string; opacity?: number }> = []
        const colorStopRegex = /((?:rgba?|oklch|oklab|color)\([^)]+\)|#[0-9a-fA-F]{3,8}|transparent)\s*([\d.]+%)?/g
        let match
        while ((match = colorStopRegex.exec(content)) !== null) {
            const raw = match[1]
            if (raw === 'transparent') {
                stops.push({
                    position: match[2] ? parseFloat(match[2]) / 100 : -1,
                    color: '#000000',
                    opacity: 0,
                })
            } else if (raw.startsWith('#')) {
                stops.push({
                    position: match[2] ? parseFloat(match[2]) / 100 : -1,
                    color: normalizeHex(raw),
                    opacity: 1,
                })
            } else {
                stops.push({
                    position: match[2] ? parseFloat(match[2]) / 100 : -1,
                    color: rgbToHex(raw),
                    opacity: rgbToOpacity(raw),
                })
            }
        }
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

    // Fallback: store raw CSS gradient string
    return {
        type: 'gradient',
        id: generateId(),
        gradient: bgImage,
        visible: true,
        opacity: 1,
    }
}

// ═══════════════════════════════════════════════════
// Sizing Inference — DIRECT from CSS (no display:none trick)
// ═══════════════════════════════════════════════════

/**
 * Infer container sizing directly from inline CSS values.
 *
 * Key rules:
 *   - width: 100%  → fill
 *   - width: Npx   → fixed
 *   - flex: 1 / flexGrow > 0 → fill (on main axis)
 *   - No width set + block-level display → fill
 *   - Otherwise → hug
 */
function inferContainerSizing(
    el: HTMLElement,
    cs: CSSStyleDeclaration,
): Sizing {
    const isAbsoluteOrFixed = cs.position === 'absolute' || cs.position === 'fixed'

    // Read parent's inline style for context
    const parentEl = el.parentElement
    const parentStyle = parentEl?.style
    const parentIsFlexRow = parentStyle?.display === 'flex' &&
        (parentStyle.flexDirection === 'row' || parentStyle.flexDirection === '' || !parentStyle.flexDirection)
    const parentIsFlexCol = parentStyle?.display === 'flex' &&
        parentStyle.flexDirection === 'column'
    const parentIsGrid = parentStyle?.display === 'grid'

    let horizontal: 'fixed' | 'hug' | 'fill' = 'hug'
    let vertical: 'fixed' | 'hug' | 'fill' = 'hug'

    const widthVal = cs.width
    const heightVal = cs.height

    // Helper: check if value is 100% (fill)
    const isFull = (val: string) => {
        if (val === '100%') return true
        const n = parseFloat(val)
        return val.endsWith('%') && n >= 99.5
    }

    // Helper: check if cross-axis is stretched
    const isCrossStretched = () => {
        const alignSelf = cs.alignSelf
        if (alignSelf === 'stretch') return true
        if (!alignSelf || alignSelf === 'auto') {
            const pai = parentStyle?.alignItems
            return !pai || pai === 'stretch'
        }
        return false
    }

    // ── Horizontal sizing ──
    if (parentIsGrid) {
        horizontal = 'fill'
    } else if (parentIsFlexRow) {
        if (parseFloat(cs.flexGrow) > 0 || cs.flex === '1' || cs.flex?.startsWith('1 ')) {
            horizontal = 'fill'
        } else if (widthVal && widthVal.endsWith('px')) {
            horizontal = 'fixed'
        } else if (widthVal && isFull(widthVal)) {
            horizontal = 'fill'
        } else {
            horizontal = 'hug'
        }
    } else if (parentIsFlexCol) {
        if (isCrossStretched()) {
            horizontal = 'fill'
        } else if (widthVal && widthVal.endsWith('px')) {
            horizontal = 'fixed'
        } else if (widthVal && isFull(widthVal)) {
            horizontal = 'fill'
        } else {
            horizontal = 'hug'
        }
    } else if (widthVal && widthVal.endsWith('px')) {
        horizontal = 'fixed'
    } else if (widthVal && isFull(widthVal)) {
        horizontal = 'fill'
    } else if (!widthVal || widthVal === 'auto' || widthVal === '') {
        // No width set: block-level elements fill, inline elements hug
        const display = cs.display
        const isBlockLevel = !display || BLOCK_DISPLAYS.has(display)
        horizontal = (isBlockLevel && !isAbsoluteOrFixed) ? 'fill' : 'hug'
    }

    // ── Vertical sizing ──
    if (parentIsFlexCol) {
        if (parseFloat(cs.flexGrow) > 0 || cs.flex === '1' || cs.flex?.startsWith('1 ')) {
            vertical = 'fill'
        } else if (heightVal && heightVal.endsWith('px')) {
            vertical = 'fixed'
        } else if (heightVal && isFull(heightVal)) {
            vertical = 'fill'
        } else {
            vertical = 'hug'
        }
    } else if (parentIsFlexRow) {
        if (isCrossStretched()) {
            if (!heightVal || heightVal === 'auto' || heightVal === '') {
                vertical = 'fill'
            } else if (heightVal.endsWith('px')) {
                vertical = 'fixed'
            } else if (isFull(heightVal)) {
                vertical = 'fill'
            }
        } else if (heightVal && heightVal.endsWith('px')) {
            vertical = 'fixed'
        } else if (heightVal && isFull(heightVal)) {
            vertical = 'fill'
        } else {
            vertical = 'hug'
        }
    } else if (parentIsGrid && heightVal && isFull(heightVal)) {
        vertical = 'fill'
    } else if (heightVal && heightVal.endsWith('px')) {
        vertical = 'fixed'
    } else if (heightVal && isFull(heightVal)) {
        vertical = 'fill'
    }
    // else leave as 'hug'

    return { horizontal, vertical }
}

function inferTextSizing(
    tag: string,
    cs: CSSStyleDeclaration,
): Sizing {
    const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
    const display = cs.display
    const isBlock = display === 'block' || !display
    const isInline = display === 'inline' || display === 'inline-block'

    // Explicit pixel width
    if (cs.width && cs.width.endsWith('px')) {
        const vertical = cs.height && cs.height.endsWith('px') ? 'fixed' as const : 'hug' as const
        return { horizontal: 'fixed', vertical }
    }

    // Check parent context from inline style
    const parentStyle = (typeof HTMLElement !== 'undefined' ? undefined : undefined) // not available without el
    // Without parent context in this simplified path, use tag semantics:
    if (isInline) return { horizontal: 'hug', vertical: 'hug' }
    if (isBlock || isHeading) return { horizontal: 'fill', vertical: 'hug' }
    return { horizontal: 'hug', vertical: 'hug' }
}

function inferAutoResize(tag: string, cs: CSSStyleDeclaration): TextNode['autoResize'] {
    if (cs.textOverflow === 'ellipsis') return 'none'
    if (cs.overflow === 'hidden' && cs.whiteSpace === 'nowrap') return 'none'

    const isBlock = cs.display === 'block' || !cs.display
    if (isBlock) return 'height'

    return 'width-and-height'
}

function inferMaxLines(cs: CSSStyleDeclaration): number {
    const clamp = (cs as unknown as Record<string, string>)['-webkit-line-clamp'] ||
        (cs as unknown as Record<string, string>)['webkitLineClamp']
    if (clamp && clamp !== 'none') return parseInt(clamp) || 1

    if (cs.whiteSpace === 'nowrap') return 1

    return 1
}

// ═══════════════════════════════════════════════════
// Text Content Extraction
// ═══════════════════════════════════════════════════

function extractTextContent(el: HTMLElement): string {
    const preserveWhitespace = el.style.whiteSpace === 'pre' || el.style.whiteSpace === 'pre-wrap'

    if (preserveWhitespace) {
        return el.textContent || ''
    }

    let text = ''
    for (const child of el.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
            text += child.textContent || ''
        } else if (child.nodeName === 'BR') {
            text += '\n'
        } else if (child.nodeType === Node.ELEMENT_NODE) {
            const childEl = child as HTMLElement
            const childTag = childEl.tagName.toLowerCase()
            const display = childEl.style.display
            if (INLINE_TAGS.has(childTag) || display === 'inline' || display === 'inline-block' || !display) {
                // For inline elements with no explicit display, include text if they are inline tags
                if (INLINE_TAGS.has(childTag) || display === 'inline' || display === 'inline-block') {
                    text += childEl.textContent || ''
                }
            }
        }
    }

    return text.replace(/[^\S\n]+/g, ' ').replace(/ ?\n ?/g, '\n').trim()
}

function isTextOnlyElement(el: HTMLElement, tag: string): boolean {
    if (TEXT_ONLY_TAGS.has(tag)) {
        if (el.children.length === 0) return true
        // Check if inline children have distinct styling
        for (const child of el.children) {
            const childStyle = (child as HTMLElement).style
            if (hasVisualProperties(childStyle)) return false
        }
        return true
    }

    // Flex/grid containers should never be flattened
    const display = el.style.display
    if (display === 'flex' || display === 'grid' || display === 'inline-flex' || display === 'inline-grid') {
        return false
    }

    if (el.children.length === 0) return !!el.textContent?.trim()

    // Check if ALL children are inline with no visual properties
    for (const child of el.children) {
        const childEl = child as HTMLElement
        const childTag = childEl.tagName?.toLowerCase()
        const childDisplay = childEl.style?.display

        // Children with flex/grid layout are never inline text
        if (childDisplay === 'flex' || childDisplay === 'grid' || childDisplay === 'inline-flex' || childDisplay === 'inline-grid') return false

        // Children that have their own element children are structural, not inline text
        if (childEl.children.length > 0) return false

        const isInline = INLINE_TAGS.has(childTag) || childDisplay === 'inline' || childDisplay === 'inline-block'
        if (!isInline) return false
        if (hasVisualProperties(childEl.style)) return false
    }

    return true
}

// ═══════════════════════════════════════════════════
// Node Naming
// ═══════════════════════════════════════════════════

function inferNodeName(el: HTMLElement, tag: string, children: ScytleNode[]): string {
    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel

    const dataName = el.getAttribute('data-name')
    if (dataName) return dataName

    if (SEMANTIC_NAMES[tag]) return SEMANTIC_NAMES[tag]

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

    const heading = el.querySelector('h1, h2, h3')
    if (heading?.textContent) return heading.textContent.trim().slice(0, 40)

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
    if (!value) return 'none'
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
 * Resolve currentColor in SVG by walking the parent chain's el.style.color.
 * Unlike iframe-parser which uses getComputedStyle, we walk up element.style.
 */
function resolveCurrentColor(el: SVGSVGElement, cs: CSSStyleDeclaration): string | undefined {
    const fill = el.getAttribute('fill')
    if (fill === 'none') return undefined
    if (fill === 'currentColor') {
        return resolveCurrentColorFromChain(el) || '#000000'
    }
    if (!fill) {
        const firstPath = el.querySelector('path, circle, rect, ellipse, polygon, polyline')
        const childFill = firstPath?.getAttribute('fill')
        if (childFill === 'none') return undefined
        if (childFill === 'currentColor' || !childFill) {
            return resolveCurrentColorFromChain(el) || '#000000'
        }
        if (childFill.startsWith('#')) return childFill
        if (childFill.startsWith('rgb')) return rgbToHex(childFill)
        return resolveCurrentColorFromChain(el) || '#000000'
    }
    if (fill.startsWith('#')) return fill
    if (fill.startsWith('rgb')) return rgbToHex(fill)
    return resolveCurrentColorFromChain(el) || '#000000'
}

/**
 * Walk parent chain reading el.style.color to resolve currentColor.
 * Returns hex color or undefined.
 */
function resolveCurrentColorFromChain(el: Element): string | undefined {
    let current: Element | null = el
    while (current) {
        if (current instanceof HTMLElement && current.style.color) {
            return rgbToHex(current.style.color)
        }
        current = current.parentElement
    }
    return undefined
}

// ═══════════════════════════════════════════════════
// Visual Property Detection
// ═══════════════════════════════════════════════════

function hasVisualProperties(cs: CSSStyleDeclaration): boolean {
    const hasBg = !!cs.backgroundColor && !isTransparentColor(cs.backgroundColor)
    const hasBorder = (parseFloat(cs.borderTopWidth) > 0 || parseFloat(cs.borderWidth) > 0) &&
        (!!cs.borderTopColor ? !isTransparentColor(cs.borderTopColor) : !!cs.borderColor && !isTransparentColor(cs.borderColor))
    const hasShadow = !!cs.boxShadow && cs.boxShadow !== 'none'
    const hasBgImage = !!cs.backgroundImage && cs.backgroundImage !== 'none'
    const hasPadding = parseFloat(cs.paddingTop) > 0 ||
        parseFloat(cs.paddingRight) > 0 ||
        parseFloat(cs.paddingBottom) > 0 ||
        parseFloat(cs.paddingLeft) > 0 ||
        parseFloat(cs.padding) > 0
    const hasBorderRadius = parseFloat(cs.borderTopLeftRadius) > 0 ||
        parseFloat(cs.borderTopRightRadius) > 0 ||
        parseFloat(cs.borderBottomLeftRadius) > 0 ||
        parseFloat(cs.borderBottomRightRadius) > 0 ||
        parseFloat(cs.borderRadius) > 0

    return hasBg || hasBorder || hasShadow || hasBgImage || hasPadding || hasBorderRadius
}

// ═══════════════════════════════════════════════════
// Font Utilities
// ═══════════════════════════════════════════════════

function extractPrimaryFont(fontFamily: string): string {
    if (!fontFamily) return 'Inter'
    return fontFamily
        .split(',')[0]
        .trim()
        .replace(/^['"]|['"]$/g, '')
}

// ═══════════════════════════════════════════════════
// Theme Variable Matching (Exact-Match)
// ═══════════════════════════════════════════════════

function matchColor(hex: string, lm: LinkMaps): string | undefined {
    if (hex === 'transparent') return undefined
    return lm.colorMap.get(normalizeHex(hex))
}

function matchFont(family: string, lm: LinkMaps): string | undefined {
    const clean = family.replace(/['"]/g, '').split(',')[0].trim().toLowerCase()
    return lm.fontMap.get(clean)
}

function matchFontSize(size: number, lm: LinkMaps): string | undefined {
    return lm.fontSizeMap.get(String(Math.round(size)))
}

function matchFontWeight(_weight: number, _lm: LinkMaps): string | undefined {
    return undefined
}

function matchRadius(r: BorderRadius, lm: LinkMaps): string | undefined {
    if (typeof r !== 'number') return undefined
    return lm.radiusMap.get(String(r))
}

function matchSpacing(value: number, lm: LinkMaps): string | undefined {
    if (value <= 0) return undefined
    return lm.spacingMap.get(String(Math.round(value)))
}

function matchShadow(shadows: Shadow[], lm: LinkMaps): string | undefined {
    if (shadows.length === 0) return undefined
    const s = shadows[0]
    const shadowStr = `${s.x}px ${s.y}px ${s.blur}px ${s.spread}px ${s.color}`
    return lm.shadowMap.get(normalizeShadow(shadowStr))
}

// ═══════════════════════════════════════════════════
// Dimension Estimation
// ═══════════════════════════════════════════════════

const CHAR_WIDTH_RATIO = 0.55

function estimateTextWidth(text: string, fontSize: number): number {
    if (!text) return 50
    return Math.ceil(text.length * fontSize * CHAR_WIDTH_RATIO)
}

function estimateContainerHeight(
    children: ScytleNode[],
    padding: Padding,
    layout: Layout,
): number {
    const gap = layout.gap || 0
    const direction = layout.direction || 'column'

    if (children.length === 0) return padding.top + padding.bottom + 40

    if (direction === 'column') {
        let total = padding.top + padding.bottom
        for (let i = 0; i < children.length; i++) {
            total += children[i].height || 40
            if (i > 0) total += gap
        }
        return total
    } else {
        const maxH = Math.max(...children.map(c => c.height || 40))
        return padding.top + padding.bottom + maxH
    }
}

// ═══════════════════════════════════════════════════
// Position Assignment
// ═══════════════════════════════════════════════════

function assignChildPositions(frame: FrameNode): void {
    if (frame.layout.mode === 'none') return

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

    const direction = frame.layout.direction || 'column'
    const gap = frame.layout.gap || 0

    let offset = 0
    let prevChildProcessed = false

    for (const child of frame.children) {
        if (child.positioning === 'absolute') continue

        const margin = child.margin || { top: 0, right: 0, bottom: 0, left: 0 }

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
