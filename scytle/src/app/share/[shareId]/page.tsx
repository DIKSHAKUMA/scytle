import type { Metadata } from 'next'
import { createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { Query, Storage } from 'node-appwrite'
import { ShareViewer } from './share-viewer'

const BUCKET_ID = 'exports'
const canvasFileId = (projectId: string) => `canvas_${projectId.replace(/[^a-zA-Z0-9._-]/g, '_')}`

interface PageProps {
    params: Promise<{ shareId: string }>
}

async function getShareData(shareId: string) {
    try {
        const { databases, client } = createAdminClient()

        const result = await databases.listDocuments(DATABASE_ID, COLLECTIONS.SHARES, [
            Query.equal('shareId', shareId),
            Query.limit(1),
        ])

        if (result.documents.length === 0) return null

        const share = result.documents[0]
        if (!share.isPublic) return { private: true, projectName: null, canvasData: null }

        const project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, share.projectId)

        // Load canvas data from Appwrite Storage (same approach as partner's /api/projects/[id]/canvas)
        let canvasData = null
        try {
            const storage = new Storage(client)
            const fileId = canvasFileId(share.projectId)
            const fileData = await storage.getFileDownload(BUCKET_ID, fileId)

            if (fileData && typeof fileData === 'object' && !ArrayBuffer.isView(fileData) && !(fileData instanceof ArrayBuffer)) {
                canvasData = fileData
            } else {
                const jsonStr = typeof fileData === 'string'
                    ? fileData
                    : new TextDecoder().decode(fileData as ArrayBuffer)
                canvasData = JSON.parse(jsonStr)
            }
        } catch {
            // No canvas file yet — that's fine
        }

        return {
            private: false,
            projectName: project.name as string,
            projectDescription: (project.description || '') as string,
            canvasData,
        }
    } catch {
        return null
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { shareId } = await params
    const data = await getShareData(shareId)

    const title = data?.projectName
        ? `${data.projectName} — Scytle.ai`
        : 'Shared Design — Scytle.ai'

    const description = data?.projectDescription || 'View this design on Scytle.ai'

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            siteName: 'Scytle.ai',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
    }
}

export default async function SharePage({ params }: PageProps) {
    const { shareId } = await params
    const data = await getShareData(shareId)

    // Not found
    if (!data) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
                <div className="text-6xl">404</div>
                <p className="text-muted-foreground">This share link doesn&apos;t exist.</p>
                <a
                    href="/"
                    className="text-sm text-primary hover:underline"
                >
                    Go to Scytle.ai
                </a>
            </div>
        )
    }

    // Private
    if (data.private) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="text-lg font-semibold">This design is private</h1>
                <p className="text-sm text-muted-foreground">The owner hasn&apos;t made this design publicly available.</p>
                <a
                    href="/login"
                    className="text-sm text-primary hover:underline"
                >
                    Log in to Scytle.ai
                </a>
            </div>
        )
    }

    return <ShareViewer projectName={data.projectName!} canvasData={data.canvasData} />
}
