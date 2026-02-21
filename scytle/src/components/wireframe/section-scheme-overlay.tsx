'use client'

import { Sun, Moon, Palette } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStyleGuideStore } from '@/store/style-guide-store'
import type { ColorScheme } from '@/lib/designs/v2/tokens'

interface SectionSchemeOverlayProps {
    sectionId: string
    visible: boolean
}

const SCHEME_OPTIONS: { scheme: ColorScheme | null; label: string; icon: typeof Sun }[] = [
    { scheme: null, label: 'Inherit', icon: Palette },
    { scheme: 'light', label: 'Light', icon: Sun },
    { scheme: 'dark', label: 'Dark', icon: Moon },
    { scheme: 'accent', label: 'Accent', icon: Palette },
]

/**
 * SectionSchemeOverlay — Shows color scheme chips on hover at the
 * top edge of a section. Users can override Light/Dark/Accent per section.
 */
export function SectionSchemeOverlay({ sectionId, visible }: SectionSchemeOverlayProps) {
    const currentScheme = useStyleGuideStore(s => s.data.sectionSchemeOverrides[sectionId] ?? null) as ColorScheme | null
    const setSectionScheme = useStyleGuideStore(s => s.setSectionScheme)

    if (!visible) return null

    return (
        <div
            className={cn(
                'absolute top-1 right-8 z-20',
                'flex items-center gap-0.5 px-1 py-0.5',
                'bg-white/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200/80',
                'transition-opacity duration-150',
            )}
            onClick={(e) => e.stopPropagation()}
        >
            {SCHEME_OPTIONS.map(({ scheme, label, icon: Icon }) => {
                const isActive = currentScheme === scheme
                return (
                    <button
                        key={label}
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation()
                            setSectionScheme(sectionId, scheme)
                        }}
                        title={label}
                        className={cn(
                            'flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium',
                            'transition-all cursor-pointer',
                            isActive
                                ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-300'
                                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
                        )}
                    >
                        <Icon className="h-2.5 w-2.5" />
                        {label}
                    </button>
                )
            })}
        </div>
    )
}
