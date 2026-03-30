import { NextRequest, NextResponse } from 'next/server'
import { Query } from 'node-appwrite'
import { createAdminClient, getUserFromJWT, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'

interface RouteParams {
    params: Promise<{ shareId: string }>
}

/**
 * GET /api/shares/[shareId] — Public endpoint. Returns project data if share is public.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
    try {
        const { shareId } = await params
        const { databases } = createAdminClient()

        // Look up share by shareId field
        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SHARES, [
            Query.equal('shareId', shareId),
            Query.limit(1),
        ])

        if (result.documents.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const share = result.documents[0]

        if (!share.isPublic) {
            return NextResponse.json({ error: 'private' }, { status: 403 })
        }

        // Fetch the project data
        const project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, share.projectId)

        // Parse canvasData if available
        let canvasData = null
        if (project.canvasData) {
            try {
                canvasData = JSON.parse(project.canvasData)
            } catch { /* corrupt — ignore */ }
        }

        return NextResponse.json({
            projectName: project.name,
            projectDescription: project.description || '',
            canvasData,
            shareId: share.shareId,
        })
    } catch (error) {
        console.error('Failed to fetch share:', error)
        return NextResponse.json({ error: 'Failed to fetch share' }, { status: 500 })
    }
}

/**
 * PATCH /api/shares/[shareId] — Toggle public/private. Owner only.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { shareId } = await params
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        if (typeof body.isPublic !== 'boolean') {
            return NextResponse.json({ error: 'isPublic (boolean) is required' }, { status: 400 })
        }

        const { databases } = createAdminClient()

        // Find the share document
        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SHARES, [
            Query.equal('shareId', shareId),
            Query.limit(1),
        ])

        if (result.documents.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const share = result.documents[0]
        if (share.userId !== user.$id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Update
        const updated = await databases.updateDocument(DATABASE_ID, COLLECTIONS.SHARES, share.$id, {
            isPublic: body.isPublic,
        })

        return NextResponse.json({
            share: {
                shareId: updated.shareId,
                projectId: updated.projectId,
                isPublic: updated.isPublic,
                createdAt: updated.createdAt,
            },
        })
    } catch (error) {
        console.error('Failed to update share:', error)
        return NextResponse.json({ error: 'Failed to update share' }, { status: 500 })
    }
}

/**
 * DELETE /api/shares/[shareId] — Revoke share. Owner only.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { shareId } = await params
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { databases } = createAdminClient()

        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SHARES, [
            Query.equal('shareId', shareId),
            Query.limit(1),
        ])

        if (result.documents.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const share = result.documents[0]
        if (share.userId !== user.$id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await databases.deleteDocument(DATABASE_ID, COLLECTIONS.SHARES, share.$id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete share:', error)
        return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 })
    }
}
