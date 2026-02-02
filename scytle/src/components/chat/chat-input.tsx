'use client'

import { useState, useRef, useEffect, KeyboardEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useChatStore } from '@/store/chat-store'
import { Send, Loader2, StopCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatInputProps {
    projectId: string
}

const MAX_CHARS = 2000
const MAX_ROWS = 5

export function ChatInput({ projectId }: ChatInputProps) {
    const [input, setInput] = useState('')
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const { sendMessage, isTyping, isStreaming, stopGeneration } = useChatStore()

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = 'auto'
            const lineHeight = 24 // approximate line height
            const maxHeight = lineHeight * MAX_ROWS
            textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`
        }
    }, [input])

    const handleSubmit = async () => {
        const trimmedInput = input.trim()
        if (!trimmedInput || isTyping || isStreaming) return

        setInput('')
        await sendMessage(trimmedInput, projectId)

        // Focus back on input
        textareaRef.current?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleStop = () => {
        stopGeneration()
    }

    const isDisabled = isTyping || isStreaming
    const charCount = input.length
    const isOverLimit = charCount > MAX_CHARS

    return (
        <div className="relative">
            <div className="relative flex items-end gap-2">
                <div className="flex-1 relative">
                    <Textarea
                        ref={textareaRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your product idea..."
                        className={cn(
                            'min-h-[48px] max-h-[120px] resize-none pr-12',
                            'rounded-xl border-muted-foreground/20',
                            'focus-visible:ring-1 focus-visible:ring-primary/50',
                            isOverLimit && 'border-destructive focus-visible:ring-destructive'
                        )}
                        disabled={isDisabled}
                        rows={1}
                    />

                    {/* Character count */}
                    {charCount > MAX_CHARS * 0.8 && (
                        <div
                            className={cn(
                                'absolute right-3 bottom-2 text-xs',
                                isOverLimit ? 'text-destructive' : 'text-muted-foreground'
                            )}
                        >
                            {charCount}/{MAX_CHARS}
                        </div>
                    )}
                </div>

                {/* Send or Stop button */}
                {isStreaming ? (
                    <Button
                        size="icon"
                        variant="destructive"
                        onClick={handleStop}
                        className="rounded-xl h-12 w-12"
                    >
                        <StopCircle className="w-5 h-5" />
                    </Button>
                ) : (
                    <Button
                        size="icon"
                        onClick={handleSubmit}
                        disabled={!input.trim() || isOverLimit || isDisabled}
                        className="rounded-xl h-12 w-12"
                    >
                        {isTyping ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                    </Button>
                )}
            </div>

            {/* Keyboard hint */}
            <p className="text-xs text-muted-foreground mt-2 text-center">
                Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to send,
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono ml-1">Shift + Enter</kbd> for new line
            </p>
        </div>
    )
}
