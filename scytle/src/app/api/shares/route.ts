import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'
import { createAdminClient, getUserFromJWT, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { generateShareId } from '@/lib/share-utils'

/**
 * POST /api/shares — Create a share link for a project.
 * If one already exists, returns the existing share.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { projectId } = body

        if (!projectId || typeof projectId !== 'string') {
            return NextResponse.json({ error: 'projectId is required' }, { status: 400 })
        }

        const { databases } = createAdminClient()

        // Verify user owns the project
        const project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, projectId)
        if (project.userId !== user.$id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Check if share already exists for this project
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SHARES, [
            Query.equal('projectId', projectId),
            Query.equal('userId', user.$id),
            Query.limit(1),
        ])

        if (existing.documents.length > 0) {
            const doc = existing.documents[0]
            return NextResponse.json({
                share: {
                    shareId: doc.shareId,
                    projectId: doc.projectId,
                    isPublic: doc.isPublic,
                    createdAt: doc.createdAt,
                },
            })
        }

        // Create new share
        const shareId = generateShareId()
        const now = new Date().toISOString()

        const doc = await databases.createDocument(DATABASE_ID, COLLECTIONS.SHARES, 'unique()', {
            shareId,
            projectId,
            userId: user.$id,
            isPublic: true,
            createdAt: now,
        })

        return NextResponse.json(
            {
                share: {
                    shareId: doc.shareId,
                    projectId: doc.projectId,
                    isPublic: doc.isPublic,
                    createdAt: doc.createdAt,
                },
            },
            { status: 201 }
        )
    } catch (error) {
        console.error('Failed to create share:', error)
        return NextResponse.json({ error: 'Failed to create share' }, { status: 500 })
    }
}
