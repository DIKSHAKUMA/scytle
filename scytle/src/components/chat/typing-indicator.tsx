'use client'

import { Bot } from 'lucide-react'

export function TypingIndicator() {
    return (
        <div className="flex gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-muted border">
                <Bot className="w-4 h-4" />
            </div>

            {/* Typing bubble */}
            <div className="flex flex-col items-start">
                <div className="px-4 py-3 rounded-2xl rounded-tl-md bg-muted">
                    <div className="flex items-center gap-1">
                        {/* Animated dots */}
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" />
                    </div>
                </div>
                <span className="text-xs text-muted-foreground mt-1 px-1">
                    Scytle is thinking...
                </span>
            </div>
        </div>
    )
}
