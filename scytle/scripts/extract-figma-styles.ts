/**
 * Extract Figma Styles → Scytle Token Map
 *
 * Pulls text styles, color styles, local variables, and effect styles
 * from the Relume Figma kit (or any Figma file) and outputs a
 * Scytle-compatible Concept JSON that can be loaded into the style guide.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/extract-figma-styles.ts [FILE_KEY]
 *
 * Outputs:
 *   1. Console: full extracted tokens
 *   2. File: scripts/output/figma-tokens.json (complete raw extraction)
 *   3. File: scripts/output/scytle-concept.json (mapped Concept object)
 */

import fs from 'fs'
import path from 'path'

// ============================================
// Config
// ============================================

const FIGMA_TOKEN = process.env.FIGMA_TOKEN!
if (!FIGMA_TOKEN) {
    console.error('❌ Missing FIGMA_TOKEN environment variable')
    console.error('   Usage: npx tsx --env-file=.env.local scripts/extract-figma-styles.ts')
    process.exit(1)
}

const FILE_KEY = process.argv[2] || 'Ehft8P02yDqutz3LhXtJqZ'
const OUTPUT_DIR = path.join(__dirname, 'output')

const FIGMA_API = 'https://api.figma.com/v1'

// ============================================
// Figma API helpers
// ============================================

async function figmaGet<T>(endpoint: string): Promise<T> {
    const url = `${FIGMA_API}${endpoint}`
    console.log(`  📡 GET ${url.replace(FIGMA_API, '')}`)
    const res = await fetch(url, {
        headers: { 'X-Figma-Token': FIGMA_TOKEN },
    })
    if (!res.ok) {
        const text = await res.text()
        throw new Error(`Figma API ${res.status}: ${text}`)
    }
    return res.json() as Promise<T>
}

// ============================================
// Type definitions for Figma API responses
// ============================================

interface FigmaColor {
    r: number
    g: number
    b: number
    a: number
}

interface FigmaTypeStyle {
    fontFamily: string
    fontPostScriptName?: string
    fontWeight: number
    fontSize: number
    letterSpacing: number
    lineHeightPx?: number
    lineHeightPercent?: number
    lineHeightPercentFontSize?: number
    lineHeightUnit?: string
    textCase?: string
    italic?: boolean
}

interface FigmaEffect {
    type: string
    visible: boolean
    radius?: number
    color?: FigmaColor
    offset?: { x: number; y: number }
    spread?: number
}

interface FigmaStyle {
    key: string
    name: string
    style_type: 'FILL' | 'TEXT' | 'EFFECT' | 'GRID'
    description?: string
    node_id?: string
}

interface FigmaStylesResponse {
    meta: {
        styles: FigmaStyle[]
    }
}

interface FigmaStyleNode {
    document: {
        id: string
        name: string
        type: string
        style?: FigmaTypeStyle
        fills?: Array<{ color?: FigmaColor; type: string; opacity?: number }>
        effects?: FigmaEffect[]
    }
}

interface FigmaNodesResponse {
    nodes: Record<string, FigmaStyleNode>
}

interface FigmaVariableValue {
    r?: number
    g?: number
    b?: number
    a?: number
}

interface FigmaVariable {
    id: string
    name: string
    resolvedType: string
    valuesByMode: Record<string, number | string | boolean | FigmaVariableValue>
}

interface FigmaVariableCollection {
    id: string
    name: string
    modes: Array<{ modeId: string; name: string }>
    variableIds: string[]
}

interface FigmaVariablesResponse {
    meta: {
        variables: Record<string, FigmaVariable>
        variableCollections: Record<string, FigmaVariableCollection>
    }
}

// ============================================
// Color conversion
// ============================================

function figmaColorToHex(c: FigmaColor): string {
    const r = Math.round(c.r * 255)
    const g = Math.round(c.g * 255)
    const b = Math.round(c.b * 255)
    if (c.a !== undefined && c.a < 1) {
        const a = Math.round(c.a * 255)
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`
    }
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function figmaEffectToCSS(effect: FigmaEffect): string | null {
    if (!effect.visible) return null
    if (effect.type === 'DROP_SHADOW' && effect.color && effect.offset) {
        const hex = figmaColorToHex(effect.color)
        return `${effect.offset.x}px ${effect.offset.y}px ${effect.radius ?? 0}px ${effect.spread ?? 0}px ${hex}`
    }
    if (effect.type === 'INNER_SHADOW' && effect.color && effect.offset) {
        const hex = figmaColorToHex(effect.color)
        return `inset ${effect.offset.x}px ${effect.offset.y}px ${effect.radius ?? 0}px ${effect.spread ?? 0}px ${hex}`
    }
    return null
}

// ============================================
// Extraction types
// ============================================

interface ExtractedTextStyle {
    name: string
    fontFamily: string
    fontWeight: number
    fontSize: number
    lineHeight: number | string
    letterSpacing: number
}

interface ExtractedColorStyle {
    name: string
    hex: string
}

interface ExtractedEffectStyle {
    name: string
    cssValue: string
}

interface ExtractedVariable {
    name: string
    collection: string
    type: string
    value: string | number | boolean
}

interface ExtractionResult {
    fileKey: string
    textStyles: ExtractedTextStyle[]
    colorStyles: ExtractedColorStyle[]
    effectStyles: ExtractedEffectStyle[]
    variables: ExtractedVariable[]
}

// ============================================
// Main extraction logic
// ============================================

async function extractStyles(): Promise<ExtractionResult> {
    console.log(`\n🎨 Extracting styles from Figma file: ${FILE_KEY}\n`)

    const result: ExtractionResult = {
        fileKey: FILE_KEY,
        textStyles: [],
        colorStyles: [],
        effectStyles: [],
        variables: [],
    }

    // ── Step 1: Get published styles ──────────────────────────────
    console.log('📋 Step 1: Fetching published styles...')
    try {
        const stylesRes = await figmaGet<FigmaStylesResponse>(`/files/${FILE_KEY}/styles`)
        const styles = stylesRes.meta.styles

        console.log(`   Found ${styles.length} styles total`)

        // Debug: show all style types found
        const typeSet = new Set(styles.map(s => s.style_type))
        console.log(`   Style types found: ${[...typeSet].join(', ')}`)

        const textStyleNodes = styles.filter(s => s.style_type === 'TEXT')
        const fillStyleNodes = styles.filter(s => s.style_type === 'FILL')
        const effectStyleNodes = styles.filter(s => s.style_type === 'EFFECT')

        console.log(`   📝 Text: ${textStyleNodes.length}, 🎨 Color: ${fillStyleNodes.length}, ✨ Effect: ${effectStyleNodes.length}`)

        // ── Step 2: Fetch text style details ──────────────────────
        if (textStyleNodes.length > 0) {
            console.log('\n📝 Step 2: Fetching text style details...')
            const nodeIds = textStyleNodes.map(s => s.node_id!).filter(Boolean)

            // Batch into chunks of 50
            for (let i = 0; i < nodeIds.length; i += 50) {
                const chunk = nodeIds.slice(i, i + 50)
                const nodesRes = await figmaGet<FigmaNodesResponse>(
                    `/files/${FILE_KEY}/nodes?ids=${chunk.join(',')}`
                )

                for (const [nodeId, node] of Object.entries(nodesRes.nodes)) {
                    const doc = node.document
                    const styleMeta = textStyleNodes.find(s => s.node_id === nodeId)

                    if (doc.style) {
                        const lineHeight =
                            doc.style.lineHeightUnit === 'FONT_SIZE_%'
                                ? (doc.style.lineHeightPercentFontSize ?? 100) / 100
                                : doc.style.lineHeightPx
                                    ? doc.style.lineHeightPx / doc.style.fontSize
                                    : 1.5

                        result.textStyles.push({
                            name: styleMeta?.name ?? doc.name,
                            fontFamily: doc.style.fontFamily,
                            fontWeight: doc.style.fontWeight,
                            fontSize: doc.style.fontSize,
                            lineHeight: Math.round(lineHeight * 100) / 100,
                            letterSpacing: doc.style.letterSpacing ?? 0,
                        })
                    }
                }
            }
            console.log(`   ✅ Extracted ${result.textStyles.length} text styles`)
        }

        // ── Step 3: Fetch color style details ─────────────────────
        if (fillStyleNodes.length > 0) {
            console.log('\n🎨 Step 3: Fetching color style details...')
            const nodeIds = fillStyleNodes.map(s => s.node_id!).filter(Boolean)

            for (let i = 0; i < nodeIds.length; i += 50) {
                const chunk = nodeIds.slice(i, i + 50)
                const nodesRes = await figmaGet<FigmaNodesResponse>(
                    `/files/${FILE_KEY}/nodes?ids=${chunk.join(',')}`
                )

                for (const [nodeId, node] of Object.entries(nodesRes.nodes)) {
                    const doc = node.document
                    const styleMeta = fillStyleNodes.find(s => s.node_id === nodeId)

                    if (doc.fills && doc.fills.length > 0) {
                        const fill = doc.fills[0]
                        if (fill.color) {
                            result.colorStyles.push({
                                name: styleMeta?.name ?? doc.name,
                                hex: figmaColorToHex({
                                    ...fill.color,
                                    a: fill.opacity ?? fill.color.a ?? 1,
                                }),
                            })
                        }
                    }
                }
            }
            console.log(`   ✅ Extracted ${result.colorStyles.length} color styles`)
        }

        // ── Step 4: Fetch effect style details ────────────────────
        if (effectStyleNodes.length > 0) {
            console.log('\n✨ Step 4: Fetching effect style details...')
            const nodeIds = effectStyleNodes.map(s => s.node_id!).filter(Boolean)

            for (let i = 0; i < nodeIds.length; i += 50) {
                const chunk = nodeIds.slice(i, i + 50)
                const nodesRes = await figmaGet<FigmaNodesResponse>(
                    `/files/${FILE_KEY}/nodes?ids=${chunk.join(',')}`
                )

                for (const [nodeId, node] of Object.entries(nodesRes.nodes)) {
                    const doc = node.document
                    const styleMeta = effectStyleNodes.find(s => s.node_id === nodeId)

                    if (doc.effects && doc.effects.length > 0) {
                        const cssParts = doc.effects
                            .map(figmaEffectToCSS)
                            .filter(Boolean)

                        if (cssParts.length > 0) {
                            result.effectStyles.push({
                                name: styleMeta?.name ?? doc.name,
                                cssValue: cssParts.join(', '),
                            })
                        }
                    }
                }
            }
            console.log(`   ✅ Extracted ${result.effectStyles.length} effect styles`)
        }
    } catch (err) {
        console.warn(`   ⚠️  Could not fetch published styles: ${err}`)
        console.log('   Continuing with local variables...')
    }

    // ── Step 5: Fetch local variables ─────────────────────────────
    console.log('\n📦 Step 5: Fetching local variables...')
    try {
        const varsRes = await figmaGet<FigmaVariablesResponse>(
            `/files/${FILE_KEY}/variables/local`
        )

        const { variables, variableCollections } = varsRes.meta

        const collectionMap = new Map<string, string>()
        for (const col of Object.values(variableCollections)) {
            for (const varId of col.variableIds) {
                collectionMap.set(varId, col.name)
            }
        }

        for (const variable of Object.values(variables)) {
            const modes = Object.values(variable.valuesByMode)
            const firstValue = modes[0]
            let value: string | number | boolean

            if (typeof firstValue === 'object' && firstValue !== null && 'r' in firstValue) {
                value = figmaColorToHex(firstValue as FigmaColor)
            } else {
                value = firstValue as string | number | boolean
            }

            result.variables.push({
                name: variable.name,
                collection: collectionMap.get(variable.id) ?? 'Unknown',
                type: variable.resolvedType,
                value,
            })
        }

        console.log(`   ✅ Extracted ${result.variables.length} local variables`)
    } catch (err) {
        console.warn(`   ⚠️  Could not fetch variables: ${err}`)
        console.log('   This may be due to API permissions. Variables require a paid Figma plan.')
    }

    return result
}

// ============================================
// Mapping: Figma → Scytle Concept
// ============================================

interface ScytleConcept {
    id: string
    name: string
    colors: Record<string, string>
    typography: Record<string, string | number>
    ui: Record<string, string | number>
    cssTokenMap: Record<string, string>
    createdAt: string
}

function mapToConcept(extraction: ExtractionResult): ScytleConcept {
    const concept: ScytleConcept = {
        id: `figma-${FILE_KEY.slice(0, 8)}`,
        name: 'Figma Import',
        colors: {},
        typography: {},
        ui: {},
        cssTokenMap: {},
        createdAt: new Date().toISOString(),
    }

    // ── Map Color Styles ──────────────────────────────────────────
    for (const color of extraction.colorStyles) {
        const nameLower = color.name.toLowerCase()
        concept.colors[color.name] = color.hex

        // Auto-map known names
        if (nameLower === 'black' || nameLower.includes('text/primary')) {
            concept.cssTokenMap['--sg-text-primary'] = color.hex
        }
        if (nameLower === 'white' || nameLower.includes('background/primary')) {
            concept.cssTokenMap['--sg-bg-primary'] = color.hex
        }
        if (nameLower === 'grey' || nameLower === 'gray' || nameLower.includes('text/secondary') || nameLower.includes('muted')) {
            concept.cssTokenMap['--sg-text-muted'] = color.hex
        }
    }

    // ── Map Variables (more specific) ─────────────────────────────
    for (const v of extraction.variables) {
        const nameLower = v.name.toLowerCase()

        // Color Scheme mappings
        if (nameLower.includes('color scheme') || nameLower.includes('color/')) {
            if (nameLower.includes('background')) concept.cssTokenMap['--sg-bg-primary'] = String(v.value)
            if (nameLower.includes('foreground')) concept.cssTokenMap['--sg-bg-secondary'] = String(v.value)
            if (nameLower.includes('/text')) concept.cssTokenMap['--sg-text-primary'] = String(v.value)
            if (nameLower.includes('/border')) concept.cssTokenMap['--sg-border'] = String(v.value)
        }

        // Text Size mappings
        if (nameLower.includes('text sizes/')) {
            const val = typeof v.value === 'number' ? v.value : parseInt(String(v.value), 10)
            if (nameLower.includes('heading 1')) concept.cssTokenMap['--sg-h1-size'] = `${val / 16}rem`
            if (nameLower.includes('heading 2')) concept.cssTokenMap['--sg-h2-size'] = `${val / 16}rem`
            if (nameLower.includes('heading 3')) concept.cssTokenMap['--sg-h3-size'] = `${val / 16}rem`
            if (nameLower.includes('heading 4')) concept.cssTokenMap['--sg-h4-size'] = `${val / 16}rem`
            if (nameLower.includes('heading 5')) concept.cssTokenMap['--sg-h5-size'] = `${val / 16}rem`
            if (nameLower.includes('heading 6')) concept.cssTokenMap['--sg-h6-size'] = `${val / 16}rem`
            if (nameLower.includes('text medium')) concept.cssTokenMap['--sg-body-large-size'] = `${val / 16}rem`
            if (nameLower.includes('text regular')) concept.cssTokenMap['--sg-body-size'] = `${val / 16}rem`
            if (nameLower.includes('text small')) concept.cssTokenMap['--sg-caption-size'] = `${val / 16}rem`
        }

        // Radius
        if (nameLower.includes('radius/')) {
            if (nameLower.includes('large')) concept.cssTokenMap['--sg-card-radius'] = `${v.value}px`
            if (nameLower.includes('medium')) concept.cssTokenMap['--sg-button-radius'] = `${v.value}px`
            if (nameLower.includes('small')) concept.cssTokenMap['--sg-radius'] = `${v.value}px`
        }

        // Container / max-width
        if (nameLower.includes('container/container-large')) concept.ui['maxWidth'] = Number(v.value)
        if (nameLower.includes('max width/max-width-large')) concept.ui['contentMaxWidthLarge'] = Number(v.value)
        if (nameLower.includes('max width/max-width-medium')) concept.ui['contentMaxWidthMedium'] = Number(v.value)

        // Section/page padding
        if (nameLower.includes('section padding/')) concept.ui['sectionPadding'] = Number(v.value)
        if (nameLower.includes('page padding/')) concept.ui['pagePadding'] = Number(v.value)
    }

    // ── Map Text Styles ───────────────────────────────────────────
    // Find heading and body fonts
    const headingStyle = extraction.textStyles.find(s =>
        s.name.toLowerCase().includes('heading')
    )
    const bodyStyle = extraction.textStyles.find(s =>
        s.name.toLowerCase().includes('text/') || s.name.toLowerCase().includes('body')
    )

    if (headingStyle) {
        concept.typography['headingFont'] = `'${headingStyle.fontFamily}', sans-serif`
        concept.typography['headingWeight'] = headingStyle.fontWeight
        concept.cssTokenMap['--sg-font-heading'] = `'${headingStyle.fontFamily}', sans-serif`
        concept.cssTokenMap['--sg-heading-weight'] = String(headingStyle.fontWeight)

        if (headingStyle.letterSpacing !== 0) {
            const emVal = headingStyle.letterSpacing / headingStyle.fontSize
            concept.cssTokenMap['--sg-heading-letter-spacing'] = `${emVal.toFixed(3)}em`
        }
    }

    // For body, prefer the "Normal" weight variant
    const bodyNormal = extraction.textStyles.find(s => {
        const n = s.name.toLowerCase()
        return (n.includes('text/') || n.includes('body')) && n.includes('normal')
    }) ?? bodyStyle

    if (bodyNormal) {
        concept.typography['bodyFont'] = `'${bodyNormal.fontFamily}', sans-serif`
        concept.typography['bodyWeight'] = bodyNormal.fontWeight
        concept.cssTokenMap['--sg-font-body'] = `'${bodyNormal.fontFamily}', sans-serif`
        concept.cssTokenMap['--sg-body-weight'] = String(bodyNormal.fontWeight)
    }

    // ── Map Effect Styles → shadows ───────────────────────────────
    for (const effect of extraction.effectStyles) {
        const nameLower = effect.name.toLowerCase()
        if (nameLower.includes('xxsmall')) concept.cssTokenMap['--shadow-xxs'] = effect.cssValue
        else if (nameLower.includes('xxlarge')) concept.cssTokenMap['--shadow-2xl'] = effect.cssValue
        else if (nameLower.includes('xsmall')) concept.cssTokenMap['--shadow-xs'] = effect.cssValue
        else if (nameLower.includes('xlarge')) concept.cssTokenMap['--shadow-xl'] = effect.cssValue
        else if (nameLower.includes('small')) concept.cssTokenMap['--shadow-sm'] = effect.cssValue
        else if (nameLower.includes('medium')) concept.cssTokenMap['--shadow-md'] = effect.cssValue
        else if (nameLower.includes('large')) concept.cssTokenMap['--shadow-lg'] = effect.cssValue
    }

    // ── Map full text style entries ───────────────────────────────
    // Also extract heading sizes from text styles
    for (const ts of extraction.textStyles) {
        const n = ts.name.toLowerCase()

        // Map heading sizes
        if (n === 'heading/h1') concept.cssTokenMap['--sg-h1-size'] = `${ts.fontSize / 16}rem`
        if (n === 'heading/h2') concept.cssTokenMap['--sg-h2-size'] = `${ts.fontSize / 16}rem`
        if (n === 'heading/h3') concept.cssTokenMap['--sg-h3-size'] = `${ts.fontSize / 16}rem`
        if (n === 'heading/h4') concept.cssTokenMap['--sg-h4-size'] = `${ts.fontSize / 16}rem`
        if (n === 'heading/h5') concept.cssTokenMap['--sg-h5-size'] = `${ts.fontSize / 16}rem`
        if (n === 'heading/h6') concept.cssTokenMap['--sg-h6-size'] = `${ts.fontSize / 16}rem`

        // Map body sizes from Normal variants
        if (n === 'text/large/normal') concept.cssTokenMap['--sg-body-large-size'] = `${ts.fontSize / 16}rem`
        if (n === 'text/medium/normal') concept.cssTokenMap['--sg-body-medium-size'] = `${ts.fontSize / 16}rem`
        if (n === 'text/regular/normal') concept.cssTokenMap['--sg-body-size'] = `${ts.fontSize / 16}rem`
        if (n === 'text/small/normal') concept.cssTokenMap['--sg-caption-size'] = `${ts.fontSize / 16}rem`
        if (n === 'text/tiny/normal') concept.cssTokenMap['--sg-tiny-size'] = `${ts.fontSize / 16}rem`

        // Map heading line heights
        if (n === 'heading/h1' || n === 'heading/h2' || n === 'heading/h3') {
            concept.cssTokenMap['--sg-heading-line-height'] = String(ts.lineHeight)
        }

        // Store every text style as a composite reference
        const key = `--figma-font-${ts.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')}`
        concept.cssTokenMap[key] = [
            `font-family: '${ts.fontFamily}', sans-serif`,
            `font-weight: ${ts.fontWeight}`,
            `font-size: ${ts.fontSize}px`,
            `line-height: ${ts.lineHeight}`,
            ts.letterSpacing !== 0 ? `letter-spacing: ${ts.letterSpacing}px` : '',
        ].filter(Boolean).join('; ')
    }

    return concept
}

// ============================================
// Output
// ============================================

async function main() {
    const extraction = await extractStyles()
    const concept = mapToConcept(extraction)

    // Ensure output dir exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    }

    // Write raw extraction
    const rawPath = path.join(OUTPUT_DIR, 'figma-tokens.json')
    fs.writeFileSync(rawPath, JSON.stringify(extraction, null, 2))
    console.log(`\n📄 Raw tokens → ${rawPath}`)

    // Write mapped concept
    const conceptPath = path.join(OUTPUT_DIR, 'scytle-concept.json')
    fs.writeFileSync(conceptPath, JSON.stringify(concept, null, 2))
    console.log(`📄 Scytle concept → ${conceptPath}`)

    // Summary
    console.log('\n════════════════════════════════════════════')
    console.log('  📊 EXTRACTION SUMMARY')
    console.log('════════════════════════════════════════════')
    console.log(`  Text Styles:   ${extraction.textStyles.length}`)
    console.log(`  Color Styles:  ${extraction.colorStyles.length}`)
    console.log(`  Effect Styles: ${extraction.effectStyles.length}`)
    console.log(`  Variables:     ${extraction.variables.length}`)
    console.log('────────────────────────────────────────────')

    if (extraction.textStyles.length > 0) {
        console.log('\n  📝 TEXT STYLES:')
        for (const ts of extraction.textStyles) {
            console.log(`    ${ts.name}: ${ts.fontFamily} ${ts.fontWeight} ${ts.fontSize}px / ${ts.lineHeight}`)
        }
    }

    if (extraction.colorStyles.length > 0) {
        console.log('\n  🎨 COLOR STYLES:')
        for (const cs of extraction.colorStyles) {
            console.log(`    ${cs.name}: ${cs.hex}`)
        }
    }

    if (extraction.effectStyles.length > 0) {
        console.log('\n  ✨ EFFECT STYLES:')
        for (const es of extraction.effectStyles) {
            console.log(`    ${es.name}: ${es.cssValue}`)
        }
    }

    console.log('\n  🔗 MAPPED CSS TOKENS:')
    for (const [key, value] of Object.entries(concept.cssTokenMap).sort()) {
        if (!key.startsWith('--figma-font-')) {
            console.log(`    ${key}: ${value}`)
        }
    }

    console.log('\n✅ Done! Import the concept JSON into your style guide store.\n')
}

main().catch((err) => {
    console.error('❌ Fatal error:', err)
    process.exit(1)
})
