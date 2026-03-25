'use client'

import { useState, useCallback, useEffect, type CSSProperties, type ReactNode } from 'react'

/* ════════════════════════════════════════════════════════════
   TYPES
   ════════════════════════════════════════════════════════════ */

interface VariableValue { light: string; dark: string }
type VariableTable = Record<string, VariableValue>
interface Fill { color: string; ref?: string }
interface Border { color: string; ref?: string; width: number }

interface TText {
  type: 'text'; text: string; color: string; colorRef?: string
  fontFamily?: string; fontRef?: string; fontSize: number; fontWeight: number; lineHeight?: number
}

interface TFrame {
  type: 'frame'; name?: string; fills: Fill[]; borderRadius?: number
  padding?: string; gap?: number; direction?: 'row' | 'column'
  align?: string; justify?: string; border?: Border
  flex?: number; children: (TFrame | TText)[]
}

/* ════════════════════════════════════════════════════════════
   VARIABLE TABLES + PRESETS
   ════════════════════════════════════════════════════════════ */

const DEFAULT_VARS: VariableTable = {
  'bg/primary':     { light: '#FFFFFF', dark: '#0A0A0A' },
  'bg/secondary':   { light: '#F5F5F5', dark: '#141414' },
  'text/primary':   { light: '#111111', dark: '#FAFAFA' },
  'text/secondary': { light: '#666666', dark: '#A3A3A3' },
  'accent':         { light: '#3B82F6', dark: '#60A5FA' },
  'text/on-accent': { light: '#FFFFFF', dark: '#000000' },
  'border':         { light: '#E5E5E5', dark: '#2A2A2A' },
  'font/heading':   { light: 'Inter', dark: 'Inter' },
  'font/body':      { light: 'Inter', dark: 'Inter' },
}

const PRESETS: Record<string, VariableTable> = {
  'Default': structuredClone(DEFAULT_VARS),
  'Warm Earth': {
    'bg/primary': { light: '#FFFBF5', dark: '#1A1510' }, 'bg/secondary': { light: '#FEF3E2', dark: '#231C12' },
    'text/primary': { light: '#292524', dark: '#F5F0EB' }, 'text/secondary': { light: '#78716C', dark: '#A8A29E' },
    'accent': { light: '#D97706', dark: '#F59E0B' }, 'text/on-accent': { light: '#FFFFFF', dark: '#1A1510' },
    'border': { light: '#E7DDD0', dark: '#3D3530' },
    'font/heading': { light: 'Playfair Display', dark: 'Playfair Display' }, 'font/body': { light: 'Lato', dark: 'Lato' },
  },
  'Ocean': {
    'bg/primary': { light: '#F0F9FF', dark: '#0B1929' }, 'bg/secondary': { light: '#E0F2FE', dark: '#0F2640' },
    'text/primary': { light: '#0C4A6E', dark: '#E0F2FE' }, 'text/secondary': { light: '#0369A1', dark: '#7DD3FC' },
    'accent': { light: '#0284C7', dark: '#38BDF8' }, 'text/on-accent': { light: '#FFFFFF', dark: '#0B1929' },
    'border': { light: '#BAE6FD', dark: '#164E63' },
    'font/heading': { light: 'Outfit', dark: 'Outfit' }, 'font/body': { light: 'Inter', dark: 'Inter' },
  },
  'Midnight': {
    'bg/primary': { light: '#FAF5FF', dark: '#0D0520' }, 'bg/secondary': { light: '#F3E8FF', dark: '#160B2E' },
    'text/primary': { light: '#2E1065', dark: '#F3E8FF' }, 'text/secondary': { light: '#6B21A8', dark: '#C084FC' },
    'accent': { light: '#7E22CE', dark: '#A855F7' }, 'text/on-accent': { light: '#FFFFFF', dark: '#FFFFFF' },
    'border': { light: '#DDD6FE', dark: '#2E1065' },
    'font/heading': { light: 'DM Serif Display', dark: 'DM Serif Display' }, 'font/body': { light: 'Source Sans 3', dark: 'Source Sans 3' },
  },
  'Rose': {
    'bg/primary': { light: '#FFF1F2', dark: '#1C0A0D' }, 'bg/secondary': { light: '#FFE4E6', dark: '#2D1216' },
    'text/primary': { light: '#4C0519', dark: '#FFE4E6' }, 'text/secondary': { light: '#BE123C', dark: '#FDA4AF' },
    'accent': { light: '#E11D48', dark: '#FB7185' }, 'text/on-accent': { light: '#FFFFFF', dark: '#1C0A0D' },
    'border': { light: '#FECDD3', dark: '#4C0519' },
    'font/heading': { light: 'Bricolage Grotesque', dark: 'Bricolage Grotesque' }, 'font/body': { light: 'Inter', dark: 'Inter' },
  },
}

/* ════════════════════════════════════════════════════════════
   HTML PARSER — Converts AI-generated HTML → TFrame/TText tree
   ════════════════════════════════════════════════════════════ */

function parseInlineStyles(styleStr: string): Record<string, string> {
  const result: Record<string, string> = {}
  if (!styleStr) return result
  for (const part of styleStr.split(';')) {
    const colon = part.indexOf(':')
    if (colon === -1) continue
    const key = part.slice(0, colon).trim()
    const val = part.slice(colon + 1).trim()
    if (key && val) result[key] = val
  }
  return result
}

function parsePxValue(val: string | undefined, fallback: number): number {
  if (!val) return fallback
  const num = parseFloat(val)
  return isNaN(num) ? fallback : num
}

function parseFontWeight(val: string | undefined): number {
  if (!val) return 400
  const num = parseInt(val)
  if (!isNaN(num)) return num
  const map: Record<string, number> = { normal: 400, bold: 700, bolder: 700, lighter: 300 }
  return map[val.toLowerCase()] ?? 400
}

function cleanFont(val: string | undefined): string | undefined {
  if (!val) return undefined
  return val.replace(/['"]/g, '').split(',')[0].trim() || undefined
}

function parseHTMLToNodes(html: string): TFrame {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement || doc.body
  return walkElement(root) as TFrame
}

function walkElement(el: HTMLElement): TFrame | TText {
  const styles = parseInlineStyles(el.getAttribute('style') || '')
  const tag = el.tagName.toLowerCase()

  // Collect child elements
  const childElements = Array.from(el.children) as HTMLElement[]

  // If leaf node with text content → TText
  if (childElements.length === 0 && el.textContent?.trim()) {
    return {
      type: 'text',
      text: el.textContent.trim(),
      color: styles['color'] || '#000000',
      fontSize: parsePxValue(styles['font-size'], tag.match(/^h[1-6]$/) ? ({ h1: 48, h2: 36, h3: 28, h4: 24, h5: 20, h6: 16 }[tag] ?? 16) : 16),
      fontWeight: parseFontWeight(styles['font-weight'] || (tag.match(/^h[1-6]$/) ? '700' : undefined)),
      fontFamily: cleanFont(styles['font-family']),
      lineHeight: styles['line-height'] ? parseFloat(styles['line-height']) || undefined : undefined,
    }
  }

  // Otherwise → TFrame
  const children: (TFrame | TText)[] = []
  for (const child of childElements) {
    children.push(walkElement(child))
  }
  // Also grab direct text nodes not inside child elements
  for (const node of el.childNodes) {
    if (node.nodeType === 3 && node.textContent?.trim()) {
      children.push({
        type: 'text',
        text: node.textContent.trim(),
        color: styles['color'] || '#000000',
        fontSize: parsePxValue(styles['font-size'], 16),
        fontWeight: parseFontWeight(styles['font-weight']),
        fontFamily: cleanFont(styles['font-family']),
      })
    }
  }

  const bg = styles['background-color'] || styles['background']
  const fills: Fill[] = bg && bg !== 'transparent' ? [{ color: bg }] : []
  const borderRadius = parsePxValue(styles['border-radius'], 0)
  const gap = parsePxValue(styles['gap'], 0)
  const flexDir = styles['flex-direction']
  const padding = styles['padding']

  // Detect border
  let border: Border | undefined
  const borderStr = styles['border']
  if (borderStr) {
    const match = borderStr.match(/([\d.]+)px\s+\w+\s+(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/)
    if (match) border = { width: parseFloat(match[1]), color: match[2], ref: undefined }
  }

  return {
    type: 'frame',
    name: tag,
    fills,
    borderRadius: borderRadius || undefined,
    padding: padding || undefined,
    gap: gap || undefined,
    direction: flexDir === 'row' ? 'row' : (flexDir === 'column' ? 'column' : undefined),
    align: styles['align-items'] || undefined,
    justify: styles['justify-content'] || undefined,
    border,
    flex: styles['flex'] ? parseFloat(styles['flex']) || undefined : undefined,
    children,
  }
}

/* ════════════════════════════════════════════════════════════
   LINKER — Matches hex colors → variable refs (THE KEY PIECE)
   ════════════════════════════════════════════════════════════ */

function normalizeHex(hex: string): string {
  let h = hex.trim().toLowerCase()
  if (!h.startsWith('#')) return h
  // Expand 3-char hex: #abc → #aabbcc
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  return h
}

function linkNode(node: TFrame | TText, vars: VariableTable, mode: 'light' | 'dark'): void {
  // Build reverse map: hex → variable name (colors only)
  const colorMap = new Map<string, string>()
  const fontMap = new Map<string, string>()
  for (const [name, val] of Object.entries(vars)) {
    if (name.startsWith('font/')) {
      fontMap.set(val[mode].toLowerCase(), name)
    } else {
      colorMap.set(normalizeHex(val[mode]), name)
    }
  }

  linkNodeRecursive(node, colorMap, fontMap)
}

function linkNodeRecursive(
  node: TFrame | TText,
  colorMap: Map<string, string>,
  fontMap: Map<string, string>
): void {
  if (node.type === 'text') {
    // Link text color
    const colorKey = normalizeHex(node.color)
    const colorVar = colorMap.get(colorKey)
    if (colorVar) node.colorRef = colorVar
    // Link font
    if (node.fontFamily) {
      const fontKey = node.fontFamily.toLowerCase()
      const fontVar = fontMap.get(fontKey)
      if (fontVar) node.fontRef = fontVar
    }
    return
  }

  // Link fills
  for (const fill of node.fills) {
    const key = normalizeHex(fill.color)
    const varName = colorMap.get(key)
    if (varName) fill.ref = varName
  }
  // Link border
  if (node.border) {
    const key = normalizeHex(node.border.color)
    const varName = colorMap.get(key)
    if (varName) node.border.ref = varName
  }
  // Recurse children
  for (const child of node.children) {
    linkNodeRecursive(child, colorMap, fontMap)
  }
}

/* ════════════════════════════════════════════════════════════
   UTILS
   ════════════════════════════════════════════════════════════ */

const FONT_OPTIONS = [
  'Inter', 'Outfit', 'Playfair Display', 'DM Serif Display',
  'Lato', 'Source Sans 3', 'Raleway', 'Space Grotesk',
  'Bricolage Grotesque', 'Sora', 'Archivo', 'DM Sans',
]

function loadFonts(fonts: string[]) {
  const families = [...new Set(fonts)]
    .map(f => `family=${encodeURIComponent(f)}:wght@300;400;500;600;700;800`).join('&')
  const href = `https://fonts.googleapis.com/css2?${families}&display=swap`
  const id = 'theme-test-fonts'
  let link = document.getElementById(id) as HTMLLinkElement | null
  if (link) { if (link.href !== href) link.href = href }
  else { link = document.createElement('link'); link.id = id; link.rel = 'stylesheet'; link.href = href; document.head.appendChild(link) }
}

function countRefs(node: TFrame | TText): number {
  let c = 0
  if (node.type === 'text') { if (node.colorRef) c++; if (node.fontRef) c++; return c }
  if (node.fills[0]?.ref) c++; if (node.border?.ref) c++
  for (const child of node.children) c += countRefs(child)
  return c
}

function countNodes(node: TFrame | TText): number {
  if (node.type === 'text') return 1
  let c = 1
  for (const child of node.children) c += countNodes(child)
  return c
}

/* ════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════ */

export default function TestThemeTab() {
  const [vars, setVars] = useState<VariableTable>(structuredClone(DEFAULT_VARS))
  const [mode, setMode] = useState<'light' | 'dark'>('light')
  const [activePreset, setActivePreset] = useState('Default')
  const [hovered, setHovered] = useState<string | null>(null)

  // AI generation state
  const [prompt, setPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [pageNodes, setPageNodes] = useState<TFrame | null>(null)
  const [genStats, setGenStats] = useState<{ nodes: number; refs: number; linked: number } | null>(null)
  const [genError, setGenError] = useState<string | null>(null)

  const resolve = useCallback(
    (ref: string | undefined, fallback: string): string => {
      if (!ref) return fallback
      const v = vars[ref]
      if (!v) return fallback
      return v[mode]
    },
    [vars, mode]
  )

  useEffect(() => {
    const heading = resolve('font/heading', 'Inter')
    const body = resolve('font/body', 'Inter')
    loadFonts([heading, body])
  }, [vars, mode, resolve])

  const applyPreset = (name: string) => {
    setVars(structuredClone(PRESETS[name]))
    setActivePreset(name)
  }

  const updateVar = (name: string, value: string) => {
    setVars(prev => ({ ...prev, [name]: { ...prev[name], [mode]: value } }))
    setActivePreset('Custom')
  }

  /* ── GENERATE: prompt → AI → parse → link → render ── */
  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return
    setGenerating(true)
    setGenError(null)
    setGenStats(null)

    try {
      const res = await fetch('/api/test-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          colors: {
            bgPrimary: vars['bg/primary'][mode],
            bgSecondary: vars['bg/secondary'][mode],
            textPrimary: vars['text/primary'][mode],
            textSecondary: vars['text/secondary'][mode],
            accent: vars['accent'][mode],
            textOnAccent: vars['text/on-accent'][mode],
            border: vars['border'][mode],
          },
          fonts: {
            heading: vars['font/heading'][mode],
            body: vars['font/body'][mode],
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Generation failed (${res.status})`)
      }

      const { html } = await res.json()

      // Step 1: Parse HTML → node tree (hex values only, no refs yet)
      const parsed = parseHTMLToNodes(html)
      const totalNodes = countNodes(parsed)
      const refsBefore = countRefs(parsed)

      // Step 2: Linker — match hex → variable refs
      linkNode(parsed, vars, mode)
      const refsAfter = countRefs(parsed)

      setPageNodes(parsed)
      setGenStats({ nodes: totalNodes, refs: refsAfter, linked: refsAfter - refsBefore })
    } catch (err: any) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  // Which nodes to render
  const activeNodes = pageNodes

  /* ── Recursive renderer ── */
  function renderNode(node: TFrame | TText, key: string): ReactNode {
    if (node.type === 'text') {
      return (
        <span key={key} style={{
          color: resolve(node.colorRef, node.color),
          fontFamily: `"${resolve(node.fontRef, node.fontFamily || 'Inter')}", sans-serif`,
          fontSize: node.fontSize, fontWeight: node.fontWeight,
          lineHeight: node.lineHeight ?? 1.5,
          display: 'block', whiteSpace: 'pre-line',
          transition: 'color 0.3s ease, font-family 0.2s ease',
        }}
          onMouseEnter={() => setHovered(node.colorRef || null)}
          onMouseLeave={() => setHovered(null)}
        >{node.text}</span>
      )
    }
    const bg = node.fills[0] ? resolve(node.fills[0].ref, node.fills[0].color) : 'transparent'
    const borderColor = node.border ? resolve(node.border.ref, node.border.color) : undefined
    const style: CSSProperties = {
      backgroundColor: bg,
      borderRadius: node.borderRadius ?? 0,
      padding: node.padding ?? undefined,
      display: 'flex',
      flexDirection: node.direction === 'row' ? 'row' : 'column',
      gap: node.gap ?? undefined,
      alignItems: node.align ?? (node.direction === 'row' ? 'center' : undefined),
      justifyContent: node.justify ?? undefined,
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
      ...(node.flex ? { flex: node.flex } : {}),
      ...(borderColor ? { border: `${node.border!.width}px solid ${borderColor}` } : {}),
      overflowX: 'hidden' as const,
    }
    return (
      <div key={key} style={style}
        onMouseEnter={(e) => { e.stopPropagation(); setHovered(node.fills[0]?.ref || null) }}
        onMouseLeave={(e) => { e.stopPropagation(); setHovered(null) }}
      >{node.children.map((child, i) => renderNode(child, `${key}-${i}`))}</div>
    )
  }

  const colorVars = Object.entries(vars).filter(([k]) => !k.startsWith('font/'))
  const fontVars = Object.entries(vars).filter(([k]) => k.startsWith('font/'))
  const panelBg = mode === 'dark' ? '#0E0E0E' : '#FAFAFA'
  const panelBorder = mode === 'dark' ? '#1E1E1E' : '#E5E5E5'
  const panelText = mode === 'dark' ? '#E5E5E5' : '#111'
  const panelMuted = mode === 'dark' ? '#666' : '#999'
  const panelInputBg = mode === 'dark' ? '#1A1A1A' : '#FFF'

  return (
    <div style={{ display: 'flex', height: '100vh', fontFamily: '"Inter", system-ui, sans-serif', fontSize: 13 }}>

      {/* ═══════════ LEFT: Canvas ═══════════ */}
      <div style={{ flex: 1, overflow: 'auto', backgroundColor: mode === 'dark' ? '#050505' : '#D4D4D4', transition: 'background-color 0.4s ease' }}>

        {/* ── Prompt Bar ── */}
        <div style={{
          padding: '16px 40px', borderBottom: `1px solid ${mode === 'dark' ? '#1E1E1E' : '#C4C4C4'}`,
          backgroundColor: mode === 'dark' ? '#0A0A0A' : '#E8E8E8',
          transition: 'all 0.3s',
        }}>
          <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', gap: 10 }}>
            <input
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleGenerate()}
              placeholder="Describe a page... e.g. coffee shop landing page"
              disabled={generating}
              style={{
                flex: 1, padding: '10px 16px', borderRadius: 8, fontSize: 13,
                border: `1.5px solid ${mode === 'dark' ? '#333' : '#CCC'}`,
                backgroundColor: mode === 'dark' ? '#141414' : '#FFF',
                color: panelText, fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              style={{
                padding: '10px 20px', borderRadius: 8, border: 'none', cursor: generating ? 'wait' : 'pointer',
                backgroundColor: generating ? (mode === 'dark' ? '#333' : '#CCC') : vars['accent'][mode],
                color: generating ? panelMuted : vars['text/on-accent'][mode],
                fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
                transition: 'all 0.2s', whiteSpace: 'nowrap',
              }}
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
          {genError && (
            <div style={{ maxWidth: 720, margin: '8px auto 0', color: '#EF4444', fontSize: 11 }}>{genError}</div>
          )}
        </div>

        {/* ── Canvas Area ── */}
        <div style={{ padding: '24px 40px' }}>
          {/* Stats */}
          {genStats && (
            <div style={{
              maxWidth: 720, margin: '0 auto 12px',
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: mode === 'dark' ? '#555' : '#999',
            }}>
              <span style={{ fontWeight: 600 }}>
                AI Generated — {genStats.nodes} nodes, {genStats.refs} variable refs ({genStats.linked} auto-linked)
              </span>
              <span>Mode: {mode} &middot; Preset: {activePreset}</span>
            </div>
          )}

          {/* Rendered page or empty state */}
          {activeNodes ? (
            <div style={{
              maxWidth: 720, margin: '0 auto',
              boxShadow: mode === 'dark' ? '0 8px 40px rgba(0,0,0,0.6)' : '0 8px 40px rgba(0,0,0,0.12)',
              borderRadius: 10, overflow: 'hidden',
            }}>
              {renderNode(activeNodes, 'gen')}
            </div>
          ) : (
            <div style={{
              maxWidth: 720, margin: '80px auto', textAlign: 'center',
              color: mode === 'dark' ? '#444' : '#AAA',
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{'{ }'}</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>Type a prompt and hit Generate</div>
              <div style={{ fontSize: 12, marginTop: 6 }}>
                AI will create a page with your palette colors.
                <br />Then the linker auto-assigns variable refs.
                <br />Then switch themes and watch it transform.
              </div>
            </div>
          )}
        </div>

        {/* Hover tooltip */}
        {hovered && (
          <div style={{
            position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-70%)',
            backgroundColor: '#111', color: '#fff', padding: '8px 16px',
            borderRadius: 8, fontSize: 12, fontFamily: 'monospace',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 50,
          }}>
            <span style={{ opacity: 0.4 }}>ref: </span>
            <span style={{ color: '#60A5FA' }}>{hovered}</span>
            <span style={{ opacity: 0.4 }}> → </span>
            <span style={{ fontWeight: 700 }}>{resolve(hovered, '?')}</span>
          </div>
        )}
      </div>

      {/* ═══════════ RIGHT: Theme Panel ═══════════ */}
      <div style={{
        width: 310, borderLeft: `1px solid ${panelBorder}`, overflow: 'auto',
        backgroundColor: panelBg, color: panelText,
        transition: 'background-color 0.3s, color 0.3s, border-color 0.3s',
      }}>
        <div style={{ padding: '16px 20px', borderBottom: `1px solid ${panelBorder}` }}>
          <div style={{ fontWeight: 700, fontSize: 14 }}>Theme Variables</div>
          <div style={{ fontSize: 11, color: panelMuted, marginTop: 2 }}>Generate a page, then switch themes</div>
        </div>

        <Section title="MODE" border={panelBorder}>
          <div style={{ display: 'flex', gap: 3, backgroundColor: mode === 'dark' ? '#1A1A1A' : '#EBEBEB', borderRadius: 7, padding: 3 }}>
            {(['light', 'dark'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '7px 0', borderRadius: 5, border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                backgroundColor: mode === m ? (mode === 'dark' ? '#333' : '#fff') : 'transparent',
                color: mode === m ? panelText : panelMuted,
                boxShadow: mode === m ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s',
              }}>{m === 'light' ? 'Light' : 'Dark'}</button>
            ))}
          </div>
        </Section>

        <Section title="PRESETS" border={panelBorder}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {Object.entries(PRESETS).map(([name, preset]) => {
              const isActive = activePreset === name
              return (
                <button key={name} onClick={() => applyPreset(name)} style={{
                  padding: '8px 10px', borderRadius: 7, cursor: 'pointer',
                  border: `1.5px solid ${isActive ? (mode === 'dark' ? '#888' : '#111') : panelBorder}`,
                  backgroundColor: isActive ? (mode === 'dark' ? '#1A1A1A' : '#fff') : 'transparent',
                  textAlign: 'left', fontSize: 10, fontWeight: isActive ? 700 : 400,
                  color: panelText, fontFamily: 'inherit', transition: 'all 0.15s',
                }}>
                  <div style={{ display: 'flex', gap: 3, marginBottom: 5 }}>
                    {(['bg/primary', 'accent', 'text/primary'] as const).map(k => (
                      <div key={k} style={{
                        width: 16, height: 16, borderRadius: '50%',
                        backgroundColor: preset[k]?.[mode] || preset[k]?.light,
                        border: `1px solid ${panelBorder}`,
                      }} />
                    ))}
                  </div>
                  {name}
                </button>
              )
            })}
          </div>
        </Section>

        <Section title={`COLORS (${mode} mode)`} border={panelBorder}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {colorVars.map(([name, val]) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '5px 8px', borderRadius: 6,
                backgroundColor: hovered === name ? (mode === 'dark' ? '#1a1a2e' : '#EFF6FF') : 'transparent',
                transition: 'background-color 0.15s',
              }}>
                <input type="color" value={val[mode]} onChange={e => updateVar(name, e.target.value)}
                  style={{ width: 26, height: 26, border: `1.5px solid ${panelBorder}`, padding: 1, cursor: 'pointer', borderRadius: 5, backgroundColor: 'transparent' }} />
                <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{name}</div>
                <code style={{ fontSize: 10, color: panelMuted, fontFamily: '"Geist Mono", monospace' }}>{val[mode]}</code>
              </div>
            ))}
          </div>
        </Section>

        <Section title="FONTS" border={panelBorder}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {fontVars.map(([name, val]) => (
              <div key={name}>
                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4, textTransform: 'capitalize' }}>{name.replace('font/', '')}</div>
                <select value={val[mode]} onChange={e => updateVar(name, e.target.value)} style={{
                  width: '100%', padding: '7px 10px', borderRadius: 6, fontSize: 12,
                  border: `1px solid ${panelBorder}`, backgroundColor: panelInputBg, color: panelText, cursor: 'pointer', fontFamily: 'inherit',
                }}>{FONT_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}</select>
                <div style={{ marginTop: 4, fontSize: 18, fontWeight: 500, fontFamily: `"${val[mode]}", sans-serif`, color: panelMuted }}>The quick brown fox</div>
              </div>
            ))}
          </div>
        </Section>

        <Section title={`VARIABLE TABLE (${mode})`} border={panelBorder}>
          <div style={{
            fontSize: 10, fontFamily: '"Geist Mono", monospace', lineHeight: 1.9,
            backgroundColor: mode === 'dark' ? '#080808' : '#F0F0F0', padding: 12, borderRadius: 7, overflowX: 'auto',
          }}>
            {Object.entries(vars).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ color: panelMuted }}>{k}</span>
                <span style={{ fontWeight: 600, color: hovered === k ? '#3B82F6' : panelText, transition: 'color 0.15s' }}>{v[mode]}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, border, children }: { title: string; border: string; children: ReactNode }) {
  return (
    <div style={{ padding: '14px 20px', borderBottom: `1px solid ${border}` }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.4, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}
