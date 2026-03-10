'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FilesTab } from './files-tab'
import { ChatTab } from './chat-tab'

const TABS = ['Files', 'Chat'] as const
type Tab = (typeof TABS)[number]

export function LeftPanel() {
    const [activeTab, setActiveTab] = useState<Tab>('Files')

    return (
        <div className="flex flex-col w-72 bg-card border-r border-border/60 shrink-0 select-none">
            {/* ── Tab bar ── */}
            <div className="flex h-10 border-b border-border/40 shrink-0">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                            'flex-1 text-xs font-medium transition-colors relative',
                            activeTab === tab
                                ? 'text-foreground'
                                : 'text-muted-foreground hover:text-foreground/80'
                        )}
                    >
                        {tab}
                        {/* Active underline */}
                        {activeTab === tab && (
                            <span className="absolute bottom-0 inset-x-3 h-[2px] bg-foreground rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'Files' ? <FilesTab /> : <ChatTab />}
            </div>
        </div>
    )
}
