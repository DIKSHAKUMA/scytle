'use client'

import { useChatStore } from '@/store/chat-store'
import { Button } from '@/components/ui/button'
import { Map, Palette, Code, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuickActionsProps {
    projectId: string
}

const QUICK_ACTIONS = [
    {
        id: 'sitemap',
        label: 'Generate Sitemap',
        icon: Map,
        message: 'Generate a sitemap structure for this project',
        action: 'sitemap',
    },
    {
        id: 'design',
        label: 'Create Design',
        icon: Palette,
        message: 'Create a style guide and design system for this project',
        action: 'chat',
    },
    {
        id: 'code',
        label: 'Export Code',
        icon: Code,
        message: 'Generate the code for the current design',
        action: 'chat',
    },
    {
        id: 'ideas',
        label: 'Suggest Ideas',
        icon: Lightbulb,
        message: 'Suggest improvements and new features for this product',
        action: 'chat',
    },
]

export function QuickActions({ projectId }: QuickActionsProps) {
    const { sendMessage, isTyping, isStreaming, messages } = useChatStore()

    // Don't show quick actions while AI is responding
    if (isTyping || isStreaming) return null

    // Show different actions based on conversation state
    const hasMessages = messages.length > 0

    const handleAction = async (action: typeof QUICK_ACTIONS[0]) => {
        await sendMessage(action.message, projectId)
    }

    return (
        <div className="px-4 py-2 border-t bg-muted/20">
            <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.slice(0, hasMessages ? 4 : 2).map((action) => (
                    <Button
                        key={action.id}
                        variant="outline"
                        size="sm"
                        onClick={() => handleAction(action)}
                        className={cn(
                            'rounded-full text-xs gap-1.5',
                            'bg-background hover:bg-primary hover:text-primary-foreground',
                            'transition-colors'
                        )}
                    >
                        <action.icon className="w-3 h-3" />
                        {action.label}
                    </Button>
                ))}
            </div>
        </div>
    )
}
