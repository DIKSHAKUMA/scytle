'use client'

import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Bot, User, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface ChatMessageProps {
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp?: Date | string
    isStreaming?: boolean
}

export function ChatMessage({ role, content, timestamp, isStreaming }: ChatMessageProps) {
    const [copied, setCopied] = useState(false)
    const isUser = role === 'user'

    // Don't render system messages
    if (role === 'system') return null

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div
            className={cn(
                'flex gap-3 group',
                isUser ? 'flex-row-reverse' : 'flex-row'
            )}
        >
            {/* Avatar */}
            <div
                className={cn(
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted border'
                )}
            >
                {isUser ? (
                    <User className="w-4 h-4" />
                ) : (
                    <Bot className="w-4 h-4" />
                )}
            </div>

            {/* Message bubble */}
            <div
                className={cn(
                    'flex flex-col max-w-[80%]',
                    isUser ? 'items-end' : 'items-start'
                )}
            >
                <div
                    className={cn(
                        'px-4 py-3 rounded-2xl text-sm leading-relaxed',
                        isUser
                            ? 'bg-primary text-primary-foreground rounded-tr-md'
                            : 'bg-muted rounded-tl-md'
                    )}
                >
                    {/* Render content with basic markdown-like formatting */}
                    <MessageContent content={content} />

                    {/* Streaming cursor */}
                    {isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
                    )}
                </div>

                {/* Timestamp and actions */}
                <div className={cn(
                    'flex items-center gap-2 mt-1 px-1',
                    'opacity-0 group-hover:opacity-100 transition-opacity'
                )}>
                    {timestamp && (
                        <span className="text-xs text-muted-foreground">
                            {format(typeof timestamp === 'string' ? new Date(timestamp) : timestamp, 'HH:mm')}
                        </span>
                    )}

                    {!isUser && content && (
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={handleCopy}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            {copied ? (
                                <Check className="w-3 h-3" />
                            ) : (
                                <Copy className="w-3 h-3" />
                            )}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

// Simple markdown-like content renderer
function MessageContent({ content }: { content: string }) {
    // Split by code blocks
    const parts = content.split(/(```[\s\S]*?```)/g)

    return (
        <>
            {parts.map((part, index) => {
                if (part.startsWith('```') && part.endsWith('```')) {
                    // Code block
                    const code = part.slice(3, -3)
                    const [lang, ...lines] = code.split('\n')
                    const codeContent = lines.join('\n').trim()

                    return (
                        <pre
                            key={index}
                            className="my-2 p-3 bg-background/50 rounded-lg overflow-x-auto text-xs font-mono"
                        >
                            {lang && (
                                <div className="text-muted-foreground text-[10px] uppercase mb-2">
                                    {lang}
                                </div>
                            )}
                            <code>{codeContent || lang}</code>
                        </pre>
                    )
                }

                // Regular text with basic formatting
                return (
                    <span key={index}>
                        {part.split('\n').map((line, lineIndex) => (
                            <span key={lineIndex}>
                                {lineIndex > 0 && <br />}
                                {formatInlineText(line)}
                            </span>
                        ))}
                    </span>
                )
            })}
        </>
    )
}

// Format inline text (bold, italic, inline code)
function formatInlineText(text: string) {
    // Simple formatting - could be expanded
    return text
        .split(/(`[^`]+`)/g)
        .map((part, index) => {
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code
                        key={index}
                        className="px-1.5 py-0.5 bg-background/50 rounded text-xs font-mono"
                    >
                        {part.slice(1, -1)}
                    </code>
                )
            }
            return part
        })
}
