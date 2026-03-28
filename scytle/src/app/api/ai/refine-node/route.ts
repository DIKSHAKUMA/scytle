import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getUserFromJWT, createAdminClient, DATABASE_ID, COLLECTIONS } from '@/lib/appwrite-server'
import { generate } from '@/lib/ai'
import type { AIModel } from '@/lib/ai/config'

const RefineNodeSchema = z.object({
    projectId: z.string().min(1),
    nodeId: z.string().min(1),
    nodeHtml: z.string(),
    nodeName: z.string().optional(),
    prompt: z.string().min(1).max(4000),
    contextNodes: z.array(z.object({
        id: z.string(),
        name: z.string().optional(),
        type: z.string().optional(),
        htmlSnippet: z.string(),
    })).optional(),
    model: z.string().optional(),
})

/**
 * POST /api/ai/refine-node
 * Surgical node refinement — takes a node's HTML + user prompt,
 * returns updated HTML without streaming.
 */
export async function POST(request: NextRequest) {
    try {
        // 1. Authenticate
        const authHeader = request.headers.get('Authorization')
        const user = await getUserFromJWT(authHeader)
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Validate input
        const body = await request.json()
        const validation = RefineNodeSchema.safeParse(body)
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Invalid input', details: validation.error.issues },
                { status: 400 }
            )
        }

        const { projectId, nodeId, nodeHtml, nodeName, prompt, contextNodes, model } = validation.data

        // 3. Verify project ownership
        const { databases } = createAdminClient()
        let project
        try {
            project = await databases.getDocument(DATABASE_ID, COLLECTIONS.PROJECTS, projectId)
        } catch {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        if (project.userId !== user.$id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }

        // 4. Build the refinement prompt
        const contextSection = contextNodes && contextNodes.length > 0
            ? `\nSURROUNDING CONTEXT (sibling/parent nodes for reference):\n${contextNodes.map(n =>
                `- ${n.name || n.id} (${n.type || 'unknown'}): ${n.htmlSnippet}`
              ).join('\n')}\n`
            : ''

        // Extract image inventory from the input HTML for the AI to reference
        const imgRegex = /<img\s+[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi
        const images: Array<{ src: string; alt: string }> = []
        let imgMatch
        while ((imgMatch = imgRegex.exec(nodeHtml)) !== null) {
            images.push({ src: imgMatch[1], alt: imgMatch[2] })
        }
        const imageInventory = images.length > 0
            ? `\nIMAGE INVENTORY — These MUST appear in your output with IDENTICAL src and alt:\n${images.map((img, i) =>
                `  ${i + 1}. src="${img.src}" alt="${img.alt}"`
              ).join('\n')}\n`
            : ''

        const systemPrompt = `You are Scytle, an elite frontend design agent performing a SURGICAL EDIT on a single UI component.

CRITICAL RULES — FOLLOW EXACTLY:

CONTENT PRESERVATION (NON-NEGOTIABLE):
1. You MUST preserve ALL existing text content, headings, paragraphs, bullet points, and copy EXACTLY as-is. Do NOT invent, add, or remove any text content.
2. You MUST preserve EVERY <img> tag with its EXACT same src and alt attributes. Never change, remove, or replace any image URL. Never substitute real URLs with placeholder URLs.
3. You MUST preserve ALL links (<a> tags) with their exact href attributes.

WHAT YOU CAN MODIFY:
4. Tailwind CSS classes on any element — colors, backgrounds, borders, shadows, spacing, typography styles, layout classes (grid-cols, flex-direction, gap, etc.), sizing, positioning.
5. You may restructure layout (e.g., change grid columns, flex direction, element ordering) IF the user's request requires it.
6. Use only Tailwind CSS utility classes. No arbitrary CSS or inline styles.

WHAT YOU MUST NOT DO:
7. Do NOT add new HTML elements, sections, or content blocks that don't exist in the original.
8. Do NOT remove any existing HTML elements.
9. Do NOT replace real image URLs with placeholder URLs or vice versa.
10. Do NOT truncate output or use placeholders like "<!-- rest -->".
11. Output COMPLETE HTML — every element from the input must appear in the output.

TARGET NODE:
- ID: ${nodeId}
- Name: ${nodeName || 'Unnamed'}
- Current HTML:
${nodeHtml}
${imageInventory}${contextSection}
YOUR RESPONSE FORMAT:
You MUST respond with valid JSON only. No markdown code fences, no extra text.
{
  "html": "<div class='...'>...the same content with updated styling...</div>",
  "summary": "Brief 1-sentence description of what changed"
}`

        const userMessage = `User request: "${prompt}"

Apply this change to the node above. Preserve all text content and all images (same src and alt). You may modify Tailwind classes and layout structure as needed. Respond with JSON only.`

        console.log(`🤖 Refining node "${nodeName || nodeId}" [model: ${model || 'gemini-flash'}, htmlLen: ${nodeHtml.length}]`)

        // 5. Generate (non-streaming for clean JSON response)
        // Low temperature for faithful, predictable edits
        const aiResponse = await generate(userMessage, [], {
            model: (model || 'gemini-flash') as AIModel,
            systemPrompt,
            temperature: 0.3,
            maxTokens: 16384,
        })

        // 6. Parse the JSON response
        let result
        try {
            // Try direct JSON parse first
            result = JSON.parse(aiResponse.trim())
        } catch {
            // Try extracting JSON from potential markdown code fences
            const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
            if (!jsonMatch) {
                console.error('❌ refine-node: No JSON in response:', aiResponse.substring(0, 500))
                return NextResponse.json(
                    { error: 'AI returned invalid response. Please try again.' },
                    { status: 502 }
                )
            }
            result = JSON.parse(jsonMatch[0])
        }

        if (!result.html) {
            return NextResponse.json(
                { error: 'AI response missing HTML. Please try again.' },
                { status: 502 }
            )
        }

        console.log(`✅ refine-node success: ${result.summary || 'Changes applied'}`)

        return NextResponse.json({
            html: result.html,
            summary: result.summary || 'Changes applied.',
            nodeId,
        })

    } catch (error) {
        console.error('❌ refine-node error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
