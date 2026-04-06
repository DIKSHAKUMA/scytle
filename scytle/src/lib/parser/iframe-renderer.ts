/**
 * IframeRenderer — manages a hidden iframe for browser-based HTML measurement.
 *
 * Lifecycle:
 *   1. create() — injects iframe into document.body (hidden, off-screen)
 *   2. render(html, options?) — writes HTML + Tailwind CDN + font imports into iframe
 *   3. waitForReady() — waits for Tailwind, fonts, and layout stability
 *   4. destroy() — removes iframe from DOM
 *
 * The iframe is reusable: call render() multiple times without recreating.
 *
 * Why iframe?
 *   - Real CSS engine: getComputedStyle() and getBoundingClientRect() give pixel-perfect values
 *   - Real text measurement: no CHAR_WIDTH_RATIO guessing
 *   - Real layout: flex, grid, text wrapping — all computed by the browser
 *   - Real color inheritance: CSS cascade works natively
 *   - Real font rendering: Google Fonts loaded and measured accurately
 */

// ═══════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════

export interface IframeRendererOptions {
    /** Width of the iframe viewport (default: 1440px) */
    width?: number
    /** Additional CSS to inject (e.g., custom font @imports) */
    customCSS?: string
    /** Google Font families to load before measuring */
    fonts?: string[]
}

// ═══════════════════════════════════════════════════
// Constants
// ═══════════════════════════════════════════════════

const DEFAULT_WIDTH = 1440

/** Maximum time (ms) to wait for Tailwind CSS to load */
const TAILWIND_TIMEOUT = 5000

/** Maximum time (ms) to wait for fonts to load */
const FONT_TIMEOUT = 3000

/** Tailwind v4 browser build — JIT compiles classes at runtime.
 *  v4 supports modern syntax: bg-linear-to-br, h-150, etc.
 *  Previous v3 CDN (cdn.tailwindcss.com) silently ignored v4 classes. */
const TAILWIND_CDN = 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4'

// ═══════════════════════════════════════════════════
// IframeRenderer Class
// ═══════════════════════════════════════════════════

export class IframeRenderer {
    private iframe: HTMLIFrameElement | null = null

    /**
     * Create and append the hidden iframe to document.body.
     *
     * The iframe is positioned off-screen with `visibility: hidden`
     * so it participates in layout but is invisible to the user.
     *
     * Why `visibility: hidden` not `display: none`?
     *   `display: none` removes the element from layout —
     *   `getComputedStyle()` and `getBoundingClientRect()` return zeros.
     *   `visibility: hidden` keeps layout intact but hides visually.
     *
     * Why `position: fixed; top: -10000px`?
     *   Prevents any visual flash. The iframe renders off-screen.
     */
    create(options?: IframeRendererOptions): void {
        if (this.iframe) return // Already created

        const width = options?.width ?? DEFAULT_WIDTH

        const iframe = document.createElement('iframe')
        iframe.style.cssText = `
            position: fixed;
            top: -10000px;
            left: -10000px;
            width: ${width}px;
            height: 0;
            border: none;
            visibility: hidden;
            pointer-events: none;
        `
        // sandbox — allow scripts (for Tailwind JIT) but block navigation/popups
        iframe.sandbox.add('allow-scripts', 'allow-same-origin')
        document.body.appendChild(iframe)
        this.iframe = iframe
    }

    /**
     * Write HTML content into the iframe with Tailwind CDN and font imports.
     * Returns a promise that resolves when fonts are loaded and layout is stable.
     *
     * @param html — raw HTML string (the AI-generated HTML)
     * @param options — fonts to load, custom CSS, viewport width
     * @returns Promise<Document> — the iframe's contentDocument after layout
     */
    async render(html: string, options?: IframeRendererOptions): Promise<Document> {
        if (!this.iframe) {
            throw new Error('IframeRenderer not created — call create() first')
        }

        const doc = this.iframe.contentDocument
        if (!doc) {
            throw new Error('IframeRenderer: contentDocument is null — iframe not ready')
        }

        const width = options?.width ?? DEFAULT_WIDTH

        // Update iframe width for layout calculation
        this.iframe.style.width = `${width}px`

        // Build Google Fonts import tags
        const fontImports = (options?.fonts ?? [])
            .map(f => {
                const family = f.replace(/\s+/g, '+')
                return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${family}:wght@100;200;300;400;500;600;700;800;900&display=swap">`
            })
            .join('\n')

        // Write the full document with Tailwind CDN
        doc.open()
        doc.write(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=${width}">
    <script src="${TAILWIND_CDN}"><\/script>
    ${fontImports}
    <style>
        *, *::before, *::after { box-sizing: border-box; }
        body {
            margin: 0;
            padding: 0;
            width: ${width}px;
            overflow-x: hidden;
        }
        img {
            display: block;
            max-width: 100%;
        }
        /* Prevent images from breaking layout during measurement */
        img[src=""], img:not([src]) {
            width: 100%;
            min-height: 200px;
            background: #e5e7eb;
        }
        ${options?.customCSS ?? ''}
    </style>
</head>
<body>
    ${html}
</body>
</html>`)
        doc.close()

        // Wait for everything to stabilize
        await this.waitForReady(doc)

        // Auto-size iframe height to match content
        this.iframe.style.height = `${doc.body.scrollHeight}px`

        return doc
    }

    /**
     * Remove the iframe from DOM and clean up resources.
     * Safe to call multiple times.
     */
    destroy(): void {
        if (this.iframe) {
            this.iframe.remove()
            this.iframe = null
        }
    }

    /**
     * Check if the renderer has an active iframe.
     */
    get isAlive(): boolean {
        return this.iframe !== null
    }

    /**
     * Get the current iframe element (for testing/debugging).
     */
    get element(): HTMLIFrameElement | null {
        return this.iframe
    }

    // ═══════════════════════════════════════════════════
    // Private: Layout Stability Wait
    // ═══════════════════════════════════════════════════

    /**
     * Wait for:
     *   1. Tailwind CSS to load and process classes
     *   2. Google Fonts to load
     *   3. Images to load (for correct getBoundingClientRect dimensions)
     *   4. Layout to stabilize (two animation frames)
     */
    private async waitForReady(doc: Document): Promise<void> {
        // 1. Wait for Tailwind script to execute and generate styles
        await this.waitForTailwind(doc)

        // 2. Wait for fonts to load
        await this.waitForFonts(doc)

        // 3. Wait for images to load (for correct dimensions)
        await this.waitForImages(doc)

        // 4. Two animation frames for layout stabilization
        await this.waitForLayout()
    }

    /**
     * Wait for Tailwind CDN to load and process classes.
     * Supports both v3 (cdn.tailwindcss.com) and v4 (@tailwindcss/browser).
     * Both inject <style> elements — we poll for their presence.
     */
    private waitForTailwind(doc: Document): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            const startTime = Date.now()

            const check = () => {
                // Tailwind injects <style> tags with processed utility classes.
                // v3: single <style> with all utilities.
                // v4: may inject into <head> or use adopted stylesheets.
                const styles = doc.querySelectorAll('style')
                for (const style of styles) {
                    if (style.textContent && style.textContent.length > 50) {
                        resolve()
                        return
                    }
                }

                // v4 also checks: adopted stylesheets on document
                try {
                    const sheets = doc.styleSheets
                    for (let i = 0; i < sheets.length; i++) {
                        try {
                            const rules = sheets[i].cssRules
                            if (rules && rules.length > 5) {
                                resolve()
                                return
                            }
                        } catch {
                            // CORS-blocked stylesheet — skip
                        }
                    }
                } catch {
                    // styleSheets not accessible
                }

                // Timeout check
                if (Date.now() - startTime > TAILWIND_TIMEOUT) {
                    console.warn('[IframeRenderer] Tailwind CSS load timed out after', TAILWIND_TIMEOUT, 'ms')
                    resolve()
                    return
                }

                requestAnimationFrame(check)
            }

            // Give the script a moment to start loading
            setTimeout(check, 100)
        })
    }

    /**
     * Wait for Google Fonts to load using the FontFaceSet API.
     *
     * The tricky part: `doc.fonts.ready` can resolve instantly if
     * the Google Fonts CSS `<link>` hasn't been parsed yet (no font
     * faces declared = nothing to wait for). So we first wait for
     * at least one FontFace to appear, THEN wait for them to load.
     * Falls back to a timeout if the API isn't available.
     */
    private async waitForFonts(doc: Document): Promise<void> {
        try {
            if (doc.fonts && typeof doc.fonts.ready !== 'undefined') {
                // Phase 1: Wait for Google Fonts CSS to declare font faces.
                // The <link> tag fetches a CSS file which adds FontFace entries.
                // Poll until at least one FontFace exists, or timeout.
                const fontFaceDeadline = Date.now() + 2000
                while (doc.fonts.size === 0 && Date.now() < fontFaceDeadline) {
                    await new Promise(r => setTimeout(r, 100))
                }

                // Phase 2: Now that font faces are declared, wait for them to load.
                await Promise.race([
                    doc.fonts.ready,
                    new Promise(r => setTimeout(r, FONT_TIMEOUT)),
                ])
            } else {
                // fonts.ready not available — fallback wait
                await new Promise(r => setTimeout(r, 1500))
            }
        } catch {
            // Font loading failed — proceed anyway (text will use fallback fonts)
            console.warn('[IframeRenderer] Font loading failed, using fallback fonts')
        }
    }

    /**
     * Wait for images to load so their dimensions are available.
     * Only waits for images with real src URLs (not data: or empty).
     * Uses a timeout to avoid blocking indefinitely on broken images.
     */
    private async waitForImages(doc: Document): Promise<void> {
        const images = doc.querySelectorAll('img[src]')
        if (images.length === 0) return

        const IMAGE_TIMEOUT = 5000
        const promises: Promise<void>[] = []

        for (const img of images) {
            const imgEl = img as HTMLImageElement
            const src = imgEl.src || ''
            // Skip data URIs and empty sources — they won't provide intrinsic dimensions
            if (!src || src.startsWith('data:') || src === 'about:blank') continue
            // Already loaded
            if (imgEl.complete && imgEl.naturalHeight > 0) continue

            promises.push(new Promise<void>((resolve) => {
                const done = () => resolve()
                imgEl.addEventListener('load', done, { once: true })
                imgEl.addEventListener('error', done, { once: true })
            }))
        }

        if (promises.length === 0) return

        // Wait for all images or timeout
        await Promise.race([
            Promise.all(promises),
            new Promise(r => setTimeout(r, IMAGE_TIMEOUT)),
        ])
    }

    /**
     * Wait for layout to fully stabilize.
     * The animation frames ensure styles are applied and reflows complete.
     * The additional timeout handles async style injection (v4 browser build).
     */
    private waitForLayout(): Promise<void> {
        return new Promise<void>(resolve => {
            const win = this.iframe?.contentWindow
            if (!win) {
                resolve()
                return
            }

            win.requestAnimationFrame(() => {
                win.requestAnimationFrame(() => {
                    // Extra 50ms delay for async style injection (Tailwind v4)
                    setTimeout(resolve, 50)
                })
            })
        })
    }
}
