'use client'

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import { useUnifiedStore } from '@/store'
import type { WireframeSection, WireframeSectionContent } from '@/types'
import { createJWT } from '@/lib/appwrite'
import { getPresetById, getPresetsForCategory, getFamilyById } from '@/lib/designs/registry'

interface GenerationState {
    isGenerating: boolean
    progress: number
    message: string
    abortController: AbortController | null
}

interface UseGenerationReturn {
    // State
    isGenerating: boolean
    progress: number
    message: string

    // Actions
    generatePageSections: (pageId: string, pageName: string, pageDescription?: string) => Promise<void>
    generateSectionCopy: (sectionId: string) => Promise<void>
    generatePageCopy: (pageId: string) => Promise<void>
    shuffleComponent: (sectionId: string) => void
    stopGeneration: () => void
}

/**
 * useGeneration Hook
 * 
 * Manages AI generation for wireframe content:
 * - Generate sections for a page
 * - Generate copy for a section
 * - Generate copy for entire page
 * - Shuffle component variants
 */
export function useGeneration(): UseGenerationReturn {
    const [state, setState] = useState<GenerationState>({
        isGenerating: false,
        progress: 0,
        message: '',
        abortController: null,
    })

    const abortRef = useRef<AbortController | null>(null)

    const {
        pages,
        updateSection,
        updateSectionContent,
        updatePage,
        getPageById,
        getSectionById,
        addSection,
    } = useUnifiedStore()

    /**
     * Generate sections for a page using AI
     */
    const generatePageSections = useCallback(async (
        pageId: string,
        pageName: string,
        pageDescription?: string
    ) => {
        const controller = new AbortController()
        abortRef.current = controller

        setState({
            isGenerating: true,
            progress: 0,
            message: 'Preparing generation...',
            abortController: controller,
        })

        try {
            const jwt = await createJWT()
            if (!jwt) throw new Error('Not authenticated')

            setState(s => ({ ...s, progress: 10, message: 'Connecting to AI...' }))

            // Get page context to send to the API
            const page = pages.find(p => p.id === pageId)
            const pageContext = page?.pageContext || 'marketing'

            const response = await fetch('/api/wireframe/generate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt.jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pageId,
                    pageName,
                    pageDescription,
                    pageContext,
                }),
                signal: controller.signal,
            })

            setState(s => ({ ...s, progress: 50, message: 'Generating sections...' }))

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Generation failed')
            }

            const data = await response.json()

            setState(s => ({ ...s, progress: 80, message: 'Applying sections...' }))

            // Clear existing sections and add new ones via addSection so they get
            // resolved through createSection() with proper componentId and controls
            if (data.sections && Array.isArray(data.sections)) {
                // First clear the page sections
                updatePage(pageId, { sections: [] })
                // Then add each section through addSection which runs createSection()
                for (const section of data.sections) {
                    addSection(pageId, {
                        id: section.id,
                        name: section.name,
                        description: section.description,
                        type: section.type,
                        componentId: section.componentId,
                    })
                }
            }

            setState(s => ({ ...s, progress: 100, message: 'Done!' }))

            toast.success('Sections generated successfully')

            // Reset after brief delay
            setTimeout(() => {
                setState({
                    isGenerating: false,
                    progress: 0,
                    message: '',
                    abortController: null,
                })
            }, 500)

        } catch (error) {
            if ((error as Error).name === 'AbortError') {
                console.log('🛑 Generation cancelled')
                toast.info('Generation cancelled')
            } else {
                console.error('❌ Generation error:', error)
                toast.error('Failed to generate sections', {
                    description: (error as Error).message,
                })
            }
            setState({
                isGenerating: false,
                progress: 0,
                message: '',
                abortController: null,
            })
        }
    }, [pages, updatePage, addSection])

    /**
     * Generate copy for a single section
     */
    const generateSectionCopy = useCallback(async (sectionId: string) => {
        const controller = new AbortController()
        abortRef.current = controller

        const result = getSectionById(sectionId)
        if (!result) {
            console.error('Section not found:', sectionId)
            return
        }

        setState({
            isGenerating: true,
            progress: 0,
            message: `Generating copy for ${result.section.name}...`,
            abortController: controller,
        })

        try {
            const jwt = await createJWT()
            if (!jwt) throw new Error('Not authenticated')

            setState(s => ({ ...s, progress: 30 }))

            const response = await fetch('/api/ai/generate-copy', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${jwt.jwt}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    sectionId,
                    sectionType: result.section.type,
                    sectionName: result.section.name,
                    pageName: result.page.name,
                }),
                signal: controller.signal,
            })

            setState(s => ({ ...s, progress: 70 }))

            if (!response.ok) {
                throw new Error('Failed to generate copy')
            }

            const data = await response.json()

            if (data.content) {
                updateSectionContent(result.page.id, sectionId, data.content)
            }

            setState(s => ({ ...s, progress: 100, message: 'Done!' }))
            toast.success('Copy generated successfully')

            setTimeout(() => {
                setState({
                    isGenerating: false,
                    progress: 0,
                    message: '',
                    abortController: null,
                })
            }, 500)

        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('❌ Copy generation error:', error)
                toast.error('Failed to generate copy')
            }
            setState({
                isGenerating: false,
                progress: 0,
                message: '',
                abortController: null,
            })
        }
    }, [getSectionById, updateSectionContent])

    /**
     * Generate copy for all sections on a page
     */
    const generatePageCopy = useCallback(async (pageId: string) => {
        const controller = new AbortController()
        abortRef.current = controller

        const page = getPageById(pageId)
        if (!page) {
            console.error('Page not found:', pageId)
            return
        }

        setState({
            isGenerating: true,
            progress: 0,
            message: `Generating copy for ${page.name}...`,
            abortController: controller,
        })

        try {
            const jwt = await createJWT()
            if (!jwt) throw new Error('Not authenticated')

            const totalSections = page.sections.length
            let completed = 0

            // Generate copy for each section sequentially
            for (const section of page.sections) {
                if (controller.signal.aborted) break

                setState(s => ({
                    ...s,
                    progress: Math.round((completed / totalSections) * 100),
                    message: `Generating: ${section.name}...`,
                }))

                try {
                    const response = await fetch('/api/ai/generate-copy', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${jwt.jwt}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            sectionId: section.id,
                            sectionType: section.type,
                            sectionName: section.name,
                            pageName: page.name,
                        }),
                        signal: controller.signal,
                    })

                    if (response.ok) {
                        const data = await response.json()
                        if (data.content) {
                            updateSectionContent(pageId, section.id, data.content)
                        }
                    }
                } catch {
                    // Continue with other sections
                }

                completed++
            }

            setState(s => ({ ...s, progress: 100, message: 'Done!' }))
            toast.success(`Generated copy for ${completed} sections`)

            setTimeout(() => {
                setState({
                    isGenerating: false,
                    progress: 0,
                    message: '',
                    abortController: null,
                })
            }, 500)

        } catch (error) {
            if ((error as Error).name !== 'AbortError') {
                console.error('❌ Page copy generation error:', error)
                toast.error('Failed to generate page copy')
            }
            setState({
                isGenerating: false,
                progress: 0,
                message: '',
                abortController: null,
            })
        }
    }, [getPageById, updateSectionContent])

    /**
     * Shuffle to a different component variant
     */
    const shuffleComponent = useCallback((sectionId: string) => {
        const result = getSectionById(sectionId)
        if (!result) return

        const { section, page } = result
        if (!section.componentId) return

        // Find current preset and get all presets in the same category
        const currentPreset = getPresetById(section.componentId)
        if (!currentPreset) return

        const family = getFamilyById(currentPreset.familyId)
        if (!family) return

        const categoryPresets = getPresetsForCategory(family.category)
        if (categoryPresets.length <= 1) return

        // Cycle to next preset in the category
        const currentIndex = categoryPresets.findIndex(p => p.id === section.componentId)
        const nextIndex = (currentIndex + 1) % categoryPresets.length
        const nextPreset = categoryPresets[nextIndex]

        updateSection(page.id, sectionId, { componentId: nextPreset.id })
    }, [getSectionById, updateSection])

    /**
     * Stop ongoing generation
     */
    const stopGeneration = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort()
            abortRef.current = null
        }
        setState({
            isGenerating: false,
            progress: 0,
            message: '',
            abortController: null,
        })
    }, [])

    return {
        isGenerating: state.isGenerating,
        progress: state.progress,
        message: state.message,
        generatePageSections,
        generateSectionCopy,
        generatePageCopy,
        shuffleComponent,
        stopGeneration,
    }
}
