/**
 * Appwrite Storage Setup Script
 * Creates the required storage buckets for file uploads.
 *
 * Run with: npx tsx --env-file=.env.local scripts/setup-storage.ts
 */

import { Client, Storage, Permission, Role } from 'node-appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
const apiKey = process.env.APPWRITE_API_KEY || ''

if (!projectId || !apiKey) {
    console.error('❌ Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID or APPWRITE_API_KEY env vars')
    process.exit(1)
}

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey)

const storage = new Storage(client)

const BUCKETS = [
    {
        id: 'project_assets',
        name: 'Project Assets',
        maxFileSize: 50 * 1024 * 1024, // 50 MB
        allowedExtensions: [
            // Images
            'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'avif',
            // Videos
            'mp4', 'webm', 'mov', 'avi', 'mkv',
        ],
        permissions: [
            Permission.read(Role.any()),          // Public read for rendering
            Permission.create(Role.users()),      // Authenticated users can upload
            Permission.update(Role.users()),
            Permission.delete(Role.users()),
        ],
    },
    {
        id: 'exports',
        name: 'Exports',
        maxFileSize: 100 * 1024 * 1024, // 100 MB
        allowedExtensions: ['zip', 'html', 'css', 'js', 'json'],
        permissions: [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.delete(Role.users()),
        ],
    },
]

async function main() {
    console.log('🚀 Setting up Appwrite storage buckets...\n')

    for (const bucket of BUCKETS) {
        try {
            await storage.createBucket(
                bucket.id,
                bucket.name,
                bucket.permissions,
                false,                    // fileSecurity — false means bucket-level permissions
                true,                     // enabled
                bucket.maxFileSize,
                bucket.allowedExtensions,
            )
            console.log(`✅ Bucket created: ${bucket.name} (${bucket.id})`)
        } catch (error: unknown) {
            const err = error as { code?: number; message?: string }
            if (err.code === 409) {
                console.log(`📦 Bucket already exists: ${bucket.name} (${bucket.id})`)
            } else {
                console.error(`❌ Error creating ${bucket.name}:`, err.message)
            }
        }
    }

    console.log('\n✅ Storage setup complete!')
}

main().catch(console.error)
