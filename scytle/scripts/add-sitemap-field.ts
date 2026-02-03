/**
 * Migration Script: Add sitemapData field to projects collection
 * Run with: npx ts-node scripts/add-sitemap-field.ts
 */

import { config } from 'dotenv'
import { Client, Databases } from 'node-appwrite'

// Load environment variables from .env.local
config({ path: '.env.local' })

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '697f1aae0010e3a71ed7'
const apiKey = process.env.APPWRITE_API_KEY || ''

const DATABASE_ID = 'scytle_db'
const COLLECTION_ID = 'projects'

async function addSitemapField() {
    if (!apiKey) {
        console.error('❌ APPWRITE_API_KEY is required')
        process.exit(1)
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey)

    const databases = new Databases(client)

    try {
        console.log('🔄 Adding sitemapData attribute to projects collection...')

        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'sitemapData',
            100000,  // Large size for JSON data
            false    // Not required
        )

        console.log('✅ sitemapData attribute added successfully!')
        console.log('⏳ Waiting for attribute to be available (this may take a moment)...')

        // Wait for attribute to be created
        await new Promise(resolve => setTimeout(resolve, 3000))

        console.log('✅ Migration complete!')
    } catch (error: unknown) {
        const appwriteError = error as { code?: number; message?: string }
        if (appwriteError.code === 409) {
            console.log('📦 sitemapData attribute already exists')
        } else {
            console.error('❌ Failed to add sitemapData attribute:', appwriteError.message || error)
        }
    }
}

addSitemapField()
