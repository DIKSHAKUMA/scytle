/**
 * ImageControlsPanel — Design-mode image configuration sub-panel
 *
 * Shows when activePanelView === 'image-controls' and a section
 * with imageRole !== 'none' is selected. Controls adapt based on
 * whether the section uses a background image or inline image.
 *
 * Relume-inspired layout:
 *   - Image preview thumbnail
 *   - Upload button (Base64 MVP)
 *   - Ratio / Position / Fill / Width / Shape / Overlay / Foreground
 */

'use client'

import { useRef, useCallback, useState } from 'react'
import { ArrowLeft, X, Upload, ImageIcon, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useUnifiedStore } from '@/store'
import { getPresetConfig } from '@/lib/designs/v2/layouts'
import { storage, BUCKETS } from '@/lib/appwrite'
import { ID } from 'appwrite'
import type { ImagePosition, SectionDesignProps } from '@/lib/designs/v2/tokens'
import { PositionGrid } from './position-grid'

// ============================================
// Types
// ============================================

interface ImageControlsPanelProps {
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
    disabled,
}: {
    label: string
    value: T
    options: { value: T; label: string }[]
    onChange: (v: T) => void
    disabled?: boolean
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
                        disabled={disabled}
                        className={cn(
                            'flex-1 px-2 py-1.5 text-xs rounded-md border transition-all',
                            value === opt.value
                                ? 'bg-violet-50 border-violet-200 text-violet-700 font-medium'
                                : 'bg-background border-border text-muted-foreground hover:bg-muted/60',
                            disabled && 'opacity-40 cursor-not-allowed',
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
// Image compression (fallback when Storage bucket isn't set up)
// ============================================

function compressImage(file: File, maxDim: number, quality: number): Promise<string> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        const url = URL.createObjectURL(file)
        img.onload = () => {
            URL.revokeObjectURL(url)
            const canvas = document.createElement('canvas')
            let { width, height } = img
            if (width > maxDim || height > maxDim) {
                const scale = maxDim / Math.max(width, height)
                width = Math.round(width * scale)
                height = Math.round(height * scale)
            }
            canvas.width = width
            canvas.height = height
            const ctx = canvas.getContext('2d')
            if (!ctx) { reject(new Error('Canvas not supported')); return }
            ctx.drawImage(img, 0, 0, width, height)
            resolve(canvas.toDataURL('image/jpeg', quality))
        }
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Failed to load image')) }
        img.src = url
    })
}

// ============================================
// Main Component
// ============================================

export function ImageControlsPanel({
    pageId,
    sectionId,
    onBackAction,
    onCloseAction,
    className,
}: ImageControlsPanelProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)

    // Get section data from store
    const section = useUnifiedStore(s => {
        const page = s.pages.find(p => p.id === pageId)
        return page?.sections.find(sec => sec.id === sectionId)
    })

    const updateSectionDesignProps = useUnifiedStore(s => s.updateSectionDesignProps)
    const setSectionBackgroundImage = useUnifiedStore(s => s.setSectionBackgroundImage)
    const setSectionInlineImage = useUnifiedStore(s => s.setSectionInlineImage)
    const clearSectionImage = useUnifiedStore(s => s.clearSectionImage)

    // Determine image role from preset config (with runtime asset-swap awareness)
    const componentId = section?.componentId ?? ''
    const presetConfig = getPresetConfig(componentId)
    const staticImageRole = presetConfig?.imageRole ?? 'none'
    const supportsVideo = presetConfig?.supportsVideo ?? false
    const designProps = section?.designProps as SectionDesignProps | undefined
    const assetType = designProps?.assetType

    // Dynamic imageRole — if user swapped asset type on a video layout, treat as inline
    let imageRole = staticImageRole
    if (supportsVideo && assetType === 'image') imageRole = 'inline'

    const isBackground = imageRole === 'background'
    const isInline = imageRole === 'inline'

    const bgImage = designProps?.backgroundImage
    const inlineImage = designProps?.inlineImage
    const currentImageUrl = isBackground ? bgImage?.url : inlineImage?.url

    // ---- Upload handler (Appwrite Storage with compressed fallback) ----
    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploadError(null)
        setIsUploading(true)

        try {
            // Try Appwrite Storage first
            const uploaded = await storage.createFile(
                BUCKETS.PROJECT_ASSETS,
                ID.unique(),
                file,
            )
            // Build the file preview URL
            const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
            const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || ''
            const fileUrl = `${endpoint}/storage/buckets/${BUCKETS.PROJECT_ASSETS}/files/${uploaded.$id}/view?project=${projectId}`

            if (isBackground) {
                setSectionBackgroundImage(pageId, sectionId, fileUrl)
            } else {
                setSectionInlineImage(pageId, sectionId, fileUrl)
            }
        } catch {
            // Fallback: compress image to a small data URL that fits within Appwrite document limits
            try {
                const compressedUrl = await compressImage(file, 800, 0.7)
                if (isBackground) {
                    setSectionBackgroundImage(pageId, sectionId, compressedUrl)
                } else {
                    setSectionInlineImage(pageId, sectionId, compressedUrl)
                }
                setUploadError('⚠️ Storage bucket not configured. Using compressed preview — set up the project_assets bucket for full quality.')
            } catch {
                setUploadError('Failed to process image. Try a smaller file.')
            }
        } finally {
            setIsUploading(false)
        }

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = ''
    }, [pageId, sectionId, isBackground, setSectionBackgroundImage, setSectionInlineImage])

    // Default design props (used when no image has been uploaded yet so controls still work)
    const defaultBgImage: SectionDesignProps['backgroundImage'] = {
        url: '', position: 'center', overlay: true,
    }
    const defaultInlineImage: NonNullable<SectionDesignProps['inlineImage']> = {
        url: '', position: 'center', ratio: 'auto', fillMode: 'cover',
        shape: 'rounded', overlay: false, foreground: 'none',
    }

    // Effective values — merge stored props over defaults
    const effectiveBg = { ...defaultBgImage, ...bgImage }
    const effectiveInline = { ...defaultInlineImage, ...inlineImage }

    // ---- Control change handlers ----
    const handlePositionChange = useCallback((position: ImagePosition) => {
        if (isBackground) {
            updateSectionDesignProps(pageId, sectionId, {
                backgroundImage: { ...effectiveBg, position },
            })
        } else {
            updateSectionDesignProps(pageId, sectionId, {
                inlineImage: { ...effectiveInline, position },
            })
        }
    }, [pageId, sectionId, isBackground, effectiveBg, effectiveInline, updateSectionDesignProps])

    const handleOverlayToggle = useCallback((enabled: boolean) => {
        if (isBackground) {
            updateSectionDesignProps(pageId, sectionId, {
                backgroundImage: { ...effectiveBg, overlay: enabled },
            })
        } else {
            updateSectionDesignProps(pageId, sectionId, {
                inlineImage: { ...effectiveInline, overlay: enabled },
            })
        }
    }, [pageId, sectionId, isBackground, effectiveBg, effectiveInline, updateSectionDesignProps])

    const handleClearImage = useCallback(() => {
        clearSectionImage(pageId, sectionId, isBackground ? 'background' : 'inline')
    }, [pageId, sectionId, isBackground, clearSectionImage])

    // Inline-only controls
    const handleRatioChange = useCallback((ratio: 'auto' | '16:9' | '3:2' | '4:3' | '1:1' | '3:4') => {
        updateSectionDesignProps(pageId, sectionId, {
            inlineImage: { ...effectiveInline, ratio },
        })
    }, [pageId, sectionId, effectiveInline, updateSectionDesignProps])

    const handleFillChange = useCallback((fillMode: 'cover' | 'contain') => {
        updateSectionDesignProps(pageId, sectionId, {
            inlineImage: { ...effectiveInline, fillMode },
        })
    }, [pageId, sectionId, effectiveInline, updateSectionDesignProps])

    const handleShapeChange = useCallback((shape: 'rectangle' | 'rounded') => {
        updateSectionDesignProps(pageId, sectionId, {
            inlineImage: { ...effectiveInline, shape },
        })
    }, [pageId, sectionId, effectiveInline, updateSectionDesignProps])

    const handleForegroundChange = useCallback((foreground: 'color' | 'none') => {
        updateSectionDesignProps(pageId, sectionId, {
            inlineImage: { ...effectiveInline, foreground },
        })
    }, [pageId, sectionId, effectiveInline, updateSectionDesignProps])

    if (imageRole === 'none') return null

    const currentPosition: ImagePosition = isBackground
        ? effectiveBg.position ?? 'center'
        : effectiveInline.position ?? 'center'
    const currentOverlay = isBackground ? (effectiveBg.overlay ?? true) : (effectiveInline.overlay ?? false)

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
                    <h2 className="text-sm font-semibold text-foreground">Image</h2>
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
                    {/* Image Preview + Upload */}
                    <div className="space-y-2">
                        {currentImageUrl ? (
                            <div className="relative group">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={currentImageUrl}
                                    alt="Section image"
                                    className="w-full h-32 object-cover rounded-lg border"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
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
                                        onClick={handleClearImage}
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
                                        <ImageIcon className="h-8 w-8 opacity-40" />
                                        <span className="text-xs font-medium">Click to upload image</span>
                                    </>
                                )}
                            </button>
                        )}
                        {uploadError && (
                            <p className="text-[10px] text-amber-600 leading-tight">{uploadError}</p>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                    <Separator />

                    {/* Position */}
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-muted-foreground">Position</Label>
                        <PositionGrid
                            value={currentPosition}
                            onChange={handlePositionChange}
                        />
                    </div>

                    {/* Overlay */}
                    <ToggleGroup
                        label="Overlay"
                        value={currentOverlay ? 'yes' : 'no'}
                        options={[
                            { value: 'yes', label: 'Yes' },
                            { value: 'no', label: 'No' },
                        ]}
                        onChange={(v) => handleOverlayToggle(v === 'yes')}
                    />

                    {/* Inline-only controls */}
                    {isInline && (
                        <>
                            <Separator />

                            {/* Ratio */}
                            <ToggleGroup
                                label="Ratio"
                                value={effectiveInline.ratio ?? 'auto'}
                                options={[
                                    { value: 'auto', label: 'Auto' },
                                    { value: '16:9', label: '16:9' },
                                    { value: '3:2', label: '3:2' },
                                    { value: '4:3', label: '4:3' },
                                    { value: '1:1', label: '1:1' },
                                    { value: '3:4', label: '3:4' },
                                ]}
                                onChange={handleRatioChange}
                            />

                            {/* Fill Mode */}
                            <ToggleGroup
                                label="Fill Mode"
                                value={effectiveInline.fillMode ?? 'cover'}
                                options={[
                                    { value: 'cover', label: 'Cover' },
                                    { value: 'contain', label: 'Contain' },
                                ]}
                                onChange={handleFillChange}
                            />

                            {/* Shape */}
                            <ToggleGroup
                                label="Shape"
                                value={effectiveInline.shape ?? 'rounded'}
                                options={[
                                    { value: 'rectangle', label: 'Rectangle' },
                                    { value: 'rounded', label: 'Rounded' },
                                ]}
                                onChange={handleShapeChange}
                            />

                            {/* Foreground */}
                            <ToggleGroup
                                label="Foreground"
                                value={effectiveInline.foreground ?? 'none'}
                                options={[
                                    { value: 'color', label: 'Color' },
                                    { value: 'none', label: 'None' },
                                ]}
                                onChange={handleForegroundChange}
                            />
                        </>
                    )}
                </div>
            </ScrollArea>
        </div>
    )
}
