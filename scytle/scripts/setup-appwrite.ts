/**
 * Appwrite Database Setup Script
 * Run with: npx ts-node scripts/setup-appwrite.ts
 */

import { Client, Databases, ID, Permission, Role } from 'node-appwrite'

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '697f1aae0010e3a71ed7'
const apiKey = process.env.APPWRITE_API_KEY || 'standard_00318144073e3742457bb7a2d41684957d9df8588f14a03b2fcf18a1ea7ff5307a7c3a092775e1b8bf09d1602e649429e0153e2406d6dc5e0f61f6d514b86c11afda74ff9ba11ef1f1246de9b178586b0d7bdbf4f278b6bbf460d433dd7c9a4f244eff585b0f11668f341f7cbe96f68537d25a61b9c0bbca1772d0bb783a668e'

const DATABASE_ID = 'scytle_db'

const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey)

const databases = new Databases(client)

async function createDatabase() {
    try {
        const db = await databases.create(DATABASE_ID, 'Scytle Database')
        console.log('✅ Database created:', db.$id)
        return db
    } catch (error: any) {
        if (error.code === 409) {
            console.log('📦 Database already exists')
            return { $id: DATABASE_ID }
        }
        throw error
    }
}

async function createCollections() {
    const collections = [
        {
            id: 'users',
            name: 'Users',
            attributes: [
                { key: 'userId', type: 'string', size: 36, required: true },
                { key: 'email', type: 'email', required: true },
                { key: 'name', type: 'string', size: 255, required: true },
                { key: 'plan', type: 'enum', elements: ['free', 'maker', 'pro', 'agency'], default: 'free' },
                { key: 'createdAt', type: 'datetime', required: true },
            ],
            indexes: [
                { key: 'userId_idx', type: 'unique', attributes: ['userId'] },
                { key: 'email_idx', type: 'unique', attributes: ['email'] },
            ],
        },
        {
            id: 'projects',
            name: 'Projects',
            attributes: [
                { key: 'userId', type: 'string', size: 36, required: true },
                { key: 'name', type: 'string', size: 255, required: true },
                { key: 'description', type: 'string', size: 2000, required: false },
                { key: 'status', type: 'enum', elements: ['draft', 'in-progress', 'completed'], default: 'draft' },
                { key: 'createdAt', type: 'datetime', required: true },
                { key: 'updatedAt', type: 'datetime', required: true },
            ],
            indexes: [
                { key: 'userId_idx', type: 'key', attributes: ['userId'] },
                { key: 'status_idx', type: 'key', attributes: ['status'] },
                { key: 'createdAt_idx', type: 'key', attributes: ['createdAt'] },
            ],
        },
        {
            id: 'pages',
            name: 'Pages',
            attributes: [
                { key: 'projectId', type: 'string', size: 36, required: true },
                { key: 'name', type: 'string', size: 255, required: true },
                { key: 'slug', type: 'string', size: 255, required: true },
                { key: 'parentId', type: 'string', size: 36, required: false },
                { key: 'order', type: 'integer', min: 0, max: 999, default: 0 },
                { key: 'sections', type: 'string', size: 10000, required: false }, // JSON array as string
            ],
            indexes: [
                { key: 'projectId_idx', type: 'key', attributes: ['projectId'] },
                { key: 'slug_idx', type: 'key', attributes: ['slug'] },
            ],
        },
        {
            id: 'sections',
            name: 'Sections',
            attributes: [
                { key: 'pageId', type: 'string', size: 36, required: true },
                { key: 'type', type: 'string', size: 100, required: true },
                { key: 'content', type: 'string', size: 50000, required: false }, // JSON as string
                { key: 'order', type: 'integer', min: 0, max: 999, default: 0 },
                { key: 'config', type: 'string', size: 10000, required: false }, // JSON as string
            ],
            indexes: [
                { key: 'pageId_idx', type: 'key', attributes: ['pageId'] },
                { key: 'type_idx', type: 'key', attributes: ['type'] },
            ],
        },
        {
            id: 'style_guides',
            name: 'Style Guides',
            attributes: [
                { key: 'projectId', type: 'string', size: 36, required: true },
                { key: 'colors', type: 'string', size: 5000, required: true }, // JSON
                { key: 'fonts', type: 'string', size: 2000, required: true }, // JSON
                { key: 'spacing', type: 'string', size: 1000, required: false }, // JSON array
                { key: 'components', type: 'string', size: 50000, required: false }, // JSON
            ],
            indexes: [
                { key: 'projectId_idx', type: 'unique', attributes: ['projectId'] },
            ],
        },
        {
            id: 'research_data',
            name: 'Research Data',
            attributes: [
                { key: 'projectId', type: 'string', size: 36, required: true },
                { key: 'competitors', type: 'string', size: 50000, required: false }, // JSON array
                { key: 'insights', type: 'string', size: 20000, required: false }, // JSON array
                { key: 'opportunities', type: 'string', size: 20000, required: false }, // JSON array
            ],
            indexes: [
                { key: 'projectId_idx', type: 'unique', attributes: ['projectId'] },
            ],
        },
        {
            id: 'ai_conversations',
            name: 'AI Conversations',
            attributes: [
                { key: 'projectId', type: 'string', size: 36, required: true },
                { key: 'messages', type: 'string', size: 1000000, required: false }, // JSON array - large for chat history
                { key: 'context', type: 'string', size: 100000, required: false }, // JSON
                { key: 'updatedAt', type: 'datetime', required: true },
            ],
            indexes: [
                { key: 'projectId_idx', type: 'unique', attributes: ['projectId'] },
            ],
        },
    ]

    for (const collection of collections) {
        try {
            // Create collection
            const col = await databases.createCollection(
                DATABASE_ID,
                collection.id,
                collection.name,
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users()),
                ]
            )
            console.log(`✅ Collection created: ${collection.name}`)

            // Create attributes
            for (const attr of collection.attributes) {
                try {
                    if (attr.type === 'string') {
                        await databases.createStringAttribute(
                            DATABASE_ID,
                            collection.id,
                            attr.key,
                            attr.size || 255,
                            attr.required || false,
                            typeof attr.default === 'string' ? attr.default : undefined
                        )
                    } else if (attr.type === 'email') {
                        await databases.createEmailAttribute(
                            DATABASE_ID,
                            collection.id,
                            attr.key,
                            attr.required || false
                        )
                    } else if (attr.type === 'enum') {
                        await databases.createEnumAttribute(
                            DATABASE_ID,
                            collection.id,
                            attr.key,
                            (attr as { elements?: string[] }).elements || [],
                            attr.required || false,
                            (attr as { default?: string }).default || undefined
                        )
                    } else if (attr.type === 'datetime') {
                        await databases.createDatetimeAttribute(
                            DATABASE_ID,
                            collection.id,
                            attr.key,
                            attr.required || false
                        )
                    } else if (attr.type === 'integer') {
                        const intAttr = attr as { min?: number; max?: number; default?: number }
                        await databases.createIntegerAttribute(
                            DATABASE_ID,
                            collection.id,
                            attr.key,
                            attr.required || false,
                            intAttr.min,
                            intAttr.max,
                            intAttr.default
                        )
                    }
                    console.log(`  📝 Attribute: ${attr.key}`)
                } catch (e: any) {
                    if (e.code !== 409) console.error(`  ❌ Attribute ${attr.key}:`, e.message)
                }
            }

            // Wait for attributes to be created before indexes
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Create indexes
            for (const idx of collection.indexes || []) {
                try {
                    await databases.createIndex(
                        DATABASE_ID,
                        collection.id,
                        idx.key,
                        idx.type as any,
                        idx.attributes
                    )
                    console.log(`  🔍 Index: ${idx.key}`)
                } catch (e: any) {
                    if (e.code !== 409) console.error(`  ❌ Index ${idx.key}:`, e.message)
                }
            }

        } catch (error: any) {
            if (error.code === 409) {
                console.log(`📦 Collection already exists: ${collection.name}`)
            } else {
                console.error(`❌ Error creating ${collection.name}:`, error.message)
            }
        }
    }
}

async function main() {
    console.log('🚀 Setting up Appwrite database...\n')

    await createDatabase()
    await createCollections()

    console.log('\n✅ Database setup complete!')
}

main().catch(console.error)
