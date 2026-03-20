import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'
import { createAdminClient, getUserFromJWT, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { CreateProjectSchema } from '@/types'

/**
 * GET /api/projects - List all projects for authenticated user
 */
export async function GET(request: NextRequest) {
    try {
        // Validate JWT
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { databases } = createAdminClient()

        // Fetch user's projects, sorted by updatedAt descending
        const response = await databases.listDocuments(
            DATABASE_ID,
            COLLECTIONS.PROJECTS,
            [
                Query.equal('userId', user.$id),
                Query.orderDesc('updatedAt'),
                Query.limit(50),
            ]
        )

        // Map to Project type
        const projects = response.documents.map(doc => ({
            projectId: doc.$id,
            userId: doc.userId,
            name: doc.name,
            description: doc.description || '',
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }))

        return NextResponse.json({ projects, total: response.total })
    } catch (error) {
        console.error('❌ Failed to fetch projects:', error)
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        )
    }
}

/**
 * POST /api/projects - Create a new project
 */
export async function POST(request: NextRequest) {
    try {
        // Validate JWT
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Parse and validate body
        const body = await request.json()
        const validation = CreateProjectSchema.safeParse(body)

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.flatten() },
                { status: 400 }
            )
        }

        const { name, description, productType, aiModel } = validation.data
        const { databases } = createAdminClient()
        const now = new Date().toISOString()

        // Create project document
        // Note: productType & aiModel stored client-side for now; Appwrite migration pending
        const doc = await databases.createDocument(
            DATABASE_ID,
            COLLECTIONS.PROJECTS,
            'unique()',
            {
                userId: user.$id,
                name,
                description: description || '',
                status: 'draft',
                createdAt: now,
                updatedAt: now,
            }
        )

        const project = {
            projectId: doc.$id,
            userId: doc.userId,
            name: doc.name,
            description: doc.description,
            status: doc.status,
            productType: productType || 'web',
            aiModel: aiModel || 'gemini-pro',
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }

        console.log('✅ Project created:', project.projectId)

        return NextResponse.json({ project }, { status: 201 })
    } catch (error) {
        console.error('❌ Failed to create project:', error)
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        )
    }
}
