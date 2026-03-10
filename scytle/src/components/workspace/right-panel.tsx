'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DesignTab } from './design-tab'
import { ThemeTab } from './theme-tab'

const TABS = ['Design', 'Theme'] as const
type Tab = (typeof TABS)[number]

export function RightPanel() {
    const [activeTab, setActiveTab] = useState<Tab>('Design')

    return (
        <div className="flex flex-col w-64 bg-card border-l border-border/60 shrink-0 select-none">
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
                        {activeTab === tab && (
                            <span className="absolute bottom-0 inset-x-3 h-[2px] bg-foreground rounded-full" />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'Design' ? <DesignTab /> : <ThemeTab />}
            </div>
        </div>
    )
}
