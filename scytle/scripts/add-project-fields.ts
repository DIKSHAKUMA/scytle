/**
 * Migration Script: Add productType and aiModel fields to projects collection
 * Run with: npx tsx --env-file=.env.local scripts/add-project-fields.ts
 */

import { config } from 'dotenv'
import { Client, Databases } from 'node-appwrite'

config({ path: '.env.local' })

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const apiKey = process.env.APPWRITE_API_KEY || ''

const DATABASE_ID = 'scytle_db'
const COLLECTION_ID = 'projects'

async function addProjectFields() {
    if (!apiKey) {
        console.error('❌ APPWRITE_API_KEY is required in .env.local')
        process.exit(1)
    }

    const client = new Client()
        .setEndpoint(endpoint)
        .setProject(projectId)
        .setKey(apiKey)

    const databases = new Databases(client)

    // Add productType enum attribute
    try {
        console.log('🔄 Adding productType attribute...')
        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'productType',
            ['web', 'app'],
            false,   // not required (existing docs won't have it)
            'web'    // default
        )
        console.log('✅ productType attribute added')
    } catch (error: unknown) {
        const err = error as { code?: number; message?: string }
        if (err.code === 409) {
            console.log('📦 productType attribute already exists')
        } else {
            console.error('❌ Failed to add productType:', err.message)
        }
    }

    // Add aiModel enum attribute
    try {
        console.log('🔄 Adding aiModel attribute...')
        await databases.createEnumAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'aiModel',
            ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-2.5-pro'],
            false,               // not required
            'gemini-2.5-flash'   // default
        )
        console.log('✅ aiModel attribute added')
    } catch (error: unknown) {
        const err = error as { code?: number; message?: string }
        if (err.code === 409) {
            console.log('📦 aiModel attribute already exists')
        } else {
            console.error('❌ Failed to add aiModel:', err.message)
        }
    }

    console.log('\n⏳ Waiting for attributes to be available...')
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('✅ Migration complete!')
}

addProjectFields().catch(console.error)
