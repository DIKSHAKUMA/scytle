/**
 * VideoControlsPanel — Design-mode video configuration sub-panel
 *
 * Shows when activePanelView === 'video-controls' and a section
 * with a video block is selected. Allows uploading video files,
 * setting aspect ratio, and playback options.
 */

'use client'

import { useRef, useState, useCallback } from 'react'
import { ArrowLeft, X, Play, Upload, Trash2, Loader2, Film } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useUnifiedStore } from '@/store'
import { storage, BUCKETS } from '@/lib/appwrite'
import { ID } from 'appwrite'
import type { SectionDesignProps } from '@/lib/designs/v2/tokens'

// ============================================
// Types
// ============================================

interface VideoControlsPanelProps {
    pageId: string
    sectionId: string
    onBackAction: () => void
    onCloseAction: () => void
    className?: string
}

// ============================================
// Toggle button group helper
// ============================================

function ToggleGroup<T extends string>({
    label,
    value,
    options,
    onChange,
}: {
    label: string
    value: T
    options: { value: T; label: string }[]
    onChange: (v: T) => void
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            <div className="flex gap-1">
                {options.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        className={cn(
                            'flex-1 px-2 py-1.5 text-xs rounded-md border transition-all',
                            value === opt.value
                                ? 'bg-violet-50 border-violet-200 text-violet-700 font-medium'
                                : 'bg-background border-border text-muted-foreground hover:bg-muted/60',
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

// ============================================
// Main Component
// ============================================

export function VideoControlsPanel({
    pageId,
    sectionId,
    onBackAction,
    onCloseAction,
    className,
}: VideoControlsPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    // Get section data from store
    const section = useUnifiedStore(s => {
        const page = s.pages.find(p => p.id === pageId)
        return page?.sections.find(sec => sec.id === sectionId)
    })

    const updateSectionDesignProps = useUnifiedStore(s => s.updateSectionDesignProps)

    const designProps = section?.designProps as SectionDesignProps | undefined
    const videoProps = designProps?.video

    // Keep local URL in sync with store (for undo/redo)
    const currentVideoUrl = videoProps?.url ?? ''

    // ---- Upload handler ----
    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadError(null)
        setIsUploading(true)

        try {
            const uploaded = await storage.createFile(
                BUCKETS.PROJECT_ASSETS,
                ID.unique(),
                file,
            )
            const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
            const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
            const fileUrl = `${endpoint}/storage/buckets/${BUCKETS.PROJECT_ASSETS}/files/${uploaded.$id}/view?project=${projectId}`

            updateSectionDesignProps(pageId, sectionId, {
                video: {
                    ...videoProps,
                    url: fileUrl,
                },
            })
        } catch {
            setUploadError('Failed to upload video. Check that the project_assets storage bucket is configured.')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }, [pageId, sectionId, videoProps, updateSectionDesignProps])

    // ---- Control handlers ----
    const handleRatioChange = useCallback((ratio: string) => {
        // Update the video block's props.ratio directly in the block tree
        useUnifiedStore.setState(state => {
            const p = state.pages.find(p => p.id === pageId)
            const s = p?.sections.find(s => s.id === sectionId)
            if (!s?.blocks) return

            function updateInTree(blocks: { type: string; props: Record<string, unknown>; children?: unknown[] }[]): boolean {
                for (const block of blocks) {
                    if (block.type === 'video') {
                        block.props.ratio = ratio
                        return true
                    }
                    if (block.children) {
                        if (updateInTree(block.children as typeof blocks)) return true
                    }
                }
                return false
            }
            updateInTree(s.blocks as { type: string; props: Record<string, unknown>; children?: unknown[] }[])
            state.isDirty = true
        })
    }, [pageId, sectionId])

    const handleAutoplayToggle = useCallback((autoplay: boolean) => {
        updateSectionDesignProps(pageId, sectionId, {
            video: {
                ...videoProps,
                url: videoProps?.url ?? '',
                autoplay,
                muted: autoplay ? true : (videoProps?.muted ?? false),
            },
        })
    }, [pageId, sectionId, videoProps, updateSectionDesignProps])

    const handleLoopToggle = useCallback((loop: boolean) => {
        updateSectionDesignProps(pageId, sectionId, {
            video: {
                ...videoProps,
                url: videoProps?.url ?? '',
                loop,
            },
        })
    }, [pageId, sectionId, videoProps, updateSectionDesignProps])

    const handleClearVideo = useCallback(() => {
        updateSectionDesignProps(pageId, sectionId, {
            video: undefined,
        })
        // Also clear the video block's content.src
        useUnifiedStore.setState(state => {
            const p = state.pages.find(p => p.id === pageId)
            const s = p?.sections.find(s => s.id === sectionId)
            if (!s?.blocks) return

            function clearInTree(blocks: { type: string; content: Record<string, unknown>; children?: unknown[] }[]): boolean {
                for (const block of blocks) {
                    if (block.type === 'video') {
                        block.content.src = undefined
                        return true
                    }
                    if (block.children) {
                        if (clearInTree(block.children as typeof blocks)) return true
                    }
                }
                return false
            }
            clearInTree(s.blocks as { type: string; content: Record<string, unknown>; children?: unknown[] }[])
            state.isDirty = true
        })
    }, [pageId, sectionId, updateSectionDesignProps])

    // Get current video block ratio
    const currentRatio = (() => {
        if (!section?.blocks) return '16:9'
        function findRatio(blocks: { type: string; props: Record<string, unknown>; children?: unknown[] }[]): string {
            for (const block of blocks) {
                if (block.type === 'video') return (block.props.ratio as string) ?? '16:9'
                if (block.children) {
                    const found = findRatio(block.children as typeof blocks)
                    if (found !== '16:9') return found
                }
            }
            return '16:9'
        }
        return findRatio(section.blocks as { type: string; props: Record<string, unknown>; children?: unknown[] }[])
    })()

    return (
        <div className={cn(
            'flex flex-col h-full min-h-0 w-full max-w-full bg-background overflow-hidden',
            className,
        )}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b shrink-0 w-full">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={onBackAction}
                        className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-sm font-semibold text-foreground">Video</h2>
                </div>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onCloseAction}
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 min-h-0 w-full">
                <div className="p-4 space-y-4">
                    {/* Upload / Preview */}
                    <div className="space-y-2">
                        {currentVideoUrl ? (
                            <div className="relative group rounded-lg border overflow-hidden bg-muted/30">
                                <div className="flex items-center justify-center h-32">
                                    <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                                        <Play className="h-8 w-8 opacity-40" />
                                        <span className="text-[10px] truncate max-w-[200px] px-2 text-center">
                                            {currentVideoUrl.length > 60
                                                ? `${currentVideoUrl.slice(0, 30)}...${currentVideoUrl.slice(-25)}`
                                                : currentVideoUrl}
                                        </span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-7 text-xs"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="h-3 w-3 mr-1" />
                                        Replace
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        className="h-7 text-xs"
                                        onClick={handleClearVideo}
                                    >
                                        <Trash2 className="h-3 w-3 mr-1" />
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                disabled={isUploading}
                                className={cn(
                                    'w-full h-32 rounded-lg border-2 border-dashed',
                                    'flex flex-col items-center justify-center gap-2',
                                    'text-muted-foreground hover:text-foreground',
                                    'hover:border-violet-300 hover:bg-violet-50/50',
                                    'transition-all cursor-pointer',
                                    isUploading && 'opacity-60 cursor-wait',
                                )}
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="h-8 w-8 opacity-40 animate-spin" />
                                        <span className="text-xs font-medium">Uploading…</span>
                                    </>
                                ) : (
                                    <>
                                        <Film className="h-8 w-8 opacity-40" />
                                        <span className="text-xs font-medium">Click to upload video</span>
                                        <span className="text-[10px] text-muted-foreground">MP4, WebM, MOV up to 50 MB</span>
                                    </>
                                )}
                            </button>
                        )}
                        {uploadError && (
                            <p className="text-[10px] text-red-500 leading-tight">{uploadError}</p>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,.mp4,.webm,.mov,.avi"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    <Separator />

                    {/* Ratio */}
                    <ToggleGroup
                        label="Ratio"
                        value={currentRatio}
                        options={[
                            { value: '16:9', label: '16:9' },
                            { value: '4:3', label: '4:3' },
                            { value: '1:1', label: '1:1' },
                            { value: '3:2', label: '3:2' },
                        ]}
                        onChange={handleRatioChange}
                    />

                    <Separator />

                    {/* Autoplay */}
                    <ToggleGroup
                        label="Autoplay"
                        value={videoProps?.autoplay ? 'yes' : 'no'}
                        options={[
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ]}
                        onChange={(v) => handleAutoplayToggle(v === 'yes')}
                    />

                    {/* Loop */}
                    <ToggleGroup
                        label="Loop"
                        value={videoProps?.loop ? 'yes' : 'no'}
                        options={[
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ]}
                        onChange={(v) => handleLoopToggle(v === 'yes')}
                    />
                </div>
            </ScrollArea>
        </div>
    )
}
