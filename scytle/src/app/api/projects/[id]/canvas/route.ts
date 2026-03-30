import { NextRequest, NextResponse } from 'next/server'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { Storage } from 'node-appwrite'

const BUCKET_ID = 'exports'
const canvasFileId = (projectId: string) => `canvas_${projectId.replace(/[^a-zA-Z0-9._-]/g, '_')}`

interface RouteParams {
    params: Promise<{ id: string }>
}

/**
 * GET /api/projects/[id]/canvas
 * Load canvas state from Appwrite Storage (JSON file per project)
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        // 1. Authenticate
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Verify project ownership
        const { databases, client } = createAdminClient()
        let project
        try {
            project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, projectId)
        } catch {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        if (project.userId !== user.$id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // 3. Read canvas file from Storage
        const storage = new Storage(client)
        const fileId = canvasFileId(projectId)

        try {
            const fileData = await storage.getFileDownload(BUCKET_ID, fileId)
            // node-appwrite v21 may return parsed object or ArrayBuffer
            let canvasState: unknown
            if (fileData && typeof fileData === 'object' && !ArrayBuffer.isView(fileData) && !(fileData instanceof ArrayBuffer)) {
                // Already parsed JSON object
                canvasState = fileData
            } else {
                // Raw bytes — decode and parse
                const jsonStr = typeof fileData === 'string'
                    ? fileData
                    : new TextDecoder().decode(fileData as ArrayBuffer)
                canvasState = JSON.parse(jsonStr)
            }
            return NextResponse.json({ canvasState })
        } catch (error: unknown) {
            // File doesn't exist yet — that's fine
            const errMsg = error instanceof Error ? error.message : String(error)
            if (errMsg.includes('not found') || errMsg.includes('404')) {
                return NextResponse.json({ canvasState: null })
            }
            console.error('📦 Error loading canvas from storage:', error)
            return NextResponse.json({ canvasState: null })
        }
    } catch (error) {
        console.error('❌ Canvas load error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

/**
 * POST /api/projects/[id]/canvas
 * Save canvas state as a JSON file in Appwrite Storage
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
    try {
        const { id: projectId } = await params

        // 1. Authenticate
        const user = await getUserFromJWT(request.headers.get('Authorization'))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Validate body
        const body = await request.json()
        if (!body || typeof body !== 'object') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
        }

        // 3. Verify project ownership
        const { databases, client } = createAdminClient()
        let project
        try {
            project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, projectId)
        } catch {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        if (project.userId !== user.$id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // 4. Write canvas JSON to Storage (delete old + create new, with retry for race conditions)
        const storage = new Storage(client)
        const fileId = canvasFileId(projectId)
        const canvasJson = JSON.stringify(body)

        const MAX_RETRIES = 3
        for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                // Delete existing file first (ignore if not found)
                try {
                    await storage.deleteFile(BUCKET_ID, fileId)
                } catch {
                    // File doesn't exist yet — that's fine
                }

                // Create new file with deterministic ID
                const file = new File([canvasJson], `canvas-${projectId}.json`, { type: 'application/json' })
                await storage.createFile(BUCKET_ID, fileId, file)
                break // Success — exit retry loop
            } catch (error) {
                const errMsg = error instanceof Error ? error.message : String(error)
                // Conflict (409) or "already exists" → another save raced us, retry
                if ((errMsg.includes('already exists') || errMsg.includes('409') || errMsg.includes('conflict')) && attempt < MAX_RETRIES - 1) {
                    console.warn(`📦 Canvas save conflict (attempt ${attempt + 1}), retrying...`)
                    await new Promise(r => setTimeout(r, 100 * (attempt + 1)))
                    continue
                }
                console.error('📦 Error saving canvas to storage:', error)
                return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('❌ Canvas save error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
