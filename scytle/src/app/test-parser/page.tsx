'use client'

import { useState, useRef, useCallback } from 'react'

// ═══════════════════════════════════════════════════════════════
// Test Page: Iframe (measure) vs DOMParser (preserve) approach
// ═══════════════════════════════════════════════════════════════

// ─── Test HTML snippets (inline styles — work for both approaches) ───

const TEST_CASES: { name: string; html: string }[] = [
  {
    name: '1. Absolute Positioning (Hero Overlay)',
    html: `
<section style="position: relative; width: 100%; min-height: 600px; background: #1a1a2e;">
  <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(to bottom, transparent 40%, #1a1a2e 100%);"></div>
  <div style="position: absolute; bottom: 40px; left: 60px; right: 60px;">
    <h1 style="font-family: 'Space Grotesk', sans-serif; font-size: 64px; font-weight: 800; color: #ffffff; margin: 0; line-height: 1.1;">Bold Hero Title</h1>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 20px; color: #a0a0b0; margin: 0; margin-top: 16px;">Subtitle text that should span the full available width between left and right constraints</p>
  </div>
</section>`,
  },
  {
    name: '2. Flexbox Cards (flex:1 + fixed width)',
    html: `
<section style="display: flex; gap: 24px; padding: 40px; background: #ffffff; width: 100%;">
  <div style="flex: 1; padding: 32px; background: #f5f5f5; border-radius: 12px;">
    <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0;">Flexible Card</h3>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #666666; margin: 0; margin-top: 12px;">This card uses flex:1 and should grow to fill available space.</p>
  </div>
  <div style="width: 300px; flex-shrink: 0; padding: 32px; background: #f5f5f5; border-radius: 12px;">
    <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0;">Fixed 300px</h3>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #666666; margin: 0; margin-top: 12px;">This card has explicit width: 300px.</p>
  </div>
  <div style="flex: 1; padding: 32px; background: #f5f5f5; border-radius: 12px;">
    <h3 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 0;">Flexible Card 2</h3>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #666666; margin: 0; margin-top: 12px;">Another flex:1 card. Should be same width as the first flexible card.</p>
  </div>
</section>`,
  },
  {
    name: '3. CSS Grid (span 2 + gap)',
    html: `
<section style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; padding: 40px; background: #0a0a0f; width: 100%;">
  <div style="grid-column: span 2; padding: 40px; background: #1a1a2e; border-radius: 16px;">
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 36px; font-weight: 700; color: #ffffff; margin: 0;">Wide Card (span 2)</h2>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #888; margin: 0; margin-top: 12px;">This card spans 2 of 3 grid columns.</p>
  </div>
  <div style="padding: 40px; background: #1a1a2e; border-radius: 16px;">
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 600; color: #ffffff; margin: 0;">Small Card</h2>
  </div>
  <div style="padding: 40px; background: #1a1a2e; border-radius: 16px;">
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 600; color: #ffffff; margin: 0;">Card A</h2>
  </div>
  <div style="padding: 40px; background: #1a1a2e; border-radius: 16px;">
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 600; color: #ffffff; margin: 0;">Card B</h2>
  </div>
  <div style="padding: 40px; background: #1a1a2e; border-radius: 16px;">
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 600; color: #ffffff; margin: 0;">Card C</h2>
  </div>
</section>`,
  },
  {
    name: '4. Absolute Badge + Border + Shadow',
    html: `
<section style="padding: 60px; background: #ffffff; width: 100%;">
  <div style="position: relative; border: 1px solid #e0e0e0; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="position: absolute; top: -16px; left: 32px; background: #ff4d00; color: #ffffff; padding: 8px 20px; border-radius: 8px; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600;">NEW</div>
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 32px; font-weight: 700; color: #1a1a1a; margin: 0; margin-top: 16px;">Feature Card with Badge</h2>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #666; margin: 0; margin-top: 12px;">Card with absolute-positioned badge, border, box-shadow, and border-radius. The badge should overflow above the card.</p>
  </div>
</section>`,
  },
  {
    name: '5. Nested Flex + Margin Auto (Centered Nav)',
    html: `
<nav style="display: flex; align-items: center; justify-content: space-between; padding: 16px 60px; background: #ffffff; border-bottom: 1px solid #eee; width: 100%;">
  <div style="font-family: 'Space Grotesk', sans-serif; font-size: 24px; font-weight: 800; color: #1a1a1a;">Logo</div>
  <div style="display: flex; gap: 32px; align-items: center;">
    <a style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #1a1a1a; text-decoration: none;">Features</a>
    <a style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #1a1a1a; text-decoration: none;">Pricing</a>
    <a style="font-family: 'DM Sans', sans-serif; font-size: 16px; color: #1a1a1a; text-decoration: none;">About</a>
  </div>
  <button style="background: #ff4d00; color: #ffffff; padding: 12px 24px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; cursor: pointer;">Get Started</button>
</nav>`,
  },
  {
    name: '6. Image + Object-fit + Aspect-ratio',
    html: `
<section style="display: flex; gap: 40px; padding: 60px; background: #fafafa; width: 100%; align-items: center;">
  <div style="flex: 1; aspect-ratio: 16/10; border-radius: 16px; overflow: hidden; background: #e0e0e0;">
    <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800" alt="Coding" style="width: 100%; height: 100%; object-fit: cover;" />
  </div>
  <div style="flex: 1; display: flex; flex-direction: column; gap: 16px;">
    <h2 style="font-family: 'Space Grotesk', sans-serif; font-size: 40px; font-weight: 700; color: #1a1a1a; margin: 0; line-height: 1.2;">Built for Developers</h2>
    <p style="font-family: 'DM Sans', sans-serif; font-size: 18px; color: #666; margin: 0; line-height: 1.6;">A description paragraph that should fill the available width alongside the image. The text column should be equal width to the image column.</p>
    <button style="align-self: flex-start; background: #1a1a1a; color: #ffffff; padding: 14px 28px; border-radius: 8px; border: none; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600;">Learn More</button>
  </div>
</section>`,
  },
]

// ═══════════════════════════════════════════════════════════════
// Approach A: Iframe Measure (our current approach)
// ═══════════════════════════════════════════════════════════════

interface ParsedNode {
  tag: string
  type: 'frame' | 'text' | 'image'
  // Measured / preserved properties
  x: number
  y: number
  width: number
  height: number
  // CSS properties (preserved approach only)
  cssProps?: Record<string, string>
  // Sizing intent
  sizing?: { horizontal: string; vertical: string }
  // Visual
  text?: string
  backgroundColor?: string
  borderRadius?: string
  border?: string
  boxShadow?: string
  padding?: string
  // Layout
  display?: string
  flexDirection?: string
  gap?: string
  position?: string
  top?: string
  left?: string
  right?: string
  bottom?: string
  // Children
  children: ParsedNode[]
}

async function parseViaIframe(html: string, rootWidth: number): Promise<{ nodes: ParsedNode[]; timeMs: number }> {
  const start = performance.now()

  // Create hidden iframe
  const iframe = document.createElement('iframe')
  iframe.style.cssText = `position:fixed;top:-10000px;left:-10000px;width:${rootWidth}px;height:0;border:none;visibility:hidden;`
  iframe.sandbox.add('allow-scripts', 'allow-same-origin')
  document.body.appendChild(iframe)

  const doc = iframe.contentDocument!
  doc.open()
  doc.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap">
<style>
*,*::before,*::after{box-sizing:border-box;}
body{margin:0;padding:0;width:${rootWidth}px;overflow-x:hidden;}
img{display:block;max-width:100%;}
</style>
</head><body>${html}</body></html>`)
  doc.close()

  // Wait for fonts (simplified — similar to our real parser)
  await new Promise(r => setTimeout(r, 500))
  try {
    if (doc.fonts) {
      const deadline = Date.now() + 2000
      while (doc.fonts.size === 0 && Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 100))
      }
      await Promise.race([doc.fonts.ready, new Promise(r => setTimeout(r, 3000))])
    }
  } catch { /* ignore */ }

  // Wait for images
  const imgs = doc.querySelectorAll('img[src]')
  const imgPromises: Promise<void>[] = []
  for (let _i = 0; _i < imgs.length; _i++) { const img = imgs[_i];
    const el = img as HTMLImageElement
    if (!el.complete) {
      imgPromises.push(new Promise(resolve => {
        el.addEventListener('load', () => resolve(), { once: true })
        el.addEventListener('error', () => resolve(), { once: true })
      }))
    }
  }
  if (imgPromises.length > 0) {
    await Promise.race([Promise.all(imgPromises), new Promise(r => setTimeout(r, 5000))])
  }

  // Layout stabilization
  await new Promise<void>(resolve => {
    const w = iframe.contentWindow!
    w.requestAnimationFrame(() => w.requestAnimationFrame(() => setTimeout(resolve, 50)))
  })

  iframe.style.height = `${doc.body.scrollHeight}px`

  // Now measure everything recursively
  function measureElement(el: Element, parentRect?: DOMRect): ParsedNode {
    const rect = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    const tag = el.tagName.toLowerCase()

    // Determine type
    const isImg = tag === 'img'
    const isText = ['h1','h2','h3','h4','h5','h6','p','span','a','label','button'].includes(tag) &&
      el.children.length === 0

    const node: ParsedNode = {
      tag,
      type: isImg ? 'image' : isText ? 'text' : 'frame',
      x: parentRect ? rect.left - parentRect.left : rect.left,
      y: parentRect ? rect.top - parentRect.top : rect.top,
      width: Math.round(rect.width * 100) / 100,
      height: Math.round(rect.height * 100) / 100,
      text: isText ? el.textContent?.trim() : undefined,
      backgroundColor: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : undefined,
      borderRadius: cs.borderRadius !== '0px' ? cs.borderRadius : undefined,
      border: cs.borderWidth !== '0px' ? `${cs.borderWidth} ${cs.borderStyle} ${cs.borderColor}` : undefined,
      boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : undefined,
      padding: cs.padding !== '0px' ? cs.padding : undefined,
      display: cs.display,
      flexDirection: cs.flexDirection !== 'row' ? cs.flexDirection : undefined,
      gap: cs.gap !== 'normal' ? cs.gap : undefined,
      position: cs.position !== 'static' ? cs.position : undefined,
      top: cs.top !== 'auto' ? cs.top : undefined,
      left: cs.left !== 'auto' ? cs.left : undefined,
      right: cs.right !== 'auto' ? cs.right : undefined,
      bottom: cs.bottom !== 'auto' ? cs.bottom : undefined,
      sizing: inferSizing(el, cs, rect, parentRect),
      children: [],
    }

    // Recurse children
    if (!isText && !isImg) {
      for (let ci = 0; ci < el.children.length; ci++) {
        const child = el.children[ci]
        const childCs = getComputedStyle(child)
        if (childCs.display === 'none') continue
        node.children.push(measureElement(child, rect))
      }
    }

    return node
  }

  function inferSizing(el: Element, cs: CSSStyleDeclaration, rect: DOMRect, parentRect?: DOMRect): { horizontal: string; vertical: string } {
    const parentWidth = parentRect?.width ?? rootWidth
    const widthDiff = Math.abs(rect.width - parentWidth)
    const horizontal = widthDiff < 2 ? 'fill' : rect.width > 0 ? 'fixed' : 'hug'
    return { horizontal, vertical: 'hug' }
  }

  // Parse root children
  const nodes: ParsedNode[] = []
  const body = doc.body
  for (let bi = 0; bi < body.children.length; bi++) {
    nodes.push(measureElement(body.children[bi]))
  }

  iframe.remove()
  const timeMs = Math.round(performance.now() - start)
  return { nodes, timeMs }
}

// ═══════════════════════════════════════════════════════════════
// Approach B: DOMParser Preserve (Paper's approach)
// ═══════════════════════════════════════════════════════════════

function parseViaDOMParser(html: string, rootWidth: number): { nodes: ParsedNode[]; timeMs: number } {
  const start = performance.now()

  const parser = new DOMParser()
  const doc = parser.parseFromString(`<!DOCTYPE html><html><body>${html}</body></html>`, 'text/html')

  function preserveElement(el: Element): ParsedNode {
    const tag = el.tagName.toLowerCase()
    const style = (el as HTMLElement).style
    const isImg = tag === 'img'
    const isText = ['h1','h2','h3','h4','h5','h6','p','span','a','label','button'].includes(tag) &&
      el.children.length === 0

    // Read ALL inline style properties
    const cssProps: Record<string, string> = {}
    for (let i = 0; i < style.length; i++) {
      const prop = style[i]
      const val = style.getPropertyValue(prop)
      if (val) cssProps[prop] = val
    }

    // Determine sizing from CSS intent
    const sizing = inferSizingFromCSS(cssProps, tag)

    // Parse width/height from CSS (not measured!)
    let width = parseCSSDimension(cssProps['width'], rootWidth) ?? rootWidth
    let height = parseCSSDimension(cssProps['height'], 0) ?? 0
    const minHeight = parseCSSDimension(cssProps['min-height'], 0)
    if (minHeight && minHeight > height) height = minHeight

    const node: ParsedNode = {
      tag,
      type: isImg ? 'image' : isText ? 'text' : 'frame',
      x: 0, // Position resolved by canvas engine, not parser
      y: 0,
      width,
      height,
      cssProps,
      text: isText ? el.textContent?.trim() : undefined,
      backgroundColor: cssProps['background-color'] || cssProps['background'] || undefined,
      borderRadius: cssProps['border-radius'] || undefined,
      border: cssProps['border'] || undefined,
      boxShadow: cssProps['box-shadow'] || undefined,
      padding: cssProps['padding'] || undefined,
      display: cssProps['display'] || undefined,
      flexDirection: cssProps['flex-direction'] || undefined,
      gap: cssProps['gap'] || undefined,
      position: cssProps['position'] || undefined,
      top: cssProps['top'] || undefined,
      left: cssProps['left'] || undefined,
      right: cssProps['right'] || undefined,
      bottom: cssProps['bottom'] || undefined,
      sizing,
      children: [],
    }

    // Recurse children
    if (!isText && !isImg) {
      for (let ci = 0; ci < el.children.length; ci++) {
        node.children.push(preserveElement(el.children[ci]))
      }
    }

    return node
  }

  function parseCSSDimension(val: string | undefined, relativeTo: number): number | null {
    if (!val) return null
    if (val === 'auto') return null
    if (val.endsWith('px')) return parseFloat(val)
    if (val.endsWith('%')) return (parseFloat(val) / 100) * relativeTo
    if (val.endsWith('vw')) return (parseFloat(val) / 100) * rootWidth
    return null
  }

  function inferSizingFromCSS(css: Record<string, string>, tag: string): { horizontal: string; vertical: string } {
    const w = css['width']
    const flex = css['flex']
    const flexGrow = css['flex-grow']

    let horizontal = 'hug'
    if (w === '100%' || w === '100vw') horizontal = 'fill'
    else if (w && w !== 'auto') horizontal = 'fixed'
    else if (flex === '1' || flexGrow === '1') horizontal = 'fill'
    else if (['section', 'nav', 'header', 'footer', 'div'].includes(tag) && !css['position']?.includes('absolute')) {
      // Block elements default to fill
      horizontal = 'fill'
    }

    const h = css['height']
    let vertical = 'hug'
    if (h && h !== 'auto') vertical = 'fixed'

    return { horizontal, vertical }
  }

  const nodes: ParsedNode[] = []
  for (let bi = 0; bi < doc.body.children.length; bi++) {
    nodes.push(preserveElement(doc.body.children[bi]))
  }

  const timeMs = Math.round(performance.now() - start)
  return { nodes, timeMs }
}

// ═══════════════════════════════════════════════════════════════
// UI Components
// ═══════════════════════════════════════════════════════════════

function NodeTree({ node, depth = 0 }: { node: ParsedNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 3)
  const indent = depth * 16

  const hasChildren = node.children.length > 0
  const typeColor = node.type === 'text' ? '#3b82f6' : node.type === 'image' ? '#f59e0b' : '#10b981'

  // Highlight problems
  const problems: string[] = []
  if (node.width === 0) problems.push('zero-width')
  if (node.width < 10 && node.type === 'frame' && hasChildren) problems.push('collapsed')
  if (node.sizing?.horizontal === 'fill' && node.width < 100) problems.push('fill-but-tiny')
  if (node.position === 'absolute' && node.width < 50 && node.type === 'frame') problems.push('abs-collapsed')

  return (
    <div style={{ marginLeft: indent }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: hasChildren ? 'pointer' : 'default',
          padding: '3px 6px',
          fontFamily: 'monospace',
          fontSize: 12,
          lineHeight: '18px',
          borderLeft: problems.length > 0 ? '3px solid #ef4444' : '1px solid #333',
          background: problems.length > 0 ? 'rgba(239,68,68,0.1)' : 'transparent',
          marginBottom: 1,
        }}
      >
        {hasChildren ? (expanded ? '▼ ' : '▶ ') : '  '}
        <span style={{ color: typeColor, fontWeight: 600 }}>{node.type}</span>
        <span style={{ color: '#888' }}> &lt;{node.tag}&gt;</span>
        {node.text && <span style={{ color: '#a78bfa' }}> "{node.text.slice(0, 30)}{node.text.length > 30 ? '…' : ''}"</span>}
        <span style={{ color: '#d4d4d4' }}>
          {' '}w={node.width} h={node.height}
        </span>
        {node.sizing && (
          <span style={{ color: '#fbbf24' }}> [{node.sizing.horizontal}/{node.sizing.vertical}]</span>
        )}
        {node.position && <span style={{ color: '#f472b6' }}> pos:{node.position}</span>}
        {node.display && <span style={{ color: '#34d399' }}> {node.display}</span>}
        {node.gap && <span style={{ color: '#818cf8' }}> gap:{node.gap}</span>}
        {problems.length > 0 && <span style={{ color: '#ef4444', fontWeight: 700 }}> ⚠ {problems.join(', ')}</span>}
      </div>
      {expanded && node.children.map((child, i) => (
        <NodeTree key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

function CSSPropsView({ node, depth = 0 }: { node: ParsedNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const indent = depth * 16
  const hasChildren = node.children.length > 0

  return (
    <div style={{ marginLeft: indent }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          cursor: hasChildren ? 'pointer' : 'default',
          padding: '3px 6px',
          fontFamily: 'monospace',
          fontSize: 11,
          lineHeight: '16px',
          borderLeft: '1px solid #333',
          marginBottom: 1,
        }}
      >
        {hasChildren ? (expanded ? '▼ ' : '▶ ') : '  '}
        <span style={{ color: '#10b981' }}>&lt;{node.tag}&gt;</span>
        {node.cssProps && Object.keys(node.cssProps).length > 0 && (
          <span style={{ color: '#666' }}> ({Object.keys(node.cssProps).length} props)</span>
        )}
      </div>
      {expanded && node.cssProps && (
        <div style={{ marginLeft: indent + 20, marginBottom: 4 }}>
          {Object.entries(node.cssProps).map(([k, v]) => (
            <div key={k} style={{ fontFamily: 'monospace', fontSize: 10, color: '#999' }}>
              <span style={{ color: '#60a5fa' }}>{k}</span>: <span style={{ color: '#fbbf24' }}>{v}</span>
            </div>
          ))}
        </div>
      )}
      {expanded && node.children.map((child, i) => (
        <CSSPropsView key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// Visual Preview — renders each parser's OUTPUT back into an iframe
//
// This is the FAIR comparison:
// - Iframe parser output → reconstruct HTML from measured pixel values
// - DOMParser output → reconstruct HTML from preserved CSS properties
// Both get rendered by a real browser, so layout quality is equal.
// The difference shows what DATA each parser captured.
// ═══════════════════════════════════════════════════════════════

function IframePreview({ html, label, accentColor }: {
  html: string
  label: string
  accentColor: string
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(300)

  const onLoad = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) return
    // Auto-resize to content
    const h = iframe.contentDocument.body.scrollHeight
    if (h > 0) setHeight(Math.min(h + 20, 800))
  }, [])

  const srcDoc = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&display=swap">
<style>
*,*::before,*::after{box-sizing:border-box;}
body{margin:0;padding:0;width:1440px;overflow-x:hidden;transform-origin:top left;transform:scale(0.486);background:#0d0d0d;}
img{display:block;max-width:100%;}
</style>
</head><body>${html}</body></html>`

  return (
    <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 16, border: `1px solid ${accentColor}33` }}>
      <h3 style={{ fontFamily: 'system-ui', fontSize: 14, fontWeight: 600, margin: '0 0 12px', color: accentColor }}>
        {label}
      </h3>
      <div style={{
        width: 700,
        height: height * 0.486,
        overflow: 'hidden',
        borderRadius: 8,
        border: '1px solid #222',
        background: '#0d0d0d',
      }}>
        <iframe
          ref={iframeRef}
          srcDoc={srcDoc}
          onLoad={onLoad}
          sandbox="allow-same-origin"
          style={{ width: 1440, height, border: 'none', transformOrigin: 'top left', transform: 'scale(0.486)' }}
        />
      </div>
    </div>
  )
}

/** Reconstruct HTML from iframe parser's measured output (pixel values only) */
function reconstructFromIframe(nodes: ParsedNode[]): string {
  return nodes.map(n => reconstructIframeNode(n)).join('\n')
}

function reconstructIframeNode(node: ParsedNode): string {
  if (node.type === 'image') {
    return `<div style="width:${node.width}px;height:${node.height}px;background:#e0e0e0;border-radius:${node.borderRadius || '0'};overflow:hidden;"><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800" style="width:100%;height:100%;object-fit:cover;" /></div>`
  }

  const styles: string[] = []

  // Dimensions — iframe parser only has pixel values
  if (node.width > 0) styles.push(`width:${node.width}px`)
  if (node.height > 0) styles.push(`height:${node.height}px`)

  // Position
  if (node.position) {
    styles.push(`position:${node.position}`)
    if (node.top) styles.push(`top:${node.top}`)
    if (node.left) styles.push(`left:${node.left}`)
    if (node.right) styles.push(`right:${node.right}`)
    if (node.bottom) styles.push(`bottom:${node.bottom}`)
  }

  // Layout
  if (node.display) styles.push(`display:${node.display}`)
  if (node.flexDirection) styles.push(`flex-direction:${node.flexDirection}`)
  if (node.gap) styles.push(`gap:${node.gap}`)

  // Visual
  if (node.backgroundColor) styles.push(`background:${node.backgroundColor}`)
  if (node.borderRadius) styles.push(`border-radius:${node.borderRadius}`)
  if (node.border) styles.push(`border:${node.border}`)
  if (node.boxShadow) styles.push(`box-shadow:${node.boxShadow}`)
  if (node.padding) styles.push(`padding:${node.padding}`)

  if (node.type === 'text') {
    // Text node — use measured pixel dimensions, no CSS intent
    const textStyles = [...styles]
    textStyles.push('margin:0')
    // Font info is lost to computed values
    const cs = node as ParsedNode
    if (cs.cssProps?.['font-family']) textStyles.push(`font-family:${cs.cssProps['font-family']}`)
    if (cs.cssProps?.['font-size']) textStyles.push(`font-size:${cs.cssProps['font-size']}`)
    if (cs.cssProps?.['font-weight']) textStyles.push(`font-weight:${cs.cssProps['font-weight']}`)
    if (cs.cssProps?.['color']) textStyles.push(`color:${cs.cssProps['color']}`)
    // Iframe parser doesn't preserve cssProps, so use whatever we have
    return `<div style="${textStyles.join(';')}">${node.text || ''}</div>`
  }

  // Frame — recurse children
  const childHtml = node.children.map(c => reconstructIframeNode(c)).join('\n')
  return `<div style="${styles.join(';')}">${childHtml}</div>`
}

/** Reconstruct HTML from DOMParser's preserved CSS properties */
function reconstructFromDOMParser(nodes: ParsedNode[]): string {
  return nodes.map(n => reconstructDOMNode(n)).join('\n')
}

function reconstructDOMNode(node: ParsedNode): string {
  if (!node.cssProps || Object.keys(node.cssProps).length === 0) {
    // No preserved CSS — just output the tag with text
    if (node.type === 'text') return `<div>${node.text || ''}</div>`
    const childHtml = node.children.map(c => reconstructDOMNode(c)).join('\n')
    return `<div>${childHtml}</div>`
  }

  // Rebuild style string from ALL preserved CSS properties
  const styleStr = Object.entries(node.cssProps)
    .map(([k, v]) => `${k}:${v}`)
    .join(';')

  if (node.type === 'image') {
    return `<div style="${styleStr}"><img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800" style="width:100%;height:100%;object-fit:cover;" /></div>`
  }

  if (node.type === 'text') {
    return `<${node.tag} style="${styleStr};margin:0">${node.text || ''}</${node.tag}>`
  }

  const childHtml = node.children.map(c => reconstructDOMNode(c)).join('\n')
  return `<${node.tag} style="${styleStr}">${childHtml}</${node.tag}>`
}

// ═══════════════════════════════════════════════════════════════
// Main Page Component
// ═══════════════════════════════════════════════════════════════

export default function TestParserPage() {
  const [selectedTest, setSelectedTest] = useState(0)
  const [iframeResult, setIframeResult] = useState<{ nodes: ParsedNode[]; timeMs: number } | null>(null)
  const [domResult, setDomResult] = useState<{ nodes: ParsedNode[]; timeMs: number } | null>(null)
  const [running, setRunning] = useState(false)
  const [rootWidth] = useState(1440)
  const previewRef = useRef<HTMLDivElement>(null)

  const runTest = useCallback(async () => {
    setRunning(true)
    setIframeResult(null)
    setDomResult(null)

    const html = TEST_CASES[selectedTest].html

    // Run DOMParser (sync, instant)
    const domRes = parseViaDOMParser(html, rootWidth)
    setDomResult(domRes)

    // Run Iframe (async, slow)
    const iframeRes = await parseViaIframe(html, rootWidth)
    setIframeResult(iframeRes)

    setRunning(false)
  }, [selectedTest, rootWidth])

  return (
    <div style={{ background: '#0a0a0a', color: '#e4e4e7', minHeight: '100vh', padding: 24 }}>
      <h1 style={{ fontFamily: 'system-ui', fontSize: 28, fontWeight: 700, margin: 0, marginBottom: 8 }}>
        Parser Test: Iframe (Measure) vs DOMParser (Preserve)
      </h1>
      <p style={{ fontFamily: 'system-ui', fontSize: 14, color: '#888', margin: 0, marginBottom: 24 }}>
        Same HTML → two parsing approaches → compare the output node trees
      </p>

      {/* Test selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TEST_CASES.map((tc, i) => (
          <button
            key={i}
            onClick={() => setSelectedTest(i)}
            style={{
              padding: '8px 16px',
              borderRadius: 8,
              border: selectedTest === i ? '2px solid #3b82f6' : '1px solid #333',
              background: selectedTest === i ? '#1e3a5f' : '#1a1a1a',
              color: selectedTest === i ? '#60a5fa' : '#999',
              fontSize: 13,
              fontFamily: 'system-ui',
              cursor: 'pointer',
            }}
          >
            {tc.name}
          </button>
        ))}
      </div>

      <button
        onClick={runTest}
        disabled={running}
        style={{
          padding: '12px 32px',
          borderRadius: 8,
          border: 'none',
          background: running ? '#333' : '#3b82f6',
          color: '#fff',
          fontSize: 16,
          fontWeight: 600,
          cursor: running ? 'wait' : 'pointer',
          marginBottom: 24,
        }}
      >
        {running ? 'Running…' : 'Run Test'}
      </button>

      {/* HTML Preview */}
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontFamily: 'system-ui', fontSize: 14, color: '#888', marginBottom: 8 }}>Reference: Original HTML (how it should look in browser):</h3>
        <div
          ref={previewRef}
          style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', maxWidth: 1440 }}
          dangerouslySetInnerHTML={{ __html: TEST_CASES[selectedTest].html }}
        />
      </div>

      {/* ═══ Visual Previews — the key comparison ═══ */}
      {iframeResult && domResult && (
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'system-ui', fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: '#e4e4e7' }}>
            Visual Preview — Reconstructed from Each Parser's Output
          </h2>
          <p style={{ fontFamily: 'system-ui', fontSize: 13, color: '#666', margin: '0 0 16px' }}>
            Each parser's extracted data is reconstructed back into HTML and rendered in a real browser.
            The iframe parser only has pixel values — the DOMParser preserves original CSS properties.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
            <IframePreview
              html={reconstructFromIframe(iframeResult.nodes)}
              label={`A: Rebuilt from Iframe Data (${iframeResult.timeMs}ms) — pixel values only`}
              accentColor="#ef4444"
            />
            <IframePreview
              html={reconstructFromDOMParser(domResult.nodes)}
              label={`B: Rebuilt from DOMParser Data (${domResult.timeMs}ms) — CSS intent preserved`}
              accentColor="#10b981"
            />
          </div>
        </div>
      )}

      {/* Node tree details side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Iframe approach */}
        <div style={{ background: '#111', borderRadius: 12, padding: 16, border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'system-ui', fontSize: 18, fontWeight: 700, margin: 0, color: '#ef4444' }}>
              A: Iframe Measure (Current)
            </h2>
            {iframeResult && (
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#f59e0b' }}>
                {iframeResult.timeMs}ms
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px' }}>
            getBoundingClientRect() + getComputedStyle() on rendered iframe
          </p>
          {iframeResult ? (
            <div style={{ maxHeight: 600, overflow: 'auto' }}>
              {iframeResult.nodes.map((n, i) => <NodeTree key={i} node={n} />)}
            </div>
          ) : (
            <div style={{ color: '#555', fontStyle: 'italic' }}>
              {running ? 'Rendering in iframe…' : 'Click "Run Test" to compare'}
            </div>
          )}
        </div>

        {/* DOMParser approach */}
        <div style={{ background: '#111', borderRadius: 12, padding: 16, border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontFamily: 'system-ui', fontSize: 18, fontWeight: 700, margin: 0, color: '#10b981' }}>
              B: DOMParser Preserve (Paper-style)
            </h2>
            {domResult && (
              <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#f59e0b' }}>
                {domResult.timeMs}ms
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: '#666', margin: '0 0 12px' }}>
            Reads element.style properties directly — no rendering, no measurement
          </p>
          {domResult ? (
            <div style={{ maxHeight: 600, overflow: 'auto' }}>
              <div style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 13, color: '#888', margin: '0 0 8px' }}>Node Tree:</h4>
                {domResult.nodes.map((n, i) => <NodeTree key={i} node={n} />)}
              </div>
              <div>
                <h4 style={{ fontSize: 13, color: '#888', margin: '0 0 8px' }}>Preserved CSS Properties:</h4>
                {domResult.nodes.map((n, i) => <CSSPropsView key={i} node={n} />)}
              </div>
            </div>
          ) : (
            <div style={{ color: '#555', fontStyle: 'italic' }}>
              {running ? 'Parsing…' : 'Click "Run Test" to compare'}
            </div>
          )}
        </div>
      </div>

      {/* Comparison summary */}
      {iframeResult && domResult && (
        <div style={{ marginTop: 24, background: '#111', borderRadius: 12, padding: 16, border: '1px solid #222' }}>
          <h2 style={{ fontFamily: 'system-ui', fontSize: 18, fontWeight: 700, margin: '0 0 12px' }}>Comparison</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ textAlign: 'left', padding: 8, color: '#888' }}>Metric</th>
                <th style={{ textAlign: 'left', padding: 8, color: '#ef4444' }}>Iframe (Measure)</th>
                <th style={{ textAlign: 'left', padding: 8, color: '#10b981' }}>DOMParser (Preserve)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 8 }}>Parse Time</td>
                <td style={{ padding: 8, color: iframeResult.timeMs > 1000 ? '#ef4444' : '#fbbf24' }}>{iframeResult.timeMs}ms</td>
                <td style={{ padding: 8, color: '#10b981' }}>{domResult.timeMs}ms</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 8 }}>Nodes Generated</td>
                <td style={{ padding: 8 }}>{countNodes(iframeResult.nodes)}</td>
                <td style={{ padding: 8 }}>{countNodes(domResult.nodes)}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 8 }}>Zero-width Nodes</td>
                <td style={{ padding: 8, color: countProblems(iframeResult.nodes, 'zero-width') > 0 ? '#ef4444' : '#10b981' }}>
                  {countProblems(iframeResult.nodes, 'zero-width')}
                </td>
                <td style={{ padding: 8 }}>N/A (no measurement)</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 8 }}>Collapsed Frames</td>
                <td style={{ padding: 8, color: countProblems(iframeResult.nodes, 'collapsed') > 0 ? '#ef4444' : '#10b981' }}>
                  {countProblems(iframeResult.nodes, 'collapsed')}
                </td>
                <td style={{ padding: 8 }}>N/A</td>
              </tr>
              <tr>
                <td style={{ padding: 8 }}>CSS Intent Preserved</td>
                <td style={{ padding: 8, color: '#ef4444' }}>No (pixel values only)</td>
                <td style={{ padding: 8, color: '#10b981' }}>Yes (all inline styles)</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function countNodes(nodes: ParsedNode[]): number {
  let count = 0
  for (const n of nodes) {
    count += 1 + countNodes(n.children)
  }
  return count
}

function countProblems(nodes: ParsedNode[], type: string): number {
  let count = 0
  for (const n of nodes) {
    if (type === 'zero-width' && n.width === 0) count++
    if (type === 'collapsed' && n.width < 10 && n.type === 'frame' && n.children.length > 0) count++
    count += countProblems(n.children, type)
  }
  return count
}
