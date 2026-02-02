'use client'

import { useRef, useEffect } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useChatStore } from '@/store/chat-store'
import { ChatMessage } from './message'
import { ChatInput } from './chat-input'
import { TypingIndicator } from './typing-indicator'
import { QuickActions } from './quick-actions'
import { MessageSquare, Sparkles } from 'lucide-react'

interface ChatSidebarProps {
    projectId: string
    projectName?: string
}

export function ChatSidebar({ projectId, projectName }: ChatSidebarProps) {
    const { messages, isTyping, isStreaming } = useChatStore()
    const scrollRef = useRef<HTMLDivElement>(null)

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const hasMessages = messages.length > 0

    return (
        <div className="flex flex-col h-full bg-background border-r overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                    <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-sm truncate">
                        {projectName || 'New Project'}
                    </h2>
                    <p className="text-xs text-muted-foreground">AI Assistant</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-4" ref={scrollRef}>
                    <div className="py-4 space-y-4">
                        {!hasMessages ? (
                            // Empty state
                            <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                    <MessageSquare className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="font-semibold text-lg mb-2">
                                    Hi! I&apos;m Scytle
                                </h3>
                                <p className="text-muted-foreground text-sm max-w-[200px]">
                                    Tell me about your product idea and I&apos;ll help you bring it to life.
                                </p>
                            </div>
                        ) : (
                            // Messages list
                            messages.map((message, index) => (
                                <ChatMessage
                                    key={index}
                                    role={message.role}
                                    content={message.content}
                                    timestamp={message.timestamp}
                                    isStreaming={isStreaming && index === messages.length - 1 && message.role === 'assistant'}
                                />
                            ))
                        )}

                        {/* Typing indicator */}
                        {isTyping && <TypingIndicator />}
                    </div>
                </ScrollArea>
            </div>

            {/* Quick Actions */}
            <QuickActions projectId={projectId} />

            {/* Input Area */}
            <div className="border-t bg-background p-4">
                <ChatInput projectId={projectId} />
            </div>
        </div>
    )
}
