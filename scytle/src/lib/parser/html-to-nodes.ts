

import {
    createFrame, createText, createImage, createVector,
    type FrameNode, type TextNode, type ScytleNode, type VectorNode,
    type Fill, type Border,
} from '@/types/canvas'
import { parseClasses, parseInlineStyles, type ParsedStyles } from './class-parser'
import { resolveColor } from './color-map'
import { PAGE_WIDTH, estimateTextHeight, estimateContainerHeight, estimateContainerWidth } from './size-utils'
import { parseSvgToNetwork, computeBoundingBox, normalizeNetwork } from './svg-path-parser'

// ---- Element Classification ----

const TEXT_ONLY_ELEMENTS = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'label'])
const INLINE_ELEMENTS = new Set([
    'span', 'strong', 'em', 'b', 'i', 'a', 'code', 'small', 'sub', 'sup',
    'br', 'mark', 'abbr', 'cite', 'time', 'del', 'ins', 'kbd', 'var', 'u',
])
const SKIP_ELEMENTS = new Set(['script', 'style', 'noscript', 'meta', 'link', 'head', 'template'])

const HTML_TAG_MAP: Record<string, TextNode['htmlTag']> = {
    h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4', h5: 'h5', h6: 'h6',
    p: 'p', span: 'span', a: 'a', li: 'li',
}

const SECTION_TAG_NAMES: Record<string, string> = {
    section: 'Section', header: 'Header', footer: 'Footer',
    nav: 'Nav', main: 'Main', aside: 'Aside', article: 'Article',
    ul: 'List', ol: 'List', form: 'Form', figure: 'Figure',
    figcaption: 'Caption',
}

// ---- Public API ----

/**
 * Parse an HTML string into a ScytleNode tree.
 * Returns a single FrameNode representing the full page.
 *
 * The AI is expected to output a `<div>` root with `<section>` children.
 * The root div becomes the page frame, its sections become children.
 */
export function parseHtmlToNodes(html: string, pageName: string = 'Page', options?: { rootWidth?: number }): FrameNode {
    const sanitized = sanitizeHtml(html)
    const parser = new DOMParser()
    const doc = parser.parseFromString(sanitized, 'text/html')
    const body = doc.body

    // Find root element — typically the AI's wrapper <div>
    const root = body.firstElementChild || body
    const rootClasses = getClassList(root)
    const rootStyles = parseClasses(rootClasses)

    // Merge inline styles if present
    const inlineStyle = root.getAttribute('style')
    if (inlineStyle) {
        mergeInlineStyles(rootStyles, inlineStyle)
    }

    const effectiveColor = rootStyles.textColor || '#000000'

    // Check if root looks like a full-page container or a small component
    const isFullPage = rootStyles.width !== null ||
        rootStyles.minHeight !== null ||
        rootClasses.includes('min-h-screen') ||
        rootClasses.includes('h-screen')

    // Use explicit rootWidth option if provided, else parsed root width, else default for full pages
    const defaultWidth = options?.rootWidth || PAGE_WIDTH
    const rootWidth = rootStyles.width || (isFullPage ? defaultWidth : null)

    // Walk children of the root element
    const children = walkChildren(root, rootWidth || defaultWidth, effectiveColor)

    const fills = buildFills(rootStyles)
    const layoutMode = resolveLayoutMode(rootStyles)

    // Determine direction: respect explicit flex-row/flex-col, default to column for pages
    const direction = rootStyles.flexDirection

    // Sizing: full pages get fixed width, components hug
    const horizontalSizing = rootStyles.width ? 'fixed' : (isFullPage ? 'fixed' : 'hug')

    return createFrame({
        name: pageName,
        width: rootWidth || estimateContainerWidth(children, rootStyles.padding, rootStyles.gap, direction),
        height: rootStyles.minHeight || estimateContainerHeight(
            children,
            rootStyles.padding,
            rootStyles.gap,
            direction,
        ),
        sizing: { horizontal: horizontalSizing, vertical: rootStyles.minHeight ? 'fixed' : 'hug' },
        layout: {
            mode: layoutMode,
            direction, // Respect parsed direction instead of forcing column
            justify: rootStyles.justifyContent,
            align: rootStyles.alignItems,
            wrap: rootStyles.flexWrap || undefined,
            gap: rootStyles.gap || undefined,
            columns: layoutMode === 'grid' && rootStyles.gridColumns > 1
                ? rootStyles.gridColumns
                : undefined,
        },
        padding: rootStyles.padding,
        fills,
        overflow: rootStyles.overflow === 'auto' ? 'hidden' : rootStyles.overflow,
        borderRadius: rootStyles.borderRadiusPerCorner || rootStyles.borderRadius,
        children,
    })
}

// ---- Recursive DOM Walker ----

function walkElement(
    el: Element,
    parentWidth: number,
    inheritedColor: string,
): ScytleNode | null {
    const tag = el.tagName.toLowerCase()

    // Skip non-renderable elements
    if (SKIP_ELEMENTS.has(tag)) return null

    // Parse styles
    const classes = getClassList(el)
    const styles = parseClasses(classes)
    const inlineStyle = el.getAttribute('style')
    if (inlineStyle) mergeInlineStyles(styles, inlineStyle)

    // Skip hidden
    if (styles.hidden) return null

    // Text color inheritance
    const effectiveColor = styles.textColor || inheritedColor

    // ---- Dispatch by element type ----

    // <img>
    if (tag === 'img') return buildImageNode(el, styles)

    // <svg> → render as data URI image
    if (tag === 'svg') return buildSvgNode(el)

    // <hr> → thin divider frame
    if (tag === 'hr') return buildHrNode()

    // <video>, <iframe> → media placeholder
    if (tag === 'video' || tag === 'iframe') return buildMediaPlaceholder(el, tag)

    // h1-h6, p, label → always TextNode
    if (TEXT_ONLY_ELEMENTS.has(tag)) {
        return buildTextNode(el, tag, styles, effectiveColor, parentWidth)
    }

    // <button> or button-like <a> → FrameNode with TextNode child
    if (tag === 'button' || (tag === 'a' && isButtonLike(styles))) {
        return buildButtonNode(el, tag, styles, effectiveColor, parentWidth)
    }

    // Form inputs → placeholder frame
    if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        return buildInputNode(el, tag, styles, effectiveColor, parentWidth)
    }

    // <li> with only text AND no visual styling → TextNode
    if (tag === 'li' && hasOnlyInlineContent(el) && !hasVisualStyling(styles)) {
        return buildTextNode(el, 'li', styles, effectiveColor, parentWidth)
    }

    // Check if element has visual styling that requires it to be a FrameNode
    const hasVisuals = hasVisualStyling(styles)

    // Check if element is a layout container
    const isLayoutContainer = styles.display === 'flex' ||
        styles.display === 'grid' ||
        styles.display === 'inline-flex' ||
        classes.includes('flex') ||
        classes.includes('inline-flex') ||
        classes.includes('grid')

    // Any element with only text/inline content → TextNode
    // UNLESS it has:
    // 1. Explicit flex/grid layout
    // 2. Visual styling (bg, padding, borders, etc.) - these become FrameNode with TextNode child
    if (!isLayoutContainer && !hasVisuals && hasOnlyInlineContent(el) && el.textContent?.trim()) {
        return buildTextNode(el, tag, styles, effectiveColor, parentWidth)
    }

    // Container → FrameNode with recursive children
    // For styled inline elements with text, this will create Frame containing Text
    return buildContainerNode(el, tag, styles, effectiveColor, parentWidth)
}

function walkChildren(
    parent: Element,
    parentWidth: number,
    inheritedColor: string,
): ScytleNode[] {
    const nodes: ScytleNode[] = []
    for (const child of Array.from(parent.children)) {
        const node = walkElement(child, parentWidth, inheritedColor)
        if (node) nodes.push(node)
    }
    return nodes
}

// ---- Node Builders ----

/**
 * Build a FrameNode with ImageFill from an <img> element.
 *
 * Instead of creating an ImageNode, we create a FrameNode with an image fill.
 * This allows images to be edited through the Fill system (with crop, adjustments, etc.)
 * rather than requiring a separate Image section in the properties panel.
 */
function buildImageNode(el: Element, styles: ParsedStyles): ScytleNode {
    const src = el.getAttribute('src') || ''
    const alt = el.getAttribute('alt') || 'Image'
    const width = styles.width || parseInt(el.getAttribute('width') || '') || 300
    const height = styles.height || parseInt(el.getAttribute('height') || '') || 200

    // Map objectFit to ImageFill fit mode
    const objectFit = el.getAttribute('style')?.includes('object-fit')
        ? (el.getAttribute('style')?.match(/object-fit:\s*(\w+)/)?.[1] || 'cover')
        : 'cover'

    // Create ImageFill
    const imageFill: Fill = {
        type: 'image',
        src,
        fit: objectFit as 'cover' | 'contain' | 'fill',
        opacity: styles.opacity < 1 ? styles.opacity : undefined,
    }

    return createFrame({
        name: alt.slice(0, 40) || 'Image',
        width,
        height,
        sizing: {
            horizontal: styles.widthRatio ? 'fill' : (styles.width ? 'fixed' : 'fill'),
            vertical: 'fixed',
        },
        layout: { mode: 'none' },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        fills: src ? [imageFill] : [], // Only add fill if src exists
        borderRadius: styles.borderRadiusPerCorner || styles.borderRadius,
        overflow: 'hidden', // Clip image to frame bounds
        children: [],
    })
}

/**
 * Build a VectorNode from an SVG element.
 *
 * Converts SVG paths to VectorNetwork format for pen tool integration.
 * Falls back to ImageNode for complex SVGs that can't be parsed.
 *
 * Features:
 * - Parses SVG path data (M, L, C, Q, A, Z commands) to VectorNetwork
 * - Resolves currentColor from parent elements
 * - Extracts stroke/fill colors and weights
 * - Handles viewBox transformation
 */
function buildSvgNode(el: Element): ScytleNode {
    // 1. Clone SVG to avoid modifying original DOM
    const svgEl = el.cloneNode(true) as Element

    // 2. Get dimensions - prefer explicit width/height, fallback to viewBox
    let width = parseFloat(el.getAttribute('width') || '')
    let height = parseFloat(el.getAttribute('height') || '')
    let viewBoxMinX = 0, viewBoxMinY = 0, viewBoxWidth = 0, viewBoxHeight = 0

    const viewBox = el.getAttribute('viewBox')
    if (viewBox) {
        const parts = viewBox.split(/[\s,]+/).map(Number)
        if (parts.length >= 4) {
            viewBoxMinX = parts[0] || 0
            viewBoxMinY = parts[1] || 0
            viewBoxWidth = parts[2] || 24
            viewBoxHeight = parts[3] || 24
        }
    }

    if (isNaN(width) || width === 0) width = viewBoxWidth || 24
    if (isNaN(height) || height === 0) height = viewBoxHeight || 24

    // 3. Resolve currentColor from context
    const inheritedColor = resolveCurrentColor(el)

    // 4. Recursively replace currentColor in all elements
    replaceCurrentColorInElement(svgEl, inheritedColor)

    // 5. Extract stroke/fill properties from SVG or first path
    const strokeColor = extractSvgStrokeColor(svgEl, inheritedColor)
    const strokeWeight = extractSvgStrokeWeight(svgEl)
    const fillColor = extractSvgFillColor(svgEl, inheritedColor)
    const hasFill = fillColor !== 'none' && fillColor !== null

    // 6. Try to parse SVG paths into VectorNetwork
    const paths = svgEl.querySelectorAll('path')
    if (paths.length === 0) {
        // No paths - fall back to ImageNode for complex shapes (circle, rect, etc.)
        return buildSvgAsImage(el, svgEl, width, height)
    }

    try {
        // Parse all paths into a single VectorNetwork
        const network = parseSvgToNetwork(svgEl)

        if (network.vertices.length === 0) {
            // Parsing failed or empty paths - fall back to ImageNode
            return buildSvgAsImage(el, svgEl, width, height)
        }

        // Normalize vertices so bounding box starts at (0, 0)
        normalizeNetwork(network)
        const bounds = computeBoundingBox(network)

        // Scale vertices if viewBox differs from display size
        if (viewBoxWidth && viewBoxHeight && (viewBoxWidth !== width || viewBoxHeight !== height)) {
            const scaleX = width / viewBoxWidth
            const scaleY = height / viewBoxHeight
            for (const v of network.vertices) {
                v.x = (v.x - viewBoxMinX) * scaleX
                v.y = (v.y - viewBoxMinY) * scaleY
            }
            // Recalculate bounds after scaling
            const newBounds = computeBoundingBox(network)
            bounds.width = newBounds.width
            bounds.height = newBounds.height
        }

        // 7. Extract meaningful name
        const name = extractSvgName(el)

        // 8. Build fills array if SVG has fill
        const fills: Fill[] = hasFill && fillColor
            ? [{ type: 'solid', color: fillColor }]
            : []

        return createVector({
            name,
            width: bounds.width || width,
            height: bounds.height || height,
            vectorNetwork: network,
            strokeColor,
            strokeWeight,
            strokeOpacity: 1,
            strokeVisible: true,
            strokeCap: 'ROUND',
            strokeJoin: 'ROUND',
            handleMirroring: 'NONE',
            fills,
            sizing: { horizontal: 'fixed', vertical: 'fixed' },
            positioning: 'auto', // Use auto so it flows in parent layout
        })
    } catch {
        // Parsing error - fall back to ImageNode
        return buildSvgAsImage(el, svgEl, width, height)
    }
}

/**
 * Build a FrameNode with ImageFill from an SVG element (fallback for complex SVGs).
 * Used when SVG cannot be parsed into VectorNetwork (e.g., has circle, rect, etc.).
 */
function buildSvgAsImage(originalEl: Element, svgEl: Element, width: number, height: number): ScytleNode {
    const serializer = new XMLSerializer()
    let svgMarkup = serializer.serializeToString(svgEl)

    // Ensure xmlns for standalone rendering
    if (!svgMarkup.includes('xmlns=')) {
        svgMarkup = svgMarkup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    const dataUri = `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`
    const name = extractSvgName(originalEl)

    // Create ImageFill with the SVG data URI
    const imageFill: Fill = {
        type: 'image',
        src: dataUri,
        fit: 'contain',
    }

    return createFrame({
        name,
        width,
        height,
        sizing: { horizontal: 'fixed', vertical: 'fixed' },
        layout: { mode: 'none' },
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        fills: [imageFill],
        overflow: 'visible',
        children: [],
    })
}

/**
 * Extract stroke color from SVG element.
 */
function extractSvgStrokeColor(svgEl: Element, fallback: string): string {
    // Check SVG root first
    let stroke = svgEl.getAttribute('stroke')
    if (stroke && stroke !== 'none' && stroke !== 'currentColor') {
        return stroke
    }

    // Check first path
    const path = svgEl.querySelector('path')
    if (path) {
        stroke = path.getAttribute('stroke')
        if (stroke && stroke !== 'none' && stroke !== 'currentColor') {
            return stroke
        }
    }

    // Return fallback (resolved currentColor)
    return fallback
}

/**
 * Extract stroke weight from SVG element.
 */
function extractSvgStrokeWeight(svgEl: Element): number {
    let weight = svgEl.getAttribute('stroke-width')
    if (weight) {
        const parsed = parseFloat(weight)
        if (!isNaN(parsed)) return parsed
    }

    const path = svgEl.querySelector('path')
    if (path) {
        weight = path.getAttribute('stroke-width')
        if (weight) {
            const parsed = parseFloat(weight)
            if (!isNaN(parsed)) return parsed
        }
    }

    return 2 // Default stroke weight
}

/**
 * Extract fill color from SVG element.
 */
function extractSvgFillColor(svgEl: Element, fallback: string): string | null {
    let fill = svgEl.getAttribute('fill')
    if (fill === 'none') return null
    if (fill && fill !== 'currentColor') return fill

    const path = svgEl.querySelector('path')
    if (path) {
        fill = path.getAttribute('fill')
        if (fill === 'none') return null
        if (fill && fill !== 'currentColor') return fill
    }

    // Most icons use stroke-only, not fill
    return null
}

/**
 * Recursively replace currentColor in an element's attributes and inline styles.
 * Handles: fill, stroke, color, stop-color attributes and style attribute.
 */
function replaceCurrentColorInElement(el: Element, resolvedColor: string): void {
    // Attributes that can contain currentColor
    const colorAttrs = ['fill', 'stroke', 'color', 'stop-color', 'flood-color', 'lighting-color']

    for (const attr of colorAttrs) {
        const value = el.getAttribute(attr)
        if (value === 'currentColor') {
            el.setAttribute(attr, resolvedColor)
        }
    }

    // Handle style attribute
    const style = el.getAttribute('style')
    if (style && style.includes('currentColor')) {
        el.setAttribute('style', style.replace(/currentColor/gi, resolvedColor))
    }

    // Recurse into children
    for (const child of Array.from(el.children)) {
        replaceCurrentColorInElement(child, resolvedColor)
    }
}

/**
 * Extract a meaningful name from an SVG element.
 * Priority: aria-label > title element > class name > default "Icon"
 */
function extractSvgName(el: Element): string {
    // 1. aria-label
    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel

    // 2. title element
    const titleEl = el.querySelector('title')
    if (titleEl?.textContent) return titleEl.textContent.trim()

    // 3. Look for icon library class names (lucide, heroicons, etc.)
    const classList = (el.getAttribute('class') || '').split(/\s+/)
    for (const cls of classList) {
        // Common patterns: lucide-check, heroicon-check, icon-check
        if (cls.includes('lucide-') || cls.includes('heroicon-') || cls.includes('icon-')) {
            const iconName = cls.split('-').slice(1).join(' ')
            if (iconName) {
                return iconName.charAt(0).toUpperCase() + iconName.slice(1) + ' Icon'
            }
        }
    }

    // 4. Default
    return 'Icon'
}

/** Walk up from an SVG element to find the nearest text color for currentColor resolution */
function resolveCurrentColor(el: Element): string {
    // 1. Check SVG's own stroke/fill that's NOT currentColor (explicit color set)
    const svgFill = el.getAttribute('fill')
    const svgStroke = el.getAttribute('stroke')
    if (svgFill && svgFill !== 'none' && svgFill !== 'currentColor' && svgFill.startsWith('#')) {
        return svgFill
    }
    if (svgStroke && svgStroke !== 'none' && svgStroke !== 'currentColor' && svgStroke.startsWith('#')) {
        return svgStroke
    }

    // 2. Check element's own text color class
    const ownClasses = (el.getAttribute('class') || '').split(/\s+/)
    for (const cls of ownClasses) {
        const color = extractTextColor(cls)
        if (color) return color
    }

    // 3. Walk up the DOM tree
    let current = el.parentElement
    while (current) {
        const classes = (current.getAttribute('class') || '').split(/\s+/)

        // Check for text color
        for (const cls of classes) {
            const color = extractTextColor(cls)
            if (color) return color
        }

        // Check inline style
        const inlineColor = current.getAttribute('style')
        if (inlineColor) {
            const match = inlineColor.match(/(?:^|;)\s*color:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/)
            if (match) return match[1]
        }

        current = current.parentElement
    }

    // 4. Check for dark mode context - if in dark section, default to white
    const darkBgPatterns = [
        'bg-gray-900', 'bg-gray-800', 'bg-slate-900', 'bg-slate-800',
        'bg-zinc-900', 'bg-zinc-800', 'bg-neutral-900', 'bg-neutral-800',
        'bg-stone-900', 'bg-stone-800', 'bg-black',
        // Also check for gradient dark backgrounds
        'from-gray-900', 'from-slate-900', 'from-zinc-900',
    ]

    let parent = el.parentElement
    while (parent) {
        const classes = (parent.getAttribute('class') || '').split(/\s+/)
        const isDark = classes.some(cls => darkBgPatterns.some(dark => cls === dark || cls.endsWith(':' + dark)))
        if (isDark) return '#ffffff'
        parent = parent.parentElement
    }

    // 5. Default: common body text color (gray-800)
    return '#1f2937'
}

/** Extract hex color from a text-* Tailwind class */
function extractTextColor(cls: string): string | null {
    // Skip non-color text classes
    const nonColorPrefixes = [
        'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
        'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl', 'text-6xl', 'text-7xl', 'text-8xl', 'text-9xl',
        'text-left', 'text-center', 'text-right', 'text-justify',
        'text-wrap', 'text-nowrap', 'text-balance', 'text-pretty',
    ]

    if (!cls.startsWith('text-')) return null

    // Skip responsive prefixes (sm:text-*, md:text-*, etc.)
    if (cls.includes(':')) {
        const baseCls = cls.split(':').pop()!
        if (!baseCls.startsWith('text-')) return null
        cls = baseCls
    }

    // Check if it's a non-color text class
    for (const prefix of nonColorPrefixes) {
        if (cls.startsWith(prefix)) return null
    }

    // Extract color value
    const colorVal = cls.slice(5) // remove 'text-'

    // Handle special colors
    if (colorVal === 'white') return '#ffffff'
    if (colorVal === 'black') return '#000000'
    if (colorVal === 'transparent') return 'transparent'
    if (colorVal === 'current' || colorVal === 'inherit') return null

    // Handle opacity modifiers: text-gray-500/50
    const [baseColor] = colorVal.split('/')

    const hex = resolveColor(baseColor)
    return hex || null
}

function buildHrNode(): ScytleNode {
    return createFrame({
        name: 'Divider',
        height: 1,
        sizing: { horizontal: 'fill', vertical: 'fixed' },
        fills: [{ type: 'solid', color: '#e5e7eb' }],
    })
}

function buildMediaPlaceholder(el: Element, tag: string): ScytleNode {
    const width = parseInt(el.getAttribute('width') || '') || 640
    const height = parseInt(el.getAttribute('height') || '') || 360
    return createImage({
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

function buildTextNode(
    el: Element,
    tag: string,
    styles: ParsedStyles,
    effectiveColor: string,
    parentWidth: number,
): TextNode {
    const text = getTextContent(el)
    const htmlTag = HTML_TAG_MAP[tag]
    const classList = getClassList(el)

    // === TEXT SIZING (Figma-aligned) ===
    // Figma's textAutoResize modes:
    //   'NONE' = fixed size
    //   'WIDTH_AND_HEIGHT' = hug both (auto width)
    //   'HEIGHT' = fixed width, auto height (default for paragraphs)
    //   'TRUNCATE' = fixed with ellipsis

    const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag)
    const isInline = INLINE_ELEMENTS.has(tag) || tag === 'span' || tag === 'a'

    // Check for explicit width classes
    const hasExplicitWidth = styles.width !== null
    const hasFillWidth = classList.some(cls => {
        const baseCls = cls.includes(':') ? cls.split(':').pop()! : cls
        return baseCls === 'w-full'
    })

    // Check for truncation
    const hasTruncate = classList.some(cls => {
        const baseCls = cls.includes(':') ? cls.split(':').pop()! : cls
        return baseCls === 'truncate' || baseCls.startsWith('line-clamp-')
    })

    // Determine sizing based on element type and context
    let sizing: { horizontal: 'fixed' | 'hug' | 'fill'; vertical: 'fixed' | 'hug' | 'fill' }
    let autoResize: 'none' | 'height' | 'width-and-height'

    if (hasTruncate) {
        // Truncated text needs fixed width
        sizing = { horizontal: hasFillWidth ? 'fill' : 'fixed', vertical: 'fixed' }
        autoResize = 'none'
    } else if (isHeading) {
        // Headings: fill container by default for proper text wrapping
        // In flex containers, headings should wrap at the container boundary
        if (hasFillWidth || hasExplicitWidth) {
            sizing = { horizontal: hasExplicitWidth ? 'fixed' : 'fill', vertical: 'hug' }
        } else {
            // Default: fill container width so text wraps correctly
            sizing = { horizontal: 'fill', vertical: 'hug' }
        }
        autoResize = 'height'
    } else if (isInline) {
        // Inline elements: always hug (they flow with text)
        sizing = { horizontal: 'hug', vertical: 'hug' }
        autoResize = 'width-and-height'
    } else if (hasExplicitWidth) {
        // Explicit width: fixed horizontal, hug vertical
        sizing = { horizontal: 'fixed', vertical: 'hug' }
        autoResize = 'height'
    } else {
        // Paragraphs and block text: fill width, hug height (Figma HEIGHT mode)
        sizing = { horizontal: 'fill', vertical: 'hug' }
        autoResize = 'height'
    }

    const width = computeTextWidth(styles, parentWidth)
    const lh = styles.lineHeight
    // Convert lineHeight to multiplier for height estimation
    // If lineHeight is > 10, it's in pixels (from text-* classes), otherwise it's a multiplier
    const lineHeightMultiplier = lh > 10 ? lh / styles.fontSize : lh

    return createText({
        name: text.slice(0, 40) + (text.length > 40 ? '...' : ''),
        characters: text,
        htmlTag,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        fontFamily: styles.fontFamily,
        fontStyle: styles.fontStyle === 'italic' ? 'italic' : undefined,
        lineHeight: lh,
        letterSpacing: styles.letterSpacing,
        textAlign: styles.textAlign,
        textTransform: styles.textTransform,
        textDecoration: styles.textDecoration,
        color: effectiveColor,
        width: sizing.horizontal === 'hug' ? estimateInlineTextWidth(text, styles.fontSize) : width,
        height: estimateTextHeight(text, styles.fontSize, width, lineHeightMultiplier),
        sizing,
        autoResize,
        opacity: styles.opacity,
        margin: styles.margin,
    })
}

function buildButtonNode(
    el: Element,
    _tag: string,
    styles: ParsedStyles,
    effectiveColor: string,
    parentWidth: number,
): FrameNode {
    const text = getTextContent(el)
    const fills = buildFills(styles)

    // Check if button has child elements (e.g., icon + text)
    if (el.children.length > 0 && !hasOnlyInlineContent(el)) {
        const childWidth = computeChildWidth(styles, parentWidth)
        const children = walkChildren(el, childWidth, effectiveColor)
        return createFrame({
            name: text.slice(0, 30) || 'Button',
            sizing: { horizontal: 'hug', vertical: 'hug' },
            layout: { mode: 'flex', direction: 'row', align: 'center', justify: 'center', gap: 8 },
            padding: styles.padding,
            fills,
            borderRadius: styles.borderRadiusPerCorner || styles.borderRadius,
            border: buildBorder(styles),
            shadows: styles.shadows.map(s => ({ ...s })),
            opacity: styles.opacity,
            children,
        })
    }

    // Simple button: FrameNode + TextNode child
    const textChild = createText({
        name: text || 'Button',
        characters: text || '',
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        color: effectiveColor,
        textAlign: 'center',
        lineHeight: styles.lineHeight,
        sizing: { horizontal: 'hug', vertical: 'hug' },
        autoResize: 'width-and-height',
        width: estimateInlineTextWidth(text || '', styles.fontSize),
        height: Math.ceil(styles.fontSize * styles.lineHeight),
    })

    return createFrame({
        name: text.slice(0, 30) || 'Button',
        sizing: { horizontal: 'hug', vertical: 'hug' },
        layout: { mode: 'flex', direction: 'row', align: 'center', justify: 'center' },
        padding: styles.padding,
        fills,
        borderRadius: styles.borderRadiusPerCorner || styles.borderRadius,
        border: buildBorder(styles),
        shadows: styles.shadows.map(s => ({ ...s })),
        opacity: styles.opacity,
        children: [textChild],
    })
}

function buildInputNode(
    el: Element,
    tag: string,
    styles: ParsedStyles,
    effectiveColor: string,
    _parentWidth: number,
): FrameNode {
    const placeholder = el.getAttribute('placeholder') || ''
    const label = tag === 'select'
        ? 'Select'
        : tag === 'textarea'
            ? 'Text area'
            : (placeholder || 'Input')

    const textChild = createText({
        name: label,
        characters: placeholder || label,
        fontSize: styles.fontSize || 14,
        fontWeight: 400,
        color: '#9ca3af', // gray-400 placeholder color
        lineHeight: 1.5,
        sizing: { horizontal: 'fill', vertical: 'hug' },
        autoResize: 'height',
    })

    return createFrame({
        name: label,
        sizing: { horizontal: 'fill', vertical: 'hug' },
        layout: { mode: 'flex', direction: 'row', align: 'center' },
        padding: styles.padding.top > 0
            ? styles.padding
            : { top: 8, right: 12, bottom: 8, left: 12 },
        fills: buildFills(styles).length > 0
            ? buildFills(styles)
            : [{ type: 'solid', color: '#ffffff' }],
        border: buildBorder(styles) || { color: '#d1d5db', width: 1, style: 'solid' },
        borderRadius: styles.borderRadius || 6,
        children: [textChild],
    })
}

function buildContainerNode(
    el: Element,
    tag: string,
    styles: ParsedStyles,
    effectiveColor: string,
    parentWidth: number,
): FrameNode | null {
    const classList = getClassList(el)
    const containerWidth = computeWidth(styles, parentWidth)

    // Determine section-level defaults early so padding affects child width
    const isSectionLevel = ['section', 'header', 'footer', 'nav', 'main', 'article'].includes(tag)
    const hasPadding = styles.padding.top > 0 || styles.padding.bottom > 0 ||
        styles.padding.left > 0 || styles.padding.right > 0
    const effectivePadding = hasPadding
        ? styles.padding
        : isSectionLevel
            ? { top: 64, right: 80, bottom: 64, left: 80 }
            : styles.padding

    const childWidth = containerWidth - effectivePadding.left - effectivePadding.right

    // Divide width among children in grid/flex-row layouts
    let effectiveChildWidth = childWidth
    if (styles.display === 'grid' && styles.gridColumns > 1) {
        const totalGap = (styles.gridColumns - 1) * (styles.gap || 0)
        effectiveChildWidth = Math.floor((childWidth - totalGap) / styles.gridColumns)
    } else if ((styles.display === 'flex' || styles.display === 'inline-flex') && styles.flexDirection === 'row') {
        const childCount = el.children.length
        if (childCount > 1) {
            const totalGap = (childCount - 1) * (styles.gap || 0)
            effectiveChildWidth = Math.floor((childWidth - totalGap) / childCount)
        }
    }

    let children = walkChildren(el, effectiveChildWidth, effectiveColor)

    // If container has only text content (no element children), create a TextNode child
    // This handles styled inline elements like <span class="bg-blue-500 text-white">Item A</span>
    if (children.length === 0 && hasOnlyInlineContent(el)) {
        const textContent = el.textContent?.trim()
        if (textContent) {
            // Use THIS element's text color if specified, otherwise inherit
            const textColor = styles.textColor || effectiveColor
            const textNode = buildTextNode(el, tag, styles, textColor, effectiveChildWidth)
            if (textNode) {
                children = [textNode]
            }
        }
    }

    // Drop empty containers unless they have visual properties
    const hasVisuals = styles.bgColor || styles.gradient || styles.borderWidth > 0 ||
        styles.padding.top > 0 || styles.padding.bottom > 0 ||
        styles.minHeight !== null || styles.height !== null
    if (children.length === 0 && !hasVisuals) return null

    const fills = buildFills(styles)

    // === LAYOUT MODE DETECTION (Figma-aligned) ===
    // 1. Check explicit display property
    let layoutMode = resolveLayoutMode(styles)

    // 2. Infer flex from utility classes if not explicitly set
    const isExplicitFlex = styles.display === 'flex' || styles.display === 'inline-flex'
    const isExplicitGrid = styles.display === 'grid'

    let direction: 'row' | 'column' = styles.flexDirection

    if (!isExplicitFlex && !isExplicitGrid) {
        const inferred = inferFlexFromClasses(classList)
        if (inferred.isInferred) {
            layoutMode = 'flex'
            direction = inferred.direction
        } else {
            // FIGMA DEFAULT: No auto-layout for containers without flex indicators
            // For sections, we still want column layout for document flow
            layoutMode = isSectionLevel ? 'flex' : 'none'
            direction = 'column'
        }
    }

    // === GAP HANDLING (Figma-aligned, Phase 2 enhanced) ===
    // Only use explicit gap - NO forced defaults!
    // Figma default: itemSpacing = 0
    // Support split gap-x/gap-y when specified
    const effectiveGap = styles.gap > 0 ? styles.gap : 0
    const effectiveColumnGap = styles.columnGap ?? effectiveGap
    const effectiveRowGap = styles.rowGap ?? effectiveGap

    // === SIZING LOGIC (Figma-aligned) ===
    // Default to 'hug' not 'fill'!
    const sizing = determineSizing(styles, classList, isSectionLevel)

    // === GRID PROPERTIES (Phase 2) ===
    const isGrid = layoutMode === 'grid'
    const gridColumns = isGrid && styles.gridColumns > 1 ? styles.gridColumns : undefined
    const gridRows = isGrid && styles.gridRows > 1 ? styles.gridRows : undefined

    return createFrame({
        name: getContainerName(tag, el),
        width: containerWidth,
        height: styles.height || estimateContainerHeight(
            children,
            effectivePadding,
            effectiveGap,
            direction,
        ),
        sizing,
        layout: {
            mode: layoutMode,
            direction,
            justify: styles.justifyContent,
            align: styles.alignItems,
            wrap: styles.flexWrap || undefined,
            gap: effectiveGap || undefined,
            columns: gridColumns,
            rows: gridRows,
            columnGap: isGrid ? effectiveColumnGap : undefined,
            rowGap: isGrid ? effectiveRowGap : undefined,
        },
        padding: effectivePadding,
        fills,
        border: buildBorder(styles),
        borderRadius: styles.borderRadiusPerCorner || styles.borderRadius,
        shadows: styles.shadows.map(s => ({ ...s })),
        opacity: styles.opacity,
        overflow: styles.overflow === 'auto' ? 'hidden' : styles.overflow,
        // === Phase 4: Min/max constraints ===
        minWidth: styles.minWidth ?? undefined,
        maxWidth: styles.maxWidth ?? undefined,
        minHeight: styles.minHeight ?? undefined,
        maxHeight: styles.maxHeight ?? undefined,
        // === Phase 4: Flex child properties ===
        flexShrink: styles.flexShrink ?? undefined,
        flexBasis: styles.flexBasis ?? undefined,
        order: styles.order ?? undefined,
        alignSelf: styles.alignSelf ?? undefined,
        // === Grid child properties ===
        gridColumnSpan: styles.gridColumnSpan ?? undefined,
        children,
    })
}

/**
 * Determine sizing for containers (Figma-aligned).
 * FIGMA BEHAVIOR: Default is 'hug' (shrink-wrap), not 'fill'!
 */
function determineSizing(
    styles: ParsedStyles,
    classList: string[],
    isSectionLevel: boolean
): { horizontal: 'fixed' | 'hug' | 'fill'; vertical: 'fixed' | 'hug' | 'fill' } {
    // === HORIZONTAL SIZING ===
    let horizontal: 'fixed' | 'hug' | 'fill' = 'hug' // Figma default

    // Check for fill indicators
    const fillHorizontal = classList.some(cls => {
        const baseCls = cls.includes(':') ? cls.split(':').pop()! : cls
        return baseCls === 'w-full' ||
            baseCls === 'flex-1' ||
            baseCls === 'grow' ||
            baseCls === 'flex-grow' ||
            baseCls === 'basis-full'
    })

    if (fillHorizontal || styles.widthRatio === 1 || styles.flexGrow) {
        horizontal = 'fill'
    } else if (styles.width) {
        horizontal = 'fixed'
    } else if (isSectionLevel) {
        // Sections typically fill width (they're document-level containers)
        horizontal = 'fill'
    }
    // else: stays 'hug' (Figma default)

    // === VERTICAL SIZING ===
    let vertical: 'fixed' | 'hug' | 'fill' = 'hug' // Figma default

    const fillVertical = classList.some(cls => {
        const baseCls = cls.includes(':') ? cls.split(':').pop()! : cls
        return baseCls === 'h-full' ||
            baseCls === 'h-screen' ||
            baseCls === 'min-h-full' ||
            baseCls === 'min-h-screen'
    })

    if (fillVertical) {
        vertical = 'fill'
    } else if (styles.height) {
        vertical = 'fixed'
    }
    // else: stays 'hug' (Figma default)

    return { horizontal, vertical }
}

// ---- Helpers ----

function sanitizeHtml(html: string): string {
    let clean = html
    // Strip script tags
    clean = clean.replace(/<script[\s\S]*?<\/script>/gi, '')
    // Strip event handlers (onclick, onload, onerror, etc.)
    clean = clean.replace(/\s+on\w+\s*=\s*"[^"]*"/gi, '')
    clean = clean.replace(/\s+on\w+\s*=\s*'[^']*'/gi, '')
    return clean
}

function getClassList(el: Element): string[] {
    return (el.getAttribute('class') || '').split(/\s+/).filter(Boolean)
}

function getTextContent(el: Element): string {
    return (el.textContent || '').replace(/\s+/g, ' ').trim()
}

function hasOnlyInlineContent(el: Element): boolean {
    for (const child of Array.from(el.childNodes)) {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const tag = (child as Element).tagName?.toLowerCase()
            if (!INLINE_ELEMENTS.has(tag)) return false
        }
    }
    return true
}

/**
 * Check if parsed styles have visual properties that require a FrameNode.
 * Elements with backgrounds, padding, borders, shadows should be frames, not plain text.
 */
function hasVisualStyling(styles: ParsedStyles): boolean {
    return (
        styles.bgColor !== null ||
        (styles.padding.top > 0 || styles.padding.right > 0 ||
            styles.padding.bottom > 0 || styles.padding.left > 0) ||
        styles.borderWidth > 0 ||
        styles.borderRadius > 0 ||
        styles.borderRadiusPerCorner !== null ||
        styles.shadows.length > 0 ||  // Fix: check array length, not null (default is [])
        styles.gradient !== null
    )
}

function isButtonLike(styles: ParsedStyles): boolean {
    return (
        styles.bgColor !== null ||
        (styles.padding.left >= 8 && styles.padding.right >= 8 &&
            styles.padding.top >= 4 && styles.padding.bottom >= 4) ||
        (styles.borderWidth > 0 && styles.borderRadius > 0)
    )
}

function mergeInlineStyles(target: ParsedStyles, style: string): void {
    const inline = parseInlineStyles(style)
    const t = target as unknown as Record<string, unknown>
    for (const [key, value] of Object.entries(inline)) {
        if (value !== undefined && value !== null) {
            t[key] = value
        }
    }
}

/**
 * Determine layout mode from explicit display classes.
 * FIGMA BEHAVIOR: Default is 'none' (absolute positioning), not flex!
 * Only return flex/grid when explicitly declared.
 */
function resolveLayoutMode(styles: ParsedStyles): 'flex' | 'grid' | 'none' {
    if (styles.display === 'flex' || styles.display === 'inline-flex') return 'flex'
    if (styles.display === 'grid') return 'grid'
    return 'none' // Figma default: no auto-layout
}

/**
 * Infer flex layout from utility classes even without explicit 'flex' class.
 * Checks for items-*, justify-*, gap-*, flex-row/col, space-x/y.
 */
function inferFlexFromClasses(classList: string[]): { isInferred: boolean; direction: 'row' | 'column' } {
    const flexIndicators = [
        'items-start', 'items-center', 'items-end', 'items-baseline', 'items-stretch',
        'justify-start', 'justify-center', 'justify-end', 'justify-between', 'justify-around', 'justify-evenly',
        'flex-row', 'flex-row-reverse', 'flex-col', 'flex-col-reverse',
        'flex-wrap', 'flex-nowrap',
    ]

    // Check for flex indicators or gap/space utilities
    const hasFlexIndicator = classList.some(cls => {
        // Remove responsive prefixes like sm:, md:, lg:
        const baseCls = cls.includes(':') ? cls.split(':').pop()! : cls
        return flexIndicators.includes(baseCls) ||
            baseCls.startsWith('gap-') ||
            baseCls.startsWith('space-x-') ||
            baseCls.startsWith('space-y-')
    })

    if (!hasFlexIndicator) {
        return { isInferred: false, direction: 'row' }
    }

    // Infer direction from classes
    const hasCol = classList.some(cls => {
        const baseCls = cls.includes(':') ? cls.split(':').pop()! : cls
        return baseCls === 'flex-col' || baseCls === 'flex-col-reverse'
    })

    return { isInferred: true, direction: hasCol ? 'column' : 'row' }
}

function buildFills(styles: ParsedStyles): Fill[] {
    if (styles.gradient) return [{ type: 'gradient', gradient: styles.gradient }]
    if (styles.bgColor && styles.bgColor !== 'transparent') {
        return [{ type: 'solid', color: styles.bgColor }]
    }
    return []
}

function buildBorder(styles: ParsedStyles): Border | undefined {
    if (styles.borderWidth <= 0 || styles.borderStyle === 'none') return undefined
    return {
        color: styles.borderColor,
        width: styles.borderWidth,
        style: styles.borderStyle,
    }
}

function computeWidth(styles: ParsedStyles, parentWidth: number): number {
    if (styles.width) return styles.width
    if (styles.widthRatio) return Math.round(parentWidth * styles.widthRatio)
    if (styles.maxWidth) return Math.min(parentWidth, styles.maxWidth)
    return parentWidth
}

function computeChildWidth(styles: ParsedStyles, parentWidth: number): number {
    return computeWidth(styles, parentWidth) - styles.padding.left - styles.padding.right
}

function computeTextWidth(styles: ParsedStyles, parentWidth: number): number {
    if (styles.maxWidth) return Math.min(parentWidth, styles.maxWidth)
    if (styles.width) return styles.width
    return parentWidth
}

function estimateInlineTextWidth(text: string, fontSize: number): number {
    return Math.ceil(text.length * fontSize * 0.55)
}

function getContainerName(tag: string, el: Element): string {
    const ariaLabel = el.getAttribute('aria-label')
    if (ariaLabel) return ariaLabel.slice(0, 40)

    // Infer name from first heading for section-level elements
    if (SECTION_TAG_NAMES[tag]) {
        const heading = el.querySelector('h1, h2, h3, h4, h5, h6')
        if (heading?.textContent?.trim()) {
            return heading.textContent.trim().slice(0, 40)
        }
    }

    return SECTION_TAG_NAMES[tag] || 'Container'
}
