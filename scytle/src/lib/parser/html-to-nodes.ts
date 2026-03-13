// ============================================================
// HTML → ScytleNode[] Parser
// Converts AI-generated HTML+Tailwind into a canvas node tree.
// Runs client-side (uses browser DOMParser).
// ============================================================

import {
    createFrame, createText, createImage,
    type FrameNode, type TextNode, type ScytleNode,
    type Fill, type Border,
} from '@/types/canvas'
import { parseClasses, parseInlineStyles, type ParsedStyles } from './class-parser'
import { resolveColor } from './color-map'
import { PAGE_WIDTH, estimateTextHeight, estimateContainerHeight } from './size-utils'

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
export function parseHtmlToNodes(html: string, pageName: string = 'Page'): FrameNode {
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

    // Use parsed root width if present (e.g., w-[390px] for mobile), else default
    const rootWidth = rootStyles.width || PAGE_WIDTH

    // Walk children of the root element
    const children = walkChildren(root, rootWidth, effectiveColor)

    const fills = buildFills(rootStyles)
    const layoutMode = resolveLayoutMode(rootStyles)

    return createFrame({
        name: pageName,
        width: rootWidth,
        height: rootStyles.minHeight || estimateContainerHeight(
            children,
            rootStyles.padding,
            rootStyles.gap,
            'column',
        ),
        sizing: { horizontal: 'fixed', vertical: rootStyles.minHeight ? 'fixed' : 'hug' },
        layout: {
            mode: layoutMode,
            direction: 'column', // Pages are always vertical stacks
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

    // <li> with only text → TextNode
    if (tag === 'li' && hasOnlyInlineContent(el)) {
        return buildTextNode(el, 'li', styles, effectiveColor, parentWidth)
    }

    // Any element with only text/inline content → TextNode
    if (hasOnlyInlineContent(el) && el.textContent?.trim()) {
        return buildTextNode(el, tag, styles, effectiveColor, parentWidth)
    }

    // Container → FrameNode with recursive children
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

function buildImageNode(el: Element, styles: ParsedStyles): ScytleNode {
    const src = el.getAttribute('src') || ''
    const alt = el.getAttribute('alt') || 'Image'
    const width = styles.width || parseInt(el.getAttribute('width') || '') || 300
    const height = styles.height || parseInt(el.getAttribute('height') || '') || 200

    return createImage({
        name: alt.slice(0, 40) || 'Image',
        width,
        height,
        src,
        alt,
        fit: 'cover',
        isPlaceholder: !src || src.includes('placeholder'),
        placeholderLabel: alt || 'Image',
        sizing: {
            horizontal: styles.widthRatio ? 'fill' : (styles.width ? 'fixed' : 'fill'),
            vertical: 'fixed',
        },
        borderRadius: styles.borderRadiusPerCorner || styles.borderRadius,
        opacity: styles.opacity,
    })
}

function buildSvgNode(el: Element): ScytleNode {
    const width = parseInt(el.getAttribute('width') || '') || 24
    const height = parseInt(el.getAttribute('height') || '') || 24

    // Serialize the SVG element to a data URI so it renders as a real image
    const serializer = new XMLSerializer()
    let svgMarkup = serializer.serializeToString(el)

    // Ensure the SVG has xmlns for standalone rendering
    if (!svgMarkup.includes('xmlns=')) {
        svgMarkup = svgMarkup.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }

    // Resolve `currentColor` to the inherited text color from the nearest parent
    // Walk up the DOM to find the closest parent with a text color class
    const inheritedColor = resolveCurrentColor(el)
    if (inheritedColor) {
        svgMarkup = svgMarkup.replace(/currentColor/g, inheritedColor)
    }

    const dataUri = `data:image/svg+xml,${encodeURIComponent(svgMarkup)}`

    return createImage({
        name: 'Icon',
        width,
        height,
        src: dataUri,
        alt: 'Icon',
        fit: 'contain',
        isPlaceholder: false,
        sizing: { horizontal: 'fixed', vertical: 'fixed' },
    })
}

/** Walk up from an SVG element to find the nearest text color for currentColor resolution */
function resolveCurrentColor(el: Element): string | null {
    let current = el.parentElement
    while (current) {
        const classes = (current.getAttribute('class') || '').split(/\s+/)
        for (const cls of classes) {
            if (cls.startsWith('text-') && !cls.startsWith('text-xs') && !cls.startsWith('text-sm') &&
                !cls.startsWith('text-base') && !cls.startsWith('text-lg') && !cls.startsWith('text-xl') &&
                !cls.startsWith('text-2xl') && !cls.startsWith('text-3xl') && !cls.startsWith('text-4xl') &&
                !cls.startsWith('text-5xl') && !cls.startsWith('text-6xl') && !cls.startsWith('text-7xl') &&
                !cls.startsWith('text-8xl') && !cls.startsWith('text-9xl') &&
                !cls.startsWith('text-left') && !cls.startsWith('text-center') && !cls.startsWith('text-right') &&
                !cls.startsWith('text-justify') && !cls.startsWith('text-wrap') && !cls.startsWith('text-nowrap') &&
                !cls.startsWith('text-balance') && !cls.startsWith('text-pretty')) {
                // Skip responsive prefixes
                if (cls.includes(':')) continue
                const colorVal = cls.slice(5) // remove 'text-'
                const hex = resolveColor(colorVal)
                if (hex) return hex
            }
        }
        // Also check inline style
        const inlineColor = current.getAttribute('style')
        if (inlineColor) {
            const match = inlineColor.match(/(?:^|;)\s*color:\s*(#[0-9a-fA-F]{3,8}|rgb[a]?\([^)]+\))/)
            if (match) return match[1]
        }
        current = current.parentElement
    }
    return '#6b7280' // gray-500 fallback
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
    const width = computeTextWidth(styles, parentWidth)
    const lh = styles.lineHeight

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
        width,
        height: estimateTextHeight(text, styles.fontSize, width, lh),
        sizing: { horizontal: 'fill', vertical: 'hug' },
        autoResize: 'height',
        opacity: styles.opacity,
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

    const children = walkChildren(el, effectiveChildWidth, effectiveColor)

    // Drop empty containers unless they have visual properties
    const hasVisuals = styles.bgColor || styles.gradient || styles.borderWidth > 0 ||
        styles.padding.top > 0 || styles.padding.bottom > 0 ||
        styles.minHeight !== null || styles.height !== null
    if (children.length === 0 && !hasVisuals) return null

    const fills = buildFills(styles)
    const layoutMode = resolveLayoutMode(styles)

    // Block elements default to column (vertical stack) like natural document flow.
    // Only explicitly flex elements keep their parsed direction.
    const isExplicitFlex = styles.display === 'flex' || styles.display === 'inline-flex'
    const direction = isExplicitFlex ? styles.flexDirection : 'column'

    // Use a sensible default gap for containers without explicit gap.
    // Sections and large containers get generous gaps matching professional design standards.
    const effectiveGap = styles.gap > 0
        ? styles.gap
        : direction === 'column' && children.length > 1
            ? (isSectionLevel ? 32 : 16)
            : direction === 'row' && children.length > 1
                ? 16
                : 0

    return createFrame({
        name: getContainerName(tag, el),
        width: containerWidth,
        height: styles.height || estimateContainerHeight(
            children,
            effectivePadding,
            effectiveGap,
            direction,
        ),
        sizing: {
            horizontal: styles.flexGrow || styles.widthRatio === 1
                ? 'fill'
                : (styles.width ? 'fixed' : 'fill'),
            vertical: styles.height ? 'fixed' : 'hug',
        },
        layout: {
            mode: layoutMode,
            direction,
            justify: styles.justifyContent,
            align: styles.alignItems,
            wrap: styles.flexWrap || undefined,
            gap: effectiveGap || undefined,
            columns: layoutMode === 'grid' && styles.gridColumns > 1
                ? styles.gridColumns
                : undefined,
            columnGap: layoutMode === 'grid' && effectiveGap ? effectiveGap : undefined,
            rowGap: layoutMode === 'grid' && effectiveGap ? effectiveGap : undefined,
        },
        padding: effectivePadding,
        fills,
        border: buildBorder(styles),
        borderRadius: styles.borderRadiusPerCorner || styles.borderRadius,
        shadows: styles.shadows.map(s => ({ ...s })),
        opacity: styles.opacity,
        overflow: styles.overflow === 'auto' ? 'hidden' : styles.overflow,
        children,
    })
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

function resolveLayoutMode(styles: ParsedStyles): 'flex' | 'grid' | 'none' {
    if (styles.display === 'flex' || styles.display === 'inline-flex') return 'flex'
    if (styles.display === 'grid') return 'grid'
    return 'flex' // Default containers to flex column for canvas
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
