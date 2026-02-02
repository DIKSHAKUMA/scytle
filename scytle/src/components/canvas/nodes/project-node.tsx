'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Users, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProjectNodeData {
    label: string
    icon?: string
}

export const ProjectNode = memo(function ProjectNode({
    data,
    selected
}: NodeProps & { data: ProjectNodeData }) {
    return (
        <div
            className={cn(
                'group bg-primary/10 border-2 rounded-lg shadow-md cursor-pointer',
                'min-w-[200px] transition-all duration-200',
                selected
                    ? 'border-primary bg-primary/20 shadow-lg'
                    : 'border-primary/30 hover:border-primary/50 hover:bg-primary/15'
            )}
        >
            {/* Content - Relume style */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{data.label}</span>
                </div>
                <button
                    className={cn(
                        'p-1 rounded hover:bg-primary/20 transition-colors',
                        'opacity-0 group-hover:opacity-100',
                        selected && 'opacity-100'
                    )}
                >
                    <MoreHorizontal className="w-4 h-4 text-primary" />
                </button>
            </div>

            {/* Bottom handle only - root node receives no connections */}
            <Handle
                type="source"
                position={Position.Bottom}
                className="!w-3 !h-3 !bg-primary !border-2 !border-background !-bottom-1.5"
            />
        </div>
    )
})
