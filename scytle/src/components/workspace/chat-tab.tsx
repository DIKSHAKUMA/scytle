'use client'

import { Bot, Send } from 'lucide-react'

export function ChatTab() {
    return (
        <div className="flex flex-col h-full">
            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
                <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-accent/15 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        AI chat will be available once the sitemap and wireframe
                        are generated. You&apos;ll be able to ask for layout
                        tweaks, content changes, and more.
                    </p>
                </div>
            </div>

            {/* ── Input ── */}
            <div className="p-3 border-t border-border/40 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/40">
                    <input
                        disabled
                        placeholder="Ask AI anything…"
                        className="flex-1 bg-transparent text-xs placeholder:text-muted-foreground/50 outline-none disabled:cursor-not-allowed"
                    />
                    <button
                        disabled
                        className="w-6 h-6 rounded-md flex items-center justify-center text-muted-foreground/30"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
