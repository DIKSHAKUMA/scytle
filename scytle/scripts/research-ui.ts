/**
 * UI Research Script
 * 
 * Captures screenshots, HTML structure, and design details from any website.
 * Run: npx tsx scripts/research-ui.ts <url> [output-name]
 * 
 * Examples:
 *   npx tsx scripts/research-ui.ts https://relume.io relume
 *   npx tsx scripts/research-ui.ts https://framer.com framer
 *   npx tsx scripts/research-ui.ts https://webflow.com webflow
 */

import { chromium, type Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const url = process.argv[2]
const outputName = process.argv[3] || 'research'

if (!url) {
    console.log('Usage: npx tsx scripts/research-ui.ts <url> [output-name]')
    console.log('Example: npx tsx scripts/research-ui.ts https://relume.io relume')
    process.exit(1)
}

const OUTPUT_DIR = path.join(process.cwd(), 'research-output', outputName)

async function extractUIDetails(page: Page) {
    return await page.evaluate(() => {
        // Extract color palette from computed styles
        const colors = new Set<string>()
        const fonts = new Set<string>()
        const elements = document.querySelectorAll('*')
        
        elements.forEach(el => {
            const style = getComputedStyle(el)
            // Colors
            if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                colors.add(style.backgroundColor)
            }
            if (style.color) {
                colors.add(style.color)
            }
            // Fonts
            if (style.fontFamily) {
                fonts.add(style.fontFamily.split(',')[0].trim().replace(/['"]/g, ''))
            }
        })

        // Extract heading structure
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
            tag: h.tagName,
            text: h.textContent?.slice(0, 100)?.trim(),
            fontSize: getComputedStyle(h).fontSize,
            fontWeight: getComputedStyle(h).fontWeight,
        }))

        // Extract buttons/CTAs
        const buttons = Array.from(document.querySelectorAll('button, a[class*="btn"], a[class*="button"], [role="button"]')).slice(0, 20).map(btn => ({
            text: btn.textContent?.trim().slice(0, 50),
            classes: btn.className,
        }))

        // Extract sections
        const sections = Array.from(document.querySelectorAll('section, [class*="section"], main > div')).slice(0, 15).map(section => ({
            classes: section.className,
            childCount: section.children.length,
            hasHeading: !!section.querySelector('h1, h2, h3'),
        }))

        return {
            title: document.title,
            colors: Array.from(colors).slice(0, 20),
            fonts: Array.from(fonts).slice(0, 10),
            headings: headings.slice(0, 15),
            buttons: buttons,
            sections: sections,
            meta: {
                description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
                viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
            }
        }
    })
}

async function main() {
    console.log(`\n🔍 Researching: ${url}`)
    console.log(`📁 Output: ${OUTPUT_DIR}\n`)

    // Create output directory
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    // Launch browser with your default profile (logged-in sessions work!)
    const browser = await chromium.launch({ 
        headless: false, // Show browser so you can interact if needed
        slowMo: 500, // Slow down for visibility
    })
    
    const context = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2, // Retina quality screenshots
    })

    const page = await context.newPage()

    try {
        // Navigate to URL
        console.log('⏳ Loading page...')
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
        await page.waitForTimeout(2000) // Extra wait for animations

        // 1. Full page screenshot
        console.log('📸 Taking full page screenshot...')
        await page.screenshot({ 
            path: path.join(OUTPUT_DIR, 'full-page.png'),
            fullPage: true,
        })

        // 2. Viewport screenshot (above fold)
        await page.screenshot({ 
            path: path.join(OUTPUT_DIR, 'above-fold.png'),
        })

        // 3. Extract UI details
        console.log('🎨 Extracting design details...')
        const uiDetails = await extractUIDetails(page)
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'ui-analysis.json'),
            JSON.stringify(uiDetails, null, 2)
        )

        // 4. Save HTML structure
        console.log('📄 Saving HTML structure...')
        const html = await page.content()
        fs.writeFileSync(path.join(OUTPUT_DIR, 'page.html'), html)

        // 5. Create summary report
        const summary = `# UI Research: ${uiDetails.title}

**URL:** ${url}
**Captured:** ${new Date().toISOString()}

## Colors Found
${uiDetails.colors.slice(0, 10).map(c => `- \`${c}\``).join('\n')}

## Fonts
${uiDetails.fonts.map(f => `- ${f}`).join('\n')}

## Typography (Headings)
${uiDetails.headings.slice(0, 8).map(h => `- **${h.tag}**: "${h.text}" (${h.fontSize}, ${h.fontWeight})`).join('\n')}

## Buttons/CTAs
${uiDetails.buttons.slice(0, 8).map(b => `- "${b.text}"`).join('\n')}

## Section Structure
${uiDetails.sections.slice(0, 8).map((s, i) => `${i + 1}. ${s.childCount} children, ${s.hasHeading ? 'has heading' : 'no heading'}`).join('\n')}

## Files Generated
- \`full-page.png\` - Full page screenshot
- \`above-fold.png\` - Viewport screenshot  
- \`ui-analysis.json\` - Extracted design tokens
- \`page.html\` - Raw HTML
`
        fs.writeFileSync(path.join(OUTPUT_DIR, 'SUMMARY.md'), summary)

        console.log('\n✅ Research complete!')
        console.log(`\nFiles saved to: ${OUTPUT_DIR}`)
        console.log('- full-page.png')
        console.log('- above-fold.png')
        console.log('- ui-analysis.json')
        console.log('- page.html')
        console.log('- SUMMARY.md')
        console.log('\n💡 Share SUMMARY.md or ui-analysis.json with the AI for analysis.\n')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await browser.close()
    }
}

main()
