'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import {
    Wand2,
    ArrowDownNarrowWide,
    ArrowUpNarrowWide,
    RefreshCw,
    Sparkles,
    MessageSquare,
    Smile,
    Briefcase,
    Zap,
    Heart,
    ChevronRight,
    Loader2,
    Send,
    X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'

interface AITextMenuProps {
    currentText: string
    onResultAction: (newText: string) => void
    onLoadingAction: (loading: boolean) => void
    onCloseAction: () => void
    sectionId?: string
    fieldKey?: string
}

type AIAction = 'rewrite' | 'shorten' | 'expand' | 'improve' | 'custom'
type ToneOption = 'casual' | 'professional' | 'friendly' | 'bold' | 'empathetic'

interface QuickAction {
    id: AIAction
    label: string
    icon: React.ComponentType<{ className?: string }>
    description: string
}

interface ToneItem {
    id: ToneOption
    label: string
    icon: React.ComponentType<{ className?: string }>
}

const QUICK_ACTIONS: QuickAction[] = [
    { id: 'rewrite', label: 'Rewrite', icon: RefreshCw, description: 'Rephrase with same meaning' },
    { id: 'shorten', label: 'Shorten', icon: ArrowDownNarrowWide, description: 'Make it more concise' },
    { id: 'expand', label: 'Expand', icon: ArrowUpNarrowWide, description: 'Add more detail' },
    { id: 'improve', label: 'Improve', icon: Sparkles, description: 'Enhance quality & clarity' },
]

const TONE_OPTIONS: ToneItem[] = [
    { id: 'casual', label: 'Casual', icon: Smile },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'friendly', label: 'Friendly', icon: Heart },
    { id: 'bold', label: 'Bold', icon: Zap },
    { id: 'empathetic', label: 'Empathetic', icon: MessageSquare },
]

/**
 * AITextMenu Component
 * 
 * Design inspiration:
 * - Notion AI: Clean dropdown with quick actions
 * - v0.dev: Prompt input with suggestions
 * - Linear: Minimal, keyboard-friendly menu
 * 
 * Features:
 * - Quick actions (Rewrite, Shorten, Expand, Improve)
 * - Tone selector submenu
 * - Custom prompt input
 */
export function AITextMenu({
    currentText,
    onResultAction,
    onLoadingAction,
    onCloseAction,
    sectionId,
    fieldKey,
}: AITextMenuProps) {
    const [customPrompt, setCustomPrompt] = useState('')
    const [showToneMenu, setShowToneMenu] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedAction, setSelectedAction] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Focus input on mount
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [])

    // Handle quick action
    const handleQuickAction = useCallback(async (action: AIAction) => {
        if (isLoading) return

        setIsLoading(true)
        setSelectedAction(action)
        onLoadingAction(true)

        try {
            const response = await fetch('/api/ai/rewrite-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: currentText,
                    action,
                    sectionId,
                    fieldKey,
                }),
            })

            if (!response.ok) throw new Error('Failed to rewrite text')

            const data = await response.json()
            onResultAction(data.text)
        } catch (error) {
            console.error('❌ AI rewrite failed:', error)
        } finally {
            setIsLoading(false)
            setSelectedAction(null)
            onLoadingAction(false)
        }
    }, [currentText, sectionId, fieldKey, onResultAction, onLoadingAction, isLoading])

    // Handle tone selection
    const handleToneSelect = useCallback(async (tone: ToneOption) => {
        if (isLoading) return

        setIsLoading(true)
        setSelectedAction(tone)
        setShowToneMenu(false)
        onLoadingAction(true)

        try {
            const response = await fetch('/api/ai/rewrite-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: currentText,
                    action: 'tone',
                    tone,
                    sectionId,
                    fieldKey,
                }),
            })

            if (!response.ok) throw new Error('Failed to change tone')

            const data = await response.json()
            onResultAction(data.text)
        } catch (error) {
            console.error('❌ AI tone change failed:', error)
        } finally {
            setIsLoading(false)
            setSelectedAction(null)
            onLoadingAction(false)
        }
    }, [currentText, sectionId, fieldKey, onResultAction, onLoadingAction, isLoading])

    // Handle custom prompt
    const handleCustomPrompt = useCallback(async () => {
        if (!customPrompt.trim() || isLoading) return

        setIsLoading(true)
        setSelectedAction('custom')
        onLoadingAction(true)

        try {
            const response = await fetch('/api/ai/rewrite-text', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: currentText,
                    action: 'custom',
                    customPrompt: customPrompt.trim(),
                    sectionId,
                    fieldKey,
                }),
            })

            if (!response.ok) throw new Error('Failed to apply custom prompt')

            const data = await response.json()
            onResultAction(data.text)
        } catch (error) {
            console.error('❌ AI custom prompt failed:', error)
        } finally {
            setIsLoading(false)
            setSelectedAction(null)
            onLoadingAction(false)
        }
    }, [customPrompt, currentText, sectionId, fieldKey, onResultAction, onLoadingAction, isLoading])

    // Handle key events
    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleCustomPrompt()
        }
        if (e.key === 'Escape') {
            onCloseAction()
        }
    }, [handleCustomPrompt, onCloseAction])

    return (
        <div
            ref={menuRef}
            className={cn(
                'absolute right-0 top-full mt-1 z-50',
                'w-64 bg-white rounded-lg shadow-lg border border-gray-200',
                'animate-in fade-in-0 zoom-in-95 duration-150'
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Wand2 className="h-4 w-4 text-primary" />
                    Ask AI
                </div>
                <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-6 w-6"
                    onClick={onCloseAction}
                >
                    <X className="h-3.5 w-3.5" />
                </Button>
            </div>

            {/* Custom Prompt Input */}
            <div className="p-2 border-b">
                <div className="relative">
                    <Input
                        ref={inputRef}
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Tell AI what to do..."
                        className="pr-8 h-8 text-sm"
                        disabled={isLoading}
                    />
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                        onClick={handleCustomPrompt}
                        disabled={!customPrompt.trim() || isLoading}
                    >
                        {isLoading && selectedAction === 'custom' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                            <Send className="h-3.5 w-3.5" />
                        )}
                    </Button>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="p-1">
                {QUICK_ACTIONS.map((action) => (
                    <button
                        key={action.id}
                        onClick={() => handleQuickAction(action.id)}
                        disabled={isLoading}
                        className={cn(
                            'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm',
                            'hover:bg-muted transition-colors text-left',
                            isLoading && selectedAction === action.id && 'bg-muted',
                            isLoading && selectedAction !== action.id && 'opacity-50'
                        )}
                    >
                        {isLoading && selectedAction === action.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        ) : (
                            <action.icon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{action.label}</span>
                    </button>
                ))}
            </div>

            <Separator />

            {/* Tone Selector */}
            <div className="p-1 relative">
                <button
                    onClick={() => setShowToneMenu(!showToneMenu)}
                    disabled={isLoading}
                    className={cn(
                        'w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-sm',
                        'hover:bg-muted transition-colors text-left',
                        showToneMenu && 'bg-muted',
                        isLoading && 'opacity-50'
                    )}
                >
                    <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        <span>Change tone</span>
                    </div>
                    <ChevronRight className={cn(
                        'h-4 w-4 text-muted-foreground transition-transform',
                        showToneMenu && 'rotate-90'
                    )} />
                </button>

                {/* Tone Submenu */}
                {showToneMenu && (
                    <div className={cn(
                        'absolute left-full top-0 ml-1',
                        'w-40 bg-white rounded-lg shadow-lg border border-gray-200',
                        'animate-in fade-in-0 slide-in-from-left-2 duration-150'
                    )}>
                        <div className="p-1">
                            {TONE_OPTIONS.map((tone) => (
                                <button
                                    key={tone.id}
                                    onClick={() => handleToneSelect(tone.id)}
                                    disabled={isLoading}
                                    className={cn(
                                        'w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm',
                                        'hover:bg-muted transition-colors text-left',
                                        isLoading && selectedAction === tone.id && 'bg-muted'
                                    )}
                                >
                                    {isLoading && selectedAction === tone.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                    ) : (
                                        <tone.icon className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <span>{tone.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
