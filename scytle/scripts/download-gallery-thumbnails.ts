/**
 * Download Gallery Thumbnails from Figma (Desktop Only)
 *
 * Fetches PNG screenshots of the desktop breakpoint for all 27 gallery designs
 * from the Relume Figma kit and saves them to public/thumbnails/gallery/.
 *
 * Usage:
 *   npx tsx --env-file=.env.local scripts/download-gallery-thumbnails.ts
 */

import fs from 'fs'
import path from 'path'

const FIGMA_TOKEN = process.env.FIGMA_TOKEN!
if (!process.env.FIGMA_TOKEN) {
    console.error('❌ Missing FIGMA_TOKEN environment variable')
    console.error('   Usage: npx tsx --env-file=.env.local scripts/download-gallery-thumbnails.ts')
    process.exit(1)
}

const FILE_KEY = 'Ehft8P02yDqutz3LhXtJqZ'
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'thumbnails', 'gallery')

/**
 * Desktop-only node IDs — each is the "Breakpoint = Desktop" child frame
 * (1440px wide) inside the parent gallery component.
 */
const GALLERY_DESKTOP_NODES: Record<number, string> = {
    1: '4174:40812',
    2: '4174:40823',
    3: '4174:40838',
    4: '4174:40855',
    5: '4174:40876',
    6: '4174:40904',
    7: '4174:40937',
    8: '4174:40956',
    9: '4174:40979',
    10: '4174:41005',
    11: '4174:41036',
    12: '4174:41051',
    13: '4174:41074',
    14: '4174:41099',
    15: '4174:41139',
    16: '4174:41172',
    17: '4174:41215',
    18: '4174:41260',
    19: '4174:41309',
    20: '4174:41364',
    21: '4174:41401',
    22: '4174:41442',
    23: '4174:41489',
    24: '4174:41542',
    25: '6318:1080',
    26: '6318:1143',
    27: '6318:1206',
}

async function main() {
    // Ensure output directory exists
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })

    const nodeIds = Object.values(GALLERY_DESKTOP_NODES).join(',')

    console.log('📦 Fetching desktop-only image URLs from Figma API...')

    // Call Figma Images API — exports all desktop breakpoint nodes as PNGs in one request
    const apiUrl = `https://api.figma.com/v1/images/${FILE_KEY}?ids=${nodeIds}&format=png&scale=2`
    const response = await fetch(apiUrl, {
        headers: { 'X-Figma-Token': FIGMA_TOKEN },
    })

    if (!response.ok) {
        const text = await response.text()
        console.error(`❌ Figma API error (${response.status}): ${text}`)
        process.exit(1)
    }

    interface FigmaImagesResponse {
        images: Record<string, string | null>
        err: string | null
    }

    const data: FigmaImagesResponse = await response.json()

    if (data.err) {
        console.error(`❌ Figma API error: ${data.err}`)
        process.exit(1)
    }

    console.log(`✅ Got ${Object.keys(data.images).length} image URLs`)

    // Download each image
    let downloaded = 0
    let failed = 0

    for (const [galleryNum, nodeId] of Object.entries(GALLERY_DESKTOP_NODES)) {
        const imageUrl = data.images[nodeId]
        if (!imageUrl) {
            console.warn(`⚠️ No image URL for Gallery ${galleryNum} (node ${nodeId})`)
            failed++
            continue
        }

        try {
            const imgResponse = await fetch(imageUrl)
            if (!imgResponse.ok) {
                console.warn(`⚠️ Failed to download Gallery ${galleryNum}: ${imgResponse.status}`)
                failed++
                continue
            }

            const buffer = Buffer.from(await imgResponse.arrayBuffer())
            const filePath = path.join(OUTPUT_DIR, `gallery-${galleryNum}.png`)
            fs.writeFileSync(filePath, buffer)
            downloaded++
            console.log(`  ✅ Gallery ${galleryNum} → ${filePath}`)
        } catch (err) {
            console.warn(`⚠️ Error downloading Gallery ${galleryNum}:`, err)
            failed++
        }
    }

    console.log(`\n📦 Done! Downloaded: ${downloaded}, Failed: ${failed}`)
    console.log(`   Images saved to: ${OUTPUT_DIR}`)
}

main().catch((err) => {
    console.error('❌ Script failed:', err)
    process.exit(1)
})
