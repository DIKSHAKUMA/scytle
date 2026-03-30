import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'
import { createAdminClient, getUserFromJWT, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'

interface RouteParams {
    params: Promise<{ projectId: string }>
}

/**
 * GET /api/shares/project/[projectId] — Get the share record for a project. Owner only.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { projectId } = await params
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { databases } = createAdminClient()

        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SHARES, [
            Query.equal('projectId', projectId),
            Query.equal('userId', user.$id),
            Query.limit(1),
        ])

        if (result.documents.length === 0) {
            return NextResponse.json({ share: null })
        }

        const doc = result.documents[0]
        return NextResponse.json({
            share: {
                shareId: doc.shareId,
                projectId: doc.projectId,
                isPublic: doc.isPublic,
                createdAt: doc.createdAt,
            },
        })
    } catch (error) {
        console.error('Failed to fetch share for project:', error)
        return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 })
    }
}
