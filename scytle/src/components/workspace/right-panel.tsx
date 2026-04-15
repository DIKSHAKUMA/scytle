'use client'

import { DesignTab } from './design-tab'

export function RightPanel() {
    return (
        <div className="flex flex-col w-64 bg-card border-l border-border/60 shrink-0 select-none">
            {/* ── Tab bar ── */}
            <div className="flex h-10 border-b border-border/40 shrink-0 items-center px-3">
                <span className="text-xs font-medium text-foreground">Design</span>
            </div>

            {/* ── Tab content ── */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <DesignTab />
            </div>
        </div>
    )
}
