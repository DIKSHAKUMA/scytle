/**
 * Figma Interaction Recorder
 * 
 * Records video of your Figma interactions (pen tool, etc.)
 * 
 * Run: npx tsx scripts/record-figma.ts
 */

import { chromium } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'

const FIGMA_URL = process.argv[2] || 'https://www.figma.com/design/saJiA7D9CKEjgXkkBLJeax/demo-file?node-id=97-3&t=Oj2DyCDvtryZcAvG-0'
const OUTPUT_DIR = path.join(process.cwd(), 'figma-recordings', Date.now().toString())

async function main() {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║            🎬 FIGMA INTERACTION RECORDER                  ║
╠═══════════════════════════════════════════════════════════╣
║  1. Browser will open → Log into Figma if needed          ║
║  2. Use the PEN TOOL or any feature you want to record    ║
║  3. When done, come back here and press ENTER to stop     ║
║  4. Video + screenshots will be saved automatically       ║
╚═══════════════════════════════════════════════════════════╝
`)

    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log(`📁 Output folder: ${OUTPUT_DIR}\n`)

    // Launch browser with persistent context (keeps your login!)
    const userDataDir = path.join(process.cwd(), '.playwright-profile')

    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
        // Enable video recording
        recordVideo: {
            dir: OUTPUT_DIR,
            size: { width: 1920, height: 1080 },
        },
    })

    const page = await context.newPage()

    // Track mouse movements and clicks for analysis
    const interactions: Array<{ time: number; type: string; x?: number; y?: number; key?: string }> = []
    const startTime = Date.now()

    page.on('console', msg => {
        if (msg.type() === 'log') {
            console.log('  [Figma]', msg.text().slice(0, 100))
        }
    })

    try {
        console.log('⏳ Opening Figma...')
        await page.goto(FIGMA_URL, { waitUntil: 'domcontentloaded', timeout: 60000 })

        console.log('✅ Figma loaded!')
        console.log('\n🖊️  Now use the PEN TOOL or any feature you want to record.')
        console.log('   I\'m recording everything...\n')

        // Take periodic screenshots
        let screenshotCount = 0
        const screenshotInterval = setInterval(async () => {
            try {
                screenshotCount++
                await page.screenshot({
                    path: path.join(OUTPUT_DIR, `screenshot-${screenshotCount.toString().padStart(3, '0')}.png`),
                })
            } catch { /* ignore errors during capture */ }
        }, 3000) // Every 3 seconds

        // Track keyboard shortcuts (important for tools)
        await page.evaluate(() => {
            document.addEventListener('keydown', (e) => {
                console.log(`KEY: ${e.key} (${e.ctrlKey ? 'Ctrl+' : ''}${e.shiftKey ? 'Shift+' : ''}${e.key})`)
            })
        })

        // Wait for user to finish
        console.log('═══════════════════════════════════════════════════════════')
        console.log('Press ENTER here when you\'re done recording...')
        console.log('═══════════════════════════════════════════════════════════\n')

        await new Promise<void>(resolve => {
            process.stdin.once('data', () => resolve())
        })

        clearInterval(screenshotInterval)

        // Final screenshot
        console.log('\n📸 Taking final screenshot...')
        await page.screenshot({
            path: path.join(OUTPUT_DIR, 'final-state.png'),
            fullPage: false,
        })

        // Save interaction log
        fs.writeFileSync(
            path.join(OUTPUT_DIR, 'interactions.json'),
            JSON.stringify(interactions, null, 2)
        )

        // Create summary
        const summary = `# Figma Recording Session

**URL:** ${FIGMA_URL}
**Recorded:** ${new Date().toISOString()}
**Duration:** ${Math.round((Date.now() - startTime) / 1000)} seconds
**Screenshots:** ${screenshotCount + 1}

## Files
- \`*.webm\` - Screen recording video
- \`screenshot-*.png\` - Periodic screenshots (every 3s)
- \`final-state.png\` - Final state screenshot
- \`interactions.json\` - Logged interactions

## Figma Pen Tool Shortcuts
- **P** - Pen tool
- **Shift** - Constrain angles (45°)
- **Alt/Option** - Adjust handles independently  
- **Enter** - Complete path
- **Escape** - Cancel/deselect
- **Ctrl/Cmd + Click** - Add point to path
- **Double-click** - End open path

## How to Share with AI
1. Open the video file to review your recording
2. Take key screenshots of specific moments
3. Describe what you did and share screenshots
`
        fs.writeFileSync(path.join(OUTPUT_DIR, 'SUMMARY.md'), summary)

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        console.log('\n⏳ Saving video (this may take a moment)...')
        await context.close()

        console.log(`
✅ Recording saved!

📁 Files at: ${OUTPUT_DIR}
   - Video: *.webm (screen recording)
   - Screenshots: screenshot-*.png
   - Summary: SUMMARY.md

🎬 To play the video:
   open "${OUTPUT_DIR}"

💡 Share screenshots or describe what you recorded and I can help analyze the UX patterns!
`)
    }
}

main()
