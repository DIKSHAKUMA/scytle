/**
 * Tailwind-to-Inline Style Converter
 *
 * Converts HTML with Tailwind classes to HTML with inline styles.
 * Uses tailwindcss v4's __unstable__loadDesignSystem API (server-only).
 *
 * Why: DOMParser reads element.style (inline styles only), not computed styles.
 * Tailwind classes must be resolved to inline styles before parsing.
 */

import { __unstable__loadDesignSystem } from 'tailwindcss'

// ─── Types ───────────────────────────────────────

interface ConversionResult {
  html: string
  /** Classes that couldn't be resolved (for debugging) */
  unresolvedClasses: string[]
}

type DesignSystem = Awaited<ReturnType<typeof __unstable__loadDesignSystem>>

// ─── Design System Singleton ─────────────────────

let _ds: DesignSystem | null = null
let _dsPromise: Promise<DesignSystem> | null = null

/**
 * Read a file from node_modules using dynamic import to avoid turbopack
 * intercepting fs/path calls. We use eval to hide from the bundler.
 */
function readNodeModulesFile(modulePath: string): { path: string; base: string; content: string } {
  // eslint-disable-next-line no-eval
  const _fs = eval('require')('fs') as typeof import('fs')
  // eslint-disable-next-line no-eval
  const _path = eval('require')('path') as typeof import('path')

  let dir = process.cwd()
  for (let i = 0; i < 10; i++) {
    const candidate = _path.join(dir, 'node_modules', modulePath)
    if (_fs.existsSync(candidate)) {
      return {
        path: candidate,
        base: _path.dirname(candidate),
        content: _fs.readFileSync(candidate, 'utf-8'),
      }
    }
    const parent = _path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  throw new Error(`Could not find ${modulePath} in node_modules`)
}

async function getDesignSystem(): Promise<DesignSystem> {
  if (_ds) return _ds
  if (_dsPromise) return _dsPromise

  _dsPromise = __unstable__loadDesignSystem('@import "tailwindcss";', {
    loadStylesheet: async (id: string, base: string) => {
      if (id === 'tailwindcss') {
        return readNodeModulesFile('tailwindcss/index.css')
      }
      // For other imports (e.g., tailwindcss sub-imports), resolve relative to base
      // eslint-disable-next-line no-eval
      const _fs = eval('require')('fs') as typeof import('fs')
      // eslint-disable-next-line no-eval
      const _path = eval('require')('path') as typeof import('path')

      const resolved = _path.resolve(base, id)
      if (_fs.existsSync(resolved)) {
        return {
          path: resolved,
          base: _path.dirname(resolved),
          content: _fs.readFileSync(resolved, 'utf-8'),
        }
      }
      // Fallback: try in node_modules
      return readNodeModulesFile(id)
    },
  })

  _ds = await _dsPromise
  _dsPromise = null
  return _ds
}

// ─── CSS Variable Resolution Cache ──────────────

const _varCache = new Map<string, string>()

async function resolveVar(ds: DesignSystem, varRef: string): Promise<string> {
  const cached = _varCache.get(varRef)
  if (cached !== undefined) return cached

  // Extract variable name from var(...) — handle nested var() with fallback
  const match = varRef.match(/^var\(([^,)]+?)(?:,\s*(.+))?\)$/)
  if (!match) return varRef

  const varName = match[1].trim()
  const fallback = match[2]?.trim()

  const resolved = ds.resolveThemeValue(varName)
  if (resolved) {
    // Resolve might itself contain var() references
    const final = resolved.includes('var(')
      ? await resolveAllVars(ds, resolved)
      : resolved
    _varCache.set(varRef, final)
    return final
  }

  // Try fallback
  if (fallback) {
    const resolvedFallback = fallback.includes('var(')
      ? await resolveAllVars(ds, fallback)
      : fallback
    _varCache.set(varRef, resolvedFallback)
    return resolvedFallback
  }

  _varCache.set(varRef, varRef)
  return varRef
}

async function resolveAllVars(ds: DesignSystem, value: string): Promise<string> {
  // Iteratively resolve var() references (may be nested)
  let result = value
  let maxIterations = 10

  while (result.includes('var(') && maxIterations-- > 0) {
    // Find innermost var() first (no nested var() inside)
    const varPattern = /var\([^()]*\)/g
    let changed = false
    const promises: Array<{ match: string; resolved: Promise<string> }> = []

    let m: RegExpExecArray | null
    while ((m = varPattern.exec(result)) !== null) {
      promises.push({ match: m[0], resolved: resolveVar(ds, m[0]) })
    }

    const resolved = await Promise.all(promises.map((p) => p.resolved))
    for (let i = 0; i < promises.length; i++) {
      if (promises[i].match !== resolved[i]) {
        result = result.replace(promises[i].match, resolved[i])
        changed = true
      }
    }

    if (!changed) break
  }

  return result
}

// ─── Unit Conversion ─────────────────────────────

/**
 * Convert CSS logical properties to physical properties.
 * Tailwind v4 outputs logical properties (padding-inline, margin-block, etc.)
 * but DOMParser's element.style doesn't expand them to physical properties.
 * We convert at the source so the parser always sees padding-left, margin-top, etc.
 */
const LOGICAL_TO_PHYSICAL: Record<string, string[]> = {
  'padding-inline': ['padding-left', 'padding-right'],
  'padding-block': ['padding-top', 'padding-bottom'],
  'padding-inline-start': ['padding-left'],
  'padding-inline-end': ['padding-right'],
  'padding-block-start': ['padding-top'],
  'padding-block-end': ['padding-bottom'],
  'margin-inline': ['margin-left', 'margin-right'],
  'margin-block': ['margin-top', 'margin-bottom'],
  'margin-inline-start': ['margin-left'],
  'margin-inline-end': ['margin-right'],
  'margin-block-start': ['margin-top'],
  'margin-block-end': ['margin-bottom'],
  'border-inline-width': ['border-left-width', 'border-right-width'],
  'border-block-width': ['border-top-width', 'border-bottom-width'],
  'border-inline-style': ['border-left-style', 'border-right-style'],
  'border-block-style': ['border-top-style', 'border-bottom-style'],
  'border-inline-color': ['border-left-color', 'border-right-color'],
  'border-block-color': ['border-top-color', 'border-bottom-color'],
  'inset-inline': ['left', 'right'],
  'inset-block': ['top', 'bottom'],
  'inset-inline-start': ['left'],
  'inset-inline-end': ['right'],
  'inset-block-start': ['top'],
  'inset-block-end': ['bottom'],
}

function logicalToPhysical(props: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const [prop, value] of Object.entries(props)) {
    const physical = LOGICAL_TO_PHYSICAL[prop]
    if (physical) {
      for (const p of physical) {
        // Don't override if physical prop is already set
        if (!(p in result) && !(p in props)) {
          result[p] = value
        }
      }
    } else {
      result[prop] = value
    }
  }
  return result
}

function remToPx(value: string): string {
  return value.replace(/([\d.]+)rem\b/g, (_, n) => `${parseFloat(n) * 16}px`)
}

function resolveCalc(value: string): string {
  // Resolve calc() expressions that contain only simple arithmetic
  return value.replace(/calc\(([^)]+)\)/g, (_, expr: string) => {
    const trimmed = expr.trim()

    // Try simple binary operation: A op B  (with optional units)
    const binMatch = trimmed.match(/^([\d.]+)(px|rem)?\s*([*/+-])\s*([\d.-]+)(px|rem)?$/)
    if (binMatch) {
      const a = parseFloat(binMatch[1])
      const unitA = binMatch[2] || ''
      const op = binMatch[3]
      const b = parseFloat(binMatch[4])
      const unitB = binMatch[5] || ''
      const unit = unitA || unitB || ''

      let result: number
      switch (op) {
        case '*': result = a * b; break
        case '/': result = b !== 0 ? a / b : 0; break
        case '+': result = a + b; break
        case '-': result = a - b; break
        default: return `calc(${expr})`
      }

      // For division, result is unitless if both sides have same unit
      if (op === '/' && unitA === unitB) return `${Math.round(result * 1000) / 1000}`
      return `${Math.round(result * 1000) / 1000}${unit}`
    }

    // Reverse order for multiplication: N * Apx
    const revMatch = trimmed.match(/^([\d.-]+)\s*\*\s*([\d.]+)(px|rem)?$/)
    if (revMatch) {
      const a = parseFloat(revMatch[1])
      const b = parseFloat(revMatch[2])
      const unit = revMatch[3] || ''
      return `${Math.round(a * b * 1000) / 1000}${unit}`
    }

    return `calc(${expr})`
  })
}

// ─── CSS Rule Parsing ─────────────────────────────

interface ParsedRule {
  /** Standard CSS properties (e.g., display, background-color) */
  props: Record<string, string>
  /** Internal --tw-* custom properties set by this class */
  twVars: Map<string, string>
  /** @property initial-values from this class's CSS */
  initials: Map<string, string>
}

function parseRuleRaw(cssRule: string): ParsedRule {
  const props: Record<string, string> = {}
  const twVars = new Map<string, string>()
  const initials = new Map<string, string>()

  // Extract @property initial-values
  const propertyPattern = /@property\s+(--[\w-]+)\s*\{[^}]*initial-value:\s*([^;}]+)/g
  let propMatch: RegExpExecArray | null
  while ((propMatch = propertyPattern.exec(cssRule)) !== null) {
    initials.set(propMatch[1].trim(), propMatch[2].trim())
  }

  // Extract the main rule block (first { ... })
  const blockMatch = cssRule.match(/\{([^}]+)\}/)
  if (!blockMatch) return { props, twVars, initials }

  const declarations = blockMatch[1].split(';').filter(Boolean)
  for (const decl of declarations) {
    const colonIdx = decl.indexOf(':')
    if (colonIdx === -1) continue
    const prop = decl.substring(0, colonIdx).trim()
    const value = decl.substring(colonIdx + 1).trim()
    if (!prop || !value) continue

    if (prop.startsWith('--tw-')) {
      twVars.set(prop, value)
    } else {
      props[prop] = value
    }
  }

  return { props, twVars, initials }
}

/**
 * Merge all CSS rules for an element's classes, then resolve internal --tw-* vars.
 * Handles deeply nested var() references (e.g., gradient stops chain).
 */
function mergeAndResolve(parsedRules: ParsedRule[]): Record<string, string> {
  const allTwVars = new Map<string, string>()
  const allInitials = new Map<string, string>()
  const allProps: Record<string, string> = {}

  for (const rule of parsedRules) {
    for (const [k, v] of rule.initials) allInitials.set(k, v)
    for (const [k, v] of rule.twVars) allTwVars.set(k, v)
    Object.assign(allProps, rule.props)
  }

  /**
   * Resolve a string containing var() references.
   * Handles nested var() with proper paren balancing.
   * Only resolves --tw-* vars; leaves theme vars (--spacing, --color-*) for later.
   */
  function resolveStr(str: string, depth = 0): string {
    if (depth > 10 || !str.includes('var(--tw-')) return str

    let result = ''
    let i = 0
    while (i < str.length) {
      const varStart = str.indexOf('var(--tw-', i)
      if (varStart === -1) {
        result += str.substring(i)
        break
      }

      // Copy everything before var(
      result += str.substring(i, varStart)

      // Parse var(--tw-name) or var(--tw-name, fallback)
      let j = varStart + 4 // skip "var("
      // Extract variable name
      let nameEnd = j
      while (nameEnd < str.length && /[\w-]/.test(str[nameEnd])) nameEnd++
      const varName = str.substring(j, nameEnd)

      // Skip whitespace
      while (nameEnd < str.length && str[nameEnd] === ' ') nameEnd++

      let fallback: string | undefined
      if (str[nameEnd] === ',') {
        // Has fallback — collect with balanced parens
        nameEnd++ // skip comma
        while (nameEnd < str.length && str[nameEnd] === ' ') nameEnd++
        let parenDepth = 1
        const fallbackStart = nameEnd
        while (nameEnd < str.length && parenDepth > 0) {
          if (str[nameEnd] === '(') parenDepth++
          else if (str[nameEnd] === ')') parenDepth--
          if (parenDepth > 0) nameEnd++
        }
        fallback = str.substring(fallbackStart, nameEnd).trim()
        nameEnd++ // skip closing paren
      } else if (str[nameEnd] === ')') {
        nameEnd++ // skip closing paren
      } else {
        // Malformed — just skip
        result += str.substring(varStart, nameEnd)
        i = nameEnd
        continue
      }

      // Resolve: twVars > initials > fallback
      const resolved = allTwVars.get(varName) ?? allInitials.get(varName)
      if (resolved !== undefined) {
        result += resolveStr(resolved, depth + 1)
      } else if (fallback !== undefined) {
        result += resolveStr(fallback, depth + 1)
      } else {
        result += '' // unresolvable
      }
      i = nameEnd
    }

    return result
  }

  // First resolve all --tw-* vars themselves (they may reference each other)
  for (let pass = 0; pass < 5; pass++) {
    let changed = false
    for (const [name, value] of allTwVars) {
      if (value.includes('var(--tw-')) {
        const resolved = resolveStr(value)
        if (resolved !== value) {
          allTwVars.set(name, resolved)
          changed = true
        }
      }
    }
    if (!changed) break
  }

  // Now resolve standard properties
  for (const [prop, value] of Object.entries(allProps)) {
    if (!value.includes('var(--tw-')) continue

    let resolved = resolveStr(value)

    // Clean up transparent shadows/rings (0 0 #0000)
    if (resolved.includes('0 0 #0000')) {
      resolved = resolved
        .split(',')
        .map(s => s.trim())
        .filter(s => s && s !== '0 0 #0000')
        .join(', ')
    }

    if (resolved && resolved !== 'initial') {
      allProps[prop] = resolved
    } else {
      delete allProps[prop]
    }
  }

  return allProps
}

// ─── Main Conversion Logic ───────────────────────

export async function convertTailwindToInline(html: string): Promise<ConversionResult> {
  const ds = await getDesignSystem()
  const unresolvedClasses: string[] = []

  // Collect all unique classes across the entire HTML
  const uniqueClasses = new Set<string>()
  const classAttrPattern = /class="([^"]*)"/g

  let match: RegExpExecArray | null
  while ((match = classAttrPattern.exec(html)) !== null) {
    const classes = match[1].split(/\s+/).filter(Boolean)
    for (const c of classes) uniqueClasses.add(c)
  }

  if (uniqueClasses.size === 0) return { html, unresolvedClasses: [] }

  // Batch convert all unique classes at once
  const classArray = Array.from(uniqueClasses)
  const cssResults = ds.candidatesToCss(classArray)

  // Build class → raw parsed rule map
  const classRuleMap = new Map<string, ParsedRule>()
  for (let i = 0; i < classArray.length; i++) {
    const cssRule = cssResults[i]
    if (cssRule) {
      const parsed = parseRuleRaw(cssRule)
      if (Object.keys(parsed.props).length > 0 || parsed.twVars.size > 0) {
        classRuleMap.set(classArray[i], parsed)
      } else {
        unresolvedClasses.push(classArray[i])
      }
    } else {
      unresolvedClasses.push(classArray[i])
    }
  }

  // Process the HTML: for each class attribute, merge all class rules then resolve
  const replacements: Array<{ start: number; end: number; replacement: string }> = []

  const classPattern2 = /class="([^"]*)"/g
  while ((match = classPattern2.exec(html)) !== null) {
    const classStr = match[1]
    const classes = classStr.split(/\s+/).filter(Boolean)
    const start = match.index
    const end = start + match[0].length

    // Collect parsed rules for all classes on this element
    const rules: ParsedRule[] = []
    for (const cls of classes) {
      const rule = classRuleMap.get(cls)
      if (rule) rules.push(rule)
    }

    if (rules.length === 0) continue

    // Merge all rules and resolve cross-class --tw-* vars
    let mergedProps = mergeAndResolve(rules)

    // Convert logical CSS properties to physical (padding-inline → padding-left/right, etc.)
    mergedProps = logicalToPhysical(mergedProps)

    // Resolve remaining theme vars and convert units
    for (const [prop, value] of Object.entries(mergedProps)) {
      let resolved = value
      if (resolved.includes('var(')) {
        resolved = await resolveAllVars(ds, resolved)
      }
      if (resolved.includes('calc(')) {
        resolved = resolveCalc(resolved)
      }
      if (resolved.includes('rem')) {
        resolved = remToPx(resolved)
      }
      mergedProps[prop] = resolved
    }

    if (Object.keys(mergedProps).length === 0) continue

    // Check if there's already a style attribute after this class
    const afterClass = html.substring(end, end + 500)
    const existingStyleMatch = afterClass.match(/^\s+style="([^"]*)"/)

    // Build style string
    const newStyleParts: string[] = []
    for (const [prop, value] of Object.entries(mergedProps)) {
      newStyleParts.push(`${prop}: ${value}`)
    }

    if (existingStyleMatch) {
      // Merge: existing inline styles take priority over Tailwind
      const existingDecls = existingStyleMatch[1]
        .split(';')
        .map((d) => d.trim())
        .filter(Boolean)

      const existingProps = new Set<string>()
      for (const decl of existingDecls) {
        const colonIdx = decl.indexOf(':')
        if (colonIdx !== -1) existingProps.add(decl.substring(0, colonIdx).trim())
      }

      const finalParts = [...existingDecls]
      for (const part of newStyleParts) {
        const prop = part.substring(0, part.indexOf(':')).trim()
        if (!existingProps.has(prop)) {
          finalParts.push(part)
        }
      }

      const styleStr = finalParts.join('; ')
      const totalEnd = end + existingStyleMatch[0].length
      replacements.push({
        start,
        end: totalEnd,
        replacement: `class="${classStr}" style="${styleStr}"`,
      })
    } else {
      const styleStr = newStyleParts.join('; ')
      replacements.push({
        start,
        end,
        replacement: `class="${classStr}" style="${styleStr}"`,
      })
    }
  }

  // Apply replacements in reverse order
  let result = html
  replacements.sort((a, b) => b.start - a.start)
  for (const rep of replacements) {
    result = result.substring(0, rep.start) + rep.replacement + result.substring(rep.end)
  }

  return { html: result, unresolvedClasses }
}
