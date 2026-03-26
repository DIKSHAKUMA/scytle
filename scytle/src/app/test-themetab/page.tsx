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
  type: 'text'; text: string
  color: string; colorRef?: string
  fontFamily?: string; fontRef?: string
  fontSize: number; fontSizeRef?: string
  fontWeight: number; lineHeight?: number
}

interface TFrame {
  type: 'frame'; name?: string; fills: Fill[]
  borderRadius?: number; borderRadiusRef?: string
  padding?: string; paddingRef?: string
  gap?: number; gapRef?: string
  shadow?: string; shadowRef?: string
  direction?: 'row' | 'column'
  align?: string; justify?: string; border?: Border
  flex?: number; children: (TFrame | TText)[]
}

/* ════════════════════════════════════════════════════════════
   VARIABLE TABLES + PRESETS
   ════════════════════════════════════════════════════════════ */

const DEFAULT_VARS: VariableTable = {
  // Colors
  'bg/primary':     { light: '#FFFFFF', dark: '#0A0A0A' },
  'bg/secondary':   { light: '#F5F5F5', dark: '#141414' },
  'text/primary':   { light: '#111111', dark: '#FAFAFA' },
  'text/secondary': { light: '#666666', dark: '#A3A3A3' },
  'accent':         { light: '#3B82F6', dark: '#60A5FA' },
  'text/on-accent': { light: '#FFFFFF', dark: '#000000' },
  'border':         { light: '#E5E5E5', dark: '#2A2A2A' },
  // Fonts
  'font/heading':   { light: 'Inter', dark: 'Inter' },
  'font/body':      { light: 'Inter', dark: 'Inter' },
  // Radius
  'radius/sm':  { light: '4', dark: '4' },
  'radius/md':  { light: '8', dark: '8' },
  'radius/lg':  { light: '16', dark: '16' },
  // Spacing
  'spacing/sm':  { light: '16', dark: '16' },
  'spacing/md':  { light: '24', dark: '24' },
  'spacing/lg':  { light: '48', dark: '48' },
  'spacing/gap': { light: '16', dark: '16' },
  // Shadows
  'shadow/sm': { light: '0 1px 3px rgba(0,0,0,0.08)', dark: '0 1px 3px rgba(0,0,0,0.4)' },
  'shadow/md': { light: '0 4px 12px rgba(0,0,0,0.1)', dark: '0 4px 12px rgba(0,0,0,0.5)' },
  // Font sizes
  'fontSize/h1':   { light: '48', dark: '48' },
  'fontSize/h2':   { light: '32', dark: '32' },
  'fontSize/body': { light: '16', dark: '16' },
}

const PRESETS: Record<string, VariableTable> = {
  'Default': structuredClone(DEFAULT_VARS),
  'Warm Earth': {
    'bg/primary': { light: '#FFFBF5', dark: '#1A1510' }, 'bg/secondary': { light: '#FEF3E2', dark: '#231C12' },
    'text/primary': { light: '#292524', dark: '#F5F0EB' }, 'text/secondary': { light: '#78716C', dark: '#A8A29E' },
    'accent': { light: '#D97706', dark: '#F59E0B' }, 'text/on-accent': { light: '#FFFFFF', dark: '#1A1510' },
    'border': { light: '#E7DDD0', dark: '#3D3530' },
    'font/heading': { light: 'Playfair Display', dark: 'Playfair Display' }, 'font/body': { light: 'Lato', dark: 'Lato' },
    'radius/sm': { light: '10', dark: '10' }, 'radius/md': { light: '14', dark: '14' }, 'radius/lg': { light: '24', dark: '24' },
    'spacing/sm': { light: '20', dark: '20' }, 'spacing/md': { light: '32', dark: '32' }, 'spacing/lg': { light: '56', dark: '56' }, 'spacing/gap': { light: '20', dark: '20' },
    'shadow/sm': { light: '0 2px 6px rgba(120,80,20,0.08)', dark: '0 2px 6px rgba(245,158,11,0.12)' },
    'shadow/md': { light: '0 6px 24px rgba(120,80,20,0.1)', dark: '0 6px 24px rgba(245,158,11,0.15)' },
    'fontSize/h1': { light: '52', dark: '52' }, 'fontSize/h2': { light: '36', dark: '36' }, 'fontSize/body': { light: '17', dark: '17' },
  },
  'Ocean': {
    'bg/primary': { light: '#F0F9FF', dark: '#0B1929' }, 'bg/secondary': { light: '#E0F2FE', dark: '#0F2640' },
    'text/primary': { light: '#0C4A6E', dark: '#E0F2FE' }, 'text/secondary': { light: '#0369A1', dark: '#7DD3FC' },
    'accent': { light: '#0284C7', dark: '#38BDF8' }, 'text/on-accent': { light: '#FFFFFF', dark: '#0B1929' },
    'border': { light: '#BAE6FD', dark: '#164E63' },
    'font/heading': { light: 'Outfit', dark: 'Outfit' }, 'font/body': { light: 'Inter', dark: 'Inter' },
    'radius/sm': { light: '6', dark: '6' }, 'radius/md': { light: '10', dark: '10' }, 'radius/lg': { light: '14', dark: '14' },
    'spacing/sm': { light: '16', dark: '16' }, 'spacing/md': { light: '24', dark: '24' }, 'spacing/lg': { light: '48', dark: '48' }, 'spacing/gap': { light: '16', dark: '16' },
    'shadow/sm': { light: '0 1px 4px rgba(2,132,199,0.08)', dark: '0 1px 4px rgba(56,189,248,0.1)' },
    'shadow/md': { light: '0 4px 16px rgba(2,132,199,0.1)', dark: '0 4px 16px rgba(56,189,248,0.12)' },
    'fontSize/h1': { light: '44', dark: '44' }, 'fontSize/h2': { light: '30', dark: '30' }, 'fontSize/body': { light: '15', dark: '15' },
  },
  'Midnight': {
    'bg/primary': { light: '#FAF5FF', dark: '#0D0520' }, 'bg/secondary': { light: '#F3E8FF', dark: '#160B2E' },
    'text/primary': { light: '#2E1065', dark: '#F3E8FF' }, 'text/secondary': { light: '#6B21A8', dark: '#C084FC' },
    'accent': { light: '#7E22CE', dark: '#A855F7' }, 'text/on-accent': { light: '#FFFFFF', dark: '#FFFFFF' },
    'border': { light: '#DDD6FE', dark: '#2E1065' },
    'font/heading': { light: 'DM Serif Display', dark: 'DM Serif Display' }, 'font/body': { light: 'Source Sans 3', dark: 'Source Sans 3' },
    'radius/sm': { light: '4', dark: '4' }, 'radius/md': { light: '8', dark: '8' }, 'radius/lg': { light: '12', dark: '12' },
    'spacing/sm': { light: '14', dark: '14' }, 'spacing/md': { light: '20', dark: '20' }, 'spacing/lg': { light: '40', dark: '40' }, 'spacing/gap': { light: '14', dark: '14' },
    'shadow/sm': { light: '0 1px 4px rgba(126,34,206,0.1)', dark: '0 1px 4px rgba(168,85,247,0.15)' },
    'shadow/md': { light: '0 4px 16px rgba(126,34,206,0.12)', dark: '0 4px 16px rgba(168,85,247,0.2)' },
    'fontSize/h1': { light: '48', dark: '48' }, 'fontSize/h2': { light: '34', dark: '34' }, 'fontSize/body': { light: '16', dark: '16' },
  },
  'Rose': {
    'bg/primary': { light: '#FFF1F2', dark: '#1C0A0D' }, 'bg/secondary': { light: '#FFE4E6', dark: '#2D1216' },
    'text/primary': { light: '#4C0519', dark: '#FFE4E6' }, 'text/secondary': { light: '#BE123C', dark: '#FDA4AF' },
    'accent': { light: '#E11D48', dark: '#FB7185' }, 'text/on-accent': { light: '#FFFFFF', dark: '#1C0A0D' },
    'border': { light: '#FECDD3', dark: '#4C0519' },
    'font/heading': { light: 'Bricolage Grotesque', dark: 'Bricolage Grotesque' }, 'font/body': { light: 'Inter', dark: 'Inter' },
    'radius/sm': { light: '12', dark: '12' }, 'radius/md': { light: '20', dark: '20' }, 'radius/lg': { light: '32', dark: '32' },
    'spacing/sm': { light: '20', dark: '20' }, 'spacing/md': { light: '28', dark: '28' }, 'spacing/lg': { light: '52', dark: '52' }, 'spacing/gap': { light: '18', dark: '18' },
    'shadow/sm': { light: '0 2px 6px rgba(225,29,72,0.06)', dark: '0 2px 6px rgba(251,113,133,0.1)' },
    'shadow/md': { light: '0 6px 20px rgba(225,29,72,0.08)', dark: '0 6px 20px rgba(251,113,133,0.12)' },
    'fontSize/h1': { light: '46', dark: '46' }, 'fontSize/h2': { light: '34', dark: '34' }, 'fontSize/body': { light: '16', dark: '16' },
  },
}

/* ════════════════════════════════════════════════════════════
   SINGLE-PASS PARSER+LINKER
   Converts AI HTML → TFrame/TText tree WITH refs assigned inline.
   No separate linking step — refs are matched during node creation.
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

function normalizeHex(hex: string): string {
  let h = hex.trim().toLowerCase()
  if (!h.startsWith('#')) return h
  if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]
  return h
}

function normalizeShadow(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ')
}

interface LinkMaps {
  colorMap: Map<string, string>
  fontMap: Map<string, string>
  radiusMap: Map<string, string>
  spacingMap: Map<string, string>
  shadowMap: Map<string, string>
  fontSizeMap: Map<string, string>
}

/** Build reverse-lookup maps from variable table for a given mode */
function buildLinkMaps(vars: VariableTable, mode: 'light' | 'dark'): LinkMaps {
  const maps: LinkMaps = {
    colorMap: new Map(), fontMap: new Map(),
    radiusMap: new Map(), spacingMap: new Map(),
    shadowMap: new Map(), fontSizeMap: new Map(),
  }
  for (const [name, val] of Object.entries(vars)) {
    const v = val[mode]
    if (name.startsWith('font/'))        maps.fontMap.set(v.toLowerCase(), name)
    else if (name.startsWith('radius/'))  maps.radiusMap.set(v, name)
    else if (name.startsWith('spacing/')) maps.spacingMap.set(v, name)
    else if (name.startsWith('shadow/'))  maps.shadowMap.set(normalizeShadow(v), name)
    else if (name.startsWith('fontSize/')) maps.fontSizeMap.set(v, name)
    else                                  maps.colorMap.set(normalizeHex(v), name)
  }
  return maps
}

/**
 * Parse + Link in one pass.
 * If vars/mode supplied → assigns refs during node creation.
 * If omitted → pure parse (no refs), for backward compat.
 */
function parseHTMLToNodes(html: string, vars?: VariableTable, mode?: 'light' | 'dark'): TFrame {
  const maps = vars && mode ? buildLinkMaps(vars, mode) : undefined
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const root = doc.body.firstElementChild as HTMLElement || doc.body
  return walkElement(root, maps) as TFrame
}

function walkElement(el: HTMLElement, m?: LinkMaps): TFrame | TText {
  const styles = parseInlineStyles(el.getAttribute('style') || '')
  const tag = el.tagName.toLowerCase()
  const childElements = Array.from(el.children) as HTMLElement[]

  // If leaf node with text content → TText (with refs assigned inline)
  if (childElements.length === 0 && el.textContent?.trim()) {
    const color = styles['color'] || '#000000'
    const fontFamily = cleanFont(styles['font-family'])
    const fontSize = parsePxValue(styles['font-size'], tag.match(/^h[1-6]$/) ? ({ h1: 48, h2: 36, h3: 28, h4: 24, h5: 20, h6: 16 }[tag] ?? 16) : 16)

    const node: TText = {
      type: 'text',
      text: el.textContent.trim(),
      color,
      fontSize,
      fontWeight: parseFontWeight(styles['font-weight'] || (tag.match(/^h[1-6]$/) ? '700' : undefined)),
      fontFamily,
      lineHeight: styles['line-height'] ? parseFloat(styles['line-height']) || undefined : undefined,
    }

    // Assign refs inline if maps available
    if (m) {
      const colorVar = m.colorMap.get(normalizeHex(color))
      if (colorVar) node.colorRef = colorVar
      if (fontFamily) {
        const fontVar = m.fontMap.get(fontFamily.toLowerCase())
        if (fontVar) node.fontRef = fontVar
      }
      const fsVar = m.fontSizeMap.get(String(fontSize))
      if (fsVar) node.fontSizeRef = fsVar
    }

    return node
  }

  // Otherwise → TFrame
  const children: (TFrame | TText)[] = []
  for (const child of childElements) {
    children.push(walkElement(child, m))
  }
  // Direct text nodes not inside child elements
  for (const childNode of el.childNodes) {
    if (childNode.nodeType === 3 && childNode.textContent?.trim()) {
      const color = styles['color'] || '#000000'
      const fontFamily = cleanFont(styles['font-family'])
      const fontSize = parsePxValue(styles['font-size'], 16)

      const textNode: TText = {
        type: 'text',
        text: childNode.textContent.trim(),
        color,
        fontSize,
        fontWeight: parseFontWeight(styles['font-weight']),
        fontFamily,
      }

      if (m) {
        const colorVar = m.colorMap.get(normalizeHex(color))
        if (colorVar) textNode.colorRef = colorVar
        if (fontFamily) {
          const fontVar = m.fontMap.get(fontFamily.toLowerCase())
          if (fontVar) textNode.fontRef = fontVar
        }
        const fsVar = m.fontSizeMap.get(String(fontSize))
        if (fsVar) textNode.fontSizeRef = fsVar
      }

      children.push(textNode)
    }
  }

  const bg = styles['background-color'] || styles['background']
  const fills: Fill[] = []
  if (bg && bg !== 'transparent') {
    const fill: Fill = { color: bg }
    if (m) {
      const varName = m.colorMap.get(normalizeHex(bg))
      if (varName) fill.ref = varName
    }
    fills.push(fill)
  }

  const borderRadius = parsePxValue(styles['border-radius'], 0)
  const gap = parsePxValue(styles['gap'], 0)
  const flexDir = styles['flex-direction']
  const padding = styles['padding']
  const shadow = styles['box-shadow']

  // Detect border (with ref)
  let border: Border | undefined
  const borderStr = styles['border']
  if (borderStr) {
    const match = borderStr.match(/([\d.]+)px\s+\w+\s+(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\))/)
    if (match) {
      border = { width: parseFloat(match[1]), color: match[2], ref: undefined }
      if (m) {
        const varName = m.colorMap.get(normalizeHex(match[2]))
        if (varName) border.ref = varName
      }
    }
  }

  // Build frame with refs assigned inline
  const frame: TFrame = {
    type: 'frame',
    name: tag,
    fills,
    borderRadius: borderRadius || undefined,
    padding: padding || undefined,
    gap: gap || undefined,
    shadow: shadow || undefined,
    direction: flexDir === 'row' ? 'row' : (flexDir === 'column' ? 'column' : undefined),
    align: styles['align-items'] || undefined,
    justify: styles['justify-content'] || undefined,
    border,
    flex: styles['flex'] ? parseFloat(styles['flex']) || undefined : undefined,
    children,
  }

  // Assign numeric/shadow refs inline
  if (m) {
    if (frame.borderRadius != null) {
      const radVar = m.radiusMap.get(String(frame.borderRadius))
      if (radVar) frame.borderRadiusRef = radVar
    }
    if (frame.padding) {
      const nums = frame.padding.match(/[\d.]+/g)?.map(Number) || []
      if (nums.length >= 1) {
        const spaceVar = m.spacingMap.get(String(nums[0]))
        if (spaceVar) frame.paddingRef = spaceVar
      }
    }
    if (frame.gap != null) {
      const gapVar = m.spacingMap.get(String(frame.gap))
      if (gapVar) frame.gapRef = gapVar
    }
    if (frame.shadow) {
      const shadowVar = m.shadowMap.get(normalizeShadow(frame.shadow))
      if (shadowVar) frame.shadowRef = shadowVar
    }
  }

  return frame
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
  if (node.type === 'text') {
    if (node.colorRef) c++; if (node.fontRef) c++; if (node.fontSizeRef) c++
    return c
  }
  if (node.fills[0]?.ref) c++; if (node.border?.ref) c++
  if (node.borderRadiusRef) c++; if (node.paddingRef) c++
  if (node.gapRef) c++; if (node.shadowRef) c++
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

  // Resolve a string variable (colors, fonts, shadows)
  const resolve = useCallback(
    (ref: string | undefined, fallback: string): string => {
      if (!ref) return fallback
      const v = vars[ref]
      if (!v) return fallback
      return v[mode]
    },
    [vars, mode]
  )

  // Resolve a number variable (radius, spacing, fontSize)
  const resolveNum = useCallback(
    (ref: string | undefined, fallback: number): number => {
      if (!ref) return fallback
      const v = vars[ref]
      if (!v) return fallback
      const num = parseFloat(v[mode])
      return isNaN(num) ? fallback : num
    },
    [vars, mode]
  )

  // Resolve padding — scales proportionally if ref exists
  const resolvePadding = useCallback(
    (ref: string | undefined, original: string | undefined): string | undefined => {
      if (!ref || !original) return original
      const v = vars[ref]
      if (!v) return original
      const newBase = parseFloat(v[mode])
      if (isNaN(newBase)) return original
      const origNums = original.match(/[\d.]+/g)?.map(Number) || []
      if (origNums.length === 0 || origNums[0] === 0) return original
      const ratio = newBase / origNums[0]
      return original.replace(/[\d.]+/g, m => String(Math.round(parseFloat(m) * ratio)))
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

  /* ── GENERATE: prompt → AI → single-pass parse+link → render ── */
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
          radius: {
            sm: vars['radius/sm'][mode],
            md: vars['radius/md'][mode],
            lg: vars['radius/lg'][mode],
          },
          spacing: {
            sm: vars['spacing/sm'][mode],
            md: vars['spacing/md'][mode],
            lg: vars['spacing/lg'][mode],
            gap: vars['spacing/gap'][mode],
          },
          shadows: {
            sm: vars['shadow/sm'][mode],
            md: vars['shadow/md'][mode],
          },
          fontSizes: {
            h1: vars['fontSize/h1'][mode],
            h2: vars['fontSize/h2'][mode],
            body: vars['fontSize/body'][mode],
          },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Generation failed (${res.status})`)
      }

      const { html } = await res.json()

      // Single-pass: parse HTML + assign variable refs in one walk
      const parsed = parseHTMLToNodes(html, vars, mode)
      const totalNodes = countNodes(parsed)
      const totalRefs = countRefs(parsed)

      setPageNodes(parsed)
      setGenStats({ nodes: totalNodes, refs: totalRefs, linked: totalRefs })
    } catch (err: any) {
      setGenError(err.message)
    } finally {
      setGenerating(false)
    }
  }

  const activeNodes = pageNodes

  /* ── Recursive renderer ── */
  function renderNode(node: TFrame | TText, key: string): ReactNode {
    if (node.type === 'text') {
      return (
        <span key={key} style={{
          color: resolve(node.colorRef, node.color),
          fontFamily: `"${resolve(node.fontRef, node.fontFamily || 'Inter')}", sans-serif`,
          fontSize: resolveNum(node.fontSizeRef, node.fontSize),
          fontWeight: node.fontWeight,
          lineHeight: node.lineHeight ?? 1.5,
          display: 'block', whiteSpace: 'pre-line',
          transition: 'all 0.3s ease',
        }}
          onMouseEnter={() => setHovered(node.colorRef || node.fontSizeRef || null)}
          onMouseLeave={() => setHovered(null)}
        >{node.text}</span>
      )
    }
    const bg = node.fills[0] ? resolve(node.fills[0].ref, node.fills[0].color) : 'transparent'
    const borderColor = node.border ? resolve(node.border.ref, node.border.color) : undefined
    const style: CSSProperties = {
      backgroundColor: bg,
      borderRadius: resolveNum(node.borderRadiusRef, node.borderRadius ?? 0),
      padding: resolvePadding(node.paddingRef, node.padding),
      display: 'flex',
      flexDirection: node.direction === 'row' ? 'row' : 'column',
      gap: resolveNum(node.gapRef, node.gap ?? 0) || undefined,
      alignItems: node.align ?? (node.direction === 'row' ? 'center' : undefined),
      justifyContent: node.justify ?? undefined,
      boxShadow: resolve(node.shadowRef, node.shadow || 'none'),
      transition: 'all 0.3s ease',
      ...(node.flex ? { flex: node.flex } : {}),
      ...(borderColor ? { border: `${node.border!.width}px solid ${borderColor}` } : {}),
      overflowX: 'hidden' as const,
    }
    return (
      <div key={key} style={style}
        onMouseEnter={(e) => { e.stopPropagation(); setHovered(node.fills[0]?.ref || node.borderRadiusRef || node.shadowRef || null) }}
        onMouseLeave={(e) => { e.stopPropagation(); setHovered(null) }}
      >{node.children.map((child, i) => renderNode(child, `${key}-${i}`))}</div>
    )
  }

  /* ── Theme Panel variable groups ── */
  const colorVars = Object.entries(vars).filter(([k]) => !k.startsWith('font/') && !k.startsWith('radius/') && !k.startsWith('spacing/') && !k.startsWith('shadow/') && !k.startsWith('fontSize/'))
  const fontVars = Object.entries(vars).filter(([k]) => k.startsWith('font/'))
  const radiusVars = Object.entries(vars).filter(([k]) => k.startsWith('radius/'))
  const spacingVars = Object.entries(vars).filter(([k]) => k.startsWith('spacing/'))
  const shadowVars = Object.entries(vars).filter(([k]) => k.startsWith('shadow/'))
  const fontSizeVars = Object.entries(vars).filter(([k]) => k.startsWith('fontSize/'))

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
                color: panelText, fontFamily: 'inherit', outline: 'none',
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
          {genStats && (
            <div style={{
              maxWidth: 720, margin: '0 auto 12px',
              display: 'flex', justifyContent: 'space-between',
              fontSize: 11, color: mode === 'dark' ? '#555' : '#999',
            }}>
              <span style={{ fontWeight: 600 }}>
                AI Generated — {genStats.nodes} nodes, {genStats.refs} refs (single-pass)
              </span>
              <span>Mode: {mode} &middot; Preset: {activePreset}</span>
            </div>
          )}

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
                AI will create a page with your palette colors, radius, spacing, and shadows.
                <br />Refs are assigned during parsing in a single pass — no separate linking step.
                <br />Then switch themes and watch everything transform.
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
          <div style={{ fontSize: 11, color: panelMuted, marginTop: 2 }}>Colors, shapes, spacing, effects, type</div>
        </div>

        {/* MODE */}
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

        {/* PRESETS */}
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

        {/* COLORS */}
        <Section title={`COLORS (${mode})`} border={panelBorder}>
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

        {/* FONTS */}
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

        {/* SHAPES (radius) */}
        <Section title="SHAPES" border={panelBorder}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {radiusVars.map(([name, val]) => {
              const num = parseFloat(val[mode])
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{name.replace('radius/', '')}</span>
                    <code style={{ fontSize: 10, color: panelMuted, fontFamily: '"Geist Mono", monospace' }}>{num}px</code>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="range" min={0} max={40} value={num}
                      onChange={e => updateVar(name, e.target.value)}
                      style={{ flex: 1, accentColor: vars['accent'][mode], cursor: 'pointer' }} />
                    <div style={{
                      width: 32, height: 32, borderRadius: num,
                      backgroundColor: vars['accent'][mode], transition: 'all 0.2s',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* SPACING */}
        <Section title="SPACING" border={panelBorder}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {spacingVars.map(([name, val]) => {
              const num = parseFloat(val[mode])
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{name.replace('spacing/', '')}</span>
                    <code style={{ fontSize: 10, color: panelMuted, fontFamily: '"Geist Mono", monospace' }}>{num}px</code>
                  </div>
                  <input type="range" min={4} max={80} value={num}
                    onChange={e => updateVar(name, e.target.value)}
                    style={{ width: '100%', accentColor: vars['accent'][mode], cursor: 'pointer' }} />
                </div>
              )
            })}
          </div>
        </Section>

        {/* EFFECTS (shadows) */}
        <Section title="EFFECTS" border={panelBorder}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {shadowVars.map(([name, val]) => (
              <div key={name}>
                <div style={{ fontSize: 11, fontWeight: 500, marginBottom: 4 }}>{name.replace('shadow/', '')}</div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{
                    width: 40, height: 28, borderRadius: 6,
                    backgroundColor: mode === 'dark' ? '#222' : '#fff',
                    boxShadow: val[mode], transition: 'box-shadow 0.3s',
                  }} />
                  <code style={{
                    fontSize: 9, color: panelMuted, fontFamily: '"Geist Mono", monospace',
                    flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{val[mode]}</code>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* TYPE SCALE (font sizes) */}
        <Section title="TYPE SCALE" border={panelBorder}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {fontSizeVars.map(([name, val]) => {
              const num = parseFloat(val[mode])
              return (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 500 }}>{name.replace('fontSize/', '')}</span>
                    <code style={{ fontSize: 10, color: panelMuted, fontFamily: '"Geist Mono", monospace' }}>{num}px</code>
                  </div>
                  <input type="range" min={10} max={72} value={num}
                    onChange={e => updateVar(name, e.target.value)}
                    style={{ width: '100%', accentColor: vars['accent'][mode], cursor: 'pointer' }} />
                  <div style={{
                    marginTop: 2, fontSize: num, fontWeight: name.includes('body') ? 400 : 700,
                    fontFamily: `"${resolve(name.includes('body') ? 'font/body' : 'font/heading', 'Inter')}", sans-serif`,
                    color: panelMuted, lineHeight: 1.2, overflow: 'hidden', maxHeight: 52,
                    transition: 'all 0.2s',
                  }}>Aa</div>
                </div>
              )
            })}
          </div>
        </Section>

        {/* VARIABLE TABLE */}
        <Section title={`VARIABLE TABLE (${mode})`} border={panelBorder}>
          <div style={{
            fontSize: 10, fontFamily: '"Geist Mono", monospace', lineHeight: 1.9,
            backgroundColor: mode === 'dark' ? '#080808' : '#F0F0F0', padding: 12, borderRadius: 7, overflowX: 'auto',
          }}>
            {Object.entries(vars).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                <span style={{ color: panelMuted }}>{k}</span>
                <span style={{
                  fontWeight: 600,
                  color: hovered === k ? '#3B82F6' : panelText,
                  transition: 'color 0.15s',
                  maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>{v[mode]}</span>
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
